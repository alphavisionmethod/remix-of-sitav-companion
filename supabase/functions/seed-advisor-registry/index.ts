// ═══════════════════════════════════════════════════════════════
// SITA OS — Seed Advisor Registry (Phase 21.B)
// One-shot DB sync from generated/advisor-registry.json
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsResponse, corsError } from "../_shared/cors.ts";

const ADVISORS = [
  { advisor_id: "business-advisor", display_name: "Business Advisor", domain: "business-os", council: "customer-facing", default_model: "google/gemini-2.5-flash", prompt_family_id: "business-advisor-system", autonomy_level: "L4-simulate", risk_tier: "R2", maturity: "alpha", confidence_threshold: 0.7 },
  { advisor_id: "money-advisor", display_name: "Money Advisor", domain: "finance-os", council: "customer-facing", default_model: "google/gemini-2.5-pro", prompt_family_id: "money-advisor-system", autonomy_level: "L5-approval-ready", risk_tier: "R3", maturity: "alpha", confidence_threshold: 0.8 },
  { advisor_id: "concierge-advisor", display_name: "Concierge Advisor", domain: "concierge-os", council: "customer-facing", default_model: "google/gemini-2.5-flash", prompt_family_id: "concierge-advisor-system", autonomy_level: "L4-simulate", risk_tier: "R2", maturity: "alpha", confidence_threshold: 0.7 },
  { advisor_id: "strategy-advisor", display_name: "Strategy Advisor", domain: "cross-domain", council: "customer-facing", default_model: "google/gemini-2.5-pro", prompt_family_id: "strategy-advisor-system", autonomy_level: "L3-draft", risk_tier: "R3", maturity: "scaffold", confidence_threshold: 0.8 },
  { advisor_id: "business-scout", display_name: "Business Scout", domain: "business-os", council: "customer-facing", default_model: "google/gemini-2.5-flash-lite", prompt_family_id: "business-advisor-system", autonomy_level: "L2-recommend", risk_tier: "R1", maturity: "beta", confidence_threshold: 0.6 },
  { advisor_id: "money-guardian", display_name: "Money Guardian", domain: "finance-os", council: "customer-facing", default_model: "google/gemini-2.5-flash", prompt_family_id: "money-advisor-system", autonomy_level: "L2-recommend", risk_tier: "R2", maturity: "beta", confidence_threshold: 0.75 },
];


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

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];
    for (const advisor of ADVISORS) {
      const { error } = await admin.from("advisor_registry").upsert(advisor, { onConflict: "advisor_id" });
      results.push({ id: advisor.advisor_id, ok: !error, error: error?.message });
    }

    return corsResponse({
      seeded: results.filter(r => r.ok).length,
      total: ADVISORS.length,
      results,
    });
  } catch (e) {
    console.error("seed-advisor-registry error:", e);
    return corsError(e instanceof Error ? e.message : "Internal error", 500);
  }
});
