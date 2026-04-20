// SITA OS — Recovery Evidence Ingest
// Accepts on-device recovery boot evidence, recomputes the SHA-256 hash,
// signs it with the caller identity, and persists into the append-only
// public.recovery_boot_evidence table.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ALLOWED_REASONS = new Set([
  "auto-fallback",
  "operator-menu",
  "boot-failure",
  "first-boot",
  "manual-test",
]);
const ALLOWED_SLOTS = new Set(["a", "b", "unknown"]);

interface EvidencePayload {
  device_id: string;
  recovery_reason: string;
  slot: string;
  kernel_version?: string | null;
  verity_state?: string | null;
  bless_state?: string | null;
  failed_units?: unknown[];
  shell_crash_count?: number;
  tpm_pcr_snapshot?: Record<string, unknown>;
  collected_at: string;
}

function canonicalize(p: EvidencePayload): string {
  return JSON.stringify({
    device_id: p.device_id,
    recovery_reason: p.recovery_reason,
    slot: p.slot,
    kernel_version: p.kernel_version ?? null,
    verity_state: p.verity_state ?? null,
    bless_state: p.bless_state ?? null,
    failed_units: p.failed_units ?? [],
    shell_crash_count: p.shell_crash_count ?? 0,
    tpm_pcr_snapshot: p.tpm_pcr_snapshot ?? {},
    collected_at: p.collected_at,
  });
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function badRequest(msg: string, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ error: msg, ...extra }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response("method not allowed", { status: 405, headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "missing bearer token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Validate JWT
  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: auth } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "invalid jwt" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  let body: EvidencePayload;
  try {
    body = (await req.json()) as EvidencePayload;
  } catch {
    return badRequest("invalid json");
  }

  if (!body.device_id || typeof body.device_id !== "string")
    return badRequest("device_id required");
  if (!ALLOWED_REASONS.has(body.recovery_reason))
    return badRequest("invalid recovery_reason");
  if (!ALLOWED_SLOTS.has(body.slot)) return badRequest("invalid slot");
  if (!body.collected_at) return badRequest("collected_at required");
  const collectedAt = new Date(body.collected_at);
  if (Number.isNaN(collectedAt.getTime())) return badRequest("collected_at not a date");

  const canonical = canonicalize(body);
  const evidenceHash = await sha256Hex(canonical);
  const signature = await sha256Hex(
    `${body.device_id}|${body.slot}|${body.recovery_reason}|${evidenceHash}|${userId}`,
  );

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  const { data, error } = await admin
    .from("recovery_boot_evidence")
    .insert({
      device_id: body.device_id,
      recovery_reason: body.recovery_reason,
      slot: body.slot,
      kernel_version: body.kernel_version ?? null,
      verity_state: body.verity_state ?? null,
      bless_state: body.bless_state ?? null,
      failed_units: body.failed_units ?? [],
      shell_crash_count: body.shell_crash_count ?? 0,
      tpm_pcr_snapshot: body.tpm_pcr_snapshot ?? {},
      evidence_hash: evidenceHash,
      signature,
      collected_at: collectedAt.toISOString(),
      inserted_by: userId,
    })
    .select("id, evidence_hash, signature, inserted_at")
    .single();

  if (error) {
    console.error("[recovery-evidence-ingest] insert failed", error);
    return new Response(
      JSON.stringify({ error: "insert failed", detail: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      id: data.id,
      evidence_hash: data.evidence_hash,
      signature: data.signature,
      inserted_at: data.inserted_at,
    }),
    { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
