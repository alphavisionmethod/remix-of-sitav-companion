

## Reality check

**Real project: 100% deployment-ready** ✅
- `src/lib/policies/` → **ABSENT** (verified)
- `src/lib/policy/` → **PRESENT** (10 canonical files: actor-registry, approval-map, domain-map, enforcement-map, proof-requirements, reversibility-map, surface-map, trust-thresholds, unified-policy-matrix, index)
- CI gate `scripts/architecture/checks/check-legacy-policies-folder-absence.ts` → **EXISTS** & passes (0 violations / 5,570 files scanned)
- Report `generated/legacy-policies-folder-absence-report.json` → **GREEN** (`ok: true`)

The only outstanding item is **doc sync** — Row #3 in §2 (Phantom-claim corrections) of the audit still reads as open in 6 mirrors (rows 1, 2, 5 already carry RESOLVED stamps; row 3 was missed).

## Plan (default mode — doc sync only)

Patch line 91 (line 90 in `/mnt/documents/` mirrors) of all 6 audit mirrors:

**Files to edit:**
1. `public/generated/MISSING_AUDIT.md` (line 91)
2. `public/generated/MISSING_AUDIT_v2.md` (line 91)
3. `public/generated/artifacts/audits/MISSING_AUDIT.md` (line 91)
4. `public/generated/artifacts/audits/MISSING_AUDIT_v2.md` (line 91)
5. `/mnt/documents/MISSING_AUDIT.md` (line 90)
6. `/mnt/documents/MISSING_AUDIT_v2.md` (line 90)

**Replacement for Row #3:**
> `| 3 | ~~"`src/lib/policies/` exists" (legacy doc)~~ | **RESOLVED 2026-04-20** — verified absent on disk. Canonical home is `src/lib/policy/` (10 files: `policy-actor-registry.ts`, `policy-approval-map.ts`, `policy-domain-map.ts`, `policy-enforcement-map.ts`, `policy-proof-requirements.ts`, `policy-reversibility-map.ts`, `policy-surface-map.ts`, `policy-trust-thresholds.ts`, `unified-policy-matrix.ts`, `index.ts`). Enforced by **CI gate** `scripts/architecture/checks/check-legacy-policies-folder-absence.ts` — asserts (a) legacy folder absent on disk, (b) canonical folder present, (c) zero string-literal references to `lib/policies` across `src/` + `scripts/`. Passes with **0 violations across 5,570 files**. Report: `generated/legacy-policies-folder-absence-report.json`. | RESOLVED |`

No other rows or sections need editing — the §10/Part XIII narratives (line 360, 1273) already correctly state "Verified absent: `src/lib/policies/`".

## Out of scope
- No new code, gates, or generators (already shipped in prior turn)
- No runtime changes
- No edits to `src/lib/policy/` itself

