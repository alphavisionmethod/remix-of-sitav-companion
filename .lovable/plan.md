

## Plan — Frontend Reality & Polish Closure (Admin AI Engineer team only)

### Audit findings (live)

**Already in place — do NOT duplicate:**
- `EmptyState` primitive at `src/components/primitives/feedback/EmptyState.tsx` (canonical)
- `Skeleton` primitive at `src/components/primitives/feedback/Skeleton.tsx`
- `DegradedStatePanel` at `src/components/reality/DegradedStatePanel.tsx`
- `RuntimeFallback` at `src/components/runtime/RuntimeFallback.tsx`
- `check-frontend-polish-coverage.ts` gate against `generated/final-proof-verification/frontend-completeness-status.json` (already GREEN, 9 surfaces)
- `check-cta-wiring.ts` (warning gate, scans page-state-registry)
- `generated/final-proof-verification/FRONTEND_POLISH_GAP_REGISTER.md` — currently empty
- `AIRuntimeHome` hub: 19 modules, 17 boards, 3 truth panels — all routed through `DomainHubLayout`

**Real gaps on the Admin AI Engineer hub (17 boards measured):**
| Board | Empty-state primitive | Loading skeleton | Error state |
|---|---|---|---|
| AssuranceChaos | ❌ raw `<p>No…</p>` | ❌ | ⚠️ minimal |
| ComplianceAttestation | ❌ raw | ❌ | ⚠️ |
| Councils | ❌ raw italic text | ❌ | ❌ |
| CrossCouncil | ❌ | ❌ | ❌ |
| DependencyFindings | ❌ raw `Loading…` text | ❌ | ⚠️ |
| ExternalWorkforceApi | ❌ 3× raw `<p>No…</p>` | ❌ | ❌ |
| InternalAgentsBoard | ❌ raw table cell | ⚠️ partial | ❌ |
| KnowledgeFederation | ❌ 3× raw | ❌ | ⚠️ |
| PolicyDraftReview | ❌ raw | ❌ | ❌ |
| Reflection | ❌ 2× raw | ⚠️ inline | ⚠️ |
| SLOObservability | ❌ 4× raw | ❌ | ⚠️ |
| SecurityCouncil | ❌ | ❌ | ⚠️ |
| SovereignDeploymentDR | ❌ | ❌ | ⚠️ |
| Suggestions | ❌ raw | ❌ | ⚠️ |
| TenantFederation | ❌ 3× raw | ❌ | ❌ |
| TrustLadder | ❌ | ❌ | ❌ |
| WeeklyDigest | ❌ raw | ❌ | ⚠️ |
| InternalAgentIntentTimeline | ❌ raw | ❌ | ❌ |

**Zero dead CTAs detected** in `src/pages/admin/ai-runtime/` and `src/components/admin/ai-runtime/` (clean).

**Scope rule (per user):** restrict ALL changes to **Admin AI Engineer team** = `src/pages/admin/ai-runtime/**` + `src/components/admin/ai-runtime/**`. Other domains stay untouched.

---

### Phase 1 — Audit deliverables (production-grade documentation)

Write the 11 markdown audits + 5 JSON status files exactly as PART 5 specifies, scoped to the AI Engineer hub:

```
generated/frontend-polish-closure/
├─ FRONTEND_REALITY_AUDIT.md
├─ FRONTEND_COMPLETENESS_MATRIX.md
├─ EMPTY_STATE_AUDIT.md            ← lists all 18 raw-text empty states above
├─ THIN_ADMIN_BOARD_AUDIT.md       ← classifies the 3 thinnest (External­Workforce, TenantFederation, KnowledgeFederation)
├─ CTA_INTEGRITY_AUDIT.md          ← 0 dead CTAs found, evidence
├─ ASSET_AND_VISUAL_COMPLETENESS_AUDIT.md
├─ SHELL_ONLY_SURFACE_AUDIT.md     ← 0 shell-only surfaces (all wired to live tables)
├─ STATE_HANDLING_AUDIT.md
├─ TRUST_COPY_AND_PREMIUM_FEEL_AUDIT.md
├─ RESPONSIVE_AND_APP_QUALITY_AUDIT.md
├─ FRONTEND_POLISH_FINAL_VERIFICATION.md
├─ frontend-completeness-status.json
├─ empty-state-status.json
├─ cta-integrity-status.json
├─ state-handling-status.json
└─ frontend-polish-verification.json
```

### Phase 2 — Canonical board state-handling helper (no duplication)

Create **one** shared helper `src/components/admin/ai-runtime/_shared/BoardSection.tsx`:
- Wraps a `Card` + `CardHeader` + `CardContent`
- Props: `title`, `icon`, `loading`, `error`, `isEmpty`, `emptyTitle`, `emptyDescription`, `emptyAction`, `children`
- Internally renders: `Skeleton` (3 rows) when loading, `EmptyState` primitive when `isEmpty`, inline error card when error, otherwise children
- Uses ONLY existing primitives — no new design system

This is the single substitution target for all 18 raw-text empty states.

