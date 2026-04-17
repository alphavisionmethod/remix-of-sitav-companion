// ═══════════════════════════════════════════════════════════════
// health-ready (Phase 20.C)
// Readiness probe: validates secrets & DB reachability.
// Returns 200 only when fully ready; otherwise 503.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REQUIRED_SECRETS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const checks: Record<string, { ok: boolean; detail?: string }> = {};

  // Required secrets
  for (const s of REQUIRED_SECRETS) {
    checks[`secret:${s}`] = { ok: !!Deno.env.get(s) };
  }

  // DB reachability
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (url && key) {
    try {
      const admin = createClient(url, key, { auth: { persistSession: false } });
      const { error } = await admin.from("error_events").select("id", { head: true, count: "exact" }).limit(1);
      checks["db:reachable"] = { ok: !error, detail: error?.message };
    } catch (err) {
      checks["db:reachable"] = { ok: false, detail: err instanceof Error ? err.message : String(err) };
    }
  } else {
    checks["db:reachable"] = { ok: false, detail: "no credentials" };
  }

  const ready = Object.values(checks).every((c) => c.ok);

  return new Response(
    JSON.stringify({
      ready,
      timestamp: new Date().toISOString(),
      checks,
    }),
    {
      status: ready ? 200 : 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
