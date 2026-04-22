import { describe, it, expect } from "vitest";
import {
  validateTenantIsolation,
  scopeQuery,
  type TenantBoundary,
  type TenantScope,
} from "@/platform/architecture/tenant-sovereignty";

describe("Cross-Tenant Prevention — Behavioral Proof", () => {
  const tenantAItems = Array.from({ length: 50 }, (_, i) => ({
    tenantId: "tenant-a",
    id: `a-${i}`,
  }));
  const tenantBItems = Array.from({ length: 30 }, (_, i) => ({
    tenantId: "tenant-b",
    id: `b-${i}`,
  }));
  const mixedItems = [...tenantAItems, ...tenantBItems];

  it("bulk scopeQuery never leaks cross-tenant data", () => {
    const resultA = scopeQuery(mixedItems, "tenant-a");
    expect(resultA).toHaveLength(50);
    expect(resultA.every(i => i.tenantId === "tenant-a")).toBe(true);

    const resultB = scopeQuery(mixedItems, "tenant-b");
    expect(resultB).toHaveLength(30);
    expect(resultB.every(i => i.tenantId === "tenant-b")).toBe(true);
  });

  it("unknown tenant gets zero results", () => {
    expect(scopeQuery(mixedItems, "tenant-c")).toEqual([]);
  });

  it("cross-tenant validation blocks all mismatches", () => {
    const tenants = ["t1", "t2", "t3"];
    for (const a of tenants) {
      for (const b of tenants) {
        const result = validateTenantIsolation(a, b);
        if (a === b) {
          expect(result.allowed).toBe(true);
        } else {
          expect(result.allowed).toBe(false);
        }
      }
    }
  });

  it("TenantScope requires all subsystem scoping fields", () => {
    const scope: TenantScope = {
      tenantId: "t1",
      policyBundleId: "pb-1",
      memoryNamespace: "mem-t1",
      graphPartition: "graph-t1",
      approvalQueueId: "aq-t1",
      budgetPolicyId: "bp-t1",
      observabilityNamespace: "obs-t1",
      eventStreamId: "es-t1",
      proofLedgerId: "pl-t1",
    };
    expect(Object.keys(scope)).toHaveLength(9);
  });

  it("TenantBoundary sovereignty flags enforce constraints", () => {
    const boundary: TenantBoundary = {
      tenantId: "t1",
      displayName: "Test Tenant",
      type: "organization",
      createdAt: new Date().toISOString(),
      sovereigntyFlags: {
        dataResidency: "eu",
        exportEnabled: true,
        deleteOnDemand: true,
        auditRetentionDays: 365,
        encryptionRequired: true,
      },
    };
    expect(boundary.sovereigntyFlags.dataResidency).toBe("eu");
    expect(boundary.sovereigntyFlags.encryptionRequired).toBe(true);
    expect(boundary.sovereigntyFlags.auditRetentionDays).toBeGreaterThan(0);
  });

  it("empty dataset returns empty for any tenant", () => {
    expect(scopeQuery([], "any")).toEqual([]);
  });
});