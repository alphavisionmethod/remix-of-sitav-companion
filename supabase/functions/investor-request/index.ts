// Investor deal-room request — public submission, admin-only review
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TICKETS = ["lt_50k", "50_250k", "250k_1m", "1m_plus"];
const STAGES = ["preseed", "seed", "later"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const fund = String(body?.fund_name ?? "").trim().slice(0, 200);
  const contact = String(body?.contact_name ?? "").trim().slice(0, 120);
  const role = body?.contact_role ? String(body.contact_role).slice(0, 120) : null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const ticket = TICKETS.includes(body?.ticket_band) ? body.ticket_band : null;
  const jurisdiction = body?.jurisdiction ? String(body.jurisdiction).slice(0, 80) : null;
  const stage = STAGES.includes(body?.stage_interest) ? body.stage_interest : null;
  const notes = body?.notes ? String(body.notes).slice(0, 1500) : null;

  if (!fund || !contact || !ticket || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from("investor_requests").insert({
    fund_name: fund, contact_name: contact, contact_role: role, email,
    ticket_band: ticket, jurisdiction, stage_interest: stage, notes,
  });
  if (error) {
    console.error("investor-request", error);
    return new Response(JSON.stringify({ error: "insert_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
