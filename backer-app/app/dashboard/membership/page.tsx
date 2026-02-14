'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Input from '../../components/Input';
import ImageUpload from '../../components/ImageUpload';
import { Plus, Trash2, Edit2, Save, X, Check } from 'lucide-react';
import { useToast } from '../../components/Toast';

export default function MembershipPage() {
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const { showToast } = useToast();
    const [tiers, setTiers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        perks: '',
        image: ''
    });

    useEffect(() => {
        if (address) {
            fetchTiers();
        }
    }, [address]);

    const fetchTiers = async () => {
        try {
            const res = await fetch(`/api/tiers?creator=${address}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setTiers(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) return showToast("Name and Price are required", "error");

        try {
            const method = editId ? 'PUT' : 'POST';
            const body = {
                creator: address,
                id: editId,
                ...formData,
                perks: formData.perks.split('\n').filter(p => p.trim())
            };

            const res = await fetch('/api/tiers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                showToast("Tier saved successfully", "success");
                setIsEditing(false);
                setEditId(null);
                setFormData({ name: '', price: '', perks: '', image: '' });
                fetchTiers();
            } else {
                showToast("Failed to save tier", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Error saving tier", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/tiers?id=${id}&creator=${address}`, { method: 'DELETE' });
            if (res.ok) {
                showToast("Tier deleted", "success");
                fetchTiers();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (tier?: any) => {
        if (tier) {
            setEditId(tier.id);
            setFormData({
                name: tier.name,
                price: tier.price,
                perks: (tier.perks || []).join('\n'),
                image: tier.image || ''
            });
        } else {
            setEditId(null);
            setFormData({ name: '', price: '', perks: '', image: '' });
        }
        setIsEditing(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <SectionHeader
                title="Membership Tiers"
                description="Create and manage your subscription tiers."
                action={
                    !isEditing ? {
                        label: 'New Tier',
                        onClick: () => startEdit(),
                        icon: <Plus size={18} />
                    } : undefined
                }
            />

            {isEditing && (
                <Card className="p-6 border-brand-accent/30 relative">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <h3 className="text-lg font-bold mb-6">{editId ? 'Edit Tier' : 'Create New Tier'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-6">
                            <Input
                                label="Tier Name"
                                placeholder="e.g. Bronze Supporter"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Monthly Price (USD)"
                                type="number"
                                placeholder="e.g. 5"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div>
                            <ImageUpload
                                label="Tier Image"
                                bucket="posts"
                                value={formData.image}
                                onChange={url => setFormData({ ...formData, image: url })}
                                helperText="Best: 1:1 or 16:9 ratio. Max 5MB."
                            />
                        </div>
                    </div>
                    <Input
                        label="Perks (One per line)"
                        textarea
                        placeholder="Access to exclusive content&#10;Discord role&#10;Shoutout"
                        value={formData.perks}
                        onChange={e => setFormData({ ...formData, perks: e.target.value })}
                    />
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave}>
                            <Save size={18} className="mr-2" />
                            Save Tier
                        </Button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                    <Card key={tier.id} className="p-0 overflow-hidden flex flex-col h-full hover:border-white/20 transition-colors">
                        {tier.image && (
                            <div className="aspect-video w-full overflow-hidden border-b border-white/5">
                                <img src={tier.image} alt={tier.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold">{tier.name}</h3>
                                <div className="text-xl font-mono text-brand-accent">${tier.price}</div>
                            </div>
                            <ul className="space-y-2 mb-8 flex-1">
                                {(tier.perks || []).map((perk: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <Check size={14} className="mt-1 text-emerald-400 shrink-0" />
                                        <span>{perk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-6 flex gap-2 pt-4 border-t border-white/5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => startEdit(tier)}
                            >
                                <Edit2 size={14} className="mr-2" /> Edit
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                onClick={() => handleDelete(tier.id)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    </Card>
                ))}

                {!loading && tiers.length === 0 && !isEditing && (
                    <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                        <div className="mb-4">No tiers created yet.</div>
                        <Button variant="outline" onClick={() => startEdit()}>
                            Create your first tier
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
