'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';

export default function SettingsPage() {
    const { address, isConnected } = useAccount();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [socials, setSocials] = useState({ twitter: '', website: '' });
    const [payoutToken, setPayoutToken] = useState('MNT');

    useEffect(() => {
        if (!address) return;
        fetch('/api/creators')
            .then(res => res.json())
            .then(creators => {
                const me = creators.find((c: any) => c.address === address);
                if (me) {
                    setName(me.name || '');
                    setDescription(me.description || '');
                    setAvatarUrl(me.avatarUrl || '');
                    setSocials(me.socials || { twitter: '', website: '' });
                    setPayoutToken(me.payoutToken || 'MNT');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [address]);

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
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile.');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!isConnected) return <div style={{ padding: '48px', textAlign: 'center' }}>Please connect wallet.</div>;
    if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading settings...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px' }}>Settings</h1>

            <Card style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', color: '#fff' }}>Public Profile</h2>

                <div style={{ display: 'grid', gap: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '24px' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Avatar</label>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: avatarUrl ? `url(${avatarUrl}) center/cover` : '#2e333d', marginBottom: '12px', border: '2px solid #2e333d', position: 'relative', overflow: 'hidden' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setAvatarUrl(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                />
                                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', textAlign: 'center', padding: '4px', pointerEvents: 'none' }}>
                                    Change
                                </div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Click to upload (Max 1MB)</p>
                        </div>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <Input
                                label="Display Name"
                                value={name}
                                onChange={(e: any) => setName(e.target.value)}
                                placeholder="e.g. The Mantle Gamer"
                            />
                            <div>
                                <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Bio / Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Tell your fans what you create..."
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        minHeight: '120px',
                                        fontFamily: 'inherit',
                                        fontSize: '1rem',
                                        resize: 'vertical',
                                        outline: 'none',
                                        transition: 'all 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(157, 78, 221, 0.5)';
                                        e.target.style.boxShadow = '0 0 15px rgba(157, 78, 221, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <Input
                            label="Twitter / X"
                            value={socials.twitter}
                            onChange={(e: any) => setSocials({ ...socials, twitter: e.target.value })}
                            placeholder="@handle"
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px' }}
                        />
                        <Input
                            label="Website"
                            value={socials.website}
                            onChange={(e: any) => setSocials({ ...socials, website: e.target.value })}
                            placeholder="https://..."
                            style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '14px' }}
                        />
                    </div>

                    <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={handleSave} disabled={saving} style={{ borderRadius: '16px', padding: '12px 32px' }}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card style={{ marginBottom: '24px' }} variant="glass">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#fff' }}>Payment Settings</h2>
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div>
                        <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Payout Token</label>
                        <select
                            value={payoutToken}
                            onChange={(e) => setPayoutToken(e.target.value)}
                            style={{
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '14px 16px',
                                borderRadius: '16px',
                                color: '#fff',
                                minWidth: '200px',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="MNT">Native MNT</option>
                            <option value="USDC">USDC (Mantle)</option>
                        </select>
                    </div>
                    <div style={{ flex: 1, fontSize: '0.875rem', color: '#a1a1aa' }}>
                        {payoutToken === 'MNT'
                            ? 'Fees are paid in MNT. You receive MNT directly to your wallet.'
                            : 'Fees are paid in USDC. You receive USDC directly. (Requires Token Approval)'}
                    </div>
                </div>
            </Card>

            <Card variant="glass">
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '16px', color: '#fff' }}>Wallet Connection</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                        <p style={{ color: '#a1a1aa', fontSize: '0.875rem' }}>Connected Address</p>
                        <p style={{ fontFamily: 'monospace', color: '#65b3ad' }}>{address}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#65b3ad', background: 'rgba(101, 179, 173, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>Connected on Mantle Mainnet</span>
                </div>
            </Card>
        </div>
    );
}
