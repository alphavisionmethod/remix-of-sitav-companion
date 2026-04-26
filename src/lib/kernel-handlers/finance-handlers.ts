// ═══════════════════════════════════════════════════════════════
// Finance domain handlers — Invoices, Bills, Subscriptions, Reserves.
// ═══════════════════════════════════════════════════════════════

import type { ExecutorService } from "@/lib/core-services/executor-service";
import { safe, insertRow, updateRowById, deleteRowById, pickId } from "./_shared";

function toCents(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function nullableIso(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;
  return value;
}

export function registerFinanceHandlers(executor: ExecutorService): void {
  // ── Invoices (table: invoices) ───────────────────────────────
  executor.registerHandler("finance.invoice.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { invoice_number, amount, due_date, notes, status }
      // DB columns: invoice_number, amount_cents, currency, status, due_at, line_items, metadata
      const row = await insertRow("invoices", {
        invoice_number: typeof p.invoice_number === "string" ? p.invoice_number : null,
        amount_cents: toCents(p.amount ?? p.amount_cents),
        currency: typeof p.currency === "string" ? p.currency : "USD",
        status: typeof p.status === "string" ? p.status : "draft",
        due_at: nullableIso(p.due_date ?? p.due_at),
        customer_id: (p.customer_id as string | null) ?? null,
        opportunity_id: (p.opportunity_id as string | null) ?? null,
        proposal_id: (p.proposal_id as string | null) ?? null,
        quote_id: (p.quote_id as string | null) ?? null,
        crm_contact_id: (p.crm_contact_id as string | null) ?? null,
        crm_company_id: (p.crm_company_id as string | null) ?? null,
        metadata: { notes: p.notes ?? null },
      });
      return { entity: "invoice", id: row.id, row };
    });
  });

  executor.registerHandler("finance.invoice.status", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const status = typeof p.status === "string" ? p.status : null;
      if (!status) throw new Error("status required");
      const patch: Record<string, unknown> = { status };
      if (status === "sent") patch.issued_at = new Date().toISOString();
      if (status === "paid") patch.paid_at = new Date().toISOString();
      const row = await updateRowById("invoices", id, patch);
      return { entity: "invoice", id, row };
    });
  });

  executor.registerHandler("finance.invoice.delete", async (env) => {
    return safe(async () => {
      // Page calls deleteInvoice.mutate(selected.id) — pickId handles raw string.
      const id = pickId(env.payload);
      const result = await deleteRowById("invoices", id);
      return { entity: "invoice", ...result };
    });
  });

  // ── Bills (table: bills) ─────────────────────────────────────
  executor.registerHandler("finance.bill.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends BillForm: { payee, amount, due_date, category, recurring, frequency, auto_pay, notes }
      // DB columns: vendor, amount_cents, currency, due_at, status, recurrence, metadata
      const row = await insertRow("bills", {
        vendor: String(p.payee ?? p.vendor ?? "Unknown"),
        amount_cents: toCents(p.amount ?? p.amount_cents),
        currency: typeof p.currency === "string" ? p.currency : "USD",
        due_at: nullableIso(p.due_date ?? p.due_at),
        status: typeof p.status === "string" ? p.status : "upcoming",
        recurrence: p.recurring ? String(p.frequency ?? "monthly") : null,
        metadata: {
          category: p.category ?? null,
          auto_pay: !!p.auto_pay,
          notes: p.notes ?? null,
        },
      });
      return { entity: "bill", id: row.id, row };
    });
  });

  executor.registerHandler("finance.bill.update", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const bill = (p.bill as Record<string, unknown> | undefined) ?? {};
      const patch: Record<string, unknown> = {};
      if (bill.payee !== undefined) patch.vendor = String(bill.payee);
      if (bill.amount !== undefined) patch.amount_cents = toCents(bill.amount);
      if (bill.due_date !== undefined) patch.due_at = nullableIso(bill.due_date);
      if (bill.recurring !== undefined) patch.recurrence = bill.recurring ? String(bill.frequency ?? "monthly") : null;
      if (bill.category !== undefined || bill.auto_pay !== undefined || bill.notes !== undefined) {
        patch.metadata = {
          category: bill.category ?? null,
          auto_pay: !!bill.auto_pay,
          notes: bill.notes ?? null,
        };
      }
      const row = await updateRowById("bills", id, patch);
      return { entity: "bill", id, row };
    });
  });

  executor.registerHandler("finance.bill.pay", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const row = await updateRowById("bills", id, {
        status: "paid",
        paid_at: new Date().toISOString(),
      });
      return { entity: "bill", id, row };
    });
  });

  executor.registerHandler("finance.bill.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("bills", id);
      return { entity: "bill", ...result };
    });
  });

  // ── Subscriptions (table: subscriptions) ─────────────────────
  executor.registerHandler("finance.subscription.status", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const status = typeof p.status === "string" ? p.status : null;
      if (!status) throw new Error("status required");
      const row = await updateRowById("subscriptions", id, { status });
      return { entity: "subscription", id, row };
    });
  });

  executor.registerHandler("finance.subscription.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("subscriptions", id);
      return { entity: "subscription", ...result };
    });
  });

  // ── Reserves (table: reserves) ───────────────────────────────
  executor.registerHandler("finance.reserve.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { name, target_amount, category, contribution_amount }
      // DB columns: name, reserve_type, balance_cents, target_cents, status, metadata
      const row = await insertRow("reserves", {
        name: String(p.name ?? "New Reserve"),
        reserve_type: typeof p.category === "string" ? p.category : "goal",
        balance_cents: toCents(p.balance ?? 0),
        target_cents: p.target_amount !== undefined ? toCents(p.target_amount) : null,
        status: "healthy",
        metadata: {
          contribution_amount: p.contribution_amount ?? null,
        },
      });
      return { entity: "reserve", id: row.id, row };
    });
  });

  executor.registerHandler("finance.reserve.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("reserves", id);
      return { entity: "reserve", ...result };
    });
  });
}