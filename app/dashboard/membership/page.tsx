'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { SUBSCRIPTION_ABI } from '@/utils/abis';
import { parseEther } from 'viem';

// NOTE: We need the deployed contract address. In a real app we'd fetch it from the graph or Factory.
// For now, we will ask user to input it or try to fetch from an API if we stored it?
// Let's assume we store it in our JSON DB in previous step!

export default function MembershipPage() {
    const { address } = useAccount();
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [contractAddress, setContractAddress] = useState<string | null>(null);

    const { data: hash, writeContract } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    // Fetch Tiers & Contract Address
    useEffect(() => {
        if (!address) return;
        fetch(`/api/creators`)
            .then(res => res.json())
            .then(creators => {
                const me = creators.find((c: any) => c.address === address);
                if (me?.contractAddress) {
                    setContractAddress(me.contractAddress);
                }
            });

        // Load local tiers for display
        fetch(`/api/tiers?address=${address}`).then(res => res.json()).then(setTiers).finally(() => setLoading(false));
    }, [address]);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleSave = async (tier: any) => {
        if (!address) return;

        // If we have a contract address, try to create tier on chain
        if (contractAddress && tier.active !== false) {
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
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Membership Tiers</h1>
                    <p style={{ color: '#a1a1aa' }}>Manage your subscription plans and benefits.</p>
                </div>
                <Button onClick={() => {
                    setTiers([...tiers, { name: 'New Tier', price: '10', duration: '30', benefits: [], active: true }]);
                    setEditingIndex(tiers.length);
                }}>+ Create Tier</Button>
            </header>

            <div style={{ display: 'grid', gap: '24px' }}>
                {tiers.map((tier, index) => (
                    <Card key={index} variant={tier.recommended ? 'neon-blue' : 'glass'} style={{ position: 'relative', overflow: 'hidden', borderRadius: '32px', border: tier.recommended ? undefined : '1px solid rgba(255, 255, 255, 0.08)' }}>
                        {tier.recommended && (
                            <div style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(76, 201, 240, 0.2)', color: '#4cc9f0', fontSize: '0.75rem', fontWeight: 'bold', padding: '6px 16px', borderBottomLeftRadius: '20px', borderLeft: '1px solid rgba(76, 201, 240, 0.3)', borderBottom: '1px solid rgba(76, 201, 240, 0.3)' }}>
                                Recommended
                            </div>
                        )}

                        {editingIndex === index ? (
                            // Edit Mode
                            <div style={{ display: 'grid', gap: '20px', padding: '8px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                                    <Input label="Tier Name" value={tier.name} onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].name = e.target.value;
                                        setTiers(newTiers);
                                    }} style={{ borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }} />
                                    <Input label="Price (MNT)" value={tier.price} type="number" onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].price = e.target.value;
                                        setTiers(newTiers);
                                    }} style={{ borderRadius: '16px', background: 'rgba(0,0,0,0.2)' }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Benefits (Comma separated)</label>
                                    <textarea
                                        value={tier.benefits.join(', ')}
                                        onChange={(e: any) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].benefits = e.target.value.split(',').map((b: string) => b.trim()).filter((b: string) => b);
                                            setTiers(newTiers);
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '16px',
                                            color: '#fff',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            resize: 'vertical',
                                            minHeight: '100px',
                                            outline: 'none'
                                        }}
                                        placeholder="e.g., Access to exclusive posts, Monthly Q&A sessions, Discord access"
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <input type="checkbox" checked={tier.recommended || false} onChange={(e) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].recommended = e.target.checked;
                                            setTiers(newTiers);
                                        }} />
                                        Recommended Tier
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', cursor: 'pointer', background: 'rgba(255,255,255,0.03)', padding: '8px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <input type="checkbox" checked={tier.active !== false} onChange={(e) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].active = e.target.checked;
                                            setTiers(newTiers);
                                        }} />
                                        Active
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <Button variant="secondary" onClick={() => setEditingIndex(null)} style={{ borderRadius: '12px' }}>Cancel</Button>
                                    <Button onClick={() => handleSave(tier)} style={{ borderRadius: '12px' }}>Save & Create on Chain</Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: tier.active === false ? 0.5 : 1 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', paddingLeft: '8px' }}>
                                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{tier.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', color: '#fff', fontWeight: 'bold' }}>{tier.price} MNT <span style={{ fontSize: '0.7em', fontWeight: 'normal', opacity: 0.7 }}>/ mo</span></span>
                                        </div>
                                    </div>
                                    <ul style={{ paddingLeft: '0', listStyle: 'none', color: '#a1a1aa', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {tier.benefits && tier.benefits.length > 0 ? tier.benefits.map((b: string, i: number) => (
                                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ color: '#65b3ad' }}>✓</span> {b}
                                            </li>
                                        )) : <li style={{ fontStyle: 'italic', opacity: 0.6 }}>No benefits listed</li>}
                                    </ul>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    {tier.active === false && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>Paused</span>}
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
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                borderColor: 'rgba(239, 68, 68, 0.2)',
                                                color: '#ef4444',
                                                borderRadius: '16px',
                                                padding: '8px 16px'
                                            }}
                                            onMouseEnter={(e: any) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                e.currentTarget.style.borderColor = '#ef4444';
                                            }}
                                            onMouseLeave={(e: any) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
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
