// ═══════════════════════════════════════════════════════════════
// SITA OS — Intelligence API React Hooks
// Typed hooks that call the intelligence-api edge function
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// ── Generic caller ──────────────────────────────────────────

async function callIntelligenceAPI<T>(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<{ data: T | null; error: string | null }> {
  try {
    // Build the URL with path appended
    const functionName = "intelligence-api";
    const { data: { session } } = await supabase.auth.getSession();
    
    const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}/${path}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    const res = await fetch(baseUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error || `HTTP ${res.status}` };
    return { data: json as T, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Hook factory ────────────────────────────────────────────

function useIntelligenceQuery<T>(path: string, enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const result = await callIntelligenceAPI<T>(path);
    setData(result.data);
    setError(result.error);
    setLoading(false);
  }, [path]);

  useEffect(() => {
    if (enabled) reload();
  }, [reload, enabled]);

  return { data, loading, error, reload };
}

// ── Typed Hooks ─────────────────────────────────────────────

// J. Unified Overview
export interface IntelligenceOverview {
  assetSummary: {
    totalAssets: number;
    totalReuses: number;
    totalCostAvoided: number;
    avgFreshness: number;
    staleAssets: number;
    invalidatedCount: number;
  };
  domainBreakdown: Array<{ domain: string; count: number; reuses: number; valueUsd: number }>;
  efficiencyTrend: Array<{ score: number; measuredAt: string }>;
  avgEfficiency: number;
  reuseRate: number;
  recentEscalations: Array<Record<string, unknown>>;
  patternSummary: { total: number; active: number };
  decayAlerts: Array<Record<string, unknown>>;
  topOptimizations: string[];
}

export function useIntelligenceOverview() {
  return useIntelligenceQuery<IntelligenceOverview>("overview");
}

// D. Efficiency Scores
export interface EfficiencyScoreItem {
  scopeType: string;
  scopeId: string;
  qualityScore: number;
  costEfficiencyScore: number;
  acceptanceRate: number;
  overrideRate: number;
  falsePositiveRate: number;
  verificationSuccessRate: number;
  reuseRate: number;
  downstreamValueScore: number;
  compositeEfficiencyScore: number;
  measuredAt: string;
}

export function useEfficiencyScores(scopeType?: string) {
  const path = scopeType ? `efficiency/scores?scopeType=${scopeType}` : "efficiency/scores";
  return useIntelligenceQuery<{ items: EfficiencyScoreItem[]; total: number }>(path);
}

export function useEfficiencyHistory(scopeId: string) {
  return useIntelligenceQuery<{ scopeId: string; history: Array<Record<string, unknown>> }>(
    `efficiency/scores/${scopeId}/history`,
    !!scopeId,
  );
}

// E. Outcome Economics
export interface OutcomeEconomicsSummary {
  summary: { totalAiCostEstimate: number; totalEstimatedValue: number; weightedPaybackRatio: number };
  items: Array<Record<string, unknown>>;
}

export function useOutcomeEconomics() {
  return useIntelligenceQuery<OutcomeEconomicsSummary>("outcomes/economics");
}

export function useHighValueCategories() {
  return useIntelligenceQuery<{ categories: Array<{ category: string; count: number; totalValue: number; totalCost: number; paybackRatio: number }> }>("outcomes/high-value-categories");
}

// F. Escalations
export async function createEscalation(input: {
  taskId: string;
  domain: string;
  previousReasoningLevel: string;
  newReasoningLevel: string;
  triggerType: string;
  justification?: string;
  estimatedIncrementalCost?: number;
  expectedValue?: number;
}) {
  return callIntelligenceAPI<{ escalationId: string; status: string; approvalRequired: boolean }>("escalations", "POST", input);
}

// B. Differential Reasoning
export async function evaluateDifferentialReasoning(input: {
  domain: string;
  previousStateRef: string;
  currentStateRef: string;
  candidateAssetIds?: string[];
}) {
  return callIntelligenceAPI<Record<string, unknown>>("differential-reasoning/evaluate", "POST", input);
}

// C. Packets
export async function compileIntelligencePacket(input: {
  packetType: string;
  compressionMode?: "minimal" | "balanced" | "full";
}) {
  return callIntelligenceAPI<Record<string, unknown>>("packets/compile", "POST", input);
}

// G. Digests
export function useDigests() {
  return useIntelligenceQuery<{ items: Array<Record<string, unknown>> }>("digests");
}

export async function generateDigest(digestType: string) {
  return callIntelligenceAPI<Record<string, unknown>>("digests/generate", "POST", { digestType });
}

// H. Patterns
export function usePatterns(limit = 50) {
  return useIntelligenceQuery<{ items: Array<Record<string, unknown>> }>(`patterns?limit=${limit}`);
}

export async function extractPattern(input: { domain: string; signalType: string; description: string; confidence?: number }) {
  return callIntelligenceAPI<{ patternId: string; status: string }>("patterns/extract", "POST", input);
}

export async function generalizePattern(patternId: string) {
  return callIntelligenceAPI<{ patternId: string; status: string }>(`patterns/${patternId}/generalize`, "POST");
}

// I. Prompt Profiles
export function usePromptProfiles() {
  return useIntelligenceQuery<{ items: Array<Record<string, unknown>> }>("prompt-profiles");
}

export async function evaluatePromptProfile(profileId: string) {
  return callIntelligenceAPI<Record<string, unknown>>(`prompt-profiles/${profileId}/evaluate`, "POST");
}

// A. Assets
export function useIntelligenceAssets(filters?: { domain?: string; assetType?: string; page?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.domain) params.set("domain", filters.domain);
  if (filters?.assetType) params.set("assetType", filters.assetType);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  return useIntelligenceQuery<{ items: Array<Record<string, unknown>>; total: number }>(`assets${qs ? `?${qs}` : ""}`);
}

export async function evaluateAssetReuse(assetId: string, input: { currentTaskRef: string; domain: string }) {
  return callIntelligenceAPI<Record<string, unknown>>(`assets/${assetId}/reuse-evaluate`, "POST", input);
}
