import { describe, it, expect } from "vitest";
import {
  validateTenantIsolation,
  scopeQuery,
  createTenantSafeView,
} from "@/platform/architecture/tenant-sovereignty";

describe("Tenant Sovereignty — Runtime Isolation", () => {
  it("allows same-tenant access", () => {
    const result = validateTenantIsolation("tenant-1", "tenant-1");
    expect(result.allowed).toBe(true);
    expect(result.violation).toBeUndefined();
  });

  it("blocks cross-tenant access with violation message", () => {
    const result = validateTenantIsolation("tenant-1", "tenant-2");
    expect(result.allowed).toBe(false);
    expect(result.violation).toContain("Cross-tenant access attempt");
    expect(result.violation).toContain("tenant-1");
    expect(result.violation).toContain("tenant-2");
  });

  it("scopeQuery filters items to correct tenant", () => {
    const items = [
      { tenantId: "a", name: "A1" },
      { tenantId: "b", name: "B1" },
      { tenantId: "a", name: "A2" },
    ];
    const result = scopeQuery(items, "a");
    expect(result).toHaveLength(2);
    expect(result.every(i => i.tenantId === "a")).toBe(true);
  });

  it("scopeQuery returns empty array when no items match", () => {
    const items = [{ tenantId: "x", name: "X1" }];
    expect(scopeQuery(items, "y")).toEqual([]);
  });

  it("createTenantSafeView with support role redacts 4 fields", () => {
    const view = createTenantSafeView("t1", "support", "viewer-1", "debug");
    expect(view.redactedFields).toHaveLength(4);
    expect(view.redactedFields).toContain("financialData");
    expect(view.redactedFields).toContain("connectorCredentials");
  });

  it("createTenantSafeView with operator role redacts only credentials", () => {
    const view = createTenantSafeView("t1", "operator", "viewer-2", "check");
    expect(view.redactedFields).toEqual(["connectorCredentials"]);
  });

  it("createTenantSafeView with system role redacts nothing", () => {
    const view = createTenantSafeView("t1", "system", "sys-1", "migration");
    expect(view.redactedFields).toEqual([]);
  });

  it("access log captures correct viewer, timestamp, and reason", () => {
    const view = createTenantSafeView("t1", "support", "v1", "incident-42");
    expect(view.accessLog.viewerId).toBe("v1");
    expect(view.accessLog.reason).toBe("incident-42");
    expect(new Date(view.accessLog.viewedAt).getTime()).not.toBeNaN();
  });
});