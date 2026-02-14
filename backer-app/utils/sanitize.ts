/**
 * Frontend input sanitization utility'leri
 * XSS ve diğer saldırılara karşı koruma sağlar
 */

/**
 * HTML içeriğini sanitize eder
 * XSS saldırılarına karşı koruma sağlar
 */
export function sanitizeHTML(input: string): string {
    if (!input) return '';

    return input
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * URL'i sanitize eder
 * XSS ve URL injection saldırılarına karşı koruma sağlar
 */
export function sanitizeURL(input: string): string {
    if (!input) return '';

    try {
        const url = new URL(input);

        // Sadece http ve https protokollerine izin ver
        if (!['http:', 'https:'].includes(url.protocol)) {
            return '';
        }

        // JavaScript: ve data: URL'lerini engelle
        if (url.protocol === 'javascript:' || url.protocol === 'data:') {
            return '';
        }

        return url.toString();
    } catch {
        return '';
    }
}

/**
 * Kullanıcı girdisini sanitize eder
 * XSS ve script injection'a karşı koruma sağlar
 */
export function sanitizeUserInput(input: string): string {
    if (!input) return '';

    return input
        // Script tag'lerini kaldır
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        // Event handler'ları kaldır
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '')
        // iframe, object, embed tag'lerini kaldır
        .replace(/<(iframe|object|embed)[^>]*>/gi, '')
        // Style tag'lerini kaldır
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        // HTML entity decode
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/&/g, '&')
        .replace(/"/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}

/**
 * Ethereum adresini validate eder
 */
export function isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Transaction hash'i validate eder
 */
export function isValidTxHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Email adresini validate eder
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Username'i validate eder
 */
export function isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * Sayısal input'u validate eder
 */
export function sanitizeNumber(input: string | number): number | null {
    if (typeof input === 'number') {
        return isFinite(input) ? input : null;
    }

    const num = parseFloat(input);
    return isFinite(num) && !isNaN(num) ? num : null;
}

/**
 * Miktar input'unu validate eder (para birimi için)
 */
export function sanitizeAmount(input: string): string | null {
    const num = parseFloat(input);

    if (isNaN(num) || num < 0) {
        return null;
    }

    // Maksimum 2 ondalık basamak
    return num.toFixed(2);
}

/**
 * JSON string'i parse eder ve hata yakalar
 */
export function safeJSONParse<T>(input: string, defaultValue: T): T {
    try {
        return JSON.parse(input) as T;
    } catch {
        return defaultValue;
    }
}

/**
 * LocalStorage'a güvenli bir şekilde veri kaydeder
 */
export function safeLocalStorageSet(key: string, value: any): boolean {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('LocalStorage set failed:', e);
        return false;
    }
}

/**
 * LocalStorage'dan güvenli bir şekilde veri okur
 */
export function safeLocalStorageGet<T>(key: string, defaultValue: T): T {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) as T : defaultValue;
    } catch (e) {
        console.error('LocalStorage get failed:', e);
        return defaultValue;
    }
}

/**
 * LocalStorage'dan güvenli bir şekilde veri siler
 */
export function safeLocalStorageRemove(key: string): boolean {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('LocalStorage remove failed:', e);
        return false;
    }
}

/**
 * XSS korumalı innerHTML setter
 */
export function setSafeHTML(element: HTMLElement, html: string): void {
    element.innerHTML = sanitizeHTML(html);
}

/**
 * XSS korumalı textContent setter
 */
export function setSafeText(element: HTMLElement, text: string): void {
    element.textContent = text;
}

/**
 * React için güvenli prop type'ları
 */
export interface SafeHTMLProps {
    dangerouslySetInnerHTML?: {
        __html: string;
    };
}

/**
 * React için güvenli HTML oluşturucu
 */
export function createSafeHTML(html: string): SafeHTMLProps {
    return {
        dangerouslySetInnerHTML: {
            __html: sanitizeHTML(html)
        }
    };
}

/**
 * Kullanıcı input'unu truncate eder
 */
export function truncateInput(input: string, maxLength: number): string {
    if (!input) return '';
    return input.length > maxLength ? input.substring(0, maxLength) + '...' : input;
}

/**
 * Özel karakterleri escape eder
 */
export function escapeSpecialChars(input: string): string {
    if (!input) return '';

    return input
        .replace(/\\/g, '\\\\')
        .replace(/\$/g, '\\$')
        .replace(/\./g, '\\.')
        .replace(/\*/g, '\\*')
        .replace(/\+/g, '\\+')
        .replace(/\?/g, '\\?')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\^/g, '\\^')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}');
}

/**
 * Regex pattern'i escape eder
 */
export function escapeRegex(pattern: string): string {
    return pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
