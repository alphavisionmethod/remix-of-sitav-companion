# SITA OS — Route Remediation Plan (Phase B3 scope)

## Findings
- 491 declared routes, 1,047 page files, 135 detected orphans, 7 wrappers.
- ~30% of detected orphans are false positives (dynamic mounts, barrel re-exports).
- All 7 wrappers are documented and intentional from prior page-consolidation waves.

## Action plan
1. **No deletions in this wave.** Every orphaned page may have an undetected dynamic mount.
2. Add `check-route-truth.ts`, `check-dead-pages.ts`, `check-route-wrapper-usage.ts` (Phase B2 — done).
3. Manually triage the 135 orphan list in a future wave; convert true orphans to redirects via `admin-redirect-map.ts` / `user-redirect-map.ts`.
4. Document the 7 known wrappers in the wrapper check's allowlist (done).

## Wrappers — known and allowed
See `STALE_PAGES_AND_ROUTE_WRAPPERS.md` for the full inventory.
