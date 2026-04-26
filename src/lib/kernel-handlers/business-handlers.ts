// ═══════════════════════════════════════════════════════════════
// Business domain handlers — Opportunities, Quotes, Customers.
// Translates UI payloads (legacy field names) into canonical DB
// columns so existing pages keep working while we incrementally
// align field names in Phase 3.
// ═══════════════════════════════════════════════════════════════

import type { ExecutorService } from "@/lib/core-services/executor-service";
import { safe, insertRow, updateRowById, deleteRowById, pickId } from "./_shared";

/** Convert any numeric "dollar" value (number, "12.34", null) to integer cents. */
function toCents(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function nullableIso(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;
  // Date inputs return YYYY-MM-DD — Postgres accepts this for timestamptz.
  return value;
}

export function registerBusinessHandlers(executor: ExecutorService): void {
  // ── Opportunities (table: crm_opportunities) ──────────────────
  executor.registerHandler("business.opportunity.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { title, value, confidence, stage, next_action }
      // DB columns: title, value (numeric), probability (int), stage, notes, contact_id, company_id
      const row = await insertRow("crm_opportunities", {
        title: String(p.title ?? "Untitled"),
        value: p.value !== null && p.value !== undefined ? Number(p.value) : 0,
        probability: typeof p.confidence === "number" ? p.confidence : 20,
        stage: typeof p.stage === "string" ? p.stage : "Discovery",
        notes: typeof p.next_action === "string" ? p.next_action : null,
        contact_id: (p.contact_id as string | null) ?? null,
        company_id: (p.company_id as string | null) ?? null,
        status: "open",
      });
      return { entity: "opportunity", id: row.id, row };
    });
  });

  executor.registerHandler("business.opportunity.update-stage", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const stage = typeof p.stage === "string" ? p.stage : "Discovery";
      const patch: Record<string, unknown> = { stage };
      if (stage === "won") patch.won_at = new Date().toISOString();
      if (stage === "lost") patch.lost_at = new Date().toISOString();
      const row = await updateRowById("crm_opportunities", id, patch);
      return { entity: "opportunity", id, row };
    });
  });

  executor.registerHandler("business.opportunity.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("crm_opportunities", id);
      return { entity: "opportunity", ...result };
    });
  });

  // ── Quotes (table: quotes) ───────────────────────────────────
  executor.registerHandler("business.quote.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { title, total, expiry_date, notes, status }
      // DB columns: title, amount_cents, expires_at, status, opportunity_id, crm_contact_id, crm_company_id, metadata
      const row = await insertRow("quotes", {
        title: String(p.title ?? "Untitled"),
        amount_cents: toCents(p.total ?? p.amount_cents),
        expires_at: nullableIso(p.expiry_date ?? p.expires_at),
        status: typeof p.status === "string" ? p.status : "draft",
        opportunity_id: (p.opportunity_id as string | null) ?? null,
        crm_contact_id: (p.crm_contact_id as string | null) ?? null,
        crm_company_id: (p.crm_company_id as string | null) ?? null,
        metadata: { notes: p.notes ?? null },
      });
      return { entity: "quote", id: row.id, row };
    });
  });

  executor.registerHandler("business.quote.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("quotes", id);
      return { entity: "quote", ...result };
    });
  });

  // ── Generic status update for quotes / proposals / opportunities (used by QuotesWorkspace) ──
  executor.registerHandler("business.status.update", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const status = typeof p.status === "string" ? p.status : null;
      if (!status) throw new Error("status required");
      // The page contextually uses this for quotes (the only place wired today).
      // If a future page extends to proposals, pass `entity: "proposal"`.
      const entity = (p.entity as string | undefined) ?? "quote";
      const table = entity === "proposal" ? "proposals" : entity === "opportunity" ? "crm_opportunities" : "quotes";

      const patch: Record<string, unknown> = { status };
      if (entity === "quote") {
        if (status === "sent") patch.sent_at = new Date().toISOString();
        if (status === "accepted") patch.accepted_at = new Date().toISOString();
        if (status === "declined" || status === "rejected") patch.rejected_at = new Date().toISOString();
      } else if (entity === "proposal") {
        if (status === "sent") patch.sent_at = new Date().toISOString();
        if (status === "accepted" || status === "rejected") patch.decided_at = new Date().toISOString();
      }

      const row = await updateRowById(table, id, patch);
      return { entity, id, row };
    });
  });

  // ── Customers (table: customers) ─────────────────────────────
  executor.registerHandler("business.customer.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { name, email, company, phone, status }
      // DB columns: display_name, primary_email, primary_phone, status, metadata
      const row = await insertRow("customers", {
        display_name: String(p.name ?? p.display_name ?? "Unnamed"),
        primary_email: (p.email as string | null) ?? null,
        primary_phone: (p.phone as string | null) ?? null,
        status: typeof p.status === "string" ? p.status : "active",
        metadata: { company: p.company ?? null },
      });
      return { entity: "customer", id: row.id, row };
    });
  });

  executor.registerHandler("business.customer.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("customers", id);
      return { entity: "customer", ...result };
    });
  });
}