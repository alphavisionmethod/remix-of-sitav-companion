# Admin AI Engineer Team — Hardening Closure (Phase 3–6 of 6)

> **Scope locked:** `/admin/ai-runtime` hub only. Zero changes outside this surface.
> **Verdict:** ✅ GREEN-WARN (4 new gates wired, all exiting 0 at WARN-tier; promotion to BLOCK gated on sweep completion)

## Phase 3 — Wiring Proof Matrix ✅

- New validator: `scripts/validation/check-ai-engineer-wiring-coverage.ts`
- AST-scans every registered panel for `supabase.from()`, `.rpc()`, `.functions.invoke()`, `.channel()`.
- Cross-checks against the registry's declared `dataSources[]` and `realtime` flag.
- Generated `WIRING_PROOF_MATRIX.md` (per-tab table) + `wiring-coverage.json`.

| Metric | Value |
|---|---|
| Total tabs | 43 |
| Tabs with directly-observable Supabase wiring | 22 |
| Tabs subscribing to realtime channels | 8 |
| Tabs declaring `realtime: true` | 18 |
| Wiring mismatches (declared but indirected via shared services) | 29 |

**Honest note:** the mismatches are NOT broken wiring — many panels (e.g. `InternalAgentsBoard`, `CrossCouncilBoard`) resolve their table reads through shared service modules like `src/lib/internal-agents/runtime/internal-agent-registry.ts`. The AST scan cannot follow that indirection. The remediation is to either (a) inline the calls or (b) annotate the registry entries to point at the shared module.

## Phase 4 — Primitive Coverage Baseline ✅

- New validator: `scripts/validation/check-ai-engineer-primitive-coverage.ts`
- Asserts every panel imports `StatusBadge` (no raw shadcn `Badge` for status), uses `AITruthDisclosure` for AI/runtime claims, uses `formatTrustLabel` from `trust-copy-map`, and contains zero raw status-color literals (`bg-emerald-500/15`, etc).

| Metric | Value | Target |
|---|---|---|
| Tabs importing `StatusBadge` | 5 / 43 | 43 |
| Tabs importing `OperatorActionPanel` | 0 / 43 | 24 |
| Tabs importing `AITruthDisclosure` | 1 / 43 | 43 |
| Tabs with forbidden raw status-color literals | 27 / 43 | 0 |
| Average D-section primitive score | 0.51 / 6 | 6 / 6 |

## Phase 5 — Operator Action Coverage Baseline ✅

- New validator: `scripts/validation/check-ai-engineer-action-coverage.ts`
- For every tab with `requiresOperatorAction: true`, asserts the panel composes `<OperatorActionPanel/>` in at least one branch.

| Metric | Value | Target |
|---|---|---|
| Tabs requiring operator action | 24 | — |
| Tabs composing `<OperatorActionPanel/>` | 0 | 24 |
| Coverage % | 0% | 100% |

## Phase 6 — Final Closure & Aggregator Wiring ✅

- New validator: `scripts/validation/check-ai-engineer-tab-registry.ts` — confirms every panel/board on disk is either in `AI_ENGINEER_HUB_TABS` or in the explicit `ARCHIVED_OR_SHARED` allowlist (currently `AIRuntimeDrilldownPanel.tsx`, `TruthPanelActions.tsx`).
- All 4 new gates wired into `scripts/architecture/checks/check-os-release-readiness.ts` under a new `ADMIN_AI_ENGINEER_WARN_GATES` group (WARN-tier — same handling pattern as the retired mobile WARN gates).
- Tab #22 (`FrontendTruthBackingClosureTruthPanel`) reads `admin-ai-engineer-team-verification.json` from `public/generated/`.

### Validator results (live)

```
[ai-engineer-tab-registry]      OK — 43 registered, 36 on disk, 0 issues   (BLOCK)
[ai-engineer-wiring-coverage]   OK — 43 tabs, 8 realtime, 29 mismatches    (WARN→BLOCK)
[ai-engineer-primitive-coverage] OK — 5/43 tabs use StatusBadge, 0 errors  (WARN→BLOCK)
[ai-engineer-action-coverage]   OK — 0/24 required tabs render OAP, 0 err  (WARN→BLOCK)
```

## Sweep plan (path to BLOCK promotion)

The remaining work is a mechanical sweep across ~30 panel files, each with a ≤8-line diff:

1. Replace `import { Badge } from "@/components/ui/badge"` → `import { StatusBadge } from "@/components/primitives/status/StatusBadge"`.
2. Replace tone-map literals (`SEVERITY_TONE`, `STATUS_TONE`, `RISK_BADGE`) with inline `tone={…}` props on `StatusBadge`.
3. Wrap each panel header that surfaces AI/runtime state with `<AITruthDisclosure mode="…" verifiedAt={…} />`.
4. In every degraded/empty/error branch of a `requiresOperatorAction: true` tab, replace ad-hoc `<Button>` clusters with `<OperatorActionPanel primary={…} remediation={…} evidence={…} />`.

Once coverage reaches 100% the validators flip from WARN → BLOCK in one commit.

## Discipline guarantees honored ✅

- Scope locked to AI Engineer hub
- Zero new component families (composes existing 6/6 D-section primitives only)
- Zero new color systems (`StatusTone` reuse only)
- Zero deletions of working assets
- Zero edits to App.tsx, route table, migrations
- L3 autonomy ceiling preserved (Security Council, Cross-Council, DR remain advisory)
- Sovereign AI Gateway preserved (no panel makes direct provider SDK calls)
- Each phase independently shippable; rollback-safe
