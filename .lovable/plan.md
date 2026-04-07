

# Get Connected Services + Sync (67%) and Admin Truth + Recommendation (90%) to 100%

## Analysis

**Connected Services + Sync (67%)** — Three gaps remain:
1. **Sync History tab is hardcoded** — `SYNC_HISTORY` array on line 57 of `ConnectorGovernanceCenter.tsx` is static demo data, never queries `audit_logs`
2. **ConnectorHub.tsx doesn't use edge functions** — has DB queries but no "Sync Now" or "Discover" button wiring to `connector-batch`/`connector-discover`
3. **No real-time sync status updates** — no polling/refetch after sync triggers

**Admin Truth + Recommendation (90%)** — Two gaps:
1. **AIT06 Recommendations lack AI generation** — shows DB-stored recommendations but never calls `brain-core` to generate new ones
2. **Truth Index lacks "Generate Recommendations" action** — the truth dashboard shows scores but has no button to trigger AI analysis of low-scoring areas and auto-create recommendations

## Implementation Plan

### 1. Wire Sync History to `audit_logs` table
**Edit: `src/pages/admin/ConnectorGovernanceCenter.tsx`**
- Replace hardcoded `SYNC_HISTORY` array with a `useQuery` that fetches from `audit_logs` where `category = 'connector'` or `action LIKE 'sync%'`
- Show real connector, time, status, records, duration from the audit log entries
- Add auto-refetch after sync triggers (invalidate query on sync success)

### 2. Wire ConnectorHub with edge function actions
**Edit: `src/pages/ConnectorHub.tsx`**
- Add "Sync Now" button per connector that calls `connector-batch` edge function
- Add "Discover" button that calls `connector-discover` edge function
- Add query invalidation after successful sync
- Import and embed `ConnectorSyncDashboard` widget for health overview

### 3. Add AI-powered recommendation generation to Admin Truth
**Edit: `src/pages/admin/AIT04to08Boards.tsx`**
- In `AIT06Recommendations`: add "Generate AI Recommendations" button that calls `brain-core` with `intent: "generate_recommendations"` and low-scoring truth index data as context
- On success, insert returned recommendations into `ai_workforce_recommendations` table
- In `AIT08LaunchTruth`: add "Analyze Gaps" button that calls `brain-core` to produce remediation suggestions for any truth index below 80%

### 4. Add real-time refetch after sync actions
**Edit: `src/pages/admin/ConnectorGovernanceCenter.tsx`**
- Use `useQueryClient().invalidateQueries` on sync success to refresh connector list, sync history, and KPIs
- Add 5-second polling on sync history tab for live updates

## Files Modified
| File | Change |
|------|--------|
| `src/pages/admin/ConnectorGovernanceCenter.tsx` | Real sync history from `audit_logs`, query invalidation |
| `src/pages/ConnectorHub.tsx` | Sync/Discover buttons wired to edge functions, embed SyncDashboard |
| `src/pages/admin/AIT04to08Boards.tsx` | AI recommendation generation + gap analysis buttons |

## No New Files or Migrations Needed
All tables (`audit_logs`, `ai_workforce_recommendations`) and edge functions (`connector-batch`, `connector-discover`, `brain-core`) already exist.

## Result
| Loop | Before | After |
|------|--------|-------|
| Connected Services + Sync | 67% | 95%+ |
| Admin Truth + Recommendation | 90% | 98%+ |

