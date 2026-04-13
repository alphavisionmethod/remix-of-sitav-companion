// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence API Edge Function
// Unified REST API for all 10 intelligence contract families
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders, corsResponse, corsError, handleCors } from "../_shared/cors.ts";
import { z } from "https://esm.sh/zod@3.23.8";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

function getServiceClient() {
  return createClient(SUPABASE_URL, SERVICE_KEY);
}

async function requireAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const client = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await client.auth.getClaims(token);
  if (error || !data?.claims) return null;
  return { id: data.claims.sub as string, email: data.claims.email as string };
}

// ── AI helper — calls Lovable AI Gateway ────────────────────
async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!LOVABLE_API_KEY) {
    console.warn("[intelligence-api] LOVABLE_API_KEY not set, returning fallback");
    return "";
  }
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("[intelligence-api] AI gateway error:", resp.status, t);
    return "";
  }
  const json = await resp.json();
  return json.choices?.[0]?.message?.content ?? "";
}

// ── Route parser ────────────────────────────────────────────
function parsePath(url: string): { segments: string[]; params: URLSearchParams } {
  const u = new URL(url);
  const raw = u.pathname.replace(/^\/intelligence-api\/?/, "").replace(/\/$/, "");
  const segments = raw ? raw.split("/") : [];
  return { segments, params: u.searchParams };
}

