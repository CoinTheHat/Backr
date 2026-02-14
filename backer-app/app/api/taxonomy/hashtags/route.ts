import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createHashtagSchema, updateHashtagSchema, ValidationError } from '@/utils/validation';

const DEFAULT_HASHTAGS = [
    { id: 'crypto', label: 'crypto', isActive: true, sortOrder: 1 },
    { id: 'web3', label: 'web3', isActive: true, sortOrder: 2 },
    { id: 'nft', label: 'nft', isActive: true, sortOrder: 3 },
    { id: 'indie', label: 'indie', isActive: true, sortOrder: 4 }
];

export const GET = withRateLimit(async () => {
    try {
        const data = await db.taxonomy.hashtags.getAll();

        // Map 'name' to 'label' for frontend compatibility
        const mappedData = data.map((tag: any) => ({
            ...tag,
            label: tag.name
        }));

        if (!data || data.length === 0) {
            // Optional: return defaults if DB empty? 
            // Better to return empty array or defaults.
            // Following original logic:
            return NextResponse.json(mappedData.length ? mappedData : DEFAULT_HASHTAGS);
        }

        return NextResponse.json(mappedData);
    } catch (e: any) {
        return NextResponse.json(DEFAULT_HASHTAGS);
    }
}, RATE_LIMITS.PUBLIC);

export const POST = withRateLimit(async (request: Request) => {
    try {
        // Authentication check - only authenticated users can create hashtags
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Check if bulk add (array)
        if (Array.isArray(body)) {
            // PG specific bulk insert or loop
            // db.taxonomy.hashtags.create takes name, slug
            const results = [];
            for (const tag of body) {
                // Validate each tag
                const validatedTag = validateSchema(createHashtagSchema, tag);

                const slug = validatedTag.id || validatedTag.label.toLowerCase().replace(/[^a-z0-9]+/g, '');
                const newTag = await db.taxonomy.hashtags.create(validatedTag.label, slug);

                // We might need to update other fields (sortOrder etc) immediately?
                // The current db.create only sets name/slug.
                // For MVP, just creating is fine, or we call update.
                if (newTag) {
                    await db.taxonomy.hashtags.update(newTag.id, {
                        sortOrder: validatedTag.sortOrder,
                        isActive: validatedTag.isActive,
                        isTrending: validatedTag.isTrending
                    });
                    results.push(newTag);
                }
            }
            return NextResponse.json(results);
        }

        // Single add
        const validatedData = validateSchema(createHashtagSchema, body);
        const slug = validatedData.id || validatedData.label.toLowerCase().replace(/[^a-z0-9]+/g, '');

        const newTag = await db.taxonomy.hashtags.create(validatedData.label, slug);
        if (newTag) {
            await db.taxonomy.hashtags.update(newTag.id, {
                sortOrder: validatedData.sortOrder,
                isActive: validatedData.isActive,
                isTrending: validatedData.isTrending
            });
            // Fetch updated
            const updated = { ...newTag, sortOrder: validatedData.sortOrder, isActive: validatedData.isActive, isTrending: validatedData.isTrending, label: validatedData.label }; // approximate return
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Failed to create" }, { status: 500 });

    } catch (error: any) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);

export const PATCH = withRateLimit(async (request: Request) => {
    try {
        // Authentication check - only authenticated users can update hashtags
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(updateHashtagSchema, body);

        if (!validatedData.id) {
            return NextResponse.json({ error: 'Hashtag ID is required' }, { status: 400 });
        }

        const updated = await db.taxonomy.hashtags.update(validatedData.id, {
            label: validatedData.label, // maps to name in DB
            sortOrder: validatedData.sortOrder,
            isActive: validatedData.isActive,
            isTrending: validatedData.isTrending
        });

        if (!updated) {
            return NextResponse.json({ error: 'Hashtag not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);

export const DELETE = withRateLimit(async (request: Request) => {
    try {
        // Authentication check - only authenticated users can delete hashtags
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Hashtag ID is required' }, { status: 400 });
        }

        await db.taxonomy.hashtags.delete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
