

## Diagnosis

The user is viewing the Files panel and has `PROJECT_TREE_AUDIT.md` open, but cannot see/preview it. The document exists at `public/generated/PROJECT_TREE_AUDIT.md` (verified — I just read it; 102 lines, valid markdown, last updated 2026-04-19).

The most likely cause: the file was last reconciled inside `public/generated/` but the **`/mnt/documents/` mirror was never written** in the previous turn. The Files panel surfaces artifacts from `/mnt/documents/`. Without that mirror, the in-app preview has nothing to render even though the canonical source exists.

Secondary possibility: a stale or empty mirror is shadowing the good source.

## Fix Plan (doc-only, zero code risk)

### Step 1 — Republish the audit to the artifacts surface

Copy the verified canonical `public/generated/PROJECT_TREE_AUDIT.md` to `/mnt/documents/PROJECT_TREE_AUDIT.md` so the Files panel can render it.

### Step 2 — Emit the artifact tag

Output a `<lov-artifact>` tag pointing to `PROJECT_TREE_AUDIT.md` with `text/markdown` MIME type. This is what makes the document show up as a previewable/downloadable artifact in the user's Files view.

### Step 3 — Verify content integrity

Confirm the file written to `/mnt/documents/` is byte-identical to `public/generated/PROJECT_TREE_AUDIT.md` (102 lines, Phase 18 reconciled, 21/21 BLOCK gates green).

## What this does NOT change

- No edits to the audit content (already accurate per Phase 18 reconciliation)
- No code changes
- No validator changes
- No new files beyond the mirror copy

## Verification

After the mirror write, the user reloads the Files panel and `PROJECT_TREE_AUDIT.md` renders with the full Phase 18 reconciled content, including the 21/21 BLOCK gate confirmation and the appendix metrics.

