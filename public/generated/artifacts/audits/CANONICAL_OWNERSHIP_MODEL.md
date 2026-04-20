# SITA OS — Canonical Ownership Model

> Every source file in this repository has exactly one canonical home. This document defines those homes and the import rules between them.

## The 7 Top-Level Source Roots

```
src/
├─ pages/         L1 — Routed page components (one per route in src/App.tsx)
├─ components/    L1 — Shared UI components
├─ features/      L1 — Feature-scoped UI bundles
├─ planes/        L1 — Plane-specific UX shells (admin, founder, product, …)
├─ hooks/         L1 — React hooks
├─ contexts/      L1 — React contexts (RuntimeProvider lives here)
│
├─ domains/       L2 — Bounded-context business logic
│   ├─ business/   ├─ finance/    ├─ concierge/   ├─ boardroom/
│   ├─ files/      ├─ identity/   ├─ mission-control/  ├─ proof/
│   ├─ workflows/  ├─ ai-workforce/ ├─ advisors/   ├─ apps/
│   ├─ communications/ ├─ investment/ ├─ engines/  └─ shared/
│
├─ platform/      L3 — Cross-domain governance and services
│   ├─ auth/       ├─ policy/     ├─ proof/       ├─ execution/
│   ├─ eventing/   ├─ observability/ ├─ search/   ├─ notifications/
│   ├─ governance/ ├─ ai-gateway/ ├─ ai/          ├─ verification/
│   ├─ control-plane/ ├─ cloud/   ├─ trust/       ├─ tenancy/
│   ├─ feature-flags/ ├─ launch/  ├─ ci/          ├─ deploy/
│   ├─ migration/  ├─ architecture/ ├─ truth/     ├─ topology/
│   ├─ capabilities/ ├─ fip/      ├─ orchestration/ ├─ operations/
│   ├─ core/       ├─ core-services/ ├─ nova-sdk/ └─ os-services/
│
├─ runtimes/      L3 — Substrate / environment
│   ├─ core/       ├─ devices/    ├─ surfaces/    ├─ reality/
│   ├─ detection/  ├─ shell/      ├─ web/         ├─ desktop/
│   ├─ mobile/     └─ appliance/
│
├─ data/          L3 — Persistence, repositories, projections
│   ├─ clients/    ├─ repositories/ ├─ projections/ ├─ persistence/
│   ├─ adapters/   ├─ sync/        └─ seed/
│
├─ integrations/  L3 — External provider adapters
│   ├─ supabase/   ├─ external/   ├─ shopify/     ├─ api/
│   ├─ connectors/ ├─ providers/  ├─ oauth/       └─ webhooks/
│
├─ contracts/     L3 — Types, schemas, manifests
│   ├─ types/      ├─ schemas/    └─ constants/
│
├─ legacy/        — Explicit archive (never trash)
│
└─ lib/           — Reduced to true shared utilities only
    ├─ utils.ts   (763 importers — the canonical hot-path utility)
    └─ utils/     (true shared helpers)
```

## Import Direction Rules

```
L1 (UX)        → may import L1, L2, L3
L2 (Domains)   → may import L2, L3 (NEVER L1)
L3 (Platform/Runtimes/Data/Integrations/Contracts)
               → may import other L3 only
```

**Forbidden:**
- L3 must NEVER import L1 or L2.
- L2 (`src/domains/*`) must NEVER import `src/pages/*` or `src/components/*`.
- `src/platform/*` must NEVER import `src/domains/*` (use platform extension points instead).
- `src/data/*` must NEVER import `src/domains/*` or `src/platform/*` (data is the bottom).

## Bounded Context Rule

Code belongs to **the domain that owns its concept**, not the domain that uses it.

- A "boardroom" recommendation engine → `src/domains/boardroom/`
- A "finance" payment classifier → `src/domains/finance/`
- A *cross-domain* recommendation aggregator → `src/platform/orchestration/`

## Single-Source-of-Truth Rule

Each concept has exactly one canonical implementation. Wrappers and barrels do not count as second canonical homes — they are explicit re-exports tracked in `src-lib-wrapper-map.json`.

## Enforcement

- `scripts/architecture/check-layer-boundaries.ts` — CI gate
- `scripts/architecture/checks/check-lib-ownership-drift.ts` — Wave 8
- `scripts/architecture/checks/check-misplaced-{runtime,data,domain}-logic.ts` — Wave 8
