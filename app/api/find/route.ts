import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/node";

// Robust Privy Initialization
let privy: PrivyClient;
try {
    if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
        throw new Error("Privy credentials missing");
    }
    privy = new PrivyClient({
        appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
        appSecret: process.env.PRIVY_APP_SECRET,
    });
} catch (e) {
    console.warn("PrivyClient not initialized (expected during build):", (e as Error).message);
    // Dummy client to prevent crash during build
    privy = {
        users: () => ({
            getByPhoneNumber: () => Promise.resolve(null),
            getByEmailAddress: () => Promise.resolve(null),
            create: () => Promise.reject(new Error("Privy not configured")),
        })
    } as any;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { identifier } = body;

        if (!identifier) {
            return NextResponse.json(
                { error: "Identifier required" },
                { status: 400 }
            );
        }

        // Get or create user
        const user = await getUser(identifier);

        // Get user's wallet
        const wallet = user.linked_accounts?.find(
            (account: any) =>
                account.type === "wallet" && account.chain_type === "ethereum"
        );

        if (!wallet || !(wallet as any).address) {
            return NextResponse.json(
                { error: "Wallet not found" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            address: (wallet as any).address,
            identifier,
            identifierType: identifier.includes("@") ? "email" : "phone",
            userId: user.id,
        });
    } catch (error: any) {
        console.error("Error in /api/find:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// Get a user by phone number or email by querying Privy's user management API
// If a user doesn't exist, a new user will be created.
async function getUser(identifier: string) {
    if (!identifier.includes("@")) {
        // Phone number lookup
        const user = await privy
            .users()
            .getByPhoneNumber({ number: identifier })
            .catch(() => null);
        if (user) return user;

        // Create new user with phone
        return privy.users().create({
            linked_accounts: [{ type: "phone", number: identifier }],
            wallets: [{ chain_type: "ethereum" }],
        });
    } else {
        // Email lookup
        const user = await privy
            .users()
            .getByEmailAddress({ address: identifier })
            .catch(() => null);
        if (user) return user;

        // Create new user with email
        return privy.users().create({
            linked_accounts: [{ type: "email", address: identifier }],
            wallets: [{ chain_type: "ethereum" }],
        });
    }
}
