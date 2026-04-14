// ═══════════════════════════════════════════════════════════════
// Adaptive Advisor Roster Engine
// Returns the optimal advisor stack based on BusinessProfileResult
// Extends the static AdvisorRole type from advisor-topology.ts
// ═══════════════════════════════════════════════════════════════

import type { BusinessProfileResult, AdvisorSpec } from "@/lib/engines/business-profile-engine";

export interface AdaptiveAdvisor {
  id: string;
  name: string;
  specialty: string;
  accent: string;
  portraitSeed: number;
  affinityScore: number;
  domain: "business";
  archetype: string;
  capabilities: string[];
  personality: {
    tone: "analytical" | "supportive" | "strategic" | "operational" | "assertive";
    urgency: "calm" | "focused" | "urgent";
    style: "data-driven" | "relationship-first" | "action-oriented";
  };
}

const ADVISOR_CAPABILITIES: Record<string, string[]> = {
  conversion: ["funnel_analysis", "ab_testing_insights", "checkout_optimization", "conversion_forecasting"],
  "cart-recovery": ["abandonment_detection", "recovery_sequences", "discount_strategy", "timing_optimization"],
  retention: ["churn_prediction", "lifecycle_analysis", "win_back_campaigns", "loyalty_programs"],
  "customer-ltv": ["value_segmentation", "cross_sell", "upsell_identification", "cohort_analysis"],
  "lead-followup": ["lead_scoring", "follow_up_sequences", "response_timing", "engagement_tracking"],
  proposal: ["proposal_templates", "pricing_optimization", "close_rate_analysis", "negotiation_insights"],
  scheduling: ["capacity_planning", "booking_optimization", "availability_management", "conflict_detection"],
  "delivery-load": ["workload_forecasting", "deadline_tracking", "resource_allocation", "bottleneck_detection"],
  collections: ["payment_tracking", "reminder_sequences", "aging_analysis", "escalation_rules"],
  "local-ops": ["store_analytics", "daily_operations", "issue_tracking", "performance_benchmarking"],
  footfall: ["traffic_analysis", "peak_hour_detection", "conversion_tracking", "seasonal_patterns"],
  "staff-coverage": ["shift_optimization", "coverage_gaps", "demand_forecasting", "labor_cost_analysis"],
  "team-workload": ["task_distribution", "capacity_monitoring", "burnout_detection", "skill_matching"],
  assignment: ["smart_routing", "priority_scoring", "deadline_management", "skill_based_assignment"],
  handoff: ["transition_tracking", "information_continuity", "quality_checkpoints", "client_experience"],
  bottleneck: ["process_analysis", "dependency_mapping", "resolution_tracking", "impact_assessment"],
  "pipeline-advisor": ["deal_scoring", "stage_velocity", "win_probability", "pipeline_coverage"],
  "project-health": ["milestone_tracking", "budget_monitoring", "risk_scoring", "client_satisfaction"],
};

const ADVISOR_PERSONALITIES: Record<string, AdaptiveAdvisor["personality"]> = {
  conversion: { tone: "analytical", urgency: "focused", style: "data-driven" },
  "cart-recovery": { tone: "assertive", urgency: "urgent", style: "action-oriented" },
  retention: { tone: "supportive", urgency: "calm", style: "relationship-first" },
  "lead-followup": { tone: "assertive", urgency: "focused", style: "action-oriented" },
  proposal: { tone: "strategic", urgency: "focused", style: "data-driven" },
  scheduling: { tone: "operational", urgency: "calm", style: "action-oriented" },
  "delivery-load": { tone: "operational", urgency: "focused", style: "data-driven" },
  collections: { tone: "assertive", urgency: "urgent", style: "action-oriented" },
  "local-ops": { tone: "operational", urgency: "calm", style: "action-oriented" },
  "team-workload": { tone: "supportive", urgency: "focused", style: "data-driven" },
  "pipeline-advisor": { tone: "strategic", urgency: "focused", style: "data-driven" },
};

export function getAdaptiveAdvisorRoster(profile: BusinessProfileResult): AdaptiveAdvisor[] {
  return profile.advisors.map((spec: AdvisorSpec): AdaptiveAdvisor => ({
    ...spec,
    domain: "business",
    archetype: profile.primaryMode,
    capabilities: ADVISOR_CAPABILITIES[spec.id] || ["general_advisory"],
    personality: ADVISOR_PERSONALITIES[spec.id] || { tone: "analytical", urgency: "calm", style: "data-driven" },
  }));
}

export function getTopAdvisors(profile: BusinessProfileResult, count = 6): AdaptiveAdvisor[] {
  return getAdaptiveAdvisorRoster(profile).slice(0, count);
}
