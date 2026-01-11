import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const subscriber = searchParams.get('subscriber')?.toLowerCase();
    const creator = searchParams.get('creator')?.toLowerCase();

    let query = supabase.from('subscriptions').select('*, creators(*)');

    if (subscriber) {
        query = query.eq('subscriberAddress', subscriber);
    }

    if (creator) {
        query = query.eq('creatorAddress', creator);
    }

    const { data, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { subscriberAddress, creatorAddress, tierId, expiry } = body;

    const { data, error } = await supabase.from('subscriptions').upsert({
        subscriberAddress: subscriberAddress.toLowerCase(),
        creatorAddress: creatorAddress.toLowerCase(),
        "tierId": tierId,
        "expiresAt": new Date(expiry * 1000).toISOString(), // Convert unix timestamp to ISO
        "createdAt": new Date().toISOString()
    }, { onConflict: 'subscriberAddress, creatorAddress' }).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
