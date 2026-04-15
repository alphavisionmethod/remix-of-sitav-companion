

# SITA OS — Source Directory Reorganization

## Reality Check

| Metric | Value |
|--------|-------|
| Total files to organize | 4,090 |
| Total import statements | 10,712 |
| Unique import path prefixes | 296 |
| Files importing `@/components` | 5,237 statements |
| Files importing `@/lib` | 3,335 statements |
| Files importing `@/hooks` | 740 statements |

**This is a mass-rename of ~4,000 files touching ~10,700 import statements.** Every moved file requires updating every file that imports it. Moving `src/components/business/SomeWidget.tsx` to `src/features/business/components/SomeWidget.tsx` means finding and rewriting every `@/components/business/SomeWidget` import across the entire codebase.

## Critical Risk Assessment

This reorganization at this scale has a **very high probability of causing build breakage** if done in a single pass. The reasons:

1. **10,700+ import rewrites** — each one is a potential typo or missed reference
2. **No automated refactoring tools** available in this environment (no `jscodeshift`, no IDE rename)
3. **Circular dependency risk** — moving files between layers can surface hidden circular imports
4. **The `@/` alias is singular** — there's only one alias (`@/ → src/`), so every path change requires updating consumers
5. **Build system has no tolerance** — one wrong import = broken build

## Recommended Approach: Barrel Re-exports (Zero Breakage)

Instead of physically moving 4,090 files and rewriting 10,700 imports, we create the **target directory structure as a re-export layer** that maps to the canonical organization. Existing files stay where they are. New code imports from the canonical paths.

This is exactly how the project already handles similar problems (e.g., `src/lib/services/` re-exports from `src/lib/core-services/`).

### What gets created

```text
src/features/          — barrel re-exports to components/pages by domain
src/admin/             — barrel re-exports to pages/admin + components/admin
src/platform/          — barrel re-exports to lib/ platform modules
src/domains/           — barrel re-exports to lib/ domain logic
src/runtimes/          — barrel re-exports to lib/runtime + components/mobile + components/sita/shell
src/contracts/         — barrel re-exports to packages/contracts
src/data/              — barrel re-exports to lib/data-services + integrations
src/app/               — barrel re-exports for App.tsx, main.tsx, providers
```

Each barrel file is a single `index.ts` that re-exports from the current physical location. Example:

```typescript
// src/features/business/index.ts
export * from "@/components/business";
export * from "@/pages/BusinessCenter";
// ... etc
```

### Phase 1 — Create canonical barrel structure (27 top-level barrels)

Create `index.ts` files in each new canonical directory that re-export from current locations:

| New Path | Re-exports From |
|----------|----------------|
| `src/features/advisors/` | `@/components/advisors`, `@/hooks/useAdvisor*` |
| `src/features/auth/` | `@/components/auth`, `@/pages/auth/*` |
| `src/features/boardroom/` | `@/components/sita/apps/boardroom`, `@/pages/Boardroom*` |
| `src/features/business/` | `@/components/business`, `@/pages/business/*`, `@/pages/BusinessCenter` |
| `src/features/concierge/` | `@/components/concierge`, `@/pages/concierge/*` |
| `src/features/files/` | `@/components/files`, `@/pages/files/*` |
| `src/features/money/` | `@/components/money`, `@/components/finance`, `@/pages/money/*` |
| `src/features/intelligence/` | `@/components/intelligence` |
| `src/features/investment-office/` | `@/components/investment`, `@/pages/investment-office/*` |
| `src/features/notifications/` | `@/components/notifications` |
| `src/features/revenue-office/` | `@/components/revenue-office`, `@/pages/revenue-office/*` |
| `src/features/onboarding/` | `@/components/sita/onboarding`, `@/hooks/useSetup*` |
| `src/features/mobile/` | `@/components/mobile`, `@/pages/mobile/*` |
| `src/features/settings/` | `@/pages/settings/*` |
| `src/admin/modules/ai/` | `@/components/admin-ai`, `@/pages/admin/ai-*` |
| `src/admin/modules/architecture/` | `@/components/admin/architecture` |
| `src/admin/modules/cloud/` | `@/pages/admin/Cloud*` |
| `src/admin/modules/security/` | `@/pages/admin/SEC*` |
| `src/admin/modules/verification/` | `@/pages/admin/ITC*`, `@/pages/admin/V*`, `@/pages/admin/RCP*` |
| `src/admin/shell/` | `@/components/admin/shells` |
| `src/platform/auth/` | `@/lib/auth`, `@/contexts/AuthContext` |
| `src/platform/governance/` | `@/lib/architecture`, `@/components/governance` |
| `src/platform/proof/` | `@/lib/core-services/proof*` |
| `src/runtimes/shell/` | `@/components/sita/shell`, `@/components/sita/os` |
| `src/runtimes/desktop/` | `@/lib/runtime/desktop` |
| `src/runtimes/mobile/` | `@/lib/runtime/mobile`, `@/components/mobile` |
| `src/contracts/` | `@/packages/contracts` |
| `src/data/` | `@/lib/data-services` |

### Phase 2 — Create canonical directory map

Create `src/lib/architecture/directory-organization-map.ts`:
- Maps every current path to its canonical target path
- Documents the migration status (barrel-only vs physically-moved)
- Serves as the authority for future physical migrations

### Phase 3 — Add architecture governance rule

Update `src/lib/architecture/ia-governance.ts`:
- Add `validateDirectoryOrganization()` that checks new files are created in canonical paths, not legacy paths
- Warn on new files added to `src/components/sita/` (should use `src/runtimes/shell/` or `src/features/`)

### Phase 4 — Update architecture docs

Create `src/lib/architecture/DIRECTORY_ORGANIZATION.md`:
- Documents the canonical directory model
- Maps "where should I put X?" for every category
- Lists migration status per directory

## What This Does NOT Do

- **Does not move any existing files** — all 4,090 files stay in place
- **Does not rewrite any imports** — existing `@/components/*` and `@/lib/*` imports remain valid
- **Does not risk build breakage** — barrel re-exports are additive only
- **Does not change any runtime behavior** — pure organizational metadata

## Why This Is The Right Approach

The project already uses this exact pattern:
- `src/lib/services/` re-exports from `src/lib/core-services/`
- `src/planes/` re-exports from various `src/lib/` modules
- `src/lib/architecture/index.ts` barrels all architecture modules

Physically moving 4,090 files and rewriting 10,700 imports in one pass without automated refactoring tools would almost certainly break the build. The barrel approach achieves the same organizational clarity with zero risk.

New code can immediately use the clean paths (`@/features/business`, `@/admin/modules/ai`). Over time, files can be physically migrated one module at a time with targeted import rewrites.

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Feature barrels | ~15 `index.ts` | 0 |
| Admin module barrels | ~8 `index.ts` | 0 |
| Platform/runtime barrels | ~6 `index.ts` | 0 |
| Architecture map | 2 (map + docs) | 1 (ia-governance) |
| **Total** | **~31** | **1** |

