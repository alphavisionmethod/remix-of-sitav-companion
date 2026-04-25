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
7. **Pages are thin.** Files under `src/pages/<family>/**` MUST be ≤40 lines OR be a pure re-export.
    - **Pillar families** (`<pillar>` ∈ {business, concierge, finance, health, money, investment-office, revenue-office, digital-presence}) — canonical body in `src/modules/<pillar>/pages/`. (Wave 4)
    - **Platform families** (Wave 5: `<system>` ∈ {atlas, files, owner, mission-control, mission, boardroom, intelligence, trust, personal-brain, enterprise, tenant, workspace, integrations, marketing, settings, store, app-platform, apps, sita, advisors, auth}) — canonical body in `src/platform/<system>/pages/`. Special re-routings: `pages/mission/*` → `platform/mission-control/mission-pages/`; `pages/store/*` → `platform/app-platform/store-pages/`; `pages/integrations/*` → `platform/integration/pages/`.
    - **Root-level single-file pages** (Wave 6): `src/pages/<File>.tsx` MUST be a thin re-export from `src/platform/<system>/pages/<File>.tsx` or `src/modules/<pillar>/pages/<File>.tsx`. **Sole exception:** `src/pages/NotFound.tsx` (router 404 fallback) keeps its body at root.

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

## Component classification (Wave 7 — CI-enforced)

13. **`src/components/` is reserved for shared UI.** Only the following subtrees are permitted to contain non-adapter source files: `ui/`, `primitives/`, `shared/`, `cards/`, `navigation/`, `launcher/`, `__tests__/`. Every other historical subtree (`business/`, `admin/`, `sita/`, `personal-brain/`, `advisors/`, `ai/`, …) MUST contain only Wave-7 thin adapters of the form `export * from "@/{modules|platform}/<owner>/components/<sub>/...";`.
14. **Pillar-owned components live under `src/modules/<pillar>/components/<sub>/`.** Canonical owners: `business`, `concierge`, `finance`, `health`.
15. **Platform-owned components live under `src/platform/<system>/components/<sub>/`.** Canonical systems include `admin`, `advisors`, `ai`, `app-platform`, `auth`, `cloud`, `experience`, `files`, `governance`, `intelligence`, `marketing`, `notifications`, `observability`, `operations`, `orchestration`, `personal-brain`, `product`, `runtime`, `settings`, `setup`, `sita`, `sync-engine`, `trust`, `core-services`.
16. **No deep relative imports.** Files under `src/platform/**`, `src/modules/**`, `src/components/**`, `src/pages/**` MUST NOT contain `from "../../../..."` style imports. All cross-tree references MUST use `@/...` aliases. Codemod: `scripts/codemods/wave-7-fix-relative-imports.mjs`.

## Components allowlist (Wave 8 — STRICT, BLOCKING)

17. **Frozen subtrees are validator-enforced.** A blocking CI step (`scripts/architecture/check-components-allowlist.ts --strict`) runs on every PR. It fails the build if:
    - any non-allowlisted top-level file appears under `src/components/` (allowlist: `NavLink.tsx`),
    - any file inside a frozen legacy subtree (`business/`, `admin/`, `sita/`, …) contains authored code instead of a Wave-7 thin adapter,
    - any adapter exceeds 12 logical lines, OR
    - any adapter targets a non-canonical path (only `@/modules/*` or `@/platform/*` are permitted).
18. **Shared subtree allowlist** (Wave 8): `ui/`, `primitives/`, `shared/`, `cards/`, `navigation/`, `launcher/`, `__tests__/`. New top-level subtrees under `src/components/` require an ADR + an update to `SHARED_ALLOWLIST` in the validator.

## Architectural attestation (Wave 10 — STRICT, BLOCKING)

19. **Sealed manifest is the source of truth.** The post-Wave-9 canonical tree is sealed in `generated/audits/wave-10-architectural-attestation.json`. The manifest records, for each canonical surface (`src/components`, `src/modules`, `src/platform`, `src/pages`, `src/admin`, `src/runtimes`, `src/routes`), a SHA-256 digest of (sortedPath ⊕ contentSha256)\*. A top-level `manifestDigest` is the SHA-256 over all surface digests in canonical order — a single 64-char fingerprint of the entire architecture.
20. **Drift fails CI.** A blocking step (`scripts/architecture/wave-10-check-attestation.ts`) re-computes the live digests and fails the build on any mismatch. Re-sealing requires an ADR + `npx tsx scripts/architecture/wave-10-emit-attestation.ts` + commit of the updated manifest. The verbose per-file inventory lives at `generated/audits/wave-10-architectural-attestation-inventory.json` for forensic auditing.

## Architecture Enforcement Foundation (Wave 0 — Pre-Migration Hardening, BLOCKING)

21. **Foundation Gate authority.** A new BLOCKING workflow `.github/workflows/foundation-gate.yml` runs the foundation-tier validator set on every PR and push to main/develop. The set is enumerated in `generated/manifests/foundation-tier-validator-set.json` and currently consists of 15 validators (3 new + 12 wired-existing). Failure blocks merge.
22. **Validator registry is single source of truth.** Every architecture validator under `scripts/architecture/**` MUST be classified in `generated/validator-gate-map.json` (one of `block` / `warn` / `advisory` / `disabled` / `archived`). New validators without a classification fail `check-validator-gate-coverage.ts`. The map is regenerated via `npm run generate:validator-gate-map`.
23. **Exception ratchet.** All exceptions live in `generated/manifests/architecture-exception-ledger.json` with `{ ruleId, scope, owner, reason, expiresAt | waveBound, createdAt, baselineCount }`. The ratchet is monotone: total exception count may decrease, never grow. Enforcer: `scripts/architecture/check-architecture-exception-ledger.ts`. Shim usage has its own baseline at `generated/manifests/deprecated-shim-baseline.json` (also decrease-only).
24. **Safe-change law.** Before deleting, merging, or retiring any file/folder under a frozen subtree, a reverse-dependency proof MUST be recorded in `generated/manifests/safe-change-evidence-ledger.json` (append-only) with `{ grepProof, manifestProof, routeProof, testProof }` (and `duplicateReconciliation` for merges). Enforcer: `scripts/architecture/check-safe-change-evidence.ts`.
25. **Manifest freshness law.** The 14 foundation-tier manifests listed in Rule 26 MUST be regenerated by their owning script and committed in the same PR that changes their inputs. Each manifest declares a TTL (`null` = sealed). Enforcer: `scripts/architecture/check-foundation-manifest-freshness.ts`.
26. **Foundation manifest index.** The 14 canonical manifests required by future waves are enumerated in `generated/manifests/foundation-manifest-index.json` (master pointer file). All future architecture wave prompts attach to this index. Re-emit via `npm run foundation:emit`.

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