# Safe Retirement & Reverse-Dependency Model

> **Status:** Adopted (Wave D §D.3 — Constitution Rule 47, formalizes & strengthens Rule 24)
> **Policy manifest:** `generated/manifests/reverse-dependency-retirement-policy.json`
> **Evidence ledger:** `generated/manifests/safe-change-evidence-ledger.json` (append-only)
> **Generator:** `scripts/architecture/generate/generate-retirement-evidence-proof.ts`
> **Validator (BLOCK):** `scripts/architecture/checks/check-retirement-evidence-completeness.ts`

## Why this exists

Constitution Rule 24 already requires reverse-dependency proof in the
`safe-change-evidence-ledger.json` for any deletion / merge / retirement under
a frozen subtree. Wave D adds:

1. A **machine-readable policy manifest** mapping each frozen subtree to the
   exact evidence kinds that apply.
2. A **proof generator** that produces all five proof artifacts in one command.
3. A **completeness validator** that re-grep at validation time to verify
   reference-zero — catching cases where a path was retired but a stale import
   was reintroduced.

## Five required evidence kinds

| Evidence | Source command | Required for |
|---|---|---|
| `grepProof` | `rg -l <target> src/` | every retirement |
| `manifestProof` | `rg -l <target> generated/manifests/` | every retirement |
| `routeProof` | `rg -l <target> src/routes/ src/App.tsx` | route adapters & pages |
| `testProof` | `rg -l <target> tests/ src/__tests__/` | every retirement |
| `docsProof` | `rg -l <target> docs/ generated/audits/` | every retirement |
| `duplicateReconciliation` | ADR or merge note URL | merge entries only |

Each proof field stores either:
- `"reference-zero"` — the `rg` command returned no hits, OR
- a list of files that legitimately reference the path as a *historical* record
  (e.g. archive ledgers, the safe-change ledger itself, audit reports).

## Hard rules

1. **No file deletion** without `grepProof`, `manifestProof`, `testProof`,
   `docsProof` set to `"reference-zero"` (or an explicit historical-only list).
2. **No file merge** without `duplicateReconciliation` linking to an ADR or
   PR that resolves the conflicting concept.
3. **No folder retirement** without `grepProof = "reference-zero"` over the
   entire folder pattern.
4. **No path removal** of a route adapter without `routeProof = "reference-zero"`
   AND a redirect entry in `src/routes/redirects.ts` (or equivalent).
5. **Re-validation at CI time.** The completeness validator re-runs the grep
   queries; if a retired path is now referenced, CI BLOCKS.
6. **Append-only ledger.** Constitution Rule 24's append-only invariant remains.

## Workflow

```bash
# 1. Generate proof artifacts for a candidate retirement target
npx tsx scripts/architecture/generate/generate-retirement-evidence-proof.ts \
  --target src/components/cards/index.ts \
  --kind delete \
  --owner architecture-governance

# Output: generated/manifests/deletion-merge-evidence-map.json (entry appended)

# 2. Append the entry to safe-change-evidence-ledger.json (manual review)
# 3. Validate completeness (will re-grep at CI time)
npx tsx scripts/architecture/checks/check-retirement-evidence-completeness.ts

# 4. Only after the validator is green: perform the actual deletion in a follow-up PR.
```

## Archive vs delete

- **Archive** (preserve under `archive/<wave>/...`): used for files with
  historical value (legacy mobile, capacitor, retired profile artifacts).
  Requires `archiveProof` in the ledger entry.
- **Delete** (remove from working tree): used for shims and dead code.
  Requires all five proof fields to be `reference-zero`.

## Relationship to existing rules

- **Strengthens** Constitution Rule 24 (Safe-Change Law) — Rule 24 stated
  *what* must exist; Rule 47 specifies *how* to produce it and adds
  re-validation at CI time.
- **Complements** Rule 23 (Exception ratchet) and Rule 113 (Deprecated shim baseline).
- **Required by** any future Wave that physically retires baselined paths
  (admin page bodies, page semantic violations, page-backend bypass, etc.).