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

    const {
      advisorId, advisorName, advisorRole, personalityTraits, communicationStyle,
      domainScope, userMessage, conversationHistory, businessContext, memoryContext,
    } = await req.json();

    if (!userMessage || !advisorId) {
      return new Response(JSON.stringify({ error: "Missing advisorId or userMessage" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are ${advisorName}, a ${advisorRole} in the SITA Business OS Board of Advisors.

PERSONALITY TRAITS: ${(personalityTraits ?? []).join(", ")}
COMMUNICATION STYLE: ${communicationStyle ? `Tone: ${communicationStyle.tone}, Verbosity: ${communicationStyle.verbosity}, Formality: ${communicationStyle.formality}` : "Professional and concise"}
DOMAIN EXPERTISE: ${(domainScope ?? []).join(", ")}

BUSINESS CONTEXT:
${businessContext ? JSON.stringify(businessContext).slice(0, 2000) : "No context loaded."}

MEMORY CONTEXT:
- Long-term insights: ${memoryContext?.longTerm?.join("; ") ?? "None"}
- Owner preferences: ${memoryContext?.preferences?.join("; ") ?? "None"}

RULES:
1. Stay in character as ${advisorName} at all times.
2. Give specific, actionable advice grounded in the business context.
3. Reference actual numbers, clients, and situations from the business data when relevant.
4. Be honest about uncertainty — state confidence levels when making predictions.
5. Keep responses focused and professional. Use markdown formatting.
6. If asked about something outside your domain, acknowledge it and suggest which advisor would be better.
7. Never fabricate data — only reference information from the provided context.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory ?? []).slice(-10),
      { role: "user", content: userMessage },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI gateway error:", status, await response.text());
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content ?? "I couldn't generate a response.";

    return new Response(JSON.stringify({ response: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("advisor-conversation error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});