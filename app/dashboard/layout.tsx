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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Fetch Profile for Sidebar
    useEffect(() => {
        const fetchProfile = async () => {
            if (!address) return;
            const { data } = await supabase.from('creators').select('*').eq('address', address).single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [address]);


    if (!mounted) return null;

    const isCreator = profile?.contractAddress;
    const displayName = profile?.name || 'Creator';

    const menuItems = [
        { label: 'Overview', path: '/dashboard', icon: '📊' },
        ...(isCreator ? [
            { label: 'My Page', path: `/${address}`, icon: '🎨', external: true },
            { label: 'Audience', path: '/dashboard/audience', icon: '👥' },
            { label: 'Posts', path: '/dashboard/posts', icon: '📝' },
            { label: 'Membership', path: '/dashboard/membership', icon: '💎' },
            { label: 'Payouts', path: '/dashboard/earnings', icon: '💰' },
        ] : []),
        { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    // Access Control: Enforce Wallet Connection
    if (!address) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: '#fff', color: '#000', textAlign: 'center'
            }}>
                <div style={{ marginBottom: '24px', padding: '32px', background: '#fafafa', borderRadius: '24px', border: '1px solid #e5e7eb', maxWidth: '400px', margin: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '16px' }}>Dashboard Access</h1>
                    <p style={{ color: '#52525b', marginBottom: '32px' }}>Connect your wallet to manage your creator page.</p>
                    <WalletButton />
                    <Button variant="outline" style={{ marginTop: '24px', width: '100%', justifyContent: 'center', borderRadius: '12px' }} onClick={() => router.push('/')}>
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fff', color: '#000', fontFamily: 'var(--font-geist-sans)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-sidebar {
                    width: 260px;
                    border-right: 1px solid #e5e7eb;
                    background: #f9fafb;
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    z-index: 50;
                    transition: transform 0.3s ease;
                }
                
                .main-content {
                    flex: 1;
                    margin-left: 260px;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: #fff;
                }

                @media (max-width: 1024px) {
                    .dashboard-sidebar { transform: translateX(-100%); }
                    .dashboard-sidebar.open { transform: translateX(0); }
                    .main-content { margin-left: 0; }
                }

                .nav-item {
                    padding: 10px 16px;
                    margin: 2px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    color: #52525b;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                }
                .nav-item:hover { background: #e4e4e7; color: #000; }
                .nav-item.active { background: #e5e7eb; color: #000; font-weight: 600; }
            `}} />

            {/* Mobile Header */}
            <div style={{ display: 'none' }} className="mobile-header-trigger">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media (max-width: 1024px) {
                        .mobile-header-trigger {
                            display: flex !important;
                            padding: 16px 24px;
                            justify-content: space-between;
                            align-items: center;
                            border-bottom: 1px solid #e5e7eb;
                            position: sticky;
                            top: 0;
                            background: #fff;
                            z-index: 40;
                        }
                    }
                 `}} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: '#000', fontSize: '1.5rem' }}>☰</button>
                    <span style={{ fontWeight: 'bold' }}>Backr Dashboard</span>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000' }}></div>
            </div>

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '24px' }}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '32px' }}
                        onClick={() => router.push('/')}
                    >
                        {/* Logo */}
                        <div style={{ width: '32px', height: '32px', background: '#000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '14px', height: '14px', background: '#fff', borderRadius: '2px' }}></div>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000' }}>Backr</div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f3f4f6', borderRadius: '4px', color: '#52525b', border: '1px solid #e5e7eb', marginLeft: 'auto' }}>STUDIO</span>
                    </div>

                    {/* Quick Action */}
                    <Button
                        onClick={() => router.push('/dashboard/posts')}
                        style={{ width: '100%', justifyContent: 'center', borderRadius: '9999px', marginBottom: '24px', fontWeight: '600', background: '#000', color: '#fff', border: 'none' }}
                    >
                        + Create Post
                    </Button>

                    {/* Menu */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {menuItems.map(item => (
                            <div
                                key={item.path}
                                className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                                onClick={() => router.push(item.path)}
                            >
                                <span style={{ opacity: 0.7 }}>{item.icon}</span>
                                {item.label}
                                {item.external && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5 }}>↗</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Profile at Bottom */}
                <div style={{ marginTop: 'auto', padding: '24px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: profile?.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : '#e5e7eb', border: '1px solid #e5e7eb' }}></div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#000' }}>{displayName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{address.slice(0, 6)}...{address.slice(-4)}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => { disconnect(); router.push('/'); }}
                        style={{ background: 'none', border: 'none', color: '#71717a', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                        Log Out
                    </button>

                    {/* Mobile Close */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ display: 'none', marginTop: '16px', width: '100%', padding: '12px', background: '#f3f4f6', border: 'none', color: '#000', borderRadius: '8px' }}
                        className="mobile-close"
                    >
                        Close Menu
                    </button>
                    <style dangerouslySetInnerHTML={{ __html: `@media(max-width: 1024px) { .mobile-close { display: block !important; } }` }} />
                </div>
            </aside>

            {/* Backdrop */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
                ></div>
            )}

            {/* Content Area */}
            <main className="main-content">
                <header style={{ padding: '24px 40px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000' }}>
                        {menuItems.find(i => i.path === pathname)?.label || 'Dashboard'}
                    </h2>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* Network Status / Etc */}
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <span style={{ fontSize: '0.85rem', color: '#71717a' }}>Mantle Network</span>
                    </div>
                </header>
                <div style={{ padding: '40px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
