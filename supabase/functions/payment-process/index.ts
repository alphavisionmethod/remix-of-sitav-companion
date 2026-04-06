import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("initiate"),
    amount_cents: z.number().int().positive(),
    currency: z.string().length(3).default("USD"),
    account_id: z.string().uuid(),
    description: z.string().max(500),
    recipient: z.string().max(255).optional(),
    category: z.string().max(100).optional(),
  }),
  z.object({
    action: z.literal("verify"),
    approval_id: z.string().uuid(),
  }),
  z.object({
    action: z.literal("list-pending"),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  z.object({
    action: z.literal("cancel"),
    approval_id: z.string().uuid(),
    reason: z.string().max(500).optional(),
  }),
]);

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const rl = checkRateLimit(`payment:${user.id}`, 30);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const body = await req.json();
    const v = zodValidate(body, ActionSchema);
    if (!v.success) return v.response;
    const d = v.data;

    if (d.action === "list-pending") {
      const { data, error } = await supabase.from("approval_queue")
        .select("*").eq("user_id", user.id).eq("status", "pending")
        .eq("action_type", "payment").order("created_at", { ascending: false }).limit(d.limit);
      if (error) return corsError(error.message, 500);
      return corsResponse({ pending: data });
    }

    if (d.action === "initiate") {
      // Check account balance (warn only)
      const { data: acct } = await supabase.from("financial_accounts")
        .select("balance_cents, account_name").eq("id", d.account_id).eq("user_id", user.id).single();
      const balance_warning = acct && (acct.balance_cents || 0) < d.amount_cents;

      const { data: approval, error } = await supabase.from("approval_queue").insert({
        user_id: user.id, action_type: "payment", status: "pending",
        requested_by: user.id, priority: d.amount_cents > 100000 ? "high" : "normal",
        payload: {
          amount_cents: d.amount_cents, currency: d.currency, account_id: d.account_id,
          description: d.description, recipient: d.recipient, category: d.category,
          balance_warning,
        },
      }).select().single();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "payment_initiated", category: "finance",
        actor: "payment-process", target_type: "approval_queue", target_id: approval.id,
        severity: d.amount_cents > 100000 ? "high" : "medium",
        details: { amount_cents: d.amount_cents, account_id: d.account_id, balance_warning },
      });
      return corsResponse({ approval, balance_warning }, 201);
    }

    if (d.action === "verify") {
      const { data: approval, error } = await supabase.from("approval_queue")
        .select("*").eq("id", d.approval_id).eq("user_id", user.id).single();
      if (error || !approval) return corsError("Approval not found", 404);

      if (approval.status === "approved") {
        const payload = approval.payload as any;
        const hash = await crypto.subtle.digest("SHA-256",
          new TextEncoder().encode(`${approval.id}:${payload.amount_cents}:${Date.now()}`));
        const hashHex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");

        await supabase.from("approval_queue").update({ status: "executed" }).eq("id", approval.id);

        const { data: receipt } = await supabase.from("receipts").insert({
          user_id: user.id, receipt_type: "payment_executed", reference_id: approval.id,
          amount_cents: payload.amount_cents, currency: payload.currency || "USD",
          metadata: { hash: hashHex, account_id: payload.account_id, recipient: payload.recipient },
        }).select().single();

        await supabase.from("audit_logs").insert({
          user_id: user.id, action: "payment_executed", category: "finance",
          actor: "payment-process", target_type: "receipt", target_id: receipt?.id,
          severity: "high", details: { hash: hashHex, amount_cents: payload.amount_cents },
        });
        return corsResponse({ status: "executed", receipt, hash: hashHex });
      }

      return corsResponse({ status: approval.status, approval });
    }

    if (d.action === "cancel") {
      const { data: approval, error } = await supabase.from("approval_queue")
        .update({ status: "dismissed", reviewed_at: new Date().toISOString(), review_notes: d.reason })
        .eq("id", d.approval_id).eq("user_id", user.id).eq("status", "pending").select().single();
      if (error) return corsError("Cannot cancel — not found or not pending", 404);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "payment_cancelled", category: "finance",
        actor: "payment-process", target_type: "approval_queue", target_id: approval.id,
        severity: "medium", details: { reason: d.reason },
      });
      return corsResponse({ status: "cancelled", approval });
    }

    return corsError("Unknown action", 400);
  } catch (e) {
    return corsError(e.message || "Internal error", 500);
  }
});
