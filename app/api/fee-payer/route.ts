import { createClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { tempoModerato } from 'viem/chains';
import { Handler } from 'tempo.ts/server';

// Fee payer account from environment variable
const feePayerAccount = privateKeyToAccount(
    process.env.FEE_PAYER_PRIVATE_KEY as `0x${string}`
);

// Create a viem client for Tempo Moderato (testnet)
const client = createClient({
    chain: tempoModerato,
    transport: http(),
});

// Create the fee payer handler using tempo.ts SDK
const handler = Handler.feePayer({
    account: feePayerAccount,
    client,
});

// Next.js App Router: export the handler for POST requests
export async function POST(request: Request) {
    return handler.fetch(request);
}
