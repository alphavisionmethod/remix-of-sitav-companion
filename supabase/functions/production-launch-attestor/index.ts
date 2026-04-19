// Production Launch Attestor — admin-signed attestations of launch posture per surface.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const VALID_POSTURES = ["green", "yellow", "red", "deferred", "archived"] as const;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roleRow } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "admin_required" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json().catch(() => ({}));
    const { surface_key, launch_posture, release_tag, evidence } = body ?? {};
    if (!surface_key || typeof surface_key !== "string") {
      return new Response(JSON.stringify({ error: "surface_key required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!launch_posture || !VALID_POSTURES.includes(launch_posture)) {
      return new Response(JSON.stringify({ error: "invalid launch_posture", allowed: VALID_POSTURES }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const evidenceHash = await sha256Hex(JSON.stringify(evidence ?? {}));
    const signaturePayload = `${surface_key}|${launch_posture}|${release_tag ?? ""}|${evidenceHash}|${user.id}`;
    const signature = await sha256Hex(signaturePayload);

    const { data, error } = await admin.from("production_launch_attestations").insert({
      surface_key, launch_posture, attested_by: user.id,
      evidence_hash: evidenceHash, signature,
      release_tag: release_tag ?? null, evidence: evidence ?? {},
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true, attestation: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
