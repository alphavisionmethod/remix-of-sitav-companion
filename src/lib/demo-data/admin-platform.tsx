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

interface BudgetEnvelope {
  scopeType: "tenant" | "workspace" | "agent" | "mission" | "domain" | "environment";
  scopeRef: string;
  tenantId: string;
  label: string;
  budgetCents: number;
  deepReasoningMinutesCap: number;
  spentCents?: number;
  remainingCents?: number;
  deepReasoningMinutesUsed?: number;
  proactiveInferenceSpentCents?: number;
  retrySpentCents?: number;
  retriesUsed?: number;
  status?: string;
}

const createEnvelope = (
  scopeType: BudgetEnvelope["scopeType"],
  scopeRef: string,
  tenantId: string,
  label: string,
  budgetCents: number,
  deepReasoningMinutesCap: number,
): BudgetEnvelope => ({
  scopeType,
  scopeRef,
  tenantId,
  label,
  budgetCents,
  deepReasoningMinutesCap,
});

interface ConciergeTask {
  id: string;
  title: string;
  domain: string;
  state: string;
  assignee: string;
  lastUpdated: string;
  continuityBroken: boolean;
  receiptRef?: string;
}

interface ConnectorStatus {
  id: string;
  name: string;
  type: string;
  status: "healthy" | "degraded" | "stale" | "disconnected";
  lastSyncAt: string;
  staleness: string;
  errorRate: number;
  syncCount24h: number;
  credentialStatus: string;
  credentialExpiresIn?: string;
  affectedDomains: string[];
  latencyMs: number;
  dataFreshness: string;
}

interface ServiceMigration {
  name: string;
  currentBacking: string;
  targetBacking: string;
  phase: string;
  blockers: string[];
  continuityGain: string;
  tables: string[];
}

interface DomainReality {
  domain: string;
  overallReadiness: number;
  features: Array<{
    feature: string;
    readPath: string;
    writePath: string;
    emptyState: boolean;
    loadingState: boolean;
    errorState: boolean;
    tables: string[];
  }>;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  connectors: Array<{ name: string; status: string }>;
  workflows: string[];
  riskLevel: "low" | "medium" | "high";
  readiness: number;
}

interface EfficiencyScore {
  entityType: "agent" | "workflow" | "advisor" | "reasoning-path";
}

interface ProofEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  proofChain: Array<{ step: string; status: string }>;
  rollbackEvidence: boolean;
  approvalContext: boolean;
  exportable: boolean;
}

interface LaunchBlocker {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "in-progress" | "resolved" | "accepted-risk";
  domain: string;
  owner: string;
  description: string;
  evidenceMissing?: string[];
  unblockSteps?: string[];
  ringImpact: string[];
  createdAt: string;
}

interface ReadinessCheck {
  category: string;
  checks: Array<{ name: string; status: "pass" | "fail" | "warning" | "skip"; detail: string }>;
}

interface DomainMigration {
  domain: string;
  status: DomainMigrationStatus;
  totalPages: number;
  migratedPages: number;
  realProviderReady: boolean;
  demoProviderReady: boolean;
  tablesExist: boolean;
  blockers: string[];
  priority: "critical" | "high" | "medium" | "low";
}

interface ServiceStatus {
  name: string;
  icon: ReactNode;
  adapter: string;
  table: string;
  wired: boolean;
  description: string;
}

interface PolicyDraft {
  id: string;
  name: string;
  description: string;
  rule: string;
  status: "draft" | "simulated" | "active";
  affectedSystems: string[];
  affectedUsers: number;
  riskLevel: "low" | "medium" | "high";
  approvalPath: string[];
  createdAt: string;
}

interface ProofRecord {
  id: string;
  type: string;
  action: string;
  actor: string;
  timestamp: string;
  verified: boolean;
  receiptId?: string;
  evidenceCount: number;
  chain: string[];
  domain: string;
  finality: string;
  rollbackEligible: boolean;
}

interface RouteSource {
  path: string;
  pageName: string;
  domain: string;
  activeProvider: string;
  dataServices: string[];
  mockImports: string[];
  scenarioBinding: string | null;
  launchHonesty: string;
  notes: string;
}

interface ShadowPattern {
  pattern: string;
  severity: "high" | "medium" | "low";
  domain: string;
  description: string;
  recommendation: string;
}

interface PostureItem {
  domain: string;
  encryption: string;
  rlsEnabled: boolean;
  secretsIntegrity: string;
  sensitiveData: boolean;
  lastVerified: string;
  gaps: string[];
}

interface CoreService {
  name: string;
  backing: string;
  domains: string[];
  persistenceTarget: string;
  stateLossSeverity: string;
  migrationStatus: string;
  owner: string;
}

interface WorkflowRun {
  id: string;
  workflowName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  actor: string;
  receiptId?: string;
  rollbackRef?: string;
  branchPath: string;
  steps: Array<{
    name: string;
    status: string;
    type: string;
    timestamp: string;
    actor?: string;
    duration?: string;
    output?: string;
    receiptRef?: string;
  }>;
}

export const DEMO_DEBATES = [
  {
    id: 1, topic: "How to fix projection cache corruption",
    status: "resolved" as const,
    participants: [
      { agent: "Backend Engineer", position: "Add Redis mutex lock with 30s TTL to prevent concurrent writes", confidence: 87, stance: "for" as const },
      { agent: "Performance Optimizer", position: "Mutex will add 200-500ms latency. Use optimistic locking instead", confidence: 72, stance: "against" as const },
      { agent: "Reliability Engineer", position: "Mutex is safer. Latency increase acceptable vs data corruption risk", confidence: 90, stance: "for" as const },
      { agent: "Security Reviewer", position: "Agree with mutex. Optimistic locking may leave window for inconsistency", confidence: 85, stance: "for" as const },
    ],
    resolution: "Mutex lock approach selected (3-1). Performance Optimizer's latency concern noted — monitor post-deploy.",
    consensus: 82,
  },
  {
    id: 2, topic: "Admin shell performance — lazy imports vs route preloading",
    status: "active" as const,
    participants: [
      { agent: "Frontend Engineer", position: "Full lazy imports with Suspense boundaries. Reduces initial bundle 60%", confidence: 85, stance: "for" as const },
      { agent: "Performance Optimizer", position: "Lazy imports + prefetch on hover for critical routes. Best of both", confidence: 88, stance: "modified" as const },
      { agent: "QA Engineer", position: "Lazy imports require route test updates. 8 tests need rewriting", confidence: 78, stance: "neutral" as const },
      { agent: "Design Engineer", position: "Ensure loading skeletons match page layouts to avoid layout shift", confidence: 81, stance: "neutral" as const },
    ],
    resolution: null,
    consensus: 68,
  },
  {
    id: 3, topic: "Should feature flags require canary rollout?",
    status: "resolved" as const,
    participants: [
      { agent: "Release Manager", position: "All feature flags must go through 10% → 50% → 100% canary stages", confidence: 88, stance: "for" as const },
      { agent: "Engineering Lead", position: "Only high-impact flags need canary. Low-risk can go straight to 100%", confidence: 82, stance: "modified" as const },
      { agent: "Reliability Engineer", position: "Recent flag rollback supports canary for all. 5 rollbacks in 30 days", confidence: 86, stance: "for" as const },
      { agent: "Learning Analyst", position: "Data shows 80% of rollbacks were flags without canary stage", confidence: 79, stance: "for" as const },
    ],
    resolution: "Canary required for medium+ impact flags. Low-risk flags can opt out with explicit justification.",
    consensus: 84,
  },
];

export const DEMO_APPROVALS = [
  {
    id: 1, title: "Improve loading speed — admin shell code splitting", proposedBy: "Performance Optimizer", type: "code" as const,
    reason: "Admin shell loads 30+ pages synchronously, causing >3s initial load. Proposal converts to lazy imports with Suspense boundaries.",
    blastRadius: "medium", affectedAreas: ["Admin Shell", "Route Config", "8 admin pages"], confidence: 78,
    evidence: ["Lighthouse audit: 3.2s LCP", "Bundle analysis: 1.8MB admin chunk", "3 user-reported slow loads"],
    rollbackReady: true, testsNeeded: "Route tests need update for lazy boundaries",
    uncertainty: "Unknown interaction with existing ErrorBoundary wrappers"
  },
  {
    id: 2, title: "Redesign Mission Control header layout", proposedBy: "Design Engineer", type: "design" as const,
    reason: "Current header is flat and lacks visual hierarchy. Proposal adds gradient accent, icon badge, and action slot aligned with AdminPageHeader pattern.",
    blastRadius: "low", affectedAreas: ["Mission Control page"], confidence: 79,
    evidence: ["Design audit: inconsistent with other admin headers", "User feedback: 'hard to scan'"],
    rollbackReady: true, testsNeeded: "Visual regression snapshot",
    uncertainty: "Subjective design preference — may need user feedback"
  },
  {
    id: 3, title: "Add smoke gate for auth flow before production deploy", proposedBy: "Release Manager", type: "ops" as const,
    reason: "No automated auth flow check exists in promotion pipeline. Two recent deploys broke login for 5-15 minutes before detection.",
    blastRadius: "low", affectedAreas: ["CI/CD pipeline", "Deploy workflow"], confidence: 88,
    evidence: ["Incident #147: broken login 15m", "Incident #152: broken OAuth 5m", "No auth smoke test in pipeline"],
    rollbackReady: true, testsNeeded: "Smoke test implementation",
    uncertainty: "Auth flow depends on Supabase availability during test"
  },
  {
    id: 4, title: "Fix projection cache race condition", proposedBy: "Backend Engineer", type: "code" as const,
    reason: "Concurrent projection rebuilds cause cache corruption. Proposal adds Redis-based mutex lock with 30s TTL.",
    blastRadius: "high", affectedAreas: ["Projection Service", "Cache Layer", "3 edge functions"], confidence: 87,
    evidence: ["14 error cluster in last 48h", "Race condition reproduced in staging", "Stack trace: concurrent write conflict"],
    rollbackReady: false, testsNeeded: "Integration tests for concurrent rebuilds",
    uncertainty: "Mutex lock may increase rebuild latency by 200-500ms under load"
  },
];

export const DEMO_PLANS = [
  {
    id: "cp-1", title: "Add Redis mutex for projection cache writes", missionId: "Fix projection corruption",
    agent: "Backend Engineer", status: "approved" as const, confidence: 87, autonomy: "approval_required",
    targetFiles: ["src/lib/services/projection-cache.ts", "src/lib/core-services/redis-client.ts"],
    targetSurfaces: ["Admin Dashboard", "Boardroom"],
    intendedEffect: "Prevent concurrent cache writes from corrupting projection data",
    affectedServices: ["projection-service", "cache-layer"],
    affectedRoutes: ["/admin/projections", "/boardroom"],
    rollbackStrategy: "Remove mutex lock, revert to optimistic writes. No data loss expected.",
    deploymentScope: "staging" as const,
    testsNeeded: ["Concurrent write stress test", "Projection rebuild integration test", "Cache invalidation test"],
    testResults: [
      { name: "Concurrent write stress test", passed: true, detail: "100 concurrent writes — 0 corruption" },
      { name: "Projection rebuild integration test", passed: true, detail: "Full rebuild completes in 2.1s" },
      { name: "Cache invalidation test", passed: true, detail: "Invalidation propagates within 500ms" },
    ],
    evidence: [
      { type: "Root cause analysis", detail: "Race condition when PROJECTION_REBUILD_CONCURRENCY > 2" },
      { type: "Signal cluster", detail: "14 projection 500 errors over 4 hours" },
      { type: "Agent debate", detail: "3-1 consensus for mutex over optimistic locking" },
    ],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const, detail: "0 errors" },
      { gate: "Unit Tests", result: "pass" as const, detail: "3/3 passing" },
      { gate: "Security Scan", result: "pass" as const, detail: "No new vulnerabilities" },
      { gate: "Performance", result: "warning" as const, detail: "+200ms latency on writes (acceptable)" },
      { gate: "Policy Compliance", result: "pass" as const, detail: "Within approval boundaries" },
    ],
    createdAt: "Apr 5, 09:30", reviewedBy: "Operator", reviewNotes: "Approved after agent debate review"
  },
  {
    id: "cp-2", title: "Fix broken route /admin/durability", missionId: "Route mapping fix",
    agent: "Error Fixer", status: "applied" as const, confidence: 96, autonomy: "safe_auto_heal",
    targetFiles: ["src/App.tsx"],
    targetSurfaces: ["Admin Shell"],
    intendedEffect: "Restore navigation to durability dashboard",
    affectedServices: ["frontend-router"],
    affectedRoutes: ["/admin/durability"],
    rollbackStrategy: "Revert single route entry. Zero cascading effects.",
    deploymentScope: "preview" as const,
    testsNeeded: ["Route resolution test"],
    testResults: [{ name: "Route resolution test", passed: true, detail: "Route resolves correctly" }],
    evidence: [{ type: "Signal", detail: "404 on known internal route detected by observation layer" }],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const, detail: "0 errors" },
      { gate: "Route Test", result: "pass" as const, detail: "Route resolves" },
      { gate: "Policy", result: "pass" as const, detail: "Auto-heal eligible (isolated, low-risk)" },
    ],
    createdAt: "Apr 5, 08:15", reviewedBy: "Auto-healed", reviewNotes: "Low-risk, isolated change — auto-applied"
  },
  {
    id: "cp-3", title: "Admin header gradient accent upgrade", missionId: "Design consistency improvement",
    agent: "Design Engineer", status: "proposed" as const, confidence: 84, autonomy: "approval_required",
    targetFiles: ["src/components/sita/admin/AdminPageHeader.tsx"],
    targetSurfaces: ["Admin Shell — all pages"],
    intendedEffect: "Improve scannability and visual premium feel across admin surfaces",
    affectedServices: ["frontend-components"],
    affectedRoutes: ["/admin/*"],
    rollbackStrategy: "Revert component file. Original flat style restored instantly.",
    deploymentScope: "preview" as const,
    testsNeeded: ["Visual regression test", "Design token audit"],
    testResults: [],
    evidence: [
      { type: "Design audit", detail: "Current headers lack visual hierarchy — blend with card backgrounds" },
      { type: "Consistency check", detail: "92% design token compliance after change" },
    ],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const, detail: "0 errors" },
      { gate: "Design Consistency", result: "pass" as const, detail: "92% token compliance" },
      { gate: "Accessibility", result: "warning" as const, detail: "Contrast OK but review gradient readability" },
    ],
    createdAt: "Apr 5, 10:45", reviewedBy: undefined, reviewNotes: undefined
  },
  {
    id: "cp-4", title: "Canary rollout policy for medium+ feature flags", missionId: "Deployment hardening",
    agent: "Release Manager", status: "draft" as const, confidence: 76, autonomy: "approval_required",
    targetFiles: ["src/lib/core-services/feature-flags.ts", "src/lib/ai-engineering/self-healing-engine.ts"],
    targetSurfaces: ["Release pipeline", "Self-Healing Center"],
    intendedEffect: "Require 10%→50%→100% canary stages for medium+ impact flags",
    affectedServices: ["feature-flag-service", "deployment-pipeline"],
    affectedRoutes: [],
    rollbackStrategy: "Remove canary enforcement. Flags return to instant 100% activation.",
    deploymentScope: "staging" as const,
    testsNeeded: ["Canary stage transition test", "Flag rollback test", "Policy enforcement test"],
    testResults: [],
    evidence: [
      { type: "Learning pattern", detail: "80% of flag rollbacks were flags without canary stage" },
      { type: "Agent debate", detail: "3-1 consensus for canary requirement (with low-risk opt-out)" },
    ],
    verificationGates: [],
    createdAt: "Apr 5, 11:00", reviewedBy: undefined, reviewNotes: undefined
  },
];

