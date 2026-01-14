import { createConfig, http } from 'wagmi';
import { mantle } from 'wagmi/chains';
import { createClient } from 'viem';
import { walletConnect, injected, coinbaseWallet, metaMask } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'c045b46700c8f1e944C3c09f3e09871c'; // Fallback or user provided

export const config = createConfig({
    chains: [mantle],
    connectors: [
        metaMask(),
        injected(),
        walletConnect({ projectId }),
        coinbaseWallet({ appName: 'Backr' }),
    ],
    client({ chain }) {
        return createClient({ chain, transport: http('https://mantle-rpc.publicnode.com') });
    },
});
