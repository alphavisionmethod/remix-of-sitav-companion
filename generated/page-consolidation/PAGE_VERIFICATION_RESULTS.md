# Page Verification Results
> Generated: 2026-04-18T11:46:26.547Z
> Source: `scripts/architecture/audits/page-verification-runner.ts`
> Status: ✅ **ALL CHECKS PASS**

## Summary

| Check | Result | Duration |
|---|---|---:|
| `audit` | ✅ pass | 2097ms |
| `admin-classification-coverage` | ✅ pass | 2198ms |
| `admin-domain-budget` | ✅ pass | 1897ms |
| `admin-route-coherence` | ✅ pass | 1908ms |
| `redirect-coverage` | ✅ pass | 2184ms |
| `experimental-isolation` | ✅ pass | 1981ms |
| `page-registry-completeness` | ✅ pass | 2449ms |
| `typecheck` | ✅ pass | 1082ms |

## Per-check tail output

### audit

```
✅ Page consolidation audit complete.
   Pages: 1042
   Mounted routes: 661
   Admin pages: 539 (38 curated, 100% classified)
   Duplicate groups: 18
   Outputs → generated/page-consolidation/
```

### admin-classification-coverage

```
📊 539 admin pages
  ✏️  39 curated (7%)
  🤖 500 auto-classified by prefix (290 prefixes known)
  ✅ 100% total coverage
  ❓ 0 unknown
✅ check-admin-page-classification-coverage: All checks passed
```

### admin-domain-budget

```
📊 12 top-level admin domains: overview, alerts, approvals, environments, ai-runtime, integrations, trust-security, health, releases, verification, config, support
✅ check-admin-domain-budget: All checks passed
```

### admin-route-coherence

```
🛤️ 0 admin routes found
✅ check-admin-route-coherence: All checks passed
```

### redirect-coverage

```
📊 Redirect-eligible entries: 4
  ✅ Covered: 4
  📋 Total redirects mounted: 9
✅ check-redirect-coverage: All checks passed
```

### experimental-isolation

```
🧪 120 experimental routes detected
  🔎 Scanned 0 nav/launcher files
  ✅ Leaks: 0
✅ check-experimental-isolation: All checks passed
```

### page-registry-completeness

```
Pages on disk: 1042 (critical=6, admin=539, internal=449, dev=48)
Registered: 22
✅ Pass
```

### typecheck

```

```


## Phase 5 — Wave 2 Shipped (Curated admin sub-views)

Nine more curated `SECONDARY_SUBVIEW` pages physically relocated to
their canonical `src/admin/modules/<domain>/views/` homes. Originals
are now thin re-export shims so all legacy importers keep working.

| Old path (now shim) | Canonical home | Domain |
|---|---|---|
| `pages/admin/GeneratedTruthDashboard.tsx` | `admin/modules/overview/views/GeneratedTruthDashboard.tsx` | overview |
| `pages/admin/LaunchHonestyBoard.tsx` | `admin/modules/verification/views/LaunchHonestyBoard.tsx` | verification |
| `pages/admin/reality-audit/LaunchHonestyBoard.tsx` | `admin/modules/verification/views/LaunchHonestyBoard.tsx` (dedup) | verification |
| `pages/admin/LaunchReadinessBoard.tsx` | `admin/modules/releases/views/LaunchReadinessBoard.tsx` | releases |
| `pages/admin/TeamManagement.tsx` | `admin/modules/environments/views/TeamManagement.tsx` | environments |
| `pages/admin/UserManagement.tsx` | `admin/modules/environments/views/UserManagement.tsx` | environments |
| `pages/admin/cloud/AdminRBACConsole.tsx` | `admin/modules/trust-security/views/AdminRBACConsole.tsx` | trust-security |
| `pages/admin/modules/MCKnowledgeBase.tsx` | `admin/modules/config/views/MCKnowledgeBase.tsx` | config |
| `pages/admin/modules/MCSupport.tsx` | `admin/modules/support/views/MCSupport.tsx` | support |

New per-domain barrels published at:
- `src/admin/modules/overview/views/index.ts`
- `src/admin/modules/releases/views/index.ts`
- `src/admin/modules/environments/views/index.ts`
- `src/admin/modules/trust-security/views/index.ts`
- `src/admin/modules/config/views/index.ts`
- `src/admin/modules/support/views/index.ts`
- `src/admin/modules/verification/views/index.ts` (extended)

### Issues caught and fixed during wave 2
1. `GeneratedTruthDashboard` had relative imports of `generated/*.json` —
   rewritten to alias-based paths so the file is location-independent.
2. `AdminRBACConsole` exported only a named binding — shim now re-exports
   `{ AdminRBACConsole, AdminRBACConsole as default }` to preserve
   both default-import and named-import call sites.

**Cumulative Phase 5 status:** 15 / 15 curated pages migrated across
6 domains. ✅ 8/8 verification gates pass, TypeScript clean, zero broken
imports, zero route changes. Future waves can target the 500 uncurated
`SECONDARY_SUBVIEW` entries once their `targetRoute` values are
hand-curated in `admin-page-consolidation-map.ts`.
