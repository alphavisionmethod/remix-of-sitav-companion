

Looking at C-004 and C-006, I need to verify the actual current state of file upload wiring and flagship loop proof before planning. The visible files already show a real `useFileUpload` hook calling `supabase.storage.from("user-files")`, and `FileUploadZone` using it. Let me check what's actually missing.
<lov-plan>

Let me explore.
<lov-tool-use id="toolu_vrtx_01BJQgcHnWck5iz2WKqHjDRu" name="code--search_files" integration-id="code" data="{\"query\": \"useFileUpload|FileUploadZone\", \"include_patterns\": \"src/pages/files/**\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_019jvSswBAtcHYiovp72xZiA" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/pages/files\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01DE7jrWgP2L2Zz77DkeUKDr" name="code--search_files" integration-id="code" data="{\"query\": \"flagship_loop_completions|recordFlagshipLoop|flagship-loop\", \"include_patterns\": \"src/**/*.ts,src/**/*.tsx,supabase/functions/**\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01Wo1vBYANcNrSDBKjuDK8JV" name="code--list_dir" integration-id="code" data="{\"dir_path\": \"src/pages/files\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01F4GWKih3cBdATXjoQbdTqw" name="code--search_files" integration-id="code" data="{\"query\": \"FileUploadZone|useFileUpload\", \"include_patterns\": \"src/pages/files/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_018MejGvVhntgbWFfajhbGaS" name="code--search_files" integration-id="code" data="{\"query\": \"flagship_loop_completions|recordFlagshipLoop\", \"include_patterns\": \"src/**/*.ts,src/**/*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01S1kBHeYcjASW1eXmsCakA7" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/files/FilesAll.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01BgAL5yH8yTdtX1eipDDf3f" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/files/FilesOverview.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01WdrQDLaGTKkDBEBpwVFLmR" name="code--view" integration-id="code" data="{\"file_path\": \"src/hooks/use-flagship-loop-proof.ts\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01EdMxJP4cdFBqycK6yPMHYn" name="code--view" integration-id="code" data="{\"file_path\": \"src/components/sita/FileUploader.tsx\"}">
</lov-tool-use>
Both audit findings are already largely resolved. Let me check the `file-ingestion` edge function and `useAllFiles`/`useFilesOverview` to understand if there's an actual gap, plus check any remaining "mock/demo" usage.
<lov-tool-use id="toolu_vrtx_018np6mZrMx2qo8Ad2rYxDAR" name="code--search_files" integration-id="code" data="{\"include_patterns\": \"supabase/functions/file-ingestion/**\", \"query\": \"storage_path|file_metadata\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_012DwgeEhA5nCp48qb666x66" name="code--search_files" integration-id="code" data="{\"include_patterns\": \"src/hooks/use-domain-data.ts,src/hooks/use-domain-data/**\", \"query\": \"useAllFiles|useFilesOverview|file_metadata\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01FNRdBDeBU9SaipXGkdCdP5" name="code--search_files" integration-id="code" data="{\"include_patterns\": \"src/**/*.tsx,src/**/*.ts\", \"query\": \"isDemoMode = true\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01Mtk1LDg1A3TvmuGSajnng4" name="code--exec" integration-id="code" data="{\"command\": \"ls supabase/functions/ | grep -i file\", \"user_facing_description\": \"Check which file-related edge functions exist\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01SiyJdSzckcAGzddndeMZZW" name="code--search_files" integration-id="code" data="{\"include_patterns\": \"src/hooks/use-domain-data.ts\", \"query\": \"fetchAllFiles|fetchFilesOverview\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01VWgpzkTACV3V8GZ8MaMK5r" name="code--search_files" integration-id="code" data="{\"include_patterns\": \"src/lib/services/domain-data/files.ts,src/lib/services/domain-data/**\", \"query\": \"fetchAllFiles|fetchFilesOverview\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_011st61ow5ENb3GeRF9ycizp" name="code--exec" integration-id="code" data="{\"command\": \"find src/lib -name \\\"files-data-service*\\\" 2>/dev/null\", \"user_facing_description\": \"Locate files data service\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01J9WdDN6i54TzRkU1tU9wTX" name="code--view" integration-id="code" data="{\"file_path\": \"src/lib/data-services/files-data-service.ts\"}">
</lov-tool-use>
Now I have a complete picture. The audit findings (C-004, C-006) describe issues that are **already mostly resolved** in the code:

- **C-006**: `FileUploader` already uploads to `user-files` bucket with proper RLS path, calls `file-ingestion`, persists to `file_metadata`, generates signed URLs. ✅ Wired.
- **C-004**: `useLoopEmitter` already fires real receipts on file upload + AI classify into `flagship_loop_completions`. ✅ Wired.

The remaining **real** gaps are:
1. `FilesOverview` has hardcoded `const isDemoMode = true` — banner permanently shows "demo" even when real data is loaded.
2. `fetchFilesOverview` falls back to `MOCK_FILES_OVERVIEW` when DB returns 0 rows — this masks real "empty" state and is the literal "demo data" the audit calls out.
3. No emitter for the other 4 flagship loops on actual entry points (sign-in, boardroom view, sync, approval).
4. No automated test that proves end-to-end: upload → storage → DB → display → receipt.

<lov-plan>

## Plan: Close C-004 + C-006 (real, no stubs, deployment-ready)

### Findings from exploration
The audit fix snippets are already implemented:
- `FileUploader` uploads to `user-files` with `${user.id}/...` path, calls `file-ingestion`, generates signed URL, emits `flagship_loop_completions` for `file_upload` + `ai_classify`. ✅
- `file-ingestion` edge function persists to `file_metadata`. ✅
- `useFlagshipLoopProofs` reads real receipts. ✅

### Real remaining gaps

**Gap 1 — `FilesOverview` shows "demo" forever**
`const isDemoMode = true` is hardcoded → `PageTruthBanner` always shows demo state even when the user has real uploaded files.

**Gap 2 — `fetchFilesOverview` returns mock when empty**
`fetchFilesOverview` and `fetchFilesProcessing` fall back to `MOCK_FILES_OVERVIEW` / `MOCK_FILES_PROCESSING` when the DB returns 0 rows. This is the actual "demo/mock file data" the audit complains about — empty state should be honest, not faked.

**Gap 3 — Other 4 flagship loops not emitted at real entry points**
Only `files-ai-assist` is emitted. Need real emissions on:
- `sign-in-dashboard-pulse` → emit `sign_in` on auth success, `pulse_view` on Pulse mount
- `boardroom-summary-decision` → emit `boardroom_summary` on Boardroom mount
- `connected-services-sync` → emit `sync_run` on connector sync completion
- `admin-truth-recommendation-approval` → emit `approval_decision` on approval queue decide

**Gap 4 — No proven E2E test**
Add Playwright test that signs in → uploads a real file → asserts row in `file_metadata` + receipt in `flagship_loop_completions` + file appears in `FilesAll`.

### Changes (concise, surgical)

**Edit `src/lib/data-services/files-data-service.ts`**
- Remove mock fallback when authenticated user returns 0 rows. Return `[]` so UI shows real empty state. Keep mocks only for the unauthenticated/demo path.

**Edit `src/pages/files/FilesOverview.tsx`**
- Replace `const isDemoMode = true` with derived state: `isDemoMode = !user || (realKpis?.total === 0 && classifiedFiles.length === 0)`.
- Pass that to `<PageTruthBanner truthState={isDemoMode ? "demo" : "live"} />`.

**Edit `src/contexts/AuthContext.tsx`** (small addition)
- After successful sign-in, fire `emitLoopCompletion({ loop_key: "sign-in-dashboard-pulse", step_key: "sign_in" })`. Fire-and-forget, never blocks.

**Edit `src/pages/DailyPulse.tsx`** (or Pulse mount)
- On mount with authenticated user, emit `pulse_view`.

**Edit `src/pages/GlobalBoardroom.tsx`**
- On mount with data loaded, emit `boardroom_summary`.

**Edit connector sync hook (`src/hooks/use-connector-sync.ts` or equivalent)**
- After successful sync run, emit `sync_run` with evidence `{ connector, items_synced }`.

**Edit `src/pages/ApprovalChamber.tsx`** (approve/reject handler)
- On decision, emit `approval_decision` with evidence `{ recommendation_id, decision }`.

**New test `tests/e2e/customer-journey/files/files-upload-real-roundtrip.spec.ts`**
- Login → navigate `/files/all` → upload real PDF blob → assert toast "classified" → assert file row appears in list → assert `flagship_loop_completions` has `loop_key=files-ai-assist, step_key=file_upload, outcome=success` for the user (via authenticated supabase query).

**New test `src/__tests__/files-data-service.test.ts`**
- Asserts `fetchAllFiles` returns `[]` (not mocks) when user is authenticated and has zero rows.

### Files (count)
- Edited: 6 (`files-data-service.ts`, `FilesOverview.tsx`, `AuthContext.tsx`, `DailyPulse.tsx`, `GlobalBoardroom.tsx`, `ApprovalChamber.tsx` + 1 sync hook)
- New: 2 tests

### Acceptance
- Authenticated user with 0 files sees real empty state, banner shows "live" (not "demo")
- Uploading a file: appears in `user-files/<uid>/`, row in `file_metadata`, receipt in `flagship_loop_completions`, banner stays "live", file visible in `FilesAll`
- All 5 flagship loops accumulate receipts during real navigation; `useLoopProofsSummary` returns `proven=true` for each
- E2E test passes against live Supabase
- 0 TypeScript errors; existing CI gates (it's-real-gate, golden-path-coverage) stay green

