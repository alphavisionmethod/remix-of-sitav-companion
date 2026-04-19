// ═══════════════════════════════════════════════════════════════
// SITA OS — Account Deletion Edge Function
// Soft-deletes (records request) with 30-day grace period.
// Supports `request` and `cancel` operations.
// Hard-deletion is performed by a separate cron worker after grace.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { EdgeLogger } from "../_shared/logger.ts";
const logger = new EdgeLogger("account-delete");
logger.info("boot", { ts: Date.now() });

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface RequestBody {
  operation: "request" | "cancel";
  reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "invalid_json" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.operation !== "request" && body.operation !== "cancel") {
      return new Response(
        JSON.stringify({
          error: "invalid_operation",
          message: "operation must be 'request' or 'cancel'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const adminClient = createClient(supabaseUrl, serviceKey);

    if (body.operation === "request") {
      const scheduledPurgeAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data, error } = await adminClient
        .from("account_deletion_requests")
        .upsert(
          {
            user_id: userId,
            status: "pending",
            requested_at: new Date().toISOString(),
            scheduled_purge_at: scheduledPurgeAt,
            reason: body.reason ?? null,
            cancelled_at: null,
          },
          { onConflict: "user_id" },
        )
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: "request_failed", message: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          operation: "request",
          scheduled_purge_at: scheduledPurgeAt,
          request_id: data.id,
          grace_period_days: 30,
          message:
            "Account deletion scheduled. You can cancel any time within 30 days.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // operation === "cancel"
    const { data, error } = await adminClient
      .from("account_deletion_requests")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("status", "pending")
      .select()
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          error: "no_pending_request",
          message: "No pending deletion request found to cancel.",
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        operation: "cancel",
        request_id: data.id,
        message: "Account deletion cancelled.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("[account-delete] Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: "internal_error", message: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
