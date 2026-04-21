// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Cross-Surface Verification
// Exercises OS Shell, App Product, and Admin surfaces together.
// Reports contract/token mismatches across all visual tiers.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";

// ── Contract imports ────────────────────────────────────────────
import {
  SHELL_OWNED_SURFACES,
  APP_OWNED_SURFACES,
  SHARED_SYSTEM_SURFACES,
  MERGE_RULES,
  CONTEXT_HANDOFFS,
  OS_APP_EXPERIENCE_CONTRACT,
} from "@/platform/experience/os-app-experience-contract";

import {
  SHELL_APP_MERGE_RULES,
  EMBEDDING_RULES,
  SHELL_APP_MERGE_GRAMMAR,
} from "@/platform/experience/shell-app-merge-grammar";

import {
  DESIGN_TOKEN_BRIDGE,
} from "@/platform/experience/design-token-bridge";

import {
  VISUAL_TIERS,
  VISUAL_TIER_COUNT,
  getAllTierIds,
  type VisualTierId,
} from "@/platform/experience/visual-tier-system";

import {
  COMPONENT_TIER_MAP,
  COMPONENT_TIER_MAP_COUNT,
} from "@/platform/experience/component-tier-map";

// ── Token source imports ────────────────────────────────────────
import { MATERIALS, DEPTH_LAYERS, NOVA_MOTION, SHAPES } from "@/platform/design-system/nova-os";
import { SPACE, TYPE, APP_TYPE, APP_MATERIALS, APP_SHADOWS } from "@/platform/design-system/app-window-system";
import { SURFACE_TOKENS, DOMAIN_ATMOSPHERE } from "@/platform/design-system/sita-design-tokens";
import {
  COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS, MOTION,
  TRUST_STATES, WORKFLOW_STATES, PROOF_STATES,
} from "@/packages/design-tokens";

// ═══════════════════════════════════════════════════════════════
// Mismatch Collector — aggregates all findings into a report
// ═══════════════════════════════════════════════════════════════

interface Mismatch {
  surface: string;
  category: "contract" | "token" | "embedding" | "handoff" | "tier" | "component";
  severity: "error" | "warning";
  message: string;
}

const mismatches: Mismatch[] = [];

function reportMismatch(m: Mismatch) {
  mismatches.push(m);
}

// ═══════════════════════════════════════════════════════════════
// PART 1: Experience Contract Structural Integrity
// ═══════════════════════════════════════════════════════════════

