'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import { useAccount, useDisconnect } from 'wagmi';
import { supabase } from '@/utils/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const [mounted, setMounted] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Profile for Sidebar
    useEffect(() => {
        const fetchProfile = async () => {
            if (!address) return;
            const { data } = await supabase.from('creators').select('*').eq('address', address).single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [address]);


    if (!mounted) return null; // or a skeleton loader

    const menuItems = [
        { label: 'Home', path: '/dashboard', icon: '🏠' },
        { label: 'Membership', path: '/dashboard/membership', icon: '💎' },
        { label: 'Posts', path: '/dashboard/posts', icon: '📝' }, // Future
        { label: 'Audience', path: '/dashboard/audience', icon: '👥' },
        { label: 'Earnings', path: '/dashboard/earnings', icon: '💰' },
        { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    // Access Control: Enforce Wallet Connection
    if (!address) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#11141a', color: '#fff', textAlign: 'center'
            }}>
                <div style={{ marginBottom: '24px', padding: '24px', background: '#1a1d24', borderRadius: '16px', border: '1px solid #2e333d' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Access Restricted 🔒</h1>
                    <p style={{ color: '#a1a1aa', marginBottom: '24px' }}>You must connect your wallet to access the Creator Dashboard.</p>
                    <WalletButton />
                    <Button variant="outline" style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }} onClick={() => router.push('/')}>
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{
                width: '280px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(5, 5, 10, 0.6)',
                backdropFilter: 'blur(20px)',
                position: 'fixed', // Fixed sidebar
                height: '100vh',
                zIndex: 50
            }}>
                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <h2 style={{
                        fontSize: '1.8rem',
                        fontWeight: '900',
                        background: 'linear-gradient(to right, #4cc9f0, #fff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        cursor: 'pointer',
                        textShadow: '0 0 20px rgba(76, 201, 240, 0.5)'
                    }} onClick={() => router.push('/')}>Kinship</h2>
                </div>

                {/* Global Search Bar */}
                <div style={{ marginBottom: '32px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search creators..."
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#9d4edd'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ marginBottom: '16px', padding: '0 12px' }}>
                        <button
                            onClick={() => {
                                disconnect();
                                router.push('/');
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '12px',
                                color: '#ef4444',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                            onMouseLeave={(e: any) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        >
                            <span>🚪</span> Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Spacer for Fixed Sidebar */}
            <div style={{ width: '280px', flexShrink: 0 }}></div>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
