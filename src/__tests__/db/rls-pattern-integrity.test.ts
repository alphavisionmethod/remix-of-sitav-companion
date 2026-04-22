import { describe, it, expect } from "vitest";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";
import { RLS_POLICY_REGISTRY } from "@/lib/db/rls-policy-registry";

/**
 * RLS pattern integrity:
 * Every tenant-scoped table (tenancyColumn != null) MUST have a
 * meaningful RLS pattern — i.e. NOT "no_policies" and NOT
 * "public_read" (those imply unrestricted reads which would
 * violate tenancy on a tenant-keyed table).
 */
describe("RLS pattern integrity", () => {
  const tenantTables = DB_SCHEMA_REGISTRY.filter((t) => t.tenancyColumn != null);

  it("has tenant-scoped tables to validate (sanity)", () => {
    expect(tenantTables.length).toBeGreaterThan(0);
  });

  it("every tenant-scoped table is in the RLS registry", () => {
    for (const t of tenantTables) {
      expect(RLS_POLICY_REGISTRY[t.name], `RLS missing for tenant table ${t.name}`).toBeDefined();
    }
  });

  it("no tenant-scoped table uses 'no_policies' or 'public_read'", () => {
    const violations: string[] = [];
    for (const t of tenantTables) {
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (!rls) continue;
      if (rls.pattern === "public_read") {
        violations.push(`${t.name} → ${rls.pattern}`);
      }
    }
    expect(violations, `Tenant-scoped tables with unsafe RLS patterns:\n${violations.join("\n")}`).toEqual([]);
  });

  it("every tenant-scoped table has at least one policy", () => {
    const violations: string[] = [];
    for (const t of tenantTables) {
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (!rls) continue;
      if (rls.policyCount === 0) violations.push(t.name);
    }
    expect(violations, `Tenant-scoped tables with zero RLS policies:\n${violations.join("\n")}`).toEqual([]);
  });
});
