# Platform Subclassification Hardening (Wave 0.5)

## Problem (audited, not assumed)

`src/platform/` currently contains **53 top-level folders** with no second-level structure. Concrete evidence:

- `src/platform/admin/` (151 files: command palettes, sub-navs, shells) is operator/admin UI, and `src/admin/components/index.ts` already re-exports from it — formalizing the blurred boundary.
- `src/platform/sita/` (551 files), `personal-brain/` (82), `orchestration/` (57), `nova-sdk/` (56) live as flat siblings with `tenant/` (1 file), `registry/` (1 file), `eventing/` (1 file).
- Constitution Rule 92 lists platform systems as a flat enumeration. No subclass model exists in code, docs, or manifests.
- `check-platform-anti-patterns.ts` and `check-platform-readiness.ts` are referenced in `generated/validator-gate-map.json` but **do not exist on disk** — orphaned advisory entries.

## Approach: classification first, no destabilizing moves

The Wave 10 attestation (Rule 19) is sealed and gates CI. Wave 0 foundation (Rules 21–26) was just installed. Safe path:

1. **Encode the taxonomy as a manifest and validator** — no file moves, so Wave-10 digests stay unchanged, no imports/routes/tests break.
2. **Classify every existing `src/platform/<X>/` folder** with `keep` / `relocate-future` / `split-future` decisions.
3. **Wire the validator into the foundation tier** so future PRs cannot add unclassified folders, and cross-subclass imports are statically checked.
4. **Document a follow-up Platform Relocation Wave** that runs under Rule 24 (safe-change evidence) + Rule 19 (re-seal). Path moves are explicitly out of scope.

## Six canonical platform subclasses (derived from real folder set)

| Subclass | Members |
|---|---|
| `product-infrastructure` | `files`, `workspace`, `notifications`, `app-platform`, `apps`, `search`, `marketing`, `cloud`, `settings`, `setup`, `personal-brain`, `experience`, `design-system` |
| `governance` | `trust`, `security`, `governance`, `contracts`, `proof`, `truth`, `verification` |
| `operator-control` | `admin` *(relocate-future → `src/admin/`)*, `owner`, `mission-control`, `atlas`, `support`, `observability`, `operations`, `sita` *(split-future)* |
| `identity-and-tenant` | `auth`, `tenant`, `enterprise` |
| `intelligence` | `ai`, `intelligence`, `knowledge`, `advisors`, `boardroom`, `product` |
| `runtime-bridges` | `runtime`, `registry`, `integration`, `orchestration`, `core-services`, `eventing`, `execution`, `sync-engine`, `nova-sdk`, `topology`, `architecture`, `capabilities`, `ci`, `deploy`, `migration`, `fip`, `control-plane` |

Allowed dependency directions (encoded in validator):
- `runtime-bridges` → only `governance`, `identity-and-tenant` (lowest layer).
- `identity-and-tenant` → `governance`, `runtime-bridges`.
- `governance` → `identity-and-tenant`, `runtime-bridges`.
- `intelligence` → `governance`, `identity-and-tenant`, `runtime-bridges`.
- `product-infrastructure` → all except `operator-control`.
- `operator-control` → all (consumer surface).

Universal rule retained: no platform subclass may import from `src/modules/<pillar>/**`.

## Files to create or change

**Manifests:**
- Create `generated/manifests/platform-subclassification-map.json` (53 entries).
- Create `scripts/manifests/generate/generate-platform-subclassification-map.ts`.
- Update `scripts/manifests/generate/generate-foundation-manifest-index.ts` to register the new manifest as the 15th entry under Rule 26.

**Validators:**
- Create `scripts/architecture/check-platform-subclassification.ts` — strict mode for missing classifications + cross-subclass import violations; advisory warnings for `src/admin` ↔ `src/platform/admin` re-exports.
- Create `scripts/architecture/checks/check-platform-anti-patterns.ts` — thin wrapper that delegates to the new check (revives the orphaned gate-map entry).

**CI wiring:**
- Update `generated/manifests/foundation-tier-validator-set.json` — add new validator with `class: "block"`.
- Update `.github/workflows/foundation-gate.yml` — add new validator as REQUIRED step.
- Re-emit `generated/validator-gate-map.json` so `check-platform-anti-patterns` becomes `block` and `check-platform-subclassification` is registered.

**Constitution + docs:**
- Update `docs/architecture/REPOSITORY_CONSTITUTION.md`: add **Rule 27 — Platform Subclassification (BLOCKING)** and **Rule 28 — Platform vs Admin Boundary (Wave-bound)**. Replace the flat platform enumeration with a pointer to the new model doc.
- Create `docs/architecture/PLATFORM_SUBCLASSIFICATION_MODEL.md` — six subclasses, allowed/forbidden imports, every current folder classified, Platform-vs-Admin boundary, future Relocation Wave plan.
- Update `src/platform/MANIFEST.md` — replace flat list with subclass grouping + pointer to new doc.

**Audit report:**
- Create `generated/audits/platform-subclassification-hardening-report.md`.
- Update `generated/audits/repository-canonicalization-baseline.json` with `platformSubclassificationInstalled: true`.

## What is explicitly NOT in this pass

- **No file moves.** Wave-10 attestation does not need re-sealing.
- **No barrel changes** in `src/admin/components/index.ts` — advisory warnings only.
- **The Platform Relocation Wave** (moving `src/platform/admin/**` → `src/admin/**`, splitting `src/platform/sita/**`, etc.) is documented as a separate future request with prerequisite Rule 24 evidence and Rule 19 re-seal steps.

## Verification before finishing

1. New generator produces 53 classified entries, zero unclassified.
2. New validator exits 0 in strict mode (no cross-subclass import violations).
3. `check-foundation-manifest-freshness.ts` passes with 15th manifest.
4. `wave-10-check-attestation.ts` still passes (no file moves).
5. `npx tsc --noEmit` clean.
6. `npx vite build` succeeds.

## Why this is the right scope

- Directly answers the prompt: `src/platform/` stops being a flat broad bucket; every folder has a constitutionally-binding subclass with enforced dependency rules.
- Avoids prohibitions: no duplicate taxonomy systems, no broken imports/routes/tests, no decorative subclasses, reuses Wave-0 foundation.
- Respects the Wave-10 seal: no digest changes, deployment readiness preserved.
- Sets up the follow-up Relocation Wave with an exact manifest of moves and evidence requirements, all already encoded in repo.