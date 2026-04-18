// ═══════════════════════════════════════════════════════════════
// Phase 8 Hardening — Canary + chaos cron entrypoint
// Wakes hourly: triggers canary runner, then chaos scheduler.
// All actions stay at L3 ceiling (rollbacks staged for approval).
// ═══════════════════════════════════════════════════════════════
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function invoke(name: string) {
  try {
    const r = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({ scheduled: true }),
      signal: AbortSignal.timeout(20_000),
    });
    const text = await r.text();
    return { name, ok: r.ok, status: r.status, body: text.slice(0, 500) };
  } catch (e) {
    return { name, ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const canary = await invoke("internal-agent-canary-runner");
  const chaos  = await invoke("internal-agent-chaos-scheduler");
  return new Response(JSON.stringify({ ok: true, canary, chaos }), {
    headers: { ...corsHeaders, "content-type": "application/json" },
  });
});
