# Admin Surface Consolidation
> Generated: 2026-04-18T11:37:27.455Z
> Source: `scripts/architecture/audits/page-consolidation-audit.ts`
> Status: **read-only audit** (Phase 0). Zero code/route changes.

## Final classification of all 539 admin pages

| Class | Count | Action in later phases |
|---|---:|---|
| PRIMARY_DOMAIN_ENTRY | 8 | Stay as canonical hubs (Phase 3). |
| SECONDARY_SUBVIEW | 14 | Become tabs/views inside hubs (Phase 5). |
| DETAIL_EXPLORER | 501 | Stay as deep-link drill-downs. |
| WORKFLOW_TOOL | 3 | Operator action surfaces — preserved. |
| SUPPORT_TOOL | 0 | Diagnostics — preserved. |
| DUPLICATE_MERGE_REQUIRED | 13 | Merge into canonical (Phase 2 redirect + Phase 5 file move). |
| DEPRECATE_WITH_REDIRECT | 0 | Redirect-only (Phase 2). |
| REMOVE_AFTER_SAFE_MIGRATION | 0 | Final cleanup (Phase 7, only after CI green). |

**Total curated entries:** 38
**Coverage:** 100% (every admin page has either a curated entry or a prefix-inferred classification).
