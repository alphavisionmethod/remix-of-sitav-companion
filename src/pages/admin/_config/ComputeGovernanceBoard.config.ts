// ═══════════════════════════════════════════════════════════════
// ComputeGovernanceBoard — UI catalog (Wave 9.2)
//
// Authored compute-governance catalogs: budget envelopes, anomaly
// feed, routing decisions, deep job queue, tenant pressure, agent
// spend. Live signals come from useComputeBudgetStatus,
// useAISpendSummary, useModelRoutingStats, useMarginSnapshot.
// ═══════════════════════════════════════════════════════════════

import type { CostClass, ComputeModelTier, BudgetScope, BudgetStatus } from "@/lib/compute-governance";

export interface AnomalyEntry {
  id: string;
  type: "burn-spike" | "retry-storm" | "duplicate-action" | "stale-cache" | "context-bloat";
  severity: "critical" | "warning" | "info";
  desc: string;
  tenant: string;
  affectedAgents: string[];
  estimatedWaste: number;
  confidence: number;
  suggested: string;
  time: string;
}

export interface RoutingDecision {
  id: string;
  taskClass: CostClass;
  intent: string;
  selectedModel: string;
  selectedTier: ComputeModelTier;
  confidence: number;
  cost: number;
  downgraded: boolean;
  cached: boolean;
  downgradeReason?: string;
  time: string;
}

export interface AgentSpendRow {
  agentId: string;
  name: string;
  tier: ComputeModelTier;
  cost: number;
}

export interface TenantMargin {
  tenantId: string;
  name: string;
  plan: string;
  margin: number;
  deepUsed: number;
  deepCap: number;
}

export interface DeepJob {
  id: string;
  title: string;
  type: string;
  tenant: string;
  costClass: CostClass;
  estimatedCost: number;
  elapsedMin: number;
  approval: "auto" | "awaiting" | "approved";
  status: "queued" | "running" | "completed";
  quality: number | null;
}

/** Authored anomaly feed (CG09 + Overview anomaly lane). */
export const COMPUTE_ANOMALIES: AnomalyEntry[] = [
  { id: "a1", type: "burn-spike", severity: "critical", desc: "Acme Corp burn rate 4× baseline last 30m", tenant: "Acme Corp", affectedAgents: ["Strategy Advisor"], estimatedWaste: 1800, confidence: 94, suggested: "Auto-downgrade", time: "12m ago" },
  { id: "a2", type: "retry-storm", severity: "warning", desc: "Mission MX-318 retried 7 times before succeeding", tenant: "Globex", affectedAgents: ["Backend Engineer"], estimatedWaste: 480, confidence: 88, suggested: "Cap retries at 3", time: "1h ago" },
  { id: "a3", type: "duplicate-action", severity: "warning", desc: "Concierge agent ran identical booking simulation 4×", tenant: "Initech", affectedAgents: ["Concierge Advisor"], estimatedWaste: 320, confidence: 82, suggested: "Idempotency guard", time: "2h ago" },
  { id: "a4", type: "context-bloat", severity: "info", desc: "Strategy deep analysis context grew 3× last week", tenant: "Globex", affectedAgents: ["Strategy Advisor"], estimatedWaste: 720, confidence: 78, suggested: "Force compression", time: "1d ago" },
];

/** Authored routing decisions (CG02). */
export const COMPUTE_ROUTING_DECISIONS: RoutingDecision[] = [
  { id: "r1", taskClass: "A", intent: "Daily digest summary", selectedModel: "google/gemini-2.5-flash", selectedTier: "utility", confidence: 0.94, cost: 0.4, downgraded: false, cached: true, time: "3m ago" },
  { id: "r2", taskClass: "B", intent: "Finance variance review", selectedModel: "google/gemini-2.5-pro", selectedTier: "standard", confidence: 0.88, cost: 4.2, downgraded: false, cached: false, time: "12m ago" },
  { id: "r3", taskClass: "C", intent: "Architecture proposal synthesis", selectedModel: "openai/gpt-5", selectedTier: "premium", confidence: 0.91, cost: 18.6, downgraded: false, cached: false, time: "28m ago" },
  { id: "r4", taskClass: "B", intent: "Concierge booking continuity", selectedModel: "google/gemini-2.5-flash", selectedTier: "utility", confidence: 0.84, cost: 0.6, downgraded: true, cached: false, downgradeReason: "Tenant budget pressure", time: "44m ago" },
  { id: "r5", taskClass: "D", intent: "Investor narrative deep analysis", selectedModel: "openai/gpt-5", selectedTier: "premium", confidence: 0.96, cost: 42.1, downgraded: false, cached: false, time: "1h ago" },
];

