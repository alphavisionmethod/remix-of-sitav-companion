// ═══════════════════════════════════════════════════════════════
// SITA OS — DSAR / Data Export Edge Function
// Returns a JSON dump of all user-owned rows across owner-scoped tables.
// Records a receipt in `data_export_requests` for audit trail.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Curated set of owner-scoped tables to export.
// Keep this list intentionally explicit so we never accidentally include
// service-only or cross-tenant tables.
const EXPORT_TABLES = [
  "profiles",
  "accounts",
  "user_roles",
  "advisor_agents",
  "advisor_board_recommendations",
  "advisor_board_actions",
  "advisor_feedback",
  "advisor_knowledge",
  "advisor_memories",
  "advisor_profiles",
  "ai_usage_ledger",
  "ai_inference_receipts",
  "ai_workforce_invocations",
  "ai_workforce_outputs",
  "ai_workforce_recommendations",
  "ai_workforce_approval_queue",
  "file_metadata",
  "flagship_loop_completions",
  "data_export_requests",
  "account_deletion_requests",
] as const;

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

    // Auth: validate JWT from caller
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
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Insert pending request receipt
    const { data: requestRow, error: insertError } = await adminClient
      .from("data_export_requests")
      .insert({
        user_id: userId,
        status: "pending",
        export_format: "json",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[data-export] Failed to record request:", insertError);
    }

    // Aggregate user-owned rows across allow-listed tables
    const exportPayload: Record<string, unknown[]> = {};
    let totalRows = 0;
    let tablesWithData = 0;

    for (const table of EXPORT_TABLES) {
      try {
        const { data, error } = await adminClient
          .from(table)
          .select("*")
          .eq("user_id", userId);
        if (error) {
          console.warn(`[data-export] Skip ${table}: ${error.message}`);
          exportPayload[table] = [];
          continue;
        }
        exportPayload[table] = data ?? [];
        if (data && data.length > 0) {
          totalRows += data.length;
          tablesWithData += 1;
        }
      } catch (e) {
        console.warn(`[data-export] Exception on ${table}:`, e);
        exportPayload[table] = [];
      }
    }

    const userMeta = {
      user_id: userId,
      email: userData.user.email,
      created_at: userData.user.created_at,
      app_metadata: userData.user.app_metadata,
      user_metadata: userData.user.user_metadata,
    };

    const fullExport = {
      generated_at: new Date().toISOString(),
      user: userMeta,
      tables: exportPayload,
    };

    const exportJson = JSON.stringify(fullExport, null, 2);
    const bytes = new TextEncoder().encode(exportJson).length;

    // Mark request completed
    if (requestRow) {
      await adminClient
        .from("data_export_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          row_count: totalRows,
          table_count: tablesWithData,
          bytes_exported: bytes,
        })
        .eq("id", requestRow.id);
    }

    return new Response(exportJson, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="sita-export-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (e) {
    console.error("[data-export] Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: "internal_error", message: String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
