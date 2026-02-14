import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoModerato } from "viem/chains";
import { parseUnits, pad, stringToHex } from "viem";
import {
    createWalletClient,
    custom,
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
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const subscribe = async ({ contractAddress, tierId, amount, memo }: SubscribeParams) => {
        if (isSubscribing) return;
        setIsSubscribing(true);
        setError(null);
        setTxHash(null);

        const wallet = wallets[0];
        if (!wallet?.address) {
            const errMsg = "No active wallet";
            setError(errMsg);
            setIsSubscribing(false);
            throw new Error(errMsg);
        }

        try {
            const provider = await wallet.getEthereumProvider();
            const client = createWalletClient({
                account: wallet.address as Address,
                chain: tempoModerato,
                transport: custom(provider),
            }).extend(walletActions);

            // Step 1: Approve the token
            const amountInWei = parseUnits(amount, 6);

            const approveTx = await client.writeContract({
                address: alphaUsd as Address,
                abi: TIP20_ABI,
                functionName: "approve",
                args: [contractAddress as Address, amountInWei],
                type: 'legacy',
            });

            // Wait for approval confirmation
            // In production, you'd want to wait for the transaction receipt
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Step 2: Subscribe via contract
            const memoBytes = pad(stringToHex(memo || `Subscribe tier ${tierId}`), { size: 32 });

            const subscribeTx = await client.writeContract({
                address: contractAddress as Address,
                abi: SUBSCRIPTION_CONTRACT_ABI,
                functionName: "subscribe",
                args: [BigInt(tierId)],
                type: 'legacy',
            });

            setTxHash(subscribeTx);
            return subscribeTx;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to subscribe";
            setError(errorMessage);
            throw err;
        } finally {
            setIsSubscribing(false);
        }
    };

    // Helper to get subscription contract address for a creator
    const getCreatorContract = async (creatorAddress: string): Promise<string> => {
        const wallet = wallets[0];
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