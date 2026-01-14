'use client';

import { useState, useRef } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Youtube, Globe, Lock, X, ChevronDown, Bold, Italic, Type, Quote, List } from 'lucide-react';
import Button from '../../components/Button';
import { useAccount } from 'wagmi';

export default function NewPostPage() {
    const { tiers, isDeployed, isLoading, refreshData } = useCommunity();
    const router = useRouter();
    const { address } = useAccount();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');

    // minTier: 0 means Public. 1 means Tier 1 (index 0). 2 means Tier 2 (index 1).
    // "All Members" usually means the lowest tier (Tier 1) and above.
    const [minTier, setMinTier] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toggle for media inputs
    const [showImageInput, setShowImageInput] = useState(false);
    const [showVideoInput, setShowVideoInput] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

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

    // Helper to insert markdown at cursor
    const insertMarkdown = (prefix: string, suffix: string) => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = content;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);

        const newText = before + prefix + selection + suffix + after;
        setContent(newText);

        // Restore focus and position cursor inside the tags
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                // Move cursor to end of inserted content (or middle if it was a wrapper)
                const newCursorPos = end + prefix.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) return alert('Please add a title and some content.');
        if (!address) return alert('Wallet not connected.');

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorAddress: address,
                    title,
                    content,
                    image: imageUrl,
                    videoUrl,
                    minTier,
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    isPublic: minTier === 0
                })
            });

            if (res.ok) {
                await refreshData();
                router.push('/community');
            } else {
                throw new Error('Failed to create post');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to publish post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-light font-sans flex flex-col">

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
                <button
                    onClick={() => router.back()}
                    className="text-gray-500 hover:text-brand-dark flex items-center gap-2 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden md:inline">Back</span>
                </button>

                <div className="text-sm font-bold text-brand-muted uppercase tracking-widest hidden md:block">
                    Creator Studio
                </div>

                <div className="flex gap-3">
                    <Button
                        onClick={handlePost}
                        disabled={isSubmitting || !title || !content}
                        variant="primary"
                        className="rounded-full px-6 py-2 text-sm shadow-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        {isSubmitting ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            </nav>

            {/* Main Editor */}
            <main className="flex-1 max-w-3xl w-full mx-auto py-12 px-6">

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {/* Title Input */}
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-5xl font-serif font-bold text-brand-dark placeholder-gray-300 border-none focus:ring-0 bg-transparent p-0 mb-8 leading-tight selection:bg-brand-primary/20"
                        autoFocus
                    />

                    {/* Formatting Toolbar */}
                    <div className="flex items-center gap-1 mb-6 p-1.5 bg-white shadow-sm border border-gray-100 rounded-xl w-fit sticky top-20 z-10">
                        <button
                            onClick={() => insertMarkdown('**', '**')}
                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                            title="Bold">
                            <Bold size={18} />
                        </button>
                        <button
                            onClick={() => insertMarkdown('*', '*')}
                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                            title="Italic">
                            <Italic size={18} />
                        </button>
                        <div className="w-px h-4 bg-gray-200 mx-1"></div>
                        <button
                            onClick={() => insertMarkdown('## ', '')}
                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                            title="Heading">
                            <Type size={18} />
                        </button>
                        <button
                            onClick={() => insertMarkdown('> ', '')}
                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                            title="Quote">
                            <Quote size={18} />
                        </button>
                        <button
                            onClick={() => insertMarkdown('- ', '')}
                            className="p-2 text-gray-400 hover:text-brand-dark hover:bg-gray-50 rounded-lg transition-colors"
                            title="List">
                            <List size={18} />
                        </button>
                    </div>

                    {/* Content Input */}
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        className="w-full min-h-[30vh] text-xl text-gray-700 leading-relaxed placeholder-gray-300 border-none focus:ring-0 bg-transparent p-0 resize-none overflow-hidden mb-12"
                        placeholder="Tell your story..."
                    />

                    {/* Media Previews */}
                    {(imageUrl || videoUrl) && (
                        <div className="grid gap-4 mb-8">
                            {imageUrl && (
                                <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                                    <img src={imageUrl} alt="Preview" className="w-full max-h-[400px] object-cover" />
                                    <button
                                        onClick={() => { setImageUrl(''); setShowImageInput(false); }}
                                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Floating Toolbar (Media & Access) */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-6 border-t border-gray-100">

                        {/* Media Buttons */}
                        <div className="flex gap-2">
                            <div className="relative group">
                                <button
                                    onClick={() => setShowImageInput(!showImageInput)}
                                    className={`p-3 rounded-xl transition-all flex items-center gap-2 ${showImageInput ? 'bg-brand-dark text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-primary hover:text-brand-primary shadow-sm'}`}
                                >
                                    <ImageIcon size={20} />
                                </button>
                                {/* Popover Input for Image */}
                                {showImageInput && (
                                    <div className="absolute bottom-full mb-3 left-0 w-[300px] bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 animate-in fade-in zoom-in-95">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="Paste image URL..."
                                                className="flex-1 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                                autoFocus
                                            />
                                            <button onClick={() => setShowImageInput(false)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative group">
                                <button
                                    onClick={() => setShowVideoInput(!showVideoInput)}
                                    className={`p-3 rounded-xl transition-all flex items-center gap-2 ${showVideoInput ? 'bg-brand-dark text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-brand-primary hover:text-brand-primary shadow-sm'}`}
                                >
                                    <Youtube size={20} />
                                </button>
                                {/* Popover Input for Video */}
                                {showVideoInput && (
                                    <div className="absolute bottom-full mb-3 left-0 w-[300px] bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 animate-in fade-in zoom-in-95">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={videoUrl}
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                placeholder="Paste video/embed link..."
                                                className="flex-1 text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
                                                autoFocus
                                            />
                                            <button onClick={() => setShowVideoInput(false)} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visibility Dropdown */}
                        <div className="relative group min-w-[240px]">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none">
                                {minTier === 0 ? <Globe size={18} /> : <Lock size={18} />}
                            </div>
                            <select
                                value={minTier}
                                onChange={(e) => setMinTier(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-gray-200 hover:border-brand-primary/50 text-gray-700 font-medium rounded-xl pl-11 pr-10 py-3 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all "
                            >
                                <option value={0}>Public (Everyone)</option>
                                {tiers.map((tier, index) => (
                                    <option key={tier.id} value={index + 1}>
                                        {tier.name} ($ {tier.price}) & Higher
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <ChevronDown size={16} />
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
