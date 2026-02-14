import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, updatePostSchema, ValidationError } from '@/utils/validation';

export const PUT = withRateLimit(async (
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const { id } = await params;
        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(updatePostSchema, body);

        // Verify ownership
        const existingPost = await db.posts.getById(id);

        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (existingPost.creatorAddress !== validatedData.creatorAddress) {
            return forbiddenResponse('You can only update your own posts');
        }

        // Authorization check - user can only update their own posts
        if (!checkAuthorization(user.address, validatedData.creatorAddress)) {
            return forbiddenResponse('You can only update your own posts');
        }

        // Update post
        const payload = {
            title: validatedData.title,
            content: validatedData.content,
            image: validatedData.image || null,
            videoUrl: validatedData.videoUrl || null,
            minTier: validatedData.minTier || 0,
            isPublic: validatedData.isPublic
        };

        await db.posts.update(id, payload);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: error.errors }, { status: 400 });
        }
        console.error("Post Update Error:", error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);

export const DELETE = withRateLimit(async (
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const { id } = await params;
        const body = await request.json();

        // Verify ownership
        const existingPost = await db.posts.getById(id);

        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (existingPost.creatorAddress !== body.creatorAddress) {
            return forbiddenResponse('You can only delete your own posts');
        }

        // Authorization check - user can only delete their own posts
        if (!checkAuthorization(user.address, body.creatorAddress)) {
            return forbiddenResponse('You can only delete your own posts');
        }

        // Delete post
        await db.posts.delete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Post Delete Error:", error.message);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
