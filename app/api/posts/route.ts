import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const viewer = searchParams.get('viewer');

    if (address) {
        const posts = await db.posts.getByCreator(address);

        // Determine access level
        let hasAccess = false;

        if (viewer && viewer.toLowerCase() === address.toLowerCase()) {
            hasAccess = true; // Creator viewing own profile
        } else if (viewer) {
            // Check subscription
            try {
                const memberships = await db.memberships.getByUser(viewer);
                const activeSubscription = memberships.find((m: any) =>
                    m.creatorAddress.toLowerCase() === address.toLowerCase() &&
                    new Date(m.expiresAt) > new Date()
                );
                if (activeSubscription) hasAccess = true;
            } catch (error) {
                console.error("Error checking subscription in posts API:", error);
            }
        }

        // Filter/Sanitize posts
        const sanitizedPosts = posts.map((post: any) => {
            if (post.isPublic || hasAccess) {
                return post;
            }
            // Locked content - Sanitize potentially sensitive data
            return {
                ...post,
                content: "LOCKED",
                image: null,
                videoUrl: null,
                // Keep title and other metadata for preview if needed
            };
        });

        return NextResponse.json(sanitizedPosts);
    }

    // Global feed - Default to safe (sanitize all non-public)
    // To support global unlocking, we'd need more complex logic here.
    // For now, assume global feed shows public context or sanitized previews.
    const posts = await db.posts.getAll();
    const sanitizedGlobalPosts = posts.map((post: any) => {
        if (post.isPublic) return post;
        return {
            ...post,
            content: "LOCKED",
            image: null,
            videoUrl: null
        };
    });
    return NextResponse.json(sanitizedGlobalPosts);
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
