

# Inject Pre-Knowledge into All AI Advisors

## Problem

The `chat-advisor` edge function already has code to query `advisor_knowledge`, `advisor_memories`, and `advisor_feedback` tables and inject them into prompts — but **none of these tables exist in the database**. Every query silently fails and returns empty arrays. The `brain-core` edge function uses only static hardcoded prompts with no knowledge injection at all.

## Plan

### Step 1: Create the three missing tables via migration

Create `advisor_knowledge`, `advisor_memories`, and `advisor_feedback` tables with RLS policies. The `advisor_knowledge` table will support both system-level entries (sentinel UUID `00000000-0000-0000-0000-000000000000`) and user-specific entries. RLS will allow authenticated users to read system entries AND their own entries, but only write their own.

### Step 2: Seed ~58 deep knowledge entries across 7 advisors

Insert system-level knowledge using the sentinel UUID so all users benefit from pre-loaded expertise:

- **Money** (12 entries): Cash flow waterfall, 50/30/20 founder adaptation, subscription audit framework, reserve adequacy formula, bill triage protocol, invoice aging brackets, tax quarterly calendar, debt prioritization, emergency fund sizing, spending anomaly detection, net worth cadence, financial boundaries
- **Business** (10): BANT lead scoring, pipeline velocity benchmarks, customer health scoring, deal stage exit criteria, follow-up cadence matrix, weighted pipeline forecasting, churn early warnings, proposal-to-close benchmarks, competitive displacement, account expansion triggers
- **Concierge** (8): Eisenhower matrix, errand batching, booking checklist, obligation calendar, household maintenance, meal planning, travel checklist, vendor evaluation
- **Family** (8): Family pulse framework, school calendar patterns, responsibility matrix, family meeting template, milestone tracking, medical coordination, extracurricular balance, communication preferences
- **Growth** (8): Growth loop identification, experiment design template, CAC/LTV benchmarks, pricing frameworks, market sizing, competitive moat, channel prioritization, growth stage indicators
- **General/SITA** (6): Cross-domain correlation, daily briefing structure, priority scoring, escalation criteria, domain handoff, executive summary format
- **Strategy** (6): MECE framework, scenario modeling, strategic drift, resource allocation, decision journal, opportunity cost

### Step 3: Upgrade `brain-core` to inject knowledge

Update `brain-core/index.ts` to query `advisor_knowledge` (both system-level and user-specific entries) and append domain knowledge to the system prompt before LLM calls — matching what `chat-advisor` already does.

### Step 4: Create knowledge management edge function

Create `supabase/functions/advisor-knowledge-manage/index.ts`:
- `GET` — list knowledge for an advisor (merges system + user entries)
- `POST` — add user-specific knowledge
- `DELETE` — remove user-specific knowledge only (system entries are read-only)

### Step 5: Add Knowledge Management UI panel

Create `src/components/advisors/AdvisorKnowledgePanel.tsx` — a reusable panel showing system knowledge (locked icon, read-only) and user-added knowledge (editable). Wire it into Money, Business, and Concierge settings pages.

## Files

- **Migration**: Create `advisor_knowledge`, `advisor_memories`, `advisor_feedback` tables + seed ~58 entries
- **Edit**: `supabase/functions/brain-core/index.ts` (add knowledge query to prompt building)
- **Create**: `supabase/functions/advisor-knowledge-manage/index.ts`
- **Create**: `src/components/advisors/AdvisorKnowledgePanel.tsx`
- **Edit**: Settings pages for Money, Business, Concierge (add knowledge panel tab)

## Technical Details

- System knowledge uses sentinel UUID `00000000-0000-0000-0000-000000000000` — RLS updated to allow reading these entries for all authenticated users
- Knowledge entries include `tags`, `confidence` (0.85-0.95 for system), `status: 'active'`
- `brain-core` knowledge injection mirrors the `buildPrompt` pattern from `chat-advisor`
- Each advisor only sees its own domain entries plus general cross-domain entries

