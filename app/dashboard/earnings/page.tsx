'use client';

import { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { useAccount, useReadContract, useWriteContract, useBalance, usePublicClient } from 'wagmi';
import { parseEther, formatEther, parseAbiItem } from 'viem';
import { FACTORY_ABI, SUBSCRIPTION_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { supabase } from '@/utils/supabase';

export default function EarningsPage() {
    const { address } = useAccount();
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [revenue, setRevenue] = useState('0.00');

    // 1. Get Creator's Contract Address
    const { data: contractAddress } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getProfile',
        args: [address],
    });

    // 2. Get Contract Balance (Available to Withdraw)
    const { data: balanceData, refetch: refetchBalance } = useBalance({
        address: contractAddress as `0x${string}`,
    });

    const { writeContract, isPending, isSuccess } = useWriteContract();

    // 3. Fetch Revenue from DB
    useEffect(() => {
        const fetchRevenue = async () => {
            if (!address) return;
            const { data } = await supabase
                .from('subscriptions')
                .select('price')
                .eq('creatorAddress', address);

            if (data) {
                // Assuming price is stored as "10 MNT" string, we parse it.
                // Or simplified: iterate and sum.
                let total = 0;
                data.forEach(sub => {
                    const val = parseFloat(sub.price.split(' ')[0]);
                    if (!isNaN(val)) total += val;
                });
                setRevenue(total.toFixed(2));
            }
        };
        fetchRevenue();
    }, [address]);

    const publicClient = usePublicClient();
    const [payouts, setPayouts] = useState<any[]>([]);

    // 4. Fetch Payout History from Chain Events
    useEffect(() => {
        const fetchPayouts = async () => {
            if (!contractAddress || !publicClient) return;

            try {
                const logs = await publicClient.getLogs({
                    address: contractAddress as `0x${string}`,
                    event: parseAbiItem('event Withdrawn(uint256 amount)'),
                    fromBlock: 'earliest' // In prod, maybe limit range
                });

                const history = await Promise.all(logs.map(async (log: any) => {
                    const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
                    return {
                        hash: log.transactionHash,
                        amount: formatEther(log.args.amount),
                        date: new Date(Number(block.timestamp) * 1000).toLocaleDateString(),
                        to: address // Owner always receives existing logic
                    };
                }));

                // Sort newest first
                setPayouts(history.reverse());
            } catch (e) {
                console.error("Error fetching payouts:", e);
            }
        };

        if (contractAddress) {
            fetchPayouts();
        }
    }, [contractAddress, publicClient, address, balanceData]); // Refetch when balance changes (after withdraw)

    const handleWithdraw = () => {
        if (!contractAddress) return;
        writeContract({
            address: contractAddress as `0x${string}`,
            abi: SUBSCRIPTION_ABI,
            functionName: 'withdraw',
            args: [],
        }, {
            onSuccess: () => {
                setWithdrawOpen(false);
                // Give time for indexing/block mining then refetch accounts
                setTimeout(() => {
                    refetchBalance();
                    // trigger re-fetch of logs? typically takes a bit. 
                    // ideally we just wait for the transaction receipt in a real app.
                }, 5000);
            }
        });
    };

    const displayBalance = balanceData ? parseFloat(formatEther(balanceData.value)).toFixed(2) : '0.00';
    const symbol = balanceData?.symbol || 'MNT';

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Earnings</h1>
                    <p style={{ color: '#a1a1aa' }}>Track your revenue and withdrawals.</p>
                </div>
                <Button onClick={() => setWithdrawOpen(true)}>Withdraw Balance</Button>
            </header>

            {/* Withdraw Modal */}
            {withdrawOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
                }}>
                    <Card style={{ width: '400px', border: '1px solid #65b3ad', boxShadow: '0 0 50px rgba(101, 179, 173, 0.2)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Withdraw Funds</h2>
                        <p style={{ color: '#a1a1aa', marginBottom: '24px', fontSize: '0.875rem' }}>Transfer your earnings to your wallet.</p>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Amount</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input
                                    value={amount}
                                    onChange={(e: any) => setAmount(e.target.value)}
                                    placeholder={displayBalance}
                                    type="number"
                                    disabled={true}
                                />
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#eab308', marginTop: '8px' }}>
                                Note: This action withdraws the entire available balance.
                            </p>
                            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#a1a1aa', marginTop: '4px' }}>
                                Available: <span style={{ color: '#65b3ad' }}>{displayBalance} {symbol}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                            <Button onClick={handleWithdraw} disabled={isPending}>
                                {isPending ? 'Processing...' : 'Confirm Withdraw'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <Card variant="glass" style={{ marginBottom: '48px', padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Available Balance */}
                    <div style={{ padding: '32px', position: 'relative' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Available Balance</p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h3 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', textShadow: '0 0 30px rgba(56, 189, 248, 0.3)' }}>{displayBalance}</h3>
                                <span style={{ fontSize: '1.2rem', color: '#65b3ad', fontWeight: 'bold' }}>{symbol}</span>
                            </div>
                        </div>
                        {/* Glow */}
                        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)', filter: 'blur(40px)' }}></div>
                    </div>

                    {/* Total Revenue */}
                    <div style={{ padding: '32px', borderLeft: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#a1a1aa', fontSize: '0.875rem', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
                                    <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{revenue} MNT</h3>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px' }}>
                                    📈
                                </div>
                            </div>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '16px' }}>
                                Lifetime earnings from all subscriptions.
                            </p>
                        </div>
                    </div>
                </div>
            </Card>

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
                        {payouts.length > 0 ? payouts.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #2e333d' }}>
                                <td style={{ padding: '16px' }}>{p.date}</td>
                                <td style={{ padding: '16px', fontWeight: 'bold', color: '#fff' }}>{parseFloat(p.amount).toFixed(2)} MNT</td>
                                <td style={{ padding: '16px', fontFamily: 'monospace' }}>{p.to.slice(0, 6)}...{p.to.slice(-4)}</td>
                                <td style={{ padding: '16px' }}><a href={`https://sepolia.mantlescan.xyz/tx/${p.hash}`} target="_blank" style={{ color: '#65b3ad' }}>{p.hash.slice(0, 6)}...{p.hash.slice(-4)} ↗</a></td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: '#52525b' }}>
                                    No withdrawals found yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}
