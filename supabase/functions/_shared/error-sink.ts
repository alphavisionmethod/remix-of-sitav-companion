// ═══════════════════════════════════════════════════════════════
// Shared — Error sink for edge functions (Phase 20.A)
// Writes error_events rows from inside edge functions so backend
// failures are visible in the same admin Truth Explorer.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

let _admin: ReturnType<typeof createClient> | null = null;
function getAdmin() {
  if (_admin) return _admin;
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

function fingerprintEdge(service: string, message: string, stack?: string): string {
  const head = (message || "").slice(0, 100).replace(/\s+/g, " ").trim();
  const firstFrame = stack
    ?.split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("at "))
    ?.replace(/:\d+:\d+\)?$/g, "") || "";
  return `edge:${service}|${head}|${firstFrame}`.slice(0, 240);
}

interface SinkOpts {
  service: string;
  message: string;
  stack?: string;
  severity?: "fatal" | "error" | "warning";
  correlationId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function sinkEdgeError(opts: SinkOpts) {
  const admin = getAdmin();
  if (!admin) return;
  const fingerprint = fingerprintEdge(opts.service, opts.message, opts.stack);

  // Try to dedup-update first
  const { data: existing } = await admin
    .from("error_events")
    .select("id, count")
    .eq("fingerprint", fingerprint)
    .gte("last_seen_at", new Date(Date.now() - 5 * 60_000).toISOString())
    .maybeSingle();

  if (existing) {
    await admin
      .from("error_events")
      .update({
        count: (existing.count as number) + 1,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", existing.id as string);
    return;
  }

  await admin.from("error_events").insert({
    fingerprint,
    message: opts.message.slice(0, 2048),
    stack: opts.stack?.slice(0, 8192) ?? null,
    severity: opts.severity ?? "error",
    source: "edge",
    route: opts.service,
    user_id: opts.userId ?? null,
    correlation_id: opts.correlationId ?? null,
    metadata: opts.metadata ?? {},
    environment: Deno.env.get("APP_ENVIRONMENT") ?? "production",
    release: Deno.env.get("APP_RELEASE") ?? "unknown",
  });
}
