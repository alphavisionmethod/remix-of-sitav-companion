import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsError } from "./cors.ts";

export interface AuthResult {
  user: { id: string; email?: string };
  supabase: ReturnType<typeof createClient>;
}

/**
 * Validate auth header + return authenticated user & supabase client.
 * Returns a Response (error) if auth fails, or AuthResult on success.
 */
export async function requireAuth(req: Request): Promise<AuthResult | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return corsError("Unauthorized", 401);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return corsError("Invalid token", 401);

  return { user: { id: user.id, email: user.email }, supabase };
}

/**
 * Require admin role. Returns Response (error) or AuthResult.
 */
export async function requireAdmin(req: Request): Promise<AuthResult | Response> {
  const result = await requireAuth(req);
  if (result instanceof Response) return result;

  const { data: isAdmin } = await result.supabase.rpc("has_role", {
    _user_id: result.user.id,
    _role: "admin",
  });

  if (!isAdmin) return corsError("Admin access required", 403);
  return result;
}

export function getServiceClient() {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
}
