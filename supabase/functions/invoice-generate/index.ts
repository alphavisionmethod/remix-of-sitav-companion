import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("generate"),
    customer_id: z.string().uuid(),
    line_items: z.array(z.object({
      description: z.string().max(500),
      quantity: z.number().positive(),
      unit_price_cents: z.number().int().min(0),
    })).min(1).max(50),
    due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    notes: z.string().max(2000).optional(),
    currency: z.string().length(3).default("USD"),
  }),
  z.object({
    action: z.literal("send"),
    invoice_id: z.string().uuid(),
    channel: z.enum(["email", "sms", "portal"]).default("email"),
    recipient_email: z.string().email().optional(),
  }),
  z.object({
    action: z.literal("render-html"),
    invoice_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("mark-paid"),
    invoice_id: z.string().uuid(),
    payment_method: z.string().max(100).optional(),
    payment_ref: z.string().max(255).optional(),
  }),
  z.object({
    action: z.literal("void"),
    invoice_id: z.string().uuid(),
    reason: z.string().max(500),
  }),
  z.object({
    action: z.literal("list"),
    status: z.string().max(50).optional(),
    customer_id: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(100).default(50),
  }),
]);

// ── HTML renderer ────────────────────────────────────────────────
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderInvoiceHtml(inv: any, customerLabel: string, recipientEmail: string | null): string {
  const lineItems = Array.isArray(inv.line_items) ? inv.line_items : [];
  const total = (Number(inv.amount_cents || 0) / 100).toFixed(2);
  const currency = inv.currency || "USD";
  const due = inv.due_at ? new Date(inv.due_at).toLocaleDateString() : "—";
  const issued = inv.issued_at
    ? new Date(inv.issued_at).toLocaleDateString()
    : new Date(inv.created_at).toLocaleDateString();
  const notes = (inv.metadata && typeof inv.metadata === "object" && "notes" in inv.metadata)
    ? String((inv.metadata as Record<string, unknown>).notes ?? "")
    : "";
  const rows = lineItems.map((li: any) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(String(li.description ?? ""))}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${Number(li.quantity ?? 0)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(Number(li.unit_price_cents ?? 0) / 100).toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${((Number(li.quantity ?? 0) * Number(li.unit_price_cents ?? 0)) / 100).toFixed(2)}</td>
    </tr>`).join("");
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Invoice ${escapeHtml(inv.invoice_number || "")}</title></head>
<body style="font-family:Inter,Arial,sans-serif;max-width:720px;margin:40px auto;color:#1a1a1a">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px">
    <div>
      <h1 style="margin:0 0 4px;font-size:24px">Invoice</h1>
      <p style="margin:0;color:#666;font-size:13px">#${escapeHtml(inv.invoice_number || "")}</p>
    </div>
    <div style="text-align:right;font-size:13px;color:#666">
      <div><strong>Issued</strong> ${escapeHtml(issued)}</div>
      <div><strong>Due</strong> ${escapeHtml(due)}</div>
    </div>
  </div>
  <div style="margin-bottom:24px;padding:16px;background:#f7f7fa;border-radius:8px">
    <div style="font-size:11px;text-transform:uppercase;color:#888;letter-spacing:0.05em">Bill to</div>
    <div style="font-size:15px;font-weight:600;margin-top:4px">${escapeHtml(customerLabel)}</div>
    ${recipientEmail ? `<div style="font-size:13px;color:#666">${escapeHtml(recipientEmail)}</div>` : ""}
  </div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
    <thead><tr style="background:#f7f7fa">
      <th style="padding:8px;text-align:left;font-size:11px;text-transform:uppercase;color:#888">Description</th>
      <th style="padding:8px;text-align:right;font-size:11px;text-transform:uppercase;color:#888">Qty</th>
      <th style="padding:8px;text-align:right;font-size:11px;text-transform:uppercase;color:#888">Unit</th>
      <th style="padding:8px;text-align:right;font-size:11px;text-transform:uppercase;color:#888">Amount</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="4" style="padding:16px;text-align:center;color:#999">No line items</td></tr>`}</tbody>
  </table>
  <div style="display:flex;justify-content:flex-end">
    <div style="text-align:right">
      <div style="font-size:12px;color:#888">Total due</div>
      <div style="font-size:28px;font-weight:700;margin-top:2px">$${total} <span style="font-size:14px;color:#888">${escapeHtml(currency)}</span></div>
    </div>
  </div>
  ${notes ? `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;font-size:13px;color:#555"><strong>Notes</strong><br/>${escapeHtml(notes)}</div>` : ""}
  <p style="margin-top:48px;font-size:11px;color:#aaa;text-align:center">HTML preview · PDF rendering coming soon</p>
</body></html>`;
}

async function loadInvoiceFull(supabase: any, userId: string, invoiceId: string) {
  return await supabase
    .from("invoices")
    .select("*, customers(display_name, primary_email), crm_contacts(display_name, primary_email), crm_companies(name)")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .maybeSingle();
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const rl = checkRateLimit(`invoice:${user.id}`, 60);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const body = await req.json();
    const v = zodValidate(body, ActionSchema);
    if (!v.success) return v.response;
    const d = v.data;

    if (d.action === "list") {
      let q = supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(d.limit);
      if (d.status) q = q.eq("status", d.status);
      if (d.customer_id) q = q.eq("customer_id", d.customer_id);
      const { data, error } = await q;
      if (error) return corsError(error.message, 500);
      return corsResponse({ invoices: data });
    }

    if (d.action === "generate") {
      const amount_cents = d.line_items.reduce((s, i) => s + i.quantity * i.unit_price_cents, 0);
      const invoice_number = `INV-${Date.now()}`;
      const { data: inv, error } = await supabase.from("invoices").insert({
        user_id: user.id,
        customer_id: d.customer_id,
        invoice_number,
        line_items: d.line_items,
        amount_cents,
        currency: d.currency,
        due_at: new Date(d.due_date + "T00:00:00Z").toISOString(),
        metadata: d.notes ? { notes: d.notes } : {},
        status: "draft",
      }).select().single();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "invoice_generated", category: "finance",
        actor: "invoice-generate", target_type: "invoice", target_id: inv.id,
        severity: "low", details: { invoice_number, amount_cents },
      });
      return corsResponse({ invoice: inv }, 201);
    }

    if (d.action === "render-html") {
      const { data: inv, error } = await loadInvoiceFull(supabase, user.id, d.invoice_id);
      if (error) return corsError(error.message, 500);
      if (!inv) return corsError("Invoice not found", 404);
      const customerLabel =
        (inv.customers as any)?.display_name ??
        (inv.crm_contacts as any)?.display_name ??
        (inv.crm_companies as any)?.name ??
        "Customer";
      const recipientEmail =
        (inv.customers as any)?.primary_email ??
        (inv.crm_contacts as any)?.primary_email ??
        null;
      const html = renderInvoiceHtml(inv, customerLabel, recipientEmail);
      return corsResponse({
        html,
        invoice_id: inv.id,
        invoice_number: inv.invoice_number,
        recipient_email: recipientEmail,
        format: "html",
        pdf_status: "deferred",
      });
    }

    if (d.action === "send") {
      const { data: invFull, error: loadErr } = await loadInvoiceFull(supabase, user.id, d.invoice_id);
      if (loadErr) return corsError(loadErr.message, 500);
      if (!invFull) return corsError("Invoice not found", 404);

      const resolvedRecipient =
        d.recipient_email ??
        (invFull.customers as any)?.primary_email ??
        (invFull.crm_contacts as any)?.primary_email ??
        null;

      // Mark sent (canonical columns only).
      const updates: Record<string, unknown> = { status: "sent" };
      if (!invFull.issued_at) updates.issued_at = new Date().toISOString();
      const { data: inv, error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", d.invoice_id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) return corsError(error.message, 500);

      // Log to canonical 'communications' table (real schema).
      await supabase.from("communications").insert({
        user_id: user.id,
        customer_id: invFull.customer_id ?? null,
        channel: d.channel,
        direction: "outbound",
        subject: `Invoice ${inv.invoice_number}`,
        body: resolvedRecipient
          ? `Invoice ${inv.invoice_number} dispatched to ${resolvedRecipient}.`
          : `Invoice ${inv.invoice_number} marked as sent (no recipient on file — provider delivery deferred).`,
        status: resolvedRecipient ? "sent" : "queued",
        sent_at: resolvedRecipient ? new Date().toISOString() : null,
        metadata: {
          invoice_id: inv.id,
          invoice_number: inv.invoice_number,
          recipient_email: resolvedRecipient,
          delivery_pending_provider: !resolvedRecipient,
        },
      });

      // Canonical receipt (real receipts schema).
      await supabase.from("receipts").insert({
        user_id: user.id,
        receipt_class: "business",
        subject_type: "invoice",
        subject_id: inv.id,
        actor_user_id: user.id,
        actor_kind: "user",
        action_key: "invoice.send",
        outcome: resolvedRecipient ? "success" : "deferred",
        payload: {
          invoice_number: inv.invoice_number,
          amount_cents: inv.amount_cents,
          currency: inv.currency,
          channel: d.channel,
          recipient_email: resolvedRecipient,
        },
        evidence: {
          provider: "internal-log-only",
          delivery_pending: !resolvedRecipient,
          note: "Email/SMS provider dispatch (Resend/Twilio) is deferred; this is a logged communication.",
        },
      });

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "invoice_sent", category: "finance",
        actor: "invoice-generate", target_type: "invoice", target_id: inv.id,
        severity: "low",
        details: { channel: d.channel, recipient_email: resolvedRecipient, has_recipient: !!resolvedRecipient },
      });

      return corsResponse({
        invoice: inv,
        recipient_email: resolvedRecipient,
        delivery_pending_provider: !resolvedRecipient,
      });
    }

    if (d.action === "mark-paid") {
      const { data: invPrev } = await supabase
        .from("invoices")
        .select("metadata")
        .eq("id", d.invoice_id)
        .eq("user_id", user.id)
        .maybeSingle();
      const prevMeta = (invPrev?.metadata && typeof invPrev.metadata === "object") ? invPrev.metadata as Record<string, unknown> : {};
      const { data: inv, error } = await supabase.from("invoices")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          metadata: { ...prevMeta, payment_method: d.payment_method ?? null, payment_ref: d.payment_ref ?? null },
        })
        .eq("id", d.invoice_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("receipts").insert({
        user_id: user.id,
        receipt_class: "finance",
        subject_type: "invoice",
        subject_id: inv.id,
        actor_user_id: user.id,
        actor_kind: "user",
        action_key: "invoice.mark-paid",
        outcome: "success",
        payload: {
          amount_cents: inv.amount_cents,
          currency: inv.currency || "USD",
          payment_method: d.payment_method ?? null,
          payment_ref: d.payment_ref ?? null,
        },
        evidence: { invoice_number: inv.invoice_number },
      });
      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "invoice_paid", category: "finance",
        actor: "invoice-generate", target_type: "invoice", target_id: inv.id,
        severity: "medium", details: { amount_cents: inv.amount_cents },
      });
      return corsResponse({ invoice: inv });
    }

    if (d.action === "void") {
      const { data: invPrev } = await supabase
        .from("invoices")
        .select("metadata")
        .eq("id", d.invoice_id)
        .eq("user_id", user.id)
        .maybeSingle();
      const prevMeta = (invPrev?.metadata && typeof invPrev.metadata === "object") ? invPrev.metadata as Record<string, unknown> : {};
      const { data: inv, error } = await supabase.from("invoices")
        .update({ status: "void", metadata: { ...prevMeta, void_reason: d.reason } })
        .eq("id", d.invoice_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "invoice_voided", category: "finance",
        actor: "invoice-generate", target_type: "invoice", target_id: inv.id,
        severity: "medium", details: { reason: d.reason },
      });
      return corsResponse({ invoice: inv });
    }

    return corsError("Unknown action", 400);
  } catch (e) {
    return corsError((e as Error).message || "Internal error", 500);
  }
});
