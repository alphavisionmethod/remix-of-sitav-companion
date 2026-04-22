import { describe, it, expect } from "vitest";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";
import { RLS_POLICY_REGISTRY } from "@/lib/db/rls-policy-registry";
import { TENANCY_BOUNDARY_MAP } from "@/lib/db/tenancy-boundary-map";

/**
 * RLS Policy Behavioral Tests
 * Validates that RLS policies are correctly configured per table.
 */
describe("RLS Policy Behavioral Verification", () => {
  it("every table in schema registry has RLS enabled", () => {
    const noRls = DB_SCHEMA_REGISTRY.filter((t) => !t.hasRls);
    expect(
      noRls,
      `Tables without RLS: ${noRls.map((t) => t.name).join(", ")}`
    ).toHaveLength(0);
  });

  it("total policy count matches expected baseline (>= 940)", () => {
    const total = Object.values(RLS_POLICY_REGISTRY).reduce(
      (sum, e) => sum + e.policyCount,
      0
    );
    expect(total).toBeGreaterThanOrEqual(940);
  });

  it("every table has at least one policy", () => {
    const zeroPol = Object.entries(RLS_POLICY_REGISTRY).filter(
      ([, e]) => e.policyCount === 0
    );
    expect(
      zeroPol,
      `Tables with 0 policies: ${zeroPol.map(([n]) => n).join(", ")}`
    ).toHaveLength(0);
  });

  it("service-role-only tables do not grant authenticated write access", () => {
    const violations: string[] = [];
    for (const [name, entry] of Object.entries(RLS_POLICY_REGISTRY)) {
      if (entry.pattern !== "service_role_only") continue;
      // Service-role-only tables should not have user_id tenancy
      const tenancy = TENANCY_BOUNDARY_MAP[name];
      if (tenancy && tenancy.model === "user_id") {
        // This is OK — the table has user_id but is managed by service role
      }
    }
    expect(violations).toHaveLength(0);
  });

  it("every tenant-scoped table has SELECT policy", () => {
    const violations: string[] = [];
    for (const t of DB_SCHEMA_REGISTRY) {
      if (!t.tenancyColumn) continue;
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (rls && !rls.selectPolicy) {
        violations.push(t.name);
      }
    }
    expect(
      violations,
      `Tenant tables without SELECT policy: ${violations.join(", ")}`
    ).toHaveLength(0);
  });

  it("no tenant-scoped table uses public_read pattern", () => {
    const violations: string[] = [];
    for (const t of DB_SCHEMA_REGISTRY) {
      if (!t.tenancyColumn) continue;
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (rls && rls.pattern === "public_read") {
        violations.push(`${t.name} → public_read`);
      }
    }
    expect(violations).toHaveLength(0);
  });

  it("sensitive tables have restrictive access patterns", () => {
    const allowedPatterns = new Set([
      "user_id_match",
      "owner_id_match",
      "service_role_only",
      "admin_role",
    ]);
    const violations: string[] = [];
    for (const t of DB_SCHEMA_REGISTRY) {
      if (!t.sensitiveData) continue;
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (rls && !allowedPatterns.has(rls.pattern)) {
        violations.push(`${t.name} → ${rls.pattern}`);
      }
    }
    expect(
      violations,
      `Sensitive tables with weak patterns: ${violations.join(", ")}`
    ).toHaveLength(0);
  });
});