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
            <aside style={{ width: '280px', borderRight: '1px solid #2e333d', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '24px', paddingLeft: '12px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #65b3ad, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }} onClick={() => router.push('/')}>Kinship</h2>
                </div>

                {/* Global Search Bar */}
                <div style={{ marginBottom: '24px', position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search creators..."
                        style={{ width: '100%', padding: '10px 12px 10px 40px', background: '#1a1d24', border: '1px solid #2e333d', borderRadius: '8px', color: '#fff', fontSize: '0.875rem', outline: 'none' }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                alert(`Search for quotes/creators: "${(e.currentTarget as HTMLInputElement).value}"`);
                            }
                        }}
                    />
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                </div>

                {/* Creator Profile Preview (Real Data) */}
                <div style={{ marginBottom: '40px', padding: '16px', background: '#1a1d24', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {mounted && profile?.avatarUrl ? (
                        <img
                            src={profile.avatarUrl}
                            alt="Avatar"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2e333d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            👻
                        </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {mounted && profile?.name ? profile.name : 'Creator'}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: '#65b3ad', fontFamily: 'monospace' }}>
                            {mounted && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connect Wallet'}
                        </p>
                    </div>
                </div>

                {/* Menu */}
                <nav style={{ flex: 1 }}>
                    {menuItems.map((item) => {
                        const isActive = pathname === item.path;
                        return (
                            <div
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                style={{
                                    padding: '12px 16px',
                                    marginBottom: '8px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: isActive ? 'rgba(101, 179, 173, 0.1)' : 'transparent',
                                    color: isActive ? '#65b3ad' : '#a1a1aa',
                                    fontWeight: isActive ? '600' : 'normal',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span>{item.icon}</span>
                                {item.label}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #2e333d' }}>
                    {/* Wallet Button is already in global navbar/sidebar, keeping it simple here or removing if redundant */}
                    <div style={{ marginBottom: '16px' }}>
                        <WalletButton />
                    </div>
                    <Button variant="outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => router.push('/')}>
                        ← Back to Home
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '48px', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
}
