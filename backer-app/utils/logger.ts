/**
 * Güvenlik logging ve monitoring utility
 */

export interface SecurityLogEntry {
    type: 'auth_success' | 'auth_failure' | 'api_access' | 'api_error' | 'rate_limit' | 'validation_error' | 'unauthorized_access' | 'forbidden_access';
    ip?: string;
    userId?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    error?: string;
    timestamp: string;
    duration?: number;
    userAgent?: string;
}

class SecurityLogger {
    private logs: SecurityLogEntry[] = [];
    private maxLogs = 1000; // Bellekte tutulacak maksimum log sayısı

    /**
     * Güvenlik olayını loglar
     */
    log(entry: Omit<SecurityLogEntry, 'timestamp'>): void {
        const logEntry: SecurityLogEntry = {
            ...entry,
            timestamp: new Date().toISOString()
        };

        this.logs.push(logEntry);

        // Bellek yönetimi - eski logları temizle
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Console'a yaz (production'da log servisine gönderilmeli)
        if (process.env.NODE_ENV === 'development') {
            console.log('[SECURITY]', JSON.stringify(logEntry));
        }

        // Production'da log servisine gönder (örneğin: Sentry, Datadog, vb.)
        this.sendToLogService(logEntry);
    }

    /**
     * Hata loglar
     */
    logError(entry: Omit<SecurityLogEntry, 'timestamp' | 'type'>): void {
        this.log({
            type: 'api_error',
            ...entry
        });
    }

    /**
     * Authentication başarısını loglar
     */
    logAuthSuccess(userId: string, ip: string, userAgent?: string): void {
        this.log({
            type: 'auth_success',
            userId,
            ip,
            userAgent
        });
    }

    /**
     * Authentication başarısızlığını loglar
     */
    logAuthFailure(ip: string, reason: string, userAgent?: string): void {
        this.log({
            type: 'auth_failure',
            ip,
            error: reason,
            userAgent
        });
    }

    /**
     * API erişimini loglar
     */
    logApiAccess(endpoint: string, method: string, statusCode: number, duration: number, ip: string, userId?: string): void {
        this.log({
            type: 'api_access',
            endpoint,
            method,
            statusCode,
            duration,
            ip,
            userId
        });
    }

    /**
     * Rate limit aşıldı loglar
     */
    logRateLimit(ip: string, endpoint: string): void {
        this.log({
            type: 'rate_limit',
            ip,
            endpoint
        });
    }

    /**
     * Validation hatası loglar
     */
    logValidationError(ip: string, endpoint: string, errors: any[]): void {
        this.log({
            type: 'validation_error',
            ip,
            endpoint,
            error: JSON.stringify(errors)
        });
    }

    /**
     * Yetkisiz erişim loglar
     */
    logUnauthorizedAccess(ip: string, endpoint: string, userAgent?: string): void {
        this.log({
            type: 'unauthorized_access',
            ip,
            endpoint,
            userAgent
        });
    }

    /**
     * Yasak erişim loglar
     */
    logForbiddenAccess(userId: string, ip: string, endpoint: string, reason: string): void {
        this.log({
            type: 'forbidden_access',
            userId,
            ip,
            endpoint,
            error: reason
        });
    }

    /**
     * Log servisine gönder (production için)
     */
    private sendToLogService(entry: SecurityLogEntry): void {
        // Production'da buraya log servisi entegrasyonu yapılmalı
        // Örneğin:
        // - Sentry: Sentry.captureMessage(JSON.stringify(entry))
        // - Datadog: datadogLogs.send(entry)
        // - Custom log API: fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })

        if (typeof window !== 'undefined') {
            // Client-side logging
            // LocalStorage'a yaz
            try {
                const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
                existingLogs.push(entry);
                localStorage.setItem('security_logs', JSON.stringify(existingLogs.slice(-100)));
            } catch (e) {
                // LocalStorage erişilemezse sessizce geç
            }
        }
    }

    /**
     * Tüm logları al
     */
    getAllLogs(): SecurityLogEntry[] {
        return [...this.logs];
    }

    /**
     * Logları filtrele
     */
    filterLogs(filter: Partial<SecurityLogEntry>): SecurityLogEntry[] {
        return this.logs.filter(log => {
            return Object.entries(filter).every(([key, value]) => {
                return log[key as keyof SecurityLogEntry] === value;
            });
        });
    }

    /**
     * Logları temizle
     */
    clearLogs(): void {
        this.logs = [];
    }
}

// Global logger instance
export const securityLogger = new SecurityLogger();

/**
 * API endpoint'leri için logging wrapper
 */
export function withLogging<T extends any[]>(
    handler: (...args: T) => Promise<Response>,
    endpoint: string
) {
    return async (...args: T): Promise<Response> => {
        const startTime = Date.now();
        const request = args[0] as Request;
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        try {
            const response = await handler(...args);
            const duration = Date.now() - startTime;

            // Başarılı API erişimini logla
            securityLogger.logApiAccess(
                endpoint,
                request.method,
                response.status,
                duration,
                ip,
                (request as any).user?.address
            );

            return response;
        } catch (error: any) {
            const duration = Date.now() - startTime;

            // Hata logla
            securityLogger.logError({
                endpoint,
                method: request.method,
                ip,
                statusCode: 500,
                error: error.message,
                duration,
                userAgent
            });

            throw error;
        }
    };
}

export default securityLogger;
