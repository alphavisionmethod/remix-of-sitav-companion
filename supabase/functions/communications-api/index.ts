// ═══════════════════════════════════════════════════════════════
// SITA OS — Communications API
// Message threads, send/receive, contacts management
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const cors = handleCors(req);
  if (cors) return cors;

  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const body = req.method === "GET" ? { action: "list-threads" } : await req.json();
    const { action, ...params } = body;

    switch (action) {
      case "list-threads": {
        const { data, error } = await auth.supabase
          .from("message_threads")
          .select("*, messages(count)")
          .eq("user_id", auth.user.id)
          .order("updated_at", { ascending: false })
          .limit(params.limit || 50);
        if (error) return corsError(error.message, 400);
        return corsResponse({ threads: data });
      }

      case "get-thread": {
        const { data: messages, error } = await auth.supabase
          .from("messages")
          .select("*")
          .eq("thread_id", params.thread_id)
          .order("created_at", { ascending: true })
          .limit(params.limit || 100);
        if (error) return corsError(error.message, 400);
        return corsResponse({ messages });
      }

      case "send-message": {
        const { data, error } = await auth.supabase
          .from("messages")
          .insert({
            thread_id: params.thread_id,
            sender_id: auth.user.id,
            content: params.content,
            message_type: params.message_type || "text",
          })
          .select()
          .single();
        if (error) return corsError(error.message, 400);

        // Update thread timestamp
        await auth.supabase
          .from("message_threads")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", params.thread_id);

        return corsResponse({ message: data }, 201);
      }

      case "list-contacts": {
        const { data, error } = await auth.supabase
          .from("contacts")
          .select("*")
          .eq("user_id", auth.user.id)
          .order("display_name");
        if (error) return corsError(error.message, 400);
        return corsResponse({ contacts: data });
      }

      default:
        return corsError("Unknown action", 400);
    }
  } catch (err) {
    console.error("[CommunicationsAPI]", err);
    return corsError("Internal server error", 500);
  }
});
