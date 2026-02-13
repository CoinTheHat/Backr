'use client';

import { usePrivy } from '@privy-io/react-auth';
import Button from './Button';
import { useEffect, useState } from 'react';
import { Copy, LogOut } from 'lucide-react';
import { useToast } from './Toast';
import LoginModal from './LoginModal';
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
    const { logout, authenticated, user, ready } = usePrivy();
    const router = useRouter();
    const { addToast } = useToast();
    const [mounted, setMounted] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                    onClick={() => {
                        if (user?.wallet?.address) {
                            copyAddress();
                        } else {
                            router.push('/dashboard');
                        }
                    }}
                    className="flex items-center gap-2 font-mono text-xs"
                    style={{ ...style, borderColor: 'var(--color-border)' }}
                >
                    <span className={`w-2 h-2 rounded-full ${user?.wallet ? 'bg-emerald-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                    {user?.wallet ? formatAddress(user.wallet.address) : (user?.email?.address || 'No Wallet')}
                    {user?.wallet ? <Copy size={12} className="opacity-50" /> : null}
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

    return (
        <>
            <Button
                variant={variant}
                size={size}
                onClick={() => setIsLoginModalOpen(true)}
                className={className}
                style={style}
            >
                Login
            </Button>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        </>
    );
}

function formatAddress(addr: string) {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
