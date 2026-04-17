

## Plan — Fix Build Errors in META03GoldenPathHealth.tsx

### Root cause

The TS2304 "Cannot find name 'DimensionTile'/'DimRow'" errors at lines 201–229 occur even though both helpers ARE defined at lines 296 and 307. Function declarations should hoist, but TypeScript's JSX parser is failing to resolve them — almost certainly because the type signature of `DimRow` (`values: readonly string[]`) is too strict for one of the call sites:

- Line 228: `values={s.verifications}` — `s.verifications` is typed `readonly GoldenPathVerificationKind[]` (a string-literal union), which is NOT assignable to `readonly string[]` due to readonly array invariance in some TS configs.

When this type check fails inside JSX, TS sometimes cascades into "Cannot find name" errors for the component identifier itself. Combined with the helpers being defined AFTER the consuming component, the parser confusion compounds.

### Fix (single file: `src/pages/admin/META03GoldenPathHealth.tsx`)

1. **Move `DimensionTile` and `DimRow` definitions ABOVE** `META03GoldenPathHealth` so they're declared before use (defensive against any parser quirks).
2. **Loosen `DimRow` props** to accept any readonly array of strings or string-literal unions:
   ```ts
   function DimRow({ icon, label, values }: { 
     icon: React.ReactNode; 
     label: string; 
     values: readonly string[] | readonly any[]; 
   })
   ```
   Or more cleanly: change the type to `ReadonlyArray<string>` and cast call sites: `values={[...s.verifications]}` for the verification one.
3. **Verify** `s.verifications` (the `GoldenPathVerificationKind[]` array of enum strings) renders as `"playwright-e2e, runtime-probe"` etc. in the Reality Map.

### Acceptance

- `META03GoldenPathHealth.tsx` compiles with 0 TS errors
- All 11 dimensions still render per step in the Reality Map panel
- No regression in the existing summary tiles, health badges, or runbook links
- Checklist 23 remains 11/11 truthful

