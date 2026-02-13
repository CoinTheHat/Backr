import { TOKENS } from "@/app/utils/constants";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempo } from "viem/chains";
import { tempoActions } from "viem/tempo";
import {
    createWalletClient,
    custom,
    parseUnits,
    stringToHex,
    walletActions,
    type Address,
} from "viem";

const PAYMENT_TOKEN = TOKENS.USDC;

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
                chain: { ...tempo, feeToken: PAYMENT_TOKEN } as any,
                transport: custom(provider),
            })
                .extend(walletActions)
                .extend(tempoActions());

            // Should fetch metadata ideally, but hardcoding for demo speed
            const decimals = 18;

            // @ts-ignore
            const { receipt } = await client.token.transferSync({
                to: to as Address,
                amount: parseUnits(amount, decimals),
                memo: stringToHex(memo || ""),
                token: PAYMENT_TOKEN as Address,
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
