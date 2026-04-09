// SITA OS — Demo Data: Admin Platform

import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Ban,
  BookOpen,
  Bot,
  Brain,
  Bug,
  CheckCircle2,
  Clock,
  Code,
  Code2,
  Database,
  Eye,
  FileCheck,
  FileJson,
  FileText,
  Fingerprint,
  Gauge,
  GitBranch,
  Heart,
  KeyRound,
  Layers,
  Link,
  Lock,
  Mail,
  MessageSquare,
  Monitor,
  Palette,
  Plug,
  Rocket,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TestTube,
  TrendingUp,
  User,
  Users,
  Watch,
  Wrench,
  XCircle,
  Zap,
  type LucideIcon,
} from "lucide-react";

type ExportMode = "json" | "markdown" | "approval" | "pr-ready" | "investor";
type AutonomyLevel = "observe_only" | "draft_only" | "safe_auto_heal" | "approval_required" | "never_automate";
type RingStatus = "deployed" | "canary" | "staging" | "blocked" | "pending";
type GateStatus = "passed" | "failed" | "pending" | "skipped" | "blocked";
type PlanTier = "Starter" | "Professional" | "Business";
type ComputeModelTier = "utility" | "standard" | "premium" | "exceptional";
type CostClass = "A" | "B" | "C" | "D";
type ProviderDomain = "boardroom" | "investment" | "money" | "business" | "workspace" | "owner" | "calendar" | "advisor";
type IntelligenceAssetType =
  | "root-cause-analysis"
  | "investment-thesis"
  | "automation-playbook"
  | "website-diagnostic"
  | "issue-fingerprint"
  | "strategic-summary"
  | "decision-frame"
  | "pattern";
type OutcomeType =
  | "incident-prevented"
  | "bug-resolved"
  | "lead-recovered"
  | "self-heal-success"
  | "release-approved"
  | "strategic-recommendation-accepted"
  | "automation-completed"
  | "customer-retained";
type DomainId =
  | "admin-ops"
  | "engineering"
  | "revenue-business"
  | "digital-presence"
  | "investment-finance"
  | "concierge-household"
  | "connectors-integrations"
  | "launch-deployment"
  | "compliance-trust";
type HealthStatus = "healthy" | "warning" | "degraded" | "critical";
type DomainMigrationStatus = "real" | "demo_provider" | "mock_direct" | "mixed" | "blocked";
type LaunchMode = "not_launch_safe" | "internal_only" | "pilot_ready" | "private_beta_ready" | "public_launch_qualified" | "public_launch_ready";

interface AgentBoundary {
  agent: string;
  icon: LucideIcon;
  autonomy: AutonomyLevel;
  scope: string;
  lastOverride?: string;
}

interface MissionBoundary {
  missionType: string;
  defaultAutonomy: AutonomyLevel;
  overridable: boolean;
  rationale: string;
}

interface ChangeTypeBoundary {
  changeType: string;
  maxAutonomy: AutonomyLevel;
  requiresSimulation: boolean;
  requiresCanary: boolean;
  rationale: string;
}

interface DeploymentRing {
  name: string;
  status: RingStatus;
  version: string;
  deployedAt?: string;
  health: number;
  instances: number;
  errorRate: number;
}

interface PromotionGate {
  name: string;
  status: GateStatus;
  description: string;
  evidence?: string;
  checkedAt?: string;
  blocker?: boolean;
}

interface ReadModel {
  id: string;
  name: string;
  source: string;
  freshness: string;
  lagMs: number;
  lastRebuilt: string;
  affectedSurfaces: string[];
  eventToProjectionDelay: number;
  rebuildSuccess: boolean;
}

interface TruthClaim {
  id: string;
  capability: string;
  claimedStatus: string;
  runtimeEvidence: string;
  status: "verified" | "drift" | "unverified" | "stale";
  severity: "low" | "medium" | "high";
  lastChecked: string;
  remediation?: string;
}

interface Alert {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "active" | "acknowledged" | "suppressed" | "resolved";
  source: string;
  cluster?: string;
  timeToBreachMin?: number;
  runbookId?: string;
  assignee?: string;
  createdAt: string;
  likelyImpact: string;
}

interface VerificationCheck {
  label: string;
  check: (data: {
    registry: Record<string, any>[];
    accounts: Record<string, any>[];
    tokens: Record<string, any>[];
    receipts: Record<string, any>[];
    oauthConfig: Record<string, any> | null;
  }) => boolean;
}

// Re-export BudgetEnvelope from compute-governance for type consistency
import type { BudgetEnvelope, BudgetStatus } from "@/lib/compute-governance/budget-policy-engine";
export type { BudgetEnvelope };

const createEnvelope = (
  scope: "tenant" | "workspace" | "agent" | "mission" | "domain" | "environment",
  scopeId: string,
  tenantId: string,
  label: string,
  allocatedCents: number,
  deepReasoningMinutesAllocated: number,
): BudgetEnvelope => ({
  envelopeId: `env-${scopeId}`,
  scope,
  scopeId,
  tenantId,
  label,
  periodStart: new Date(Date.now() - 30 * 86400000).toISOString(),
  periodEnd: new Date(Date.now() + 1 * 86400000).toISOString(),
  allocatedCents,
  spentCents: 0,
  reservedCents: 0,
  remainingCents: allocatedCents,
  softLimitCents: Math.round(allocatedCents * 0.8),
  hardLimitCents: allocatedCents,
  deepReasoningMinutesAllocated,
  deepReasoningMinutesUsed: 0,
  premiumEscalationAllowanceCents: Math.round(allocatedCents * 0.1),
  premiumEscalationUsedCents: 0,
  proactiveInferenceBudgetCents: Math.round(allocatedCents * 0.25),
  proactiveInferenceSpentCents: 0,
  retryBudgetCents: Math.round(allocatedCents * 0.05),
  retrySpentCents: 0,
  maxRetries: 10,
  retriesUsed: 0,
  status: "healthy" as BudgetStatus,
  lastUpdated: new Date().toISOString(),
});

// ... keep existing code (lines 207-1490 unchanged)

export const DEMO_BUDGETS: BudgetEnvelope[] = [
  { ...createEnvelope("tenant", "t-1", "t-1", "Acme Corp — Monthly", 15000, 300), spentCents: 12400, remainingCents: 2600, deepReasoningMinutesUsed: 180, proactiveInferenceSpentCents: 3200, retrySpentCents: 420, retriesUsed: 6, status: "approaching" as BudgetStatus },
  { ...createEnvelope("workspace", "ws-1", "t-1", "Finance Workspace", 5000, 120), spentCents: 3800, remainingCents: 1200, deepReasoningMinutesUsed: 90, status: "warning" as BudgetStatus },
  { ...createEnvelope("agent", "a-1", "t-2", "Strategy Synthesizer", 2000, 60), spentCents: 960, remainingCents: 1040, deepReasoningMinutesUsed: 28, status: "healthy" as BudgetStatus },
  { ...createEnvelope("mission", "m-1", "t-1", "Q2 Tax Optimization", 800, 30), spentCents: 620, remainingCents: 180, deepReasoningMinutesUsed: 22, status: "warning" as BudgetStatus },
  { ...createEnvelope("domain", "d-1", "t-1", "Finance Domain", 8000, 200), spentCents: 5600, remainingCents: 2400, deepReasoningMinutesUsed: 120, status: "approaching" as BudgetStatus },
  { ...createEnvelope("environment", "e-1", "t-1", "Production Env", 12000, 250), spentCents: 8900, remainingCents: 3100, deepReasoningMinutesUsed: 160, status: "healthy" as BudgetStatus },
];

export const DEMO_ROUTING_EVENTS = [
  { id: "r1", taskClass: "B" as CostClass, intent: "Portfolio rebalance advice", selectedModel: "gemini-2.5-flash", selectedTier: "standard" as ComputeModelTier, confidence: 0.89, cost: 3.2, downgraded: false, cached: false, time: "1min ago" },
  { id: "r2", taskClass: "A" as CostClass, intent: "Inbox triage", selectedModel: "gemini-3-flash", selectedTier: "utility" as ComputeModelTier, confidence: 0.95, cost: 0.4, downgraded: false, cached: true, time: "2min ago" },
  { id: "r3", taskClass: "C" as CostClass, intent: "Strategic tax optimization", selectedModel: "gemini-2.5-pro", selectedTier: "premium" as ComputeModelTier, confidence: 0.72, cost: 12.8, downgraded: false, cached: false, time: "5min ago" },
  { id: "r4", taskClass: "C" as CostClass, intent: "Architecture deep analysis", selectedModel: "gemini-2.5-flash", selectedTier: "standard" as ComputeModelTier, confidence: 0.65, cost: 4.1, downgraded: true, cached: false, time: "8min ago", downgradeReason: "Budget pressure — soft limit 90%" },
  { id: "r5", taskClass: "D" as CostClass, intent: "Cross-domain simulation", selectedModel: "gpt-5", selectedTier: "exceptional" as ComputeModelTier, confidence: 0.91, cost: 48.0, downgraded: false, cached: false, time: "12min ago" },
];

