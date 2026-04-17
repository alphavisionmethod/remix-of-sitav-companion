// ═══════════════════════════════════════════════════════════════
// SITA OS — Crash Report Ingest
// Receives crash dumps from Electron desktop + native mobile,
// stores in user-files/crashes/<user>/<date>.json, raises an
// incident classification when crash rate exceeds threshold.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CrashReport {
  surface: "electron" | "ios" | "android" | "web";
  release: string;
  channel: string;
  reason: string;
  stack?: string;
  context?: Record<string, unknown>;
  occurredAt?: string;
}

const CRASH_RATE_THRESHOLD = 5; // 5 crashes/hour for same release ⇒ incident

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = req.headers.get("authorization") ?? "";
  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { global: { headers: { Authorization: auth } } },
  );

  let report: CrashReport;
  try {
    report = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!report?.surface || !report?.release || !report?.reason) {
    return new Response(JSON.stringify({ error: "surface, release, reason required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Identify caller (anonymous crashes allowed via dedicated bucket key).
  const { data: userData } = await supa.auth.getUser();
  const userId = userData?.user?.id ?? "anonymous";

  // Persist raw dump
  const path = `crashes/${userId}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.json`;
  const body = JSON.stringify({
    ...report,
    capturedAt: report.occurredAt ?? new Date().toISOString(),
    userId,
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  }, null, 2);

  const { error: uploadErr } = await supa.storage
    .from("user-files")
    .upload(path, new Blob([body], { type: "application/json" }), { upsert: false });

  if (uploadErr) {
    console.error("crash upload failed", uploadErr);
  }

  // Rate check — count crashes for this release in last hour
  let escalated = false;
  try {
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { data: prior } = await supa.storage
      .from("user-files")
      .list(`crashes`, { limit: 1000 });
    const recentCount = (prior ?? []).filter((f) =>
      f.created_at && f.created_at >= since && f.name?.includes(report.release)
    ).length;

    if (recentCount + 1 >= CRASH_RATE_THRESHOLD) {
      // Try inserting incident classification (table may not exist in all envs — non-fatal)
      try {
        await supa.from("incident_classifications" as never).insert({
          subsystem: report.surface,
          symptom: "crash-rate-exceeded",
          severity: "error",
          runbook_ref: "RB-CRASH-WAVE",
          suggested_kill_switch: report.surface === "electron" ? "KS-DESKTOP" : null,
          status: "open",
          metadata: { release: report.release, count: recentCount + 1, sample: report.reason },
        });
        escalated = true;
      } catch (e) {
        console.warn("classification insert failed", e);
      }
    }
  } catch (e) {
    console.warn("rate check failed", e);
  }

  return new Response(JSON.stringify({
    ok: true,
    receiptPath: uploadErr ? null : path,
    escalated,
    storedAt: new Date().toISOString(),
  }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
