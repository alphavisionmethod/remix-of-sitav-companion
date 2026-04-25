# Wave F — Frontend Page/Design Canonicalization Hardening

## Audit findings (real state, not assumed)

The repo has already executed Waves 4–9 of page canonicalization. Current ground truth:

| Surface | State | Action needed |
|---|---|---|
| `src/pages/*.tsx` (97 root files) | ✅ 96 moved (Wave 6); only `NotFound.tsx` kept | None — already canonical |
| `src/pages/{business,concierge,finance,boardroom,investment-office,money,health,files,settings,marketing,...}` (27 folders, ~400 files) | ✅ 100% shims → `@/modules/*` and `@/platform/*` | None — already canonical |
| `src/pages/admin/**` (583 files, **561 thick bodies**) | ⚠️ Inverted: bodies still here; `src/admin/pages/<domain>/index.ts` barrels re-export FROM `@/pages/admin/`. Pinned at 576 in monotone-decrease baseline (Rule 30) | **Hold under existing ratchet** — physical move is multi-week and out of scope; tighten guard instead |
| `src/pages/mobile/*.tsx` (27 thick bodies) | ❌ No canonical home declared | **Move to `src/platform/experience/pages/mobile/`** (matches `MobileShell` owner) |
| `src/pages/business-advisors/*.tsx` (2 thick bodies) | ❌ No canonical home; imports from `@/modules/business/components/business-advisors/*` | **Move to `src/modules/business/pages/business-advisors/`** |
| `src/pages/owner-mode/OwnerModePage.tsx` (1 thick) | ❌ Sibling to `src/pages/owner/` (already shims to `@/platform/owner/pages/`) | **Move to `src/platform/owner/pages/`** |
| Constitution | ❌ No explicit "Frontend Page Ownership Law" rule (despite Rule 30 admin ratchet, Wave C UI ownership, and Waves 4–9 reports) | **Add Rule 50 + ownership doc + manifest + validator** |

## Strict execution scope (no logic / UI / API changes)

This wave performs **only** physical relocations of 30 thick page bodies + governance sealing. Every move follows the proven Wave 6 pattern:

1. Verify canonical destination doesn't already exist
2. Move file via `git mv`-equivalent (rename) — preserves history
3. Replace original with 4-line shim: `export { default } from "@/<canonical>"; export * from "@/<canonical>";`
4. Reverse-dependency grep across `src/`, `tests/`, `scripts/`, `docs/`, `generated/`, `.github/` — confirm no path-specific consumers besides routes (which import from `@/pages/<path>` and continue to work via shim)
5. `tsc --noEmit` after each cluster

## Step-by-step

### Step 1 — Move `src/pages/mobile/` → `src/platform/experience/pages/mobile/`

- 27 files (Mobile{AIChat,Alerts,ApprovalDetail,Approvals,Boardroom,Business,BusinessAdvisorDetail,BusinessAdvisors,Command,Concierge,...})
- Rationale: every file imports `@/platform/experience/components/mobile/MobileShell` — mobile experience is the canonical owner.
- Leave 27 thin shims at `src/pages/mobile/` so `MobileRoutes.tsx` keeps working without edits.
- Generate `src/platform/experience/pages/mobile/index.ts` barrel.

### Step 2 — Move `src/pages/business-advisors/` → `src/modules/business/pages/business-advisors/`

- 2 files (`BusinessAdvisorPage.tsx`, `BusinessAdvisorsIndex.tsx`)
- Rationale: bodies are 100% composed of `@/modules/business/components/business-advisors/*` — clear module ownership.
- Leave 2 thin shims; `business-advisor-routes.tsx` keeps working.

### Step 3 — Move `src/pages/owner-mode/OwnerModePage.tsx` → `src/platform/owner/pages/OwnerModePage.tsx`

- 1 file. `src/pages/owner/` is already 100% shims to `@/platform/owner/pages/` — `owner-mode` is just a sibling that was missed in Wave 6.
- Leave 1 thin shim. `OwnerRoutes.tsx` keeps working.

### Step 4 — Update `src/admin/pages/<domain>/index.ts` barrels (cosmetic, traceability only)

The 14 admin barrel files currently import from `@/pages/admin/<File>` — they keep working as-is. **No changes** to barrel re-export paths in this wave (admin migration is governed by the existing Rule 30 ratchet and is out of scope here). Touching them would risk breaking 561 admin pages without proven need.

### Step 5 — Seal Frontend Page Ownership Law

Create:

