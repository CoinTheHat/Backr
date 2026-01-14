'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseEventLogs } from 'viem';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import SectionHeader from '../../components/SectionHeader';
import { useToast } from '../../components/Toast';
import DiscoverySettings from './components/DiscoverySettings';
import { FACTORY_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { useCommunity } from '../../context/CommunityContext'; // Added

const MNT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Native Token
const USDC_ADDRESS = '0x201Eba5CC46D216Ce6DC03F6a759e8E766e9560e'; // Mantle Sepolia USDC (Example) - Replace with correct if needed

export default function SettingsPage() {
    const { address, isConnected } = useAccount();
    const { showToast, ToastComponent } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Initial State (for comparison)
    const [initialState, setInitialState] = useState<any>(null);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [socials, setSocials] = useState({ twitter: '', website: '', instagram: '', youtube: '' });
    const [payoutToken, setPayoutToken] = useState('MNT');

    // Contract State
    const [contractAddress, setContractAddress] = useState<string | null>(null);

    // Danger Zone Modal
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetConfirmation, setResetConfirmation] = useState('');

    // Deployment Hooks
    const { data: hash, writeContract, isPending: isDeploying, error: deployError } = useWriteContract();
    const { isLoading: isWaiting, isSuccess: isDeployed, data: receipt } = useWaitForTransactionReceipt({ hash });

    // Community Context to update Sidebar
    const { refreshData } = useCommunity();

    // Verify Deployment on Factory
    const { data: factoryProfile } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getProfile',
        args: [address],
    });

    useEffect(() => {
        if (!factoryProfile) return;
        const zeroAddress = '0x0000000000000000000000000000000000000000';

        // Normalize for case-insensitive comparison
        const profileAddress = String(factoryProfile).toLowerCase();

        if (profileAddress === zeroAddress) {
            console.log("Factory returned 0x0. Resetting local state.");
            setContractAddress(null);
        } else {
            console.log("Factory returned valid profile:", profileAddress);
            setContractAddress(profileAddress);
        }
    }, [factoryProfile]);

    useEffect(() => {
        if (!address) return;
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const me = creators.find((c: any) => c.address === address);
                if (me) {
                    const defaultSocials = { twitter: '', website: '', instagram: '', youtube: '' };
                    const data = {
                        name: me.name || '',
                        description: me.description || '',
                        avatarUrl: me.avatarUrl || '',
                        socials: { ...defaultSocials, ...me.socials },
                        payoutToken: me.payoutToken || 'MNT'
                    };
                    setName(data.name);
                    setDescription(data.description);
                    setAvatarUrl(data.avatarUrl);
                    setSocials(data.socials);
                    setPayoutToken(data.payoutToken);
                    setContractAddress(me.contractAddress);
                    setInitialState(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [address]);

    // Handle Deployment Success
    useEffect(() => {
        if (isDeployed && receipt) {
            // Find Log
            // Event ProfileCreated(address indexed creator, address profileContract)
            // We can iterate logs
            // For simplicity, we assume the last log from our factory is the one, or parse use viem
            try {
                const logs = parseEventLogs({
                    abi: FACTORY_ABI,
                    eventName: 'ProfileCreated',
                    logs: receipt.logs,
                });

                if (logs.length > 0) {
                    // @ts-ignore
                    const newContract = logs[0].args.profileContract;
                    console.log('Deployed Contract:', newContract);

                    // Save to API
                    fetch('/api/creators', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address, contractAddress: newContract })
                    }).then(res => {
                        if (res.ok) {
                            setContractAddress(newContract);
                            refreshData(); // Update global state (sidebar)
                            showToast('Contract deployed successfully!', 'success');
                        }
                    });
                }
            } catch (e) {
                console.error('Log parse error', e);
                showToast('Contract deployed but failed to verify address. Please refresh.', 'warning');
            }
        }
    }, [isDeployed, receipt]);

    useEffect(() => {
        if (deployError) {
            showToast('Deployment failed: ' + (deployError.message || 'Unknown error'), 'error');
        }
    }, [deployError]);

    // Check for changes
    const hasChanges = initialState && (
        name !== initialState.name ||
        description !== initialState.description ||
        avatarUrl !== initialState.avatarUrl ||
        socials.twitter !== initialState.socials.twitter ||
        socials.website !== initialState.socials.website ||
        socials.instagram !== initialState.socials.instagram ||
        socials.youtube !== initialState.socials.youtube ||
        payoutToken !== initialState.payoutToken
    );

    const handleSave = async () => {
        if (!address) return;
        setSaving(true);
        try {
            const res = await fetch('/api/creators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address, name, description, avatarUrl, socials, payoutToken
                })
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Profile updated successfully!', 'success');
                setInitialState({ name, description, avatarUrl, socials: { ...socials }, payoutToken });
            } else {
                showToast(data.error || 'Failed to update profile.', 'error');
            }
        } catch (e) { console.error(e); showToast('Error updating.', 'error'); }
        finally { setSaving(false); }
    };

    const handleDeploy = () => {
        const token = payoutToken === 'USDC' ? USDC_ADDRESS : MNT_ADDRESS;
        writeContract({
            address: FACTORY_ADDRESS as `0x${string}`,
            abi: FACTORY_ABI,
            functionName: 'createProfile',
            args: [token],
        });
    };

    const handleResetContract = async () => {
        if (resetConfirmation !== 'RESET') return;
        try {
            const res = await fetch('/api/creators', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, contractAddress: null })
            });
            if (res.ok) window.location.reload();
            else showToast('Failed to reset.', 'error');
        } catch (e) { console.error(e); showToast('Error resetting.', 'error'); }
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(address || '');
        showToast('Address copied!', 'success');
    };

    if (!isConnected) return <div style={{ padding: '64px', textAlign: 'center' }}>Please connect wallet to access settings.</div>;
    if (loading) return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Loading profile...</div>;

    return (
        <div className="page-container" style={{ paddingBottom: '120px' }}>
            {ToastComponent}
            <SectionHeader
                title="Settings"
                description="Manage your identity, payouts and integrations."
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>

                {/* 0. DEPLOYMENT STATUS (Critical) */}
                <Card variant="surface" padding="lg" style={{ borderColor: contractAddress ? 'var(--color-success)' : 'var(--color-border)', borderWidth: contractAddress ? '2px' : '1px' }}>
                    <h3 className="text-h3" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        Creator Status
                        {contractAddress ? (
                            <span style={{ fontSize: '0.75rem', background: 'var(--color-success)', color: '#fff', padding: '4px 12px', borderRadius: '20px' }}>LIVE</span>
                        ) : (
                            <span style={{ fontSize: '0.75rem', background: 'var(--color-text-tertiary)', color: '#fff', padding: '4px 12px', borderRadius: '20px' }}>NOT DEPLOYED</span>
                        )}
                    </h3>

                    {!contractAddress ? (
                        <div className="bg-brand-light p-6 rounded-xl border border-dashed border-brand-primary/30">
                            <p className="text-brand-dark mb-4 font-medium">To start earning, you must deploy your personal membership contract on Mantle.</p>
                            <div className="text-sm text-brand-muted mb-6">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Set your tiers and perks later</li>
                                    <li>Automated payouts (Fees: 5% Platform)</li>
                                    <li>Full ownership of your community</li>
                                </ul>
                            </div>
                            <Button
                                variant="primary"
                                className="w-full justify-center shadow-glow"
                                onClick={handleDeploy}
                                disabled={isDeploying || isWaiting}
                            >
                                {isDeploying || isWaiting ? 'Deploying...' : 'Deploy Membership Contract'}
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-brand-muted mb-4">Your contract is deployed and ready to accept new members.</p>
                            <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between mb-3">
                                <code className="text-xs text-brand-primary" title={contractAddress}>
                                    {contractAddress.slice(0, 12)}...{contractAddress.slice(-10)}
                                </code>
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    <button onClick={() => { navigator.clipboard.writeText(contractAddress); showToast('Copied!', 'success'); }} className="text-xs font-bold hover:underline" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Copy</button>
                                    <a href={`https://sepolia.mantlescan.xyz/address/${contractAddress}`} target="_blank" className="text-xs font-bold hover:underline" style={{ color: 'var(--color-primary)' }}>View</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-brand-muted bg-blue-50 p-2 rounded border border-blue-100">
                                <span>ℹ️</span> Platform Fee: <strong>5%</strong> (Verified)
                            </div>
                        </div>
                    )}
                </Card>

                {/* 1. PUBLIC PROFILE */}
                <Card variant="surface" padding="lg" style={{ height: 'fit-content' }}>
                    <h3 className="text-h3" style={{ marginBottom: '24px' }}>Public Profile</h3>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '24px' }}>
                        <div style={{ position: 'relative', width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                            <img src={avatarUrl || 'https://via.placeholder.com/150'} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div className="avatar-overlay">
                                <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>Change</span>
                                <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setAvatarUrl(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                            </div>
                        </div>
                        <div style={{ paddingTop: '8px' }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>Profile Picture</div>
                            <div className="text-caption" style={{ marginTop: '4px' }}>Min 400x400px. JPG, PNG or WEBP.</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Input label="Display Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Crypto Artist" />
                        <div>
                            <label className="text-caption" style={{ fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Bio</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell your story..." className="focus-ring" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-page)', minHeight: '120px', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* 2. DISCOVERY & TAXONOMY */}
                <DiscoverySettings address={address || ''} />

                {/* 3. LINKS & INTEGRATIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <Card variant="surface" padding="lg">
                        <h3 className="text-h3" style={{ marginBottom: '24px' }}>Social Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Twitter / X"
                                value={socials.twitter}
                                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                                placeholder="@username"
                                icon={<span style={{ fontSize: '1.1rem' }}>𝕏</span>}
                            />
                            <Input
                                label="Instagram"
                                value={socials.instagram}
                                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                                placeholder="@username"
                                icon={<span style={{ fontSize: '1.2rem' }}>📸</span>}
                            />
                            <Input
                                label="YouTube"
                                value={socials.youtube}
                                onChange={(e) => setSocials({ ...socials, youtube: e.target.value })}
                                placeholder="Channel URL"
                                icon={<span style={{ fontSize: '1.2rem' }}>▶️</span>}
                            />
                            <Input
                                label="Website"
                                value={socials.website}
                                onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                                placeholder="https://yoursite.com"
                                icon={<span style={{ fontSize: '1.2rem' }}>🌐</span>}
                            />
                        </div>
                    </Card>

                    <Card variant="surface" padding="lg">
                        <h3 className="text-h3" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Wallet & Payouts <span style={{ fontSize: '0.7rem', background: 'var(--color-success)', color: '#fff', padding: '2px 8px', borderRadius: '12px' }}>CONNECTED</span>
                        </h3>

                        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div className="text-caption" style={{ marginBottom: '6px', fontWeight: 700 }}>Connected Address</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <code style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{address?.slice(0, 6)}...{address?.slice(-4)}</code>
                                <Button variant="ghost" size="sm" onClick={copyAddress} title="Copy Address">📋</Button>
                                <a href={`https://sepolia.mantlescan.xyz/address/${address}`} target="_blank" style={{ fontSize: '0.9rem', color: 'var(--color-primary)', textDecoration: 'none' }} title="View on Explorer">↗</a>
                            </div>
                        </div>

                        <div>
                            <label className="text-caption" style={{ fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Payout Currency</label>
                            <select className="focus-ring" value={payoutToken} onChange={(e) => setPayoutToken(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-page)', cursor: 'pointer' }}>
                                <option value="MNT">MNT (Native Token)</option>
                                <option value="USDC">USDC (Mantle)</option>
                            </select>
                            <p className="text-caption" style={{ marginTop: '8px' }}>{payoutToken === 'MNT' ? 'Zero-fee automatic withdrawals.' : 'Requires extra approval step.'}</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* 3. DANGER ZONE */}
            <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ border: '1px solid #FECACA', background: '#FEF2F2', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid #FECACA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#991B1B' }}>Danger Zone</h3>
                            <p style={{ fontSize: '0.9rem', color: '#B91C1C', marginTop: '4px' }}>Irreversible actions managed here.</p>
                        </div>
                    </div>
                    <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ fontWeight: 600, color: '#7F1D1D' }}>Reset Connection</div>
                            <div style={{ fontSize: '0.85rem', color: '#991B1B' }}>This will disconnect your current fan page and require a re-deployment.</div>
                        </div>
                        <Button style={{ background: '#DC2626', color: '#fff', borderColor: '#DC2626' }} onClick={() => setIsResetModalOpen(true)}>Reset Connection</Button>
                    </div>
                </div>
            </div>

            {/* STICKY SAVE BAR */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                borderTop: '1px solid var(--color-border)',
                padding: '16px 24px', zIndex: 90, // Lower than modals (1000)
                transform: hasChanges ? 'translateY(0)' : 'translateY(100%)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>You have unsaved changes</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="ghost" onClick={() => window.location.reload()}>Discard</Button>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* RESET MODAL */}
            {isResetModalOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                    <div className="card-surface" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
                        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                            <h2 className="text-h2" style={{ color: 'var(--color-error)' }}>Reset Connection?</h2>
                            <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                                <b>Warning:</b> This action cannot be undone. You will lose access to your current page configuration.
                            </p>
                            <p className="text-caption" style={{ marginTop: '12px' }}>To confirm, please type <strong>RESET</strong> below.</p>
                        </div>
                        <Input value={resetConfirmation} onChange={(e) => setResetConfirmation(e.target.value)} placeholder="Type RESET" style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold' }} />
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Button variant="ghost" style={{ flex: 1 }} onClick={() => { setIsResetModalOpen(false); setResetConfirmation(''); }}>Cancel</Button>
                            <Button style={{ flex: 1, background: resetConfirmation === 'RESET' ? 'var(--color-error)' : 'var(--color-text-tertiary)', borderColor: 'transparent', color: 'white', cursor: resetConfirmation === 'RESET' ? 'pointer' : 'not-allowed' }} disabled={resetConfirmation !== 'RESET'} onClick={handleResetContract}>Confirm Reset</Button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; cursor: pointer; }
                .avatar-overlay:hover { opacity: 1; }
                @media (max-width: 640px) {
                    .settings-grid { grid-template-columns: 1fr !important; }
                }
            `}} />
        </div>
    );
}
