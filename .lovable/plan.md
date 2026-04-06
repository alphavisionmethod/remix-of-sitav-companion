
# Fix 3 Flagship Loops to 100% — Files, Boardroom, Connected Services

## Current State & Gaps

| Loop | Score | Gap |
|------|-------|-----|
| Files + AI Assist | 72% | FileUploader works but no AI analysis feedback on file content, no "Ask AI about this file" action, file pages don't call brain-core, hardcoded KPIs |
| Boardroom + Summary + Decision | 77% | BoardroomReplay uses all hardcoded slide data, no real data from DB, no decision recording, no session persistence |
| Connected Services + Sync | 67% | ConnectorGovernanceCenter uses hardcoded CONNECTORS array, no calls to connector-discover/transform/batch, Settings integrations tab is static |

## Implementation Plan

### 1. Files + AI Assist — Wire AI to Files Pages (~150 lines changed)

**A. Add "Ask AI" button to FilesOverview classified file rows**
- Edit `src/pages/files/FilesOverview.tsx`
- Import `useAIInsight` from `use-backend-actions`
- Add "Analyze" button on each classified file card that calls `brain-core` with `intent: "file_analysis"` and file metadata as context
- Display AI response inline (classification reasoning, extracted insights, suggested actions)

**B. Wire FilesOverview KPIs to real Supabase data**
- Replace hardcoded `7` obligations and `18` linked workflows with real queries from `file_metadata` table
- Use `useQuery` to count by classification/sensitivity

**C. Wire FilesProcessing to call file-ingestion edge function**
- Edit `src/pages/files/FilesProcessing.tsx`
- Replace the fake `FileIngestionService()` in-memory processing with a display of real `file_metadata` records filtered by `status`
- Show actual classification results from the edge function

**D. Add AI file summary to FilesSearch**
- Edit `src/pages/files/FilesSearch.tsx`
- Add "AI Search" mode that calls `brain-core` with `intent: "file_search"` + query text to get semantic search results

### 2. Boardroom + Summary + Decision — Real Data + Persistence (~200 lines)

**A. Create DB migration for boardroom sessions**
- New table: `boardroom_sessions` (id, user_id, session_type, title, started_at, completed_at, slides_data jsonb, decisions jsonb, status)
- New table: `boardroom_decisions` (id, session_id, user_id, text, status [executed/pending/carried/deferred], advisor, domain, decided_at)
- RLS: users see own sessions/decisions only

**B. Wire BoardroomReplay to real data**
- Edit `src/pages/boardroom/BoardroomReplay.tsx`
- Import `useQuery` + `useMutation` to load/save sessions
- Replace `generateWeeklySlides()` with data pulled from real tables: invoices, leads, bills, household_tasks, approval_queue, cashflow-calculate
- Call `brain-core` for "Advisor Consensus" text on each domain slide (business, finance, concierge)
- Save decisions to `boardroom_decisions` table when user marks items
- Add "Start New Session" and "Save Session" buttons

**C. Create BoardroomHistory page**
- New file: `src/pages/boardroom/BoardroomHistory.tsx`
- List past sessions from `boardroom_sessions` with date, decision count, status
- Click to replay any past session

**D. Add route for BoardroomHistory**
- Add `/boardroom/history` route in App.tsx

### 3. Connected Services + Sync — Wire to Real Edge Functions (~180 lines)

**A. Wire ConnectorGovernanceCenter to real data**
- Edit `src/pages/admin/ConnectorGovernanceCenter.tsx`
- Replace hardcoded `CONNECTORS` array with `useQuery` from `connector_registry` + `connector_accounts` + `connector_configs`
- Add "Discover New" button that calls `connector-discover` edge function (`scan` action)
- Add "Sync Now" button per connector that calls `connector-batch` edge function (`submit` action)
- Show real sync history from `audit_logs` filtered by connector domain

**B. Wire Settings > Integrations tab to real connector data**
- Edit `src/pages/SettingsPage.tsx` (integrations section)
- Replace static connector list with `useQuery` from `connector_registry` joined with `connector_accounts`
- Add connect/disconnect actions that write to `connector_accounts`
- Show real health status from `connector_configs`

**C. Create ConnectorSyncDashboard component**
- New file: `src/components/sita/ConnectorSyncDashboard.tsx`
- Reusable widget showing: last sync time, record counts, error rate, health badge
- Used in ConnectorGovernanceCenter + Settings integrations + MoneySettings

**D. Wire connector-discover results into recommendation loop**
- When `connector-discover` returns recommendations, create entries in `recommendations` table
- Show "Recommended Integrations" section in Settings > Integrations

## Database Migration Required

```sql
-- Boardroom sessions + decisions
CREATE TABLE boardroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type text DEFAULT 'weekly',
  title text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  slides_data jsonb DEFAULT '[]',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE boardroom_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES boardroom_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  decision_text text NOT NULL,
  status text DEFAULT 'pending',
  advisor text,
  domain text,
  decided_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE boardroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boardroom_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sessions" ON boardroom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own decisions" ON boardroom_decisions FOR ALL USING (auth.uid() = user_id);
```

## Files Created

| File | Purpose |
|------|---------|
| `src/pages/boardroom/BoardroomHistory.tsx` | Past session list |
| `src/components/sita/ConnectorSyncDashboard.tsx` | Reusable sync status widget |

## Files Modified

| File | Change |
|------|--------|
| `src/pages/files/FilesOverview.tsx` | AI analyze button, real KPIs |
| `src/pages/files/FilesProcessing.tsx` | Real file_metadata queries |
| `src/pages/files/FilesSearch.tsx` | AI search mode |
| `src/pages/boardroom/BoardroomReplay.tsx` | Real data, brain-core, decision saving |
| `src/pages/admin/ConnectorGovernanceCenter.tsx` | Real connector data, discover/sync buttons |
| `src/pages/SettingsPage.tsx` | Real integrations tab |
| `src/App.tsx` | Add boardroom/history route |

## Result

| Loop | Before | After |
|------|--------|-------|
| Files + AI Assist | 72% | 95%+ (real AI analysis, real KPIs, real processing) |
| Boardroom + Summary + Decision | 77% | 95%+ (real data slides, decision persistence, AI consensus, history) |
| Connected Services + Sync | 67% | 92%+ (real connector data, discover/sync wired, recommendations) |
