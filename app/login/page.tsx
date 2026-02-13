'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth, useLoginWithPasskey, useSignupWithPasskey, useLoginWithEmail } from '@privy-io/react-auth';
import { Zap, Fingerprint, Mail, Chrome, Wallet, Loader2, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

type LoginView = 'initial' | 'email' | 'otp';

export default function LoginPage() {
    const router = useRouter();
    const { ready, authenticated, login } = usePrivy();
    const { initOAuth } = useLoginWithOAuth();
    const { loginWithPasskey } = useLoginWithPasskey();
    const { signupWithPasskey } = useSignupWithPasskey();

    // Custom Email Hooks
    const { sendCode, loginWithCode } = useLoginWithEmail();

    const [view, setView] = useState<LoginView>('initial');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already authenticated
    useEffect(() => {
        if (ready && authenticated) {
            router.replace('/');
        }
    }, [ready, authenticated, router]);

    // --- Handlers ---

    const handleSendCode = async () => {
        if (!email) {
            setError('Please enter your email.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Send code to email
            await sendCode({ email });
            setView('otp');
        } catch (err: any) {
            console.error(err);
            setError('Failed to send code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginWithCode = async () => {
        if (!code) {
            setError('Please enter the code.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // Login with code only (email is handled by Privy state)
            await loginWithCode({ code });
        } catch (err: any) {
            console.error(err);
            setError('Invalid code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasskey = async () => {
        setIsLoading(true);
        setError(null);
        try {
            try {
                await loginWithPasskey();
            } catch {
                await signupWithPasskey();
            }
        } catch (err: any) {
            if (err?.message && !err.message.includes('cancelled')) {
                setError('Passkey access failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await initOAuth({ provider: 'google' });
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const handleWallet = async () => {
        setIsLoading(true);
        setError(null);
        // Explicitly call wallet login
        login({ loginMethods: ['wallet'] });
        setIsLoading(false);
    };

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 px-4">
            {/* ── Background Effects (Light) ── */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#e0e7ff_0%,transparent_50%)] opacity-70" />
            <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_50%_100%,#dbeafe_0%,transparent_30%)] opacity-60" />

            {/* ── Login Card ── */}
            <div className="relative z-10 w-full max-w-md space-y-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl transition-all">

                {/* Header */}
                <div className="text-center relative">
                    {view === 'initial' && (
                        <>
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
                                <Zap className="h-8 w-8" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In</h1>
                            <p className="mt-2 text-sm text-slate-500">Secure access to your dashboard</p>
                        </>
                    )}
                    {view === 'email' && (
                        <>
                            <button onClick={() => setView('initial')} className="absolute top-0 left-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-slate-900 mt-2">Email Login</h1>
                            <p className="mt-2 text-sm text-slate-500">We'll send you a One-Time Code</p>
                        </>
                    )}
                    {view === 'otp' && (
                        <>
                            <button onClick={() => setView('email')} className="absolute top-0 left-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-slate-900 mt-2">Enter Code</h1>
                            <p className="mt-2 text-sm text-slate-500">Sent to <span className="font-semibold text-slate-700">{email}</span></p>
                        </>
                    )}
                </div>

                {/* Form Group */}
                <div className="space-y-4">

                    {/* VIEW: INITIAL */}
                    {view === 'initial' && (
                        <>
                            <button
                                onClick={handlePasskey}
                                disabled={isLoading}
                                className="group w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2.5 cursor-pointer"
                            >
                                <Fingerprint className="h-5 w-5" />
                                <span>Continue with Passkey</span>
                            </button>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-slate-200"></div>
                                <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Or</span>
                                <div className="flex-grow border-t border-slate-200"></div>
                            </div>

                            <button
                                onClick={() => setView('email')}
                                disabled={isLoading}
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.99] flex items-center justify-center gap-2.5 cursor-pointer"
                            >
                                <Mail className="h-4.5 w-4.5 text-slate-500" />
                                Continue with Email
                            </button>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleGoogle}
                                    disabled={isLoading}
                                    className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Chrome className="h-4 w-4 text-slate-500" />
                                    Google
                                </button>
                                <button
                                    onClick={handleWallet}
                                    disabled={isLoading}
                                    className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <Wallet className="h-4 w-4 text-slate-500" />
                                    Wallet
                                </button>
                            </div>
                        </>
                    )}

                    {/* VIEW: EMAIL INPUT */}
                    {view === 'email' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={handleSendCode}
                                disabled={isLoading || !email}
                                className="group w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Send Code</span>}
                                {!isLoading && <ArrowRight className="h-4 w-4 opacity-50" />}
                            </button>
                        </div>
                    )}

                    {/* VIEW: OTP INPUT */}
                    {view === 'otp' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">Verification Code</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="123456"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-2xl font-bold tracking-widest text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                    autoFocus
                                    maxLength={6}
                                />
                            </div>
                            <button
                                onClick={handleLoginWithCode}
                                disabled={isLoading || code.length < 6}
                                className="group w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                                <span>{isLoading ? 'Verifying...' : 'Login'}</span>
                            </button>
                            <div className="text-center">
                                <button onClick={handleSendCode} className="text-xs text-indigo-600 font-medium hover:underline py-2">
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-center text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg">{error}</p>}
                </div>

            </div>

            <div className="relative z-10 mt-8 text-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                <Link href="/" className="flex items-center justify-center gap-2">
                    <span>← Return to Home</span>
                </Link>
            </div>
        </main>
    );
}
