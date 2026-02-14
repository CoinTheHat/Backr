import { db } from "@/utils/db";
import { NextResponse } from "next/server";
import { getAuthenticatedUser, unauthorizedResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';

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
        const result = await db.posts.like(id);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Error liking post:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
