// ═══════════════════════════════════════════════════════════════
// uptime-rollup (Phase 20.1.F)
// Lightweight scheduled fn that prunes >30d uptime_heartbeats
// to keep the table bounded. Called every 5 minutes via cron.
// `uptime_status` is a regular view, so no matview refresh needed.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    return new Response(JSON.stringify({ error: "server-not-configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(url, key, { auth: { persistSession: false } });
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();

  let pruned = 0;
  try {
    const { count } = await admin
      .from("uptime_heartbeats")
      .delete({ count: "exact" })
      .lt("ts", cutoff);
    pruned = count ?? 0;
  } catch {
    // best-effort
  }

  return new Response(JSON.stringify({ ok: true, pruned, cutoff }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