/** Authored agent spend rows (CG01 — by agent). */
export const COMPUTE_AGENT_SPEND: AgentSpendRow[] = [
  { agentId: "ag-strategy", name: "Strategy Advisor", tier: "premium", cost: 1860 },
  { agentId: "ag-finance", name: "Finance Advisor", tier: "standard", cost: 1240 },
  { agentId: "ag-revenue", name: "Revenue Advisor", tier: "standard", cost: 880 },
  { agentId: "ag-concierge", name: "Concierge Advisor", tier: "utility", cost: 540 },
  { agentId: "ag-ops", name: "Operations Advisor", tier: "utility", cost: 420 },
];

/** Authored tenant pressure (CG07). */
export const COMPUTE_TENANT_PRESSURE: TenantMargin[] = [
  { tenantId: "t-acme", name: "Acme Corp", plan: "Business", margin: 58, deepUsed: 220, deepCap: 300 },
  { tenantId: "t-globex", name: "Globex", plan: "Professional", margin: 71, deepUsed: 180, deepCap: 300 },
  { tenantId: "t-initech", name: "Initech", plan: "Starter", margin: 64, deepUsed: 60, deepCap: 100 },
];

/** Authored deep-reasoning job queue (CG08). */
export const COMPUTE_DEEP_JOBS: DeepJob[] = [
  { id: "j1", title: "Quarterly investor narrative", type: "deep-analysis", tenant: "Acme Corp", costClass: "D", estimatedCost: 4200, elapsedMin: 12, approval: "approved", status: "running", quality: null },
  { id: "j2", title: "Architecture migration proposal", type: "synthesis", tenant: "Globex", costClass: "C", estimatedCost: 1860, elapsedMin: 0, approval: "awaiting", status: "queued", quality: null },
  { id: "j3", title: "Portfolio rebalance simulation", type: "simulation", tenant: "Initech", costClass: "C", estimatedCost: 920, elapsedMin: 22, approval: "approved", status: "completed", quality: 88 },
];

/**
 * Authored budget envelope baseline (CG03).
 * Local lightweight shape — the page only needs scope/label/spend/cap/retry/deep
 * counters for display. Live data overlays via useComputeBudgetStatus.
 */
export interface BudgetEnvelopeSummary {
  envelopeId: string;
  scope: BudgetScope;
  label: string;
  allocatedCents: number;
  spentCents: number;
  deepReasoningMinutesAllocated: number;
  deepReasoningMinutesUsed: number;
  retriesUsed: number;
  maxRetries: number;
  status: BudgetStatus;
}

export const COMPUTE_BUDGET_ENVELOPES: BudgetEnvelopeSummary[] = [
  { envelopeId: "env-acme-tenant", scope: "tenant", label: "Acme — Apr", allocatedCents: 32000, spentCents: 24800, deepReasoningMinutesAllocated: 300, deepReasoningMinutesUsed: 220, retriesUsed: 4, maxRetries: 12, status: "warning" },
  { envelopeId: "env-globex-tenant", scope: "tenant", label: "Globex — Apr", allocatedCents: 18000, spentCents: 9200, deepReasoningMinutesAllocated: 300, deepReasoningMinutesUsed: 180, retriesUsed: 2, maxRetries: 12, status: "healthy" },
  { envelopeId: "env-initech-tenant", scope: "tenant", label: "Initech — Apr", allocatedCents: 4000, spentCents: 1900, deepReasoningMinutesAllocated: 100, deepReasoningMinutesUsed: 60, retriesUsed: 0, maxRetries: 6, status: "healthy" },
  { envelopeId: "env-finance-ws", scope: "workspace", label: "Finance workspace", allocatedCents: 12000, spentCents: 5600, deepReasoningMinutesAllocated: 180, deepReasoningMinutesUsed: 90, retriesUsed: 1, maxRetries: 8, status: "healthy" },
  { envelopeId: "env-admin-ws", scope: "workspace", label: "Admin workspace", allocatedCents: 8000, spentCents: 1800, deepReasoningMinutesAllocated: 120, deepReasoningMinutesUsed: 28, retriesUsed: 0, maxRetries: 8, status: "healthy" },
  { envelopeId: "env-ops-mission", scope: "mission", label: "Connector resync mission", allocatedCents: 2000, spentCents: 1740, deepReasoningMinutesAllocated: 30, deepReasoningMinutesUsed: 22, retriesUsed: 7, maxRetries: 10, status: "warning" },
];