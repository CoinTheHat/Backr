'use client';

import { useState, useEffect } from 'react';
import Card from '../../components/Card';
import { useAccount } from 'wagmi';

export default function FeedPage() {
    const { isConnected } = useAccount();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, we would fetch posts from creators the user follows/subscribes to.
        // For MVP, we'll fetch ALL posts and maybe filter or just show them as a "Global Feed" for discovery.
        // Let's call it "Community Feed" for now.
        fetch('/api/posts')
            .then(res => res.json())
            .then(data => {
                // Sort by date desc
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
            <div style={{ padding: '48px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Your Feed</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Connect your wallet to see updates from your favorite creators.</p>
            </div>
        );
    }

    if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading feed...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>Community Feed</h1>

            {posts.length === 0 ? (
                <div style={{ padding: '64px', textAlign: 'center', color: '#52525b', border: '1px dashed #2e333d', borderRadius: '12px' }}>
                    No posts yet. Explore creators to get started!
                </div>
            ) : (
                posts.map((post: any, i) => (
                    <Card key={i} style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2e333d' }}></div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>Creator {post.creatorAddress?.slice(0, 6)}...</div>
                                <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>{new Date(post.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>{post.title}</h3>

                        {post.isPublic ? (
                            <div style={{ color: '#d4d4d8', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{post.content}</div>
                        ) : (
                            <div style={{ padding: '24px', background: 'rgba(101, 179, 173, 0.1)', border: '1px solid #2e333d', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#65b3ad', fontWeight: 'bold', marginBottom: '8px' }}>🔒 Members Only</p>
                                <p style={{ fontSize: '0.875rem', color: '#a1a1aa' }}>
                                    {post.teaser ? `"${post.teaser}"` : "Join this creator's community to unlock this post."}
                                </p>
                            </div>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
}
