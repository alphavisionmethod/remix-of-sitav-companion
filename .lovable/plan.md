

# Implement 3 Flagship Loops to 100% — Files + AI, Boardroom, Connected Services

## Database Migration Required

Create two new tables:

```sql
CREATE TABLE boardroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type text DEFAULT 'weekly',
  title text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  slides_data jsonb DEFAULT '[]',
  summary_text text,
  confidence_score integer,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE boardroom_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES boardroom_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  decision_text text NOT NULL,
  status text DEFAULT 'pending',
  advisor text,
  domain text,
  decided_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- RLS + trigger
ALTER TABLE boardroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE boardroom_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON boardroom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own decisions" ON boardroom_decisions FOR ALL USING (auth.uid() = user_id);
CREATE TRIGGER set_boardroom_sessions_updated_at BEFORE UPDATE ON boardroom_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Loop 1: Files + AI Assist (72% → 95%)

### FilesOverview.tsx — Add AI + Real Data
- Import `useAIInsight` from `use-backend-actions` and `useQuery` from tanstack
- Query `file_metadata` table for real classified files (replace demo array)
- Add "Analyze" button on each file card calling `brain-core` with `intent: "file_analysis"`
- Display AI recommendation inline when returned
- Replace hardcoded KPIs (obligations, linked) with real counts from `file_metadata`

### FilesProcessing.tsx — Real Processing Queue
- Replace fake `FileIngestionService()` with query to `file_metadata` filtered by status
- Show actual files in processing vs completed based on `status` column

### FilesSearch.tsx — AI Search Mode
- Add "AI Search" button calling `brain-core` with `intent: "file_search"` + query text

## Loop 2: Boardroom + Summary + Decision (77% → 95%)

### BoardroomReplay.tsx — Real Data + Persistence
- Replace `generateWeeklySlides()` hardcoded data with real queries:
  - Business slide: query `invoices`, `leads`, `opportunities`
  - Finance slide: call `cashflow-calculate` edge function
  - Concierge slide: query `household_tasks`, `family_events`
  - Decisions slide: query `approval_queue`
- Call `brain-core` for "Advisor Consensus" text per domain
- Add "Save Session" button writing to `boardroom_sessions`
- Add decision status toggles writing to `boardroom_decisions`

### BoardroomHistory.tsx — New Page
- Query `boardroom_sessions` ordered by date
- Show decision count, confidence score, status per session
- Click to navigate to replay with session data

### App.tsx — Add Route
- Add `/boardroom/history` → `BoardroomHistory`

## Loop 3: Connected Services + Sync (67% → 92%)

### ConnectorGovernanceCenter.tsx — Real Connector Data
- Replace hardcoded `CONNECTORS` array with queries to `connector_registry` + `connector_accounts` + `connector_configs`
- Add "Discover New" button calling `connector-discover` edge function (scan action)
- Add "Sync Now" button per connector calling `connector-batch` (submit action)
- Show real sync history from `audit_logs`

### ConnectorSyncDashboard.tsx — Reusable Widget
- Shows: last sync time, record counts, error rate, health badge
- Used in ConnectorGovernanceCenter + Settings integrations

### SettingsPage.tsx (integrations section)
- Replace static connector list with `connector_registry` + `connector_accounts` query
- Show real connection status and health

## Files Created
| File | Lines |
|------|-------|
| `src/pages/boardroom/BoardroomHistory.tsx` | ~120 |
| `src/components/sita/ConnectorSyncDashboard.tsx` | ~80 |

## Files Modified
| File | Change |
|------|--------|
| `src/pages/files/FilesOverview.tsx` | AI analyze buttons, real file_metadata KPIs |
| `src/pages/files/FilesProcessing.tsx` | Real processing queue from DB |
| `src/pages/files/FilesSearch.tsx` | AI search mode |
| `src/pages/boardroom/BoardroomReplay.tsx` | Real data slides, decision persistence, AI consensus |
| `src/pages/admin/ConnectorGovernanceCenter.tsx` | Real connector data, discover/sync buttons |
| `src/pages/SettingsPage.tsx` | Real integrations section |
| `src/App.tsx` | Add boardroom/history route |

## Result
| Loop | Before | After |
|------|--------|-------|
| Files + AI Assist | 72% | 95%+ |
| Boardroom + Summary + Decision | 77% | 95%+ |
| Connected Services + Sync | 67% | 92%+ |
