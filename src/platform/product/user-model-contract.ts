// ═══════════════════════════════════════════════════════════════
// SITA OS — Canonical User Model Contract
// Single source of truth for user identity across all domains.
// References: AuthContext, auth package, admin-rbac.
// ═══════════════════════════════════════════════════════════════

import type { AuthRole, AuthScope } from "@/packages/auth";
import type { DeploymentProfileKey } from "@/platform/architecture/route-plane-map";

// ── Canonical Persona ──────────────────────────────────────────

export type UserPersona =
  | "owner"           // business owner / founder
  | "operator"        // admin / support / fleet operator
  | "team-member"     // invited collaborator
  | "viewer"          // read-only stakeholder
  | "guest";          // unauthenticated or limited-access

// ── Entity Scope ────────────────────────────────────────────────

export interface EntityScope {
  readonly accountId: string;
  readonly orgId?: string;
  readonly workspaceId?: string;
  readonly entityDisplayName: string;
}

// ── Session Context ─────────────────────────────────────────────

export interface SessionContext {
  readonly sessionId: string;
  readonly deviceId: string;
  readonly trustedDevice: boolean;
  readonly mfaVerified: boolean;
  readonly loginMethod: "password" | "oauth" | "magic-link" | "sso";
  readonly expiresAt: number;
}

// ── Canonical User Identity ─────────────────────────────────────

export interface CanonicalUser {
  readonly authId: string;
  readonly email: string;
  readonly displayName: string;
  readonly avatarUrl?: string;

  // Role & Persona
  readonly role: AuthRole;
  readonly persona: UserPersona;
  readonly scopes: readonly AuthScope[];

  // Entity
  readonly entity: EntityScope;

  // Deployment
  readonly deploymentProfile: DeploymentProfileKey;

  // Session
  readonly session: SessionContext;

  // Settings ownership key (user-level settings namespace)
  readonly settingsNamespace: string;

  // Permissions (resolved, flattened set of permission keys)
  readonly permissions: ReadonlySet<string>;
}

// ── Helpers ─────────────────────────────────────────────────────

export function isOperator(user: CanonicalUser): boolean {
  return user.deploymentProfile === "operator" || user.role === "admin" || user.role === "owner";
}

export function hasPermission(user: CanonicalUser, key: string): boolean {
  return user.permissions.has(key);
}

export function personaFromRole(role: AuthRole): UserPersona {
  switch (role) {
    case "owner": return "owner";
    case "admin": return "operator";
    case "member": return "team-member";
    case "viewer": return "viewer";
    case "guest": return "guest";
  }
}