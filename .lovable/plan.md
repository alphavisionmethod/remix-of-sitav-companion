

## Reality check

| Row | Cluster | Real state |
|---|---|---|
| 1 | `ai`, `ai-engineering`, `ai-gateway`, `sovereign-ai-gateway` | ✅ **ALREADY RESOLVED.** All 4 are 1-line shims pointing at `src/lib/ai-platform/{runtime,engineering,gateway,sovereign}/`. README.md exists with full responsibility map. |
| 2 | `services` vs `core-services` | ⚠️ Authority hardened in `core-services/index.ts` header comments, but **no README.md in either folder**. Concept clear in code, invisible to a folder browser. |
| 3 | `platform`, `platform-law`, `platform-plane`, `web-platform` | ⚠️ All 4 distinct (Layer-3 services / law registry / BFF + RBAC / web-deployability). No README per folder. `web-platform/` has only `release/` inside — true sub-cluster. |
| 4 | Onboarding intent surfaces | ✅ **ALREADY RESOLVED.** `src/lib/architecture/onboarding-surface-registry.ts` is the canonical 3-tier registry (os / business / money), with deprecated set declared, validator `check-onboarding-surface-truth.ts` exists. |
| 5 | `observability` vs `incidents` | Distinct concerns: `observability/` = telemetry (logger, tracing, SLOs, sentry); `incidents/` = single classifier mapping symptom→runbook. **Not foldable** — different lifecycle, different consumers (admin dashboards vs. incident response). README per folder + cross-link is the honest fix. |

The **real cognitive risk** is folder-browsing without README anchors. Code itself is correct.

## Plan (consolidate via documentation anchors + CI enforcement)

### 1. Add canonical README.md to 7 ambiguous cluster roots
Each README is short, declares purpose / role in the layered architecture / what NOT to put here / canonical neighbors.

| File | Anchors |
|---|---|
| `src/lib/services/README.md` | Layer-2 Domain Services (implementations). Re-exported by `core-services` façade. |
| `src/lib/core-services/README.md` | Layer-1 Platform Canonical (organs + façade). Authority above `services/`. |
| `src/lib/platform/README.md` | Layer-3 Platform Services barrel (auth/proof/execution/observability/sync/notifications). |
| `src/lib/platform-law/README.md` | Pure law registry (rules-as-data). Not a runtime. |
| `src/lib/platform-plane/README.md` | BFF + RBAC + safety + notification routing for the Admin/User planes. |
| `src/lib/web-platform/README.md` | Web-target deployability contract (browser min-version, runtime contract). |
| `src/lib/observability/README.md` | Telemetry primitives — logs, traces, SLO, sentry. Cross-links `incidents/`. |
| `src/lib/incidents/README.md` | Symptom→runbook classifier. Cross-links `observability/`. |

### 2. New CI gate `check-cluster-readme-coverage.ts`
- Asserts every folder in a curated `AMBIGUOUS_CLUSTERS` allowlist has a `README.md` with required headings (`# Purpose`, `# Layer`, `# Canonical neighbors`).
- BLOCK tier. Report at `generated/cluster-readme-coverage-report.json`.
- Register as **Gate #27** at the bottom of the master aggregator (`check-os-release-readiness.ts`).

### 3. Rename Row 4 follow-through
Already structurally done — verify `check-onboarding-surface-truth.ts` is registered in master aggregator; if not, register it.

### 4. Doc sync (6 mirrors of `MISSING_AUDIT.md` + `MISSING_AUDIT_v2.md`)
Replace §3 table (rows 1-5) with **RESOLVED 2026-04-20** annotations:
- Row 1 → cite `src/lib/ai-platform/README.md` + 4 shims
- Row 2 → cite new `services/README.md` + `core-services/README.md` + Service Layer Constitution doc
- Row 3 → cite 4 new READMEs (`platform`, `platform-law`, `platform-plane`, `web-platform`)
- Row 4 → cite `onboarding-surface-registry.ts` + validator
- Row 5 → cite `observability/README.md` + `incidents/README.md` (kept separate by design, cross-linked)

All gated by **BLOCK Gate #27** to prevent regression.

## Files

**Created (9):** 8 READMEs + 1 CI gate script
**Edited (2):** master aggregator (register #27), 6 audit doc mirrors
**No code/runtime/DB changes** — pure documentation + enforcement

## Out of scope
- No folder consolidation (real concerns are distinct)
- No moves of `incidents/` into `observability/` (different lifecycle owners)
- No removal of legacy AI shims (preserved for back-compat by design)

