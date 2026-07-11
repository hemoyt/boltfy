/**
 * Security utilities for Boltfy
 * Provides input sanitization, validation, and security helpers
 */

// HTML entity encoding to prevent XSS
export function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };
    return text.replace(/[&<>"'`=/]/g, (char) => map[char]);
}

// Sanitize user input - removes potential XSS vectors
export function sanitizeInput(input: string): string {
    if (!input) return '';

    // Remove script tags and event handlers
    let sanitized = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '');

    // Escape HTML entities
    sanitized = escapeHtml(sanitized);

    return sanitized.trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

// Validate password strength
export interface PasswordStrength {
    score: number; // 0-5
    isStrong: boolean;
    feedback: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
        score++;
    } else {
        feedback.push('Password should be at least 8 characters');
    }

    if (password.length >= 12) {
        score++;
    }

    if (/[a-z]/.test(password)) {
        score++;
    } else {
        feedback.push('Add lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        feedback.push('Add uppercase letters');
    }

    if (/[0-9]/.test(password)) {
        score++;
    } else {
        feedback.push('Add numbers');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    } else {
        feedback.push('Add special characters (!@#$%^&*)');
    }

    // Check for common patterns
    const commonPatterns = [
        /^123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /111111/,
        /admin/i,
    ];

    if (commonPatterns.some(pattern => pattern.test(password))) {
        score = Math.max(0, score - 2);
        feedback.push('Avoid common password patterns');
    }

    return {
        score: Math.min(5, score),
        isStrong: score >= 4,
        feedback,
    };
}

// Rate limiting helper for client-side
interface RateLimitState {
    attempts: number;
    firstAttempt: number;
    blocked: boolean;
    blockedUntil: number;
}

const rateLimitStore: Map<string, RateLimitState> = new Map();

export function checkRateLimit(
    key: string,
    maxAttempts: number = 5,
    windowMs: number = 60000, // 1 minute
    blockMs: number = 300000 // 5 minutes block
): { allowed: boolean; remainingAttempts: number; blockedFor?: number } {
    const now = Date.now();
    let state = rateLimitStore.get(key);

    if (!state) {
        state = { attempts: 0, firstAttempt: now, blocked: false, blockedUntil: 0 };
        rateLimitStore.set(key, state);
    }

    // Check if currently blocked
    if (state.blocked && state.blockedUntil > now) {
        return {
            allowed: false,
            remainingAttempts: 0,
            blockedFor: Math.ceil((state.blockedUntil - now) / 1000),
        };
    }

    // Reset if window has passed
    if (now - state.firstAttempt > windowMs) {
        state.attempts = 0;
        state.firstAttempt = now;
        state.blocked = false;
    }

    // Increment attempts
    state.attempts++;

    // Check if should be blocked
    if (state.attempts > maxAttempts) {
        state.blocked = true;
        state.blockedUntil = now + blockMs;
        return {
            allowed: false,
            remainingAttempts: 0,
            blockedFor: Math.ceil(blockMs / 1000),
        };
    }

    return {
        allowed: true,
        remainingAttempts: maxAttempts - state.attempts,
    };
}

// Reset rate limit for a key
export function resetRateLimit(key: string): void {
    rateLimitStore.delete(key);
}

// CSRF token generation (for additional security)
export function generateCsrfToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validate URL to prevent open redirects
export function isValidRedirectUrl(url: string, allowedHosts: string[] = []): boolean {
    try {
        const parsed = new URL(url, window.location.origin);

        // Only allow same origin or explicitly allowed hosts
        if (parsed.origin === window.location.origin) {
            return true;
        }

        if (allowedHosts.includes(parsed.hostname)) {
            return true;
        }

        return false;
    } catch {
        // Relative URLs are safe
        return url.startsWith('/') && !url.startsWith('//');
    }
}

// Secure session storage wrapper
export const secureStorage = {
    set(key: string, value: unknown): void {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
        } catch (error) {
            console.error('Failed to store secure data:', error);
        }
    },

    get<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    },

    remove(key: string): void {
        sessionStorage.removeItem(key);
    },

    clear(): void {
        sessionStorage.clear();
    },
};

// Content Security Policy nonce generator
export function generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array));
}

// Detect suspicious activity
export function detectSuspiciousActivity(): boolean {
    const win = window as unknown as Record<string, unknown>;

    // Check for automation indicators
    const suspicious = [
        // Selenium
        win.webdriver,
        win.__webdriver_evaluate,
        win.__selenium_evaluate,
        // PhantomJS
        win._phantom,
        win.__nightmare,
        // Check for automation properties
        navigator.webdriver,
    ];

    return suspicious.some(Boolean);
}

// Log security event (for monitoring)
export function logSecurityEvent(event: {
    type: 'login_attempt' | 'login_success' | 'login_failure' | 'suspicious_activity' | 'rate_limit';
    details?: Record<string, unknown>;
}): void {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...event,
        userAgent: navigator.userAgent,
        url: window.location.href,
    };

    // In production, send to security monitoring service
    console.log('[Security Event]', logEntry);
}
