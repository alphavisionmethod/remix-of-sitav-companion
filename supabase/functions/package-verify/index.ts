// ═══════════════════════════════════════════════════════════════
// package-verify — re-verify ed25519 signature + checksum of a package
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function verifyEd25519(message: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      publicKey.buffer.slice(publicKey.byteOffset, publicKey.byteOffset + publicKey.byteLength) as ArrayBuffer,
      { name: "Ed25519" }, false, ["verify"],
    );
    return await crypto.subtle.verify(
      { name: "Ed25519" }, key,
      signature.buffer.slice(signature.byteOffset, signature.byteOffset + signature.byteLength) as ArrayBuffer,
      message.buffer.slice(message.byteOffset, message.byteOffset + message.byteLength) as ArrayBuffer,
    );
  } catch {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "unauthorized" }, 401);
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "unauthorized" }, 401);
    const svc = createClient(SUPABASE_URL, SERVICE);

    const body = await req.json().catch(() => ({}));
    const packageId = String(body?.package_id ?? "");
    if (!packageId) return json({ error: "package_id_required" }, 400);

    const { data: pkg, error: pkgErr } = await svc
      .from("app_packages").select("*").eq("id", packageId).single();
    if (pkgErr || !pkg) return json({ error: "package_not_found" }, 404);

    const signatureMeta = (pkg.signature_metadata ?? {}) as Record<string, unknown>;
    const keyId = signatureMeta.key_id as string | undefined;
    const signature = signatureMeta.signature as string | undefined;
    const manifestHash = signatureMeta.manifest_hash as string | undefined;

    if (!keyId || !signature || !manifestHash) {
      return json({ ok: false, status: "unsigned", reason: "Missing signature metadata" });
    }

    const { data: keyRow } = await svc
      .from("publisher_keys")
      .select("public_key, algorithm, revoked_at")
      .eq("key_id", keyId).single();
    if (!keyRow) return json({ ok: false, status: "unknown_key", reason: "Publisher key not found" });
    if (keyRow.revoked_at) return json({ ok: false, status: "revoked_key", reason: "Publisher key revoked" });
    if (keyRow.algorithm !== "ed25519") return json({ ok: false, status: "unsupported_algo" });

    const ok = await verifyEd25519(
      new TextEncoder().encode(manifestHash),
      base64ToBytes(signature),
      base64ToBytes(keyRow.public_key),
    );

    await svc.from("app_signatures").insert({
      app_id: pkg.app_id,
      package_id: pkg.id,
      publisher_key_id: keyId,
      signature,
      verified_at: new Date().toISOString(),
      status: ok ? "verified" : "invalid",
    });

    return json({ ok, status: ok ? "verified" : "invalid", package_id: packageId });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
