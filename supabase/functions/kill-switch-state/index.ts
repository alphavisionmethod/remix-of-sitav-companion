// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch State (Section B)
// Authenticated read endpoint returning the current enabled state
// per switch_id. Used by edge functions and UIs that prefer a
// single round-trip to enumerate all switches.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const client = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await client
    .from("automation_kill_switches")
    .select("switch_id, scope, scope_id, enabled, reason, severity, expires_at, requires_approval, activated_at, deactivated_at");

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const map: Record<string, { enabled: boolean; reason: string | null; severity: string; expiresAt: string | null }> = {};
  for (const r of data ?? []) {
    const id = (r.switch_id as string | null) ?? (r.scope_id as string | null);
    if (!id) continue;
    if (r.enabled || !map[id]) {
      map[id] = {
        enabled: !!r.enabled,
        reason: (r.reason as string | null) ?? null,
        severity: String(r.severity ?? "moderate"),
        expiresAt: (r.expires_at as string | null) ?? null,
      };
    }
  }

  return new Response(JSON.stringify({ ok: true, switches: map, generatedAt: new Date().toISOString() }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "max-age=15" },
  });
});
