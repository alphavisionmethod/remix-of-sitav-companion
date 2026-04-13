import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsError } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";

const SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000000";

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const user = auth.user;
    const supabaseClient = auth.supabase;

    const url = new URL(req.url);

    // ── GET: List knowledge for an advisor ──
    if (req.method === "GET") {
      const advisorId = url.searchParams.get("advisor_id") || "sita-advisor";
      const domain = url.searchParams.get("domain");

      let query = supabaseClient
        .from("advisor_knowledge")
        .select("*")
        .or(`user_id.eq.${user.id},user_id.eq.${SYSTEM_USER_ID}`)
        .eq("status", "active")
        .order("confidence", { ascending: false });

      if (advisorId !== "all") {
        query = query.in("advisor_id", [advisorId, "sita-advisor"]);
      }
      if (domain) {
        query = query.in("domain", [domain, "general"]);
      }

      const { data, error } = await query.limit(100);
      if (error) return corsError(error.message, 500);

      // Mark system vs user entries
      const entries = (data || []).map((e: Record<string, unknown>) => ({
        ...e,
        is_system: e.user_id === SYSTEM_USER_ID,
        editable: e.user_id === user.id,
      }));

      return new Response(JSON.stringify({ entries, count: entries.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST: Add user knowledge ──
    if (req.method === "POST") {
      const body = await req.json();
      const { advisor_id, domain, title, content, tags, confidence } = body;

      if (!title || !content) return corsError("title and content are required", 400);

      const { data, error } = await supabaseClient
        .from("advisor_knowledge")
        .insert({
          user_id: user.id,
          advisor_id: advisor_id || "sita-advisor",
          domain: domain || "general",
          title,
          content,
          tags: tags || [],
          confidence: confidence || 0.8,
          source: "user",
          status: "active",
        })
        .select()
        .single();

      if (error) return corsError(error.message, 500);

      return new Response(JSON.stringify({ entry: data }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE: Remove user knowledge only ──
    if (req.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id) return corsError("id is required", 400);

      // Verify it's the user's own entry (not system)
      const { data: entry } = await supabaseClient
        .from("advisor_knowledge")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!entry) return corsError("Entry not found", 404);
      if (entry.user_id === SYSTEM_USER_ID) return corsError("Cannot delete system knowledge", 403);
      if (entry.user_id !== user.id) return corsError("Not authorized", 403);

      const { error } = await supabaseClient
        .from("advisor_knowledge")
        .delete()
        .eq("id", id);

      if (error) return corsError(error.message, 500);

      return new Response(JSON.stringify({ deleted: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return corsError("Method not allowed", 405);
  } catch (e) {
    console.error("advisor-knowledge-manage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
