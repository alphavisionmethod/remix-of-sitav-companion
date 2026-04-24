// Self-Heal Receipts API
// Lists / fetches heal-receipt JSON artifacts uploaded to the `heal-receipts`
// storage bucket by CI (scripts/test-self-heal.mjs). Admin-only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth = req.headers.get("Authorization") ?? "";

  // Verify caller is an admin via the user's JWT
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
  const { data: userRes } = await userClient.auth.getUser();
  const user = userRes?.user;
  if (!user) return corsError("unauthorized", 401);

  const { data: isAdmin, error: roleErr } = await userClient.rpc("has_role", {
    _user_id: user.id, _role: "admin",
  });
  if (roleErr || !isAdmin) return corsError("forbidden", 403);

  // Service client for storage ops (bypass RLS)
  const admin = createClient(SUPABASE_URL, SERVICE);

  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "list";

  try {
    if (action === "list") {
      const { data: files, error } = await admin.storage
        .from("heal-receipts")
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return corsResponse({ ok: true, files: files ?? [] });
    }

    if (action === "get") {
      const path = url.searchParams.get("path");
      if (!path) return corsError("missing path", 400);
      const { data, error } = await admin.storage.from("heal-receipts").download(path);
      if (error) throw error;
      const text = await data.text();
      let json: unknown = null;
      try { json = JSON.parse(text); } catch { json = { raw: text }; }
      return corsResponse({ ok: true, receipt: json });
    }

    return corsError("unknown action", 400);
  } catch (e) {
    return corsError(String((e as Error)?.message ?? e), 500);
  }
});