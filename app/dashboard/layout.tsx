'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import { useAccount } from 'wagmi';
import { supabase } from '@/utils/supabase';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { address } = useAccount();
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

                {/* Creator Profile Preview */}
                <div style={{
                    marginBottom: '40px',
                    padding: '16px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {mounted && profile?.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt="Avatar"
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                        />
                    ) : (
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#2e333d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👻
                        </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mounted && profile?.name ? profile.name : 'Creator'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#a1a1aa', fontFamily: 'monospace' }}>
                            {mounted && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
                        </p>
                    </div>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <div
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    // Active state: Neon gradient background
                                    background: isActive ? 'linear-gradient(90deg, rgba(157, 78, 221, 0.2), transparent)' : 'transparent',
                                    borderLeft: isActive ? '4px solid #9d4edd' : '4px solid transparent',
                                    color: isActive ? '#fff' : '#a1a1aa',
                                    fontWeight: isActive ? '600' : '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.3s',
                                    boxShadow: isActive ? '0 0 20px rgba(157, 78, 221, 0.1)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.color = '#fff';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#a1a1aa';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '1.2rem', filter: isActive ? 'drop-shadow(0 0 5px rgba(157, 78, 221, 0.8))' : 'none' }}>{item.icon}</span>
                                {item.label}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <WalletButton />
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
