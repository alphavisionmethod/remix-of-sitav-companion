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

  // ── Proposals (table: proposals) ─────────────────────────────
  executor.registerHandler("business.proposal.create", async (env) => {
    const p = env.payload;
    return safe(async () => {
      // UI sends { title, scope, content, status, quote_id, opportunity_id, crm_contact_id, crm_company_id }
      const row = await insertRow("proposals", {
        title: String(p.title ?? "Untitled Proposal"),
        scope: typeof p.scope === "string" ? p.scope : null,
        status: typeof p.status === "string" ? p.status : "draft",
        content: (p.content as Record<string, unknown> | null) ?? {},
        metadata: (p.metadata as Record<string, unknown> | null) ?? {},
        quote_id: (p.quote_id as string | null) ?? null,
        opportunity_id: (p.opportunity_id as string | null) ?? null,
        crm_contact_id: (p.crm_contact_id as string | null) ?? null,
        crm_company_id: (p.crm_company_id as string | null) ?? null,
        customer_id: (p.customer_id as string | null) ?? null,
      });
      return { entity: "proposal", id: row.id, row };
    });
  });

  executor.registerHandler("business.proposal.status", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const id = pickId(p);
      const status = typeof p.status === "string" ? p.status : null;
      if (!status) throw new Error("status required");
      const patch: Record<string, unknown> = { status };
      if (status === "sent") patch.sent_at = new Date().toISOString();
      if (status === "accepted" || status === "signed" || status === "rejected") {
        patch.decided_at = new Date().toISOString();
      }
      const row = await updateRowById("proposals", id, patch);
      return { entity: "proposal", id, row };
    });
  });

  executor.registerHandler("business.proposal.delete", async (env) => {
    return safe(async () => {
      const id = pickId(env.payload);
      const result = await deleteRowById("proposals", id);
      return { entity: "proposal", ...result };
    });
  });

  // ── Lineage transitions (Opportunity → Quote → Proposal → Invoice) ──
  // These are first-class actions: they create a downstream entity AND
  // stamp lineage FKs both ways, so v_revenue_lineage joins succeed.

  executor.registerHandler("business.opportunity.convert-to-quote", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const opportunityId = (p.opportunity_id as string) ?? pickId(p);
      // Fetch opportunity to inherit context
      const { fromTable } = await import("@/lib/supabase-helpers");
      const { data: opp, error: oppErr } = await fromTable("crm_opportunities")
        .select("id, title, value, contact_id, company_id, user_id")
        .eq("id", opportunityId)
        .single();
      if (oppErr || !opp) throw new Error(`Opportunity ${opportunityId} not found`);

      const quote = await insertRow("quotes", {
        title: `Quote — ${(opp as Record<string, unknown>).title ?? "Untitled"}`,
        amount_cents: Math.round(Number((opp as Record<string, unknown>).value ?? 0) * 100),
        currency: "USD",
        status: "draft",
        opportunity_id: opportunityId,
        crm_contact_id: ((opp as Record<string, unknown>).contact_id as string | null) ?? null,
        crm_company_id: ((opp as Record<string, unknown>).company_id as string | null) ?? null,
        metadata: { converted_from: "opportunity" },
      });
      return { entity: "quote", id: quote.id, row: quote, source_opportunity_id: opportunityId };
    });
  });

  executor.registerHandler("business.quote.convert-to-proposal", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const quoteId = (p.quote_id as string) ?? pickId(p);
      const { fromTable } = await import("@/lib/supabase-helpers");
      const { data: q, error: qErr } = await fromTable("quotes")
        .select("id, title, opportunity_id, crm_contact_id, crm_company_id, customer_id, amount_cents")
        .eq("id", quoteId)
        .single();
      if (qErr || !q) throw new Error(`Quote ${quoteId} not found`);

      const quote = q as Record<string, unknown>;
      const proposal = await insertRow("proposals", {
        title: `Proposal — ${quote.title ?? "Untitled"}`,
        status: "draft",
        scope: typeof p.scope === "string" ? p.scope : null,
        content: { source_quote_amount_cents: quote.amount_cents ?? 0 },
        metadata: { converted_from: "quote" },
        quote_id: quoteId,
        opportunity_id: (quote.opportunity_id as string | null) ?? null,
        crm_contact_id: (quote.crm_contact_id as string | null) ?? null,
        crm_company_id: (quote.crm_company_id as string | null) ?? null,
        customer_id: (quote.customer_id as string | null) ?? null,
      });

      // Back-link on the quote so v_revenue_lineage shows the chain.
      await updateRowById("quotes", quoteId, {
        converted_proposal_id: proposal.id,
      });

      return { entity: "proposal", id: proposal.id, row: proposal, source_quote_id: quoteId };
    });
  });

  executor.registerHandler("business.proposal.convert-to-invoice", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const proposalId = (p.proposal_id as string) ?? pickId(p);
      const { fromTable } = await import("@/lib/supabase-helpers");
      const { data: pr, error: prErr } = await fromTable("proposals")
        .select("id, title, quote_id, opportunity_id, crm_contact_id, crm_company_id, customer_id, content")
        .eq("id", proposalId)
        .single();
      if (prErr || !pr) throw new Error(`Proposal ${proposalId} not found`);

      const proposal = pr as Record<string, unknown>;
      // Inherit amount: explicit > quote source > 0
      let amountCents = 0;
      if (typeof p.amount_cents === "number") amountCents = p.amount_cents;
      else if (typeof p.amount === "number") amountCents = Math.round(p.amount * 100);
      else {
        const content = (proposal.content as Record<string, unknown> | null) ?? {};
        if (typeof content.source_quote_amount_cents === "number") {
          amountCents = content.source_quote_amount_cents;
        } else if (proposal.quote_id) {
          const { data: q } = await fromTable("quotes")
            .select("amount_cents")
            .eq("id", proposal.quote_id as string)
            .single();
          amountCents = Number((q as Record<string, unknown> | null)?.amount_cents ?? 0);
        }
      }

      const invoiceNumber = typeof p.invoice_number === "string"
        ? p.invoice_number
        : `INV-${Date.now().toString(36).toUpperCase()}`;

      const invoice = await insertRow("invoices", {
        invoice_number: invoiceNumber,
        amount_cents: amountCents,
        currency: "USD",
        status: "draft",
        due_at: typeof p.due_date === "string" ? p.due_date : null,
        proposal_id: proposalId,
        quote_id: (proposal.quote_id as string | null) ?? null,
        opportunity_id: (proposal.opportunity_id as string | null) ?? null,
        crm_contact_id: (proposal.crm_contact_id as string | null) ?? null,
        crm_company_id: (proposal.crm_company_id as string | null) ?? null,
        customer_id: (proposal.customer_id as string | null) ?? null,
        metadata: { converted_from: "proposal" },
      });

      // Back-link on the proposal (and quote, if present).
      await updateRowById("proposals", proposalId, {
        converted_invoice_id: invoice.id,
      });
      if (proposal.quote_id) {
        await updateRowById("quotes", proposal.quote_id as string, {
          converted_invoice_id: invoice.id,
        });
      }

      return { entity: "invoice", id: invoice.id, row: invoice, source_proposal_id: proposalId };
    });
  });

  // Direct quote → invoice (skip proposal step) — used by the QuotesWorkspace "Convert to Invoice" CTA.
  executor.registerHandler("business.quote.convert-to-invoice", async (env) => {
    const p = env.payload;
    return safe(async () => {
      const quoteId = (p.quote_id as string) ?? pickId(p);
      const { fromTable } = await import("@/lib/supabase-helpers");
      const { data: q, error: qErr } = await fromTable("quotes")
        .select("id, title, amount_cents, opportunity_id, crm_contact_id, crm_company_id, customer_id")
        .eq("id", quoteId)
        .single();
      if (qErr || !q) throw new Error(`Quote ${quoteId} not found`);

      const quote = q as Record<string, unknown>;
      const invoiceNumber = typeof p.invoice_number === "string"
        ? p.invoice_number
        : `INV-${Date.now().toString(36).toUpperCase()}`;

      const invoice = await insertRow("invoices", {
        invoice_number: invoiceNumber,
        amount_cents: Number(quote.amount_cents ?? 0),
        currency: "USD",
        status: "draft",
        due_at: typeof p.due_date === "string" ? p.due_date : null,
        quote_id: quoteId,
        opportunity_id: (quote.opportunity_id as string | null) ?? null,
        crm_contact_id: (quote.crm_contact_id as string | null) ?? null,
        crm_company_id: (quote.crm_company_id as string | null) ?? null,
        customer_id: (quote.customer_id as string | null) ?? null,
        metadata: { converted_from: "quote" },
      });

      await updateRowById("quotes", quoteId, {
        converted_invoice_id: invoice.id,
      });

      return { entity: "invoice", id: invoice.id, row: invoice, source_quote_id: quoteId };
    });
  });
}