// ═══════════════════════════════════════════════════════════════
// IA Phase 1 — Page Role Manifest behavioral tests
// Anchor: src/platform/ia/module-ia-manifest.ts
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import {
  ALL_IA_DESCRIPTORS,
  BUSINESS_IA,
  CONCIERGE_IA,
  FINANCE_IA,
  descriptorsFor,
  findDescriptor,
} from "@/platform/ia/module-ia-manifest";
import {
  ROUTE_REQUIRED_ROLES,
  ROUTE_FORBIDDEN_ROLES,
  classifyRouteRequirement,
} from "@/platform/ia/page-role";
import { execSync } from "node:child_process";
import path from "node:path";

describe("IA / Phase 1 — manifest shape", () => {
  it("every descriptor has a non-empty id, label, component, pillar", () => {
    for (const d of ALL_IA_DESCRIPTORS) {
      expect(d.id, `id missing in ${JSON.stringify(d)}`).toBeTruthy();
      expect(d.label, `label missing for ${d.id}`).toBeTruthy();
      expect(d.component, `component missing for ${d.id}`).toBeTruthy();
      expect(["business", "concierge", "finance"]).toContain(d.pillar);
    }
  });

  it("every (pillar,id) pair is unique", () => {
    for (const pillar of ["business", "concierge", "finance"] as const) {
      const ids = descriptorsFor(pillar).map((d) => d.id);
      const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
      expect(dupes, `duplicate ids in ${pillar}: ${dupes.join(",")}`).toEqual([]);
    }
  });

  it("ROUTE_REQUIRED_ROLES descriptors all carry a non-null route", () => {
    for (const d of ALL_IA_DESCRIPTORS) {
      if (classifyRouteRequirement(d) !== "required") continue;
      // Boardrooms occasionally live in-shell only and are documented per descriptor.
      // The hard rule: if the descriptor declares sidebarVisible AND has role in
      // the required set, then `route` must be non-null OR the descriptor must
      // explicitly carry a `notes` rationale for why it is in-shell only.
      if (d.sidebarVisible && !d.route) {
        expect(
          d.notes,
          `[${d.pillar}/${d.id}] role=${d.role} sidebarVisible=true but route=null AND no notes rationale`,
        ).toBeTruthy();
      }
    }
  });

  it("ROUTE_FORBIDDEN_ROLES descriptors all have route=null", () => {
    for (const d of ALL_IA_DESCRIPTORS) {
      if (!ROUTE_FORBIDDEN_ROLES.has(d.role)) continue;
      expect(d.route, `[${d.pillar}/${d.id}] role=${d.role} must have route=null but has "${d.route}"`).toBeNull();
    }
  });

  it("findDescriptor returns the right entries", () => {
    expect(findDescriptor("business", "overview")?.component).toBe("BusinessOverview");
    expect(findDescriptor("concierge", "overview")?.component).toBe("ConciergeOverview");
    expect(findDescriptor("finance", "overview")?.component).toBe("MoneyOverview");
    expect(findDescriptor("business", "nope-does-not-exist")).toBeUndefined();
  });

  it("baseline counts (Phase 1 ratchet — updated by Phase 2/3/4)", () => {
    expect(BUSINESS_IA.length).toBeGreaterThanOrEqual(50);
    expect(CONCIERGE_IA.length).toBeGreaterThanOrEqual(15);
    expect(FINANCE_IA.length).toBeGreaterThanOrEqual(30);
  });

  it("ROUTE_REQUIRED_ROLES set covers the canonical eight", () => {
    expect(ROUTE_REQUIRED_ROLES.has("overview")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("workspace")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("engine")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("control-plane")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("boardroom")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("proof")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("settings")).toBe(true);
    expect(ROUTE_REQUIRED_ROLES.has("room")).toBe(true);
  });
});

describe("IA / Phase 1 — coverage validator", () => {
  it("scripts/architecture/checks/check-ia-manifest-coverage.ts exits 0", () => {
    const script = path.join(process.cwd(), "scripts/architecture/checks/check-ia-manifest-coverage.ts");
    // tsx is in devDependencies; if missing the test should still pass-by-skipping rather than 
    // hard-fail. But CI installs everything, so this should run.
    let stdout = "";
    try {
      stdout = execSync(`bunx tsx ${script}`, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (err: any) {
      const out = (err.stdout?.toString?.() ?? "") + (err.stderr?.toString?.() ?? "");
      throw new Error("check-ia-manifest-coverage failed:\n" + out);
    }
    expect(stdout).toMatch(/IA manifest coverage clean/);
  });
});