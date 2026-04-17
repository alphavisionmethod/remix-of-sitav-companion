// ═══════════════════════════════════════════════════════════════
// health-check (Phase 20.C — REWRITE)
// Real per-subsystem health probes with cached responses.
// Returns {db, auth, storage, ai_gateway, push} with status + latency.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProbeResult {
  status: "healthy" | "degraded" | "down";
  latency_ms: number;
  detail?: string;
}

interface HealthResponse {
  service: "sita-os";
  status: "healthy" | "degraded" | "down";
  version: string;
  release: string;
  environment: string;
  timestamp: string;
  uptime_seconds: number;
  subsystems: Record<string, ProbeResult>;
}

let cache: { at: number; resp: HealthResponse } | null = null;
const CACHE_TTL_MS = 10_000;

async function timed<T>(fn: () => Promise<T>): Promise<{ result: T | null; latency_ms: number; error: string | null }> {
  const start = performance.now();
  try {
    const result = await fn();
    return { result, latency_ms: Math.round(performance.now() - start), error: null };
  } catch (err) {
    return { result: null, latency_ms: Math.round(performance.now() - start), error: err instanceof Error ? err.message : String(err) };
  }
}

async function probeDb(admin: ReturnType<typeof createClient>): Promise<ProbeResult> {
  const t = await timed(async () => {
    const { error } = await admin.from("error_events").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw new Error(error.message);
    return true;
  });
  return {
    status: t.error ? "down" : t.latency_ms > 1500 ? "degraded" : "healthy",
    latency_ms: t.latency_ms,
    detail: t.error ?? undefined,
  };
}

async function probeAuth(admin: ReturnType<typeof createClient>): Promise<ProbeResult> {
  const t = await timed(async () => {
    const { error } = await admin.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw new Error(error.message);
    return true;
  });
  return {
    status: t.error ? "down" : t.latency_ms > 1500 ? "degraded" : "healthy",
    latency_ms: t.latency_ms,
  };
}

async function probeStorage(admin: ReturnType<typeof createClient>): Promise<ProbeResult> {
  const t = await timed(async () => {
    const { data, error } = await admin.storage.listBuckets();
    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  });
  return {
    status: t.error ? "down" : t.latency_ms > 2000 ? "degraded" : "healthy",
    latency_ms: t.latency_ms,
  };
}

async function probeAiGateway(): Promise<ProbeResult> {
  const t = await timed(async () => {
    const key = Deno.env.get("LOVABLE_API_KEY") || Deno.env.get("OPENAI_API_KEY") || Deno.env.get("ANTHROPIC_API_KEY");
    if (!key) throw new Error("no AI key configured");
    return true;
  });
  return {
    status: t.error ? "degraded" : "healthy",
    latency_ms: t.latency_ms,
    detail: t.error ?? undefined,
  };
}

function probePush(): ProbeResult {
  const start = performance.now();
  const has = !!Deno.env.get("VAPID_PRIVATE_KEY") && !!Deno.env.get("VAPID_PUBLIC_KEY");
  return {
    status: has ? "healthy" : "degraded",
    latency_ms: Math.round(performance.now() - start),
    detail: has ? undefined : "VAPID keys missing",
  };
}

function overall(subsystems: Record<string, ProbeResult>): "healthy" | "degraded" | "down" {
  const vals = Object.values(subsystems);
  if (vals.some((s) => s.status === "down")) return "down";
  if (vals.some((s) => s.status === "degraded")) return "degraded";
  return "healthy";
}

const startedAt = Date.now();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const now = Date.now();
  if (cache && now - cache.at < CACHE_TTL_MS) {
    return new Response(JSON.stringify(cache.resp), {
      status: cache.resp.status === "down" ? 503 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=10" },
    });
  }

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  let subsystems: Record<string, ProbeResult>;
  if (!url || !key) {
    subsystems = {
      db: { status: "down", latency_ms: 0, detail: "service-role key missing" },
      auth: { status: "down", latency_ms: 0 },
      storage: { status: "down", latency_ms: 0 },
      ai_gateway: await probeAiGateway(),
      push: probePush(),
    };
  } else {
    const admin = createClient(url, key, { auth: { persistSession: false } });
    const [db, auth, storage, ai] = await Promise.all([
      probeDb(admin), probeAuth(admin), probeStorage(admin), probeAiGateway(),
    ]);
    subsystems = { db, auth, storage, ai_gateway: ai, push: probePush() };
  }

  const resp: HealthResponse = {
    service: "sita-os",
    status: overall(subsystems),
    version: Deno.env.get("APP_RELEASE") ?? "1.0.0",
    release: Deno.env.get("APP_RELEASE") ?? "1.0.0",
    environment: Deno.env.get("APP_ENVIRONMENT") ?? "production",
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.round((Date.now() - startedAt) / 1000),
    subsystems,
  };

  cache = { at: now, resp };

  return new Response(JSON.stringify(resp), {
    status: resp.status === "down" ? 503 : 200,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=10" },
  });
});
