

## Re-Audit — Checklist 17: Boardroom / Domain OS Reality

Live disk + DB truth across 5 domains. **Result: 28/50 verified, 22 concrete gaps.**

### Per-Domain Scorecard

| Domain | Owner | Routes | Models | Services | APIs | Tables | Tests | Mobile | Admin Obs | Proofs | Score |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **Business OS** | ⚠️ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ✅ | 7/10 |
| **Finance/Money OS** | ⚠️ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ⚠️ | ⚠️ | 6/10 |
| **Concierge OS** | ⚠️ | ✅ | ✅ | ✅ | ❌ | ⚠️ | ❌ | ✅ | ⚠️ | ⚠️ | 5/10 |
| **Investment Office** | ❌ | ⚠️ | ❌ | ⚠️ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | 3/10 |
| **Boardroom** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | 7/10 |

### Concrete Gaps Found

1. **`domain_ownership_registry` missing 5 domain rows** — only 12 platform/cloud entries; zero rows for `business-os`, `finance-os`, `concierge-os`, `investment-office`, `boardroom`
2. **Business core tables MISSING from live DB** — manifest declares `customers, deals, invoices, quotes, proposals, contacts, accounts, bookings, service_orders, communications`; **none exist**. 9 services do `.from('customers'|'deals'|'invoices'|'communications')` against ghost tables
3. **Finance core tables MISSING** — manifest declares `transactions, bills, budgets, envelopes, sinking_funds, subscriptions, assets, portfolios, receivables, debt_obligations, capital_buckets, investment_theses, scenarios, reserves` → **0 of 14 exist**
4. **Investment Office has zero canonical infrastructure** — no manifest in `domain-system/manifests/`, no `/investment` top-level route in `business/concierge/boardroom-routes`, only mounted under `experimental-routes.tsx`, zero tables (`portfolios, holdings, positions, theses` all missing), no edge fn writes proofs
5. **Investment-office routes are "experimental"** — 41 pages in `src/pages/investment-office/` but routed via `experimental-routes.tsx` with no canonical route file
6. **Boardroom edge fn missing** — `boardroom_sessions/items/recommendations/decision_receipts` tables exist with RLS, but **no `boardroom-*` edge function** (only `business-board-api`); no canonical write API
7. **No e2e test for Investment Office** — `tests/e2e/` has no `investment-journey.spec.ts`
8. **No e2e test for Concierge Domain** — no `concierge-journey.spec.ts`
9. **`DomainRealityBoard.tsx` admin page is mock** — uses `DEMO_ADMIN_DOMAINS` constant, not live domain truth
10. **No Gate 35 `check-domain-reality.ts`** — gates exist for connectors/workflows/ai-advisor but not domains

---

## Phase 24 — Domain OS Reality Closure

### 24.A — Persist domain ownership (fixes #1)
DB migration: insert 5 rows into `domain_ownership_registry` for `business-os`, `finance-os`, `concierge-os`, `investment-office`, `boardroom` with owning_service, plane, dependencies, api_surface, status='active'.

### 24.B — Restore Business + Finance core tables (fixes #2, #3)
DB migration creating 24 missing tables with RLS (user-scoped, org-scoped where applicable):
- **Business (10)**: `customers, deals, invoices, quotes, proposals, contacts, accounts, bookings, service_orders, communications`
- **Finance (14)**: `transactions, bills, budgets, envelopes, sinking_funds, subscriptions, assets, portfolios, receivables, debt_obligations, capital_buckets, investment_theses, scenarios, reserves`
All tables: `id uuid pk`, `user_id uuid not null`, `org_id uuid nullable`, status enum per manifest, `created_at/updated_at`, RLS `user_id = auth.uid() OR is_org_member(auth.uid(), org_id)`.

### 24.C — Investment Office canonical lift (fixes #4, #5)
- **NEW `src/lib/domain-system/manifests/investment-manifest.ts`** — entities: `portfolio, holding, position, instrument, thesis, trade, watchlist, alert, scenario`; workflows: `trade-execution, rebalance, thesis-validation, risk-review`
- Register in `domain-registry.ts`
- **NEW `src/routes/investment-routes.tsx`** — canonical `/investment/*` routes lifted from experimental-routes
- **NEW DB migration**: `portfolios, holdings, positions, trades, instruments, theses, watchlists` with RLS

