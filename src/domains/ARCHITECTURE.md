# `src/domains/` — Domain Layer Architecture

This directory is the **canonical home for business-domain logic** in SITA OS.
It is structured into three concentric layers with strict, one-way dependencies:

```
contracts ──▶ business (entities, types) ──▶ engines (pure functions)
                                                    │
                                                    ▼
                                       ❌ NEVER imports services / persistence / supabase
```

## Layer Charter

| Layer | Path | Owns | Forbidden |
|---|---|---|---|
| **Contracts** | `src/domains/business/contracts/` | Re-exports from `@/packages/business-contracts`. Single import surface for shared shapes. | Runtime logic, side effects |
| **Business types** | `src/domains/business/` | Canonical entity types (Lead, Invoice, Account, etc.) and the public barrel. | Side effects, persistence |
| **Engines** | `src/domains/engines/` | **Pure** deterministic functions — scoring, classification, transformation, planning. Inputs in → outputs out. | `localStorage`, `fetch`, Supabase, services, persistence |
| **Services** (sibling) | `src/lib/services/business-os/` | All side effects: persistence, network, storage, time. Consumes domain types/engines. | Defining new domain types |
| **UI / Pages** | `src/modules/business/**`, `src/components/business/**` | Presentation. Imports types from `@/domains/business`, runtime helpers from engines, side effects from services. | Defining business types or owning logic |

## Allowed Import Direction

```
UI ──▶ services ──▶ engines ──▶ business types ──▶ contracts
              └──▶ engines ──▶ business types ──▶ contracts
```

- Engines may import **types** from `@/domains/business` only.
- Engines may **NOT** import from `@/lib/services/*`, `@/data/persistence/*`, or `@/integrations/supabase/*`.
- UI components import **types** from `@/domains/business`; **runtime helpers** from `@/domains/engines/<name>`; **side effects** from `@/lib/services/business-os/*`.

## Documented Allowlist (intentional exceptions)

These are enforced by `scripts/architecture/check-engine-purity.ts`:

| File | Allowance | Rationale |
|---|---|---|
| `engines/setup-orchestration-engine.ts` | `localStorage` adapter methods (`persistToLocalStorage`, `loadFromLocalStorage`, `clearLocalStorage`) | Kernel-level setup FSM whose interruption-recovery contract is part of its public API. |
| `engines/action-state-machine.ts` | imports `@/data/persistence/action-lineage-persistence` | Durable 16-state FSM backed by `os_action_lineage`; durability is part of the contract. |

## Verification

Run locally and in CI:

```sh
npx tsx scripts/architecture/check-engine-purity.ts
```

The script will FAIL if a new engine adds storage, network, or service imports without being added to the allowlist (and documented above).
