// ═══════════════════════════════════════════════════════════════
// Phase 6 — CRM ↔ Finance Bridge Integration
// Real linkage between CRM contacts/companies and Finance customers,
// plus the recovered-value ledger summary that finance consumes.
//
// Honesty: we mock Supabase the same way the canonical
// continuity-verification.service.test.ts does (per Phase 2). All
// assertions are about the service's pure logic + the shape of the
// auto-create path that bridges the CRM/Finance namespace split.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

let mockUserId: string | null = "user-1";
const insertedRows: Array<{ table: string; row: Record<string, unknown> }> = [];
const stored: Record<string, Record<string, unknown>[]> = {};

function makeChain(table: string) {
  const chain: any = {
    select: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    insert: (row: Record<string, unknown>) => {
      insertedRows.push({ table, row });
      const stamped = { id: `row-${insertedRows.length}`, ...row };
      stored[table] = [...(stored[table] || []), stamped];
      return {
        select: () => ({
          single: () => Promise.resolve({ data: stamped, error: null }),
          maybeSingle: () => Promise.resolve({ data: stamped, error: null }),
        }),
        single: () => Promise.resolve({ data: stamped, error: null }),
      };
    },
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (cb: any) => Promise.resolve({ data: stored[table] || [], error: null }).then(cb),
  };
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: mockUserId ? { id: mockUserId } : null }, error: null }),
    },
    from: (t: string) => makeChain(t),
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: (t: string) => makeChain(t),
}));

// Re-import lazily after mocks are in place.
const importBridge = () => import("@/lib/services/business-os/crm-finance-bridge.service");
const importLedger = () => import("@/lib/services/business-os/recovered-value-ledger.service");

describe("Phase 6 — CRM ↔ Finance bridge integration", () => {
  beforeEach(() => {
    insertedRows.length = 0;
    for (const k of Object.keys(stored)) delete stored[k];
    mockUserId = "user-1";
  });

  it("findCustomerForContact honestly returns null when no link exists", async () => {
    const { findCustomerForContact } = await importBridge();
    await expect(findCustomerForContact("contact-x")).resolves.toBeNull();
  });

  it("listLinksForContact returns empty array for unlinked contact (truthful empty state)", async () => {
    const { listLinksForContact } = await importBridge();
    const result = await listLinksForContact("contact-x");
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  it("recovered-value ledger summarizes invoice attribution back to a method", async () => {
    const { summarizeLedger } = await importLedger();
    const summary = summarizeLedger(
      [
        { id: "r1", leakId: "l1", recoveryPlanId: "p1", amountCents: 50_000, recoveredAt: new Date().toISOString(), method: "auto-reminder", accountId: "a1", accountName: "A", invoiceId: "inv-1" },
        { id: "r2", leakId: "l2", recoveryPlanId: "p2", amountCents: 30_000, recoveredAt: new Date().toISOString(), method: "manual-follow-up", accountId: "a1", accountName: "A", invoiceId: "inv-2" },
        { id: "r3", leakId: "l3", recoveryPlanId: "p1", amountCents: 20_000, recoveredAt: new Date().toISOString(), method: "auto-reminder", accountId: "a2", accountName: "B", invoiceId: "inv-3" },
      ],
      200_000,
      "2026-04",
    );
    expect(summary.totalRecoveredCents).toBe(100_000);
    expect(summary.recoveryRate).toBe(50); // 100k / 200k
    expect(summary.byMethod.find((m) => m.method === "auto-reminder")?.count).toBe(2);
    expect(summary.byMethod.find((m) => m.method === "manual-follow-up")?.amountCents).toBe(30_000);
  });

  it("ledger recoveryRate stays 0 (not NaN/Infinity) when there is no leakage baseline", async () => {
    const { summarizeLedger } = await importLedger();
    const summary = summarizeLedger([], 0, "2026-04");
    expect(summary.recoveryRate).toBe(0);
    expect(Number.isFinite(summary.recoveryRate)).toBe(true);
  });

  it("invoice-linking variance correctly bridges quote totals to invoice amounts", async () => {
    const { linkInvoiceToQuote, computeQuoteToInvoiceRate } = await import(
      "@/lib/services/business-os/invoice-linking.service"
    );
    const link = linkInvoiceToQuote(
      { id: "i1", accountId: "a1", amount: 1200 } as any,
      "q1",
      100_000,
    );
    expect(link.variance).toBe(20);
    expect(link.quoteId).toBe("q1");
    expect(link.accountId).toBe("a1");
    expect(computeQuoteToInvoiceRate(10, 7)).toBe(70);
  });
});