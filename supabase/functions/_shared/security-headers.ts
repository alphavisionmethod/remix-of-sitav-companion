// ═══════════════════════════════════════════════════════════════
// SITA OS — Security Headers & Hardening Utilities
// Applied to ALL edge function responses
// ═══════════════════════════════════════════════════════════════

/** Security headers applied to every response */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=(self)",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Pragma": "no-cache",
};

/** Merge security headers into any existing headers object */
export function withSecurityHeaders(headers: Record<string, string>): Record<string, string> {
  return { ...headers, ...securityHeaders };
}

/** Brute-force / login attempt tracking */
const loginAttempts = new Map<string, { count: number; firstAttempt: number; lockedUntil: number }>();

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function checkBruteForce(identifier: string): { allowed: boolean; remainingAttempts: number; lockedUntilMs?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  // Check if locked out
  if (entry.lockedUntil > now) {
    return { allowed: false, remainingAttempts: 0, lockedUntilMs: entry.lockedUntil };
  }

  // Reset if window expired
  if (now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS };
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - entry.count };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = loginAttempts.get(identifier);

  if (!entry || now - entry.firstAttempt > LOGIN_WINDOW_MS) {
    loginAttempts.set(identifier, { count: 1, firstAttempt: now, lockedUntil: 0 });
    return;
  }

  entry.count++;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

export function clearFailedAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/** Sanitize user input — strip dangerous patterns */
export function sanitizeInput(input: string, maxLength = 10000): string {
  if (typeof input !== "string") return "";
  return input
    .slice(0, maxLength)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:text\/html/gi, "");
}

/** Validate UUID format */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

// Cleanup stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of loginAttempts.entries()) {
    if (now - entry.firstAttempt > LOGIN_WINDOW_MS && entry.lockedUntil < now) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);
