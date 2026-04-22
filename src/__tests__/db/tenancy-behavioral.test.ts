import { describe, it, expect } from "vitest";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";
import { TENANCY_BOUNDARY_MAP } from "@/lib/db/tenancy-boundary-map";
import { RLS_POLICY_REGISTRY } from "@/lib/db/rls-policy-registry";

/**
 * Tenancy Boundary Behavioral Tests
 * Validates tenant-scoped tables have proper isolation.
 */
describe("Tenancy Boundary Behavioral Verification", () => {
  const tenantTables = Object.entries(TENANCY_BOUNDARY_MAP).filter(
    ([, e]) => e.tenantKey !== null
  );

  it("has tenant-scoped tables to validate (> 200)", () => {
    expect(tenantTables.length).toBeGreaterThan(200);
  });

  it("every tenant-scoped table exists in schema registry", () => {
    const schemaNames = new Set(DB_SCHEMA_REGISTRY.map((t) => t.name));
    const missing = tenantTables.filter(([name]) => !schemaNames.has(name));
    expect(
      missing.map(([n]) => n),
      `Tenant tables not in schema: ${missing.map(([n]) => n).join(", ")}`
    ).toHaveLength(0);
  });

  it("every tenant-scoped table has matching schema tenancy column", () => {
    const mismatches: string[] = [];
    for (const [name, boundary] of tenantTables) {
      const schema = DB_SCHEMA_REGISTRY.find((t) => t.name === name);
      if (!schema) continue;
      if (schema.tenancyColumn !== boundary.tenantKey) {
        mismatches.push(
          `${name}: boundary=${boundary.tenantKey} schema=${schema.tenancyColumn}`
        );
      }
    }
    expect(mismatches).toHaveLength(0);
  });

  it("tenant-scoped tables have RLS policies", () => {
    const noPol: string[] = [];
    for (const [name] of tenantTables) {
      const rls = RLS_POLICY_REGISTRY[name];
      if (!rls || rls.policyCount === 0) noPol.push(name);
    }
    expect(
      noPol,
      `Tenant tables without policies: ${noPol.join(", ")}`
    ).toHaveLength(0);
  });

  it("no tenant table has crossTenantPolicy=deny with public_read pattern", () => {
    const violations: string[] = [];
    for (const [name, boundary] of tenantTables) {
      if (boundary.crossTenantPolicy !== "deny") continue;
      const rls = RLS_POLICY_REGISTRY[name];
      if (rls && rls.pattern === "public_read") {
        violations.push(name);
      }
    }
    expect(violations).toHaveLength(0);
  });

  it("global tables have no tenancy column set", () => {
    const globalTables = Object.entries(TENANCY_BOUNDARY_MAP).filter(
      ([, e]) => e.model === "global"
    );
    const violations = globalTables.filter(([, e]) => e.tenantKey !== null);
    expect(
      violations.map(([n]) => n),
      `Global tables with tenant key: ${violations.map(([n]) => n).join(", ")}`
    ).toHaveLength(0);
  });
});