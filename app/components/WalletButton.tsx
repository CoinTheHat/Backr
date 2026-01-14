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
                    const found = creators.find((c: any) => c.address === address);
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
                        background: 'rgba(0,0,0,0.7)', zIndex: 100,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }} onClick={() => setShowConnectModal(false)}>
                        <div style={{
                            background: '#1a1d24', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '400px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Connect Wallet</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {connectors.map((connector) => (
                                    <button
                                        key={connector.uid}
                                        onClick={() => connect({ connector })}
                                        style={{
                                            padding: '16px',
                                            borderRadius: '16px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    >
                                        {connector.name}
                                        {connector.name === 'WalletConnect' && <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Mobile</span>}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowConnectModal(false)}
                                style={{
                                    marginTop: '24px', width: '100%', padding: '12px',
                                    background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
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
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '9999px',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s'
                }}
            >
                {/* Network Dot */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    paddingRight: '12px', borderRight: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981' }}>Mantle</span>
                </div>

                {/* Balance */}
                {balance && (
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>
                        {(Number(balance.value) / Math.pow(10, balance.decimals)).toFixed(3)} {balance.symbol}
                    </div>
                )}

                {/* Avatar */}
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: profile?.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'linear-gradient(135deg, #65b3ad, #8b5cf6)', border: '1px solid rgba(255,255,255,0.2)' }}></div>

                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                    {formatAddress(address as string)}
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
