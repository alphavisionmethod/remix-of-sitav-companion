// ═══════════════════════════════════════════════════════════════
// IA Phase 5 — Shell-vs-Route Boundary Test
// Wraps scripts/architecture/checks/check-shell-route-boundary.ts.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import {
  ALL_IA_DESCRIPTORS,
  findDescriptor,
} from "@/platform/ia/module-ia-manifest";
import {
  ROUTE_FORBIDDEN_ROLES,
  ROUTE_REQUIRED_ROLES,
  classifyRouteRequirement,
} from "@/platform/ia/page-role";

const SCRIPT = "scripts/architecture/checks/check-shell-route-boundary.ts";

describe("IA / Phase 5 — Shell-vs-Route boundary rules", () => {
  it("validator script exists", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
  });

  it("every ROUTE_FORBIDDEN descriptor has descriptor.route === null", () => {
    const offenders = ALL_IA_DESCRIPTORS.filter(
      (d) => ROUTE_FORBIDDEN_ROLES.has(d.role) && d.route !== null,
    );
    expect(
      offenders,
      `internal/archived descriptors must NOT have a route:\n${offenders
        .map((d) => `  ${d.pillar}/${d.id} → ${d.route}`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("every ROUTE_REQUIRED descriptor either has descriptor.route or documents the in-shell exception", () => {
    const offenders = ALL_IA_DESCRIPTORS.filter((d) => {
      if (!ROUTE_REQUIRED_ROLES.has(d.role)) return false;
      if (d.route !== null) return false;
      // Allow entity-scoped rooms / explicit in-shell-only documented surfaces
      return !/entity[- ]scoped|opened from a (?:Deal|Customer|Account)|in-shell only|sub-tab|no public deep-link by design/i.test(
        d.notes ?? "",
      );
    });
    expect(
      offenders,
      `route-required descriptors missing both route and rationale:\n${offenders
        .map((d) => `  ${d.pillar}/${d.id} role=${d.role}`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("Phase 4 descriptors classify correctly", () => {
    const wealth = findDescriptor("finance", "wealth-command")!;
    expect(classifyRouteRequirement(wealth)).toBe("forbidden");
    const allocation = findDescriptor("finance", "capital-allocation")!;
    expect(classifyRouteRequirement(allocation)).toBe("required");
    expect(allocation.route).not.toBeNull();
  });

  it("Phase 2 demoted descriptors classify correctly", () => {
    const impact = findDescriptor("business", "revenue-impact")!;
    expect(classifyRouteRequirement(impact)).toBe("forbidden");
    expect(impact.route).toBeNull();
  });

  it("validator script exits 0 (boundary is clean)", () => {
    let exitCode = 0;
    let output = "";
    try {
      output = execSync(`npx tsx ${SCRIPT}`, {
        stdio: "pipe",
        timeout: 60_000,
      }).toString();
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
      exitCode = err.status ?? 1;
      output = `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`;
    }
    expect(exitCode, output.slice(0, 1500)).toBe(0);
  }, 90_000);
});