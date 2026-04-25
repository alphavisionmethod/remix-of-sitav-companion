// ═══════════════════════════════════════════════════════════════
// SITA OS — Boardroom Kernel (Phase 7)
// Cross-advisor synthesis layer. Reads from the autonomy fleet's
// recent outputs (signals, queued plans, reflections, simulation
// receipts) and emits unified Boardroom Themes — a derived view
// that:
//   • clusters proposals by domain and signal kind,
//   • highlights conflicts (one advisor wants X, another not-X),
//   • surfaces emergent patterns from reflections,
//   • ranks themes by urgency × confidence × scope.
//
// The Kernel is PURE for testability: scoring + clustering live in
// `synthesizeBoardroomThemes()` below. The hook layer wraps the DB
// fetches and feeds inputs to the kernel.
//
// L3 invariant: Themes never trigger execution. They only help the
// owner see the whole board at a glance and decide where to focus.
// ═══════════════════════════════════════════════════════════════

export type ThemeKind =
  | "consensus"      // multiple advisors converging on the same recommendation
  | "conflict"       // two advisors proposing opposite actions in same domain
  | "emergent"       // pattern surfaced from repeated reflections
  | "stalled"        // queue items waiting > N hours
  | "breaker_storm"; // multiple breakers tripped recently

export type KernelInputQueueItem = {
  id: string;
  advisor_id: string;
  domain: string;
  action_type: string;
  summary: string;
  confidence: number;
  status: string;          // awaiting_approval | executed | rejected | failed
  created_at: string;
  payload?: { risk_class?: string; financial_impact_cents?: number } | null;
};

export type KernelInputReflection = {
  id: string;
  advisor_id: string;
  outcome_quality: number | null;
  execution_fitness_score: number | null;
  recommendation_quality_score: number | null;
  should_repeat: boolean | null;
  pattern_tags: unknown;
  owner_action: string;
  created_at: string;
  lesson_learned: string | null;
};

export type KernelInputBreaker = {
  advisor_id: string;
  current_state: string;          // circuit_open expected
  circuit_open_until: string | null;
  metadata?: { breaker_reason?: string } | null;
};

export type BoardroomTheme = {
  id: string;
  kind: ThemeKind;
  title: string;
  summary: string;
  domains: string[];
  advisors: string[];
  evidence: { kind: string; ref: string; note: string }[];
  /** 0..1 — used to rank themes for the owner. */
  priority: number;
  /** 0..1 — kernel's confidence the theme is real, not noise. */
  confidence: number;
  ownerAsk: string;
};

export type BoardroomKernelInput = {
  queueItems: KernelInputQueueItem[];
  reflections: KernelInputReflection[];
  breakers: KernelInputBreaker[];
  /** Hours after which an awaiting_approval item is "stalled". */
  stalledHours?: number;
  now?: number;
};

const DEFAULT_STALLED_HOURS = 6;
const MIN_CLUSTER_SIZE = 2;

/** Pure synthesis. Deterministic given inputs. */
export function synthesizeBoardroomThemes(input: BoardroomKernelInput): BoardroomTheme[] {
  const now = input.now ?? Date.now();
  const stalledHours = input.stalledHours ?? DEFAULT_STALLED_HOURS;
  const themes: BoardroomTheme[] = [];

  themes.push(...detectConsensus(input.queueItems));
  themes.push(...detectConflicts(input.queueItems));
  themes.push(...detectStalled(input.queueItems, stalledHours, now));
  themes.push(...detectEmergent(input.reflections));
  themes.push(...detectBreakerStorm(input.breakers));

  // Rank by priority desc, then confidence desc.
  themes.sort((a, b) => b.priority - a.priority || b.confidence - a.confidence);
  return themes;
}

