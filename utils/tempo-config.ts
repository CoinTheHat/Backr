import { createConfig, http } from '@wagmi/core';
import { mainnet } from 'viem/chains';
import { defineChain } from 'viem';

export const tempoModerato = defineChain({
    id: 42431,
    name: 'Tempo Moderato',
    nativeCurrency: {
        decimals: 18,
        name: 'Tempo',
        symbol: 'USD',
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.tempo.xyz'],
        },
    },
    blockExplorers: {
        default: { name: 'Etherscan', url: 'https://scan.tempo.xyz' },
    },
    testnet: true,
});

export { mainnet };

export const TOKENS = {
    alphaUsd: '0x20c0000000000000000000000000000000000000001' as const,
    betaUsd: '0x20c0000000000000000000000000000000000000002' as const,
    thetaUsd: '0x20c0000000000000000000000000000000000000003' as const,
    pathUsd: '0x20c0000000000000000000000000000000000000000' as const,
};

export const config = createConfig({
    chains: [tempoModerato, mainnet],
    transports: {
        [tempoModerato.id]: http(),
        [mainnet.id]: http(),
    },
});
