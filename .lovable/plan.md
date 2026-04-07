

# Wire Remaining 16 Demo-Data Pages to Real Backend — 100% Active

## The Real Gap

Your technology stack (React, Vite, Tailwind, Supabase, TanStack Query, etc.) is genuinely production-ready. The gap is that **16 page components still contain hardcoded const arrays** (DEMO_AGENTS, TEAM_MEMBERS, PLAYBOOK_REVENUE, etc.) instead of querying Supabase. They look great but don't persist or fetch real data.

## Pages With Hardcoded Data → Real Backend

| # | Page | Hardcoded Arrays | Wire To |
|---|------|-----------------|---------|
| 1 | `EnterpriseControlPlane.tsx` | TEAM_MEMBERS, CAPABILITIES, COMPLIANCE_ITEMS, SLA_METRICS, DEPLOYMENTS | `profiles` + `user_roles` + `audit_logs` |
| 2 | `RevenueImpactDashboard.tsx` | PLAYBOOK_REVENUE, generateTrend() | `invoices` + `payment_transactions` aggregation |
| 3 | `AIWorkforcePage.tsx` | DEMO_AGENTS | `ai_agents` table |
| 4 | `CapitalAllocationPage.tsx` | DEMO_ALLOCATIONS | `financial_accounts` table |
| 5 | `PeopleWorkspace.tsx` | Inline demo fallback array | `customers` + `leads` + `household_members` (already partially wired) |
| 6 | `BoardroomHistory.tsx` | DEMO_SESSIONS | `boardroom_sessions` (already wired, just needs demo fallback removed) |
| 7 | `CommunicationsCenter.tsx` | Inline demo messages | `communications` table |
| 8 | `CollectionsCommandCenter.tsx` | Hardcoded collections data | `invoices` where status = overdue |
| 9 | `ApprovalChamber.tsx` | MOCK_APPROVALS from demo-data | `approvals` table (exists) |
| 10 | `AppReceiptsPage.tsx` | MOCK_RECEIPTS from demo-data | `proof_receipts` table |
| 11 | `OpenWithPage.tsx` | DEMO_FILES | `file_metadata` table |
| 12 | `InvestmentReceipts.tsx` | SAMPLE_RECEIPTS | `proof_receipts` table |
| 13 | `MonthGridCalendar.tsx` | generateCalendarDemoEvents() | `bookings` + `tasks` tables |
| 14 | `MockReplacementProgram.tsx` | MOCK_TYPES inline data | `mock_replacement_items` table or remove page |
| 15 | `LifeSimulator.tsx` | Inline scenario data | `scenarios` table |
| 16 | `ScenarioLabPage.tsx` | Inline scenario arrays | `scenarios` table |

## Implementation Pattern (Same for Every Page)

Each page follows the identical transformation:

1. **Remove** the hardcoded `const DEMO_*` array
2. **Add** a `useQuery` that fetches from the relevant Supabase table
3. **Keep** the existing demo array as fallback ONLY when `isDemoMode` is true (via `useDataMode()`)
4. **Add** `useQueryClient().invalidateQueries()` on any mutation (create/update/delete)
5. **Add** loading skeleton and empty state

```text
BEFORE:
  const DEMO_ITEMS = [{ ... }, { ... }];
  return <List items={DEMO_ITEMS} />

AFTER:
  const { data, isLoading } = useQuery({
    queryKey: ["items", user?.id],
    queryFn: () => supabase.from("table").select("*").eq("user_id", user.id),
    enabled: !isDemoMode && !!user?.id,
  });
  const items = isDemoMode ? DEMO_FALLBACK : (data ?? []);
  if (isLoading) return <Skeleton />;
  return <List items={items} />
```

## Execution Order (4 Batches)

**Batch 1 — High-Impact Business Pages (4 files)**
- EnterpriseControlPlane.tsx → profiles + user_roles
- RevenueImpactDashboard.tsx → invoices + payment_transactions
- AIWorkforcePage.tsx → ai_agents
- CapitalAllocationPage.tsx → financial_accounts

**Batch 2 — Core Loop Pages (4 files)**
- ApprovalChamber.tsx → approvals
- BoardroomHistory.tsx → boardroom_sessions (remove demo fallback)
- PeopleWorkspace.tsx → remove inline demo fallback
- CommunicationsCenter.tsx → communications

**Batch 3 — Concierge + Files (4 files)**
- MonthGridCalendar.tsx → bookings + tasks
- OpenWithPage.tsx → file_metadata
- AppReceiptsPage.tsx → proof_receipts
- InvestmentReceipts.tsx → proof_receipts

**Batch 4 — Remaining Pages (4 files)**
- CollectionsCommandCenter.tsx → invoices (overdue)
- LifeSimulator.tsx → scenarios
- ScenarioLabPage.tsx → scenarios
- MockReplacementProgram.tsx → audit (or deprecate)

## Database Migration

One migration to create any missing tables:

```sql
-- scenarios table (for LifeSimulator + ScenarioLab)
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  parameters jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scenarios" ON scenarios
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- communications table (for CommunicationsCenter)
CREATE TABLE IF NOT EXISTS communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text DEFAULT 'email',
  subject text,
  body text,
  recipient text,
  status text DEFAULT 'draft',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own communications" ON communications
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

All other tables (`ai_agents`, `approvals`, `invoices`, `financial_accounts`, `proof_receipts`, `bookings`, `file_metadata`, `profiles`, `user_roles`, `boardroom_sessions`, `customers`, `leads`) already exist.

## Files Modified

16 page files updated (remove hardcoded arrays, add useQuery wiring).

## Result

| Metric | Before | After |
|--------|--------|-------|
| Pages with hardcoded data | 16 | 0 |
| Pages wired to Supabase | ~70% | 100% |
| Demo mode still works | Yes | Yes (controlled by DataModeContext toggle) |
| Tech stack status | Production | Production — fully wired |

