// ═══════════════════════════════════════════════════════════════
// SITA OS — Kill Switch Toggle (Section B)
// Admin-gated mutation endpoint that writes to automation_kill_switches,
// emits audit log, raises an alert, and enforces dual-approval for
// severe switches.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { applyToggle, isDualApprovalSwitch, requireAdmin } from "../_shared/kill-switch-db.ts";

interface ToggleBody {
  switchId: string;
  enable: boolean;
  reason: string;
  expiresInMinutes?: number;
  severity?: string;
  approvalId?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Auth: validate caller via anon client + Bearer token
  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return new Response(JSON.stringify({ ok: false, error: "unauthenticated" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const actorUserId = userData.user.id;

  // Service-role client for writes (audit trigger needs SECURITY DEFINER context)
  const admin = createClient(supabaseUrl, serviceKey);

  if (!(await requireAdmin(admin, actorUserId))) {
    return new Response(JSON.stringify({ ok: false, error: "admin role required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: ToggleBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "invalid json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.switchId || typeof body.enable !== "boolean") {
    return new Response(JSON.stringify({ ok: false, error: "missing switchId or enable" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (body.enable && (!body.reason || body.reason.trim().length < 20)) {
    return new Response(JSON.stringify({ ok: false, error: "reason must be at least 20 characters" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Dual-approval flow for severe switches when activating
  if (body.enable && isDualApprovalSwitch(body.switchId)) {
    if (!body.approvalId) {
      // Create a pending approval record and return its id
      const { data: approval, error: appErr } = await admin
        .from("kill_switch_approvals")
        .insert({
          switch_id: body.switchId,
          initiated_by: actorUserId,
          reason: body.reason,
          intended_action: "activate",
          status: "pending",
          metadata: { expires_in_minutes: body.expiresInMinutes ?? null },
        })
        .select("id")
        .single();
      if (appErr) {
        return new Response(JSON.stringify({ ok: false, error: appErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ ok: false, requiresApproval: true, approvalId: approval?.id }),
        { status: 202, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    // Verify approval is approved by a different admin
    const { data: approval } = await admin
      .from("kill_switch_approvals")
      .select("*")
      .eq("id", body.approvalId)
      .single();
    if (!approval || approval.status !== "approved") {
      return new Response(JSON.stringify({ ok: false, error: "approval not granted" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (approval.approver_user_id === actorUserId) {
      return new Response(JSON.stringify({ ok: false, error: "approver must differ from initiator" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Mark approval as executed
    await admin
      .from("kill_switch_approvals")
      .update({ status: "executed", decided_at: new Date().toISOString() })
      .eq("id", body.approvalId);
  }

  const result = await applyToggle(admin, {
    switchId: body.switchId,
    enable: body.enable,
    reason: body.reason,
    actorUserId,
    expiresInMinutes: body.expiresInMinutes,
    severity: body.severity,
  });

  if (!result.ok) {
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Best-effort: raise an alert on activation so observability surfaces it
  if (body.enable) {
    try {
      await admin.functions.invoke("alert-ingest", {
        body: {
          alerts: [
            {
              source: "kill-switch-toggle",
              severity: body.severity === "severe" ? "critical" : "high",
              subsystem: "control-plane",
              title: `Kill switch activated: ${body.switchId}`,
              description: body.reason,
              fingerprint: `kill-switch:${body.switchId}`,
              metadata: { switchId: body.switchId, actorUserId, expiresAt: body.expiresInMinutes ?? null },
            },
          ],
        },
      });
    } catch (_e) { /* alert is best-effort */ }
  }

  return new Response(JSON.stringify({ ok: true, rowId: result.rowId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
