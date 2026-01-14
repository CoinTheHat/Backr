'use client';

import { use, useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { SUBSCRIPTION_ABI } from '@/utils/abis';
import { Address } from 'viem';
import { useToast } from '../components/Toast';
import confetti from 'canvas-confetti';
import { formatPrice, formatPlural } from '@/utils/format';
import CheckoutModal from '../components/CheckoutModal';

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    const { creator } = use(params);
    const creatorId = creator;

    const { isConnected, address } = useAccount();
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();

    // Tab State
    const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'membership'>('posts');

    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [creatorTiers, setCreatorTiers] = useState<any[]>([]);
    const [creatorProfile, setCreatorProfile] = useState<any>(null);
    const [creatorContractAddress, setCreatorContractAddress] = useState<string>('');
    const [realMemberCount, setRealMemberCount] = useState(0);
    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

    // Fetch Data
    useEffect(() => {
        if (!creatorId) return;

        // Profile & Contract
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const found = creators.find((c: any) => c.address === creatorId);
                if (found) {
                    setCreatorProfile(found);
                    setCreatorContractAddress(found.contractAddress || '');
                }
            });

        // Tiers
        fetch(`/api/tiers?address=${creatorId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCreatorTiers(data);
            });

        // Posts
        fetch(`/api/posts?address=${creatorId}`)
            .then(res => res.json())
            .then(data => setPosts(data));

        // Stats (Real Member Count)
        fetch(`/api/stats?address=${creatorId}`)
            .then(res => res.json())
            .then(data => setRealMemberCount(data.activeMembers || 0));
    }, [creatorId]);

    // Membership Check
    const { data: memberData } = useReadContract({
        address: creatorContractAddress as Address,
        abi: SUBSCRIPTION_ABI,
        functionName: 'memberships',
        args: [address],
        query: { enabled: !!creatorContractAddress && !!address }
    });

    // Fix Type Error: Force boolean cast
    const isSubscribed = memberData ? Number((memberData as any)[0]) > Math.floor(Date.now() / 1000) : false;
    const memberTierId = memberData ? Number((memberData as any)[1]) : -1;

    // Checkout State
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    // Subscription Transaction
    const { data: hash, writeContract, error: writeError } = useWriteContract();
    const { isSuccess: isSubscribedOnChain, isLoading: isTxLoading } = useWaitForTransactionReceipt({ hash });

    // Self-healing: Check if contract says subscribed but we might have missed the sync
    useEffect(() => {
        if (isSubscribed && address && creatorId) {
            // Check if we already have it in local state knowledge (optimization)
            // But safely, let's just trigger a sync just in case. 
            // The API is an upsert, so it's safe.
            const expiry = Number((memberData as any)[0]); // Contract returns timestamp
            const tierId = Number((memberData as any)[1]);

            // Only sync if valid expiry
            if (expiry > Math.floor(Date.now() / 1000)) {
                fetch('/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscriberAddress: address,
                        creatorAddress: creatorId,
                        tierId: tierId,
                        expiry: expiry,
                        txHash: 'SYNC_RECOVERY'
                    })
                }).then(() => {
                    // Update local member count if needed? 
                    // We'll leave that to the stats fetch.
                }).catch(err => console.error('Auto-sync failed:', err));
            }
        }
    }, [isSubscribed, address, creatorId, memberData]);

    useEffect(() => {
        if (isTxLoading) {
            setCheckoutStatus('pending');
        } else if (isSubscribedOnChain) {
            setCheckoutStatus('success');
            setLoading(false);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

            // Sync to Database
            if (selectedTierIndex !== null) {
                const duration = 30 * 24 * 60 * 60; // 30 Days default
                const expiry = Math.floor(Date.now() / 1000) + duration;

                fetch('/api/subscriptions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscriberAddress: address,
                        creatorAddress: creatorId,
                        tierId: selectedTierIndex,
                        expiry: expiry,
                        txHash: hash
                    })
                }).catch(err => console.error('Failed to sync subscription:', err));
            }

        } else if (writeError) {
            setCheckoutStatus('error');
            setLoading(false);
        }
    }, [isSubscribedOnChain, isTxLoading, writeError]);

    const handleSubscribeClick = (tierId: number) => {
        // Removed auth check to let Modal handle it
        if (!creatorContractAddress) return showToast('Creator contract not found.', 'error');

        setSelectedTierIndex(tierId);
        setCheckoutStatus('idle');
        setCheckoutModalOpen(true);
    };

    const handleConfirmSubscribe = () => {
        if (selectedTierIndex === null) return;
        const tier = creatorTiers[selectedTierIndex];
        if (!tier) return;

        setCheckoutStatus('pending');
        try {
            writeContract({
                address: creatorContractAddress as `0x${string}`,
                abi: SUBSCRIPTION_ABI,
                functionName: 'subscribe',
                args: [BigInt(selectedTierIndex)],
                value: BigInt(parseFloat(tier.price) * 1e18)
            });
        } catch (e) {
            console.error(e);
            setCheckoutStatus('error');
        }
    };

    const canViewPost = (post: any) => {
        if (post.isPublic) return true;
        if (address?.toLowerCase() === creatorId.toLowerCase()) return true;
        if (!isSubscribed) return false;

        const minTier = post.minTier || 0;
        if (minTier === 0) return true;
        return memberTierId >= (minTier - 1);
    };

    const toggleExpand = (index: number) => {
        setExpandedPosts(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Derived Display Data
    const displayName = creatorProfile?.name || `Creator ${creatorId.substring(0, 4)}...`;
    const avatar = creatorProfile?.avatarUrl;
    const cover = creatorProfile?.coverUrl;
    const memberCount = realMemberCount;

    // Loading Skeleton
    if (!creatorProfile && loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
                {/* Hero Skeleton */}
                <div style={{ height: '180px', width: '100%', background: 'linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%)' }}></div>
                <div className="page-container" style={{ position: 'relative', marginTop: '-60px', display: 'flex', alignItems: 'flex-end', gap: '24px', paddingBottom: '32px' }}>
                    <div className="skeleton skeleton-avatar" style={{ width: '120px', height: '120px', border: '4px solid var(--color-bg-surface)' }} />
                    <div style={{ paddingBottom: '16px', flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ width: '200px', height: '32px', marginBottom: '8px' }} />
                        <div className="skeleton skeleton-text" style={{ width: '150px' }} />
                    </div>
                </div>

                <div className="page-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '40px', paddingTop: '40px' }}>
                    <div>
                        <div className="skeleton skeleton-rect" style={{ width: '100%', height: '200px', marginBottom: '24px' }} />
                        <div className="skeleton skeleton-rect" style={{ width: '100%', height: '200px' }} />
                    </div>
                    <div>
                        <div className="skeleton skeleton-card" style={{ height: '400px' }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB', color: '#111827', fontFamily: "'Inter', sans-serif" }}>
            {ToastComponent}

            {/* Nav */}
            <nav style={{ padding: '16px 0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Button variant="ghost" onClick={() => router.push('/')} style={{ color: '#6B7280', padding: '8px', borderRadius: '50%' }}>←</Button>
                        <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>{displayName}</div>
                    </div>
                    <WalletButton />
                </div>
            </nav>

            {/* Hero & Profile Header */}
            <div style={{ background: '#fff', paddingBottom: '32px', marginBottom: '40px', borderBottom: '1px solid #E5E7EB' }}>
                {/* Cover - Modern Gradient */}
                <div style={{
                    height: '240px', width: '100%',
                    background: cover ? `url(${cover}) center/cover` : 'linear-gradient(120deg, #FDFBFB 0%, #EBEDEE 100%)', // Clean Neutral or user custom
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {!cover && (
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', opacity: 0.1 }}></div>
                    )}
                </div>

                <div className="page-container" style={{ position: 'relative', marginTop: '-80px', display: 'flex', alignItems: 'flex-end', gap: '32px', flexWrap: 'wrap' }}>
                    {/* Avatar - Premium Border */}
                    <div style={{
                        width: '160px', height: '160px', borderRadius: '50%',
                        background: avatar ? `url(${avatar}) center/cover` : '#fff',
                        border: '6px solid #fff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        flexShrink: 0,
                        zIndex: 10
                    }}></div>

                    {/* Info */}
                    <div style={{ flex: 1, paddingBottom: '12px', zIndex: 10 }}>
                        <h1 className="text-h1" style={{ marginBottom: '8px', fontSize: '2.5rem', letterSpacing: '-0.02em', color: '#111827' }}>{displayName}</h1>
                        <div style={{ display: 'flex', gap: '24px', color: '#4B5563', fontSize: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>{posts.length}</strong> <span style={{ color: '#6B7280' }}>Posts</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>{creatorTiers.length}</strong> <span style={{ color: '#6B7280' }}>Tiers</span></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>{memberCount}</strong> <span style={{ color: '#6B7280' }}>Following</span></div>
                        </div>
                    </div>

                    {/* Socials / Actions */}
                    <div style={{ display: 'flex', gap: '12px', paddingBottom: '12px' }}>
                        {creatorProfile?.socials?.twitter && (
                            <Button variant="outline" size="sm" onClick={() => window.open(`https://x.com/${creatorProfile.socials.twitter}`, '_blank')} style={{ borderRadius: '20px' }}>
                                🐦 <span style={{ marginLeft: '4px' }}>Follow</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" style={{ borderRadius: '20px' }} onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('Link copied to clipboard!', 'success');
                        }}>↗ Share</Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="page-container responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '64px', paddingBottom: '100px' }}>

                {/* Left: Feed & Tabs */}
                <div>
                    {/* Modern Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', marginBottom: '40px', gap: '32px' }}>
                        {['posts', 'about', 'membership'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    padding: '16px 0',
                                    borderBottom: activeTab === tab ? '2px solid #111827' : '2px solid transparent',
                                    color: activeTab === tab ? '#111827' : '#6B7280',
                                    fontWeight: activeTab === tab ? 600 : 500,
                                    background: 'none',
                                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    fontSize: '1rem',
                                    transition: 'all 0.2s',
                                    position: 'relative',
                                    top: '1px'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'posts' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {posts.length === 0 ? (
                                <div style={{ padding: '80px 40px', textAlign: 'center', background: '#fff', borderRadius: '24px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '24px', opacity: 0.5 }}>✨</div>
                                    <h3 className="text-h3" style={{ marginBottom: '12px' }}>No posts published yet</h3>
                                    <p className="text-body-sm" style={{ color: '#6B7280', maxWidth: '400px', margin: '0 auto' }}>This creator is preparing exclusive content. Join the membership to be the first to know when they post.</p>
                                </div>
                            ) : (
                                posts.map((post, i) => {
                                    const locked = !canViewPost(post);
                                    const minTierName = creatorTiers[post.minTier || 0]?.name || 'Members Only';
                                    const isExpanded = expandedPosts[i];

                                    return (
                                        <div key={i} className="hover-lift" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                            <div style={{ padding: '32px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                                                    <span className="text-caption" style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                                                        {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                    {locked ? (
                                                        <div style={{
                                                            fontSize: '0.75rem', fontWeight: 700,
                                                            color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em',
                                                            background: '#FFFBEB', padding: '6px 12px', borderRadius: '99px',
                                                            display: 'flex', alignItems: 'center', gap: '6px'
                                                        }}>
                                                            🔒 {minTierName}
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            fontSize: '0.75rem', fontWeight: 700,
                                                            color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em',
                                                            background: '#ECFDF5', padding: '6px 12px', borderRadius: '99px'
                                                        }}>
                                                            Free
                                                        </div>
                                                    )}
                                                </div>

                                                <h2 className="text-h2" style={{ marginBottom: '16px', fontSize: '1.75rem', lineHeight: 1.3, letterSpacing: '-0.01em', color: locked ? '#374151' : '#111827' }}>{post.title}</h2>

                                                {/* Content Teaser */}
                                                <div className="text-body" style={{ color: locked ? '#9CA3AF' : '#4B5563', marginBottom: '24px', lineHeight: '1.7', fontSize: '1.05rem' }}>
                                                    {locked ? (
                                                        <div style={{ fontStyle: 'italic', background: '#F9FAFB', padding: '20px', borderRadius: '12px', fontSize: '0.95rem' }}>
                                                            This post is exclusive to <strong>{minTierName}</strong> members.
                                                            <br />Join the community to unlock this story and support the creator.
                                                        </div>
                                                    ) : (
                                                        isExpanded || (post.content && post.content.length <= 250)
                                                            ? post.content
                                                            : (post.content?.substring(0, 250) + '...')
                                                    )}
                                                </div>

                                                {/* Image Preview (if present) */}
                                                {post.image && (
                                                    <div style={{
                                                        height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden',
                                                        marginBottom: '24px', position: 'relative', background: '#F3F4F6'
                                                    }}>
                                                        <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: locked ? 'blur(16px)' : 'none', opacity: locked ? 0.8 : 1 }} />
                                                        {locked && (
                                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div style={{ background: 'rgba(255,255,255,0.9)', color: '#111827', padding: '16px 32px', borderRadius: '99px', backdropFilter: 'blur(8px)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                                                    <span>🔒</span> Subscribers Only
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                                                    <div style={{ display: 'flex', gap: '20px' }}>
                                                        {locked ? (
                                                            <Button size="sm" onClick={() => {
                                                                const el = document.getElementById('tiers-section');
                                                                if (el && window.innerWidth >= 1000) {
                                                                    el.scrollIntoView({ behavior: 'smooth' });
                                                                } else {
                                                                    setActiveTab('membership');
                                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                                }
                                                            }}>Unlock Post</Button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => showToast('Likes coming soon!', 'info')}
                                                                    className="hover-opacity"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '0.95rem', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
                                                                    <span>❤️</span> Like
                                                                </button>
                                                                <button
                                                                    onClick={() => showToast('Comments coming soon!', 'info')}
                                                                    className="hover-opacity"
                                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: '0.95rem', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 500 }}>
                                                                    <span>💬</span> Comment
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {!locked && post.content?.length > 250 && (
                                                        <Button variant="ghost" size="sm" onClick={() => toggleExpand(i)} style={{ color: 'var(--color-primary)' }}>
                                                            {isExpanded ? 'Read Less ↑' : 'Read More →'}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div style={{ padding: '40px', background: '#fff', borderRadius: '24px', border: '1px solid #E5E7EB' }}>
                            <h3 className="text-h3" style={{ marginBottom: '24px' }}>About {displayName}</h3>
                            <p className="text-body" style={{ whiteSpace: 'pre-line', marginBottom: '32px', fontSize: '1.1rem', lineHeight: '1.6', color: '#4B5563' }}>
                                {creatorProfile?.description || "This creator hasn't written a bio yet."}
                            </p>
                        </div>
                    )}

                    {activeTab === 'membership' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="text-h2" style={{ marginBottom: '8px' }}>Choose your plan</div>
                                <p style={{ color: '#6B7280' }}>Unlock exclusive access and support {displayName}</p>
                            </div>

                            {creatorTiers.map((tier, i) => {
                                const isCurrentTier = i === memberTierId;
                                const isUpgrade = i > memberTierId && memberTierId !== -1;
                                const isDowngrade = i < memberTierId && memberTierId !== -1;
                                // ... (re-use logic for brevity, assuming state is same)
                                let buttonText = "Join " + tier.name;
                                let buttonVariant = tier.recommended ? 'primary' : 'outline';
                                let disabled = false;

                                if (isCurrentTier) {
                                    if (isSubscribed) { buttonText = "Current Plan"; buttonVariant = "outline"; disabled = true; }
                                    else { buttonText = "Renew Plan"; buttonVariant = "primary"; }
                                } else if (isUpgrade) {
                                    buttonText = "Upgrade for " + formatPrice(tier.price); buttonVariant = "primary";
                                } else if (isDowngrade) {
                                    buttonText = "Downgrade"; buttonVariant = "outline";
                                }

                                return (
                                    <div key={i} className="hover-lift" style={{
                                        padding: '32px',
                                        display: 'flex', flexDirection: 'column', gap: '24px',
                                        borderRadius: '24px',
                                        background: '#fff',
                                        border: tier.recommended ? '2px solid #111827' : '1px solid #E5E7EB',
                                        boxShadow: tier.recommended ? '0 20px 40px -10px rgba(0,0,0,0.1)' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>{tier.name}</h3>
                                                <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '8px', color: '#111827' }}>{formatPrice(tier.price)} <span style={{ fontSize: '1rem', color: '#6B7280', fontWeight: 500 }}>/ month</span></div>
                                            </div>
                                            {tier.recommended && <span style={{ background: '#111827', color: '#fff', padding: '6px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>RECOMMENDED</span>}
                                        </div>
                                        <div style={{ height: '1px', background: '#F3F4F6' }}></div>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '16px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What's included:</p>
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <li style={{ display: 'flex', gap: '12px', fontSize: '1rem', color: '#4B5563', alignItems: 'center' }}>
                                                    <span style={{ color: '#10B981', background: '#ECFDF5', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span>
                                                    Direct support to {displayName}
                                                </li>
                                                {tier.benefits?.map((b: string, idx: number) => (
                                                    <li key={idx} style={{ display: 'flex', gap: '12px', fontSize: '1rem', color: '#4B5563', alignItems: 'center' }}>
                                                        <span style={{ color: '#10B981', background: '#ECFDF5', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</span>
                                                        {b}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <Button
                                            onClick={() => !disabled && handleSubscribeClick(i)}
                                            variant={buttonVariant as any}
                                            disabled={disabled}
                                            size="lg"
                                            style={{ width: '100%', opacity: disabled ? 0.6 : 1, padding: '16px', fontSize: '1.1rem' }}
                                        >
                                            {buttonText}
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Sidebar (Sticky - Desktop Only) */}
                <aside className="desktop-sidebar" style={{ position: 'relative' }}>
                    <div id="tiers-section" style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ padding: '32px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}>
                            <h3 className="text-h3" style={{ marginBottom: '24px', fontSize: '1.25rem' }}>Membership</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {creatorTiers.map((tier, i) => (
                                    <div key={i} className="hover-scale" style={{
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: tier.recommended ? '2px solid #111827' : '1px solid #F3F4F6',
                                        background: tier.recommended ? '#F9FAFB' : '#fff',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                        onClick={() => handleSubscribeClick(i)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#111827' }}>{tier.name}</h4>
                                            {tier.recommended && <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#111827', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>BEST</span>}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <span style={{ fontWeight: 800, fontSize: '1.4rem', color: '#111827' }}>{formatPrice(tier.price)}</span>
                                            <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>/ month</span>
                                        </div>
                                    </div>
                                ))}

                                {creatorTiers.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#F9FAFB', borderRadius: '12px', color: '#6B7280' }}>No public tiers available.</div>
                                )}
                            </div>

                            {/* Trust Microcopy */}
                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F3F4F6', fontSize: '0.85rem', color: '#6B7280', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: '#FEF3C7', color: '#D97706', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</span>
                                    <span>Instant access unlocked</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ background: '#DBEAFE', color: '#2563EB', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛡️</span>
                                    <span>Secure payments on Mantle</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="mobile-sticky-bar" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
                padding: '16px 24px', borderTop: '1px solid #E5E7EB',
                boxShadow: '0 -10px 25px rgba(0,0,0,0.05)', zIndex: 90,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Membership</div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '1.2rem' }}>From {creatorTiers[0] ? formatPrice(creatorTiers[0].price) : 'Free'}</div>
                </div>
                <Button size="lg" onClick={() => {
                    setActiveTab('membership');
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }}>View Plans</Button>
            </div>

            {/* Global Styles for layout */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .desktop-sidebar { display: none; }
                .mobile-sticky-bar { display: flex; }
                .hover-scale { transition: transform 0.2s; }
                .hover-scale:hover { transform: scale(1.02); }
                .hover-opacity:hover { opacity: 0.7; }
                
                @media (min-width: 1000px) {
                    .responsive-grid {
                        grid-template-columns: 1fr 380px !important;
                    }
                    .desktop-sidebar { display: block; }
                    .mobile-sticky-bar { display: none !important; }
                }
            `}} />

            <CheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                onConfirm={handleConfirmSubscribe}
                tier={selectedTierIndex !== null ? creatorTiers[selectedTierIndex] : null}
                status={checkoutStatus}
            />
        </div>
    );
}
