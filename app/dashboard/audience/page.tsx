'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { useAccount } from 'wagmi';

export default function AudiencePage() {
    const { address } = useAccount();

    // Mock Data Generator consistent for the user
    // In a real app, this fetches from Supabase 'subscriptions' table
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        // Generating "Specific" data for demonstration
        const mockData = [
            { address: '0x1234...5678', tier: 'Supporter', joined: '2026-01-01', total: '10 MNT', status: 'Active', expiry: '2026-02-01', tx: '0xabc...def' },
            { address: '0x8765...4321', tier: 'VIP', joined: '2026-01-05', total: '40 MNT', status: 'Active', expiry: '2026-02-05', tx: '0x123...456' },
            { address: '0x1111...0000', tier: 'Supporter', joined: '2025-12-15', total: '10 MNT', status: 'Expired', expiry: '2026-01-15', tx: '0x999...888' },
            { address: '0xaaaa...bbbb', tier: 'Super Fan', joined: '2026-01-08', total: '100 MNT', status: 'Active', expiry: '2026-02-08', tx: '0xaaa...bbb' },
            { address: '0xcccc...dddd', tier: 'Supporter', joined: '2026-01-09', total: '5 MNT', status: 'Active', expiry: '2026-02-09', tx: '0xccc...ddd' },
        ];
        setMembers(mockData);
    }, []);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.address.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleExportCSV = () => {
        const headers = ["Member", "Tier", "Join Date", "Lifetime Value", "Status"];
        const rows = filteredMembers.map(m => [m.address, m.tier, m.joined, m.total, m.status]);

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

            <Card style={{ padding: '0', overflow: 'hidden' }}>
                {/* Filters */}
                <div style={{ padding: '16px', borderBottom: '1px solid #2e333d', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <Input placeholder="Search by address..." value={search} onChange={(e: any) => setSearch(e.target.value)} />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ background: '#1a1d24', border: '1px solid #2e333d', borderRadius: '8px', color: '#fff', padding: '0 16px', outline: 'none', cursor: 'pointer' }}
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#1a1d24', borderBottom: '1px solid #2e333d' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Member</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Tier</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Join Date</th>
                            <th style={{ padding: '16px', color: '#a1a1aa', fontWeight: '500' }}>Lifetime</th>
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
                                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#65b3ad' }}>{m.address}</td>
                                    <td style={{ padding: '16px' }}>{m.tier}</td>
                                    <td style={{ padding: '16px', color: '#a1a1aa' }}>{m.joined}</td>
                                    <td style={{ padding: '16px' }}>{m.total}</td>
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
                                                    <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{m.address}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Membership Expiry</p>
                                                    <p style={{ fontSize: '0.9rem' }}>{m.expiry}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Last Transaction</p>
                                                    <a href="#" style={{ color: '#65b3ad', textDecoration: 'none', fontSize: '0.9rem' }}>{m.tx} ↗</a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#52525b' }}>
                                    {address ? "No supporters found yet. Share your profile!" : "Please connect your wallet to view audience."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
