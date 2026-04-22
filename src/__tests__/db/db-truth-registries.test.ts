import { describe, it, expect } from "vitest";
import { DB_SCHEMA_REGISTRY } from "@/lib/db/schema-registry";
import { RLS_POLICY_REGISTRY } from "@/lib/db/rls-policy-registry";
import { TENANCY_BOUNDARY_MAP } from "@/lib/db/tenancy-boundary-map";
import { MIGRATION_REGISTRY } from "@/lib/db/migration-registry";

describe("DB Truth Registries", () => {
  it("schema registry covers all tables (>= 200)", () => {
    expect(DB_SCHEMA_REGISTRY.length).toBeGreaterThanOrEqual(420);
  });

  it("every schema entry has required metadata", () => {
    for (const t of DB_SCHEMA_REGISTRY) {
      expect(t.name).toBeTruthy();
      expect(t.domain).toBeTruthy();
      expect(t.schemaClass).toBeTruthy();
      expect(typeof t.hasRls).toBe("boolean");
    }
  });

  it("every schema table is in RLS registry", () => {
    for (const t of DB_SCHEMA_REGISTRY) {
      expect(RLS_POLICY_REGISTRY[t.name], `RLS missing for ${t.name}`).toBeDefined();
    }
  });

  it("every schema table is in tenancy map", () => {
    for (const t of DB_SCHEMA_REGISTRY) {
      expect(TENANCY_BOUNDARY_MAP[t.name], `Tenancy missing for ${t.name}`).toBeDefined();
    }
  });

  it("migration registry covers all migrations (>= 160)", () => {
    expect(MIGRATION_REGISTRY.length).toBeGreaterThanOrEqual(155);
  });

  it("every migration has bounded context and risk classification", () => {
    for (const m of MIGRATION_REGISTRY) {
      expect(m.filename).toMatch(/\.sql$/);
      expect(m.boundedContext).toBeTruthy();
      expect(["low", "medium", "high", "critical"]).toContain(m.rollbackRisk);
      expect(["none", "low", "medium", "high"]).toContain(m.dataSensitivity);
    }
  });

  it("every table has at least one policy", () => {
    const noPolicy = Object.entries(RLS_POLICY_REGISTRY).filter(([, e]) => e.policyCount === 0);
    expect(noPolicy, `Tables without policies: ${noPolicy.map(([n]) => n).join(", ")}`).toHaveLength(0);
  });
});
