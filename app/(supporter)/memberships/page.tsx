'use client';

import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
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
    const [recommended, setRecommended] = useState<any[]>([]);

    useEffect(() => {
        if (!address) return;
        setLoading(true);

        // Parallel fetch
        Promise.all([
            fetch(`/api/subscriptions?subscriber=${address.toLowerCase()}`).then(res => res.json()),
            fetch('/api/creators').then(res => res.json())
        ]).then(([subs, creators]) => {
            if (Array.isArray(subs)) setMemberships(subs);
            if (Array.isArray(creators)) setRecommended(creators.slice(0, 3)); // Simple "top 3" for now
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [address]);

    const categories = ['Art', 'Music', 'Podcast', 'Writing', 'Gaming', 'Education'];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg-page)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .membership-grid {
                    display: grid; grid-template-columns: 1fr; gap: 24px;
                }
                @media (min-width: 768px) {
                    .membership-grid { grid-template-columns: repeat(2, 1fr); }
                }
                .discovery-chip {
                    padding: 8px 16px; border-radius: 99px; background: #fff; border: 1px solid var(--color-border);
                    font-size: 0.9rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
                }
                .discovery-chip:hover { border-color: var(--color-primary); color: var(--color-primary); transform: translateY(-2px); }
            `}} />

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #a8c0f7 0%, #7FA1F7 100%)',
                padding: '80px 0 100px',
                marginBottom: '-40px'
            }}>
                <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h1 className="headline-serif" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', marginBottom: '16px', lineHeight: 1.1 }}>
                        Your memberships
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#111', opacity: 0.9 }}>
                        Manage your support and exclusive access.
                    </p>
                </div>
            </div>

            <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' }}>
                {!address ? (
                    <div style={{ padding: '64px', textAlign: 'center', background: '#fff', borderRadius: '16px', border: '1px dashed var(--color-border)' }}>
                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Connect your wallet</h3>
                        <p className="text-body" style={{ marginBottom: '24px' }}>Sign in to view and manage your active memberships.</p>
                        <Button variant="primary" onClick={() => { /* Connect logic */ }}>Connect Wallet</Button>
                    </div>
                ) : loading ? (
                    <div className="membership-grid">
                        {[1, 2].map(i => (
                            <div key={i} className="card-surface" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                                    <LoadingSkeleton variant="circle" width="64px" height="64px" />
                                    <div style={{ flex: 1 }}>
                                        <LoadingSkeleton variant="text" width="60%" height="24px" style={{ marginBottom: '8px' }} />
                                        <LoadingSkeleton variant="text" width="40%" height="16px" />
                                    </div>
                                </div>
                                <LoadingSkeleton variant="rect" height="40px" width="100%" borderRadius="8px" />
                            </div>
                        ))}
                    </div>
                ) : memberships.length === 0 ? (
                    <>
                        <EmptyState
                            title="No active memberships"
                            description="You are not supporting any creators yet. Join a membership to unlock exclusive content."
                            actionLabel="Explore Creators"
                            onAction={() => router.push('/explore')}
                        />

                        <div style={{ marginTop: '64px' }}>
                            <h2 className="text-h3" style={{ marginBottom: '24px' }}>Discover something new</h2>

                            {/* Categories */}
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
                                {categories.map(cat => (
                                    <button key={cat} className="discovery-chip" onClick={() => router.push(`/explore?cat=${cat}`)}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                {/* Recommended */}
                                <div className="card-surface" style={{ padding: '24px' }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>Recommended for you</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {recommended.map((creator, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                                                    {creator.avatarUrl ? <img src={creator.avatarUrl} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => router.push('/' + creator.address)}>
                                                        {creator.name}
                                                    </div>
                                                    <div className="text-caption">{creator.backrCount || 0} Backrs</div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => router.push('/' + creator.address)}>View</Button>
                                            </div>
                                        ))}
                                        {recommended.length === 0 && <div className="text-caption">No new creators found.</div>}
                                    </div>
                                </div>

                                {/* Trending - Keeping static for now or can reuse recommended sorted by backrs */}
                                <div className="card-surface" style={{ padding: '24px' }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: '16px' }}>Trending now</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {recommended.slice().reverse().map((creator, i) => (
                                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', overflow: 'hidden' }}>
                                                    {creator.avatarUrl ? <img src={creator.avatarUrl} alt="" className="w-full h-full object-cover" /> : null}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{creator.name}</div>
                                                    <div className="text-caption">Trending in Global</div>
                                                </div>
                                                <Button size="sm" variant="ghost" onClick={() => router.push('/' + creator.address)}>View</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="membership-grid" style={{ marginBottom: '64px' }}>
                            {memberships.map((sub, i) => {
                                const isExpired = new Date(sub.expiresAt) < new Date();
                                return (
                                    <div
                                        key={i}
                                        className="card-surface hover-lift"
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '24px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            border: isExpired ? '1px solid var(--color-warning)' : undefined
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '24px' }}>
                                            <div
                                                onClick={() => router.push(`/${sub.creatorAddress}`)}
                                                style={{
                                                    width: '72px', height: '72px', borderRadius: '50%',
                                                    background: sub.creators?.avatarUrl ? `url(${sub.creators.avatarUrl}) center/cover` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontWeight: 'bold', fontSize: '1.75rem', flexShrink: 0, cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {!sub.creators?.avatarUrl && (sub.creators?.name?.charAt(0).toUpperCase() || sub.creatorAddress.charAt(2).toUpperCase())}
                                            </div>
                                            <div>
                                                <h3
                                                    onClick={() => router.push(`/${sub.creatorAddress}`)}
                                                    style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '4px', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                                                >
                                                    {sub.creators?.name || `Creator ${sub.creatorAddress.slice(0, 6)}...`}
                                                </h3>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                                                    Member • <span style={{ fontWeight: 600 }}>Active</span>
                                                </div>
                                                {isExpired ? (
                                                    <span className="badge" style={{ background: '#FECACA', color: '#991B1B' }}>Expired</span>
                                                ) : (
                                                    <span className="badge badge-success">Active</span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                            <div className="text-caption">
                                                {isExpired ? 'Expired on:' : 'Renews:'} <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{new Date(sub.expiresAt).toLocaleDateString()}</span>
                                            </div>
                                            <Button
                                                variant={isExpired ? 'primary' : 'outline'}
                                                size="sm"
                                                onClick={() => router.push(`/${sub.creatorAddress}`)} // Redirect to creator page to re-subscribe
                                            >
                                                {isExpired ? 'Renew Membership' : 'Manage'}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* History Table */}
                        <div style={{ marginTop: '40px' }}>
                            <h3 className="text-h3" style={{ marginBottom: '24px' }}>Payment History</h3>
                            <div className="card-surface" style={{ overflow: 'hidden', padding: 0 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border)' }}>
                                        <tr>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>DATE</th>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-tertiary)' }}>DETAILS</th>
                                            <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: 'var(--color-text-tertiary)', textAlign: 'right' }}>AMOUNT</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {memberships.map((m, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '16px 24px', fontSize: '0.9rem' }}>{new Date().toLocaleDateString()}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ fontWeight: 600 }}>Membership Renewal</div>
                                                    <div className="text-caption">{m.creators?.name || 'Creator'}</div>
                                                </td>
                                                <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 600 }}>5.00 MNT</td>
                                            </tr>
                                        ))}
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
