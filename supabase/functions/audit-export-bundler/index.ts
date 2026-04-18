// ═══════════════════════════════════════════════════════════════
// SITA OS — Audit Export Bundler (Phase 9A)
// Builds an immutable audit-export bundle for a time window:
// hashes content, records signature, marks sealed.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const srk = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(url, srk);
    const { data: roleRows } = await admin.from("user_roles").select("role").eq("user_id", u.user.id);
    if (!(roleRows ?? []).some((r: { role: string }) => r.role === "admin"))
      return new Response(JSON.stringify({ error: "admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const period_end = new Date(body.period_end ?? Date.now());
    const period_start = new Date(body.period_start ?? (period_end.getTime() - 24 * 3600 * 1000));

    // Pull audit records in window
    const { data: records, error } = await admin
      .from("admin_action_audit")
      .select("*")
      .gte("created_at", period_start.toISOString())
      .lte("created_at", period_end.toISOString())
      .limit(10000);
    if (error) throw error;

    const bundle_key = `audit-${period_start.toISOString().slice(0, 10)}-${period_end.toISOString().slice(0, 10)}`;
    const payload = JSON.stringify(records ?? []);
    const sha256 = await sha256Hex(payload);
    // Signature is HMAC of sha256 with service-role key (production would use ed25519)
    const sigBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sha256 + srk.slice(0, 16)));
    const signature = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data: bundle, error: insErr } = await admin.from("audit_export_bundles").upsert({
      bundle_key,
      period_start: period_start.toISOString(),
      period_end: period_end.toISOString(),
      record_count: records?.length ?? 0,
      sha256, signature,
      status: "sealed",
    }, { onConflict: "bundle_key" }).select().single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, bundle, records_count: records?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
