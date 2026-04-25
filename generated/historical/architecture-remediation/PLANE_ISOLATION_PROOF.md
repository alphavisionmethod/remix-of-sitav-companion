# SITA OS — Plane Isolation Proof (Phase B1 Evidence)

> **Generated:** 2026-04-18 · **Source:** `plane-isolation-graph.json`

## TL;DR

- **5 direct plane-boundary violations** detected (all `user → admin`).
- All 5 violations import the same module: `@/components/sita/admin/index.ts`.
- Direct admin → user violations: **0** (admin plane is clean).
- 18 distinct plane-edge classes observed across the import graph.

## Method

1. Walked all 4,708 TS/TSX files under `src/`.
2. Resolved every `import`/`export … from` specifier to its target file (alias and relative).
3. Classified both endpoints into one of 6 planes: `user`, `admin`, `shell`, `backend`, `core`, `shared`.
4. Flagged any direct edge in the FORBIDDEN set: `user→admin`, `admin→user`.
5. Counted aggregate edges per plane pair.

This proves direct boundary integrity. Transitive analysis (next iteration) will follow shared-plane chains.

## Direct violations (5)

| From (user plane) | Imports | To (admin plane) |
|---|---|---|
| `src/pages/ObservabilityPage.tsx` | `@/components/sita/admin` | `src/components/sita/admin/index.ts` |
| `src/pages/PolicySimulatorHub.tsx` | `@/components/sita/admin` | `src/components/sita/admin/index.ts` |
| `src/pages/UsersAdminPage.tsx` | `@/components/sita/admin` | `src/components/sita/admin/index.ts` |
| `src/pages/WorkflowReplayHub.tsx` | `@/components/sita/admin` | `src/components/sita/admin/index.ts` |
| `src/pages/owner-mode/OwnerModePage.tsx` | `@/components/sita/admin` | `src/components/sita/admin/index.ts` |

All 5 funnel through the same admin barrel. The 4 page names (`ObservabilityPage`, `PolicySimulatorHub`, `UsersAdminPage`, `WorkflowReplayHub`, `OwnerModePage`) are **all administratively-themed user-plane pages** — they likely belong to the admin plane themselves, not to the user plane.

## Edge distribution

| Edge | Count | Status |
|---|---:|---|
| `shared → shared` | 7,725 | ✅ healthy core |
| `admin → shared` | 3,486 | ✅ |
| `user → shared` | 3,166 | ✅ |
| `admin → admin` | 1,031 | ✅ |
| `core → shared` | 561 | ✅ |
| `user → user` | 116 | ✅ |
| `shared → user` | 89 | ⚠️ shared layer reaching into user |
| `core → user` | 74 | ⚠️ root reaching into user |
| `user → core` | 52 | ✅ allowed (root access) |
| `shared → core` | 44 | ✅ |
| `core → core` | 30 | ✅ |
| `shell → shared` | 8 | ✅ |
| **`user → admin`** | **5** | ❌ **VIOLATION** |
| `core → admin` | 4 | informational |
| `admin → core` | 4 | ✅ |
| `shared → admin` | 4 | informational |
| `core → shell` | 1 | ✅ |
| `shared → shell` | 1 | ✅ |

## Recommended fix (B3-scoped)

**Option A (preferred):** Reclassify the 5 admin-themed pages as admin-plane pages by moving them to `src/pages/admin/` and adding them to the admin redirect map. This eliminates the violation by correcting the plane assignment.

**Option B (low-risk):** Leave the pages where they are and add per-page allowlist entries. Higher long-term drift risk.

**Recommendation:** Defer the move to a dedicated wave (these are user-facing routes — moving them affects nav). Add `check-plane-import-graph.ts` (Phase B2) at warn-level so the count cannot grow.

## Transitive analysis (next iteration)

The current pass is direct-edge only. A graph-walking transitive check would catch cases where `user → shared → admin`. Out of scope for this wave; tracked in `ARCHITECTURE_HARDENING_STATUS.md`.
