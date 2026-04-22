import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Permissions & RBAC — Structural Verification
// ═══════════════════════════════════════════════════════════════

describe("Permission System", () => {
  it("admin_role_permissions table exists in schema", () => {
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    expect(types).toContain("admin_role_permissions");
  });

  it("has_role function is used in App.tsx (not localStorage)", () => {
    const app = fs.readFileSync("src/App.tsx", "utf8");
    expect(app).toContain("has_role");
    expect(app).not.toContain("localStorage.getItem(\"role\"");
  });

  it("AdminRoute component exists for route protection", () => {
    expect(fs.existsSync("src/components/auth/AdminRoute.tsx")).toBe(true);
  });

  it("PermissionGatedRoute or equivalent exists", () => {
    const hasGate = fs.existsSync("src/components/auth/PermissionGatedRoute.tsx") ||
      fs.existsSync("src/components/sita/shell/AppPermissionGate.tsx");
    expect(hasGate).toBe(true);
  });

  it("admin sessions table exists for session management", () => {
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    expect(types).toContain("admin_sessions");
  });

  it("action audit table exists for admin action tracking", () => {
    const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");
    expect(types).toContain("admin_action_audit");
  });
});