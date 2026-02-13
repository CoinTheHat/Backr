'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DollarSign, ArrowUpRight, Calendar, Download, TrendingUp, CreditCard } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function EarningsPage() {
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const { showToast } = useToast();

    // Mock Data for Hackathon Demo
    const [balance, setBalance] = useState('0.00');
    const [earningsHistory, setEarningsHistory] = useState([
        { date: 'Mon', amount: 0 },
        { date: 'Tue', amount: 0 },
        { date: 'Wed', amount: 0 },
        { date: 'Thu', amount: 0 },
        { date: 'Fri', amount: 0 },
        { date: 'Sat', amount: 0 },
        { date: 'Sun', amount: 0 },
    ]);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        // TODO: Phase 2 - Fetch actual tip data
        if (address) {
            // Placeholder: Fetch tips from API
        }
    }, [address]);

    const handleWithdraw = () => {
        showToast("Withdrawals are automatic on Tempo!", "info");
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <SectionHeader
                title="Earnings"
                description="Track your revenue and manage payouts."
            />

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={100} />
                    </div>
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                            <TrendingUp size={16} />
                            <span className="text-sm font-medium">Total Revenue</span>
                        </div>
                        <div>
                            <div className="text-3xl font-display font-bold text-white mb-1">
                                $ {balance}
                            </div>
                            <div className="text-xs text-emerald-400 font-medium">
                                +0.0% this month
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard size={100} />
                    </div>
                    <div className="flex flex-col h-full justify-between relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-gray-400">
                            <Calendar size={16} />
                            <span className="text-sm font-medium">Pending Payout</span>
                        </div>
                        <div>
                            <div className="text-3xl font-display font-bold text-white mb-1">
                                $ 0.00
                            </div>
                            <div className="text-xs text-blue-400 font-medium flex items-center gap-1">
                                Automatic settlement <ArrowUpRight size={10} />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 flex flex-col justify-center items-center gap-4 border-dashed border-2 border-white/10 bg-transparent hover:bg-white/5 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent mb-2">
                        <Download size={24} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-bold text-white">Export CSV</h3>
                        <p className="text-xs text-gray-400">Download transaction history</p>
                    </div>
                </Card>
            </div>

            {/* Charts & Graphs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Revenue Over Time</h3>
                        <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-xs outline-none focus:border-white/30 text-gray-400">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full h-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={earningsHistory}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val}`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1a1d24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                    }}
                                />
                                <Bar
                                    dataKey="amount"
                                    fill="#10b981"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {transactions.length > 0 ? (
                            transactions.map((tx, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 text-xs font-bold">
                                            IN
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Tip from Supporter</div>
                                            <div className="text-xs text-gray-500">2 mins ago</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-emerald-400">+$5.00</div>
                                        <div className="text-xs text-gray-500">Completed</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-500 text-sm">
                                No transactions yet.
                            </div>
                        )}
                    </div>
                    <Button variant="outline" className="w-full mt-4 text-xs">View All</Button>
                </Card>
            </div>
        </div>
    );
}
