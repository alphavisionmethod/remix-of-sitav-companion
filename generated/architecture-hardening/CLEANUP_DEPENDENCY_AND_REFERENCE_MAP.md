# Cleanup Dependency and Reference Map — Hardening Pass

**Generated:** 2026-04-19
**Closure:** architecture-hardening

## 1. Inheritance from prior dependency map

This map extends `generated/architectural-cleanup/CLEANUP_DEPENDENCY_AND_REFERENCE_MAP.md` with the following hardening-pass additions.

## 2. New artifacts and their inbound references

### 2.1 New validators (`scripts/validation/`)

| Validator | Wired into | Consumed by |
|---|---|---|
| `check-runtime-host-boundaries.ts` | `check-os-release-readiness.ts` (BLOCK) | `runtime-host-boundaries-report.json` |
| `check-shell-runtime-portability.ts` | `check-os-release-readiness.ts` (BLOCK) | `shell-runtime-portability-report.json` |
| `check-edge-function-log-shape.ts` | `check-os-release-readiness.ts` (BLOCK) | `edge-function-log-shape-report.json` |
| `check-mobile-archived-scope.ts` | `check-os-release-readiness.ts` (BLOCK) | `mobile-archived-scope-report.json` |
| `check-no-kernel-overclaim.ts` | `check-os-release-readiness.ts` (BLOCK) | `no-kernel-overclaim-report.json` |
| `check-doc-canonicality.ts` | `check-os-release-readiness.ts` (WARN-tolerant) | `doc-canonicality-report.json` |

### 2.2 New truth panels (`src/components/admin/ai-runtime/`)

| Panel | Mounted at | Reads from |
|---|---|---|
| `EconomicTrustFutureTruthPanel.tsx` | `AIRuntimeHome.tsx` tab #9 | `ai_user_hard_ceilings`, `ai_budget_decision_receipts`, `generated/agency-wording-lockdown-report.json`, `generated/economic-trust-and-future-closure/*.json` |
| `ArchitectureHardeningTruthPanel.tsx` | `AIRuntimeHome.tsx` tab #10 | `generated/architecture-hardening/*.json` |

### 2.3 New generated artifacts (`generated/architecture-hardening/`)

All 18 markdowns + 4 JSONs are referenced by:
- `ArchitectureHardeningTruthPanel.tsx` (UI render)
- `check-doc-canonicality.ts` (orphan detection)
- This dependency map (cross-reference)

## 3. Reference invariants enforced

- Every new validator has exactly one entry in the BLOCK gate list of `check-os-release-readiness.ts`
- Every new panel has exactly one `lazy()` import + one `HubModule` entry in `AIRuntimeHome.tsx`
- Every new generated JSON is consumed by at least one panel or validator
- Zero changes to other admin domains, edge functions, or sealed migrations

## 4. Outbound graph (what this closure depends on)

- `src/runtimes/portability-boundary-model.ts` (read by `check-runtime-host-boundaries`)
- `supabase/functions/_shared/logger.ts` (referenced by `check-edge-function-log-shape`)
- `MOBILE_HONESTY.md` + `archive/mobile/` (referenced by `check-mobile-archived-scope`)
- `docs/architecture/native-os-future/KERNEL_OWNERSHIP_GAP.md` (referenced by `check-no-kernel-overclaim`)
