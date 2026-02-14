import { z } from 'zod';

/**
 * Input validation schema'ları
 * Zod kullanarak tip güvenli validation sağlar
 */

// Ethereum adres formatı
const ethereumAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Transaction hash formatı
const txHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash');

// Username formatı
const usernameSchema = z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');

// Email formatı
const emailSchema = z.string().email('Invalid email address');

// Phone formatı (basit)
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number');

// ==================== Creator Schemas ====================

export const createCreatorSchema = z.object({
    address: ethereumAddressSchema,
    username: usernameSchema,
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    bio: z.string().max(500, 'Bio is too long').optional(),
    profileImage: z.string().url('Invalid profile image URL').optional(),
    coverImage: z.string().url('Invalid cover image URL').optional(),
    avatarUrl: z.string().url('Invalid avatar URL').optional(),
    email: emailSchema.optional(),
    socials: z.record(z.any()).optional(),
    payoutToken: ethereumAddressSchema.optional(),
    contractAddress: ethereumAddressSchema.optional()
});

export const updateCreatorSchema = z.object({
    address: ethereumAddressSchema,
    username: usernameSchema.optional(),
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    profileImage: z.string().url().optional(),
    coverImage: z.string().url().optional(),
    avatarUrl: z.string().url().optional(),
    email: emailSchema.optional(),
    socials: z.record(z.any()).optional(),
    payoutToken: ethereumAddressSchema.optional(),
    contractAddress: ethereumAddressSchema.optional()
});

// ==================== Post Schemas ====================

export const createPostSchema = z.object({
    creatorAddress: ethereumAddressSchema,
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    content: z.string().min(1, 'Content is required').max(10000, 'Content is too long'),
    image: z.string().url('Invalid image URL').nullable().optional(),
    videoUrl: z.string().url('Invalid video URL').nullable().optional(),
    minTier: z.number().int().min(0, 'Tier must be 0 or greater').optional(),
    likes: z.number().int().min(0).optional(),
    isPublic: z.boolean().optional(),
    createdAt: z.string().datetime().optional()
});

export const updatePostSchema = z.object({
    creatorAddress: ethereumAddressSchema,
    title: z.string().min(1).max(200).optional(),
    content: z.string().min(1).max(10000).optional(),
    image: z.string().url().nullable().optional(),
    videoUrl: z.string().url().nullable().optional(),
    minTier: z.number().int().min(0).optional(),
    isPublic: z.boolean().optional()
});

// ==================== Comment Schemas ====================

export const createCommentSchema = z.object({
    postId: z.string().uuid('Invalid post ID'),
    userAddress: ethereumAddressSchema,
    content: z.string().min(1, 'Comment is required').max(1000, 'Comment is too long')
});

// ==================== Tip Schemas ====================

export const createTipSchema = z.object({
    sender: ethereumAddressSchema,
    receiver: ethereumAddressSchema,
    amount: z.string().regex(/^\d+\.?\d*$/, 'Invalid amount').refine(
        (val) => parseFloat(val) > 0,
        'Amount must be greater than 0'
    ),
    message: z.string().max(500, 'Message is too long').optional(),
    txHash: txHashSchema,
    currency: z.string().default('USDC')
});

// ==================== Subscription/Membership Schemas ====================

export const createMembershipSchema = z.object({
    subscriberAddress: ethereumAddressSchema,
    creatorAddress: ethereumAddressSchema,
    tierId: z.union([z.string(), z.number()]),
    expiry: z.number().int().positive('Expiry timestamp must be positive'),
    txHash: txHashSchema.optional()
});

export const updateMembershipSchema = z.object({
    id: z.string().uuid('Invalid membership ID'),
    tierId: z.union([z.string(), z.number()]).optional(),
    expiresAt: z.string().datetime().optional()
});

// ==================== Tier Schemas ====================

export const createTierSchema = z.object({
    creator: ethereumAddressSchema,
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    price: z.union([
        z.string().regex(/^\d+\.?\d*$/, 'Invalid price').refine(
            (val) => parseFloat(val) >= 0,
            'Price must be 0 or greater'
        ),
        z.number().min(0)
    ]),
    description: z.string().max(500, 'Description is too long').optional(),
    perks: z.array(z.any()).optional(),
    image: z.string().url('Invalid image URL').optional(),
    active: z.boolean().optional()
});

export const updateTierSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    creator: ethereumAddressSchema,
    name: z.string().min(1).max(100).optional(),
    price: z.union([
        z.string().regex(/^\d+\.?\d*$/).refine((val) => parseFloat(val) >= 0),
        z.number().min(0)
    ]).optional(),
    description: z.string().max(500).optional(),
    perks: z.array(z.any()).optional(),
    image: z.string().url().optional(),
    active: z.boolean().optional()
});

export const deleteTierSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    creator: ethereumAddressSchema
});

// ==================== Taxonomy Schemas ====================

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
    icon: z.string().max(10, 'Icon is too long').optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional()
});

export const updateCategorySchema = z.object({
    id: z.string().min(1, 'ID is required'),
    name: z.string().min(1).max(50).optional(),
    icon: z.string().max(10).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional()
});

export const createHashtagSchema = z.object({
    id: z.string().optional(),
    label: z.string().min(1, 'Label is required').max(50, 'Label is too long'),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    isTrending: z.boolean().optional()
});

export const updateHashtagSchema = z.object({
    id: z.string().min(1, 'ID is required'),
    label: z.string().min(1).max(50).optional(),
    sortOrder: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
    isTrending: z.boolean().optional()
});

// ==================== Auth Schemas ====================

export const loginWithEmailSchema = z.object({
    email: emailSchema
});

export const verifyOTPSchema = z.object({
    code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be digits')
});

export const findUserSchema = z.object({
    identifier: z.union([emailSchema, phoneSchema])
});

// ==================== Helper Functions ====================

/**
 * Validation error'ı formatlar
 */
export function formatValidationError(error: z.ZodError): { field: string; message: string }[] {
    return error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message
    }));
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors: { field: string; message: string }[]) {
    return {
        error: 'Validation failed',
        errors
    };
}

/**
 * Schema'ı validate eder ve hata varsa fırlatır
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new ValidationError(formatValidationError(error));
        }
        throw error;
    }
}

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
    public errors: { field: string; message: string }[];

    constructor(errors: { field: string; message: string }[]) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

// ==================== Sanitization ====================

/**
 * HTML/XSS sanitization için basit fonksiyon
 * Production'da DOMPurify veya benzeri kütüphane kullanılmalı
 */
export function sanitizeHTML(input: string): string {
    if (!input) return input;

    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * String'i trim eder ve boşsa null döner
 */
export function sanitizeString(input: string | null | undefined): string | null {
    if (!input) return null;
    const trimmed = input.trim();
    return trimmed.length > 0 ? trimmed : null;
}

/**
 * URL'i sanitize eder
 */
export function sanitizeURL(input: string): string {
    try {
        const url = new URL(input);
        // Sadece http ve https protokollerine izin ver
        if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid protocol');
        }
        return url.toString();
    } catch {
        throw new Error('Invalid URL');
    }
}
