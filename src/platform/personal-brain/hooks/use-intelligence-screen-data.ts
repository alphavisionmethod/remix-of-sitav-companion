// ═══════════════════════════════════════════════════════════════
// SITA OS — useIntelligenceScreenData
// Fetches real Supabase data for intelligence screens,
// falls back to demo data when no real data exists.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromDynamicTable } from "@/lib/supabase-helpers";
import { useDataMode } from "@/contexts/DataModeContext";

const INTEL_ASSETS: IntelligenceAsset[] = [];
const INTEL_AGENTS: EfficiencyAgent[] = [];
const INTEL_OUTCOMES: OutcomeRecord[] = [];
const WORKFLOWS: any[] = [];
const PATHS: any[] = [];
const REASONING_PATHS: any[] = [];
const REUSE_DATA: ReuseStats = { reuseRate: 0, directReuseRate: 0, adaptedReuseRate: 0, costAvoided: 0, totalReuses: 0, invalidatedAssets: 0, avgConfidence: 0, confidenceTrend: "stable" };
const ASSET_CLASSES: any[] = [];
const DOMAIN_REUSE: any[] = [];
const INVALIDATION_FEED: any[] = [];
const CONFIDENCE_TREND: any[] = [];

// ── Types ────────────────────────────────────────────────────────

export interface IntelligenceAsset {
  id: string;
  type: string;
  domain: string;
  title: string;
  confidence: number;
  freshness: string;
  verificationState: string;
  reuseEligible: boolean;
  usageCount: number;
  qualityScore: number;
  acceptanceRate: number;
  status: string;
  savings: number;
  invalidationTriggers: string[];
  evidenceRefs: number;
  lastUsed: string;
}

export interface EfficiencyAgent {
  id: string;
  name: string;
  composite: number;
  quality: number;
  costEff: number;
  acceptance: number;
  override: number;
  falsePositive: number;
  verification: number;
  reuse: number;
  downstream: number;
  trend: string;
}

export interface OutcomeRecord {
  type: string;
  count: number;
  costCents: number;
  valueCents: number;
  roi: number;
  accepted: number;
  rejected: number;
  domain: string;
}

export interface ReuseStats {
  reuseRate: number;
  directReuseRate: number;
  adaptedReuseRate: number;
  costAvoided: number;
  totalReuses: number;
  invalidatedAssets: number;
  avgConfidence: number;
  confidenceTrend: string;
}

// ── Helpers ──────────────────────────────────────────────────────

async function uid(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function freshnessLabel(score: number | null): string {
  if (!score) return "stale";
  if (score >= 90) return "fresh";
  if (score >= 70) return "recent";
  if (score >= 40) return "aging";
  return "stale";
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}hr ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── Asset Library Hook ───────────────────────────────────────────

export function useIntelligenceAssetLibrary(filters?: { domain?: string; type?: string }) {
  const { mode } = useDataMode();
  const [assets, setAssets] = useState<IntelligenceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);

    if (mode === "demo") {
      setAssets(INTEL_ASSETS);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const userId = await uid();
    if (!userId) {
      setAssets(INTEL_ASSETS);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch from both intelligence_assets and intelligence_assets_library
      let q = fromDynamicTable("intelligence_assets")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters?.domain) q = q.eq("domain", filters.domain);
      if (filters?.type) q = q.eq("asset_type", filters.type);

      const { data: rawAssets, error } = await q;

      if (error || !rawAssets || rawAssets.length === 0) {
        setAssets(INTEL_ASSETS);
        setIsDemo(true);
        setLoading(false);
        return;
      }

      // Also fetch usage counts
      const { data: usages } = await fromDynamicTable("intelligence_asset_usages")
        .select("intelligence_asset_id, usage_mode, cost_avoided_estimate, outcome_quality")
        .eq("user_id", userId);

      const usageMap = new Map<string, { count: number; savings: number; accepted: number; total: number }>();
      (usages ?? []).forEach((u: any) => {
        const existing = usageMap.get(u.intelligence_asset_id) || { count: 0, savings: 0, accepted: 0, total: 0 };
        existing.count++;
        existing.savings += u.cost_avoided_estimate || 0;
        existing.total++;
        if ((u.outcome_quality || 0) >= 70) existing.accepted++;
        usageMap.set(u.intelligence_asset_id, existing);
      });

      const mapped: IntelligenceAsset[] = rawAssets.map((a: any) => {
        const usage = usageMap.get(a.id) || { count: 0, savings: 0, accepted: 0, total: 0 };
        return {
          id: a.id,
          type: a.asset_type || "unknown",
          domain: a.domain || "general",
          title: a.title,
          confidence: a.confidence_score ?? 0,
          freshness: freshnessLabel(a.freshness_score),
          verificationState: a.verification_state || "pending",
          reuseEligible: a.reuse_eligibility ?? false,
          usageCount: usage.count,
          qualityScore: a.confidence_score ?? 0,
          acceptanceRate: usage.total > 0 ? usage.accepted / usage.total : 0,
          status: a.verification_state === "verified" ? "active" : (a.freshness_score ?? 0) < 40 ? "stale" : "active",
          savings: Math.round(usage.savings * 100), // convert to cents
          invalidationTriggers: a.invalidation_triggers || [],
          evidenceRefs: (a.evidence_refs || []).length,
          lastUsed: timeAgo(a.last_used_at),
        };
      });

      setAssets(mapped);
      setIsDemo(false);
    } catch {
      setAssets(INTEL_ASSETS);
      setIsDemo(true);
    }

    setLoading(false);
  }, [mode, filters?.domain, filters?.type]);

  useEffect(() => { reload(); }, [reload]);

  return { assets, loading, isDemo, reload };
}