// ── Main handler ────────────────────────────────────────────
Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  const user = await requireAuth(req);
  if (!user) return corsError("Unauthorized", 401);

  const db = getServiceClient();
  const { segments, params } = parsePath(req.url);
  const method = req.method;
  const route = segments.join("/");

  try {
    // ════════════════════════════════════════════════════════
    // A. INTELLIGENCE ASSET LIBRARY
    // ════════════════════════════════════════════════════════

    // GET /assets
    if (route === "assets" && method === "GET") {
      const domain = params.get("domain");
      const assetType = params.get("assetType");
      const minConfidence = params.get("minConfidence");
      const page = parseInt(params.get("page") || "1");
      const limit = Math.min(parseInt(params.get("limit") || "20"), 100);
      const offset = (page - 1) * limit;

      let query = db.from("intelligence_assets_library")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("reuse_count", { ascending: false })
        .range(offset, offset + limit - 1);

      if (domain) query = query.eq("domain", domain);
      if (assetType) query = query.eq("asset_type", assetType);
      if (minConfidence) query = query.gte("confidence", parseFloat(minConfidence));

      const { data, count, error } = await query;
      if (error) return corsError(error.message, 500);

      return corsResponse({
        items: (data || []).map(mapAssetRow),
        page,
        limit,
        total: count || 0,
      });
    }

    // GET /assets/:id
    if (segments[0] === "assets" && segments.length === 2 && method === "GET") {
      const assetId = segments[1];
      const { data, error } = await db.from("intelligence_assets_library")
        .select("*")
        .eq("id", assetId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) return corsError("Asset not found", 404);
      return corsResponse(mapAssetDetail(data));
    }

    // POST /assets
    if (route === "assets" && method === "POST") {
      const body = await req.json();
      const schema = z.object({
        assetType: z.string().max(50),
        domain: z.string().max(50),
        title: z.string().max(255),
        summary: z.string().max(2000).optional(),
        structuredPayload: z.record(z.unknown()).optional(),
        evidenceRefs: z.array(z.string()).optional(),
        sourceActionRefs: z.array(z.string()).optional(),
        verificationState: z.string().max(20).optional(),
        reuseEligibility: z.string().max(20).optional(),
        invalidationTriggers: z.array(z.string()).optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return corsError("Validation failed", 400);

      const d = parsed.data;
      const { data, error } = await db.from("intelligence_assets_library")
        .insert({
          user_id: user.id,
          asset_type: d.assetType,
          domain: d.domain,
          title: d.title,
          content: { summary: d.summary, payload: d.structuredPayload, evidenceRefs: d.evidenceRefs, sourceActionRefs: d.sourceActionRefs, invalidationTriggers: d.invalidationTriggers },
          confidence: 50,
          evidence_grade: d.verificationState || "draft",
          reuse_count: 0,
          adapted_reuse_count: 0,
          cost_avoided_cents: 0,
          freshness_score: 100,
          decay_rate: 0.01,
          invalidated: false,
          tags: [],
        })
        .select("id")
        .single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ intelligenceAssetId: data.id, status: "created" }, 201);
    }

    // POST /assets/:id/reuse-evaluate
    if (segments[0] === "assets" && segments[2] === "reuse-evaluate" && method === "POST") {
      const assetId = segments[1];
      const body = await req.json();
      const { data: asset } = await db.from("intelligence_assets_library")
        .select("*")
        .eq("id", assetId)
        .eq("user_id", user.id)
        .single();

      if (!asset) return corsError("Asset not found", 404);

      const taskContext = body.taskDescription || "General reuse evaluation";
      const taskDomain = body.taskDomain || asset.domain || "general";
      const stakes = body.stakes || "medium";

      // If no AI key, fall back to deterministic logic
      if (!LOVABLE_API_KEY) {
        const freshnessScore = asset.freshness_score || 50;
        const confidence = asset.confidence || 50;
        const applicability = Math.min(100, (freshnessScore * 0.4 + confidence * 0.6));
        const invalidated = asset.invalidated;
        const decision = invalidated ? "skip" :
          applicability > 80 ? "direct_reuse" :
          applicability > 60 ? "adapted_reuse" : "fresh_reasoning";
        return corsResponse({
          decision,
          reuseConfidence: applicability / 100,
          applicabilityScore: applicability / 100,
          expectedCostAvoided: decision === "direct_reuse" ? 4.12 : decision === "adapted_reuse" ? 2.50 : 0,
          expectedQualityImpact: decision === "direct_reuse" ? "positive" : decision === "adapted_reuse" ? "neutral" : "unknown",
          reasoning: "Deterministic fallback — no AI key available",
          aiPowered: false,
        });
      }

      // Build AI prompt with asset context
      const assetSummary = typeof asset.content === "object" && asset.content !== null
        ? JSON.stringify(asset.content).slice(0, 1500)
        : String(asset.content || "").slice(0, 1500);

      const aiPrompt = `You are an intelligence reuse analyst for a decision-support system.

Evaluate whether this prior intelligence asset should be reused for the current task.

PRIOR ASSET:
- Domain: ${asset.domain || "unknown"}
- Type: ${asset.asset_type || "unknown"}
- Confidence: ${asset.confidence ?? "unknown"}%
- Freshness: ${asset.freshness_score ?? "unknown"}%
- Invalidated: ${asset.invalidated ? "YES" : "no"}
- Created: ${asset.created_at}
- Content preview: ${assetSummary}

CURRENT TASK:
- Description: ${taskContext}
- Domain: ${taskDomain}
- Stakes: ${stakes}

Respond with your analysis.`;

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: "You are an intelligence reuse analyst. Always respond via the tool call." },
            { role: "user", content: aiPrompt },
          ],
          tools: [{
            type: "function",
            function: {
              name: "reuse_decision",
              description: "Return the reuse evaluation decision",
              parameters: {
                type: "object",
                properties: {
                  decision: { type: "string", enum: ["direct_reuse", "adapted_reuse", "reference_only", "fresh_reasoning", "skip"] },
                  reuseConfidence: { type: "number", description: "0-1 confidence that reuse is appropriate" },
                  applicabilityScore: { type: "number", description: "0-1 how applicable the asset is to the current task" },
                  expectedCostAvoided: { type: "number", description: "Estimated cost savings in cents" },
                  expectedQualityImpact: { type: "string", enum: ["positive", "neutral", "negative", "unknown"] },
                  adaptationsNeeded: { type: "array", items: { type: "string" }, description: "List of adaptations if adapted_reuse" },
                  qualityRisk: { type: "string", enum: ["none", "low", "medium", "high"] },
                  reasoning: { type: "string", description: "1-3 sentence explanation of the decision" },
                },
                required: ["decision", "reuseConfidence", "applicabilityScore", "expectedQualityImpact", "reasoning"],
                additionalProperties: false,
              },
            },
          }],
          tool_choice: { type: "function", function: { name: "reuse_decision" } },
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        await aiResponse.text();
        if (status === 429) return corsError("AI rate limited — try again shortly", 429);
        if (status === 402) return corsError("AI credits exhausted", 402);
        // Fallback to deterministic
        const freshnessScore = asset.freshness_score || 50;
        const confidence = asset.confidence || 50;
        const applicability = Math.min(100, (freshnessScore * 0.4 + confidence * 0.6));
        const invalidated = asset.invalidated;
        const decision = invalidated ? "skip" :
          applicability > 80 ? "direct_reuse" :
          applicability > 60 ? "adapted_reuse" : "fresh_reasoning";
        return corsResponse({
          decision,
          reuseConfidence: applicability / 100,
          applicabilityScore: applicability / 100,
          expectedCostAvoided: decision === "direct_reuse" ? 4.12 : decision === "adapted_reuse" ? 2.50 : 0,
          expectedQualityImpact: decision === "direct_reuse" ? "positive" : "unknown",
          reasoning: "Deterministic fallback — AI unavailable",
          aiPowered: false,
        });
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall?.function?.arguments) {
        return corsError("AI returned unexpected format", 500);
      }

      const result = JSON.parse(toolCall.function.arguments);
      return corsResponse({
        ...result,
        expectedCostAvoided: result.expectedCostAvoided ?? 0,
        adaptationsNeeded: result.adaptationsNeeded ?? [],
        qualityRisk: result.qualityRisk ?? "low",
        aiPowered: true,
      });
    }

    // ════════════════════════════════════════════════════════
    // B. DIFFERENTIAL REASONING
    // ════════════════════════════════════════════════════════

    // POST /differential-reasoning/evaluate
    if (route === "differential-reasoning/evaluate" && method === "POST") {
      const body = await req.json();
      const schema = z.object({
        domain: z.string().max(50),
        ownerType: z.string().max(50).optional(),
        ownerId: z.string().max(255).optional(),
        previousStateRef: z.string().max(255),
        currentStateRef: z.string().max(255),
        candidateAssetIds: z.array(z.string()).optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return corsError("Validation failed", 400);
      const d = parsed.data;

      // Fetch candidate assets if provided
      let invalidatedAssets: string[] = [];
      let preservedAssets: string[] = [];
      if (d.candidateAssetIds?.length) {
        const { data: assets } = await db.from("intelligence_assets_library")
          .select("id, invalidated, freshness_score")
          .eq("user_id", user.id)
          .in("id", d.candidateAssetIds);

        for (const a of assets || []) {
          if (a.invalidated || (a.freshness_score && a.freshness_score < 30)) {
            invalidatedAssets.push(a.id);
          } else {
            preservedAssets.push(a.id);
          }
        }
      }

      // Use AI to assess materiality of state changes
      let materialityScore = 0.5;
      const aiResult = await callAI(
        "You are an intelligence analyst. Given a state change between two references, assess how material the change is on a 0-1 scale. Respond with ONLY a JSON object: {\"materiality\": <number>}",
        `Previous state ref: ${d.previousStateRef}\nCurrent state ref: ${d.currentStateRef}\nDomain: ${d.domain}`
      );
      try {
        const parsed = JSON.parse(aiResult);
        if (typeof parsed.materiality === "number") materialityScore = Math.max(0, Math.min(1, parsed.materiality));
      } catch { /* keep default */ }
      const mode = materialityScore > 0.85 ? "full" : materialityScore > 0.5 ? "partial" : "reuse_only";

      // Log the event
      await db.from("engine_events").insert({
        user_id: user.id,
        engine_name: "differential-reasoning",
        event_type: "evaluate",
        event_data: {
          domain: d.domain,
          previous_state_ref: d.previousStateRef,
          current_state_ref: d.currentStateRef,
          materiality_score: materialityScore,
          invalidated_assets: invalidatedAssets,
          preserved_assets: preservedAssets,
          recommended_mode: mode,
        },
      });

      return corsResponse({
        differentialReasoningId: crypto.randomUUID(),
        detectedChanges: [
          { field: "state_delta", previous: d.previousStateRef, current: d.currentStateRef, materiality: materialityScore },
        ],
        materialityScore,
        invalidatedAssets,
        preservedAssets,
        recommendedReasoningMode: mode,
        reasoningSavingsEstimate: {
          costSaved: mode === "reuse_only" ? 4.50 : mode === "partial" ? 2.89 : 0,
          latencySavedMs: mode === "reuse_only" ? 2800 : mode === "partial" ? 1400 : 0,
        },
      });
    }

    // GET /differential-reasoning/:id
    if (segments[0] === "differential-reasoning" && segments.length === 2 && method === "GET") {
      const { data } = await db.from("engine_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("engine_name", "differential-reasoning")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!data) return corsError("No differential reasoning result found", 404);
      return corsResponse(data.event_data);
    }

    // ════════════════════════════════════════════════════════
    // C. INTELLIGENCE PACKETS
    // ════════════════════════════════════════════════════════

    // POST /packets/compile
    if (route === "packets/compile" && method === "POST") {
      const body = await req.json();
      const schema = z.object({
        packetType: z.string().max(50),
        tenantId: z.string().max(255).optional(),
        scopeType: z.string().max(50).optional(),
        scopeId: z.string().max(255).optional(),
        sourceRefs: z.array(z.string()).optional(),
        compressionMode: z.enum(["minimal", "balanced", "full"]).optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return corsError("Validation failed", 400);
      const d = parsed.data;

      // Gather assets for this domain
      const { data: assets } = await db.from("intelligence_assets_library")
        .select("title, confidence, freshness_score, invalidated")
        .eq("user_id", user.id)
        .eq("domain", d.packetType)
        .eq("invalidated", false)
        .order("reuse_count", { ascending: false })
        .limit(20);

      const activeAssets = assets || [];
      const avgConfidence = activeAssets.length > 0
        ? activeAssets.reduce((s, a) => s + (a.confidence || 0), 0) / activeAssets.length
        : 0;

      const packetId = crypto.randomUUID();
      await db.from("engine_events").insert({
        user_id: user.id,
        engine_name: "intelligence-packets",
        event_type: "compile",
        event_data: {
          packet_id: packetId,
          packet_type: d.packetType,
          asset_count: activeAssets.length,
          avg_confidence: avgConfidence,
          compression_mode: d.compressionMode || "balanced",
        },
      });

      return corsResponse({
        intelligencePacketId: packetId,
        packetType: d.packetType,
        summarizedState: {
          activeAssets: activeAssets.length,
          avgConfidence: Math.round(avgConfidence),
          freshAssets: activeAssets.filter(a => (a.freshness_score || 0) > 70).length,
        },
        recentChanges: activeAssets.slice(0, 3).map(a => a.title),
        activeRisks: activeAssets.filter(a => (a.confidence || 0) < 50).map(a => `Low confidence: ${a.title}`),
        confidenceProfile: { overall: avgConfidence / 100 },
        compressionRatio: d.compressionMode === "minimal" ? 0.05 : d.compressionMode === "full" ? 0.3 : 0.12,
        compileCostEstimate: 0.08,
      });
    }

    // GET /packets/:id
    if (segments[0] === "packets" && segments.length === 2 && method === "GET") {
      const packetId = segments[1];
      const { data } = await db.from("engine_events")
        .select("event_data")
        .eq("user_id", user.id)
        .eq("engine_name", "intelligence-packets")
        .eq("event_type", "compile")
        .order("created_at", { ascending: false })
        .limit(10);

      const match = (data || []).find((d: { event_data: Record<string, unknown> }) =>
        (d.event_data as Record<string, unknown>)?.packet_id === packetId
      );
      if (!match) return corsError("Packet not found", 404);
      return corsResponse(match.event_data);
    }

    // ════════════════════════════════════════════════════════
    // D. EFFICIENCY SCORES
    // ════════════════════════════════════════════════════════

    // GET /efficiency/scores
    if (route === "efficiency/scores" && method === "GET") {
      const scopeType = params.get("scopeType");
      const domain = params.get("domain");
      const page = parseInt(params.get("page") || "1");
      const limit = Math.min(parseInt(params.get("limit") || "20"), 100);

      let query = db.from("ai_efficiency_scores")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)
        .order("measured_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (scopeType) query = query.eq("scope_type", scopeType);

      const { data, count, error } = await query;
      if (error) return corsError(error.message, 500);

      return corsResponse({
        items: (data || []).map((s: Record<string, unknown>) => ({
          scopeType: s.scope_type,
          scopeId: s.scope_id,
          qualityScore: s.quality_score,
          costEfficiencyScore: s.cost_efficiency_score,
          acceptanceRate: s.acceptance_rate,
          overrideRate: s.override_rate,
          falsePositiveRate: s.false_positive_rate,
          verificationSuccessRate: s.verification_success_rate,
          reuseRate: s.reuse_rate,
          downstreamValueScore: s.downstream_value_score,
          compositeEfficiencyScore: s.composite_efficiency_score,
          measuredAt: s.measured_at,
        })),
        page,
        limit,
        total: count || 0,
      });
    }

    // GET /efficiency/scores/:id/history
    if (segments[0] === "efficiency" && segments[1] === "scores" && segments[3] === "history" && method === "GET") {
      const scopeId = segments[2];
      const { data, error } = await db.from("ai_efficiency_scores")
        .select("composite_efficiency_score, quality_score, cost_efficiency_score, measured_at")
        .eq("user_id", user.id)
        .eq("scope_id", scopeId)
        .order("measured_at", { ascending: true })
        .limit(90);

      if (error) return corsError(error.message, 500);
      return corsResponse({ scopeId, history: data || [] });
    }

    // ════════════════════════════════════════════════════════
    // E. OUTCOME ECONOMICS
    // ════════════════════════════════════════════════════════

    // GET /outcomes/economics
    if (route === "outcomes/economics" && method === "GET") {
      const domain = params.get("domain");
      const from = params.get("from");
      const to = params.get("to");

      let query = db.from("engine_events")
        .select("event_data, created_at")
        .eq("user_id", user.id)
        .eq("engine_name", "outcome-economics")
        .order("created_at", { ascending: false })
        .limit(100);

      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) return corsError(error.message, 500);

      const items = (data || []).map((e: { event_data: Record<string, unknown> }) => e.event_data);
      const totalCost = items.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.ai_cost_cents) || 0), 0) / 100;
      const totalValue = items.reduce((s: number, i: Record<string, unknown>) => s + (Number(i.estimated_value_cents) || 0), 0) / 100;

      return corsResponse({
        summary: {
          totalAiCostEstimate: totalCost,
          totalEstimatedValue: totalValue,
          weightedPaybackRatio: totalCost > 0 ? totalValue / totalCost : 0,
        },
        items: items.slice(0, 50),
      });
    }

    // GET /outcomes/high-value-categories
    if (route === "outcomes/high-value-categories" && method === "GET") {
      const { data } = await db.from("engine_events")
        .select("event_data")
        .eq("user_id", user.id)
        .eq("engine_name", "outcome-economics")
        .order("created_at", { ascending: false })
        .limit(200);

      const categoryMap: Record<string, { count: number; totalValue: number; totalCost: number }> = {};
      for (const e of data || []) {
        const d = e.event_data as Record<string, unknown>;
        const cat = (d.outcome_category as string) || "other";
        if (!categoryMap[cat]) categoryMap[cat] = { count: 0, totalValue: 0, totalCost: 0 };
        categoryMap[cat].count++;
        categoryMap[cat].totalValue += Number(d.estimated_value_cents) || 0;
        categoryMap[cat].totalCost += Number(d.ai_cost_cents) || 0;
      }

      const categories = Object.entries(categoryMap)
        .map(([category, stats]) => ({
          category,
          ...stats,
          paybackRatio: stats.totalCost > 0 ? stats.totalValue / stats.totalCost : 0,
        }))
        .sort((a, b) => b.paybackRatio - a.paybackRatio);

      return corsResponse({ categories });
    }

    // ════════════════════════════════════════════════════════
    // F. ESCALATIONS
    // ════════════════════════════════════════════════════════

    // POST /escalations
    if (route === "escalations" && method === "POST") {
      const body = await req.json();
      const schema = z.object({
        taskId: z.string().max(255),
        domain: z.string().max(50),
        previousReasoningLevel: z.string().max(20),
        newReasoningLevel: z.string().max(20),
        triggerType: z.string().max(50),
        justification: z.string().max(1000).optional(),
        estimatedIncrementalCost: z.number().optional(),
        expectedValue: z.number().optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return corsError("Validation failed", 400);
      const d = parsed.data;

      const escalationId = crypto.randomUUID();
      const approvalRequired = d.newReasoningLevel === "deep" && (d.estimatedIncrementalCost || 0) > 5;

      await db.from("engine_events").insert({
        user_id: user.id,
        engine_name: "escalation-engine",
        event_type: "escalation",
        event_data: {
          escalation_id: escalationId,
          task_id: d.taskId,
          domain: d.domain,
          from_level: d.previousReasoningLevel,
          to_level: d.newReasoningLevel,
          trigger_type: d.triggerType,
          justification: d.justification,
          estimated_cost: d.estimatedIncrementalCost,
          expected_value: d.expectedValue,
          approval_required: approvalRequired,
        },
      });

      return corsResponse({ escalationId, status: "created", approvalRequired }, 201);
    }

    // ════════════════════════════════════════════════════════
    // G. DIGESTS
    // ════════════════════════════════════════════════════════

    // GET /digests
    if (route === "digests" && method === "GET") {
      const { data } = await db.from("engine_events")
        .select("event_data, created_at")
        .eq("user_id", user.id)
        .eq("engine_name", "intelligence-digest")
        .order("created_at", { ascending: false })
        .limit(20);

      return corsResponse({ items: (data || []).map((d: { event_data: Record<string, unknown>; created_at: string }) => ({ ...d.event_data, createdAt: d.created_at })) });
    }

    // POST /digests/generate
    if (route === "digests/generate" && method === "POST") {
      const body = await req.json();

      // Gather intelligence overview data
      const [assetRes, effRes, ecoRes] = await Promise.all([
        db.from("intelligence_assets_library").select("domain, reuse_count, cost_avoided_cents, freshness_score, invalidated").eq("user_id", user.id),
        db.from("ai_efficiency_scores").select("composite_efficiency_score, measured_at").eq("user_id", user.id).order("measured_at", { ascending: false }).limit(10),
        db.from("engine_events").select("event_data").eq("user_id", user.id).eq("engine_name", "outcome-economics").order("created_at", { ascending: false }).limit(50),
      ]);

      const assets = assetRes.data || [];
      const totalReuses = assets.reduce((s, a) => s + (a.reuse_count || 0), 0);
      const totalAvoided = assets.reduce((s, a) => s + (a.cost_avoided_cents || 0), 0);
      const avgFreshness = assets.length > 0 ? assets.reduce((s, a) => s + (a.freshness_score || 0), 0) / assets.length : 0;
      const staleCount = assets.filter(a => (a.freshness_score || 0) < 30).length;

      const digestId = crypto.randomUUID();
      const digest = {
        digestId,
        digestType: body.digestType || "boardroom_packet",
        generatedAt: new Date().toISOString(),
        summary: {
          totalAssets: assets.length,
          totalReuses,
          totalCostAvoided: totalAvoided / 100,
          avgFreshness: Math.round(avgFreshness),
          staleAssets: staleCount,
          avgEfficiency: (effRes.data || []).length > 0
            ? (effRes.data || []).reduce((s: number, e: Record<string, unknown>) => s + (Number(e.composite_efficiency_score) || 0), 0) / (effRes.data || []).length
            : 0,
        },
        recommendations: await (async () => {
          const fallback = [
            staleCount > 5 ? "Review and refresh stale intelligence assets" : null,
            avgFreshness < 50 ? "Overall freshness declining — schedule bulk review" : null,
            totalReuses < 10 ? "Low reuse rate — check asset discovery and matching" : null,
          ].filter(Boolean);

          const aiRecs = await callAI(
            "You are an intelligence operations advisor. Given metrics about an AI intelligence asset library, provide 2-3 concise actionable recommendations. Return ONLY a JSON array of strings.",
            `Total assets: ${assets.length}, Total reuses: ${totalReuses}, Cost avoided: $${(totalAvoided / 100).toFixed(2)}, Avg freshness: ${Math.round(avgFreshness)}%, Stale assets: ${staleCount}`
          );
          try {
            const parsed = JSON.parse(aiRecs);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          } catch { /* use fallback */ }
          return fallback;
        })(),
      };

      await db.from("engine_events").insert({
        user_id: user.id,
        engine_name: "intelligence-digest",
        event_type: "generate",
        event_data: digest,
      });

      return corsResponse(digest, 201);
    }

    // ════════════════════════════════════════════════════════
    // H. PATTERNS
    // ════════════════════════════════════════════════════════

    // GET /patterns
    if (route === "patterns" && method === "GET") {
      const { data } = await db.from("ai_learning_patterns")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(parseInt(params.get("limit") || "50"));

      return corsResponse({ items: data || [] });
    }

    // POST /patterns/extract
    if (route === "patterns/extract" && method === "POST") {
      const body = await req.json();
      const schema = z.object({
        domain: z.string().max(50),
        signalType: z.string().max(50),
        description: z.string().max(2000),
        confidence: z.number().min(0).max(100).optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return corsError("Validation failed", 400);
      const d = parsed.data;

      const { data, error } = await db.from("ai_learning_patterns").insert({
        user_id: user.id,
        domain: d.domain,
        pattern_type: d.signalType,
        pattern_description: d.description,
        confidence: (d.confidence || 50) / 100,
        status: "detected",
      }).select("id").single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ patternId: data.id, status: "extracted" }, 201);
    }

    // POST /patterns/:id/generalize
    if (segments[0] === "patterns" && segments[2] === "generalize" && method === "POST") {
      const patternId = segments[1];
      const { error } = await db.from("ai_learning_patterns")
        .update({ status: "generalization_review" })
        .eq("id", patternId)
        .eq("user_id", user.id);

      if (error) return corsError(error.message, 500);
      return corsResponse({ patternId, status: "submitted_for_generalization" });
    }

    // ════════════════════════════════════════════════════════
    // I. PROMPT PROFILES
    // ════════════════════════════════════════════════════════

    // GET /prompt-profiles
    if (route === "prompt-profiles" && method === "GET") {
      const { data } = await db.from("ai_prompt_families")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(parseInt(params.get("limit") || "50"));

      return corsResponse({ items: data || [] });
    }

    // POST /prompt-profiles
    if (route === "prompt-profiles" && method === "POST") {
      const body = await req.json();
      const schema = z.object({
        name: z.string().max(100),
        domain: z.string().max(50).optional(),
        systemPrompt: z.string().max(8000).optional(),
        owner: z.string().max(100),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return corsError("Validation failed", 400);
      const d = parsed.data;

      const { data, error } = await db.from("ai_prompt_families").insert({
        user_id: user.id,
        name: d.name,
        domain: d.domain,
        system_prompt: d.systemPrompt,
        owner: d.owner,
        prompt_family_id: `pf_${Date.now()}`,
      }).select("id").single();

      if (error) return corsError(error.message, 500);
      return corsResponse({ promptProfileId: data.id, status: "created" }, 201);
    }

    // POST /prompt-profiles/:id/evaluate
    if (segments[0] === "prompt-profiles" && segments[2] === "evaluate" && method === "POST") {
      const profileId = segments[1];
      const { data: profile } = await db.from("ai_prompt_families")
        .select("*")
        .eq("id", profileId)
        .eq("user_id", user.id)
        .single();

      if (!profile) return corsError("Profile not found", 404);

      // Evaluate prompt efficiency against recent inference receipts
      const { data: receipts } = await db.from("ai_inference_receipts")
        .select("input_tokens, output_tokens, cost_actual_cents, cache_hits")
        .eq("user_id", user.id)
        .eq("prompt_family_id", profile.prompt_family_id)
        .order("created_at", { ascending: false })
        .limit(50);

      const r = receipts || [];
      const totalInputTokens = r.reduce((s, x) => s + (x.input_tokens || 0), 0);
      const totalOutputTokens = r.reduce((s, x) => s + (x.output_tokens || 0), 0);
      const totalCost = r.reduce((s, x) => s + (x.cost_actual_cents || 0), 0);
      const cacheHits = r.reduce((s, x) => s + (x.cache_hits || 0), 0);

      return corsResponse({
        profileId,
        sampleSize: r.length,
        redundancyScore: r.length > 0 ? cacheHits / Math.max(r.length, 1) : 0,
        avgCostCents: r.length > 0 ? totalCost / r.length : 0,
        avgInputTokens: r.length > 0 ? totalInputTokens / r.length : 0,
        avgOutputTokens: r.length > 0 ? totalOutputTokens / r.length : 0,
        cacheHitRate: r.length > 0 ? cacheHits / r.length : 0,
        qualityImpactEstimate: "neutral",
      });
    }

    // ════════════════════════════════════════════════════════
    // J. UNIFIED OVERVIEW
    // ════════════════════════════════════════════════════════

    // GET /overview
    if (route === "overview" && method === "GET") {
      const [assetRes, effRes, escalRes, patternRes, decayRes] = await Promise.all([
        db.from("intelligence_assets_library")
          .select("domain, reuse_count, cost_avoided_cents, freshness_score, invalidated, confidence")
          .eq("user_id", user.id),
        db.from("ai_efficiency_scores")
          .select("composite_efficiency_score, measured_at")
          .eq("user_id", user.id)
          .order("measured_at", { ascending: false })
          .limit(30),
        db.from("engine_events")
          .select("event_data")
          .eq("user_id", user.id)
          .eq("engine_name", "escalation-engine")
          .order("created_at", { ascending: false })
          .limit(10),
        db.from("ai_learning_patterns")
          .select("id, status")
          .eq("user_id", user.id),
        db.from("engine_events")
          .select("event_data")
          .eq("user_id", user.id)
          .eq("engine_name", "intelligence-decay")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const assets = assetRes.data || [];
      const totalAssets = assets.length;
      const totalReuses = assets.reduce((s, a) => s + (a.reuse_count || 0), 0);
      const totalCostAvoided = assets.reduce((s, a) => s + (a.cost_avoided_cents || 0), 0);
      const avgFreshness = totalAssets > 0 ? assets.reduce((s, a) => s + (a.freshness_score || 0), 0) / totalAssets : 0;
      const staleAssets = assets.filter(a => (a.freshness_score || 0) < 30).length;
      const invalidatedCount = assets.filter(a => a.invalidated).length;

      // Domain breakdown
      const domainMap: Record<string, { count: number; reuses: number; value: number }> = {};
      for (const a of assets) {
        const d = a.domain || "unknown";
        if (!domainMap[d]) domainMap[d] = { count: 0, reuses: 0, value: 0 };
        domainMap[d].count++;
        domainMap[d].reuses += a.reuse_count || 0;
        domainMap[d].value += a.cost_avoided_cents || 0;
      }

      const effScores = (effRes.data || []).map((e: Record<string, unknown>) => Number(e.composite_efficiency_score) || 0);
      const avgEfficiency = effScores.length > 0 ? effScores.reduce((a: number, b: number) => a + b, 0) / effScores.length : 0;

      const reuseRate = totalAssets > 0 ? assets.filter(a => (a.reuse_count || 0) > 0).length / totalAssets : 0;

      return corsResponse({
        assetSummary: { totalAssets, totalReuses, totalCostAvoided: totalCostAvoided / 100, avgFreshness: Math.round(avgFreshness), staleAssets, invalidatedCount },
        domainBreakdown: Object.entries(domainMap).map(([domain, stats]) => ({ domain, ...stats, valueUsd: stats.value / 100 })),
        efficiencyTrend: (effRes.data || []).map((e: Record<string, unknown>) => ({ score: e.composite_efficiency_score, measuredAt: e.measured_at })),
        avgEfficiency,
        reuseRate,
        recentEscalations: (escalRes.data || []).map((e: { event_data: Record<string, unknown> }) => e.event_data),
        patternSummary: { total: (patternRes.data || []).length, active: (patternRes.data || []).filter((p: { status: string }) => p.status === "active").length },
        decayAlerts: (decayRes.data || []).map((e: { event_data: Record<string, unknown> }) => e.event_data),
        topOptimizations: [
          staleAssets > 3 ? "Refresh stale intelligence assets to maintain reuse quality" : null,
          reuseRate < 0.3 ? "Improve asset discovery — reuse rate below 30%" : null,
          avgEfficiency < 0.6 ? "Overall efficiency score low — review cost allocation" : null,
          invalidatedCount > 5 ? "Multiple invalidated assets — review decay triggers" : null,
        ].filter(Boolean),
      });
    }

    return corsError(`Unknown route: ${method} /${route}`, 404);
  } catch (err) {
    console.error("[intelligence-api] Error:", err);
    return corsError(err instanceof Error ? err.message : "Internal error", 500);
  }
});

// ── Helpers ─────────────────────────────────────────────────
function mapAssetRow(a: Record<string, unknown>) {
  return {
    intelligenceAssetId: a.id,
    assetType: a.asset_type,
    domain: a.domain,
    title: a.title,
    confidenceScore: a.confidence,
    freshnessScore: a.freshness_score,
    verificationState: a.evidence_grade,
    reuseEligibility: (a.reuse_count as number) > 5 ? "high" : (a.reuse_count as number) > 0 ? "medium" : "low",
    lastUsedAt: a.updated_at,
    createdAt: a.created_at,
  };
}

function mapAssetDetail(a: Record<string, unknown>) {
  const content = (a.content || {}) as Record<string, unknown>;
  return {
    intelligenceAssetId: a.id,
    assetType: a.asset_type,
    domain: a.domain,
    title: a.title,
    summary: content.summary || "",
    structuredPayload: content.payload || {},
    evidenceRefs: content.evidenceRefs || [],
    sourceActionRefs: content.sourceActionRefs || [],
    confidenceScore: a.confidence,
    freshnessScore: a.freshness_score,
    verificationState: a.evidence_grade,
    reuseEligibility: (a.reuse_count as number) > 5 ? "high" : (a.reuse_count as number) > 0 ? "medium" : "low",
    invalidationTriggers: content.invalidationTriggers || [],
    usageStats: {
      timesUsed: a.reuse_count,
      adaptedUses: a.adapted_reuse_count,
      estimatedCostAvoided: (a.cost_avoided_cents as number || 0) / 100,
    },
  };
}
