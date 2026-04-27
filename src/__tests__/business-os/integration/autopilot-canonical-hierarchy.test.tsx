/**
 * Phase 9 — Autopilot canonical hierarchy
 *
 * Asserts that the four canonical Autopilot surfaces all render the
 * shared <AutopilotPeers /> cross-link bar so operators can move
 * between strategy ↔ activation ↔ execution ↔ result without leaving
 * the windowed-app context.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "../../../..");

const SURFACES: Array<{ file: string; current: string; tier: string }> = [
  {
    file: "src/modules/business/pages/PlaybookBuilder.tsx",
    current: "playbook-builder",
    tier: "workflow",
  },
  {
    file: "src/modules/business/pages/AutopilotHub.tsx",
    current: "autopilot-hub",
    tier: "execution",
  },
  {
    file: "src/modules/business/pages/RevenueAutopilot.tsx",
    current: "revenue-autopilot",
    tier: "execution",
  },
  {
    // IA Phase 6: page archived; canonical impl moved under _archived/.
    // The Autopilot hierarchy markers must remain present on the archived
    // file so a future un-archive does not silently lose lineage.
    file: "src/modules/business/pages/_archived/RevenueImpactDashboard.tsx",
    current: "revenue-impact",
    tier: "insight",
  },
];

describe("autopilot canonical hierarchy", () => {
  for (const surface of SURFACES) {
    it(`${surface.file} renders AutopilotPeers + HierarchyHint`, () => {
      const text = readFileSync(resolve(ROOT, surface.file), "utf8");
      expect(text).toContain(`AutopilotPeers`);
      expect(text).toContain(`current="${surface.current}"`);
      expect(text).toContain(`HierarchyHint`);
    });
  }

  it("AutopilotPeers exposes exactly the four canonical surface keys", () => {
    const text = readFileSync(
      resolve(ROOT, "src/modules/business/components/business/shared/AutopilotPeers.tsx"),
      "utf8",
    );
    for (const key of ["playbook-builder", "autopilot-hub", "revenue-autopilot", "revenue-impact"]) {
      expect(text).toContain(`"${key}"`);
    }
  });
});