import { NextResponse } from 'next/server';

/**
 * Rate limiting için basit in-memory implementation
 * Production'da Redis veya benzeri bir cache kullanılmalı
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private store: Map<string, RateLimitEntry> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Her 5 dakikada bir eski entry'leri temizle
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * Rate limit kontrolü yapar
     * @param identifier - IP adresi veya user ID
     * @param limit - Maksimum istek sayısı
     * @param window - Time window (ms)
     */
    check(identifier: string, limit: number, window: number): { success: boolean; remaining: number; resetTime: number } {
        const now = Date.now();
        const entry = this.store.get(identifier);

        if (!entry || now > entry.resetTime) {
            // Yeni window veya eski entry
            const newEntry: RateLimitEntry = {
                count: 1,
                resetTime: now + window
            };
            this.store.set(identifier, newEntry);

            return {
                success: true,
                remaining: limit - 1,
                resetTime: newEntry.resetTime
            };
        }

        if (entry.count >= limit) {
            // Rate limit aşıldı
            return {
                success: false,
                remaining: 0,
                resetTime: entry.resetTime
            };
        }

        // Sayacı artır
        entry.count++;
        this.store.set(identifier, entry);

        return {
            success: true,
            remaining: limit - entry.count,
            resetTime: entry.resetTime
        };
    }

    /**
     * Eski entry'leri temizle
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetTime) {
                this.store.delete(key);
            }
        }
    }

    /**
     * Rate limiter'ı temizle
     */
    destroy(): void {
        clearInterval(this.cleanupInterval);
        this.store.clear();
    }
}

// Global rate limiter instance
const globalRateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RATE_LIMITS = {
    // Genel API rate limitleri
    API: { limit: 100, window: 60 * 1000 }, // 100 istek / dakika

    // Authentication endpoint'leri için daha sıkı limit
    AUTH: { limit: 10, window: 60 * 1000 }, // 10 istek / dakika

    // Ağır işlemler için
    HEAVY: { limit: 5, window: 60 * 1000 }, // 5 istek / dakika

    // Public endpoint'ler
    PUBLIC: { limit: 200, window: 60 * 1000 }, // 200 istek / dakika
} as const;

/**
 * IP adresini request'ten çeker
 */
export function getClientIP(request: Request | any): string {
    // X-Forwarded-For header'ını kontrol et
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }

    // X-Real-IP header'ını kontrol et
    const realIP = request.headers.get('x-real-ip');
    if (realIP) {
        return realIP;
    }

    // Fallback
    return 'unknown';
}

/**
 * Rate limit kontrolü yapar ve aşıldıysa 429 döner
 */
export function checkRateLimit(
    identifier: string,
    config: { limit: number; window: number }
): { success: boolean; remaining: number; resetTime: number } {
    return globalRateLimiter.check(identifier, config.limit, config.window);
}

/**
 * Rate limit exceeded response
 */
export function rateLimitResponse(resetTime: number): NextResponse {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return NextResponse.json(
        {
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfter
        },
        {
            status: 429,
            headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': new Date(resetTime).toISOString()
            }
        }
    );
}

/**
 * Rate limiting middleware wrapper
 */
export function withRateLimit(
    handler: (request: Request | any, ...args: any[]) => Promise<NextResponse>,
    config: { limit: number; window: number } = RATE_LIMITS.API
) {
    return async (request: Request, ...args: any[]): Promise<NextResponse> => {
        const ip = getClientIP(request);

        const result = checkRateLimit(ip, config);

        if (!result.success) {
            return rateLimitResponse(result.resetTime);
        }

        const response = await handler(request, ...args);

        // Rate limit header'larını ekle
        response.headers.set('X-RateLimit-Limit', config.limit.toString());
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

        return response;
    };
}

/**
 * User bazlı rate limiting (authentication gerektiren endpoint'ler için)
 */
export function withUserRateLimit(
    handler: (request: Request | any, ...args: any[]) => Promise<NextResponse>,
    config: { limit: number; window: number } = RATE_LIMITS.API
) {
    return async (request: Request | any, ...args: any[]): Promise<NextResponse> => {
        // Önce IP bazlı rate limit
        const ip = getClientIP(request);
        const ipResult = checkRateLimit(`ip:${ip}`, config);

        if (!ipResult.success) {
            return rateLimitResponse(ipResult.resetTime);
        }

        // User bazlı rate limit (eğer authenticated ise)
        const user = (request as any).user;
        if (user && user.address) {
            const userResult = checkRateLimit(`user:${user.address}`, config);

            if (!userResult.success) {
                return rateLimitResponse(userResult.resetTime);
            }
        }

        const response = await handler(request, ...args);

        response.headers.set('X-RateLimit-Limit', config.limit.toString());
        response.headers.set('X-RateLimit-Remaining', ipResult.remaining.toString());
        response.headers.set('X-RateLimit-Reset', new Date(ipResult.resetTime).toISOString());

        return response;
    };
}

export default globalRateLimiter;
