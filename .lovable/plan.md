

## Wave 7 — Stub & Demo-Flag Hardening (Final Production Sweep)

### Truth check (what's actually wrong vs. what looks wrong)

The 1,038 hits in §15 conflate three very different categories:

| Category | Count (approx) | Real risk |
|---|---|---|
| Doc-strings / JSDoc / future-work prose (`// TODO:`, `XXX from runbook-registry`, etc.) | ~900 | **None** — informational |
| Test fixtures (`vi.mock`, `__tests__/**`) | ~120 | **None** — test-only |
| **Hardcoded `const isDemoMode = true` at module scope in production pages** | **14 prod files + 5 tests** | **High** — memory violation `constraints/reality-mode-wiring` |
| **Pages still reading `useDataMode()` instead of `useAuth().isDemo`** | **3 files** (ActivityStream, MediaWorkspace, ProofCenter) | **Medium** — wiring drift |
| **Pages where the module-scope flag is NOT shadowed** → permanently frozen demo | **2 files** (`investment-office/InvestmentReceipts.tsx`, `integrations/ConnectionsList.tsx`) | **Critical** — these pages can never go live |

So the §15 advice ("most hits are doc-strings, no `MOCK_AUTH_USER` flags found") is technically true but **misses the 2 pages that are stuck in demo permanently and the 14 that violate the canonical wiring rule**.

### Out of scope (explicitly not touched)
- 900+ doc-string `TODO/XXX/FIXME` markers — informational, not code paths
- `coming_soon` enum values inside `feature-reality-types.ts`, `runtime-tier-model.ts`, `degraded-state-classes.ts` — these are **legitimate state labels**, not stubs
- `sample notes.md` content inside `TerminalWindow.tsx` and template strings in `DocumentEditor.tsx` — user-facing demo content
- `INITIAL_TODOS` in `TodoWindow.tsx` — that's the actual to-do widget's seed list
- Phase 15 mega-gates (lib decomposition / legacy wrappers) — owned elsewhere

### Wave 7 implementation

