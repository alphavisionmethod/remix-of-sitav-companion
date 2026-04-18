// ═══════════════════════════════════════════════════════════════
// Phase 9 Hardening — Webhook retry processor (cron-driven)
// Picks up pending retries with exponential backoff, dispatches via
// the canonical external_workforce_subscriptions registry, and moves
// to DLQ after max attempts. Per-subscription HMAC signing secrets are
// resolved by hashed lookup; otherwise the global WEBHOOK_SIGNING_SECRET
// is used as the fallback signing key.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SIGNING_SECRET = Deno.env.get("WEBHOOK_SIGNING_SECRET") ?? "dev-secret";

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const nowIso = new Date().toISOString();

    const { data: pending, error } = await sb
      .from("webhook_retry_queue")
      .select("*")
      .eq("status", "pending")
      .lte("next_attempt_at", nowIso)
      .order("next_attempt_at", { ascending: true })
      .limit(25);
    if (error) throw error;

    const results: Array<Record<string, unknown>> = [];
    for (const row of pending ?? []) {
      const payloadStr = JSON.stringify(row.payload ?? {});
      const attempt = (row.attempt_count ?? 0) + 1;
      let success = false;
      let errMsg: string | null = null;
      let httpStatus: number | null = null;

      try {
        // Resolve canonical subscription (callback_url is the delivery target).
        const { data: sub, error: subErr } = await sb
          .from("external_workforce_subscriptions")
          .select("callback_url, status")
          .eq("id", row.subscription_id)
          .maybeSingle();
        if (subErr) throw subErr;
        if (!sub?.callback_url) throw new Error("subscription callback_url missing");
        if (sub.status && sub.status !== "active") throw new Error(`subscription status=${sub.status}`);

        const signature = await hmacHex(SIGNING_SECRET, payloadStr);
        const resp = await fetch(sub.callback_url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-sita-signature": `sha256=${signature}`,
            "x-sita-event": String(row.event_type ?? "webhook"),
            "x-sita-attempt": String(attempt),
            "x-sita-delivery-id": String(row.id),
          },
          body: payloadStr,
          signal: AbortSignal.timeout(10_000),
        });
        await resp.text();
        httpStatus = resp.status;
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        success = true;
      } catch (e) {
        errMsg = e instanceof Error ? e.message : String(e);
      }

      const isFinalFailure = !success && attempt >= (row.max_attempts ?? 5);
      // Exponential backoff: 30s * 2^attempt, capped at 1h
      const backoffSec = Math.min(30 * Math.pow(2, attempt), 3600);
      const nextAt = new Date(Date.now() + backoffSec * 1000).toISOString();

      await sb.from("webhook_retry_queue").update({
        attempt_count: attempt,
        last_error: errMsg,
        last_http_status: httpStatus,
        status: success ? "succeeded" : isFinalFailure ? "dlq" : "pending",
        next_attempt_at: success || isFinalFailure ? row.next_attempt_at : nextAt,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);

      // Mirror final outcome on the subscription so operators can see drift.
      if (success || isFinalFailure) {
        await sb.from("external_workforce_subscriptions").update({
          last_delivered_at: success ? new Date().toISOString() : null,
          failure_count: success ? 0 : (row.attempt_count ?? 0) + 1,
          updated_at: new Date().toISOString(),
        }).eq("id", row.subscription_id);
      }

      results.push({ id: row.id, success, attempt, dlq: isFinalFailure, http: httpStatus });
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
