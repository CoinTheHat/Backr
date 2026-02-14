'use client';

import { use, useState, useEffect, useRef } from 'react';
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
    Shield,
    Rocket,
    Menu,
    X,
    Search,
    LogOut,
    LayoutDashboard,
    User,
    Loader2
} from 'lucide-react';

export default function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
    const { creator } = use(params);
    const creatorId = creator;

    const { user, authenticated, logout } = usePrivy();
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
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [activeSubscription, setActiveSubscription] = useState<any>(null);

    // Navbar State (same as home page)
    const [scrolled, setScrolled] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Payment Hooks
    const { send, txHash: paymentTxHash } = useSend();

    // Checkout State
    const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [selectedTierIndex, setSelectedTierIndex] = useState<number | null>(null);
    const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

    // Fetch Data
    useEffect(() => {
        if (!creatorId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Creator Profile
                const resCreators = await fetch('/api/creators');
                const creators = await resCreators.json();

                // Find by address OR username
                const found = creators.find((c: any) =>
                    c.address.toLowerCase() === creatorId.toLowerCase() ||
                    (c.username && c.username.toLowerCase() === creatorId.toLowerCase())
                );

                if (found) {
                    setCreatorProfile(found);
                    const realAddress = found.address;

                    // 2. Fetch Tiers using REAL address
                    fetch(`/api/tiers?creator=${realAddress}`)
                        .then(res => res.json())
                        .then(data => { if (Array.isArray(data)) setCreatorTiers(data); });

                    // 3. Fetch Posts using REAL address
                    fetch(`/api/posts?address=${realAddress}`)
                        .then(res => res.json())
                        .then(data => setPosts(data));

                    // 4. Fetch Stats using REAL address
                    fetch(`/api/stats?address=${realAddress}`)
                        .then(res => res.json())
                        .then(data => setRealMemberCount(data.activeMembers || 0));

                    // 5. Check Subscription
                    if (address) {
                        fetch(`/api/subscriptions?subscriber=${address}&creator=${realAddress}`)
                            .then(res => res.json())
                            .then(data => {
                                if (data && data.length > 0) {
                                    const active = data.find((s: any) => new Date(s.expiresAt) > new Date());
                                    if (active) setActiveSubscription(active);
                                }
                            });
                    }
                }
            } catch (error) {
                console.error("Error loading creator data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [creatorId, address, checkoutStatus]);

    // Navbar: Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch user profile (same as home page)
    useEffect(() => {
        if (address) {
            fetch('/api/creators')
                .then(res => res.json())
                .then(creators => {
                    const found = creators.find((c: any) => c.address === address);
                    if (found) setProfile(found);
                }).catch(() => { });
        }
    }, [address]);

    // Close menus on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleSubscribeClick = (tierIndex: number) => {
        setSelectedTierIndex(tierIndex);
        setCheckoutStatus('idle');
        setCheckoutModalOpen(true);
    };

    const handleConfirmSubscribe = async () => {
        if (selectedTierIndex === null) return;
        const tier = creatorTiers[selectedTierIndex];
        const targetAddress = creatorProfile?.address || creatorId;

        setCheckoutStatus('pending');

        try {
            // Direct payment to creator (No contract deployment needed)
            // This enables immediate monetization for all creators
            const txHash = await send(
                targetAddress,
                tier.price.toString(),
                `Subscribe to ${tier.name}`
            );

            if (!txHash) throw new Error("Transaction failed");

            // Save subscription to database
            await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriberAddress: address,
                    creatorAddress: targetAddress,
                    tierId: tier.id,
                    expiry: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
                    txHash
                })
            });

            // Success
            setCheckoutStatus('success');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

            // Refresh logic if needed
            if (address) {
                fetch(`/api/subscriptions?subscriber=${address}&creator=${targetAddress}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const active = data.find((s: any) => new Date(s.expiresAt) > new Date());
                            if (active) setActiveSubscription(active);
                        }
                    });
            }

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

    // Navbar functions (same as home page)
    const userDisplayName = profile?.name || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '');

    const handleLogout = async () => {
        setUserMenuOpen(false);
        await logout();
    };

    // Search functionality
    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/creators?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCreatorClick = (creator: any) => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        // Navigate to creator page using username or address
        const slug = creator.username || creator.address;
        router.push(`/${slug}`);
    };

    const displayName = creatorProfile?.name || `Creator ${creatorId.substring(0, 4)}...`;
    const avatar = creatorProfile?.avatarUrl || creatorProfile?.profileImage;
    const cover = creatorProfile?.coverImage || creatorProfile?.coverUrl;

    return (
        <div className="min-h-screen bg-mist text-slate-900 font-sans pb-24 selection:bg-fuchsia-200">
            {ToastComponent}

            {/* ═══ NAVIGATION ═══ */}
            <nav className={`fixed top-0 inset-x-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-500 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm' : ''}`}>
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <Rocket size={18} />
                    </div>
                    <span className={`text-xl font-bold tracking-tight transition-colors duration-500 ${scrolled ? 'text-slate-900' : 'text-white'}`}>Backr</span>
                </div>
                <div className={`hidden md:flex items-center gap-8 transition-colors duration-500 ${scrolled ? 'text-slate-600' : 'text-white/80'}`}>
                    <div className="relative" ref={searchRef}>
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:-translate-y-0.5 ${scrolled ? 'bg-slate-100 text-slate-900' : 'bg-white/15 backdrop-blur-md text-white border border-white/20'}`}
                        >
                            <Search size={16} />
                        </button>
                        {searchOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-2 z-50 animate-fade-in-up">
                                <input
                                    type="text"
                                    placeholder="Search creators..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    autoFocus
                                />
                                {searchQuery.length >= 2 && (
                                    <div className="mt-2 border-t border-slate-100 pt-2">
                                        {isSearching ? (
                                            <div className="flex items-center justify-center py-4 text-slate-500">
                                                <Loader2 size={20} className="animate-spin" />
                                            </div>
                                        ) : searchResults.length > 0 ? (
                                            searchResults.map((creator: any) => (
                                                <button
                                                    key={creator.address}
                                                    onClick={() => handleCreatorClick(creator)}
                                                    className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-slate-50 rounded-xl transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                                        {creator.profileImage || creator.avatarUrl ? (
                                                            <img src={creator.profileImage || creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={18} />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-900 text-sm truncate">{creator.name}</p>
                                                        {creator.username && (
                                                            <p className="text-xs text-slate-500 truncate">@{creator.username}</p>
                                                        )}
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center text-slate-500 text-sm">
                                                No creators found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button onClick={() => router.push('/explore')} className="font-medium hover:opacity-100 opacity-80 transition-opacity">Explore</button>
                    <button onClick={() => router.push('/dashboard')} className="font-medium hover:opacity-100 opacity-80 transition-opacity">Creators</button>
                    {authenticated ? (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 ${scrolled ? 'bg-slate-100 text-slate-900 border border-slate-200' : 'bg-white/15 backdrop-blur-md text-white border border-white/20'}`}
                            >
                                <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                    {(profile?.avatarUrl || profile?.profileImage) ? (
                                        <img src={profile.avatarUrl || profile.profileImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={12} className={scrolled ? 'text-slate-600' : 'text-white'} />
                                    )}
                                </div>
                                <span className="pr-0.5">{userDisplayName}</span>
                            </button>
                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden py-2 z-50 animate-fade-in-up">
                                    <button
                                        onClick={() => { setUserMenuOpen(false); router.push('/dashboard'); }}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <LayoutDashboard size={16} className="text-slate-400" />
                                        Creator Studio
                                    </button>
                                    <div className="h-px bg-slate-100 mx-3" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Çıkış Yap
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button onClick={() => router.push('/dashboard')} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all hover:-translate-y-0.5 ${scrolled ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
                            Get Started
                        </button>
                    )}
                </div>
                <button className={`md:hidden transition-colors ${scrolled ? 'text-slate-700' : 'text-white'}`} onClick={() => setShowMobileMenu(true)}>
                    <Menu size={28} />
                </button>
            </nav>

            {/* ═══ MOBILE MENU OVERLAY ═══ */}
            {showMobileMenu && (
                <div className="fixed inset-0 z-[60] bg-white animate-fade-in">
                    <div className="flex flex-col h-full">
                        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                    <Rocket size={18} />
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900">Backr</span>
                            </div>
                            <button onClick={() => setShowMobileMenu(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-900">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                            <button onClick={() => { router.push('/explore'); setShowMobileMenu(false); }} className="p-4 text-lg font-bold text-left hover:bg-slate-50 rounded-2xl transition-colors">
                                Explore Creators
                            </button>
                            <button onClick={() => { router.push('/dashboard'); setShowMobileMenu(false); }} className="p-4 text-lg font-bold text-left hover:bg-slate-50 rounded-2xl transition-colors">
                                Creator Studio
                            </button>
                            <div className="h-px bg-slate-100 my-2" />
                            {authenticated ? (
                                <>
                                    <button onClick={() => { router.push('/dashboard'); setShowMobileMenu(false); }} className="flex items-center gap-3 p-4 w-full text-left hover:bg-slate-50 rounded-2xl transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
                                            {(profile?.avatarUrl || profile?.profileImage) ? (
                                                <img src={profile.avatarUrl || profile.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{userDisplayName}</p>
                                            <p className="text-xs text-slate-500 font-medium">Logged in</p>
                                        </div>
                                    </button>
                                    <button onClick={() => { router.push('/dashboard/settings'); setShowMobileMenu(false); }} className="p-4 text-lg font-medium text-left hover:bg-slate-50 rounded-2xl transition-colors text-slate-600">
                                        Settings
                                    </button>
                                    <button onClick={() => { handleLogout(); setShowMobileMenu(false); }} className="p-4 text-lg font-bold text-left hover:bg-rose-50 rounded-2xl transition-colors text-rose-500 flex items-center gap-2">
                                        <LogOut size={20} />
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => { router.push('/dashboard'); setShowMobileMenu(false); }} className="mt-4 w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-lg shadow-xl shadow-slate-200/50">
                                    Get Started
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER COVER IMAGE */}
            <header className="relative h-[280px] md:h-[340px]">
                <div className="absolute inset-0">
                    {cover ? (
                        <img src={cover} alt="Cover" className="w-full h-full object-cover object-center" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-fuchsia-100"></div>
                    )}
                    {/* Bottom gradient only for profile info blending */}
                    <div className="absolute inset-0 bg-gradient-to-t from-mist via-transparent to-transparent"></div>
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
                <div className="flex items-center justify-center gap-6 sm:gap-12 mt-8 pb-8 border-b border-slate-200">
                    <div className="text-center">
                        <span className="block text-xl sm:text-2xl font-bold text-slate-900">{realMemberCount}</span>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-bold">Followers</span>
                    </div>
                    <div className="w-px h-8 sm:h-10 bg-slate-200"></div>
                    <div className="text-center">
                        <span className="block text-xl sm:text-2xl font-bold text-slate-900">{posts.length}</span>
                        <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-bold">Posts</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

                {/* Left Column */}
                <div>
                    {/* TABS */}
                    <div className="flex justify-center lg:justify-start gap-2 mb-8 bg-white/50 p-1.5 rounded-full inline-flex backdrop-blur-sm border border-white/50 w-full overflow-x-auto">
                        {['posts', 'membership', 'about'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab
                                    ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50'
                                    : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* POSTS TAB */}
                    {
                        activeTab === 'posts' && (
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
                        )
                    }

                    {/* MEMBERSHIP TAB */}
                    {
                        activeTab === 'membership' && (
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

                                            {activeSubscription?.tierId === tier.id ? (
                                                <button
                                                    disabled
                                                    className="w-full py-4 rounded-full bg-emerald-100 text-emerald-600 font-bold text-lg cursor-not-allowed flex items-center justify-center gap-2"
                                                >
                                                    <Check size={20} />
                                                    Current Plan
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSubscribeClick(i)}
                                                    className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-fuchsia-accent text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                                >
                                                    Join {tier.name}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {creatorTiers.length === 0 && (
                                        <div className="text-center p-8 bg-slate-50 rounded-3xl text-slate-400">No public tiers available yet.</div>
                                    )}
                                </div>
                            </div>
                        )
                    }

                    {/* ABOUT TAB */}
                    {
                        activeTab === 'about' && (
                            <div className="bg-white rounded-[2rem] p-10 border border-slate-100">
                                <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">About {displayName}</h3>
                                <div className="prose prose-slate lg:prose-lg">
                                    <p className="leading-relaxed text-slate-600">
                                        {creatorProfile?.description || "This creator hasn't added a bio yet."}
                                    </p>
                                </div>
                            </div>
                        )
                    }
                </div>

                {/* Right Column: Sticky Sidebar (Desktop) */}
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

                {/* Mobile: Bottom Tip Jar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 z-50 shadow-2xl">
                    <TipJar receiverAddress={creatorId} />
                </div>
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
