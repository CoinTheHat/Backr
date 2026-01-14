import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
    const resolvedParams = await params;
    const { address } = resolvedParams;

    // Use 'creators' table 'socials' column (JSONB) to store taxonomy
    const { data, error } = await supabase
        .from('creators')
        .select('socials')
        .eq('address', address)
        .single();

    if (error) {
        // Return empty if creator not found or error
        return NextResponse.json({ categoryIds: [], hashtagIds: [] });
    }

    const taxonomy = data?.socials?.taxonomy || { categoryIds: [], hashtagIds: [] };
    return NextResponse.json(taxonomy);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ address: string }> }) {
    const resolvedParams = await params;
    const { address } = resolvedParams;

    try {
        const body = await request.json();
        const { categoryIds, hashtagIds } = body;

        // 1. Get existing socials
        const { data: creator, error: fetchError } = await supabase
            .from('creators')
            .select('socials')
            .eq('address', address)
            .single();

        if (fetchError) throw fetchError;

        // 2. Merge taxonomy into socials
        const currentSocials = creator?.socials || {};
        const updatedSocials = {
            ...currentSocials,
            taxonomy: { categoryIds, hashtagIds }
        };

        // 3. Update
        const { data, error } = await supabase
            .from('creators')
            .update({ socials: updatedSocials })
            .eq('address', address)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ categoryIds, hashtagIds });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
