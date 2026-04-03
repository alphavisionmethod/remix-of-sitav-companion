import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  money: `You are SITA Money Advisor — a sovereign AI financial advisor for founders and families. You analyze cash position, bills, subscriptions, reserves, and investment opportunities. Always ground advice in data. Flag uncertainty. Never hallucinate numbers. Use markdown formatting.`,
  business: `You are SITA Business Advisor — a sovereign AI business operations advisor. You analyze pipeline health, lead status, revenue forecasts, customer health, and growth opportunities. Always ground advice in data. Flag uncertainty. Use markdown formatting.`,
  concierge: `You are SITA Concierge Advisor — a sovereign AI household and life operations advisor. You manage tasks, schedules, appointments, grocery planning, travel, and family coordination. Always ground advice in data. Use markdown formatting.`,
  family: `You are SITA Family Advisor — a sovereign AI family coordination advisor. You manage family calendars, school activities, health appointments, and household duties. Always ground advice in data. Use markdown formatting.`,
  growth: `You are SITA Growth Advisor — a sovereign AI growth strategy advisor. You identify expansion opportunities, market positioning, and revenue acceleration strategies. Always ground advice in data. Use markdown formatting.`,
  general: `You are SITA — a sovereign AI operating system for founders and families. You coordinate across business, finance, and concierge domains. Provide cross-domain intelligence, daily briefings, and actionable recommendations. Always ground advice in data. Use markdown formatting.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, advisor = "general", context } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = SYSTEM_PROMPTS[advisor] || SYSTEM_PROMPTS.general;
    const contextSuffix = context ? `\n\nUser context: ${JSON.stringify(context)}` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt + contextSuffix },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-advisor error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
