import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createCreatorSchema, updateCreatorSchema, ValidationError } from '@/utils/validation';

export const GET = withRateLimit(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const username = searchParams.get('username');
    const query = searchParams.get('q');

    if (address) {
        const creator = await db.creators.find(address);
        return NextResponse.json(creator || {});
    }

    if (username) {
        // Check if username is already taken
        const existing = await db.creators.findByUsername(username);
        return NextResponse.json({ available: !existing });
    }

    const creators = await db.creators.getAll();

    if (query) {
        const lowerQuery = query.toLowerCase();
        const filtered = creators.filter((c: any) =>
            c.name?.toLowerCase().includes(lowerQuery) ||
            c.username?.toLowerCase().includes(lowerQuery) ||
            c.bio?.toLowerCase().includes(lowerQuery)
        );
        return NextResponse.json(filtered);
    }

    return NextResponse.json(creators);
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
        const validatedData = validateSchema(createCreatorSchema, body);

        // Authorization check - user can only create/update their own profile
        if (!checkAuthorization(user.address, validatedData.address)) {
            return forbiddenResponse('You can only create/update your own profile');
        }

        // Check if email is already taken by another creator (prevent duplicate accounts for same email)
        if (validatedData.email) {
            const users = await db.creators.getAll();
            const existingWithEmail = users.find((u: any) => u.email === validatedData.email && u.address.toLowerCase() !== validatedData.address.toLowerCase());
            if (existingWithEmail) {
                return NextResponse.json({ error: 'Email is already linked to another wallet. Please login with your original wallet.' }, { status: 409 });
            }
        }

        // Save to local DB (now Postgres)
        const updated = await db.creators.create({
            ...validatedData,
            updatedAt: new Date().toISOString()
        });

        return NextResponse.json(updated);
    } catch (e: any) {
        if (e instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: e.errors }, { status: 400 });
        }
        // Handle unique constraint violation for username or avatarUrl
        if (e.code === '23505' && (e.constraint?.includes('username') || e.constraint?.includes('avatarUrl'))) {
            return NextResponse.json({ error: 'Username or Avatar URL is already taken' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
