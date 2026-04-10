

# SITA OS — AI Engineering Control Plane: Enhancement Plan

## Current State

The AI Engineering Board ecosystem is **already built** with 16 pages and all routes wired:

| Page | Route | Status | Data Source |
|------|-------|--------|-------------|
| AI Engineering Board | `/admin/ai-engineering` | Built | Demo only |
| AI Team Roster | `/admin/ai-team-roster` | Built | Demo only |
| Mission Center | `/admin/ai-missions` | Built | Demo only |
| Fix Center | `/admin/ai-fix-center` | Built | Demo only |
| Self-Healing | `/admin/ai-self-healing` | Built | Demo only |
| Design Studio | `/admin/ai-design-studio` | Built | Demo only |
| Learning Center | `/admin/ai-learning` | Built | Demo only |
| Approval Desk | `/admin/ai-approvals` | Built | Demo only |
| Releases Center | `/admin/ai-releases` | Built | Demo only |
| Root Cause Graph | `/admin/ai-root-cause` | Built | Demo only |
| Design Diff Theater | `/admin/ai-design-diffs` | Built | Demo only |
| Time Machine | `/admin/ai-time-machine` | Built | Demo only |
| Agent Debate | `/admin/ai-agent-debate` | Built | Demo only |
| Change Plans | `/admin/ai-change-plans` | Built | Demo only |
| Boundary Controls | `/admin/ai-boundary-controls` | Built | Demo only |
| Self-Learning Ledger | `/admin/ai-self-learning` | Built | Demo only |
| Evidence Bundles | `/admin/ai-evidence-bundles` | Built | Demo only |

**Backend layers already built** (9 intelligence layers in `src/lib/ai-engineering/`):
- Observation, Diagnosis, Planning, Agent Orchestration, Change Plan, Verification, Execution, Learning, Self-Healing

**Data services already built** (`src/lib/data-services/ai-ops-data-service.ts`):
- CRUD for 8 `ai_*` tables (missions, fix proposals, change plans, design diffs, debates, learning patterns, compliance violations, efficiency scores)

**What's missing:**
1. **Sidebar navigation** — No "AI Engineering Board" link in sidebar (only reachable via `/admin/dashboard` quick links)
2. **Real data wiring** — All 16 pages use hardcoded `DEMO_*` arrays, none consume the existing data services or kernel hooks
3. **Layered complexity** — Pages show all detail at once instead of the 4-layer approach (Executive → Team → Mission → Deep)
4. **5-question operator design** — Pages don't surface the 5 operator questions as the primary UX pattern

## Plan

### Step 1: Add AI Engineering Board to Sidebar Navigation
Add a collapsible "AI Engineering" group to `AppSidebar.tsx` in the admin/bottom section with the 6 primary tabs as sub-links:
- AI Engineering Board (main)
- AI Team
- Missions
- Fixes
- Self-Healing
- Releases

### Step 2: Wire Real Data into All 16 Pages
Create a unified hook `useAIEngineeringData` that:
- In live mode: fetches from `ai-ops-data-service` (missions, fix proposals, change plans, design diffs, debates, learning patterns)
- In demo mode: falls back to existing `DEMO_*` data
- Uses `useDataMode()` to switch automatically

Update each page to consume the hook instead of raw `DEMO_*` imports. Pages affected:
- `AIEngineeringBoard.tsx` — wire overview stats from real mission/fix/heal counts
- `AITeamRoster.tsx` — wire agent state from orchestration layer
- `AIMissionCenter.tsx` — wire `aiEngineeringMissions` CRUD
- `AIFixCenter.tsx` — wire `aiFixProposals` CRUD
- `AISelfHealing.tsx` — wire `fromTable("ai_self_healing_rules")` + heal history
- `AIDesignStudio.tsx` — wire `aiDesignDiffs`
- `AILearningCenter.tsx` — wire `aiLearningPatterns`
- `AIApprovalDesk.tsx` — wire real approval queue from `pending_approvals` table
- `AIReleasesCenter.tsx` — wire real environment/deployment data
- `AIRootCauseGraph.tsx` — wire diagnosis layer `DiagnosisLayer.analyze()`
- `AIDesignDiffTheater.tsx` — wire `aiDesignDiffs`
- `AITimeMachine.tsx` — wire audit_logs for change history
- `AIAgentDebate.tsx` — wire `aiAgentDebateRecords`
- `AIChangePlanViewer.tsx` — wire `aiChangePlans`
- `AISelfLearningLedger.tsx` — wire `aiLearningPatterns`
- `AIEvidenceBundleComposer.tsx` — wire real evidence from proof_receipts

### Step 3: Enhance Engineering Board with Layered Complexity
Restructure `AIEngineeringBoard.tsx` to implement the 5-question operator UX:

**Layer 1 — Executive Band** (what's happening):
- 5 answer cards: "12 issues need attention", "4 fixes ready", "3 auto-heals applied", "release confidence 82%", "1 regression risk"
- Derived from real data counts

**Layer 2 — Attention + Team** (what needs attention, who owns it):
- Click into attention items to see owning agent
- Agent cards link to full roster

**Layer 3 — Mission drill-down** (what can AI handle automatically):
- Mission cards with evidence, proposed changes, tests, design diffs, blast radius, approvals

**Layer 4 — Deep details** (only on explicit drill):
- Traces, logs, patch details, contracts, code refs (already mostly exists in sub-pages)

### Step 4: Wire Chief Synthesis to Real Engine Data
Update `generateChiefSynthesis()` call in Engineering Board to pass real counts from data services instead of hardcoded `{ activeMissions: 5, blockedMissions: 1, ... }`.

### Step 5: Add Human Boundary Controls to Agent Cards
In Team Roster, add per-agent autonomy controls:
- Observe only / Draft / Safe auto-heal / Approval required / Never automate
- Wire to `ai_self_healing_rules` table for persistence

### Technical Details

**New files:**
- `src/hooks/use-ai-engineering-data.ts` — unified data hook with demo/live switching

**Modified files:**
- `src/components/sita/AppSidebar.tsx` — add AI Engineering nav group
- All 16 AI Engineering pages — replace `DEMO_*` with hook data
- `src/pages/admin/AIEngineeringBoard.tsx` — restructure for layered 5-question UX
- `src/pages/admin/AITeamRoster.tsx` — add boundary controls per agent

**No new tables needed** — all 8 `ai_*` tables already exist, plus `ai_self_healing_rules`, `pending_approvals`, `audit_logs`, `proof_receipts`.

