'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { SUBSCRIPTION_ABI, FACTORY_ABI, FACTORY_ADDRESS } from '@/utils/abis';
import { parseEther } from 'viem';
import { useToast } from '../../components/Toast';

// NOTE: We need the deployed contract address. In a real app we'd fetch it from the graph or Factory.
// For now, we will ask user to input it or try to fetch from an API if we stored it?
// Let's assume we store it in our JSON DB in previous step!

export default function MembershipPage() {
    const { address } = useAccount();
    const { showToast, ToastComponent } = useToast();
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [contractAddress, setContractAddress] = useState<string | null>(null);
    const [pendingTier, setPendingTier] = useState<any>(null);

    // Fallback: Read from Factory if DB is slow
    const { data: factoryProfile } = useReadContract({
        address: FACTORY_ADDRESS as `0x${string}`,
        abi: FACTORY_ABI,
        functionName: 'getProfile',
        args: [address],
    });

    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Fetch Tiers & Contract Address
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
                    // Fallback to Factory data
                    setContractAddress(factoryProfile as string);
                }
            } catch (e) {
                console.error("Profile fetch error", e);
            }
        };

        fetchProfile();

        // Load local tiers for display
        fetch(`/api/tiers?address=${address}`).then(res => res.json()).then(setTiers).finally(() => setLoading(false));
    }, [address, factoryProfile]);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleSave = async (tier: any) => {
        if (!address) return;

        // Commit raw benefits edits if they exist
        if (tier.benefitsRaw !== undefined) {
            tier.benefits = tier.benefitsRaw.split(',').map((b: string) => b.trim()).filter((b: string) => b);
            delete tier.benefitsRaw;
            // Update state to reflect commit (optional since we reload or save, but good for UX)
            const newTiers = [...tiers];
            // find index of passed tier? We don't have index passed here easily unless we search or pass it.
            // But 'tier' is a reference to the object in the array if we are lucky? 
            // Actually React state objects treat them as immutable usually, but let's assume `tier` is the object from the map loop.
            // Safer to update the tiers array in state.
            const tierIndex = tiers.findIndex(t => t === tier);
            if (tierIndex >= 0) {
                newTiers[tierIndex] = tier;
                setTiers(newTiers);
            }
        }

        // Validate Contract Address
        if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
            showToast('Contract not deployed or undefined. Please re-deploy from settings if needed.', 'error');
            return;
        }

        // If we have a contract address, try to create tier on chain
        if (tier.active !== false) {
            try {
                // Determine if this is a new tier or update?
                // The smart contract simple adds new tiers with createTier.
                // It does not support editing name/price of existing tiers easily (only toggle).
                // For this MVP, we will assumes clicking "Save" on a NEW tier implies creation.
                // If editing existing, we might just update DB unless we want to add complex logic.

                // For simplicity/Hackathon: Always prompt to create on chain if it looks like a new/synced action?
                // Or better: Just ask the user via a simple confirm/alert flow or just do it.

                // Let's just do it for now if it's considered "newish" or user wants to sync.
                // Actually, to fix the specific "Invalid Tier" error, we NEED to call createTier.

                writeContract({
                    address: contractAddress as `0x${string}`,
                    abi: SUBSCRIPTION_ABI,
                    functionName: 'createTier',
                    args: [tier.name, parseEther(tier.price.toString()), BigInt(tier.duration) * BigInt(86400)]
                });
            } catch (e) {
                console.error("Chain write failed", e);
                showToast('Failed to initiate transaction.', 'error');
                return;
                // Continues to save to DB anyway? Or stop?
                // Let's continue so DB is updated at least.
            }
        }

        // Save the current tiers list (which includes the edited tier)
        await fetch('/api/tiers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, tiers })
        });

        setEditingIndex(null);
        // Don't reload immediately so we don't lose transaction status, but for MVP...
        // window.location.reload(); 
    };

    if (loading) return <div style={{ padding: '48px', textAlign: 'center' }}>Loading tiers...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {ToastComponent}
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>Membership Tiers</h1>
                    <p style={{ color: '#52525b' }}>Manage your subscription plans and benefits.</p>
                </div>
                <Button onClick={() => {
                    setTiers([...tiers, { name: 'New Tier', price: '10', duration: '30', benefits: [], active: true }]);
                    setEditingIndex(tiers.length);
                }}>+ Create Tier</Button>
            </header>

            <div style={{ display: 'grid', gap: '24px' }}>
                {tiers.map((tier, index) => (
                    <Card key={index} variant={tier.recommended ? 'neon-blue' : 'glass'} style={{ position: 'relative', overflow: 'hidden', borderRadius: '32px', background: '#fff', border: tier.recommended ? '2px solid #65b3ad' : '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#000' }}>
                        {tier.recommended && (
                            <div style={{ position: 'absolute', top: 0, right: 0, background: '#65b3ad', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '6px 16px', borderBottomLeftRadius: '20px' }}>
                                Recommended
                            </div>
                        )}

                        {editingIndex === index ? (
                            // Edit Mode
                            <div style={{ display: 'grid', gap: '20px', padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                                    <Input label="Tier Name" value={tier.name} onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].name = e.target.value;
                                        setTiers(newTiers);
                                    }} style={{ fontSize: '1.1rem', padding: '16px' }} />
                                    <Input label="Price (MNT)" value={tier.price} type="number" onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].price = e.target.value;
                                        setTiers(newTiers);
                                    }} style={{ fontSize: '1.1rem', padding: '16px' }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '1rem', color: '#52525b', marginBottom: '12px', display: 'block', fontWeight: '600' }}>Benefits (Comma separated)</label>
                                    <textarea
                                        value={tier.benefitsRaw !== undefined ? tier.benefitsRaw : tier.benefits.join(', ')}
                                        onChange={(e: any) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].benefitsRaw = e.target.value;
                                            setTiers(newTiers);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '20px',
                                            background: '#fff',
                                            border: '1px solid #e4e4e7',
                                            borderRadius: '16px',
                                            color: '#000',
                                            fontSize: '1rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            minHeight: '120px',
                                            outline: 'none',
                                            lineHeight: '1.6'
                                        }}
                                        placeholder="e.g., Access to exclusive posts, Monthly Q&A sessions, Discord access"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '8px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#000', cursor: 'pointer', background: '#f4f4f5', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e4e4e7', fontSize: '1rem' }}>
                                        <input type="checkbox" checked={tier.recommended || false} onChange={(e) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].recommended = e.target.checked;
                                            setTiers(newTiers);
                                        }} style={{ transform: 'scale(1.2)' }} />
                                        Recommended Tier
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#000', cursor: 'pointer', background: '#f4f4f5', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e4e4e7', fontSize: '1rem' }}>
                                        <input type="checkbox" checked={tier.active !== false} onChange={(e) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].active = e.target.checked;
                                            setTiers(newTiers);
                                        }} style={{ transform: 'scale(1.2)' }} />
                                        Active
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <Button variant="secondary" onClick={() => {
                                        // Revert changes on cancel if desired, or just close
                                        // For benefits, we can clear the raw buffer to reset
                                        if (tier.benefitsRaw !== undefined) {
                                            const newTiers = [...tiers];
                                            delete newTiers[index].benefitsRaw;
                                            setTiers(newTiers);
                                        }
                                        setEditingIndex(null);
                                    }} style={{ borderRadius: '16px', padding: '12px 32px', fontSize: '1rem' }}>Cancel</Button>
                                    <Button onClick={() => handleSave(tier)} style={{ borderRadius: '16px', padding: '12px 32px', fontSize: '1rem', fontWeight: 'bold' }}>Save & Create on Chain</Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: tier.active === false ? 0.5 : 1, padding: '24px', color: '#000' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#000' }}>{tier.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ background: '#f4f4f5', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', color: '#000', fontWeight: 'bold', border: '1px solid #e4e4e7' }}>{tier.price} MNT <span style={{ fontSize: '0.7em', fontWeight: 'normal', opacity: 0.7 }}>/ mo</span></span>
                                        </div>
                                    </div>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', color: '#52525b', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {tier.benefits && tier.benefits.length > 0 ? tier.benefits.map((b: string, i: number) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#65b3ad' }}>✓</span> {b}
                                            </li>
                                        )) : <li style={{ fontStyle: 'italic', opacity: 0.6 }}>No benefits listed</li>}
                                    </ul>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    {tier.active === false && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', background: '#fef2f2', padding: '4px 8px', borderRadius: '8px', border: '1px solid #fecaca' }}>Paused</span>}
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <Button variant="secondary" onClick={() => setEditingIndex(index)} style={{ borderRadius: '16px', padding: '8px 20px' }}>Edit</Button>
                                        <Button
                                            variant="secondary"
                                            onClick={async () => {
                                                if (confirm('Delete this tier?')) {
                                                    const newTiers = tiers.filter((_, i) => i !== index);
                                                    setTiers(newTiers);
                                                    await fetch('/api/tiers', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ address, tiers: newTiers })
                                                    });
                                                    window.location.reload();
                                                }
                                            }}
                                            style={{
                                                background: '#fef2f2',
                                                borderColor: '#fecaca',
                                                color: '#ef4444',
                                                borderRadius: '16px',
                                                padding: '8px 16px'
                                            }}
                                            onMouseEnter={(e: any) => {
                                                e.currentTarget.style.background = '#fee2e2';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseLeave={(e: any) => {
                                                e.currentTarget.style.background = '#fef2f2';
                                                e.currentTarget.style.borderColor = '#fecaca';
                                            }}
                                        >
                                            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🗑️</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))
                }
            </div>
        </div>
    );
}
