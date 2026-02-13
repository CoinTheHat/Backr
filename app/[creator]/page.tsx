'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '../components/Toast';
import confetti from 'canvas-confetti';
import { formatPrice } from '@/utils/format';
import CheckoutModal from '../components/CheckoutModal';
import TipButton from '../components/TipButton';
import TipJar from '../components/TipJar';
import SupporterLeaderboard from '../components/SupporterLeaderboard';
import WalletButton from '../components/WalletButton';
import { useSend } from '../hooks/useSend';
import {
    ChevronLeft,
    Share,
    MoreHorizontal,
    Check,
    Lock,
    Heart,
    MessageCircle,
    Zap,
    Shield
} from 'lucide-react';

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    const { creator } = use(params);
    const creatorId = creator;

    const { user, authenticated } = usePrivy();
    const address = user?.wallet?.address;
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();

    // Tab State
    const [activeTab, setActiveTab] = useState<'posts' | 'membership' | 'about'>('posts');

    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [creatorTiers, setCreatorTiers] = useState<any[]>([]);
    const [creatorProfile, setCreatorProfile] = useState<any>(null);
    const [realMemberCount, setRealMemberCount] = useState(0);
    const [expandedPosts, setExpandedPosts] = useState<Record<number, boolean>>({});

    // Payment Hook
    const { send, txHash: paymentTxHash } = useSend();

    // Checkout State
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    // Fetch Data
    useEffect(() => {
        if (!creatorId) return;

        // Profile
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const found = creators.find((c: any) => c.address === creatorId);
                if (found) setCreatorProfile(found);
            });

        // Tiers
        fetch(`/api/tiers?address=${creatorId}`)
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setCreatorTiers(data); });

        // Posts
        fetch(`/api/posts?address=${creatorId}`)
            .then(res => res.json())
            .then(data => setPosts(data));

        // Stats
        fetch(`/api/stats?address=${creatorId}`)
            .then(res => res.json())
            .then(data => setRealMemberCount(data.activeMembers || 0));
    }, [creatorId]);

    // Membership Check
    const isSubscribed = false; // This was mock.
    const [activeSubscription, setActiveSubscription] = useState<any>(null);

    useEffect(() => {
        if (address && creatorId) {
            fetch(`/api/subscriptions?subscriber=${address}&creator=${creatorId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        // Find active one
                        const active = data.find((s: any) => new Date(s.expiresAt) > new Date());
                        if (active) setActiveSubscription(active);
                    }
                });
        }
    }, [address, creatorId, checkoutStatus]);

    const handleSubscribeClick = (tierIndex: number) => {
        setSelectedTierIndex(tierIndex);
        setCheckoutStatus('idle');
        setCheckoutModalOpen(true);
    };

    const handleConfirmSubscribe = async () => {
        if (selectedTierIndex === null) return;
        const tier = creatorTiers[selectedTierIndex];

        setCheckoutStatus('pending');

        try {
            // 1. Payment
            const txHash = await send(creatorId, tier.price.toString(), `Subscribe to ${tier.name}`);

            // 2. Save Subscription
            await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriberAddress: address,
                    creatorAddress: creatorId,
                    tierId: selectedTierIndex, // or tier.id
                    expiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
                    txHash
                })
            });

            // Success
            setCheckoutStatus('success');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch (err) {
            console.error(err);
            setCheckoutStatus('error');
        }
    };

    const canViewPost = (post: any) => {
        if (post.isPublic) return true;
        const viewer = address?.toLowerCase();
        const currentCreator = creatorId?.toLowerCase();
        // Creator themselves
        if (viewer === currentCreator) return true;

        // Subscription Check
        if (activeSubscription) return true;

        return false;
    };

    const toggleExpand = (index: number) => {
        setExpandedPosts(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const displayName = creatorProfile?.name || `Creator ${creatorId.substring(0, 4)}...`;
    const avatar = creatorProfile?.avatarUrl;
    const cover = creatorProfile?.coverUrl;

    return (
        <div className="min-h-screen bg-mist text-slate-900 font-sans pb-24 selection:bg-fuchsia-200">
            {ToastComponent}

            {/* HEADER */}
            <header className="relative h-[320px] md:h-[380px]">
                <div className="absolute inset-0">
                    {cover ? (
                        <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-fuchsia-100"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-mist via-transparent to-transparent"></div>
                </div>

                {/* Top Controls */}
                <div className="absolute top-6 inset-x-0 px-6 flex justify-between items-center z-10">
                    <button onClick={() => router.push('/')} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-slate-900 hover:bg-white/40 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-2">
                        <div className="hidden sm:block"><WalletButton /></div>
                        <button onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            showToast('Link copied!', 'success');
                        }} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-slate-900 hover:bg-white/40 transition-colors">
                            <Share size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* PROFILE INFO */}
            <div className="relative px-6 -mt-20 text-center z-20 max-w-2xl mx-auto">
                <div className="relative inline-block">
                    <div className="w-36 h-36 rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-white">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                <span className="text-4xl">?</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-2 right-2 bg-primary text-white p-1.5 rounded-full border-4 border-white shadow-sm">
                        <Check size={14} strokeWidth={4} />
                    </div>
                </div>

                <h1 className="font-serif text-4xl mt-4 font-bold text-slate-900 tracking-tight">{displayName}</h1>
                <p className="text-slate-500 font-medium mt-2 text-lg">{creatorProfile?.description || "Digital Creator"}</p>

                {/* Stats Row */}
                <div className="flex items-center justify-center gap-12 mt-8 pb-8 border-b border-slate-200">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-900">{realMemberCount}</span>
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Followers</span>
                    </div>
                    <div className="w-px h-10 bg-slate-200"></div>
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-900">{posts.length}</span>
                        <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">Posts</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

                {/* Left Column */}
                <div>
                    {/* TABS */}
                    <div className="flex justify-center lg:justify-start gap-2 mb-8 bg-white/50 p-1.5 rounded-full inline-flex backdrop-blur-sm border border-white/50">
                        {['posts', 'membership', 'about'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${activeTab === tab
                                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* POSTS TAB */}
                    {activeTab === 'posts' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="font-serif text-2xl font-bold text-slate-900">Recent Posts</h2>
                                <button className="text-primary font-bold text-sm hover:underline">View all</button>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <p className="text-slate-400">No posts yet.</p>
                                </div>
                            ) : (
                                posts.map((post, i) => {
                                    const locked = !canViewPost(post);

                                    return (
                                        <article key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                            {/* Header */}
                                            <div className="p-6 flex items-center gap-4">
                                                <img src={avatar || "https://via.placeholder.com/40"} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{displayName}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                                                        {new Date(post.createdAt).toLocaleDateString()} {locked && "• Members Only"}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Media / Content */}
                                            {post.image ? (
                                                <div className="aspect-square sm:aspect-video w-full relative bg-slate-100">
                                                    <img src={post.image} alt="Post" className={`w-full h-full object-cover ${locked ? 'blur-xl opacity-50' : ''}`} />
                                                    {locked && (
                                                        <div className="absolute inset-0 flex items-center justify-center p-8">
                                                            <div className="bg-white/80 backdrop-blur-md border border-white/50 w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl">
                                                                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                                                                    <Lock size={28} />
                                                                </div>
                                                                <h3 className="font-serif text-xl font-bold text-slate-900 mb-2">Locked Content</h3>
                                                                <p className="text-sm text-slate-500 mb-6">Join the membership to unlock this post.</p>
                                                                <button onClick={() => setActiveTab('membership')} className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold text-sm w-full hover:scale-105 transition-transform">
                                                                    View Plans
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null}

                                            {/* Text Content */}
                                            <div className="p-6">
                                                <h3 className="font-bold text-xl text-slate-900 mb-2">{post.title}</h3>
                                                <p className={`text-slate-600 leading-relaxed ${locked ? 'blur-sm select-none' : ''}`}>
                                                    {locked
                                                        ? "This is a preview of the content suitable only for members. Join now to read the full story and access exclusive updates."
                                                        : (expandedPosts[i] || !post.content || post.content.length < 200 ? post.content : post.content.substring(0, 200) + '...')}
                                                </p>
                                                {!locked && post.content && post.content.length >= 200 && (
                                                    <button onClick={() => toggleExpand(i)} className="text-primary text-sm font-bold mt-2">
                                                        {expandedPosts[i] ? 'Read Less' : 'Read More'}
                                                    </button>
                                                )}

                                                {/* Actions */}
                                                <div className="mt-6 flex items-center gap-6 pt-6 border-t border-slate-50">
                                                    <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group">
                                                        <Heart size={20} className="group-hover:fill-current" />
                                                        <span className="text-xs font-bold">1.2k</span>
                                                    </button>
                                                    <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                                                        <MessageCircle size={20} />
                                                        <span className="text-xs font-bold">45</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* MEMBERSHIP TAB */}
                    {activeTab === 'membership' && (
                        <div className="space-y-8">
                            <div className="text-center max-w-lg mx-auto mb-10">
                                <h2 className="font-serif text-3xl font-bold text-slate-900 mb-3">Support {displayName}</h2>
                                <p className="text-slate-500">Choose a membership level to unlock exclusive content and join the community.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {creatorTiers.map((tier, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] p-8 shadow-xl shadow-primary/5 border border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all">
                                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 relative">
                                            <div>
                                                <h3 className="font-serif text-2xl font-bold text-slate-900">{tier.name}</h3>
                                                <p className="text-slate-500 font-medium mt-1">Monthly Support</p>
                                            </div>
                                            <div className="bg-mist border border-slate-100 px-4 py-2 rounded-xl text-primary font-bold text-xl">
                                                {formatPrice(tier.price)}<span className="text-sm text-slate-400 font-normal">/mo</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-4 mb-8 relative">
                                            <li className="flex items-center gap-3 text-slate-700 font-medium">
                                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                                <span>Directly support {displayName}</span>
                                            </li>
                                            {tier.benefits?.map((b: string, idx: number) => (
                                                <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribeClick(i)}
                                            className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-fuchsia-accent text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                        >
                                            Join {tier.name}
                                        </button>
                                    </div>
                                ))}
                                {creatorTiers.length === 0 && (
                                    <div className="text-center p-8 bg-slate-50 rounded-3xl text-slate-400">No public tiers available yet.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ABOUT TAB */}
                    {activeTab === 'about' && (
                        <div className="bg-white rounded-[2rem] p-10 border border-slate-100">
                            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">About {displayName}</h3>
                            <div className="prose prose-slate lg:prose-lg">
                                <p className="leading-relaxed text-slate-600">
                                    {creatorProfile?.description || "This creator hasn't added a bio yet."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Sticky Sidebar */}
                <aside className="hidden lg:block space-y-8">
                    {/* Tip Jar */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
                        <TipJar receiverAddress={creatorId} />
                    </div>

                    {/* Leaderboard */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <SupporterLeaderboard creatorAddress={creatorId} />
                    </div>
                </aside>
            </main>

            <CheckoutModal
                isOpen={checkoutModalOpen}
                onClose={() => setCheckoutModalOpen(false)}
                onConfirm={handleConfirmSubscribe}
                tier={selectedTierIndex !== null ? creatorTiers[selectedTierIndex] : null}
                status={checkoutStatus}
                txHash={paymentTxHash || undefined}
            />
        </div>
    );
}
