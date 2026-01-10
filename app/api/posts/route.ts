import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    let query = supabase.from('posts').select('*').order('createdAt', { ascending: false });

    if (address) {
        query = query.eq('creatorAddress', address);
    }

    const { data: posts, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(posts);
}

export async function POST(request: Request) {
    const body = await request.json();

    const { error } = await supabase.from('posts').insert(body);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
