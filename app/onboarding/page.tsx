'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function OnboardingPage() {
    const router = useRouter();
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const { addToast } = useToast();

    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        // usePrivy logout handles everything
        const { logout } = usePrivy();
        await logout();
        router.push('/');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return addToast('Please enter a display name', 'error');
        if (!username.trim()) return addToast('Please enter a username', 'error');

        setLoading(true);
        try {
            const res = await fetch('/api/creators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    username: username.trim().toLowerCase(),
                    name: name.trim(),
                    email: user?.email?.address, // Send email for duplicate check
                    bio: bio.trim(),
                    // Default values
                    profileImage: '',
                    coverImage: ''
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 409 && data.error.includes('Email')) {
                    // Specific handling for duplicate email
                    throw new Error(data.error + ' Try logging out and signing in with the original method.');
                }
                throw new Error(data.error || 'Failed to create profile');
            }

            addToast('Welcome to Backr!', 'success');
            router.push('/dashboard');
        } catch (error: any) {
            console.error(error);
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Need to get logout function
    const { logout } = usePrivy();

    return (
        <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="text-sm font-medium text-slate-500 hover:text-rose-500 transition-colors"
                >
                    Log Out / Switch Account
                </button>
            </div>

            <div className="mb-8 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/20">
                    <Rocket size={32} />
                </div>
                <h1 className="text-3xl font-bold font-serif text-slate-900">Welcome to Backr</h1>
                <p className="text-slate-500 text-center max-w-sm">
                    Let's set up your creator profile to get you started.
                </p>
            </div>

            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-white">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (!username && e.target.value) {
                                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                }
                            }}
                            placeholder="e.g. Luna Nova"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 text-slate-400 font-medium">@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                placeholder="lunanova"
                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                required
                            />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Unique handle for your profile URL.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Bio (Optional)</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell your fans what you create..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name || !username}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Continue to Dashboard <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