#### 7.1 Fix the 2 critical "frozen-demo" pages
- `src/pages/integrations/ConnectionsList.tsx`: delete module-scope `const isDemoMode = true`; add `const { isDemo } = useAuth(); const isDemoMode = isDemo;` inside the component body (matching every other page's pattern).
- `src/pages/investment-office/InvestmentReceipts.tsx`: same fix.

#### 7.2 Re-wire 3 drifted pages to canonical auth source
- `src/pages/ActivityStream.tsx`, `src/pages/MediaWorkspace.tsx`, `src/pages/ProofCenter.tsx`: replace `const { isDemoMode } = useDataMode();` with `const { isDemo } = useAuth(); const isDemoMode = isDemo;` to match `constraints/reality-mode-wiring`.

#### 7.3 Remove dead module-scope flag from the 11 already-shadowed pages
For each of: `AIWorkforcePage`, `ApprovalChamber`, `CommunicationsPage`, `GlobalBoardroom`, `GovernanceDashboard`, `OutcomeEnginePage`, `TasksWorkflowsCenter`, `TrustCenter`, `enterprise/EnterpriseControlPlane`, plus the 3 from §7.2 above (after the rewire) — delete the dead `const isDemoMode = true; // Safe default for demo mode` line. It's already shadowed; removing it eliminates a future foot-gun and the 14-file memory violation.

#### 7.4 Strip the same line from 5 test files
The `__tests__/{Boardroom,BusinessCenter,DailyPulse,MoneyCenter,SettingsPage}.test.tsx` files have the same dead line at module scope, unused by the test bodies (the test mock already returns `isDemoMode: true`). Remove for cleanliness.

#### 7.5 Add new BLOCK gate `check-hardcoded-demo-flags.ts`
Create `scripts/architecture/checks/check-hardcoded-demo-flags.ts` that scans `src/pages/**` and `src/components/**` for the regex `/^(?:export\s+)?const\s+isDemoMode\s*=\s*(true|false)\s*;/m` at module scope. Emits `generated/hardcoded-demo-flags-report.json`. Behavior:
- BLOCK on any hit in `src/pages/**` or `src/components/**` outside `__tests__`.
- Allow inside test files.
- Register in `check-os-release-readiness.ts` as the **248th BLOCK gate** (with writer + validator-map entry).

#### 7.6 Add new advisory gate `check-stub-density.ts`
Create `scripts/architecture/checks/check-stub-density.ts` per §15.3 recommendation. Counts `TODO|FIXME|XXX|HACK` in `src/**` excluding `__tests__` and known doc-string allowlist. Emits `generated/stub-density-report.json`. Establishes a baseline budget (e.g., current count + 50) and warns on regression. Advisory only (not BLOCK), so it can't break a release but visibly tracks drift.

#### 7.7 Refresh ground truth
- Append `WAVE7_STUB_HARDENING.md` operator note (sibling of `WAVE6_*`) summarizing the 19-line cleanup, the 2-critical-page fix, and the new gates.
- Update `public/generated/MASTER_AUDIT.md` Part XV: replace "1,038 hits" line with the truthful breakdown (doc-strings vs. real flags), confirm zero hardcoded demo overrides remain, and bump BLOCK count from 247 → **248**.
- Mirror to `public/generated/artifacts/audits/MASTER_AUDIT.md`.
- Update `WAVE2_ADVISORY_DISPOSITION.md` with Wave 7 entry.

#### 7.8 Aggregator re-run + verdict
- Run `npx tsx scripts/architecture/checks/check-os-release-readiness.ts`.
- Expected: **248/248 BLOCK GREEN, 0 errors, 0 missing**. Stub-density advisory establishes its baseline on first run.

### Files to be created
- `scripts/architecture/checks/check-hardcoded-demo-flags.ts`
- `scripts/architecture/checks/check-stub-density.ts`
- `WAVE7_STUB_HARDENING.md`

### Files to be edited (19 source files + 4 docs)

**Critical fix (2):**
- `src/pages/integrations/ConnectionsList.tsx`
- `src/pages/investment-office/InvestmentReceipts.tsx`

**Re-wire to useAuth (3):**
- `src/pages/ActivityStream.tsx`
- `src/pages/MediaWorkspace.tsx`
- `src/pages/ProofCenter.tsx`

**Remove dead module-scope flag (9 prod):**
- `src/pages/AIWorkforcePage.tsx`
- `src/pages/ApprovalChamber.tsx`
- `src/pages/CommunicationsPage.tsx`
- `src/pages/GlobalBoardroom.tsx`
- `src/pages/GovernanceDashboard.tsx`
- `src/pages/OutcomeEnginePage.tsx`
- `src/pages/TasksWorkflowsCenter.tsx`
- `src/pages/TrustCenter.tsx`
- `src/pages/enterprise/EnterpriseControlPlane.tsx`

**Test cleanup (5):**
- `src/pages/__tests__/{Boardroom,BusinessCenter,DailyPulse,MoneyCenter,SettingsPage}.test.tsx`

**Aggregator + docs (5):**
- `scripts/architecture/checks/check-os-release-readiness.ts`
- `public/generated/MASTER_AUDIT.md`
- `public/generated/artifacts/audits/MASTER_AUDIT.md`
- `WAVE2_ADVISORY_DISPOSITION.md`

### Stop conditions
1. Any of the existing 247 BLOCK gates flips RED after registration of `check-hardcoded-demo-flags` → halt and report.
2. Removing module-scope `isDemoMode` breaks a page render (i.e., the const was actually used somewhere outside the component) → restore and convert to a function-scope binding.
3. Stub-density baseline detection fails (no allowlist viable) → ship advisory in count-only mode without budget enforcement.

### What this delivers
- **0 hardcoded demo overrides** in production pages (down from 14).
- **2 frozen-demo pages** (`InvestmentReceipts`, `ConnectionsList`) actually go live when `isDemo === false`.
- **3 drifted pages** realigned to the canonical `useAuth().isDemo` wiring per memory rule.
- **New BLOCK gate (#248)** prevents this regression class forever.
- **New advisory gate** tracks the 1,038-hit stub density per §15.3 recommendation.
- **Documentation** stops claiming "1,038 stubs are all benign" and shows the actual zero-real-flag truth.
- BLOCK status: **248/248 GREEN, 0 errors, 0 missing** — system stays release-cuttable.

