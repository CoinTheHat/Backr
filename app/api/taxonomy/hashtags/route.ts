import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

const DEFAULT_HASHTAGS = [
    { id: 'crypto', label: 'crypto', isActive: true, sortOrder: 1 },
    { id: 'web3', label: 'web3', isActive: true, sortOrder: 2 },
    { id: 'nft', label: 'nft', isActive: true, sortOrder: 3 },
    { id: 'indie', label: 'indie', isActive: true, sortOrder: 4 }
];

export async function GET() {
    const { data, error } = await supabase
        .from('hashtags')
        .select('*')
        .order('sortOrder', { ascending: true });

    if (error) {
        return NextResponse.json(DEFAULT_HASHTAGS);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Check if bulk add (array)
        if (Array.isArray(body)) {
            const hashtags = body.map((tag: any) => ({
                id: tag.id || tag.label.toLowerCase().replace(/[^a-z0-9]+/g, ''),
                label: tag.label,
                sortOrder: tag.sortOrder || 0,
                isActive: tag.isActive ?? true,
                isTrending: tag.isTrending ?? false
            }));

            const { data, error } = await supabase
                .from('hashtags')
                .insert(hashtags)
                .select();

            if (error) throw error;
            return NextResponse.json(data);
        }

        // Single add
        const { label, sortOrder, isActive, isTrending } = body;
        const id = body.id || label.toLowerCase().replace(/[^a-z0-9]+/g, '');

        const { data, error } = await supabase
            .from('hashtags')
            .insert([
                { id, label, sortOrder: sortOrder || 0, isActive: isActive ?? true, isTrending: isTrending ?? false }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update hashtag
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, label, sortOrder, isActive, isTrending } = body;

        if (!id) {
            return NextResponse.json({ error: 'Hashtag ID is required' }, { status: 400 });
        }

        const updates: any = { updatedAt: new Date().toISOString() };
        if (label !== undefined) updates.label = label;
        if (sortOrder !== undefined) updates.sortOrder = sortOrder;
        if (isActive !== undefined) updates.isActive = isActive;
        if (isTrending !== undefined) updates.isTrending = isTrending;

        const { data, error } = await supabase
            .from('hashtags')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE hashtag
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Hashtag ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('hashtags')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
