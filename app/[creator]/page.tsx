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

    useEffect(() => {
        if (isTxLoading) {
            setCheckoutStatus('pending');
        } else if (isSubscribedOnChain) {
            setCheckoutStatus('success');
            setLoading(false);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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

    // Derived Display Data
    const displayName = creatorProfile?.name || `Creator ${creatorId.substring(0, 4)}...`;
    const avatar = creatorProfile?.avatarUrl;
    const cover = creatorProfile?.coverUrl;
    const memberCount = Math.floor(Math.random() * 100) + 1; // Mock

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
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
            {ToastComponent}

            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)',
                padding: '12px 0'
            }}>
                <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Button variant="ghost" onClick={() => router.push('/')} style={{ color: 'var(--color-text-secondary)', padding: '8px' }}>←</Button>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{displayName}</div>
                    </div>
                    <WalletButton />
                </div>
            </nav>

            {/* Hero & Profile Header */}
            <div style={{ background: 'var(--color-bg-surface)', paddingBottom: '24px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)' }}>
                {/* Cover - Reduced Height (180px) */}
                <div style={{
                    height: '180px', width: '100%',
                    background: cover ? `url(${cover}) center/cover` : 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Pattern Overlay */}
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.1 }}></div>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3))' }}></div>
                </div>

                <div className="page-container" style={{ position: 'relative', marginTop: '-60px', display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap' }}>
                    {/* Avatar - Better Positioning & Border */}
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: avatar ? `url(${avatar}) center/cover` : '#fff',
                        border: '4px solid var(--color-bg-surface)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        flexShrink: 0,
                        zIndex: 10
                    }}></div>

                    {/* Info */}
                    <div style={{ flex: 1, paddingBottom: '8px', zIndex: 10 }}>
                        <h1 className="text-h1" style={{ marginBottom: '4px', textShadow: '0 2px 4px rgba(255,255,255,0.5)' }}>{displayName}</h1>
                        <div style={{ display: 'flex', gap: '16px', color: 'var(--color-text-secondary)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                            <span><strong>{posts.length}</strong> {formatPlural(posts.length, 'Post', 'Posts')}</span>
                            <span><strong>{creatorTiers.length}</strong> {formatPlural(creatorTiers.length, 'Tier', 'Tiers')}</span>
                            <span><strong>{memberCount}</strong> {formatPlural(memberCount, 'Member', 'Members')}</span>
                        </div>
                    </div>

                    {/* Socials / Actions */}
                    <div style={{ display: 'flex', gap: '12px', paddingBottom: '12px' }}>
                        {creatorProfile?.socials?.twitter && (
                            <Button variant="ghost" size="sm" onClick={() => window.open(`https://x.com/${creatorProfile.socials.twitter}`, '_blank')}>
                                🐦 Twitter
                            </Button>
                        )}
                        <Button variant="outline" size="sm">Share</Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="page-container responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '40px', paddingBottom: '100px' }}>

                {/* Left: Feed & Tabs */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '32px', gap: '8px' }}>
                        {['posts', 'about', 'membership'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                style={{
                                    padding: '12px 20px',
                                    borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                                    fontWeight: 600,
                                    background: 'none',
                                    borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    fontSize: '1rem',
                                    transition: 'color 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'posts' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {posts.length === 0 ? (
                                <div style={{ padding: '64px', textAlign: 'center', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
                                    <h3 className="text-h3">No posts yet</h3>
                                    <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>This creator hasn't posted anything yet.</p>
                                </div>
                            ) : (
                                posts.map((post, i) => {
                                    const locked = !canViewPost(post);
                                    const minTierName = creatorTiers[post.minTier || 0]?.name || 'Members Only';

                                    return (
                                        <div key={i} className="card-surface" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                                            <div style={{ padding: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                                    <span className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {locked ? (
                                                        <div style={{
                                                            fontSize: '0.7rem', fontWeight: 800,
                                                            color: 'var(--color-warning)', textTransform: 'uppercase',
                                                            background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px',
                                                            display: 'flex', alignItems: 'center', gap: '4px'
                                                        }}>
                                                            🔒 {minTierName}
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            fontSize: '0.7rem', fontWeight: 800,
                                                            color: 'var(--color-success)', textTransform: 'uppercase',
                                                            background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '4px'
                                                        }}>
                                                            Public
                                                        </div>
                                                    )}
                                                </div>

                                                <h2 className="text-h3" style={{ marginBottom: '12px', fontSize: '1.4rem' }}>{post.title}</h2>

                                                {/* Content Teaser */}
                                                <div className="text-body" style={{ color: locked ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                                                    {locked ? (
                                                        <div style={{ fontStyle: 'italic', opacity: 0.8 }}>
                                                            This post is exclusive to <strong>{minTierName}</strong> members.
                                                            <br />Join to unlock and read the full story.
                                                        </div>
                                                    ) : (
                                                        post.content?.length > 200 ? post.content.substring(0, 200) + '...' : post.content
                                                    )}
                                                </div>

                                                {/* Image Preview (if present) */}
                                                {post.image && (
                                                    <div style={{
                                                        height: '240px', width: '100%', borderRadius: '12px', overflow: 'hidden',
                                                        marginBottom: '20px', position: 'relative', background: 'var(--color-bg-skeleton)'
                                                    }}>
                                                        <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: locked ? 'blur(12px)' : 'none', opacity: locked ? 0.6 : 1 }} />
                                                        {locked && (
                                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <div style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '12px 24px', borderRadius: '99px', backdropFilter: 'blur(4px)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <span>🔒</span> Unlock to view
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '16px' }}>
                                                        {locked ? (
                                                            <Button size="sm" onClick={() => {
                                                                const el = document.getElementById('tiers-section');
                                                                if (el && window.innerWidth >= 1000) {
                                                                    el.scrollIntoView({ behavior: 'smooth' });
                                                                } else {
                                                                    setActiveTab('membership');
                                                                    document.querySelector('.responsive-grid')?.scrollIntoView({ behavior: 'smooth' });
                                                                }
                                                            }}>Unlock Post</Button>
                                                        ) : (
                                                            <>
                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                    <span>❤️</span> Like
                                                                </button>
                                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                    <span>💬</span> Comment
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {!locked && <Button variant="ghost" size="sm">Read More →</Button>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="card-surface" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
                            <h3 className="text-h3" style={{ marginBottom: '16px' }}>About {displayName}</h3>
                            <p className="text-body" style={{ whiteSpace: 'pre-line', marginBottom: '24px' }}>
                                {creatorProfile?.description || "This creator hasn't written a bio yet."}
                            </p>

                            <div style={{ padding: '16px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                                <h4 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>STATS</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <div className="text-h2" style={{ color: 'var(--color-primary)' }}>{posts.length}</div>
                                        <div className="text-caption">Total Posts</div>
                                    </div>
                                    <div>
                                        <div className="text-h2" style={{ color: 'var(--color-primary)' }}>{creatorTiers.length}</div>
                                        <div className="text-caption">Membership Tiers</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'membership' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="text-h3" style={{ marginBottom: '8px' }}>Choose your plan</div>
                            {creatorTiers.map((tier, i) => (
                                <div key={i} className="card-surface" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: tier.recommended ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{tier.name}</h3>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--color-primary)' }}>{formatPrice(tier.price)} <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 400 }}>/ month</span></div>
                                        </div>
                                        {tier.recommended && <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>RECOMMENDED</span>}
                                    </div>

                                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>What's included:</p>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {tier.benefits?.map((b: string, idx: number) => (
                                                <li key={idx} style={{ display: 'flex', gap: '8px', fontSize: '0.9rem' }}>
                                                    <span style={{ color: 'var(--color-success)' }}>✓</span> {b}
                                                </li>
                                            ))}
                                            <li style={{ display: 'flex', gap: '8px', fontSize: '0.9rem' }}>
                                                <span style={{ color: 'var(--color-success)' }}>✓</span> Direct support to {displayName}
                                            </li>
                                        </ul>
                                    </div>

                                    <Button onClick={() => handleSubscribeClick(i)} variant={tier.recommended ? 'primary' : 'outline'} style={{ width: '100%' }}>Join {tier.name}</Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Sidebar (Sticky - Desktop Only) */}
                <aside className="desktop-sidebar" style={{ position: 'relative' }}>
                    <div id="tiers-section" style={{ position: 'sticky', top: '90px' }}>
                        <div className="card-surface" style={{ padding: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-lg)' }}>
                            <h3 className="text-h3" style={{ marginBottom: '8px' }}>Membership</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {creatorTiers.map((tier, i) => (
                                    <div key={i} style={{
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: tier.recommended ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: tier.recommended ? 'var(--color-primary-light)' : 'var(--color-bg-page)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                        onClick={() => handleSubscribeClick(i)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4 style={{ fontWeight: 700 }}>{tier.name}</h4>
                                            <span style={{ fontWeight: 800 }}>{formatPrice(tier.price)}</span>
                                        </div>
                                        <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>{tier.benefits?.length || 0} benefits</p>
                                    </div>
                                ))}

                                {creatorTiers.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '16px', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>No public tiers.</div>
                                )}
                            </div>

                            {/* Trust Microcopy */}
                            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>🛡️ <span>Cancel anytime</span></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>⚡ <span>Instant access unlocked</span></div>
                            </div>
                        </div>
                    </div>
                </aside>

            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="mobile-sticky-bar" style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                padding: '16px 24px', borderTop: '1px solid var(--color-border)',
                boxShadow: '0 -4px 10px rgba(0,0,0,0.05)', zIndex: 90,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Membership</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>From {creatorTiers[0] ? formatPrice(creatorTiers[0].price) : 'Free'}</div>
                </div>
                <Button onClick={() => {
                    setActiveTab('membership');
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); // Simplified scroll
                }}>View Tiers</Button>
            </div>

            {/* Global Styles for layout */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .desktop-sidebar { display: none; }
                .mobile-sticky-bar { display: flex; }
                
                @media (min-width: 1000px) {
                    .responsive-grid {
                        grid-template-columns: 7fr 350px !important;
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
