'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Button from '../components/Button';
import Card from '../components/Card';
import RevenueChart from '../components/RevenueChart';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/format';
import { LayoutDashboard, PenTool, Users, Settings, Wallet, ArrowRight, X } from 'lucide-react';

export default function StudioOverview() {
    const { address } = useAccount();
    const router = useRouter();
    // Force refresh timestamp: 1
    const [checklistVisible, setChecklistVisible] = useState(true);

    const [stats, setStats] = useState<{
        totalRevenue: number;
        activeMembers: number;
        monthlyRecurring: number;
        history: any[];
        checklist: {
            profileSet: boolean;
            isDeployed: boolean;
            hasTiers: boolean;
            hasPosts: boolean;
        };
    }>({
        totalRevenue: 0,
        activeMembers: 0,
        monthlyRecurring: 0,
        history: [],
        checklist: { profileSet: false, isDeployed: false, hasTiers: false, hasPosts: false }
    });

    useEffect(() => {
        if (!address) return;
        fetch(`/api/stats?creator=${address}`)
            .then(res => res.json())
            .then(data => {
                if (data) setStats({
                    totalRevenue: data.totalRevenue || 0,
                    activeMembers: data.activeMembers || 0,
                    monthlyRecurring: data.monthlyRecurring || 0,
                    history: data.history || [],
                    checklist: data.checklist || { profileSet: false, isDeployed: false, hasTiers: false, hasPosts: false }
                });
            })
            .catch(err => console.error('Failed to fetch stats', err));
    }, [address]);

    const checklistItems = [
        { label: 'Connect Wallet', done: !!address },
        { label: 'Set Display Name', done: stats.checklist.profileSet },
        { label: 'Deploy Membership Contract', done: stats.checklist.isDeployed },
        { label: 'Create First Tier', done: stats.checklist.hasTiers },
        { label: 'Publish First Post', done: stats.checklist.hasPosts },
    ];
    const progress = Math.round((checklistItems.filter(i => i.done).length / checklistItems.length) * 100);

    return (
        <div className="min-h-screen bg-brand-light pb-24 pt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-brand-dark mb-1">Welcome back, Creator</h1>
                        <p className="text-brand-muted font-medium">Here is what’s happening in your studio today.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-gray-200 hover:border-brand-primary text-gray-700 hover:text-brand-primary" onClick={() => router.push(`/${address || 'demo'}`)}>View Public Page</Button>
                        <Button variant="primary" className="shadow-lg shadow-brand-primary/20" onClick={() => router.push('/community/new-post')}>Create Post</Button>
                    </div>
                </div>

                {/* 2. Setup Checklist (Compact & Dismissible) */}
                {checklistVisible && progress < 100 && (
                    <div className="bg-white border border-gray-100 rounded-studio p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-studio animate-fade-in relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-primary to-brand-secondary"></div>
                        <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-secondary font-bold text-lg relative">
                                <svg className="absolute inset-0 w-full h-full -rotate-90 text-brand-accent" viewBox="0 0 36 36">
                                    <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                    <path className="text-brand-secondary" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />
                                </svg>
                                {progress === 100 ? '✓' : `${progress}%`}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-lg text-brand-dark">Setup Progress</div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            {checklistItems.map((item, i) => (
                                                <div key={i} className={`text-sm flex items-center gap-1.5 ${item.done ? 'text-emerald-600 line-through opacity-60' : 'text-brand-dark font-medium'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${item.done ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                                    {item.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Action Button for Next Step */}
                                    {!stats.checklist.isDeployed && address && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="hidden md:flex shadow-md shadow-brand-primary/20"
                                            onClick={() => router.push('/dashboard/settings')} // Direct to settings to deploy
                                        >
                                            Deploy Contract
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setChecklistVisible(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></Button>
                    </div>
                )}

                {/* 3. KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card variant="surface" className="p-6 bg-white rounded-studio shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Total Revenue</span>
                            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary"><Wallet size={20} /></div>
                        </div>
                        <div className="text-3xl font-bold text-brand-dark mb-2 tracking-tight">{formatPrice(stats.totalRevenue)}</div>
                        <div className="text-sm font-medium text-emerald-500 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">+0% from last month</div>
                    </Card>

                    <Card variant="surface" className="p-6 bg-white rounded-studio shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Active Members</span>
                            <div className="p-2 bg-brand-secondary/10 rounded-lg text-brand-secondary"><Users size={20} /></div>
                        </div>
                        <div className="text-3xl font-bold text-brand-dark mb-2 tracking-tight">{stats.activeMembers}</div>
                        <div className="text-sm font-medium text-emerald-500 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">+0 new this week</div>
                    </Card>

                    <Card variant="surface" className="p-6 bg-white rounded-studio shadow-sm hover:shadow-md transition-shadow border border-gray-100 md:col-span-2 lg:col-span-1">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">Monthly Recurring</span>
                            <div className="p-2 bg-brand-accent/10 rounded-lg text-brand-accent-dark"><LayoutDashboard size={20} /></div>
                        </div>
                        <div className="text-3xl font-bold text-brand-dark mb-2 tracking-tight">{formatPrice(stats.monthlyRecurring)}</div>
                        <div className="text-sm font-medium text-brand-muted">Estimated revenue</div>
                    </Card>
                </div>

                {/* 4. Main Content Grid: Chart + Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Revenue Chart or Empty State */}
                    <Card variant="surface" className="bg-white rounded-studio shadow-studio p-8 lg:col-span-2 border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-brand-dark">Revenue Growth</h3>
                            {stats.totalRevenue > 0 && (
                                <select className="text-sm p-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 outline-none focus:border-brand-primary">
                                    <option>Last 6 Months</option>
                                </select>
                            )}
                        </div>

                        <div className="flex-1 min-h-[300px] flex flex-col justify-center items-center rounded-2xl bg-brand-light/50 border border-dashed border-gray-200">
                            {stats.totalRevenue > 0 ? (
                                <RevenueChart data={stats.history} />
                            ) : (
                                <div className="text-center p-8 max-w-sm">
                                    <div className="text-5xl mb-4 opacity-50 grayscale">🚀</div>
                                    <h4 className="text-lg font-bold text-brand-dark mb-2">Start your journey</h4>
                                    <p className="text-brand-muted mb-6 leading-relaxed">
                                        Launch your first membership tier to start earning revenue from your fans.
                                    </p>
                                    <Button onClick={() => router.push('/community/manage-tiers')} variant="secondary" className="bg-white border border-gray-200 shadow-sm hover:border-brand-primary">Create Tier</Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Quick Actions List (Clean White Style) */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-lg font-bold text-brand-dark mb-2 px-1">Quick Actions</h3>

                        {[
                            { icon: <PenTool size={20} className="text-brand-primary" />, title: 'New Announcement', desc: 'Post an update', path: '/community/new-post' },
                            { icon: <Users size={20} className="text-brand-secondary" />, title: 'Manage Tiers', desc: 'Add a new plan', path: '/community/manage-tiers' },
                            { icon: <Settings size={20} className="text-gray-500" />, title: 'Settings', desc: 'Update profile', path: '/dashboard/settings' }
                        ].map((action, i) => (
                            <div
                                key={i}
                                onClick={() => router.push(action.path)}
                                className="group flex items-center gap-4 p-4 bg-white border border-transparent hover:border-brand-primary/20 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-brand-light transition-colors flex items-center justify-center">
                                    {action.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-brand-dark text-sm group-hover:text-brand-primary transition-colors">{action.title}</div>
                                    <div className="text-xs text-brand-muted">{action.desc}</div>
                                </div>
                                <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-primary transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
