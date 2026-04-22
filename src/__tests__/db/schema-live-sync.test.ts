import { describe, it, expect } from "vitest";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";
import { RLS_POLICY_REGISTRY } from "@/lib/db/rls-policy-registry";
import { TENANCY_BOUNDARY_MAP } from "@/lib/db/tenancy-boundary-map";

/**
 * Schema Registry ↔ Live DB Synchronization Tests
 * Validates that all three registries are internally consistent.
 */
describe("Schema-Registry Synchronization", () => {
  const schemaNames = new Set(DB_SCHEMA_REGISTRY.map((t) => t.name));
  const rlsNames = new Set(Object.keys(RLS_POLICY_REGISTRY));
  const tenancyNames = new Set(Object.keys(TENANCY_BOUNDARY_MAP));

  it("schema registry has >= 420 tables", () => {
    expect(DB_SCHEMA_REGISTRY.length).toBeGreaterThanOrEqual(420);
  });

  it("RLS registry covers all schema tables", () => {
    const missing = [...schemaNames].filter((n) => !rlsNames.has(n));
    expect(
      missing,
      `In schema but not RLS: ${missing.join(", ")}`
    ).toHaveLength(0);
  });

  it("tenancy map covers all schema tables", () => {
    const missing = [...schemaNames].filter((n) => !tenancyNames.has(n));
    expect(
      missing,
      `In schema but not tenancy: ${missing.join(", ")}`
    ).toHaveLength(0);
  });

  it("no phantom entries in RLS registry (not in schema)", () => {
    const phantom = [...rlsNames].filter((n) => !schemaNames.has(n));
    expect(
      phantom,
      `In RLS but not schema: ${phantom.join(", ")}`
    ).toHaveLength(0);
  });

  it("no phantom entries in tenancy map (not in schema)", () => {
    const phantom = [...tenancyNames].filter((n) => !schemaNames.has(n));
    expect(
      phantom,
      `In tenancy but not schema: ${phantom.join(", ")}`
    ).toHaveLength(0);
  });

  it("policy counts in schema match RLS registry", () => {
    const mismatches: string[] = [];
    for (const t of DB_SCHEMA_REGISTRY) {
      const rls = RLS_POLICY_REGISTRY[t.name];
      if (rls && rls.policyCount !== t.policyCount) {
        mismatches.push(
          `${t.name}: schema=${t.policyCount} rls=${rls.policyCount}`
        );
      }
    }
    expect(
      mismatches,
      `Policy count mismatches:\n${mismatches.join("\n")}`
    ).toHaveLength(0);
  });

  it("tenancy columns align with schema tenancy columns", () => {
    const mismatches: string[] = [];
    for (const t of DB_SCHEMA_REGISTRY) {
      const boundary = TENANCY_BOUNDARY_MAP[t.name];
      if (!boundary) continue;
      if (t.tenancyColumn && boundary.tenantKey !== t.tenancyColumn) {
        mismatches.push(
          `${t.name}: schema=${t.tenancyColumn} tenancy=${boundary.tenantKey}`
        );
      }
    }
    expect(
      mismatches,
      `Tenancy column mismatches:\n${mismatches.join("\n")}`
    ).toHaveLength(0);
  });
});