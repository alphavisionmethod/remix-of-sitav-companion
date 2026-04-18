// ═══════════════════════════════════════════════════════════════
// SITA OS — Meta-Architecture Registry (Phase 7)
// Single read-side aggregator for Phase 1 (Bounded Contexts),
// Phase 4 (Kill Switches), Phase 5 (Runbooks), Phase 6 (Golden
// Paths). Pure functions only — no I/O, no Supabase, no React.
// ═══════════════════════════════════════════════════════════════

import { BOUNDED_CONTEXT_REGISTRY } from "@/platform/architecture/bounded-context-registry";
import { KILL_SWITCH_REGISTRY } from "@/lib/control-plane/kill-switch-registry";
import { RUNBOOK_REGISTRY } from "@/lib/support/runbook-registry";
import { GOLDEN_PATH_REGISTRY } from "@/lib/operations/golden-path-registry";
import { evaluateGoldenPaths } from "@/lib/operations/golden-path-evaluator";
import type {
  MetaArchSnapshot,
  MetaContextSummary,
  MetaContextHealth,
} from "./meta-arch-types";
import type { BoundedContextId } from "@/platform/architecture/bounded-context-types";

const CONTEXT_INDEX = new Map(BOUNDED_CONTEXT_REGISTRY.map((c) => [c.contextId, c]));
const SWITCH_INDEX = new Map(KILL_SWITCH_REGISTRY.map((s) => [s.switchId, s]));
const RUNBOOK_INDEX = new Map(RUNBOOK_REGISTRY.map((r) => [r.runbookId, r]));

// ── Forward-resolved indexes ──────────────────────────────────
const SWITCHES_BY_CONTEXT = new Map<string, string[]>();
for (const sw of KILL_SWITCH_REGISTRY) {
  if (sw.boundedContextId) {
    const arr = SWITCHES_BY_CONTEXT.get(sw.boundedContextId) ?? [];
    arr.push(sw.switchId);
    SWITCHES_BY_CONTEXT.set(sw.boundedContextId, arr);
  }
}

const RUNBOOKS_BY_CONTEXT = new Map<string, string[]>();
for (const rb of RUNBOOK_REGISTRY) {
  if (rb.boundedContextId) {
    const arr = RUNBOOKS_BY_CONTEXT.get(rb.boundedContextId) ?? [];
    arr.push(rb.runbookId);
    RUNBOOKS_BY_CONTEXT.set(rb.boundedContextId, arr);
  }
}

const PATHS_BY_CONTEXT = new Map<string, string[]>();
for (const p of GOLDEN_PATH_REGISTRY) {
  for (const ctx of p.contextIds) {
    const arr = PATHS_BY_CONTEXT.get(ctx) ?? [];
    arr.push(p.pathId);
    PATHS_BY_CONTEXT.set(ctx, arr);
  }
}

// ── Public API ────────────────────────────────────────────────

export function listBoundedContexts() {
  return BOUNDED_CONTEXT_REGISTRY;
}

export function getKillSwitchesForContext(contextId: BoundedContextId): readonly string[] {
  return SWITCHES_BY_CONTEXT.get(contextId) ?? [];
}

export function getRunbooksForContext(contextId: BoundedContextId): readonly string[] {
  return RUNBOOKS_BY_CONTEXT.get(contextId) ?? [];
}

export function getGoldenPathIdsForContextSafe(contextId: BoundedContextId): readonly string[] {
  return PATHS_BY_CONTEXT.get(contextId) ?? [];
}

export function getCounts() {
  return {
    contexts: BOUNDED_CONTEXT_REGISTRY.length,
    killSwitches: KILL_SWITCH_REGISTRY.length,
    runbooks: RUNBOOK_REGISTRY.length,
    goldenPaths: GOLDEN_PATH_REGISTRY.length,
  };
}

/**
 * Compute the cross-registry health snapshot given the current
 * armed kill switches. Pure, deterministic.
 */
export function computeMetaArchSnapshot(
  armedSwitchIds: ReadonlySet<string> = new Set()
): MetaArchSnapshot {
  const evaluations = evaluateGoldenPaths(armedSwitchIds);
  const evalById = new Map(evaluations.map((e) => [e.pathId, e]));

  const contexts: MetaContextSummary[] = BOUNDED_CONTEXT_REGISTRY.map((ctx) => {
    const switches = SWITCHES_BY_CONTEXT.get(ctx.contextId) ?? [];
    const armed = switches.filter((s) => armedSwitchIds.has(s));
    const runbooks = RUNBOOKS_BY_CONTEXT.get(ctx.contextId) ?? [];
    const paths = (PATHS_BY_CONTEXT.get(ctx.contextId) ?? []) as ReadonlyArray<string>;
    const blocked: string[] = [];
    const degraded: string[] = [];
    for (const pid of paths) {
      const ev = evalById.get(pid as any);
      if (!ev) continue;
      if (ev.health === "blocked") blocked.push(pid);
      else if (ev.health === "degraded") degraded.push(pid);
    }
    let health: MetaContextHealth = "healthy";
    if (blocked.length > 0 || armed.length > 0) health = "blocked";
    else if (degraded.length > 0) health = "degraded";
    return {
      contextId: ctx.contextId,
      contextName: ctx.contextName,
      owner: ctx.owner,
      killSwitches: switches,
      armedKillSwitches: armed,
      runbooks,
      goldenPaths: paths as any,
      blockedGoldenPaths: blocked as any,
      degradedGoldenPaths: degraded as any,
      health,
    };
  });

  const armedTotal = contexts.reduce((n, c) => n + c.armedKillSwitches.length, 0);
  const blockedPathSet = new Set<string>();
  const degradedPathSet = new Set<string>();
  for (const c of contexts) {
    for (const p of c.blockedGoldenPaths) blockedPathSet.add(p);
    for (const p of c.degradedGoldenPaths) degradedPathSet.add(p);
  }

  return {
    capturedAt: new Date().toISOString(),
    armedSwitchIds: Array.from(armedSwitchIds),
    contexts,
    totals: {
      contexts: contexts.length,
      killSwitches: KILL_SWITCH_REGISTRY.length,
      runbooks: RUNBOOK_REGISTRY.length,
      goldenPaths: GOLDEN_PATH_REGISTRY.length,
      armedKillSwitches: armedTotal,
      blockedGoldenPaths: blockedPathSet.size,
      degradedGoldenPaths: degradedPathSet.size,
    },
  };
}

export function resolveContextById(contextId: string) {
  return CONTEXT_INDEX.get(contextId as BoundedContextId);
}

export function resolveSwitchById(switchId: string) {
  return SWITCH_INDEX.get(switchId);
}

export function resolveRunbookById(runbookId: string) {
  return RUNBOOK_INDEX.get(runbookId);
}
