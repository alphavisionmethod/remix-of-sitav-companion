

# Fix Invalid OwnerTeam Literals in Edge Function Registry

## Summary

55 build errors in `src/lib/backend-topology/edge-function-registry.ts` caused by 8 invalid `OwnerTeam` string literals that don't match the union type. Each must be mapped to the closest valid team name.

## Mapping

| Invalid Value | Valid Replacement |
|---|---|
| `"observability"` | `"platform-core"` |
| `"app-ecosystem"` | `"app-platform"` |
| `"release-engineering"` | `"platform-core"` |
| `"compliance-engineering"` | `"compliance-security"` |
| `"site-reliability"` | `"cloud-infrastructure"` |
| `"connector-engineering"` | `"connector-integrations"` |
| `"device-engineering"` | `"platform-core"` |
| `"security-engineering"` | `"compliance-security"` |

## Technical Details

A single find-and-replace pass across lines 628-1250 of `edge-function-registry.ts` replaces all 55 occurrences. No structural changes needed -- only string literal corrections.

## Files Changed

| File | Change |
|---|---|
| `src/lib/backend-topology/edge-function-registry.ts` | Replace 8 invalid owner team strings with valid `OwnerTeam` values across 55 locations |

After fixing, run the full test suite to confirm 0 build errors and all tests pass.

