

# Fix ModuleAdvisorInsight Build Errors

## Problem
5 Money pages import `ModuleAdvisorInsight` from `@/components/sita/domain-shared/ModuleAdvisorInsight`. The component file exists and exports correctly, but the build system cannot resolve the direct file import. The LSP confirms the component definition exists but cannot follow the import path from consumer files.

## Root Cause
The barrel file `src/components/sita/domain-shared/index.ts` does not re-export `ModuleAdvisorInsight`. While direct file imports *should* work, the build environment is not resolving them. Adding the export to the barrel and switching imports to use the barrel path will fix resolution reliably.

## Fix (2 changes)

### 1. Add export to barrel file
**File:** `src/components/sita/domain-shared/index.ts`
Add:
```ts
export { ModuleAdvisorInsight } from "./ModuleAdvisorInsight";
```

### 2. Update imports in 5 files to use barrel path
Change the import in each file from:
```ts
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared/ModuleAdvisorInsight";
```
to:
```ts
import { ModuleAdvisorInsight } from "@/components/sita/domain-shared";
```

**Files:**
- `src/pages/money/BillsWorkspace.tsx`
- `src/pages/money/LifeMoneyEngine.tsx`
- `src/pages/money/NetWorthOffice.tsx`
- `src/pages/money/OpportunityCost.tsx`
- `src/pages/money/TransactionIntelligence.tsx`

### 3. Verify build
Run `tsc --noEmit` to confirm 0 errors.

