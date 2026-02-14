import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { getAuthenticatedUser, unauthorizedResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createCategorySchema, updateCategorySchema, ValidationError } from '@/utils/validation';

const DEFAULT_CATEGORIES = [
    { id: 'art', name: 'Art', icon: '🎨', isActive: true, sortOrder: 1 },
    { id: 'gaming', name: 'Gaming', icon: '🎮', isActive: true, sortOrder: 2 },
    { id: 'music', name: 'Music', icon: '🎵', isActive: true, sortOrder: 3 },
    { id: 'tech', name: 'Tech', icon: '💻', isActive: true, sortOrder: 4 },
    { id: 'podcast', name: 'Podcast', icon: '🎙️', isActive: true, sortOrder: 5 }
];

export const GET = withRateLimit(async () => {
    try {
        const data = await db.taxonomy.categories.getAll();

        if (!data || data.length === 0) {
            return NextResponse.json(DEFAULT_CATEGORIES);
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json(DEFAULT_CATEGORIES);
    }
}, RATE_LIMITS.PUBLIC);

export const POST = withRateLimit(async (request: Request) => {
    try {
        // Authentication check - only authenticated users can create categories
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(createCategorySchema, body);

        // Auto-generate slug from name if not provided
        const slug = body.id || validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

        const newCat = await db.taxonomy.categories.create(validatedData.name, slug);

        if (newCat) {
            // Update additional fields
            const updated = await db.taxonomy.categories.update(newCat.id, {
                name: validatedData.name,
                icon: validatedData.icon,
                sortOrder: validatedData.sortOrder,
                isActive: validatedData.isActive
            });
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
        // Authentication check - only authenticated users can update categories
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(updateCategorySchema, body);

        if (!validatedData.id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const updated = await db.taxonomy.categories.update(validatedData.id, {
            name: validatedData.name,
            icon: validatedData.icon,
            sortOrder: validatedData.sortOrder,
            isActive: validatedData.isActive
        });

        if (!updated) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
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
        // Authentication check - only authenticated users can delete categories
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        await db.taxonomy.categories.delete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}, RATE_LIMITS.API);
