# SITA OS — Service Topology Audit (Phase B1 Evidence)

> **Generated:** 2026-04-18 · **Source:** `service-topology-map.json` · **Files scanned:** 4,708

## TL;DR

- **`src/services/` does NOT exist** — and the audit proves it does not need to be recreated.
- Service logic is canonically distributed across `platform-svc` (170), `domain-svc` (107), `runtime-svc` (73), `data-svc` (151), `integration-svc` (49), and `orchestration-svc` (128).
- However, **178 files in `src/lib/` are still hidden services** by content signature (class `*Service`, exported functions named `*Manager`/`*Orchestrator`/`*Gateway`).
- `src/lib/` retains **1,341 files** — confirming residual gravity despite the Wave-completed decomposition.

## Service class breakdown

| Class | Count | Canonical home | Status |
|---|---:|---|---|
| `ui` | 1,980 | `src/pages/`, `src/components/`, `src/admin/` | ✅ |
| `util` | 1,083 | `src/lib/utils*` (allowed) | ✅ |
| `contract` | 451 | `src/contracts/`, `src/packages/` | ✅ but split (see contract audit) |
| `test` | 238 | `src/__tests__/`, co-located | ✅ |
| `hook` | 180 | `src/hooks/` | ✅ |
| `platform-svc` | 170 | `src/platform/` | ✅ |
| `data-svc` | 151 | `src/data/` | ✅ |
| `orchestration-svc` | 128 | `src/platform/` (orchestration sub-tree) | ✅ |
| `domain-svc` | 107 | `src/domains/` | ✅ |
| `runtime-svc` | 73 | `src/runtimes/` | ✅ |
| `integration-svc` | 49 | `src/integrations/` | ✅ |
| `not-a-service` | 98 | misc | informational |
| **hidden in src/lib** | **178** | should move to canonical home | ⚠️ DRIFT |

## Decision: do NOT create `src/services/`

The 6 service classes already have canonical homes. Cross-cutting orchestration is correctly housed in `src/platform/` orchestration subtrees. Creating `src/services/` would re-introduce gravity and duplicate the ownership model already enforced by 5-plane boundary checks.

**Verdict:** ✅ Service topology is structurally correct. Action required is **drift remediation in `src/lib/`** (Phase B3), not a new layer.

## Hidden-service drift (top concentration)

The 178 hidden services are concentrated in these `src/lib/` subtrees (full list in JSON):

- `src/lib/admin-ai/`
- `src/lib/advisor-intelligence/`, `src/lib/advisor-protocol/`
- `src/lib/ai/`, `src/lib/ai-engineering/`, `src/lib/ai-gateway/`
- `src/lib/canonical-backend/`
- `src/lib/cloud-backbone/`, `src/lib/control-plane/`
- `src/lib/core-services/`, `src/lib/data-services/`

**Risk:** Low-to-medium. These already have stable wrapper architecture (per memory: 27 thin forwarder stubs maintain barrel integrity). The hidden-service count is a **release-health signal**, not a build blocker.

## Recommended actions (B3-scoped)

1. Add `check-service-topology.ts` (Phase B2) to track drift count over time.
2. For each hidden-service family, ratchet them into `src/platform/` or `src/domains/` only when the consumer count is small or when an unrelated change touches the file (opportunistic refactor).
3. Do **not** mass-move — the wrapper layer is working and prior decomposition is GREEN.
