import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (address) {
        const posts = await db.posts.getByCreator(address);
        return NextResponse.json(posts);
    }

    const posts = await db.posts.getAll();
    return NextResponse.json(posts);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const post = await db.posts.create({
            creatorAddress: body.creatorAddress,
            title: body.title,
            content: body.content,
            image: body.image || null,
            videoUrl: body.videoUrl || null,
            minTier: Number(body.minTier) || 0,
            likes: body.likes || 0,
            isPublic: !!body.isPublic,
            createdAt: body.createdAt || new Date().toISOString()
        });

        return NextResponse.json(post || { success: true });
    } catch (e: any) {
        console.error("Post Creation Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
