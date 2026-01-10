'use client';

import { useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';

export default function AudiencePage() {
    // Mock Data
    const [members] = useState([
        { address: '0x1234567890abcdef1234567890abcdef12345678', tier: 'Supporter', joined: '2026-01-01', total: '10 MNT', status: 'Active', expiry: '2026-02-01', tx: '0xabc...def' },
        { address: '0x8765432109fedcba8765432109fedcba87654321', tier: 'VIP', joined: '2026-01-05', total: '40 MNT', status: 'Active', expiry: '2026-02-05', tx: '0x123...456' },
        { address: '0x1111222233334444555566667777888899990000', tier: 'Supporter', joined: '2025-12-15', total: '10 MNT', status: 'Expired', expiry: '2026-01-15', tx: '0x999...888' },
    ]);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.address.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'All' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Audience</h1>
                    <p style={{ color: '#a1a1aa' }}>View your active supporters.</p>
                </div>
                <Button variant="outline">Export CSV</Button>
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
                        style={{ background: '#1a1d24', border: '1px solid #2e333d', borderRadius: '8px', color: '#fff', padding: '0 16px' }}
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
                                <tr key={i} style={{ borderBottom: '1px solid #2e333d', cursor: 'pointer', background: expandedRow === i ? 'rgba(255,255,255,0.02)' : 'transparent' }} onClick={() => setExpandedRow(expandedRow === i ? null : i)}>
                                    <td style={{ padding: '16px', fontFamily: 'monospace', color: '#65b3ad' }}>{m.address.slice(0, 6)}...{m.address.slice(-4)}</td>
                                    <td style={{ padding: '16px' }}>{m.tier}</td>
                                    <td style={{ padding: '16px', color: '#a1a1aa' }}>{m.joined}</td>
                                    <td style={{ padding: '16px' }}>{m.total}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            background: m.status === 'Active' ? 'rgba(101, 179, 173, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                            color: m.status === 'Active' ? '#65b3ad' : '#ef4444',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem'
                                        }}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', color: '#a1a1aa' }}>
                                        {expandedRow === i ? '▲' : '▼'}
                                    </td>
                                </tr>
                                {expandedRow === i && (
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #2e333d' }}>
                                        <td colSpan={6} style={{ padding: '16px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Full Address</p>
                                                    <p style={{ fontFamily: 'monospace' }}>{m.address}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Expiry Date</p>
                                                    <p>{m.expiry}</p>
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginBottom: '4px' }}>Transaction</p>
                                                    <a href="#" style={{ color: '#65b3ad', textDecoration: 'none' }}>View on Explorer ↗</a>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        )) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#52525b' }}>No members found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
