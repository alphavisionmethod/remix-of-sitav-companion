# Cost Spotlight Empty-State Spec

**Status:** DEFERRED — out-of-admin-AI-engineering-scope
**Required marker:** user-flagship-pass-required (health-domain-pass)
**Generated:** 2026-04-19
**Validator:** `scripts/validation/check-cost-spotlight-empty-state.ts`

---

## 1. Surface state in repo

| Item | Status |
|---|---|
| Route `/admin/health/cost-spotlight` | **DOES NOT EXIST** |
| Page file `src/pages/admin/health/CostSpotlight.tsx` | **DOES NOT EXIST** |
| Health domain owner | Health domain (NOT admin AI engineering) |

The user constraint is explicit: only the admin AI engineer team is in scope. Creating a page under `src/pages/admin/health/**` would violate that scope and also create an ownership conflict.

## 2. Required empty-state when health domain builds the surface

Once the health domain pass adopts this board, its empty state MUST:

1. Use canonical primitive `PremiumEmptyState`
2. Title: `Cost spotlight is still accumulating history`
3. Description: explain that 7-day cost trend visualization requires ≥7 days of `ai_usage_ledger` data; current point-in-time cost signals are already available on dedicated boards
4. Why-empty: "Spotlight requires ≥7 days of recorded usage. Current rolling window: <N days>."
5. Next-step actions:
   - Primary: `<Link to="/admin/ai-gateway/budget-center">Open AI Budget Center</Link>` (canonical AIG04)
   - Secondary: `<Link to="/admin/ai-gateway/usage-ledger">View raw usage ledger</Link>` (canonical AIG05)
   - Tertiary: `<Link to="/admin/ai-team/cost">Open AI cost efficiency board</Link>` (canonical AIT05)
6. Optional preview block: if a sample sparkline is shown, it MUST be wrapped in `<Badge>preview · non-live</Badge>` and the underlying chart MUST use `data-preview="true"` so analytics never confuses it with real data

## 3. Canonical destinations meanwhile (real navigable routes — confirmed present)

Operators inspecting cost today already have full coverage:
- `src/pages/admin/AIG04BudgetCenter.tsx` → `/admin/ai-gateway/budget-center`
- `src/pages/admin/AIG05UsageLedgerExplorer.tsx` → `/admin/ai-gateway/usage-ledger`
- `src/pages/admin/AIT05CostEfficiency.tsx` → `/admin/ai-team/cost`

The deferred spotlight is a 7-day-trend convenience view — the underlying data is already inspectable.

## 4. No-fake-green enforcement

The validator `check-cost-spotlight-empty-state.ts` emits WARN with explicit cross-reference until the page file is created and adopts `PremiumEmptyState`. It NEVER silent-passes. To flip to GREEN:

- Page file exists at `src/pages/admin/health/CostSpotlight.tsx`
- Imports `PremiumEmptyState` (or `EmptyState`)
- Any sample/preview content is explicitly labeled non-live
- Includes the 3 canonical destination links from §2

## 5. Markers (validator parses these)

- `DEFERRED`
- `user-flagship-pass-required`
- `health-domain-pass`
