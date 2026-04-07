

# Fix All 56 `as any` Supabase Casts Across 14 Files

## Problem

56 `.from("table" as any)` calls across 14 files. Two root causes:

1. **4 tables don't exist in the database** — `savings_goals`, `money_accounts`, `investment_thesis_entries`, `automation_rules`
2. **30+ tables/views DO exist in types.ts** but code still uses unnecessary `as any` casts

## Step 1: Create 4 Missing Tables (Migration)

```sql
-- savings_goals
CREATE TABLE public.savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric DEFAULT 0,
  current_amount numeric DEFAULT 0,
  target_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own savings_goals" ON public.savings_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- money_accounts
CREATE TABLE public.money_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  account_type text DEFAULT 'checking',
  balance numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  institution text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.money_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own money_accounts" ON public.money_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- investment_thesis_entries
CREATE TABLE public.investment_thesis_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  thesis text,
  conviction_level text DEFAULT 'medium',
  status text DEFAULT 'active',
  asset_class text,
  time_horizon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.investment_thesis_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own investment_thesis_entries" ON public.investment_thesis_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- automation_rules
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text,
  action_type text,
  conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automation_rules" ON public.automation_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

After migration, types.ts will auto-regenerate with these 4 new tables.

## Step 2: Remove All `as any` Casts (14 files, ~56 edits)

For every `.from("table_name" as any)`, change to `.from("table_name")`. For `(supabase as any).from(...)`, change to `supabase.from(...)`.

### Files and changes:

| File | Casts to remove |
|------|----------------|
| `hooks/use-fip-data.ts` | 17 casts across feature_intake_records, capability_registry, feature_spec_records, feature_owner_decisions, feature_compliance_records, feature_execution_paths, feature_rollout_records, feature_deprecation_records, feature_readiness_gates, feature_generated_truth_impacts |
| `hooks/use-investment-office.ts` | 4 casts: investment_watchlists, investment_strategy_records, capital_purpose_buckets, investment_thesis_entries |
| `hooks/use-money-data.ts` | 2 casts: savings_goals, money_accounts |
| `hooks/use-revenue-office.ts` | 4 casts: calling_contacts, revenue_leak_items, automation_rules, communication_log |
| `hooks/use-sag-data.ts` | 7 casts: generic table param + ai_task_requests, ai_inference_receipts, ai_provider_health, ai_portfolio_allocations, ai_compliance_violations |
| `lib/admin-ai/workforce-seed-data.ts` | 4 casts on insert payloads |
| `lib/capabilities/money-capability.ts` | 1 cast: financial_accounts |
| `lib/data-services/files-data-service.ts` | 2 casts: file_settings |
| `lib/data-services/money-data-service.ts` | 11 casts: financial_accounts, money_policies, files |
| `lib/services/advisor-memory/index.ts` | 2 casts: advisor_memories |
| `lib/services/identity-auth/account-graph.service.ts` | 1 cast: v_account_graph_summary |
| `lib/services/identity-auth/connector-access.service.ts` | 1 cast: v_connected_accounts_center |
| `lib/services/identity-auth/consent.service.ts` | 1 cast: v_consent_history |
| `lib/services/identity-auth/identity-provider.service.ts` | 1 cast: v_identity_methods |
| `pages/Onboarding.tsx` | 2 casts: user_memory, profiles |

**Special case**: `use-sag-data.ts` has a generic `table` parameter passed to `.from(table as any)` — this will use a type assertion to the Database tables union.

**Special case**: `workforce-seed-data.ts` casts the insert payload (`as any`), not the table name — remove those payload casts too.

## Step 3: Verify

- `npx tsc --noEmit` — 0 errors
- Build succeeds

## Files changed
- 1 migration (4 new tables)
- 14 TypeScript files (remove `as any` casts)

