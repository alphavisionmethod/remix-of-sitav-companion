# Page Verification Results
> Generated: 2026-04-18T11:43:50.703Z
> Source: `scripts/architecture/audits/page-verification-runner.ts`
> Status: ✅ **ALL CHECKS PASS**

## Summary

| Check | Result | Duration |
|---|---|---:|
| `audit` | ✅ pass | 2177ms |
| `admin-classification-coverage` | ✅ pass | 2185ms |
| `admin-domain-budget` | ✅ pass | 1982ms |
| `admin-route-coherence` | ✅ pass | 1996ms |
| `redirect-coverage` | ✅ pass | 1972ms |
| `experimental-isolation` | ✅ pass | 1896ms |
| `page-registry-completeness` | ✅ pass | 1975ms |
| `typecheck` | ✅ pass | 792ms |

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

