import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (!roles || roles.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "status": {
        // Check current kill switch status
        const { data: killSwitch } = await supabase
          .from("admin_safety_actions")
          .select("*")
          .eq("action_key", "payment-kill-switch")
          .single();

        return new Response(
          JSON.stringify({
            active: killSwitch?.requires_confirmation ?? false,
            action_key: "payment-kill-switch",
            last_updated: killSwitch?.updated_at ?? null,
            risk_level: killSwitch?.risk_level ?? "critical",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "activate": {
        const { reason } = body;
        if (!reason || typeof reason !== "string" || reason.length < 5) {
          return new Response(
            JSON.stringify({ error: "Reason required (min 5 chars)" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Log the activation in audit trail
        await supabase.from("admin_action_audit").insert({
          actor_user_id: user.id,
          action: "payment-kill-switch-activated",
          severity: "critical",
          plane: "finance",
          justification: reason,
          metadata: { activated_at: new Date().toISOString() },
        });

        // Update the safety action to mark as active
        await supabase
          .from("admin_safety_actions")
          .upsert({
            action_key: "payment-kill-switch",
            display_name: "Payment Kill Switch",
            description: `Activated: ${reason}`,
            risk_level: "critical",
            requires_confirmation: true,
            requires_justification: true,
            requires_dual_approval: true,
            requires_dry_run: false,
            cooldown_seconds: 300,
            plane: "finance",
            required_permission: "payments.kill_switch",
          }, { onConflict: "action_key" });

        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment kill switch ACTIVATED",
            activated_by: user.id,
            reason,
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      case "deactivate": {
        const { reason: deactivateReason } = body;
        if (!deactivateReason || typeof deactivateReason !== "string" || deactivateReason.length < 5) {
          return new Response(
            JSON.stringify({ error: "Reason required (min 5 chars)" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        await supabase.from("admin_action_audit").insert({
          actor_user_id: user.id,
          action: "payment-kill-switch-deactivated",
          severity: "critical",
          plane: "finance",
          justification: deactivateReason,
          metadata: { deactivated_at: new Date().toISOString() },
        });

        await supabase
          .from("admin_safety_actions")
          .update({
            requires_confirmation: false,
            description: `Deactivated: ${deactivateReason}`,
          })
          .eq("action_key", "payment-kill-switch");

        return new Response(
          JSON.stringify({
            success: true,
            message: "Payment kill switch DEACTIVATED",
            deactivated_by: user.id,
            reason: deactivateReason,
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    console.error("Payment kill switch error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