### 24.D — Boardroom canonical edge fn (fixes #6)
- **NEW edge fn `boardroom-session`** — actions: `assemble, add-item, add-evidence, recommend, vote, decide, adjourn`. Every state transition writes `boardroom_decision_receipts`.
- **NEW edge fn `boardroom-replay`** — admin replay of past sessions
- Wire `Boardroom.tsx` + `WeeklyBoardroom.tsx` to invoke through this fn instead of direct table inserts

### 24.E — Domain e2e tests (fixes #7, #8)
- **NEW `tests/e2e/investment-journey.spec.ts`** — auth gate + `/investment/portfolio` smoke
- **NEW `tests/e2e/concierge-journey.spec.ts`** — auth gate + `/concierge/overview` + `/concierge/errands`

### 24.F — Wire DomainRealityBoard to live truth (fixes #9)
Edit `src/pages/admin/DomainRealityBoard.tsx`:
- Replace `DEMO_ADMIN_DOMAINS` with live query that joins:
  - `domain_ownership_registry` (owner, plane)
  - `getAllDomains()` from manifest registry (entities, workflows)
  - `getAllDomainCompleteness()` (scoring)
  - DB introspection RPC `get_db_truth_snapshot` to confirm each manifest `dbTable` exists
- Render real read/write path readiness per entity

### 24.G — Gate 35 + report (fixes #10)
- **NEW `scripts/architecture/checks/check-domain-reality.ts`** (Gate 35):
  - Each of 5 domains has manifest in `domain-system/manifests/`
  - Each has row in `domain_ownership_registry`
  - Every manifest `dbTable` exists in live schema
  - Every domain has canonical routes file (`src/routes/{domain}-routes.tsx`)
  - Every domain has e2e spec (`tests/e2e/{domain}-journey.spec.ts`)
  - Every domain has at least one edge fn or BFF
  - Boardroom has `boardroom_decision_receipts` proof writes
- Bump `gateCount: 35` in `ci-gate-registry.ts` + `ci-umbrella-manifest.json`
- Emit `generated/domain-reality-report.json`

### Files

| Layer | Change |
|---|---|
| DB migration | 5 ownership rows + ~24 business/finance tables + ~7 investment tables, all RLS |
| `src/lib/domain-system/manifests/investment-manifest.ts` | NEW |
| `src/lib/domain-system/domain-registry.ts` | Register investment + boardroom |
| `src/lib/domain-system/manifests/boardroom-manifest.ts` | NEW |
| `src/routes/investment-routes.tsx` | NEW canonical |
| `src/App.tsx` | Mount `getInvestmentRoutes()` |
| Edge fn `boardroom-session` | NEW |
| Edge fn `boardroom-replay` | NEW |
| `src/pages/admin/DomainRealityBoard.tsx` | REWIRE — live data |
| `tests/e2e/investment-journey.spec.ts` | NEW |
| `tests/e2e/concierge-journey.spec.ts` | NEW |
| `scripts/architecture/checks/check-domain-reality.ts` | NEW Gate 35 |
| `src/lib/ci/ci-gate-registry.ts` + manifest | gateCount 35 |
| `src/lib/db/non-edge-table-io-sources.ts` | Register new tables |
| `generated/domain-reality-report.json` | NEW |

### Acceptance

- `SELECT count(*) FROM domain_ownership_registry WHERE domain_key IN ('business-os','finance-os','concierge-os','investment-office','boardroom')` = 5
- `SELECT * FROM customers LIMIT 1` succeeds (empty OK); same for all 24 restored tables
- `SELECT * FROM portfolios LIMIT 1` succeeds; same for 7 investment tables
- `getDomainManifest('investment')` returns a manifest; `getDomainCompleteness('investment')` ≥ B
- `boardroom-session { action:'decide', session_id }` writes a `boardroom_decision_receipts` row
- `DomainRealityBoard` renders 5 domains from live registry (no DEMO_ADMIN_DOMAINS reference)
- Gate 35 green; report `ok:true` with all 5 domains scoring 10/10
- Checklist 17 truthfully **50/50 — fully deployable**

