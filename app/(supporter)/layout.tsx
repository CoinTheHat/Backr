'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import WalletButton from '../components/WalletButton';
import { usePrivy } from '@privy-io/react-auth';

export default function SupporterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { authenticated: isConnected } = usePrivy();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);

    const navItems = [
        { label: 'Explore', path: '/explore' },
        { label: 'Feed', path: '/feed' },
        { label: 'My Memberships', path: '/memberships' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .nav-link {
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    position: relative;
                    color: var(--color-text-secondary);
                    font-weight: 500;
                    padding: 8px 0;
                }
                .nav-link:hover {
                    color: var(--color-text-primary);
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--color-brand-blue);
                    transform: scaleX(0);
                    transition: transform 0.2s ease;
                    transform-origin: center;
                }
                .nav-link.active {
                    color: var(--color-text-primary);
                    font-weight: 600;
                }
                .nav-link.active::after {
                    transform: scaleX(1);
                }
                .search-input {
                    transition: all 0.3s ease;
                }
                .search-input:focus {
                    box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
                    border-color: var(--color-brand-blue) !important;
                }
                
                /* Desktop/Mobile Visibility */
                .desktop-nav { display: flex; }
                .mobile-bottom-nav { display: none; }
                
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-bottom-nav { display: flex !important; }
                    .nav-search { display: none !important; } /* Hide search on mobile header to save space, maybe move to explore page layout or show icon */
                    
                    /* Adjust padding for bottom nav */
                    main { padding-bottom: 80px !important; }
                    
                    /* Search icon toggle for mobile could be added here later */
                }
            `}} />

            {/* Top Navigation */}
            <nav className="sticky-blur" style={{
                padding: '0 min(24px, 5vw)',
                height: 'var(--header-height)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '24px'
            }}>
                {/* Left: Logo + Desktop Nav */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                    <div onClick={() => router.push('/')} className="cursor-pointer">
                        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.03em', margin: 0 }}>Backr</h1>
                    </div>

                    <div className="desktop-nav" style={{ gap: '32px', alignItems: 'center' }}>
                        {navItems.map(item => (
                            <div
                                key={item.path}
                                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                                onClick={() => router.push(item.path)}
                                style={{ cursor: 'pointer', fontSize: '0.95rem' }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Search Bar (Desktop Only) */}
                <div className="nav-search" style={{ flex: '0 1 400px', maxWidth: '400px', display: 'flex' }}>
                    <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1rem',
                            color: searchFocused ? 'var(--color-brand-blue)' : 'var(--color-text-tertiary)',
                            transition: 'color 0.2s'
                        }}>
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Find creators..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="search-input"
                            style={{
                                width: '100%',
                                background: 'var(--color-bg-page)',
                                border: '1px solid var(--color-border)',
                                padding: '10px 16px 10px 44px',
                                borderRadius: 'var(--radius-full)',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </form>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {isConnected && (
                        <div
                            className="hover-lift"
                            style={{
                                position: 'relative',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                background: 'var(--color-bg-surface)',
                                border: '1px solid var(--color-border)'
                            }}
                            onClick={() => router.push('/feed')}
                        >
                            <span style={{ fontSize: '1.1rem' }}>🔔</span>
                            {/* Notification Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '0px',
                                right: '0px',
                                width: '10px',
                                height: '10px',
                                background: 'var(--color-error)',
                                borderRadius: '50%',
                                border: '2px solid var(--color-bg-surface)'
                            }}></div>
                        </div>
                    )}

                    <WalletButton />

                    {/* Mobile Only: Menu Toggle (if needed, but using bottom bar instead) */}
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, width: '100%', paddingBottom: '96px' }}>
                <div className="page-container" style={{ paddingTop: '24px' }}>
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <div className="mobile-bottom-nav" style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(16px)',
                borderTop: '1px solid var(--color-border)',
                padding: '12px 24px 24px', // Extra padding for safe area
                justifyContent: 'space-between',
                zIndex: 100,
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
            }}>
                {navItems.map(item => {
                    const isActive = pathname === item.path;
                    return (
                        <div
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                                transition: 'all 0.2s',
                                flex: 1
                            }}
                        >
                            <div style={{
                                fontSize: '1.5rem',
                                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}>
                                {item.label === 'Explore' ? '🧭' : item.label === 'Feed' ? '⚡' : '🎟️'}
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: isActive ? 700 : 500 }}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
