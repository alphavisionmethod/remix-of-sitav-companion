// ═══════════════════════════════════════════════════════════════
// SITA OS — Revenue Memory Service
// Orchestrates business growth memory across 5 domains:
// User, Advisor, Client, Campaign, Revenue Pipeline
// ═══════════════════════════════════════════════════════════════

import { revenueAdvisorStances, revenueMemoryEvents, revenueRetentionSignals, revenueExperiments, revenueCampaigns, revenueFunnels, revenueFunnelSteps, revenueOffers, revenueBookings, revenueReviews, revenueSegments, revenueReputationMetrics, revenueWinbackQueue } from "@/data/repositories/revenue-ops-data-service";

import type { AdvisorMemoryEntry, GrowthDNATrait, WhatChangedItem, GrowthFirewallAlert, TimeMachineSnapshot, AdvisorDebate, AlignmentCluster } from "@/domains/finance";

// Canonical type re-exports for backward compatibility.
// New code should import from `@/domains/finance` directly.
export type { AdvisorMemoryEntry, GrowthDNATrait, WhatChangedItem, GrowthFirewallAlert, TimeMachineSnapshot, AdvisorDebate, AlignmentCluster };

// ── Types ──────────────────────────────────────────────────────

// ── What Changed Engine ────────────────────────────────────────
export async function computeWhatChanged(dayWindow = 7): Promise<WhatChangedItem[]> {
  const since = new Date(Date.now() - dayWindow * 86400000).toISOString();
  const [stances, memories, signals, campaigns] = await Promise.all([
    revenueAdvisorStances.list({ since }),
    revenueMemoryEvents.list({ since }),
    revenueRetentionSignals.list({ since }),
    revenueCampaigns.list({ since }),
  ]);

  const items: WhatChangedItem[] = [];

  // Advisor stance changes
  (stances as any[]).forEach(s => {
    items.push({
      domain: "advisor",
      description: `${s.advisor_name || "Advisor"} changed stance: ${s.current_stance || "updated"}`,
      impact: (s.confidence_delta ?? 0) > 0 ? "positive" : (s.confidence_delta ?? 0) < 0 ? "negative" : "neutral",
      timestamp: s.created_at,
      magnitude: Math.abs(s.confidence_delta ?? 0) * 100,
      advisorLinked: s.advisor_name,
    });
  });

  // Retention signals
  (signals as any[]).forEach(s => {
    items.push({
      domain: "retention",
      description: `${s.signal_type || "Signal"}: ${s.description || s.client_name || "client event"}`,
      impact: s.signal_type === "churn_risk" ? "negative" : s.signal_type === "expansion" ? "positive" : "neutral",
      timestamp: s.created_at,
      magnitude: s.severity_score ?? 50,
    });
  });

  // Campaign events
  (campaigns as any[]).forEach(c => {
    items.push({
      domain: "campaign",
      description: `Campaign "${c.name || "Untitled"}" ${c.status || "updated"}`,
      impact: c.status === "active" ? "positive" : "neutral",
      timestamp: c.created_at,
      magnitude: 40,
    });
  });

  // Memory events
  (memories as any[]).forEach(m => {
    items.push({
      domain: m.event_type || "general",
      description: m.title || m.description || "Memory event recorded",
      impact: m.sentiment === "positive" ? "positive" : m.sentiment === "negative" ? "negative" : "neutral",
      timestamp: m.created_at,
      magnitude: m.importance_score ?? 30,
    });
  });

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Growth DNA Inference ───────────────────────────────────────
export async function inferGrowthDNA(): Promise<GrowthDNATrait[]> {
  const [funnels, offers, reviews, segments, signals] = await Promise.all([
    revenueFunnels.list(),
    revenueOffers.list(),
    revenueReviews.list(),
    revenueSegments.list(),
    revenueRetentionSignals.list(),
  ]);

  const now = new Date().toISOString();
  const traits: GrowthDNATrait[] = [];

  // Revenue concentration
  const offerArr = offers as any[];
  if (offerArr.length > 0) {
    const topRevenue = offerArr.sort((a, b) => (b.total_revenue ?? 0) - (a.total_revenue ?? 0));
    const totalRev = topRevenue.reduce((s, o) => s + (o.total_revenue ?? 0), 0);
    const topShare = totalRev > 0 ? ((topRevenue[0]?.total_revenue ?? 0) / totalRev) * 100 : 0;
    traits.push({ trait: "Revenue Concentration", score: Math.max(0, 100 - topShare), trend: "stable", evidenceCount: offerArr.length, lastMeasured: now });
  }

  // Funnel health
  const funnelArr = funnels as any[];
  if (funnelArr.length > 0) {
    const avgConv = funnelArr.reduce((s, f) => s + (f.conversion_rate ?? 0), 0) / funnelArr.length;
    traits.push({ trait: "Funnel Conversion", score: Math.min(100, avgConv * 4), trend: avgConv > 20 ? "improving" : "declining", evidenceCount: funnelArr.length, lastMeasured: now });
  }

  // Reputation strength
  const reviewArr = reviews as any[];
  if (reviewArr.length > 0) {
    const avgRating = reviewArr.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewArr.length;
    traits.push({ trait: "Reputation Score", score: (avgRating / 5) * 100, trend: avgRating > 4.5 ? "improving" : "stable", evidenceCount: reviewArr.length, lastMeasured: now });
  }

  // Retention resilience
  const signalArr = signals as any[];
  const churnSignals = signalArr.filter((s: any) => s.signal_type === "churn_risk").length;
  const retScore = Math.max(0, 100 - churnSignals * 15);
  traits.push({ trait: "Churn Resilience", score: retScore, trend: churnSignals > 3 ? "declining" : "stable", evidenceCount: signalArr.length, lastMeasured: now });

  // Segment diversity
  const segArr = segments as any[];
  traits.push({ trait: "Segment Diversity", score: Math.min(100, segArr.length * 12), trend: "stable", evidenceCount: segArr.length, lastMeasured: now });

  // Referral engine (placeholder based on review count)
  traits.push({ trait: "Referral Engine", score: Math.min(100, reviewArr.length * 5), trend: reviewArr.length > 10 ? "improving" : "declining", evidenceCount: reviewArr.length, lastMeasured: now });

  return traits;
}

// ── Growth Firewall ────────────────────────────────────────────
export async function assessGrowthFirewall(): Promise<GrowthFirewallAlert[]> {
  const [campaigns, experiments, signals, bookings] = await Promise.all([
    revenueCampaigns.list({ limit: 20 }),
    revenueExperiments.list({ limit: 20 }),
    revenueRetentionSignals.list({ limit: 20 }),
    revenueBookings.list({ limit: 20 }),
  ]);

  const alerts: GrowthFirewallAlert[] = [];
  const now = new Date().toISOString();

  // Check for campaign launching without testing
  const recentCampaigns = (campaigns as any[]).filter(c => {
    const age = Date.now() - new Date(c.created_at).getTime();
    return age < 7 * 86400000 && c.status === "active";
  });
  if (recentCampaigns.length > 2) {
    alerts.push({
      ruleId: "gf-rapid-launch",
      ruleName: "Rapid Campaign Launches",
      severity: "warning",
      description: `${recentCampaigns.length} campaigns launched in 7 days — risk of audience fatigue`,
      triggerSignal: "campaign_velocity_high",
      recommendation: "Stagger launches by 5-7 days to monitor fatigue signals between campaigns",
      timestamp: now,
    });
  }

  // Check for ignored churn signals
  const churnRisks = (signals as any[]).filter(s => s.signal_type === "churn_risk" && s.status !== "resolved");
  if (churnRisks.length > 3) {
    alerts.push({
      ruleId: "gf-unaddressed-churn",
      ruleName: "Unaddressed Churn Risks",
      severity: "critical",
      description: `${churnRisks.length} churn risk signals have not been addressed`,
      triggerSignal: "churn_signals_unresolved",
      recommendation: "Prioritize outreach to at-risk clients before scaling acquisition",
      timestamp: now,
    });
  }

  // Check booking capacity
  const recentBookings = (bookings as any[]).filter(b => {
    const age = Date.now() - new Date(b.created_at).getTime();
    return age < 7 * 86400000;
  });
  if (recentBookings.length > 15) {
    alerts.push({
      ruleId: "gf-capacity-strain",
      ruleName: "Capacity Strain",
      severity: "warning",
      description: `${recentBookings.length} bookings this week — approaching delivery capacity limits`,
      triggerSignal: "booking_volume_high",
      recommendation: "Review availability windows or extend delivery team before accepting more",
      timestamp: now,
    });
  }

  // Check for experiments without results
  const stalledExperiments = (experiments as any[]).filter(e => e.status === "running" && !e.result);
  if (stalledExperiments.length > 2) {
    alerts.push({
      ruleId: "gf-experiment-stall",
      ruleName: "Stalled Experiments",
      severity: "warning",
      description: `${stalledExperiments.length} growth experiments running without recorded results`,
      triggerSignal: "experiment_no_result",
      recommendation: "Review running experiments and record preliminary findings",
      timestamp: now,
    });
  }

  return alerts;
}

// ── Time Machine Snapshot ──────────────────────────────────────
export async function buildTimeMachineSnapshot(): Promise<TimeMachineSnapshot> {
  const [stances, signals, reviews, funnels] = await Promise.all([
    revenueAdvisorStances.list({ limit: 9 }),
    revenueRetentionSignals.list({ limit: 50 }),
    revenueReviews.list({ limit: 50 }),
    revenueFunnels.list(),
  ]);

  const reviewArr = reviews as any[];
  const avgRating = reviewArr.length > 0 ? reviewArr.reduce((s, r) => s + (r.rating ?? 0), 0) / reviewArr.length : 0;
  const funnelArr = funnels as any[];
  const avgConv = funnelArr.length > 0 ? funnelArr.reduce((s, f) => s + (f.conversion_rate ?? 0), 0) / funnelArr.length : 0;
  const churnRisks = (signals as any[]).filter(s => s.signal_type === "churn_risk").length;

  return {
    snapshotDate: new Date().toISOString(),
    metrics: {
      monthlyRevenue: 0, // populated from aggregation
      pipelineValue: 0,
      activeClients: 0,
      conversionRate: avgConv,
      churnRate: Math.min(100, churnRisks * 5),
      reputationScore: (avgRating / 5) * 100,
      funnelHealth: Math.min(100, avgConv * 4),
    },
    advisorStances: (stances as any[]).map(s => ({
      name: s.advisor_name || "Advisor",
      stance: s.current_stance || "",
      confidence: s.confidence ?? 0,
    })),
    topRisks: (signals as any[]).filter(s => s.signal_type === "churn_risk").slice(0, 3).map(s => s.description || "Churn risk detected"),
    topOpportunities: (signals as any[]).filter(s => s.signal_type === "expansion").slice(0, 3).map(s => s.description || "Expansion opportunity"),
  };
}

// ── Advisor Memory ─────────────────────────────────────────────
export async function getAdvisorMemory(): Promise<AdvisorMemoryEntry[]> {
  const stances = await revenueAdvisorStances.list({ limit: 50 });
  return (stances as any[]).map(s => ({
    advisorId: s.id,
    name: s.advisor_name || "Unknown",
    domain: s.domain || "general",
    stance: s.current_stance || "",
    confidence: s.confidence ?? 0,
    timestamp: s.created_at,
    whatChanged: s.what_changed,
    previousStance: s.previous_stance,
    confidenceDelta: s.confidence_delta,
  }));
}

// ── Advisor Debate Detection ───────────────────────────────────

export function detectDebates(advisors: Array<{ name: string; domain: string; stance: string; confidence: number; recommendation: string }>): AdvisorDebate[] {
  const debates: AdvisorDebate[] = [];

  // Check for opposing recommendations
  const acquisitionAdvisors = advisors.filter(a => a.recommendation.toLowerCase().includes("scale") || a.recommendation.toLowerCase().includes("expand") || a.recommendation.toLowerCase().includes("increase"));
  const conservativeAdvisors = advisors.filter(a => a.recommendation.toLowerCase().includes("protect") || a.recommendation.toLowerCase().includes("reduce") || a.recommendation.toLowerCase().includes("pause") || a.recommendation.toLowerCase().includes("caution"));

  if (acquisitionAdvisors.length > 0 && conservativeAdvisors.length > 0) {
    const disagreements = acquisitionAdvisors.flatMap(a =>
      conservativeAdvisors.map(b => ({
        advisorA: a.name,
        stanceA: a.stance,
        confidenceA: a.confidence,
        advisorB: b.name,
        stanceB: b.stance,
        confidenceB: b.confidence,
        severity: (Math.abs(a.confidence - b.confidence) > 0.2 ? "strong" : Math.abs(a.confidence - b.confidence) > 0.1 ? "moderate" : "mild") as "mild" | "moderate" | "strong",
      }))
    );

    debates.push({
      topic: "Growth vs Protection",
      disagreements,
      synthesis: `${acquisitionAdvisors.length} advisor(s) recommend scaling while ${conservativeAdvisors.length} urge caution. Weighted confidence favors ${acquisitionAdvisors.reduce((s, a) => s + a.confidence, 0) / acquisitionAdvisors.length > conservativeAdvisors.reduce((s, a) => s + a.confidence, 0) / conservativeAdvisors.length ? "growth" : "protection"}.`,
    });
  }

  return debates;
}

// ── Alignment Map ──────────────────────────────────────────────

export function computeAlignmentMap(advisors: Array<{ name: string; confidence: number; type: string }>): AlignmentCluster[] {
  const clusters: AlignmentCluster[] = [];
  const bullish = advisors.filter(a => a.type === "opportunity");
  const bearish = advisors.filter(a => a.type === "alert" || a.type === "warning");

  if (bullish.length > 0) {
    clusters.push({
      theme: "Growth Opportunity",
      advisors: bullish.map(a => a.name),
      avgConfidence: bullish.reduce((s, a) => s + a.confidence, 0) / bullish.length,
      direction: "bullish",
    });
  }

  if (bearish.length > 0) {
    clusters.push({
      theme: "Risk & Protection",
      advisors: bearish.map(a => a.name),
      avgConfidence: bearish.reduce((s, a) => s + a.confidence, 0) / bearish.length,
      direction: "bearish",
    });
  }

  return clusters;
}
