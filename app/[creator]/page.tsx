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

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    const { creator } = use(params);
    const creatorId = creator;

    const { isConnected, address } = useAccount();
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();

    // Tab State
    const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'collections'>('posts');

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

    // Subscription Transaction
    const { data: hash, writeContract } = useWriteContract();
    const { isSuccess: isSubscribedOnChain } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSubscribedOnChain) {
            setLoading(false);
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            showToast('Welcome to the inner circle! 🎉', 'success');
        }
    }, [isSubscribedOnChain]);

    const handleSubscribe = async (tierId: number) => {
        if (!isConnected) return showToast('Please connect your wallet first.', 'error');
        if (!creatorContractAddress) return showToast('Creator contract not found.', 'error');

        const tier = creatorTiers[tierId];
        if (!tier) return;

        setLoading(true);
        try {
            writeContract({
                address: creatorContractAddress as `0x${string}`,
                abi: SUBSCRIPTION_ABI,
                functionName: 'subscribe',
                args: [BigInt(tierId)],
                value: BigInt(parseFloat(tier.price) * 1e18)
            });
        } catch (e) {
            console.error(e);
            setLoading(false);
            showToast('Transaction failed.', 'error');
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

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
            {ToastComponent}

            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)',
                padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Button variant="ghost" onClick={() => router.push('/')} style={{ color: 'var(--color-text-secondary)', padding: '8px' }}>←</Button>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{displayName}</div>
                </div>
                <WalletButton />
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

                <div className="page-container" style={{ position: 'relative', marginTop: '-60px', display: 'flex', alignItems: 'flex-end', gap: '24px', flexWrap: 'wrap', paddingLeft: '24px', paddingRight: '24px' }}>
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
            <div className="page-container responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Left: Feed & Tabs */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '32px', gap: '8px' }}>
                        {['posts', 'about', 'collections'].map((tab) => (
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
                                    fontSize: '1rem'
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
                                    return (
                                        <div key={i} className="card-surface" style={{ overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                                            <div style={{ padding: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                                    <span className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {locked && (
                                                        <div style={{
                                                            fontSize: '0.7rem', fontWeight: 800,
                                                            color: 'var(--color-warning)', textTransform: 'uppercase',
                                                            background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '4px'
                                                        }}>
                                                            Locked 🔒
                                                        </div>
                                                    )}
                                                </div>

                                                <h2 className="text-h3" style={{ marginBottom: '12px', fontSize: '1.4rem' }}>{post.title}</h2>

                                                {/* Content Teaser */}
                                                <div className="text-body" style={{ color: locked ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
                                                    {locked ? (
                                                        <div style={{ fontStyle: 'italic', opacity: 0.8 }}>
                                                            This post is for <strong>Tier {post.minTier || 1}+</strong> members only. Join to unlock and read the full story.
                                                        </div>
                                                    ) : (
                                                        post.content?.length > 200 ? post.content.substring(0, 200) + '...' : post.content
                                                    )}
                                                </div>

                                                {/* Image Preview (if present) - Optimized Ratio */}
                                                {post.image && (
                                                    <div style={{
                                                        height: '240px', width: '100%', borderRadius: '12px', overflow: 'hidden',
                                                        marginBottom: '20px', position: 'relative', background: '#f0f0f0'
                                                    }}>
                                                        <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: locked ? 'blur(8px)' : 'none', opacity: locked ? 0.7 : 1 }} />
                                                        {locked && (
                                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                <span style={{ fontSize: '3rem' }}>🔒</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                    <div style={{ display: 'flex', gap: '16px' }}>
                                                        {locked ? (
                                                            <Button size="sm" onClick={() => {
                                                                const el = document.getElementById('tiers-section');
                                                                el?.scrollIntoView({ behavior: 'smooth' });
                                                            }}>Unlock</Button>
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

                    {activeTab === 'collections' && (
                        <div style={{ padding: '64px', textAlign: 'center', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📂</div>
                            <h3 className="text-h3">No Collections</h3>
                            <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>Collections help organize posts series.</p>
                        </div>
                    )}
                </div>

                {/* Right: Sidebar (Sticky) */}
                <aside style={{ position: 'relative' }}>
                    <div id="tiers-section" style={{ position: 'sticky', top: '90px' }}>
                        <div className="card-surface" style={{ padding: '24px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', borderRadius: 'var(--radius-lg)' }}>
                            <h3 className="text-h3" style={{ marginBottom: '8px' }}>Join Membership</h3>
                            <p className="text-body-sm" style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>Unlock exclusive content and support {displayName}.</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {creatorTiers.map((tier, i) => (
                                    <div key={i} style={{
                                        padding: '16px',
                                        borderRadius: 'var(--radius-md)',
                                        border: tier.recommended ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        background: tier.recommended ? 'var(--color-primary-light)' : 'var(--color-bg-page)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                        onClick={() => handleSubscribe(i)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <h4 style={{ fontWeight: 700 }}>{tier.name}</h4>
                                            <span style={{ fontWeight: 800 }}>{formatPrice(tier.price)}</span>
                                        </div>
                                        {tier.recommended && (
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '8px' }}>RECOMMENDED</div>
                                        )}
                                        <p className="text-caption" style={{ color: 'var(--color-text-secondary)' }}>Includes {tier.benefits?.length || 0} benefits</p>
                                        <Button size="sm" style={{ width: '100%', marginTop: '12px' }} variant={tier.recommended ? 'primary' : 'outline'}>Join</Button>
                                    </div>
                                ))}

                                {creatorTiers.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '16px', fontStyle: 'italic', color: 'var(--color-text-tertiary)' }}>No tiers public yet.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

            </div>

            {/* Global Styles for layout */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media (min-width: 1000px) {
                    .responsive-grid {
                        grid-template-columns: 7fr 350px !important;
                    }
                }
            `}} />
        </div>
    );
}
