import { describe, it, expect } from "vitest";
import {
  hasScope,
  isOwnerOrAdmin,
  validateSession,
  isPermissionActive,
  DEFAULT_AUTH_POLICY,
  type AuthSession,
  type AuthScope,
  type PermissionGrant,
} from "@/packages/auth";
import {
  getAuthState,
  getAllAuthStates,
  refreshToken,
  revokeAuth,
} from "@/lib/services/connector-control-plane/connector-auth.service";

describe("Auth Package Contracts", () => {
  it("exports all required types and functions", () => {
    expect(DEFAULT_AUTH_POLICY).toBeDefined();
    expect(hasScope).toBeDefined();
    expect(isOwnerOrAdmin).toBeDefined();
    expect(validateSession).toBeDefined();
    expect(isPermissionActive).toBeDefined();
  });

  it("hasScope returns true for full scope", () => {
    const session = { scopes: ["full"] } as AuthSession;
    expect(hasScope(session, "read-only")).toBe(true);
  });

  it("hasScope returns false when scope missing", () => {
    const session = { scopes: ["read-only"] } as AuthSession;
    expect(hasScope(session, "domain")).toBe(false);
  });

  it("isOwnerOrAdmin identifies roles correctly", () => {
    expect(isOwnerOrAdmin({ role: "owner" } as AuthSession)).toBe(true);
    expect(isOwnerOrAdmin({ role: "admin" } as AuthSession)).toBe(true);
    expect(isOwnerOrAdmin({ role: "member" } as AuthSession)).toBe(false);
  });

  it("validateSession detects expired sessions", () => {
    const session: AuthSession = {
      userId: "1", email: "a@b.com", role: "owner", scopes: ["full"],
      deviceId: "d1", trustedDevice: true, expiresAt: Date.now() - 1000,
    };
    const result = validateSession(session);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("expired");
  });

  it("validateSession detects untrusted devices", () => {
    const session: AuthSession = {
      userId: "1", email: "a@b.com", role: "owner", scopes: ["full"],
      deviceId: "d1", trustedDevice: false, expiresAt: Date.now() + 60000,
    };
    const result = validateSession(session);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("device-untrusted");
  });

  it("validateSession detects scope insufficiency", () => {
    const session: AuthSession = {
      userId: "1", email: "a@b.com", role: "member", scopes: ["read-only"],
      deviceId: "d1", trustedDevice: true, expiresAt: Date.now() + 60000,
    };
    const result = validateSession(session, "domain");
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("scope-insufficient");
  });

  it("validateSession returns valid for good session", () => {
    const session: AuthSession = {
      userId: "1", email: "a@b.com", role: "owner", scopes: ["full"],
      deviceId: "d1", trustedDevice: true, expiresAt: Date.now() + 60000,
    };
    const result = validateSession(session);
    expect(result.valid).toBe(true);
    expect(result.remainingMs).toBeGreaterThan(0);
  });

  it("isPermissionActive handles grants", () => {
    expect(isPermissionActive({ expiresAt: Date.now() + 60000 } as PermissionGrant)).toBe(true);
    expect(isPermissionActive({ expiresAt: Date.now() - 1000 } as PermissionGrant)).toBe(false);
    expect(isPermissionActive({} as PermissionGrant)).toBe(true);
  });

  it("DEFAULT_AUTH_POLICY has sensible defaults", () => {
    expect(DEFAULT_AUTH_POLICY.requireMFA).toBe(false);
    expect(DEFAULT_AUTH_POLICY.maxDevices).toBeGreaterThan(0);
    expect(DEFAULT_AUTH_POLICY.sessionDurationMs).toBeGreaterThan(0);
    expect(DEFAULT_AUTH_POLICY.sensitiveActionReauth).toBe(true);
  });
});

describe("Connector Auth Service", () => {
  it("getAllAuthStates returns default connectors", () => {
    const states = getAllAuthStates();
    expect(states.length).toBeGreaterThan(0);
    const ids = states.map((s: any) => s.connectorId);
    expect(ids).toContain("gmail");
    expect(ids).toContain("crm");
  });

  it("refreshToken updates expiry", () => {
    const result = refreshToken("gmail");
    expect(result).not.toBeNull();
    expect(result!.status).toBe("valid");
    expect(result!.authenticated).toBe(true);
  });

  it("revokeAuth marks connector as revoked", () => {
    revokeAuth("calendar");
    const state = getAuthState("calendar");
    expect(state?.status).toBe("revoked");
    expect(state?.authenticated).toBe(false);
  });

  it("returns undefined for unknown connector", () => {
    expect(getAuthState("nonexistent")).toBeUndefined();
  });
});
