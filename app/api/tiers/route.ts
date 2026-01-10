import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json([]);
    }

    const tiers = db.tiers.getByCreator(address);
    return NextResponse.json(tiers);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { address, tiers } = body;

    if (!address || !tiers) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    db.tiers.saveAll(address, tiers);
    return NextResponse.json({ success: true });
}
