// ═══════════════════════════════════════════════════════════════
// Phase 9 Hardening — Webhook retry processor (cron-driven)
// Picks up pending retries with exponential backoff, dispatches via
// the canonical webhook-dispatcher, and moves to DLQ after max attempts.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SIGNING_SECRET = Deno.env.get("WEBHOOK_SIGNING_SECRET") ?? "dev-secret";

async function hmac(secret: string, payload: string): Promise<string> {
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
    const { data: pending, error } = await sb
      .from("webhook_retry_queue")
      .select("*")
      .eq("status", "pending")
      .lte("next_attempt_at", new Date().toISOString())
      .limit(25);
    if (error) throw error;

    const results: Array<Record<string, unknown>> = [];
    for (const row of pending ?? []) {
      const payloadStr = JSON.stringify(row.payload ?? {});
      const signature = await hmac(SIGNING_SECRET, payloadStr);
      const attempt = (row.attempt_count ?? 0) + 1;
      let success = false;
      let errMsg: string | null = null;

      try {
        // Look up subscription URL
        const { data: sub } = await sb
          .from("external_workforce_webhook_subscriptions")
          .select("target_url")
          .eq("id", row.subscription_id)
          .maybeSingle();
        if (!sub?.target_url) throw new Error("subscription target_url missing");

        const resp = await fetch(sub.target_url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-sita-signature": `sha256=${signature}`,
            "x-sita-event": row.event_type,
            "x-sita-attempt": String(attempt),
          },
          body: payloadStr,
          signal: AbortSignal.timeout(10_000),
        });
        await resp.text();
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
        status: success ? "succeeded" : isFinalFailure ? "dlq" : "pending",
        next_attempt_at: success || isFinalFailure ? row.next_attempt_at : nextAt,
        updated_at: new Date().toISOString(),
      }).eq("id", row.id);

      results.push({ id: row.id, success, attempt, dlq: isFinalFailure });
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