- **`docs/architecture/FRONTEND_PAGE_OWNERSHIP_MODEL.md`** — describes the 5-zone canonical model (route adapters / module pages / platform pages / admin pages / shell-experience pages), references Waves 4–9 history, and pins the 3 remaining special cases (`NotFound`, admin under Rule 30 ratchet, sealed mobile/business-advisors/owner-mode).
- **`generated/manifests/frontend-page-ownership-map.json`** — machine-readable: every `src/pages/**` file → `{ kind: "shim" | "adapter" | "canonical-body" | "router-fallback", canonicalOwner: "<path>" | null, ratcheted: boolean }`. Generated from `src/pages/**` by reading shim re-export targets vs measuring file body weight.
- **`scripts/architecture/generate/generate-frontend-page-ownership-map.ts`** — generator (reused at CI).
- **`scripts/architecture/checks/check-frontend-page-canonical-ownership.ts`** — BLOCK validator that:
  - Fails if a NEW thick body (>10 logical lines) appears under `src/pages/**` outside the allowlist (`NotFound.tsx`, `src/pages/admin/**` under Rule 30 ratchet).
  - Fails if a shim's `canonicalOwner` target doesn't exist.
  - Fails if any thick body re-emerges under `src/pages/{mobile,business-advisors,owner-mode}/**` (the 3 zones we're sealing this wave).
- Wire validator into `src/lib/ci/validator-gate-map.ts` as `BLOCK`.
- Add **Rule 50 — Frontend Page Ownership Law** to `docs/architecture/REPOSITORY_CONSTITUTION.md`, codifying:
  - `src/pages/**` is a route-adapter zone only (allowlist: `NotFound.tsx`, `__tests__/`, `index.ts` barrels, and the legacy `admin/**` region governed by Rule 30).
  - Canonical bodies live under `src/modules/<pillar>/pages/`, `src/platform/<system>/pages/`, `src/admin/modules/<domain>/views/` (admin destination), or `src/platform/experience/pages/mobile/` (mobile/shell destination).
  - App pages, admin pages, mobile/OS-shell pages keep separate canonical roots (no flattening).
- Generate `generated/baselines/frontend-page-canonical-baseline.json` sealing current state at 0 thick bodies in {mobile, business-advisors, owner-mode} after the move.
- Audit report at `generated/audits/wave-f-frontend-page-canonicalization-hardening-report.md`.

### Step 6 — Verification gate (mandatory before completion)

For every moved file:

1. **Canonical destination proof** — assert target file exists and exports `default`.
2. **Reverse-dependency proof** — `rg "from ['\"]@/pages/(mobile|business-advisors|owner-mode)/" -t ts -t tsx src/ tests/ scripts/ docs/ generated/ .github/` returns only the route registries (which resolve via the shim).
3. **Old-path shim proof** — original path now contains only the 4-line re-export.
4. **`tsc --noEmit`** — 0 errors.
5. **Validator pass** — `check-frontend-page-canonical-ownership.ts`, `check-admin-page-body-ratchet.ts`, `check-route-page-contract-layer-usage.ts`, `check-page-backend-bypass.ts` all pass.
6. **Smoke route resolution** — re-run `generate-route-adapter-semantic-map.ts` and confirm violation count does not increase.
7. **Attestation reseal** — only via canonical generator (`scripts/architecture/wave-10-emit-attestation.ts`); no manual edits.

### Strict no-change discipline

- No logic changes, no UI changes, no API changes.
- No re-styling, no copy edits, no prop additions.
- File contents at the new canonical path are byte-identical to the originals.
- Shims are exactly 4 lines (matching Wave 6 pattern).

## Out of scope (deliberately deferred)

- Migrating the 561 admin bodies under `src/pages/admin/**` — governed by the existing Rule 30 monotone-decrease ratchet; physical move is a multi-week effort better executed as Wave G with per-domain batches.
- Reversing the `src/admin/pages/<domain>/index.ts` re-export direction — would require touching all admin pages and 14 barrels in one pass; risky and unrelated to today's gaps.
- Touching `src/pages/__tests__/` (50 test files) — they belong here.

## Deliverables

- 30 file moves + 30 thin shims (mobile: 27, business-advisors: 2, owner-mode: 1).
- 1 new doc (`FRONTEND_PAGE_OWNERSHIP_MODEL.md`).
- 1 new manifest + generator (`frontend-page-ownership-map.json`).
- 1 new BLOCK validator (`check-frontend-page-canonical-ownership.ts`).
- 1 new baseline (`frontend-page-canonical-baseline.json`).
- 1 constitution amendment (Rule 50).
- 1 audit report (`wave-f-…-hardening-report.md`).
- Validator-gate-map updated.
- 0 TypeScript errors, 0 logic/UI/API drift.
