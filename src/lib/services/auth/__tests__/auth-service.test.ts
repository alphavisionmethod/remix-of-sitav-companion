import { describe, it, expect } from "vitest";
import { AuthService } from "../index";

describe("AuthService", () => {
  it("creates a session", () => {
    const svc = new AuthService();
    const session = svc.createSession("u1", "test@test.com", "admin", "dev1");
    expect(session.userId).toBe("u1");
    expect(session.email).toBe("test@test.com");
    expect(session.mfaVerified).toBe(false);
    expect(session.trustLevel).toBe("standard");
  });

  it("validates active session", () => {
    const svc = new AuthService();
    svc.createSession("u1", "test@test.com", "admin", "dev1");
    expect(svc.validateSession("u1")).toBe(true);
  });

  it("returns false for non-existent session", () => {
    const svc = new AuthService();
    expect(svc.validateSession("nonexistent")).toBe(false);
  });

  it("revokes session", () => {
    const svc = new AuthService();
    svc.createSession("u1", "test@test.com", "admin", "dev1");
    expect(svc.revokeSession("u1")).toBe(true);
    expect(svc.validateSession("u1")).toBe(false);
  });

  it("verifies MFA and elevates trust", () => {
    const svc = new AuthService();
    svc.createSession("u1", "test@test.com", "admin", "dev1");
    expect(svc.verifyMFA("u1")).toBe(true);
    const session = svc.getSession("u1");
    expect(session?.mfaVerified).toBe(true);
    expect(session?.trustLevel).toBe("elevated");
  });

  it("elevates trust to custom level", () => {
    const svc = new AuthService();
    svc.createSession("u1", "test@test.com", "admin", "dev1");
    svc.elevateTrust("u1", "critical");
    expect(svc.getSession("u1")?.trustLevel).toBe("critical");
  });

  it("lists active sessions", () => {
    const svc = new AuthService();
    svc.createSession("u1", "a@a.com", "admin", "d1");
    svc.createSession("u2", "b@b.com", "user", "d2");
    expect(svc.getActiveSessions().length).toBe(2);
  });

  it("serializes and hydrates", () => {
    const svc = new AuthService();
    svc.createSession("u1", "a@a.com", "admin", "d1");
    const state = svc.serialize();
    const svc2 = new AuthService();
    svc2.hydrate(state);
    expect(svc2.getSession("u1")?.email).toBe("a@a.com");
  });
});
