'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Button from '../components/Button';
import WalletButton from '../components/WalletButton';
import { useAccount } from 'wagmi';

export default function SupporterLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isConnected } = useAccount();
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', color: '#000' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                .nav-link {
                    transition: all 0.2s ease;
                    position: relative;
                }
                .nav-link::after {
                    content: '';
                    position: absolute;
                    bottom: -20px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #5865F2;
                    transform: scaleX(0);
                    transition: transform 0.2s ease;
                }
                .nav-link.active::after {
                    transform: scaleX(1);
                }
                .search-input {
                    transition: all 0.3s ease;
                }
                .search-input:focus {
                    box-shadow: 0 0 0 3px rgba(88, 101, 242, 0.1);
                }
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-nav { display: flex !important; }
                    .nav-search { width: 100% !important; max-width: 100% !important; }
                }
            `}} />

            <nav style={{
                padding: '0 min(64px, 5vw)',
                height: '72px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e5e7eb',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                {/* Left: Logo + Nav Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
                    <h1
                        style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '1.5rem',
                            fontWeight: '400',
                            color: '#000',
                            cursor: 'pointer',
                            letterSpacing: '-0.02em',
                            margin: 0
                        }}
                        onClick={() => router.push('/')}
                    >
                        Backr
                    </h1>

                    <div className="desktop-nav" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        {navItems.map(item => (
                            <div
                                key={item.path}
                                className={`nav-link ${pathname === item.path ? 'active' : ''}`}
                                onClick={() => router.push(item.path)}
                                style={{
                                    cursor: 'pointer',
                                    color: pathname === item.path ? '#000' : '#71717a',
                                    fontWeight: pathname === item.path ? '600' : '500',
                                    fontSize: '0.95rem',
                                    padding: '8px 0'
                                }}
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Center: Search Bar */}
                <div className="nav-search" style={{ flex: '0 1 500px', maxWidth: '500px', display: 'flex' }}>
                    <form onSubmit={handleSearch} style={{ width: '100%', position: 'relative' }}>
                        <span style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.1rem',
                            color: searchFocused ? '#5865F2' : '#9ca3af',
                            transition: 'color 0.2s'
                        }}>
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search creators..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="search-input"
                            style={{
                                width: '100%',
                                background: '#f9fafb',
                                border: searchFocused ? '2px solid #5865F2' : '2px solid #e5e7eb',
                                padding: '10px 20px 10px 48px',
                                borderRadius: '50px',
                                color: '#000',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </form>
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    {/* Notification Bell */}
                    {isConnected && (
                        <div
                            style={{
                                position: 'relative',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            onClick={() => router.push('/feed')}
                        >
                            <span style={{ fontSize: '1.3rem' }}>🔔</span>
                            {/* Notification Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '6px',
                                right: '6px',
                                width: '8px',
                                height: '8px',
                                background: '#ef4444',
                                borderRadius: '50%',
                                border: '2px solid #fff'
                            }}></div>
                        </div>
                    )}

                    {isConnected && (
                        <Button
                            variant="outline"
                            onClick={() => router.push('/dashboard')}
                            style={{
                                fontSize: '0.9rem',
                                padding: '10px 20px',
                                borderRadius: '50px',
                                border: '2px solid #e5e7eb',
                                color: '#000',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#000';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = '#000';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            Create
                        </Button>
                    )}
                    <WalletButton />
                </div>
            </nav>

            <main style={{ flex: 1, padding: '0', margin: '0 auto', width: '100%' }}>
                {children}
            </main>
        </div>
    );
}
