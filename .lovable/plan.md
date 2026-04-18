

Let me explore the current state of `src/lib` to understand the scope before planning.
<lov-tool-use id="toolu_vrtx_01U3JFZtf2URFFDA2zUbxbhN" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/lib\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01FssmwsNdNG5sVc2GZ1f97n" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01MqND14NuDxLo5RNBgcQVFi" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/lib\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_013WaisrobS3TUBNwLmQGoCa" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01RWBapXA92iLytBgxpEsBYT" name="code--exec" integration-id="code" data="{\"command\": \"echo \\\"=== src/lib file count ===\\\"; find src/lib -type f | wc -l; echo \\\"=== src/lib subfolder file counts ===\\\"; for d in src/lib/*/; do n=$(find \\\"$d\\\" -type f | wc -l); printf \\\"%5d  %s\\\\n\\\" \\\"$n\\\" \\\"$d\\\"; done | sort -rn | head -50; echo \\\"=== top-level loose files ===\\\"; find src/lib -maxdepth 1 -type f\", \"user_facing_description\": \"Surveying src/lib size and shape\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_012nWH6ihPfDAPpwEetbCh77" name="code--exec" integration-id="code" data="{\"command\": \"echo \\\"=== existing src/data ===\\\"; ls src/data 2>/dev/null; echo; echo \\\"=== existing src/platform ===\\\"; ls src/platform 2>/dev/null; echo; echo \\\"=== existing src/runtimes ===\\\"; ls src/runtimes 2>/dev/null; echo; echo \\\"=== existing src/integrations ===\\\"; ls src/integrations 2>/dev/null; echo; echo \\\"=== existing src/contracts ===\\\"; ls src/contracts 2>/dev/null; echo; echo \\\"=== existing src/features ===\\\"; ls src/features 2>/dev/null; echo; echo \\\"=== src/planes ===\\\"; ls src/planes 2>/dev/null\", \"user_facing_description\": \"Checking existing canonical destinations\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01TctV2TMPSeo9X8RcKDZqGY" name="code--exec" integration-id="code" data="{\"command\": \"echo \\\"=== Import graph: how many files import from @/lib/* ===\\\"; grep -rEho \\\"from ['\\\\\\\"]@/lib/[^'\\\\\\\"]+\\\" src 2>/dev/null | sort -u | wc -l; echo \\\"=== Sample top-imported lib paths ===\\\"; grep -rEho \\\"from ['\\\\\\\"]@/lib/[^'\\\\\\\"]+\\\" src 2>/dev/null | sort | uniq -c | sort -rn | head -40; echo; echo \\\"=== Total consuming files ===\\\"; grep -rEl \\\"from ['\\\\\\\"]@/lib/\\\" src 2>/dev/null | wc -l\", \"user_facing_description\": \"Measuring blast radius of any src/lib move\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_0198BWu1X22TZ2uoHfozy948" name="code--exec" integration-id="code" data="{\"command\": \"echo \\\"=== src/lib/services subdir summary ===\\\"; for d in src/lib/services/*/; do n=$(find \\\"$d\\\" -type f 2>/dev/null | wc -l); printf \\\"%4d  %s\\\\n\\\" \\\"$n\\\" \\\"$d\\\"; done | sort -rn | head -30; echo; echo \\\"=== src/lib/core-services subdir summary ===\\\"; for d in src/lib/core-services/*/; do n=$(find \\\"$d\\\" -type f 2>/dev/null | wc -l); printf \\\"%4d  %s\\\\n\\\" \\\"$n\\\" \\\"$d\\\"; done | sort -rn | head -30\", \"user_facing_description\": \"Inspecting two largest folders\"}">
</lov-tool-use>
I have enough to design a safe, phased plan. The scale is massive — 1,768 files in `src/lib`, 2,115 consumer files, 863 unique import paths — and many destinations (`src/data`, `src/contracts`) are essentially empty barrels today. A "move everything" sweep would be catastrophic. The plan must be wave-based, audit-first, wrapper-heavy, and verification-gated.

<lov-plan>

# src/lib Decomposition — Safe, Phased Migration Plan

## Reality Check (from audit)

- **`src/lib`: 1,768 files across 88 subfolders** + 18 loose top-level files
- **2,115 files** in the project import from `@/lib/*` across **863 distinct import paths**
- Hottest paths: `@/lib/utils` (763 importers), `@/lib/supabase-helpers` (366), `@/lib/persistence/universal-service-persistence` (121)
- Largest folders: `services/` (498), `core-services/` (220), `runtime/` (63), `engines/` (60), `nova-sdk/` (55)
- Destinations `src/data/`, `src/contracts/` are nearly empty barrels; `src/platform/`, `src/runtimes/` already exist with structure
- Memory: existing FIP, Service Constitution, and Layer Boundary checks already constrain this — refactor must respect them

