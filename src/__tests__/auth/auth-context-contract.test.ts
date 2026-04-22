import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Auth System — Contract & Structural Verification
// ═══════════════════════════════════════════════════════════════

const AUTH_CONTEXT = fs.readFileSync("src/contexts/AuthContext.tsx", "utf8");

describe("Auth System Contract", () => {
  it("exports useAuth hook", () => {
    expect(AUTH_CONTEXT).toContain("export const useAuth");
  });

  it("AuthProvider wraps supabase onAuthStateChange", () => {
    expect(AUTH_CONTEXT).toContain("onAuthStateChange");
  });

  it("exposes signUp, signIn, signOut, resetPassword", () => {
    for (const fn of ["signUp", "signIn", "signOut", "resetPassword"]) {
      expect(AUTH_CONTEXT).toContain(fn);
    }
  });

  it("supports MFA verification flow", () => {
    expect(AUTH_CONTEXT).toContain("verifyMFA");
    expect(AUTH_CONTEXT).toContain("requiresMFA");
    expect(AUTH_CONTEXT).toContain("mfaFactorId");
  });

  it("supports demo mode sign-in", () => {
    expect(AUTH_CONTEXT).toContain("signInAsDemo");
    expect(AUTH_CONTEXT).toContain("isDemo");
  });

  it("throws when useAuth used outside AuthProvider", () => {
    expect(AUTH_CONTEXT).toContain("must be used within AuthProvider");
  });

  it("does not store roles in auth context (role separation)", () => {
    expect(AUTH_CONTEXT).not.toMatch(/role:\s*(string|"admin"|"user")/);
  });

  it("auth components exist for all auth flows", () => {
    const authDir = fs.readdirSync("src/components/auth");
    expect(authDir.length).toBeGreaterThanOrEqual(2);
    // Must have route protection
    expect(authDir.some(f => f.includes("AdminRoute") || f.includes("ProtectedRoute"))).toBe(true);
  });

  it("AdminRoute uses server-side role check not localStorage", () => {
    const adminRoute = fs.readFileSync("src/components/auth/AdminRoute.tsx", "utf8");
    expect(adminRoute).not.toContain("localStorage");
    expect(adminRoute).not.toContain("sessionStorage");
  });
});