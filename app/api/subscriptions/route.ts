import { NextResponse } from 'next/server';
import { db } from '@/utils/db'; // Assuming db.ts is at utils/db

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subscriber = searchParams.get('subscriber')?.toLowerCase();
    const creator = searchParams.get('creator')?.toLowerCase();

    let data = db.memberships.getAll();

    if (subscriber) {
        data = data.filter((m: any) => m.userAddress?.toLowerCase() === subscriber);
    }

    if (creator) {
        data = data.filter((m: any) => m.creatorAddress?.toLowerCase() === creator);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { subscriberAddress, creatorAddress, tierId, expiry, txHash } = body;

        if (!subscriberAddress || !creatorAddress) {
            return NextResponse.json({ error: "Missing address" }, { status: 400 });
        }

        const newMembership = db.memberships.create({
            userAddress: subscriberAddress.toLowerCase(),
            creatorAddress: creatorAddress, // Keep case as passed or normalize? Usually normalize if addresses.
            tierId,
            expiresAt: new Date(expiry * 1000).toISOString(),
            txHash
        });

        return NextResponse.json(newMembership);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
