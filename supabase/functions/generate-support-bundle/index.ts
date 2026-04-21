// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Support Bundle (Edge Function)
// Server-side privileged support bundle generation.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

const REDACT_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, replacement: "[REDACTED-TOKEN]" },
  { pattern: /sk_live_[A-Za-z0-9]{10,}/g, replacement: "[REDACTED-STRIPE]" },
  { pattern: /sk_test_[A-Za-z0-9]{10,}/g, replacement: "[REDACTED-STRIPE]" },
  { pattern: /SITA-[A-Z0-9]{4}-[A-Z0-9]{4}/g, replacement: "[REDACTED-LICENSE]" },
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, replacement: "[REDACTED-EMAIL]" },
];

function redactString(input: string): string {
  let result = input;
  for (const { pattern, replacement } of REDACT_PATTERNS) {
    result = result.replace(new RegExp(pattern.source, pattern.flags), replacement);
  }
  return result;
}

function redactObject(obj: unknown): unknown {
  if (typeof obj === "string") return redactString(obj);
  if (Array.isArray(obj)) return obj.map(redactObject);
  if (obj !== null && typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const keyLower = k.toLowerCase();
      if (["token", "secret", "password", "key", "authorization", "cookie", "credential"].some(s => keyLower.includes(s))) {
        result[k] = "[REDACTED]";
      } else {
        result[k] = redactObject(v);
      }
    }
    return result;
  }
  return obj;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin permission
    const { data: perm } = await supabase
      .from("admin_role_permissions")
      .select("granted")
      .eq("permission", "support.view")
      .eq("granted", true)
      .limit(1)
      .maybeSingle();

    if (!perm) {
      return new Response(JSON.stringify({ error: "Insufficient permissions: support.view required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { bundleType = "system-wide", scope = {}, entityIds = [] } = body;

    // Assemble bundle data based on type
    const bundleData: Record<string, unknown> = {
      bundleId: `SB-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`,
      bundleType,
      createdAt: new Date().toISOString(),
      requestedBy: user.id,
      scope,
      entityIds,
    };

    // Collect relevant data based on bundle type
    const packs: unknown[] = [];

    // Environment info
    packs.push({
      packType: "environment",
      data: { supabaseRegion: "cloud", generatedAt: new Date().toISOString() },
    });

    // Recent incidents
    if (["system-wide", "runtime-crash", "admin-operator"].includes(bundleType)) {
      const { data: incidents } = await supabase
        .from("admin_action_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      packs.push({ packType: "recent-audit-actions", data: redactObject(incidents ?? []) });
    }

    // Kill switch state
    if (["system-wide", "admin-operator", "support-escalation"].includes(bundleType)) {
      const { data: switches } = await supabase
        .from("kill_switches")
        .select("switch_id, display_name, is_active, activated_at, reason")
        .eq("is_active", true);
      packs.push({ packType: "active-kill-switches", data: switches ?? [] });
    }

    bundleData.packs = packs;
    bundleData.redactionApplied = true;
    bundleData.expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

    // Audit log
    await supabase.from("admin_action_audit").insert({
      actor_user_id: user.id,
      action: "generate_support_bundle",
      plane: "support",
      severity: "medium",
      metadata: { bundleType, bundleId: bundleData.bundleId },
      justification: `Support bundle generation: ${bundleType}`,
    });

    return new Response(JSON.stringify(bundleData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});