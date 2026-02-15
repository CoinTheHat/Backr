import { useWallets, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoModerato } from "viem/chains";
import { parseUnits } from "viem";
import {
    createWalletClient,
    custom,
    http,
    walletActions,
    publicActions,
    type Address,
} from "viem";
import { SUBSCRIPTION_CONTRACT_ABI, TIP20_ABI } from "@/app/utils/abis";
import { SUBSCRIPTION_FACTORY_ADDRESS, TOKENS } from "@/app/utils/constants";

const alphaUsd = TOKENS.USDC;

interface SubscribeParams {
    contractAddress: string;
    tierId: number;
    amount: string;
    memo?: string;
}

export function useSubscribe() {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const subscribe = async ({ contractAddress, tierId, amount, memo }: SubscribeParams) => {
        if (isSubscribing) return;
        setIsSubscribing(true);
        setError(null);
        setTxHash(null);

        // Use the wallet that matches the active Privy session
        const activeAddress = user?.wallet?.address;
        const wallet = activeAddress
            ? wallets.find(w => w.address.toLowerCase() === activeAddress.toLowerCase()) || wallets[0]
            : wallets[0];

        if (!wallet?.address) {
            const errMsg = "No active wallet. Please log in first.";
            setError(errMsg);
            setIsSubscribing(false);
            throw new Error(errMsg);
        }

        try {
            const provider = await wallet.getEthereumProvider();

            // Auto-switch to Tempo Moderato testnet if on wrong chain
            try {
                await wallet.switchChain(42431);
            } catch (switchErr) {
                console.warn('⚠️ [useSubscribe] Chain switch failed, continuing anyway:', switchErr);
            }

            const client = createWalletClient({
                account: wallet.address as Address,
                chain: tempoModerato,
                transport: custom(provider),
            }).extend(walletActions);

            // Step 1: Approve the token (USDC 6 decimals)
            const amountInWei = parseUnits(amount, 6);

            console.log('🔓 [useSubscribe] Approving token spend...');
            await client.writeContract({
                address: alphaUsd as Address,
                abi: TIP20_ABI,
                functionName: "approve",
                args: [contractAddress as Address, amountInWei],
            });

            // Wait for approval confirmation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Subscribe via contract
            console.log('🚀 [useSubscribe] Subscribing to tier...');
            const subscribeTx = await client.writeContract({
                address: contractAddress as Address,
                abi: SUBSCRIPTION_CONTRACT_ABI,
                functionName: "subscribe",
                args: [BigInt(tierId)],
            });

            console.log('✅ [useSubscribe] Subscription successful! Tx:', subscribeTx);
            setTxHash(subscribeTx);
            return subscribeTx;
        } catch (err) {
            console.error('❌ [useSubscribe] Error:', err);
            const errorMessage =
                err instanceof Error ? err.message : "Failed to subscribe";
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubscribing(false);
        }
    };

    const getCreatorContract = async (creatorAddress: string): Promise<string> => {
        const activeAddress = user?.wallet?.address;
        const wallet = activeAddress
            ? wallets.find(w => w.address.toLowerCase() === activeAddress.toLowerCase()) || wallets[0]
            : wallets[0];
        if (!wallet?.address) throw new Error("No active wallet");

        const provider = await wallet.getEthereumProvider();
        const client = createWalletClient({
            account: wallet.address as Address,
            chain: tempoModerato,
            transport: custom(provider),
        }).extend(walletActions).extend(publicActions);

        const contractAddress = await client.readContract({
            address: SUBSCRIPTION_FACTORY_ADDRESS as Address,
            abi: [
                {
                    inputs: [{ internalType: "address", name: "_creator", type: "address" }],
                    name: "getProfile",
                    outputs: [{ internalType: "address", name: "", type: "address" }],
                    stateMutability: "view",
                    type: "function"
                }
            ],
            functionName: "getProfile",
            args: [creatorAddress as Address],
        }) as Address;

        return contractAddress;
    };

    return {
        subscribe,
        getCreatorContract,
        isSubscribing,
        error,
        txHash,
        reset: () => {
            setError(null);
            setTxHash(null);
        },
    };
}