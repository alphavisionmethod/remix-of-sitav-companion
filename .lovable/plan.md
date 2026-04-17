

The user wants me to update the audit/truth files (SITA_MASTER_AUDIT.md, FULL_ISSUES_AND_FIXES.md, PROJECT_TREE.md, SITA_OS_Feature_Checklist.md, SITA_FULL_FILE_CLASSIFICATION.md) to reflect the current state after the recent ISS-020 cleanup and the stubs/placeholders audit register.

Let me check what's actually current.

I need to:
1. Re-verify live counts (TS files, pages, components, edge functions, DB tables, RLS coverage)
2. Re-run the stubs/placeholders scanner to get fresh numbers
3. Re-run the `as any` count in pages (should be 0)
4. Re-check Phase 32 "It's Real" gate verdict
5. Update each doc with the new truth + cross-link to `STUBS_AND_PLACEHOLDERS_REGISTER.md`

## Plan — Refresh All Audit Documents to Current Truth

### Inputs (re-verify in execute mode)

| Source | Command |
|---|---|
| TS files | `find src/ -name '*.ts' -o -name '*.tsx' \| wc -l` |
| Total pages | `find src/pages -name '*.tsx' \| wc -l` |
| Components | `find src/components -name '*.tsx' \| wc -l` |
| Edge functions | `ls supabase/functions \| wc -l` |
| DB tables / policies | `supabase--read_query` against `information_schema` |
| `as any` in pages | `grep -rE "\bas any\b" src/pages \| wc -l` (target: 0) |
| Stubs register | re-run `audit-stubs-placeholders.ts` |
| Phase 32 verdict | read `generated/its-real-gate-report.json` |

### Files to update

1. **`generated/SITA_MASTER_AUDIT.md` → v6.1**
   - Refresh Part I topology table with live counts
   - Add ISS-020 RESOLVED entry with date
   - Add new "Stubs & Placeholders Sweep" section citing the 76-hit register (P0:5, P1:0, P2:12, P3:30, P4:29)
   - Update Truth Score if metrics moved

2. **`generated/FULL_ISSUES_AND_FIXES.md` → v2.2**
   - Confirm ISS-020 / OPN-P2-04 already marked RESOLVED
   - Add new entries for the 5 P0 stub hits as `OPN-P0-NN` (one per actionable hit)
   - Add 12 P2 stub hits as `OPN-P2-NN`
   - Cross-link to `STUBS_AND_PLACEHOLDERS_REGISTER.md`
   - Refresh resolution rate

3. **`generated/PROJECT_TREE.md`**
   - Refresh file/page/component/table counts
   - Add `scripts/architecture/audits/audit-stubs-placeholders.ts` to script inventory
   - Add `STUBS_AND_PLACEHOLDERS_REGISTER.md` to generated artifacts inventory

4. **`generated/SITA_OS_Feature_Checklist.md`**
   - Mark ISS-020 / type-safety item as ✅ RESOLVED
   - Add "Stubs & Placeholders Audit" as a new tracked item (status: AUDITED, remediation pending per slice)

5. **`generated/SITA_FULL_FILE_CLASSIFICATION.md`**
   - Refresh file count to current live number
   - Note the 76 files flagged in the stubs register with their classification tier

### Guardrails

- **No source code changes** in this batch — docs only
- **No invented numbers** — every metric re-verified against live filesystem / DB before writing
- **Truth-only** — outstanding gaps stay open; resolved items get a one-line resolution note with date, no celebration log
- Phase 32 verdict cited verbatim from `its-real-gate-report.json`

### Acceptance

| Check | Target |
|---|---|
| All 5 docs reflect live counts | ✅ |
| ISS-020 marked RESOLVED across all docs | ✅ |
| Stubs register cross-linked from MASTER + ISSUES | ✅ |
| No metric appears without a verification command or source path | ✅ |
| Phase 32 verdict re-cited from latest report | ✅ |

