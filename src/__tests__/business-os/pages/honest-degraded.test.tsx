// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 2 Honest-Degraded Surface Tests
//
// Asserts that the three Tier-2 surfaces (WebsiteBuilder,
// SocialCommand, EcommerceManager) classified as `degraded` in
// `PRODUCTION_TRUTH_MANIFEST` actually render setup-required UI
// in live mode and contain no fabricated KPI numbers in source.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BUSINESS_OS_TRUTH_MANIFEST } from "@/modules/business/PRODUCTION_TRUTH_MANIFEST";

const PAGES = ["WebsiteBuilder", "SocialCommand", "EcommerceManager"] as const;

function readPage(name: string) {
  return readFileSync(resolve(__dirname, `../../../modules/business/pages/${name}.tsx`), "utf8");
}

describe("Phase 2 — Honest-Degraded Tier-2 surfaces", () => {
  for (const page of PAGES) {
    describe(page, () => {
      const src = readPage(page);
      const entry = BUSINESS_OS_TRUTH_MANIFEST.find((e) => e.page === page)!;

      it("is declared `degraded` in the truth manifest", () => {
        expect(entry).toBeDefined();
        expect(entry.state).toBe("degraded");
      });

      it("imports the canonical PageTruthBanner and EmptyStateCard", () => {
        expect(src).toMatch(/from "@\/platform\/sita\/components\/sita\/PageTruthBanner"/);
        expect(src).toMatch(/EmptyStateCard/);
      });

      it("gates demo data behind useRealityModeSafe().isDemo", () => {
        expect(src).toMatch(/useRealityModeSafe/);
        expect(src).toMatch(/isDemo/);
        // Live path must short-circuit BEFORE rendering fixture-driven UI.
        expect(src).toMatch(/if\s*\(\s*!isDemo/);
      });

      it("renders a setup-required EmptyStateCard with a Connect/Sign-in CTA", () => {
        expect(src).toMatch(/(Connect|Sign in to|connect)/i);
        expect(src).toMatch(/ctaPath=/);
      });

      it("does not declare top-level fake-live arrays of KPI objects", () => {
        // The original pages had top-level `const sites = [{...}]`,
        // `const platforms = [...]`, `const kpis = [...]`. The new versions
        // import these from `@/data/fixtures/mock-data/*-demo` instead.
        const topLevelArrayLiteral = /^\s*const\s+(sites|platforms|kpis|orders|inventory|channels|abTests|seoKeywords|heatmapData|templates|scheduled|topPerforming|hashtags|comments|competitors)\s*=\s*\[\s*\{/m;
        expect(src).not.toMatch(topLevelArrayLiteral);
      });

      it("imports demo fixtures from the canonical mock-data namespace", () => {
        expect(src).toMatch(/from "@\/data\/fixtures\/mock-data\/[a-z-]+-demo"/);
      });
    });
  }
});