// ── Efficiency Scoreboard Hook ───────────────────────────────────

export function useEfficiencyScoreboard() {
  const { mode } = useDataMode();
  const [agents, setAgents] = useState<EfficiencyAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);

    if (mode === "demo") {
      setAgents(INTEL_AGENTS);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const userId = await uid();
    if (!userId) {
      setAgents(INTEL_AGENTS);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await fromDynamicTable("ai_efficiency_scores")
        .select("*")
        .eq("user_id", userId)
        .order("measured_at", { ascending: false })
        .limit(50);

      if (error || !data || data.length === 0) {
        setAgents(INTEL_AGENTS);
        setIsDemo(true);
        setLoading(false);
        return;
      }

      // Group by scope_id (agent), take latest per scope
      const latestByScope = new Map<string, any>();
      data.forEach((row: any) => {
        if (!latestByScope.has(row.scope_id)) latestByScope.set(row.scope_id, row);
      });

      const mapped: EfficiencyAgent[] = Array.from(latestByScope.values()).map((r: any) => ({
        id: r.id,
        name: r.scope_id.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        composite: r.composite_efficiency_score ?? 0,
        quality: r.quality_score ?? 0,
        costEff: r.cost_efficiency_score ?? 0,
        acceptance: r.acceptance_rate ?? 0,
        override: r.override_rate ?? 0,
        falsePositive: r.false_positive_rate ?? 0,
        verification: r.verification_success_rate ?? 0,
        reuse: r.reuse_rate ?? 0,
        downstream: r.downstream_value_score ?? 0,
        trend: (r.composite_efficiency_score ?? 0) >= 80 ? "improving" : (r.composite_efficiency_score ?? 0) >= 60 ? "stable" : "degrading",
      }));

      setAgents(mapped);
      setIsDemo(false);
    } catch {
      setAgents(INTEL_AGENTS);
      setIsDemo(true);
    }

    setLoading(false);
  }, [mode]);

  useEffect(() => { reload(); }, [reload]);

  // Always provide demo workflow/path data (no separate table exists)
  return { agents, workflows: WORKFLOWS, paths: PATHS, loading, isDemo, reload };
}

// ── Outcome Economics Hook ───────────────────────────────────────

export function useOutcomeEconomics() {
  const { mode } = useDataMode();
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);

    if (mode === "demo") {
      setOutcomes(INTEL_OUTCOMES);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const userId = await uid();
    if (!userId) {
      setOutcomes(INTEL_OUTCOMES);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    try {
      // Pull from intelligence_quality_feedback + ai_efficiency_scores to compute outcomes
      const { data: feedback, error } = await fromDynamicTable("intelligence_quality_feedback")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error || !feedback || feedback.length === 0) {
        setOutcomes(INTEL_OUTCOMES);
        setIsDemo(true);
        setLoading(false);
        return;
      }

      // Aggregate by scope_type as outcome type
      const outcomeMap = new Map<string, OutcomeRecord>();
      feedback.forEach((f: any) => {
        const key = f.scope_type || "unknown";
        const existing = outcomeMap.get(key) || {
          type: key, count: 0, costCents: 0, valueCents: 0, roi: 0, accepted: 0, rejected: 0, domain: "general",
        };
        existing.count++;
        if (f.feedback_type === "accepted" || f.feedback_type === "positive") existing.accepted++;
        else if (f.feedback_type === "rejected" || f.feedback_type === "negative") existing.rejected++;
        outcomeMap.set(key, existing);
      });

      // If we got feedback but can't compute meaningful economics, fall back
      if (outcomeMap.size === 0) {
        setOutcomes(INTEL_OUTCOMES);
        setIsDemo(true);
      } else {
        // Estimate costs/values from counts (placeholder until full ledger integration)
        const mapped = Array.from(outcomeMap.values()).map(o => ({
          ...o,
          costCents: o.count * 200,
          valueCents: o.accepted * 2000,
          roi: o.accepted > 0 ? (o.accepted * 2000) / (o.count * 200) : 0,
        }));
        setOutcomes(mapped);
        setIsDemo(false);
      }
    } catch {
      setOutcomes(INTEL_OUTCOMES);
      setIsDemo(true);
    }

    setLoading(false);
  }, [mode]);

  useEffect(() => { reload(); }, [reload]);

  return { outcomes, reasoningPaths: REASONING_PATHS, loading, isDemo, reload };
}

// ── Reuse Overview Hook ──────────────────────────────────────────

