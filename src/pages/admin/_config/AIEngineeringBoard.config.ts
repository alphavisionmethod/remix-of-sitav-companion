// ═══════════════════════════════════════════════════════════════
// AIEngineeringBoard — UI catalog (Wave 9.2)
//
// Authored engineering catalog: missions, release gates, agent
// signals, attention items, change feed, learning highlights,
// overview band, recent heals, AI team, fix queue, env list.
// Live mission/fix data comes from useAIEngineeringData; this
// file provides the operator-facing baseline + visual config.
// ═══════════════════════════════════════════════════════════════

import { Brain, Bug, Gauge, Rocket, ShieldCheck, FileCheck, Target, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

export interface MissionRow {
  title: string;
  status: "in_progress" | "simulated" | "ready_for_approval" | "blocked" | "applied" | "learned_from";
  confidence: number;
  progress: number;
  agent: string;
  blocker?: string;
}

export interface ReleaseGate {
  gate: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}

export interface AgentSignal {
  name: string;
  signal: string;
  confidence: number;
  tasks: number;
  escalation: boolean;
}

export interface AttentionItem {
  title: string;
  agent: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  time: string;
}

export interface ChangeEntry {
  action: string;
  agent: string;
  type: "auto-heal" | "rollback" | "blocked" | "proposal" | "shipped";
  time: string;
}

export interface LearningHighlight {
  type: string;
  detail: string;
  confidence: number;
}

export interface OverviewBandCard {
  label: string;
  value: string;
  bg: string;
  color: string;
  icon: ComponentType<{ className?: string }>;
}

export interface RecentHeal {
  action: string;
  time: string;
  verified: boolean;
}

export interface FixQueueItem {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  confidence: number;
  autoFix: boolean;
}

export interface EnvironmentRow {
  env: string;
  version: string;
  status: "healthy" | "warning";
  confidence: number;
  deployedAt: string;
  drift: string;
}

export const HEAL_STATS = { attempted: 12, verified: 11, blocked: 3, rolledBack: 1 };

/** Authored mission baseline. */
export const ENG_MISSIONS: MissionRow[] = [
  { title: "Stabilize admin shell first-paint under 250ms", status: "in_progress", confidence: 82, progress: 64, agent: "Performance Optimizer" },
  { title: "Promote AI digest cache to v2 (20% cost cut)", status: "ready_for_approval", confidence: 91, progress: 100, agent: "Cost Engineer" },
  { title: "Migrate concierge bookings to receipt-emitter v2", status: "in_progress", confidence: 76, progress: 42, agent: "Backend Engineer", blocker: "Awaiting connector resync" },
  { title: "Repair projection cache for /admin/durability", status: "simulated", confidence: 88, progress: 78, agent: "Frontend Engineer" },
  { title: "Tighten admin truth manifest (Wave 9.2)", status: "in_progress", confidence: 95, progress: 56, agent: "Architecture Auditor" },
];

/** Authored release gates rendered in the Releases tab. */
export const ENG_RELEASE_GATES: ReleaseGate[] = [
  { gate: "Build clean", status: "pass", detail: "tsc + lint + build all green" },
  { gate: "Unit tests", status: "pass", detail: "Vitest suite passing" },
  { gate: "Truth-checker", status: "warn", detail: "Admin truth still has degraded entries" },
  { gate: "Performance", status: "pass", detail: "p95 stable vs. last green" },
];

/** Authored AI team / agent signals. */
export const ENG_AGENT_SIGNALS: AgentSignal[] = [
  { name: "Architecture Auditor", signal: "Watching plane boundaries for new violations", confidence: 96, tasks: 4, escalation: false },
  { name: "Performance Optimizer", signal: "Tracking shell first-paint regression", confidence: 88, tasks: 2, escalation: false },
  { name: "Cost Engineer", signal: "Cache v2 promotion ready for approval", confidence: 91, tasks: 1, escalation: true },
  { name: "Frontend Engineer", signal: "Projection cache repair in flight", confidence: 84, tasks: 3, escalation: false },
  { name: "Backend Engineer", signal: "Concierge receipt migration paused", confidence: 76, tasks: 2, escalation: false },
  { name: "Security Auditor", signal: "No new exposure detected", confidence: 99, tasks: 0, escalation: false },
];

/** Authored attention queue. */
export const ENG_ATTENTION: AttentionItem[] = [
  { title: "Cache v2 promotion ready — please approve", agent: "Cost Engineer", type: "approval-needed", severity: "high", time: "12m ago" },
  { title: "Concierge receipt migration paused — connector resync required", agent: "Backend Engineer", type: "blocker", severity: "high", time: "1h ago" },
  { title: "Truth-checker still warns on Admin Wave A pages", agent: "Architecture Auditor", type: "drift", severity: "medium", time: "2h ago" },
];

/** Authored change feed. */
export const ENG_CHANGES: ChangeEntry[] = [
  { action: "Auto-healed broken sidebar navigation on /admin/durability", agent: "Frontend Engineer", type: "auto-heal", time: "8m ago" },
  { action: "Rolled back failed promotion of release v2.13.2", agent: "Release Manager", type: "rollback", time: "yesterday" },
  { action: "Blocked autonomous tier-D deep reasoning on Free plan", agent: "Cost Engineer", type: "blocked", time: "2d ago" },
  { action: "Proposed admin manifest reclassification for 200 pages", agent: "Architecture Auditor", type: "proposal", time: "3d ago" },
  { action: "Shipped admin truth-checker (Phase 9.1 baseline)", agent: "Architecture Auditor", type: "shipped", time: "3d ago" },
];

/** Authored learning highlights. */
export const ENG_LEARNING: LearningHighlight[] = [
  { type: "pattern", detail: "Auto-heal success rises to 92% when paired with simulation", confidence: 94 },
  { type: "anti-pattern", detail: "Direct edits to src/integrations/supabase/types.ts always regress", confidence: 99 },
  { type: "heuristic", detail: "Receipt linkage dramatically improves rollback safety", confidence: 91 },
];

/** Authored overview band. */
export const ENG_OVERVIEW_BAND: OverviewBandCard[] = [
  { label: "Active Missions", value: "5", bg: "bg-primary/10", color: "text-primary", icon: Target },
  { label: "Open Fixes", value: "7", bg: "bg-amber-500/10", color: "text-amber-500", icon: Bug },
  { label: "Self-Heals", value: "11", bg: "bg-[hsl(var(--trust-safe))]/10", color: "text-[hsl(var(--trust-safe))]", icon: Sparkles },
  { label: "Approvals", value: "3", bg: "bg-primary/10", color: "text-primary", icon: FileCheck },
  { label: "Release Conf", value: "82%", bg: "bg-primary/10", color: "text-primary", icon: Rocket },
  { label: "Latency p95", value: "185ms", bg: "bg-amber-500/10", color: "text-amber-500", icon: Gauge },
  { label: "Truth Score", value: "94%", bg: "bg-[hsl(var(--trust-safe))]/10", color: "text-[hsl(var(--trust-safe))]", icon: ShieldCheck },
  { label: "AI Team", value: "8", bg: "bg-primary/10", color: "text-primary", icon: Brain },
];

/** Authored recent heals. */
export const ENG_RECENT_HEALS: RecentHeal[] = [
  { action: "Re-rendered stale projection card on /admin/durability", time: "8m ago", verified: true },
  { action: "Recovered failed connector ping for Slack workspace", time: "32m ago", verified: true },
  { action: "Rebuilt corrupted cache for AI digest v2", time: "1h ago", verified: true },
  { action: "Restored missing aria-labels on /admin/operations sidebar", time: "2h ago", verified: false },
];

/** Authored fix queue. */
export const ENG_FIX_QUEUE: FixQueueItem[] = [
  { title: "Elevated 500 errors on /api/projections/rebuild", severity: "critical", confidence: 87, autoFix: false },
  { title: "Broken navigation on /admin/durability", severity: "high", confidence: 96, autoFix: true },
  { title: "Slow page load on Revenue Office (>3s)", severity: "high", confidence: 78, autoFix: false },
  { title: "Accessibility: missing aria-labels on sidebar", severity: "medium", confidence: 94, autoFix: true },
  { title: "Visual drift: card border radius inconsistency", severity: "low", confidence: 92, autoFix: true },
];

/** Authored release environments. */
export const ENG_ENVIRONMENTS: EnvironmentRow[] = [
  { env: "Production", version: "v2.14.0", status: "healthy", confidence: 96, deployedAt: "2026-04-08T10:30:00Z", drift: "0 patches" },
  { env: "Staging", version: "v2.15.0-rc.3", status: "warning", confidence: 78, deployedAt: "2026-04-10T08:15:00Z", drift: "+12 commits" },
  { env: "Preview", version: "v2.15.0-rc.4", status: "healthy", confidence: 88, deployedAt: "2026-04-10T11:45:00Z", drift: "+1 commit" },
];