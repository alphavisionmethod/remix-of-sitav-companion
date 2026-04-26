// ═══════════════════════════════════════════════════════════════
// SITA OS — Profile Evolution Detection Engine
// Detects shifts in business behavior over time and suggests
// profile reconfiguration when the operating reality drifts
// from the current classification.
// ═══════════════════════════════════════════════════════════════

import type { ProfileArchetype, ArchetypeWeights, BusinessProfileResult } from "./business-profile-engine";

// ── Types ─────────────────────────────────────────────────────

export interface BehaviorSignal {
  id: string;
  category: SignalCategory;
  value: number;
  timestamp: string;
  source: string;
}

export type SignalCategory =
  | "invoice_volume"
  | "appointment_frequency"
  | "team_activity"
  | "ecommerce_orders"
  | "support_tickets"
  | "proposal_count"
  | "recurring_billing"
  | "location_activity"
  | "walk_in_traffic"
  | "campaign_activity"
  | "collections_activity"
  | "scheduling_density";

export interface EvolutionInsight {
  id: string;
  type: "drift" | "emergence" | "decline";
  fromMode: ProfileArchetype;
  towardMode: ProfileArchetype;
  confidence: number;
  title: string;
  description: string;
  suggestion: string;
  suggestedWeightAdjustment: Partial<ArchetypeWeights>;
  severity: "info" | "notable" | "significant";
  detectedAt: string;
  dismissed: boolean;
}

export interface EvolutionSnapshot {
  capturedAt: string;
  signalSummary: Record<SignalCategory, number>;
  derivedWeightDelta: Partial<ArchetypeWeights>;
}

// ── Signal → Archetype Mapping ────────────────────────────────

const SIGNAL_ARCHETYPE_MAP: Record<SignalCategory, { archetype: ProfileArchetype; weight: number }[]> = {
  invoice_volume:      [{ archetype: "service", weight: 0.3 }, { archetype: "agency", weight: 0.2 }],
  appointment_frequency: [{ archetype: "appointment-based", weight: 0.4 }, { archetype: "brick-and-mortar", weight: 0.15 }],
  team_activity:       [{ archetype: "employee-based", weight: 0.35 }, { archetype: "agency", weight: 0.15 }],
  ecommerce_orders:    [{ archetype: "ecommerce", weight: 0.5 }],
  support_tickets:     [{ archetype: "ecommerce", weight: 0.15 }, { archetype: "service", weight: 0.1 }],
  proposal_count:      [{ archetype: "agency", weight: 0.3 }, { archetype: "service", weight: 0.2 }],
  recurring_billing:   [{ archetype: "membership", weight: 0.4 }],
  location_activity:   [{ archetype: "brick-and-mortar", weight: 0.3 }, { archetype: "multi-location", weight: 0.25 }],
  walk_in_traffic:     [{ archetype: "brick-and-mortar", weight: 0.35 }],
  campaign_activity:   [{ archetype: "ecommerce", weight: 0.2 }, { archetype: "membership", weight: 0.15 }],
  collections_activity: [{ archetype: "service", weight: 0.2 }, { archetype: "agency", weight: 0.15 }],
  scheduling_density:  [{ archetype: "appointment-based", weight: 0.35 }, { archetype: "professional-practice", weight: 0.2 }],
};

// ── Thresholds ────────────────────────────────────────────────

const DRIFT_THRESHOLD = 0.15;     // weight delta to trigger "drift" insight
const EMERGENCE_THRESHOLD = 0.10; // weight delta for a new mode emerging
const DECLINE_THRESHOLD = 0.12;   // weight delta for a mode declining

// ── Core Analysis ─────────────────────────────────────────────

/**
 * Analyze behavioral signals against the current profile to detect evolution.
 */
