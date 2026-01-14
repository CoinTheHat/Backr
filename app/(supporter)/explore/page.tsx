'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '../../components/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import EmptyState from '../../components/EmptyState';
import { supabase } from '@/utils/supabase';

function ExploreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    const categoryId = searchParams.get('cat') || 'All';
    const hashtag = searchParams.get('tag') || '';

    const [creators, setCreators] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [trendingTags, setTrendingTags] = useState<any[]>([]);
    const [assignments, setAssignments] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('Trending');

    // Fetch Initial Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Parallel fetching for speed
                const [creatorsRes, catRes, tagRes, assignRes] = await Promise.all([
                    fetch('/api/creators').then(r => r.json()),
                    fetch('/api/taxonomy/categories').then(r => r.json()),
                    fetch('/api/taxonomy/hashtags').then(r => r.json()),
                    supabase.from('creatorTaxonomy').select('*') // Direct fetch for assignments for filtering
                ]);

                if (Array.isArray(creatorsRes)) setCreators(creatorsRes);

                // Fallback for categories if DB is empty
                if (Array.isArray(catRes) && catRes.length > 0) {
                    setCategories(catRes);
                } else {
                    setCategories([
                        { id: 'art', name: 'Art', icon: '🎨' },
                        { id: 'gaming', name: 'Gaming', icon: '🎮' },
                        { id: 'music', name: 'Music', icon: '🎵' },
                        { id: 'tech', name: 'Tech', icon: '💻' },
                        { id: 'podcast', name: 'Podcast', icon: '🎙️' }
                    ]);
                }

                if (Array.isArray(tagRes)) setTrendingTags(tagRes.filter((t: any) => t.isTrending));
                if (assignRes.data) setAssignments(assignRes.data);

            } catch (e) {
                console.error("Explore fetch error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter Logic
    const filteredCreators = creators.filter(c => {
        const assignment = assignments.find(a => a.creatorAddress === c.address);

        // 1. Search Query
        const matchesQuery = !query ||
            c.name?.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query) ||
            c.address?.toLowerCase().includes(query) ||
            (assignment?.hashtagIds?.some((tagId: string) => {
                const tag = trendingTags.find(t => t.id === tagId); // Inefficient lookup but acceptable for small datasets
                return tag?.label.toLowerCase().includes(query);
            }));

        // 2. Category Filter
        const matchesCategory = categoryId === 'All' ||
            (assignment?.categoryIds?.includes(categoryId));

        // 3. Hashtag Filter (from URL param)
        const matchesTag = !hashtag ||
            (assignment?.hashtagIds?.includes(hashtag));

        return matchesQuery && matchesCategory && matchesTag;
    });

    const sortedCreators = [...filteredCreators].sort((a, b) => {
        if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0; // Random/Trending
    });

    return (
        <div className="min-h-screen bg-brand-light pb-20">
            {/* HERO SECTION */}
            <div className="bg-gradient-to-r from-brand-secondary/10 to-brand-primary/10 pt-12 pb-16 border-b border-brand-secondary/10 -mb-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark mb-6 leading-tight">
                        Discover <span className="text-brand-secondary">creators</span> & communities.
                    </h1>

                    <div className="relative max-w-xl mx-auto mb-6">
                        <input
                            type="text"
                            placeholder="Search creators, tags, content..."
                            defaultValue={query}
                            className="w-full pl-12 pr-6 py-4 rounded-full border border-brand-secondary/20 shadow-studio focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 text-brand-dark placeholder-brand-muted transition-all"
                            onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/explore?q=${e.currentTarget.value}`) }}
                        />
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl opacity-50">🔍</span>
                    </div>

                    {/* Trending Tags */}
                    <div className="flex justify-center gap-2 flex-wrap items-center">
                        <span className="text-sm text-brand-muted font-bold">Trending:</span>
                        {trendingTags.length > 0 ? trendingTags.map(tag => (
                            <button
                                key={tag.id}
                                className="px-3 py-1 bg-white/60 border border-white/50 rounded-full text-sm text-brand-secondary font-medium hover:bg-white hover:text-brand-primary transition-all hover:scale-105"
                                onClick={() => router.push(`/explore?tag=${tag.id}`)}
                            >
                                #{tag.label}
                            </button>
                        )) : (
                            <span className="text-brand-muted text-sm italic">Loading tags...</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                {/* FILTER TOOLBAR */}
                <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
                        <button
                            onClick={() => router.push('/explore')}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap ${categoryId === 'All'
                                ? 'bg-brand-dark text-white border-brand-dark'
                                : 'bg-white text-brand-muted border-gray-200 hover:border-brand-primary hover:text-brand-primary'
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id} onClick={() => router.push(`/explore?cat=${cat.id}`)}
                                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${categoryId === cat.id
                                    ? 'bg-brand-dark text-white border-brand-dark'
                                    : 'bg-white text-brand-muted border-gray-200 hover:border-brand-primary hover:text-brand-primary'
                                    }`}
                            >
                                {cat.icon && <span>{cat.icon}</span>} {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3 ml-auto">
                        <select
                            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:border-brand-primary cursor-pointer"
                        >
                            <option>Trending</option>
                            <option>Newest</option>
                            <option>Most Backed</option>
                        </select>
                    </div>
                </div>

                {/* RESULTS GRID */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-studio overflow-hidden h-96 shadow-sm">
                                <LoadingSkeleton height="120px" borderRadius={0} />
                                <div className="p-6 flex flex-col items-center -mt-10 relative">
                                    <LoadingSkeleton variant="circle" width="80px" height="80px" style={{ border: '4px solid #fff' }} />
                                    <LoadingSkeleton variant="text" width="60%" height="24px" style={{ marginTop: '12px' }} />
                                    <LoadingSkeleton variant="text" width="80%" height="16px" style={{ marginTop: '8px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCreators.length === 0 ? (
                    <EmptyState
                        title="No creators found"
                        description={`We couldn't find any match for your filters. Try clearing them.`}
                        actionLabel="Clear Filters"
                        onAction={() => router.push('/explore')}
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            {sortedCreators.map((creator, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-studio overflow-hidden shadow-studio hover:shadow-xl transition-all cursor-pointer group flex flex-col hover:-translate-y-1"
                                    onClick={() => router.push(`/${creator.address}`)}
                                >
                                    {/* Cover */}
                                    <div
                                        className="h-32 bg-cover bg-center bg-gray-100"
                                        style={{ backgroundImage: creator.coverUrl ? `url(${creator.coverUrl})` : `linear-gradient(135deg, var(--color-brand-blue), var(--color-brand-primary))` }}
                                    ></div>

                                    {/* Content */}
                                    <div className="px-6 pb-8 flex flex-col items-center text-center flex-1">
                                        {/* Avatar */}
                                        <div className="w-20 h-20 -mt-10 rounded-full border-4 border-white bg-white shadow-sm flex items-center justify-center text-3xl overflow-hidden z-10">
                                            {creator.avatarUrl ? (
                                                <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{creator.name?.[0] || '👤'}</span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold mt-4 mb-1 text-brand-dark group-hover:text-brand-primary transition-colors">{creator.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                                            {creator.description || 'Digital creator building on Mantle.'}
                                        </p>

                                        {/* Stats - using real data or hiding */}
                                        {(creator.backrCount !== undefined || creator.postCount !== undefined) && (
                                            <div className="flex gap-6 mb-6 w-full justify-center">
                                                {creator.backrCount !== undefined && (
                                                    <div className="text-center">
                                                        <div className="font-bold text-gray-900">{creator.backrCount}</div>
                                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Backrs</div>
                                                    </div>
                                                )}
                                                {creator.backrCount !== undefined && creator.postCount !== undefined && (
                                                    <div className="w-px bg-gray-200 h-full"></div>
                                                )}
                                                {creator.postCount !== undefined && (
                                                    <div className="text-center">
                                                        <div className="font-bold text-gray-900">{creator.postCount}</div>
                                                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Posts</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-auto w-full">
                                            <Button variant="primary" className="w-full justify-center rounded-xl py-3 font-semibold shadow-md shadow-brand-primary/20">View Page</Button>
                                            {/* Hide 'Tiers from' if not available or replace with dynamic if we had it. Hiding for now to avoid fake data. */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* New on Backr Section - Dynamically populated or Hidden */}
                        {sortedCreators.length > 0 && (
                            <div className="border-t border-gray-200 pt-12 flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold font-serif text-brand-dark">New on Backr</h2>
                                    <Button variant="ghost" size="sm" onClick={() => router.push('/explore?sort=Newest')}>View All</Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {sortedCreators.slice(0, 3).map((creator) => (
                                        <div key={creator.address} onClick={() => router.push(`/${creator.address}`)} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-primary/30 transition-colors shadow-sm cursor-pointer">
                                            <div className="w-12 h-12 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                                                {creator.avatarUrl ? (
                                                    <img src={creator.avatarUrl} alt={creator.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">{creator.name?.[0] || '👤'}</span>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-gray-900 truncate">{creator.name}</div>
                                                <div className="text-xs text-brand-secondary">Joined recently</div>
                                            </div>
                                            <Button size="sm" variant="secondary" className="ml-auto rounded-lg">View</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="p-20 text-center text-brand-muted">Loading...</div>}>
            <ExploreContent />
        </Suspense>
    );
}
