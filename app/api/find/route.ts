import { NextRequest, NextResponse } from "next/server";
import { PrivyClient } from "@privy-io/node";

const privy = new PrivyClient({
    appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
    appSecret: process.env.PRIVY_APP_SECRET!
});

export async function POST(request: NextRequest) {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json({ error: "Identifier required" }, { status: 400 });
        }

        // 1. Try to get existing user
        let user;
        const isEmail = identifier.includes("@");

        try {
            if (isEmail) {
                user = await privy.users().getByEmailAddress({ address: identifier });
            } else if (identifier.startsWith('create_')) {
                // Special case for creating new user if needed, but for now lookup
                // For phone/others we might need different calls.
            } else {
                // Fallback or ID lookup
                try {
                    user = await privy.users().get(identifier);
                } catch {
                    // ignore
                }
            }
        } catch (e) {
            // User not found is okay
            console.log('User lookup failed:', e);
        }

        if (user) {
            const walletAccount = user.linked_accounts?.find((a: any) => a.type === 'wallet' && a.chain_type === 'ethereum');
            const emailAccount = user.linked_accounts?.find((a: any) => a.type === 'email');

            return NextResponse.json({
                address: (walletAccount as any)?.address || null,
                identifier,
                isNewUser: false,
                name: (emailAccount as any)?.address || 'User'
            });
        }

        // 2. If not found, for this hackathon we might just return null 
        // and let the frontend ask them to invite the user, OR
        // we could pre-create them if we had their phone. 
        // For email, we generally need them to login to create the wallet.
        // Returning null tells the frontend "Unknown User".

        return NextResponse.json({
            address: null,
            identifier,
            isNewUser: true
        });

    } catch (error: any) {
        console.error("Find User Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
