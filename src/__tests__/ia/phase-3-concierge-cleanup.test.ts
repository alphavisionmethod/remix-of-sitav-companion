// ═══════════════════════════════════════════════════════════════
// IA Phase 3 — Concierge cleanup ratchet
// Anchors:
//   • src/platform/ia/module-ia-manifest.ts (CONCIERGE_IA)
//   • src/platform/sita/components/sita/apps/concierge/ConciergeAppShell.tsx
//   • src/routes/families/os-routes.tsx
//   • src/routes/redirects/user-redirect-map.ts
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { CONCIERGE_IA, findDescriptor } from "@/platform/ia/module-ia-manifest";
import { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";

const ROOT = process.cwd();
const SHELL = fs.readFileSync(
  path.join(ROOT, "src/platform/sita/components/sita/apps/concierge/ConciergeAppShell.tsx"),
  "utf8",
);
const OS_ROUTES = fs.readFileSync(
  path.join(ROOT, "src/routes/families/os-routes.tsx"),
  "utf8",
);

describe("IA / Phase 3 — Concierge cleanup ratchet", () => {
  it("canonical Workspace-suffixed components are ga in the manifest", () => {
    const expectations: Array<[string, string]> = [
      ["life-admin", "LifeAdminWorkspace"],
      ["household", "HouseholdWorkspace"],
    ];
    for (const [id, component] of expectations) {
      const d = findDescriptor("concierge", id);
      expect(d, `manifest missing concierge/${id}`).toBeDefined();
      expect(d!.component).toBe(component);
      expect(d!.status).toBe("ga");
    }
  });

  it("orphan root surfaces are archived in the manifest", () => {
    for (const id of ["boardroom-legacy", "life-dashboard", "personal-life-workspace"]) {
      const d = findDescriptor("concierge", id);
      expect(d, `archived descriptor missing: ${id}`).toBeDefined();
      expect(d!.role).toBe("archived");
      expect(d!.status).toBe("archived");
      expect(d!.sidebarVisible).toBe(false);
      expect(d!.route).toBeNull();
    }
  });

  it("ConciergeAppShell imports the canonical Workspace components (not the legacy *Center)", () => {
    expect(SHELL).toMatch(/lazy\(\(\) => import\(["']@\/pages\/concierge\/LifeAdminWorkspace["']\)\)/);
    expect(SHELL).toMatch(/lazy\(\(\) => import\(["']@\/pages\/concierge\/HouseholdWorkspace["']\)\)/);
    expect(SHELL).not.toMatch(/import\(["']@\/pages\/concierge\/LifeAdminCenter["']\)/);
    expect(SHELL).not.toMatch(/import\(["']@\/pages\/concierge\/HouseholdCommandCenter["']\)/);
  });

  it("ConciergeAppShell PAGE_COMPONENTS map mounts the new canonical aliases", () => {
    expect(SHELL).toMatch(/"life-admin":\s*LifeAdminWorkspace/);
    expect(SHELL).toMatch(/household:\s*HouseholdWorkspace/);
  });

  it("os-routes.tsx no longer mounts the orphan /life and /personal-life routes", () => {
    expect(OS_ROUTES).not.toMatch(/path="\/life"\s+element=\{<LifeDashboard/);
    expect(OS_ROUTES).not.toMatch(/path="\/personal-life"\s+element=\{<PersonalLifeWorkspace/);
    expect(OS_ROUTES).not.toMatch(/import\(["']@\/pages\/LifeDashboard["']\)/);
    expect(OS_ROUTES).not.toMatch(/import\(["']@\/pages\/PersonalLifeWorkspace["']\)/);
  });

  it("user-redirect-map promotes /life and /personal-life into the Concierge shell", () => {
    const findRedirect = (from: string) => USER_REDIRECTS.find((r) => r.from === from);
    const life = findRedirect("/life");
    expect(life, "missing /life redirect").toBeDefined();
    expect(life!.to).toBe("/concierge/overview");
    const personal = findRedirect("/personal-life");
    expect(personal, "missing /personal-life redirect").toBeDefined();
    expect(personal!.to).toBe("/concierge/overview");
  });

  it("CONCIERGE_IA total count grows to ≥ 22 after Phase 3 archives", () => {
    expect(CONCIERGE_IA.length).toBeGreaterThanOrEqual(22);
  });
});