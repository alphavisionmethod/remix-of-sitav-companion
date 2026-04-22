import { describe, it, expect } from "vitest";
import { TENANT_ISOLATION_REGISTRY } from "@/lib/db/tenant-isolation-map";
import { TENANCY_BOUNDARY_MAP } from "@/lib/db/tenancy-boundary-map";
import { RLS_POLICY_REGISTRY } from "@/lib/db/rls-policy-registry";

describe("Tenant Isolation Map — Registry Integrity", () => {
  it("has entries for all tables in TENANCY_BOUNDARY_MAP", () => {
    const boundaryTables = Object.keys(TENANCY_BOUNDARY_MAP);
    const registryTables = TENANT_ISOLATION_REGISTRY.map(e => e.table);
    for (const t of boundaryTables) {
      expect(registryTables, `Missing: ${t}`).toContain(t);
    }
  });

  it("every entry has a valid isolationMechanism", () => {
    const valid = ["rls-user-id", "rls-org-id", "rls-tenant-id", "rls-admin", "rls-service-role", "global-no-tenant"];
    for (const e of TENANT_ISOLATION_REGISTRY) {
      expect(valid, `Invalid mechanism for ${e.table}: ${e.isolationMechanism}`).toContain(e.isolationMechanism);
    }
  });

  it("rls-user-id entries map to user_id-based tenancy", () => {
    const userIdEntries = TENANT_ISOLATION_REGISTRY.filter(e => e.isolationMechanism === "rls-user-id");
    for (const e of userIdEntries) {
      const boundary = TENANCY_BOUNDARY_MAP[e.table];
      expect(
        ["user_id", "actor_user_id", "owner_id"],
        `${e.table} has model=${boundary?.model}`
      ).toContain(boundary?.model);
    }
  });

  it("global-no-tenant entries map to global model", () => {
    const globals = TENANT_ISOLATION_REGISTRY.filter(e => e.isolationMechanism === "global-no-tenant");
    for (const e of globals) {
      const boundary = TENANCY_BOUNDARY_MAP[e.table];
      expect(boundary?.model).toBe("global");
    }
  });

  it("verified flag matches RLS registry presence", () => {
    for (const e of TENANT_ISOLATION_REGISTRY) {
      const hasRls = RLS_POLICY_REGISTRY[e.table] !== undefined;
      expect(e.verified, `${e.table} verified=${e.verified} but RLS=${hasRls}`).toBe(hasRls);
    }
  });

  it("no duplicate table entries", () => {
    const tables = TENANT_ISOLATION_REGISTRY.map(e => e.table);
    expect(new Set(tables).size).toBe(tables.length);
  });
});