export const DEMO_ADMIN_DIFFS = [
  {
    id: 1, title: "Admin header — gradient accent upgrade", area: "Admin Shell", agent: "Design Engineer",
    before: { description: "Flat header with icon + title. No depth, no visual hierarchy. Blends with card background.", visual: "border-border bg-card p-4 rounded-lg" },
    after: { description: "Gradient header with accent icon badge, subtitle, and action slot. Creates premium feel.", visual: "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-4 rounded-2xl" },
    rationale: "Improves scannability. Creates visual weight consistent with boardroom surfaces. Guides the eye to title first, then actions.",
    confidence: 84, consistency: 92, impact: "medium", tokens: ["--primary", "--card", "rounded-2xl"], status: "ready" as const
  },
  {
    id: 2, title: "Dark mode — table header contrast fix", area: "Data Tables", agent: "Design Engineer",
    before: { description: "bg-muted/30 with text-muted-foreground. Contrast ratio 3.2:1 — fails WCAG AA.", visual: "bg-muted/30 text-muted-foreground p-3 rounded-lg" },
    after: { description: "bg-muted/50 with text-foreground. Contrast ratio 5.1:1 — passes WCAG AA.", visual: "bg-muted/50 text-foreground p-3 rounded-lg" },
    rationale: "WCAG AA requires 4.5:1 for normal text. Current table headers fail in dark mode. This is a compliance-blocking issue.",
    confidence: 95, consistency: 88, impact: "high", tokens: ["--muted", "--foreground"], status: "applied" as const
  },
  {
    id: 3, title: "Mission Control cards — progressive disclosure", area: "Mission Control", agent: "Design Engineer",
    before: { description: "Dense cards with 8 inline metrics, small badges, and crowded layout. Cognitive overload.", visual: "border-border/40 bg-card p-3 rounded-lg" },
    after: { description: "3 key metrics visible at glance. Expandable detail section for deep data. Cleaner hierarchy.", visual: "border-border/40 bg-card p-4 rounded-xl" },
    rationale: "Operator surfaces should show decision-relevant data first. Detail-on-demand reduces cognitive load by ~40%.",
    confidence: 77, consistency: 85, impact: "medium", tokens: ["rounded-xl", "text-sm"], status: "proposal" as const
  },
  {
    id: 4, title: "Revenue Office stat cards — premium upgrade", area: "Revenue Office", agent: "Design Engineer",
    before: { description: "Plain border cards with centered text and no icon emphasis. Functional but flat.", visual: "border-border/40 bg-card p-4 text-center rounded-xl" },
    after: { description: "Subtle gradient cards with accent icon, trend indicators, and richer typography.", visual: "border-primary/10 bg-gradient-to-br from-primary/5 via-card to-card p-4 rounded-xl" },
    rationale: "Aligns with premium design language used in Investment Office and Boardroom. Creates consistency across offices.",
    confidence: 82, consistency: 90, impact: "medium", tokens: ["--primary", "gradient"], status: "ready" as const
  },
  {
    id: 5, title: "Sidebar — active state indicator refinement", area: "Navigation", agent: "Design Engineer",
    before: { description: "Active route shown with bg-muted. No left indicator, no color accent. Hard to spot in long lists.", visual: "bg-muted rounded-md p-2" },
    after: { description: "Left accent bar (2px primary) + bg-primary/5 + font-medium. Instantly visible active state.", visual: "border-l-2 border-primary bg-primary/5 rounded-md p-2 font-medium" },
    rationale: "With 40+ sidebar items, fast identification of current location is critical. Left-bar pattern is proven in premium UIs.",
    confidence: 89, consistency: 94, impact: "low", tokens: ["--primary", "border-l-2"], status: "ready" as const
  },
];

export const DEMO_IMPROVEMENTS = [
  { id: 1, title: "Admin header — improve information hierarchy", area: "Admin Shell", type: "layout" as const, before: "Flat header with icon + title, no visual depth", after: "Gradient header with accent icon badge, subtitle, and action slot", rationale: "Improves scannability and creates premium feel consistent with boardroom surfaces", confidence: 84, impact: "medium", consistency: 92, status: "ready" as const },
  { id: 2, title: "Sidebar icons — add consistent sizing and alignment", area: "Navigation", type: "consistency" as const, before: "Mixed icon sizes (h-4, h-5) and inconsistent padding", after: "Standardized h-4 w-4 with 12px padding and active indicator", rationale: "Creates visual rhythm and reduces cognitive load during navigation", confidence: 91, impact: "low", consistency: 96, status: "ready" as const },
  { id: 3, title: "Dark mode — fix low-contrast table headers", area: "Data Tables", type: "accessibility" as const, before: "bg-muted/30 with text-muted-foreground — contrast ratio 3.2:1", after: "bg-muted/50 with text-foreground — contrast ratio 5.1:1", rationale: "WCAG AA requires 4.5:1 for normal text. Current headers fail", confidence: 95, impact: "high", consistency: 88, status: "applied" as const },
  { id: 4, title: "Mission Control cards — reduce visual noise", area: "Mission Control", type: "layout" as const, before: "Dense cards with 8 inline metrics and small badges", after: "Progressive disclosure: 3 key metrics visible, expandable details", rationale: "Operator surfaces should show decision-relevant data first", confidence: 77, impact: "medium", consistency: 85, status: "proposal" as const },
  { id: 5, title: "Revenue Office — modernize stat cards", area: "Revenue Office", type: "visual" as const, before: "Plain border cards with centered text", after: "Subtle gradient cards with icon accent and trend indicators", rationale: "Aligns with premium design language used in Investment Office", confidence: 82, impact: "medium", consistency: 90, status: "ready" as const },
];

