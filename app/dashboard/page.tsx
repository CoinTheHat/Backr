'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Button from '../components/Button';
import Card from '../components/Card';
import WalletButton from '../components/WalletButton';
import { useRouter } from 'next/navigation';
import { FACTORY_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { Address } from 'viem';

export default function Dashboard() {
    const { address, isConnected } = useAccount();
    const router = useRouter();

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

    const [stats, setStats] = useState({ activeMembers: 0, monthlyRevenue: '0.00', totalWithdrawals: '0.00' });
    const [isInitializing, setIsInitializing] = useState(false);

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
            // Trigger a refetch to update the UI specifically for the deployment step
            refetchProfile();

            // Save the deployed contract address to database
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

    // If connected but no profile, show onboarding "Become a Creator"
    // BUT user said "no email etc, just wallet".
    // So we just assume they are a creator if they are here?
    // Or we show a simple "Setup Profile" form if empty.

    // Check local DB for profile
    const [profile, setProfile] = useState<any>(null);
    const [hasTiers, setHasTiers] = useState(false);

    useEffect(() => {
        if (address) {
            fetch('/api/creators')
                .then(res => res.json())
                .then(creators => {
                    const found = creators.find((c: any) => c.address === address);
                    setProfile(found);
                });

            // Check for tiers
            fetch(`/api/tiers?address=${address}`)
                .then(res => res.json())
                .then(tiers => {
                    setHasTiers(tiers && tiers.length > 0);
                });
        }
    }, [address]);

    if (!isConnected) {
        return (
            <div style={{ padding: '48px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Please Connect Wallet</h2>
                <WalletButton /> {/* Replaced generic button with WalletButton for consistency */}
            </div>
        );
    }

    if (!profile) {
        // Auto-create or Prompt
        // For MVP, lets just auto-initialize a profile in DB if not found, or show "Create Profile"
        return (
            <div style={{ maxWidth: '600px', margin: '48px auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Welcome, Creator!</h1>
                <p style={{ color: '#a1a1aa', marginBottom: '32px' }}>Let's set up your profile to start receiving payments on Mantle.</p>
                <Card>
                    <div style={{ marginBottom: '24px' }}>
                        <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Wallet Connected</p>
                        <p style={{ fontFamily: 'monospace', color: '#65b3ad' }}>{address}</p>
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
                                    alert('Failed to create profile. Please check console for details.');
                                }
                            } catch (e) {
                                console.error(e);
                                setIsInitializing(false);
                                alert('Error connecting to server. Please try again.');
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

    // Calculate progress
    const steps = [
        { label: "Create Profile", done: !!profile },
        { label: "Deploy Contract", done: !!deployedAddress },
        { label: "Create First Tier", done: hasTiers }, // Check from Supabase
        { label: "Customize Public Page", done: !!(profile && profile.description) }
    ];

    // Quick check for tiers if not loaded yet
    // In real app we use a smarter hook. For MVP we can just check if we have tiers state or fetch logic.
    // Let's assume done if we are here for now or force check? 
    // We didn't load tiers in this component yet. 
    // Let's rely on simple localstorage or just 'false' to encourage them to click it?
    // Actually we can just hardcode 'false' for 'Create First Tier' to nudge them, or fetch.

    const completedSteps = steps.filter(s => s.done).length;
    const progress = (completedSteps / steps.length) * 100;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>Dashboard</h1>

            {/* Onboarding Progress */}
            {progress < 100 && (
                <Card style={{ marginBottom: '48px', border: '1px solid #2e333d', background: 'linear-gradient(180deg, rgba(26,29,36,0) 0%, rgba(101,179,173,0.05) 100%)' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Setup Progress</h2>
                            <span style={{ color: '#65b3ad', fontWeight: 'bold' }}>{completedSteps}/{steps.length} Completed</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#2e333d', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: '#65b3ad', transition: 'width 0.5s ease-out' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{
                                padding: '16px',
                                borderRadius: '8px',
                                background: step.done ? 'rgba(101, 179, 173, 0.1)' : 'rgba(255,255,255,0.02)',
                                border: step.done ? '1px solid #65b3ad' : '1px solid transparent',
                                opacity: step.done ? 1 : 0.6
                            }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {step.done ? '✅' : '○'} {step.label}
                                </div>
                                {!step.done && (
                                    <Button
                                        variant="outline"
                                        style={{ marginTop: '12px', width: '100%', fontSize: '0.75rem', padding: '6px' }}
                                        onClick={() => {
                                            if (i === 1) handleDeploy();
                                            if (i === 2) router.push('/dashboard/membership');
                                            if (i === 3) router.push('/dashboard/settings');
                                        }}
                                        disabled={i === 1 && isConfirming}
                                    >
                                        {i === 1 && isConfirming ? 'Deploying...' : 'Complete Now'}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                <Card variant="neon-blue" noHover>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '8px' }}>Active Members</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(76, 201, 240, 0.5)' }}>
                        {stats.activeMembers}
                    </p>
                </Card>
                <Card variant="neon-pink" noHover>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '8px' }}>Monthly Revenue</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(247, 37, 133, 0.5)' }}>
                        ${stats.monthlyRevenue}
                    </p>
                </Card>
                <Card variant="neon-green" noHover>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', marginBottom: '8px' }}>Total Withdrawals</p>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', textShadow: '0 0 20px rgba(56, 176, 0, 0.5)' }}>
                        ${stats.totalWithdrawals}
                    </p>
                </Card>
            </div>

            {/* Activity Feed Placeholder */}
            <div style={{ marginTop: '48px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px' }}>Recent Activity</h3>
                <div style={{ padding: '32px', textAlign: 'center', border: '1px dashed #2e333d', borderRadius: '12px', color: '#52525b' }}>
                    No activity yet. Share your page to get started!
                </div>
            </div>
        </div>
    );
}
