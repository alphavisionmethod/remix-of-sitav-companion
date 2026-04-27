// ═══════════════════════════════════════════════════════════════
// Phase 7 — int.concierge-finance-linkage
//
// Proves the cross-domain seam between Finance OS and Concierge OS:
//   • Finance recurring obligations (the Finance representation of a
//     household bill) summarise correctly into the shape Concierge
//     consumes for the "recurring" module.
//   • The cross-OS link registry exposes the canonical
//     Finance↔Concierge navigation seams (`fin-to-recurring`,
//     `fin-to-household`, `con-to-bills`, `con-to-subscriptions`)
//     so deep-links between the two surfaces stay observable.
//   • The Peace Score engine consumes the household-coordination
//     dimension that Concierge feeds into Finance — the lineage
//     between the two domains is preserved in the score breakdown.
//
// Honesty: no demo data, no parallel testing system. We use the
// canonical fixtures from `src/__tests__/finance/_helpers/` and the
// real exports from `src/lib/services/finance-os/`.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";

import { summarizeRecurringObligations } from "@/lib/services/finance-os/recurring-obligation.service";
import { computePeaceScore } from "@/lib/services/finance-os/peace-score.service";
import {
  CROSS_OS_LINKS,
  getCrossOSLinks,
} from "@/domains/engines/cross-os-integration";
import {
  makeObligation,
  makePeaceScoreInput,
} from "@/__tests__/finance/_helpers/finance-fixtures";

describe("Phase 7 — int.concierge-finance-linkage (Finance ↔ Concierge)", () => {
  // ── Recurring obligations: the shape Concierge consumes ─────

  it("summarizeRecurringObligations produces the monthly/annual commitment shape Concierge needs to render the 'recurring' module", () => {
    const summary = summarizeRecurringObligations([
      // Household bills routed to Concierge "recurring" module.
      makeObligation({ id: "obl-1", name: "Rent", category: "Housing", amountCents: 200_000, frequency: "monthly", autoPay: false }),
      makeObligation({ id: "obl-2", name: "Internet", category: "Utilities", amountCents: 6_000, frequency: "monthly", autoPay: true }),
      makeObligation({ id: "obl-3", name: "Insurance", category: "Insurance", amountCents: 60_000, frequency: "annually", autoPay: true }),
      // One-time should NOT enter the recurring summary.
      makeObligation({ id: "obl-4", name: "Repair", category: "Home", amountCents: 50_000, frequency: "one-time", autoPay: false }),
    ]);

    expect(summary.obligationCount).toBe(3);
    // 200,000 + 6,000 + (60,000 / 12 = 5,000) = 211,000 cents/mo
    expect(summary.totalMonthlyCommitmentCents).toBe(211_000);
    expect(summary.totalAnnualCommitmentCents).toBe(211_000 * 12);
    expect(summary.autoPayCount).toBe(2);
    expect(summary.manualPayCount).toBe(1);

    // Concierge expects categories sorted by monthly weight (Housing first).
    expect(summary.byCategory[0]?.category).toBe("Housing");
    expect(summary.byCategory[0]?.monthlyCents).toBe(200_000);

    // Concierge expects frequency rollups for the three real frequencies.
    const monthlyEntry = summary.byFrequency.find((f) => f.frequency === "monthly");
    const annualEntry = summary.byFrequency.find((f) => f.frequency === "annually");
    expect(monthlyEntry?.count).toBe(2);
    expect(monthlyEntry?.monthlyCents).toBe(206_000);
    expect(annualEntry?.count).toBe(1);
    expect(annualEntry?.monthlyCents).toBe(5_000);
  });

  it("an empty obligation list produces a truthful empty summary (no NaN, no dangling rollups)", () => {
    const summary = summarizeRecurringObligations([]);
    expect(summary.obligationCount).toBe(0);
    expect(summary.totalMonthlyCommitmentCents).toBe(0);
    expect(summary.totalAnnualCommitmentCents).toBe(0);
    expect(summary.byFrequency).toEqual([]);
    expect(summary.byCategory).toEqual([]);
    expect(summary.autoPayCount).toBe(0);
    expect(summary.manualPayCount).toBe(0);
  });

  // ── Cross-OS navigation registry: Finance ↔ Concierge ───────

  it("CROSS_OS_LINKS exposes the canonical Finance↔Concierge navigation seams", () => {
    const ids = CROSS_OS_LINKS.map((l) => l.id);
    // Finance → Concierge
    expect(ids).toContain("fin-to-recurring");
    expect(ids).toContain("fin-to-household");
    // Concierge → Finance
    expect(ids).toContain("con-to-bills");
    expect(ids).toContain("con-to-subscriptions");
  });

  it("getCrossOSLinks('finance') routes the recurring-obligations seam at Concierge.recurring", () => {
    const link = getCrossOSLinks("finance").find((l) => l.id === "fin-to-recurring");
    expect(link).toBeDefined();
    expect(link?.sourceApp).toBe("finance");
    expect(link?.targetApp).toBe("concierge");
    expect(link?.targetModule).toBe("recurring");
  });

  it("getCrossOSLinks('concierge') routes the bills seam back at Finance.bills", () => {
    const link = getCrossOSLinks("concierge").find((l) => l.id === "con-to-bills");
    expect(link).toBeDefined();
    expect(link?.sourceApp).toBe("concierge");
    expect(link?.targetApp).toBe("finance");
    expect(link?.targetModule).toBe("bills");
  });

  // ── Trust lineage: Peace Score consumes Concierge signal ────

  it("Peace Score includes the 'household' dimension fed by the Concierge coordination signal", () => {
    const result = computePeaceScore(
      makePeaceScoreInput({
        // Concierge has reported that household coordination is strong.
        householdCoordinationScore: 90,
      }),
    );
    const household = result.dimensions.find((d) => d.key === "household");
    expect(household).toBeDefined();
    expect(household?.score).toBe(90);
    // The dimension must be weighted (>0) so its lineage is felt in the
    // overall Peace Score the user sees in Finance's emotional UI.
    expect(household?.weight ?? 0).toBeGreaterThan(0);
  });

  it("a low Concierge household-coordination signal lowers the Peace Score insight (lineage flows end-to-end)", () => {
    const high = computePeaceScore(
      makePeaceScoreInput({ householdCoordinationScore: 90 }),
    );
    const low = computePeaceScore(
      makePeaceScoreInput({ householdCoordinationScore: 20 }),
    );
    const highHousehold = high.dimensions.find((d) => d.key === "household");
    const lowHousehold = low.dimensions.find((d) => d.key === "household");
    expect(highHousehold?.score).toBeGreaterThan(lowHousehold?.score ?? 0);
    // Same input deltas across a single dimension must produce a strictly
    // higher overall score for the Concierge-aligned scenario.
    expect(high.compositeScore).toBeGreaterThan(low.compositeScore);
  });
});
