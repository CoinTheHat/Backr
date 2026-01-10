'use client';

import { use, useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SUBSCRIPTION_ABI } from '../../utils/abis';
import { parseEther } from 'viem';

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    // Unwrap params using React.use() or await in async component. 
    // Since 'use client', we use the React.use() hook for promises if strictly following Next.js 15+, 
    // but for broad compatibility with Next.js 13/14 app dir, we can await it if the component was server, OR use unwrapping.
    // Actually, Next.js 15 params is a Promise. We should unwrap it.
    const resolvedParams = use(params);
    const creatorId = resolvedParams.creator;

    const { isConnected } = useAccount();
    const router = useRouter();

    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const [posts, setPosts] = useState<any[]>([]);
    const [creatorTiers, setCreatorTiers] = useState<any[]>([]);

    // Mock Data based on creator ID
    const creatorName = `Creator ${creatorId.substring(0, 6)}...`;
    const mockTiers = [
        { id: 1, name: 'Supporter', price: '5', benefits: ['Access to exclusive posts', 'Community Discord role'] },
        { id: 2, name: 'Super Fan', price: '20', benefits: ['Private Discord channel', 'Early Access to content', 'Monthly AMA'] }
    ];

    const [creatorProfile, setCreatorProfile] = useState<any>(null);

    // Fetch Creator Profile, Tiers & Posts
    useEffect(() => {
        if (!creatorId) return;

        // Fetch Profile
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const found = creators.find((c: any) => c.address === creatorId);
                if (found) setCreatorProfile(found);
            });

        // Fetch Tiers
        fetch(`/api/tiers?address=${creatorId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) setCreatorTiers(data);
                // else keep empty or use mock if strictly needed, but better empty
            });

        // Fetch Posts
        fetch(`/api/posts?address=${creatorId}`)
            .then(res => res.json())
            .then(data => setPosts(data));
    }, [creatorId]);

    // IMPORTANT: In production this would come from the specific creator's profile contract.
    // For local dev without a deployed factory/profile, we must simulate or ask for address.
    // We will assume a fixed address or the one from FACTORY lookup if we were to implement lookup here.
    const [mockContractAddress] = useState('0x...');

    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isSubscribedOnChain } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isSubscribedOnChain) {
            setIsSubscribed(true);
        }
    }, [isSubscribedOnChain]);

    const handleSubscribe = (tierId: any) => {
        if (!isConnected) {
            alert("Please connect wallet first!");
            return;
        }

        // SIMULATION FOR DEMO (Since we might not have deployed contract address dynamically here)
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSubscribed(true);
            alert("Simulated: 5 MNT sent to Creator Contract!");
        }, 1500);
    };

    const displayName = creatorProfile?.name || `Creator ${creatorId.substring(0, 6)}...`;
    const displayBio = creatorProfile?.description || 'Creating digital art and Web3 education.';
    const avatarUrl = creatorProfile?.avatarUrl;

    // ... 

    return (
        <div style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}>
            <Button variant="outline" onClick={() => router.push('/')} style={{ marginBottom: '24px' }}>← Back to Home</Button>

            <header style={{ textAlign: 'center', marginBottom: '64px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#2e333d', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', border: '4px solid #1a1d24' }}>
                    {!avatarUrl && '👻'}
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '16px' }}>{displayName}</h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 24px' }}>{displayBio}</p>

                {creatorProfile?.socials && (
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '24px' }}>
                        {creatorProfile.socials.twitter && <a href={`https://twitter.com/${creatorProfile.socials.twitter}`} target="_blank" style={{ color: '#65b3ad' }}>Twitter</a>}
                        {creatorProfile.socials.website && <a href={creatorProfile.socials.website} target="_blank" style={{ color: '#65b3ad' }}>Website</a>}
                    </div>
                )}

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ background: '#1a1d24', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem', color: '#65b3ad' }}>{creatorTiers.length} Membership Levels</span>
                    <span style={{ background: '#1a1d24', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem', color: '#a1a1aa' }}>{posts.length} Posts</span>
                </div>
            </header>

            {/* Membership Tiers Section */}
            {!isSubscribed && (
                <div style={{ marginBottom: '64px' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', textAlign: 'center' }}>Select a Membership Tier</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                        {creatorTiers.map((tier: any, i) => (
                            <Card key={i} style={{ display: 'flex', flexDirection: 'column', height: '100%', border: tier.recommended ? '1px solid #65b3ad' : '1px solid #2e333d', position: 'relative' }}>
                                {tier.recommended && (
                                    <div style={{ position: 'absolute', top: 0, right: 0, background: '#65b3ad', color: '#000', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderBottomLeftRadius: '8px' }}>
                                        Recommended
                                    </div>
                                )}
                                <div style={{ flex: 1, marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{tier.name}</h3>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px', color: '#65b3ad' }}>
                                        {tier.price} MNT<span style={{ fontSize: '1rem', color: '#a1a1aa', fontWeight: 'normal' }}>/mo</span>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ border: '1px solid #2e333d', borderRadius: '4px', padding: '2px 6px' }}>Pay with MNT</span>
                                    </div>
                                    {tier.benefits && (
                                        <ul style={{ paddingLeft: '20px', color: '#a1a1aa', marginBottom: '16px' }}>
                                            {tier.benefits.map((b: string, k: number) => <li key={k}>{b}</li>)}
                                        </ul>
                                    )}
                                </div>
                                <Button onClick={() => handleSubscribe(tier.id)} disabled={loading}>
                                    {loading ? 'Processing on Mantle...' : 'Subscribe Now'}
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Posts Feed for Fans */}
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Latest Posts</h2>
                {posts.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#52525b', border: '1px dashed #2e333d', borderRadius: '12px' }}>
                        No posts yet.
                    </div>
                ) : (
                    posts.map((post: any, i) => (
                        <Card key={i} style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{post.title}</h3>
                                    {post.isPublic && <span style={{ background: 'rgba(101, 179, 173, 0.1)', color: '#65b3ad', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>Public</span>}
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>

                            {/* Content Gating Logic */}
                            {post.isPublic || isSubscribed ? (
                                <div style={{ color: '#d4d4d8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    {/* Teaser if available, otherwise generic blur */}
                                    {post.teaser ? (
                                        <div style={{ color: '#d4d4d8', marginBottom: '16px', fontStyle: 'italic' }}>
                                            "{post.teaser}"
                                        </div>
                                    ) : null}

                                    <div style={{ filter: 'blur(6px)', userSelect: 'none', color: '#d4d4d8', lineHeight: '1.6', opacity: 0.5 }}>
                                        This is a preview of the exclusive content available to members. Join now to unlock full access. <br />
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.
                                    </div>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ background: '#1a1d24', padding: '16px 24px', borderRadius: '8px', border: '1px solid #2e333d', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                                            <span>🔒 Locked for Members</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>

        </div>
    );
}