**Risk if done naively:** thousands of broken imports, build collapse, lost ownership. We will **NOT** mass-move. Every wave is audit → wrapper → rewire → verify.

## Strategy: Audit-First, Wrapper-Bridged, Wave-Based

```text
Wave 0 → AUDIT     (read-only, generates classification map, no code moves)
Wave 1 → SCAFFOLD  (create destination folders + ownership registry)
Wave 2-7 → MIGRATE (one folder family per wave, each: move → wrapper-shim → rewire → verify)
Wave 8 → GUARDRAILS (CI checks to prevent regression)
Wave 9 → REPORT    (final verification + deliverables)
```

Every migrated file leaves behind a **deprecated wrapper shim** at its old `src/lib` path that re-exports from the canonical home. This guarantees zero broken imports during the multi-wave migration. Wrappers are tracked in `src-lib-wrapper-map.json` and removed in a future cleanup pass once consumers are rewired.

## Phase 1 — Wave 0: Full Audit (read-only)

Build `scripts/architecture/audit-src-lib.ts` that walks every file in `src/lib`, and for each emits:
- current path, exports, line count
- importer count + top consumers
- heuristic classification (domain | platform | runtime | data | integration | contract | legacy | shared-internal)
- duplicate detection (fingerprint by export shape)
- recommended target path

**Deliverables:**
- `generated/lib-decomposition/SRC_LIB_FULL_CLASSIFICATION_AUDIT.md`
- `generated/lib-decomposition/src-lib-classification-map.json`
- `generated/lib-decomposition/SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md`

## Phase 2 — Wave 1: Scaffold Destinations + Ownership Map

- Build out skeleton in `src/domains/{business,finance,concierge,boardroom,files,identity,mission-control,proof,workflows,ai-workforce,shared}/`
- Expand `src/data/{clients,repositories,projections,persistence,adapters,sync}/`
- Verify `src/platform/`, `src/runtimes/`, `src/integrations/` subtrees exist and have index barrels
- Generate `generated/lib-decomposition/src-lib-target-map.json` and `SRC_LIB_CURRENT_TO_TARGET_MAP.md` — every file gets a planned destination *before* anything moves
- Create `docs/architecture/SRC_LIB_DECOMPOSITION_MODEL.md` and `CANONICAL_OWNERSHIP_MODEL.md`

## Phase 3 — Migration Waves (one family per wave)

Each wave follows the **same safe pattern**:
1. Move files to canonical home (preserve content exactly)
2. Replace each old `src/lib/...` file with a thin re-export wrapper + `@deprecated` JSDoc
3. Rewire **high-traffic consumers** (top 20 importers) to canonical paths
4. Run `tsc --noEmit`, build, and architecture checks
5. Update `src-lib-wrapper-map.json`

**Wave order (low-risk → high-risk):**

| Wave | Source family | → Destination | Files | Notes |
|------|---------------|---------------|-------|-------|
| 2 | `lib/persistence/`, `lib/sync-engine/`, `lib/db/`, `lib/data-services/`, `lib/storage/`, `lib/offline-db.ts` | `src/data/` | ~125 | Pure data layer; high-impact (`universal-service-persistence` = 121 importers) — wrapper essential |
| 3 | `lib/runtime/`, `lib/devices/`, `lib/surfaces/`, `lib/dual-reality/`, `lib/reality/`, `lib/reality-audit/`, `lib/reality-records/`, `lib/detection/` | `src/runtimes/` | ~150 | Runtime/substrate logic |
| 4 | `lib/policy/`, `lib/observability/`, `lib/security/`, `lib/os-security/`, `lib/support/`, `lib/sovereign-ai-gateway/`, `lib/ai-gateway/`, `lib/ai/`, `lib/no-hallucination/`, `lib/verification/`, `lib/control-plane/`, `lib/cloud-backbone/`, `lib/platform/`, `lib/platform-plane/`, `lib/platform-law/`, `lib/orchestration/`, `lib/operations/`, `lib/incidents/`, `lib/compute-governance/`, `lib/capabilities/`, `lib/fip/`, `lib/ci/`, `lib/deploy/`, `lib/deployment/`, `lib/migration/`, `lib/architecture/`, `lib/meta-arch/`, `lib/truth-manifests/`, `lib/backend-topology/` | `src/platform/` | ~350 | Platform/governance — largest wave; sub-batched by subdomain |
| 5 | `lib/services/business-os/`, `engines/`, `domain-engines/`, `domain-system/`, `boardroom/`, `investment-office/`, `advisor-intelligence/`, `advisor-protocol/`, `strategic-intelligence/`, `intelligence-architecture/`, `customer-journey/`, `setup/`, `internal-agents/`, `admin-ai/`, `app-platform/`, `pack-store/`, `ux-trust/`, `delivery-methodology/`, `business-launcher.ts`, `finance-launcher.ts`, `concierge-launcher.ts`, `mission-control-launcher.ts`, `app-store-launcher.ts`, `business-journey-config.ts`, `advisor-topology.ts`, `cross-domain.ts`, `continuity-engine.ts`, `export-engine.ts` | `src/domains/{business,finance,concierge,boardroom,investment,mission-control,advisors,...}/` | ~400 | Domain logic — sub-waved per bounded context |
| 6 | `lib/integrations/`, `lib/shopify/`, `lib/api/`, `lib/supabase-helpers.ts` | `src/integrations/` | ~50 | External providers; `supabase-helpers` (366 importers) needs wrapper |
| 7 | `lib/contracts/`, `lib/types/`, `lib/constants/` | `src/contracts/` & `src/types/` | ~40 | Type/contract consolidation |
| 7b | `lib/services/` remainder (~350), `lib/core-services/` (220), `lib/nova-sdk/` (55), `lib/os-services/` | mixed → `src/platform/`, `src/domains/`, `src/runtimes/` per audit | ~625 | The hard cases — split per file based on Wave-0 classification, not folder name |

