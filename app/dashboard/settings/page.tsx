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
                    address,
                    name,
                    description,
                    avatarUrl,
                    socials,
                    payoutToken
                })
            });

            if (res.ok) {
                showToast('Profile updated successfully!', 'success');
                setInitialState({
                    name,
                    description,
                    avatarUrl,
                    socials: { ...socials },
                    payoutToken
                });
            } else {
                showToast('Failed to update profile.', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Error updating profile.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleResetContract = async () => {
        if (resetConfirmation !== 'RESET') return;

        try {
            const res = await fetch('/api/creators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    contractAddress: null // Reset contract address
                })
            });
            if (res.ok) {
                window.location.reload();
            } else {
                showToast('Failed to reset.', 'error');
            }
        } catch (e) { console.error(e); showToast('Error resetting.', 'error'); }
    };

    if (!isConnected) return <div style={{ padding: '48px', textAlign: 'center' }}>Please connect wallet.</div>;
    if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading settings...</div>;

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            {ToastComponent}

            {/* STICKY UNSAVED CHANGES INDICATOR (Overlay style or top bar) */}
            {hasChanges && (
                <div style={{
                    position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--color-warning)', color: '#000', padding: '8px 24px',
                    borderRadius: '20px', fontWeight: 'bold', fontSize: '0.875rem', zIndex: 90,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    Unsaved Changes
                </div>
            )}

            <SectionHeader
                title="Settings"
                description="Manage your profile, payout methods, and account connection."
                action={{
                    label: saving ? 'Saving...' : 'Save Changes',
                    onClick: handleSave,
                    disabled: !hasChanges || saving,
                    variant: hasChanges ? 'primary' : 'secondary'
                }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

                {/* 1. PUBLIC PROFILE (Left Column on Desktop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <Card variant="surface">
                        <h3 className="text-h3" style={{ marginBottom: '24px' }}>Public Profile</h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
                            {/* Avatar */}
                            <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'var(--color-bg-page)', border: '1px solid var(--color-border)' }}>
                                <img
                                    src={avatarUrl || 'https://via.placeholder.com/150'}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div className="avatar-overlay" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', cursor: 'pointer' }}>
                                    <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>Change</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => { setAvatarUrl(reader.result as string); };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="text-body" style={{ fontWeight: 600 }}>Profile Picture</div>
                                <div className="text-caption">Supports JPG, PNG, WEBP (Max 1MB)</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Display Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Display Name"
                            />
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Bio</label>
                                <textarea
                                    className="focus-ring"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell your story..."
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)', background: 'var(--color-bg-page)',
                                        color: 'var(--color-text-primary)', minHeight: '100px', resize: 'vertical'
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card variant="surface">
                        <h3 className="text-h3" style={{ marginBottom: '24px' }}>Links</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '42px', fontSize: '1rem' }}>🐦</span>
                                <Input
                                    label="Twitter / X"
                                    value={socials.twitter}
                                    onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                                    placeholder="@username"
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '16px', top: '42px', fontSize: '1rem' }}>🌐</span>
                                <Input
                                    label="Website"
                                    value={socials.website}
                                    onChange={(e) => setSocials({ ...socials, website: e.target.value })}
                                    placeholder="https://yoursite.com"
                                    style={{ paddingLeft: '44px' }}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* 2. SETTINGS & WALLET (Right Column on Desktop) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* PAYOUTS */}
                    <Card variant="surface">
                        <h3 className="text-h3" style={{ marginBottom: '24px' }}>Payout Settings</h3>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Payout Token</label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    className="focus-ring"
                                    value={payoutToken}
                                    onChange={(e) => setPayoutToken(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--color-border)', background: 'var(--color-bg-page)',
                                        color: 'var(--color-text-primary)', appearance: 'none', cursor: 'pointer'
                                    }}
                                >
                                    <option value="MNT">MNT (Native)</option>
                                    <option value="USDC">USDC (Mantle)</option>
                                </select>
                                <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.8rem' }}>▼</span>
                            </div>
                            <p className="text-caption" style={{ marginTop: '8px', lineHeight: 1.4 }}>
                                {payoutToken === 'MNT'
                                    ? 'Recommended. You receive MNT directly with minimal fees.'
                                    : 'You receive USDC. Requires an extra approval transaction.'}
                            </p>
                        </div>
                    </Card>

                    {/* WALLET */}
                    <Card variant="surface">
                        <h3 className="text-h3" style={{ marginBottom: '24px' }}>Wallet Connection</h3>
                        <div style={{ padding: '16px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div className="text-caption" style={{ marginBottom: '4px', textTransform: 'uppercase', fontWeight: 700 }}>Connected Address</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{address}</code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(address || '')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
                                    title="Copy"
                                >
                                    📋
                                </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Connected to Mantle Sepolia</span>
                            </div>
                        </div>
                    </Card>

                    {/* DANGER ZONE */}
                    <Card style={{ marginTop: 'auto', border: '1px solid #fee2e2', background: '#fef2f2' }}>
                        <h3 className="text-h3" style={{ color: 'var(--color-error)', marginBottom: '16px' }}>Danger Zone</h3>
                        <p className="text-body-sm" style={{ marginBottom: '16px', color: '#b91c1c' }}>
                            Resetting your contract link is irreversible. It will disconnect your fan page from the blockchain data until you re-deploy.
                        </p>
                        <Button
                            onClick={() => setIsResetModalOpen(true)}
                            style={{ width: '100%', background: 'var(--color-error)', color: 'white', borderColor: 'var(--color-error)' }}
                        >
                            Reset & Re-Deploy
                        </Button>
                    </Card>
                </div>
            </div>

            {/* RESET CONFIRMATION MODAL */}
            {isResetModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(4px)'
                }}>
                    <div className="card-surface" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                        <h2 className="text-h2" style={{ color: 'var(--color-error)', marginBottom: '12px' }}>Are you absolutely sure?</h2>
                        <p className="text-body-sm" style={{ marginBottom: '24px' }}>
                            This action cannot be undone. This will permanently unlink your current contract.
                            <br /><br />
                            Please type <strong>RESET</strong> to confirm.
                        </p>
                        <Input
                            value={resetConfirmation}
                            onChange={(e) => setResetConfirmation(e.target.value)}
                            placeholder="Type RESET"
                            style={{ marginBottom: '24px' }}
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <Button variant="ghost" onClick={() => { setIsResetModalOpen(false); setResetConfirmation(''); }}>Cancel</Button>
                            <Button
                                onClick={handleResetContract}
                                disabled={resetConfirmation !== 'RESET'}
                                style={{ background: resetConfirmation === 'RESET' ? 'var(--color-error)' : 'var(--color-text-tertiary)', borderColor: 'transparent', color: 'white' }}
                            >
                                Confirm Reset
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .avatar-overlay:hover { opacity: 1 !important; }
            `}} />
        </div>
    );
}