export function useReuseOverview() {
  const { mode } = useDataMode();
  const [stats, setStats] = useState<ReuseStats>(REUSE_DATA);
  const [assetClasses, setAssetClasses] = useState(ASSET_CLASSES);
  const [domainReuse, setDomainReuse] = useState(DOMAIN_REUSE);
  const [invalidationFeed, setInvalidationFeed] = useState(INVALIDATION_FEED);
  const [confidenceTrend, setConfidenceTrend] = useState(CONFIDENCE_TREND);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);

    if (mode === "demo") {
      setStats(REUSE_DATA);
      setAssetClasses(ASSET_CLASSES);
      setDomainReuse(DOMAIN_REUSE);
      setInvalidationFeed(INVALIDATION_FEED);
      setConfidenceTrend(CONFIDENCE_TREND);
      setIsDemo(true);
      setLoading(false);
      return;
    }

    const userId = await uid();
    if (!userId) {
      setIsDemo(true);
      setLoading(false);
      return;
    }

    try {
      // Fetch assets + usages in parallel
      const [assetsRes, usagesRes, reuseOppsRes] = await Promise.all([
        fromDynamicTable("intelligence_assets").select("*").eq("user_id", userId).limit(500),
        fromDynamicTable("intelligence_asset_usages").select("*").eq("user_id", userId).limit(1000),
        fromDynamicTable("intelligence_reuse_opportunities").select("*").eq("user_id", userId).limit(200),
      ]);

      const assets = assetsRes.data ?? [];
      const usages = usagesRes.data ?? [];

      if (assets.length === 0 && usages.length === 0) {
        setIsDemo(true);
        setLoading(false);
        return;
      }

      // Compute reuse stats
      const totalUsages = usages.length;
      const directUsages = usages.filter((u: any) => u.usage_mode === "direct").length;
      const adaptedUsages = usages.filter((u: any) => u.usage_mode === "adapted").length;
      const costAvoided = usages.reduce((s: number, u: any) => s + (u.cost_avoided_estimate || 0), 0);
      const invalidatedCount = assets.filter((a: any) => a.verification_state === "invalidated").length;
      const avgConf = assets.length > 0
        ? Math.round(assets.reduce((s: number, a: any) => s + (a.confidence_score || 0), 0) / assets.length)
        : 0;

      setStats({
        reuseRate: assets.length > 0 ? Math.min(totalUsages / (assets.length * 3), 1) : 0,
        directReuseRate: totalUsages > 0 ? directUsages / totalUsages : 0,
        adaptedReuseRate: totalUsages > 0 ? adaptedUsages / totalUsages : 0,
        costAvoided: Math.round(costAvoided * 100),
        totalReuses: totalUsages,
        invalidatedAssets: invalidatedCount,
        avgConfidence: avgConf,
        confidenceTrend: "improving",
      });

      // Asset class breakdown
      const classMap = new Map<string, { reuses: number; savings: number }>();
      assets.forEach((a: any) => {
        const key = a.asset_type || "unknown";
        const existing = classMap.get(key) || { reuses: 0, savings: 0 };
        classMap.set(key, existing);
      });
      usages.forEach((u: any) => {
        // We'd need to join, but approximate by counting
        const key = "general";
        const existing = classMap.get(key) || { reuses: 0, savings: 0 };
        existing.reuses++;
        existing.savings += (u.cost_avoided_estimate || 0) * 100;
        classMap.set(key, existing);
      });

      const computedClasses = Array.from(classMap.entries())
        .map(([type, data]) => ({ type, reuses: data.reuses, savings: Math.round(data.savings), trend: "stable" as const }))
        .filter(c => c.reuses > 0)
        .sort((a, b) => b.reuses - a.reuses);

      if (computedClasses.length > 0) setAssetClasses(computedClasses);

      // Domain breakdown
      const domainMap = new Map<string, { reuseRate: number; savings: number; assets: number; invalidated: number }>();
      assets.forEach((a: any) => {
        const key = a.domain || "general";
        const existing = domainMap.get(key) || { reuseRate: 0, savings: 0, assets: 0, invalidated: 0 };
        existing.assets++;
        if (a.verification_state === "invalidated") existing.invalidated++;
        domainMap.set(key, existing);
      });

      const computedDomainReuse = Array.from(domainMap.entries())
        .map(([domain, data]) => ({
          domain,
          reuseRate: data.assets > 0 ? Math.min(totalUsages / (data.assets * 5), 1) : 0,
          savings: Math.round(costAvoided * 100 * (data.assets / assets.length)),
          assets: data.assets,
          invalidated: data.invalidated,
        }))
        .sort((a, b) => b.reuseRate - a.reuseRate);

      if (computedDomainReuse.length > 0) setDomainReuse(computedDomainReuse);

      setIsDemo(false);
    } catch {
      setIsDemo(true);
    }

    setLoading(false);
  }, [mode]);

  useEffect(() => { reload(); }, [reload]);

  return { stats, assetClasses, domainReuse, invalidationFeed, confidenceTrend, loading, isDemo, reload };
}
