'use client';

import { useState } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';

export default function NewPostPage() {
    const { addPost, tiers, isDeployed, isLoading } = useCommunity();
    const router = useRouter();

    const [content, setContent] = useState('');
    const [selectedTier, setSelectedTier] = useState(tiers[0]?.name || 'Public');

    if (isLoading) return <div className="min-h-screen bg-brand-light flex items-center justify-center text-brand-muted">Loading studio...</div>;

    if (!isDeployed) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-studio p-8 shadow-studio text-center border border-gray-100">
                    <div className="text-5xl mb-6">🔒</div>
                    <h2 className="text-2xl font-serif font-bold text-brand-dark mb-3">Deployment Required</h2>
                    <p className="text-brand-muted mb-8 leading-relaxed">
                        You need a deployed contract to publish exclusive content to your members.
                    </p>
                    <Button
                        onClick={() => router.push('/dashboard/settings')}
                        variant="primary"
                        className="w-full justify-center py-3 shadow-lg shadow-brand-primary/20"
                    >
                        Deploy Contract
                    </Button>
                    <button onClick={() => router.back()} className="mt-4 text-sm text-brand-muted hover:text-brand-dark underline decoration-gray-300 underline-offset-4">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const handlePost = () => {
        if (!content) return;
        addPost(content, selectedTier);
        router.push('/community');
    };

    return (
        <div className="min-h-screen bg-brand-light pt-8 pb-12 px-4 md:px-8">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8">
                    <button onClick={() => router.back()} className="text-sm text-brand-muted mb-2 hover:text-brand-dark flex items-center gap-1 font-medium group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-brand-dark">Create New Post</h1>
                </header>

                <div className="bg-white p-8 rounded-studio border border-gray-100 shadow-studio space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-2">Visibility</label>
                        <div className="flex flex-wrap gap-2">
                            {['Public', ...tiers.map(t => t.name)].map(tierName => (
                                <button
                                    key={tierName}
                                    onClick={() => setSelectedTier(tierName)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${selectedTier === tierName
                                        ? 'bg-brand-dark border-brand-dark text-white shadow-md'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-brand-primary hover:text-brand-primary'
                                        }`}
                                >
                                    {tierName}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-muted mb-2">Content</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full h-48 bg-gray-50 border border-gray-200 rounded-xl p-4 text-brand-dark resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all placeholder-gray-400"
                            placeholder="Share something with your community..."
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button onClick={() => router.back()} variant="ghost" className="text-gray-500 hover:text-gray-700">Cancel</Button>
                        <Button
                            onClick={handlePost}
                            className="px-8 shadow-lg shadow-brand-primary/20"
                            variant="primary"
                        >
                            Publish Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
