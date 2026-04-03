// ═══════════════════════════════════════════════════════════════
// SITA OS — Auth Package
// ═══════════════════════════════════════════════════════════════

export type AuthRole = "owner" | "admin" | "member" | "viewer" | "guest";
export type AuthScope = "full" | "domain" | "read-only" | "approval-only";

export interface AuthSession {
  userId: string;
  email: string;
  role: AuthRole;
  scopes: AuthScope[];
  deviceId: string;
  trustedDevice: boolean;
  expiresAt: number;
  refreshToken?: string;
}

export interface AuthPolicy {
  requireMFA: boolean;
  sessionDurationMs: number;
  maxDevices: number;
  allowedDomains: string[];
  sensitiveActionReauth: boolean;
}

export interface DeviceTrust {
  deviceId: string;
  deviceName: string;
  trusted: boolean;
  lastSeen: number;
  trustScore: number;
  location?: string;
}

export const DEFAULT_AUTH_POLICY: AuthPolicy = {
  requireMFA: false,
  sessionDurationMs: 86400000 * 7,
  maxDevices: 5,
  allowedDomains: [],
  sensitiveActionReauth: true,
};

export const hasScope = (session: AuthSession, scope: AuthScope): boolean =>
  session.scopes.includes("full") || session.scopes.includes(scope);

export const isOwnerOrAdmin = (session: AuthSession): boolean =>
  session.role === "owner" || session.role === "admin";

// ── MFA Contracts ───────────────────────────────────────────

export type MFAMethod = "totp" | "sms" | "email" | "webauthn";

export interface MFAChallenge {
  readonly challengeId: string;
  readonly method: MFAMethod;
  readonly issuedAt: number;
  readonly expiresAt: number;
  readonly userId: string;
}

export interface MFAVerification {
  readonly challengeId: string;
  readonly verified: boolean;
  readonly verifiedAt: number;
  readonly method: MFAMethod;
  readonly deviceId: string;
}

// ── Session Validation ──────────────────────────────────────

export interface SessionValidationResult {
  readonly valid: boolean;
  readonly reason?: "expired" | "revoked" | "device-untrusted" | "scope-insufficient";
  readonly remainingMs?: number;
}

export const validateSession = (session: AuthSession, requiredScope?: AuthScope): SessionValidationResult => {
  const now = Date.now();
  if (now >= session.expiresAt) return { valid: false, reason: "expired" };
  if (!session.trustedDevice) return { valid: false, reason: "device-untrusted" };
  if (requiredScope && !hasScope(session, requiredScope)) return { valid: false, reason: "scope-insufficient" };
  return { valid: true, remainingMs: session.expiresAt - now };
};

// ── Device Fingerprint ──────────────────────────────────────

export interface DeviceFingerprint {
  readonly deviceId: string;
  readonly userAgent: string;
  readonly screenResolution: string;
  readonly timezone: string;
  readonly language: string;
  readonly hash: string;
}

// ── Auth Audit ──────────────────────────────────────────────

export type AuthAuditAction = "login" | "logout" | "mfa-challenge" | "mfa-verify" | "session-refresh" | "device-trust-change" | "scope-change" | "password-reset";

export interface AuthAuditEntry {
  readonly id: string;
  readonly userId: string;
  readonly action: AuthAuditAction;
  readonly deviceId: string;
  readonly ipAddress?: string;
  readonly timestamp: number;
  readonly success: boolean;
  readonly metadata?: Record<string, unknown>;
}

// ── Permission Grants ───────────────────────────────────────

export interface PermissionGrant {
  readonly grantId: string;
  readonly userId: string;
  readonly scope: AuthScope;
  readonly grantedBy: string;
  readonly grantedAt: number;
  readonly expiresAt?: number;
  readonly reason: string;
}

export const isPermissionActive = (grant: PermissionGrant): boolean =>
  !grant.expiresAt || Date.now() < grant.expiresAt;
