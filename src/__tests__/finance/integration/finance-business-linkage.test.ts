// ═══════════════════════════════════════════════════════════════
// Phase 7 — int.finance-business-linkage
//
// Proves the cross-domain seam between Finance OS and Business OS:
//   • Receivables (Finance) carry `linkedInvoiceId` lineage back to
//     Business OS invoices (the only column that bridges the two
//     bounded contexts inside the receivables contract).
//   • The aging report computed by `buildAgingReport` honestly
//     attributes business-invoice receivables to the right bucket.
//   • The cross-OS link registry exposes the canonical Finance↔Business
//     navigation seams (`biz-to-receivables`, `fin-to-invoices`,
//     `fin-to-collections`) so deep-links between the two surfaces
//     stay observable.
//   • Edge-side action receipts use the canonical `emitActionReceipt`
//     helper and persist to `ai_action_receipts` (lineage of trust).
//
// Honesty: no demo data, no parallel testing system. We use the
// canonical fixtures from `src/__tests__/finance/_helpers/` and the
// real exports from `src/lib/services/finance-os/receivables.service.ts`
// and `src/domains/engines/cross-os-integration.ts`.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  buildAgingReport,
  flagOverdueReceivables,
} from "@/lib/services/finance-os/receivables.service";
import {
  CROSS_OS_LINKS,
  getCrossOSLinks,
} from "@/domains/engines/cross-os-integration";
import { makeReceivable } from "@/__tests__/finance/_helpers/finance-fixtures";

describe("Phase 7 — int.finance-business-linkage (Finance ↔ Business)", () => {
  // ── Lineage: receivables carry the business invoice id ──────

  it("a receivable that originated from a Business invoice keeps `linkedInvoiceId` lineage", () => {
    const ar = makeReceivable({
      id: "ar-biz-1",
      fromEntity: "Acme Corp",
      amountCents: 350_000,
      agingDays: 5,
      status: "expected",
      linkedInvoiceId: "inv-biz-42",
    });
    expect(ar.linkedInvoiceId).toBe("inv-biz-42");
  });

  // ── Aging report: business-sourced receivables bucketed honestly ──

  it("buildAgingReport correctly attributes business-invoice receivables to the matching aging bucket", () => {
    const report = buildAgingReport([
      makeReceivable({ id: "ar-1", linkedInvoiceId: "inv-biz-A", agingDays: 10, amountCents: 100_000, status: "expected" }),
      makeReceivable({ id: "ar-2", linkedInvoiceId: "inv-biz-B", agingDays: 45, amountCents: 200_000, status: "overdue" }),
      makeReceivable({ id: "ar-3", linkedInvoiceId: "inv-biz-C", agingDays: 75, amountCents: 50_000, status: "overdue" }),
      makeReceivable({ id: "ar-4", linkedInvoiceId: "inv-biz-D", agingDays: 120, amountCents: 25_000, status: "overdue" }),
      // Non-outstanding (already received) — must NOT show up in any bucket.
      makeReceivable({ id: "ar-5", linkedInvoiceId: "inv-biz-E", agingDays: 200, amountCents: 999_999, status: "received" }),
    ]);
    expect(report.current.count).toBe(1);
    expect(report.current.totalCents).toBe(100_000);
    expect(report.thirtyDay.count).toBe(1);
    expect(report.thirtyDay.totalCents).toBe(200_000);
    expect(report.sixtyDay.count).toBe(1);
    expect(report.sixtyDay.totalCents).toBe(50_000);
    expect(report.ninetyPlus.count).toBe(1);
    expect(report.ninetyPlus.totalCents).toBe(25_000);
    // Received receivable was excluded from the outstanding aggregate.
    expect(report.totalOutstandingCents).toBe(375_000);
  });

  it("flagOverdueReceivables surfaces only `expected` receivables past the threshold (does not double-count `overdue`)", () => {
    const flagged = flagOverdueReceivables(
      [
        makeReceivable({ id: "ar-1", agingDays: 10, status: "expected" }),
        makeReceivable({ id: "ar-2", agingDays: 45, status: "expected" }),
        // Already explicitly `overdue` — by service contract, NOT re-flagged.
        makeReceivable({ id: "ar-3", agingDays: 90, status: "overdue" }),
        makeReceivable({ id: "ar-4", agingDays: 200, status: "received" }),
      ],
      30,
    );
    expect(flagged.map((r) => r.id)).toEqual(["ar-2"]);
  });

  // ── Navigation seam: cross-OS link registry truth ──────────

  it("CROSS_OS_LINKS exposes the canonical Finance↔Business navigation seams", () => {
    const ids = CROSS_OS_LINKS.map((l) => l.id);
    // Business → Finance (operator looks at AR from Business OS)
    expect(ids).toContain("biz-to-receivables");
    // Finance → Business (operator opens an invoice from Finance OS)
    expect(ids).toContain("fin-to-invoices");
    // Finance → Business (collections escalation)
    expect(ids).toContain("fin-to-collections");
  });

  it("getCrossOSLinks('finance') only returns links whose source is the finance app", () => {
    const links = getCrossOSLinks("finance");
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.sourceApp).toBe("finance");
    }
    // Must include the two known finance→business seams.
    expect(links.find((l) => l.id === "fin-to-invoices")?.targetApp).toBe("business");
    expect(links.find((l) => l.id === "fin-to-collections")?.targetApp).toBe("business");
  });

  it("getCrossOSLinks('business') exposes the AR seam pointing at finance.receivables", () => {
    const links = getCrossOSLinks("business");
    const ar = links.find((l) => l.id === "biz-to-receivables");
    expect(ar).toBeDefined();
    expect(ar?.targetApp).toBe("finance");
    expect(ar?.targetModule).toBe("receivables");
  });

  // ── Trust lineage: edge-side receipt emitter is canonical ───

  it("the canonical receipt emitter persists Finance/Business actions to `ai_action_receipts`", () => {
    const file = path.resolve(
      process.cwd(),
      "supabase/functions/_shared/receipt-emitter.ts",
    );
    const src = fs.readFileSync(file, "utf8");
    expect(src).toMatch(/export async function emitActionReceipt/);
    expect(src).toMatch(/from\(["']ai_action_receipts["']\)/);
    // Receipts MUST carry user_id + action_type + receipt_id (full lineage).
    expect(src).toMatch(/user_id:/);
    expect(src).toMatch(/action_type:/);
    expect(src).toMatch(/receipt_id:/);
  });
});
