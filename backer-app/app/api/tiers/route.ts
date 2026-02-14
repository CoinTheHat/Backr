import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createTierSchema, updateTierSchema, deleteTierSchema, ValidationError } from '@/utils/validation';

export const GET = withRateLimit(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const creator = searchParams.get('creator'); // This is the address

    if (!creator) {
        return NextResponse.json([]);
    }

    const tiers = await db.tiers.getByCreator(creator);
    return NextResponse.json(tiers);
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
        const validatedData = validateSchema(createTierSchema, body);

        // Authorization check - user can only create tiers for themselves
        if (!checkAuthorization(user.address, validatedData.creator)) {
            return forbiddenResponse('You can only create tiers for your own account');
        }

        const currentTiers = await db.tiers.getByCreator(validatedData.creator);

        const newTier = {
            id: crypto.randomUUID(), // Use secure UUID instead of random string
            creatorAddress: validatedData.creator,
            name: validatedData.name,
            price: Number(validatedData.price),
            description: validatedData.description || '',
            perks: validatedData.perks || [],
            image: validatedData.image || '',
            active: validatedData.active !== undefined ? validatedData.active : true,
            createdAt: new Date().toISOString()
        };

        // saveAll replaces all tiers, so we append the new one
        await db.tiers.saveAll(validatedData.creator, [...currentTiers, newTier]);

        return NextResponse.json(newTier);
    } catch (e: any) {
        if (e instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: e.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);

export const PUT = withRateLimit(async (request: Request) => {
    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(updateTierSchema, body);

        // Authorization check - user can only update their own tiers
        if (!checkAuthorization(user.address, validatedData.creator)) {
            return forbiddenResponse('You can only update your own tiers');
        }

        const currentTiers = await db.tiers.getByCreator(validatedData.creator);
        const tierIndex = currentTiers.findIndex((t: any) => t.id === validatedData.id);

        if (tierIndex === -1) {
            return NextResponse.json({ error: "Tier not found" }, { status: 404 });
        }

        const updatedTier = {
            ...currentTiers[tierIndex],
            name: validatedData.name,
            price: Number(validatedData.price),
            description: validatedData.description || currentTiers[tierIndex].description,
            perks: validatedData.perks || [],
            image: validatedData.image || currentTiers[tierIndex].image
        };

        currentTiers[tierIndex] = updatedTier;
        await db.tiers.saveAll(validatedData.creator, currentTiers);

        return NextResponse.json(updatedTier);
    } catch (e: any) {
        if (e instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: e.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);

export const DELETE = withRateLimit(async (request: Request) => {
    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const creator = searchParams.get('creator');

        if (!id || !creator) {
            return NextResponse.json({ error: 'Missing ID or Creator' }, { status: 400 });
        }

        // Authorization check - user can only delete their own tiers
        if (!checkAuthorization(user.address, creator)) {
            return forbiddenResponse('You can only delete your own tiers');
        }

        const currentTiers = await db.tiers.getByCreator(creator);
        const filteredTiers = currentTiers.filter((t: any) => t.id !== id);

        await db.tiers.saveAll(creator, filteredTiers);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
