// Waitlist signup — public, anonymous-friendly
// Validates input, dedupes by email, returns position + referral code.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function isEmail(s: unknown): s is string {
  return typeof s === "string" && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s) && s.length <= 255;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const email = (body?.email ?? "").toString().trim().toLowerCase();
  const referredBy = body?.referred_by ? String(body.referred_by).slice(0, 16) : null;
  const source = body?.source ? String(body.source).slice(0, 32) : "website";
  const ua = req.headers.get("user-agent")?.slice(0, 256) ?? null;
  const country = req.headers.get("cf-ipcountry") ?? req.headers.get("x-vercel-ip-country") ?? null;

  if (!isEmail(email)) {
    return new Response(JSON.stringify({ error: "invalid_email" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { data: existing } = await supabase
    .from("waitlist_signups")
    .select("id, position, referral_code")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({
      ok: true, already: true,
      position: existing.position, referral_code: existing.referral_code,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const { data, error } = await supabase
    .from("waitlist_signups")
    .insert({ email, referred_by: referredBy, source, user_agent: ua, ip_country: country, position: 0 })
    .select("position, referral_code")
    .single();

  if (error) {
    console.error("waitlist insert", error);
    return new Response(JSON.stringify({ error: "insert_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (referredBy) {
    await supabase.rpc("noop").catch(() => {});
    const { data: ref } = await supabase
      .from("waitlist_signups")
      .select("id, position")
      .eq("referral_code", referredBy)
      .maybeSingle();
    if (ref && ref.position > 5) {
      await supabase
        .from("waitlist_signups")
        .update({ position: Math.max(1, ref.position - 5) })
        .eq("id", ref.id);
    }
  }

  return new Response(JSON.stringify({
    ok: true, already: false,
    position: data.position, referral_code: data.referral_code,
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
