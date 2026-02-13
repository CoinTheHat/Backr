import { createConfig, http } from '@wagmi/core';
import { tempoModerato } from 'viem/chains';

export { tempoModerato };

export const TOKENS = {
    alphaUsd: '0x20c0000000000000000000000000000000000001' as const,
    betaUsd: '0x20c0000000000000000000000000000000000002' as const,
    pathUsd: '0x20c0000000000000000000000000000000000000' as const,
};

export const config = createConfig({
    chains: [tempoModerato],
    transports: {
        [tempoModerato.id]: http(),
    },
});
