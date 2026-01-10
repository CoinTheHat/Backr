'use client';

import { useAccount, useConnect, useDisconnect, useEnsName } from 'wagmi';
import { injected } from 'wagmi/connectors';
import Button from './Button';
import { useState } from 'react';

export default function WalletButton() {
    const { address, isConnected, chain } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { data: ensName } = useEnsName({ address });
    const [showDropdown, setShowDropdown] = useState(false);

    const formatAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    if (!isConnected) {
        return (
            <Button onClick={() => connect({ connector: injected() })} style={{ fontSize: '0.875rem', padding: '8px 16px' }}>
                Connect Wallet
            </Button>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ fontSize: '0.875rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#65b3ad' }}></div>
                {ensName || formatAddress(address as string)}
            </Button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: '#1a1d24',
                    border: '1px solid #2e333d',
                    borderRadius: '8px',
                    padding: '8px',
                    minWidth: '200px',
                    zIndex: 50,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ padding: '8px', borderBottom: '1px solid #2e333d', marginBottom: '8px' }}>
                        <p style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Connected to</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{chain?.name || 'Unknown Chain'}</p>
                    </div>
                    <button
                        onClick={() => { disconnect(); setShowDropdown(false); }}
                        style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px',
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
}
