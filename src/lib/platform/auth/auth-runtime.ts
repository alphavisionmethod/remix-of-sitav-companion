// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Auth Runtime Contract
// Layer 3 · Identity / session / MFA / trusted-device truth
// Companion doc: docs/architecture/AUTH_AND_IDENTITY_RUNTIME.md
// ═══════════════════════════════════════════════════════════════

export type AuthMethod =
  | "password"
  | "magic-link"
  | "oauth-google"
  | "oauth-apple"
  | "passkey"
  | "sso-saml"
  | "phone-otp";

export type AuthFactor = "password" | "totp" | "passkey" | "sms" | "email" | "biometric";

export type SessionPlane =
  | "user"           // standard end-user session
  | "admin"          // admin/operator session (requires MFA)
  | "owner"          // owner-only highest-trust session
  | "connector"      // service-to-service connector session
  | "support";       // support assist (delegated, time-boxed)

export type SessionState =
  | "active"
  | "elevated"       // recently re-authenticated for sensitive op
  | "stale"          // valid but not recently active
  | "revoked"
  | "expired"
  | "locked";

export type TrustedDeviceClass =
  | "personal-primary"
  | "personal-secondary"
  | "shared-trusted"
  | "kiosk"
  | "untrusted";

export interface AuthRuntimeContract {
  readonly methodId: AuthMethod;
  readonly displayName: string;
  readonly factorsRequired: readonly AuthFactor[];
  readonly factorsOptional: readonly AuthFactor[];
  readonly issuesPlane: SessionPlane;
  readonly defaultSessionTtlMinutes: number;
  readonly elevationTtlMinutes: number;
  readonly requiresTrustedDevice: boolean;
  readonly minimumDeviceClass: TrustedDeviceClass;
  readonly recoveryFlow: "self-serve" | "support-required" | "owner-only";
}

export const AUTH_RUNTIME_CONTRACTS: readonly AuthRuntimeContract[] = [
  {
    methodId: "password",
    displayName: "Email + Password",
    factorsRequired: ["password"],
    factorsOptional: ["totp", "passkey"],
    issuesPlane: "user",
    defaultSessionTtlMinutes: 60 * 24 * 7,
    elevationTtlMinutes: 15,
    requiresTrustedDevice: false,
    minimumDeviceClass: "untrusted",
    recoveryFlow: "self-serve",
  },
  {
    methodId: "magic-link",
    displayName: "Email Magic Link",
    factorsRequired: ["email"],
    factorsOptional: ["passkey"],
    issuesPlane: "user",
    defaultSessionTtlMinutes: 60 * 24,
    elevationTtlMinutes: 10,
    requiresTrustedDevice: false,
    minimumDeviceClass: "untrusted",
    recoveryFlow: "self-serve",
  },
  {
    methodId: "oauth-google",
    displayName: "Sign in with Google",
    factorsRequired: ["password"],
    factorsOptional: ["totp"],
    issuesPlane: "user",
    defaultSessionTtlMinutes: 60 * 24 * 7,
    elevationTtlMinutes: 15,
    requiresTrustedDevice: false,
    minimumDeviceClass: "untrusted",
    recoveryFlow: "self-serve",
  },
  {
    methodId: "passkey",
    displayName: "Passkey (WebAuthn)",
    factorsRequired: ["passkey"],
    factorsOptional: [],
    issuesPlane: "user",
    defaultSessionTtlMinutes: 60 * 24 * 14,
    elevationTtlMinutes: 30,
    requiresTrustedDevice: true,
    minimumDeviceClass: "personal-secondary",
    recoveryFlow: "self-serve",
  },
  {
    methodId: "sso-saml",
    displayName: "SAML SSO",
    factorsRequired: ["password"],
    factorsOptional: ["totp", "passkey"],
    issuesPlane: "user",
    defaultSessionTtlMinutes: 60 * 8,
    elevationTtlMinutes: 15,
    requiresTrustedDevice: false,
    minimumDeviceClass: "untrusted",
    recoveryFlow: "support-required",
  },
  {
    methodId: "phone-otp",
    displayName: "Phone OTP",
    factorsRequired: ["sms"],
    factorsOptional: ["password"],
    issuesPlane: "user",
    defaultSessionTtlMinutes: 60 * 24,
    elevationTtlMinutes: 10,
    requiresTrustedDevice: false,
    minimumDeviceClass: "untrusted",
    recoveryFlow: "support-required",
  },
] as const;

/** Admin and owner planes always require an additional MFA factor on top of base auth. */
export const ADMIN_PLANE_REQUIRED_FACTORS: readonly AuthFactor[] = ["passkey", "totp"] as const;
export const OWNER_PLANE_REQUIRED_FACTORS: readonly AuthFactor[] = ["passkey"] as const;

export interface ResolvedAuthRequirement {
  readonly methodId: AuthMethod;
  readonly factors: readonly AuthFactor[];
  readonly mustBeTrustedDevice: boolean;
  readonly minimumDeviceClass: TrustedDeviceClass;
  readonly sessionTtlMinutes: number;
}

export function resolveAuthRequirement(
  methodId: AuthMethod,
  targetPlane: SessionPlane,
): ResolvedAuthRequirement | null {
  const base = AUTH_RUNTIME_CONTRACTS.find((c) => c.methodId === methodId);
  if (!base) return null;

  const extra: AuthFactor[] =
    targetPlane === "owner" ? [...OWNER_PLANE_REQUIRED_FACTORS]
    : targetPlane === "admin" ? [...ADMIN_PLANE_REQUIRED_FACTORS]
    : [];

  const factors = Array.from(new Set([...base.factorsRequired, ...extra]));
  const mustTrusted = base.requiresTrustedDevice || targetPlane === "admin" || targetPlane === "owner";
  const minClass: TrustedDeviceClass =
    targetPlane === "owner" ? "personal-primary"
    : targetPlane === "admin" ? "personal-secondary"
    : base.minimumDeviceClass;

  return {
    methodId,
    factors,
    mustBeTrustedDevice: mustTrusted,
    minimumDeviceClass: minClass,
    sessionTtlMinutes: targetPlane === "admin" ? Math.min(base.defaultSessionTtlMinutes, 60 * 8) : base.defaultSessionTtlMinutes,
  };
}

export function getAuthContract(methodId: AuthMethod): AuthRuntimeContract | undefined {
  return AUTH_RUNTIME_CONTRACTS.find((c) => c.methodId === methodId);
}
