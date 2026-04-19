// ═══════════════════════════════════════════════════════════════
// SITA OS — Secret Rotation Orchestrator
// Coordinates rotation of platform secrets (VAPID, Twilio, AI keys)
// in a controlled, receipted manner. Returns the rotation plan +
// proof receipt; actual secret writes happen via the Lovable secrets
// management UI (cannot be done from edge functions for safety).
// ═══════════════════════════════════════════════════════════════
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RotationRequest {
  secrets: string[];        // e.g. ["VAPID_PRIVATE_KEY","TWILIO_AUTH_TOKEN"]
  reason: string;           // mandatory ≥20 chars
  scheduledFor?: string;    // ISO date — defaults to now
  dryRun?: boolean;
}

interface RotationStep {
  secret: string;
  category: "push" | "comms" | "ai" | "auth" | "storage" | "other";
  rotatable: boolean;
  blocker?: string;
  preChecks: string[];
  postChecks: string[];
  rollbackPath: string;
}

const SECRET_TAXONOMY: Record<string, RotationStep["category"]> = {
  VAPID_PUBLIC_KEY:  "push",
  VAPID_PRIVATE_KEY: "push",
  VAPID_SUBJECT:     "push",
  TWILIO_AUTH_TOKEN: "comms",
  TWILIO_ACCOUNT_SID:"comms",
  TWILIO_PHONE_NUMBER:"comms",
  ANTHROPIC_API_KEY: "ai",
  OPENAI_API_KEY:    "ai",
  LOVABLE_API_KEY:   "ai",
  SHOPIFY_ACCESS_TOKEN: "other",
  SHOPIFY_STOREFRONT_ACCESS_TOKEN: "other",
  SUPABASE_SERVICE_ROLE_KEY: "auth",
  SUPABASE_ANON_KEY: "auth",
  SUPABASE_PUBLISHABLE_KEY: "auth",
  SUPABASE_DB_URL: "storage",
};

function buildPlan(secret: string): RotationStep {
  const category = SECRET_TAXONOMY[secret] ?? "other";
  const blocker = secret.startsWith("SUPABASE_") && secret !== "SUPABASE_PUBLISHABLE_KEY"
    ? "Supabase service-role/DB rotation must be coordinated via the Lovable Cloud control plane — see RB-SECRET-ROTATION.md"
    : undefined;

  const baseChecks = ["Confirm new value pasted into Lovable secrets vault", "Wait 60s for edge propagation"];

  switch (category) {
    case "push":
      return {
        secret, category, rotatable: !blocker, blocker,
        preChecks: ["Generate new VAPID pair locally", "Stage public key in browser subscription refresh"],
        postChecks: [...baseChecks, "Send test push to admin device via push-dispatch", "Check vapid-public-key endpoint returns new key"],
        rollbackPath: "Revert to previous VAPID values from secret history; re-subscribe browsers.",
      };
    case "comms":
      return {
        secret, category, rotatable: !blocker, blocker,
        preChecks: ["Mint new Twilio auth token in Twilio console (keep old active for 60s overlap)"],
        postChecks: [...baseChecks, "Send test SMS via communications-api", "Verify webhook signatures still validate"],
        rollbackPath: "Re-paste previous Twilio token; revoke new one in Twilio console.",
      };
    case "ai":
      return {
        secret, category, rotatable: !blocker, blocker,
        preChecks: ["Mint new key in provider console", "Confirm gateway fallback chain has 2+ providers active"],
        postChecks: [...baseChecks, "Run ai-health probe", "Check ai_provider_health latest row"],
        rollbackPath: "Re-paste previous AI provider key; gateway fallback should have masked any outage.",
      };
    case "auth":
      return {
        secret, category, rotatable: false,
        blocker: blocker ?? "Rotation requires Lovable Cloud control plane",
        preChecks: [],
        postChecks: [],
        rollbackPath: "n/a — managed by control plane",
      };
    default:
      return {
        secret, category, rotatable: !blocker, blocker,
        preChecks: ["Mint new credential at provider"],
        postChecks: baseChecks,
        rollbackPath: "Re-paste previous value within rollback window.",
      };
  }
}

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
  const { data: userData, error: authErr } = await supa.auth.getUser();
  if (authErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: isAdmin } = await supa.rpc("has_role", {
    _user_id: userData.user.id, _role: "admin",
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: "admin role required" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: RotationRequest;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!Array.isArray(body.secrets) || body.secrets.length === 0) {
    return new Response(JSON.stringify({ error: "secrets[] required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!body.reason || body.reason.length < 20) {
    return new Response(JSON.stringify({ error: "reason must be ≥20 chars" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const plan = body.secrets.map(buildPlan);
  const blockedCount = plan.filter((s) => !s.rotatable).length;

  const receipt = {
    receiptId: crypto.randomUUID(),
    requestedBy: userData.user.id,
    requestedAt: new Date().toISOString(),
    scheduledFor: body.scheduledFor ?? new Date().toISOString(),
    reason: body.reason,
    dryRun: body.dryRun !== false,
    secretsTotal: plan.length,
    secretsBlocked: blockedCount,
    plan,
    nextSteps: [
      "Open Lovable Cloud → Secrets vault",
      `Update each rotatable secret listed above (${plan.length - blockedCount} secrets)`,
      "Run post-checks for each category before marking rotation complete",
      "File completion receipt at /admin/trust-security/secret-rotation",
    ],
  };

  // Audit trail
  try {
    await supa.from("admin_action_audit" as never).insert({
      action: "secret_rotation_planned",
      actor_user_id: userData.user.id,
      severity: "high",
      plane: "trust-security",
      target_type: "secret",
      target_id: body.secrets.join(","),
      justification: body.reason,
      metadata: { receiptId: receipt.receiptId, dryRun: receipt.dryRun, secretsCount: plan.length },
    });
  } catch { /* non-fatal */ }

  // Durable cadence evidence — write one row per planned secret into secret_rotation_log.
  // This is the canonical proof read by emit-secret-rotation-status.ts.
  // Cadence intervals mirror src/lib/security/secret-rotation-cadence.ts.
  const CADENCE_INTERVAL_DAYS: Record<string, number> = {
    push: 90, comms: 180, ai: 90, auth: 365, storage: 365, other: 90,
  };
  for (const step of plan) {
    try {
      const intervalDays = CADENCE_INTERVAL_DAYS[step.category] ?? 90;
      const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString();
      await supa.from("secret_rotation_log" as never).insert({
        secret_class: step.category,
        secret_name: step.secret,
        rotated_by: userData.user.id,
        dry_run: receipt.dryRun,
        result: {
          receiptId: receipt.receiptId,
          rotatable: step.rotatable,
          blocker: step.blocker ?? null,
          preChecks: step.preChecks,
          postChecks: step.postChecks,
        },
        cadence_due_at: dueAt,
      });
    } catch { /* non-fatal — proof is best-effort, audit_trail covers gap */ }
  }

  return new Response(JSON.stringify(receipt), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
