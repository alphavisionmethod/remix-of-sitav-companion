// ============================================================
// SITA OS — Advisor Grounding Contracts
// Per-advisor grounding requirements and output classification
// ============================================================

import type { AdvisorGroundingConfig, OutputClass } from "./types";

export const ADVISOR_CONTRACTS: Record<string, AdvisorGroundingConfig> = {
  money: {
    advisorId: "money",
    domain: "finance",
    requiredInputs: ["cash_flow", "bills", "subscriptions", "reserves"],
    optionalInputs: ["investments", "tax_calendar", "insurance"],
    confidenceThreshold: 0.7,
    blockedActionsWhenStale: ["execute_payment", "approve_transfer", "modify_reserve"],
    outputClass: "recommendation",
    refusalConditions: [
      "cash_flow data older than 4 hours",
      "missing balance verification",
      "contradictory obligation amounts",
    ],
  },
  business: {
    advisorId: "business",
    domain: "business",
    requiredInputs: ["leads", "invoices", "customers", "pipeline"],
    optionalInputs: ["quotes", "communications_log", "competitor_data"],
    confidenceThreshold: 0.65,
    blockedActionsWhenStale: ["send_proposal", "update_deal_state", "generate_invoice"],
    outputClass: "recommendation",
    refusalConditions: [
      "CRM data older than 24 hours",
      "missing lead state verification",
      "payment state contradictions",
    ],
  },
  concierge: {
    advisorId: "concierge",
    domain: "concierge",
    requiredInputs: ["tasks", "calendar", "routines"],
    optionalInputs: ["providers", "travel", "grocery_list", "school_calendar"],
    confidenceThreshold: 0.6,
    blockedActionsWhenStale: ["confirm_booking", "schedule_appointment", "modify_itinerary"],
    outputClass: "recommendation",
    refusalConditions: [
      "calendar data older than 12 hours",
      "booking status unverified",
      "provider availability unknown",
    ],
  },
  family: {
    advisorId: "family",
    domain: "concierge",
    requiredInputs: ["family_calendar", "school_events", "household_members"],
    optionalInputs: ["medical_appointments", "extracurriculars"],
    confidenceThreshold: 0.6,
    blockedActionsWhenStale: ["schedule_family_event", "modify_school_enrollment"],
    outputClass: "observation",
    refusalConditions: [
      "family calendar stale",
      "school data unverified",
    ],
  },
  growth: {
    advisorId: "growth",
    domain: "business",
    requiredInputs: ["pipeline", "customers", "revenue_trend"],
    optionalInputs: ["market_data", "competitor_intel"],
    confidenceThreshold: 0.55,
    blockedActionsWhenStale: ["launch_campaign", "adjust_pricing"],
    outputClass: "simulation",
    refusalConditions: [
      "revenue data older than 7 days",
      "pipeline data contradictions",
    ],
  },
  general: {
    advisorId: "general",
    domain: "all",
    requiredInputs: [],
    optionalInputs: ["all_domain_summaries"],
    confidenceThreshold: 0.5,
    blockedActionsWhenStale: [],
    outputClass: "observation",
    refusalConditions: [],
  },
};

export function getAdvisorContract(advisorId: string): AdvisorGroundingConfig {
  return ADVISOR_CONTRACTS[advisorId] || ADVISOR_CONTRACTS.general;
}

export function getOutputClassLabel(outputClass: OutputClass): string {
  const labels: Record<OutputClass, string> = {
    observation: "Observation",
    recommendation: "Recommendation",
    draft: "Draft",
    simulation: "Simulation",
    "approval-ready": "Approval Ready",
  };
  return labels[outputClass];
}

export function isActionBlocked(advisorId: string, action: string, isStale: boolean): boolean {
  if (!isStale) return false;
  const contract = getAdvisorContract(advisorId);
  return contract.blockedActionsWhenStale.includes(action);
}
