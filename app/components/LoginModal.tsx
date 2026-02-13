'use client';

import { useState } from 'react';
import { useLoginWithEmail } from '@privy-io/react-auth';
import { createPortal } from 'react-dom';
import { X, Mail, ArrowRight, Loader2 } from 'lucide-react';
import Button from './Button';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [loading, setLoading] = useState(false);

    // Headless Email Login Hook
    const { sendCode, loginWithCode } = useLoginWithEmail({
        onError: (error: string) => {
            setLoading(false);
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            // Force state log
            console.log('Sending code...');
            await sendCode({ email });
            // Manual transition in case callback doesn't fire
            console.log('Code sent successfully via promise resolution');
            setLoading(false);
            setStep('code');
        } catch (err) {
            console.error('Send code error:', err);
            setLoading(false);
            alert('Failed to send code. See console.');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setLoading(true);
        try {
            await loginWithCode({ code });
            onClose(); // Close modal on success
        } catch (err) {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-[#111] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                        <Mail size={24} />
                    </div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Welcome Back
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        Sign in to support creators on Tempo
                    </p>
                </div>

                {step === 'email' ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                                autoFocus
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full justify-center py-3"
                            disabled={loading || !email}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Continue with Email'}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="text-center mb-2">
                            <span className="text-xs text-gray-400">Code sent to {email}</span>
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="ml-2 text-xs text-indigo-400 hover:text-indigo-300"
                            >
                                Change
                            </button>
                        </div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                            maxLength={6}
                            autoFocus
                            required
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full justify-center py-3"
                            disabled={loading || code.length < 6}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify & Login'}
                        </Button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
