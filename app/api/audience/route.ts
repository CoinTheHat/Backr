import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator');

    // If no creator specified, return empty
    if (!creator) {
        return NextResponse.json([]);
    }

    // Fetch real subscriptions
    const { data: subs, error } = await supabase
        .from('subscriptions')
        .select('*')
        .ilike('creatorAddress', creator)
        .order('createdAt', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch this creator's tiers to map tierId -> tierName
    const { data: tiers } = await supabase
        .from('tiers')
        .select('*')
        .ilike('creatorAddress', creator);

    // Filter out obvious mock data (starts with 0x1010, 0x2020, etc from previous tests)
    // and enrich with tier names
    const validSubs = subs
        .filter(s => !s.subscriberAddress.startsWith('0x1010') && !s.subscriberAddress.startsWith('0x2020') && !s.subscriberAddress.startsWith('0x3030'));

    // Fetch profiles for these subscribers
    const subscriberAddresses = validSubs.map(s => s.subscriberAddress);

    // Only fetch if we have addresses
    let profiles: any[] = [];
    if (subscriberAddresses.length > 0) {
        const { data: p } = await supabase
            .from('creators') // Assuming 'creators' table holds all user profiles
            .select('address, name, avatarUrl')
            .in('address', subscriberAddresses);
        if (p) profiles = p;
    }

    const enrichedSubs = validSubs.map(sub => {
        const matchedTier = tiers?.find((t, index) => index === sub.tierId);
        // Search profile case-insensitively just in case
        const profile = profiles.find(p => p.address.toLowerCase() === sub.subscriberAddress.toLowerCase());

        return {
            ...sub,
            tierName: matchedTier?.name || sub.tierName || `Tier ${sub.tierId}`,
            price: matchedTier?.price || sub.price || '-',
            subscriberName: profile?.name,
            subscriberAvatar: profile?.avatarUrl
        };
    });

    return NextResponse.json(enrichedSubs);
}

export async function POST(request: Request) {
    // To allow manually adding a subscriber (simulation)
    const body = await request.json();
    const { error } = await supabase.from('subscriptions').insert(body);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