export const DEMO_DEEP_JOBS = [
  { id: "dj1", type: "explicit-deep", title: "Q2 Tax Strategy Deep Analysis", status: "running", costClass: "C" as CostClass, estimatedCost: 1200, elapsedMin: 8, approval: "auto-approved", tenant: "Acme Corp", quality: null },
  { id: "dj2", type: "strategic-review", title: "Churn Prediction Multi-Advisor Synthesis", status: "queued", costClass: "D" as CostClass, estimatedCost: 3400, elapsedMin: 0, approval: "awaiting", tenant: "Acme Corp", quality: null },
  { id: "dj3", type: "premium-debate", title: "Market Entry Debate", status: "completed", costClass: "C" as CostClass, estimatedCost: 1800, elapsedMin: 22, approval: "approved", tenant: "Household Smith", quality: 87 },
  { id: "dj4", type: "async-compute", title: "Full Portfolio Risk Simulation", status: "running", costClass: "D" as CostClass, estimatedCost: 4200, elapsedMin: 35, approval: "auto-approved", tenant: "Acme Corp", quality: null },
];

export const DEMO_TASKS: ConciergeTask[] = [
  { id: "ct-1", title: "Book dentist appointment for Tuesday", domain: "task", state: "active", assignee: "Concierge Agent", lastUpdated: "2026-04-05T10:00:00Z", continuityBroken: false },
  { id: "ct-2", title: "Flight rebooking — SFO→JFK May 12", domain: "travel", state: "active", assignee: "Travel Agent", lastUpdated: "2026-04-05T09:30:00Z", continuityBroken: false },
  { id: "ct-3", title: "Grocery delivery coordination", domain: "household", state: "completed", assignee: "Household Agent", lastUpdated: "2026-04-04T18:00:00Z", continuityBroken: false, receiptRef: "rcpt-445" },
  { id: "ct-4", title: "Follow-up with insurance broker", domain: "promise", state: "broken", assignee: "Concierge Agent", lastUpdated: "2026-04-03T14:00:00Z", continuityBroken: true },
  { id: "ct-5", title: "Renew passport — expedited processing", domain: "task", state: "stale", assignee: "Concierge Agent", lastUpdated: "2026-04-01T10:00:00Z", continuityBroken: true },
];

export const DEMO_ADMIN_CONNECTORS: ConnectorStatus[] = [
  { id: "plaid", name: "Plaid Banking", type: "finance", status: "healthy", lastSyncAt: "15m ago", staleness: "fresh", errorRate: 0.1, syncCount24h: 48, credentialStatus: "valid", affectedDomains: ["finance", "cash-flow"], latencyMs: 245, dataFreshness: "Real-time" },
  { id: "stripe", name: "Stripe Payments", type: "payments", status: "healthy", lastSyncAt: "5m ago", staleness: "fresh", errorRate: 0, syncCount24h: 96, credentialStatus: "valid", affectedDomains: ["finance", "invoicing"], latencyMs: 120, dataFreshness: "Real-time" },
  { id: "google-cal", name: "Google Calendar", type: "calendar", status: "degraded", lastSyncAt: "2h ago", staleness: "warning", errorRate: 2.1, syncCount24h: 24, credentialStatus: "expiring", credentialExpiresIn: "3 days", affectedDomains: ["concierge", "scheduling"], latencyMs: 890, dataFreshness: "2h stale" },
  { id: "gmail", name: "Gmail", type: "email", status: "healthy", lastSyncAt: "10m ago", staleness: "fresh", errorRate: 0.3, syncCount24h: 72, credentialStatus: "valid", affectedDomains: ["communication", "crm"], latencyMs: 310, dataFreshness: "Near real-time" },
  { id: "crm-hub", name: "CRM Sync", type: "crm", status: "stale", lastSyncAt: "6h ago", staleness: "stale", errorRate: 5.2, syncCount24h: 8, credentialStatus: "valid", affectedDomains: ["sales", "pipeline"], latencyMs: 1200, dataFreshness: "6h stale" },
  { id: "accounting", name: "Accounting Platform", type: "accounting", status: "disconnected", lastSyncAt: "—", staleness: "critical", errorRate: 100, syncCount24h: 0, credentialStatus: "missing", affectedDomains: ["finance", "tax"], latencyMs: 0, dataFreshness: "No data" },
];

export const DEMO_FALLBACK_SYNC_HISTORY = [
  { connector: "Plaid Banking", time: "15m ago", status: "success", records: 24, duration: "1.2s" },
  { connector: "Stripe Payments", time: "5m ago", status: "success", records: 8, duration: "0.4s" },
  { connector: "Gmail", time: "10m ago", status: "success", records: 15, duration: "2.1s" },
  { connector: "Google Calendar", time: "2h ago", status: "partial", records: 6, duration: "3.8s" },
  { connector: "CRM Sync", time: "6h ago", status: "failed", records: 0, duration: "12s" },
];

export const DEMO_POLICIES = [
  { connector: "plaid", maxStaleness: "1 hour", syncInterval: "30 min", retryPolicy: "3 attempts, exponential backoff", affectedFields: ["account-balances", "transaction-records"] },
  { connector: "stripe", maxStaleness: "30 min", syncInterval: "15 min", retryPolicy: "5 attempts, linear", affectedFields: ["payment-confirmations", "invoice-records"] },
  { connector: "google-cal", maxStaleness: "30 min", syncInterval: "30 min", retryPolicy: "3 attempts, exponential", affectedFields: ["calendar-events"] },
  { connector: "gmail", maxStaleness: "15 min", syncInterval: "15 min", retryPolicy: "3 attempts, exponential", affectedFields: ["email-content"] },
  { connector: "crm-hub", maxStaleness: "2 hours", syncInterval: "1 hour", retryPolicy: "3 attempts, linear", affectedFields: ["customer-records", "deal-records"] },
];

export const DEMO_ADMIN_SERVICES: ServiceMigration[] = [
  { name: "EventBus", currentBacking: "hybrid", targetBacking: "os_event_log", phase: "complete", blockers: [], continuityGain: "Events survive refresh, replay possible", tables: ["os_event_log"] },
  { name: "MemoryService", currentBacking: "hybrid", targetBacking: "os_memory_scoped", phase: "complete", blockers: [], continuityGain: "Scoped memory survives sessions, hydration on boot", tables: ["os_memory_scoped"] },
  { name: "PolicyEngine", currentBacking: "hybrid", targetBacking: "os_policy_evaluations", phase: "complete", blockers: [], continuityGain: "Policy decisions inspectable, audit trail", tables: ["os_policy_evaluations"] },
  { name: "ActionStateMachine", currentBacking: "hybrid", targetBacking: "os_action_lineage", phase: "complete", blockers: [], continuityGain: "Canonical 16-state lifecycle, full lineage", tables: ["os_action_lineage"] },
  { name: "Intelligence Assets", currentBacking: "durable", targetBacking: "intelligence_assets_library", phase: "complete", blockers: [], continuityGain: "Reusable artifacts across sessions", tables: ["intelligence_assets_library"] },
  { name: "Quality Floor Engine", currentBacking: "durable", targetBacking: "quality_floor_configs", phase: "complete", blockers: [], continuityGain: "Quality rules persist", tables: ["quality_floor_configs"] },
  { name: "Compute Governance", currentBacking: "durable", targetBacking: "compute_budget_snapshots", phase: "complete", blockers: [], continuityGain: "Budget snapshots durable", tables: ["compute_budget_snapshots"] },
  { name: "Operator Taste Memory", currentBacking: "durable", targetBacking: "operator_taste_profiles", phase: "complete", blockers: [], continuityGain: "Operator preferences persist", tables: ["operator_taste_profiles"] },
  { name: "Receipts/Proofs", currentBacking: "durable", targetBacking: "sita_receipts/sita_proofs", phase: "complete", blockers: [], continuityGain: "Proof linkage complete", tables: ["sita_receipts", "sita_proofs"] },
  { name: "Advisor Orchestration", currentBacking: "hybrid", targetBacking: "engine_state", phase: "wired", blockers: ["Consumer offset tracking"], continuityGain: "Advisor state survives refresh", tables: ["engine_state"] },
  { name: "Digital Twin Engine", currentBacking: "hybrid", targetBacking: "engine_state", phase: "wired", blockers: [], continuityGain: "Twin projections persist", tables: ["engine_state"] },
  { name: "Entity Role Graph", currentBacking: "hybrid", targetBacking: "engine_state", phase: "adapter-built", blockers: ["Needs graph serialization"], continuityGain: "Role graph survives sessions", tables: ["engine_state"] },
];

export const DEMO_PHASE_ORDER = ["not-started", "adapter-built", "wired", "validated", "complete"];

export const DEMO_ADMIN_ALL_DOMAINS: ProviderDomain[] = ["boardroom", "investment", "money", "business", "workspace", "owner", "calendar", "advisor"];

