# RB-014 — Database Restore Failure

| Field | Value |
|---|---|
| Severity | **critical** |
| Bounded Context | `cloud-control-plane` |
| Subsystem | db |
| Owner | platform |
| Estimated MTTR | 30 min |
| Kill switch | — |
| Message code | `DB-001` |

## Trigger

Restore job fails, or restored DB fails post-restore integrity checks.

## Steps

1. **Identify failed restore job** and error class.
2. **Verify backup artifact integrity** (checksum, signature).
3. **Try previous backup** if the current one is corrupt.
4. **Run RLS and integrity validators** post-restore.
5. **Open critical incident** and preserve all evidence.

## Rollback

If a partial restore corrupts the live DB, fail forward to a known-good snapshot, never roll back into the broken state.

## Evidence

- Restore job logs
- Checksum / signature verification
- Validator output
- Incident report
