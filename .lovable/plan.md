

## Verdict on what's already done

Phases 1–2 are real and sound:
- 43-tab canonical registry shipped, statically loadable, declarative
- 13 orphaned Phase 4–9 boards mounted
- Boards inspected (Security Council, Internal Agents, Policy Drafts, Suggestions, etc.) all do real Supabase reads, RPC calls, edge-function invocations, and realtime subscriptions — **no stubs, no mocks, no placeholders in the data layer**

The remaining structural debt is a primitive-coverage and proof-evidence gap, not a wiring gap.

## What is still missing (Phases 3–6)

| Gap | Evidence |
|---|---|
| **D-section primitive coverage** is 1/43 tabs | Only `AIRuntimeNightlyTruthPanel` uses 6/6 (StatusBadge + ProvenanceChip + EvidenceLink + AITruthDisclosure + trust-copy-map + OperatorActionPanel). All other 42 tabs use raw `Badge` + ad-hoc tone maps |
| **`OperatorActionPanel` adoption** is ~0/31 required tabs | Registry marks 31 tabs `requiresOperatorAction: true`; none compose D5 |
| **Wiring proof matrix** missing | No `WIRING_PROOF_MATRIX.md`; data-source claims in registry not yet machine-verified |
| **CI gates missing** | No `check-ai-engineer-tab-registry.ts`, `check-ai-engineer-primitive-coverage.ts`, `check-ai-engineer-realtime-coverage.ts`, `check-ai-engineer-no-mocks.ts` |
| **Closure bundle incomplete** | `generated/admin-ai-engineer-team/` only has `inventory.json` + `CLOSURE_PHASE_1_2.md` |
| **Aggregator wiring missing** | The 4 new gates not yet added to `check-os-release-readiness.ts` |
| **Tab #22 surfacing** | `FrontendTruthBackingClosureTruthPanel` doesn't yet surface this team's closure status |

## Phase plan (each phase independently shippable)

### Phase 3 — Wiring proof matrix (validator + generated artifact)
- Build `scripts/validation/check-ai-engineer-wiring-coverage.ts` that:
  - reads `AI_ENGINEER_HUB_TABS`
  - for each tab, AST-scans the panel file for `supabase.from('<table>')`, `supabase.rpc('<rpc>')`, `supabase.functions.invoke('<fn>')`, `.channel(...)`
  - cross-checks discovered usage against the declared `dataSources[]` and `realtime` flag
  - emits `generated/admin-ai-engineer-team/wiring-coverage.json` + `WIRING_PROOF_MATRIX.md`
- Tier: WARN initially, becomes BLOCK after Phase 6
- Ship a tiny shared helper `_shared/useRealtimeChannel.ts` (composes existing `supabase.channel`) only if the same realtime+invalidate pattern repeats — composes existing primitives, no new families

### Phase 4 — Primitive coverage (validator + zero-touch surface lifts)
- Build `scripts/validation/check-ai-engineer-primitive-coverage.ts` that:
  - asserts every panel listed in the registry imports `StatusBadge` (no raw shadcn `Badge` for status), and uses `AITruthDisclosure` if it claims AI/runtime status, and uses `formatTrustLabel` instead of inline strings like "Connected"/"Degraded"
  - asserts no in-file color literals (`bg-emerald-500/15`) for status — must go through `StatusTone`
  - emits `generated/admin-ai-engineer-team/primitive-coverage.json`
- Surgical refactors (composition only, no behavior change):
  - `SecurityCouncilBoard` — replace `SEVERITY_TONE`/`STATUS_TONE` literal maps with `StatusBadge tone={…}`; add `AITruthDisclosure mode="live-gateway"` chip in header keyed off `summary.generated_at`
  - `InternalAgentsBoard` — replace `STATUS_TONE` literal map with `StatusBadge`
  - `PolicyDraftReviewBoard` — replace `RISK_BADGE` with `StatusBadge`; add `AITruthDisclosure mode="structural"`
  - Same lift for: SuggestionsBoard, CouncilsBoard, TrustLadderBoard, ReflectionBoard, CrossCouncilBoard, TenantFederationBoard, SLOObservabilityBoard, AssuranceChaosBoard, ExternalWorkforceApiBoard, KnowledgeFederationBoard, SovereignDeploymentDRBoard, ComplianceAttestationBoard, OwnerCopilotBriefings, InternalAgentIntentTimeline, WeeklyDigestBoard, DependencyFindingsBoard
  - Truth panels (FrontendPolish, AdminValidation, HardwareOperator, SecurityPortability, ArchitecturalCleanup, EconomicTrustFuture, ArchitectureHardening, FlagshipSurfaceClosure, AdminEmptyStateClosure, AdminCoherenceClosure, TrustStateAndCopyClosure) — wrap their summary header with `AITruthDisclosure mode="structural"` since they read JSON artifacts not live runtime
- Tier: BLOCK
- Zero new component families; ~16 panel files touched, each ≤8-line diff