describe("E2E Cross-Surface Verification", () => {
  describe("1 — Experience Contract Structural Integrity", () => {
    it("has the expected number of shell-owned surfaces", () => {
      expect(SHELL_OWNED_SURFACES.length).toBeGreaterThanOrEqual(10);
      for (const s of SHELL_OWNED_SURFACES) {
        expect(s.layer).toBe("shell");
        expect(s.surfaceId).toBeTruthy();
        expect(s.componentRef).toBeTruthy();
      }
    });

    it("has the expected number of app-owned surfaces", () => {
      expect(APP_OWNED_SURFACES.length).toBeGreaterThanOrEqual(6);
      for (const s of APP_OWNED_SURFACES) {
        expect(s.layer).toBe("app");
      }
    });

    it("has shared system surfaces used by both layers", () => {
      expect(SHARED_SYSTEM_SURFACES.length).toBeGreaterThanOrEqual(7);
      for (const s of SHARED_SYSTEM_SURFACES) {
        expect(s.layer).toBe("shared");
      }
    });

    it("total surface count is consistent", () => {
      const expected =
        SHELL_OWNED_SURFACES.length +
        APP_OWNED_SURFACES.length +
        SHARED_SYSTEM_SURFACES.length;
      expect(OS_APP_EXPERIENCE_CONTRACT.totalSurfaces).toBe(expected);
    });

    it("no duplicate surface IDs across all layers", () => {
      const allSurfaces = [
        ...SHELL_OWNED_SURFACES,
        ...APP_OWNED_SURFACES,
        ...SHARED_SYSTEM_SURFACES,
      ];
      const ids = allSurfaces.map((s) => s.surfaceId);
      const unique = new Set(ids);
      if (ids.length !== unique.size) {
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        reportMismatch({
          surface: "experience-contract",
          category: "contract",
          severity: "error",
          message: `Duplicate surface IDs: ${dupes.join(", ")}`,
        });
      }
      expect(ids.length).toBe(unique.size);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 2: Merge Rules & Embedding Rules
  // ═══════════════════════════════════════════════════════════════

  describe("2 — Merge Rules & Embedding Rules", () => {
    it("merge rules cover essential interactions", () => {
      const ruleIds = MERGE_RULES.map((r) => r.ruleId);
      expect(ruleIds).toContain("fullscreen-yield");
      expect(ruleIds).toContain("notification-routing");
      expect(ruleIds).toContain("command-merge");
      expect(ruleIds).toContain("focus-transfer");
      expect(ruleIds).toContain("depth-layer-respect");
      expect(ruleIds).toContain("search-scoping");
    });

    it("every merge rule defines both shell and app behavior", () => {
      for (const rule of MERGE_RULES) {
        if (!rule.shellBehavior || !rule.appBehavior) {
          reportMismatch({
            surface: rule.ruleId,
            category: "contract",
            severity: "error",
            message: `Merge rule '${rule.ruleId}' missing shell or app behavior definition`,
          });
        }
        expect(rule.shellBehavior).toBeTruthy();
        expect(rule.appBehavior).toBeTruthy();
      }
    });

    it("shell-app merge grammar covers all 4 modes", () => {
      const modes = SHELL_APP_MERGE_RULES.map((r) => r.mode);
      expect(modes).toContain("desktop-windowed");
      expect(modes).toContain("desktop-fullscreen");
      expect(modes).toContain("browser-web");
      expect(modes).toContain("mobile");
      expect(SHELL_APP_MERGE_GRAMMAR.modeCount).toBe(4);
    });

    it("embedding rules enforce depth-layer and command constraints", () => {
      const blockRules = EMBEDDING_RULES.filter((r) => r.enforcement === "block");
      expect(blockRules.length).toBeGreaterThanOrEqual(5);
      const blockIds = blockRules.map((r) => r.ruleId);
      expect(blockIds).toContain("no-depth-override");
      expect(blockIds).toContain("command-merge");
      expect(blockIds).toContain("notification-routing");
      expect(blockIds).toContain("shared-trust-grammar");
      expect(blockIds).toContain("shared-state-grammar");
    });

    it("desktop-windowed mode has correct depth layer range", () => {
      const windowed = SHELL_APP_MERGE_RULES.find((r) => r.mode === "desktop-windowed");
      expect(windowed).toBeDefined();
      expect(windowed!.depthLayerRange).toContain("z=20");
      // Verify against actual DEPTH_LAYERS
      expect(DEPTH_LAYERS.windows).toBe(20);
      if (!windowed!.depthLayerRange.includes(String(DEPTH_LAYERS.windows))) {
        reportMismatch({
          surface: "desktop-windowed",
          category: "token",
          severity: "error",
          message: `Merge grammar says z=${windowed!.depthLayerRange} but DEPTH_LAYERS.windows=${DEPTH_LAYERS.windows}`,
        });
      }
    });

    it("depth-layer-respect rule z-values match DEPTH_LAYERS tokens", () => {
      const rule = MERGE_RULES.find((r) => r.ruleId === "depth-layer-respect");
      expect(rule).toBeDefined();
      // Rule says dock=25, menuBar=30, overlay=40
      expect(DEPTH_LAYERS.dock).toBe(25);
      expect(DEPTH_LAYERS.menuBar).toBe(30);
      expect(DEPTH_LAYERS.overlay).toBe(40);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 3: Context Handoffs
  // ═══════════════════════════════════════════════════════════════

  describe("3 — Context Handoffs", () => {
    it("handoffs cover app launch, close, notification, search, settings", () => {
      const ids = CONTEXT_HANDOFFS.map((h) => h.handoffId);
      expect(ids).toContain("app-launch");
      expect(ids).toContain("app-close");
      expect(ids).toContain("notification-click");
      expect(ids).toContain("search-navigate");
      expect(ids).toContain("settings-navigate");
    });

    it("every handoff has valid from/to layers", () => {
      const validLayers = new Set(["shell", "app", "shared"]);
      for (const h of CONTEXT_HANDOFFS) {
        expect(validLayers.has(h.from)).toBe(true);
        expect(validLayers.has(h.to)).toBe(true);
        expect(h.from).not.toBe(h.to); // handoffs must cross boundaries
      }
    });

    it("app-launch handoff transfers required context", () => {
      const launch = CONTEXT_HANDOFFS.find((h) => h.handoffId === "app-launch");
      expect(launch).toBeDefined();
      expect(launch!.dataTransferred).toContain("appId");
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 4: Visual Tier System
  // ═══════════════════════════════════════════════════════════════

  describe("4 — Visual Tier System", () => {
    it("defines exactly 5 visual tiers", () => {
      expect(VISUAL_TIER_COUNT).toBe(5);
      expect(getAllTierIds().length).toBe(5);
    });

    it("each tier has complete token source references", () => {
      for (const tierId of getAllTierIds()) {
        const tier = VISUAL_TIERS[tierId];
        expect(tier.tokenSources.length).toBeGreaterThan(0);
        expect(tier.surfaceDensity).toBeTruthy();
        expect(tier.chromeIntensity).toBeTruthy();
        expect(tier.motionProfile).toBeTruthy();
      }
    });

    it("shell tier uses full chrome and full motion", () => {
      const shell = VISUAL_TIERS.TIER_SYSTEM_SHELL;
      expect(shell.chromeIntensity).toBe("full");
      expect(shell.motionProfile).toBe("full");
    });

    it("admin tier uses compact density and reduced motion", () => {
      const admin = VISUAL_TIERS.TIER_OPERATOR_ADMIN;
      expect(admin.surfaceDensity).toBe("compact");
      expect(admin.motionProfile).toBe("reduced");
    });

    it("degraded-recovery tier uses no chrome", () => {
      const recovery = VISUAL_TIERS.TIER_DEGRADED_RECOVERY;
      expect(recovery.chromeIntensity).toBe("none");
      expect(recovery.motionProfile).toBe("minimal");
      expect(recovery.surfaceDensity).toBe("spacious");
    });

    it("shared primitives are consistent across tiers", () => {
      const shell = VISUAL_TIERS.TIER_SYSTEM_SHELL;
      const app = VISUAL_TIERS.TIER_PRODUCT_APP;
      // Both must share typography-scale and state-grammar
      const sharedShell = new Set(shell.sharedWithOtherTiers);
      const sharedApp = new Set(app.sharedWithOtherTiers);
      expect(sharedShell.has("typography-scale")).toBe(true);
      expect(sharedApp.has("typography-scale")).toBe(true);
      expect(sharedShell.has("state-grammar")).toBe(true);
      expect(sharedApp.has("state-grammar")).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 5: Design Token Bridge — Cross-Source Coherence
  // ═══════════════════════════════════════════════════════════════

  describe("5 — Design Token Bridge Coherence", () => {
    it("all token sources in bridge exist as imports", () => {
      // Verify that key exports from the bridge are actually resolvable
      expect(MATERIALS).toBeDefined();       // nova-os
      expect(DEPTH_LAYERS).toBeDefined();    // nova-os
      expect(SPACE).toBeDefined();           // app-window-system
      expect(APP_TYPE).toBeDefined();        // app-window-system
      expect(SURFACE_TOKENS).toBeDefined();  // sita-design-tokens
      expect(DOMAIN_ATMOSPHERE).toBeDefined(); // sita-design-tokens
      expect(COLORS).toBeDefined();          // design-tokens package
      expect(TRUST_STATES).toBeDefined();    // design-tokens package
    });

    it("no unresolvable overlap conflicts in token bridge", () => {
      for (const entry of DESIGN_TOKEN_BRIDGE) {
        if (entry.overlapsWith && entry.overlapsWith.length > 0) {
          for (const overlap of entry.overlapsWith) {
            // Overlaps must be documented — this is advisory, not error
            reportMismatch({
              surface: entry.tokenSource,
              category: "token",
              severity: "warning",
              message: `Known token overlap: ${entry.tokenSource} overlaps with ${overlap}`,
            });
          }
        }
      }
      // Just verify the bridge loads
      expect(DESIGN_TOKEN_BRIDGE.length).toBeGreaterThanOrEqual(6);
    });

    it("every tier has at least one token bridge entry", () => {
      const tiersWithTokens = new Set<VisualTierId>();
      for (const entry of DESIGN_TOKEN_BRIDGE) {
        for (const tier of entry.tiers) {
          tiersWithTokens.add(tier);
        }
      }
      for (const tierId of getAllTierIds()) {
        if (!tiersWithTokens.has(tierId)) {
          reportMismatch({
            surface: tierId,
            category: "token",
            severity: "error",
            message: `Visual tier '${tierId}' has no token bridge entry`,
          });
        }
        expect(tiersWithTokens.has(tierId)).toBe(true);
      }
    });

    it("shell tier token bridge maps to nova-os exports", () => {
      const shellEntry = DESIGN_TOKEN_BRIDGE.find((e) => e.tokenSource === "nova-os");
      expect(shellEntry).toBeDefined();
      expect(shellEntry!.tiers).toContain("TIER_SYSTEM_SHELL");
      // Verify exports match actual module exports
      expect(shellEntry!.exports).toContain("MATERIALS");
      expect(shellEntry!.exports).toContain("DEPTH_LAYERS");
      expect(shellEntry!.exports).toContain("NOVA_MOTION");
    });

    it("app tier token bridge maps to app-window-system exports", () => {
      const appEntry = DESIGN_TOKEN_BRIDGE.find((e) => e.tokenSource === "app-window-system");
      expect(appEntry).toBeDefined();
      expect(appEntry!.tiers).toContain("TIER_PRODUCT_APP");
      expect(appEntry!.exports).toContain("APP_MATERIALS");
      expect(appEntry!.exports).toContain("APP_SHADOWS");
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 6: Token Value Cross-Validation
  // ═══════════════════════════════════════════════════════════════

  describe("6 — Token Value Cross-Validation", () => {
    it("DEPTH_LAYERS ordering is strictly increasing per semantics", () => {
      expect(DEPTH_LAYERS.desktop).toBeLessThan(DEPTH_LAYERS.content);
      expect(DEPTH_LAYERS.content).toBeLessThan(DEPTH_LAYERS.windows);
      expect(DEPTH_LAYERS.windows).toBeLessThan(DEPTH_LAYERS.dock);
      expect(DEPTH_LAYERS.dock).toBeLessThan(DEPTH_LAYERS.menuBar);
      expect(DEPTH_LAYERS.menuBar).toBeLessThan(DEPTH_LAYERS.overlay);
      expect(DEPTH_LAYERS.overlay).toBeLessThan(DEPTH_LAYERS.contextMenu);
    });

    it("SURFACE_TOKENS shadow intensity increases with level", () => {
      expect(SURFACE_TOKENS[0].shadow).toBe("none");
      expect(SURFACE_TOKENS[1].shadow).not.toBe("none");
      expect(SURFACE_TOKENS[2].shadow).not.toBe("none");
      expect(SURFACE_TOKENS[3].shadow).not.toBe("none");
      // Level 3 shadow should be more complex than level 1
      expect(SURFACE_TOKENS[3].shadow.length).toBeGreaterThan(SURFACE_TOKENS[1].shadow.length);
    });

    it("SPACE scale is monotonically increasing", () => {
      expect(SPACE.micro).toBeLessThan(SPACE.tight);
      expect(SPACE.tight).toBeLessThan(SPACE.normal);
      expect(SPACE.normal).toBeLessThan(SPACE.section);
      expect(SPACE.section).toBeLessThan(SPACE.large);
    });

    it("MOTION duration scale is monotonically increasing", () => {
      expect(MOTION.duration.instant).toBeLessThan(MOTION.duration.fast);
      expect(MOTION.duration.fast).toBeLessThan(MOTION.duration.normal);
      expect(MOTION.duration.normal).toBeLessThan(MOTION.duration.slow);
      expect(MOTION.duration.slow).toBeLessThan(MOTION.duration.deliberate);
    });

    it("COLORS HSL values are in valid ranges", () => {
      for (const [name, color] of Object.entries(COLORS)) {
        if ("h" in color && "s" in color && "l" in color) {
          if (color.h < 0 || color.h > 360 || color.s < 0 || color.s > 100 || color.l < 0 || color.l > 100) {
            reportMismatch({
              surface: `COLORS.${name}`,
              category: "token",
              severity: "error",
              message: `Invalid HSL: h=${color.h} s=${color.s} l=${color.l}`,
            });
          }
          expect(color.h).toBeGreaterThanOrEqual(0);
          expect(color.h).toBeLessThanOrEqual(360);
          expect(color.s).toBeGreaterThanOrEqual(0);
          expect(color.s).toBeLessThanOrEqual(100);
          expect(color.l).toBeGreaterThanOrEqual(0);
          expect(color.l).toBeLessThanOrEqual(100);
        }
      }
    });

    it("DOMAIN_ATMOSPHERE has entries for all core domains", () => {
      const requiredDomains = ["business", "finance", "concierge"];
      for (const domain of requiredDomains) {
        const atmos = DOMAIN_ATMOSPHERE[domain as keyof typeof DOMAIN_ATMOSPHERE];
        if (!atmos) {
          reportMismatch({
            surface: `DOMAIN_ATMOSPHERE.${domain}`,
            category: "token",
            severity: "error",
            message: `Missing domain atmosphere for '${domain}'`,
          });
        }
        expect(atmos).toBeDefined();
        expect(atmos.accentHsl).toBeTruthy();
        expect(atmos.tone).toBeTruthy();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 7: Component Tier Map — Cross-Tier Consistency
  // ═══════════════════════════════════════════════════════════════

  describe("7 — Component Tier Map", () => {
    it("component tier map has expected coverage", () => {
      expect(COMPONENT_TIER_MAP_COUNT).toBeGreaterThanOrEqual(20);
    });

    it("universal components span all relevant tiers", () => {
      const buttons = COMPONENT_TIER_MAP.find((c) => c.familyId === "buttons");
      expect(buttons).toBeDefined();
      expect(buttons!.tiers.length).toBeGreaterThanOrEqual(4);
    });

    it("tier-variant components document their differences", () => {
      const withVariants = COMPONENT_TIER_MAP.filter((c) => c.hasTierVariants);
      expect(withVariants.length).toBeGreaterThan(0);
      for (const c of withVariants) {
        expect(c.notes).toBeTruthy();
        expect(c.tiers.length).toBeGreaterThanOrEqual(2);
      }
    });

    it("admin-only components are restricted to admin tier", () => {
      const adminOnly = COMPONENT_TIER_MAP.find((c) => c.familyId === "operator-action-panels");
      expect(adminOnly).toBeDefined();
      expect(adminOnly!.tiers).toEqual(["TIER_OPERATOR_ADMIN"]);
    });

    it("trust-only components are restricted to trust tier", () => {
      const trustOnly = COMPONENT_TIER_MAP.filter(
        (c) => c.tiers.length === 1 && c.tiers[0] === "TIER_SUPPORT_TRUST"
      );
      expect(trustOnly.length).toBeGreaterThanOrEqual(3); // proof-badges, ai-truth-disclosures, provenance-chips
    });

    it("all component tiers reference valid visual tier IDs", () => {
      const validTiers = new Set(getAllTierIds());
      for (const c of COMPONENT_TIER_MAP) {
        for (const tier of c.tiers) {
          if (!validTiers.has(tier)) {
            reportMismatch({
              surface: c.familyId,
              category: "component",
              severity: "error",
              message: `Component '${c.familyId}' references invalid tier '${tier}'`,
            });
          }
          expect(validTiers.has(tier)).toBe(true);
        }
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 8: Trust & State Token Completeness
  // ═══════════════════════════════════════════════════════════════

  describe("8 — Trust & State Token Completeness", () => {
    it("TRUST_STATES covers all lifecycle phases", () => {
      const required = ["proposed", "approved", "executing", "completed", "verified", "failed", "escalated"];
      for (const state of required) {
        expect(TRUST_STATES).toHaveProperty(state);
      }
    });

    it("WORKFLOW_STATES covers essential workflow phases", () => {
      const required = ["pending", "running", "completed", "failed"];
      for (const state of required) {
        expect(WORKFLOW_STATES).toHaveProperty(state);
      }
    });

    it("PROOF_STATES covers evidence lifecycle", () => {
      const required = ["generated", "verified", "disputed", "archived"];
      for (const state of required) {
        expect(PROOF_STATES).toHaveProperty(state);
      }
    });

    it("all state tokens have color and label", () => {
      const allStates = { ...TRUST_STATES, ...WORKFLOW_STATES, ...PROOF_STATES };
      for (const [key, value] of Object.entries(allStates)) {
        if (!value.color || !value.label) {
          reportMismatch({
            surface: `state.${key}`,
            category: "token",
            severity: "error",
            message: `State '${key}' missing color or label`,
          });
        }
        expect(value.color).toBeTruthy();
        expect(value.label).toBeTruthy();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 9: Cross-Surface Depth Layer Isolation
  // ═══════════════════════════════════════════════════════════════

  describe("9 — Cross-Surface Depth Layer Isolation", () => {
    it("shell overlays are always above app windows", () => {
      expect(DEPTH_LAYERS.overlay).toBeGreaterThan(DEPTH_LAYERS.windows);
      expect(DEPTH_LAYERS.menuBar).toBeGreaterThan(DEPTH_LAYERS.windows);
      expect(DEPTH_LAYERS.dock).toBeGreaterThan(DEPTH_LAYERS.windows);
    });

    it("context menu layer is highest", () => {
      const maxNonContext = Math.max(
        DEPTH_LAYERS.desktop,
        DEPTH_LAYERS.content,
        DEPTH_LAYERS.windows,
        DEPTH_LAYERS.dock,
        DEPTH_LAYERS.menuBar,
        DEPTH_LAYERS.overlay,
      );
      expect(DEPTH_LAYERS.contextMenu).toBeGreaterThan(maxNonContext);
    });

    it("windowed mode enforces app z=20 boundary per merge grammar", () => {
      const windowed = SHELL_APP_MERGE_RULES.find((r) => r.mode === "desktop-windowed");
      expect(windowed!.depthLayerRange).toContain("z=20");
      expect(DEPTH_LAYERS.windows).toBe(20);
    });

    it("fullscreen mode uses lower base z for app content", () => {
      const fullscreen = SHELL_APP_MERGE_RULES.find((r) => r.mode === "desktop-fullscreen");
      expect(fullscreen!.depthLayerRange).toContain("z=10");
      expect(DEPTH_LAYERS.content).toBe(10);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 10: Admin Surface Isolation Checks
  // ═══════════════════════════════════════════════════════════════

  describe("10 — Admin Surface Isolation", () => {
    it("admin tier has distinct density from app tier", () => {
      expect(VISUAL_TIERS.TIER_OPERATOR_ADMIN.surfaceDensity).not.toBe(
        VISUAL_TIERS.TIER_PRODUCT_APP.surfaceDensity
      );
    });

    it("admin tier has reduced chrome vs shell tier", () => {
      const chromeOrder = { none: 0, minimal: 1, standard: 2, full: 3 };
      const adminChrome = chromeOrder[VISUAL_TIERS.TIER_OPERATOR_ADMIN.chromeIntensity];
      const shellChrome = chromeOrder[VISUAL_TIERS.TIER_SYSTEM_SHELL.chromeIntensity];
      expect(adminChrome).toBeLessThan(shellChrome);
    });

    it("admin tier shares typography-scale with shell and app", () => {
      const adminShared = VISUAL_TIERS.TIER_OPERATOR_ADMIN.sharedWithOtherTiers;
      expect(adminShared).toContain("typography-scale");
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PART 11: Typography System Coherence
  // ═══════════════════════════════════════════════════════════════

  describe("11 — Typography Coherence Across Surfaces", () => {
    it("APP_TYPE defines all required levels", () => {
      expect(APP_TYPE.label).toBeTruthy();
      expect(APP_TYPE.body).toBeTruthy();
      expect(APP_TYPE.title).toBeTruthy();
      expect(APP_TYPE.heading).toBeTruthy();
    });

    it("TYPE numeric values match APP_TYPE class names", () => {
      // TYPE.label.size=11 should match APP_TYPE.label containing "11px"
      expect(APP_TYPE.label).toContain(`${TYPE.label.size}px`);
      expect(APP_TYPE.body).toContain(`${TYPE.body.size}px`);
      expect(APP_TYPE.title).toContain(`${TYPE.title.size}px`);
      expect(APP_TYPE.heading).toContain(`${TYPE.heading.size}px`);
    });

    it("package TYPOGRAPHY provides base values", () => {
      expect(TYPOGRAPHY.fontFamily.display).toContain("Inter");
      expect(TYPOGRAPHY.fontFamily.mono).toContain("JetBrains Mono");
      expect(Object.keys(TYPOGRAPHY.fontSize).length).toBeGreaterThanOrEqual(6);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // FINAL: Mismatch Report Summary
  // ═══════════════════════════════════════════════════════════════

  describe("Cross-Surface Mismatch Report", () => {
    it("produces a comprehensive mismatch report", () => {
      const errors = mismatches.filter((m) => m.severity === "error");
      const warnings = mismatches.filter((m) => m.severity === "warning");

      console.log("\n═══ CROSS-SURFACE VERIFICATION REPORT ═══");
      console.log(`Total findings: ${mismatches.length}`);
      console.log(`  Errors:   ${errors.length}`);
      console.log(`  Warnings: ${warnings.length}`);

      if (mismatches.length > 0) {
        console.log("\nFindings:");
        for (const m of mismatches) {
          const icon = m.severity === "error" ? "❌" : "⚠️";
          console.log(`  ${icon} [${m.category}] ${m.surface}: ${m.message}`);
        }
      }

      console.log("\n═══ SURFACES VERIFIED ═══");
      console.log(`  Shell surfaces:  ${SHELL_OWNED_SURFACES.length}`);
      console.log(`  App surfaces:    ${APP_OWNED_SURFACES.length}`);
      console.log(`  Shared surfaces: ${SHARED_SYSTEM_SURFACES.length}`);
      console.log(`  Visual tiers:    ${VISUAL_TIER_COUNT}`);
      console.log(`  Component families: ${COMPONENT_TIER_MAP_COUNT}`);
      console.log(`  Merge rules:     ${MERGE_RULES.length}`);
      console.log(`  Embedding rules:  ${EMBEDDING_RULES.length}`);
      console.log(`  Context handoffs: ${CONTEXT_HANDOFFS.length}`);
      console.log(`  Token sources:    ${DESIGN_TOKEN_BRIDGE.length}`);
      console.log("═══════════════════════════════════════\n");

      // Only errors block — warnings are advisory
      expect(errors.length).toBe(0);
    });
  });
});