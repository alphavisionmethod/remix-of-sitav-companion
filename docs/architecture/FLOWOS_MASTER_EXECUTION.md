# FLOWOS — Master Execution (Companion Deep-Dive)

> Long-form companion to [`/FLOWOS.MD`](../../FLOWOS.MD). This file holds the
> per-sub-wave execution scripts, the per-file checklists, and the rewiring
> playbooks that are too detailed for the master ledger.

## 1. Per-move execution checklist (Wave 8 binding)

For every physical file move under Wave 8 sub-waves:

1. **Identify canonical destination** using one of:
   - `generated/manifests/route-adapter-semantic-map.json`
   - `generated/manifests/admin-plane-ownership-map.json`
   - `generated/manifests/platform-subclassification-map.json`
   - `generated/manifests/shared-component-ownership-map.json`
   - `docs/architecture/REPOSITORY_CONSTITUTION.md` §7 mapping table
2. **Reverse-dependency scan (G2):**
   ```bash
   rg "from .*<old-path-without-ext>" -g '!node_modules' \
     src/ tests/ docs/ generated/ scripts/ .github/
   ```
3. **Move body byte-for-byte:**
   ```bash
   git mv <old-path> <new-canonical-path>     # logical move
   ```
   In Lovable: use `code--copy` to write the body at the new path.
4. **Replace old path with thin re-export shim (≤10 lines):**
   ```ts
   // @route-adapter-subtype: pure-reexport
   export { default } from "@/<canonical>/<…>/<File>";
   ```
5. **Rewire any consumer not covered by the shim** (rare — most consumers
   reach pages via the route registry's `lazy(import("@/pages/<…>"))`).
6. **Run validators:**
   ```bash
   npx tsx scripts/architecture/check-page-semantic-adapter.ts
   npx tsx scripts/architecture/check-pages-thin-adapter.ts
   npx tsx scripts/architecture/check-page-adapter-subtype-declaration.ts
   npx tsx scripts/architecture/check-admin-page-body-ratchet.ts  # if admin
   npx tsc --noEmit
   ```
7. **For `EmptyState` moves only (G5):**
   ```bash
   rg -n "from .*EmptyState" src/   # all must point at canonical
   ```
8. **Reseal ratchet** by re-running the relevant `generate-*` script and the
   validator with `--seal` if the count decreased.
9. **Re-emit attestation (G6):**
   ```bash
   npx tsx scripts/architecture/wave-10-emit-attestation.ts
   ```
10. **Append to wave report** under `generated/audits/flowos-wave-<X>-report.md`.

## 2. Wave A target list (drained in this PR)

| # | Old path | Canonical destination | Subtype | Reason |
|---|---|---|---|---|
| 1 | `src/pages/mobile/MobileAIChat.tsx` | `src/platform/mobile/pages/MobileAIChat.tsx` | pure-reexport | useState-canonical |
| 2 | `src/pages/mobile/MobileApprovals.tsx` | `src/platform/mobile/pages/MobileApprovals.tsx` | pure-reexport | useState-canonical |
| 3 | `src/pages/mobile/MobileBusinessAdvisorDetail.tsx` | `src/platform/mobile/pages/MobileBusinessAdvisorDetail.tsx` | pure-reexport | useState-canonical |
| 4 | `src/pages/mobile/MobileCommand.tsx` | `src/platform/mobile/pages/MobileCommand.tsx` | pure-reexport | useState-canonical |
| 5 | `src/pages/mobile/MobileFiles.tsx` | `src/platform/mobile/pages/MobileFiles.tsx` | pure-reexport | useState-canonical |
| 6 | `src/pages/mobile/MobileInbox.tsx` | `src/platform/mobile/pages/MobileInbox.tsx` | pure-reexport | useState-canonical |
| 7 | `src/pages/mobile/MobileNotificationCenter.tsx` | `src/platform/mobile/pages/MobileNotificationCenter.tsx` | pure-reexport | useState-canonical |
| 8 | `src/pages/mobile/MobileQuickCapture.tsx` | `src/platform/mobile/pages/MobileQuickCapture.tsx` | pure-reexport | useState-canonical |
| 9 | `src/pages/mobile/MobileReceiptDetail.tsx` | `src/platform/mobile/pages/MobileReceiptDetail.tsx` | pure-reexport | useState-canonical |
| 10 | `src/pages/mobile/MobileSettings.tsx` | `src/platform/mobile/pages/MobileSettings.tsx` | pure-reexport | useState-canonical |
| 11 | `src/pages/mobile/MobileSyncControl.tsx` | `src/platform/mobile/pages/MobileSyncControl.tsx` | pure-reexport | useState-canonical |
| 12 | `src/pages/mobile/MobileTimeline.tsx` | `src/platform/mobile/pages/MobileTimeline.tsx` | pure-reexport | useState-canonical |
| 13 | `src/pages/owner-mode/OwnerModePage.tsx` | `src/platform/owner/pages/OwnerModePage.tsx` | pure-reexport | useState-canonical |

`src/pages/NotFound.tsx` is the constitutional sole-exception (Rule 7) and
stays at root. The 2 `business-advisors/` adapters fail only with
`unrecognized-adapter-pattern` and will be drained in Wave A.1 by adding the
`@route-adapter-subtype` declaration (no body move required).

## 3. Future sub-wave shard plan (Wave B.x — admin page bodies)

The 576 admin page bodies under `src/pages/admin/**` will be drained in 12
per-IA-domain shards (one PR each) per
`docs/architecture/ADMIN_INFORMATION_ARCHITECTURE.md`:

| Shard | IA Domain | Target home |
|---|---|---|
| B.1 | `ai/` | `src/admin/modules/ai/views/` |
| B.2 | `architecture/` | `src/admin/modules/architecture/views/` |
| B.3 | `cloud/` | `src/admin/modules/cloud/views/` |
| B.4 | `intelligence/` | `src/admin/modules/intelligence/views/` |
| B.5 | `operations/` | `src/admin/modules/operations/views/` |
| B.6 | `runtime/` | `src/admin/modules/runtime/views/` |
| B.7 | `security/` | `src/admin/modules/security/views/` |
| B.8 | `trust-security/` | `src/admin/modules/trust-security/views/` |
| B.9 | `verification/` | `src/admin/modules/verification/views/` |
| B.10 | `fleet/` | `src/admin/modules/fleet/views/` |
| B.11 | `governance/` | `src/admin/modules/governance/views/` |
| B.12 | residual | per `admin-plane-ownership-map.json` |

Each shard PR follows the per-move checklist in §1 and produces
`generated/audits/flowos-wave-b-<N>-report.md`.

## 4. Rewiring playbook reference matrix

| If you change | You MUST also update |
|---|---|
| A page body location | route registries (`src/routes/*`, `src/admin/routes/`), lazy imports, manifests |
| A platform subsystem name | `platform-subclassification-map.json`, `MANIFEST.md`, `check-no-duplicate-platform.ts` allow-list, every `@/platform/<name>` import |
| A shared component owner | `shared-component-ownership-map.json`, `check-shared-component-concept-rule.ts` allow-list, every importer |
| A contract type location | `contract-ownership-map.json`, `check-contract-duplicate-identifiers.ts`, `check-public-contract-barrel-purity.ts` |
| A validator file | `validator-gate-map.ts`, `generated/validator-gate-map.json`, the relevant CI workflow |
| A generated artifact path | every `check-generated-vs-docs` allow-list, public-generated-allowlist if shipped |
| An admin page body | `admin-plane-ownership-map.json`, `admin-page-body-baseline.json` (decrement only) |
| Anything proof-backed | re-emit via `wave-10-emit-attestation.ts` (G6) |

## 5. Anti-pattern catalogue (forbidden in Wave 8)

- ❌ Hand-edit a `*-baseline.json` ratchet file.
- ❌ Hand-edit `wave-10-architectural-attestation.json`.
- ❌ Move a file without running the reverse-dependency scan.
- ❌ Leave two canonical owner paths for one concept.
- ❌ Rename a file as part of a move (rename is a separate, ledgered change).
- ❌ Change logic, UI, or API surface inside a Wave 8 move (G8).
- ❌ Add a new `src/platform/<name>/` folder without `MANIFEST.md` and
  registration in `check-no-duplicate-platform.ts`.
- ❌ Add a `src/components/**` file that imports from `src/modules/**`.
- ❌ Edit `src/integrations/supabase/{client.ts,types.ts}`.

---

_End of FLOWOS_MASTER_EXECUTION.md._