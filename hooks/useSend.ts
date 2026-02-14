import { TOKENS } from "@/app/utils/constants";
import { TIP20_ABI } from "@/app/utils/abis";
import { useWallets, usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoModerato } from "viem/chains";
import {
    createWalletClient,
    createPublicClient,
    custom,
    http,
    parseUnits,
    walletActions,
    type Address,
} from "viem";

const alphaUsd = TOKENS.USDC as Address;

export function useSend() {
    const { wallets } = useWallets();
    const { user } = usePrivy();
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const send = async (to: string, amount: string, memo: string = "") => {
        if (isSending) return;
        setIsSending(true);
        setError(null);
        setTxHash(null);

        const activeAddress = user?.wallet?.address;
        const wallet = activeAddress
            ? wallets.find(w => w.address.toLowerCase() === activeAddress.toLowerCase()) || wallets[0]
            : wallets[0];

        if (!wallet?.address) {
            const errMsg = "No active wallet. Please log in first.";
            setError(errMsg);
            setIsSending(false);
            throw new Error(errMsg);
        }

        try {
            const provider = await wallet.getEthereumProvider();

            const walletClient = createWalletClient({
                account: wallet.address as Address,
                chain: tempoModerato,
                transport: custom(provider),
            }).extend(walletActions);

            const publicClient = createPublicClient({
                chain: tempoModerato,
                transport: http(),
            });

            const recipient = await getAddress(to);
            const amountInWei = parseUnits(amount, 6);

            const nonce = await publicClient.getTransactionCount({
                address: wallet.address as Address,
            });

            const tx = await walletClient.writeContract({
                address: alphaUsd,
                abi: TIP20_ABI,
                functionName: "transfer",
                args: [recipient, amountInWei],
                nonce,
            });

            setTxHash(tx);
            return tx;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to send";
            setError(errorMessage);
            throw err;
        } finally {
            setIsSending(false);
        }
    };

    return {
        send,
        isSending,
        error,
        txHash,
        reset: () => {
            setError(null);
            setTxHash(null);
        },
    };
}

async function getAddress(to: string): Promise<Address> {
    if (to.startsWith('0x') && to.length === 42) return to as Address;

    const res = await fetch("/api/find", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: to }),
    });

    if (!res.ok) throw new Error("Failed to find user");

    const data = (await res.json()) as { address: Address };
    return data.address;
}
