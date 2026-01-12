'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Button from '../components/Button';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';
import { FACTORY_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { Address } from 'viem';
import { useToast } from '../components/Toast';

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const { showToast, ToastComponent } = useToast();

    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const [deployedAddress, setDeployedAddress] = useState<Address | null>(null);

    // Check if already deployed (read from Factory)
    const { data: existingProfile, refetch: refetchProfile } = useReadContract({
        address: FACTORY_ADDRESS as Address,
        abi: FACTORY_ABI,
        functionName: 'getProfile',
        args: [address],
    });

    const [stats, setStats] = useState({ activeMembers: 0, monthlyRevenue: '0.00' });
    const [isInitializing, setIsInitializing] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [hasTiers, setHasTiers] = useState(false);

    // Fetch real stats
    useEffect(() => {
        if (!address) return;
        fetch(`/api/stats?creator=${address}`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setStats(data);
            })
            .catch(err => console.error(err));
    }, [address]);

    useEffect(() => {
        if (existingProfile && existingProfile !== '0x0000000000000000000000000000000000000000') {
            setDeployedAddress(existingProfile as Address);
        }
    }, [existingProfile]);

    const handleDeploy = async () => {
        writeContract({
            address: FACTORY_ADDRESS as Address,
            abi: FACTORY_ABI,
            functionName: 'createProfile',
            args: ['0x0000000000000000000000000000000000000000'] // native MNT payment
        });
    };

    // When confirmed, save to our DB
    useEffect(() => {
        if (isConfirmed && address && existingProfile) {
            refetchProfile();
            const contractAddress = existingProfile as string;
            fetch('/api/creators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    name: `Creator ${address.slice(0, 6)}`,
                    contractAddress: contractAddress
                })
            });
        }
    }, [isConfirmed, address, existingProfile, refetchProfile]);

    useEffect(() => {
        if (address) {
            fetch('/api/creators?includePending=true')
                .then(res => res.json())
                .then(creators => {
                    const found = creators.find((c: any) => c.address === address);
                    setProfile(found);
                });

            fetch(`/api/tiers?address=${address}`)
                .then(res => res.json())
                .then(tiers => {
                    setHasTiers(tiers && tiers.length > 0);
                });
        }
    }, [address]);

    const steps = [
        { label: "Create Profile", description: "Initialize your creator account", done: true },
        { label: "Deploy Contract", description: "Launch your smart contract on Mantle", done: !!(profile?.contractAddress && profile.contractAddress.length > 0) },
        { label: "Create First Tier", description: "Set up membership levels", done: hasTiers === true },
        { label: "Preview Public Page", description: "Check how your page looks", done: !!(profile && profile.description && profile.description !== 'New Creator') }
    ];

    const completedSteps = steps.filter(s => s.done).length;
    const progress = (completedSteps / steps.length) * 100;
    const isSetupComplete = progress === 100;
    // Default collapsed if complete
    const [showChecklist, setShowChecklist] = useState(!isSetupComplete);

    useEffect(() => {
        // If complete, ensure it starts hidden
        if (isSetupComplete) setShowChecklist(false);
    }, [isSetupComplete]);

    if (!isConnected) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <h2 className="text-h2" style={{ marginBottom: '24px', color: 'var(--color-text-primary)' }}>Please Connect Wallet</h2>
                <WalletButton />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ maxWidth: '600px', margin: '48px auto', textAlign: 'center' }}>
                {ToastComponent}
                <h1 className="text-h1" style={{ marginBottom: '24px', color: 'var(--color-text-primary)' }}>Welcome, Creator!</h1>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Let's set up your profile to start receiving payments on Mantle.</p>
                <Card padding="lg">
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>Wallet Connected</p>
                        <p style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{address}</p>
                    </div>
                    <Button
                        disabled={isInitializing}
                        onClick={async () => {
                            setIsInitializing(true);
                            try {
                                const res = await fetch('/api/creators', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ address, name: `Creator ${address?.slice(0, 6)}`, description: 'New Creator' })
                                });
                                if (res.ok) {
                                    window.location.reload();
                                } else {
                                    setIsInitializing(false);
                                    showToast('Failed to create profile.', 'error');
                                }
                            } catch (e) {
                                console.error(e);
                                setIsInitializing(false);
                                showToast('Error connecting to server. Please try again.', 'error');
                            }
                        }}
                        style={{ width: '100%', opacity: isInitializing ? 0.7 : 1 }}
                    >
                        {isInitializing ? 'Initializing...' : 'Initialize Dashboard'}
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="page-container">
            {ToastComponent}

            {/* Header - Simplified to avoid duplication with Layout Header */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-h2" style={{ color: 'var(--color-text-primary)' }}>Welcome back, {profile.name || 'Creator'}</h1>
                    <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)' }}>Here's what's happening with your page today.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/posts')}>+ Create Post</Button>
            </div>

            {/* Warning if no contract */}
            {!profile?.contractAddress && !isConfirming && (
                <div style={{
                    marginBottom: '32px', padding: '16px 24px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid var(--color-warning)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-warning)',
                    display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Action Required</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>You need to deploy your contract to start accepting memberships.</div>
                    </div>
                    <Button onClick={handleDeploy} size="sm" style={{ marginLeft: 'auto', background: 'var(--color-warning)', color: '#fff', border: 'none' }}>Deploy Contract</Button>
                </div>
            )}

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <StatCard
                    label="Active Members"
                    value={stats.activeMembers}
                    icon="👥"
                    subtext="vs last 30 days"
                    trend="neutral"
                />
                <StatCard
                    label="Monthly Revenue"
                    value={`$${stats.monthlyRevenue}`}
                    icon="💰"
                    subtext="vs last 30 days"
                    trend="up"
                />
                <StatCard
                    label="30-Day Growth"
                    value="+0%"
                    icon="📈"
                    subtext="vs previous period"
                    trend="neutral"
                />
            </div>

            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>

                {/* Left Column: Activity & Insights */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Getting Started (Collapsable) */}
                    {!isSetupComplete || showChecklist ? (
                        <Card padding="none" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>Getting Started</h3>
                                    <p className="text-caption">Complete these steps to launch.</p>
                                </div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{Math.round(progress)}%</div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-page)' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease' }}></div>
                            </div>

                            {steps.map((step, i) => (
                                <div key={i} style={{
                                    padding: '20px 24px',
                                    borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: step.done ? 'var(--color-bg-surface-hover)' : 'transparent',
                                }}>
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        border: step.done ? 'none' : '2px solid var(--color-border)',
                                        background: step.done ? 'var(--color-success)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '12px', fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {step.done ? '✓' : i + 1}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            textDecoration: step.done ? 'line-through' : 'none',
                                            color: step.done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'
                                        }}>
                                            {step.label}
                                        </div>
                                    </div>

                                    <div>
                                        {!step.done && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    if (i === 1) handleDeploy();
                                                    if (i === 2) router.push('/dashboard/membership');
                                                    if (i === 3) router.push(`/${address}`);
                                                }}
                                                disabled={i === 1 && isConfirming}
                                            >
                                                Start
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </Card>
                    ) : null}

                    {/* Revenue Insight Chart (Placeholder) */}
                    {isSetupComplete && (
                        <Card padding="lg">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>Revenue</h3>
                                <select style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-page)', fontSize: '0.85rem' }}>
                                    <option>Last 30 Days</option>
                                    <option>All Time</option>
                                </select>
                            </div>
                            <div style={{ height: '200px', width: '100%', background: 'linear-gradient(180deg, var(--color-bg-page) 0%, transparent 100%)', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '0', overflow: 'hidden' }}>
                                {/* Mock Chart Bars */}
                                {[40, 60, 30, 80, 50, 90, 70, 40, 60, 80, 50, 75].map((h, i) => (
                                    <div key={i} style={{ width: '6%', height: `${h}%`, background: i === 11 ? 'var(--color-primary)' : 'var(--color-primary-light)', borderRadius: '4px 4px 0 0', opacity: i === 11 ? 1 : 0.6 }}></div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Recent Activity */}
                    <Card padding="lg">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 className="text-h3" style={{ color: 'var(--color-text-primary)' }}>Recent Activity</h3>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>

                        {/* Empty State */}
                        <div style={{ textAlign: 'center', padding: '32px 0' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--color-bg-page)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.5rem', color: 'var(--color-text-secondary)' }}>
                                🔔
                            </div>
                            <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>No recent activity</p>
                            <p className="text-body-sm" style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>New memberships and purchases will appear here.</p>
                            <Button variant="outline" size="sm">Refresh</Button>
                        </div>
                    </Card>

                </div>

                {/* Right Column: Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <Card padding="md" style={{ background: 'var(--color-bg-surface)' }}>
                        <h3 className="text-h3" style={{ marginBottom: '16px', color: 'var(--color-text-primary)' }}>Quick Actions</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                {
                                    label: 'Write a Post',
                                    desc: 'Share updates',
                                    icon: '✍️',
                                    bg: 'var(--color-primary-light)',
                                    action: () => router.push('/dashboard/posts')
                                },
                                {
                                    label: 'Edit Tiers',
                                    desc: 'Manage memberships',
                                    icon: '💎',
                                    bg: 'var(--color-accent-light)',
                                    action: () => router.push('/dashboard/membership')
                                },
                                {
                                    label: 'Public Page',
                                    desc: 'View storefront',
                                    icon: '👀',
                                    bg: 'var(--color-bg-page)',
                                    action: () => window.open(`/${address}`, '_blank')
                                }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={item.action}
                                    className="quick-action-item"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: '1px solid transparent'
                                    }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '10px',
                                        background: item.bg,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{item.label}</div>
                                        <div className="text-caption">{item.desc}</div>
                                    </div>
                                    <span style={{ color: 'var(--color-text-tertiary)', fontSize: '1.2rem' }}>→</span>
                                </div>
                            ))}
                        </div>

                    </Card>

                    {/* Minimized Checklist Link if Hidden */}
                    {isSetupComplete && !showChecklist && (
                        <div
                            onClick={() => setShowChecklist(true)}
                            style={{
                                cursor: 'pointer',
                                padding: '16px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px dashed var(--color-border)',
                                textAlign: 'center',
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
                        >
                            Open Setup Checklist (100% Complete)
                        </div>
                    )}
                </div>
            </div>


        </div>
    );
}
