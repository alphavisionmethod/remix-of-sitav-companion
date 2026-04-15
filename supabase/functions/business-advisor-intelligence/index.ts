import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = user.id;

    const { advisorIds, businessContext } = await req.json();

    if (!advisorIds || !Array.isArray(advisorIds) || !businessContext) {
      return new Response(JSON.stringify({ error: "advisorIds (array) and businessContext (string) required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are the SITA Business OS Advisor Intelligence System. You are generating structured recommendations from multiple specialized business advisors.

For each advisor ID provided, generate a focused recommendation based on the business context.

Return a JSON array of objects, each with:
- advisorId: string
- title: string (1-line recommendation title)
- summary: string (2-3 sentence analysis)
- urgency: "low" | "medium" | "high" | "critical"
- confidence: number 0-100
- suggestedActions: string[] (2-3 concrete next steps)
- riskFlags: string[] (0-2 risks if any)

Be specific, data-driven, and actionable. No generic advice.`;

    const startMs = Date.now();
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Advisor IDs to generate for: ${JSON.stringify(advisorIds)}\n\nBusiness Context:\n${businessContext}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_advisor_recommendations",
            description: "Generate structured advisor recommendations",
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
                    },
                    required: ["advisorId", "title", "summary", "urgency", "confidence", "suggestedActions"],
                  },
                },
              },
              required: ["recommendations"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_advisor_recommendations" } },
      }),
    });

    const latencyMs = Date.now() - startMs;

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const errorText = await aiResponse.text();
      console.error(`AI gateway error: ${status}`, errorText);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted — please add funds" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let recommendations = [];

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      try {
        const parsed = JSON.parse(toolCall.function.arguments);
        recommendations = parsed.recommendations || [];
      } catch {
        console.error("Failed to parse tool call arguments");
      }
    }

    // Log inference receipt
    try {
      const usage = aiData.usage;
      await supabase.from("ai_inference_receipts").insert({
        user_id: userId,
        model: "google/gemini-3-flash-preview",
        capability_id: "business-advisor-intelligence",
        prompt_family: "advisor-board",
        input_tokens: usage?.prompt_tokens ?? 0,
        output_tokens: usage?.completion_tokens ?? 0,
        latency_ms: latencyMs,
        status: "success",
        provider: "lovable-ai",
      });
    } catch (e) {
      console.error("Receipt logging failed:", e);
    }

    return new Response(JSON.stringify({ recommendations, latencyMs }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("business-advisor-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
