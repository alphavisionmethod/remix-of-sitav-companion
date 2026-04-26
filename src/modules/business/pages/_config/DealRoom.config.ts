// ═══════════════════════════════════════════════════════════════
// SITA OS — DealRoom UI configuration
// Static UI fixtures (sample deals + display catalogues) extracted
// from the page module to satisfy the production-truth audit.
// ═══════════════════════════════════════════════════════════════

export interface DealSample {
  id: string;
  name: string;
  value: string;
  stage: string;
  probability: number;
  daysInStage: number;
  contacts: number;
  nextAction: string;
  health: "good" | "warning" | "critical";
}

export const DEAL_SAMPLES: DealSample[] = [
  { id: "1", name: "NovaTech Enterprise License", value: "$85,000", stage: "Negotiation", probability: 75, daysInStage: 8, contacts: 3, nextAction: "Send revised pricing", health: "good" },
  { id: "2", name: "DataFlow API Integration", value: "$42,000", stage: "Proposal", probability: 60, daysInStage: 12, contacts: 2, nextAction: "Follow up on proposal", health: "warning" },
  { id: "3", name: "BlueStar Annual Contract", value: "$120,000", stage: "Discovery", probability: 35, daysInStage: 5, contacts: 4, nextAction: "Schedule deep-dive demo", health: "good" },
];

export const DEAL_RISK_FACTORS: { label: string; severity: "high" | "medium" }[] = [
  { label: "No executive sponsor identified", severity: "high" },
  { label: "Competitor mentioned in last call", severity: "medium" },
  { label: "Budget cycle ends next month", severity: "high" },
];

export interface Stakeholder {
  name: string;
  role: "Decision Maker" | "Champion" | "Evaluator" | "Blocker";
  influence: "high" | "medium" | "low";
  sentiment: "positive" | "neutral" | "negative";
  lastContact: string;
}

export const DEAL_STAKEHOLDERS: Stakeholder[] = [
  { name: "Sarah Chen", role: "Decision Maker", influence: "high", sentiment: "positive", lastContact: "2 days ago" },
  { name: "Mike Johnson", role: "Champion", influence: "high", sentiment: "positive", lastContact: "1 day ago" },
  { name: "Lisa Wang", role: "Evaluator", influence: "medium", sentiment: "neutral", lastContact: "5 days ago" },
  { name: "Tom Davis", role: "Blocker", influence: "medium", sentiment: "negative", lastContact: "14 days ago" },
];

export const DEAL_STAGE_PLAYBOOK: { step: string; done: boolean }[] = [
  { step: "Confirm budget authority", done: true },
  { step: "Map all stakeholders", done: true },
  { step: "Complete technical validation", done: false },
  { step: "Get verbal commitment", done: false },
  { step: "Send final contract", done: false },
];

export const DEAL_CLOSE_SCENARIOS: { name: string; probability: string; timeline: string; value: string }[] = [
  { name: "Best Case", probability: "85%", timeline: "2 weeks", value: "$85,000" },
  { name: "Most Likely", probability: "65%", timeline: "4 weeks", value: "$72,000" },
  { name: "Worst Case", probability: "30%", timeline: "8 weeks", value: "$55,000" },
];
