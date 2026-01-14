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

    // Field Mapping: Ensure these match the Supabase 'posts' table columns EXACTLY.
    // Based on 'app/[creator]/page.tsx' usage of 'post.image', the column is 'image'.
    // Based on GET route ordering by 'createdAt', the columns are camelCase.
    const payload = {
        creatorAddress: body.creatorAddress,
        title: body.title,
        content: body.content,
        image: body.image || null, // Reverted to 'image'
        videoUrl: body.videoUrl || null,
        minTier: Number(body.minTier) || 0,
        createdAt: body.createdAt,
        likes: body.likes || 0,
        isPublic: !!body.isPublic
    };

    const { error } = await supabase.from('posts').insert(payload);

    if (error) {
        console.error("Supabase Insert Error:", error.message, error.details, error.hint);
        return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
