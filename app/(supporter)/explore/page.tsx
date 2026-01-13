'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '../../components/Button';
import Card from '../../components/Card';

function ExploreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const query = searchParams.get('q')?.toLowerCase() || '';
    const category = searchParams.get('cat') || '';

    const [creators, setCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('Trending');

    const categories = ['All', 'Podcasters', 'Video Creators', 'Musicians', 'Visual Artists', 'Writers', 'Gaming', 'Education'];
    const sortOptions = ['Trending', 'Newest', 'Most Backed', 'Price: Low to High'];

    useEffect(() => {
        fetch('/api/creators')
            .then(res => res.json())
            .then(data => {
                setCreators(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredCreators = creators.filter(c => {
        const matchesQuery = !query ||
            c.name?.toLowerCase().includes(query) ||
            c.description?.toLowerCase().includes(query) ||
            c.address?.toLowerCase().includes(query);

        const matchesCategory = !category || category === 'All';
        return matchesQuery && matchesCategory;
    });

    // Mock Sort Logic
    const sortedCreators = [...filteredCreators].sort((a, b) => {
        if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === 'Most Backed') return (b.supporterCount || 0) - (a.supporterCount || 0);
        return 0; // Random/Trending
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .headline-serif { font-family: var(--font-serif); }
                .explore-grid { 
                    display: grid; 
                    grid-template-columns: 1fr; 
                    gap: 32px; 
                }
                @media (min-width: 640px) { .explore-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .explore-grid { grid-template-columns: repeat(3, 1fr); } }
                
                .filter-btn {
                    padding: 8px 16px; border-radius: 99px; border: 1px solid var(--color-border);
                    background: #fff; cursor: pointer; display: flex; align-items: center; gap: 8px;
                    transition: all 0.2s; font-size: 0.9rem; font-weight: 500;
                }
                .filter-btn:hover { border-color: var(--color-brand-blue); color: var(--color-brand-blue); }
                .filter-active { background: var(--color-brand-blue); color: #fff; border-color: var(--color-brand-blue); }
            `}} />

            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '60px 0 80px',
                borderBottom: '1px solid var(--color-border)'
            }}>
                <div className="page-container" style={{ textAlign: 'center' }}>
                    <h1 className="headline-serif" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '16px' }}>
                        Find your next <span style={{ color: 'var(--color-brand-blue)', fontStyle: 'italic' }}>obsession</span>
                    </h1>
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                        Support independent creators building the future on Mantle.
                    </p>
                </div>
            </div>

            <div className="page-container" style={{ marginTop: '-40px', paddingBottom: '80px', position: 'relative', zIndex: 5 }}>

                {/* Search Bar */}
                <div style={{ maxWidth: '600px', margin: '0 auto 40px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search for creators, tags, or content..."
                        defaultValue={query}
                        className="focus-ring"
                        onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/explore?q=${e.currentTarget.value}`) }}
                        style={{
                            width: '100%', padding: '16px 24px 16px 50px', borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-lg)', fontSize: '1rem'
                        }}
                    />
                    <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', opacity: 0.5 }}>🔍</span>
                </div>

                {/* Filters Row */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                    marginBottom: '40px', boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%', scrollbarWidth: 'none' }}>
                        {categories.map(cat => (
                            <button
                                key={cat} onClick={() => router.push(cat === 'All' ? '/explore' : `/explore?cat=${cat}`)}
                                className={`filter-btn ${(!category && cat === 'All') || category === cat ? 'filter-active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select
                            value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)',
                                cursor: 'pointer', outline: 'none'
                            }}
                        >
                            {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>

                        <button
                            className={`filter-btn ${showFilters ? 'filter-active' : ''}`}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            ⚙️ Filters
                        </button>
                    </div>
                </div>

                {/* Expanded Filters Panel (Mock) */}
                {showFilters && (
                    <div style={{
                        padding: '24px', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
                        marginBottom: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px'
                    }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Monthly Price</label>
                            <input type="range" min="0" max="100" style={{ width: '100%' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                                <span>Free</span><span>$100+</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Language</label>
                            <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                <option>Any</option><option>English</option><option>Español</option><option>Français</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Options</label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="checkbox" /> Verified Only
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input type="checkbox" /> Has Free Tier
                            </label>
                        </div>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="explore-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card-surface" style={{ height: '420px' }}>
                                <div className="skeleton" style={{ height: '140px' }} />
                                <div style={{ padding: '24px' }}>
                                    <div className="skeleton skeleton-avatar" style={{ marginTop: '-48px', border: '4px solid #fff' }} />
                                    <div className="skeleton skeleton-text" style={{ marginTop: '16px', width: '60%' }} />
                                    <div className="skeleton skeleton-text" style={{ width: '40%' }} />
                                    <div className="skeleton skeleton-rect" style={{ marginTop: '24px', height: '60px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedCreators.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                        <h3>No creators found</h3>
                        <p>Try adjusting your search or filters.</p>
                        <Button variant="outline" onClick={() => router.push('/explore')} style={{ marginTop: '16px' }}>Clear Filters</Button>
                    </div>
                ) : (
                    <div className="explore-grid">
                        {sortedCreators.map((creator, i) => (
                            <div
                                key={i}
                                className="card-surface hover-lift"
                                onClick={() => router.push(`/${creator.address}`)}
                                style={{
                                    padding: 0, overflow: 'hidden', cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column'
                                }}
                            >
                                <div style={{ height: '140px', background: creator.coverUrl ? `url(${creator.coverUrl}) center/cover` : `linear-gradient(120deg, #${Math.floor(Math.random() * 16777215).toString(16)} 0%, #eee 100%)` }}></div>

                                <div style={{ padding: '0 24px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ marginTop: '-40px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%', background: '#fff', padding: '4px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}>
                                            <div style={{
                                                width: '100%', height: '100%', borderRadius: '50%',
                                                background: creator.avatarUrl ? `url(${creator.avatarUrl}) center/cover` : `#ddd`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
                                            }}>
                                                {!creator.avatarUrl && (creator.name?.[0] || '👤')}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>{creator.name || 'Anonymous'}</h3>
                                    <p className="text-body-sm" style={{ marginBottom: '16px', lineHeight: 1.5, flex: 1 }}>
                                        {creator.description ? (creator.description.length > 80 ? creator.description.slice(0, 80) + '...' : creator.description) : 'No description provided.'}
                                    </p>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: '16px', padding: '16px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: '16px' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{Math.floor(Math.random() * 1000)}</div>
                                            <div className="text-caption">Backrs</div>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{Math.floor(Math.random() * 50)}</div>
                                            <div className="text-caption">Posts</div>
                                        </div>
                                    </div>

                                    {/* Post Previews (Mock Content) */}
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                        {[1, 2].map(p => (
                                            <div key={p} style={{
                                                flex: 1, height: '60px', borderRadius: '8px', background: '#f3f4f6',
                                                position: 'relative', overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    width: '100%', height: '100%', background: `linear-gradient(45deg, #e5e7eb, #d1d5db)`,
                                                    filter: 'blur(4px)', opacity: 0.7
                                                }}></div>
                                                <div style={{
                                                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: 'rgba(0,0,0,0.05)'
                                                }}>
                                                    <span style={{ fontSize: '12px' }}>🔒</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="text-caption" style={{ background: 'var(--color-bg-page)', padding: '4px 8px', borderRadius: '4px' }}>
                                            Tiers from $5
                                        </div>
                                        <Button size="sm" variant="outline" style={{ borderColor: 'var(--color-border-hover)' }}>View Page</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ExplorePage() {
    return (
        <Suspense fallback={<div style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>}>
            <ExploreContent />
        </Suspense>
    );
}
