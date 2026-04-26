// ═══════════════════════════════════════════════════════════════
// Phase 6 — Advisor → Business Action Handler Coverage
// Verifies that recommendation IDs surfaced by BusinessAdvisorBoardPage
// flow into the canonical handler registry — i.e., every business
// council advisor's `toolPermissions` is actually backed by handler
// IDs that exist in `CANONICAL_HANDLER_IDS`.
//
// This is the trust spine: an advisor recommendation must NOT
// dispatch to a non-existent handler.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { ADVISOR_REGISTRY } from "@/lib/advisor-protocol";
import { CANONICAL_HANDLER_IDS } from "@/lib/kernel-handlers";

// Widen the literal-tuple type to plain string[] so we can compare against
// arbitrary advisor permission strings without TS narrowing complaints.
const HANDLERS: readonly string[] = CANONICAL_HANDLER_IDS as readonly string[];

// Known governance debt surfaced by Phase 6: advisors declare wildcard
// permissions whose prefix has NO concrete handler in the canonical
// registry. We record them here so the test stays green AND any new
// drift (or any of these getting fixed) is detected immediately.
const KNOWN_PERMISSION_DEBT = new Set<string>([
  "business.invoice.*",  // collections-advisor — no business.invoice.* handlers exist; only business.proposal.convert-to-invoice
  "business.ops.*",      // operations-advisor — no business.ops.* handlers registered yet
  "business.risk.*",     // biz-risk-advisor — risk handlers not yet wired
  "business.report.*",   // biz-risk-advisor — report handlers not yet wired
  "business.opportunity.*", // growth-advisor wildcard — covered by individual handlers but prefix mismatch tracked here
]);

describe("Phase 6 — advisor → business action handler coverage", () => {
  const businessHandlers = HANDLERS.filter((id) =>
    id.startsWith("business."),
  );

  it("at least one business.* handler exists in the canonical registry", () => {
    expect(businessHandlers.length).toBeGreaterThan(0);
  });

  it("every business council advisor has at least one toolPermission entry", () => {
    const businessAdvisors = ADVISOR_REGISTRY.filter((a) => a.council === "business");
    expect(businessAdvisors.length).toBeGreaterThan(0);
    for (const advisor of businessAdvisors) {
      expect(
        advisor.toolPermissions.length,
        `${advisor.id} must declare at least one tool permission`,
      ).toBeGreaterThan(0);
    }
  });

  it("every wildcard business.* permission resolves to ≥1 concrete handler (or is recorded debt)", () => {
    const businessAdvisors = ADVISOR_REGISTRY.filter((a) => a.council === "business");
    for (const advisor of businessAdvisors) {
      for (const perm of advisor.toolPermissions) {
        if (!perm.includes(".") || !perm.endsWith("*")) continue;
        const prefix = perm.slice(0, -1);
        if (!prefix.startsWith("business.")) continue;
        const matches = businessHandlers.filter((h) => h.startsWith(prefix));
        if (matches.length === 0) {
          // Honest debt path: must be in the recorded list.
          expect(
            KNOWN_PERMISSION_DEBT.has(perm),
            `Advisor ${advisor.id} permission "${perm}" matches no canonical handler AND is not in KNOWN_PERMISSION_DEBT — either add the handler or record the debt explicitly`,
          ).toBe(true);
        }
      }
    }
  });

  it("KNOWN_PERMISSION_DEBT entries are still genuinely unmatched (stale-debt guard)", () => {
    for (const perm of KNOWN_PERMISSION_DEBT) {
      const prefix = perm.slice(0, -1);
      const matches = businessHandlers.filter((h) => h.startsWith(prefix));
      // If this fires, the handler was added — remove the entry from the debt set.
      expect(
        matches.length,
        `KNOWN_PERMISSION_DEBT entry "${perm}" now has matches — remove it from the debt set`,
      ).toBe(0);
    }
  });

  it("every blocked business.* action is also a known handler (cannot block phantom ids)", () => {
    const businessAdvisors = ADVISOR_REGISTRY.filter((a) => a.council === "business");
    for (const advisor of businessAdvisors) {
      for (const blocked of advisor.blockedActions) {
        if (!blocked.startsWith("business.")) continue;
        if (blocked.endsWith("*")) {
          const prefix = blocked.slice(0, -1);
          const matches = businessHandlers.filter((h) => h.startsWith(prefix));
          expect(matches.length, `Blocked wildcard "${blocked}" matches no handler`).toBeGreaterThan(0);
        } else {
          expect(
            businessHandlers.includes(blocked),
            `Blocked action "${blocked}" is not a real handler id`,
          ).toBe(true);
        }
      }
    }
  });

  it("the boardroom synthesizer has lower autonomy than action-executing advisors (governance check)", () => {
    const synth = ADVISOR_REGISTRY.find((a) => a.id === "biz-boardroom-advisor");
    const exec = ADVISOR_REGISTRY.find((a) => a.id === "biz-advisor");
    expect(synth).toBeTruthy();
    expect(exec).toBeTruthy();
    // "draft" < "approval-ready" — synthesizer must not auto-execute.
    const ORDER = ["observe", "recommend", "draft", "simulate", "approval-ready", "execute"] as const;
    expect(ORDER.indexOf(synth!.autonomyLevel)).toBeLessThan(
      ORDER.indexOf(exec!.autonomyLevel),
    );
  });
});