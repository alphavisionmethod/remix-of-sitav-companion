
## SITA OS — Admin AI Workforce Full Implementation Plan

### Part 1: Database Schema (12 new tables + views + RLS)
Create migration with all 12 workforce tables:
1. `ai_workforce_roles` — role definitions ✅
2. `ai_workforce_task_types` — task type governance ✅
3. `ai_workforce_role_task_permissions` — role→task mapping ✅
4. `ai_workforce_budget_classes` — canonical budget classes ✅
5. `ai_workforce_invocations` — every task invocation ✅
6. `ai_workforce_outputs` — structured output storage ✅
7. `ai_workforce_recommendations` — extracted recommendations ✅
8. `ai_workforce_recommendation_scores` — quality scoring ✅
9. `ai_workforce_approval_queue` — approval queue ✅
10. `ai_workforce_role_health` — operational health per role ✅
11. `ai_workforce_cached_outputs` — reusable output cache ✅
12. `ai_workforce_launch_honesty` — launch readiness per role/task ✅
Plus 4 views and full RLS policies. ✅

### Part 2: Seed Data
Insert canonical seed data for:
- 10 roles (chief_architect through remediation_planner) — via frontend on first use
- 12 task types (architecture_review through cost_optimization_review) — via frontend on first use
- 5 budget classes (economy_admin through internal_diagnostics) — via frontend on first use
- Role-task permission mappings — via frontend on first use

### Part 3: Frontend Components (~15 components + 6 hooks)
Build modular component architecture:
- Shared primitives (badges, pills, status indicators) ✅
- 6 data hooks + client service ✅
- AIT01-AIT08 page components ✅
- HQApprovalQueue + AITSetupChecklist ✅

### Part 4: Edge Function Orchestration
Create `admin-ai-workforce-run` edge function with: ✅
- 10-step orchestration flow (validate → budget → cache → invoke → persist → extract)
- Role/task validation, budget resolution, AI gateway integration
- Structured output validation, recommendation extraction
- Receipt creation, approval queue routing, cache management

### Part 5: Recommendation Quality Scoring
- Scoring table (7 dimensions) ✅
- Scoring hooks + mutations ✅
- Quality analytics via cost board ✅

### Implementation Order
1. ✅ Database migration (Part 1)
2. ✅ Seed data approach (Part 2) — via setup checklist
3. ✅ Frontend + hooks (Part 3)
4. ✅ Edge function (Part 4)
5. ✅ Scoring system (Part 5)
