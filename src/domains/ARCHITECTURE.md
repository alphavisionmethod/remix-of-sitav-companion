# `src/domains/` — Domain Layer Architecture

This directory is the **canonical home for domain logic** in SITA OS across all
canonicalized modules: **business**, **concierge**, **finance**, and
**investment**. It is structured into three concentric layers with strict,
one-way dependencies:

```
contracts ──▶ business (entities, types) ──▶ engines (pure functions)
                                                    │
                                                    ▼
                                       ❌ NEVER imports services / persistence / supabase
```

## Canonical Module Layer Charter

| Layer | Path | Owns | Forbidden |
|---|---|---|---|
| **Contracts** | `src/domains/<module>/contracts/` | Re-exports from `@/packages/<module>-contracts`. Single import surface for shared shapes. | Runtime logic, side effects |
| **Domain types** | `src/domains/<module>/` (+ `types/`, `fixtures/`) | Canonical entity types and the public barrel. Investment also co-locates demo fixtures (gated at consumer layer). | Side effects, persistence |
| **Engines** | `src/domains/engines/` | **Pure** deterministic functions — scoring, classification, transformation, planning. Inputs in → outputs out. Shared across modules. | `localStorage`, `fetch`, Supabase, services, persistence |
| **Services** (sibling) | `src/lib/services/<module>-os/` | All side effects: persistence, network, storage, time. Consumes domain types/engines. | Defining new domain types |
| **UI / Pages** | `src/modules/<module>/**`, `src/components/<module>/**`, `src/pages/<center>` | Presentation. Imports types from `@/domains/<module>`, runtime helpers from engines, side effects from services. | Defining domain types or owning logic |

### Canonical modules and their consumers

| Module | Domain barrel | Service layer | Primary UI surface |
|---|---|---|---|
| **business** | `@/domains/business` | `src/lib/services/business-os/` | `src/modules/business/`, `src/pages/Business*` |
| **concierge** | `@/domains/concierge` | `src/lib/services/concierge-os/` | `src/modules/concierge/`, `src/pages/ConciergeCenter.tsx` |
| **finance** | `@/domains/finance` | `src/lib/services/finance-os/` | `src/modules/finance/`, `src/pages/MoneyCenter*` |
| **investment** | `@/domains/investment` | (consumes finance services) | `src/modules/finance/pages/investment-office/**` (canonical), routed through `<InvestmentShellPage>` shell parent (Phase 6). |

## Allowed Import Direction

```
UI ──▶ services ──▶ engines ──▶ domain types ──▶ contracts
              └──▶ engines ──▶ domain types ──▶ contracts
```

- Engines may import **types** from any `@/domains/<module>` barrel only.
- Engines may **NOT** import from `@/lib/services/*`, `@/data/persistence/*`, or `@/integrations/supabase/*` (allowlist below).
- UI components import **types** from `@/domains/<module>`; **runtime helpers** from `@/domains/engines/<name>`; **side effects** from `@/lib/services/<module>-os/*`.
- Domain barrels MUST NOT regress to `export {};` — guarded by `scripts/architecture/audits/check-no-empty-domain-barrels.ts` (Phase 7).

## Routing Invariants (Phase 5 / Phase 6)

- `/investment/*` (singular) is the **single canonical Investment Office namespace**. Plural `/investments/*` lives ONLY in `src/routes/redirects/user-redirect-map.ts` (compatibility surface). Guarded by `scripts/architecture/audits/check-investment-route-namespace.ts`.
- Both investment route families (`getInvestmentRoutes()` core 18 + `getInvestmentOfficeRoutes()` extended 23 = 41 total) MUST nest under a single `<Route element={<InvestmentShellPage />}>` parent in `src/App.tsx` so every `/investment/*` path renders inside the shared workspace chrome via `<Outlet />`. Guarded by `src/__tests__/architecture/investment-shell-mount.test.ts`.

## Documented Allowlist (intentional exceptions)

These are enforced by `scripts/architecture/check-engine-purity.ts`:

| File | Allowance | Rationale |
|---|---|---|
| `engines/setup-orchestration-engine.ts` | `localStorage` adapter methods (`persistToLocalStorage`, `loadFromLocalStorage`, `clearLocalStorage`) | Kernel-level setup FSM whose interruption-recovery contract is part of its public API. |
| `engines/action-state-machine.ts` | imports `@/data/persistence/action-lineage-persistence` | Durable 16-state FSM backed by `os_action_lineage`; durability is part of the contract. |

## Verification

Run locally and in CI:

```sh
# Engine purity (Phase 4)
npx tsx scripts/architecture/check-engine-purity.ts

# Canonical domain barrels non-empty (Phase 7)
npx tsx scripts/architecture/audits/check-no-empty-domain-barrels.ts

# Investment route namespace singular (Phase 7)
npx tsx scripts/architecture/audits/check-investment-route-namespace.ts

# Architecture test suite (domain barrels + investment namespace + shell mount)
npx vitest run src/__tests__/architecture/
```

All four are wired into `.github/workflows/check-boundaries.yml`. Any one of them failing blocks the PR.
