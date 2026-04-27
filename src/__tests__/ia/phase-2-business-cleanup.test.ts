// ═══════════════════════════════════════════════════════════════
// IA Phase 2 — Business cleanup ratchet
// Anchors:
//   • src/platform/ia/module-ia-manifest.ts (BUSINESS_IA)
//   • src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx
//   • src/routes/families/business-routes.tsx
//   • src/routes/redirects/user-redirect-map.ts
//
// This file is the regression seal for Phase 2. If any of these
// invariants regress, the cleanup is leaking and the test fails.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { BUSINESS_IA, findDescriptor } from "@/platform/ia/module-ia-manifest";
import { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";

const ROOT = process.cwd();

const SHELL = fs.readFileSync(
  path.join(ROOT, "src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx"),
  "utf8",
);
const ROUTES = fs.readFileSync(
  path.join(ROOT, "src/routes/families/business-routes.tsx"),
  "utf8",
);

describe("IA / Phase 2 — Business cleanup ratchet", () => {
  it("canonical Workspace-suffixed components exist in the manifest as `ga`", () => {
    const expectations: Array<[string, string]> = [
      ["follow-through", "FollowThroughWorkspace"],
      ["support", "SupportWorkspace"],
      ["opportunities", "OpportunitiesWorkspace"],
      ["collections", "CollectionsWorkspace"],
      ["communications", "CommunicationsWorkspace"],
      ["integrations", "CRMIntegrations"],
      ["crm-import", "CRMImport"],
      ["background-tasks", "BackgroundTasks"],
    ];
    for (const [id, component] of expectations) {
      const d = findDescriptor("business", id);
      expect(d, `manifest missing business/${id}`).toBeDefined();
      expect(d!.component).toBe(component);
      expect(d!.status).toBe("ga");
    }
  });

  it("revenue-autopilot-console is the canonical control-plane and replaces autopilot-hub", () => {
    const console = findDescriptor("business", "revenue-autopilot-console");
    expect(console, "revenue-autopilot-console descriptor missing").toBeDefined();
    expect(console!.role).toBe("control-plane");
    expect(console!.component).toBe("RevenueAutopilotConsole");
    expect(console!.route).toBe("/business/revenue-autopilot-console");
    expect(console!.status).toBe("ga");

    const legacy = findDescriptor("business", "autopilot-hub");
    expect(legacy, "legacy autopilot-hub descriptor must remain (status=legacy)").toBeDefined();
    expect(legacy!.status).toBe("legacy");
    expect(legacy!.sidebarVisible).toBe(false);
    expect(legacy!.replacedBy).toBe("revenue-autopilot-console");
    expect(legacy!.route).toBeNull();
  });

  it("revenue-impact has been demoted to internal+sidebar-hidden", () => {
    const ri = findDescriptor("business", "revenue-impact");
    expect(ri).toBeDefined();
    expect(ri!.role).toBe("internal");
    expect(ri!.sidebarVisible).toBe(false);
    expect(ri!.route).toBeNull();
    expect(ri!.replacedBy).toBe("revenue-home");
  });

  it("BusinessAppShell.tsx imports the canonical Workspace components (not the legacy *Center/*Hub names)", () => {
    // Imports must reference the canonical names.
    const canonicalImports = [
      "FollowThroughWorkspace",
      "SupportWorkspace",
      "OpportunitiesWorkspace",
      "CollectionsWorkspace",
      "CommunicationsWorkspace",
      "CRMIntegrations",
      "CRMImport",
      "BackgroundTasks",
      "RevenueAutopilotConsole",
    ];
    for (const sym of canonicalImports) {
      expect(
        SHELL,
        `BusinessAppShell.tsx must import ${sym} from @/pages/business/${sym}`,
      ).toMatch(new RegExp(`import\\s+${sym}\\s+from\\s+["']@/pages/business/${sym}["']`));
    }

    // Legacy class-name imports must NOT exist anymore.
    const bannedImports = [
      "FollowThroughCenter",
      "CustomerSupportCenter",
      "OpportunitiesCenter",
      "CollectionsCommandCenter",
      "CommunicationsCenter",
      "CRMIntegrationHub",
      "CRMImportCenter",
      "BackgroundTaskCenter",
      "AutopilotHub",
      "RevenueImpactDashboard",
    ];
    for (const sym of bannedImports) {
      expect(
        SHELL,
        `BusinessAppShell.tsx must NOT import the legacy symbol ${sym}`,
      ).not.toMatch(new RegExp(`import\\s+${sym}\\s+from`));
    }
  });

  it("sidebar groups no longer reference the demoted/renamed slugs", () => {
    // The legacy slug should no longer appear as a sidebar item id.
    expect(SHELL).not.toMatch(/\{\s*id:\s*"autopilot-hub",\s*label:/);
    // Revenue Impact must be removed from the Intelligence sidebar group.
    expect(SHELL).not.toMatch(/\{\s*id:\s*"revenue-impact",\s*label:/);
    // Canonical control-plane must be present.
    expect(SHELL).toMatch(/\{\s*id:\s*"revenue-autopilot-console",\s*label:\s*"Autopilot Console"/);
  });

  it("BusinessAppShell PAGE map mounts the new canonical slug AND keeps autopilot-hub for back-compat", () => {
    expect(SHELL).toMatch(/"revenue-autopilot-console":\s*RevenueAutopilotConsole/);
    expect(SHELL).toMatch(/"autopilot-hub":\s*RevenueAutopilotConsole/);
    // revenue-impact must NOT appear in the page map anymore (demoted).
    expect(SHELL).not.toMatch(/"revenue-impact":\s*RevenueImpactDashboard/);
  });

  it("business-routes.tsx declares the new canonical route", () => {
    expect(ROUTES).toMatch(/path="\/business\/revenue-autopilot-console"/);
    // legacy /business/autopilot-hub must remain (mapped to BusinessCenter; redirect map promotes URL)
    expect(ROUTES).toMatch(/path="\/business\/autopilot-hub"/);
    expect(ROUTES).toMatch(/path="\/business\/revenue-impact"/);
  });

  it("user-redirect-map promotes legacy URLs to canonical Phase 2 destinations", () => {
    const findRedirect = (from: string) =>
      USER_REDIRECTS.find((r) => r.from === from);

    const autopilot = findRedirect("/business/autopilot-hub");
    expect(autopilot, "missing autopilot-hub redirect").toBeDefined();
    expect(autopilot!.to).toBe("/business/revenue-autopilot-console");

    const ri = findRedirect("/business/revenue-impact");
    expect(ri, "missing revenue-impact redirect").toBeDefined();
    expect(ri!.to).toBe("/business/revenue");
  });

  it("BUSINESS_IA total count grows to ≥ 51 after Phase 2 (added revenue-autopilot-console)", () => {
    expect(BUSINESS_IA.length).toBeGreaterThanOrEqual(51);
  });
});