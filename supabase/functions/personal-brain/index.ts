import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODE_PROMPTS: Record<string, string> = {
  think: `You are SITA Brain — Think Mode. You are a reflective thinking partner. Help the user brainstorm, debate ideas, journal, analyze problems from multiple angles. Use Socratic questioning. Present counterarguments. Help them think deeply.`,
  learn: `You are SITA Brain — Learn Mode. You are a patient, expert tutor. Help the user learn any skill: coding, languages, instruments, business concepts, science, math. Break complex topics into digestible steps. Track their progress. Quiz them. Celebrate wins.`,
  build: `You are SITA Brain — Build Mode. You are a startup advisor and product strategist. Help the user build a new business or project: validate ideas, analyze markets, plan MVPs, create task lists, design business models, estimate costs. Be practical and actionable.`,
  create: `You are SITA Brain — Create Mode. You are a creative assistant. Help the user write, design, compose, invent. Offer templates, examples, and frameworks. Help them create presentations, documents, proposals, content. Suggest improvements and alternatives.`,
};

async function buildBrainContext(
  supabaseClient: ReturnType<typeof createClient>,
  userId: string,
  mode: string
): Promise<string> {
  const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.think;

  // Fetch cross-advisor memories for holistic context
  const [factsRes, memoriesRes, prefsRes] = await Promise.all([
    supabaseClient
      .from("advisor_memories")
      .select("advisor_id, content")
      .eq("user_id", userId)
      .eq("memory_type", "fact")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseClient
      .from("advisor_memories")
      .select("advisor_id, content")
      .eq("user_id", userId)
      .eq("memory_type", "summary")
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseClient
      .from("advisor_memories")
      .select("content")
      .eq("user_id", userId)
      .eq("memory_type", "preference")
      .limit(10),
  ]);

  let prompt = modePrompt;

  const facts = factsRes.data ?? [];
  if (facts.length > 0) {
    prompt += "\n\n## What I Know About This User (from all advisors)\n";
    for (const f of facts) {
      prompt += `- [${f.advisor_id}]: ${f.content}\n`;
    }
  }

  const memories = memoriesRes.data ?? [];
  if (memories.length > 0) {
    prompt += "\n\n## Recent Context\n";
    for (const m of memories) {
      prompt += `- [${m.advisor_id}]: ${m.content}\n`;
    }
  }

  const prefs = prefsRes.data ?? [];
  if (prefs.length > 0) {
    prompt += "\n\n## User Preferences\n";
    for (const p of prefs) {
      prompt += `- ${p.content}\n`;
    }
  }

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, mode = "think" } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Check budget
    const { data: budget } = await supabaseClient
      .from("user_ai_budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("period", "monthly")
      .maybeSingle();

    let model = "google/gemini-3-flash-preview";
    if (budget && budget.hard_limit && budget.used_cost_cents >= budget.limit_cost_cents) {
      return new Response(JSON.stringify({ error: "Monthly AI budget exceeded. Upgrade or wait for reset." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = await buildBrainContext(supabaseClient, user.id, mode);

    const startTime = Date.now();
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: response.status === 429 ? "Rate limited" : "AI service error" }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Log token usage (approximate — streaming doesn't give exact counts)
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const inputApprox = JSON.stringify(messages).length / 4;
    adminClient.from("ai_token_usage").insert({
      user_id: user.id,
      advisor_id: "personal-brain",
      model,
      provider: "google",
      input_tokens: Math.ceil(inputApprox),
      output_tokens: 0,
      cost_cents: 0,
      domain: mode,
      category: "inference",
    }).then(() => {}).catch(e => console.error("Token log error:", e));

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("personal-brain error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
