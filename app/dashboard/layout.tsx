'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import { useAccount } from 'wagmi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { address } = useAccount();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);


    if (!mounted) return null; // or a skeleton loader

    const menuItems = [
        { label: 'Home', path: '/dashboard', icon: '🏠' },
        { label: 'Membership', path: '/dashboard/membership', icon: '💎' },
        { label: 'Posts', path: '/dashboard/posts', icon: '📝' }, // Future
        { label: 'Audience', path: '/dashboard/audience', icon: '👥' },
        { label: 'Earnings', path: '/dashboard/earnings', icon: '💰' },
        { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', borderRight: '1px solid #2e333d', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #65b3ad, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }} onClick={() => router.push('/')}>Kinship</h2>
                </div>

                {/* Creator Profile Preview */}
                <div style={{ marginBottom: '40px', padding: '16px', background: '#1a1d24', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#2e333d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        👻
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '0.875rem' }}>Creator</p>
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
