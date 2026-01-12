'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Dropdown from '../../components/Dropdown';
import SectionHeader from '../../components/SectionHeader';
import { useAccount } from 'wagmi';

export default function AudiencePage() {
    const { address } = useAccount();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const fetchMembers = () => {
        if (!address) return;
        setLoading(true);
        fetch(`/api/audience?creator=${address.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                setMembers(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setMembers([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (address) fetchMembers();
    }, [address]);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.subscriberAddress.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const activeCount = members.filter(m => m.status === 'Active').length;
    const expiringCount = members.filter(m => {
        if (m.status !== 'Active') return false;
        const daysLeft = (new Date(m.expiresAt).getTime() - Date.now()) / (1000 * 3600 * 24);
        return daysLeft < 7 && daysLeft > 0;
    }).length;

    const handleExportCSV = () => {
        const headers = ["Member", "Tier", "Join Date", "Expires", "Status"];
        const rows = filteredMembers.map(m => [
            m.subscriberAddress,
            m.tierName,
            new Date(m.createdAt).toLocaleDateString(),
            new Date(m.expiresAt).toLocaleDateString(),
            m.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audience_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyAddress = (addr: string) => {
        navigator.clipboard.writeText(addr);
        // Could pop a toast here, but for now simple copy
    };

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            <SectionHeader
                title="Audience"
                description="View and manage your active supporters."
                action={{ label: 'Export CSV', onClick: handleExportCSV, variant: 'outline', icon: '📥' }}
            />

            {/* Stats Chips */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 16px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                    Active: <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{activeCount}</span>
                </div>
                <div style={{ padding: '6px 16px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning)' }}></span>
                    Expiring Soon: <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{expiringCount}</span>
                </div>
            </div>

            {/* Filters */}
            <Card padding="md" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <Input
                            placeholder="Search by address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: '44px', margin: 0 }}
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="focus-ring"
                        style={{
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-surface)',
                            minWidth: '150px',
                            cursor: 'pointer',
                            appearance: 'none',
                            backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23007CB2%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 16px top 50%',
                            backgroundSize: '12px'
                        }}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active Subscription</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </Card>

            {/* Desktop Table View */}
            <Card padding="none" className="desktop-view" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)', position: 'sticky', top: 0 }}>Member</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tier</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Joined</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Expires</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
                                <th style={{ padding: '16px 24px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan={6} style={{ padding: '24px' }}>
                                            <div style={{ height: '20px', width: '100%', background: 'linear-gradient(90deg, var(--color-bg-page) 25%, #f3f3f3 50%, var(--color-bg-page) 75%)', backgroundSize: '200% 100%', animation: 'loading 1.5s infinite', borderRadius: '4px' }}></div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-secondary)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👥</div>
                                        <div>No supporters found matching your filters.</div>
                                        {address && <p style={{ marginTop: '8px', fontSize: '0.875rem' }}>Share your page link to get more supporters!</p>}
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((m, i) => (
                                    <tr key={i} className="table-row-hover" style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {/* Identicon Placeholder based on address color hash (mock) */}
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: `hsl(${parseInt(m.subscriberAddress.slice(2, 4), 16)}, 70%, 60%)`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '0.8rem', fontWeight: 'bold'
                                                }}>
                                                    {m.subscriberAddress.substring(2, 4).toUpperCase()}
                                                </div>
                                                <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                                    {m.subscriberAddress.slice(0, 6)}...{m.subscriberAddress.slice(-4)}
                                                </span>
                                                <button
                                                    onClick={() => copyAddress(m.subscriberAddress)}
                                                    title="Copy Address"
                                                    style={{ background: 'none', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    📋
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 24px', fontWeight: 500 }}>{m.tierName}</td>
                                        <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px 24px', color: 'var(--color-text-secondary)' }}>{new Date(m.expiresAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{
                                                background: m.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: m.status === 'Active' ? 'var(--color-success)' : 'var(--color-error)',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                display: 'inline-block'
                                            }}>
                                                {m.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                            <Dropdown trigger={<Button variant="ghost" size="sm" style={{ fontWeight: 'bold' }}>⋮</Button>}>
                                                <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <button onClick={() => alert('View Details Placeholder')} style={{ textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', color: 'var(--color-text-primary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-page)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>View Details</button>
                                                    <button onClick={() => alert('Message Placeholder')} style={{ textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', color: 'var(--color-text-primary)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-page)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>Send Message</button>
                                                </div>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Mobile Cards View */}
            <div className="mobile-view" style={{ display: 'none', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    <Card style={{ padding: '32px', textAlign: 'center' }}>Loading members...</Card>
                ) : filteredMembers.length === 0 ? (
                    <Card style={{ padding: '32px', textAlign: 'center' }}>No members found.</Card>
                ) : (
                    filteredMembers.map((m, i) => (
                        <Card key={i} padding="md">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        background: `hsl(${parseInt(m.subscriberAddress.slice(2, 4), 16)}, 70%, 60%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '0.9rem', fontWeight: 'bold'
                                    }}>
                                        {m.subscriberAddress.substring(2, 4).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{m.subscriberAddress.slice(0, 6)}...{m.subscriberAddress.slice(-4)}</div>
                                        <div className="text-caption">{m.tierName}</div>
                                    </div>
                                </div>
                                <span style={{
                                    background: m.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: m.status === 'Active' ? 'var(--color-success)' : 'var(--color-error)',
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700
                                }}>
                                    {m.status}
                                </span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                <div>
                                    <div className="text-caption">Joined</div>
                                    <div className="text-body-sm">{new Date(m.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div>
                                    <div className="text-caption">Expires</div>
                                    <div className="text-body-sm">{new Date(m.expiresAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button variant="secondary" size="sm" onClick={() => copyAddress(m.subscriberAddress)} style={{ flex: 1 }}>Copy Address</Button>
                                {/* More actions could go here */}
                            </div>
                        </Card>
                    ))
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media (max-width: 768px) {
                    .desktop-view { display: none !important; }
                    .mobile-view { display: flex !important; }
                }
                .table-row-hover:hover {
                    background-color: var(--color-bg-surface-hover) !important;
                }
                @keyframes loading {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
            `}} />
        </div>
    );
}
