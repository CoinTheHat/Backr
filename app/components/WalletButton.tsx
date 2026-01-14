'use client';

import { useAccount, useConnect, useDisconnect, useEnsName, useSwitchChain, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Button from './Button';
import { useState, useEffect } from 'react';

export default function WalletButton({ className = '', style = {}, size = 'md', variant = 'primary' }: { className?: string, style?: React.CSSProperties, size?: 'sm' | 'md' | 'lg', variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) {
    const { address, isConnected, chain } = useAccount();
    const { connect, connectors } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { data: balance } = useBalance({ address });

    // Mantle Testnet Chain ID = 5003
    const [showDropdown, setShowDropdown] = useState(false);
    const [showConnectModal, setShowConnectModal] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    // Fetch user profile on connect
    useEffect(() => {
        if (address) {
            setShowConnectModal(false);
            fetch('/api/creators?includePending=true')
                .then(res => res.json())
                .then(creators => {
                    const found = creators.find((c: any) => c.address.toLowerCase() === address?.toLowerCase());
                    if (found) setProfile(found);
                });
        }
    }, [address]);

    const formatAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    if (!isConnected) {
        return (
            <>
                <Button
                    onClick={() => setShowConnectModal(true)}
                    size={size}
                    variant={variant}
                    className={className}
                    style={{ ...style }}
                >
                    Connect Wallet
                </Button>

                {showConnectModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 9999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        padding: '24px',
                        animation: 'fadeIn 0.2s ease-out'
                    }} onClick={() => setShowConnectModal(false)}>
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        `}} />
                        <div style={{
                            background: '#fff',
                            borderRadius: '24px',
                            boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.2)',
                            width: '100%', maxWidth: '420px',
                            display: 'flex', flexDirection: 'column',
                            overflow: 'hidden',
                            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} onClick={e => e.stopPropagation()}>

                            <div style={{ padding: '24px', borderBottom: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>Connect Wallet</h3>
                                    <button
                                        onClick={() => setShowConnectModal(false)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--color-text-tertiary)', lineHeight: 1, padding: '4px' }}>
                                        &times;
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                    Choose a wallet to connect to Backr.
                                </p>
                            </div>

                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
                                {connectors.map((connector) => (
                                    <button
                                        key={connector.uid}
                                        onClick={() => connect({ connector })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: 'var(--color-bg-page)',
                                            border: '1px solid var(--color-border)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.2s',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'var(--color-border)';
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Generic wallet icons mapping for visual flair */}
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                            }}>
                                                {connector.name.toLowerCase().includes('metamask') ? '🦊' :
                                                    connector.name.toLowerCase().includes('coinbase') ? '🔵' :
                                                        connector.name.toLowerCase().includes('walletconnect') ? '📡' :
                                                            connector.name.toLowerCase().includes('phantom') ? '👻' : '👛'}
                                            </div>
                                            {connector.name}
                                        </div>
                                        {connector.name === 'WalletConnect' && <span style={{ fontSize: '0.7rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>MOBILE</span>}
                                        <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
                                    </button>
                                ))}
                            </div>

                            <div style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid var(--color-border)', fontSize: '0.8rem', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
                                By connecting, you agree to our Terms of Service.
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Network Enforcer
    const isWrongNetwork = chain?.id !== 5000;

    if (isWrongNetwork) {
        return (
            <Button
                onClick={() => switchChain({ chainId: 5000 })}
                style={{ fontSize: '0.875rem', padding: '8px 16px', background: '#ef4444', border: 'none', color: '#fff' }}
            >
                Switch to Mantle
            </Button>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                    fontSize: '0.875rem',
                    padding: '6px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    height: '44px',
                    background: 'var(--color-bg-surface)', // Adapt to theme
                    border: '1px solid var(--color-border)',
                    borderRadius: '9999px',
                    color: 'var(--color-text-primary)', // Fix text color
                    transition: 'all 0.2s',
                    ...style
                }}
            >
                {/* Network Dot */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    paddingRight: '12px', borderRight: '1px solid var(--color-border)'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>Mantle</span>
                </div>

                {/* Balance */}
                {balance && (
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
                        {(Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(3)} {balance.symbol}
                    </div>
                )}

                {/* Avatar */}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: profile?.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'linear-gradient(135deg, #65b3ad, #8b5cf6)', border: '1px solid var(--color-border)' }}></div>

                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {profile?.name || formatAddress(address as string)}
                </span>
            </Button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: '#1a1d24', // Solid bg for readability
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '12px',
                    padding: '8px',
                    minWidth: '240px',
                    zIndex: 50,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(20px)'
                }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                            <p style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>Network</p>
                        </div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>{chain?.name}</p>
                    </div>

                    <button
                        onClick={() => window.location.href = '/dashboard/settings'}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: '#a1a1aa',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a1a1aa'; }}
                    >
                        <span>⚙️</span> Edit Profile
                    </button>

                    <button
                        onClick={() => { disconnect(); setShowDropdown(false); }}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 12px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '4px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <span>🚪</span> Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
