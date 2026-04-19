# Documentation Canonicality Audit

**Generated:** 2026-04-19
**Closure:** architecture-hardening
**Inheritance:** Extends `generated/architectural-cleanup/DOCUMENTATION_CLEANUP_AUDIT.md`

## 1. Documentation classification

| Class | Definition | Examples |
|---|---|---|
| Canonical current | Authoritative living doc | `MOBILE_HONESTY.md`, `KERNEL_OWNERSHIP_GAP.md`, all `generated/*/` closure markdowns |
| Generated/canonical | Auto-emitted from validators | `generated/*-report.json`, `generated/SERVICE_GOVERNANCE_REPORT.md` |
| Archived | Historical, do not edit | `archive/` directory |
| Future vision | Aspirational, explicitly labeled | `docs/architecture/native-os-future/` |
| Audit-pass | Per-closure point-in-time | This document |

## 2. New docs from this hardening pass

All 18 markdowns in `generated/architecture-hardening/` are classified **canonical current** and are referenced by:
- `ArchitectureHardeningTruthPanel.tsx` (UI render)
- `check-doc-canonicality.ts` (orphan detection)
- `architecture-hardening-status.json` (closure registry)

## 3. Orphan detection

`check-doc-canonicality.ts` scans every markdown in `generated/architecture-hardening/` and verifies at least one inbound reference exists in:
- another `generated/*` file
- a validator under `scripts/validation/`
- a CI workflow
- the AI runtime hub
- the docs tree

Orphans surface as WARN (not BLOCK) — honest drift detection.

## 4. Reconciliation actions

| Action | Status |
|---|---|
| Mobile docs consolidated to `MOBILE_HONESTY.md` + `archive/mobile/ARCHIVED.md` | ✅ Done in mobile-scope-closure |
| Kernel docs consolidated to `KERNEL_OWNERSHIP_GAP.md` + `nova-sdk/` rename | ✅ Done previously |
| Cleanup docs consolidated to `architectural-cleanup/` | ✅ Done in cleanup pass |
| Hardening docs consolidated to `architecture-hardening/` | ✅ Done this pass |

## 5. Out-of-scope (intentional)

Per the prompt's invariant ("only on the admin AI engineer team"), this pass does NOT:
- Reorganize the broader `docs/` directory
- Touch user-facing content
- Modify other admin domains' docs

## 6. Cross-references

- `generated/architectural-cleanup/DOCUMENTATION_CLEANUP_AUDIT.md` — original audit
- `scripts/validation/check-no-stale-canonical-docs.ts` (existing)
- `scripts/validation/check-doc-canonicality.ts` (NEW)
