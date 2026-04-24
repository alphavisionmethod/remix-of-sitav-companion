
# Business Advisor System — State of the Build & Phase 3 Plan

## Current State (verified against repo + DB)

**Shared infrastructure already exists and is reused — no duplication needed:**
- `BUSINESS_ADVISORS` registry (all 9 manifests + governance: authority, blocked actions, sensitivity, disclaimers)
- `AdvisorPageShell` (6 canonical tabs: Chat, Sources, Simulation, Recommendations, Memory, Proof)
- `MobileBusinessAdvisorDetail` (mobile shell)
- `askBusinessAdvisor` + `runAdvisorSimulation` (typed runtime)
- `loadAdvisorContext` (RLS-scoped context loader, dispatcher table at top of file)
- DB tables: `advisor_deployment_status`, `advisor_simulation_runs`, `advisor_source_citations`, `advisor_knowledge`, `advisor_board_recommendations`, `advisor_board_actions`
- DoD checker: `scripts/advisors/check-advisor-deployment-ready.ts`
- Proof artifact: `generated/advisor-boardroom-proof/business-advisor-deployment-check.json`

**Deployment status (from `advisor_deployment_status`):**
| Advisor | Phase | Ready |
|---|---|---|
| sales-advisor | deployment-ready | 1.00 ✅ |
| customer-service-advisor | deployment-ready | 1.00 ✅ |
| cfo-advisor | deployment-ready | 1.00 ✅ |
| marketing-advertising-advisor | deployment-ready | 1.00 ✅ |
| growth-advisor | deployment-ready | 1.00 ✅ |
| **tech-advisor** | **discovery** | **0.00 ← next (Phase 6)** |
| imports-exports-advisor | discovery | 0.00 |
| taxes-laws-advisor | discovery | 0.00 |
| ceo-advisor | discovery | 0.00 |

## Master Roadmap — Build Order (already encoded as `buildOrder` in registry)

1. ✅ Sales — done
2. ✅ Customer Service — done
3. ✅ CFO — done (OS+mobile parity, 6/6 vitest, L2-recommend, blocked: execute_payment/close_books/file_taxes)
4. **Marketing & Advertising** ← Phase 4 (next)
5. Growth — Phase 5 (depends on Marketing analytics surface)
6. Tech — Phase 6
7. Imports & Exports — Phase 7
8. Taxes & Laws — Phase 8 (sensitive, professional disclaimer enforced)
9. CEO — Phase 9 (synthesizes all upstream advisors, builds last)

**Discipline rule:** No phase begins until the previous one is at `ready_score=1.00`, all DoD gates pass, the proof artifact is regenerated, and tests are green.

---

## Phase 3 — CFO Advisor (executable now)

**CFO is `L2-recommend`, `high` risk, `sensitive=true`.** It must never execute financial moves: `execute_payment`, `modify_budget_live`, `close_books`, `file_returns` are already blocked in the registry — no extra work needed.

### Real data substrate (verified in DB)
- `transactions` (user_id, amount_cents, currency, direction, category, status, occurred_at) ✅
- `invoices` (user_id, amount_cents, status, issued_at, due_at, paid_at) ✅
- `budgets` (user_id, category, period_start/end, allocated_cents, spent_cents, status) ✅
- `accounts` (user_id, display_name, industry, status) — used as financial accounts ledger ✅

`forecasts` and `financial_statements` have **no real table** — will remain `null` in the dispatcher → empty-state honesty (already the established pattern).

### Mirrors the proven Sales / CS pattern exactly — 8 artifacts, zero duplication

#### Edit (3 files)
1. **`src/lib/ai-platform/runtime/advisor-context-loader.ts`**
   - Map `transactions` → `transactions`, `budgets` → `budgets`
   - Add `accounts` → `accounts` (under a new `financial_accounts` source key, or repurpose `financial_statements` to point at `accounts` as a near-equivalent ledger). I'll add `transactions` and `budgets` as wired and leave `financial_statements`/`forecasts` honestly null.
   - Extend the `tableName` union with `transactions`, `budgets`, `invoices`.
2. **`src/pages/business-advisors/BusinessAdvisorPage.tsx`** — add `cfo-advisor` branch passing 3 CFO slots.
3. **`src/pages/mobile/MobileBusinessAdvisorDetail.tsx`** — render `<MobileCFOAdvisorPanels />` when id is `cfo-advisor`.

#### Create (5 files in `src/components/business-advisors/cfo/`)
4. **`CFOAdvisorHeaderStats.tsx`** — 4 live tiles (RLS-scoped):
   - **Cash position** = sum(transactions credit) − sum(transactions debit) over last 30 days, formatted in user's currency
   - **Overdue invoices** = count where `status != 'paid'` AND `due_at < now()`
   - **Open invoices total** = sum(amount_cents) where `status IN ('draft','sent','open')`
   - **Budget breach count** = count(budgets) where `spent_cents > allocated_cents` AND `status='active'`
