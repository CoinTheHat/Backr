'use client';

import Card from '../../components/Card';
import Button from '../../components/Button';
import { useRouter } from 'next/navigation';
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
                            <div key={i} className="card-surface" style={{
                                display: 'flex',
                                alignItems: 'center', // Center vertically
                                justifyContent: 'space-between',
                                padding: '28px 32px'
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 1 }}>
                                    <div className="skeleton skeleton-avatar" style={{ width: '56px', height: '56px' }} />
                                    <div style={{ flex: 1 }}>
                                        <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: '8px' }} />
                                        <div className="skeleton skeleton-text" style={{ width: '40%', height: '14px' }} />
                                    </div>
                                </div>
                                <div className="skeleton skeleton-rect" style={{ width: '120px', height: '40px', borderRadius: '999px' }} />
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
                    <div className="grid-system" style={{ gridTemplateColumns: '1fr', gap: 'var(--space-6)' }}>
                        {memberships.map((sub, i) => (
                            <div
                                key={i}
                                className="card-surface"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '28px 32px',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        fontSize: '1.4rem'
                                    }}>
                                        {sub.creators?.name?.charAt(0).toUpperCase() || sub.creatorAddress.charAt(2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '6px', color: 'var(--color-text-primary)' }}>
                                            {sub.creators?.name || `Creator ${sub.creatorAddress.slice(0, 6)}`}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
                                            <span>Status: <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>Active</span></span>
                                            <span>•</span>
                                            <span>Expires: {new Date(sub.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/${sub.creatorAddress}`} style={{ textDecoration: 'none' }}>
                                    <button style={{
                                        padding: '12px 28px',
                                        borderRadius: 'var(--radius-full)',
                                        background: 'var(--color-bg-page)',
                                        color: 'var(--color-text-primary)',
                                        border: '1px solid var(--color-border)',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--color-brand-blue)';
                                            e.currentTarget.style.color = '#fff';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--color-bg-page)';
                                            e.currentTarget.style.color = 'var(--color-text-primary)';
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                        }}
                                    >
                                        View Content
                                    </button>
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
