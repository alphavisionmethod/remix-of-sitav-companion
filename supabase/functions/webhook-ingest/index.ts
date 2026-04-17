// ═══════════════════════════════════════════════════════════════
// SITA OS — Generic Webhook Ingest (Phase 22.B)
// Receives webhooks from any provider, dedupes, persists to webhook_events.
// Path: /webhook-ingest/{provider}
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature, x-webhook-signature, stripe-signature",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const provider = parts[parts.length - 1] || "unknown";

    const rawBody = await req.text();
    let payload: any = {};
    try { payload = JSON.parse(rawBody); } catch { payload = { raw: rawBody }; }

    const signature =
      req.headers.get("x-signature") ||
      req.headers.get("x-webhook-signature") ||
      req.headers.get("stripe-signature") ||
      null;

    // Lightweight signature presence check; per-provider HMAC verification happens in webhook-process
    const signature_valid = signature ? true : null;

    // Idempotency: external_id from payload or header
    const external_id =
      payload?.id ||
      payload?.event_id ||
      payload?.eventId ||
      req.headers.get("x-event-id") ||
      crypto.randomUUID();

    const event_type = payload?.type || payload?.event || payload?.event_type || "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("webhook_events")
      .insert({
        provider,
        event_type,
        external_id,
        payload,
        signature,
        signature_valid,
        status: "pending",
      })
      .select("id")
      .maybeSingle();

    if (error && !error.message.includes("duplicate")) {
      console.error("webhook-ingest insert error:", error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, id: data?.id ?? null, deduped: !data, provider, external_id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("webhook-ingest error:", msg);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
