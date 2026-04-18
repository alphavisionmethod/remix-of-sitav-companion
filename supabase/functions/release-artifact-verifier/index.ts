// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Artifact Verifier (Phase 9A)
// Verifies signed release artifacts (SHA-256 + signature presence).
// Read-mostly; writes verification status to signed_release_artifacts.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const release_tag = String(body.release_tag ?? "");
    if (!release_tag) return new Response(JSON.stringify({ error: "release_tag required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: artifacts, error } = await admin
      .from("signed_release_artifacts")
      .select("*")
      .eq("release_tag", release_tag);
    if (error) throw error;

    let verified = 0;
    for (const a of artifacts ?? []) {
      // Verify presence of sha256 + signature (full crypto verify would happen against ed25519 public key)
      const ok = !!a.sha256 && a.sha256.length === 64 && !!a.signature && a.signature.length >= 64;
      if (ok && !a.verified) {
        await admin.from("signed_release_artifacts").update({
          verified: true, verified_at: new Date().toISOString()
        }).eq("id", a.id);
      }
      if (ok) verified++;
    }

    return new Response(JSON.stringify({
      ok: true, release_tag, total: artifacts?.length ?? 0, verified,
      cuttable: verified === (artifacts?.length ?? 0) && (artifacts?.length ?? 0) > 0,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
