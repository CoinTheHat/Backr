import { createConfig, http } from '@wagmi/core';
import { defineChain } from 'viem';

export const tempoTestnet = defineChain({
    id: 42431,
    name: 'Tempo Testnet (Moderato)',
    nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc.moderato.tempo.xyz'] },
    },
    blockExplorers: {
        default: { name: 'Tempo Explorer', url: 'https://explore.tempo.xyz' },
    },
    testnet: true,
});

export const TOKENS = {
    alphaUsd: '0x20c0000000000000000000000000000000000001' as const,
    betaUsd: '0x20c0000000000000000000000000000000000002' as const,
    pathUsd: '0x20c0000000000000000000000000000000000000' as const,
};

export const config = createConfig({
    chains: [tempoTestnet],
    transports: {
        [tempoTestnet.id]: http(),
    },
});
