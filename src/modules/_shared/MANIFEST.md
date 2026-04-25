# `_shared` — DEPRECATED (Wave 3)

> **Status**: Deprecation shim only. Removal: **Wave 9**.

This folder no longer contains canonical code. All implementations have been
lifted into `src/platform/*`. The barrels and per-file shims here exist
**only** so legacy import paths continue to compile during the transition.

## Canonical homes (post Wave 3)

| Legacy path | Canonical path |
| --- | --- |
| `@/modules/_shared/pillar-contract` | `@/platform/contracts/pillar-contract` |
| `@/modules/_shared/decision-queue` | `@/platform/contracts/decision-queue` |
| `@/modules/_shared/registry/module-registry` | `@/platform/registry/module-registry` |
| `@/modules/_shared/workspace/workspace-context` | `@/platform/workspace/workspace-context` |
| `@/modules/_shared/ai` | `@/platform/ai` |
| `@/modules/_shared/knowledge` | `@/platform/knowledge` |

## Rule

* **New code**: import from `@/platform/*`.
* **Existing code**: stale `@/modules/_shared/*` paths still resolve via shims; migrate opportunistically.
* **Wave 9** will delete this folder once all consumers are migrated.
