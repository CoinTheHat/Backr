import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
        const creator = db.creators.find(address);
        return NextResponse.json(creator || {});
    }

    const creators = db.creators.getAll();
    return NextResponse.json(creators);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { address, name } = body;

        if (!address) {
            return NextResponse.json({ error: 'Missing address' }, { status: 400 });
        }

        // Save to local DB
        const updated = db.creators.create({
            ...body,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json(updated);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