export function analyzeProfileEvolution(
  currentProfile: BusinessProfileResult,
  signals: BehaviorSignal[],
  previousSnapshot?: EvolutionSnapshot | null
): EvolutionInsight[] {
  if (signals.length === 0) return [];

  // Aggregate signals by category
  const summary: Record<string, number> = {};
  for (const sig of signals) {
    summary[sig.category] = (summary[sig.category] || 0) + sig.value;
  }

  // Compute implied weight deltas from signals
  const impliedDeltas: Partial<ArchetypeWeights> = {};
  for (const [category, total] of Object.entries(summary)) {
    const mappings = SIGNAL_ARCHETYPE_MAP[category as SignalCategory];
    if (!mappings) continue;
    // Normalize: high signal → stronger push
    const normalizedStrength = Math.min(1, total / 50); // 50 signals = full strength
    for (const { archetype, weight } of mappings) {
      const delta = normalizedStrength * weight;
      impliedDeltas[archetype] = (impliedDeltas[archetype] || 0) + delta;
    }
  }

  // Normalize implied deltas
  const totalDelta = Object.values(impliedDeltas).reduce((s, v) => s + (v || 0), 0);
  if (totalDelta > 0) {
    for (const k of Object.keys(impliedDeltas) as ProfileArchetype[]) {
      impliedDeltas[k] = Math.round(((impliedDeltas[k] || 0) / totalDelta) * 100) / 100;
    }
  }

  const insights: EvolutionInsight[] = [];
  const now = new Date().toISOString();

  // Compare implied weights vs current weights
  for (const [arch, impliedWeight] of Object.entries(impliedDeltas) as [ProfileArchetype, number][]) {
    const currentWeight = currentProfile.weights[arch] || 0;
    const delta = impliedWeight - currentWeight;

    if (delta > DRIFT_THRESHOLD && arch !== currentProfile.primaryMode) {
      // Mode is emerging or drifting toward
      insights.push({
        id: `evo-${arch}-${Date.now()}`,
        type: currentWeight < 0.05 ? "emergence" : "drift",
        fromMode: currentProfile.primaryMode,
        towardMode: arch,
        confidence: Math.min(0.95, 0.5 + delta),
        title: currentWeight < 0.05
          ? `${formatArchetype(arch)} behavior emerging`
          : `Drifting toward ${formatArchetype(arch)}`,
        description: currentWeight < 0.05
          ? `Your recent activity shows ${formatArchetype(arch)} patterns that weren't in your original profile. This suggests your business may be expanding into this area.`
          : `Your business behavior is increasingly aligned with ${formatArchetype(arch)} patterns. Your current ${formatArchetype(currentProfile.primaryMode)} emphasis may need adjustment.`,
        suggestion: currentWeight < 0.05
          ? `Would you like Business OS to activate ${formatArchetype(arch)} features and advisors?`
          : `Would you like to increase ${formatArchetype(arch)} emphasis in your Business OS?`,
        suggestedWeightAdjustment: { [arch]: Math.min(1, currentWeight + delta * 0.5) },
        severity: delta > 0.25 ? "significant" : delta > 0.18 ? "notable" : "info",
        detectedAt: now,
        dismissed: false,
      });
    }

    if (delta < -DECLINE_THRESHOLD && currentWeight > 0.15) {
      // Current mode is declining
      insights.push({
        id: `evo-decline-${arch}-${Date.now()}`,
        type: "decline",
        fromMode: arch,
        towardMode: currentProfile.primaryMode,
        confidence: Math.min(0.9, 0.4 + Math.abs(delta)),
        title: `${formatArchetype(arch)} activity declining`,
        description: `Your ${formatArchetype(arch)} activity has decreased. This could mean your business model is shifting, or this area is seasonal.`,
        suggestion: `Would you like to reduce ${formatArchetype(arch)} emphasis and redistribute to more active areas?`,
        suggestedWeightAdjustment: { [arch]: Math.max(0, currentWeight + delta * 0.3) },
        severity: Math.abs(delta) > 0.25 ? "significant" : "notable",
        detectedAt: now,
        dismissed: false,
      });
    }
  }

  return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Create a snapshot of current behavioral signals for future comparison.
 */
export function captureEvolutionSnapshot(
  signals: BehaviorSignal[]
): EvolutionSnapshot {
  const summary: Record<string, number> = {};
  for (const sig of signals) {
    summary[sig.category] = (summary[sig.category] || 0) + sig.value;
  }

  return {
    capturedAt: new Date().toISOString(),
    signalSummary: summary as Record<SignalCategory, number>,
    derivedWeightDelta: {},
  };
}

/**
 * Generate mock behavioral signals from existing OS usage patterns.
 * In production, these would come from actual tracked user behavior.
 */
export function generateMockSignals(primaryMode: ProfileArchetype): BehaviorSignal[] {
  const now = new Date().toISOString();
  const base: BehaviorSignal[] = [];

  // Generate signals aligned with current mode (baseline)
  const modeSignals: Record<string, SignalCategory[]> = {
    ecommerce: ["ecommerce_orders", "campaign_activity", "support_tickets"],
    service: ["invoice_volume", "proposal_count", "collections_activity"],
    "brick-and-mortar": ["walk_in_traffic", "location_activity", "appointment_frequency"],
    "employee-based": ["team_activity", "scheduling_density"],
    "appointment-based": ["appointment_frequency", "scheduling_density"],
    agency: ["proposal_count", "team_activity", "invoice_volume"],
    membership: ["recurring_billing", "campaign_activity"],
  };

  const categories = modeSignals[primaryMode] || modeSignals.service;
  for (const cat of categories) {
    base.push({
      id: `sig-${cat}-${Date.now()}`,
      category: cat,
      value: 20 + Math.floor(Math.random() * 30),
      timestamp: now,
      source: "usage-tracking",
    });
  }

  return base;
}

// ── Storage ───────────────────────────────────────────────────
// Storage helpers for evolution snapshots/insights live in the
// service layer to keep this engine pure & deterministic. See:
//   src/lib/services/business-os/profile-evolution.service.ts

// ── Helpers ───────────────────────────────────────────────────

function formatArchetype(arch: ProfileArchetype): string {
  const labels: Record<string, string> = {
    ecommerce: "E-Commerce",
    "brick-and-mortar": "Brick & Mortar",
    service: "Service Business",
    "employee-based": "Team Operations",
    "appointment-based": "Appointment-Based",
    agency: "Agency",
    "professional-practice": "Professional Practice",
    hybrid: "Hybrid",
    "multi-location": "Multi-Location",
    "product-service": "Product + Service",
    membership: "Membership",
    marketplace: "Marketplace",
  };
  return labels[arch] || arch;
}