**Stays in place** (or moves to `src/lib/internal/`): `lib/utils.ts` (763 importers — keep canonical here), `lib/utils/`, `lib/hooks/` (move to `src/hooks/`), `lib/__tests__/`, `lib/demo-data/`, `lib/mock-data/`, `lib/seed/`, `lib/demo-scenarios/` (these become `src/data/seed/` later).

**Goes to `src/legacy/`:** anything in audit flagged as duplicate, unused, or experimental-non-canonical (e.g. likely candidates: `lib/canonical-backend/`, `lib/simulation/` if unused, dead engine experiments). Each entry gets a documented reason in `SRC_LIB_WRAPPER_MAP.md`.

## Phase 4 — Wave 8: Guardrails

Add CI scripts to prevent regression:
- `scripts/architecture/checks/check-lib-ownership-drift.ts` — fails if new files are added to `src/lib/` outside an allowlist (utils, hooks, internal)
- `scripts/architecture/checks/check-misplaced-runtime-logic.ts` — flags runtime imports in `src/domains/`
- `scripts/architecture/checks/check-misplaced-data-logic.ts` — flags DB calls outside `src/data/` or `src/integrations/`
- `scripts/architecture/checks/check-misplaced-domain-logic.ts` — flags business-context strings in `src/platform/`
- `scripts/architecture/checks/check-legacy-wrapper-usage.ts` — counts remaining wrapper imports, fails CI if growing
- Wire all into the OS release readiness aggregator as new gates

## Phase 5 — Wave 9: Verification + Final Reports

- Run full `tsc --noEmit`, `npm run build`, all architecture checks
- Run `full-render-smoke` gate to confirm all 993 pages still render
- Generate final deliverables in `generated/lib-decomposition/`:
  - `SRC_LIB_FULL_CLASSIFICATION_AUDIT.md`
  - `SRC_LIB_CURRENT_TO_TARGET_MAP.md`
  - `SRC_LIB_MIGRATION_PLAN.md`
  - `SRC_LIB_WRAPPER_MAP.md`
  - `SRC_LIB_DUPLICATE_AND_AMBIGUOUS_MODULES.md`
  - `SRC_LIB_SECONDARY_REFACTOR_DISCOVERIES.md`
  - `SRC_LIB_VERIFICATION_RESULTS.md`
  - JSON counterparts for each
- Update `os-release-readiness-report.json` with new `lib-decomposition-readiness` gate

## No-Loss Safety Contract

- **No file deleted** in this refactor — moved or wrapped, never dropped
- **No import broken** — wrappers ensure old paths resolve until consumers migrate
- **No empty destination folders** — only created when files arrive
- **All wrappers tracked** in `src-lib-wrapper-map.json` with removal conditions
- **Build runs after every wave** — broken wave is reverted before proceeding
- `src/lib/utils.ts` (the 763-importer hot path) **stays put** — it's a true shared utility, not misplaced logic

## Realistic Scope Note

This is a multi-day, multi-wave refactor touching 1,768 source files and 2,115 consumers. Each wave will be its own implementation pass. I will execute **Wave 0 (audit) + Wave 1 (scaffold + ownership map)** in the first implementation turn — that produces the full classification, target map, and destination skeleton without moving a single canonical file, giving you a complete picture and approval gate before the actual code moves begin in subsequent waves.

