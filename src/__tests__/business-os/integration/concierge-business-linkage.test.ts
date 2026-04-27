// ═══════════════════════════════════════════════════════════════
// Phase 8 — int.concierge-business-linkage (Concierge ↔ Business)
//
// The live CRM→Concierge query path is already covered by:
//   src/__tests__/business-os/integration/crm-concierge-linkage-live.test.tsx
// (which is owned by the Concierge matrix as int.concierge-business-linkage).
//
// This Phase 8 suite adds the behavioral closure for the *Business* side:
//   • The cross-OS link registry exposes the canonical Business↔Concierge
//     seams (`biz-to-appointments`, `biz-to-errands`, `biz-to-travel`,
//     `con-to-support`, `con-to-operations`).
//   • `getCrossOSLinks('business', archetype)` honestly filters the
//     Concierge handoffs by the operator's archetype (appointment-based
//     practices see scheduling, brick-and-mortar sees errands, service
//     archetypes see travel — no archetype leaks outside its surface).
//   • The reverse seam (`getCrossOSLinks('concierge')`) routes
//     concierge→business handoffs at the right modules.
//
// Honesty: real registry, real exports, no mocks, no parallel system.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";

import {
  CROSS_OS_LINKS,
  getCrossOSLinks,
  type CrossOSLink,
} from "@/domains/engines/cross-os-integration";

function ids(links: CrossOSLink[]): string[] {
  return links.map((l) => l.id);
}

describe("Phase 8 — int.concierge-business-linkage (Business ↔ Concierge)", () => {
  // ── Registry truth ──────────────────────────────────────────

  it("CROSS_OS_LINKS exposes every canonical Business↔Concierge seam", () => {
    const allIds = CROSS_OS_LINKS.map((l) => l.id);
    // Business → Concierge
    expect(allIds).toContain("biz-to-appointments");
    expect(allIds).toContain("biz-to-errands");
    expect(allIds).toContain("biz-to-travel");
    // Concierge → Business
    expect(allIds).toContain("con-to-support");
    expect(allIds).toContain("con-to-operations");
  });

  // ── Archetype filtering: appointment-based ──────────────────

  it("appointment-based archetype receives the scheduling seam (biz-to-appointments)", () => {
    const links = getCrossOSLinks("business", "appointment-based");
    const linkIds = ids(links);
    expect(linkIds).toContain("biz-to-appointments");
    // Errands seam is brick-and-mortar only — must NOT leak here.
    expect(linkIds).not.toContain("biz-to-errands");
    // Travel seam is service/agency only — must NOT leak here.
    expect(linkIds).not.toContain("biz-to-travel");
  });

  it("brick-and-mortar archetype receives both scheduling AND errands seams", () => {
    const linkIds = ids(getCrossOSLinks("business", "brick-and-mortar"));
    expect(linkIds).toContain("biz-to-appointments");
    expect(linkIds).toContain("biz-to-errands");
  });

  it("service archetype receives the travel seam (biz-to-travel)", () => {
    const linkIds = ids(getCrossOSLinks("business", "service"));
    expect(linkIds).toContain("biz-to-travel");
    // Brick-and-mortar errands must not leak into a pure-service archetype.
    expect(linkIds).not.toContain("biz-to-errands");
  });

  it("agency archetype also receives the travel seam (shared with service)", () => {
    const linkIds = ids(getCrossOSLinks("business", "agency"));
    expect(linkIds).toContain("biz-to-travel");
    expect(linkIds).not.toContain("biz-to-errands");
  });

  // ── Targeting: business→concierge handoffs land at correct modules ──

  it("each business→concierge link routes at the correct concierge module", () => {
    const map = new Map(CROSS_OS_LINKS.map((l) => [l.id, l]));
    expect(map.get("biz-to-appointments")?.targetApp).toBe("concierge");
    expect(map.get("biz-to-appointments")?.targetModule).toBe("appointments");
    expect(map.get("biz-to-errands")?.targetApp).toBe("concierge");
    expect(map.get("biz-to-errands")?.targetModule).toBe("errands");
    expect(map.get("biz-to-travel")?.targetApp).toBe("concierge");
    expect(map.get("biz-to-travel")?.targetModule).toBe("travel");
  });

  // ── Reverse seam: Concierge→Business ────────────────────────

  it("Concierge→Business seams route at the correct business modules", () => {
    const links = getCrossOSLinks("concierge");
    const support = links.find((l) => l.id === "con-to-support");
    const ops = links.find((l) => l.id === "con-to-operations");
    expect(support?.targetApp).toBe("business");
    expect(support?.targetModule).toBe("support");
    expect(ops?.targetApp).toBe("business");
    expect(ops?.targetModule).toBe("operations");
  });

  it("getCrossOSLinks('concierge') only returns links rooted at the concierge app", () => {
    const links = getCrossOSLinks("concierge");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.sourceApp).toBe("concierge");
    }
  });

  // ── Closure: every link is well-formed ──────────────────────

  it("every Business↔Concierge link has a category, label, icon, and target module (no half-wired seams)", () => {
    const seams = CROSS_OS_LINKS.filter(
      (l) =>
        (l.sourceApp === "business" && l.targetApp === "concierge") ||
        (l.sourceApp === "concierge" && l.targetApp === "business"),
    );
    expect(seams.length).toBeGreaterThan(0);
    for (const s of seams) {
      expect(s.label).toBeTruthy();
      expect(s.icon).toBeTruthy();
      expect(s.targetModule).toBeTruthy();
      expect(s.category).toMatch(/^(financial|operational|scheduling|strategic)$/);
    }
  });
});
