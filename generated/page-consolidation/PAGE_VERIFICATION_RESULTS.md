# Page Verification Results
> Generated: 2026-04-18T11:41:06.902Z
> Source: `scripts/architecture/audits/page-verification-runner.ts`
> Status: ✅ **ALL CHECKS PASS**

## Summary

| Check | Result | Duration |
|---|---|---:|
| `audit` | ✅ pass | 2086ms |
| `admin-classification-coverage` | ✅ pass | 1999ms |
| `admin-domain-budget` | ✅ pass | 1898ms |
| `admin-route-coherence` | ✅ pass | 2092ms |
| `redirect-coverage` | ✅ pass | 1968ms |
| `experimental-isolation` | ✅ pass | 2076ms |
| `page-registry-completeness` | ✅ pass | 2269ms |
| `typecheck` | ✅ pass | 797ms |

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

