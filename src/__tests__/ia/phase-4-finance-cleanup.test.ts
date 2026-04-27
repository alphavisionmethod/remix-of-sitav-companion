// ═══════════════════════════════════════════════════════════════
// IA Phase 4 — Finance / Investment cleanup ratchet
// Anchors:
//   • src/platform/ia/module-ia-manifest.ts (FINANCE_IA)
//   • src/routes/families/money-routes.tsx
//   • src/routes/families/investment-routes.tsx
//   • src/routes/families/investment-office-routes.tsx
//   • src/routes/families/experimental-routes.tsx
//   • src/routes/families/os-routes.tsx
//   • src/routes/redirects/user-redirect-map.ts
//   • src/platform/architecture/context-membership-map.ts
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FINANCE_IA, findDescriptor } from "@/platform/ia/module-ia-manifest";
import { USER_REDIRECTS } from "@/routes/redirects/user-redirect-map";

const ROOT = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const FAMILIES_DIR = "src/routes/families";
const FAMILY_FILES = [
  "experimental-routes.tsx",
  "investment-routes.tsx",
  "investment-office-routes.tsx",
  "money-routes.tsx",
  "os-routes.tsx",
];

describe("IA / Phase 4 — Finance & Investment cleanup ratchet", () => {
  it("FINANCE_IA contains the Phase 4 non-shell descriptors", () => {
    const onboarding = findDescriptor("finance", "money-onboarding");
    expect(onboarding, "missing money-onboarding descriptor").toBeDefined();
    expect(onboarding!.role).toBe("workspace");
    expect(onboarding!.sidebarVisible).toBe(false);
    expect(onboarding!.route).toBe("/money/onboarding");

    const capital = findDescriptor("finance", "capital-allocation");
    expect(capital, "missing capital-allocation descriptor").toBeDefined();
    expect(capital!.status).toBe("legacy");
    expect(capital!.route).toBe("/capital-allocation");
    expect(capital!.replacedBy).toBe("allocator");

    const wealth = findDescriptor("finance", "wealth-command");
    expect(wealth, "missing wealth-command descriptor").toBeDefined();
    expect(wealth!.role).toBe("archived");
    expect(wealth!.status).toBe("archived");
    expect(wealth!.route).toBeNull();
    expect(wealth!.sidebarVisible).toBe(false);
    expect(wealth!.replacedBy).toBe("overview");
  });

  it("/wealth-command route is no longer mounted in os-routes", () => {
    const osRoutes = read("src/routes/families/os-routes.tsx");
    expect(osRoutes).not.toMatch(/path="\/wealth-command"/);
    expect(osRoutes).not.toMatch(/import\(["']@\/pages\/WealthCommandCenter["']\)/);
  });

  it("context-membership-map drops the orphan /wealth-command binding", () => {
    const ctxMap = read("src/platform/architecture/context-membership-map.ts");
    expect(ctxMap).not.toMatch(/identifier:\s*"\/wealth-command"/);
  });

  it("no plural /investments/* paths remain in any route family", () => {
    const PLURAL_RX = /path\s*=\s*["'`]\/investments(?:\/|["'`])/;
    const offenders: Array<{ file: string; line: number; text: string }> = [];
    for (const file of FAMILY_FILES) {
      const full = path.join(FAMILIES_DIR, file);
      if (!fs.existsSync(full)) continue;
      const lines = fs.readFileSync(full, "utf8").split("\n");
      for (let i = 0; i < lines.length; i += 1) {
        if (PLURAL_RX.test(lines[i])) {
          offenders.push({ file, line: i + 1, text: lines[i].trim() });
        }
      }
    }
    expect(
      offenders,
      `Plural namespace leaks:\n${offenders.map((o) => `  ${o.file}:${o.line} ${o.text}`).join("\n")}`,
    ).toEqual([]);
  });

  it("every canonical /investment/* route has a corresponding plural redirect", () => {
    const investment = read("src/routes/families/investment-routes.tsx");
    const investmentOffice = read("src/routes/families/investment-office-routes.tsx");
    const pathRx = /path="(\/investment\/[a-z][\w-]*(?:\/:[\w?]+)?)"/g;
    const collected = new Set<string>();
    for (const src of [investment, investmentOffice]) {
      let m: RegExpExecArray | null;
      while ((m = pathRx.exec(src)) !== null) {
        collected.add(m[1]);
      }
    }
    const redirectFroms = new Set(USER_REDIRECTS.map((r) => r.from));
    const missing: string[] = [];
    for (const route of collected) {
      const plural = route.replace("/investment/", "/investments/");
      if (!redirectFroms.has(plural)) missing.push(plural);
    }
    expect(
      missing,
      `Missing legacy plural redirects:\n${missing.map((p) => `  ${p}`).join("\n")}`,
    ).toEqual([]);
  });

  it("MoneyOnboarding has a deep-link route in money-routes.tsx", () => {
    const moneyRoutes = read("src/routes/families/money-routes.tsx");
    expect(moneyRoutes).toMatch(/path="\/money\/onboarding"\s+element=\{<MoneyOnboarding\s*\/?>\}/);
  });

  it("FINANCE_IA total count grows to ≥ 35 after Phase 4 additions", () => {
    expect(FINANCE_IA.length).toBeGreaterThanOrEqual(35);
  });
});