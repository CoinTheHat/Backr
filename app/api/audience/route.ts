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
        .select('*')
        .ilike('creatorAddress', creator)
        .order('createdAt', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Demo Mode: If no subs found, prompt or return nothing. 
    // The user wants to see "THEIR" data. If they have none, empty is correct.
    // However, to make it look "alive" for the hackathon/demo, we can inject a few mock items
    // IF the query param 'demo=true' is present, OR just return empty.
    // The previous implementation used static mock data. Replacing it with this API means it will be empty initially.
    // That's fine, we will handle the "empty state" in UI.

    return NextResponse.json(subs);
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
