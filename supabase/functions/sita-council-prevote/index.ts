// ═══════════════════════════════════════════════════════════════
// SITA OS — Council Pre-Vote (Phase G)
// ═══════════════════════════════════════════════════════════════
// Lightweight server-side scorer. Calls Lovable AI Gateway with a
// strict tool-call schema → returns {votes, quorum_reached, ...}.
// Never blocks: caller times out at 1.5s.
// ═══════════════════════════════════════════════════════════════

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADVISORS = ["operator", "cfo", "concierge", "risk", "growth", "legal"] as const;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { plan } = await req.json();
    if (!plan?.id) {
      return new Response(JSON.stringify({ error: "plan required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      // Graceful degrade: empty unanimous abstain
      return new Response(JSON.stringify({ plan_id: plan.id, quorum_reached: false, consensus_score: 0, votes: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const sysPrompt = `You are 6 advisors (operator, cfo, concierge, risk, growth, legal) silently scoring a plan. Be terse.`;
    const userPrompt = `Plan: ${JSON.stringify({ title: plan.title, intent: plan.intent, steps: plan.steps?.map((s: { skillId: string; summary: string; risk: string }) => ({ skill: s.skillId, summary: s.summary, risk: s.risk })) })}`;
    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "submit_votes",
            description: "Submit advisor votes",
            parameters: {
              type: "object",
              properties: {
                votes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      advisor_id: { type: "string", enum: [...ADVISORS] },
                      vote: { type: "string", enum: ["approve", "concern", "reject", "abstain"] },
                      score: { type: "number" },
                      rationale: { type: "string" },
                    },
                    required: ["advisor_id", "vote", "score", "rationale"],
                  },
                },
                dissent_summary: { type: "string" },
              },
              required: ["votes"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "submit_votes" } },
      }),
    });
    if (!resp.ok) {
      return new Response(JSON.stringify({ plan_id: plan.id, quorum_reached: false, consensus_score: 0, votes: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const args = JSON.parse(data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments ?? "{}");
    const votes = (args.votes ?? []) as Array<{ advisor_id: string; vote: string; score: number; rationale: string }>;
    const approvals = votes.filter((v) => v.vote === "approve").length;
    const consensus = votes.length ? votes.reduce((a, v) => a + (v.score || 0), 0) / votes.length : 0;
    return new Response(JSON.stringify({
      plan_id: plan.id,
      quorum_reached: approvals >= 4,
      consensus_score: consensus,
      votes,
      dissent_summary: args.dissent_summary,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[council-prevote]", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "unknown" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});