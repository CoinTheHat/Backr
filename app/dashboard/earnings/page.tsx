'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import { useAccount, useReadContract, useWriteContract, useBalance, usePublicClient } from 'wagmi';
import { formatEther, parseAbiItem } from 'viem';
import { FACTORY_ABI, SUBSCRIPTION_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { supabase } from '@/utils/supabase';
import { useToast } from '../../components/Toast';

export default function EarningsPage() {
    const { address } = useAccount();
    const { showToast, ToastComponent } = useToast();
    const [withdrawOpen, setWithdrawOpen] = useState(false);

    // Data State
    const [revenue, setRevenue] = useState('0.00');
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loadingPayouts, setLoadingPayouts] = useState(true);
    const [lastPayout, setLastPayout] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // 1. Contract Address
    const { data: contractAddress } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI, functionName: 'getProfile', args: [address],
    });

    // 2. Balance
    const { data: balanceData, refetch: refetchBalance } = useBalance({
        address: contractAddress as `0x${string}`,
    });

    const { writeContract, isPending } = useWriteContract();
    const publicClient = usePublicClient();

    // 3. Fetch Revenue (Supabase)
    useEffect(() => {
        const fetchRevenue = async () => {
            if (!address) return;
            const { data } = await supabase.from('subscriptions').select('price').eq('creatorAddress', address);
            if (data) {
                let total = 0;
                data.forEach(sub => { const val = parseFloat(sub.price.split(' ')[0]); if (!isNaN(val)) total += val; });
                setRevenue(total.toFixed(2));
            }
        };
        fetchRevenue();
    }, [address]);

    // 4. Fetch Payouts (Chain)
    useEffect(() => {
        const fetchPayouts = async () => {
            if (!contractAddress || !publicClient) return;
            setLoadingPayouts(true);
            try {
                const logs = await publicClient.getLogs({
                    address: contractAddress as `0x${string}`, event: parseAbiItem('event Withdrawn(uint256 amount)'), fromBlock: 'earliest'
                });

                const history = await Promise.all(logs.map(async (log: any) => {
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                    return {
                        hash: log.transactionHash,
                        amount: formatEther(log.args.amount),
                        date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
                        timestamp: Number(block.timestamp) * 1000
                    };
                }));

                // Sort Descending
                const sorted = history.sort((a, b) => b.timestamp - a.timestamp);
                setPayouts(sorted);
                if (sorted.length > 0) setLastPayout(parseFloat(sorted[0].amount).toFixed(2));
            } catch (e) { console.error("Error fetching payouts:", e); }
            finally { setLoadingPayouts(false); }
        };
        if (contractAddress) fetchPayouts();
    }, [contractAddress, publicClient, address, balanceData]);

    const handleWithdraw = () => {
        if (!contractAddress) return;
        writeContract({
            address: contractAddress as `0x${string}`, abi: SUBSCRIPTION_ABI, functionName: 'withdraw', args: [],
        }, {
            onSuccess: () => {
                setWithdrawOpen(false); showToast('Withdrawal initiated!', 'success');
                setTimeout(() => { refetchBalance(); }, 5000);
            },
            onError: () => showToast('Withdrawal failed', 'error')
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    };

    const displayBalance = balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(2) : '0.00';
    const symbol = balanceData?.symbol || 'MNT';

    // Derived Logic
    const totalPages = Math.ceil(payouts.length / itemsPerPage);
    const paginatedPayouts = payouts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            {ToastComponent}
            <SectionHeader
                title="Finance Dashboard"
                description="Monitor your earnings and cash flow."
                action={{
                    label: 'Withdraw Funds', onClick: () => setWithdrawOpen(true),
                    variant: 'primary', disabled: displayBalance === '0.00'
                }}
            />

            {/* METRICS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>

                {/* 1. Available Balance */}
                <Card variant="surface" padding="lg">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div className="text-caption" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Available Balance</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{displayBalance} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{symbol}</span></div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                            Ready to withdraw
                        </div>
                    </div>
                </Card>

                {/* 2. Total Revenue */}
                <Card variant="surface" padding="lg">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div className="text-caption" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Total Revenue</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{revenue} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>MNT</span></div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>Lifetime earnings</div>
                    </div>
                </Card>

                {/* 3. Last Payout */}
                <Card variant="surface" padding="lg">
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                            <div className="text-caption" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '8px' }}>Last Payout</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1 }}>{lastPayout ? lastPayout : '—'} <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>MNT</span></div>
                        </div>
                        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--color-text-tertiary)' }}>
                            {payouts.length > 0 ? `Processed on ${payouts[0].date}` : 'No payouts yet'}
                        </div>
                    </div>
                </Card>
            </div>

            {/* CHART SECTION */}
            <Card padding="lg" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 className="text-h3" style={{ fontSize: '1.25rem' }}>Revenue Trends</h3>
                    <select className="focus-ring" style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-page)', fontSize: '0.9rem' }}>
                        <option>Last 30 Days</option>
                        <option>Last 3 Months</option>
                        <option>Year to Date</option>
                    </select>
                </div>
                {/* Mock Chart Area */}
                <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
                    {Array.from({ length: 30 }).map((_, i) => {
                        const h = Math.floor(Math.random() * 80) + 10;
                        return (
                            <div key={i} style={{
                                flex: 1,
                                height: `${h}%`,
                                background: i > 24 ? 'var(--color-primary)' : 'var(--color-border)',
                                borderRadius: '4px 4px 0 0',
                                opacity: i > 24 ? 1 : 0.5,
                                transition: 'all 0.2s'
                            }}
                                className="chart-bar"
                                title={`Day ${i + 1}: ${h} MNT`}
                            ></div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: 'var(--color-text-tertiary)', fontSize: '0.8rem' }}>
                    <span>30 days ago</span>
                    <span>Today</span>
                </div>
            </Card>

            {/* INFO CALLOUT (COLLAPSIBLE) */}
            <div style={{ marginBottom: '32px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div
                    onClick={() => setShowInfo(!showInfo)}
                    style={{ padding: '16px 24px', background: 'var(--color-bg-surface)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
                        <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
                        Understanding Payouts & Fees
                    </div>
                    <div style={{ transform: showInfo ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</div>
                </div>
                {showInfo && (
                    <div style={{ padding: '24px', background: 'var(--color-bg-page)', borderTop: '1px solid var(--color-border)', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Platform Fees:</strong> Mantle Kinship takes a flat <strong>5% fee</strong> on all subscription revenue.
                        </p>
                        <p style={{ marginBottom: '12px' }}>
                            <strong>Gas Fees:</strong> Network fees are paid in MNT and are deducted from the transaction amount when subscribers join.
                        </p>
                        <p>
                            <strong>Withdrawals:</strong> Funds are held in your deployed Smart Contract. Only you (the owner) can call the withdraw function. Transfers are instant.
                        </p>
                    </div>
                )}
            </div>

            {/* HISTORY TABLE */}
            <Card padding="none" style={{ background: '#fff' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
                    <h3 className="text-h3" style={{ fontSize: '1.25rem' }}>Withdrawal History</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                        <thead style={{ background: 'var(--color-bg-page)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Date Processed</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Amount</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Status</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)' }}>Transaction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingPayouts ? (
                                <tr><td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>Loading history...</td></tr>
                            ) : paginatedPayouts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ padding: '64px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💸</div>
                                        <div>No withdrawals found.</div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedPayouts.map((p, i) => (
                                    <tr key={i} className="hover-row" style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '16px 24px', color: 'var(--color-text-primary)' }}>{p.date}</td>
                                        <td style={{ padding: '16px 24px', fontWeight: 700 }}>{parseFloat(p.amount).toFixed(2)} MNT</td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' }}>
                                                COMPLETED
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px 24px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span className="text-caption" style={{ fontFamily: 'monospace' }}>{p.hash.slice(0, 8)}...{p.hash.slice(-4)}</span>
                                                <button onClick={() => copyToClipboard(p.hash)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: 0 }} title="Copy Hash">📋</button>
                                                <a href={`https://sepolia.mantlescan.xyz/tx/${p.hash}`} target="_blank" style={{ color: 'var(--color-primary)', textDecoration: 'none', opacity: 0.8 }} title="View on Explorer">↗</a>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* PAGINATION */}
                {payouts.length > itemsPerPage && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="text-caption">Showing {paginatedPayouts.length} of {payouts.length} transactions</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* WITHDRAW MODAL */}
            {withdrawOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
                    <div className="card-surface" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
                            <h2 className="text-h2">Confirm Withdrawal</h2>
                            <p className="text-body" style={{ color: 'var(--color-text-secondary)' }}>
                                You are about to withdraw <strong>{displayBalance} MNT</strong> to your connected wallet.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Button size="lg" onClick={handleWithdraw} disabled={isPending}>
                                {isPending ? 'Processing on Chain...' : 'Confirm & Withdraw'}
                            </Button>
                            <Button variant="ghost" onClick={() => setWithdrawOpen(false)} disabled={isPending}>Cancel</Button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .chart-bar:hover { opacity: 1 !important; transform: scaleY(1.05); }
                .hover-row:hover { background-color: var(--color-bg-surface-hover) !important; }
            `}} />
        </div>
    );
}
