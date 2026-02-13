'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Input from '../../components/Input';
import { useToast } from '../../components/Toast';
import { useCommunity } from '../../context/CommunityContext';

import { Copy, ExternalLink, Save, RefreshCw, Trash2, Info, Wallet } from 'lucide-react';

export default function SettingsPage() {
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const { addToast } = useToast();
    const { isDeployed, contractAddress, refreshData } = useCommunity();

    // Form State
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState(''); // URL for now
    const [coverImage, setCoverImage] = useState(''); // URL for now
    const [email, setEmail] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initial Data Load
    useEffect(() => {
        if (address) {
            setIsLoading(true);
            const fetchData = async () => {
                // Fetch from JSON/Supabase (using existing API)
                try {
                    const res = await fetch(`/api/creators?address=${address}`);
                    const data = await res.json();
                    if (data) {
                        setName(data.name || '');
                        setBio(data.bio || '');
                        setProfileImage(data.profileImage || '');
                        setCoverImage(data.coverImage || '');
                        setEmail(data.email || '');
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [address]);

    const handleSave = async () => {
        if (!name) return addToast("Name is required", 'error');

        setIsSaving(true);
        try {
            // Save to JSON/Supabase via API
            const res = await fetch('/api/creators', {
                method: 'POST', // or PUT
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    name,
                    bio,
                    profileImage,
                    coverImage,
                    email
                })
            });

            if (res.ok) {
                addToast("Profile updated successfully", 'success');
                refreshData();
            } else {
                addToast("Failed to update profile", 'error');
            }
        } catch (e) {
            console.error(e);
            addToast("Error saving profile", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            addToast("Address copied!", 'success');
        }
    };

    if (isLoading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <SectionHeader
                title="Settings"
                description="Manage your profile and wallet settings."
            />

            {/* Profile Settings */}
            <Card className="p-0 overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Save size={18} className="text-brand-primary" />
                        Profile Details
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Display Name"
                            placeholder="e.g. Satoshi Nakamoto"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                        <Input
                            label="Email (Optional)"
                            placeholder="contact@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <Input
                        label="Bio"
                        placeholder="Tell your fans about yourself..."
                        textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Profile Image URL"
                            placeholder="https://..."
                            value={profileImage}
                            onChange={e => setProfileImage(e.target.value)}
                        />
                        <Input
                            label="Cover Image URL"
                            placeholder="https://..."
                            value={coverImage}
                            onChange={e => setCoverImage(e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-4 bg-black/20 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Card>

            {/* Wallet Settings - Simplified for Hackathon */}
            <Card className="p-0 overflow-hidden border border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Wallet size={18} className="text-brand-accent" />
                        Wallet & Payments
                    </h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center text-brand-accent">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-gray-400">Connected Wallet (Tempo)</div>
                                <div className="font-mono font-medium">{address}</div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={copyAddress}>
                            <Copy size={16} />
                        </Button>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-blue-400 mt-1" />
                            <div>
                                <h4 className="font-bold text-blue-400 mb-1">Tempo Testnet Funds</h4>
                                <p className="text-sm text-gray-300 mb-3">
                                    You need AlphaUSD or BetaUSD to test tipping features on Tempo Testnet.
                                </p>
                                <a
                                    href="https://docs.tempo.xyz/quickstart/faucet"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg inline-flex items-center gap-1 transition-colors"
                                >
                                    Get Faucet Funds <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
