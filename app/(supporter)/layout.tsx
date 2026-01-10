'use client';

import { useRouter, usePathname } from 'next/navigation';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import { useAccount } from 'wagmi';

export default function SupporterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isConnected } = useAccount();

    const navItems = [
        { label: 'Feed', path: '/feed' },
        { label: 'Explore', path: '/explore' }, // Dedicated explore page
        { label: 'My Memberships', path: '/memberships' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <nav className="glass-panel" style={{ padding: '0 48px', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px', borderRadius: '16px', position: 'sticky', top: '24px', zIndex: 10 }}>
                <h1
                    style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #65b3ad, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }}
                    onClick={() => router.push('/')}
                >
                    Kinship
                </h1>

                <div style={{ display: 'flex', gap: '32px' }}>
                    {navItems.map(item => (
                        <div
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            style={{
                                cursor: 'pointer',
                                color: pathname === item.path ? '#65b3ad' : '#a1a1aa',
                                fontWeight: pathname === item.path ? 'bold' : 'normal',
                                borderBottom: pathname === item.path ? '2px solid #65b3ad' : '2px solid transparent',
                                padding: '28px 0'
                            }}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {isConnected && (
                        <Button variant="outline" onClick={() => router.push('/dashboard')}>Dashboard</Button>
                    )}
                    <WalletButton />
                </div>
            </nav>

            <main style={{ flex: 1, padding: '48px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                {children}
            </main>
        </div>
    );
}
