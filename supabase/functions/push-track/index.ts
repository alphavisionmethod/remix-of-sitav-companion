// ═══════════════════════════════════════════════════════════════
// SITA OS — Push Track Edge Function
// Records notification click/dismiss events for delivery receipts
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, handleCors, corsResponse, corsError } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return corsError("Method not allowed", 405);
  }

  try {
    const { notification_id, action } = await req.json();

    if (!notification_id || !action) {
      return corsError("Missing notification_id or action", 400);
    }

    if (!["clicked", "dismissed"].includes(action)) {
      return corsError("Invalid action. Must be 'clicked' or 'dismissed'", 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date().toISOString();
    const updateData: Record<string, string> = {};

    if (action === "clicked") {
      updateData.clicked_at = now;
      updateData.delivery_status = "clicked";
    } else {
      updateData.dismissed_at = now;
      updateData.delivery_status = "dismissed";
    }

    const { error } = await supabase
      .from("notification_delivery_receipts")
      .update(updateData)
      .eq("notification_id", notification_id);

    if (error) {
      console.error("push-track update error:", error);
      return corsError("Failed to update receipt", 500);
    }

    return corsResponse({ success: true, notification_id, action, tracked_at: now });
  } catch (err) {
    console.error("push-track error:", err);
    return corsError("Internal error", 500);
  }
});
