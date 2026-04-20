// Mobile Deferral Attestor — admin-signed attestations of mobile substrate posture.
// Mirrors production-launch-attestor: JWT-validated, admin-required, SHA-256 signed,
// inserts append-only into public.mobile_deferral_attestations.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const VALID_POSTURES = ["archived", "deferred", "future_vision_only", "reactivating"] as const;

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    // JWT validation in code (canonical pattern)
    const auth = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Admin role enforcement via has_role
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "admin_required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const posture: string = (body?.posture ?? "archived").toString();
    const archive_path: string = (body?.archive_path ?? "archive/mobile/").toString();
    const notes: string | null = body?.notes ?? null;
    const metadata = body?.metadata ?? {};

    if (!VALID_POSTURES.includes(posture as typeof VALID_POSTURES[number])) {
      return new Response(
        JSON.stringify({ error: "invalid_posture", allowed: VALID_POSTURES }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const evidenceHash = await sha256Hex(JSON.stringify(metadata));
    const signaturePayload = `${posture}|${archive_path}|${evidenceHash}|${user.id}`;
    const signature = await sha256Hex(signaturePayload);

    const { data, error } = await admin
      .from("mobile_deferral_attestations")
      .insert({
        attested_by: user.id,
        posture,
        archive_path,
        evidence_hash: evidenceHash,
        signature,
        notes,
        metadata,
      })
      .select()
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, attestation: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
