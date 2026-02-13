import { createConfig, http } from '@wagmi/core';
import { mainnet, tempoModerato } from 'viem/chains';

// Export tempoModerato for use elsewhere if needed, though it's now direct from viem
export { tempoModerato };

export { mainnet };

export const TOKENS = {
    alphaUsd: '0x20c0000000000000000000000000000000000000001' as const,
    betaUsd: '0x20c0000000000000000000000000000000000000002' as const,
    thetaUsd: '0x20c0000000000000000000000000000000000000003' as const,
    pathUsd: '0x20c0000000000000000000000000000000000000000' as const,
};

export const config = createConfig({
    chains: [tempoModerato, mainnet],
    multiInjectedProviderDiscovery: false,
    transports: {
        [tempoModerato.id]: http(),
        [mainnet.id]: http(),
    },
});
