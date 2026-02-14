'use client';

import { usePrivy, useLogin } from '@privy-io/react-auth';
import Button from './Button';
import { useEffect, useState } from 'react';
import { Copy, LogOut, Wallet, Plus } from 'lucide-react';
import { useToast } from './Toast';
// import LoginModal from './LoginModal'; // Removed
import { useRouter } from 'next/navigation';

export default function WalletButton({
    className = '',
    style = {},
    size = 'md',
    variant = 'primary'
}: {
    className?: string,
    style?: React.CSSProperties,
    size?: 'sm' | 'md' | 'lg',
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}) {
    const { logout, authenticated, user, ready, login, createWallet } = usePrivy();
    // const { login } = useLogin(); // Removed to use standard privy login
    const router = useRouter();
    const { addToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isCreatingWallet, setIsCreatingWallet] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log('🔌 [WalletButton] Mounted');
        console.log('🔌 [WalletButton] State:', { ready, authenticated, userWallet: user?.wallet?.address });

        // 🔍 DIAGNOSTIC: Check CSS theme configuration
        if (typeof window !== 'undefined') {
            const rootStyles = getComputedStyle(document.documentElement);
            const themeColor = rootStyles.getPropertyValue('--color-primary').trim();
            const bgColor = rootStyles.getPropertyValue('--color-bg-page').trim();
            const textColor = rootStyles.getPropertyValue('--color-text-primary').trim();
            console.log('🎨 [WalletButton] CSS Theme:', { themeColor, bgColor, textColor });

            // 🔍 DIAGNOSTIC: Check if current page has dark/light theme
            const bodyBg = getComputedStyle(document.body).backgroundColor;
            console.log('🎨 [WalletButton] Body background:', bodyBg);
        }

        // 🔍 DIAGNOSTIC: Check if SIWE hook is available
        console.log('🔍 [WalletButton] Checking SIWE availability...');
        console.log('🔍 [WalletButton] useLoginWithSiwe is NOT imported in WalletButton');
        console.log('🔍 [WalletButton] login/page.tsx DOES import useLoginWithSiwe');
    }, [ready, authenticated, user?.wallet?.address]);

    const copyAddress = () => {
        if (user?.wallet?.address) {
            navigator.clipboard.writeText(user.wallet.address);
            addToast('Address copied!', 'success');
        }
    };

    // Fallback if ready takes too long (e.g. network issue)
    const [showAnyway, setShowAnyway] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShowAnyway(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted || (!ready && !showAnyway)) {
        return (
            <Button
                variant={variant}
                size={size}
                className={`${className} opacity-50 cursor-wait`}
                style={style}
            >
                Loading...
            </Button>
        );
    }

    if (authenticated) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size={size}
                    onClick={async () => {
                        if (user?.wallet?.address) {
                            copyAddress();
                        } else {
                            // No wallet found - create one
                            if (isCreatingWallet) {
                                addToast('Creating wallet...', 'info');
                                return;
                            }
                            try {
                                setIsCreatingWallet(true);
                                addToast('Creating your embedded wallet...', 'info');
                                await createWallet();
                                addToast('Wallet created successfully!', 'success');
                            } catch (error) {
                                console.error('Failed to create wallet:', error);
                                addToast('Failed to create wallet. Please try again.', 'error');
                            } finally {
                                setIsCreatingWallet(false);
                            }
                        }
                    }}
                    className="flex items-center gap-2 font-mono text-xs"
                    style={{ ...style, borderColor: 'var(--color-border)' }}
                >
                    <span className={`w-2 h-2 rounded-full ${user?.wallet ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                    {user?.wallet ? formatAddress(user.wallet.address) : (user?.email?.address || 'No Wallet')}
                    {user?.wallet ? <Copy size={12} className="opacity-50" /> : <Plus size={12} className="opacity-50" />}
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-400"
                    title="Logout"
                >
                    <LogOut size={16} />
                </Button>
            </div>
        );
    }

    const handleLogin = () => {
        console.log('🖱️ [WalletButton] handleLogin clicked');
        console.log('🔍 [WalletButton] Login Method Check:');
        console.log('  - Using standard login() from usePrivy');
        console.log('  - NOT using useLoginWithSiwe (not imported)');

        if (!ready) {
            console.warn('⚠️ [WalletButton] Privy not ready yet');
            return;
        }

        console.log('🚀 [WalletButton] Calling login()');
        login();
    };

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={handleLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                style={style}
            >
                <Wallet size={18} />
                Connect Wallet
            </Button>
        </>
    );
}

function formatAddress(addr: string) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