export const DEMO_ADMIN_ALL_DOMAINS_D_R_S10_DUAL_REALITY_LAUNCH_GATE: ProviderDomain[] = ["boardroom", "investment", "money", "business", "workspace", "owner", "calendar", "advisor"];

export const DEMO_ADMIN_DOMAINS: DomainReality[] = [
  {
    domain: "Investment Office",
    overallReadiness: 72,
    features: [
      { feature: "Portfolio Overview", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["asset_master", "asset_market_snapshots"] },
      { feature: "Holdings", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["asset_master"] },
      { feature: "Capital Buckets", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["capital_purpose_buckets"] },
      { feature: "Watchlists", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Theses", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Market Explorer", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: ["asset_master"] },
      { feature: "Strategy Studio", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Execution Desk", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
    ],
  },
  {
    domain: "Boardroom",
    overallReadiness: 65,
    features: [
      { feature: "Daily Pulse", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["os_event_log"] },
      { feature: "Weekly Boardroom", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Advisor Synthesis", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: ["advisor_responses"] },
      { feature: "Action Queue", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["approval_queue"] },
    ],
  },
  {
    domain: "Business CRM",
    overallReadiness: 78,
    features: [
      { feature: "Customer List", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["customers"] },
      { feature: "Deals Pipeline", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["deals"] },
      { feature: "Collections", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Revenue Autopilot", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["invoices"] },
    ],
  },
  {
    domain: "Money Office",
    overallReadiness: 70,
    features: [
      { feature: "Reserves & Savings", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["capital_allocations"] },
      { feature: "Bills", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["bills"] },
      { feature: "Safe to Spend", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
    ],
  },
  {
    domain: "Workspace",
    overallReadiness: 45,
    features: [
      { feature: "Documents", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["file_metadata"] },
      { feature: "Sheets", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Slides", readPath: "demo", writePath: "none", emptyState: true, loadingState: true, errorState: false, tables: [] },
    ],
  },
  {
    domain: "Owner Center",
    overallReadiness: 68,
    features: [
      { feature: "Approvals", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["approval_queue"] },
      { feature: "Pricing Editor", readPath: "demo", writePath: "simulated", emptyState: true, loadingState: true, errorState: false, tables: [] },
      { feature: "Leases", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["deals"] },
    ],
  },
  {
    domain: "Calendar / Activity",
    overallReadiness: 65,
    features: [
      { feature: "Calendar", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["events"] },
      { feature: "Activity Timeline", readPath: "real", writePath: "none", emptyState: true, loadingState: true, errorState: true, tables: ["audit_logs"] },
      { feature: "Inbox", readPath: "real", writePath: "real", emptyState: true, loadingState: true, errorState: true, tables: ["notifications_queue"] },
    ],
  },
];

export const DEMO_ADMIN_ARCHETYPES = [
  "boardroom","office","simulator","workflow","onboarding","crud",
  "action-center","dashboard","detail-view","connector-flow",
  "intelligence","proof-evidence","admin-control","timeline","settings",
];

export const DEMO_ADMIN_STATUSES = ["pending", "under_review", "approved", "rejected", "returned_for_revision", "deferred", "queued_for_execution", "executed", "expired"];

export const DEMO_RISK_TIERS = ["low", "medium", "high", "critical"];

export const DEMO_RECOMMENDATION_TYPES = ["recommendation", "proposed_policy_change", "proposed_config_change", "proposed_remediation", "proposed_launch_decision", "proposed_followup_task"];

export const DEMO_ADMIN_DOMAINS_H_Q_APPROVAL_QUEUE = ["architecture", "runtime-truth", "connectors", "ai-governance", "launch-readiness", "budget", "data-schema", "device-surface", "quality-ci", "incidents"];

export const DEMO_PRINCIPLES = [
  "Every signal type requires explicit opt-in",
  "Routing influence requires separate consent from ingestion",
  "Boardroom visibility requires explicit signal-level approval",
  "Assistant use requires separate consent from boardroom",
  "Revoke & erase available at any time — immediate effect",
  "Privacy explanation mandatory before consent grant",
  "No signal data shared with third parties",
  "Consent state version-controlled and auditable",
  "Granular per-signal, per-scope control",
  "Derived data inherits strictest consent of its inputs",
];

export const DEMO_ADMIN_PIPELINE_STAGES = [
  { stage: 1, name: "Raw Signals", desc: "heart_rate, sleep, steps, hrv, workout, focus_mode", color: "bg-blue-500/10", examples: ["72 bpm", "7.2h sleep", "8,500 steps"] },
  { stage: 2, name: "Normalized States", desc: "activity, sleep_quality, strain, recovery, focus", color: "bg-green-500/10", examples: ["activity: moderate", "sleep: good", "strain: high"] },
  { stage: 3, name: "Readiness Level", desc: "high, medium, low, overload_risk, deep_focus", color: "bg-amber-500/10", examples: ["readiness: medium", "context: post-workout"] },
  { stage: 4, name: "Interruption Posture", desc: "open, selective, restricted, silent", color: "bg-purple-500/10", examples: ["posture: selective", "override: emergency-only"] },
];

export const DEMO_COMBINE_STRATEGIES = [
  { name: "worst_case", desc: "If any signal indicates low readiness, overall is low", use: "Default for health-sensitive decisions" },
  { name: "highest_priority", desc: "Highest-priority rule wins regardless of others", use: "Override scenarios (emergency, DND)" },
  { name: "weighted_average", desc: "Confidence-weighted combination of all signals", use: "Normal ambient assessment" },
  { name: "user_override", desc: "User manually sets readiness state", use: "Always takes precedence" },
];

export const DEMO_USE_CASES: UseCase[] = [
  {
    id: "uc-1", title: "Lead Recovery & Nurture", description: "Automatically capture, score, and nurture leads across channels",
    connectors: [{ name: "Email (Resend)", status: "connected" }, { name: "CRM", status: "available" }, { name: "Analytics", status: "required" }],
    workflows: ["Lead scoring pipeline", "Nurture email sequence", "CRM sync"],
    riskLevel: "low", readiness: 65,
  },
  {
    id: "uc-2", title: "Incident Alerting to Slack", description: "Route critical incidents to Slack channels in real-time",
    connectors: [{ name: "Slack", status: "available" }, { name: "Incident Monitor", status: "connected" }],
    workflows: ["Incident → Slack notification", "Escalation routing"],
    riskLevel: "low", readiness: 40,
  },
  {
    id: "uc-3", title: "Investor Evidence Bundles", description: "Auto-generate compliance and proof bundles for investors",
    connectors: [{ name: "Storage", status: "connected" }, { name: "Audit Service", status: "connected" }],
    workflows: ["Evidence collection", "Bundle generation", "Export pipeline"],
    riskLevel: "medium", readiness: 80,
  },
  {
    id: "uc-4", title: "Booking + CRM + Reminders", description: "Unified booking flow with CRM sync and automated reminders",
    connectors: [{ name: "Calendar", status: "required" }, { name: "CRM", status: "available" }, { name: "Email (Resend)", status: "connected" }],
    workflows: ["Booking creation", "CRM contact sync", "Reminder sequence"],
    riskLevel: "low", readiness: 30,
  },
];

export const DEMO_ADMIN_ASSETS: Array<{ id: string; type: IntelligenceAssetType; domain: string; title: string; usageCount: number; qualityScore: number; acceptanceRate: number; status: string; freshness: string; savings: number }> = [
  { id: "ia-1", type: "root-cause-analysis", domain: "engineering", title: "Memory leak in portfolio renderer", usageCount: 12, qualityScore: 92, acceptanceRate: 0.95, status: "active", freshness: "2hr", savings: 540 },
  { id: "ia-2", type: "investment-thesis", domain: "investment-finance", title: "Tech sector rotation thesis Q2", usageCount: 8, qualityScore: 88, acceptanceRate: 0.88, status: "active", freshness: "6hr", savings: 960 },
  { id: "ia-3", type: "automation-playbook", domain: "revenue-business", title: "Lead follow-up sequence playbook", usageCount: 24, qualityScore: 85, acceptanceRate: 0.92, status: "active", freshness: "1d", savings: 1080 },
  { id: "ia-4", type: "website-diagnostic", domain: "digital-presence", title: "Homepage conversion bottleneck", usageCount: 6, qualityScore: 78, acceptanceRate: 0.83, status: "active", freshness: "4hr", savings: 420 },
  { id: "ia-5", type: "issue-fingerprint", domain: "engineering", title: "API timeout pattern — payment service", usageCount: 18, qualityScore: 94, acceptanceRate: 0.97, status: "active", freshness: "30min", savings: 810 },
  { id: "ia-6", type: "strategic-summary", domain: "admin-ops", title: "Q2 operational priorities synthesis", usageCount: 5, qualityScore: 82, acceptanceRate: 0.80, status: "stale", freshness: "3d", savings: 450 },
  { id: "ia-7", type: "decision-frame", domain: "compliance-trust", title: "Data residency decision framework", usageCount: 3, qualityScore: 90, acceptanceRate: 1.0, status: "active", freshness: "12hr", savings: 360 },
  { id: "ia-8", type: "pattern", domain: "engineering", title: "Common N+1 query regression pattern", usageCount: 31, qualityScore: 96, acceptanceRate: 0.98, status: "active", freshness: "1hr", savings: 1400 },
];

export const DEMO_DIFFERENTIALS = [
  { id: "da-1", domain: "investment-finance", materiality: 22, action: "reuse-as-is" as const, costFull: 120, costPartial: 35, costReuse: 5, deltas: 2, confidence: 92, desc: "Portfolio state — minor price fluctuation" },
  { id: "da-2", domain: "engineering", materiality: 68, action: "partial-update" as const, costFull: 120, costPartial: 35, costReuse: 5, deltas: 5, confidence: 65, desc: "Build pipeline — new dependency added" },
  { id: "da-3", domain: "revenue-business", materiality: 12, action: "reuse-as-is" as const, costFull: 80, costPartial: 25, costReuse: 3, deltas: 1, confidence: 96, desc: "CRM state — one lead status change" },
  { id: "da-4", domain: "digital-presence", materiality: 85, action: "full-reanalysis" as const, costFull: 150, costPartial: 45, costReuse: 5, deltas: 8, confidence: 38, desc: "Website structure — major layout change detected" },
  { id: "da-5", domain: "compliance-trust", materiality: 5, action: "reuse-as-is" as const, costFull: 100, costPartial: 30, costReuse: 4, deltas: 0, confidence: 98, desc: "Trust policy — no changes" },
];

export const DEMO_EFFICIENCY: Array<{ id: string; name: string; type: EfficiencyScore["entityType"]; composite: number; quality: number; costEff: number; acceptance: number; override: number; reuse: number; trend: string }> = [
  { id: "e-1", name: "Finance Advisor", type: "agent", composite: 82, quality: 88, costEff: 76, acceptance: 0.92, override: 0.08, reuse: 0.45, trend: "improving" },
  { id: "e-2", name: "Self-Healing Agent", type: "agent", composite: 78, quality: 90, costEff: 82, acceptance: 0.95, override: 0.05, reuse: 0.62, trend: "stable" },
  { id: "e-3", name: "Strategy Synthesizer", type: "agent", composite: 71, quality: 85, costEff: 52, acceptance: 0.78, override: 0.22, reuse: 0.28, trend: "degrading" },
  { id: "e-4", name: "Growth Agent", type: "agent", composite: 74, quality: 80, costEff: 68, acceptance: 0.85, override: 0.15, reuse: 0.35, trend: "stable" },
  { id: "e-5", name: "Monitor Agent", type: "agent", composite: 91, quality: 92, costEff: 95, acceptance: 0.98, override: 0.02, reuse: 0.72, trend: "improving" },
];

export const DEMO_ADMIN_OUTCOMES_INTELLIGENCE_EFFICIENCY_BOARD: Array<{ type: OutcomeType; count: number; costCents: number; valueCents: number; roi: number }> = [
  { type: "incident-prevented", count: 8, costCents: 2400, valueCents: 48000, roi: 20.0 },
  { type: "bug-resolved", count: 14, costCents: 4200, valueCents: 28000, roi: 6.7 },
  { type: "lead-recovered", count: 6, costCents: 1800, valueCents: 18000, roi: 10.0 },
  { type: "self-heal-success", count: 22, costCents: 1100, valueCents: 22000, roi: 20.0 },
  { type: "release-approved", count: 4, costCents: 3200, valueCents: 16000, roi: 5.0 },
  { type: "strategic-recommendation-accepted", count: 3, costCents: 4800, valueCents: 36000, roi: 7.5 },
  { type: "automation-completed", count: 18, costCents: 900, valueCents: 9000, roi: 10.0 },
  { type: "customer-retained", count: 2, costCents: 1600, valueCents: 24000, roi: 15.0 },
];

export const DEMO_ADMIN_PACKETS: Array<{ domain: DomainId; tokenCount: number; compressionRatio: number; fresh: boolean; changes: number; risks: number; confidence: number; compiledAgo: string }> = [
  { domain: "admin-ops", tokenCount: 1200, compressionRatio: 0.12, fresh: true, changes: 3, risks: 1, confidence: 82, compiledAgo: "15min" },
  { domain: "engineering", tokenCount: 1800, compressionRatio: 0.15, fresh: true, changes: 5, risks: 2, confidence: 76, compiledAgo: "8min" },
  { domain: "revenue-business", tokenCount: 1400, compressionRatio: 0.11, fresh: true, changes: 2, risks: 0, confidence: 89, compiledAgo: "22min" },
  { domain: "digital-presence", tokenCount: 2100, compressionRatio: 0.18, fresh: false, changes: 8, risks: 3, confidence: 58, compiledAgo: "2hr" },
  { domain: "investment-finance", tokenCount: 1600, compressionRatio: 0.14, fresh: true, changes: 4, risks: 1, confidence: 84, compiledAgo: "12min" },
  { domain: "concierge-household", tokenCount: 900, compressionRatio: 0.08, fresh: true, changes: 1, risks: 0, confidence: 94, compiledAgo: "45min" },
  { domain: "connectors-integrations", tokenCount: 1100, compressionRatio: 0.10, fresh: true, changes: 2, risks: 1, confidence: 80, compiledAgo: "30min" },
  { domain: "launch-deployment", tokenCount: 1500, compressionRatio: 0.13, fresh: true, changes: 3, risks: 2, confidence: 72, compiledAgo: "18min" },
  { domain: "compliance-trust", tokenCount: 1300, compressionRatio: 0.12, fresh: true, changes: 0, risks: 0, confidence: 96, compiledAgo: "1hr" },
];

export const DEMO_CROSS_TENANT_PATTERNS = [
  { type: "issue-signature", desc: "API timeout cascade after deploy", freq: 42, conf: 94, tenants: 18 },
  { type: "crm-leakage", desc: "Leads going cold after 48hr without follow-up", freq: 67, conf: 88, tenants: 31 },
  { type: "deployment-failure", desc: "Migration timeout on large tables", freq: 23, conf: 91, tenants: 12 },
  { type: "self-heal-outcome", desc: "Cache flush resolves 80% of 5xx spikes", freq: 89, conf: 96, tenants: 45 },
  { type: "low-value-loop", desc: "Repeated SEO audit with no content changes", freq: 34, conf: 82, tenants: 22 },
];

export const DEMO_PROOF_ENTRIES: ProofEntry[] = [
  {
    id: "pf-1", action: "Policy: Enable auto-approval for low-risk connectors", actor: "admin@sita.os", timestamp: "2026-04-05T10:20:00Z",
    proofChain: [{ step: "Trigger", status: "verified" }, { step: "Policy Eval", status: "verified" }, { step: "Approval", status: "verified" }, { step: "Execution", status: "verified" }, { step: "Receipt", status: "verified" }],
    rollbackEvidence: true, approvalContext: true, exportable: true,
  },
  {
    id: "pf-2", action: "Migration: Schema v42 applied to production", actor: "deploy-pipeline", timestamp: "2026-04-05T08:00:00Z",
    proofChain: [{ step: "Trigger", status: "verified" }, { step: "Policy Eval", status: "verified" }, { step: "Approval", status: "verified" }, { step: "Execution", status: "verified" }, { step: "Receipt", status: "pending" }],
    rollbackEvidence: true, approvalContext: true, exportable: true,
  },
  {
    id: "pf-3", action: "User role change: user-18 → admin", actor: "admin@sita.os", timestamp: "2026-04-05T09:45:00Z",
    proofChain: [{ step: "Trigger", status: "verified" }, { step: "Policy Eval", status: "verified" }, { step: "Approval", status: "missing" }, { step: "Execution", status: "verified" }, { step: "Receipt", status: "verified" }],
    rollbackEvidence: true, approvalContext: false, exportable: true,
  },
];

export const DEMO_BLOCKERS: LaunchBlocker[] = [
  {
    id: "BLK-001", title: "Canary error rate above threshold", severity: "critical", status: "open", domain: "deployment", owner: "Platform Team",
    description: "Canary ring showing 0.8% error rate — needs to be below 0.5% for 2h before promotion.",
    evidenceMissing: ["2h clean canary window"], unblockSteps: ["Wait for canary stabilization", "Investigate error source", "Re-deploy if needed"],
    ringImpact: ["Production Ring 1", "Production Ring 2"], createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "BLK-002", title: "Manual approval not yet obtained", severity: "high", status: "open", domain: "governance", owner: "Owner",
    description: "Operator sign-off required for production promotion. No approval on record.",
    evidenceMissing: ["Operator approval receipt"], unblockSteps: ["Review deployment diff", "Sign off in approval queue"],
    ringImpact: ["Production Ring 1"], createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "BLK-003", title: "Accounting connector not connected", severity: "medium", status: "accepted-risk", domain: "connectors", owner: "Owner",
    description: "Accounting platform connector not set up. Tax and financial reporting features degraded.",
    ringImpact: ["All rings"], createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: "BLK-004", title: "Performance regression in advisor latency", severity: "low", status: "in-progress", domain: "performance", owner: "AI Team",
    description: "P95 advisor response time increased from 2.1s to 3.8s after model update.",
    unblockSteps: ["Profile latency source", "Consider model swap", "Add caching layer"],
    ringImpact: ["Staging", "Canary"], createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

export const DEMO_ADMIN_READINESS_CHECKS: ReadinessCheck[] = [
  {
    category: "Security", checks: [
      { name: "RLS policies on all tables", status: "pass", detail: "48/48 tables covered" },
      { name: "Auth flow tested", status: "pass", detail: "Email + Google OAuth verified" },
      { name: "Secrets encrypted at rest", status: "pass", detail: "vault integration active" },
      { name: "CORS configuration", status: "pass", detail: "Restricted to known origins" },
      { name: "Rate limiting", status: "warning", detail: "Edge function rate limiting basic" },
    ],
  },
  {
    category: "Data Integrity", checks: [
      { name: "Database backups", status: "pass", detail: "Point-in-time recovery enabled" },
      { name: "Migration history clean", status: "pass", detail: "All migrations applied" },
      { name: "Foreign key integrity", status: "pass", detail: "No orphaned references" },
      { name: "Audit log coverage", status: "pass", detail: "All sensitive tables audited" },
    ],
  },
  {
    category: "Performance", checks: [
      { name: "Bundle size budget", status: "pass", detail: "412KB < 500KB limit" },
      { name: "LCP target", status: "pass", detail: "1.2s < 2.5s target" },
      { name: "API response times", status: "warning", detail: "P95 at 3.8s (target: 2s)" },
      { name: "Database query performance", status: "pass", detail: "No slow queries detected" },
    ],
  },
  {
    category: "Observability", checks: [
      { name: "Error tracking", status: "pass", detail: "Incident auto-creation active" },
      { name: "Telemetry collection", status: "pass", detail: "Agent metrics flowing" },
      { name: "Health endpoints", status: "warning", detail: "12/18 services have health checks" },
      { name: "Alert rules configured", status: "pass", detail: "Critical alerts active" },
    ],
  },
  {
    category: "Business Readiness", checks: [
      { name: "Core workflows tested", status: "pass", detail: "CRM, invoicing, scheduling verified" },
      { name: "Onboarding flow complete", status: "pass", detail: "First-use experience built" },
      { name: "Payment processing", status: "skip", detail: "Not yet in scope" },
      { name: "Email delivery", status: "pass", detail: "Transactional emails configured" },
    ],
  },
];

export const DEMO_ADMIN_SCOPES_MEMORY_CONTINUITY_CENTER = ["private", "workspace", "household", "domain", "operator", "agent", "system", "session", "decision"] as const;

export const DEMO_PRIVACY_TIERS = ["public", "internal", "confidential", "restricted"] as const;

export const DEMO_ADMIN_SERVICES_MISSION_CONTROL_HOME = [
  { name: "Brain Core", status: "healthy" as HealthStatus, latency: 12, uptime: 99.99 },
  { name: "Approval Engine", status: "healthy" as HealthStatus, latency: 18, uptime: 99.97 },
  { name: "Workflow Engine", status: "warning" as HealthStatus, latency: 45, uptime: 99.91 },
  { name: "Projection Service", status: "healthy" as HealthStatus, latency: 8, uptime: 99.99 },
  { name: "Connector Gateway", status: "degraded" as HealthStatus, latency: 120, uptime: 99.4 },
  { name: "Event Bus", status: "healthy" as HealthStatus, latency: 3, uptime: 100 },
  { name: "Notification Center", status: "healthy" as HealthStatus, latency: 15, uptime: 99.98 },
  { name: "Admin Service", status: "healthy" as HealthStatus, latency: 10, uptime: 99.99 },
];

export const DEMO_URGENT_ACTIONS = [
  { id: "1", title: "Connector degradation — Slack sync stale >15m", severity: "high", route: "/admin/connectors" },
  { id: "2", title: "Workflow engine latency spike (p99 >200ms)", severity: "medium", route: "/admin/incidents" },
  { id: "3", title: "2 pending approval requests >1h", severity: "low", route: "/admin/dashboard" },
];

export const DEMO_DOMAIN_MIGRATIONS: DomainMigration[] = [
  { domain: "Investment Office", status: "demo_provider", totalPages: 22, migratedPages: 22, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "critical" },
  { domain: "Boardroom", status: "demo_provider", totalPages: 1, migratedPages: 1, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "critical" },
  { domain: "Business CRM", status: "demo_provider", totalPages: 4, migratedPages: 4, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "high" },
  { domain: "Workspace", status: "demo_provider", totalPages: 3, migratedPages: 3, realProviderReady: true, demoProviderReady: true, tablesExist: false, blockers: ["No workspace content tables"], priority: "medium" },
  { domain: "Owner Center", status: "demo_provider", totalPages: 3, migratedPages: 3, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "high" },
  { domain: "Money Office", status: "demo_provider", totalPages: 2, migratedPages: 2, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "critical" },
  { domain: "Calendar / Activity", status: "demo_provider", totalPages: 2, migratedPages: 2, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "medium" },
  { domain: "Revenue Engine", status: "demo_provider", totalPages: 2, migratedPages: 2, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "high" },
  { domain: "Mission Control", status: "demo_provider", totalPages: 1, migratedPages: 1, realProviderReady: true, demoProviderReady: true, tablesExist: true, blockers: [], priority: "medium" },
  { domain: "Admin / Diagnostics", status: "mixed", totalPages: 5, migratedPages: 3, realProviderReady: true, demoProviderReady: false, tablesExist: true, blockers: ["Admin data services partially converted"], priority: "low" },
];

export const DEMO_MOCK_TYPES = ["hardcoded", "local_array", "localstorage", "in_memory_engine", "pure_function", "demo_flow"] as const;

export const DEMO_ADMIN_STATUSES_MOCK_REPLACEMENT_PROGRAM = ["identified", "planned", "in_progress", "blocked", "completed", "validated"] as const;

export const DEMO_PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const DEMO_ADMIN_CORE_SERVICES: ServiceStatus[] = [
  {
    name: "EventBus",
    icon: <Layers className="h-4 w-4" />,
    adapter: "event-bus-persistence.ts",
    table: "os_event_log",
    wired: true,
    description: "Durable event emission, dead-letter persistence, replay from storage",
  },
  {
    name: "MemoryService",
    icon: <Database className="h-4 w-4" />,
    adapter: "memory-service-persistence.ts",
    table: "os_memory_scoped",
    wired: true,
    description: "Scoped memory with privacy tiers, supersession, forget audit, hydration",
  },
  {
    name: "PolicyEngine",
    icon: <Shield className="h-4 w-4" />,
    adapter: "policy-engine-persistence.ts",
    table: "os_policy_evaluations",
    wired: true,
    description: "Meaningful policy evaluations (deny/approval/simulation) durably recorded",
  },
  {
    name: "ReceiptService",
    icon: <FileCheck className="h-4 w-4" />,
    adapter: "supabase-adapters.ts",
    table: "sita_receipts",
    wired: true,
    description: "Hash-chained receipts with durable persistence and hydration",
  },
  {
    name: "Action Lineage",
    icon: <GitBranch className="h-4 w-4" />,
    adapter: "action-lineage-persistence.ts",
    table: "os_action_lineage",
    wired: true,
    description: "16-state action lifecycle with cross-linked events/receipts/policies",
  },
];

export const DEMO_DRAFTS: PolicyDraft[] = [
  { id: "POL-001", name: "Auto-approve low-risk invoices under $100", description: "Skip manual approval for invoices below threshold from trusted vendors", rule: "IF invoice.amount < 100 AND vendor.trust_score >= 80 THEN auto_approve", status: "simulated", affectedSystems: ["approval_queue", "payment_engine", "audit_log"], affectedUsers: 12, riskLevel: "low", approvalPath: ["Owner", "Finance Advisor"], createdAt: "2h ago" },
  { id: "POL-002", name: "Require 2FA for all admin mutations", description: "Enforce multi-factor authentication for any admin-level data change", rule: "IF actor.role == 'admin' AND action.type == 'mutation' THEN require_2fa", status: "draft", affectedSystems: ["auth_service", "admin_service", "audit_log"], affectedUsers: 3, riskLevel: "medium", approvalPath: ["Owner", "Security Council"], createdAt: "1d ago" },
  { id: "POL-003", name: "Rate limit AI advisor to 500 calls/day", description: "Prevent cost overruns by capping daily advisor invocations", rule: "IF advisor.daily_calls >= 500 THEN throttle_to_queue", status: "active", affectedSystems: ["advisor_router", "cost_ledger", "notification_queue"], affectedUsers: 1, riskLevel: "low", approvalPath: ["Owner"], createdAt: "5d ago" },
  { id: "POL-004", name: "Block external data export without approval", description: "Require explicit approval for any data export to external systems", rule: "IF action.type == 'export' AND target.scope == 'external' THEN require_approval", status: "draft", affectedSystems: ["export_engine", "approval_queue", "audit_log"], affectedUsers: 8, riskLevel: "high", approvalPath: ["Owner", "Security Council", "Data Protection"], createdAt: "3h ago" },
];

export const DEMO_PROOFS: ProofRecord[] = [
  { id: "PR-001", type: "approval", action: "Invoice #1042 approved for payment", actor: "owner", timestamp: new Date(Date.now() - 3600000).toISOString(), verified: true, receiptId: "REC-A001", evidenceCount: 3, chain: ["approval_queue", "payment_engine", "audit_log"], domain: "finance", finality: "committed", rollbackEligible: true },
  { id: "PR-002", type: "action", action: "Connector re-auth: Google Calendar", actor: "system", timestamp: new Date(Date.now() - 7200000).toISOString(), verified: true, receiptId: "REC-A002", evidenceCount: 2, chain: ["connector_engine", "credential_store"], domain: "platform", finality: "finalized", rollbackEligible: false },
  { id: "PR-003", type: "verification", action: "Cash flow projection recalculated", actor: "finance-advisor", timestamp: new Date(Date.now() - 14400000).toISOString(), verified: true, receiptId: "REC-V001", evidenceCount: 5, chain: ["calculation_engine", "projection_store", "truth_registry"], domain: "finance", finality: "provisional", rollbackEligible: true },
  { id: "PR-004", type: "payment", action: "Subscription renewal — $49/mo", actor: "payment_engine", timestamp: new Date(Date.now() - 86400000).toISOString(), verified: true, receiptId: "REC-P001", evidenceCount: 4, chain: ["stripe", "payment_engine", "invoice_ledger", "audit_log"], domain: "finance", finality: "irreversible", rollbackEligible: false },
  { id: "PR-005", type: "rollback", action: "Workflow rollback: stuck approval chain", actor: "operator", timestamp: new Date(Date.now() - 172800000).toISOString(), verified: true, receiptId: "REC-R001", evidenceCount: 3, chain: ["workflow_engine", "rollback_log", "audit_log"], domain: "platform", finality: "finalized", rollbackEligible: false },
  { id: "PR-006", type: "system", action: "RLS policy audit completed", actor: "security_scanner", timestamp: new Date(Date.now() - 259200000).toISOString(), verified: true, evidenceCount: 1, chain: ["security_engine"], domain: "platform", finality: "committed", rollbackEligible: false },
  { id: "PR-007", type: "action", action: "AI model downgrade: gpt-4 → gpt-4o-mini", actor: "model_router", timestamp: new Date(Date.now() - 43200000).toISOString(), verified: true, receiptId: "REC-A003", evidenceCount: 2, chain: ["model_router", "cost_ledger"], domain: "platform", finality: "provisional", rollbackEligible: true },
  { id: "PR-008", type: "approval", action: "Team member invite: alex@team.io", actor: "owner", timestamp: new Date(Date.now() - 345600000).toISOString(), verified: true, receiptId: "REC-A004", evidenceCount: 2, chain: ["auth_service", "audit_log"], domain: "platform", finality: "finalized", rollbackEligible: true },
];

export const DEMO_CONTRACT_STATUSES = ["none", "partial", "aligned", "verified"] as const;

export const DEMO_AUTOPILOT_ACTIONS = [
  { id: "ra-1", action: "Re-engagement email to 12 dormant leads", result: "3 reopened conversations", value: "$2,400", confidence: 0.85, status: "completed" as const },
  { id: "ra-2", action: "Pricing optimization suggestion for Premium tier", result: "Pending approval", value: "$800/mo est.", confidence: 0.72, status: "pending" as const },
  { id: "ra-3", action: "Churn risk mitigation — 2 at-risk accounts contacted", result: "1 saved, 1 pending", value: "$1,200", confidence: 0.68, status: "active" as const },
  { id: "ra-4", action: "Upsell recommendation for 5 qualified accounts", result: "2 accepted", value: "$3,100", confidence: 0.91, status: "completed" as const },
];

export const DEMO_WINBACKS = [
  { name: "Acme Corp", lostRevenue: 2400, probability: 0.65, lastContact: "12d ago" },
  { name: "StartupXYZ", lostRevenue: 800, probability: 0.45, lastContact: "30d ago" },
  { name: "TechFlow Inc", lostRevenue: 1600, probability: 0.78, lastContact: "5d ago" },
];

export const DEMO_ROUTES: RouteSource[] = [
  // Investment Office
  { path: "/investment-office", pageName: "Investment Gate", domain: "Investment", activeProvider: "demo", dataServices: ["investment-data-service"], mockImports: ["investment-office/mock-data"], scenarioBinding: "investor-demo", launchHonesty: "demo-backed", notes: "Rich demo data via classified provider" },
  { path: "/investment-office/portfolio", pageName: "Portfolio Office", domain: "Investment", activeProvider: "demo", dataServices: ["investment-data-service"], mockImports: ["investment-office/mock-data"], scenarioBinding: "investor-demo", launchHonesty: "demo-backed", notes: "Classified demo provider" },
  { path: "/investment-office/market", pageName: "Market Explorer", domain: "Investment", activeProvider: "demo", dataServices: ["investment-data-service"], mockImports: ["investment-office/mock-data"], scenarioBinding: "investor-demo", launchHonesty: "demo-backed", notes: "Classified demo provider" },
  { path: "/investment-office/strategy", pageName: "Strategy Studio", domain: "Investment", activeProvider: "demo", dataServices: ["investment-data-service"], mockImports: ["investment-office/mock-data"], scenarioBinding: "investor-demo", launchHonesty: "demo-backed", notes: "Classified demo provider" },
  { path: "/investment-office/execution", pageName: "Execution Desk", domain: "Investment", activeProvider: "demo", dataServices: ["investment-data-service"], mockImports: ["investment-office/mock-data"], scenarioBinding: "investor-demo", launchHonesty: "demo-backed", notes: "Classified demo provider" },
  { path: "/investment-office/risk", pageName: "Risk Office", domain: "Investment", activeProvider: "demo", dataServices: ["investment-data-service"], mockImports: ["investment-office/mock-data"], scenarioBinding: "investor-demo", launchHonesty: "demo-backed", notes: "Classified demo provider" },
  // Boardroom
  { path: "/boardroom", pageName: "Boardroom", domain: "Boardroom", activeProvider: "mixed", dataServices: ["boardroom-data-service"], mockImports: ["advisor-mission-control"], scenarioBinding: "boardroom-demo", launchHonesty: "mixed", notes: "Boardroom packet is real, advisor data is demo" },
  // Business
  { path: "/business/customers", pageName: "Customers", domain: "Business", activeProvider: "real", dataServices: ["business-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "truthful", notes: "Uses mode-aware data service with Supabase" },
  { path: "/business/collections", pageName: "Collections", domain: "Business", activeProvider: "demo", dataServices: ["business-data-service"], mockImports: [], scenarioBinding: "business-demo", launchHonesty: "demo-backed", notes: "Type imports from data service" },
  { path: "/business/revenue-autopilot", pageName: "Revenue Autopilot", domain: "Business", activeProvider: "demo", dataServices: ["revenue-data-service"], mockImports: ["mock-data/revenue-autopilot"], scenarioBinding: "revenue-demo", launchHonesty: "demo-backed", notes: "Classified demo data" },
  // Workspace
  { path: "/workspace/docs", pageName: "Docs Workspace", domain: "Workspace", activeProvider: "real", dataServices: ["workspace-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "truthful", notes: "Uses mode-aware hook, types from data service" },
  { path: "/workspace/sheets", pageName: "Sheets Workspace", domain: "Workspace", activeProvider: "demo", dataServices: ["workspace-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "demo-backed", notes: "No real sheets table yet" },
  { path: "/workspace/slides", pageName: "Slides Workspace", domain: "Workspace", activeProvider: "demo", dataServices: ["workspace-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "demo-backed", notes: "No real slides table yet" },
  // Owner
  { path: "/owner", pageName: "Owner Center", domain: "Owner", activeProvider: "real", dataServices: ["owner-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "truthful", notes: "Uses approval_queue table" },
  { path: "/owner/approvals", pageName: "Approvals", domain: "Owner", activeProvider: "real", dataServices: ["owner-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "truthful", notes: "Types from data service" },
  { path: "/owner/pricing", pageName: "Pricing Editor", domain: "Owner", activeProvider: "demo", dataServices: ["owner-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "demo-backed", notes: "Types from data service" },
  // Money
  { path: "/money", pageName: "Money Office", domain: "Money", activeProvider: "real", dataServices: ["money-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "truthful", notes: "Uses capital_allocations table" },
  // Calendar
  { path: "/calendar", pageName: "Calendar", domain: "Calendar", activeProvider: "real", dataServices: ["calendar-data-service"], mockImports: [], scenarioBinding: null, launchHonesty: "truthful", notes: "Uses events table" },
];

export const DEMO_SHADOW_PATTERNS: ShadowPattern[] = [
  {
    pattern: "Multiple summary/card rendering",
    severity: "medium",
    domain: "dashboard",
    description: "Dashboard, pulse, and index pages each render summary cards with overlapping data sources",
    recommendation: "Consolidate into a single SummaryCardService with configurable views",
  },
  {
    pattern: "Advisor vs Assistant duplication",
    severity: "medium",
    domain: "assistant",
    description: "Multiple advisor/assistant chat patterns exist across different pages",
    recommendation: "Unify under ai-gateway-service as the single canonical entry",
  },
  {
    pattern: "Admin truth board proliferation",
    severity: "high",
    domain: "admin-truth",
    description: "272 admin pages with many sharing similar data fetch patterns and card layouts",
    recommendation: "Create shared admin data hooks and composable board primitives",
  },
  {
    pattern: "Connector config vs provider family overlap",
    severity: "medium",
    domain: "connectors",
    description: "Google provider family model and connector-oauth have overlapping scopes",
    recommendation: "Align provider family as the identity layer, connector as the data layer",
  },
  {
    pattern: "Direct Supabase calls from pages",
    severity: "low",
    domain: "multiple",
    description: "Some pages directly call supabase instead of going through service layer",
    recommendation: "Migrate direct calls to domain services for traceability",
  },
  {
    pattern: "Recommendation score aggregation",
    severity: "low",
    domain: "recommendation-execution",
    description: "Score aggregation logic exists in both REX01 page and recommendation-loop-service",
    recommendation: "Centralize in recommendation-loop-service",
  },
];

export const DEMO_POSTURE: PostureItem[] = [
  { domain: "User Auth & Profiles", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-05T08:00:00Z", gaps: [] },
  { domain: "Financial Data", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-05T07:30:00Z", gaps: [] },
  { domain: "Connector Credentials", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: true, lastVerified: "2026-04-05T09:00:00Z", gaps: [] },
  { domain: "Audit Logs", encryption: "full", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: false, lastVerified: "2026-04-05T08:15:00Z", gaps: [] },
  { domain: "Workflow State", encryption: "partial", rlsEnabled: true, secretsIntegrity: "verified", sensitiveData: false, lastVerified: "2026-04-04T22:00:00Z", gaps: ["Event payloads not encrypted at rest"] },
  { domain: "Device Fleet", encryption: "full", rlsEnabled: true, secretsIntegrity: "unverified", sensitiveData: false, lastVerified: "2026-04-03T12:00:00Z", gaps: ["Secret rotation overdue"] },
];

export const DEMO_ADMIN_CORE_SERVICES_SIMULATED_CORE_SERVICES_BOARD: CoreService[] = [
  { name: "EventBus", backing: "memory-only", domains: ["system", "all"], persistenceTarget: "Supabase agent_signals", stateLossSeverity: "high", migrationStatus: "not_started", owner: "Platform" },
  { name: "MemoryService", backing: "memory-only", domains: ["advisors", "mission-control"], persistenceTarget: "Supabase advisor_memories", stateLossSeverity: "high", migrationStatus: "planned", owner: "AI Team" },
  { name: "PolicyEngine", backing: "memory-only", domains: ["owner", "approvals", "governance"], persistenceTarget: "Supabase owner_policies", stateLossSeverity: "critical", migrationStatus: "not_started", owner: "Platform" },
  { name: "Setup Persistence", backing: "localStorage", domains: ["onboarding", "setup"], persistenceTarget: "Supabase user_preferences", stateLossSeverity: "medium", migrationStatus: "planned", owner: "Platform" },
  { name: "InvestmentEngine", backing: "memory-only", domains: ["investment", "money"], persistenceTarget: "Supabase positions + allocations", stateLossSeverity: "high", migrationStatus: "not_started", owner: "Finance" },
  { name: "RevenueEngine", backing: "memory-only", domains: ["business", "revenue"], persistenceTarget: "Supabase invoices + leakage", stateLossSeverity: "high", migrationStatus: "in_progress", owner: "Business" },
  { name: "ComputeGovernance", backing: "memory-only", domains: ["ai", "compute"], persistenceTarget: "Supabase compute_budget_snapshots", stateLossSeverity: "medium", migrationStatus: "not_started", owner: "AI Team" },
  { name: "AgentOrchestration", backing: "hybrid", domains: ["agents", "mission-control"], persistenceTarget: "Supabase agent_* tables", stateLossSeverity: "critical", migrationStatus: "in_progress", owner: "Platform" },
];

export const DEMO_DOMAIN_OPTIONS = ["general", "finance", "business", "household", "health", "legal", "travel", "education", "lifestyle"];

export const DEMO_ADVISOR_TYPE_OPTIONS = ["reactive", "proactive", "autonomous", "observing", "specialist"];

export const DEMO_INDEX_CONFIG = [
  { key: "runtimeTruth", label: "Runtime Truth Index", icon: Shield, color: "text-blue-400" },
  { key: "launchHonesty", label: "Launch Honesty Index", icon: Eye, color: "text-emerald-400" },
  { key: "aiTruth", label: "AI Truth Index", icon: Brain, color: "text-purple-400" },
  { key: "connectorTruth", label: "Connector Truth Index", icon: Plug, color: "text-amber-400" },
  { key: "demoGovernance", label: "Demo Governance Index", icon: Layers, color: "text-cyan-400" },
  { key: "surfacePortability", label: "Surface Portability Index", icon: Monitor, color: "text-pink-400" },
  { key: "deviceReadiness", label: "Device Readiness Index", icon: Smartphone, color: "text-orange-400" },
  { key: "observability", label: "Observability Index", icon: Activity, color: "text-teal-400" },
  { key: "securityPrivacy", label: "Security & Privacy Index", icon: Lock, color: "text-red-400" },
] as const;

export const DEMO_RUNS: WorkflowRun[] = [
  {
    id: "WF-RUN-001", workflowName: "Invoice Approval & Payment", status: "completed", startedAt: "2h ago", completedAt: "1h 45m ago", actor: "owner", receiptId: "REC-W001", branchPath: "standard → approved → paid",
    steps: [
      { name: "Invoice submitted", status: "completed", type: "event", timestamp: "2h ago", actor: "system" },
      { name: "Validation check", status: "completed", type: "check", timestamp: "2h ago", duration: "0.3s", output: "Valid: amount=$450, vendor=trusted" },
      { name: "Policy evaluation", status: "completed", type: "decision", timestamp: "1h 58m ago", duration: "0.1s", output: "Route: manual approval (amount > $100)" },
      { name: "Owner approval", status: "completed", type: "approval", timestamp: "1h 50m ago", actor: "owner", receiptRef: "REC-A012" },
      { name: "Payment execution", status: "completed", type: "action", timestamp: "1h 48m ago", duration: "2.1s", output: "Payment confirmed via Stripe" },
      { name: "Receipt generation", status: "completed", type: "event", timestamp: "1h 47m ago", receiptRef: "REC-P042" },
      { name: "Audit log entry", status: "completed", type: "event", timestamp: "1h 47m ago" },
    ],
  },
  {
    id: "WF-RUN-002", workflowName: "Connector Re-authentication", status: "failed", startedAt: "6h ago", actor: "system", branchPath: "detect → notify → timeout",
    steps: [
      { name: "Staleness detected", status: "completed", type: "event", timestamp: "6h ago", output: "Google Calendar: 4h stale" },
      { name: "Re-auth notification sent", status: "completed", type: "action", timestamp: "5h 55m ago" },
      { name: "User re-auth", status: "failed", type: "approval", timestamp: "—", output: "Timeout: no response in 4h" },
      { name: "Escalation", status: "skipped", type: "action", timestamp: "—" },
    ],
  },
  {
    id: "WF-RUN-003", workflowName: "AI Model Downgrade", status: "completed", startedAt: "12h ago", completedAt: "12h ago", actor: "model_router", receiptId: "REC-W003", branchPath: "detect → downgrade → verify",
    steps: [
      { name: "Latency threshold breached", status: "completed", type: "event", timestamp: "12h ago", output: "p95 > 8s for 15min" },
      { name: "Fallback model selected", status: "completed", type: "decision", timestamp: "12h ago", output: "gpt-4 → gpt-4o-mini" },
      { name: "Model swap executed", status: "completed", type: "action", timestamp: "12h ago", duration: "0.5s" },
      { name: "Post-swap verification", status: "completed", type: "check", timestamp: "11h 58m ago", output: "Latency normalized: p95 = 1.8s" },
      { name: "Cost ledger updated", status: "completed", type: "event", timestamp: "11h 58m ago" },
    ],
  },
  {
    id: "WF-RUN-004", workflowName: "Bulk Lead Import", status: "rolled-back", startedAt: "1d ago", actor: "owner", rollbackRef: "RB-001", branchPath: "import → validate → rollback",
    steps: [
      { name: "CSV uploaded", status: "completed", type: "event", timestamp: "1d ago", output: "142 records" },
      { name: "Validation", status: "completed", type: "check", timestamp: "1d ago", output: "12 duplicate emails detected" },
      { name: "Import executed", status: "completed", type: "action", timestamp: "1d ago", output: "130 records imported" },
      { name: "Owner review", status: "completed", type: "approval", timestamp: "23h ago", actor: "owner", output: "Rejected: wrong segment mapping" },
      { name: "Rollback executed", status: "completed", type: "action", timestamp: "23h ago", duration: "1.2s", output: "130 records removed" },
    ],
  },
];

export const DEMO_ADMIN_BUILDER_STEPS = [
  { step: 1, label: 'Intake', icon: FileText, description: 'Answer protocol intake questions' },
  { step: 2, label: 'Owner', icon: Shield, description: 'Confirm owner boundary' },
  { step: 3, label: 'Capabilities', icon: Layers, description: 'Register capability IDs' },
  { step: 4, label: 'Spec', icon: Code2, description: 'Generate compliant spec' },
  { step: 5, label: 'Contracts', icon: FileText, description: 'Define contracts/schemas' },
  { step: 6, label: 'Workflow', icon: Zap, description: 'Model workflow/policy/execution' },
  { step: 7, label: 'Testing', icon: CheckCircle2, description: 'Define testing matrix' },
  { step: 8, label: 'Rollout', icon: Rocket, description: 'Plan rollout & kill-switch' },
  { step: 9, label: 'Truth', icon: Database, description: 'Update generated artifacts' },
  { step: 10, label: 'Validate', icon: CheckCircle2, description: 'Compliance validation' },
];

export const DEMO_DOMAIN_PACKS = [
  { id: 'business-os', name: 'Business OS', features: ['CRM', 'Invoicing', 'Revenue', 'Communications'], color: 'bg-blue-500/10 text-blue-500' },
  { id: 'finance-os', name: 'Finance OS', features: ['Budgets', 'Bills', 'Capital', 'Subscriptions'], color: 'bg-green-500/10 text-green-500' },
  { id: 'concierge-os', name: 'Concierge OS', features: ['Household', 'Calendar', 'Travel', 'Bookings'], color: 'bg-purple-500/10 text-purple-500' },
  { id: 'platform', name: 'Platform', features: ['Auth', 'Files', 'Admin', 'Delivery'], color: 'bg-orange-500/10 text-orange-500' },
  { id: 'investment', name: 'Investment Office', features: ['Portfolio', 'Strategy', 'Execution', 'Risk'], color: 'bg-indigo-500/10 text-indigo-500' },
];

export const DEMO_GENERATED_ARTIFACTS = [
  'generated/feature-integration-index.json', 'generated/service-manifest.json',
  'generated/route-manifest.json', 'generated/subject-manifest.json',
  'generated/startup-order.json', 'generated/capability-index.json',
  'generated/advisor-registry.json', 'generated/connector-catalog.json',
  'generated/boardroom-template-index.json', 'generated/formula-registry.json',
  'generated/outcome-index.json', 'generated/prompt-index.json',
];

export const DEMO_OBSERVABILITY_FIELDS = ['structured_logs', 'metrics', 'traces', 'correlation_ids', 'error_codes', 'diagnostic_bundles', 'replay_path', 'incident_summary', 'runbooks'];

export const DEMO_ROLLOUT_RINGS = ['dev', 'staging', 'internal-shadow', 'internal-real', 'limited-tenant', 'premium', 'ga'];

export const DEMO_KILL_CLASSES = ['ui-hide', 'side-effects-disabled', 'connector-writes-disabled', 'recurring-disabled', 'approval-paused', 'full-workflow-disabled'];

export const DEMO_SPEC_SECTIONS = [
  'outcome_statement', 'capability_map', 'owner_map', 'surface_map',
  'contract_schema_map', 'workflow_model', 'policy_trust_model', 'execution_model',
  'memory_graph_effects', 'observability_support', 'testing_model',
  'rollout_recovery', 'generated_truth_updates',
];

export const DEMO_MODE_ORDER: LaunchMode[] = ["not_launch_safe", "internal_only", "pilot_ready", "private_beta_ready", "public_launch_qualified", "public_launch_ready"];

export const DEMO_ADMIN_BUILDER_STEPS_S_A_G_BUILDER_CONSOLE = [
  { step: 1, label: 'Capability', icon: Layers, desc: 'Select capability ID for this AI feature' },
  { step: 2, label: 'Prompt Family', icon: MessageSquare, desc: 'Select or create prompt family' },
  { step: 3, label: 'Task Class', icon: Zap, desc: 'Assign task classification' },
  { step: 4, label: 'Schema', icon: FileText, desc: 'Define output schema' },
  { step: 5, label: 'Risk/Autonomy', icon: Shield, desc: 'Assign risk and autonomy tiers' },
  { step: 6, label: 'Context', icon: Database, desc: 'Select context and memory sources' },
  { step: 7, label: 'Routing', icon: Code2, desc: 'Configure routing policy' },
  { step: 8, label: 'Verification', icon: CheckCircle2, desc: 'Set verification requirements' },
  { step: 9, label: 'Fallback', icon: Shield, desc: 'Configure fallback chain' },
  { step: 10, label: 'Validate', icon: CheckCircle2, desc: 'Compliance validation' },
];

export const DEMO_VIOLATION_TYPES = [
  { type: 'direct_provider_call', label: 'Direct Provider Call', severity: 'critical', icon: Ban },
  { type: 'missing_capability_id', label: 'Missing Capability ID', severity: 'high', icon: AlertTriangle },
  { type: 'missing_prompt_family', label: 'Missing Prompt Family', severity: 'high', icon: AlertTriangle },
  { type: 'missing_output_schema', label: 'Missing Output Schema', severity: 'medium', icon: AlertTriangle },
  { type: 'premium_misuse', label: 'Premium Model Misuse', severity: 'medium', icon: AlertTriangle },
  { type: 'no_fallback_critical', label: 'No Fallback for Critical', severity: 'high', icon: ShieldAlert },
  { type: 'unverified_high_risk', label: 'Unverified High-Risk', severity: 'critical', icon: Ban },
  { type: 'missing_receipt', label: 'Missing Receipt/Trace', severity: 'medium', icon: AlertTriangle },
];

export const DEMO_FALLBACK_STRATEGIES = [
  { id: 'same_provider_downgrade', label: 'Same Provider Downgrade', desc: 'Use cheaper model from same provider', icon: '↓' },
  { id: 'cross_provider', label: 'Cross-Provider Failover', desc: 'Switch to alternative provider', icon: '↔' },
  { id: 'degrade_summary', label: 'Degrade to Summary', desc: 'Return cheaper summary instead', icon: '📝' },
  { id: 'async_defer', label: 'Async Deferral', desc: 'Queue for later when available', icon: '⏳' },
  { id: 'structured_refusal', label: 'Structured Refusal', desc: 'Honest degraded explanation', icon: '⚠️' },
];

export const DEMO_EXAMPLE_STAGES = [
  { pattern: 'Classify → Synthesize → Resolve', stages: [
    { label: 'Utility Classifier', model: 'gemini-2.5-flash-lite', cost: '0.1¢', purpose: 'Cheap task classification' },
    { label: 'Standard Synthesis', model: 'gemini-3-flash', cost: '2¢', purpose: 'Mid-tier content synthesis' },
    { label: 'Premium Resolver', model: 'gemini-2.5-pro', cost: '25¢', purpose: 'Only if ambiguity remains' },
  ]},
  { pattern: 'Retrieve → Differential → Deep', stages: [
    { label: 'Cache/Reuse Check', model: 'deterministic', cost: '0¢', purpose: 'Check intelligence library' },
    { label: 'Differential Reasoning', model: 'gemini-2.5-flash', cost: '1¢', purpose: 'Reason about what changed' },
    { label: 'Deep Reasoning', model: 'gpt-5', cost: '50¢', purpose: 'Only if invalidated' },
  ]},
  { pattern: 'Extract → Ground → Explain', stages: [
    { label: 'Utility Extraction', model: 'flash-lite', cost: '0.1¢', purpose: 'Structured data extraction' },
    { label: 'Deterministic Grounding', model: 'code', cost: '0¢', purpose: 'Validate against state' },
    { label: 'Standard Explanation', model: 'gemini-3-flash', cost: '3¢', purpose: 'User-facing explanation' },
  ]},
  { pattern: 'Draft → Verify → Escalate', stages: [
    { label: 'Draft Model', model: 'gpt-5-nano', cost: '0.5¢', purpose: 'Fast initial draft' },
    { label: 'Verifier Model', model: 'gemini-2.5-flash', cost: '1¢', purpose: 'Quality validation' },
    { label: 'Premium Escalation', model: 'claude-sonnet-4', cost: '30¢', purpose: 'Only when needed' },
  ]},
];

export const DEMO_DEFAULT_CATEGORIES = [
  { cat: "defensive", target: 25, desc: "Monitoring, self-healing, compliance" },
  { cat: "growth", target: 35, desc: "Revenue, lead scoring, optimization" },
  { cat: "strategic_premium", target: 20, desc: "Deep analysis, synthesis, strategy" },
  { cat: "experimentation", target: 10, desc: "New capabilities, benchmark tests" },
  { cat: "emergency_reserve", target: 10, desc: "Incident response, critical escalation" },
];
