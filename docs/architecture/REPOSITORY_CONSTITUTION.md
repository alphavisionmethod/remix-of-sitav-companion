# SITA OS — Repository Constitution

**Status:** Adopted (Wave 1 of the Repository Tree Canonicalization).
**Authority:** This file defines the canonical ownership model for the SITA OS
source tree. Every CI architecture validator references it. Disagreements are
resolved by amending this file via an ADR in `docs/adr/` — never by editing
source code in violation of the rules below.

The full migration plan (9 waves, with rollback strategy per wave) lives at
`generated/audits/repository-canonicalization-plan.md`. This constitution is the
steady-state target — independent of what wave is currently in progress.

---

## Top-level ownership map

| Folder | Owner | What lives here | What MUST NOT live here |
|---|---|---|---|
| `src/app/` | App bootstrap | Top-level orchestration: route assembly, providers, shell composition | Product logic, services, page bodies |
| `src/modules/` | Product pillars | The four user-facing pillars (`business`, `concierge`, `finance`, `health`), each owning its pages, components, and service facades. `_shared` and `_trust` are **deprecated shims** (see Wave 3); canonical homes are in `src/platform/`. | Cross-pillar systems (move to `src/platform/`); generic UI primitives (move to `src/components/`) |
| `src/platform/` | Cross-pillar systems | Trust (`platform/trust`), AI (`platform/ai`), Knowledge (`platform/knowledge`), workspace context (`platform/workspace`), module registry (`platform/registry`), shared contracts (`platform/contracts`), notifications, files, owner, mission-control, atlas, tenant, enterprise, personal-brain, runtime, integration, observability, search, security, governance, app-platform | Pillar-specific product code (move to `src/modules/<pillar>/`) |
| `src/domains/` | Pure domain models | Contracts, entities, engines — **must be side-effect free** | DB calls, network calls, React imports, any `from "@/integrations/supabase"` |
| `src/lib/services/` | Side effects | Persistence, connectors, edge-function calls, external integrations | UI components; pure logic (move to `src/domains/`) |
| `src/runtimes/` | Runtime/host abstractions | Tier contracts, capability maps, host adapters, deployability matrix | Product UI |
| `src/pages/` | Route adapters only | **Thin re-exports** from `src/modules/<pillar>/pages/` or `src/platform/<system>/pages/`. Maximum size: 40 lines or pure `export { default } from "..."`. | Original product page bodies; complex layouts; data fetching |
| `src/components/` | Shared presentation | Reusable, presentation-only components used by ≥2 pillars | Pillar-specific components (move to `src/modules/<pillar>/components/`); page bodies |
| `src/routes/` | Route registries | Route maps, lazy import wiring, redirect tables | Page bodies |
| `src/admin/` | Admin canonical home | All admin/operator pages, modules, shell, navigation | Product (non-admin) pages |
| `src/contexts/` | React contexts | Provider components and their state contracts | Services with side effects unrelated to React state |
| `src/hooks/` | Reusable React hooks | Cross-cutting hooks | Hooks owned by a single pillar (move to `src/modules/<pillar>/hooks/`) |
| `src/contracts/` | Public contracts | Stable cross-layer types and constants | Implementation code |
| `src/integrations/` | Generated integration clients | Auto-generated Supabase client and types | **Never edit `client.ts` or `types.ts` manually** |
| `src/data/` | Static seed/reference data | Static lookup tables, repository barrels | Live data (use `src/lib/services/`) |
| `src/test/`, `src/__tests__/` | Test infrastructure | Test harnesses, fixtures, suites | Production code |
| `src/i18n/`, `src/types/`, `src/assets/`, `src/layouts/`, `src/features/`, `src/packages/`, `src/website-demo/`, `src/shell-runtime/`, `src/planes/` | Specialized | See per-folder MANIFEST.md | — |
| `generated/` | Machine-owned outputs | `manifests/`, `proof/`, `readiness/`, `audits/`, `historical/` | Hand-authored docs (move to `docs/`) |
| `public/generated/` | Publish-safe artifact subset | Only artifacts safe to ship in the static bundle | Anything not on the publish allowlist |
| `docs/` | Authored documentation | `architecture/`, `adr/`, `runbooks/`, `reference/` | Generated/computed truth (move to `generated/`) |

---

## Pillar boundary rules (CI-enforced)

