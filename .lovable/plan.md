

## Diagnosis

User wants `PROJECT_TREE_AUDIT.md` reconciled with verified filesystem reality. Three classes of falsehoods to remove:
1. **Class 1**: Items already resolved by Phase 18 (Electron `_layout.cjs`, OS CI `os-build-iso.yml`) still listed as open in sections F/G/H/I/Appendix.
2. **Class 2**: Fabricated folders the doc claims exist but don't (`src/lib/policies`, `sync`, `sync-engine`, `proof`, `execution`, `eventing`, `notifications`, `services-unclassified`, `unclassified`).
3. **Class 3**: Stale "Biggest Remaining Issues" list referencing the above phantoms.

This is a doc-only reconciliation. Zero code changes. Zero risk to the 21/21 BLOCK gates.

## Verification before edits

Need to confirm during execution:
- Read current `public/generated/PROJECT_TREE_AUDIT.md` in full
- `ls src/lib/` to confirm absence of the 8 phantom folders
- `ls electron/` to confirm `_layout.cjs` exists
- `ls .github/workflows/os-build-iso.yml` to confirm OS CI workflow

## Plan — Doc reconciliation

### Step 1 — Rewrite `public/generated/PROJECT_TREE_AUDIT.md`

**Section A (Biggest Remaining Issues)**:
- Remove #4 (policy/policies dup — only `policy/` exists)
- Remove #6 (Electron flat — resolved Phase 18)
- Reframe #7 mobile as "intentionally archived per `mobile-deferral-attestation` BLOCK gate"
- Renumber

**Section F (Structural Risks)**:
- F1: Soften — `src/lib/` is 91 dirs but verified: no `services-unclassified`, `unclassified`, `proof`, `execution`, `eventing`, `notifications`, `sync`, `sync-engine`, `policies`
- F3: Keep only verified duplicates (`canonical-backend` lib+legacy, `simulation` lib+legacy); drop all fabricated dups
- F5: Mark RESOLVED with link to `electron/_layout.cjs`

**Section G (Open Gaps)**:
- G0.1: Drop fabricated bucket names; keep only "consider `src/services/` extraction" recommendation
- G0.2: Keep only verified `canonical-backend` + `simulation` duplicates
- G1.1: Mark RESOLVED — Phase 18, link to `electron/_layout.cjs` + BLOCK gate
- G3.2: Mark RESOLVED — Phase 18, link to `.github/workflows/os-build-iso.yml`

**Section H (Deployment Readiness table)**:
- Electron runtime: ⚠️ → ✅ Strongly ready
- OS image: ⚠️ → ✅ Strongly ready
- Update overall Verdict line

**Section I (Recommended Next Actions)**:
- Strike Wave 3 step #8 (Electron decompose — superseded)
- Strike Wave 5 step #12 (OS CI — superseded)
- Renumber

**"Specifically Verified Questions" table**:
- Electron answer → "Domain-classified via `_layout.cjs`; flat is Forge convention; BLOCK-gated"
- Biggest-weaknesses list → drop Electron + non-existent duplicates

**Appendix (Numbers At A Glance)**:
- "Electron .cjs files: 15 (14 runtime + 1 domain registry)"
- Add "BLOCK gates passing: 21/21"
- Add "OS CI workflow: nightly + release-publish (`os-build-iso.yml`)"

### Step 2 — Add "Reconciliation Notes" footer
Date-stamped 2026-04-20 section explaining:
- Phase 18 closed Electron flatness + OS CI gaps
- Filesystem re-verification confirmed 8 previously-claimed `src/lib/` duplicates do not exist
- Master aggregator: 21/21 BLOCK gates green

### Step 3 — Mirror to `/mnt/documents/PROJECT_TREE_AUDIT.md`
Identical content so download and in-app viewer stay synchronized.

## What this does NOT touch

- No code, validators, registries, or generated JSON
- No changes to the 21 BLOCK gate count
- No edits to `electron/`, `src/lib/`, `scripts/architecture/`, or any business logic
- No DB, edge function, or auth changes

## Verification after approval

```bash
grep -E "policies|services-unclassified|src/lib/(sync|proof|execution|eventing|notifications)" public/generated/PROJECT_TREE_AUDIT.md   # 0 hits
grep -E "Electron.*flat|OS CI.*missing" public/generated/PROJECT_TREE_AUDIT.md                                                          # 0 hits
diff public/generated/PROJECT_TREE_AUDIT.md /mnt/documents/PROJECT_TREE_AUDIT.md                                                        # identical
npm run release:readiness                                                                                                                # 21/21 BLOCK GREEN (unchanged)
```

