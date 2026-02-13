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

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return addToast('Please enter a username', 'error');

        setLoading(true);
        try {
            const res = await fetch('/api/creators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    name: name.trim(),
                    bio: bio.trim(),
                    // Default values
                    profileImage: '',
                    coverImage: ''
                })
            });

            const data = await res.json();

            if (!res.ok) {
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

    return (
        <div className="min-h-screen bg-mist flex flex-col items-center justify-center p-4">
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
                        <label className="block text-sm font-bold text-slate-700 mb-2">Display Name / Username</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Luna Nova"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            required
                        />
                        <p className="text-xs text-slate-400 mt-2">This will be your unique handle on Backr.</p>
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
                        disabled={loading || !name}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <>Continue to Dashboard <ArrowRight size={20} /></>}
                    </button>
                </form>
            </div>
        </div>
    );
}
