'use client';

import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const router = useRouter();
    const { isConnected } = useAccount();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setPosts(sorted);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

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

            <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
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
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-primary)' }}>No posts yet</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Explore and support creators to see their content here.</p>
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
                    posts.map((post: any, i) => (
                        <div
                            key={i}
                            className="post-card card-surface"
                            style={{
                                marginBottom: '24px',
                                background: '#fff',
                                border: '1px solid var(--color-border)',
                                padding: '32px',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem'
                                }}>
                                    {post.creatorAddress?.charAt(2).toUpperCase() || '?'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '1.05rem' }}>
                                        Creator {post.creatorAddress?.slice(0, 6)}...
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '16px', color: 'var(--color-text-primary)', lineHeight: '1.3' }}>
                                {post.title}
                            </h3>

                            {post.isPublic ? (
                                <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '1.05rem' }}>
                                    {post.content}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '32px',
                                    background: 'var(--color-primary-light)',
                                    border: '2px dashed var(--color-brand-blue)',
                                    borderRadius: 'var(--radius-lg)',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ color: 'var(--color-brand-blue)', fontWeight: '700', marginBottom: '12px', fontSize: '1.1rem' }}>
                                        🔒 Members Only Content
                                    </p>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                                        {post.teaser ? `"${post.teaser}"` : "Join this creator's community to unlock this post."}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
