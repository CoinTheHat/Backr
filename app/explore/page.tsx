'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteFooter from '../components/SiteFooter';
import { Rocket, Search, Music, Mic, Palette, Camera, Code, Utensils, Film, ChevronRight, ArrowRight, Users, Sparkles } from 'lucide-react';

/* ─── Pixabay / Picsum (Reliable & Free) ─── */
const img = (id: number, w = 800) => `https://picsum.photos/id/${id}/${w}/${Math.floor(w * 0.6)}`;
const avatar = (id: number) => `https://picsum.photos/id/${id}/200/200`;

const CATEGORIES = [
    { name: 'All', icon: <Sparkles size={16} />, color: '#8c2bee' },
    { name: 'Music', icon: <Music size={16} />, color: '#FF6B35' },
    { name: 'Podcasts', icon: <Mic size={16} />, color: '#0EA5E9' },
    { name: 'Art', icon: <Palette size={16} />, color: '#EC4899' },
    { name: 'Film', icon: <Film size={16} />, color: '#EF4444' },
    { name: 'Food', icon: <Utensils size={16} />, color: '#F59E0B' },
    { name: 'Tech', icon: <Code size={16} />, color: '#10B981' },
];

const FEATURED_CREATORS = [
    {
        name: 'Luna Nova',
        category: 'Music',
        members: '2.4K',
        tagline: 'Building an independent music empire with her fans.',
        cover: img(452, 1200),
        avatar: avatar(338),
        color: '#FF6B35',
    },
    {
        name: 'Kai Studios',
        category: 'Art',
        members: '8.1K',
        tagline: 'Turning digital art into a full-time career.',
        cover: img(314, 1200),
        avatar: avatar(64),
        color: '#8c2bee',
    },
    {
        name: 'The Culture Pod',
        category: 'Podcasts',
        members: '5.3K',
        tagline: 'Exploring culture, identity, and community.',
        cover: img(366, 1200),
        avatar: avatar(177),
        color: '#0EA5E9',
    },
];

const ALL_CREATORS = [
    { name: 'Aria Beats', category: 'Music', members: '2.4K', cover: img(158, 600), avatar: avatar(334), color: '#FF6B35' },
    { name: 'PixelForge', category: 'Art', members: '8.1K', cover: img(120, 600), avatar: avatar(338), color: '#8c2bee' },
    { name: 'The Void Pod', category: 'Podcasts', members: '1.8K', cover: img(338, 600), avatar: avatar(64), color: '#0EA5E9' },
    { name: 'CodeWithSara', category: 'Tech', members: '12K', cover: img(201, 600), avatar: avatar(177), color: '#10B981' },
    { name: 'Frame by Frame', category: 'Film', members: '3.7K', cover: img(193, 600), avatar: avatar(91), color: '#EF4444' },
    { name: 'Neon Kitchen', category: 'Food', members: '6.9K', cover: img(292, 600), avatar: avatar(100), color: '#F59E0B' },
    { name: 'Maya Moon', category: 'Art', members: '1.2K', cover: img(319, 600), avatar: avatar(129), color: '#EC4899' },
    { name: 'DJ Solace', category: 'Music', members: '850', cover: img(453, 600), avatar: avatar(237), color: '#FF6B35' },
    { name: 'DevStream', category: 'Tech', members: '4.5K', cover: img(370, 600), avatar: avatar(445), color: '#10B981' },
];

export default function Explore() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [activeFeatured, setActiveFeatured] = useState(0);

    // Auto-rotate featured
    useEffect(() => {
        const timer = setInterval(() => setActiveFeatured(p => (p + 1) % FEATURED_CREATORS.length), 4000);
        return () => clearInterval(timer);
    }, []);

    const filteredCreators = selectedCategory === 'All'
        ? ALL_CREATORS
        : ALL_CREATORS.filter(c => c.category === selectedCategory);

    const searchFiltered = searchQuery
        ? filteredCreators.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : filteredCreators;

    const featured = FEATURED_CREATORS[activeFeatured];

    return (
        <div className="min-h-screen bg-mist text-slate-900 font-sans">
            {/* ═══ NAVIGATION ═══ */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 md:px-10 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                        <Rocket size={18} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">Backr</span>
                </div>
                {/* Center Search (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <div className="relative w-full group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2.5 pl-11 pr-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-primary/30 focus:bg-white focus:shadow-lg focus:shadow-primary/5 outline-none transition-all placeholder:text-slate-400 text-sm"
                            placeholder="Search creators..."
                        />
                    </div>
                </div>
                <button onClick={() => router.push('/dashboard')} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all hover:-translate-y-0.5">
                    Get Started
                </button>
            </nav>

            <main>
                {/* ═══ FEATURED HERO ═══ */}
                <section className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-slate-900">
                    {FEATURED_CREATORS.map((fc, i) => (
                        <div key={i} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === activeFeatured ? 1 : 0 }}>
                            <img src={fc.cover} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                        </div>
                    ))}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 z-10">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white/90"
                                    style={{ backgroundColor: featured.color }}>
                                    {featured.category}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-4"
                                style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                                {featured.name}
                            </h1>
                            <p className="text-white/60 text-lg md:text-xl max-w-lg mb-8">{featured.tagline}</p>
                        </div>
                    </div>
                </section>

                {/* ═══ CATEGORIES ═══ */}
                <section className="sticky top-[62px] z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 md:px-10">
                    <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto py-4 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat.name
                                    ? 'text-white shadow-lg scale-105'
                                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                    }`}
                                style={selectedCategory === cat.name ? { backgroundColor: cat.color } : {}}
                            >
                                {cat.icon}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </section>

                {/* ═══ GRID ═══ */}
                <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchFiltered.map((creator, i) => (
                            <div key={i} className="group relative rounded-3xl overflow-hidden cursor-pointer bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                                <div className="relative h-52 overflow-hidden bg-slate-200">
                                    <img src={creator.cover} alt={creator.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute top-4 left-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white/90 backdrop-blur-sm"
                                            style={{ backgroundColor: `${creator.color}CC` }}>
                                            {creator.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 relative">
                                    <img src={creator.avatar} alt={creator.name}
                                        className="w-14 h-14 rounded-full border-4 border-white object-cover absolute -top-7 left-5 shadow-md bg-slate-200" />
                                    <div className="mt-6">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors"
                                            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}>
                                            {creator.name}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-slate-400 font-medium">
                                            <span className="flex items-center gap-1"><Users size={14} /> {creator.members}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <SiteFooter />
        </div>
    );
}
