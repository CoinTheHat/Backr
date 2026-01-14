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
            <div className="min-h-screen bg-bg-page">
                {/* Hero Skeleton */}
                <div className="h-[180px] w-full bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse"></div>
                <div className="page-container relative -mt-[60px] flex items-end gap-6 pb-8">
                    <div className="w-[120px] h-[120px] rounded-full border-4 border-bg-surface bg-gray-200 animate-pulse" />
                    <div className="flex-1 pb-4">
                        <div className="h-8 w-[200px] bg-gray-200 rounded mb-2 animate-pulse" />
                        <div className="h-4 w-[150px] bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>

                <div className="page-container grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10 pt-10">
                    <div>
                        <div className="h-[200px] w-full bg-gray-200 rounded-lg mb-6 animate-pulse" />
                        <div className="h-[200px] w-full bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                    <div className="hidden lg:block">
                        <div className="h-[400px] w-full bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-page text-text-primary font-sans pb-[100px] lg:pb-12">
            {ToastComponent}

            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/5 py-4">
                <div className="page-container flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => router.push('/')} className="text-gray-500 p-2 rounded-full">←</Button>
                        <div className="font-bold text-base tracking-tight">{displayName}</div>
                    </div>
                    <WalletButton />
                </div>
            </nav>

            {/* Hero & Profile Header */}
            <div className="bg-white pb-8 mb-10 border-b border-gray-200">
                {/* Cover - Modern Gradient */}
                <div
                    className="h-[240px] w-full relative overflow-hidden bg-cover bg-center"
                    style={{
                        backgroundImage: cover ? `url(${cover})` : 'linear-gradient(120deg, #FDFBFB 0%, #EBEDEE 100%)'
                    }}
                >
                    {!cover && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-10"></div>
                    )}
                </div>

                <div className="page-container relative -mt-20 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                    {/* Avatar - Premium Border */}
                    <div
                        className="w-[160px] h-[160px] rounded-full border-[6px] border-white shadow-2xl flex-shrink-0 z-10 bg-cover bg-center bg-white"
                        style={{
                            backgroundImage: avatar ? `url(${avatar})` : undefined
                        }}
                    ></div>

                    {/* Info */}
                    <div className="flex-1 pb-3 z-10 text-center md:text-left">
                        <h1 className="text-h1 mb-2 text-text-primary">{displayName}</h1>
                        <div className="flex justify-center md:justify-start gap-6 text-gray-600 text-base flex-wrap">
                            <div className="flex items-center gap-1.5"><strong className="text-text-primary">{posts.length}</strong> <span>Posts</span></div>
                            <div className="flex items-center gap-1.5"><strong className="text-text-primary">{creatorTiers.length}</strong> <span>Tiers</span></div>
                            <div className="flex items-center gap-1.5"><strong className="text-text-primary">{memberCount}</strong> <span>Following</span></div>
                        </div>
                    </div>

                    {/* Socials / Actions */}
                    <div className="flex gap-3 pb-3">
                        {creatorProfile?.socials?.twitter && (
                            <Button variant="outline" size="sm" onClick={() => window.open(`https://x.com/${creatorProfile.socials.twitter}`, '_blank')} className="rounded-full">
                                🐦 <span className="ml-1">Follow</span>
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="rounded-full" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('Link copied to clipboard!', 'success');
                        }}>↗ Share</Button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="page-container grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-16">

                {/* Left: Feed & Tabs */}
                <div>
                    {/* Modern Tabs */}
                    <div className="flex border-b border-gray-200 mb-10 gap-8 overflow-x-auto scrollbar-hide">
                        {['posts', 'about', 'membership'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`py-4 px-1 border-b-2 bg-transparent capitalize text-base font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                        ? 'border-text-primary text-text-primary font-semibold'
                                        : 'border-transparent text-gray-500 hover:text-text-primary'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'posts' && (
                        <div className="flex flex-col gap-8">
                            {posts.length === 0 ? (
                                <div className="py-20 px-10 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="text-5xl mb-6 opacity-50">✨</div>
                                    <h3 className="text-h3 mb-3">No posts published yet</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">This creator is preparing exclusive content. Join the membership to be the first to know when they post.</p>
                                </div>
                            ) : (
                                posts.map((post, i) => {
                                    const locked = !canViewPost(post);
                                    const minTierName = creatorTiers[post.minTier || 0]?.name || 'Members Only';
                                    const isExpanded = expandedPosts[i];

                                    return (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                            <div className="p-8">
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-xs text-gray-400 font-medium">
                                                        {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                    {locked ? (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                            🔒 {minTierName}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                            Free
                                                        </div>
                                                    )}
                                                </div>

                                                <h2 className={`text-2xl font-bold mb-4 leading-tight ${locked ? 'text-gray-700' : 'text-gray-900'}`}>{post.title}</h2>

                                                {/* Content Teaser */}
                                                <div className={`text-base mb-6 leading-relaxed ${locked ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {locked ? (
                                                        <div className="italic bg-gray-50 p-5 rounded-xl text-sm">
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
                                                    <div className="h-[300px] w-full rounded-xl overflow-hidden mb-6 relative bg-gray-100">
                                                        <img
                                                            src={post.image}
                                                            alt=""
                                                            className={`w-full h-full object-cover ${locked ? 'blur-md opacity-80' : ''}`}
                                                        />
                                                        {locked && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="bg-white/90 text-gray-900 px-8 py-4 rounded-full backdrop-blur-md font-semibold flex items-center gap-2 shadow-xl">
                                                                    <span>🔒</span> Subscribers Only
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex gap-5">
                                                        {locked ? (
                                                            <Button size="sm" onClick={() => {
                                                                const el = document.getElementById('tiers-section');
                                                                if (el && window.innerWidth >= 1024) {
                                                                    el.scrollIntoView({ behavior: 'smooth' });
                                                                } else {
                                                                    setActiveTab('membership');
                                                                    window.scrollTo({ top: 300, behavior: 'smooth' });
                                                                }
                                                            }}>Unlock Post</Button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => showToast('Likes coming soon!', 'info')}
                                                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                                                    <span>❤️</span> Like
                                                                </button>
                                                                <button
                                                                    onClick={() => showToast('Comments coming soon!', 'info')}
                                                                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                                                    <span>💬</span> Comment
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                    {!locked && post.content?.length > 250 && (
                                                        <Button variant="ghost" size="sm" onClick={() => toggleExpand(i)} className="text-primary">
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
                        <div className="p-10 bg-white rounded-3xl border border-gray-200">
                            <h3 className="text-h3 mb-6">About {displayName}</h3>
                            <p className="whitespace-pre-line text-lg leading-relaxed text-gray-600">
                                {creatorProfile?.description || "This creator hasn't written a bio yet."}
                            </p>
                        </div>
                    )}

                    {activeTab === 'membership' && (
                        <div className="flex flex-col gap-8">
                            <div className="text-center">
                                <h2 className="text-h2 mb-2">Choose your plan</h2>
                                <p className="text-gray-500">Unlock exclusive access and support {displayName}</p>
                            </div>

                            {creatorTiers.map((tier, i) => {
                                const isCurrentTier = i === memberTierId;
                                const isUpgrade = i > memberTierId && memberTierId !== -1;
                                const isDowngrade = i < memberTierId && memberTierId !== -1;
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
                                    <div key={i} className={`p-8 flex flex-col gap-6 rounded-3xl bg-white border shadow-sm hover:shadow-lg transition-all ${tier.recommended ? 'border-gray-900 ring-4 ring-black/5' : 'border-gray-200'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                                                <div className="text-3xl font-bold mt-2 text-gray-900">{formatPrice(tier.price)} <span className="text-base text-gray-500 font-medium">/ month</span></div>
                                            </div>
                                            {tier.recommended && <span className="bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider">RECOMMENDED</span>}
                                        </div>
                                        <div className="h-px bg-gray-100"></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">What's included:</p>
                                            <ul className="flex flex-col gap-3">
                                                <li className="flex gap-3 text-base text-gray-600 items-center">
                                                    <span className="bg-emerald-50 text-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                                                    Direct support to {displayName}
                                                </li>
                                                {tier.benefits?.map((b: string, idx: number) => (
                                                    <li key={idx} className="flex gap-3 text-base text-gray-600 items-center">
                                                        <span className="bg-emerald-50 text-emerald-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
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
                                            className="w-full justify-center py-4 text-lg"
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
                <aside className="hidden lg:block relative">
                    <div id="tiers-section" className="sticky top-[100px]">
                        <div className="p-8 bg-white border border-gray-200 rounded-3xl shadow-xl shadow-gray-200/50">
                            <h3 className="text-xl font-bold mb-6">Membership</h3>

                            <div className="flex flex-col gap-4">
                                {creatorTiers.map((tier, i) => (
                                    <div key={i} className={`p-5 rounded-2xl cursor-pointer transition-all border ${tier.recommended ? 'bg-gray-50 border-gray-900' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                        onClick={() => handleSubscribeClick(i)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="font-bold text-lg text-gray-900">{tier.name}</h4>
                                            {tier.recommended && <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">BEST</span>}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="font-bold text-xl text-gray-900">{formatPrice(tier.price)}</span>
                                            <span className="text-sm text-gray-500">/ month</span>
                                        </div>
                                    </div>
                                ))}

                                {creatorTiers.length === 0 && (
                                    <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">No public tiers available.</div>
                                )}
                            </div>

                            {/* Trust Microcopy */}
                            <div className="mt-6 pt-5 border-t border-gray-100 text-sm text-gray-500 flex flex-col gap-3">
                                <div className="flex items-center gap-2.5">
                                    <span className="bg-amber-100 text-amber-600 rounded-full w-6 h-6 flex items-center justify-center">⚡</span>
                                    <span>Instant access unlocked</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center">🛡️</span>
                                    <span>Secure payments on Mantle</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md p-4 border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40 flex justify-between items-center lg:hidden">
                <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wide">Membership</div>
                    <div className="font-bold text-gray-900 text-lg">From {creatorTiers[0] ? formatPrice(creatorTiers[0].price) : 'Free'}</div>
                </div>
                <Button size="lg" onClick={() => {
                    setActiveTab('membership');
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                }}>View Plans</Button>
            </div>

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
