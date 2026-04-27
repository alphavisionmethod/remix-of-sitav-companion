// ═══════════════════════════════════════════════════════════════
// Cross-Module Integration Deepening — Phase 2
// CRM ↔ Finance hardening: company-side bridge helpers + reverse
// navigation resolver. Exercises the new helpers in
// `crm-finance-bridge.service.ts` against a richer in-memory mock
// of the canonical `fromTable` chain so we cover real query shapes
// (`.eq("crm_company_id", ...)` and joined column selects).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, vi, beforeEach } from "vitest";

type Row = Record<string, unknown>;

let mockUserId: string | null = "user-1";
const tables: Record<string, Row[]> = {};

function makeChain(table: string) {
  let rows: Row[] = [...(tables[table] ?? [])];
  let limitN: number | null = null;
  let order: { col: string; asc: boolean } | null = null;

  const chain: any = {
    select: () => chain,
    eq: (col: string, val: unknown) => {
      rows = rows.filter((r) => r[col] === val);
      return chain;
    },
    ilike: (col: string, val: string) => {
      const v = String(val).toLowerCase();
      rows = rows.filter((r) => String(r[col] ?? "").toLowerCase() === v);
      return chain;
    },
    in: (col: string, vals: unknown[]) => {
      rows = rows.filter((r) => vals.includes(r[col]));
      return chain;
    },
    or: () => chain,
    order: (col: string, opts: { ascending?: boolean } = {}) => {
      order = { col, asc: opts.ascending !== false };
      return chain;
    },
    limit: (n: number) => {
      limitN = n;
      return chain;
    },
    maybeSingle: async () => {
      if (order) {
        rows = [...rows].sort((a, b) => {
          const av = String(a[order!.col] ?? "");
          const bv = String(b[order!.col] ?? "");
          return order!.asc ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      const out = rows[0] ?? null;
      return { data: out, error: null };
    },
    single: async () => {
      const out = rows[0];
      if (!out) return { data: null, error: { message: "not found" } };
      return { data: out, error: null };
    },
    insert: (row: Row) => {
      const stamped = { id: `row-${Math.random().toString(36).slice(2, 8)}`, ...row };
      tables[table] = [...(tables[table] ?? []), stamped];
      return {
        select: () => ({
          single: async () => ({ data: stamped, error: null }),
        }),
      };
    },
    delete: () => ({ eq: () => ({ eq: async () => ({ error: null }) }) }),
    then: (cb: any) => {
      if (order) {
        rows = [...rows].sort((a, b) => {
          const av = String(a[order!.col] ?? "");
          const bv = String(b[order!.col] ?? "");
          return order!.asc ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      }
      const sliced = limitN != null ? rows.slice(0, limitN) : rows;
      return Promise.resolve({ data: sliced, error: null }).then(cb);
    },
  };
  return chain;
}

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: mockUserId ? { id: mockUserId } : null },
          error: null,
        }),
    },
    from: (t: string) => makeChain(t),
  },
}));

vi.mock("@/lib/supabase-helpers", () => ({
  fromTable: (t: string) => makeChain(t),
}));

const importBridge = () =>
  import("@/lib/services/business-os/crm-finance-bridge.service");

function seedLink(
  contactId: string,
  customerId: string,
  companyId: string | null = null,
  extras: Row = {},
) {
  tables.crm_customer_link = [
    ...(tables.crm_customer_link ?? []),
    {
      id: `link-${(tables.crm_customer_link ?? []).length + 1}`,
      user_id: "user-1",
      crm_contact_id: contactId,
      crm_company_id: companyId,
      customer_id: customerId,
      link_source: "manual",
      created_at: new Date(Date.now() - Math.random() * 1e8).toISOString(),
      ...extras,
    },
  ];
}

describe("Phase 2 — CRM ↔ Finance hardening", () => {
  beforeEach(() => {
    for (const k of Object.keys(tables)) delete tables[k];
    mockUserId = "user-1";
  });

  describe("findCustomersForCompany", () => {
    it("returns the deduplicated set of customers reachable from a company's contacts", async () => {
      // Two contacts under company-A pointing to the same customer →
      // dedup; a third contact pointing to a distinct customer.
      seedLink("contact-1", "customer-1", "company-A");
      seedLink("contact-2", "customer-1", "company-A");
      seedLink("contact-3", "customer-2", "company-A");
      // Noise — different company, must not leak in.
      seedLink("contact-4", "customer-3", "company-B");

      const { findCustomersForCompany } = await importBridge();
      const out = await findCustomersForCompany("company-A");
      expect(out.map((r) => r.customer_id).sort()).toEqual(["customer-1", "customer-2"]);
    });

    it("returns [] when no contact under the company has been billed", async () => {
      const { findCustomersForCompany } = await importBridge();
      const out = await findCustomersForCompany("company-empty");
      expect(out).toEqual([]);
    });
  });

  describe("findPrimaryCustomerForCompany", () => {
    it("returns null when no link exists", async () => {
      const { findPrimaryCustomerForCompany } = await importBridge();
      await expect(findPrimaryCustomerForCompany("company-empty")).resolves.toBeNull();
    });

    it("returns the most recently linked customer (matches UI 'primary contact' heuristic)", async () => {
      const past = new Date("2026-01-01").toISOString();
      const recent = new Date("2026-04-01").toISOString();
      seedLink("contact-old", "customer-old", "company-A", { created_at: past });
      seedLink("contact-new", "customer-new", "company-A", { created_at: recent });

      const { findPrimaryCustomerForCompany } = await importBridge();
      const out = await findPrimaryCustomerForCompany("company-A");
      expect(out?.customer_id).toBe("customer-new");
    });
  });

  describe("resolveCrmEntityForCustomer", () => {
    it("returns null when the customer has no bridge link (truthful empty state)", async () => {
      const { resolveCrmEntityForCustomer } = await importBridge();
      await expect(resolveCrmEntityForCustomer("customer-orphan")).resolves.toBeNull();
    });
  });
});