5. **`CFOAdvisorRecommendations.tsx`** — two real lists with click-to-drawer:
   - **Cash-flow risks** — overdue invoices ordered by `due_at ASC` with days-late badge + "Draft collection note" → `askBusinessAdvisor({ intent: 'draft' })`
   - **Budget pressure** — categories where `spent_cents/allocated_cents > 0.85`, sorted by ratio desc, with "Recommend reallocation" → `askBusinessAdvisor({ intent: 'ask' })`
6. **`CFOAdvisorSimulationForm.tsx`** — 3 scenarios via `runAdvisorSimulation`, all read-only (no real money moves):
   - **Runway shift** — "What if revenue drops X%?"
   - **Spend cut** — "What if we cut category Y spend by Z%?"
   - **Collection acceleration** — "What if we collect 30-day-AR in 15 days?"
   - Includes the live-prompt preview pattern proven in CS Simulation form.
7. **`CFODetailDrawer.tsx`** — Sheet drawer for invoice/budget/transaction items: full record + last 10 related transactions + "Draft response/memo" button (mirrors `CustomerServiceDetailDrawer` exactly).
8. **`MobileCFOAdvisorPanels.tsx`** — compact mobile cards (cash, overdue, breaches) following `MobileCustomerServiceAdvisorPanels` shape.

#### Test (1 file)
9. **`src/components/business-advisors/cfo/__tests__/cfo-advisor.test.tsx`** — copy the proven CS test harness:
   - HeaderStats: empty state, populated, currency formatting
   - SimulationForm: live preview updates, submit fires `runAdvisorSimulation` with correct payload
   - Recommendations: empty list, populated list, click-to-drawer

#### Migration + proof regen
10. After all 14 DoD gates pass and `vitest` is green:
    - `UPDATE advisor_deployment_status SET ready_score=1.00, status='deployment-ready', ui_complete=true, backend_complete=true, context_wired=true, phase='deployment-ready' WHERE advisor_id='cfo-advisor'`
    - Re-run `tsx scripts/advisors/check-advisor-deployment-ready.ts` to regenerate `business-advisor-deployment-check.json`

### Trust & safety enforcement (no new code — registry already enforces)
- Authority `L2-recommend` shown in shell header → "Recommend only" pill
- Blocked actions `execute_payment, modify_budget_live, close_books, file_returns` → shown in shell's authority banner
- All amounts shown in the user's transaction currency; never invent forecasts where data is null
- Empty-state honesty for `forecasts` and `financial_statements` (already wired as null)

### Definition of Done (must all be true before Phase 4)
- [ ] All 8 new files exist, no `as any`, semantic tokens only
- [ ] OS page renders 3 CFO slots, mobile renders mobile panels
- [ ] HeaderStats reads from real RLS-scoped tables; empty state shows zero (not skeleton-forever)
- [ ] Recommendations and Drawer use real data and route through `askBusinessAdvisor`
- [ ] SimulationForm shows live prompt preview and writes to `advisor_simulation_runs`
- [ ] All registry blocked actions visible in shell banner
- [ ] Tests pass (`vitest run cfo-advisor`)
- [ ] DoD gate `check-advisor-deployment-ready.ts` returns `ok: true`
- [ ] DB row updated to `ready_score=1.00`
- [ ] Proof artifact regenerated and committed

---

## Phases 4–9 (preview only — built in sequence, one at a time)

Each follows the same 8-artifact template (`HeaderStats`, `Recommendations`, `SimulationForm`, `DetailDrawer`, `MobilePanels`, tests, page wiring x2, context-loader mapping). Sources/data wiring per advisor:

- **Phase 4 — Marketing & Advertising**: needs `campaigns`, `funnels`, `content_assets`, `audience_data` tables. **Audit required first** — these are currently null in the dispatcher. May require minimal table creation if not present elsewhere.
- **Phase 5 — Growth**: depends on Marketing's `funnels` + new `experiments`/`cohorts` tables.
- **Phase 6 — Tech**: needs `product_roadmap`, `tech_stack`, `incidents`. Likely some real, some null.
- **Phase 7 — Imports & Exports**: sensitive, high risk. Needs trade/logistics tables — may be null initially → empty-state honesty.
- **Phase 8 — Taxes & Laws**: critical risk, `L1-suggest`, `professionalDisclaimer=true`. Strictest UI gates; explicit "Not a substitute for licensed professional" disclaimer is already in shell.
- **Phase 9 — CEO**: synthesizes all 8 prior advisors via `advisor_board_recommendations` + `advisor_board_actions` (already wired). Must come last.

For each subsequent phase I will: (1) audit data substrate, (2) report exactly what's missing, (3) ask before creating any new table, (4) follow the same 8-artifact template, (5) flip DB row + regenerate proof.

---

## What I'll execute upon approval (Phase 3 only)

In one default-mode pass:
1. Edit the 3 files
2. Create the 5 new CFO components + 1 test file
3. Run `vitest run cfo-advisor` until green
4. Run the DoD gate script
5. Update `advisor_deployment_status` for `cfo-advisor`
6. Regenerate the proof JSON
7. Update `.lovable/plan.md` to "Phase 3 complete"

I will **stop after Phase 3** and not proceed to Phase 4 until you approve.
