import { db } from "@/utils/db";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createCommentSchema, ValidationError } from '@/utils/validation';

export const GET = withRateLimit(async (
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) => {
    try {
        const { id } = await params;
        const result = await db.comments.getByPost(id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.PUBLIC);

export const POST = withRateLimit(async (
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
        const validatedData = validateSchema(createCommentSchema, {
            ...body,
            postId: id
        });

        // Authorization check - user can only comment as themselves
        if (!checkAuthorization(user.address, validatedData.userAddress)) {
            return forbiddenResponse('You can only comment as yourself');
        }

        const result = await db.comments.create({
            postId: id,
            userAddress: validatedData.userAddress,
            content: validatedData.content
        });
        return NextResponse.json(result);
    } catch (error: any) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: error.errors }, { status: 400 });
        }
        console.error("Error creating comment:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
