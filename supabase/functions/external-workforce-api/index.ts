// ═══════════════════════════════════════════════════════════════
// Phase 8B — External Workforce API (READ-ONLY)
// Tenants present an API key (id + secret); responses are signed.
// No write operations. No internal agent IDs leak — only redacted
// tenant-scoped views (briefing summaries, kill-switch state,
// receipts). Mirrors owner-copilot redaction discipline.
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key-id, x-api-secret",
};

const READ_ONLY_RESOURCES = new Set([
  "briefings",
  "kill_switches",
  "receipts",
]);

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // READ-ONLY enforcement at the edge
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed_readonly_api" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const keyId = req.headers.get("x-api-key-id") ?? "";
    const secret = req.headers.get("x-api-secret") ?? "";
    if (!keyId || !secret) {
      return new Response(JSON.stringify({ error: "missing_api_credentials" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const secretHash = await sha256Hex(secret);
    const { data: keyRow } = await supabase
      .from("external_workforce_api_keys")
      .select("id, user_id, tenant_id, scope, status")
      .eq("key_id", keyId)
      .eq("secret_hash", secretHash)
      .eq("status", "active")
      .maybeSingle();

    if (!keyRow) {
      return new Response(JSON.stringify({ error: "invalid_api_credentials" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (keyRow.scope !== "read_only") {
      return new Response(JSON.stringify({ error: "scope_must_be_read_only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const resource = url.searchParams.get("resource") ?? "briefings";
    if (!READ_ONLY_RESOURCES.has(resource)) {
      return new Response(JSON.stringify({ error: "unknown_resource" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: unknown = {};
    if (resource === "briefings") {
      const { data } = await supabase
        .from("owner_copilot_briefings")
        .select("id, generated_at, summary, severity")
        .eq("user_id", keyRow.user_id)
        .order("generated_at", { ascending: false })
        .limit(20);
      payload = { briefings: (data ?? []).map((b) => ({
        id: b.id, at: b.generated_at, summary: b.summary, severity: b.severity,
      })) };
    } else if (resource === "kill_switches") {
      const { data } = await supabase
        .from("internal_agent_tenant_kill_switches")
        .select("id, tenant_id, switch_key, engaged, justification, updated_at")
        .eq("user_id", keyRow.user_id)
        .limit(50);
      payload = { kill_switches: data ?? [] };
    } else if (resource === "receipts") {
      const { data } = await supabase
        .from("ai_action_receipts")
        .select("id, action_type, status, created_at, recommendation_summary")
        .eq("user_id", keyRow.user_id)
        .order("created_at", { ascending: false })
        .limit(50);
      payload = { receipts: data ?? [] };
    }

    // Sign response body
    const bodyJson = JSON.stringify({ ok: true, resource, data: payload });
    const sig = await sha256Hex(bodyJson + ":" + keyId);

    // Update last_used_at (best-effort)
    await supabase
      .from("external_workforce_api_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", keyRow.id);

    return new Response(bodyJson, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "x-response-signature": sig,
        "x-signed-with-key": keyId,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
