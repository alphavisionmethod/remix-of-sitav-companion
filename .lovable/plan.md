

The user wants me to scan every file for stubs/placeholders and replace with "most advanced code, fully wired." This is an extremely broad request on a 4,290+ TS file codebase. I need to scope this properly before proposing work.

Let me think about what's realistic:

1. **The codebase is already audited.** We have `generated/FULL_ISSUES_AND_FIXES.md` v2.1 listing every known gap, and Phase 32 "It's Real" gate returned `real / 13-of-13 / deployable: true`.

2. **"Stubs and placeholders" has a specific meaning here.** From the audit:
   - `WorkflowStepStub.tsx` is an intentional, registered fallback surface (not a stub-to-fix).
   - The CTA wiring scanner already exists (`scripts/architecture/checks/check-cta-wiring.ts`) and detects: `onClick={() => {}}`, `href="#"`, TODO/FIXME, `alert(...)` stubs.
   - The anti-pattern checker covers `as any`, console.log, etc.

3. **A blanket "rewrite every file with advanced code" is destructive.** It would:
   - Break the 13/13 green gate
   - Violate the Component Constitution and Service Constitution
   - Touch 4,290 files with no acceptance criteria
   - Risk the 100% RLS coverage and trust framework

The right move is to **run the existing stub/placeholder scanners, get the actual list of offenders, and fix them in priority order with concrete acceptance criteria** — not a vibes-driven mass rewrite.

## Plan — Stub & Placeholder Eradication Sweep (evidence-first)

### Phase 1 — Run the existing scanners, get real numbers

Run in parallel and capture counts:
- `scripts/architecture/checks/check-cta-wiring.ts` → empty `onClick`, `href="#"`, TODO/FIXME, `alert()`
- `scripts/architecture/checks/check-platform-anti-patterns.ts` → `as any`, console.log, dead code
- `grep -rE "TODO|FIXME|XXX|HACK|PLACEHOLDER|stub|mock data" src/ --include="*.ts" --include="*.tsx"`
- `grep -rE "throw new Error\\([\"']Not implemented" src/`
- `grep -rE "return null;\\s*//\\s*(stub|todo)" src/`
- `grep -rE "Lorem ipsum|placeholder text|coming soon" src/`

### Phase 2 — Categorize hits

| Category | Action |
|---|---|
| **Real stubs** (empty handlers, `Not implemented`, lorem ipsum) | Wire to canonical service via Executor; emit receipt |
| **Intentional fallbacks** (`WorkflowStepStub`, `EmptyState`) | Leave; document in registry |
| **Demo/seed data** in Demo mode pages | Leave; gated by `truthState="demo"` banner |
| **TODO comments** | Convert to GitHub issues or remove if stale |
| **Placeholder copy** in low-priority pages | Replace with real copy from domain dictionary |

### Phase 3 — Fix in priority order

Priority = **risk tier × surface traffic**:

1. **P0 — Trust-bearing surfaces with stubs** (Boardroom, Approvals, Money, Auth) — must be 100% wired
2. **P1 — Flagship Loop pages** (5 loops × ~6 pages each = 30 pages)
3. **P2 — Domain hub indexes** (Business/Money/Concierge/Files top-level)
4. **P3 — Admin/Verification consoles**
5. **P4 — Tail pages** (one-off settings, rare drill-downs)

### Phase 4 — Wiring rules (no behavior drift)

- Every CTA fix routes through `Executor` (the single chokepoint per HARD RULE)
- Every new handler emits a receipt to `boardroom_decision_receipts` or `inference_receipts` per risk tier
- No new `as any`; no new console.log; no direct provider SDK calls
- All AI usage through `invokeAICapability`
- Update `generated/FULL_ISSUES_AND_FIXES.md` only after `tsc --noEmit` is green and the relevant scanner returns `0`

### Phase 5 — CI hardening

After cleanup, tighten the scanners:
- `check-cta-wiring.ts` → upgrade from warning to **error** on `src/pages/**` and `src/components/business/**`, `src/components/money/**`, `src/components/concierge/**`
- Add `check-stubs-and-placeholders.ts` as a new dedicated gate

### What I need from you before starting

I cannot responsibly rewrite 4,290 files in one pass. I need you to choose the scope:

**Option A — Audit-only (recommended first step, 1 batch):**
Run all scanners, produce `generated/STUBS_AND_PLACEHOLDERS_REGISTER.md` with every hit categorized and prioritized. **No code changes.** Then you decide what to fix.

**Option B — P0+P1 only (~60 pages, 3-5 batches):**
Fix every stub in trust-bearing surfaces and Flagship Loop pages. Leave P2-P4 in the register for later.

**Option C — Full sweep (P0-P4, ~15-25 batches over many turns):**
Eradicate every real stub across the entire `src/pages/**` and trust-bearing components. Multi-day effort. High risk of regression without per-batch QA.

### Files touched (final, after acceptance)

- 1 new generator: `scripts/architecture/audits/audit-stubs-placeholders.ts`
- 1 new register: `generated/STUBS_AND_PLACEHOLDERS_REGISTER.md`
- N page/component files (depends on Option chosen)
- 2 CI checks tightened: `check-cta-wiring.ts`, new `check-stubs-and-placeholders.ts`
- 1 doc update: `generated/FULL_ISSUES_AND_FIXES.md`

### Acceptance criteria

| Check | Target |
|---|---|
| Scanner produces evidence register | ✅ |
| Every fix has receipt + Executor path | ✅ |
| `tsc --noEmit` | 0 errors |
| Phase 32 "It's Real" gate | stays 13/13 green |
| `as any` in pages | stays 0 |
| New CI gate `check-stubs-and-placeholders` | passes |

**Pick A, B, or C and I'll execute.** Default recommendation: **Option A first** so we work from evidence, not assumption.

