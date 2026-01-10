'use client';

import { useState } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';

export default function EarningsPage() {
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [amount, setAmount] = useState('');

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Earnings</h1>
                    <p style={{ color: '#a1a1aa' }}>Track your revenue and withdrawals.</p>
                </div>
                <Button onClick={() => setWithdrawOpen(true)}>Withdraw Balance</Button>
            </header>

            {/* Withdraw Modal (Simulated) */}
            {withdrawOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
                }}>
                    <Card style={{ width: '400px', border: '1px solid #65b3ad', boxShadow: '0 0 50px rgba(101, 179, 173, 0.2)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Withdraw Funds</h2>
                        <p style={{ color: '#a1a1aa', marginBottom: '24px', fontSize: '0.875rem' }}>Transfer your earnings to your wallet.</p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Asset</label>
                            <select style={{ width: '100%', padding: '12px', background: '#1a1d24', border: '1px solid #2e333d', borderRadius: '8px', color: '#fff', marginBottom: '16px' }}>
                                <option>MNT (Native)</option>
                                <option>USDC (Mantle)</option>
                            </select>

                            <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Amount</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input
                                    value={amount}
                                    onChange={(e: any) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    type="number"
                                />
                                <Button variant="secondary" onClick={() => setAmount('245.50')} style={{ fontSize: '0.75rem' }}>Max</Button>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>
                                Available: <span style={{ color: '#65b3ad' }}>245.50 MNT</span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '4px' }}>
                                <span style={{ color: '#a1a1aa' }}>Network Fee</span>
                                <span>~0.002 MNT</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: '#a1a1aa' }}>Est. Arrival</span>
                                <span>~10 seconds</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                            <Button onClick={() => {
                                alert(`Simulating withdrawal of ${amount} MNT...`);
                                setWithdrawOpen(false);
                            }}>Confirm Withdraw</Button>
                        </div>
                    </Card>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '48px' }}>
                <Card style={{ background: 'linear-gradient(135deg, rgba(101, 179, 173, 0.1) 0%, rgba(26, 29, 36, 0.4) 100%)', border: '1px solid #65b3ad', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <p style={{ color: '#65b3ad', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 20px rgba(101,179,173,0.3)' }}>245.50</h3>
                            <span style={{ fontSize: '1rem', color: '#a1a1aa' }}>MNT</span>
                        </div>
                    </div>
                    {/* Abstract Glow in Card */}
                    <div style={{ position: 'absolute', top: '-50%', right: '-50%', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(101,179,173,0.2) 0%, transparent 70%)', filter: 'blur(20px)' }}></div>
                </Card>

                {/* Mini Chart Card */}
                <Card style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div>
                            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Revenue History</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>1,204.00 MNT <span style={{ fontSize: '0.875rem', color: '#65b3ad', fontWeight: 'normal' }}>(+12% this week)</span></h3>
                        </div>
                        <select style={{ background: 'transparent', border: '1px solid #2e333d', borderRadius: '8px', color: '#a1a1aa', fontSize: '0.875rem', padding: '4px 8px' }}>
                            <option>Last 7 Days</option>
                        </select>
                    </div>

                    {/* CSS Bar Chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '100px', paddingTop: '16px' }}>
                        {[35, 50, 25, 60, 45, 80, 65].map((val, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '100%',
                                    height: `${val}%`,
                                    background: i === 6 ? 'linear-gradient(to top, #65b3ad, #a5f3fc)' : '#2e333d',
                                    borderRadius: '4px',
                                    transition: 'height 1s ease',
                                    boxShadow: i === 6 ? '0 0 10px rgba(101,179,173,0.5)' : 'none'
                                }}></div>
                                <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px' }}>Payout History</h3>
            <Card style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#1a1d24' }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#a1a1aa' }}>Date</th>
                            <th style={{ padding: '16px', color: '#a1a1aa' }}>Amount</th>
                            <th style={{ padding: '16px', color: '#a1a1aa' }}>To Address</th>
                            <th style={{ padding: '16px', color: '#a1a1aa' }}>Transaction</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #2e333d' }}>
                            <td style={{ padding: '16px' }}>2026-01-08</td>
                            <td style={{ padding: '16px', fontWeight: 'bold', color: '#fff' }}>500.00 MNT</td>
                            <td style={{ padding: '16px', fontFamily: 'monospace' }}>0x123...456</td>
                            <td style={{ padding: '16px' }}><a href="#" style={{ color: '#65b3ad' }}>0xabc...def ↗</a></td>
                        </tr>
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
