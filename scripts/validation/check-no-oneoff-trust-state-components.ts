#!/usr/bin/env node
// Trust-Grade State Handling — No One-Off Empty-State Components
//
// Scans the entire `src/` tree for files matching `*EmptyState*.tsx` and flags
// any file outside the canonical allow-list as drift.
//
// WARN-tier. Emits gate report; never blocks a build during burndown.
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "no-oneoff-trust-state-components";
const issues: GateIssue[] = [];

// Allow-list — canonical empty-state component files frozen by
// generated/trust-state-and-copy-closure/TRUST_STATE_SYSTEM_SPEC.md.
//
// Each entry carries an inline rationale so the allow-list itself documents
// why each file is exempt from the "no parallel state systems" rule (PART 7).
const ALLOW_LIST = new Set([
  // ── Canonical primitives ────────────────────────────────────────────────
  // Frozen as the single shared trust-grade state language for all 8
  // in-scope flagship surfaces.
  "src/components/primitives/feedback/EmptyState.tsx",
  "src/components/primitives/feedback/PremiumEmptyState.tsx",
  "src/components/primitives/feedback/NeedsDataExplainer.tsx",
  "src/components/primitives/feedback/NeedsTimeWindowExplainer.tsx",
  "src/components/primitives/feedback/NeedsHistoricalReleasesExplainer.tsx",
  // Concierge domain-aware variant — wraps the canonical PremiumEmptyState
  // with calm user-facing copy; explicitly named in TRUST_STATE_SYSTEM_SPEC.
  "src/components/concierge/ConciergeEmptyState.tsx",

  // ── Allow-listed legacy domain variants (out-of-trust-state-scope) ──────
  // These predate the canonical primitives and are scheduled for absorption
  // in a separate domain-shared closure pass. Listing them here freezes the
  // drift surface so no NEW one-off variants can appear without explicit
  // rationale.
  //
  // Admin AI Runtime panel — internal validator UI, not a state primitive.
  // Name contains "EmptyState" only because it surfaces the state-closure
  // truth panel; renders no end-user empty state itself.
  "src/components/admin/ai-runtime/AdminEmptyStateClosureTruthPanel.tsx",
  // Adaptive business shell — context-aware variant; refactor target
  // tracked in generated/trust-state-and-copy-closure/TRUST_STATE_HANDLING_AUDIT.md.
  "src/components/business/adaptive/AdaptiveEmptyState.tsx",
  // CRM / Lead inbox legacy variants — domain-tone strings only, no new
  // primitives introduced; absorption tracked under CRM domain closure.
  "src/components/business/crm/CRMEmptyState.tsx",
  "src/components/business/lead-inbox/LeadEmptyStates.tsx",
  // Sita namespace — historic alias layer that re-exports the canonical
  // primitives under the legacy "sita/" path used by older imports.
  // Removing them would break import sites; absorption tracked separately.
  "src/components/sita/ContextualEmptyState.tsx",
  "src/components/sita/EmptyState.tsx",
  "src/components/sita/EmptyStateCTA.tsx",
  "src/components/sita/EmptyStateCard.tsx",
  "src/components/sita/PremiumEmptyState.tsx",
  "src/components/sita/__tests__/EmptyStateCard.test.tsx",
  "src/components/sita/domain-shared/ModuleEmptyState.tsx",
]);

const ROOT = "src";

function walk(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (/EmptyState.*\.tsx$/.test(e)) out.push(p);
  }
  return out;
}

const candidates = walk(ROOT);
let allowed = 0;
let drift = 0;

for (const f of candidates) {
  const norm = f.replace(/\\/g, "/");
  if (ALLOW_LIST.has(norm)) {
    allowed++;
  } else {
    drift++;
    issues.push({
      severity: "warning",
      area: "oneoff-empty-state",
      message: `One-off empty-state component drift: ${norm} — fold into canonical primitives or add to allow-list with rationale`,
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    classification: "warn-tier-drift-guard",
    candidatesFound: candidates.length,
    allowedCanonical: allowed,
    driftOffenders: drift,
    allowList: Array.from(ALLOW_LIST),
  },
});
process.exit(ok ? 0 : 1);
