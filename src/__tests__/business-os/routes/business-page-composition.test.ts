// ═══════════════════════════════════════════════════════════════
// Phase 4 — Business OS page composition
//
// Catches broken lazy imports / default-export drift. The whole
// /business/* surface routes through BusinessCenter, but the
// windowed App-in-OS shell mounts the actual sub-modules under
// `src/modules/business/pages/`. We dynamically import each
// declared module and assert it exports a renderable component.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";

const PAGE_MODULES = [
  () => import("@/modules/business/pages/BusinessCenter"),
  () => import("@/modules/business/pages/AppointmentsScheduling"),
  () => import("@/modules/business/pages/ProposalsContracts"),
  () => import("@/modules/business/pages/AutopilotHub"),
  () => import("@/modules/business/pages/CustomerHealthPage"),
] as const;

function isComponent(v: unknown): boolean {
  if (typeof v === "function") return true;
  if (
    v && typeof v === "object" &&
    // forwardRef / memo wrappers expose `$$typeof` symbol
    typeof (v as { $$typeof?: unknown }).$$typeof !== "undefined"
  ) return true;
  return false;
}

describe("business pages — composition", () => {
  it.each(PAGE_MODULES.map((m, i) => [i, m] as const))(
    "page module #%i imports cleanly and exposes a renderable default",
    async (_i, loader) => {
      const mod = await loader();
      const def = (mod as { default?: unknown }).default;
      expect(def, "missing default export").toBeDefined();
      expect(isComponent(def), "default export is not a component").toBe(true);
    },
  );

  it("BusinessCenter dispatcher resolves to the canonical pages module", async () => {
    // Prevents the legacy src/pages/BusinessCenter.tsx from accidentally
    // exporting something other than the canonical implementation.
    const legacy = await import("@/pages/BusinessCenter");
    const canonical = await import("@/modules/business/pages/BusinessCenter");
    expect(legacy.default).toBe(canonical.default);
  });
});