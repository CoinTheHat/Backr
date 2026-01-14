'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useDisconnect } from 'wagmi';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import {
    LayoutDashboard,
    PenTool,
    Users,
    DollarSign,
    Settings,
    LogOut,
    Menu,
    X,
    ExternalLink
} from 'lucide-react';
import { supabase } from '@/utils/supabase';
import { useCommunity } from '../context/CommunityContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { address, isConnected } = useAccount();
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

    // Handle logout
    const handleLogout = () => {
        disconnect();
        router.push('/');
    };

    // Mobile Overlay
    const MobileOverlay = () => (
        <div
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            onClick={() => setIsSidebarOpen(false)}
        />
    );

    return (
        <div className="min-h-screen bg-bg-page text-text-primary font-sans flex">

            {/* Mobile Header (Hamburger) */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg">Studio</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
                    {/* Tiny avatar placeholder */}
                </div>
            </div>

            <MobileOverlay />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 bottom-0 left-0 z-40 w-[280px] bg-white border-r border-gray-200 shadow-xl lg:shadow-none transition-transform duration-300 transform lg:translate-x-0 overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-10 pl-2 pt-2">
                        <Link href="/" className="text-2xl font-bold font-serif hover:opacity-80 transition-opacity">
                            Backr<span className="text-brand-primary">.</span>
                        </Link>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    onClick={() => setIsSidebarOpen(false)} // close on mobile click
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all font-medium text-sm ${isActive
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <span className={isActive ? 'text-brand-accent' : ''}>{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer / User */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-3 px-2 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-lg">
                                👤
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold truncate text-gray-900">My Creator Page</div>
                                <div className="text-xs text-brand-primary truncate hover:underline cursor-pointer" onClick={() => router.push('/' + (address || ''))}>View Public Page ↗</div>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>
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
