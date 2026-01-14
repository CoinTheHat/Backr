import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const includePending = searchParams.get('includePending') === 'true';

    const { data: creators, error } = await supabase.from('creators').select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter out creators who haven't deployed a contract yet, unless includePending is set
    const filteredCreators = includePending
        ? creators
        : (creators?.filter(c => c.contractAddress && c.contractAddress.length > 0) || []);

    return NextResponse.json(filteredCreators);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { address, name, description } = body;

    if (!address) {
        return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    // Check for unique username if name is being updated
    if (name) {
        const { data: taken, error: checkError } = await supabase
            .from('creators')
            .select('address')
            .ilike('name', name)
            .neq('address', address)
            .maybeSingle();

        if (taken) {
            return NextResponse.json({ error: 'Username is already taken. Please choose another.' }, { status: 409 });
        }
    }

    const { data, error } = await supabase.from('creators').upsert({
        address,
        name,
        description,
        avatarUrl: body.avatarUrl,
        socials: body.socials,
        payoutToken: body.payoutToken,
        contractAddress: body.contractAddress
    }, { onConflict: 'address' }).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ? data[0] : {});
}
