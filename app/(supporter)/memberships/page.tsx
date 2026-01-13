'use client';

import Button from '../../components/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatPrice } from '@/utils/format';

export default function MyMembershipsPage() {
    const router = useRouter();
    const { address } = useAccount();
    const [memberships, setMemberships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;
        setLoading(true);
        fetch(`/api/subscriptions?subscriber=${address.toLowerCase()}`)
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
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
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
                        Your memberships
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: '#111' }}>
                        Creators you're currently supporting
                    </p>
                </div>
            </div>

            <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '80px' }}>
                {!address ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-primary)' }}>Connect your wallet</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Sign in to view your active memberships</p>
                    </div>
                ) : loading ? (
                    <div className="grid-system" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="card-surface" style={{ padding: '28px 32px' }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div className="skeleton skeleton-avatar" style={{ width: '64px', height: '64px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px' }} />
                                        <div className="skeleton skeleton-text" style={{ width: '30%', height: '14px' }} />
                                    </div>
                                    <div className="skeleton skeleton-rect" style={{ width: '100px', height: '40px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : memberships.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)' }}>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-text-primary)' }}>No active memberships</h3>
                        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', fontSize: '1.05rem' }}>
                            Support your favorite creators to unlock exclusive content and join their communities.
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
                                cursor: 'pointer',
                                fontSize: '1.05rem'
                            }}
                        >
                            Discover Creators
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '64px' }}>
                            {memberships.map((sub, i) => (
                                <div
                                    key={i}
                                    className="card-surface"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '24px 32px',
                                        transition: 'transform 0.2s',
                                        flexWrap: 'wrap', gap: '24px'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1, minWidth: '250px' }}>
                                        <div style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: 'bold', fontSize: '1.5rem',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            {sub.creators?.name?.charAt(0).toUpperCase() || sub.creatorAddress.charAt(2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-text-primary)' }}>
                                                {sub.creators?.name || `Creator ${sub.creatorAddress.slice(0, 6)}...`}
                                            </h3>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ background: 'var(--color-success)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Active</span>
                                                <span>Tier 1 Member</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Renews on</div>
                                            <div style={{ fontWeight: 600 }}>{new Date(sub.expiresAt).toLocaleDateString()}</div>
                                        </div>
                                        <Link href={`/${sub.creatorAddress}`} style={{ textDecoration: 'none' }}>
                                            <Button variant="outline">Manage Membership</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* History Section */}
                        <div style={{ marginTop: '40px' }}>
                            <h3 className="text-h3" style={{ marginBottom: '24px' }}>Payment History</h3>
                            <div className="card-surface" style={{ overflow: 'hidden', padding: 0 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border)' }}>
                                        <tr>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Date</th>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Description</th>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Status</th>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {memberships.map((m, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{new Date().toLocaleDateString()}</td>
                                                <td style={{ padding: '16px 24px', fontWeight: 500 }}>Membership - {m.creators?.name || 'Creator'}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>PAID</span>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>5.00 MNT</td>
                                            </tr>
                                        ))}
                                        {/* Mock extra entry */}
                                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{new Date(Date.now() - 86400000 * 30).toLocaleDateString()}</td>
                                            <td style={{ padding: '16px 24px', fontWeight: 500 }}>Membership - Creator 0x123</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize: '0.8rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>PAID</span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>5.00 MNT</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
