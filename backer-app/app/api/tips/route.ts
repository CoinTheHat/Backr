import { NextResponse } from 'next/server';
import { db } from '../../../utils/db';
import { getAuthenticatedUser, checkAuthorization, unauthorizedResponse, forbiddenResponse } from '@/utils/auth';
import { withRateLimit, RATE_LIMITS } from '@/utils/rate-limit';
import { validateSchema, createTipSchema, ValidationError } from '@/utils/validation';

export const POST = withRateLimit(async (request: Request) => {
    try {
        // Authentication check
        const user = await getAuthenticatedUser(request);
        if (!user || !user.authenticated) {
            return unauthorizedResponse();
        }

        const body = await request.json();

        // Validate input
        const validatedData = validateSchema(createTipSchema, body);

        // Authorization check - user can only send tips from their own address
        if (!checkAuthorization(user.address, validatedData.sender)) {
            return forbiddenResponse('You can only send tips from your own account');
        }

        const newTip = await db.tips.create({
            sender: validatedData.sender,
            receiver: validatedData.receiver,
            amount: validatedData.amount,
            message: validatedData.message,
            txHash: validatedData.txHash,
            currency: validatedData.currency
        });

        return NextResponse.json(newTip);
    } catch (error: any) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: 'Validation failed', errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to create tip' }, { status: 500 });
    }
}, RATE_LIMITS.API);

export const GET = withRateLimit(async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const receiver = searchParams.get('receiver');
    const sender = searchParams.get('sender');

    try {
        let tips;
        if (receiver) {
            tips = await db.tips.getByReceiver(receiver);
        } else if (sender) {
            tips = await db.tips.getBySender(sender);
        } else {
            tips = await db.tips.getAll();
        }

        return NextResponse.json(tips);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tips' }, { status: 500 });
    }
}, RATE_LIMITS.PUBLIC);
