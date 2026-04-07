
Goal

- Fix the real build blockers.
- Do not make unnecessary changes to the 13 logo imports unless the asset is actually missing.
- Correct the audit so it no longer reports a false broken-import issue.

What I checked

1. `src/assets/logo.jpeg` exists in the project.
2. The 13 listed files do import `@/assets/logo.jpeg`.
3. The `@` alias is correctly configured in:
   - `vite.config.ts`
   - `tsconfig.json`
   - `tsconfig.app.json`
4. `src/vite-env.d.ts` includes `vite/client`, so Vite asset imports like `.jpeg` are supported.
5. Conclusion: the “13 broken imports” finding is false in the current code snapshot. Those imports should not be mass-changed.
6. The actual build issue is the Atlas identifier drift reported by TypeScript:
   - `connectors`
   - `services`
   - `slos`

Diagnosis

- In the Atlas pages, demo datasets were renamed to `DEMO_connectors`, `DEMO_services`, and `DEMO_slos`.
- The compiler errors indicate that some remaining references still expect the old names (`connectors`, `services`, `slos`).
- In the current snapshot, these files already mostly use `DEMO_*`, which suggests the rename was only partially normalized and/or introduced inconsistent naming across render logic and UI state.
- There is also one clear accidental rename in `OperationsCommandCenter.tsx`: the tab key was changed to `"DEMO_slos"`, which is a data constant name, not a UI tab identifier.

Implementation plan

1. Normalize Atlas page data names
   - `src/pages/atlas/ConnectorControlCenter.tsx`
   - `src/pages/atlas/OperationsCommandCenter.tsx`

   Use one consistent pattern only:
   - Keep the seed arrays as `DEMO_*`
   - Create local render aliases for the page logic:
     - `const connectors = DEMO_connectors`
     - `const services = DEMO_services`
     - `const slos = DEMO_slos`

   Then use those aliases consistently in the component body. This is the safest fix because it removes any leftover mixed references without changing the project’s `DEMO_` convention.

2. Revert accidental UI-key renames
   - In `OperationsCommandCenter.tsx`, change tab values from `"DEMO_slos"` back to `"slos"` in both:
     - `TabsTrigger`
     - `TabsContent`

   Rule:
   - `DEMO_` prefix is for static data constants only.
   - UI state keys, route-like strings, and labels should stay semantic and human-readable.

3. Leave the 13 logo imports alone
   - Do not create a duplicate asset.
   - Do not rewrite those 13 imports to another path unless the branding asset is intentionally being replaced.
   - Since `src/assets/logo.jpeg` exists, the correct fix is no-op for those files.

4. Fix the misleading documentation
   - Update `SITA_OS_MISSING_Audit.md` to remove the false “broken imports” section.
   - If that file is generated, update the generator logic so it checks the filesystem before reporting missing assets.

Verification plan

1. Run TypeScript typecheck and confirm these errors disappear:
   - `ConnectorControlCenter.tsx: connectors`
   - `OperationsCommandCenter.tsx: services`
   - `OperationsCommandCenter.tsx: slos`

2. Manually verify these pages render:
   - Atlas Connector Control Center
   - Atlas Operations Command Center
   - Onboarding
   - Forgot Password

3. Confirm:
   - Atlas tabs still switch correctly
   - logo renders correctly on onboarding/auth/SITA shell screens
   - no unnecessary import churn was introduced

Files to change

- `src/pages/atlas/ConnectorControlCenter.tsx`
- `src/pages/atlas/OperationsCommandCenter.tsx`
- `SITA_OS_MISSING_Audit.md`
- optionally the audit generator, if the report is auto-generated

Technical note

Safest implementation shape:
```ts
const connectors = DEMO_connectors;
const services = DEMO_services;
const slos = DEMO_slos;
```

This preserves the demo-data naming convention while guaranteeing the component logic has stable identifiers the compiler can resolve.