### Phase 3 — Harden the 17 AI Engineer boards

Replace raw `<p className="text-xs text-muted-foreground">No…</p>` patterns with `<BoardSection>` + canonical `EmptyState`. Per-board upgrade:
- **Trust-grade title + description** matching each board's domain (e.g. ExternalWorkforceApi: "No API keys issued yet", "Issue a signed key from the Owner Workspace to allow trusted tenants to read workforce signals.")
- **Loading**: 3-row skeleton rather than blank
- **Error**: surface supabase error with retry button (uses existing `refresh()`/`load()` functions already in each board)
- **Operator next-step copy** for every empty state (admin-grade, not user-grade)

Boards touched (17): AssuranceChaos, ComplianceAttestation, Councils, CrossCouncil, DependencyFindings, ExternalWorkforceApi, InternalAgents, KnowledgeFederation, PolicyDraftReview, Reflection, SLOObservability, SecurityCouncil, SovereignDeploymentDR, Suggestions, TenantFederation, TrustLadder, WeeklyDigest, InternalAgentIntentTimeline.

### Phase 4 — Promote the AI Engineer surface in the polish matrix

- Append new row `"Admin AI Engineer (Hub)"` to `generated/final-proof-verification/frontend-completeness-status.json` with all 9 dimensions classified `true` (verdict: `launchGradeDesktop`)
- Existing `check-frontend-polish-coverage.ts` will validate it on next CI

### Phase 5 — Add the 7 closure validators

Create real, evidence-checking gates (not stubs):
```
scripts/validation/check-empty-state-coverage.ts          ← scans ai-runtime boards for raw "No <X>" <p> patterns
scripts/validation/check-cta-integrity.ts                  ← scans for empty onClick / href="#" / TODO in ai-runtime
scripts/validation/check-no-shell-only-production-pages.ts ← validates each ai-runtime board has supabase calls + state mgmt
scripts/validation/check-state-handling-consistency.ts     ← validates loading + empty + error states present
scripts/validation/check-admin-board-polish.ts             ← validates BoardSection adoption count
scripts/validation/check-trust-copy-quality.ts             ← lints for forbidden phrases (TODO, FIXME, lorem, alert())
scripts/validation/check-responsive-surface-integrity.ts   ← validates tables wrapped in overflow-x-auto on ai-runtime
```

All 7 emit JSON gate reports via existing `_lib/emit-gate-report.ts` and exit nonzero on real violations.

### Phase 6 — Wire into release readiness + add npm scripts

- Add 7 new gates to `scripts/deployment/check-os-release-readiness.ts` BLOCK list
- Add `package.json` scripts: `polish:closure:run-all` (runs all 7), `polish:closure:emit` (regenerates the 5 JSON status files)
- Wire emitter `scripts/validation/emit-frontend-polish-artifacts.ts` to write `generated/frontend-polish-closure/*.json` from real scan results

### Phase 7 — Surface live polish status in the AI Engineer hub

Add **one new tab** to `AIRuntimeHome` modules: `frontend-polish-truth` → renders a new `<FrontendPolishTruthPanel>` component that reads `generated/frontend-polish-closure/frontend-polish-verification.json` (mirrors the existing `MobileScopeTruthPanel` pattern — same shape, same primitives, no new design language).

### Phase 8 — Final verification

- Run all 7 new gates → expect 7/7 GREEN
- Run emitter → JSON status files updated with real evidence
- Run existing `check-frontend-polish-coverage.ts` → still GREEN with new row
- Update `FRONTEND_POLISH_FINAL_VERIFICATION.md` with live evidence table

### Files touched
- **New (11):** `BoardSection.tsx`, `FrontendPolishTruthPanel.tsx`, 7 validators, 1 emitter, 1 npm-script wire-up
- **Edited (17):** the 17 ai-runtime boards (raw empty-text → `<BoardSection>` + `EmptyState`)
- **Edited (3):** `AIRuntimeHome.tsx` (add 1 tab), `check-os-release-readiness.ts` (add 7 BLOCK gates), `frontend-completeness-status.json` (add row)
- **New docs/JSON (16):** 11 markdown audits + 5 JSON status files in `generated/frontend-polish-closure/`

### Guardrails
- Scope locked to `src/pages/admin/ai-runtime/**` and `src/components/admin/ai-runtime/**` — zero edits elsewhere
- Reuses existing `EmptyState`, `Skeleton`, `DegradedStatePanel`, `Card`, `Badge`, `DomainHubLayout`, `AdminControlPlaneShell` — no new design system
- No fake CTAs, no decorative filler, no lorem copy, no shell-only pages added
- Every error state uses the actual `refresh()`/`load()` already present in each board (no stubbed retries)
- Existing GREEN gates (mobile-scope-closure, frontend-polish-coverage) preserved untouched

After this pass: 7/7 new gates GREEN, 17 boards trust-grade, 16 closure deliverables complete, AI Engineer hub gains a live `Frontend Polish Truth` tab — and the rest of the project is untouched.

