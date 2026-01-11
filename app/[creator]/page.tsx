'use client';

import { use, useState, useEffect } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import WalletButton from '../components/WalletButton';
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

    // ... logic remains same ...

    return (
        <div style={{ minHeight: '100vh', background: '#0f1115', color: '#fff', fontFamily: 'var(--font-geist-sans)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 32px;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                }
                
                @media (min-width: 960px) {
                    .profile-grid {
                        grid-template-columns: 1fr 340px; /* Feed | Sidebar */
                        align-items: start;
                    }
                    .sidebar {
                        position: sticky;
                        top: 100px; /* Offset for nav if needed */
                    }
                }

                .cover-image {
                    height: 250px;
                    width: 100%;
                    object-fit: cover;
                }
                @media (min-width: 768px) { .cover-image { height: 350px; } }

                .nav-tab {
                    padding: 16px 24px;
                    font-weight: 600;
                    color: #a1a1aa;
                    border-bottom: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .nav-tab.active {
                    color: #fff;
                    border-bottom: 2px solid #fff;
                }
                .nav-tab:hover { color: #fff; }
            `}} />

            {/* Navbar Simplified */}
            <nav style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,17,21,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <Button variant="outline" onClick={() => router.push('/')} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', border: 'none', color: '#a1a1aa' }}>
                    ← Backr
                </Button>
                <div style={{ fontWeight: 'bold' }}>{displayName}</div>
                <WalletButton />
            </nav>

            {/* Banner Section */}
            <div style={{ position: 'relative', marginBottom: '80px' }}>
                <div style={{ width: '100%', height: '300px', background: creatorProfile?.coverUrl ? `url(${creatorProfile.coverUrl})` : 'linear-gradient(to right, #434343, #000000)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {!creatorProfile?.coverUrl && <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #2e333d, #1a1d24)' }}></div>}
                </div>

                {/* Avatar Overlap */}
                <div style={{ position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
                    <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#2e333d', border: '6px solid #0f1115', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}></div>
                </div>
            </div>

            {/* Header Info */}
            <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 24px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px' }}>{displayName}</h1>
                <p style={{ color: '#a1a1aa', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 24px' }}>{displayBio}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                    <span><strong>{posts.length}</strong> posts</span>
                    <span><strong>{creatorTiers.length}</strong> tiers</span>
                </div>
            </div>

            {ToastComponent}

            {/* Main Grid */}
            <div className="profile-grid">

                {/* Left Column: Content */}
                <div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
                        <div className="nav-tab active">Home</div>
                        <div className="nav-tab">About</div>
                        <div className="nav-tab">Collections</div>
                    </div>

                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', color: '#d4d4d8' }}>Recent Posts</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {posts.length === 0 ? (
                            <div style={{ padding: '60px', textAlign: 'center', color: '#52525b', border: '1px dashed #27272a', borderRadius: '16px' }}>
                                Creators posts will appear here.
                            </div>
                        ) : (
                            posts.map((post: any, i) => {
                                const hasAccess = canViewPost(post);
                                return (
                                    <Card key={i} style={{ padding: '0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: '#13151a' }}>
                                        {/* Header */}
                                        <div style={{ padding: '24px 24px 16px' }}>
                                            <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '8px' }}>
                                                {new Date(post.createdAt).toLocaleDateString()}
                                                {!post.isPublic && post.minTier > 0 && <span style={{ marginLeft: '12px', color: '#c084fc' }}>🔒 Tier {post.minTier}+</span>}
                                            </div>
                                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{post.title}</h3>
                                        </div>

                                        {/* Image Area */}
                                        {post.image && (
                                            <div style={{ position: 'relative', width: '100%', height: '400px', background: '#000' }}>
                                                <img
                                                    src={post.image}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain', filter: hasAccess ? 'none' : 'blur(20px) brightness(0.5)' }}
                                                />
                                                {!hasAccess && (
                                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔒</div>
                                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Locked Post</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Content Area */}
                                        <div style={{ padding: '16px 24px 24px' }}>
                                            {hasAccess ? (
                                                <div style={{ lineHeight: '1.6', color: '#d4d4d8' }}>{post.content}</div>
                                            ) : (
                                                <div style={{ color: '#71717a', fontStyle: 'italic' }}>
                                                    {post.teaser || "This content is reserved for members."}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                                <button style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>❤️ Like</button>
                                                <button style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>💬 Comment</button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Membership */}
                <div className="sidebar">
                    <Card style={{ background: '#13151a', border: '1px solid rgba(255,255,255,0.05)', padding: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#a1a1aa' }}>Membership</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {creatorTiers.length === 0 ? (
                                <div style={{ color: '#52525b', textAlign: 'center' }}>No tiers active.</div>
                            ) : (
                                creatorTiers.map((tier: any, i) => (
                                    <div key={i} style={{
                                        border: tier.recommended ? '1px solid #22d3ee' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        background: tier.recommended ? 'rgba(34,211,238,0.05)' : 'transparent',
                                        position: 'relative'
                                    }}>
                                        {tier.recommended && <span style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '0.7rem', color: '#22d3ee', fontWeight: 'bold', border: '1px solid #22d3ee', padding: '2px 8px', borderRadius: '12px' }}>RECOMMENDED</span>}

                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px' }}>{tier.name}</h4>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>{tier.price} MNT <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#a1a1aa' }}>/ month</span></div>

                                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '16px' }}></div>

                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', fontSize: '0.9rem', color: '#d4d4d8' }}>
                                            {tier.benefits?.map((b: string, k: number) => (
                                                <li key={k} style={{ marginBottom: '8px', display: 'flex', gap: '8px' }}><span>✓</span> {b}</li>
                                            ))}
                                        </ul>

                                        <Button
                                            onClick={() => handleSubscribe(i)}
                                            disabled={loading}
                                            variant={tier.recommended ? 'primary' : 'outline'}
                                            style={{ width: '100%', borderRadius: '20px', justifyContent: 'center' }}
                                        >
                                            {loading ? 'Processing...' : 'Join'}
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    <div style={{ marginTop: '24px', fontSize: '0.8rem', color: '#52525b', textAlign: 'center' }}>
                        Subscriptions auto-renew on Mantle Network.
                    </div>
                </div>

            </div>
        </div>
    );
}