// ── Consensus ──────────────────────────────────────────────────
function detectConsensus(items: KernelInputQueueItem[]): BoardroomTheme[] {
  const open = items.filter((i) => i.status === "awaiting_approval");
  // Cluster by (domain + action_type)
  const clusters = groupBy(open, (i) => `${i.domain}::${i.action_type}`);
  const out: BoardroomTheme[] = [];
  for (const [key, group] of clusters) {
    const advisors = uniq(group.map((g) => g.advisor_id));
    if (advisors.length < MIN_CLUSTER_SIZE) continue;
    const avgConf = avg(group.map((g) => g.confidence));
    const totalImpact = sum(group.map((g) => g.payload?.financial_impact_cents ?? 0));
    out.push({
      id: `consensus:${key}`,
      kind: "consensus",
      title: `${advisors.length} advisors converging on ${group[0].action_type}`,
      summary: `${advisors.join(", ")} all queued ${group[0].action_type} in ${group[0].domain}. Avg confidence ${(avgConf * 100).toFixed(0)}%.`,
      domains: [group[0].domain],
      advisors,
      evidence: group.map((g) => ({
        kind: "queue_item",
        ref: g.id,
        note: `${g.advisor_id}: ${g.summary}`,
      })),
      priority: clamp01(0.6 + advisors.length * 0.1 + (totalImpact > 0 ? 0.1 : 0)),
      confidence: clamp01(avgConf),
      ownerAsk: "Approve as a batch — multiple advisors agree this matters now.",
    });
  }
  return out;
}

// ── Conflict ───────────────────────────────────────────────────
function detectConflicts(items: KernelInputQueueItem[]): BoardroomTheme[] {
  const open = items.filter((i) => i.status === "awaiting_approval");
  // A naive but useful heuristic: in the same domain, two different
  // action_types from different advisors with high confidence.
  const byDomain = groupBy(open, (i) => i.domain);
  const out: BoardroomTheme[] = [];
  for (const [domain, group] of byDomain) {
    if (group.length < 2) continue;
    const distinctActions = uniq(group.map((g) => g.action_type));
    if (distinctActions.length < 2) continue;
    const distinctAdvisors = uniq(group.map((g) => g.advisor_id));
    if (distinctAdvisors.length < 2) continue;
    const top = group
      .slice()
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2);
    out.push({
      id: `conflict:${domain}:${top.map((t) => t.action_type).join("-vs-")}`,
      kind: "conflict",
      title: `Conflicting plans in ${domain}`,
      summary: `${top[0].advisor_id} proposes ${top[0].action_type}; ${top[1].advisor_id} proposes ${top[1].action_type}. Resolve before approving either.`,
      domains: [domain],
      advisors: distinctAdvisors,
      evidence: top.map((t) => ({
        kind: "queue_item",
        ref: t.id,
        note: `${t.advisor_id} (${(t.confidence * 100).toFixed(0)}%): ${t.summary}`,
      })),
      priority: clamp01(0.8 + Math.abs(top[0].confidence - top[1].confidence) * 0.2),
      confidence: clamp01(avg(top.map((t) => t.confidence))),
      ownerAsk: "Pick one path, or ask both advisors to reconcile before either ships.",
    });
  }
  return out;
}

// ── Stalled queue ──────────────────────────────────────────────
function detectStalled(items: KernelInputQueueItem[], stalledHours: number, now: number): BoardroomTheme[] {
  const cutoff = now - stalledHours * 3600 * 1000;
  const stalled = items.filter(
    (i) => i.status === "awaiting_approval" && new Date(i.created_at).getTime() < cutoff,
  );
  if (stalled.length === 0) return [];
  const advisors = uniq(stalled.map((s) => s.advisor_id));
  return [
    {
      id: `stalled:${stalled.length}`,
      kind: "stalled",
      title: `${stalled.length} approval${stalled.length === 1 ? "" : "s"} waiting > ${stalledHours}h`,
      summary: `Items have been waiting on owner review longer than the ${stalledHours}h SLA. Advisors are blocked.`,
      domains: uniq(stalled.map((s) => s.domain)),
      advisors,
      evidence: stalled.slice(0, 5).map((s) => ({
        kind: "queue_item",
        ref: s.id,
        note: `${s.advisor_id} · ${s.summary}`,
      })),
      priority: clamp01(0.55 + Math.min(0.4, stalled.length * 0.05)),
      confidence: 0.95,
      ownerAsk: "Approve, reject, or de-prioritise — leaving these stalled erodes trust.",
    },
  ];
}

