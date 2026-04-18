// ═══════════════════════════════════════════════════════════════
// SITA OS — Platform Service: Session Lifecycle Registry
// Layer 3 · Auth · Session state machine + revocation surfaces
// ═══════════════════════════════════════════════════════════════

import type { SessionPlane, SessionState, AuthMethod } from "./auth-runtime";

export type SessionEvent =
  | "issued"
  | "refreshed"
  | "elevated"
  | "downgraded"
  | "marked-stale"
  | "revoked"
  | "expired"
  | "locked"
  | "unlocked";

export interface SessionTransition {
  readonly from: SessionState;
  readonly event: SessionEvent;
  readonly to: SessionState;
  readonly emitsReceipt: boolean;
  readonly remediation: string | null;
}

export const SESSION_TRANSITIONS: readonly SessionTransition[] = [
  { from: "active",   event: "elevated",     to: "elevated", emitsReceipt: true,  remediation: null },
  { from: "elevated", event: "downgraded",   to: "active",   emitsReceipt: false, remediation: null },
  { from: "active",   event: "marked-stale", to: "stale",    emitsReceipt: false, remediation: "User must re-prove activity" },
  { from: "stale",    event: "refreshed",    to: "active",   emitsReceipt: false, remediation: null },
  { from: "active",   event: "revoked",      to: "revoked",  emitsReceipt: true,  remediation: "User must sign in again" },
  { from: "elevated", event: "revoked",      to: "revoked",  emitsReceipt: true,  remediation: "User must sign in again" },
  { from: "active",   event: "expired",      to: "expired",  emitsReceipt: true,  remediation: "Session TTL exceeded" },
  { from: "active",   event: "locked",       to: "locked",   emitsReceipt: true,  remediation: "Owner / support unlock required" },
  { from: "locked",   event: "unlocked",     to: "active",   emitsReceipt: true,  remediation: null },
] as const;

export interface SessionRegistryEntry {
  readonly plane: SessionPlane;
  readonly displayName: string;
  readonly issuedBy: readonly AuthMethod[];
  readonly maxConcurrentSessions: number;
  readonly idleTimeoutMinutes: number;
  readonly absoluteTimeoutMinutes: number;
  readonly elevationRequiredFor: readonly string[]; // capability keys
  readonly killSwitchTarget: string | null;
}

export const SESSION_REGISTRY: readonly SessionRegistryEntry[] = [
  {
    plane: "user",
    displayName: "Standard User Session",
    issuedBy: ["password", "magic-link", "oauth-google", "oauth-apple", "passkey", "phone-otp"],
    maxConcurrentSessions: 8,
    idleTimeoutMinutes: 60 * 24,
    absoluteTimeoutMinutes: 60 * 24 * 7,
    elevationRequiredFor: ["finance.transfer", "settings.security", "files.bulk-delete"],
    killSwitchTarget: null,
  },
  {
    plane: "admin",
    displayName: "Admin / Operator Session",
    issuedBy: ["password", "passkey", "sso-saml"],
    maxConcurrentSessions: 3,
    idleTimeoutMinutes: 30,
    absoluteTimeoutMinutes: 60 * 8,
    elevationRequiredFor: ["system.kill_switch", "users.manage", "ai-runtime.config"],
    killSwitchTarget: "admin-session-kill",
  },
  {
    plane: "owner",
    displayName: "Owner Session (Highest Trust)",
    issuedBy: ["passkey"],
    maxConcurrentSessions: 2,
    idleTimeoutMinutes: 15,
    absoluteTimeoutMinutes: 60 * 4,
    elevationRequiredFor: ["owner.transfer-control", "owner.kill-switch.global", "owner.sovereign-export"],
    killSwitchTarget: "owner-session-kill",
  },
  {
    plane: "connector",
    displayName: "Connector / Service Session",
    issuedBy: ["sso-saml"],
    maxConcurrentSessions: 32,
    idleTimeoutMinutes: 60 * 24,
    absoluteTimeoutMinutes: 60 * 24 * 30,
    elevationRequiredFor: [],
    killSwitchTarget: "connector-session-kill",
  },
  {
    plane: "support",
    displayName: "Support Assist Session (Delegated)",
    issuedBy: ["password", "passkey"],
    maxConcurrentSessions: 1,
    idleTimeoutMinutes: 15,
    absoluteTimeoutMinutes: 60,
    elevationRequiredFor: [],
    killSwitchTarget: "support-session-kill",
  },
] as const;

export function getSessionEntry(plane: SessionPlane): SessionRegistryEntry | undefined {
  return SESSION_REGISTRY.find((e) => e.plane === plane);
}

export function transitionSession(from: SessionState, event: SessionEvent): SessionState | null {
  const t = SESSION_TRANSITIONS.find((x) => x.from === from && x.event === event);
  return t ? t.to : null;
}

export function requiresElevation(plane: SessionPlane, capabilityKey: string): boolean {
  const entry = getSessionEntry(plane);
  if (!entry) return false;
  return entry.elevationRequiredFor.includes(capabilityKey);
}
