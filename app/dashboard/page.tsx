'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import RevenueChart from '../components/RevenueChart';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/format';
import {
    Wallet,
    Users,
    TrendingUp,
    MoreHorizontal,
    UserPlus,
    CheckCircle,
    MessageSquare
} from 'lucide-react';

export default function StudioOverview() {
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const router = useRouter();

    const [stats, setStats] = useState<{
        totalRevenue: number;
        activeMembers: number;
        monthlyRecurring: number;
        history: any[];
    }>({
        totalRevenue: 0,
        activeMembers: 0,
        monthlyRecurring: 0,
        history: [],
    });
    const [activity, setActivity] = useState<any[]>([]);

    useEffect(() => {
        if (!address) return;

        // Fetch Stats
        fetch(`/api/stats?creator=${address.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                if (data) setStats({
                    totalRevenue: data.totalRevenue || 0,
                    activeMembers: data.activeMembers || 0,
                    monthlyRecurring: data.monthlyRecurring || 0,
                    history: data.history || [],
                });
            })
            .catch(err => console.error('Failed to fetch stats', err));

        // Fetch Activity (Recent Tips)
        fetch(`/api/tips?receiver=${address.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const mappedTips = data.map(t => ({
                        id: t.id,
                        type: 'tip',
                        title: 'New Tip Received',
                        description: `Received ${t.amount} ${t.currency || 'USDC'} from ${t.sender.slice(0, 6)}...`,
                        timestamp: new Date(t.timestamp),
                        icon: <CheckCircle size={20} />,
                        color: 'bg-emerald-50 text-emerald-600'
                    }));
                    setActivity(prev => [...prev, ...mappedTips].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5));
                }
            })
            .catch(err => console.error('Failed to fetch tips', err));

        // Fetch Activity (Recent Subscriptions)
        fetch(`/api/audience?creator=${address.toLowerCase()}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const mappedSubs = data.map(s => ({
                        id: s.id,
                        type: 'sub',
                        title: 'New Member Joined',
                        description: `${s.subscriberName || s.username || 'A supporter'} subscribed to your content`,
                        timestamp: new Date(s.createdAt || s.startDate),
                        icon: <UserPlus size={20} />,
                        color: 'bg-blue-50 text-blue-600'
                    }));
                    setActivity(prev => [...prev, ...mappedSubs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5));
                }
            })
            .catch(err => console.error('Failed to fetch subscriptions', err));

    }, [address]);

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-8">

            {/* WELCOME SECTION */}
            <section>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Good afternoon, Creator.</h1>
                <p className="text-slate-500">Here is what's happening with your studio today.</p>
            </section>

            {/* STATS GRID */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Revenue Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+12%</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-slate-900">{formatPrice(stats.totalRevenue)}</p>
                    </div>
                </div>

                {/* Members Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full">+5 new</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Active Members</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.activeMembers}</p>
                    </div>
                </div>

                {/* Growth Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold text-white bg-primary px-3 py-1 rounded-full">Pro</span>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">MRR (Est.)</p>
                        <p className="text-3xl font-bold text-slate-900">{formatPrice(stats.monthlyRecurring)}</p>
                    </div>
                </div>
            </section>

            {/* CHART SECTION */}
            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Revenue Trend</h3>
                        <p className="text-sm text-slate-400 mt-1">Past 30 days performance</p>
                    </div>
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                        <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:bg-white hover:shadow-sm transition-all">7D</button>
                        <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white text-primary shadow-sm">30D</button>
                        <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-slate-500 hover:bg-white hover:shadow-sm transition-all">ALL</button>
                    </div>
                </div>

                <div className="h-64 w-full bg-gradient-to-b from-primary/5 to-transparent rounded-2xl border border-dashed border-primary/10 flex items-center justify-center relative overflow-hidden">
                    {stats.history && stats.history.length > 0 ? (
                        <RevenueChart data={stats.history} />
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-400 font-medium">No revenue data yet</p>
                            <button onClick={() => router.push('/community/manage-tiers')} className="mt-4 text-primary text-sm font-bold hover:underline">
                                Create first tier
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ACTIVITY FEED */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                    <button className="text-primary text-sm font-bold hover:underline">View All</button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                    {activity.length > 0 ? (
                        activity.map((item) => (
                            <div key={item.id} className="p-5 flex items-center gap-5 hover:bg-slate-50 transition-colors cursor-pointer first:rounded-t-3xl last:rounded-b-3xl">
                                <div className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center shrink-0`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                                </div>
                                <span className="text-xs font-bold text-slate-400">{formatRelativeTime(item.timestamp)}</span>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center">
                            <p className="text-slate-400">No recent activity found.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
