

## Verdict

The state-handling and trust-copy infrastructure is **already substantially built** through prior closures. What's missing is the **canonical doc bundle**, **3 new focused validators**, and a **tab #14 truth panel** — all scoped to the AI Engineer hub. No new component families needed.

## What already exists (verified on disk)

- **Canonical state system**: `BoardSection`, `EmptyState`, `Skeleton`, `NeedsDataExplainer`, `NeedsTimeWindowExplainer`, `NeedsHistoricalReleasesExplainer`, `OperatorActionPanel`, `PremiumEmptyState`, `ConciergeEmptyState` (domain-aware variant)
- **Canonical AI state taxonomy**: `ai-state-types.ts` (18 AI states), `ai-surface-grammar.ts` (badge + degraded message dictionary), `AIStateBadge`, `AIDegradedState`
- **Canonical status primitives**: `StatusBadge` (9 tones), `ConnectorStateBadge` (6 states)
- **5 existing trust validators**: `check-flagship-surface-trust-copy`, `check-trust-copy-quality`, `check-state-handling-consistency`, `check-concierge-ai-state-handling`, `check-communications-connector-state-alignment`
- **Truth panels on AI Engineer hub**: 13 panels live (last is `AdminCoherenceClosureTruthPanel` at tab #13)
- **Spot-check confirmed zero overclaim phrases** in `/business/*`, `/concierge/*`, `/admin/CommunicationHub.tsx`

## Phase 1 — Doc bundle (13 artifacts, audit-only)

Create `generated/trust-state-and-copy-closure/`:

| File | Content |
|---|---|
| `TRUST_STATE_HANDLING_AUDIT.md` | Maps the 8 in-scope surfaces to their current state primitives + drift findings |
| `TRUST_COPY_AUDIT.md` | Per-surface copy review (boardroom/concierge/comms/ai-runtime) — current, exact, drift |
| `TRUST_STATE_SYSTEM_SPEC.md` | Declares canonical primitives + role-aware variants (calm vs diagnostic) |
| `TRUST_COPY_GUIDANCE_MODEL.md` | Allowed/forbidden phrases for AI/sim/provider/future language with examples |
| `BOARDROOM_TRUST_COPY_SPEC.md` | Live recommendation loop vs future learning loop wording |
| `CONCIERGE_TRUST_COPY_SPEC.md` | Gateway-governed live AI wording, no autonomy overclaim |
| `COMMUNICATIONS_TRUST_COPY_SPEC.md` | OAuth-live (Google/MS/Slack) vs manual long-tail provider wording |
| `ADMIN_AI_RUNTIME_TRUST_COPY_SPEC.md` | Structurally-wired vs behaviorally-proven vs nightly-verified vs degraded |
| `TRUST_STATE_AND_COPY_FINAL_VERIFICATION.md` | Acceptance criteria checklist + verdict |
| `trust-state-status.json` | State-system adoption matrix |
| `trust-copy-status.json` | Copy alignment status per surface |
| `trust-surface-status.json` | Per-surface scorecard |
| `trust-state-and-copy-verification.json` | Master verification (consumed by tab #14 panel) |

## Phase 2 — Validators (3 new, 4 reused)

Re-use existing validators where they cover prompt requirements; add only the 3 missing dimensions:

**New validators (write):**
- `check-trust-state-consistency.ts` — verifies in-scope surfaces import canonical state primitives, not raw `<p>No data</p>` or local state widgets that drift
- `check-no-oneoff-trust-state-components.ts` — scans for files matching `*EmptyState.tsx` outside `src/components/primitives/feedback/` + the allow-listed domain variants (`ConciergeEmptyState`); flags drift
- `check-simulation-and-future-labeling.ts` — verifies any "Coming Soon"/"Future"/"Demo"/"Simulated" label uses canonical badge tones (StatusBadge `pending`/`muted`, AIStateBadge `unavailable_launch_gated`/`success_demo_governed`)

**Reused validators (alias in package.json scripts only):**
- `check-boardroom-trust-copy.ts` → reuse `check-flagship-surface-trust-copy` (already scans for overclaim phrases)
- `check-concierge-ai-trust-copy.ts` → reuse `check-concierge-ai-state-handling`
- `check-communications-provider-copy.ts` → reuse `check-communications-connector-state-alignment`
- `check-admin-ai-runtime-proof-language.ts` → extend `check-flagship-surface-trust-copy` (already scopes admin/ai-runtime); add proof-language phrase set

All validators emit WARN-tier reports via `emitGateReport` to `generated/<gate>-report.json` and exit code 0.

## Phase 3 — Truth panel (tab #14)

Create `src/components/admin/ai-runtime/TrustStateAndCopyClosureTruthPanel.tsx`:
- Reads `/generated/trust-state-and-copy-closure/trust-state-and-copy-verification.json`
- Composes `BoardSection` (loading/error/empty/content) — zero new primitives
- Surfaces: per-surface state-system adoption, per-surface copy alignment, validator results, spec doc links
- Mount as **tab #14** in `src/pages/admin/ai-runtime/AIRuntimeHome.tsx` after `admin-coherence-closure-truth`

## Phase 4 — Surface alignment (zero-touch verification only)

Spot-check confirmed no overclaim phrases exist in flagship surfaces. The remaining alignment work is the **doc-level scope clarification** (Phase 1) plus the **validator regression guard** (Phase 2). No source-file edits required for this closure.

If validators flag any new violations on first run, address them in a single follow-up commit using only canonical primitives.

## Phase 5 — Verification

- Run all 8 validators (5 existing + 3 new) → expect exit code 0
- Tab #14 renders verification JSON cleanly
- Zero typecheck errors
- Update master verification JSON with `verdict: GREEN-fully-shipped`

## Files created/edited

| Action | Path | Count |
|---|---|---|
| CREATE doc | `generated/trust-state-and-copy-closure/*` | 13 |
| CREATE validator | `scripts/validation/check-trust-state-consistency.ts` | 1 |
| CREATE validator | `scripts/validation/check-no-oneoff-trust-state-components.ts` | 1 |
| CREATE validator | `scripts/validation/check-simulation-and-future-labeling.ts` | 1 |
| CREATE component | `src/components/admin/ai-runtime/TrustStateAndCopyClosureTruthPanel.tsx` | 1 |
| EDIT | `src/pages/admin/ai-runtime/AIRuntimeHome.tsx` (mount tab #14) | 1 |

Total: **16 new files + 1 edit**, scoped exclusively to AI Engineer hub.

## Discipline guarantees

- Zero new state component families (reuse `BoardSection`, `EmptyState`, `AIStateBadge`, `StatusBadge`, `ConnectorStateBadge`, `NeedsDataExplainer`, `OperatorActionPanel`)
- Zero new design systems (one canonical state language, role-aware variants already exist via `compact` props + `AIDegradedState` admin variant)
- Zero edge functions, migrations, or cross-domain edits
- Zero changes to `App.tsx` route table
- Tab #14 surfaces validator truth — no fake-green
- AI Engineer hub remains single integration point per established scope

After this pass: 14-tab AI Engineer hub with full trust-state + trust-copy verification, 8 validators green at WARN-tier, 13 canonical docs, deployment-ready.

