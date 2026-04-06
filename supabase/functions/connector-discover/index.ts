// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Discovery Engine
// Service discovery, matching, recommendation & catalog
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { requireAuth, AuthResult } from "../_shared/auth.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const logger = new EdgeLogger("connector-discover");

const ActionSchema = z.object({
  action: z.enum(["scan", "match", "recommend", "catalog"]),
  domain: z.string().optional(),
  tags: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).optional(),
});

// Complementary connector recommendations by class
const COMPLEMENTARY: Record<string, string[]> = {
  payment: ["accounting", "invoicing", "banking"],
  accounting: ["payment", "banking", "tax"],
  crm: ["email", "calendar", "communication"],
  email: ["crm", "calendar", "communication"],
  calendar: ["crm", "email", "project_management"],
  banking: ["accounting", "payment", "invoicing"],
  communication: ["crm", "email", "project_management"],
  storage: ["project_management", "communication"],
};

serve(async (req) => {
  const corsRes = handleCors(req);
  if (corsRes) return corsRes;

  const start = Date.now();

  // Rate limit
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const rl = checkRateLimit(`discover:${ip}`, 60, 60_000);
  if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

  // Auth
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  const { user, supabase } = auth as AuthResult;

  try {
    const body = await req.json();
    const parsed = ActionSchema.safeParse(body);
    if (!parsed.success) {
      return corsError("Validation failed: " + JSON.stringify(parsed.error.flatten().fieldErrors), 400);
    }

    const { action, domain, tags, limit = 50 } = parsed.data;
    let result: unknown;

    switch (action) {
      case "scan": {
        const { data, error } = await supabase
          .from("connector_registry")
          .select("*")
          .order("connector_class")
          .limit(limit);
        if (error) throw error;

        // Group by connector_class
        const grouped: Record<string, unknown[]> = {};
        for (const c of data || []) {
          const cls = (c as any).connector_class || "other";
          if (!grouped[cls]) grouped[cls] = [];
          grouped[cls].push(c);
        }
        result = { connectors: grouped, total: (data || []).length };
        break;
      }

      case "match": {
        if (!domain) return corsError("'domain' required for match action", 400);

        let query = supabase
          .from("connector_registry")
          .select("*")
          .eq("is_active", true);

        // Search by connector_class or name/description containing the domain
        const { data: byClass } = await query.ilike("connector_class", `%${domain}%`).limit(limit);
        const { data: byName } = await supabase
          .from("connector_registry")
          .select("*")
          .eq("is_active", true)
          .ilike("display_name", `%${domain}%`)
          .limit(limit);

        // Merge and deduplicate
        const seen = new Set<string>();
        const matches: unknown[] = [];
        for (const item of [...(byClass || []), ...(byName || [])]) {
          const id = (item as any).id;
          if (!seen.has(id)) {
            seen.add(id);
            matches.push({ ...item as any, relevance: (byClass || []).some((c: any) => c.id === id) ? "primary" : "secondary" });
          }
        }
        result = { matches, domain, total: matches.length };
        break;
      }

      case "recommend": {
        // Get user's existing connectors
        const { data: userAccounts } = await supabase
          .from("connector_accounts")
          .select("connector_id, connector_class, status")
          .eq("user_id", user.id);

        const existingClasses = new Set((userAccounts || []).map((a: any) => a.connector_class));
        const existingIds = new Set((userAccounts || []).map((a: any) => a.connector_id));

        // Find complementary classes
        const recommendedClasses = new Set<string>();
        for (const cls of existingClasses) {
          for (const comp of COMPLEMENTARY[cls] || []) {
            if (!existingClasses.has(comp)) recommendedClasses.add(comp);
          }
        }

        // Get connectors from recommended classes that user doesn't have
        const { data: available } = await supabase
          .from("connector_registry")
          .select("*")
          .eq("is_active", true)
          .limit(limit);

        const recommendations = (available || []).filter((c: any) =>
          !existingIds.has(c.id) && recommendedClasses.has(c.connector_class)
        ).map((c: any) => ({
          ...c,
          reason: `Complements your ${[...existingClasses].filter(cls => (COMPLEMENTARY[cls] || []).includes(c.connector_class)).join(", ")} connector(s)`,
        }));

        result = {
          recommendations,
          existing_classes: [...existingClasses],
          suggested_classes: [...recommendedClasses],
          total: recommendations.length,
        };
        break;
      }

      case "catalog": {
        // Full enriched catalog: registry + user connection status + health
        const [{ data: registry }, { data: accounts }, { data: configs }] = await Promise.all([
          supabase.from("connector_registry").select("*").eq("is_active", true).order("display_name").limit(limit),
          supabase.from("connector_accounts").select("connector_id, status, connected_at").eq("user_id", user.id),
          supabase.from("connector_configs").select("connector_id, health_status, last_sync_at, sync_frequency").eq("user_id", user.id),
        ]);

        const accountMap = new Map((accounts || []).map((a: any) => [a.connector_id, a]));
        const configMap = new Map((configs || []).map((c: any) => [c.connector_id, c]));

        const catalog = (registry || []).map((r: any) => ({
          ...r,
          user_status: accountMap.get(r.id)?.status || "not_connected",
          connected_at: accountMap.get(r.id)?.connected_at || null,
          health: configMap.get(r.id)?.health_status || null,
          last_sync: configMap.get(r.id)?.last_sync_at || null,
          sync_frequency: configMap.get(r.id)?.sync_frequency || null,
        }));

        result = { catalog, total: catalog.length };
        break;
      }
    }

    // Audit log
    await supabase.from("audit_logs").insert({
      user_id: user.id,
      action: `connector_discover:${action}`,
      category: "connector",
      actor: "user",
      target_type: "connector_registry",
      severity: "low",
      details: { action, domain, tags, result_count: (result as any)?.total || 0 },
    });

    const latency = Date.now() - start;
    logger.complete(200, latency, { action, userId: user.id });

    return corsResponse({ success: true, action, ...result, latency_ms: latency });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logger.error("Discovery failed", { error: msg, userId: user.id });
    return corsError(msg, 500);
  }
});
