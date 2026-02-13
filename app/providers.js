'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config, tempoModerato, mainnet } from '../utils/tempo-config';
import { useState } from 'react';
import { CommunityProvider } from './context/CommunityContext';

export function Providers({ children }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}
            onSuccess={(user) => {
                console.log('[PrivyProvider] Login success!', user);
                console.log('[PrivyProvider] Login success - user:', user);
            }}
            onError={(error) => {
                console.error('[PrivyProvider] Error:', error);
                console.error('[PrivyProvider] Error details:', error?.message, error?.code);
            }}
            onReady={() => {
                console.log('[PrivyProvider] Ready!');
                console.log('[PrivyProvider] App ID:', process.env.NEXT_PUBLIC_PRIVY_APP_ID);
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
                    theme: 'dark',
                    accentColor: '#6366f1',
                    loginMethods: ['email', 'sms'],
                    showWalletLoginFirst: false,
                    // externalWallets are disabled from loginMethods, but we can keep walletList empty or specific if needed later
                    walletList: [],
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
