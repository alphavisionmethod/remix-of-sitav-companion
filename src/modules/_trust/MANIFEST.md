# `_trust` — DEPRECATED (Wave 3)

> **Status**: Deprecation shim only. Removal: **Wave 9**.

The Trust platform has moved to its canonical home at `src/platform/trust/`.
This folder retains barrels and per-file shims so existing imports compile.

## Canonical home

| Legacy path | Canonical path |
| --- | --- |
| `@/modules/_trust` | `@/platform/trust` |
| `@/modules/_trust/registry/*` | `@/platform/trust/registry/*` |
| `@/modules/_trust/authority/*` | `@/platform/trust/authority/*` |
| `@/modules/_trust/ui/*` | `@/platform/trust/ui/*` |

## Rule

* **New code**: import from `@/platform/trust` (or its subpaths).
* **Existing code**: stale `@/modules/_trust/*` paths still resolve via shims.
* **Wave 9** will delete this folder once all consumers are migrated.
