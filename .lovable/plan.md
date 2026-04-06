
## SITA OS — Admin AI Workforce Full Implementation Plan

### Part 1: Database Schema (12 new tables + views + RLS)
Create migration with all 12 workforce tables:
1. `ai_workforce_role_registry` — role definitions
2. `ai_workforce_task_registry` — task type governance
3. `ai_workforce_role_task_permissions` — role→task mapping
4. `ai_workforce_budget_classes` — canonical budget classes
5. `ai_workforce_invocations` — every task invocation
6. `ai_workforce_outputs` — structured output storage
7. `ai_workforce_recommendations` — extracted recommendations
8. `ai_workforce_recommendation_scores` — quality scoring
9. `ai_workforce_approval_queue_v2` — new approval queue (replaces old one)
10. `ai_workforce_role_health` — operational health per role
11. `ai_workforce_cached_outputs` — reusable output cache
12. `ai_workforce_launch_honesty` — launch readiness per role/task
Plus 4 views and full RLS policies.

### Part 2: Seed Data
Insert canonical seed data for:
- 10 roles (chief_architect through remediation_planner)
- 12 task types (architecture_review through cost_optimization_review)
- 5 budget classes (economy_admin through internal_diagnostics)
- Role-task permission mappings

### Part 3: Frontend Components (~15 components + 6 hooks)
Build modular component architecture:
- Shared primitives (badges, pills, status indicators)
- Role table/cards/detail drawer
- Task invocation form with budget pre-flight
- Activity feed, cost board, recommendation board
- Approval queue table + detail drawer
- Launch truth board
- 6 data hooks + client service

### Part 4: Edge Function Orchestration
Create `admin-ai-workforce-run` edge function with:
- 10-step orchestration flow (validate → budget → cache → invoke → persist → extract)
- Role/task validation, budget resolution, AI gateway integration
- Structured output validation, recommendation extraction
- Receipt creation, approval queue routing, cache management

### Part 5: Recommendation Quality Scoring
- Scoring engine (7 dimensions)
- Auto-heuristic + human review support
- Quality analytics dashboard component
- Feedback loop integration

### Implementation Order
1. ✅ Database migration (Part 1) — must go first
2. ✅ Seed data (Part 2) — right after schema
3. ✅ Frontend + hooks (Part 3) — can start after types update
4. ✅ Edge function (Part 4) — parallel with frontend
5. ✅ Scoring system (Part 5) — after recommendations table exists
