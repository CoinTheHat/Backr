import { createConfig, http } from 'wagmi';
import { mantleTestnet } from 'wagmi/chains';
import { createClient } from 'viem';

export const config = createConfig({
    chains: [mantleTestnet],
    client({ chain }) {
        return createClient({ chain, transport: http() });
    },
});
