'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import { useAccount, useDisconnect } from 'wagmi';
import BrandLogo from '../components/BrandLogo';
import { supabase } from '@/utils/supabase';
import { useCommunity } from '../context/CommunityContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();
    const { isDeployed } = useCommunity(); // Use shared state
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

    // Fetch Profile for Sidebar (Name/Avatar)
    useEffect(() => {
        const fetchProfile = async () => {
            if (!address) return;
            const { data } = await supabase.from('creators').select('*').eq('address', address).single();
            if (data) setProfile(data);
        };
        fetchProfile();
    }, [address]);


    if (!mounted) return null;

    const displayName = profile?.name || 'Creator';

    const menuItems = [
        { label: 'Overview', path: '/dashboard', icon: '📊' },
        ...(isDeployed ? [
            { label: 'My Page', path: `/${address}`, icon: '🎨', external: true },
            { label: 'Community', path: '/community', icon: '📝' },
            { label: 'Audience', path: '/dashboard/audience', icon: '👥' },
            { label: 'Membership', path: '/community/manage-tiers', icon: '💎' },
            { label: 'Payouts', path: '/dashboard/earnings', icon: '💰' },
        ] : []),
        { label: 'Settings', path: '/dashboard/settings', icon: '⚙️' },
    ];

    // Access Control: Enforce Wallet Connection
    if (!address) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: 'var(--color-bg-page)', color: 'var(--color-text-primary)', textAlign: 'center'
            }}>
                <div className="card-surface" style={{ padding: '32px', maxWidth: '400px', margin: '16px' }}>
                    <h1 className="text-h1" style={{ marginBottom: '16px' }}>Dashboard Access</h1>
                    <p className="text-body" style={{ color: 'var(--color-text-secondary)', marginBottom: '32px' }}>Connect your wallet to manage your creator page.</p>
                    <WalletButton />
                    <Button variant="outline" style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }} onClick={() => router.push('/')}>
                        Return Home
                    </Button>
                </div>
            </div>
        );
    }

    const currentTitle = menuItems.find(i => i.path === pathname)?.label || 'Dashboard';

    return (
        <div className="dashboard-root" style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-family)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .dashboard-root {
                    display: flex;
                    flex-wrap: nowrap;
                    min-height: 100vh;
                }

                .dashboard-sidebar {
                    width: var(--sidebar-width);
                    border-right: 1px solid var(--color-border);
                    background: var(--color-bg-surface);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    z-index: 50;
                    left: 0;
                    transition: transform 0.3s ease;
                }
                
                .main-content {
                    flex: 1;
                    margin-left: var(--sidebar-width);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--color-bg-page);
                }

                @media (max-width: 1024px) {
                    .dashboard-root {
                        flex-direction: column;
                    }
                    .dashboard-sidebar { transform: translateX(-100%); }
                    .dashboard-sidebar.open { transform: translateX(0); }
                    .main-content { margin-left: 0 !important; }
                    
                    .mobile-header-trigger {
                        display: flex !important;
                        padding: 16px 24px;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 1px solid var(--color-border);
                        position: sticky;
                        top: 0;
                        background: var(--color-bg-surface);
                        z-index: 40;
                        width: 100%;
                    }
                }

                .nav-item {
                    padding: 12px 18px;
                    margin: 4px 0;
                    cursor: pointer;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                }
                .nav-item:hover { background: var(--color-bg-page); color: var(--color-text-primary); }
                .nav-item.active { 
                    background: var(--color-primary-light); 
                    color: var(--color-primary); 
                    font-weight: 600; 
                    border-left: 3px solid var(--color-primary);
                }
            `}} />

            {/* Mobile Header */}
            <div style={{ display: 'none' }} className="mobile-header-trigger">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', fontSize: '1.5rem' }}>☰</button>
                    <span style={{ fontWeight: 'bold' }}>Backr Studio</span>
                </div>

            </div>

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div style={{ padding: '24px 24px 12px' }}>
                    <div
                        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '40px' }}
                        onClick={() => router.push('/')}
                    >
                        {/* Logo - Text Only */}
                        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>Backr</div>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--color-bg-page)', borderRadius: '4px', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', marginLeft: 'auto' }}>STUDIO</span>
                    </div>

                    {/* Quick Action */}
                    <div style={{ marginBottom: '24px' }}>
                        <Button
                            onClick={() => router.push('/dashboard/posts')}
                            style={{ width: '100%', justifyContent: 'center', borderRadius: '12px' }}
                        >
                            + Create Post
                        </Button>
                    </div>

                    {/* Menu */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {menuItems.map(item => (
                            <div
                                key={item.path}
                                className={`nav-item ${pathname === item.path ? 'active' : ''}`}
                                onClick={() => router.push(item.path)}
                            >
                                <span style={{ opacity: 0.8, fontSize: '1.1rem' }}>{item.icon}</span>
                                {item.label}
                                {item.external && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.5 }}>↗</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Profile at Bottom */}
                <div style={{ marginTop: 'auto', padding: '16px 24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: profile?.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'var(--color-bg-page)', border: '1px solid var(--color-border)' }}></div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>{displayName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{address.slice(0, 6)}...{address.slice(-4)}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => { disconnect(); router.push('/'); }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', fontSize: '0.85rem', cursor: 'pointer', padding: 0 }}
                    >
                        Sign Out
                    </button>

                    {/* Mobile Close */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        style={{ display: 'none', marginTop: '16px', width: '100%', padding: '12px', background: 'var(--color-bg-page)', border: 'none', color: 'var(--color-text-primary)', borderRadius: '8px' }}
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
                {/* Topbar */}
                <header style={{
                    padding: '16px 40px',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--color-bg-surface)',
                    height: 'var(--header-height)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                }}>
                    {/* Left: Breadcrumb / Context */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                        <span style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>Studio</span>
                        <span style={{ color: 'var(--color-text-tertiary)' }}>/</span>
                        <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{currentTitle}</span>
                    </div>

                    {/* Right: Network Status + Profile/Wallet */}
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <WalletButton />
                    </div>
                </header>

                {/* Page Content */}
                <div className="page-container" style={{ paddingBottom: '80px', paddingTop: '32px' }}>
                    {children}
                </div>

                {/* Mobile FAB: Create Post */}
                <div
                    className="mobile-fab"
                    onClick={() => router.push('/dashboard/posts')}
                    style={{
                        position: 'fixed', bottom: '24px', right: '24px', zIndex: 60,
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'var(--color-primary)', boxShadow: 'var(--shadow-xl)',
                        display: 'none', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '1.5rem', cursor: 'pointer'
                    }}
                >
                    +
                </div>
                <style dangerouslySetInnerHTML={{ __html: `@media(max-width: 1024px) { .mobile-fab { display: flex !important; margin-left: auto; } }` }} />
            </main>
        </div>
    );
}
