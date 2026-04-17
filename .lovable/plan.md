

## Fix C-006: File Upload Not Wired to Storage Bucket — what's actually broken

### Live findings (much worse than the brief suggests)

I queried the live database and inspected the code. The brief understates the problem. There are **3 cascading bugs** that combine to silently break the entire FilesAll/Overview pipeline:

1. 🔴 **`FileUploader.tsx` uploads to a bucket that doesn't exist.** Line 54: `supabase.storage.from("documents").upload(...)`. The actual bucket is `user-files`. Every upload fails immediately with a 404. Verified: `SELECT id FROM storage.buckets` returns only `user-files`.

2. 🔴 **The entire `file_metadata` table doesn't exist.** Verified: `SELECT EXISTS (… table_name='file_metadata')` returns **false**. Yet `files-data-service.ts` (lines 14, 22, 30, 38, 46, 54), `file-ingestion` edge function (line 132), `FilesOverview.tsx` (line 42), and the FilesAll hook all read/write `file_metadata`. Every query returns `error` and fallback mock data is shown — explaining why the page "looks fine" but is 100% mock.

3. 🔴 **Two parallel, incompatible file systems coexist.** The Explorer page (`FilesExplorer.tsx`) uses `cloud_files` (real, exists, has data flow via `file-explorer-service.ts`). FilesAll/Overview/Processing use the broken `file_metadata` path. They never see each other's files.

4. ✅ Bucket `user-files` exists, is private, has correct RLS policies (`auth.uid()::text = (storage.foldername(name))[1]` pattern via 4 policies for SELECT/INSERT/UPDATE/DELETE).
5. ✅ `cloud_files` table exists with proper schema and is wired correctly in the Explorer.
6. ✅ `file-ingestion` edge function logic (AI classification + notification) is sound — it just writes to a non-existent table.

### The fix (one migration + 3 surgical code edits)

#### 1. Migration — create `file_metadata` table with RLS

A single new SQL migration that creates the missing table the entire `file_metadata` pipeline depends on:

```sql
CREATE TABLE public.file_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  filename text NOT NULL,
  mime_type text,
  size_bytes bigint,
  classification text DEFAULT 'general',
  sensitivity text DEFAULT 'internal',
  status text DEFAULT 'classified',
  extracted_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_file_metadata_user ON public.file_metadata(user_id, created_at DESC);
CREATE INDEX idx_file_metadata_status ON public.file_metadata(user_id, status);

ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

-- 4 policies: SELECT/INSERT/UPDATE/DELETE, all `auth.uid() = user_id`, TO authenticated
-- Plus admin override via has_role(auth.uid(),'admin')

CREATE TRIGGER file_metadata_updated_at
BEFORE UPDATE ON public.file_metadata
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

Also create `file_settings` (referenced at `files-data-service.ts:68/76`, also missing — same pattern, simpler shape: `user_id, settings jsonb, created_at, updated_at`).

#### 2. `src/components/sita/FileUploader.tsx` — fix bucket name

Change line 54 from `.from("documents")` to `.from("user-files")`. One-line bugfix that turns every upload from a guaranteed 404 into a successful upload that lands in the correct, RLS-protected bucket under `<user-id>/...`.

#### 3. `src/components/sita/FileUploader.tsx` — surface real signed-URL after upload

After the edge function returns metadata, call `supabase.storage.from("user-files").createSignedUrl(storagePath, 3600)` and store it on the local `UploadedFile` so the user can immediately preview/download. Also expose a small "Open" link next to the green checkmark when `status === "done"`.

#### 4. `src/pages/files/FilesAll.tsx` — invalidate query on upload completion

The page reads `useAllFiles()` (cached query key `["all-files"]`) but never refreshes after upload. Add a `useQueryClient().invalidateQueries({ queryKey: ["all-files"] })` and `["files-overview"]` and `["file-kpis"]` invalidation when `FileUploader` reports a successful upload. Done by:
- Add an optional `onUploaded?: (entry) => void` callback prop to `FileUploader`.
- In `FilesAll.tsx` and `FilesOverview.tsx`, pass an `onUploaded` that invalidates the relevant query keys.

This makes the user-visible loop **real**: upload → file appears in storage → metadata row inserted → FilesAll list refreshes → KPI tiles update → notification toasts (already wired via C-005 fix).

### Verification (post-deploy)

1. `SELECT EXISTS (… table_name='file_metadata')` returns `true`.
2. As a logged-in user, drop a PDF on the `FileUploader` zone in `/files/all`:
   - `SELECT * FROM storage.objects WHERE bucket_id='user-files' AND name LIKE '<my-uid>/%'` shows the new object.
   - `SELECT * FROM file_metadata WHERE user_id='<my-uid>' ORDER BY created_at DESC LIMIT 1` shows the new row with `classification`, `sensitivity` populated.
   - The file appears in the FilesAll list **without manual refresh**.
   - A toast "File classified: …" appears (via realtime notifications fix from C-005).
3. The "Open" link on the upload card returns a working signed URL.
4. Flagship-loop receipts (`flagship_loop_completions` from C-004) show new `file_upload` and `ai_classify` step rows for the user.

### Files

| File | Change |
|---|---|
| `supabase/migrations/<new>.sql` | NEW — create `file_metadata` + `file_settings` tables, indexes, RLS, updated_at trigger |
| `src/components/sita/FileUploader.tsx` | Fix bucket name `documents` → `user-files`; add signed-URL fetch + Open link; add `onUploaded` callback |
| `src/pages/files/FilesAll.tsx` | Pass `onUploaded` that invalidates `["all-files"]` |
| `src/pages/files/FilesOverview.tsx` | Pass `onUploaded` that invalidates `["files-overview"]` and `["file-kpis", user.id]` |

### Acceptance

- Uploads land in the correct, RLS-protected `user-files` bucket
- Metadata row is persisted in `file_metadata` (no more silent fallback to mocks)
- FilesAll, FilesOverview, FilesProcessing, FilesSearch all show real user files
- Upload → AI classify → notification → list refresh loop is end-to-end real
- Existing `cloud_files`-based Explorer continues to work unchanged (no regression)
- C-006 moves 🟡 PARTIAL → ✅ RESOLVED, deployment-ready

