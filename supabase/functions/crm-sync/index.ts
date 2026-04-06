import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { z, zodValidate } from "../_shared/zod-validate.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("sync-leads"),
    leads: z.array(z.object({
      name: z.string().max(255),
      email: z.string().email().optional(),
      phone: z.string().max(50).optional(),
      source: z.string().max(100).optional(),
      status: z.string().max(50).default("new"),
      metadata: z.record(z.unknown()).optional(),
    })).min(1).max(200),
  }),
  z.object({
    action: z.literal("sync-customers"),
    customers: z.array(z.object({
      name: z.string().max(255),
      email: z.string().email(),
      phone: z.string().max(50).optional(),
      company: z.string().max(255).optional(),
      metadata: z.record(z.unknown()).optional(),
    })).min(1).max(200),
  }),
  z.object({
    action: z.literal("sync-opportunities"),
    opportunities: z.array(z.object({
      title: z.string().max(255),
      customer_id: z.string().uuid(),
      value_cents: z.number().int().min(0).optional(),
      stage: z.string().max(100).default("discovery"),
      probability: z.number().min(0).max(100).optional(),
      expected_close: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    })).min(1).max(100),
  }),
  z.object({ action: z.literal("health-check") }),
]);

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const rl = checkRateLimit(`crm:${user.id}`, 30);
    if (!rl.allowed) return rateLimitResponse(rl, corsHeaders);

    const body = await req.json();
    const v = zodValidate(body, ActionSchema);
    if (!v.success) return v.response;
    const d = v.data;

    if (d.action === "health-check") {
      const [leads, customers, opps] = await Promise.all([
        supabase.from("leads").select("id, created_at", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("customers").select("id, created_at", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
        supabase.from("opportunities").select("id, created_at", { count: "exact" }).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
      ]);
      return corsResponse({
        leads: { count: leads.count || 0, last_sync: leads.data?.[0]?.created_at || null },
        customers: { count: customers.count || 0, last_sync: customers.data?.[0]?.created_at || null },
        opportunities: { count: opps.count || 0, last_sync: opps.data?.[0]?.created_at || null },
      });
    }

    if (d.action === "sync-leads") {
      const records = d.leads.map(l => ({ ...l, user_id: user.id }));
      const { data, error } = await supabase.from("leads").upsert(records, { onConflict: "user_id,email" }).select();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "crm_leads_synced", category: "crm-sync",
        actor: "crm-sync", target_type: "leads", severity: "low",
        details: { count: records.length },
      });
      return corsResponse({ synced: data?.length || 0, leads: data });
    }

    if (d.action === "sync-customers") {
      const records = d.customers.map(c => ({ ...c, user_id: user.id }));
      const { data, error } = await supabase.from("customers").upsert(records, { onConflict: "user_id,email" }).select();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "crm_customers_synced", category: "crm-sync",
        actor: "crm-sync", target_type: "customers", severity: "low",
        details: { count: records.length },
      });
      return corsResponse({ synced: data?.length || 0, customers: data });
    }

    if (d.action === "sync-opportunities") {
      const records = d.opportunities.map(o => ({ ...o, user_id: user.id }));
      const { data, error } = await supabase.from("opportunities").insert(records).select();
      if (error) return corsError(error.message, 500);

      await supabase.from("audit_logs").insert({
        user_id: user.id, action: "crm_opportunities_synced", category: "crm-sync",
        actor: "crm-sync", target_type: "opportunities", severity: "low",
        details: { count: records.length },
      });
      return corsResponse({ synced: data?.length || 0, opportunities: data });
    }

    return corsError("Unknown action", 400);
  } catch (e) {
    return corsError(e.message || "Internal error", 500);
  }
});
