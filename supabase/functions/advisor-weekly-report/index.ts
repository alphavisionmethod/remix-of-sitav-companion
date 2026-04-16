import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuth } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // ── JWT AUTH (canonical) ───────────────────────────────────────
    const auth = await requireAuth(req);
    if (auth instanceof Response) return auth;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { brief, profitSummary, reflection } = await req.json();

    const systemPrompt = `You are the SITA Business OS Weekly Report Generator. Create a comprehensive weekly executive performance report.

BUSINESS DATA:
- Health Score: ${brief?.healthScore?.overall ?? "N/A"}
- Cash Pressure: ${JSON.stringify(brief?.cashPressure ?? {})}
- Top Leaks: ${JSON.stringify(brief?.topLeaks ?? [])}
- Revenue at Risk: $${profitSummary?.totalAtRisk ?? 0}
- Revenue Recovered: $${profitSummary?.totalRecovered ?? 0}
- Unresolved Signals: ${profitSummary?.unresolvedSignals ?? 0}
- Profit Learnings: ${JSON.stringify(profitSummary?.learnings ?? [])}
- Reflection Data: ${JSON.stringify(reflection ?? {})}

Generate a structured JSON report with these exact keys:
- executiveSummary: 2-3 sentence markdown overview
- wins: array of 3-5 specific wins this week
- losses: array of 2-4 losses or misses
- patterns: array of 3-4 behavioral/business patterns detected
- advisorAccuracy: array of {advisorId, accuracy (number 0-100), insight (one sentence)}
- nextWeekPriorities: array of 4-5 prioritized action items
- riskChanges: array of 3-4 risk change descriptions with ⬆️⬇️→ indicators

Be specific, reference actual data, and provide actionable insights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate the weekly executive report based on the provided business data." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_weekly_report",
            description: "Return structured weekly report",
            parameters: {
              type: "object",
              properties: {
                executiveSummary: { type: "string" },
                wins: { type: "array", items: { type: "string" } },
                losses: { type: "array", items: { type: "string" } },
                patterns: { type: "array", items: { type: "string" } },
                advisorAccuracy: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      advisorId: { type: "string" },
                      accuracy: { type: "number" },
                      insight: { type: "string" },
                    },
                    required: ["advisorId", "accuracy", "insight"],
                  },
                },
                nextWeekPriorities: { type: "array", items: { type: "string" } },
                riskChanges: { type: "array", items: { type: "string" } },
              },
              required: ["executiveSummary", "wins", "losses", "patterns", "advisorAccuracy", "nextWeekPriorities", "riskChanges"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_weekly_report" } },
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let report = null;

    if (toolCall?.function?.arguments) {
      try {
        report = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    return new Response(JSON.stringify({ report }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("advisor-weekly-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});