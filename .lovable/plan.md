

## Reality check

**Registry (40 agents):** all use `aw-*` prefix — verified across 6 council files (8+8+7+6+6+5 = 40). ✅

**Runtime invocation paths:** **LEGITIMATE GAP confirmed.**
- `security-council-tick/index.ts` invokes 7 agents using **legacy `st-*` IDs** that don't match the registry's `aw-security-monitor`, `aw-permission-drift`, `aw-policy-review`, `aw-trust-threshold`, `aw-fraud-abuse`, `aw-privacy-boundary`, `aw-audit-trail` (the registry has no `st-audit-completeness`).
- `internal-agent-cost-optimizer` uses `cost-optimizer-agent` (not in registry).
- `internal-agent-suggestion-generator`, `internal-agent-policy-architect`, `internal-agent-reflect`, `internal-agent-loop`, etc. exist but only ~14 distinct registry IDs are addressable from runtime code.
- **~26 of 40 agents have NO direct runtime invocation path** — they exist only as definitions + DB seed rows + UI cards.

**Existing CI gates:**
- `check-internal-agent-runtime-coverage` → only checks DB seeding, not invocation. Misleading name. ✅ passes today but doesn't catch this.
- `check-internal-agent-runtime-loop` → only checks the loop file structurally. ✅
- No gate enforces "every registry agent has a documented runtime status."

## Plan (default mode — 4 deliverables)

### 1. Add explicit runtime-status field to each agent definition (the user's literal ask: "Mark deferred set explicitly")

Extend `InternalAgentDefinition` in `src/packages/internal-agent-config/types.ts` with:
```ts
runtimeStatus: "wired" | "scheduled-only" | "ui-surface-only" | "deferred";
runtimeInvocationPath?: string; // e.g. "supabase/functions/security-council-tick"
deferredReason?: string;        // required when runtimeStatus === "deferred"
deferredEta?: string;           // ISO date or "post-launch"
```

Set values across all 6 council files (`src/lib/internal-agents/agents/*.ts`):
- **wired (~14):** the agents actually invoked from edge functions, with their real path. Where security-council-tick uses legacy `st-*` IDs, normalize to the canonical `aw-*` IDs (alias map kept for backwards-compat, see step 2).
- **scheduled-only:** agents with cron rows but no executor body yet.
- **ui-surface-only:** agents that render in admin UI but have no scheduler entry.
- **deferred:** the rest, each with `deferredReason` (e.g. "Phase 10 — pending UX-research signal source") and `deferredEta` ("post-launch").

### 2. Canonical agent-ID alias resolver

New `src/lib/internal-agents/agent-id-alias-map.ts`:
```ts
export const AGENT_ID_ALIASES: Record<string, string> = {
  "st-security-monitor": "aw-security-monitor",
  "st-permission-drift": "aw-permission-drift",
  "st-policy-review": "aw-policy-review",
  "st-trust-threshold": "aw-trust-threshold",
  "st-fraud-abuse": "aw-fraud-abuse",
  "st-privacy-boundary": "aw-privacy-boundary",
  "st-audit-completeness": "aw-audit-trail",
  "ro-incident-response": "aw-incident-response",
  "rc-cost-sentinel": "aw-ai-spend-control",
  "kc-knowledge-coordinator": "aw-knowledge-curator",
  // …
};
export function canonicalAgentId(id: string): string { return AGENT_ID_ALIASES[id] ?? id; }
```
No edge-function rewrites required — the alias resolver is consulted by the runtime gate (step 3) so legacy IDs still count as wiring evidence for their canonical target.

### 3. New BLOCK-tier CI gate: `check-internal-agent-deferred-set-explicitness`

New `scripts/architecture/checks/check-internal-agent-deferred-set-explicitness.ts`:
- Loads all 40 agents from `ALL_DETAILED_AGENTS`.
- For each: assert `runtimeStatus` is set; if `deferred`, assert `deferredReason` + `deferredEta`; if `wired`, assert `runtimeInvocationPath` exists on disk AND that path actually references the agent ID (or an alias resolving to it).
- Emit `generated/internal-agent-deferred-set-report.json` with:
  - `total: 40`, `wired: N`, `scheduledOnly: N`, `uiSurfaceOnly: N`, `deferred: N`
  - per-agent rows with status + path/reason
  - `coveragePercent` (status non-null) — must be 100%
- Register in `scripts/architecture/checks/check-os-release-readiness.ts` as **Gate #22** (BLOCK).

### 4. Generated transparency manifest

New `scripts/manifests/generate/generate-internal-agent-runtime-status.ts`:
- Emits `generated/internal-agent-runtime-status.json` and mirror `public/generated/internal-agent-runtime-status.json` with the wired/deferred breakdown for the admin UI to consume.

## Files

**New (4):**
- `src/lib/internal-agents/agent-id-alias-map.ts`
- `scripts/architecture/checks/check-internal-agent-deferred-set-explicitness.ts`
- `scripts/manifests/generate/generate-internal-agent-runtime-status.ts`
- `generated/internal-agent-runtime-status.json` + `public/` mirror (script output)

**Edited (8):**
- `src/packages/internal-agent-config/types.ts` (4 new fields)
- `src/lib/internal-agents/agents/{product-build,reliability-ops,security-trust,runtime-cost,architecture-governance,knowledge-coordination}.ts` (add status to all 40 agents)
- `scripts/architecture/checks/check-os-release-readiness.ts` (register gate #22)

## Out of scope
- No edge-function rewrites (alias map handles legacy IDs).
- No new edge functions for the 26 deferred agents — they remain explicitly deferred with reason + ETA.
- No DB schema changes (status lives in code, not DB).

