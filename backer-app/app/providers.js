'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, tempoModerato, mainnet } from '../utils/tempo-config';
import { useState } from 'react';
import { CommunityProvider } from './context/CommunityContext';

export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient());

    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const isPrivyConfigured = appId && appId !== 'your_privy_app_id';

    if (!isPrivyConfigured) {
        return (
            <div style={{ padding: '20px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', margin: '20px' }}>
                <h3>Configuration Error</h3>
                <p>Please configure <strong>NEXT_PUBLIC_PRIVY_APP_ID</strong> in your <code>.env.local</code> file.</p>
                <p>The current value is invalid or missing.</p>
            </div>
        );
    }

    return (
        <PrivyProvider
            appId={appId}
            onSuccess={(user) => {
                console.log('✅ [Privy] onSuccess triggered');
                console.log('👤 [Privy] User:', user);
                console.log('👛 [Privy] Wallet:', user?.wallet);
            }}
            onError={(error) => {
                console.error('🔥 [Privy] onError triggered!');
                console.error('❌ [Privy] Error Object:', error);
                console.error('❌ [Privy] Error Message:', error?.message);
                console.error('❌ [Privy] Error Code:', error?.code);
            }}
            onReady={() => {
                console.log('🚀 [Privy] onReady triggered - SDK is initialized');
                // Check if ethereum is defined in window
                if (typeof window !== 'undefined') {
                    console.log('🌐 [Window] window.ethereum:', window.ethereum);
                    // @ts-ignore
                    console.log('🌐 [Window] injected providers:', window.ethereum?.providers || 'No providers array');
                }
            }}
            config={{
                defaultChain: tempoModerato,
                supportedChains: [tempoModerato, mainnet],
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: 'users-without-wallets',
                    },
                },
                appearance: {
                    theme: 'light',
                    accentColor: '#6366f1',
                    showWalletLoginFirst: true,
                },
            }}
        >
            <QueryClientProvider client={queryClient}>
                <WagmiProvider config={config}>
                    <CommunityProvider>
                        {children}
                    </CommunityProvider>
                </WagmiProvider>
            </QueryClientProvider>
        </PrivyProvider>
    );
}
