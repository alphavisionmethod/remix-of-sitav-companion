

# Rename All Non-DEMO_ Uppercase Arrays + Add isDemoMode Gates

## Summary

A Python automation script will scan every `.tsx` file under `src/pages/admin/` and `src/pages/investment-office/`, find all top-level `const UPPERCASE_NAME = [...]` arrays that don't already have the `DEMO_` prefix, rename them to `DEMO_UPPERCASE_NAME`, update all references in the same file, and ensure `useDataMode` + `isDemoMode` are present. Build verification + UI spot-check follow.

## What's Already Done vs What's Left

**Already DEMO_ prefixed (~52 files):** Most investment-office pages and many admin pages were renamed in prior sprints. These are correct.

**Still need DEMO_ prefix (~18+ files, ~50+ arrays):** These files have `const SOME_NAME = [...]` without `DEMO_` prefix:

| File | Arrays to rename |
|------|-----------------|
| `admin/AIHumanBoundaryControls.tsx` | `AGENT_BOUNDARIES`, `MISSION_BOUNDARIES`, `CHANGE_TYPE_BOUNDARIES` |
| `admin/AIT03TaskInvocation.tsx` | `TASK_TYPES`, `BUDGET_POSTURES`, `SCOPE_DOMAINS` |
| `admin/HRS03ReadinessExplanation.tsx` | `PIPELINE_STAGES`, `COMBINE_STRATEGIES` |
| `admin/AND01AndroidEcosystemCenter.tsx` | `PROVIDER_CAPS` + others |
| `admin/APL01AppleEcosystemCenter.tsx` | similar config arrays |
| `admin/SystemManagement.tsx` | `COMMANDS` (inline) |
| `admin/MockReplacementProgram.tsx` | `MOCK_TYPES`, `STATUSES`, `PRIORITIES` |
| `admin/MemoryContinuityCenter.tsx` | `SCOPES` |
| `admin/sag/SAGMultiStageExplorer.tsx` | `EXAMPLE_STAGES` |
| `admin/sag/SAGBuilderConsole.tsx` | `BUILDER_STEPS` |
| ~40+ more admin subdirectory files | Various uppercase arrays |

## Implementation

1. **Python script** scans all `.tsx` files in `src/pages/admin/` and `src/pages/investment-office/`
2. For each file, regex-finds `const [A-Z][A-Z0-9_]+ = [` patterns
3. Skips arrays already prefixed with `DEMO_`
4. Renames the declaration and all references in that file to `DEMO_` prefix
5. If `useDataMode` import is missing, injects it
6. If `isDemoMode` destructure is missing, injects it after the component function declaration
7. Writes all modified files

**Safety rules:**
- Does NOT rename type aliases, interfaces, enums, or Record/object constants (only arrays `= [`)
- Does NOT rename imported constants from other modules (only file-local declarations)
- Preserves all existing `DEMO_` prefixed arrays unchanged

## Verification

1. `npx tsc --noEmit` — 0 errors
2. UI spot-check: navigate to AIHumanBoundaryControls, AIT03TaskInvocation, and 2 investment-office pages to confirm rendering

## Files Changed

~18-40 files across `src/pages/admin/` (including subdirectories) and any remaining `src/pages/investment-office/` files. No changes to files already correctly prefixed.

