import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
    const { data: creators, error } = await supabase.from('creators').select('*');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(creators);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { address, name, description } = body;

    if (!address) {
        return NextResponse.json({ error: 'Missing address' }, { status: 400 });
    }

    const { data, error } = await supabase.from('creators').upsert({
        address,
        name,
        description,
        avatarUrl: body.avatarUrl // might be passed
    }, { onConflict: 'address' }).select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data ? data[0] : {});
}
