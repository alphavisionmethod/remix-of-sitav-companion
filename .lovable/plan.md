

# Fix ISS-003 & ISS-004 Documentation Accuracy

## Findings

| Claim in Doc | Actual | Status |
|---|---|---|
| ISS-003: "exactly 3 user-facing domains" | ✅ 3 primary domain route files (business, money, concierge). Others (boardroom, files, comms, apps, settings) are standalone utilities. | Correct |
| ISS-004: "47 core-service files" | ❌ `src/lib/core-services/` contains **210** non-test `.ts` files | Wrong |
| ISS-004: "25 security modules" | ❌ `src/lib/security/` + `src/lib/os-security/` + `src/platform/security/` = **22** files | Wrong |
| ISS-004: "43 canonical services (under 45 budget)" | ✅ `service-consolidation-manifest.json` confirms 43 (22 T1, 16 T2, 2 T3, 3 isolated) | Correct |

## Changes

**File**: `generated/FULL_ISSUES_AND_FIXES.md`, line 49

**Before**:
```
- **Files**: 47 core-service files, 25 security modules
```

**After**:
```
- **Files**: 210 core-service modules (`src/lib/core-services/`), 22 security modules (`src/lib/security/`, `src/lib/os-security/`, `src/platform/security/`)
```

## Impact
- Documentation-only fix, no code changes
- ISS-003 is verified accurate, no change needed

