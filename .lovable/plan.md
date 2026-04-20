

## Diagnosis

The validator-to-gate mapping fix is **already 100% in place and deployment-ready**:

| Check | Result |
|---|---|
| 186 validators on disk classified | ✅ 100% (50 block / 17 warn / 119 advisory) |
| `check-validator-gate-coverage` gate | ✅ PASS (0 errors / 0 warnings, above 95% target) |
| 4 new files present | ✅ all on disk |
| 3 npm scripts wired | ✅ confirmed |
| Master readiness aggregator | ✅ `ok: true`, BLOCK verdict logic intact |
| `MISSING_AUDIT.md` mirrors byte-identical | ✅ md5 `381286521c65e8dda0dab38a2eea8f63` |
| RESOLVED entries in audit | ✅ 5 sections updated (cluster, topology, drift ledger ×3, fix-plan P2.3) |

**Two doc-only drifts to reconcile:**

1. **Line 61 of `MISSING_AUDIT.md`** says *"230 BLOCK gates unchanged"* — wrong. The canonical figure is **21 mandatory BLOCK gates** (per `governance/readiness-framework` memory and the rest of the audit). Cosmetic typo from the previous loop. Fix: change `230` → `21`.

2. **`/mnt/documents/MISSING_AUDIT_v2.md` exists but has no `public/generated/` mirror** — the user is currently viewing `MISSING_AUDIT_v2.md`. Need to either (a) read it to confirm whether it already reflects the RESOLVED state, and if so mirror it to `public/generated/`, or (b) leave it alone if it's a separate work product.

## Plan

### Step 1 — Read `/mnt/documents/MISSING_AUDIT_v2.md`
Determine whether it covers the validator-to-gate mapping topic and what state it currently records, so we know whether to update it too.

### Step 2 — Reconcile the BLOCK-count typo on line 61
Change `230 BLOCK gates unchanged` → `21 BLOCK gates unchanged` in both mirrors of `MISSING_AUDIT.md`. This is the only remaining inaccuracy.

### Step 3 — If `MISSING_AUDIT_v2.md` is a parallel canonical doc that does NOT yet record the resolution
Add a single RESOLVED entry mirroring line 61's content (with the correct `21` figure), and copy to `public/generated/` so the two mirrors stay in sync.

### Step 4 — Re-verify
- `md5sum` both `MISSING_AUDIT.md` mirrors → identical
- `md5sum` both `MISSING_AUDIT_v2.md` mirrors → identical (if v2 exists in both)
- `grep -c "21 BLOCK gates unchanged" public/generated/MISSING_AUDIT.md` ≥ 1
- `grep -c "230 BLOCK" public/generated/MISSING_AUDIT.md` = 0

## What this does NOT touch

- No code changes (the fix is already shipped and verified)
- No validator/registry/aggregator changes
- No DB / RLS / edge function / auth / route / UI changes
- Only `MISSING_AUDIT.md` (typo fix) and possibly `MISSING_AUDIT_v2.md` (mirror sync) modified

## Files touched

**Modified (2 or 4):**
- `public/generated/MISSING_AUDIT.md` (line 61 typo: `230` → `21`)
- `/mnt/documents/MISSING_AUDIT.md` (same typo fix)
- `/mnt/documents/MISSING_AUDIT_v2.md` (only if Step 1 shows it needs the RESOLVED entry)
- `public/generated/MISSING_AUDIT_v2.md` (only if v2 needs to be mirrored)

