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

    const categories = ['All', 'Podcasters', 'Video Creators', 'Musicians', 'Visual Artists', 'Writers', 'Gaming', 'Education'];

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

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .headline-serif {
                    font-family: var(--font-serif);
                    font-weight: 400;
                    letter-spacing: -0.02em;
                }
                .creator-card {
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .creator-card:hover {
                    box-shadow: var(--shadow-card-hover) !important;
                }
            `}} />

            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #a8c0f7 0%, #7FA1F7 100%)',
                padding: '80px 0 120px',
                marginBottom: '-60px'
            }}>
                <div className="page-container" style={{ textAlign: 'center' }}>
                    <h1 className="headline-serif" style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        color: '#000',
                        marginBottom: 'var(--space-6)',
                        lineHeight: '1.1'
                    }}>
                        Discover amazing <span style={{ fontStyle: 'italic' }}>creators</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#111', maxWidth: '700px', margin: '0 auto 48px', lineHeight: '1.6' }}>
                        Support the artists, podcasters, writers, and creators who inspire you. Join their communities and unlock exclusive content.
                    </p>
                </div>
            </div>

            <div className="page-container" style={{ paddingBottom: '80px' }}>
                {/* Search & Filter Bar */}
                <div style={{ marginBottom: '48px', display: 'flex', gap: 'var(--space-4)', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                    {/* Search */}
                    <div style={{ position: 'relative', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                        <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Find a creator..."
                            defaultValue={query}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') router.push(`/explore?q=${e.currentTarget.value}`)
                            }}
                            className="focus-ring"
                            style={{
                                width: '100%',
                                background: '#fff',
                                border: '2px solid var(--color-border)',
                                padding: '16px 20px 16px 56px',
                                borderRadius: '50px',
                                color: 'var(--color-text-primary)',
                                fontSize: '1.05rem',
                                transition: 'all 0.2s',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-brand-blue)'}
                            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
                        />
                    </div>

                    {/* Categories */}
                    <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => router.push(cat === 'All' ? '/explore' : `/explore?cat=${cat}`)}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '9999px',
                                    background: (!category && cat === 'All') || category === cat ? 'var(--color-brand-blue)' : 'var(--color-bg-page)',
                                    color: (!category && cat === 'All') || category === cat ? '#fff' : 'var(--color-text-secondary)',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="grid-system">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="card-surface" style={{ overflow: 'hidden', padding: 0 }}>
                                <div className="skeleton skeleton-card" style={{ height: '160px', borderRadius: 0 }} />
                                <div style={{ padding: '52px 24px 24px' }}>
                                    <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '12px', height: '24px' }} />
                                    <div className="skeleton skeleton-text" style={{ width: '100%' }} />
                                    <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
                                        <div className="skeleton skeleton-text" style={{ width: '50%', height: '14px' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCreators.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>No creators found</p>
                        <p style={{ color: 'var(--color-text-tertiary)' }}>Try a different search or category</p>
                    </div>
                ) : (
                    <>
                        <div style={{ marginBottom: '24px', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
                            Found <strong>{filteredCreators.length}</strong> creator{filteredCreators.length !== 1 ? 's' : ''}
                        </div>

                        <div className="grid-system">
                            {filteredCreators.map((creator, i) => (
                                <div
                                    key={i}
                                    className="creator-card card-surface"
                                    onClick={() => router.push(`/${creator.address}`)}
                                    style={{
                                        overflow: 'hidden',
                                        padding: 0,
                                        border: '1px solid var(--color-border)'
                                    }}
                                >
                                    {/* Cover Image */}
                                    <div style={{
                                        height: '160px',
                                        background: `linear-gradient(135deg, ${['#667eea', '#764ba2', '#f093fb', '#4facfe'][i % 4]} 0%, ${['#764ba2', '#f093fb', '#4facfe', '#00f2fe'][i % 4]} 100%)`,
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '-40px',
                                            left: '24px',
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            border: '4px solid #fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '2rem',
                                            boxShadow: 'var(--shadow-sm)'
                                        }}>
                                            {creator.name ? creator.name.charAt(0).toUpperCase() : '👤'}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div style={{ padding: '52px 24px 24px' }}>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                                            {creator.name || `Creator ${creator.address.slice(0, 6)}`}
                                        </h3>
                                        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.5', minHeight: '60px' }}>
                                            {creator.description || 'Creating amazing content for the community'}
                                        </p>

                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--space-4)',
                                            paddingTop: '20px',
                                            borderTop: '1px solid var(--color-border)',
                                            fontSize: '0.9rem',
                                            color: 'var(--color-text-tertiary)'
                                        }}>
                                            <span><strong style={{ color: 'var(--color-text-primary)' }}>{Math.floor(Math.random() * 500) + 10}</strong> Backrs</span>
                                            <span>•</span>
                                            <span style={{ color: 'var(--color-brand-blue)', fontWeight: '600' }}>Creating content</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
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
