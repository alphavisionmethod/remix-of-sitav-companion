
# Run Route-Intent-Taxonomy / Page-Owner-Map Consistency Check

## Summary

The project already has a complete validator script at `scripts/features/check-route-page-consistency.ts` that performs exactly the five checks requested:

1. Every `pageSource` in `ROUTE_METADATA_REGISTRY` resolves on disk
2. Every page in `PAGE_OWNER_MAP` resolves on disk
3. Route-referenced pages have a `PAGE_OWNER_MAP` entry
4. `PAGE_OWNER_MAP` pages are referenced by at least one route
5. Route paths map to a registered feature surface

## What will happen

1. Run `npx tsx scripts/features/check-route-page-consistency.ts` to execute the validator.
2. Review the console output (errors, warnings, compliance status).
3. Save the generated audit report (`generated/route-page-consistency-audit.json`) as a downloadable artifact if desired.
4. If any errors or significant warnings surface, triage them and fix the source registries (`route-intent-taxonomy.ts`, `page-owner-map.ts`, or `feature-registry.ts`) to restore consistency.

## Technical Details

| Source file | Role |
|---|---|
| `src/platform/architecture/route-intent-taxonomy.ts` | 585 lines, canonical route metadata with `pageSource` fields |
| `src/platform/architecture/page-owner-map.ts` | 44 lines, page-to-domain ownership entries |
| `src/features/feature-registry.ts` | 257 lines, feature surface registry with `ownedRoutes` |
| `scripts/features/check-route-page-consistency.ts` | The validator (208 lines) |

No new files or database changes are required unless the audit reveals broken references that need fixing.
