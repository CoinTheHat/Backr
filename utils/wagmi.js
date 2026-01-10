import { createConfig, http } from 'wagmi';
import { mantle } from 'wagmi/chains';
import { createClient } from 'viem';

export const config = createConfig({
    chains: [mantle],
    client({ chain }) {
        return createClient({ chain, transport: http() });
    },
});
