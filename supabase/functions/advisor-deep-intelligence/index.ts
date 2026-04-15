import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { advisorIds, businessContext, memorySnapshot, archetype, advisorPersonas } = await req.json();

    const systemPrompt = `You are the SITA Business OS Board of Advisors — an elite AI-native executive advisory engine. You have ${(advisorIds?.length ?? 10)} specialized advisors analyzing a business.

BUSINESS CONTEXT:
${businessContext ?? "No context provided."}

MEMORY CONTEXT:
${memorySnapshot ? JSON.stringify(memorySnapshot).slice(0, 2000) : "No memory loaded."}

BUSINESS ARCHETYPE: ${archetype ?? "general"}

${advisorPersonas ? `ADVISOR PERSONAS:\n${advisorPersonas.slice(0, 3000)}` : ""}

Generate recommendations as a JSON array. Each recommendation must have:
- advisorId: one of the advisor IDs provided
- title: concise action title
- summary: 2-3 sentence explanation with reasoning
- urgency: "low" | "medium" | "high" | "critical"
- confidence: 0.0-1.0
- suggestedActions: array of 1-3 specific next steps
- riskFlags: array of risk considerations (can be empty)
- confidenceProfile: object with 8 scores (0-100): confidence, urgency, businessImpact, reversibility, profitRelevance, relationshipRisk, operationalRisk, clarity

Return ONLY a JSON object with key "recommendations" containing the array. Generate 6-10 recommendations covering revenue, operations, finance, client health, and strategy.`;

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
          { role: "user", content: `Generate executive advisor recommendations for this business. Advisor IDs: ${JSON.stringify(advisorIds ?? [])}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_recommendations",
            description: "Return structured advisor recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      advisorId: { type: "string" },
                      title: { type: "string" },
                      summary: { type: "string" },
                      urgency: { type: "string", enum: ["low", "medium", "high", "critical"] },
                      confidence: { type: "number" },
                      suggestedActions: { type: "array", items: { type: "string" } },
                      riskFlags: { type: "array", items: { type: "string" } },
                      confidenceProfile: {
                        type: "object",
                        properties: {
                          confidence: { type: "number" },
                          urgency: { type: "number" },
                          businessImpact: { type: "number" },
                          reversibility: { type: "number" },
                          profitRelevance: { type: "number" },
                          relationshipRisk: { type: "number" },
                          operationalRisk: { type: "number" },
                          clarity: { type: "number" },
                        },
                        required: ["confidence", "urgency", "businessImpact", "reversibility", "profitRelevance", "relationshipRisk", "operationalRisk", "clarity"],
                      },
                    },
                    required: ["advisorId", "title", "summary", "urgency", "confidence", "suggestedActions", "riskFlags"],
                  },
                },
              },
              required: ["recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "provide_recommendations" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let recommendations = [];

    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        recommendations = parsed.recommendations ?? [];
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("advisor-deep-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
