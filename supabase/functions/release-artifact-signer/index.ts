// ═══════════════════════════════════════════════════════════════
// Phase 9 Hardening — Release artifact signer
// Accepts {release_tag, artifact_kind, artifact_name, size_bytes,
// sha256, attestation}. Computes HMAC-SHA256 signature with
// ATTESTATION_SIGNING_KEY and persists to signed_release_artifacts.
// Admin-only (has_role + JWT validation).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
const SIGNING_KEY = Deno.env.get("ATTESTATION_SIGNING_KEY") ?? "dev-key";

async function hmacHex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }
    const sb = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: userRes } = await sb.auth.getUser();
    if (!userRes.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }
    const { data: roleRow } = await sb.rpc("has_role", { _user_id: userRes.user.id, _role: "admin" });
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "admin role required" }), {
        status: 403, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { release_tag, artifact_kind, artifact_name, size_bytes, sha256, attestation } = body;
    if (!release_tag || !artifact_kind || !artifact_name) {
      return new Response(JSON.stringify({ error: "release_tag, artifact_kind, artifact_name required" }), {
        status: 400, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }
    if (typeof sha256 !== "string" || sha256.length !== 64 || !/^[0-9a-f]{64}$/i.test(sha256)) {
      return new Response(JSON.stringify({ error: "sha256 must be 64-char hex" }), {
        status: 400, headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const canonical = JSON.stringify({
      release_tag, artifact_kind, artifact_name,
      sha256: sha256.toLowerCase(),
      size_bytes: size_bytes ?? null,
      attestation: attestation ?? {},
    });
    const signature = await hmacHex(SIGNING_KEY, canonical);

    const { data, error } = await sb.from("signed_release_artifacts").insert({
      release_tag,
      artifact_kind,
      artifact_name,
      size_bytes: typeof size_bytes === "number" ? size_bytes : null,
      sha256: sha256.toLowerCase(),
      signature,
      signed_by: userRes.user.id, // text column accepts UUID string
      attestation: attestation ?? {},
      verified: true,
      verified_at: new Date().toISOString(),
    }).select().maybeSingle();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, signature, record: data }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
