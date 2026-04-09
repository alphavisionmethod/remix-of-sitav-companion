

# Fix Remaining Audit Items: Headings, DEMO_ Consolidation, Edge Functions

## Investigation Results

### Item 1: ~44 Pages Without Headings → Actually 3 Pages
After filtering:
- **3 mobile pages** (`MobileAlerts`, `MobileApprovals`, `MobileProof`) — already covered by `MobileShell` which renders `<h1>`
- **14 onboarding screens** + `LiveOfficeSidebar` + `BranchingQuestionsPanel` — sub-components inside `FormationShell`, not direct routes
- **3 real pages** need sr-only headings:
  - `DesktopPage.tsx` — desktop shell wrapper
  - `BusinessOnboarding.tsx` — formation flow entry
  - `FormationShell.tsx` — multi-step wizard container

### Item 2: 430 Inline DEMO_ Arrays → Consolidate into Domain Modules
- 430 arrays across 210 page files
- 380 unique names, 42 names duplicated across files (101 occurrences)
- Duplicated names (e.g. `DEMO_CATEGORIES`, `DEMO_STATS`) contain different domain-specific data — not true duplicates

**Strategy**: Create ~15 domain-grouped demo-data modules in `src/lib/demo-data/` and move all 430 arrays out of pages. Pages import from shared modules. This eliminates inline data from all page files and makes the `check-inline-mocks.ts` script pass cleanly.

New files:
- `src/lib/demo-data/admin-ai.ts` — AI ops boards (~60 arrays)
- `src/lib/demo-data/admin-platform.ts` — Platform admin (~40 arrays)
- `src/lib/demo-data/admin-intelligence.ts` — Intelligence boards (~30 arrays)
- `src/lib/demo-data/admin-connectors.ts` — Connector pages (~15 arrays)
- `src/lib/demo-data/admin-misc.ts` — Remaining admin (~25 arrays)
- `src/lib/demo-data/revenue-office.ts` — Revenue office (~35 arrays)
- `src/lib/demo-data/digital-presence.ts` — DPO pages (~25 arrays)
- `src/lib/demo-data/concierge.ts` — Concierge pages (~20 arrays)
- `src/lib/demo-data/enterprise.ts` — Enterprise pages (~15 arrays)
- `src/lib/demo-data/atlas.ts` — Atlas/mission pages (~15 arrays)
- `src/lib/demo-data/investment.ts` — Investment office extras (~20 arrays)
- `src/lib/demo-data/apps.ts` — App pages (~10 arrays)
- `src/lib/demo-data/core-pages.ts` — Top-level pages (~40 arrays)
- `src/lib/demo-data/workspace.ts` — Workspace pages (~15 arrays)
- `src/lib/demo-data/mobile.ts` — Mobile-specific (~5 arrays)

For duplicated names, prefix with domain: `DEMO_ADMIN_CATEGORIES`, `DEMO_REVENUE_CATEGORIES`, etc.

### Item 3: Edge Function Placeholders → Already Resolved
Investigation found **zero** actual placeholder/TODO comments in data services. The grep matches were legitimate `"pending"` status values in data records (e.g., approval status). No action needed.

## Implementation

### Step 1: Add sr-only headings (3 files)
Add `<h1 className="sr-only">` to `DesktopPage.tsx`, `BusinessOnboarding.tsx`, `FormationShell.tsx`.

### Step 2: Create ~15 demo-data modules
Extract all `const DEMO_*` arrays from 210 page files into grouped modules under `src/lib/demo-data/`. Disambiguate colliding names with domain prefixes.

### Step 3: Update 210 page files
Replace inline `const DEMO_*` declarations with imports from the new shared modules.

### Step 4: Verify
- `grep -rn "^const DEMO_" src/pages/` → 0 matches
- `npx tsc --noEmit` → 0 errors
- `check-inline-mocks.ts` → passes

## Files Changed
- **3 updated**: heading fixes
- **~15 created**: `src/lib/demo-data/*.ts` domain modules
- **~210 updated**: page files (replace inline arrays with imports)

## Risk
Low — pure data extraction, no logic changes. All arrays are module-scoped constants with no external consumers.

