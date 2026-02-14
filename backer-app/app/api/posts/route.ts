import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, checkAuthorization, forbiddenResponse, unauthorizedResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createPostSchema, ValidationError } from '@/utils/validation';

export const GET = withRateLimit(async (request: Request) => {
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
}, RATE_LIMITS.PUBLIC);

export const POST = withRateLimit(async (request: Request) => {
    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(createPostSchema, body);

        // Authorization check - user can only create posts for themselves
        if (!checkAuthorization(user.address, validatedData.creatorAddress)) {
            return forbiddenResponse('You can only create posts for your own account');
        }

        const post = await db.posts.create({
            creatorAddress: validatedData.creatorAddress,
            title: validatedData.title,
            content: validatedData.content,
            image: validatedData.image || null,
            videoUrl: validatedData.videoUrl || null,
            minTier: validatedData.minTier || 0,
            likes: validatedData.likes || 0,
            isPublic: validatedData.isPublic || false,
            createdAt: validatedData.createdAt || new Date().toISOString()
        });

        return NextResponse.json(post || { success: true });
    } catch (e: any) {
        if (e instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: e.errors }, { status: 400 });
        }
        console.error("Post Creation Error:", e);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
