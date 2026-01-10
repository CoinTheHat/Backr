'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function ExplorePage() {
    const router = useRouter();
    const [creators, setCreators] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading creators...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
            <header style={{ marginBottom: '64px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '16px' }}>Explore Creators</h1>
                <p style={{ fontSize: '1.25rem', color: '#a1a1aa' }}>Discover the best communities building on Mantle.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                {creators.length > 0 ? creators.map((creator, i) => (
                    <Card key={i} style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s', cursor: 'pointer', ':hover': { transform: 'translateY(-4px)' } }} onClick={() => router.push(`/${creator.address}`)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: creator.avatarUrl ? `url(${creator.avatarUrl}) center/cover` : '#2e333d', border: '2px solid #65b3ad' }}></div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{creator.name}</h3>
                                <p style={{ fontSize: '0.875rem', color: '#a1a1aa', fontFamily: 'monospace' }}>{creator.address.slice(0, 6)}...{creator.address.slice(-4)}</p>
                            </div>
                        </div>

                        <p style={{ color: '#a1a1aa', flex: 1, marginBottom: '24px', lineHeight: '1.6' }}>
                            {creator.description || 'No description provided.'}
                        </p>

                        <div style={{ marginTop: 'auto' }}>
                            <Button style={{ width: '100%' }} onClick={(e: any) => {
                                e.stopPropagation();
                                router.push(`/${creator.address}`);
                            }}>View Page</Button>
                        </div>
                    </Card>
                )) : (
                    <>
                        <div style={{ gridColumn: '1 / -1', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#fff' }}>Featured Creators <span style={{ fontSize: '0.75rem', background: '#65b3ad', color: '#000', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle' }}>PROMOTED</span></h3>
                        </div>
                        {/* Fake/Skeleton Creators for Visual Vibe */}
                        {[1, 2, 3].map((_, i) => (
                            <Card key={i} noHover={true} style={{ opacity: 0.7, filter: 'grayscale(0.5)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#2e333d' }}></div>
                                    <div>
                                        <div style={{ height: '20px', width: '120px', background: '#2e333d', borderRadius: '4px', marginBottom: '8px' }}></div>
                                        <div style={{ height: '14px', width: '80px', background: '#2e333d', borderRadius: '4px' }}></div>
                                    </div>
                                </div>
                                <div style={{ height: '60px', width: '100%', background: '#2e333d', borderRadius: '8px', marginBottom: '24px' }}></div>
                                <Button variant="secondary" style={{ width: '100%', cursor: 'default' }} disabled>Coming Soon</Button>
                            </Card>
                        ))}
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#a1a1aa' }}>
                            <p>Be the next big creator on Mantle.</p>
                            <Button style={{ marginTop: '16px' }} onClick={() => router.push('/dashboard')}>Create Your Profile</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
