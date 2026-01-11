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

    // 1. Resolve Creator Address correctly (Handle Case Sensitivity for FK)
    // We look for a creator that matches case-insensitively
    const { data: creatorData } = await supabase
        .from('creators')
        .select('address')
        .ilike('address', creatorAddress)
        .single();

    // If creator not found in DB, we can't link subscription (FK violation).
    // Fallback: Use the original if not found (though it will likely fail constraints)
    // or arguably, we should insert the creator dynamically, but that's risky.
    const finalCreatorAddress = creatorData?.address || creatorAddress;

    const { data, error } = await supabase.from('subscriptions').upsert({
        subscriberAddress: subscriberAddress.toLowerCase(), // Subscribers are just addresses, keep normalized
        creatorAddress: finalCreatorAddress, // Must match creators.address exactly
        "tierId": tierId,
        "expiresAt": new Date(expiry * 1000).toISOString(),
        "createdAt": new Date().toISOString()
    }, { onConflict: 'subscriberAddress, creatorAddress' }).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
