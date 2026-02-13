'use client';

import { useState, useRef } from 'react';
import { useCommunity } from '../../context/CommunityContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Image as ImageIcon, Youtube, Globe, Lock, X, ChevronDown, Bold, Italic, Type, Quote, List, Upload, Send, Sparkles } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '../../components/Toast';

export default function NewPostPage() {
    const { tiers, isLoading, refreshData } = useCommunity();
    const router = useRouter();
    const { user } = usePrivy();
    const address = user?.wallet?.address;
    const { showToast, ToastComponent } = useToast();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [minTier, setMinTier] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImageInput, setShowImageInput] = useState(false);
    const [showVideoInput, setShowVideoInput] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-mist flex items-center justify-center">
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '100ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '200ms' }}></div>
            </div>
        </div>
    );

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
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPos = end + prefix.length;
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 0);
    };

    const handlePost = async () => {
        if (!title.trim() || !content.trim()) return showToast('Please add a title and content.', 'error');
        if (!address) return showToast('Wallet not connected.', 'error');

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
                showToast('Post published!', 'success');
                await refreshData();
                router.push('/community');
            } else {
                throw new Error('Failed to create post');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to publish. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 1000;
                let w = img.width, h = img.height;
                if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
                else { if (h > MAX) { w *= MAX / h; h = MAX; } }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, w, h);
                    setImageUrl(canvas.toDataURL('image/jpeg', 0.7));
                    setShowImageInput(true);
                }
            };
            if (event.target?.result) img.src = event.target.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) processFile(e.target.files[0]);
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) { processFile(file); e.preventDefault(); return; }
            }
        }
    };

    const toolbarBtns = [
        { icon: <Bold size={16} />, action: () => insertMarkdown('**', '**'), tip: 'Bold' },
        { icon: <Italic size={16} />, action: () => insertMarkdown('*', '*'), tip: 'Italic' },
        null, // separator
        { icon: <Type size={16} />, action: () => insertMarkdown('## ', ''), tip: 'Heading' },
        { icon: <Quote size={16} />, action: () => insertMarkdown('> ', ''), tip: 'Quote' },
        { icon: <List size={16} />, action: () => insertMarkdown('- ', ''), tip: 'List' },
    ];

    return (
        <div className="min-h-screen bg-mist font-sans flex flex-col">
            {ToastComponent}

            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-16 flex items-center justify-between px-4 md:px-8">
                <button
                    onClick={() => router.back()}
                    className="text-slate-500 hover:text-slate-900 flex items-center gap-2 font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                >
                    <ArrowLeft size={18} />
                    <span className="hidden sm:inline">Back</span>
                </button>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-[.2em] hidden md:block">
                    New Post
                </div>

                <button
                    onClick={handlePost}
                    disabled={isSubmitting || !title || !content}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-95"
                >
                    <Send size={14} />
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
            </nav>

            {/* Main Editor */}
            <main className="flex-1 max-w-3xl w-full mx-auto py-10 md:py-16 px-6">

                {/* Editor Card */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

                    {/* Title */}
                    <div className="px-8 md:px-12 pt-10">
                        <input
                            type="text"
                            placeholder="Give your post a title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-3xl md:text-4xl font-bold text-slate-900 placeholder-slate-300 border-none focus:ring-0 focus:outline-none bg-transparent p-0 leading-tight"
                            style={{ fontFamily: 'var(--font-serif), Georgia, serif' }}
                            autoFocus
                        />
                    </div>

                    {/* Divider */}
                    <div className="mx-8 md:mx-12 my-6 h-px bg-slate-100"></div>

                    {/* Formatting Toolbar */}
                    <div className="px-8 md:px-12 mb-4">
                        <div className="flex items-center gap-0.5 p-1 bg-slate-50 rounded-xl w-fit">
                            {toolbarBtns.map((btn, i) =>
                                btn === null ? (
                                    <div key={i} className="w-px h-5 bg-slate-200 mx-1"></div>
                                ) : (
                                    <button
                                        key={i}
                                        onClick={btn.action}
                                        className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-all"
                                        title={btn.tip}
                                    >
                                        {btn.icon}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    {/* Content Input */}
                    <div className="px-8 md:px-12 pb-6">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onPaste={handlePaste}
                            className="w-full min-h-[35vh] text-[17px] text-slate-600 leading-[1.8] placeholder-slate-300 border-none focus:ring-0 focus:outline-none bg-transparent p-0 resize-none overflow-hidden"
                            placeholder="Write something amazing..."
                        />
                    </div>

                    {/* Image Preview */}
                    {imageUrl && (
                        <div className="px-8 md:px-12 pb-6">
                            <div className="relative group rounded-2xl overflow-hidden border border-slate-100">
                                <img src={imageUrl} alt="Preview" className="w-full max-h-[400px] object-cover" />
                                <button
                                    onClick={() => { setImageUrl(''); setShowImageInput(false); }}
                                    className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Bottom Toolbar */}
                    <div className="px-8 md:px-12 py-5 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                        {/* Media Buttons */}
                        <div className="flex gap-2">
                            {/* Image Upload */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowImageInput(!showImageInput)}
                                    className={`p-2.5 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${showImageInput
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary shadow-sm'}`}
                                >
                                    <ImageIcon size={18} />
                                </button>
                                {showImageInput && (
                                    <div className="absolute bottom-full mb-3 left-0 w-[300px] bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 z-20">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Image</p>
                                        <div className="flex gap-2 items-center">
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                                                title="Upload"
                                            >
                                                <Upload size={16} />
                                            </button>
                                            <input
                                                type="text"
                                                value={imageUrl}
                                                onChange={(e) => setImageUrl(e.target.value)}
                                                placeholder="or paste a URL..."
                                                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary min-w-0 bg-slate-50"
                                                autoFocus
                                            />
                                            <button onClick={() => setShowImageInput(false)} className="text-slate-400 hover:text-rose-500 p-1">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                            </div>

                            {/* Video */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowVideoInput(!showVideoInput)}
                                    className={`p-2.5 rounded-xl transition-all text-sm font-medium flex items-center gap-2 ${showVideoInput
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary shadow-sm'}`}
                                >
                                    <Youtube size={18} />
                                </button>
                                {showVideoInput && (
                                    <div className="absolute bottom-full mb-3 left-0 w-[300px] bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-4 z-20">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Add Video</p>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={videoUrl}
                                                onChange={(e) => setVideoUrl(e.target.value)}
                                                placeholder="Paste video URL..."
                                                className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50"
                                                autoFocus
                                            />
                                            <button onClick={() => setShowVideoInput(false)} className="text-slate-400 hover:text-rose-500 p-1">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Visibility Dropdown */}
                        <div className="relative min-w-[200px]">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                {minTier === 0
                                    ? <Globe size={16} className="text-emerald-500" />
                                    : <Lock size={16} className="text-amber-500" />}
                            </div>
                            <select
                                value={minTier}
                                onChange={(e) => setMinTier(Number(e.target.value))}
                                className="w-full appearance-none bg-white border border-slate-200 text-slate-700 font-medium rounded-xl pl-10 pr-9 py-2.5 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                            >
                                <option value={0}>Public (Everyone)</option>
                                {tiers.map((tier, index) => (
                                    <option key={tier.id} value={index + 1}>
                                        {tier.name} (${tier.price}) & Above
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tip */}
                <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-1.5">
                    <Sparkles size={12} />
                    Tip: You can paste images directly into the editor
                </p>
            </main>
        </div>
    );
}
