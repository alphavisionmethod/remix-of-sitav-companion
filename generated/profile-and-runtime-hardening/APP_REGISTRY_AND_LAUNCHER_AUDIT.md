# App Registry & Launcher Audit (Phase A)
Generated: 2026-04-18T12:22:03.291Z
## Coverage
- Apps in registry: **19**
- Routes scanned: **673**
- User profile allowedApps: **9**
- Operator profile allowedApps: **12**
## Drift Summary
- Apps with missing route: **3**
- Apps missing from user manifest (but declare user profile): **1**
- Apps missing from operator manifest (but declare operator profile): **1**
- Admin apps without roleRequired: **0**
- Manifest orphans (apps in profile manifest but not in registry): **0**
## Drift Detail (only entries with drift)
- `search` (shell-runtime, profiles=["user","operator"]) → user-manifest-missing, operator-manifest-missing
- `observability` (admin, profiles=["operator"]) → missing-route
- `release-center` (admin, profiles=["operator"]) → missing-route
- `platform-control` (admin, profiles=["operator"]) → missing-route
## Manifest Orphans
_none_
See `app-registry-map.json` for full detail.
