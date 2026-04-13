// ═══════════════════════════════════════════════════════════════
// SITA OS — Market Intelligence Engine
// Real-time data grounding via Lovable AI
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";
import type { SimulationVariable } from "./monte-carlo-engine";

export interface MarketDataPoint {
  variable: string;
  currentValue: number;
  source: string;
  fetchedAt: string;
  confidence: "high" | "medium" | "low";
}

export interface IntelligenceReport {
  dataPoints: MarketDataPoint[];
  sentiment: "bullish" | "bearish" | "neutral" | "mixed";
  sentimentScore: number; // -1 to 1
  headlines: string[];
  fetchedAt: string;
  isGrounded: boolean;
}

export function createEmptyIntelligence(): IntelligenceReport {
  return {
    dataPoints: [],
    sentiment: "neutral",
    sentimentScore: 0,
    headlines: [],
    fetchedAt: new Date().toISOString(),
    isGrounded: false,
  };
}

/** Fetch market intelligence for a set of variables using Lovable AI */
export async function fetchMarketIntelligence(
  variables: SimulationVariable[],
  scenarioLabel: string,
): Promise<IntelligenceReport> {
  const varDescriptions = variables
    .map(v => `${v.label} (current assumption: ${v.mean}, range: ${v.min}–${v.max})`)
    .join("\n");

  const prompt = `You are a financial data analyst. For the scenario "${scenarioLabel}", provide current real-world data for these variables:

${varDescriptions}

Respond ONLY with valid JSON in this exact format:
{
  "dataPoints": [
    { "variable": "variable label", "currentValue": 123, "source": "source name", "confidence": "high" }
  ],
  "sentiment": "bullish",
  "sentimentScore": 0.3,
  "headlines": ["headline 1", "headline 2", "headline 3"]
}

Use real current market data where possible. For subjective variables, use industry averages. Confidence is "high" for verifiable data, "medium" for estimates, "low" for guesses.`;

  try {
    const { data, error } = await supabase.functions.invoke("chat-advisor", {
      body: {
        messages: [{ role: "user", content: prompt }],
        advisorId: "sita-core",
        domain: "finance",
      },
    });

    if (error) throw error;

    const content = data?.response || data?.message || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return createEmptyIntelligence();

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      dataPoints: (parsed.dataPoints || []).map((dp: any) => ({
        variable: dp.variable || "",
        currentValue: Number(dp.currentValue) || 0,
        source: dp.source || "AI estimate",
        fetchedAt: new Date().toISOString(),
        confidence: dp.confidence || "low",
      })),
      sentiment: parsed.sentiment || "neutral",
      sentimentScore: Number(parsed.sentimentScore) || 0,
      headlines: parsed.headlines || [],
      fetchedAt: new Date().toISOString(),
      isGrounded: true,
    };
  } catch (err) {
    console.error("Market intelligence fetch failed:", err);
    return createEmptyIntelligence();
  }
}

/** Apply intelligence data points to variables, returning updated variables */
export function applyIntelligenceToVariables(
  variables: SimulationVariable[],
  intelligence: IntelligenceReport,
): { variables: SimulationVariable[]; groundedIds: Set<string> } {
  const groundedIds = new Set<string>();
  const updated = variables.map(v => {
    const match = intelligence.dataPoints.find(
      dp => dp.variable.toLowerCase() === v.label.toLowerCase()
    );
    if (match && match.currentValue >= v.min && match.currentValue <= v.max) {
      groundedIds.add(v.id);
      return { ...v, mean: match.currentValue };
    }
    return v;
  });
  return { variables: updated, groundedIds };
}

/** Generate AI decision brief from simulation results */
export async function generateDecisionBrief(
  scenarioLabel: string,
  results: {
    mean: number;
    stdDev: number;
    percentiles: Record<string, number>;
    total: number;
    sensitivity: { variable: string; impact: number }[];
    var95?: number;
    cvar95?: number;
  },
): Promise<string> {
  const prompt = `You are a senior financial advisor. Analyze these Monte Carlo simulation results and provide a concise decision brief.

Scenario: "${scenarioLabel}"
Iterations: ${results.total.toLocaleString()}
Expected Outcome: $${results.mean.toFixed(0)}
Std Deviation: $${results.stdDev.toFixed(0)}
P10 (worst likely): $${results.percentiles.P10?.toFixed(0) ?? "N/A"}
P50 (median): $${results.percentiles.P50?.toFixed(0) ?? "N/A"}
P90 (best likely): $${results.percentiles.P90?.toFixed(0) ?? "N/A"}
${results.var95 ? `Value at Risk (95%): $${results.var95.toFixed(0)}` : ""}
${results.cvar95 ? `Expected Shortfall (95%): $${results.cvar95.toFixed(0)}` : ""}

Key Drivers (by sensitivity):
${results.sensitivity.slice(0, 3).map(s => `- ${s.variable}: $${s.impact.toFixed(0)} impact`).join("\n")}

Provide:
1. A one-sentence verdict (GO / CAUTION / NO-GO)
2. Two key insights
3. One risk to watch
4. One actionable recommendation

Keep it under 150 words. Be direct and decisive.`;

  try {
    const { data, error } = await supabase.functions.invoke("chat-advisor", {
      body: {
        messages: [{ role: "user", content: prompt }],
        advisorId: "sita-core",
        domain: "finance",
      },
    });
    if (error) throw error;
    return data?.response || data?.message || "Analysis unavailable.";
  } catch {
    return "Decision brief generation failed. Review the quantitative results directly.";
  }
}

/** Devil's advocate analysis */
export async function generateDevilsAdvocate(
  scenarioLabel: string,
  originalBrief: string,
): Promise<string> {
  const prompt = `You are a skeptical risk analyst who challenges assumptions. The scenario is "${scenarioLabel}".

The initial analysis concluded:
${originalBrief}

Play devil's advocate:
1. What critical assumption is most likely wrong?
2. What tail risk is being ignored?
3. What would make you reverse this recommendation?

Be provocative but substantive. Under 100 words.`;

  try {
    const { data, error } = await supabase.functions.invoke("chat-advisor", {
      body: {
        messages: [{ role: "user", content: prompt }],
        advisorId: "sita-core",
        domain: "finance",
      },
    });
    if (error) throw error;
    return data?.response || data?.message || "Challenge unavailable.";
  } catch {
    return "Devil's advocate analysis failed.";
  }
}