1. **No pillar crosstalk.** `src/modules/business/**` MUST NOT import from `src/modules/{concierge,finance,health}/**` and vice versa.
2. **Platform serves pillars, never the reverse.** `src/platform/**` MUST NOT import from `src/modules/<pillar>/**`.
3. **Pillars MAY import from** `src/platform/**` (canonical), `src/modules/_shared/**`/`src/modules/_trust/**` (deprecated shims, removal in Wave 9), `src/components/**`, `src/lib/**`, `src/hooks/**`, `src/contexts/**`, `src/domains/**`, `src/runtimes/**`, `src/contracts/**`, `src/integrations/**`.
4. **`_shared`, `_trust`, and `src/platform/**` are leaves.** They MUST NOT import from any pillar (`src/modules/<pillar>/**`).
5. **Components are pillar-blind.** `src/components/**` MUST NOT import from `src/pages/**` or `src/modules/<pillar>/**`.
6. **Domains are pure.** `src/domains/**` MUST NOT import from `src/lib/services/**`, `src/integrations/**`, or any UI module.
7. **Pages are thin.** Files under `src/pages/<pillar>/**` (where `<pillar>` ∈ {business, concierge, finance, health, money, investment-office, revenue-office, digital-presence}) MUST be ≤40 lines OR be a pure re-export. The canonical page body lives in `src/modules/<pillar>/pages/` or `src/platform/<system>/pages/`.

## Folder uniqueness rules (CI-enforced)

8. **No duplicate platform folders.** Wave 2 audit confirmed the canonical
   implementation folders. The following placeholder/alias folder names MUST
   NOT exist under `src/platform/` (CI-enforced strict by `check-no-duplicate-platform.ts`):
    - `ai-gateway/` — AI gateway code lives at `src/lib/services/ai-gateway/`
    - `ai/` — AI surfaces live under `src/platform/orchestration/`, `src/lib/ai*/`
    - `core/` — kernel/runtime code lives in `src/platform/core-services/` and `src/runtimes/`
    - `os-services/` — OS services live in `src/platform/core-services/`
    - `policy/`, `policies/` — policy code lives at `src/lib/policy/`
    - `sync/` — sync code lives in `src/platform/sync-engine/` (the canonical home)
    - `nova-runtime-sdk/` — runtime canonical naming lives inside `src/platform/nova-sdk/runtime/`

    **Canonical implementation folders (kept):**
    - `src/platform/sync-engine/` (38 files — distributed sync ecosystem)
    - `src/platform/nova-sdk/` (40+ files — App SDK)
    - `src/platform/core-services/` (event-bus + 30 consumers)

9. **No `services-unclassified/`.** Every file must have a classified subsystem owner.

## Generated vs authored rules (CI-enforced)

10. **`generated/` is machine-owned.** Files under `generated/` MUST be regenerated by a script in `scripts/` and MUST NOT be hand-edited. Validator: `check-generated-vs-docs.ts`.
11. **`public/generated/` is allowlisted.** Only files explicitly listed in `scripts/architecture/public-generated-allowlist.json` may exist there. Validator: `check-public-generated-allowlist.ts` (Wave 8).
12. **`docs/` is human-owned.** Files under `docs/` MUST NOT duplicate the canonical content of any `generated/` file.

## Compatibility wrappers

During an in-flight migration wave, a thin re-export wrapper at the old path is permitted. Rules:
- Wrapper body must be ≤2 logical lines (typically `export { default } from "@/modules/.../X";`).
- Wrapper must be tracked in the wave's compatibility manifest (`generated/audits/wave-<N>-compatibility-wrappers.json`).
- Wrapper is removed in Wave 9 once two consecutive CI runs show zero usages.

## Amendment process

1. Open an ADR under `docs/adr/ADR-<NNN>-<slug>.md` describing the change and its blast radius.
2. Update this file in the same PR.
3. Update affected validators in `scripts/architecture/`.
4. CI must remain green.

---

## Pointer index

- Migration plan: `generated/audits/repository-canonicalization-plan.md`
- Baseline snapshot: `generated/audits/repository-canonicalization-baseline.json`
- Wave reports (filled per wave): `generated/audits/wave-<N>-report.md`
- Validators: `scripts/architecture/check-*.ts`
- Pillar manifests: `src/modules/<pillar>/MANIFEST.md`
- Platform manifest: `src/platform/MANIFEST.md`
- Deprecated shim manifests (Wave 3 → removal Wave 9): `src/modules/_shared/MANIFEST.md`, `src/modules/_trust/MANIFEST.md`