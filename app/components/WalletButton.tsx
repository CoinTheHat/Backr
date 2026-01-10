'use client';

import { useAccount, useConnect, useDisconnect, useEnsName, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Button from './Button';
import { useState, useEffect } from 'react';

export default function WalletButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();

    // Mantle Testnet Chain ID = 5003 (or 5001 for Mainnet, here assuming Testnet for safety as per context)
    // Actually typically 5003 is testnet. Let's assume we want to force whatever chain we configured.
    // We'll rely on wagmi chain definitions.

    const [showDropdown, setShowDropdown] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    // Fetch user profile on connect
    useEffect(() => {
        if (address) {
            fetch('/api/creators')
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
            <Button onClick={() => connect({ connector: injected() })} style={{ fontSize: '0.875rem', padding: '8px 16px' }} variant="primary">
                Connect Wallet
            </Button>
        );
    }

    // Network Enforcer
    const isWrongNetwork = chain?.id !== 5000; // Mantle Mainnet ID

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
                style={{ fontSize: '0.875rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '10px', height: '40px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
                {/* Avatar or Gradient Placeholder */}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: profile?.avatarUrl ? `url(${profile.avatarUrl}) center/cover` : 'linear-gradient(135deg, #65b3ad, #8b5cf6)', border: '1px solid rgba(255,255,255,0.2)' }}></div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fff' }}>
                        {profile?.name || formatAddress(address as string)}
                    </span>
                    {profile?.name && <span style={{ fontSize: '0.65rem', color: '#a1a1aa' }}>{formatAddress(address as string)}</span>}
                </div>
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
