import { createClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { tempoModerato } from 'viem/chains';
import { signTransaction } from 'viem/actions';
import { Transaction, Formatters } from 'viem/tempo';
import { NextResponse } from 'next/server';

// Fee payer account from environment variable
const feePayerAccount = privateKeyToAccount(
    process.env.FEE_PAYER_PRIVATE_KEY as `0x${string}`
);

// Create a viem client for Tempo Moderato (testnet)
// feeToken: gas fees will be paid in AlphaUSD (USDC), not native ETH
const client = createClient({
    chain: tempoModerato.extend({ feeToken: '0x20c0000000000000000000000000000000000001' }),
    transport: http(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { method, params, id, jsonrpc } = body;

        // Only support fee payer RPC methods
        if (
            method !== 'eth_signTransaction' &&
            method !== 'eth_signRawTransaction' &&
            method !== 'eth_sendRawTransaction' &&
            method !== 'eth_sendRawTransactionSync'
        ) {
            return NextResponse.json({
                jsonrpc,
                id,
                error: {
                    code: -32004,
                    name: 'RpcResponse.MethodNotSupportedError',
                    message: `Method not supported: ${method}`,
                },
            });
        }

        if (method === 'eth_signTransaction') {
            const transactionRequest = Formatters.formatTransaction(params?.[0] as never);
            const serializedTransaction = await signTransaction(client, {
                ...transactionRequest,
                account: feePayerAccount,
                feePayer: feePayerAccount,
            } as any);

            return NextResponse.json({
                jsonrpc,
                id,
                result: serializedTransaction,
            });
        }

        if (method === 'eth_signRawTransaction') {
            const serialized = params?.[0] as `0x76${string}`;
            const transaction = Transaction.deserialize(serialized);
            const serializedTransaction = await signTransaction(client, {
                ...transaction,
                account: feePayerAccount,
                feePayer: feePayerAccount,
            } as any);

            return NextResponse.json({
                jsonrpc,
                id,
                result: serializedTransaction,
            });
        }

        // eth_sendRawTransaction or eth_sendRawTransactionSync
        if (method === 'eth_sendRawTransaction' || method === 'eth_sendRawTransactionSync') {
            const serialized = params?.[0] as `0x76${string}`;
            const transaction = Transaction.deserialize(serialized);
            const serializedTransaction = await signTransaction(client, {
                ...transaction,
                account: feePayerAccount,
                feePayer: feePayerAccount,
            } as any);

            const result = await client.request({
                method: method as any,
                params: [serializedTransaction] as any,
            });

            return NextResponse.json({
                jsonrpc,
                id,
                result,
            });
        }
    } catch (error) {
        console.error('❌ [fee-payer] Error:', error);
        return NextResponse.json({
            jsonrpc: '2.0',
            id: null,
            error: {
                code: -32603,
                name: 'RpcResponse.InternalError',
                message: (error as Error).message,
            },
        });
    }
}
