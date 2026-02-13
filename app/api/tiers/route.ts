import { NextResponse } from 'next/server';
import { db } from '@/utils/db'; // Assuming db is exported from utils/db

// Helper to get all tiers directly if needed, or just use db.tiers.getByCreator
// But db.tiers.getByCreator returns filtered list.
// To save properly, we need to know how db handles persistence.
// db.tiers.saveAll(address, tiers) REPLACES all tiers for that address.
// So we can just:
// 1. Get existing tiers for creator
// 2. Modify array
// 3. Call saveAll

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');

    if (!creator) {
        return NextResponse.json([]);
    }

    const tiers = db.tiers.getByCreator(creator);
    return NextResponse.json(tiers);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { creator, name, price, perks } = body;

        if (!creator || !name || !price) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const currentTiers = db.tiers.getByCreator(creator);

        const newTier = {
            id: Math.random().toString(36).substr(2, 9),
            creatorAddress: creator,
            name,
            price: Number(price),
            benefits: perks || [], // perks from frontend = benefits in db
            active: true,
            createdAt: new Date().toISOString()
        };

        db.tiers.saveAll(creator, [...currentTiers, newTier]);

        return NextResponse.json(newTier);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, creator, name, price, perks } = body;

        if (!id || !creator) {
            return NextResponse.json({ error: 'Missing ID or Creator' }, { status: 400 });
        }

        const currentTiers = db.tiers.getByCreator(creator);
        const tierIndex = currentTiers.findIndex((t: any) => t.id === id);

        if (tierIndex === -1) {
            return NextResponse.json({ error: "Tier not found" }, { status: 404 });
        }

        const updatedTier = {
            ...currentTiers[tierIndex],
            name,
            price: Number(price),
            benefits: perks || []
        };

        currentTiers[tierIndex] = updatedTier;
        db.tiers.saveAll(creator, currentTiers);

        return NextResponse.json(updatedTier);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const creator = searchParams.get('creator');

    if (!id || !creator) {
        return NextResponse.json({ error: 'Missing ID or Creator' }, { status: 400 });
    }

    const currentTiers = db.tiers.getByCreator(creator);
    const filteredTiers = currentTiers.filter((t: any) => t.id !== id);

    db.tiers.saveAll(creator, filteredTiers);

    return NextResponse.json({ success: true });
}
