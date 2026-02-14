import { TOKENS } from "@/app/utils/constants";
import { useWallets } from "@privy-io/react-auth";
import { useState } from "react";
import { tempo } from "tempo.ts/chains";
import { tempoActions } from "tempo.ts/viem";
import {
    createWalletClient,
    custom,
    parseUnits,
    stringToHex,
    pad,
    walletActions,
    type Address,
} from "viem";

const alphaUsd = TOKENS.USDC as Address;

export function useSend() {
    const { wallets } = useWallets();
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const send = async (to: string, amount: string, memo: string = "", feePayer: boolean = true) => {
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

            // Following Technical Cheatsheet for Tempo integration
            // @ts-ignore
            const client: any = createWalletClient({
                account: wallet.address as Address,
                chain: tempo({ feeToken: alphaUsd }),
                transport: custom(provider),
            })
                .extend(walletActions)
                .extend(tempoActions());

            // @ts-ignore
            const metadata = await client.token.getMetadata({
                token: alphaUsd,
            });

            // Ensure memo is correctly formatted
            const memoBytes = pad(stringToHex(memo || to), { size: 32 });

            const result = await client.token.transferSync({
                to: to as Address,
                amount: parseUnits(amount, metadata.decimals),
                memo: memoBytes,
                token: alphaUsd,
                feePayer: feePayer,
            });

            const receipt = result.receipt;
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