'use client';

import { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '../../components/Toast';

export default function ManageTiersPage() {
    const { tiers, addTier, deleteTier, isLoading: isContextLoading } = useCommunity();
    const router = useRouter();
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const { showToast, ToastComponent } = useToast();

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [perkInput, setPerkInput] = useState('');
    const [perks, setPerks] = useState<string[]>([]);

    // Simplified State
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (isContextLoading) return <div className="min-h-screen bg-brand-light flex items-center justify-center text-brand-muted">Loading studio...</div>;

    // Removed deployment check

    const handleCreateTier = async () => {
        if (!name || !price) {
            showToast('Please fill in name and price', 'info');
            return;
        }

        setIsSubmitting(true);
        try {
            // API Call (Off-chain for now)
            const payload = {
                address,
                tiers: [...tiers, { name, price: `${price}`, benefits: perks, duration: 30 }]
            };

            await fetch('/api/tiers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            addTier({ name, price: `${price}`, perks });
            showToast('Tier created successfully', 'success');
            setName('');
            setPrice('');
            setPerks([]);
        } catch (e) {
            console.error(e);
            showToast('Failed to create tier', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddPerk = () => {
        if (!perkInput) return;
        setPerks([...perks, perkInput]);
        setPerkInput('');
    };

    const isProcessing = isSubmitting;

    return (
        <div className="min-h-screen bg-brand-light pt-8 pb-12 px-4 md:px-8">
            {ToastComponent}
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <button onClick={() => router.back()} className="text-sm text-brand-muted mb-2 hover:text-brand-dark flex items-center gap-1 font-medium group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-serif font-bold text-brand-dark">Manage Tiers</h1>
                    </div>
                </header>

                <div className="space-y-6">
                    {/* List Existing */}
                    <div className="space-y-4">
                        {tiers.length === 0 && <div className="text-center p-8 text-brand-muted bg-white rounded-studio border border-dashed border-gray-200">No tiers created yet. Create your first one below!</div>}
                        {tiers.map(tier => (
                            <div key={tier.id} className="bg-white p-6 rounded-studio border border-gray-100 shadow-sm flex justify-between items-start animate-fade-in hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="text-xl font-bold mb-1 text-brand-dark">{tier.name}</h3>
                                    <p className="text-brand-primary font-bold">{tier.price}</p>
                                    <ul className="mt-2 space-y-1">
                                        {tier.perks.map((p: string, i: number) => <li key={i} className="text-sm text-gray-500">• {p}</li>)}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => deleteTier(tier.id)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add New */}
                    <div className="bg-white p-8 rounded-studio border border-gray-100 shadow-studio mt-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-brand-dark"><Plus size={20} className="text-brand-secondary" /> Add New Tier</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1">Tier Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    disabled={isProcessing}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-50"
                                    placeholder="e.g. Gold Member"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1">Price (USD)</label>
                                <input
                                    type="text"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    disabled={isProcessing}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-50"
                                    placeholder="5.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-muted mb-1">Perks</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={perkInput}
                                        onChange={e => setPerkInput(e.target.value)}
                                        disabled={isProcessing}
                                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all disabled:opacity-50"
                                        placeholder="Add a perk..."
                                        onKeyDown={e => e.key === 'Enter' && handleAddPerk()}
                                    />
                                    <Button onClick={handleAddPerk} className="rounded-xl" variant="outline" disabled={isProcessing}>Add</Button>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {perks.map((p, i) => (
                                        <span key={i} className="text-xs bg-brand-light text-brand-secondary font-medium px-3 py-1.5 rounded-lg border border-brand-secondary/20">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateTier}
                                className="w-full justify-center py-4 mt-4 font-bold rounded-xl shadow-lg shadow-brand-dark/10"
                                variant="primary"
                                disabled={isProcessing || !name || !price}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Tier'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
