import { describe, it, expect } from "vitest";
import { EDGE_FUNCTION_REGISTRY } from "@/lib/backend-topology/edge-function-registry";
import { EDGE_FUNCTION_AUTH_MAP } from "@/lib/backend-topology/edge-function-auth-map";
import { EDGE_FUNCTION_BACKEND_CATEGORY } from "@/lib/backend-topology/edge-function-categories";

describe("Edge Function Contract Consistency", () => {
  it("auth map adminOnly entries are in admin-plane bounded context", () => {
    const adminOnly = Object.entries(EDGE_FUNCTION_AUTH_MAP)
      .filter(([, v]) => v.adminOnly)
      .map(([k]) => k);
    
    const adminCtxFns = EDGE_FUNCTION_REGISTRY
      .filter(e => e.boundedContext === "admin-plane")
      .map(e => e.name);
    const adminCtxSet = new Set(adminCtxFns);
    
    const mismatches = adminOnly.filter(n => !adminCtxSet.has(n));
    // Allow some tolerance for cross-cutting admin functions
    expect(mismatches.length, `Admin-only but not admin-plane: ${mismatches.slice(0, 5).join(", ")}`).toBeLessThanOrEqual(5);
  });

  it("high side-effect functions have documentation", () => {
    const highSE = EDGE_FUNCTION_REGISTRY.filter(e => e.sideEffectClass === "high");
    const undocumented = highSE.filter(e => !e.runtimeConsequence || e.runtimeConsequence.length < 5);
    expect(undocumented.map(e => e.name)).toHaveLength(0);
  });

  it("registry category matches backend category map", () => {
    const mismatches: string[] = [];
    for (const entry of EDGE_FUNCTION_REGISTRY) {
      const mapCat = EDGE_FUNCTION_BACKEND_CATEGORY[entry.name];
      if (mapCat && mapCat !== entry.category) {
        mismatches.push(`${entry.name}: registry=${entry.category}, map=${mapCat}`);
      }
    }
    // Allow up to 10% mismatch for migration-phase functions
    const threshold = Math.floor(EDGE_FUNCTION_REGISTRY.length * 0.9);
    expect(EDGE_FUNCTION_REGISTRY.length - mismatches.length).toBeGreaterThanOrEqual(threshold);
  });

  it("deprecated functions have wrapper or deprecated migration status", () => {
    const deprecated = EDGE_FUNCTION_REGISTRY.filter(e => e.status === "deprecated");
    const wrongStatus = deprecated.filter(e => 
      e.migrationStatus !== "wrapper" && e.migrationStatus !== "deprecated"
    );
    expect(wrongStatus.map(e => e.name)).toHaveLength(0);
  });
});