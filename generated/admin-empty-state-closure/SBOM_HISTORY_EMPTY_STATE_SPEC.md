# SBOM History Empty-State Spec

**Status:** DEFERRED — out-of-admin-AI-engineering-scope
**Required marker:** user-flagship-pass-required (releases-domain-pass)
**Generated:** 2026-04-19
**Validator:** `scripts/validation/check-sbom-history-empty-state.ts`

---

## 1. Surface state in repo

| Item | Status |
|---|---|
| Route `/admin/releases/sbom-history` | **DOES NOT EXIST** |
| Page file `src/pages/admin/releases/SbomHistory.tsx` | **DOES NOT EXIST** |
| Releases domain owner | Releases domain (NOT admin AI engineering) |

Per the explicit user scope ("only on the admin ai engineer team"), no page is created in `src/pages/admin/releases/**`. The deferral is documented and tracked.

## 2. Required empty-state when releases domain builds the surface

Once the releases domain pass adopts this board, its empty state MUST:

1. Use canonical primitive `PremiumEmptyState`
2. Title: `SBOM history begins after the next release cut`
3. Description: explain that historical SBOM diffs require ≥2 release records; the current SBOM/release evidence is already inspectable on the canonical Releases home
4. Why-empty: "Only one release record present (or none). History activates after the next release."
5. Next-step actions:
   - Primary: `<Link to="/admin/releases">Open current release evidence</Link>` (canonical ReleasesHome)
   - Secondary: `<Link to="/admin/ai-releases-center">Open AI Releases Center</Link>` (canonical AIReleasesCenter)
6. Operator next action: surface the most-recent SBOM artifact path inline so the operator never feels the board is broken

## 3. Canonical destinations meanwhile (real navigable routes — confirmed present)

- `src/pages/admin/releases/ReleasesHome.tsx` → `/admin/releases`
- `src/pages/admin/AIReleasesCenter.tsx` → `/admin/ai-releases-center`

These boards already expose the active release SBOM and verification evidence. The deferred history view is additive over time — current evidence is always accessible.

## 4. No-fake-green enforcement

The validator `check-sbom-history-empty-state.ts` emits WARN with explicit cross-reference until the page file is created and adopts `PremiumEmptyState`. It NEVER silent-passes. To flip to GREEN:

- Page file exists at `src/pages/admin/releases/SbomHistory.tsx`
- Imports `PremiumEmptyState` (or `EmptyState`)
- Includes the canonical destination links from §2

## 5. Markers (validator parses these)

- `DEFERRED`
- `user-flagship-pass-required`
- `releases-domain-pass`
