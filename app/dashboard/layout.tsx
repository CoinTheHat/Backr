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
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(5, 5, 10, 0.5)',
                backdropFilter: 'blur(20px)',
                position: 'fixed',
                height: '100vh',
                zIndex: 50
            }}>
                <div style={{ marginBottom: '40px', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.8rem' }}>💜</div>
                    <h2 style={{
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        color: '#fff',
                        letterSpacing: '-0.02em',
                        cursor: 'pointer'
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
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            color: '#fff',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'rgba(157, 78, 221, 0.5)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(157, 78, 221, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255,255,255,0.08)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>

                {/* Creator Profile Preview */}
                <div style={{
                    marginBottom: '40px',
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                    {mounted && profile?.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt="Avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                            🦄
                        </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#fff' }}>
                            {mounted && profile?.name ? profile.name : 'Creator'}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: '#65b3ad', fontFamily: 'monospace' }}>
                            {mounted && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect'}
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
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    // Active state: Gradient background like reference
                                    background: isActive ? 'linear-gradient(90deg, rgba(88, 28, 135, 0.6) 0%, rgba(139, 92, 246, 0.1) 100%)' : 'transparent',
                                    color: isActive ? '#fff' : '#a1a1aa',
                                    fontWeight: isActive ? '600' : '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.2s',
                                    boxShadow: isActive ? '0 4px 12px rgba(88, 28, 135, 0.3)' : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = '#fff';
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.color = '#a1a1aa';
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '1.1rem', opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                                {item.label}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                disconnect();
                                router.push('/');
                            }}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '24px',
                                transition: 'all 0.2s',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                padding: '14px'
                            }}
                            onMouseEnter={(e: any) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e: any) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Log Out
                        </Button>
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
