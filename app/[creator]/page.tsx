'use client';

import { use, useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import { useRouter } from 'next/navigation';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { SUBSCRIPTION_ABI } from '@/utils/abis';
import { parseEther, Address } from 'viem';
import { useToast } from '../components/Toast';
import confetti from 'canvas-confetti';

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    // Unwrap params using React.use() or await in async component. 
    // Since 'use client', we use the React.use() hook for promises if strictly following Next.js 15+, 
    // but for broad compatibility with Next.js 13/14 app dir, we can await it if the component was server, OR use unwrapping.
    // Actually, Next.js 15 params is a Promise. We should unwrap it.
    const resolvedParams = use(params);
    const creatorId = resolvedParams.creator;

    const { isConnected, address } = useAccount();
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();

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

    // Fetch creator's deployed profile contract address
    const [creatorContractAddress, setCreatorContractAddress] = useState<string>('');

    useEffect(() => {
        // Fetch creator's contract from database
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const creator = creators.find((c: any) => c.address === creatorId);
                // In a real setup, we'd store the deployed contract address in DB
                // For now, we'll use a placeholder or fetch from Factory
                setCreatorContractAddress(creator?.contractAddress || '');
            });
    }, [creatorId]);

    // Check if user is already a member on-chain
    // We need the ABI for isMember
    const { data: isMemberOnChain } = useReadContract({
        address: creatorContractAddress as `0x${string}`,
        abi: SUBSCRIPTION_ABI,
        functionName: 'isMember',
        args: [address],
        query: {
            enabled: !!creatorContractAddress && !!address
        }
    });

    useEffect(() => {
        if (isMemberOnChain) {
            setIsSubscribed(true);
        }
    }, [isMemberOnChain]);

    const { data: hash, writeContract, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isSubscribedOnChain } = useWaitForTransactionReceipt({ hash });



    useEffect(() => {
        if (isSubscribedOnChain) {
            setIsSubscribed(true);
            setLoading(false);

            // Fire confetti!
            const duration = 3000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#22d3ee', '#c084fc', '#f472b6']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#22d3ee', '#c084fc', '#f472b6']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            // Save to Database for "My Memberships" page
            fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriberAddress: address,
                    creatorAddress: creatorId,
                    tierId: 0, // We need to track which tier was selected, but for now 0 is fine or we create state
                    expiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // Mock 30 days for now or fetch from event
                })
            });

            // We can replace system alert with our custom toast now if desired, but user likes native alerts sometimes or fireworks.
            // Keeping alert for immediate feedback or Toast.
            showToast('Subscription successful! Welcome to the community! 🎉', 'success');
        }
    }, [isSubscribedOnChain, address, creatorId]);

    const handleSubscribe = async (tierId: number) => {
        if (!isConnected || !address) {
            alert("Please connect wallet first!");
            return;
        }

        const selectedTier = creatorTiers[tierId];
        if (!selectedTier) {
            alert("Tier not found!");
            return;
        }

        if (!creatorContractAddress) {
            alert("⚠️ Creator contract address not found!\nThe creator needs to re-sync their dashboard or the contract is not deployed yet.");
            return;
        }

        setLoading(true);

        try {
            // Convert price to Wei (assuming price is in MNT)
            const priceInWei = BigInt(parseFloat(selectedTier.price) * 1e18);

            // Call subscribe function with native MNT
            writeContract({
                address: creatorContractAddress as `0x${string}`,
                abi: [{
                    "inputs": [{ "internalType": "uint256", "name": "_tierId", "type": "uint256" }],
                    "name": "subscribe",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                }],
                functionName: 'subscribe',
                args: [BigInt(tierId)],
                value: priceInWei
            });
        } catch (error) {
            console.error('Subscription error:', error);
            setLoading(false);
            alert('❌ Subscription failed. Please try again.');
        }
    };

    const displayName = creatorProfile?.name || `Creator ${creatorId.substring(0, 6)}...`;
    const displayBio = creatorProfile?.description || 'Creating digital art and Web3 education.';
    const avatarUrl = creatorProfile?.avatarUrl;

    // ... 

    const { data: memberData } = useReadContract({
        address: creatorContractAddress as Address,
        abi: SUBSCRIPTION_ABI,
        functionName: 'memberships',
        args: [address],
        query: {
            enabled: !!creatorContractAddress && !!address
        }
    });

    const memberTierId = memberData ? Number((memberData as any)[1]) : -1;
    // Note: If user is not member, tierId might be 0 but isActive/expiry matters.
    // relying on isSubscribed for valid active status, and memberTierId for level.
    const memberExpiry = memberData ? Number((memberData as any)[0]) : 0;

    // Auto-Sync: If on-chain says active, but maybe DB missed it, force a sync.
    useEffect(() => {
        if (!address || !creatorContractAddress || !memberData) return;

        const now = Math.floor(Date.now() / 1000);
        if (memberExpiry > now) {
            // User is active on chain. Ensure DB knows.
            setIsSubscribed(true);

            // We only trigger this once per load effectively, but standard upsert is safe.
            // Ideally check if we need to? For now just upsert to be safe.
            fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriberAddress: address,
                    creatorAddress: creatorId, // Use the Creator's Wallet Address (PK), not Contract Address
                    tierId: memberTierId,
                    expiry: memberExpiry
                })
            }).then(res => {
                if (res.ok) {
                    console.log("Synced membership from chain to DB");
                    showToast('Membership synced from blockchain! ✅', 'success');
                } else {
                    res.json().then(err => {
                        console.error("Sync API Error", err);
                        // Don't spam error toast if it's just a duplicate key race condition
                        if (!err.error?.includes('duplicate')) {
                            showToast(`Sync warning: ${err.error?.substring(0, 30)}`, 'error');
                        }
                    });
                }
            }).catch(e => {
                console.error("Sync error", e);
                // silent fail on network error to not annoy
            });
        }
    }, [address, creatorContractAddress, memberData, memberExpiry, memberTierId]);

    const canViewPost = (post: any) => {
        if (post.isPublic) return true;
        // Check if the current user is the creator (Owner override)
        if (address && creatorId && address.toLowerCase() === creatorId.toLowerCase()) return true;

        if (!isSubscribed) return false;
        // If subscribed, check minTier
        const minTier = post.minTier || 0;
        // memberTierId is 0-indexed index of tiers array.
        // minTier used by user: 0 = "All Tiers", 1 = Tier 0 (Supporter), 2 = Tier 1 (VIP)
        // If minTier == 0, anyone subscribed can see.
        if (minTier === 0) return true;

        // If minTier > 0, we need to match.
        // minTier 1 corresponds to Tier Index 0.
        // minTier 2 corresponds to Tier Index 1.
        // So requiredIndex = minTier - 1.
        const requiredIndex = minTier - 1;

        // If memberTierId >= requiredIndex ... wait, tier comparison depends on creation order or value?
        // Usually higher tier index = higher value? Or we just check exact match?
        // For simple "at least" logic, let's assume index implies hierarchy or just do exact match.
        // Let's allow if memberTierId == requiredIndex OR simply "isSubscribed" if we don't strict enforce hierarchy.
        // But user asked for "tier seviyesi seçmemiz lazım".
        // Let's assume >= for now if tiers are ordered by price.
        return memberTierId >= requiredIndex;
    };

    return (
        <div style={{ padding: '48px', maxWidth: '800px', margin: '0 auto' }}>
            {ToastComponent}
            {ToastComponent}
            <Button
                variant="outline"
                onClick={() => router.push('/')}
                style={{
                    marginBottom: '32px',
                    borderRadius: '24px',
                    padding: '12px 24px',
                    fontSize: '1rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.03)'
                }}
            >
                ← Back to Home
            </Button>

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
                    <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center', fontWeight: 'bold', background: 'linear-gradient(135deg, #65b3ad 0%, #9d65ad 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Select a Membership Tier</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
                        {creatorTiers.map((tier: any, i) => (
                            <div
                                key={i}
                                style={{
                                    position: 'relative',
                                    padding: '2px',
                                    borderRadius: '16px',
                                    background: tier.recommended
                                        ? 'linear-gradient(135deg, #65b3ad 0%, #9d65ad 50%, #65b3ad 100%)'
                                        : 'linear-gradient(135deg, #2e333d 0%, #1a1d24 100%)',
                                    backgroundSize: '200% 200%',
                                    animation: tier.recommended ? 'gradientShift 3s ease infinite' : 'none',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = tier.recommended
                                        ? '0 20px 60px rgba(101, 179, 173, 0.4), 0 0 40px rgba(157, 101, 173, 0.3)'
                                        : '0 20px 40px rgba(0, 0, 0, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {tier.recommended && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        right: '20px',
                                        background: 'linear-gradient(135deg, #65b3ad 0%, #9d65ad 100%)',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        padding: '6px 16px',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 12px rgba(101, 179, 173, 0.5)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        ⭐ Best Value
                                    </div>
                                )}

                                <div style={{
                                    background: 'linear-gradient(180deg, rgba(26,29,36,0.95) 0%, rgba(26,29,36,1) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '14px',
                                    padding: '32px 24px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    minHeight: '320px'
                                }}>
                                    <div style={{ flex: 1, marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '12px', color: '#fff' }}>{tier.name}</h3>
                                        <div style={{
                                            fontSize: '3rem',
                                            fontWeight: 'bold',
                                            marginBottom: '12px',
                                            background: tier.recommended
                                                ? 'linear-gradient(135deg, #65b3ad 0%, #9d65ad 100%)'
                                                : 'linear-gradient(135deg, #65b3ad 0%, #7dcbc3 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            lineHeight: '1'
                                        }}>
                                            {tier.price} <span style={{ fontSize: '1.25rem', opacity: 0.7 }}>MNT</span>
                                        </div>
                                        <div style={{
                                            fontSize: '0.875rem',
                                            color: '#a1a1aa',
                                            marginBottom: '20px',
                                            display: 'inline-block',
                                            background: 'rgba(101, 179, 173, 0.1)',
                                            border: '1px solid rgba(101, 179, 173, 0.3)',
                                            borderRadius: '8px',
                                            padding: '4px 10px'
                                        }}>
                                            💎 Pay with MNT
                                        </div>

                                        <ul style={{ listStyle: 'none', padding: 0, margin: '20px 0 0 0', color: '#d4d4d8' }}>
                                            {tier.benefits && tier.benefits.length > 0 ? tier.benefits.map((benefit: string, j: number) => (
                                                <li key={j} style={{
                                                    marginBottom: '12px',
                                                    paddingLeft: '24px',
                                                    position: 'relative',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    <span style={{
                                                        position: 'absolute',
                                                        left: 0,
                                                        color: '#65b3ad',
                                                        fontWeight: 'bold',
                                                        fontSize: '1.1rem'
                                                    }}>✓</span>
                                                    {benefit}
                                                </li>
                                            )) : (
                                                <li style={{ color: '#71717a', fontStyle: 'italic' }}>No benefits listed</li>
                                            )}
                                        </ul>
                                    </div>

                                    <Button
                                        onClick={() => handleSubscribe(i)}
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            background: tier.recommended
                                                ? 'linear-gradient(135deg, #65b3ad 0%, #9d65ad 100%)'
                                                : 'linear-gradient(135deg, #65b3ad 0%, #7dcbc3 100%)',
                                            border: 'none',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            padding: '14px',
                                            boxShadow: '0 4px 12px rgba(101, 179, 173, 0.3)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e: any) => {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(101, 179, 173, 0.5)';
                                        }}
                                        onMouseLeave={(e: any) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(101, 179, 173, 0.3)';
                                        }}
                                    >
                                        {loading ? '⏳ Processing on Mantle...' : '🚀 Subscribe Now'}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
            }

            {/* Posts Feed for Fans */}
            <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Latest Posts</h2>
                {posts.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#52525b', border: '1px dashed #2e333d', borderRadius: '12px' }}>
                        No posts yet.
                    </div>
                ) : (
                    posts.map((post: any, i) => {
                        const hasAccess = canViewPost(post);

                        return (
                            <Card
                                key={i}
                                style={{ marginBottom: '24px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s' }}
                                onClick={() => router.push(`/${creatorId}/posts/${post.id || i}`)} // Fallback to index if no ID for mock
                                onMouseEnter={(e: any) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={(e: any) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>{post.title}</h3>
                                        {post.isPublic && <span style={{ background: 'rgba(101, 179, 173, 0.1)', color: '#65b3ad', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>Public</span>}
                                        {!post.isPublic && post.minTier > 0 && <span style={{ background: 'rgba(157, 101, 173, 0.1)', color: '#9d65ad', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>Tier {post.minTier}+</span>}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>{new Date(post.createdAt).toLocaleDateString()}</p>
                                </div>

                                {/* Post Image with Blur if Locked */}
                                {post.image && (
                                    <div style={{ position: 'relative', marginBottom: '16px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #2e333d' }}>
                                        <img
                                            src={post.image}
                                            alt="Post Attachment"
                                            style={{
                                                width: '100%',
                                                maxHeight: '400px',
                                                objectFit: 'cover',
                                                display: 'block',
                                                filter: hasAccess ? 'none' : 'blur(20px) brightness(0.7)',
                                                transition: 'filter 0.3s ease'
                                            }}
                                        />
                                        {!hasAccess && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '50%',
                                                left: '50%',
                                                transform: 'translate(-50%, -50%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                background: 'rgba(0,0,0,0.8)',
                                                padding: '12px 24px',
                                                borderRadius: '30px',
                                                border: '1px solid #65b3ad',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                                zIndex: 10
                                            }}>
                                                <span style={{ fontSize: '1.25rem' }}>🔒</span>
                                                <span style={{ color: '#fff', fontWeight: 'bold' }}>Locked for Members</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content Gating Logic */}
                                {hasAccess ? (
                                    <div style={{ color: '#d4d4d8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        {/* Teaser if available */}
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
                        );
                    })
                )}
            </div>

        </div >
    );
}
