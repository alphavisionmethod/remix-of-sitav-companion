// ═══════════════════════════════════════════════════════════════
// SITA OS — Prompt Versioning Service (Phase 21.C)
// Actions: create-version, activate-version, rollback, compute-hash
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader ?? "" } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return corsError("Unauthorized", 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Admin gate
    const { data: adminCheck } = await admin.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!adminCheck) return corsError("Admin role required", 403);

    const body = await req.json();
    const { action, familyId, version, systemPrompt, template, variables, versionId } = body;

    if (action === "compute-hash") {
      const hash = await sha256Hex(`${systemPrompt ?? ""}|${template ?? ""}`);
      return corsResponse({ hash });
    }

    if (action === "create-version") {
      if (!familyId || !version) return corsError("familyId and version required", 400);
      const hash = await sha256Hex(`${systemPrompt ?? ""}|${template ?? ""}`);
      const { data, error } = await admin.from("ai_prompt_versions").insert({
        family_id: familyId,
        version,
        system_prompt: systemPrompt ?? "",
        template: template ?? "",
        variables: variables ?? [],
        status: "draft",
        hash,
        created_by: user.id,
      }).select().single();
      if (error) return corsError(error.message, 400);
      return corsResponse({ version: data });
    }

    if (action === "activate-version") {
      if (!versionId || !familyId) return corsError("versionId and familyId required", 400);
      // Deprecate prior active version
      await admin.from("ai_prompt_versions")
        .update({ status: "deprecated", deprecated_at: new Date().toISOString() })
        .eq("family_id", familyId).eq("status", "active");
      // Activate the requested version
      const { data, error } = await admin.from("ai_prompt_versions")
        .update({ status: "active", activated_at: new Date().toISOString() })
        .eq("id", versionId).select().single();
      if (error) return corsError(error.message, 400);
      // Update family pointer
      await admin.from("ai_prompt_families")
        .update({ current_version_id: versionId })
        .eq("family_id", familyId);
      return corsResponse({ version: data });
    }

    if (action === "rollback") {
      if (!familyId || !versionId) return corsError("familyId and versionId required", 400);
      await admin.from("ai_prompt_versions")
        .update({ status: "deprecated", deprecated_at: new Date().toISOString() })
        .eq("family_id", familyId).eq("status", "active");
      const { data, error } = await admin.from("ai_prompt_versions")
        .update({ status: "active", activated_at: new Date().toISOString() })
        .eq("id", versionId).select().single();
      if (error) return corsError(error.message, 400);
      await admin.from("ai_prompt_families")
        .update({ current_version_id: versionId })
        .eq("family_id", familyId);
      return corsResponse({ rolledBackTo: data });
    }

    return corsError(`Unknown action: ${action}`, 400);
  } catch (e) {
    console.error("prompt-versioning error:", e);
    return corsError(e instanceof Error ? e.message : "Internal error", 500);
  }
});
