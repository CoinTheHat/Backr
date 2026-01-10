import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
        return NextResponse.json([]);
    }

    const { data: tiers, error } = await supabase
        .from('tiers')
        .select('*')
        .eq('creatorAddress', address);

    if (error) {
        console.error('Error fetching tiers:', error);
        return NextResponse.json([]);
    }

    return NextResponse.json(tiers || []);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { address, tiers } = body;

    if (!address || !tiers) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    // Delete all existing tiers for this creator
    await supabase.from('tiers').delete().eq('creatorAddress', address);

    // Insert new tiers
    const tiersToInsert = tiers.map((tier: any) => ({
        creatorAddress: address,
        name: tier.name,
        price: tier.price,
        duration: tier.duration || '30',
        benefits: tier.benefits || [],
        recommended: tier.recommended || false,
        active: tier.active !== false
    }));

    const { data, error } = await supabase.from('tiers').insert(tiersToInsert).select();

    if (error) {
        console.error('Error saving tiers:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
}
