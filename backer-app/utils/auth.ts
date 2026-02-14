import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Authentication ve Authorization yardımcı fonksiyonları
 */

export interface AuthUser {
    address: string;
    authenticated: boolean;
}

/**
 * Request'ten kullanıcı adresini çeker ve doğrular
 * Privy authentication header'ını kontrol eder
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthUser | null> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return null;
        }

        // Bearer token kontrolü
        if (!authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);

        // Token'ı decode et (JWT veya Privy session token)
        // Gerçek uygulamada burada Privy API'si ile token doğrulaması yapılmalı
        const decoded = decodeToken(token);

        if (!decoded || !decoded.address) {
            return null;
        }

        return {
            address: decoded.address.toLowerCase(),
            authenticated: true
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}

/**
 * Basit token decode fonksiyonu
 * Gerçek uygulamada Privy SDK'sı kullanılmalı
 */
function decodeToken(token: string): { address: string } | null {
    try {
        // JWT token decode (signature verification olmadan)
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

        if (!payload.address || !isValidAddress(payload.address)) {
            return null;
        }

        return { address: payload.address };
    } catch {
        return null;
    }
}

/**
 * Ethereum adres formatını doğrular
 */
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Authentication gerektiren API endpoint'leri için wrapper
 */
export function withAuth(handler: (request: Request, ...args: any[]) => Promise<NextResponse>) {
    return async (request: Request, ...args: any[]): Promise<NextResponse> => {
        const user = await getAuthenticatedUser(request);

        if (!user || !user.authenticated) {
            return NextResponse.json(
                { error: 'Unauthorized - Authentication required' },
                { status: 401 }
            );
        }

        // User bilgisini request context'ine ekle
        (request as any).user = user;

        return handler(request, ...args);
    };
}

/**
 * Authorization kontrolü - kullanıcının belirli bir adres ile işlem yapmasına izin verir
 */
export function checkAuthorization(userAddress: string, targetAddress: string): boolean {
    if (!userAddress || !targetAddress) {
        return false;
    }

    return userAddress.toLowerCase() === targetAddress.toLowerCase();
}

/**
 * Unauthorized response döner
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
    return NextResponse.json(
        { error: message },
        { status: 401 }
    );
}

/**
 * Forbidden response döner
 */
export function forbiddenResponse(message: string = 'Forbidden') {
    return NextResponse.json(
        { error: message },
        { status: 403 }
    );
}
