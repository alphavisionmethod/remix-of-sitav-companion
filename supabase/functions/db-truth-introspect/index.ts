// ═══════════════════════════════════════════════════════════════
// SITA OS — db-truth-introspect (DOMAIN_FUNCTION)
// Read-only DB introspection for the admin DbTruthExplorer page.
// Caller class: admin-bff only. Backed by SECURITY DEFINER RPC
// public.get_db_truth_snapshot(op) which enforces admin role
// internally and limits queries to pg_catalog only.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Op = "summary" | "schema" | "policies" | "drift";
const ALLOWED_OPS: ReadonlyArray<Op> = ["summary", "schema", "policies", "drift"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "missing_auth" }, 401);

    // Use the caller's JWT so the SECURITY DEFINER RPC sees the
    // correct auth.uid() and can enforce its own admin gate.
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userErr } = await client.auth.getUser();
    if (userErr || !userData.user) return json({ error: "unauthorized" }, 401);

    let body: { op?: string } = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const op = (body.op ?? "summary") as Op;
    if (!ALLOWED_OPS.includes(op)) {
      return json({ error: "invalid_op", allowed: ALLOWED_OPS }, 400);
    }

    const { data, error } = await client.rpc("get_db_truth_snapshot", { _op: op });
    if (error) {
      const status = error.message?.includes("admin role required") ? 403 : 500;
      return json({ error: error.message }, status);
    }

    return json({ op, data, generatedAt: new Date().toISOString() });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
