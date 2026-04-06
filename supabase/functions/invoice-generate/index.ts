import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
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
      const total_cents = d.line_items.reduce((s, i) => s + i.quantity * i.unit_price_cents, 0);
      const invoice_number = `INV-${Date.now()}`;
      const { data: inv, error } = await supabase.from("invoices").insert({
        user_id: user.id, customer_id: d.customer_id, invoice_number,
        line_items: d.line_items, total_cents, currency: d.currency,
        due_date: d.due_date, notes: d.notes || null, status: "draft",
      }).select().single();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "invoice_generated", category: "finance",
        actor: "invoice-generate", target_type: "invoice", target_id: inv.id,
        severity: "low", details: { invoice_number, total_cents },
      });
      return corsResponse({ invoice: inv }, 201);
    }

    if (d.action === "send") {
      const { data: inv, error } = await supabase.from("invoices")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", d.invoice_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("communication_log").insert({
        user_id: user.id, channel: d.channel, direction: "outbound",
        subject: `Invoice ${inv.invoice_number}`, status: "sent",
        metadata: { invoice_id: inv.id },
      });
      await supabase.from("receipts").insert({
        user_id: user.id, receipt_type: "invoice_sent", reference_id: inv.id,
        amount_cents: inv.total_cents, currency: inv.currency || "USD",
        metadata: { channel: d.channel },
      });
      return corsResponse({ invoice: inv });
    }

    if (d.action === "mark-paid") {
      const { data: inv, error } = await supabase.from("invoices")
        .update({ status: "paid", paid_at: new Date().toISOString(), payment_method: d.payment_method, payment_ref: d.payment_ref })
        .eq("id", d.invoice_id).eq("user_id", user.id).select().single();
      if (error) return corsError(error.message, 404);

      await supabase.from("receipts").insert({
        user_id: user.id, receipt_type: "invoice_paid", reference_id: inv.id,
        amount_cents: inv.total_cents, currency: inv.currency || "USD",
        metadata: { payment_method: d.payment_method, payment_ref: d.payment_ref },
      });
      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "invoice_paid", category: "finance",
        actor: "invoice-generate", target_type: "invoice", target_id: inv.id,
        severity: "medium", details: { total_cents: inv.total_cents },
      });
      return corsResponse({ invoice: inv });
    }

    if (d.action === "void") {
      const { data: inv, error } = await supabase.from("invoices")
        .update({ status: "void", void_reason: d.reason })
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
    return corsError(e.message || "Internal error", 500);
  }
});