export const DEMO_OVERVIEW_BAND = [
  { label: "Open Issues", value: 12, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Critical Issues", value: 2, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
  { label: "Active Missions", value: 5, icon: Target, color: "text-primary", bg: "bg-primary/10" },
  { label: "Self-Heal Rate", value: "92%", icon: Sparkles, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Release Confidence", value: "82%", icon: Rocket, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Regression Risk", value: "Low", icon: Shield, color: "text-[hsl(var(--trust-safe))]", bg: "bg-[hsl(var(--trust-safe))]/10" },
  { label: "Verification Health", value: "94%", icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
  { label: "Approvals Waiting", value: 2, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
];

export const DEMO_ATTENTION_ITEMS = [
  { title: "Elevated 500 errors on /api/projections/rebuild", type: "critical-issue", severity: "critical" as const, agent: "Reliability Engineer", time: "18m" },
  { title: "Admin shell LCP 3.2s — exceeds 1.5s budget", type: "regression", severity: "high" as const, agent: "Performance Optimizer", time: "4h" },
  { title: "Failed self-heal: layout restore caused secondary shift", type: "failed-heal", severity: "medium" as const, agent: "Self-Healing Supervisor", time: "1d" },
  { title: "Release gate failing: Performance Budget", type: "release-gate", severity: "high" as const, agent: "Release Manager", time: "35m" },
  { title: "Projection cache fix — awaiting approval", type: "blocked-change", severity: "high" as const, agent: "Backend Engineer", time: "2h" },
];

export const DEMO_AGENT_SIGNALS = [
  { name: "Engineering Lead", signal: "Coordinating shell performance sprint", confidence: 92, autonomy: "supervised", escalation: false, tasks: 3 },
  { name: "Backend Engineer", signal: "Projection mutex lock ready for review", confidence: 88, autonomy: "draft-only", escalation: false, tasks: 2 },
  { name: "Frontend Engineer", signal: "Accessibility sweep — 2 violations remaining", confidence: 85, autonomy: "supervised", escalation: false, tasks: 4 },
  { name: "Design Engineer", signal: "Admin header redesign proposed", confidence: 79, autonomy: "draft-only", escalation: false, tasks: 2 },
  { name: "QA Engineer", signal: "Generated 8 new regression tests", confidence: 91, autonomy: "auto-low-risk", escalation: false, tasks: 3 },
  { name: "Error Fixer", signal: "Analyzing projection error cluster — 14 signals", confidence: 84, autonomy: "supervised", escalation: true, tasks: 5 },
  { name: "Reliability Engineer", signal: "Monitoring elevated error rate", confidence: 90, autonomy: "auto-low-risk", escalation: false, tasks: 2 },
  { name: "Security Reviewer", signal: "Schema migration risk — escalated to human", confidence: 87, autonomy: "observe-only", escalation: true, tasks: 1 },
  { name: "Performance Optimizer", signal: "Admin shell lazy import analysis", confidence: 76, autonomy: "supervised", escalation: false, tasks: 2 },
  { name: "Release Manager", signal: "Staging promotion blocked — perf gate", confidence: 82, autonomy: "supervised", escalation: false, tasks: 1 },
  { name: "Self-Healing Supervisor", signal: "Cache auto-heal verified ✓", confidence: 88, autonomy: "auto-low-risk", escalation: false, tasks: 3 },
  { name: "Learning Analyst", signal: "New pattern: flag rollbacks within 2h", confidence: 71, autonomy: "observe-only", escalation: false, tasks: 1 },
  { name: "Docs Engineer", signal: "Deployment runbook updated", confidence: 93, autonomy: "auto-low-risk", escalation: false, tasks: 0 },
];

export const DEMO_ADMIN_MISSIONS = [
  { title: "Fix projection cache corruption", agent: "Backend Engineer", progress: 75, status: "ready_for_approval", blocker: "Awaiting human approval", confidence: 87 },
  { title: "Reduce admin shell load time to <1.2s", agent: "Performance Optimizer", progress: 68, status: "in_progress", blocker: null, confidence: 76 },
  { title: "Achieve 95% test coverage on core flows", agent: "QA Engineer", progress: 82, status: "in_progress", blocker: null, confidence: 91 },
  { title: "Zero critical accessibility violations", agent: "Frontend Engineer", progress: 91, status: "in_progress", blocker: null, confidence: 85 },
  { title: "Add smoke gates for critical flows", agent: "Release Manager", progress: 45, status: "in_progress", blocker: null, confidence: 82 },
];

export const DEMO_RECENT_HEALS = [
  { action: "Restarted unhealthy projection worker", time: "12m ago", verified: true },
  { action: "Reverted bad feature flag: revenue-sidebar-v2", time: "1h ago", verified: true },
  { action: "Auto-fixed broken route /admin/durability", time: "2h ago", verified: true },
  { action: "Invalidated stale brand-kit CDN cache", time: "4h ago", verified: true },
];

export const DEMO_LEARNING_HIGHLIGHTS = [
  { type: "pattern", detail: "Feature flag rollbacks cluster within 2h of activation", confidence: 82 },
  { type: "optimization", detail: "Error Fixer accuracy improved +4% after lazy-import checks", confidence: 91 },
  { type: "rejected", detail: "Design proposal using hardcoded colors — rejected 2x", confidence: 79 },
  { type: "root-cause", detail: "Projection failures correlate with config concurrency changes", confidence: 84 },
];

export const DEMO_CHANGES = [
  { action: "Auto-fixed broken route /admin/durability", agent: "Error Fixer", time: "12m ago", type: "auto-heal" as const },
  { action: "Proposed layout improvement for Mission Control header", agent: "Design Engineer", time: "28m ago", type: "proposal" as const },
  { action: "Reverted bad feature flag for revenue-office sidebar", agent: "Reliability Engineer", time: "1h ago", type: "rollback" as const },
  { action: "Generated regression tests for approval flow", agent: "QA Engineer", time: "2h ago", type: "improvement" as const },
  { action: "Patched stale projection cache invalidation", agent: "Backend Engineer", time: "3h ago", type: "fix" as const },
  { action: "Blocked risky schema migration — escalated to human", agent: "Security Reviewer", time: "4h ago", type: "blocked" as const },
  { action: "Updated deployment runbook with new smoke gate", agent: "Documentation Engineer", time: "6h ago", type: "improvement" as const },
  { action: "Release confidence: 78% → 82% after test additions", agent: "Release Manager", time: "7h ago", type: "improvement" as const },
];

export const DEMO_ADMIN_ENVIRONMENTS = [
  { env: "Production", status: "healthy" as const, confidence: 94, deployedAt: "2h ago", drift: "none", version: "v2.14.3" },
  { env: "Staging", status: "warning" as const, confidence: 78, deployedAt: "35m ago", drift: "2 config diffs", version: "v2.15.0-rc1" },
  { env: "Preview", status: "healthy" as const, confidence: 88, deployedAt: "12m ago", drift: "none", version: "v2.15.0-rc2" },
];

export const DEMO_ADMIN_RELEASE_GATES = [
  { gate: "Unit Tests", status: "pass" as const, detail: "1,247/1,247 passing" },
  { gate: "Integration Tests", status: "pass" as const, detail: "89/89 passing" },
  { gate: "Auth Smoke Test", status: "pass" as const, detail: "Login + OAuth verified" },
  { gate: "Performance Budget", status: "warning" as const, detail: "Admin shell LCP 3.2s (budget: 1.5s)" },
  { gate: "Accessibility Audit", status: "warning" as const, detail: "2 AA violations remaining" },
  { gate: "Security Scan", status: "pass" as const, detail: "0 critical, 1 advisory" },
  { gate: "Design Consistency", status: "pass" as const, detail: "92% token compliance" },
  { gate: "Rollback Plan", status: "pass" as const, detail: "Automated rollback configured" },
];

export const DEMO_EXPORT_MODES: {
  mode: ExportMode; label: string; icon: typeof FileJson; description: string }[] = [
  { mode: "json", label: "JSON Bundle", icon: FileJson, description: "Machine-readable evidence bundle with full metadata" },
  { mode: "markdown", label: "Markdown Report", icon: BookOpen, description: "Human-readable report for docs, wikis, or runbooks" },
  { mode: "approval", label: "Approval Attachment", icon: Shield, description: "Attach to approval queue item with risk & evidence summary" },
  { mode: "pr-ready", label: "PR-Ready Evidence", icon: GitBranch, description: "Structured evidence block for pull request descriptions" },
  { mode: "investor", label: "Investor/Compliance", icon: Users, description: "High-level proof of engineering governance and quality" },
];

export const DEMO_BUNDLE_ITEMS = [
  {
    id: "b1", missionTitle: "Fix projection cache corruption", type: "fix" as const,
    confidence: 87, status: "applied", agent: "Backend Engineer",
    evidence: [
      { type: "Root cause analysis", detail: "Race condition when PROJECTION_REBUILD_CONCURRENCY > 2" },
      { type: "Signal cluster", detail: "14 projection 500 errors over 4 hours" },
      { type: "Agent debate", detail: "3-1 consensus for mutex over optimistic locking" },
    ],
    tests: [
      { name: "Concurrent write stress test", passed: true },
      { name: "Projection rebuild integration", passed: true },
      { name: "Cache invalidation propagation", passed: true },
    ],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const },
      { gate: "Unit Tests", result: "pass" as const },
      { gate: "Security Scan", result: "pass" as const },
      { gate: "Policy Compliance", result: "pass" as const },
    ],
    rollbackPlan: "Remove mutex lock, revert to optimistic writes. No data loss expected.",
    impact: "Eliminated 14 concurrent rebuild errors. Zero projection corruption since.",
    appliedAt: "Apr 5, 09:30", receipt: "exec-1712312345-ab12",
  },
  {
    id: "b2", missionTitle: "Auto-fix broken route /admin/durability", type: "self-heal" as const,
    confidence: 96, status: "applied", agent: "Error Fixer",
    evidence: [
      { type: "Signal", detail: "404 on known internal route /admin/durability" },
      { type: "Self-healing rule", detail: "Auto-fix obvious broken route mappings" },
    ],
    tests: [{ name: "Route resolution test", passed: true }],
    verificationGates: [
      { gate: "Type Check", result: "pass" as const },
      { gate: "Route Test", result: "pass" as const },
      { gate: "Policy", result: "pass" as const },
    ],
    rollbackPlan: "Revert single route entry. Zero cascading effects.",
    impact: "Route restored in 12 seconds. Zero user disruption.",
    appliedAt: "Apr 5, 08:15", receipt: "exec-1712301234-cd34",
  },
  {
    id: "b3", missionTitle: "Feature flag canary rollout policy", type: "improvement" as const,
    confidence: 84, status: "proposed", agent: "Release Manager",
    evidence: [
      { type: "Learning pattern", detail: "80% of flag rollbacks were flags without canary stage" },
      { type: "Agent debate", detail: "3-1 consensus for canary requirement" },
      { type: "Incident data", detail: "5 flag rollbacks in 30 days" },
    ],
    tests: [],
    verificationGates: [],
    rollbackPlan: "Remove canary enforcement. Flags return to instant 100% activation.",
    impact: "Estimated: -60% flag rollbacks, -80% flag-related incidents",
    appliedAt: null, receipt: null,
  },
];

export const DEMO_FIXES = [
  { id: 1, title: "Elevated 500 errors on /api/projections/rebuild", area: "Backend — Projection Service", severity: "critical" as const, rootCause: "Cache invalidation race condition during concurrent rebuilds", patch: "Add mutex lock on projection rebuild queue", confidence: 87, testImpact: "3 tests affected", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 14, blastRadius: "surface" as const, reproducibility: "always" as const, affectedRoutes: ["/admin/projections", "/boardroom"], affectedComponents: ["ProjectionService", "CacheLayer"], affectedServices: ["projection-service", "cache-layer", "rebuild-edge-fn"], environment: "production" },
  { id: 2, title: "Broken navigation on /admin/durability", area: "Frontend — Admin Routes", severity: "high" as const, rootCause: "Missing lazy import after route restructuring", patch: "Add lazy import and Route entry for AdminDurabilityBoard", confidence: 96, testImpact: "1 route test", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 1, blastRadius: "isolated" as const, reproducibility: "always" as const, affectedRoutes: ["/admin/durability"], affectedComponents: ["App.tsx"], affectedServices: ["frontend-router"], environment: "all" },
  { id: 3, title: "Stale brand kit colors in white-label preview", area: "Frontend — Brand Kit", severity: "medium" as const, rootCause: "CDN cache not invalidated on brand kit update", patch: "Add cache-busting query param on brand asset URLs", confidence: 82, testImpact: "No existing tests", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 3, blastRadius: "component" as const, reproducibility: "frequent" as const, affectedRoutes: ["/white-label/*"], affectedComponents: ["BrandKitPreview"], affectedServices: ["cdn", "brand-service"], environment: "staging" },
  { id: 4, title: "Accessibility: missing aria-labels on sidebar icons", area: "Frontend — Shell Layout", severity: "medium" as const, rootCause: "Icon-only buttons without accessible names", patch: "Add aria-label props to all SidebarMenuButton icon items", confidence: 94, testImpact: "0 tests (needs new)", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 8, blastRadius: "component" as const, reproducibility: "always" as const, affectedRoutes: ["/*"], affectedComponents: ["AppSidebar", "SidebarMenuButton"], affectedServices: ["frontend-shell"], environment: "all" },
  { id: 5, title: "Slow page load on Revenue Office (>3s)", area: "Frontend — Revenue Office", severity: "high" as const, rootCause: "Synchronous import of all 30+ sub-pages in RevenueGate", patch: "Convert to lazy imports with code splitting", confidence: 78, testImpact: "Route tests need update", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 2, blastRadius: "surface" as const, reproducibility: "always" as const, affectedRoutes: ["/revenue-office/*"], affectedComponents: ["RevenueGate"], affectedServices: ["frontend-router"], environment: "all" },
  { id: 6, title: "API mismatch: advisor response missing 'reasoning' field", area: "Backend — Advisor API", severity: "medium" as const, rootCause: "Edge function schema drift after recent advisor update", patch: "Add reasoning field to response serializer", confidence: 89, testImpact: "2 integration tests", approvalNeeded: true, autoFixEligible: false, rollbackSafe: true, cluster: 1, blastRadius: "component" as const, reproducibility: "always" as const, affectedRoutes: ["/api/advisor/*"], affectedComponents: ["AdvisorResponseSerializer"], affectedServices: ["advisor-edge-fn"], environment: "staging" },
  { id: 7, title: "Visual drift: card border radius inconsistency", area: "Frontend — Design System", severity: "low" as const, rootCause: "Mixed rounded-lg and rounded-xl in admin cards", patch: "Standardize to rounded-xl across admin surfaces", confidence: 92, testImpact: "Visual regression only", approvalNeeded: false, autoFixEligible: true, rollbackSafe: true, cluster: 12, blastRadius: "cross-surface" as const, reproducibility: "always" as const, affectedRoutes: ["/admin/*"], affectedComponents: ["AdminCards"], affectedServices: ["frontend-components"], environment: "all" },
];

export const DEMO_AGENT_BOUNDARIES: AgentBoundary[] = [
  { agent: "Engineering Lead", icon: Brain, autonomy: "approval_required", scope: "Sprint coordination, cross-agent synthesis" },
  { agent: "Backend Engineer", icon: Wrench, autonomy: "draft_only", scope: "APIs, services, data models, runtime" },
  { agent: "Frontend Engineer", icon: Wrench, autonomy: "draft_only", scope: "Routes, components, state, rendering" },
  { agent: "Design Engineer", icon: Palette, autonomy: "draft_only", scope: "Layouts, visual consistency, dark mode" },
  { agent: "QA Engineer", icon: ShieldCheck, autonomy: "safe_auto_heal", scope: "Test generation, regression checks, coverage" },
  { agent: "Error Fixer", icon: Bug, autonomy: "safe_auto_heal", scope: "Stack traces, runtime errors, patches" },
  { agent: "Reliability Engineer", icon: Shield, autonomy: "safe_auto_heal", scope: "Incidents, health, retries, recovery", lastOverride: "Apr 4 — escalated flag revert to auto-heal" },
  { agent: "Security Reviewer", icon: Lock, autonomy: "observe_only", scope: "Permissions, policies, secrets, posture" },
  { agent: "Performance Optimizer", icon: Gauge, autonomy: "draft_only", scope: "Latency, caching, rendering cost" },
  { agent: "Documentation Engineer", icon: BookOpen, autonomy: "safe_auto_heal", scope: "Docs, changelogs, runbooks" },
  { agent: "Release Manager", icon: Rocket, autonomy: "approval_required", scope: "Release readiness, promotion, rollout" },
  { agent: "Self-Healing Supervisor", icon: Sparkles, autonomy: "safe_auto_heal", scope: "Auto-fix rules, verification, boundaries" },
  { agent: "Learning Analyst", icon: Brain, autonomy: "observe_only", scope: "Pattern detection, routing improvements" },
];

export const DEMO_MISSION_BOUNDARIES: MissionBoundary[] = [
  { missionType: "Fix broken route", defaultAutonomy: "safe_auto_heal", overridable: true, rationale: "Isolated, low-risk, easily verifiable" },
  { missionType: "Performance optimization", defaultAutonomy: "draft_only", overridable: true, rationale: "Can have subtle cascading effects" },
  { missionType: "Design improvement", defaultAutonomy: "approval_required", overridable: false, rationale: "Visual changes need human judgment" },
  { missionType: "Incident resolution", defaultAutonomy: "approval_required", overridable: true, rationale: "High urgency but high blast radius" },
  { missionType: "Security hardening", defaultAutonomy: "never_automate", overridable: false, rationale: "Security changes must be human-reviewed" },
  { missionType: "Schema/migration change", defaultAutonomy: "never_automate", overridable: false, rationale: "Data-affecting changes are irreversible" },
  { missionType: "Test generation", defaultAutonomy: "safe_auto_heal", overridable: true, rationale: "Tests are additive, zero production risk" },
  { missionType: "Documentation update", defaultAutonomy: "safe_auto_heal", overridable: true, rationale: "Non-functional, easily reversible" },
  { missionType: "Feature flag change", defaultAutonomy: "approval_required", overridable: true, rationale: "User-facing behavior change" },
  { missionType: "Core routing change", defaultAutonomy: "approval_required", overridable: false, rationale: "Affects all surfaces and navigation" },
];

export const DEMO_CHANGE_TYPE_BOUNDARIES: ChangeTypeBoundary[] = [
  { changeType: "UI copy/label fix", maxAutonomy: "safe_auto_heal", requiresSimulation: false, requiresCanary: false, rationale: "Minimal risk, instantly verifiable" },
  { changeType: "Component style change", maxAutonomy: "draft_only", requiresSimulation: false, requiresCanary: false, rationale: "Visual impact needs review" },
  { changeType: "Route mapping fix", maxAutonomy: "safe_auto_heal", requiresSimulation: false, requiresCanary: false, rationale: "Isolated, verifiable via route test" },
  { changeType: "API endpoint change", maxAutonomy: "approval_required", requiresSimulation: true, requiresCanary: true, rationale: "Breaking change risk" },
  { changeType: "Database schema change", maxAutonomy: "never_automate", requiresSimulation: true, requiresCanary: true, rationale: "Irreversible data impact" },
  { changeType: "Auth/permissions change", maxAutonomy: "never_automate", requiresSimulation: true, requiresCanary: false, rationale: "Security-critical" },
  { changeType: "Feature flag toggle", maxAutonomy: "approval_required", requiresSimulation: false, requiresCanary: true, rationale: "User-facing behavior" },
  { changeType: "Cache invalidation", maxAutonomy: "safe_auto_heal", requiresSimulation: false, requiresCanary: false, rationale: "Safe, self-healing eligible" },
  { changeType: "Config value change", maxAutonomy: "approval_required", requiresSimulation: true, requiresCanary: false, rationale: "Can have cascading effects" },
  { changeType: "Broad layout redesign", maxAutonomy: "approval_required", requiresSimulation: true, requiresCanary: true, rationale: "Visual regression risk across surfaces" },
];

export const DEMO_ADMIN_PATTERNS = [
  { pattern: "Route mapping errors recur after lazy-import refactors", frequency: "4x in 30 days", domain: "Frontend", confidence: 88, severity: "high", improvement: "Added pre-commit route validation check", status: "implemented" as const },
  { pattern: "Feature flag rollbacks within 2 hours of activation", frequency: "5x in 30 days", domain: "Deployment", confidence: 82, severity: "medium", improvement: "Proposed canary rollout requirement for all flags", status: "proposed" as const },
  { pattern: "CDN cache staleness after brand kit mutations", frequency: "Weekly", domain: "Infrastructure", confidence: 91, severity: "medium", improvement: "Auto-invalidate cache on brand kit save", status: "implemented" as const },
  { pattern: "Operator overrides approval threshold for low-risk changes", frequency: "8x in 30 days", domain: "Governance", confidence: 76, severity: "low", improvement: "Lower approval threshold for low-risk auto-heals", status: "proposed" as const },
  { pattern: "Test flakiness in approval workflow suite", frequency: "3x in 14 days", domain: "QA", confidence: 84, severity: "medium", improvement: "Identified timing-dependent assertions, propose retries", status: "in_review" as const },
  { pattern: "UI regression in admin cards after design updates", frequency: "2x in 14 days", domain: "Design", confidence: 79, severity: "medium", improvement: "Add visual regression snapshots for admin surfaces", status: "proposed" as const },
];

export const DEMO_ADMIN_OUTCOMES = [
  { recommendation: "Add mutex lock on projection rebuilds", accepted: true, outcome: "success", impact: "Eliminated 14 concurrent rebuild errors", confidence_delta: "+8%" },
  { recommendation: "Canary rollout for sidebar feature flag", accepted: true, outcome: "success", impact: "Caught rendering bug before 100% rollout", confidence_delta: "+5%" },
  { recommendation: "Raise prices 10% on premium tier", accepted: false, outcome: "rejected", impact: "User chose conservative approach", confidence_delta: "-2%" },
  { recommendation: "Auto-fix broken /admin/durability route", accepted: true, outcome: "success", impact: "Route restored in 12 seconds", confidence_delta: "+3%" },
  { recommendation: "Disable brand-kit preview caching", accepted: true, outcome: "partial", impact: "Fixed staleness but increased load by 200ms", confidence_delta: "+1%" },
];

export const DEMO_CALIBRATION = [
  { agent: "Error Fixer", accuracy: 91, falsePositives: 3, missedIssues: 1, trend: "improving" as const },
  { agent: "QA Engineer", accuracy: 88, falsePositives: 5, missedIssues: 2, trend: "stable" as const },
  { agent: "Design Engineer", accuracy: 79, falsePositives: 8, missedIssues: 1, trend: "improving" as const },
  { agent: "Reliability Engineer", accuracy: 93, falsePositives: 2, missedIssues: 0, trend: "stable" as const },
  { agent: "Performance Optimizer", accuracy: 74, falsePositives: 6, missedIssues: 3, trend: "declining" as const },
  { agent: "Security Reviewer", accuracy: 96, falsePositives: 1, missedIssues: 0, trend: "stable" as const },
];

export const DEMO_ADMIN_MISSIONS_A_I_MISSION_CENTER = [
  {
    id: 1, title: "Fix projection cache corruption", type: "fix-issue", status: "ready_for_approval" as const, priority: "P0",
    agents: ["Backend Engineer", "QA Engineer"], confidence: 87, blastRadius: "high", rollbackSafe: false,
    description: "Concurrent projection rebuilds corrupt cache entries. Add mutex lock with 30s TTL.",
    why: "14 error cluster in 48h. Affects admin dashboard, boardroom, and projections surface.",
    impact: "Eliminates all cache corruption errors. +200ms write latency (acceptable).",
    evidence: 6, tests: 3, changePlans: 1, approvals: 1, simResult: "Pass — 100 concurrent writes, 0 corruption",
    tasks: [
      { task: "Analyze root cause", status: "done" as const, agent: "Backend Engineer" },
      { task: "Draft mutex lock proposal", status: "done" as const, agent: "Backend Engineer" },
      { task: "Run concurrent write tests", status: "done" as const, agent: "QA Engineer" },
      { task: "Security review", status: "done" as const, agent: "Security Reviewer" },
      { task: "Human approval", status: "pending" as const, agent: "Operator" },
    ],
    lessonsLearned: null,
  },
  {
    id: 2, title: "Reduce admin shell load time to <1.2s", type: "optimize-performance", status: "in_progress" as const, priority: "P1",
    agents: ["Performance Optimizer", "Frontend Engineer"], confidence: 76, blastRadius: "medium", rollbackSafe: true,
    description: "Admin shell loads 30+ pages synchronously. Convert to lazy imports with Suspense.",
    why: "LCP 3.2s exceeds 1.5s budget. Users report slow first load. Blocks release gate.",
    impact: "Estimated: LCP 1.1s. 60% bundle reduction for initial load.",
    evidence: 5, tests: 0, changePlans: 0, approvals: 1, simResult: null,
    tasks: [
      { task: "Analyze bundle composition", status: "done" as const, agent: "Performance Optimizer" },
      { task: "Identify lazy-import candidates", status: "done" as const, agent: "Performance Optimizer" },
      { task: "Implement lazy imports", status: "in_progress" as const, agent: "Frontend Engineer" },
      { task: "Update route tests", status: "pending" as const, agent: "QA Engineer" },
    ],
    lessonsLearned: null,
  },
  {
    id: 3, title: "Zero critical accessibility violations", type: "improve-accessibility", status: "in_progress" as const, priority: "P1",
    agents: ["Frontend Engineer", "Design Engineer"], confidence: 85, blastRadius: "low", rollbackSafe: true,
    description: "2 AA violations remaining in admin sidebar. Add aria-labels and fix contrast.",
    why: "WCAG AA compliance required. Current sidebar icons have no accessible names.",
    impact: "Full AA compliance across admin surfaces.",
    evidence: 2, tests: 1, changePlans: 0, approvals: 0, simResult: null,
    tasks: [
      { task: "Audit all sidebar icons", status: "done" as const, agent: "Frontend Engineer" },
      { task: "Add aria-label props", status: "in_progress" as const, agent: "Frontend Engineer" },
      { task: "Fix contrast in dark mode headers", status: "done" as const, agent: "Design Engineer" },
    ],
    lessonsLearned: null,
  },
  {
    id: 4, title: "Resolve incident — elevated projection errors", type: "resolve-incident", status: "in_progress" as const, priority: "P0",
    agents: ["Reliability Engineer", "Error Fixer"], confidence: 84, blastRadius: "high", rollbackSafe: false,
    description: "Elevated 500 error rate on /api/projections/rebuild. Linked to cache corruption mission.",
    why: "Production stability. Error rate 5x baseline for 18 minutes.",
    impact: "Resolves all projection error spikes. Dependent on mission #1.",
    evidence: 6, tests: 0, changePlans: 0, approvals: 1, simResult: null,
    tasks: [
      { task: "Detect and classify error pattern", status: "done" as const, agent: "Error Fixer" },
      { task: "Link to root cause (cache corruption)", status: "done" as const, agent: "Reliability Engineer" },
      { task: "Monitor after mission #1 fix applied", status: "pending" as const, agent: "Reliability Engineer" },
    ],
    lessonsLearned: null,
  },
  {
    id: 5, title: "Harden deployment — add auth smoke gate", type: "harden-deployment", status: "simulated" as const, priority: "P1",
    agents: ["Release Manager", "QA Engineer"], confidence: 88, blastRadius: "low", rollbackSafe: true,
    description: "Add automated auth flow smoke test before staging→prod promotion.",
    why: "Two recent deploys broke login for 5-15 minutes before detection.",
    impact: "Prevents auth-breaking deploys from reaching production.",
    evidence: 4, tests: 3, changePlans: 1, approvals: 1, simResult: "Pass — simulated login, OAuth, and session refresh",
    tasks: [
      { task: "Design smoke test flow", status: "done" as const, agent: "Release Manager" },
      { task: "Implement auth smoke test", status: "done" as const, agent: "QA Engineer" },
      { task: "Simulate in staging", status: "done" as const, agent: "QA Engineer" },
      { task: "Add to promotion pipeline", status: "pending" as const, agent: "Release Manager" },
    ],
    lessonsLearned: null,
  },
  {
    id: 6, title: "Optimize prompts for advisor briefing packets", type: "custom", status: "learned_from" as const, priority: "P2",
    agents: ["Learning Analyst"], confidence: 82, blastRadius: "low", rollbackSafe: true,
    description: "Advisor briefing packets included redundant context. Streamlined prompt structure.",
    why: "30% token waste in briefing generation. Increased latency and cost.",
    impact: "30% reduction in briefing tokens. Latency improved by 400ms.",
    evidence: 3, tests: 1, changePlans: 1, approvals: 0, simResult: "Pass",
    tasks: [
      { task: "Analyze token usage patterns", status: "done" as const, agent: "Learning Analyst" },
      { task: "Draft optimized prompt template", status: "done" as const, agent: "Learning Analyst" },
      { task: "A/B test old vs new", status: "done" as const, agent: "Learning Analyst" },
    ],
    lessonsLearned: "Compact context windows reduced hallucination by 12% and improved response relevance.",
  },
];

export const DEMO_ADMIN_ENVIRONMENTS_A_I_RELEASES_CENTER = [
  { env: "Production", status: "healthy" as const, confidence: 94, version: "v2.14.3", deployedAt: "Apr 4, 14:22", drift: "none", rollbackTo: "v2.14.2" },
  { env: "Staging", status: "warning" as const, confidence: 78, version: "v2.15.0-rc1", deployedAt: "Apr 5, 09:45", drift: "2 config diffs", rollbackTo: "v2.14.3" },
  { env: "Preview", status: "healthy" as const, confidence: 88, version: "v2.15.0-rc2", deployedAt: "Apr 5, 10:12", drift: "none", rollbackTo: "v2.15.0-rc1" },
];

export const DEMO_ADMIN_RELEASE_GATES_A_I_RELEASES_CENTER = [
  { gate: "Unit Tests", status: "pass" as const, detail: "1,247/1,247 passing", required: true },
  { gate: "Integration Tests", status: "pass" as const, detail: "89/89 passing", required: true },
  { gate: "Auth Smoke Test", status: "pass" as const, detail: "Login + OAuth + session refresh verified", required: true },
  { gate: "Core Flow Smoke", status: "pass" as const, detail: "Business, Money, Concierge flows verified", required: true },
  { gate: "Performance Budget", status: "fail" as const, detail: "Admin shell LCP 3.2s — budget 1.5s", required: true },
  { gate: "Accessibility Audit", status: "warning" as const, detail: "2 AA violations in admin sidebar", required: false },
  { gate: "Security Scan", status: "pass" as const, detail: "0 critical, 1 low advisory", required: true },
  { gate: "Design Consistency", status: "pass" as const, detail: "92% design token compliance", required: false },
  { gate: "API Contract Check", status: "pass" as const, detail: "All endpoints match schema", required: true },
  { gate: "Rollback Plan", status: "pass" as const, detail: "Automated rollback to v2.14.2 ready", required: true },
  { gate: "Data Migration", status: "pass" as const, detail: "No pending migrations", required: true },
  { gate: "Feature Flag Review", status: "pass" as const, detail: "3 flags reviewed, 1 scheduled sunset", required: false },
];

export const DEMO_ROLLOUT_HISTORY = [
  { version: "v2.14.3", env: "Production", at: "Apr 4, 14:22", status: "live" as const, confidence: 94, gates: "11/12 pass", issues: 0 },
  { version: "v2.14.2", env: "Production", at: "Apr 2, 11:05", status: "replaced" as const, confidence: 91, gates: "12/12 pass", issues: 1 },
  { version: "v2.14.1", env: "Production", at: "Mar 30, 16:40", status: "replaced" as const, confidence: 88, gates: "10/12 pass", issues: 0 },
  { version: "v2.14.0", env: "Production", at: "Mar 28, 09:15", status: "rolled_back" as const, confidence: 62, gates: "8/12 pass", issues: 3 },
  { version: "v2.13.5", env: "Production", at: "Mar 25, 14:30", status: "replaced" as const, confidence: 95, gates: "12/12 pass", issues: 0 },
];

export const DEMO_ROLLBACK_OPTIONS = [
  { target: "v2.14.2", risk: "low", impact: "Reverts 1 edge function update + 3 UI fixes", estimated: "< 2 min", dataLoss: "None" },
  { target: "v2.14.1", risk: "medium", impact: "Reverts 5 edge functions + projection cache changes", estimated: "< 5 min", dataLoss: "None" },
  { target: "v2.13.5", risk: "high", impact: "Reverts 12 features + 2 schema-dependent changes", estimated: "< 10 min", dataLoss: "Possible projection staleness" },
];

export const DEMO_PROMOTION_EVIDENCE = [
  { check: "All required gates passing", met: true },
  { check: "Staging soak time > 4 hours", met: false, detail: "Currently 35 minutes" },
  { check: "No active P0 incidents", met: true },
  { check: "Performance within SLO", met: false, detail: "Admin shell LCP exceeds budget" },
  { check: "Security review complete", met: true },
  { check: "QA sign-off", met: true },
  { check: "Rollback plan verified", met: true },
];

export const DEMO_GRAPH_NODES = [
  { id: "symptom-1", type: "symptom" as const, label: "500 errors on /api/projections/rebuild", severity: "critical" },
  { id: "symptom-2", type: "symptom" as const, label: "Stale projection data on admin dashboard", severity: "high" },
  { id: "symptom-3", type: "symptom" as const, label: "Timeout on boardroom synthesis", severity: "medium" },
  { id: "service-1", type: "service" as const, label: "Projection Service", health: 62 },
  { id: "service-2", type: "service" as const, label: "Cache Layer (Redis)", health: 78 },
  { id: "service-3", type: "service" as const, label: "Edge Function: rebuild-projections", health: 45 },
  { id: "release-1", type: "release" as const, label: "v2.14.3 — Cache strategy update", deployedAt: "Apr 4" },
  { id: "config-1", type: "config" as const, label: "PROJECTION_REBUILD_CONCURRENCY=5", changedAt: "Apr 3" },
  { id: "root-1", type: "root_cause" as const, label: "Race condition: concurrent rebuilds corrupt cache entries", confidence: 87 },
];

export const DEMO_GRAPH_EDGES = [
  { from: "symptom-1", to: "service-3", label: "triggers" },
  { from: "symptom-2", to: "service-2", label: "served by" },
  { from: "symptom-3", to: "service-1", label: "depends on" },
  { from: "service-3", to: "service-2", label: "writes to" },
  { from: "service-1", to: "service-2", label: "reads from" },
  { from: "release-1", to: "service-3", label: "changed" },
  { from: "config-1", to: "service-3", label: "configured" },
  { from: "service-3", to: "root-1", label: "likely cause" },
  { from: "service-2", to: "root-1", label: "likely cause" },
];

export const DEMO_AI_FEATURES = [
  { name: "Chat Advisor", fn: "chat-advisor", surface: "AdvisorChat", description: "Streaming advisor conversations across money/business/concierge/family/growth" },
  { name: "Brain Core", fn: "brain-core", surface: "BrainCore hook", description: "Structured advisory with rules engine + LLM escalation" },
  { name: "Personal Brain", fn: "personal-brain", surface: "Personal Brain page", description: "Think/Learn/Build/Create modes with streaming" },
  { name: "Agent Executor", fn: "agent-executor", surface: "Agent diagnostics", description: "Pod-based agent diagnostics (no AI calls)" },
  { name: "Admin Intelligence", fn: "admin-intelligence", surface: "Admin analytics", description: "Anomaly detection, forecasting, optimization (no AI calls)" },
];

export const DEMO_HEALED = [
  { title: "Restarted unhealthy projection rebuild worker", time: "12m ago", risk: "low", verified: true, learned: true },
  { title: "Reverted bad feature flag: revenue-sidebar-v2", time: "1h ago", risk: "low", verified: true, learned: true },
  { title: "Auto-fixed broken internal route /admin/durability", time: "2h ago", risk: "low", verified: true, learned: false },
  { title: "Invalidated stale brand-kit CDN cache", time: "4h ago", risk: "low", verified: true, learned: true },
  { title: "Retried stuck connector sync job (Stripe)", time: "6h ago", risk: "low", verified: true, learned: false },
  { title: "Restored known-good layout variant for mobile sidebar", time: "1d ago", risk: "medium", verified: true, learned: true },
];

export const DEMO_ADMIN_RULES = [
  { rule: "Auto-restart unhealthy noncritical processes", scope: "Infrastructure", risk: "low", enabled: true, healCount: 12 },
  { rule: "Revert recent bad feature flag/config", scope: "Feature Flags", risk: "low", enabled: true, healCount: 4 },
  { rule: "Disable broken panel behind feature flag", scope: "UI Components", risk: "low", enabled: true, healCount: 7 },
  { rule: "Restore known-good layout variant", scope: "UI Layouts", risk: "medium", enabled: true, healCount: 3 },
  { rule: "Retry stuck sync jobs (max 3 attempts)", scope: "Connectors", risk: "low", enabled: true, healCount: 18 },
  { rule: "Invalidate bad cache entries", scope: "Caching", risk: "low", enabled: true, healCount: 9 },
  { rule: "Auto-fix obvious broken route mappings", scope: "Routing", risk: "low", enabled: true, healCount: 2 },
  { rule: "Downgrade degraded integration to safe mode", scope: "Integrations", risk: "medium", enabled: false, healCount: 0 },
];

export const DEMO_BLOCKED = [
  { title: "Schema migration — new column on customers table", reason: "Blast radius too high for auto-heal", risk: "high", agent: "Security Reviewer" },
  { title: "Permission policy change — admin role expansion", reason: "Trust-sensitive change requires human approval", risk: "critical", agent: "Security Reviewer" },
  { title: "Core routing restructure — /admin/* paths", reason: "Affects 20+ routes — exceeds auto-heal scope", risk: "high", agent: "Engineering Lead" },
];

export const DEMO_ADMIN_PATTERNS_A_I_SELF_HEALING = [
  { pattern: "Projection rebuild failures cluster after deployments", frequency: "3x in 14 days", action: "Added pre-deploy projection health check", confidence: 78 },
  { pattern: "Feature flag rollbacks happen within 2 hours of activation", frequency: "5x in 30 days", action: "Suggested canary rollout for all feature flags", confidence: 82 },
  { pattern: "CDN cache staleness correlates with brand kit updates", frequency: "Weekly", action: "Auto-invalidate on brand kit mutation", confidence: 91 },
];

export const DEMO_LEARNED_PATTERNS = [
  { pattern: "Route mapping errors recur after lazy-import refactors", frequency: "4x / 30d", confidence: 88, domain: "Frontend", action: "Added pre-commit route validation", status: "active" as const, impact: "Prevented 3 broken routes" },
  { pattern: "Feature flag rollbacks cluster within 2 hours of activation", frequency: "5x / 30d", confidence: 82, domain: "Deployment", action: "Canary rollout required for medium+ flags", status: "active" as const, impact: "Reduced flag rollbacks 60%" },
  { pattern: "CDN cache staleness correlates with brand kit mutations", frequency: "Weekly", confidence: 91, domain: "Infrastructure", action: "Auto-invalidate on brand kit save", status: "active" as const, impact: "Zero stale brand reports since" },
  { pattern: "Operator overrides low-risk approval threshold repeatedly", frequency: "8x / 30d", confidence: 76, domain: "Governance", action: "Lowered threshold for auto-heals", status: "proposed" as const, impact: "Estimated: -40% approval friction" },
  { pattern: "Projection rebuild failures spike after concurrent config changes", frequency: "3x / 14d", confidence: 84, domain: "Backend", action: "Mutex lock + sequential rebuild queue", status: "active" as const, impact: "Eliminated rebuild corruption" },
  { pattern: "Approval flow tests become flaky after UI dependency updates", frequency: "3x / 14d", confidence: 79, domain: "QA", action: "Replace timing-dependent assertions with waitFor", status: "proposed" as const, impact: "Estimated: -80% flaky tests" },
];

export const DEMO_BEHAVIOR_CHANGES = [
  { change: "Error Fixer now checks for existing lazy imports before proposing route fixes", learnedFrom: "False positive: suggested import that already existed", date: "Apr 3", improvement: "+4% accuracy" },
  { change: "Reliability Engineer auto-reverts feature flags within 90 min if error rate > 2x baseline", learnedFrom: "revenue-sidebar-v2 flag caused 3 render errors for 45 min", date: "Apr 4", improvement: "45 min → 12 min MTTR" },
  { change: "Design Engineer includes design token audit in all proposals", learnedFrom: "2 proposals used hardcoded colors instead of semantic tokens", date: "Mar 28", improvement: "+15% consistency score" },
  { change: "QA Engineer prioritizes integration tests over unit tests for approval flows", learnedFrom: "Unit tests passed but integration flow broke in staging", date: "Mar 25", improvement: "Caught 2 integration bugs" },
  { change: "Release Manager requires 4-hour soak time before staging→prod promotion", learnedFrom: "v2.14.0 promoted after 30 min, required rollback", date: "Mar 28", improvement: "Zero premature promotions since" },
];

export const DEMO_ROUTING_WEIGHTS = [
  { agent: "Error Fixer", weight: 1.12, trend: "up" as const, reason: "91% accuracy, 3% improvement this month" },
  { agent: "QA Engineer", weight: 1.05, trend: "stable" as const, reason: "88% accuracy, consistent performance" },
  { agent: "Design Engineer", weight: 0.92, trend: "up" as const, reason: "79% accuracy, improving from 71%" },
  { agent: "Reliability Engineer", weight: 1.15, trend: "stable" as const, reason: "93% accuracy, top performer" },
  { agent: "Performance Optimizer", weight: 0.85, trend: "down" as const, reason: "74% accuracy, 3 false positives this month" },
  { agent: "Security Reviewer", weight: 1.18, trend: "stable" as const, reason: "96% accuracy, zero missed issues" },
  { agent: "Learning Analyst", weight: 0.78, trend: "up" as const, reason: "71% accuracy but improving pattern detection" },
];

export const DEMO_TASK_TYPES = [
  { key: "summarize", label: "Summarize", desc: "Generate synthesis of scope area" },
  { key: "diagnose", label: "Diagnose", desc: "Root-cause analysis" },
  { key: "classify", label: "Classify", desc: "Categorize inputs" },
  { key: "audit", label: "Audit", desc: "Structured compliance review" },
  { key: "recommend", label: "Recommend", desc: "Generate actionable recommendations" },
  { key: "investigate", label: "Investigate", desc: "Deep-dive evidence analysis" },
  { key: "produce_remediation_plan", label: "Remediation Plan", desc: "Phased fix plan from findings" },
  { key: "generate_digest", label: "Generate Digest", desc: "Executive summary" },
  { key: "compare", label: "Compare", desc: "Diff two states or versions" },
  { key: "propose", label: "Propose Change", desc: "Draft a governed proposal" },
];

export const DEMO_BUDGET_POSTURES = [
  { key: "economy_admin", label: "Economy", desc: "Cheapest — flash models", costBand: "$0.001–$0.01", icon: "💰" },
  { key: "balanced_admin", label: "Balanced", desc: "Good quality/cost ratio", costBand: "$0.01–$0.05", icon: "⚖️" },
  { key: "premium_architecture", label: "Premium", desc: "Full reasoning — architecture only", costBand: "$0.05–$0.30", icon: "🏆" },
  { key: "auto", label: "Auto", desc: "Let routing decide", costBand: "varies", icon: "🤖" },
];

export const DEMO_SCOPE_DOMAINS = [
  "architecture", "runtime-truth", "connectors", "ai-governance", "launch-readiness",
  "budget", "data-schema", "device-surface", "quality-ci", "incidents",
];

export const DEMO_ADMIN_AGENTS = [
  { id: "eng-lead", name: "AI Engineering Lead", icon: Brain, domain: "Coordination", watching: "Cross-team synthesis, goal decomposition", currentTask: "Coordinating shell performance sprint", confidence: 92, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 34, recommendations: 12, queueLoad: 3, accuracy: 89, missionIds: ["m-1", "m-2"], findings: 4, nextAction: "Synthesize sprint outcome report" },
  { id: "backend", name: "Backend Engineer", icon: Code, domain: "APIs & Services", watching: "API health, query performance, data models", currentTask: "Optimizing projection cache invalidation", confidence: 88, autonomy: "draft-only", escalation: "none" as const, tasksCompleted: 28, recommendations: 8, queueLoad: 2, accuracy: 86, missionIds: ["m-1"], findings: 3, nextAction: "Submit mutex lock change plan for review" },
  { id: "frontend", name: "Frontend Engineer", icon: Code, domain: "UI & Components", watching: "Route health, render performance, hydration", currentTask: "Fixing broken layout on Mission Control", confidence: 85, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 41, recommendations: 15, queueLoad: 4, accuracy: 84, missionIds: ["m-3"], findings: 6, nextAction: "Complete accessibility sweep — 2 violations left" },
  { id: "design", name: "Design Engineer", icon: Palette, domain: "Visual Quality", watching: "Layout consistency, dark mode, spacing", currentTask: "Proposing admin header redesign", confidence: 79, autonomy: "draft-only", escalation: "none" as const, tasksCompleted: 19, recommendations: 22, queueLoad: 2, accuracy: 79, missionIds: ["m-5"], findings: 8, nextAction: "Finalize before/after for header proposal" },
  { id: "qa", name: "QA / Test Engineer", icon: TestTube, domain: "Quality Assurance", watching: "Test coverage, flaky tests, regressions", currentTask: "Generating tests for approval flow", confidence: 91, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 56, recommendations: 7, queueLoad: 3, accuracy: 88, missionIds: ["m-2"], findings: 2, nextAction: "Replace flaky timing assertions with waitFor" },
  { id: "debugger", name: "Error Fixer / Debugger", icon: Bug, domain: "Error Resolution", watching: "Error clusters, stack traces, user reports", currentTask: "Analyzing /api/projections error spike", confidence: 84, autonomy: "supervised", escalation: "pending" as const, tasksCompleted: 63, recommendations: 31, queueLoad: 5, accuracy: 91, missionIds: ["m-1", "m-4"], findings: 14, nextAction: "Escalate projection race condition to Backend Engineer" },
  { id: "reliability", name: "Reliability Engineer", icon: Shield, domain: "Resilience & Ops", watching: "Incidents, health degradation, retries", currentTask: "Monitoring elevated error rate", confidence: 90, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 22, recommendations: 9, queueLoad: 2, accuracy: 93, missionIds: ["m-1"], findings: 5, nextAction: "Verify error rate returns to baseline after fix" },
  { id: "security", name: "Security Reviewer", icon: Shield, domain: "Security Posture", watching: "Permission issues, secret drift, policies", currentTask: "Reviewing schema migration risk", confidence: 87, autonomy: "observe-only", escalation: "active" as const, tasksCompleted: 14, recommendations: 18, queueLoad: 1, accuracy: 96, missionIds: [], findings: 7, nextAction: "Complete migration risk assessment" },
  { id: "performance", name: "Performance Optimizer", icon: Gauge, domain: "Speed & Efficiency", watching: "Load times, bundle size, query cost", currentTask: "Reducing admin shell initial load", confidence: 76, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 17, recommendations: 11, queueLoad: 2, accuracy: 74, missionIds: ["m-2"], findings: 3, nextAction: "Propose lazy import + prefetch strategy" },
  { id: "docs", name: "Documentation Engineer", icon: FileText, domain: "Docs & Runbooks", watching: "Docs drift, changelog, runbook freshness", currentTask: "Updating deployment runbook", confidence: 93, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 31, recommendations: 5, queueLoad: 0, accuracy: 92, missionIds: [], findings: 1, nextAction: "No pending actions" },
  { id: "release", name: "Release Manager", icon: Rocket, domain: "Release Safety", watching: "Release readiness, smoke gates, rollout risk", currentTask: "Evaluating staging promotion evidence", confidence: 82, autonomy: "supervised", escalation: "none" as const, tasksCompleted: 11, recommendations: 14, queueLoad: 1, accuracy: 85, missionIds: ["m-5"], findings: 4, nextAction: "Resolve performance gate blocker before promotion" },
  { id: "healing", name: "Self-Healing Supervisor", icon: Sparkles, domain: "Auto-Remediation", watching: "Safe auto-fix scope, verification, downgrades", currentTask: "Verifying cache invalidation auto-heal", confidence: 88, autonomy: "auto-low-risk", escalation: "none" as const, tasksCompleted: 47, recommendations: 3, queueLoad: 3, accuracy: 90, missionIds: [], findings: 2, nextAction: "Monitor downgraded layout-restore rule" },
  { id: "learning", name: "Learning Analyst", icon: TrendingUp, domain: "Pattern Discovery", watching: "Recurring failures, operator overrides, trends", currentTask: "Analyzing repeated UI regression pattern", confidence: 71, autonomy: "observe-only", escalation: "none" as const, tasksCompleted: 8, recommendations: 19, queueLoad: 1, accuracy: 71, missionIds: [], findings: 6, nextAction: "Propose permanent fix for flag-rollback pattern" },
];

export const DEMO_ADMIN_TIMELINE = [
  {
    time: "Apr 5, 10:12", event: "Preview deploy v2.15.0-rc2", type: "deploy" as const,
    details: "Added 8 AI Engineering Board pages, updated App.tsx routing",
    impact: "positive" as const, metrics: { errors: "0 new", performance: "No change", tests: "All pass" }
  },
  {
    time: "Apr 5, 09:45", event: "Staging deploy v2.15.0-rc1", type: "deploy" as const,
    details: "Projection cache strategy update + admin shell lazy imports",
    impact: "mixed" as const, metrics: { errors: "+14 projection errors", performance: "Admin LCP 3.2s (+191%)", tests: "2 flaky" }
  },
  {
    time: "Apr 4, 16:30", event: "Feature flag: revenue-sidebar-v2 enabled", type: "config" as const,
    details: "New sidebar layout for Revenue Office activated for 100% of users",
    impact: "negative" as const, metrics: { errors: "+3 render errors", performance: "No change", tests: "N/A" }
  },
  {
    time: "Apr 4, 17:15", event: "Feature flag: revenue-sidebar-v2 reverted", type: "rollback" as const,
    details: "Reliability Engineer auto-reverted after detecting render errors",
    impact: "positive" as const, metrics: { errors: "-3 (resolved)", performance: "Restored", tests: "N/A" }
  },
  {
    time: "Apr 4, 14:22", event: "Production deploy v2.14.3", type: "deploy" as const,
    details: "Cache strategy update, 3 bug fixes, 1 new admin page",
    impact: "positive" as const, metrics: { errors: "0 new", performance: "Slight improvement", tests: "All pass" }
  },
  {
    time: "Apr 3, 11:00", event: "Config: PROJECTION_REBUILD_CONCURRENCY → 5", type: "config" as const,
    details: "Increased from 2 to 5 to speed up projection rebuilds",
    impact: "negative" as const, metrics: { errors: "Contributed to race condition", performance: "Faster rebuilds", tests: "N/A" }
  },
  {
    time: "Apr 2, 11:05", event: "Production deploy v2.14.2", type: "deploy" as const,
    details: "Brand kit refresh, 2 edge function updates",
    impact: "positive" as const, metrics: { errors: "1 minor", performance: "No change", tests: "All pass" }
  },
  {
    time: "Mar 30, 16:40", event: "Production deploy v2.14.1", type: "deploy" as const,
    details: "Approval flow improvements, accessibility fixes",
    impact: "positive" as const, metrics: { errors: "0", performance: "No change", tests: "All pass" }
  },
];

export const DEMO_ADMIN_PROVIDER_CAPS = [
  { key: "android_mobile_shell", label: "Mobile Shell", priority: "P0" },
  { key: "wearos_surface", label: "Wear OS Surface", priority: "P1" },
  { key: "android_push_channel", label: "Push Channel (FCM)", priority: "P0" },
  { key: "android_device_trust", label: "Device Trust", priority: "P0" },
  { key: "android_health_readiness", label: "Health Readiness", priority: "P1" },
];

export const DEMO_TILES = [
  { id: "wmn", name: "What Matters Now", priority: 0, refresh: "30s", layout: "compact", items: 3, sources: ["approvals", "alerts", "tasks"] },
  { id: "pulse", name: "Daily Pulse", priority: 1, refresh: "60s", layout: "expanded", items: 1, sources: ["pulse_score"] },
  { id: "urgent", name: "Urgent Alerts", priority: 0, refresh: "realtime", layout: "list", items: 5, sources: ["critical_alerts"] },
  { id: "schedule", name: "Next Up", priority: 2, refresh: "60s", layout: "compact", items: 2, sources: ["calendar", "tasks"] },
  { id: "focus", name: "Focus State", priority: 3, refresh: "5m", layout: "compact", items: 1, sources: ["focus_mode"] },
];

export const DEMO_MICRO_ACTIONS = [
  { action: "Approve", riskCeiling: "medium", biometric: "wrist_detection", gesture: "tap", feedback: "haptic_success" },
  { action: "Reject", riskCeiling: "medium", biometric: "wrist_detection", gesture: "tap", feedback: "haptic_failure" },
  { action: "Snooze", riskCeiling: "any", biometric: "none", gesture: "swipe", feedback: "haptic_click" },
  { action: "Escalate to Phone", riskCeiling: "any", biometric: "none", gesture: "long_press", feedback: "haptic_direction_up" },
  { action: "Dismiss", riskCeiling: "any", biometric: "none", gesture: "swipe_away", feedback: "none" },
];

export const DEMO_COMPLICATIONS = [
  { name: "Pending Approvals", family: "graphicCircular", update: "realtime", data: "count" },
  { name: "Daily Pulse Score", family: "graphicCorner", update: "hourly", data: "gauge" },
  { name: "Next Action Timer", family: "graphicBezel", update: "per_minute", data: "countdown" },
  { name: "Focus State", family: "graphicCircular", update: "on_change", data: "icon" },
];

export const DEMO_ADMIN_TRUST_CLASSES = [
  { cls: "trusted_phone", label: "Phone", bio: "Fingerprint / Face", keystore: true, playIntegrity: true, riskCeiling: "critical", trustScore: 90, session: "24h" },
  { cls: "trusted_tablet", label: "Tablet", bio: "Fingerprint / Face", keystore: true, playIntegrity: true, riskCeiling: "critical", trustScore: 88, session: "24h" },
  { cls: "trusted_watch", label: "Wear OS", bio: "Wrist detection", keystore: false, playIntegrity: false, riskCeiling: "medium", trustScore: 60, session: "while_worn" },
];

export const DEMO_ESCALATION_MATRIX = [
  { risk: "Low", action: "Approve on any trusted device", bio: "None", escalate: false },
  { risk: "Medium", action: "Biometric required on phone/tablet", bio: "Fingerprint/Face", escalate: false },
  { risk: "High", action: "Phone with biometric + session elevation", bio: "Required + elevated", escalate: true },
  { risk: "Critical", action: "Escalate to web/desktop with MFA", bio: "Required + MFA", escalate: true },
];

export const DEMO_ADMIN_VERIFICATION_EVENTS = [
  { event: "App launch", method: "biometric_or_pin", frequency: "once_per_session" },
  { event: "Approval action", method: "biometric", frequency: "per_action" },
  { event: "Financial transaction", method: "biometric + session_elevation", frequency: "per_action" },
  { event: "Settings change", method: "biometric", frequency: "per_action" },
  { event: "Export data", method: "biometric + mfa", frequency: "per_action" },
];

export const DEMO_ADMIN_SIGNALS = [
  { key: "heart_rate", label: "Heart Rate", unit: "bpm", sensitivity: "high", retention: 90 },
  { key: "steps", label: "Steps", unit: "count", sensitivity: "low", retention: 365 },
  { key: "sleep", label: "Sleep Sessions", unit: "hours", sensitivity: "medium", retention: 180 },
  { key: "exercise", label: "Exercise Sessions", unit: "session", sensitivity: "low", retention: 365 },
  { key: "blood_glucose", label: "Blood Glucose", unit: "mg/dL", sensitivity: "high", retention: 90 },
  { key: "body_temperature", label: "Body Temperature", unit: "°C", sensitivity: "high", retention: 90 },
  { key: "oxygen_saturation", label: "Oxygen Saturation", unit: "%", sensitivity: "high", retention: 90 },
  { key: "respiratory_rate", label: "Respiratory Rate", unit: "brpm", sensitivity: "high", retention: 90 },
  { key: "distance", label: "Distance", unit: "km", sensitivity: "low", retention: 365 },
  { key: "nutrition", label: "Nutrition", unit: "calories", sensitivity: "medium", retention: 180 },
];

export const DEMO_ADMIN_TARGETS = [
  { target: "Android Shell", key: "and_shell", stage: "planned", readiness: 10, demo: false, pilot: false, launch: false, blockers: ["Architecture design", "Material Design implementation"], deps: [], critical: true },
  { target: "Wear OS Shell", key: "and_wearos", stage: "planned", readiness: 8, demo: true, pilot: false, launch: false, blockers: ["Tile SDK integration", "Complication design"], deps: ["and_shell"], critical: false },
  { target: "Android Trust", key: "and_trust", stage: "planned", readiness: 5, demo: false, pilot: false, launch: false, blockers: ["Keystore integration", "SafetyNet flow"], deps: [], critical: true },
  { target: "Android Health", key: "and_health", stage: "planned", readiness: 6, demo: true, pilot: false, launch: false, blockers: ["Health Connect API", "Consent flow design"], deps: ["and_shell"], critical: false },
  { target: "Android Push (FCM)", key: "and_push", stage: "planned", readiness: 12, demo: false, pilot: false, launch: false, blockers: ["FCM setup", "Channel config"], deps: [], critical: true },
];

export const DEMO_ADMIN_PROVIDER_CAPS_A_P_L01_APPLE_ECOSYSTEM_CENTER = [
  { key: "apple_identity", label: "Identity", priority: "P0" },
  { key: "apple_mobile_shell", label: "Mobile Shell", priority: "P0" },
  { key: "apple_watch_surface", label: "Watch Surface", priority: "P1" },
  { key: "apple_health_readiness", label: "Health Readiness", priority: "P1" },
  { key: "apple_push_channel", label: "Push Channel", priority: "P0" },
  { key: "apple_device_trust", label: "Device Trust", priority: "P0" },
  { key: "apple_continuity", label: "Continuity", priority: "P2" },
];

export const DEMO_ADMIN_TRUST_CLASSES_A_P_L02_APPLE_DEVICES_TRUST = [
  { cls: "trusted_iphone", label: "iPhone", bio: "Face ID / Touch ID", riskCeiling: "critical", keychain: true, attestation: true, icon: Smartphone, sessionDuration: "24h", reauth: "biometric", trustScore: 95 },
  { cls: "trusted_ipad", label: "iPad", bio: "Face ID / Touch ID", riskCeiling: "critical", keychain: true, attestation: true, icon: Monitor, sessionDuration: "24h", reauth: "biometric", trustScore: 92 },
  { cls: "trusted_watch", label: "Apple Watch", bio: "Wrist detection", riskCeiling: "medium", keychain: false, attestation: false, icon: Watch, sessionDuration: "while_worn", reauth: "proximity", trustScore: 65 },
  { cls: "trusted_mac", label: "Mac", bio: "Touch ID / Password", riskCeiling: "critical", keychain: true, attestation: true, icon: Monitor, sessionDuration: "8h", reauth: "biometric_or_password", trustScore: 90 },
];

export const DEMO_ESCALATION_RULES = [
  { from: "Watch", to: "iPhone", trigger: "Risk > medium", timeout: "120s", method: "Push + haptic" },
  { from: "iPhone", to: "iPad/Mac", trigger: "Risk = critical + session expired", timeout: "300s", method: "Push notification" },
  { from: "Any device", to: "Web fallback", trigger: "No trusted device available", timeout: "immediate", method: "Email link" },
  { from: "Watch", to: "iPhone", trigger: "Batch approval (>3 items)", timeout: "immediate", method: "Deep link handoff" },
];

export const DEMO_ADMIN_VERIFICATION_EVENTS_A_P_L02_APPLE_DEVICES_TRUST = [
  { event: "App launch", requires: "biometric_or_passcode", frequency: "once_per_session", risk: "n/a" },
  { event: "Approval action", requires: "biometric", frequency: "per_action", risk: "medium+" },
  { event: "Financial transaction", requires: "biometric + session_elevation", frequency: "per_action", risk: "high+" },
  { event: "Settings change", requires: "biometric", frequency: "per_action", risk: "medium+" },
  { event: "Export data", requires: "biometric + mfa", frequency: "per_action", risk: "critical" },
  { event: "Device revocation", requires: "biometric + mfa + cooldown", frequency: "per_action", risk: "critical" },
];

export const DEMO_GLANCE_CARDS = [
  { id: "wmn", name: "What Matters Now", priority: 1, refresh: "30s", maxItems: 3, sources: ["approvals", "alerts", "tasks"], interaction: "tap → open on phone" },
  { id: "pulse", name: "Daily Pulse", priority: 2, refresh: "60s", maxItems: 1, sources: ["pulse_score", "key_metric"], interaction: "tap → expand" },
  { id: "urgent", name: "Urgent Alerts", priority: 0, refresh: "realtime", maxItems: 5, sources: ["critical_alerts", "incidents"], interaction: "tap → detail + action" },
  { id: "schedule", name: "Next Up", priority: 3, refresh: "60s", maxItems: 2, sources: ["calendar", "tasks"], interaction: "tap → detail" },
];

export const DEMO_HAPTIC_PATTERNS = [
  { pattern: "Urgent Alert", type: "notification", intensity: "strong", repeat: 2, desc: "Two strong taps — demands attention" },
  { pattern: "Approval Request", type: "success", intensity: "medium", repeat: 1, desc: "Single confirmation tap" },
  { pattern: "Gentle Nudge", type: "click", intensity: "light", repeat: 1, desc: "Subtle reminder" },
  { pattern: "Escalation Warning", type: "directionUp", intensity: "strong", repeat: 3, desc: "Rising pattern — action needed soon" },
  { pattern: "Timer Expiry", type: "failure", intensity: "medium", repeat: 2, desc: "Double tap — time's up" },
  { pattern: "Silent Pulse", type: "selection", intensity: "light", repeat: 1, desc: "Ambient awareness — no action needed" },
];

export const DEMO_MICRO_CONSTRAINTS = [
  { label: "Max pending approvals", value: "5", desc: "Queue excess to phone" },
  { label: "Risk ceiling", value: "medium", desc: "High+ escalates to phone" },
  { label: "Biometric", value: "wrist detection", desc: "Passive verification only" },
  { label: "Batch actions", value: "not supported", desc: "One-at-a-time only" },
  { label: "Auto-escalate timeout", value: "120s", desc: "No response → push to phone" },
  { label: "Max text input", value: "none", desc: "Voice dictation or preset replies" },
  { label: "Offline support", value: "queue + sync", desc: "Actions queued for next sync" },
  { label: "Complication slots", value: "4 available", desc: "Pending, pulse, focus, timer" },
];

export const DEMO_IDENTITY_ARCHITECTURE = [
  { field: "Provider", value: "apple_sign_in", badge: "primary" },
  { field: "Protocol", value: "OAuth 2.0 + OIDC", badge: "outline" },
  { field: "Session model", value: "JWT (httpOnly cookie)", badge: "outline" },
  { field: "Email relay", value: "Private relay supported", badge: "outline" },
  { field: "Device-bound trust", value: "Linkable via DCAppAttest", badge: "outline" },
  { field: "Identity graph", value: "Unified across providers", badge: "outline" },
  { field: "Token refresh", value: "Silent refresh via refresh_token", badge: "outline" },
  { field: "Revocation", value: "Supported (user-initiated + admin)", badge: "outline" },
];

export const DEMO_LINK_FLOW_STEPS = [
  { step: 1, icon: User, label: "User taps Sign in with Apple", detail: "Native AuthenticationServices dialog presented" },
  { step: 2, icon: Shield, label: "Apple verifies identity", detail: "Face ID / Touch ID + Apple ID password" },
  { step: 3, icon: Mail, label: "Email decision", detail: "User chooses real email or Apple private relay" },
  { step: 4, icon: KeyRound, label: "Authorization code issued", detail: "One-time auth code sent to SITA backend" },
  { step: 5, icon: Lock, label: "Backend validates + creates session", detail: "Exchange code for ID token, create/link profile" },
  { step: 6, icon: Link, label: "Apple ID linked to identity graph", detail: "Unified identity with device trust context" },
  { step: 7, icon: Fingerprint, label: "Device trust registered", detail: "Current device added to trusted devices list" },
];

export const DEMO_SECURITY_POLICIES = [
  { policy: "Token lifetime", value: "15 minutes (access) / 7 days (refresh)", severity: "medium" },
  { policy: "Concurrent sessions", value: "Max 5 devices", severity: "medium" },
  { policy: "Session revocation", value: "Immediate on user request", severity: "high" },
  { policy: "Credential rotation", value: "Automatic on Apple-side changes", severity: "high" },
  { policy: "MFA requirement", value: "Apple's built-in 2FA", severity: "critical" },
  { policy: "Account deletion", value: "Full data erasure within 30 days", severity: "critical" },
  { policy: "Cross-provider linking", value: "Manual confirmation required", severity: "high" },
];

export const DEMO_ADMIN_SIGNALS_A_P_L05_APPLE_HEALTH_CONSENT = [
  { key: "heart_rate", label: "Heart Rate", unit: "bpm", sensitivity: "high", retentionDays: 90 },
  { key: "hrv", label: "Heart Rate Variability", unit: "ms", sensitivity: "high", retentionDays: 90 },
  { key: "sleep", label: "Sleep Analysis", unit: "hours", sensitivity: "medium", retentionDays: 180 },
  { key: "steps", label: "Step Count", unit: "count", sensitivity: "low", retentionDays: 365 },
  { key: "vo2max", label: "VO2 Max", unit: "mL/kg/min", sensitivity: "medium", retentionDays: 365 },
  { key: "workout", label: "Workout Sessions", unit: "session", sensitivity: "low", retentionDays: 365 },
  { key: "stand_hours", label: "Stand Hours", unit: "hours", sensitivity: "low", retentionDays: 180 },
  { key: "respiratory_rate", label: "Respiratory Rate", unit: "brpm", sensitivity: "high", retentionDays: 90 },
  { key: "blood_oxygen", label: "Blood Oxygen", unit: "%", sensitivity: "high", retentionDays: 90 },
  { key: "resting_hr", label: "Resting Heart Rate", unit: "bpm", sensitivity: "medium", retentionDays: 180 },
];

export const DEMO_ADMIN_TARGETS_A_P_L06_APPLE_LAUNCH_READINESS = [
  { target: "iPhone Shell", key: "apl_iphone", stage: "alpha", readiness: 35, demo: true, pilot: false, launch: false, blockers: ["Core navigation shell", "Push integration"], deps: ["apple_identity"], critical: true },
  { target: "iPad Shell", key: "apl_ipad", stage: "planned", readiness: 8, demo: false, pilot: false, launch: false, blockers: ["Awaiting iPhone shell", "Tablet layout design"], deps: ["apl_iphone"], critical: false },
  { target: "Apple Watch", key: "apl_watch", stage: "planned", readiness: 12, demo: true, pilot: false, launch: false, blockers: ["WatchKit integration", "Complication design"], deps: ["apl_iphone"], critical: false },
  { target: "Sign in with Apple", key: "apl_identity", stage: "planned", readiness: 5, demo: false, pilot: false, launch: false, blockers: ["Apple Developer Program", "Identity provider integration"], deps: [], critical: true },
  { target: "Apple Health", key: "apl_health", stage: "planned", readiness: 10, demo: true, pilot: false, launch: false, blockers: ["HealthKit permissions", "Consent UI", "Privacy review"], deps: ["apl_iphone", "apl_identity"], critical: false },
  { target: "Apple Continuity", key: "apl_continuity", stage: "planned", readiness: 3, demo: false, pilot: false, launch: false, blockers: ["Native app on both surfaces", "Handoff API"], deps: ["apl_iphone", "apl_ipad"], critical: false },
  { target: "Device Trust", key: "apl_trust", stage: "planned", readiness: 8, demo: false, pilot: false, launch: false, blockers: ["Biometric verification flow", "Trust receipt architecture"], deps: ["apl_identity"], critical: true },
];

export const DEMO_ADMIN_SCOPES = [
  { scope: "global", label: "Global Kill Switch", description: "Stops ALL recurring automation", icon: Shield, color: "text-destructive" },
  { scope: "domain", scope_id: "self-healing", label: "Self-Healing", description: "Disable self-healing execution", icon: Heart, color: "text-accent" },
  { scope: "domain", scope_id: "agent", label: "Agent Execution", description: "Disable agent scheduler jobs", icon: Bot, color: "text-primary" },
  { scope: "domain", scope_id: "maintenance", label: "Maintenance", description: "Disable system maintenance jobs", icon: Wrench, color: "text-muted-foreground" },
  { scope: "job_class", scope_id: "agent_heartbeat", label: "Agent Heartbeats", description: "Disable heartbeat checks only", icon: Zap, color: "text-accent" },
];

export const DEMO_RINGS: DeploymentRing[] = [
  { name: "Development", status: "deployed", version: "v2.14.0-dev.42", deployedAt: "2h ago", health: 100, instances: 1, errorRate: 0 },
  { name: "Staging", status: "deployed", version: "v2.13.1-rc.3", deployedAt: "1d ago", health: 98, instances: 2, errorRate: 0.2 },
  { name: "Canary", status: "canary", version: "v2.13.1-rc.3", deployedAt: "6h ago", health: 96, instances: 1, errorRate: 0.8 },
  { name: "Production (Ring 1)", status: "pending", version: "v2.13.0", deployedAt: "3d ago", health: 99, instances: 4, errorRate: 0.1 },
  { name: "Production (Ring 2)", status: "blocked", version: "v2.12.4", deployedAt: "1w ago", health: 99, instances: 8, errorRate: 0.05 },
];

export const DEMO_PROMOTION_GATES: PromotionGate[] = [
  { name: "Unit Tests", status: "passed", description: "All unit tests passing", evidence: "342/342 passed", checkedAt: "2h ago" },
  { name: "Integration Tests", status: "passed", description: "API and DB integration tests", evidence: "89/89 passed", checkedAt: "2h ago" },
  { name: "Type Safety", status: "passed", description: "TypeScript strict mode", evidence: "0 errors", checkedAt: "2h ago" },
  { name: "Security Scan", status: "passed", description: "Dependency vulnerability scan", evidence: "0 critical, 2 low", checkedAt: "1h ago" },
  { name: "RLS Policy Audit", status: "passed", description: "All tables have RLS enabled", evidence: "48/48 tables covered", checkedAt: "1h ago" },
  { name: "Performance Budget", status: "passed", description: "Bundle size and LCP within budget", evidence: "Bundle: 412KB, LCP: 1.2s", checkedAt: "1h ago" },
  { name: "Canary Health", status: "pending", description: "Canary error rate < 1% for 2h", evidence: "Current: 0.8%, elapsed: 45min", checkedAt: "45m ago", blocker: true },
  { name: "Manual Approval", status: "pending", description: "Operator sign-off required", blocker: true },
  { name: "Rollback Plan", status: "passed", description: "Verified rollback procedure exists", evidence: "Rollback script validated", checkedAt: "2h ago" },
  { name: "Data Migration", status: "skipped", description: "No schema changes in this release" },
];

export const DEMO_ADMIN_ENVIRONMENTS_ADMIN_DEPLOYMENT_RINGS = [
  { name: "Development", status: "healthy", version: "v2.14.0-dev.42", uptime: "99.9%", lastDeploy: "2h ago", features: ["hot-reload", "debug-mode", "mock-data"] },
  { name: "Staging", status: "healthy", version: "v2.13.1-rc.3", uptime: "99.5%", lastDeploy: "1d ago", features: ["seeded-data", "integration-tests"] },
  { name: "Production", status: "healthy", version: "v2.13.0", uptime: "99.99%", lastDeploy: "3d ago", features: ["full-rls", "monitoring", "alerting"] },
];

export const DEMO_ADMIN_ALERTS = [
  { id: "a1", title: "Connector Slack sync lag >15m", severity: "high" as const, source: "connector-monitor", time: "2m ago", runbook: "connector-resync", status: "active" },
  { id: "a2", title: "Workflow engine p99 latency >200ms", severity: "medium" as const, source: "apm-agent", time: "8m ago", runbook: "workflow-perf", status: "active" },
  { id: "a3", title: "Event bus consumer group rebalance", severity: "low" as const, source: "kafka-monitor", time: "12m ago", status: "suppressed" },
  { id: "a4", title: "Memory pressure on projection-worker", severity: "medium" as const, source: "infra-monitor", time: "22m ago", runbook: "scale-projection", status: "active" },
];

export const DEMO_SLOS = [
  { name: "API Availability", target: 99.95, current: 99.98, burnRate: 0.8 },
  { name: "API Latency p99", target: 500, current: 320, burnRate: 0.3, unit: "ms" },
  { name: "Incident Response", target: 15, current: 8, burnRate: 0.5, unit: "min" },
  { name: "Deployment Success", target: 99.0, current: 100, burnRate: 0.0 },
];

export const DEMO_RUNBOOKS = [
  { id: "rb1", name: "Connector Resync", steps: 4, avgTime: "3m", lastUsed: "1d ago" },
  { id: "rb2", name: "Workflow Perf Triage", steps: 6, avgTime: "8m", lastUsed: "3d ago" },
  { id: "rb3", name: "Scale Projection Worker", steps: 3, avgTime: "2m", lastUsed: "5d ago" },
  { id: "rb4", name: "Database Failover", steps: 8, avgTime: "15m", lastUsed: "30d ago" },
];

export const DEMO_MODELS: ReadModel[] = [
  { id: "rm-1", name: "Dashboard Metrics", source: "events → aggregator", freshness: "fresh", lagMs: 450, lastRebuilt: "2026-04-05T10:20:00Z", affectedSurfaces: ["AdminDashboard", "MissionControl"], eventToProjectionDelay: 450, rebuildSuccess: true },
  { id: "rm-2", name: "Incident Summary", source: "incidents → materializer", freshness: "fresh", lagMs: 200, lastRebuilt: "2026-04-05T10:22:00Z", affectedSurfaces: ["IncidentCommand"], eventToProjectionDelay: 200, rebuildSuccess: true },
  { id: "rm-3", name: "Connector Health", source: "connector_sync → projector", freshness: "stale", lagMs: 18500, lastRebuilt: "2026-04-05T09:55:00Z", affectedSurfaces: ["ConnectorGovernance", "MissionControl"], eventToProjectionDelay: 18500, rebuildSuccess: true },
  { id: "rm-4", name: "Proof Coverage Matrix", source: "audit_logs → proof_builder", freshness: "fresh", lagMs: 800, lastRebuilt: "2026-04-05T10:19:00Z", affectedSurfaces: ["ProofMatrix"], eventToProjectionDelay: 800, rebuildSuccess: true },
  { id: "rm-5", name: "Fleet Predictions", source: "device_statuses → ml_pipeline", freshness: "degraded", lagMs: 65000, lastRebuilt: "2026-04-05T08:30:00Z", affectedSurfaces: ["FleetHealth", "IntelligenceDashboard"], eventToProjectionDelay: 65000, rebuildSuccess: false },
  { id: "rm-6", name: "Revenue Analytics", source: "invoices → revenue_projector", freshness: "fresh", lagMs: 1200, lastRebuilt: "2026-04-05T10:18:00Z", affectedSurfaces: ["RevenueOffice"], eventToProjectionDelay: 1200, rebuildSuccess: true },
];

export const DEMO_CLAIMS: TruthClaim[] = [
  { id: "tc-1", capability: "User Authentication", claimedStatus: "Fully operational with RLS", runtimeEvidence: "Auth endpoints responding, RLS policies active", status: "verified", severity: "low", lastChecked: "2026-04-05T10:20:00Z" },
  { id: "tc-2", capability: "Real-time Subscriptions", claimedStatus: "Active on all tables", runtimeEvidence: "Only 12/45 tables have realtime enabled", status: "drift", severity: "high", lastChecked: "2026-04-05T10:15:00Z", remediation: "Enable realtime on remaining tables or update documentation" },
  { id: "tc-3", capability: "Edge Function Auto-deploy", claimedStatus: "All functions auto-deploy on push", runtimeEvidence: "Deployment pipeline active", status: "verified", severity: "low", lastChecked: "2026-04-05T10:18:00Z" },
  { id: "tc-4", capability: "Backup & Recovery", claimedStatus: "Daily automated backups with PITR", runtimeEvidence: "Last backup timestamp found, PITR status unconfirmed", status: "unverified", severity: "medium", lastChecked: "2026-04-04T23:00:00Z", remediation: "Verify PITR configuration in Supabase dashboard" },
  { id: "tc-5", capability: "AI Advisory System", claimedStatus: "Multi-advisor with memory", runtimeEvidence: "Advisor configs exist, memory tables populated", status: "verified", severity: "low", lastChecked: "2026-04-05T10:10:00Z" },
  { id: "tc-6", capability: "Connector Health Monitoring", claimedStatus: "Real-time health checks every 5m", runtimeEvidence: "Last health check was 45m ago", status: "stale", severity: "medium", lastChecked: "2026-04-05T09:35:00Z", remediation: "Investigate health-check scheduler" },
];

export const DEMO_ADMIN_ALERTS_ALERT_TRIAGE_BOARD: Alert[] = [
  { id: "al-1", title: "Database connection pool exhaustion", severity: "critical", status: "active", source: "db-monitor", cluster: "database", timeToBreachMin: 5, runbookId: "rb-db-pool", createdAt: "2026-04-05T10:22:00Z", likelyImpact: "API failures, user-facing errors" },
  { id: "al-2", title: "Connector Slack OAuth token expiring", severity: "high", status: "active", source: "connector-health", cluster: "connectors", timeToBreachMin: 120, runbookId: "rb-conn-refresh", createdAt: "2026-04-05T10:15:00Z", likelyImpact: "Slack integration failure" },
  { id: "al-3", title: "Workflow engine memory pressure", severity: "medium", status: "acknowledged", source: "k8s-monitor", cluster: "compute", assignee: "ops-team", createdAt: "2026-04-05T09:50:00Z", likelyImpact: "Workflow processing delays" },
  { id: "al-4", title: "SSL certificate renewal due in 14d", severity: "low", status: "active", source: "cert-monitor", createdAt: "2026-04-05T08:00:00Z", likelyImpact: "None if renewed on time" },
  { id: "al-5", title: "Duplicate event bus messages detected", severity: "medium", status: "suppressed", source: "event-bus", cluster: "messaging", createdAt: "2026-04-05T09:30:00Z", likelyImpact: "Idempotency handling required" },
];

export const DEMO_ARCHETYPE_DOCS = [
  { key: "boardroom", label: "Boardroom", desc: "Executive synthesis surface with advisor views and overlays", files: ["BoardroomPage.tsx", "SynthesisPanel.tsx", "AdvisorOverlay.tsx"], contracts: ["synthesis-contract", "advisor-panel-contract"] },
  { key: "office", label: "Office / Workspace", desc: "Full workspace with panels, actions, and deep domain logic", files: ["OfficePage.tsx", "PanelRegistry.tsx", "ActionCenter.tsx"], contracts: ["workspace-contract", "panel-registry-contract"] },
  { key: "workflow", label: "Workflow", desc: "Multi-step process with approvals and state transitions", files: ["WorkflowPage.tsx", "StepRenderer.tsx", "ApprovalGate.tsx"], contracts: ["workflow-definition-contract", "approval-contract"] },
  { key: "dashboard", label: "Dashboard", desc: "KPI overview with charts and status summaries", files: ["DashboardPage.tsx", "KPICards.tsx", "ChartPanel.tsx"], contracts: ["kpi-contract", "chart-data-contract"] },
  { key: "crud", label: "CRUD Surface", desc: "Entity management with create/read/update/delete", files: ["EntityList.tsx", "EntityForm.tsx", "EntityDetail.tsx"], contracts: ["entity-contract", "validation-contract"] },
  { key: "connector-flow", label: "Connector Flow", desc: "Integration setup with auth, mapping, and health", files: ["ConnectorSetup.tsx", "MappingEditor.tsx", "HealthMonitor.tsx"], contracts: ["connector-auth-contract", "sync-contract"] },
  { key: "intelligence", label: "Intelligence Surface", desc: "AI analysis with confidence, evidence, recommendations", files: ["AnalysisPage.tsx", "ConfidenceBand.tsx", "EvidencePanel.tsx"], contracts: ["analysis-contract", "confidence-contract"] },
  { key: "admin-control", label: "Admin Control", desc: "System admin with config, monitoring, governance", files: ["AdminPage.tsx", "ConfigPanel.tsx", "GovernanceBoard.tsx"], contracts: ["policy-contract", "governance-contract"] },
];

export const DEMO_VERIFICATION_CHECKS: VerificationCheck[] = [
  { label: "OAuth Configured", check: ({ oauthConfig }) => oauthConfig?.google_oauth_configured === true },
  { label: "Registry Seeded", check: ({ registry }) => registry.some((r: Record<string, any>) => r.connector_class === "real") },
  { label: "Callback Verified", check: ({ receipts }) => receipts.some((r: Record<string, any>) => r.event_type === "oauth_connect") },
  { label: "Token Exchange", check: ({ tokens }) => tokens.length > 0 },
  { label: "Connected Accounts", check: ({ accounts }) => accounts.some((a: Record<string, any>) => a.status === "connected" && !a.demo_mode) },
  { label: "Reauth Flow", check: ({ tokens }) => tokens.some((t: Record<string, any>) => t.refresh_token) },
  { label: "Disconnect Flow", check: ({ receipts }) => receipts.some((r: Record<string, any>) => r.event_type === "disconnect") },
];

export const DEMO_ADMIN_CAPABILITIES = [
  { key: "google_drive", label: "Google Drive", scopes: ["drive.readonly"] },
  { key: "google_gmail", label: "Gmail", scopes: ["gmail.readonly"] },
  { key: "google_calendar", label: "Google Calendar", scopes: ["calendar.readonly"] },
];

export const DEMO_TENANT_SPEND = [
  { tenantId: "t-1", name: "Acme Corp", plan: "Business" as PlanTier, spend: 12400, budget: 15000, margin: 68, cacheHit: 0.72, anomalies: 0, deepUsed: 180, deepCap: 300 },
  { tenantId: "t-2", name: "Household Smith", plan: "Professional" as PlanTier, spend: 2100, budget: 3000, margin: 74, cacheHit: 0.65, anomalies: 1, deepUsed: 40, deepCap: 120 },
  { tenantId: "t-3", name: "Solo User", plan: "Starter" as PlanTier, spend: 380, budget: 500, margin: 52, cacheHit: 0.45, anomalies: 0, deepUsed: 8, deepCap: 30 },
];

export const DEMO_AGENT_SPEND = [
  { agentId: "finance-advisor", name: "Finance Advisor", tokens: 284000, cost: 420, calls: 1240, tier: "standard" as ComputeModelTier },
  { agentId: "monitor-agent", name: "Proactive Monitor", tokens: 890000, cost: 180, calls: 12400, tier: "utility" as ComputeModelTier },
  { agentId: "strategy-agent", name: "Strategy Synthesizer", tokens: 64000, cost: 960, calls: 32, tier: "premium" as ComputeModelTier },
  { agentId: "self-heal", name: "Self-Healing Agent", tokens: 120000, cost: 95, calls: 340, tier: "utility" as ComputeModelTier },
];

export const DEMO_ANOMALIES = [
  { id: "a1", type: "retry-storm", severity: "warning" as const, tenant: "Household Smith", desc: "12 retries on portfolio analysis in 5min", suggested: "pause-autonomy", time: "2min ago", confidence: 92, affectedAgents: ["Finance Advisor"], estimatedWaste: 340 },
  { id: "a2", type: "low-cache-efficiency", severity: "info" as const, tenant: "Solo User", desc: "Cache hit rate only 12% — optimization available", suggested: "digest-mode", time: "15min ago", confidence: 78, affectedAgents: ["Monitor"], estimatedWaste: 120 },
  { id: "a3", type: "burn-spike", severity: "critical" as const, tenant: "Acme Corp", desc: "Spend increased 340% vs daily average — runaway automation loop suspected", suggested: "pause-agent", time: "6min ago", confidence: 96, affectedAgents: ["Growth Agent"], estimatedWaste: 890 },
  { id: "a4", type: "duplicate-action", severity: "info" as const, tenant: "Acme Corp", desc: "Same SEO audit requested 4 times — dedup suggested", suggested: "dedup-merge", time: "42min ago", confidence: 85, affectedAgents: ["Content Advisor"], estimatedWaste: 200 },
];

export const DEMO_BUDGETS: BudgetEnvelope[] = [
  { ...createEnvelope("tenant", "t-1", "t-1", "Acme Corp — Monthly", 15000, 300), spentCents: 12400, remainingCents: 2600, deepReasoningMinutesUsed: 180, proactiveInferenceSpentCents: 3200, retrySpentCents: 420, retriesUsed: 6, status: "approaching" },
  { ...createEnvelope("workspace", "ws-1", "t-1", "Finance Workspace", 5000, 120), spentCents: 3800, remainingCents: 1200, deepReasoningMinutesUsed: 90, status: "warning" },
  { ...createEnvelope("agent", "a-1", "t-2", "Strategy Synthesizer", 2000, 60), spentCents: 960, remainingCents: 1040, deepReasoningMinutesUsed: 28, status: "healthy" },
  { ...createEnvelope("mission", "m-1", "t-1", "Q2 Tax Optimization", 800, 30), spentCents: 620, remainingCents: 180, deepReasoningMinutesUsed: 22, status: "warning" },
  { ...createEnvelope("domain", "d-1", "t-1", "Finance Domain", 8000, 200), spentCents: 5600, remainingCents: 2400, deepReasoningMinutesUsed: 120, status: "approaching" },
  { ...createEnvelope("environment", "e-1", "t-1", "Production Env", 12000, 250), spentCents: 8900, remainingCents: 3100, deepReasoningMinutesUsed: 160, status: "healthy" },
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
