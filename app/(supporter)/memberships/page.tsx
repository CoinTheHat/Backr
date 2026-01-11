'use client';

import Card from '../../components/Card';
import Button from '../../components/Button';
import { useRouter } from 'next/navigation';

export default function MyMembershipsPage() {
    const router = useRouter();

    import Link from 'next/link';
    import { useState, useEffect } from 'react';
    import { useAccount } from 'wagmi';

    export default function MyMembershipsPage() {
        const router = useRouter();
        const { address } = useAccount();
        const [memberships, setMemberships] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (!address) return;
            setLoading(true);
            // Fetch subscriptions where I am the subscriber
            fetch(`/api/subscriptions?subscriber=${address}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setMemberships(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }, [address]);

        return (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>My Memberships</h1>

                {!address ? (
                    <div style={{ textAlign: 'center', padding: '64px', background: '#1a1d24', borderRadius: '16px' }}>
                        <p style={{ color: '#a1a1aa', marginBottom: '16px' }}>Connect wallet to view your memberships.</p>
                    </div>
                ) : loading ? (
                    <div style={{ textAlign: 'center', padding: '64px' }}>Loading...</div>
                ) : memberships.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px', background: '#1a1d24', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>No active memberships</h3>
                        <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Support your favorite creators to unlock exclusive content and join their communities.</p>
                        <Button onClick={() => router.push('/')}>Discover Creators</Button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {memberships.map((sub, i) => (
                            <Card key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                        {sub.creators?.name || `Creator ${sub.creatorAddress.slice(0, 6)}`}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.875rem', color: '#a1a1aa' }}>
                                        <span>Status: <span style={{ color: '#65b3ad', fontWeight: 'bold' }}>Active</span></span>
                                        <span>•</span>
                                        <span>Expires: {new Date(sub.expiresAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <Link href={`/${sub.creatorAddress}`} style={{ textDecoration: 'none' }}>
                                    <Button variant="secondary">View Content</Button>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }
