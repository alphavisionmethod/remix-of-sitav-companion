

User wants a comprehensive audit document `PROJECT_TREE_AUDIT.md` written to `/mnt/documents/` based on actual repo inspection. This is a documentation/artifact task — read-only inspection then file generation. No app code changes.

## Approach

1. **Inspect actual repo state** (read-only): top-level layout, `src/` decomposition, `electron/`, `os/`, `supabase/`, `scripts/architecture/`, `generated/`, `public/generated/`, plane registries, route-plane map, deployment profiles, recent AI Engineer hub closure bundle.
2. **Cross-check claims** in memory against filesystem (e.g., is there a `src/services/`? is `src/lib/` actually huge? are planes physically reflected?).
3. **Generate the audit** with all 9 required sections (A–I), in markdown, comprehensive, no softening.
4. **Write to `/mnt/documents/PROJECT_TREE_AUDIT.md`** and emit `<lov-artifact>` for download.
5. **Mirror to `public/generated/`** so it can be surfaced in-app later if needed.

## Scope discipline

- Pure read + artifact write. No edits to app code, no migrations, no edge functions.
- Audit reflects current state honestly: AI Engineer hub Phases 1–6 done at framework + flagship-board level; ~33/43 panels still owe primitive sweep; structural debts (oversized `src/lib`, missing `src/services`, no first-class mobile root, observability/security/compliance still distributed) called out unsoftened.

## Files to read (parallel where safe)

- Root: `package.json`, `tsconfig.json`, `vite.config.ts`
- `src/` top-level listing + `src/lib/` overview + `src/components/admin/ai-runtime/` + `src/pages/admin/ai-runtime/`
- `src/lib/architecture/plane-registry.ts`, `route-plane-map.ts`, `deployment-profile.ts`
- `electron/` listing
- `os/` listing  
- `supabase/functions/` count, `supabase/config.toml`
- `scripts/architecture/`, `scripts/validation/check-ai-engineer-*`
- `generated/admin-ai-engineer-team/admin-ai-engineer-team-verification.json`

## Output

- `/mnt/documents/PROJECT_TREE_AUDIT.md` (downloadable artifact, ~1500–2000 lines, all 9 sections, real tree, honest gap list, prioritized P0–P3)
- Mirror at `public/generated/PROJECT_TREE_AUDIT.md`
- Single `<lov-artifact>` tag at end

