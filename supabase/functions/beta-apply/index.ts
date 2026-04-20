// Beta tester application — public, scored
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_DEVICES = ["web", "pwa", "macos", "windows", "linux", "ubuntu_iso"];
const VALID_USE_CASES = ["owner_operator", "agency", "finance", "family_office", "creator", "other"];
const VALID_LEVELS = ["non_technical", "power_user", "engineer"];

function score(input: {
  email: string; name: string; country?: string; useCase?: string;
  level?: string; why?: string; devices: string[]; inviteCode?: string;
}): number {
  let s = 0;
  // completeness 20
  const filled = [input.email, input.name, input.country, input.useCase, input.level, input.why]
    .filter(Boolean).length;
  s += Math.round((filled / 6) * 20);
  // use case fit 25
  if (["owner_operator", "agency", "family_office"].includes(input.useCase ?? "")) s += 25;
  else if (input.useCase) s += 12;
  // device coverage 15
  s += Math.min(15, (input.devices?.length ?? 0) * 5);
  // technical level 15 (balanced)
  if (input.level === "engineer" || input.level === "non_technical") s += 15;
  else if (input.level === "power_user") s += 10;
  // why 15
  if (input.why) {
    const len = input.why.trim().length;
    if (len >= 80) s += 15;
    else if (len >= 30) s += 9;
    else if (len > 0) s += 4;
  }
  // source/invite 10
  if (input.inviteCode) s += 10;
  return Math.min(100, s);
}

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

  const email = String(body?.email ?? "").trim().toLowerCase();
  const name = String(body?.full_name ?? "").trim().slice(0, 120);
  const country = body?.country ? String(body.country).slice(0, 64) : null;
  const useCase = VALID_USE_CASES.includes(body?.use_case) ? body.use_case : null;
  const level = VALID_LEVELS.includes(body?.technical_level) ? body.technical_level : null;
  const why = String(body?.why ?? "").trim().slice(0, 600);
  const inviteCode = body?.invite_code ? String(body.invite_code).slice(0, 32) : null;
  const devices: string[] = Array.isArray(body?.device_targets)
    ? body.device_targets.filter((d: any) => VALID_DEVICES.includes(d)).slice(0, 6)
    : [];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) {
    return new Response(JSON.stringify({ error: "invalid_input" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const computed = score({ email, name, country: country ?? undefined, useCase: useCase ?? undefined, level: level ?? undefined, why, devices, inviteCode: inviteCode ?? undefined });
  const status = computed >= 80 ? "hot" : computed >= 60 ? "priority" : computed >= 40 ? "queue" : "nurture";

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase.from("beta_applications").insert({
    email, full_name: name, country,
    use_case: useCase, technical_level: level, why, invite_code: inviteCode,
    device_targets: devices,
    profile: { use_case: useCase, technical_level: level, devices },
    score: computed, status,
  });

  if (error) {
    console.error("beta-apply", error);
    return new Response(JSON.stringify({ error: "insert_failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, score: computed, status }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
