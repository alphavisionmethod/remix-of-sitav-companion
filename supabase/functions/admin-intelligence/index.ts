import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { handleCors, corsHeaders, corsResponse, corsError } from "../_shared/cors.ts";
import { EdgeLogger } from "../_shared/logger.ts";
import { checkRateLimit, rateLimitResponse } from "../_shared/rate-limit.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { requireAdmin } from "../_shared/auth.ts";

// ── Statistical Utilities ──
function computeStats(values: number[]) {
  if (!values.length) return { mean: 0, stddev: 0, min: 0, max: 0, count: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return {
    mean: Math.round(mean * 100) / 100,
    stddev: Math.round(Math.sqrt(variance) * 100) / 100,
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

function detectAnomalies(values: number[], threshold = 3): Array<{ index: number; value: number; sigma: number; severity: string }> {
  const stats = computeStats(values);
  if (stats.stddev === 0) return [];

  return values
    .map((v, i) => ({ index: i, value: v, sigma: Math.abs((v - stats.mean) / stats.stddev) }))
    .filter(a => a.sigma > threshold)
    .map(a => ({
      ...a,
      sigma: Math.round(a.sigma * 100) / 100,
      severity: a.sigma > 6 ? "critical" : a.sigma > 4 ? "warning" : "info",
    }))
    .sort((a, b) => b.sigma - a.sigma)
    .slice(0, 10);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Body pre-parse removed — individual route handlers validate their own input

  try {
    // ── Standardized admin auth ──
    const authResult = await requireAdmin(req);
    if (authResult instanceof Response) return authResult;
    const { user } = authResult;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const url = new URL(req.url);
    const path = url.pathname.split("/").filter(Boolean).pop() || "";
    const days = parseInt(url.searchParams.get("days") || "7");
    const since = new Date(Date.now() - days * 86400000).toISOString();

    let result: unknown;

    switch (path) {
      case "anomalies": {
        // Detect anomalies across multiple metrics
        const { data: responses } = await supabase
          .from("advisor_responses")
          .select("latency_ms, tokens_used, confidence, created_at")
          .eq("user_id", user.id)
          .gte("created_at", since)
          .order("created_at", { ascending: true })
          .limit(1000);

        const latencies = (responses || []).map((r: any) => r.latency_ms || 0).filter((l: number) => l > 0);
        const tokenCounts = (responses || []).map((r: any) => r.tokens_used || 0).filter((t: number) => t > 0);
        const confidences = (responses || []).map((r: any) => r.confidence || 0).filter((c: number) => c > 0);

        const latencyAnomalies = detectAnomalies(latencies);
        const tokenAnomalies = detectAnomalies(tokenCounts);
        const confidenceAnomalies = detectAnomalies(confidences, 2); // Lower threshold for confidence drops

        result = {
          metrics: {
            latency: { stats: computeStats(latencies), anomalies: latencyAnomalies },
            tokens: { stats: computeStats(tokenCounts), anomalies: tokenAnomalies },
            confidence: { stats: computeStats(confidences), anomalies: confidenceAnomalies },
          },
          total_anomalies: latencyAnomalies.length + tokenAnomalies.length + confidenceAnomalies.length,
          severity_summary: {
            critical: [...latencyAnomalies, ...tokenAnomalies, ...confidenceAnomalies].filter(a => a.severity === "critical").length,
            warning: [...latencyAnomalies, ...tokenAnomalies, ...confidenceAnomalies].filter(a => a.severity === "warning").length,
            info: [...latencyAnomalies, ...tokenAnomalies, ...confidenceAnomalies].filter(a => a.severity === "info").length,
          },
          period_days: days,
        };
        break;
      }

      case "forecast": {
        // Incident & performance forecasting
        const [incidentsRes, responsesRes, workflowsRes] = await Promise.all([
          supabase.from("admin_incidents").select("severity, status, created_at").eq("created_by", user.id).gte("created_at", since),
          supabase.from("advisor_responses").select("latency_ms, tokens_used, created_at").eq("user_id", user.id).gte("created_at", since).limit(500),
          supabase.from("workflow_runs").select("status, created_at").eq("user_id", user.id).gte("created_at", since).limit(500),
        ]);

        const incidents = incidentsRes.data || [];
        const responses = responsesRes.data || [];
        const workflows = workflowsRes.data || [];

        // Time-bucketed trend analysis
        const bucketMs = 24 * 3600000;
        const incidentBuckets: Record<string, number> = {};
        const errorBuckets: Record<string, number> = {};
        const latencyBuckets: Record<string, number[]> = {};

        for (const inc of incidents) {
          const bucket = Math.floor(new Date(inc.created_at).getTime() / bucketMs).toString();
          incidentBuckets[bucket] = (incidentBuckets[bucket] || 0) + 1;
        }

        for (const resp of responses) {
          const bucket = Math.floor(new Date(resp.created_at).getTime() / bucketMs).toString();
          if (!latencyBuckets[bucket]) latencyBuckets[bucket] = [];
          latencyBuckets[bucket].push(resp.latency_ms || 0);
        }

        for (const wf of workflows.filter((w: any) => w.status === "failed")) {
          const bucket = Math.floor(new Date(wf.created_at).getTime() / bucketMs).toString();
          errorBuckets[bucket] = (errorBuckets[bucket] || 0) + 1;
        }

        // Simple linear trend
        const bucketKeys = Object.keys(incidentBuckets).sort();
        const incidentTrend = bucketKeys.length >= 2
          ? (incidentBuckets[bucketKeys[bucketKeys.length - 1]] || 0) > (incidentBuckets[bucketKeys[0]] || 0) ? "increasing" : "decreasing"
          : "stable";

        const forecasts = [];
        if (incidentTrend === "increasing") {
          forecasts.push({
            id: "forecast-incidents",
            type: "incident-spike",
            title: "Incident frequency increasing",
            description: "More incidents in recent period than historical average",
            probability: 0.72,
            timeWindow: "48h",
            severity: "warning",
            preventiveMeasures: [
              "Review recent system changes and deployments",
              "Increase monitoring alert sensitivity",
              "Pre-scale infrastructure resources",
              "Prepare incident response team",
            ],
          });
        }

        const latencyValues = responses.map((r: any) => r.latency_ms || 0).filter((l: number) => l > 0);
        const avgLatency = latencyValues.length ? latencyValues.reduce((a: number, b: number) => a + b, 0) / latencyValues.length : 0;
        if (avgLatency > 1500) {
          forecasts.push({
            id: "forecast-latency",
            type: "latency-degradation",
            title: "Latency trending above threshold",
            description: `Average latency ${Math.round(avgLatency)}ms (threshold: 1500ms)`,
            probability: 0.65,
            timeWindow: "24h",
            severity: "warning",
            preventiveMeasures: [
              "Optimize database queries and indexes",
              "Check connection pool saturation",
              "Review cache hit rates",
              "Consider scaling out API instances",
            ],
          });
        }

        const failRate = workflows.length > 0
          ? workflows.filter((w: any) => w.status === "failed").length / workflows.length
          : 0;
        if (failRate > 0.1) {
          forecasts.push({
            id: "forecast-workflows",
            type: "workflow-failure",
            title: "Workflow failure rate elevated",
            description: `${(failRate * 100).toFixed(1)}% of workflows failing (threshold: 10%)`,
            probability: 0.58,
            timeWindow: "72h",
            severity: "info",
            preventiveMeasures: [
              "Audit failing workflow configurations",
              "Check external service dependencies",
              "Review error logs for common patterns",
            ],
          });
        }

        if (forecasts.length === 0) {
          forecasts.push({
            id: "forecast-clear",
            type: "all-clear",
            title: "No upcoming issues predicted",
            description: "System metrics are within normal ranges",
            probability: 0.92,
            timeWindow: `${days}d`,
            severity: "info",
            preventiveMeasures: [],
          });
        }

        result = {
          forecasts,
          trends: {
            incidents: incidentTrend,
            avg_latency_ms: Math.round(avgLatency),
            workflow_fail_rate: parseFloat((failRate * 100).toFixed(1)),
          },
          period_days: days,
        };
        break;
      }

      case "optimize": {
        // Cost and performance optimization suggestions
        const { data: responses } = await supabase
          .from("advisor_responses")
          .select("model_used, tokens_used, latency_ms, confidence, created_at")
          .eq("user_id", user.id)
          .gte("created_at", since)
          .limit(1000);

        const totalTokens = (responses || []).reduce((s: number, r: any) => s + (r.tokens_used || 0), 0);
        const byModel: Record<string, { tokens: number; count: number; avgLatency: number; avgConfidence: number }> = {};

        for (const r of responses || []) {
          const m = r.model_used || "unknown";
          if (!byModel[m]) byModel[m] = { tokens: 0, count: 0, avgLatency: 0, avgConfidence: 0 };
          byModel[m].tokens += r.tokens_used || 0;
          byModel[m].count++;
          byModel[m].avgLatency += r.latency_ms || 0;
          byModel[m].avgConfidence += r.confidence || 0;
        }

        // Compute averages
        for (const m of Object.keys(byModel)) {
          if (byModel[m].count > 0) {
            byModel[m].avgLatency = Math.round(byModel[m].avgLatency / byModel[m].count);
            byModel[m].avgConfidence = parseFloat((byModel[m].avgConfidence / byModel[m].count).toFixed(2));
          }
        }

        const suggestions = [];

        // Model routing optimization
        if (byModel["gpt-4o"] && byModel["gpt-4o"].count > 10) {
          const lowConfidenceGpt4 = (responses || [])
            .filter((r: any) => r.model_used === "gpt-4o" && r.confidence && r.confidence > 0.9)
            .length;
          if (lowConfidenceGpt4 > byModel["gpt-4o"].count * 0.3) {
            suggestions.push({
              id: "opt-model-routing",
              type: "model-routing",
              title: "Route high-confidence queries to lighter models",
              description: `${lowConfidenceGpt4} of ${byModel["gpt-4o"].count} GPT-4o queries had >90% confidence and could use GPT-4o-mini`,
              projectedSavings: `~$${(lowConfidenceGpt4 * 0.02).toFixed(2)}/period`,
              confidence: 0.82,
              effort: "low",
            });
          }
        }

        // Token waste detection
        if (totalTokens > 50000) {
          suggestions.push({
            id: "opt-token-efficiency",
            type: "token-efficiency",
            title: "Reduce prompt sizes for routine queries",
            description: `${totalTokens.toLocaleString()} tokens used — review system prompts for optimization`,
            projectedSavings: `~${Math.round(totalTokens * 0.15).toLocaleString()} tokens saved`,
            confidence: 0.7,
            effort: "medium",
          });
        }

        // Caching suggestion
        if ((responses || []).length > 100) {
          suggestions.push({
            id: "opt-caching",
            type: "response-caching",
            title: "Cache repeated query patterns",
            description: "High request volume detected — semantic caching could reduce costs",
            projectedSavings: "15-25% reduction in API calls",
            confidence: 0.75,
            effort: "medium",
          });
        }

        result = {
          suggestions,
          current_usage: {
            total_tokens: totalTokens,
            total_requests: (responses || []).length,
            by_model: byModel,
          },
          period_days: days,
        };
        break;
      }

      default:
        result = {
          endpoints: ["anomalies", "forecast", "optimize"],
          usage: "Intelligence service — anomaly detection, forecasting, and optimization suggestions",
        };
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Admin Intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
