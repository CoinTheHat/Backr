'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { useAccount } from 'wagmi';

export default function AudiencePage() {
    const { address } = useAccount();
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMembers = () => {
        if (!address) return;
        setLoading(true);
        fetch(`/api/audience?creator=${address.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                setMembers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchMembers();
    }, [address]);

    // Demo data generation removed

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.subscriberAddress.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleExportCSV = () => {
        const headers = ["Member", "Tier", "Join Date", "Expires", "Status"];
        const rows = filteredMembers.map(m => [
            m.subscriberAddress,
            m.tierName,
            new Date(m.createdAt).toLocaleDateString(),
            new Date(m.expiresAt).toLocaleDateString(),
            m.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `audience_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Audience</h1>
                    <p style={{ color: '#a1a1aa' }}>View your active supporters.</p>
                </div>
                <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
            </header>

            <Card variant="glass" style={{ padding: '0', overflow: 'hidden', borderRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                {/* Filters */}
                <div style={{ padding: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <Input placeholder="Search by address..." value={search} onChange={(e: any) => setSearch(e.target.value)} style={{ borderRadius: '24px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: '#fff', padding: '0 24px', outline: 'none', cursor: 'pointer', height: '48px' }}
                    >
                        <option value="All" style={{ background: '#1a1d24' }}>All Status</option>
                        <option value="Active" style={{ background: '#1a1d24' }}>Active</option>
                        <option value="Expired" style={{ background: '#1a1d24' }}>Expired</option>
                    </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#1a1d24', borderBottom: '1px solid #2e333d' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Member</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Tier</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Join Date</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Expires</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Status</th>
                            <th style={{ padding: '16px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length > 0 ? filteredMembers.map((m, i) => (
                            <>
                                <tr key={i} style={{ borderBottom: '1px solid #2e333d', cursor: 'pointer', background: expandedRow === i ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
                                    onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = expandedRow === i ? 'rgba(255,255,255,0.02)' : 'transparent'}
                                >
                                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#65b3ad' }}>{m.subscriberAddress.slice(0, 6)}...{m.subscriberAddress.slice(-4)}</td>
                                    <td style={{ padding: '16px' }}>{m.tierName}</td>
                                    <td style={{ padding: '16px', color: '#a1a1aa' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px' }}>{new Date(m.expiresAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            background: m.status === 'Active' ? 'rgba(101, 179, 173, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: m.status === 'Active' ? '#65b3ad' : '#ef4444',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                                        }}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', color: '#a1a1aa' }}>
                                        <span style={{ transition: 'transform 0.2s', display: 'inline-block', transform: expandedRow === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                                    </td>
                                </tr>
                                {expandedRow === i && (
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #2e333d' }}>
                                        <td colSpan={6} style={{ padding: '24px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Full Address</p>
                                                    <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{m.subscriberAddress}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Membership Expiry</p>
                                                    <p style={{ fontSize: '0.9rem' }}>{new Date(m.expiresAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#52525b' }}>
                                    {loading ? 'Loading...' : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <p>{address ? "No supporters found yet." : "Please connect your wallet."}</p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
