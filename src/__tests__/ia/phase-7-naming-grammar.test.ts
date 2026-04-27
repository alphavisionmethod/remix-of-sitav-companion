// ═══════════════════════════════════════════════════════════════
// IA Phase 7 — Naming-Grammar Lint Test
// Wraps scripts/architecture/checks/check-page-naming-grammar.ts.
// ═══════════════════════════════════════════════════════════════
import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { ALL_IA_DESCRIPTORS } from "@/platform/ia/module-ia-manifest";
import { BANNED_NAME_SUFFIXES } from "@/platform/ia/page-role";

const SCRIPT = "scripts/architecture/checks/check-page-naming-grammar.ts";

describe("IA / Phase 7 — Naming-grammar lint", () => {
  it("validator script exists", () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
  });

  it("no descriptor's component class name ends in a banned suffix without legacyNameAllowed", () => {
    const offenders = ALL_IA_DESCRIPTORS.filter((d) => {
      if (d.legacyNameAllowed) return false;
      return BANNED_NAME_SUFFIXES.some((sfx) => d.component.endsWith(sfx));
    });
    expect(
      offenders,
      `Components ending in Center/Hub without legacyNameAllowed:\n${offenders
        .map((d) => `  ${d.pillar}/${d.id} → ${d.component}`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("no descriptor's sidebar label contains a banned word without legacyNameAllowed", () => {
    const offenders = ALL_IA_DESCRIPTORS.filter((d) => {
      if (d.legacyNameAllowed) return false;
      return BANNED_NAME_SUFFIXES.some((sfx) =>
        new RegExp(`(^|\\s)${sfx}(\\s|$|\\.|,)`, "i").test(d.label),
      );
    });
    expect(
      offenders,
      `Labels containing Center/Hub:\n${offenders
        .map((d) => `  ${d.pillar}/${d.id} → "${d.label}"`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("every legacyNameAllowed descriptor has a non-empty 'notes' rationale", () => {
    const offenders = ALL_IA_DESCRIPTORS.filter(
      (d) => d.legacyNameAllowed && !(d.notes && d.notes.trim().length > 0),
    );
    expect(
      offenders,
      `legacyNameAllowed descriptors missing rationale:\n${offenders
        .map((d) => `  ${d.pillar}/${d.id}`)
        .join("\n")}`,
    ).toEqual([]);
  });

  it("Phase 2/3 canonical renames are reflected in the manifest", () => {
    const expected = [
      { pillar: "business", id: "follow-through", component: "FollowThroughWorkspace" },
      { pillar: "business", id: "support", component: "SupportWorkspace" },
      { pillar: "business", id: "opportunities", component: "OpportunitiesWorkspace" },
      { pillar: "business", id: "collections", component: "CollectionsWorkspace" },
      { pillar: "business", id: "communications", component: "CommunicationsWorkspace" },
      { pillar: "business", id: "background-tasks", component: "BackgroundTasks" },
      { pillar: "business", id: "integrations", component: "CRMIntegrations" },
      { pillar: "business", id: "crm-import", component: "CRMImport" },
      { pillar: "business", id: "revenue-autopilot-console", component: "RevenueAutopilotConsole" },
      { pillar: "concierge", id: "household", component: "HouseholdWorkspace" },
      { pillar: "concierge", id: "life-admin", component: "LifeAdminWorkspace" },
    ] as const;
    for (const exp of expected) {
      const d = ALL_IA_DESCRIPTORS.find((x) => x.pillar === exp.pillar && x.id === exp.id);
      expect(d, `missing descriptor ${exp.pillar}/${exp.id}`).toBeDefined();
      expect(d!.component).toBe(exp.component);
    }
  });

  it("validator script exits 0", () => {
    let exitCode = 0;
    let output = "";
    try {
      output = execSync(`bun run ${SCRIPT}`, { stdio: "pipe", timeout: 60_000 }).toString();
    } catch (e: unknown) {
      const err = e as { status?: number; stdout?: Buffer; stderr?: Buffer };
      exitCode = err.status ?? 1;
      output = `${err.stdout?.toString() ?? ""}${err.stderr?.toString() ?? ""}`;
    }
    expect(exitCode, output.slice(0, 1500)).toBe(0);
  }, 90_000);
});