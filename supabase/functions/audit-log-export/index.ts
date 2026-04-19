// ═══════════════════════════════════════════════════════════════
// SITA OS — Audit Log Export (admin-gated, NDJSON for SIEM)
// Streams a time-windowed slice of the kill_switch_audit_log +
// admin_action_audit tables in newline-delimited JSON, suitable
// for ingestion by Splunk / Datadog / Chronicle.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { EdgeLogger } from "../_shared/logger.ts";
const logger = new EdgeLogger("audit-log-export");
logger.info("boot", { ts: Date.now() });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_WINDOW_HOURS = 24 * 30; // 30 days

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const since = url.searchParams.get("since");
  const until = url.searchParams.get("until") ?? new Date().toISOString();
  const sources = (url.searchParams.get("sources") ?? "kill_switch_audit_log,admin_action_audit").split(",");

  if (!since) {
    return new Response(JSON.stringify({ error: "?since=ISO8601 required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sinceDate = new Date(since);
  const untilDate = new Date(until);
  if (Number.isNaN(sinceDate.getTime()) || Number.isNaN(untilDate.getTime())) {
    return new Response(JSON.stringify({ error: "Invalid since/until" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const windowHours = (untilDate.getTime() - sinceDate.getTime()) / 3_600_000;
  if (windowHours > MAX_WINDOW_HOURS) {
    return new Response(JSON.stringify({ error: `Window exceeds ${MAX_WINDOW_HOURS}h cap` }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const auth = req.headers.get("authorization") ?? "";
  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { global: { headers: { Authorization: auth } } },
  );

  // Verify admin
  const { data: userData, error: authErr } = await supa.auth.getUser();
  if (authErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: roleCheck } = await supa.rpc("has_role", {
    _user_id: userData.user.id,
    _role: "admin",
  });
  if (!roleCheck) {
    return new Response(JSON.stringify({ error: "admin role required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const header = JSON.stringify({
        _meta: true,
        exportedAt: new Date().toISOString(),
        exportedBy: userData.user.id,
        since, until, sources,
      });
      controller.enqueue(enc.encode(header + "\n"));

      for (const source of sources) {
        try {
          const { data, error } = await supa
            .from(source as never)
            .select("*")
            .gte("created_at", since)
            .lte("created_at", until)
            .order("created_at", { ascending: true })
            .limit(50_000) as unknown as { data: Record<string, unknown>[]; error: unknown };

          if (error) {
            controller.enqueue(enc.encode(JSON.stringify({ _error: String(error), source }) + "\n"));
            continue;
          }
          for (const row of data ?? []) {
            controller.enqueue(enc.encode(JSON.stringify({ _source: source, ...row }) + "\n"));
          }
        } catch (e) {
          controller.enqueue(enc.encode(JSON.stringify({ _error: String(e), source }) + "\n"));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/x-ndjson",
      "Content-Disposition": `attachment; filename="audit-${since.slice(0,10)}-to-${until.slice(0,10)}.ndjson"`,
    },
  });
});
