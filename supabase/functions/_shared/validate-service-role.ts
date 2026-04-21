import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsError } from "./cors.ts";

/**
 * Validates that the request carries the service-role key.
 * Use for admin-only edge functions that require elevated DB access.
 * Returns a Supabase admin client on success, or a CORS error Response on failure.
 */
export function requireServiceRole(req: Request): ReturnType<typeof createClient> | Response {
  const authHeader = req.headers.get("Authorization");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error("[validate-service-role] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return corsError("Server misconfigured", 500);
  }

  // Accept either the service role key directly or via Bearer token
  const token = authHeader?.replace("Bearer ", "");
  if (!token || token !== SERVICE_ROLE_KEY) {
    return corsError("Service role access required", 403);
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}