'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import SectionHeader from '../../components/SectionHeader';
import { useToast } from '../../components/Toast';

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
    const [socials, setSocials] = useState({ twitter: '', website: '' });
    const [payoutToken, setPayoutToken] = useState('MNT');

    // Danger Zone Modal
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetConfirmation, setResetConfirmation] = useState('');

    useEffect(() => {
        if (!address) return;
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const me = creators.find((c: any) => c.address === address);
                if (me) {
                    const data = {
                        name: me.name || '',
                        description: me.description || '',
                        avatarUrl: me.avatarUrl || '',
                        socials: me.socials || { twitter: '', website: '' },
                        payoutToken: me.payoutToken || 'MNT'
                    };
                    setName(data.name);
                    setDescription(data.description);
                    setAvatarUrl(data.avatarUrl);
                    setSocials(data.socials);
                    setPayoutToken(data.payoutToken);
                    setInitialState(data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [address]);

    // Check for changes
    const hasChanges = initialState && (
        name !== initialState.name ||
        description !== initialState.description ||
        avatarUrl !== initialState.avatarUrl ||
        socials.twitter !== initialState.socials.twitter ||
        socials.website !== initialState.socials.website ||
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

            if (res.ok) {
                showToast('Profile updated successfully!', 'success');
                setInitialState({ name, description, avatarUrl, socials: { ...socials }, payoutToken });
            } else {
                showToast('Failed to update profile.', 'error');
            }
        } catch (e) { console.error(e); showToast('Error updating.', 'error'); }
        finally { setSaving(false); }
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
                    </div>
                </Card>

                {/* 2. LINKS & INTEGRATIONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <Card variant="surface" padding="lg">
                        <h3 className="text-h3" style={{ marginBottom: '24px' }}>Social Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '42px', fontSize: '1.2rem', opacity: 0.6 }}>✖</span>
                                <Input label="Twitter / X" value={socials.twitter} onChange={(e) => setSocials({ ...socials, twitter: e.target.value })} placeholder="@username" style={{ paddingLeft: '48px' }} />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '42px', fontSize: '1.2rem', opacity: 0.6 }}>🌐</span>
                                <Input label="Website" value={socials.website} onChange={(e) => setSocials({ ...socials, website: e.target.value })} placeholder="https://yoursite.com" style={{ paddingLeft: '48px' }} />
                            </div>
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
                            <div style={{ fontWeight: 600, color: '#7F1D1D' }}>Reset Contract Deployment</div>
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
                padding: '16px 24px', zIndex: 100,
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
                                This will unlink your current contract and data. To confirm, please type <strong>RESET</strong> below.
                            </p>
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
            `}} />
        </div>
    );
}
