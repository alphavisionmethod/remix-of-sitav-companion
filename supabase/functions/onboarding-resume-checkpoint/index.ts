// Onboarding resume checkpoint — first-use re-entry persistence.
// POST: upsert checkpoint by (user_id, session_id) — returns resume_token + expires_at.
// GET ?resume_token=...: returns the checkpoint row if not expired and owned by caller.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const VALID_BRANCHES = new Set(["quick", "balanced", "deep"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "server_misconfigured" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return json({ error: "unauthorized" }, 401);
  }

  // Validate JWT in-code
  const authClient = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "unauthorized" }, 401);
  }
  const userId = userData.user.id;

  // Service-role client for the actual table writes (RLS still enforced via user_id match).
  const admin = createClient(supabaseUrl, serviceKey);

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("resume_token");
      if (!token) return json({ error: "resume_token_required" }, 400);

      const { data, error } = await admin
        .from("onboarding_resume_checkpoints")
        .select("*")
        .eq("resume_token", token)
        .eq("user_id", userId)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (error) return json({ error: error.message }, 500);
      if (!data) return json({ error: "checkpoint_not_found_or_expired" }, 404);
      return json({ checkpoint: data });
    }

    if (req.method === "POST") {
      let body: Record<string, unknown>;
      try {
        body = await req.json();
      } catch {
        return json({ error: "invalid_json" }, 400);
      }

      const sessionId = String(body.session_id ?? "").trim();
      const currentScreen = Number(body.current_screen);
      const branch = String(body.branch ?? "").trim();
      const profileSnapshot = (body.profile_snapshot ?? {}) as Record<string, unknown>;
      const conditionalState = (body.conditional_state ?? {}) as Record<string, unknown>;
      const lastCompletedScreen =
        body.last_completed_screen === undefined || body.last_completed_screen === null
          ? null
          : Number(body.last_completed_screen);

      if (!sessionId) return json({ error: "session_id_required" }, 400);
      if (!Number.isInteger(currentScreen) || currentScreen < 1 || currentScreen > 29) {
        return json({ error: "current_screen_out_of_range" }, 400);
      }
      if (!VALID_BRANCHES.has(branch)) {
        return json({ error: "invalid_branch" }, 400);
      }
      if (
        lastCompletedScreen !== null &&
        (!Number.isInteger(lastCompletedScreen) ||
          lastCompletedScreen < 0 ||
          lastCompletedScreen > 29)
      ) {
        return json({ error: "last_completed_screen_out_of_range" }, 400);
      }

      const { data, error } = await admin
        .from("onboarding_resume_checkpoints")
        .upsert(
          {
            user_id: userId,
            session_id: sessionId,
            current_screen: currentScreen,
            branch,
            profile_snapshot: profileSnapshot,
            conditional_state: conditionalState,
            last_completed_screen: lastCompletedScreen,
          },
          { onConflict: "user_id,session_id" },
        )
        .select("resume_token, expires_at, current_screen, branch, updated_at")
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, ...data });
    }

    return json({ error: "method_not_allowed" }, 405);
  } catch (e) {
    return json({ error: (e as Error).message ?? "internal_error" }, 500);
  }
});
