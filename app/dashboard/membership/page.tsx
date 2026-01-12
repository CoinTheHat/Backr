'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Input from '../../components/Input';
import Dropdown from '../../components/Dropdown';
import { SUBSCRIPTION_ABI, FACTORY_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { parseEther } from 'viem';
import { useToast } from '../../components/Toast';

export default function MembershipPage() {
    const { address } = useAccount();
    const { showToast, ToastComponent } = useToast();
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [contractAddress, setContractAddress] = useState<string | null>(null);

    // Editor Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState<any>(null); // { ...tierData, index: number } | null

    // Fallback: Read from Factory
    const { data: factoryProfile } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getProfile',
        args: [address],
    });

    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Fetch Data
    useEffect(() => {
        if (!address) return;

        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/creators`);
                const creators = await res.json();
                const me = creators.find((c: any) => c.address === address);

                if (me?.contractAddress) {
                    setContractAddress(me.contractAddress);
                } else if (factoryProfile && factoryProfile !== '0x0000000000000000000000000000000000000000') {
                    setContractAddress(factoryProfile as string);
                }
            } catch (e) {
                console.error("Profile fetch error", e);
            }
        };

        fetchProfile();
        fetch(`/api/tiers?address=${address}`).then(res => res.json()).then(setTiers).finally(() => setLoading(false));
    }, [address, factoryProfile]);

    const handleCreate = () => {
        setEditingTier({ name: '', price: '', benefits: [], active: true, index: -1 });
        setIsModalOpen(true);
    };

    const handleEdit = (tier: any, index: number) => {
        setEditingTier({ ...tier, index });
        setIsModalOpen(true);
    };

    const handleDelete = async (index: number) => {
        if (!confirm('Are you sure you want to delete this tier? This cannot be undone.')) return;
        const newTiers = tiers.filter((_, i) => i !== index);
        setTiers(newTiers);
        await saveTiersToBackend(newTiers);
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === tiers.length - 1) return;

        const newTiers = [...tiers];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newTiers[index], newTiers[targetIndex]] = [newTiers[targetIndex], newTiers[index]];

        setTiers(newTiers);
        await saveTiersToBackend(newTiers);
    };

    const saveTiersToBackend = async (newTiers: any[]) => {
        try {
            await fetch('/api/tiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, tiers: newTiers })
            });
        } catch (e) {
            console.error("Failed to save tiers", e);
            showToast('Failed to save changes', 'error');
        }
    };

    const onSaveModal = async () => {
        if (!address) return;

        // simple validation
        if (!editingTier.name || !editingTier.price) {
            alert("Name and Price are required");
            return;
        }

        // Construct updated tier object
        const tierToSave = {
            name: editingTier.name,
            price: editingTier.price,
            duration: editingTier.duration || '30', // default to 30 days
            benefits: editingTier.benefits.filter((b: string) => b.trim() !== ''),
            active: editingTier.active,
            recommended: editingTier.recommended
        };

        // Chain Interaction for NEW tiers or updates if feasible
        // Current logic: We only create on chain if we think it's new-ish or explicitly wanted?
        // Reuse previous logic: If active, try createTier. 
        // Note: Real production apps would track chainId to avoid duplicates.
        if (tierToSave.active) {
            try {
                if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
                    showToast('Contract not deployed. Please check settings.', 'error');
                } else {
                    // Only write if it's considered a "significant" update or new? 
                    // For safety in this demo, we ALWAYS attempt to create on chain if user saves active tier,
                    // BUT this duplicates tiers on chain. 
                    // Let's assume the user knows what they are doing for this MVP tool.
                    // Ideally we check if `index === -1`.
                    if (editingTier.index === -1) {
                        writeContract({
                            address: contractAddress as `0x${string}`,
                            abi: SUBSCRIPTION_ABI,
                            functionName: 'createTier',
                            args: [tierToSave.name, parseEther(tierToSave.price.toString()), BigInt(tierToSave.duration) * BigInt(86400)]
                        });
                    }
                }
            } catch (e) {
                console.error("Chain interaction failed", e);
            }
        }

        // Update Local State
        let newTiers = [...tiers];
        if (editingTier.index === -1) {
            newTiers.push(tierToSave);
        } else {
            newTiers[editingTier.index] = tierToSave;
        }

        setTiers(newTiers);
        await saveTiersToBackend(newTiers);
        setIsModalOpen(false);
    };

    return (
        <div className="page-container" style={{ paddingBottom: '100px' }}>
            {ToastComponent}
            <SectionHeader
                title="Membership Tiers"
                description="Manage your subscription plans. Tiers appear on your public page."
                action={{ label: 'Create Tier', onClick: handleCreate, icon: '＋' }}
            />

            {/* Loading / Empty / Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-tertiary)' }}>Loading tiers...</div>
            ) : tiers.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '24px' }}>💎</div>
                    <h3 className="text-h3" style={{ marginBottom: '12px' }}>Create your first tier</h3>
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                        Start earning by offering exclusive content. Simple tiers like "Supporter" (5 MNT) work best to start.
                    </p>
                    <Button onClick={handleCreate}>Create Tier</Button>
                </Card>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    {tiers.map((tier, index) => (
                        <Card key={index} variant={tier.recommended ? 'neon-blue' : 'surface'} padding="none" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Card Header */}
                            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)', background: tier.recommended ? 'var(--color-primary-light)' : 'transparent' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <h3 className="text-h3">{tier.name || 'Untitled Tier'}</h3>
                                    {tier.active === false && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--color-error)', color: '#fff' }}>HIDDEN</span>}
                                    {tier.recommended && tier.active !== false && <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'var(--color-primary)', color: '#fff' }}>TOP</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{tier.price} MNT</span>
                                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>/ month</span>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div style={{ padding: '24px', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-tertiary)', marginBottom: '12px', letterSpacing: '0.05em' }}>Includes</div>
                                {tier.benefits && tier.benefits.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {tier.benefits.slice(0, 5).map((b: string, i: number) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '10px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>✓</span> {b}
                                            </li>
                                        ))}
                                        {tier.benefits.length > 5 && <li style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', paddingLeft: '20px' }}>+ {tier.benefits.length - 5} more...</li>}
                                    </ul>
                                ) : (
                                    <div style={{ fontStyle: 'italic', color: 'var(--color-text-tertiary)', fontSize: '0.9rem' }}>No benefits added yet.</div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <Button variant="secondary" size="sm" onClick={() => handleEdit(tier, index)} style={{ flex: 1 }}>Edit Tier</Button>

                                <Dropdown trigger={<Button variant="ghost" size="sm" style={{ padding: '8px' }}>•••</Button>}>
                                    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                                        <button className="dropdown-item" onClick={() => handleMove(index, 'up')} disabled={index === 0}>Move Up</button>
                                        <button className="dropdown-item" onClick={() => handleMove(index, 'down')} disabled={index === tiers.length - 1}>Move Down</button>
                                        <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }}></div>
                                        <button className="dropdown-item text-error" onClick={() => handleDelete(index)}>Delete</button>
                                    </div>
                                </Dropdown>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* EDIT MODAL OVERLAY */}
            {isModalOpen && editingTier && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
                }}>
                    <div className="card-surface" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative' }}>
                        <h2 className="text-h2" style={{ marginBottom: '24px' }}>{editingTier.index === -1 ? 'Create New Tier' : 'Edit Tier'}</h2>

                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <Input label="Name" value={editingTier.name} onChange={(e) => setEditingTier({ ...editingTier, name: e.target.value })} placeholder="e.g. VIP" />
                                <Input label="Price (MNT)" type="number" value={editingTier.price} onChange={(e) => setEditingTier({ ...editingTier, price: e.target.value })} placeholder="0.0" />
                            </div>

                            {/* Benefits Builder */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Member Benefits</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                                    {editingTier.benefits.map((benefit: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                className="focus-ring"
                                                value={benefit}
                                                onChange={(e) => {
                                                    const newBenefits = [...editingTier.benefits];
                                                    newBenefits[i] = e.target.value;
                                                    setEditingTier({ ...editingTier, benefits: newBenefits });
                                                }}
                                                style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                                            />
                                            <button
                                                onClick={() => {
                                                    const newBenefits = editingTier.benefits.filter((_: any, idx: number) => idx !== i);
                                                    setEditingTier({ ...editingTier, benefits: newBenefits });
                                                }}
                                                style={{ padding: '0 12px', color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="secondary" size="sm" onClick={() => setEditingTier({ ...editingTier, benefits: [...editingTier.benefits, ''] })}>
                                    + Add Benefit
                                </Button>
                            </div>

                            {/* Toggles */}
                            <div style={{ display: 'flex', gap: '24px', padding: '16px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-md)' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                    <input type="checkbox" checked={editingTier.recommended} onChange={(e) => setEditingTier({ ...editingTier, recommended: e.target.checked })} />
                                    Recommended Tier
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                    <input type="checkbox" checked={editingTier.active} onChange={(e) => setEditingTier({ ...editingTier, active: e.target.checked })} />
                                    Active (Visible)
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button onClick={onSaveModal}>Save Tier</Button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .dropdown-item {
                    text-align: left;
                    padding: 8px 12px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 4px;
                    color: var(--color-text-primary);
                    font-size: 0.875rem;
                }
                .dropdown-item:hover { background: var(--color-bg-page); }
                .dropdown-item:disabled { opacity: 0.5; cursor: not-allowed; }
                .dropdown-item.text-error { color: var(--color-error); }
                .dropdown-item.text-error:hover { background: #fee2e2; }
            `}} />
        </div>
    );
}
