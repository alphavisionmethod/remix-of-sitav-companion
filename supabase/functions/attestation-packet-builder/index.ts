// ═══════════════════════════════════════════════════════════════
// SITA OS — Attestation Packet Builder (Phase 9C)
// Builds a signed regulator-ready attestation packet for a framework.
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
    const framework = String(body.framework ?? "soc2");
    const period_end = new Date(body.period_end ?? Date.now());
    const period_start = new Date(body.period_start ?? (period_end.getTime() - 90 * 24 * 3600 * 1000));

    const { data: controls } = await admin.from("compliance_controls").select("*").eq("framework", framework).eq("status", "active");
    const controlIds = (controls ?? []).map((c: { id: string }) => c.id);
    const { data: evidence } = controlIds.length
      ? await admin.from("compliance_evidence").select("*").in("control_id", controlIds)
          .gte("collected_at", period_start.toISOString()).lte("collected_at", period_end.toISOString())
      : { data: [] as Array<{ pass: boolean; control_id: string }> };

    const passingControls = new Set(
      (evidence ?? []).filter((e) => e.pass).map((e) => e.control_id),
    );

    const packet_key = `attest-${framework}-${period_end.toISOString().slice(0, 10)}`;
    const bundleObj = { framework, period_start, period_end, controls, evidence };
    const sha = await sha256Hex(JSON.stringify(bundleObj));
    const sigBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sha + srk.slice(0, 16)));
    const signature = Array.from(new Uint8Array(sigBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const { data: packet, error } = await admin.from("attestation_packets").upsert({
      packet_key, framework,
      period_start: period_start.toISOString(),
      period_end: period_end.toISOString(),
      controls_total: controls?.length ?? 0,
      controls_passing: passingControls.size,
      evidence_count: evidence?.length ?? 0,
      bundle_sha256: sha, signature,
      status: "sealed",
    }, { onConflict: "packet_key" }).select().single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, packet }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
