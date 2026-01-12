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

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    const { creator } = use(params);
    const creatorId = creator;

    const { isConnected, address } = useAccount();
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();

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
            // Sync logic would go here
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

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
            {ToastComponent}

            {/* Nav */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--color-border)',
                padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <Button variant="ghost" onClick={() => router.push('/')} style={{ color: 'var(--color-text-secondary)' }}>← Back</Button>
                <div style={{ fontWeight: 700 }}>{displayName}</div>
                <WalletButton />
            </nav>

            {/* Hero */}
            <header style={{ position: 'relative', paddingBottom: '40px', background: 'var(--color-bg-surface)' }}>
                {/* Cover */}
                <div style={{
                    height: '280px', width: '100%',
                    background: cover ? `url(${cover}) center/cover` : 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
                    position: 'relative'
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3))' }}></div>
                </div>

                {/* Profile Info */}
                <div style={{ maxWidth: 'var(--max-width-page)', margin: '0 auto', padding: '0 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-60px', position: 'relative', zIndex: 10 }}>
                    <div style={{
                        width: '120px', height: '120px', borderRadius: '50%',
                        background: avatar ? `url(${avatar}) center/cover` : '#fff',
                        border: '4px solid var(--color-bg-page)', boxShadow: 'var(--shadow-lg)'
                    }}></div>

                    <h1 className="text-h1" style={{ marginTop: '16px', textAlign: 'center' }}>{displayName}</h1>
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', textAlign: 'center', marginTop: '8px' }}>
                        {creatorProfile?.description || "Creating amazing content for the Mantle community."}
                    </p>

                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px', color: 'var(--color-text-tertiary)', fontSize: '0.875rem' }}>
                        <span><strong>{posts.length}</strong> Posts</span>
                        <span>•</span>
                        <span><strong>{creatorTiers.length}</strong> Tiers</span>
                    </div>

                    {/* Socials Placeholder */}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                        {creatorProfile?.socials?.twitter && <a href={`https://x.com/${creatorProfile.socials.twitter}`} target="_blank" style={{ fontSize: '1.2rem', opacity: 0.6 }}>🐦</a>}
                        {creatorProfile?.socials?.website && <a href={creatorProfile.socials.website} target="_blank" style={{ fontSize: '1.2rem', opacity: 0.6 }}>🌐</a>}
                    </div>
                </div>
            </header>

            {/* Layout Grid */}
            <main style={{ maxWidth: 'var(--max-width-page)', margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }} className="responsive-grid">

                {/* Left: Feed */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
                        <button style={{ padding: '12px 24px', borderBottom: '2px solid var(--color-primary)', color: 'var(--color-text-primary)', fontWeight: 600, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>Posts</button>
                        <button style={{ padding: '12px 24px', borderBottom: '2px solid transparent', color: 'var(--color-text-secondary)', fontWeight: 600, background: 'none', border: 'none' }}>About</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {posts.length === 0 ? (
                            <div style={{ padding: '64px', textAlign: 'center', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
                                <h3 className="text-h3">No posts yet</h3>
                                <p className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>Check back later for updates.</p>
                            </div>
                        ) : (
                            posts.map((post, i) => {
                                const locked = !canViewPost(post);
                                return (
                                    <div key={i} className="card-surface" style={{ overflow: 'hidden', padding: 0 }}>
                                        {post.image && (
                                            <div style={{ height: '300px', background: '#000', position: 'relative' }}>
                                                <img src={post.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: locked ? 'blur(12px)' : 'none', opacity: locked ? 0.6 : 1 }} />
                                                {locked && (
                                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                                                        <div style={{ background: 'rgba(255,255,255,0.9)', padding: '12px 24px', borderRadius: '30px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', color: '#000' }}>
                                                            🔒 Subscribers Only
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div style={{ padding: '24px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>{new Date(post.createdAt).toLocaleDateString()}</span>
                                                {locked && <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Locked</span>}
                                            </div>
                                            <h2 className="text-h3" style={{ marginBottom: '12px' }}>{post.title}</h2>
                                            <div className="text-body" style={{ color: locked ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)', marginBottom: '24px' }}>
                                                {locked ? (post.teaser || "Join a membership tier to unlock this post.") : post.content}
                                            </div>

                                            {locked ? (
                                                <Button style={{ width: '100%' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Unlock Post</Button>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>❤️ Like</button>
                                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>💬 Comment</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right: Sidebar (Sticky) */}
                <aside style={{ position: 'relative' }}>
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <h3 className="text-caption" style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '16px', color: 'var(--color-text-tertiary)' }}>Membership Tiers</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {creatorTiers.map((tier, i) => (
                                <div key={i} className="card-surface" style={{
                                    padding: '24px',
                                    border: tier.recommended ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    background: tier.recommended ? 'var(--color-primary-light)' : 'var(--color-bg-surface)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <h4 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{tier.name}</h4>
                                        {tier.recommended && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase' }}>Recommended</span>}
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '16px' }}>
                                        {tier.price} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>MNT / mo</span>
                                    </div>

                                    <ul style={{ padding: 0, listStyle: 'none', marginBottom: '24px' }}>
                                        {tier.benefits?.slice(0, 4).map((b: string, k: number) => (
                                            <li key={k} style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                                <span style={{ color: 'var(--color-primary)' }}>✓</span> {b}
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        variant={tier.recommended ? 'primary' : 'outline'}
                                        style={{ width: '100%' }}
                                        onClick={() => handleSubscribe(i)}
                                        disabled={loading || isSubscribed}
                                    >
                                        {loading ? 'Processing...' : isSubscribed ? 'Already Member' : 'Join Tier'}
                                    </Button>
                                </div>
                            ))}

                            {creatorTiers.length === 0 && (
                                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                                    No membership tiers available yet.
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <p className="text-caption" style={{ color: 'var(--color-text-tertiary)' }}>
                                Secured by Mantle Network. <br /> Cancel anytime.
                            </p>
                        </div>
                    </div>
                </aside>

            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (min-width: 1000px) {
                    .responsive-grid {
                        grid-template-columns: 1fr 340px !important;
                    }
                }
            `}} />
        </div>
    );
}
