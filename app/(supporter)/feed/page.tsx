'use client';

import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const [posts, setPosts] = useState<any[]>([]);
    const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                // Mock some locked states for demo purposes if not present
                const enriched = data.map((p: any) => ({
                    ...p,
                    isPublic: p.isPublic ?? Math.random() > 0.5, // Mock mix
                    minTier: p.minTier || (Math.random() > 0.5 ? 2 : 0)
                })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setPosts(enriched);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        if (filter === 'all') setFilteredPosts(posts);
        else if (filter === 'unlocked') setFilteredPosts(posts.filter(p => p.isPublic));
        else setFilteredPosts(posts.filter(p => !p.isPublic));
    }, [filter, posts]);

    if (!isConnected) {
        return (
            <div style={{ minHeight: '100vh', background: '#fff' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #a8c0f7 0%, #7FA1F7 100%)',
                    padding: '120px 24px',
                    textAlign: 'center'
                }}>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        color: '#000',
                        marginBottom: '24px',
                        fontWeight: '400',
                        lineHeight: '1.1'
                    }}>
                        Your personal <span style={{ fontStyle: 'italic' }}>feed</span>
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#111', maxWidth: '600px', margin: '0 auto 48px' }}>
                        Connect your wallet to see updates from your favorite creators.
                    </p>
                    <button
                        onClick={() => router.push('/explore')}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '9999px',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '600',
                            fontSize: '1.05rem',
                            cursor: 'pointer'
                        }}
                    >
                        Explore Creators
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .post-card {
                    transition: all 0.2s ease;
                }
                .post-card:hover {
                    box-shadow: var(--shadow-card-hover) !important;
                    transform: translateY(-2px);
                }
                .filter-tab {
                    padding: 8px 16px;
                    border-radius: 99px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                .filter-tab.active {
                    background: var(--color-brand-blue);
                    color: #fff;
                }
                .filter-tab:not(.active) {
                    background: #fff;
                    color: var(--color-text-secondary);
                    border-color: var(--color-border);
                }
                .filter-tab:not(.active):hover {
                    border-color: var(--color-brand-blue);
                    color: var(--color-brand-blue);
                }
            `}} />

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #a8c0f7 0%, #7FA1F7 100%)',
                padding: '80px 0 100px',
                marginBottom: '-40px'
            }}>
                <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h1 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        color: '#000',
                        marginBottom: 'var(--space-4)',
                        fontWeight: '400',
                        lineHeight: '1.1'
                    }}>
                        Your feed
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: '#111' }}>
                        Fresh updates from creators you support
                    </p>
                </div>
            </div>

            <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto', paddingBottom: '80px' }}>

                {/* Filters */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {(['all', 'unlocked', 'locked'] as const).map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="grid-system" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-surface" style={{ padding: '32px' }}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                                    <div className="skeleton skeleton-avatar" style={{ width: '48px', height: '48px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: '8px' }} />
                                        <div className="skeleton skeleton-text" style={{ width: '20%', height: '14px' }} />
                                    </div>
                                </div>
                                <div className="skeleton skeleton-text" style={{ width: '80%', height: '32px', marginBottom: '16px' }} />
                                <div className="skeleton skeleton-text" style={{ width: '100%' }} />
                                <div className="skeleton skeleton-text" style={{ width: '90%' }} />
                                <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                            </div>
                        ))}
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-primary)' }}>No posts found</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
                            {filter === 'all' ? "Explore creators to see their content here." : `No ${filter} posts available.`}
                        </p>
                        <button
                            onClick={() => router.push('/explore')}
                            style={{
                                padding: '14px 32px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--color-brand-blue)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Discover Creators
                        </button>
                    </div>
                ) : (
                    filteredPosts.map((post: any, i) => {
                        const locked = !post.isPublic; // Simplified logic for feed demo
                        return (
                            <div
                                key={i}
                                className="post-card card-surface"
                                style={{
                                    marginBottom: '24px',
                                    background: '#fff',
                                    border: '1px solid var(--color-border)',
                                    padding: '0',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{ padding: '24px' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                                        <div
                                            onClick={() => router.push(`/${post.creatorAddress}`)}
                                            style={{
                                                width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
                                                background: `linear-gradient(135deg, #${Math.floor(Math.random() * 16777215).toString(16)} 0%, #764ba2 100%)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'
                                            }}
                                        >
                                            {post.creatorAddress?.charAt(2).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <div
                                                onClick={() => router.push(`/${post.creatorAddress}`)}
                                                style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '1.05rem', cursor: 'pointer' }}
                                            >
                                                Creator {post.creatorAddress?.slice(0, 6)}...
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                                                {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {locked ? 'Members only' : 'Public'}
                                            </div>
                                        </div>
                                        {locked && (
                                            <div style={{ marginLeft: 'auto', background: 'var(--color-bg-page)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                                                🔒 LOCKED
                                            </div>
                                        )}
                                    </div>

                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-primary)', lineHeight: '1.3' }}>
                                        {post.title}
                                    </h3>

                                    {/* Content Area */}
                                    <div style={{ position: 'relative', minHeight: locked ? '180px' : 'auto', marginBottom: '20px' }}>
                                        {locked ? (
                                            <>
                                                <div style={{ filter: 'blur(8px)', opacity: 0.5, userSelect: 'none' }}>
                                                    {post.content.substring(0, 150)}...
                                                    <br /><br />
                                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                </div>
                                                <div style={{
                                                    position: 'absolute', inset: 0,
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                    textAlign: 'center', zIndex: 10
                                                }}>
                                                    <div style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '12px 24px', borderRadius: '99px', backdropFilter: 'blur(4px)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                        <span>🔒</span> Unlock this post
                                                    </div>
                                                    <Button size="sm" onClick={() => router.push(`/${post.creatorAddress}`)}>View Tiers</Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-line' }}>
                                                {post.content}
                                                {post.image && (
                                                    <div style={{ marginTop: '16px', borderRadius: '12px', overflow: 'hidden' }}>
                                                        <img src={post.image} alt="" style={{ width: '100%', height: 'auto' }} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div style={{ display: 'flex', gap: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', color: 'var(--color-text-secondary)' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'inherit' }}>
                                            ❤️ <span style={{ fontWeight: 500 }}>Like</span>
                                        </button>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'inherit' }}>
                                            💬 <span style={{ fontWeight: 500 }}>Comment</span>
                                        </button>
                                        <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'inherit' }}>
                                            ↗ <span style={{ fontWeight: 500 }}>Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
