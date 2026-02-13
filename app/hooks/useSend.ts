import { TOKENS } from "@/app/utils/constants";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempoModerato } from "viem/chains";
import { tempoActions } from "viem/tempo";
import {
    createWalletClient,
    custom,
    parseUnits,
    stringToHex,
    walletActions,
    type Address,
} from "viem";

const alphaUsd = TOKENS.USDC;

export function useSend() {
    const { wallets } = useWallets();
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const send = async (to: string, amount: string, memo: string = "") => {
        if (isSending) return;
        setIsSending(true);
        setError(null);
        setTxHash(null);

        const wallet = wallets[0];
        if (!wallet?.address) {
            const errMsg = "No active wallet";
            setError(errMsg);
            setIsSending(false);
            throw new Error(errMsg);
        }

        try {
            const provider = await wallet.getEthereumProvider();
            const client = createWalletClient({
                account: wallet.address as Address,
                chain: tempoModerato,
                transport: custom(provider),
            })
                .extend(walletActions)
                .extend(tempoActions());

            const metadata = await client.token.getMetadata({
                token: alphaUsd as Address,
            });

            // @ts-ignore
            const { receipt } = await client.token.transferSync({
                to: to as Address,
                amount: parseUnits(amount, metadata.decimals),
                memo: stringToHex(memo || ""),
                token: alphaUsd as Address,
            });

            setTxHash(receipt.transactionHash);
            return receipt.transactionHash;
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
