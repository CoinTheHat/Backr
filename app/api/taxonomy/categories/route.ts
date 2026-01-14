import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

const DEFAULT_CATEGORIES = [
    { id: 'art', name: 'Art', icon: '🎨', isActive: true, sortOrder: 1 },
    { id: 'gaming', name: 'Gaming', icon: '🎮', isActive: true, sortOrder: 2 },
    { id: 'music', name: 'Music', icon: '🎵', isActive: true, sortOrder: 3 },
    { id: 'tech', name: 'Tech', icon: '💻', isActive: true, sortOrder: 4 },
    { id: 'podcast', name: 'Podcast', icon: '🎙️', isActive: true, sortOrder: 5 }
];

export async function GET() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sortOrder', { ascending: true });

    if (error) {
        // Table likely doesn't exist, return defaults
        return NextResponse.json(DEFAULT_CATEGORIES);
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, icon, sortOrder, isActive } = body;

        // Auto-generate slug from name if not provided
        const id = body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const { data, error } = await supabase
            .from('categories')
            .insert([
                { id, name, icon, sortOrder: sortOrder || 0, isActive: isActive ?? true }
            ])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH update category
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, name, icon, sortOrder, isActive } = body;

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const updates: any = { updatedAt: new Date().toISOString() };
        if (name !== undefined) updates.name = name;
        if (icon !== undefined) updates.icon = icon;
        if (sortOrder !== undefined) updates.sortOrder = sortOrder;
        if (isActive !== undefined) updates.isActive = isActive;

        const { data, error } = await supabase
            .from('categories')
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

// DELETE category
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
