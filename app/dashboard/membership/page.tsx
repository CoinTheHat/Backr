'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Input from '../../components/Input';
import { SUBSCRIPTION_ABI } from '../../utils/abis';
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
        fetch(`/api/creators`) // Get all creators to find self? Or a dedicated /api/me?
            .then(res => res.json())
            .then(creators => {
                const me = creators.find((c: any) => c.address === address);
                // Ideally creators.json stores the contract address too.
                // Let's assume it does (we added deployed logic in dashboard).
                // If not, we can't write to contract easily without asking user.
            });

        // Load local tiers for display
        fetch(`/api/tiers?address=${address}`).then(res => res.json()).then(setTiers).finally(() => setLoading(false));
    }, [address]);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    // Only saving to DB for MVP demo speed, but here is the contract code:
    const handleSaveToChain = (tier: any) => {
        // We'd need the contract address here
        // writeContract({
        //     address: contractAddress as `0x${string}`,
        //     abi: SUBSCRIPTION_ABI,
        //     functionName: 'createTier',
        //     args: [tier.name, parseEther(tier.price), BigInt(tier.duration) * 86400n]
        // });
        alert("For this hackathon MVP, we are saving tiers to the database. In production, this would sign a transaction.");
        handleSave(tier);
    };

    const handleSave = async (tier: any) => {
        setEditingIndex(null);
        if (!address) return;

        // Update local state
        const updatedTiers = [...tiers]; // logic to update specific tier...

        await fetch('/api/tiers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address, tiers: updatedTiers }) // Ideally we save the specific modified list
        });
        window.location.reload(); // Quick refresh
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
                    <Card key={index} style={{ border: tier.recommended ? '1px solid #65b3ad' : '1px solid #2e333d', position: 'relative', overflow: 'hidden' }}>
                        {tier.recommended && (
                            <div style={{ position: 'absolute', top: 0, right: 0, background: '#65b3ad', color: '#000', fontSize: '0.75rem', fontWeight: 'bold', padding: '4px 12px', borderBottomLeftRadius: '8px' }}>
                                Recommended
                            </div>
                        )}

                        {editingIndex === index ? (
                            // Edit Mode
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                                    <Input label="Tier Name" value={tier.name} onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].name = e.target.value;
                                        setTiers(newTiers);
                                    }} />
                                    <Input label="Price (MNT)" value={tier.price} type="number" onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].price = e.target.value;
                                        setTiers(newTiers);
                                    }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '8px', display: 'block' }}>Benefits (Comma separated)</label>
                                    <Input value={tier.benefits.join(', ')} onChange={(e: any) => {
                                        const newTiers = [...tiers];
                                        newTiers[index].benefits = e.target.value.split(',').map((b: string) => b.trim());
                                        setTiers(newTiers);
                                    }} />
                                </div>

                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={tier.recommended || false} onChange={(e) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].recommended = e.target.checked;
                                            // Ensure only one recommended? For now let multiple be fine.
                                            setTiers(newTiers);
                                        }} />
                                        Recommended Tier
                                    </label>

                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={tier.active !== false} onChange={(e) => {
                                            const newTiers = [...tiers];
                                            newTiers[index].active = e.target.checked;
                                            setTiers(newTiers);
                                        }} />
                                        Active (Visible to Fans)
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                    <Button variant="secondary" onClick={() => setEditingIndex(null)}>Cancel</Button>
                                    <Button onClick={() => handleSave(tier)}>Save Tier</Button>
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: tier.active === false ? 0.5 : 1 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff' }}>{tier.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ background: '#2e333d', padding: '4px 12px', borderRadius: '16px', fontSize: '0.875rem', color: '#fff' }}>{tier.price} MNT / mo</span>
                                            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', border: '1px solid #2e333d', padding: '3px 8px', borderRadius: '12px' }}>Pay with MNT</span>
                                        </div>
                                    </div>
                                    <ul style={{ paddingLeft: '20px', color: '#a1a1aa', fontSize: '0.875rem' }}>
                                        {tier.benefits && tier.benefits.length > 0 ? tier.benefits.map((b: string, i: number) => <li key={i}>{b}</li>) : <li>No benefits listed</li>}
                                    </ul>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    {tier.active === false && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Paused</span>}
                                    <Button variant="secondary" onClick={() => setEditingIndex(index)}>Edit</Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}
