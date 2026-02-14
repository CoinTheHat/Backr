import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createMembershipSchema, ValidationError } from '@/utils/validation';

export const GET = withRateLimit(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const subscriber = searchParams.get('subscriber')?.toLowerCase();
    const creator = searchParams.get('creator')?.toLowerCase();

    try {
        let data;

        if (subscriber && creator) {
            // Filter both: get by user then filter by creator
            data = await db.memberships.getByUser(subscriber);
            data = data.filter((m: any) => m.creatorAddress?.toLowerCase() === creator);
        } else if (subscriber) {
            data = await db.memberships.getByUser(subscriber);
        } else if (creator) {
            data = await db.memberships.getByCreator(creator);
        } else {
            data = await db.memberships.getAll();
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
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
        const validatedData = validateSchema(createMembershipSchema, {
            ...body,
            subscriberAddress: body.subscriberAddress?.toLowerCase(),
            creatorAddress: body.creatorAddress?.toLowerCase()
        });

        // Authorization check - user can only create subscriptions for themselves
        if (!checkAuthorization(user.address, validatedData.subscriberAddress)) {
            return forbiddenResponse('You can only create subscriptions for your own account');
        }

        const newMembership = await db.memberships.create({
            userAddress: validatedData.subscriberAddress,
            creatorAddress: validatedData.creatorAddress,
            tierId: validatedData.tierId,
            expiresAt: new Date(validatedData.expiry * 1000).toISOString(),
            txHash: validatedData.txHash
        });

        return NextResponse.json(newMembership);
    } catch (e: any) {
        if (e instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: e.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
