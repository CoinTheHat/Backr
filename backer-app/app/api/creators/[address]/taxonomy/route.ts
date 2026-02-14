import { NextResponse } from 'next/server';
import { db } from '@/utils/db'; // Use db instead of supabase
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';

export const GET = withRateLimit(async (request: Request, { params }: { params: Promise<{ address: string }> }) => {
    const resolvedParams = await params;
    const { address } = resolvedParams;

    try {
        const creator = await db.creators.find(address);

        if (!creator) {
            return NextResponse.json({ categoryIds: [], hashtagIds: [] });
        }

        // socials is JSONB, so it comes back as an object
        const taxonomy = creator.socials?.taxonomy || { categoryIds: [], hashtagIds: [] };
        return NextResponse.json(taxonomy);
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.PUBLIC);

export const PATCH = withRateLimit(async (request: Request, { params }: { params: Promise<{ address: string }> }) => {
    const resolvedParams = await params;
    const { address } = resolvedParams;

    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();
        const { categoryIds, hashtagIds } = body;

        // Authorization check - only the creator can update their own taxonomy
        if (!checkAuthorization(user.address, address)) {
            return forbiddenResponse('You can only update your own taxonomy');
        }

        // 1. Get existing creator
        const creator = await db.creators.find(address);
        if (!creator) {
            return NextResponse.json({ error: "Creator not found" }, { status: 404 });
        }

        // 2. Merge taxonomy into socials
        const currentSocials = creator.socials || {};
        const updatedSocials = {
            ...currentSocials,
            taxonomy: { categoryIds, hashtagIds }
        };

        // 3. Update using db
        const updatedCreator = await db.creators.updateSocials(address, updatedSocials);

        if (!updatedCreator) {
            throw new Error("Failed to update socials");
        }

        return NextResponse.json({ categoryIds, hashtagIds });

    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