// ── Emergent patterns from reflections ─────────────────────────
function detectEmergent(reflections: KernelInputReflection[]): BoardroomTheme[] {
  if (reflections.length === 0) return [];
  const out: BoardroomTheme[] = [];

  // 1. Repeated rejections across different advisors → calibration drift.
  const rejected = reflections.filter((r) => r.owner_action === "rejected");
  if (rejected.length >= 3) {
    const advisors = uniq(rejected.map((r) => r.advisor_id));
    out.push({
      id: `emergent:rejection-cluster`,
      kind: "emergent",
      title: `${rejected.length} recent rejections — calibration drift`,
      summary: `Owner rejected ${rejected.length} proposals across ${advisors.length} advisor${advisors.length === 1 ? "" : "s"}. Triggers may be too eager.`,
      domains: [],
      advisors,
      evidence: rejected.slice(0, 5).map((r) => ({
        kind: "reflection",
        ref: r.id,
        note: r.lesson_learned ?? `Rejected by owner (${r.advisor_id})`,
      })),
      priority: 0.7,
      confidence: 0.85,
      ownerAsk: "Tighten triggers or raise the confidence threshold for these advisors.",
    });
  }

  // 2. Repeated should_repeat=true patterns → promotion candidate.
  const repeats = reflections.filter((r) => r.should_repeat === true);
  if (repeats.length >= 4) {
    const advisors = uniq(repeats.map((r) => r.advisor_id));
    out.push({
      id: `emergent:repeat-pattern`,
      kind: "emergent",
      title: `${repeats.length} consistently good outcomes — promotion candidate`,
      summary: `These advisors have a streak of healthy reflections. Consider raising autonomy or relaxing approval thresholds.`,
      domains: [],
      advisors,
      evidence: repeats.slice(0, 5).map((r) => ({
        kind: "reflection",
        ref: r.id,
        note: `${r.advisor_id} OQ ${((r.outcome_quality ?? 0) * 100).toFixed(0)}`,
      })),
      priority: 0.45,
      confidence: 0.8,
      ownerAsk: "Raise the autonomy level or whitelist this action class.",
    });
  }

  // 3. Policy-breach tag in any reflection — critical.
  const breaches = reflections.filter((r) => {
    const tags = Array.isArray(r.pattern_tags) ? (r.pattern_tags as string[]) : [];
    return tags.includes("policy-breach");
  });
  if (breaches.length > 0) {
    out.push({
      id: `emergent:policy-breach`,
      kind: "emergent",
      title: `Policy breach detected (${breaches.length})`,
      summary: `One or more advisors recorded a policy-breach tag. Investigate immediately — the L3 ceiling may have been bypassed.`,
      domains: [],
      advisors: uniq(breaches.map((r) => r.advisor_id)),
      evidence: breaches.slice(0, 3).map((r) => ({
        kind: "reflection",
        ref: r.id,
        note: r.lesson_learned ?? "policy-breach tag",
      })),
      priority: 1,
      confidence: 1,
      ownerAsk: "Open the reflection record. Halt the offending advisor until verified.",
    });
  }

  return out;
}

// ── Breaker storm ──────────────────────────────────────────────
function detectBreakerStorm(breakers: KernelInputBreaker[]): BoardroomTheme[] {
  const open = breakers.filter((b) => b.current_state === "circuit_open");
  if (open.length < 2) return [];
  return [
    {
      id: `breaker-storm:${open.length}`,
      kind: "breaker_storm",
      title: `${open.length} breakers open simultaneously`,
      summary: `Multiple advisors halted within the same window. Likely shared cause (budget, provider outage, or shared dependency).`,
      domains: [],
      advisors: open.map((b) => b.advisor_id),
      evidence: open.map((b) => ({
        kind: "breaker",
        ref: b.advisor_id,
        note: b.metadata?.breaker_reason ?? "circuit_open",
      })),
      priority: 0.9,
      confidence: 0.95,
      ownerAsk: "Check shared infra (AI gateway budget, provider health) before resetting.",
    },
  ];
}

// ── helpers ────────────────────────────────────────────────────
function groupBy<T>(arr: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const item of arr) {
    const k = key(item);
    const list = m.get(k) ?? [];
    list.push(item);
    m.set(k, list);
  }
  return m;
}
function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}