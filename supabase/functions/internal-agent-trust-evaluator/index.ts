// ═══════════════════════════════════════════════════════════════
// SITA OS — Internal Agent Trust Evaluator (Phase 5)
// Recomputes ladder rungs from reflection trends and publishes
// cross-agent learnings to the knowledge bus.
// ═══════════════════════════════════════════════════════════════
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReflectionRow {
  agent_id: string;
  outcome_quality: number | null;
  gate_fitness: number | null;
  pattern_tags: string[] | null;
  should_repeat: boolean | null;
  lesson_learned: string | null;
  created_at: string;
}

interface AgentAggregate {
  agent_id: string;
  count: number;
  avgOutcome: number;
  avgGateFitness: number;
  patternFreq: Record<string, number>;
  shouldRepeatRatio: number;
  lastLesson: string | null;
}

function aggregate(rows: ReflectionRow[]): Map<string, AgentAggregate> {
  const out = new Map<string, AgentAggregate>();
  for (const r of rows) {
    if (!out.has(r.agent_id)) {
      out.set(r.agent_id, {
        agent_id: r.agent_id,
        count: 0,
        avgOutcome: 0,
        avgGateFitness: 0,
        patternFreq: {},
        shouldRepeatRatio: 0,
        lastLesson: null,
      });
    }
    const a = out.get(r.agent_id)!;
    a.count += 1;
    a.avgOutcome += r.outcome_quality ?? 0.5;
    a.avgGateFitness += r.gate_fitness ?? 0.5;
    a.shouldRepeatRatio += r.should_repeat ? 1 : 0;
    if (!a.lastLesson && r.lesson_learned) a.lastLesson = r.lesson_learned;
    for (const t of r.pattern_tags ?? []) {
      a.patternFreq[t] = (a.patternFreq[t] ?? 0) + 1;
    }
  }
  for (const a of out.values()) {
    a.avgOutcome /= a.count;
    a.avgGateFitness /= a.count;
    a.shouldRepeatRatio /= a.count;
  }
  return out;
}

function computeTrustScore(a: AgentAggregate): number {
  // Conservative blend: outcome quality dominates, gate fitness modulates,
  // repeat ratio rewards reproducible wins.
  const score =
    a.avgOutcome * 0.5 +
    a.avgGateFitness * 0.3 +
    a.shouldRepeatRatio * 0.2;
  return Math.max(0, Math.min(1, Number(score.toFixed(4))));
}

function topPattern(a: AgentAggregate): { tag: string; count: number } | null {
  const entries = Object.entries(a.patternFreq);
  if (entries.length === 0) return null;
  entries.sort((x, y) => y[1] - x[1]);
  return { tag: entries[0][0], count: entries[0][1] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Auth: admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Pull recent reflections (last 30 days)
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: reflections, error: rErr } = await supabase
      .from("internal_agent_reflections")
      .select("agent_id, outcome_quality, gate_fitness, pattern_tags, should_repeat, lesson_learned, created_at")
      .gte("created_at", since)
      .limit(2000);

    if (rErr) throw rErr;

    const agg = aggregate((reflections ?? []) as ReflectionRow[]);

    const ladderResults: unknown[] = [];
    const learningsPublished: unknown[] = [];

    for (const a of agg.values()) {
      const trust = computeTrustScore(a);
      const { data: ladder, error: lErr } = await supabase.rpc(
        "evaluate_internal_agent_ladder",
        {
          _agent_id: a.agent_id,
          _trust_score: trust,
          _reflection_count: a.count,
          _hint_reason: `auto-eval window=30d outcome=${a.avgOutcome.toFixed(2)} gate=${a.avgGateFitness.toFixed(2)}`,
        },
      );
      if (lErr) throw lErr;
      ladderResults.push(ladder);

      // Publish a learning if pattern is meaningful (>=3 occurrences)
      const top = topPattern(a);
      if (top && top.count >= 3 && a.lastLesson) {
        const { data: learningId, error: pErr } = await supabase.rpc(
          "publish_agent_learning",
          {
            _source_agent_id: a.agent_id,
            _pattern_tag: top.tag,
            _learning_summary: a.lastLesson,
            _recommended_guard: top.tag.startsWith("autonomy_block")
              ? "request human approval before retry"
              : top.tag.startsWith("rate_limit")
                ? "back off + spread over rolling window"
                : null,
            _confidence: Math.min(0.95, 0.5 + top.count * 0.05),
            _applies_to_councils: [],
            _applies_to_agents: [],
          },
        );
        if (pErr) throw pErr;
        learningsPublished.push({ agent_id: a.agent_id, pattern: top.tag, learning_id: learningId });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        evaluated_agents: agg.size,
        ladder_results: ladderResults,
        learnings_published: learningsPublished,
        window_days: 30,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("trust-evaluator error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
