'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Button from '../components/Button';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
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
    const [showChecklist, setShowChecklist] = useState(!isSetupComplete);

    if (!isConnected) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <h2 className="text-h2" style={{ marginBottom: '24px' }}>Please Connect Wallet</h2>
                <WalletButton />
            </div>
        );
    }

    if (!profile) {
        return (
            <div style={{ maxWidth: '600px', margin: '48px auto', textAlign: 'center' }}>
                {ToastComponent}
                <h1 className="text-h1" style={{ marginBottom: '24px' }}>Welcome, Creator!</h1>
                <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Let's set up your profile to start receiving payments on Mantle.</p>
                <Card padding="lg">
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Wallet Connected</p>
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
            <SectionHeader
                title="Overview"
                description="Track members, revenue, and quick actions."
            >
                <Button variant="secondary" onClick={() => window.open(`/${address}`, '_blank')}>View Public Page ↗</Button>
                <Button onClick={() => router.push('/dashboard/posts')}>Write a Post</Button>
            </SectionHeader>

            {/* Warning if no contract */}
            {!profile?.contractAddress && !isConfirming && (
                <div style={{ marginBottom: '32px', padding: '16px 24px', background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 'var(--radius-md)', color: '#92400E', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Action Required</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>You need to deploy your contract to start accepting memberships.</div>
                    </div>
                    <Button onClick={handleDeploy} size="sm" style={{ marginLeft: 'auto', background: '#F59E0B', color: '#fff', border: 'none' }}>Deploy Contract</Button>
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

                {/* Left Column: Getting Started */}
                <div>
                    {isSetupComplete && !showChecklist ? (
                        <Card padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-primary-light)', borderColor: 'var(--color-primary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '1.5rem' }}>🎉</span>
                                <div>
                                    <div style={{ fontWeight: 700, color: 'var(--color-primary-hover)' }}>You're all set up!</div>
                                    <div className="text-caption" style={{ color: 'var(--color-primary-hover)' }}>Your page is ready to accept members.</div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setShowChecklist(true)}>View Checklist</Button>
                        </Card>
                    ) : (
                        <Card padding="none" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="text-h3">Getting Started</h3>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>{Math.round(progress)}% Complete</div>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ width: '100%', height: '4px', background: 'var(--color-bg-page)' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.5s ease' }}></div>
                            </div>

                            {steps.map((step, i) => (
                                <div key={i} style={{
                                    padding: '24px',
                                    borderBottom: i < steps.length - 1 ? '1px solid var(--color-border)' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: step.done ? 'var(--color-bg-surface-hover)' : 'transparent',
                                    transition: 'background 0.2s'
                                }}>
                                    {/* Icon/Check */}
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        border: step.done ? 'none' : '2px solid var(--color-border)',
                                        background: step.done ? 'var(--color-success)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '16px', fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {step.done ? '✓' : i + 1}
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontWeight: 600,
                                            textDecoration: step.done ? 'line-through' : 'none',
                                            color: step.done ? 'var(--color-text-secondary)' : 'var(--color-text-primary)'
                                        }}>
                                            {step.label}
                                        </div>
                                        <div className="text-body-sm" style={{ color: 'var(--color-text-tertiary)' }}>{step.description}</div>
                                    </div>

                                    <div>
                                        {step.done ? (
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: '12px', background: 'var(--color-bg-page)', color: 'var(--color-text-secondary)' }}>DONE</span>
                                        ) : (
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
                                                {i === 1 && isConfirming ? 'Working...' : 'Start'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isSetupComplete && (
                                <div style={{ padding: '16px', textAlign: 'center' }}>
                                    <Button variant="ghost" size="sm" onClick={() => setShowChecklist(false)}>Hide Checklist</Button>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Recent Activity */}
                    <div style={{ marginTop: '32px' }}>
                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Recent Activity</h3>
                        <Card padding="lg" style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                            <div style={{ marginBottom: '16px', fontSize: '2rem' }}>📭</div>
                            <p>No recent activity yet.</p>
                            <p className="text-body-sm">When you get new members or publish posts, they'll show up here.</p>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <Card padding="md">
                        <h3 className="text-h3" style={{ marginBottom: '16px' }}>Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Write Post Tile */}
                            <div
                                onClick={() => router.push('/dashboard/posts')}
                                style={{
                                    padding: '16px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    transition: 'all 0.2s',
                                    background: 'var(--color-bg-surface)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-bg-surface-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-surface)'; }}
                            >
                                <span style={{ fontSize: '1.2rem', background: 'var(--color-primary-light)', padding: '8px', borderRadius: '8px' }}>✍️</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Write a Post</div>
                                    <div className="text-caption">Share updates with fans</div>
                                </div>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                            </div>

                            {/* Edit Tiers Tile */}
                            <div
                                onClick={() => router.push('/dashboard/membership')}
                                style={{
                                    padding: '16px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    transition: 'all 0.2s',
                                    background: 'var(--color-bg-surface)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-bg-surface-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-surface)'; }}
                            >
                                <span style={{ fontSize: '1.2rem', background: 'var(--color-accent-light)', padding: '8px', borderRadius: '8px' }}>💎</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Edit Tiers</div>
                                    <div className="text-caption">Manage prices & benefits</div>
                                </div>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                            </div>

                            {/* View Public Page Tile */}
                            <div
                                onClick={() => window.open(`/${address}`, '_blank')}
                                style={{
                                    padding: '16px',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    transition: 'all 0.2s',
                                    background: 'var(--color-bg-surface)'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-bg-surface-hover)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg-surface)'; }}
                            >
                                <span style={{ fontSize: '1.2rem', background: '#F3F4F6', padding: '8px', borderRadius: '8px' }}>👀</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Public Page</div>
                                    <div className="text-caption">See what others see</div>
                                </div>
                                <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                            </div>
                        </div>
                    </Card>

                    {/* Resources/Help (Optional extra placeholder) */}
                    <Card padding="md" style={{ background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #fff 100%)' }}>
                        <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>Need Help?</h4>
                        <p className="text-body-sm" style={{ marginBottom: '12px' }}>Check out our creator guide to grow your audience.</p>
                        <Button variant="outline" size="sm" style={{ background: '#fff' }}>Read Guide</Button>
                    </Card>

                </div>
            </div>

            <style jsx>{`
                @media (max-width: 900px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}
