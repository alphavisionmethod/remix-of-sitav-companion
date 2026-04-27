// ═══════════════════════════════════════════════════════════════
// IA Phase 6 — Archive layout ratchet
// Ensures every page archived as part of Phase 6 lives under the
// canonical _archived/ folder of its module, that no live shell
// imports it, and that the manifest descriptor is consistent.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  ALL_IA_DESCRIPTORS,
  findDescriptor,
} from "@/platform/ia/module-ia-manifest";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");
const exists = (rel: string) => fs.existsSync(path.join(ROOT, rel));

interface ArchivedPage {
  pillar: "business" | "concierge" | "finance";
  /** PascalCase component / file basename (no .tsx) */
  component: string;
  /** Manifest descriptor id, if there is one */
  descriptorId?: string;
  /** Legacy shim path that must still re-export from _archived */
  legacyShim?: string;
}

const ARCHIVED: ArchivedPage[] = [
  { pillar: "business",  component: "RevenueImpactDashboard", descriptorId: "revenue-impact",         legacyShim: "src/pages/business/RevenueImpactDashboard.tsx" },
  { pillar: "business",  component: "RevenueCallingPage",                                              legacyShim: "src/pages/RevenueCallingPage.tsx" },
  { pillar: "concierge", component: "LifeDashboard",          descriptorId: "life-dashboard",          legacyShim: "src/pages/LifeDashboard.tsx" },
  { pillar: "concierge", component: "PersonalLifeWorkspace",  descriptorId: "personal-life-workspace", legacyShim: "src/pages/PersonalLifeWorkspace.tsx" },
  { pillar: "concierge", component: "ConciergeBoardroom",     descriptorId: "boardroom-legacy",        legacyShim: "src/pages/concierge/ConciergeBoardroom.tsx" },
  { pillar: "finance",   component: "WealthCommandCenter",    descriptorId: "wealth-command",          legacyShim: "src/pages/WealthCommandCenter.tsx" },
];

const SHELL_FILES = {
  business:  "src/platform/sita/components/sita/apps/business/BusinessAppShell.tsx",
  concierge: "src/platform/sita/components/sita/apps/concierge/ConciergeAppShell.tsx",
  finance:   "src/platform/sita/components/sita/apps/finance/FinanceAppShell.tsx",
} as const;

describe("IA / Phase 6 — Archive layout ratchet", () => {
  it("every archived page file lives under <pillar>/pages/_archived/", () => {
    const missing: string[] = [];
    for (const p of ARCHIVED) {
      const archivedPath = `src/modules/${p.pillar}/pages/_archived/${p.component}.tsx`;
      if (!exists(archivedPath)) missing.push(archivedPath);
    }
    expect(missing, `missing archived files:\n${missing.join("\n")}`).toEqual([]);
  });

  it("no archived page remains at the canonical (non-_archived) module path", () => {
    const stillThere: string[] = [];
    for (const p of ARCHIVED) {
      const canonicalPath = `src/modules/${p.pillar}/pages/${p.component}.tsx`;
      if (exists(canonicalPath)) stillThere.push(canonicalPath);
    }
    expect(stillThere, `archived files still at canonical path:\n${stillThere.join("\n")}`).toEqual([]);
  });

  it("legacy shims (if present) re-export from the _archived path", () => {
    const broken: string[] = [];
    for (const p of ARCHIVED) {
      if (!p.legacyShim) continue;
      if (!exists(p.legacyShim)) continue; // shim removed entirely is fine
      const text = read(p.legacyShim);
      if (!text.includes(`/pages/_archived/${p.component}`)) {
        broken.push(`${p.legacyShim} does not re-export from _archived/${p.component}`);
      }
    }
    expect(broken, broken.join("\n")).toEqual([]);
  });

  it("no live AppShell imports an archived page from the canonical path", () => {
    const violations: string[] = [];
    for (const p of ARCHIVED) {
      const shellText = read(SHELL_FILES[p.pillar]);
      const canonicalImportRx = new RegExp(
        `import\\(["']@/(?:modules/${p.pillar}/pages|pages(?:/${p.pillar})?)/${p.component}["']\\)`,
      );
      if (canonicalImportRx.test(shellText)) {
        violations.push(`${p.pillar} shell still imports ${p.component} from canonical path`);
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("each archived page that has a manifest descriptor is marked role=archived", () => {
    const offenders: string[] = [];
    for (const p of ARCHIVED) {
      if (!p.descriptorId) continue;
      const d = findDescriptor(p.pillar, p.descriptorId);
      if (!d) {
        offenders.push(`${p.pillar}/${p.descriptorId} descriptor missing entirely`);
        continue;
      }
      if (d.role !== "archived") offenders.push(`${p.pillar}/${p.descriptorId} role=${d.role} (expected 'archived')`);
      if (d.status !== "archived") offenders.push(`${p.pillar}/${p.descriptorId} status=${d.status} (expected 'archived')`);
      if (d.sidebarVisible !== false) offenders.push(`${p.pillar}/${p.descriptorId} sidebarVisible=true (expected false)`);
      if (d.route !== null) offenders.push(`${p.pillar}/${p.descriptorId} route=${d.route} (expected null)`);
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  it("useRoutePrefetch no longer prefetches the archived LifeDashboard chunk", () => {
    const prefetch = read("src/hooks/useRoutePrefetch.ts");
    expect(prefetch).not.toMatch(/import\(["']@\/pages\/LifeDashboard["']\)/);
  });

  it("ALL_IA_DESCRIPTORS contains at least the 4 manifest-tracked archived entries", () => {
    const archived = ALL_IA_DESCRIPTORS.filter((d) => d.status === "archived");
    expect(archived.length).toBeGreaterThanOrEqual(4);
  });
});