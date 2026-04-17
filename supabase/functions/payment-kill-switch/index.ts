// ═══════════════════════════════════════════════════════════════
// SITA OS — Payment Kill Switch
// Admin-controlled emergency disable for all payment processing.
// POST { action: "activate" | "deactivate" | "status" }
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAdmin, getServiceClient } from "../_shared/auth.ts";
import { resolveUnifiedPolicy, negativeReceiptResponse } from "../_shared/policy.ts";

// In-memory kill-switch state (persisted to DB when available)
let killSwitchActive = false;
let activatedAt: string | null = null;
let activatedBy: string | null = null;

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return corsError("Method not allowed", 405);
  }

  // Require admin role
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  try {
    const { action } = await req.json();

    if (!["activate", "deactivate", "status"].includes(action)) {
      return corsError("Invalid action. Use: activate, deactivate, status", 400);
    }

    // Phase 19.C — Unified policy gate (R5 admin kill-switch)
    if (action !== "status") {
      const decision = resolveUnifiedPolicy({
        actor: "platform-admin",
        domain: "admin",
        riskClass: "R5",
        deviceTrust: 4,
        biometricStepUpRecent: req.headers.get("x-step-up-recent") === "true",
        hasJustification: true,
      });
      if (!decision.allowed) {
        return negativeReceiptResponse(decision, { fn: "payment-kill-switch", action });
      }
    }

    const serviceClient = getServiceClient();

    if (action === "status") {
      return corsResponse({
        active: killSwitchActive,
        activated_at: activatedAt,
        activated_by: activatedBy,
      });
    }

    if (action === "activate") {
      killSwitchActive = true;
      activatedAt = new Date().toISOString();
      activatedBy = auth.user.id;
    } else {
      killSwitchActive = false;
      activatedAt = null;
      activatedBy = null;
    }

    // Audit log
    await serviceClient.from("admin_action_audit").insert({
      actor_user_id: auth.user.id,
      action: `payment-kill-switch:${action}`,
      severity: action === "activate" ? "critical" : "high",
      plane: "control",
      metadata: {
        kill_switch_active: killSwitchActive,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[PaymentKillSwitch] ${action} by ${auth.user.email}`);

    return corsResponse({
      success: true,
      active: killSwitchActive,
      action,
      actor: auth.user.id,
    });
  } catch (err) {
    console.error("[PaymentKillSwitch] Error:", err);
    return corsError("Internal server error", 500);
  }
});