### Phase 5 — Operator remediation coverage (validator + sweep)
- Build `scripts/validation/check-ai-engineer-action-coverage.ts` that:
  - for every tab with `requiresOperatorAction: true`, asserts the panel composes `OperatorActionPanel` somewhere (typically inside the empty/error/degraded branch)
  - emits `generated/admin-ai-engineer-team/action-coverage.json`
- Sweep ~31 tabs: replace freestanding `<Button>` clusters in degraded/empty branches with `OperatorActionPanel` (primary / remediation / next / evidence). E.g.:
  - `SecurityCouncilBoard` empty state → `OperatorActionPanel { primary: { label: "Run tick now", onClick: runTick }, evidence: [{ label: "Open Suggestions", href: "/admin/ai-runtime?tab=suggestions" }] }`
  - `PolicyDraftReviewBoard` empty → `primary: { label: "Run Architect Scan", onClick: runScan }`
  - `BudgetCenter` budget-alert state → `remediation: { label: "Open kill-switches", href: "/admin/trust-security/kill-switches" }`
- Tier: BLOCK after sweep

### Phase 6 — Final closure + aggregator + Tab #22 surfacing
- Build the 4th validator `scripts/validation/check-ai-engineer-tab-registry.ts`:
  - asserts every panel under `src/components/admin/ai-runtime/**` and every board under `src/pages/admin/ai-runtime/**` is either in the registry or in an explicit `ARCHIVED` allowlist
  - asserts every `LOADERS` entry in `AIRuntimeHome.tsx` is a valid registry path (no orphan loaders)
- Wire all 4 gates into `scripts/architecture/checks/check-os-release-readiness.ts` `REQUIRED_GATES` (BLOCK-tier)
- Generate the closure bundle:
  - `generated/admin-ai-engineer-team/CLOSURE_PHASE_3_6.md`
  - `generated/admin-ai-engineer-team/FINAL_CLOSURE.md`
  - `generated/admin-ai-engineer-team/admin-ai-engineer-team-verification.json`
  - mirror to `public/generated/admin-ai-engineer-team/` for in-app fetch
- Extend `FrontendTruthBackingClosureTruthPanel` (Tab #22) to fetch and surface `admin-ai-engineer-team-verification.json` alongside frontend-truth-backing — adds one new collapsible card "Admin AI Engineer Hardening (43/43 tabs · 6/6 primitives · 31/31 remediation · 4 BLOCK gates green)"

## Discipline guarantees (locked)

- Scope locked to AI Engineer hub: `src/components/admin/ai-runtime/**`, `src/pages/admin/ai-runtime/**`, `src/lib/admin/ai-engineer-hub/**`, `scripts/validation/check-ai-engineer-*.ts`, `generated/admin-ai-engineer-team/**`, `public/generated/admin-ai-engineer-team/**`
- Zero edits to: user-plane apps, `/desktop`, Electron, OS image-builder, backend planes outside AI runtime, App.tsx, route table, migrations
- Zero new component families — composes existing 6/6 D-section primitives only
- Zero new color systems — `StatusTone` reuse only; deletes ad-hoc `bg-*-500/15` literals where replaced
- L3 autonomy ceiling preserved (Security Council, Cross-Council, DR all stay advisory)
- Sovereign AI Gateway preserved (no panel makes direct provider SDK calls)
- Each phase ships independently; rollback-safe (validators added at WARN before BLOCK)

## Files touched (estimate)

| Class | Count |
|---|---|
| Panel files lifted to canonical primitives | ~16 boards + ~13 truth panels = 29 |
| New validators | 4 (`check-ai-engineer-tab-registry`, `-wiring-coverage`, `-primitive-coverage`, `-action-coverage`) |
| New generated artifacts (mirrored to public) | 5 (wiring-coverage, primitive-coverage, action-coverage, registry-coverage, FINAL_CLOSURE) + verification.json |
| Aggregator wiring | 1 update to `check-os-release-readiness.ts` |
| Tab #22 panel | 1 update to surface admin-ai-engineer-team verification |
| Optional shared helper | 0–1 (`_shared/useRealtimeChannel.ts`, only if pattern repeats) |
| Total | ≈40 files, all inside the locked scope |

## Validation checklist after Phases 3–6

- `npx tsx scripts/validation/check-ai-engineer-tab-registry.ts` → 0 errors
- `npx tsx scripts/validation/check-ai-engineer-wiring-coverage.ts` → 0 errors
- `npx tsx scripts/validation/check-ai-engineer-primitive-coverage.ts` → 0 errors
- `npx tsx scripts/validation/check-ai-engineer-action-coverage.ts` → 0 errors
- `npx tsx scripts/architecture/checks/check-os-release-readiness.ts` → still GREEN, gate count +4
- `/admin/ai-runtime` renders all 43 tabs identically
- Tab #22 shows new "Admin AI Engineer Hardening" card

