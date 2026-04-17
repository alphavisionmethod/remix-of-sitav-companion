

## Re-Audit Verdict — Checklist 14: 8/11 Truthful, 3 Real Gaps

DB and code truth show **most of Phase 21 landed correctly**, but three items are not yet 100% deployment-ready.

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Advisor registry | ✅ | `advisor_registry` has 6 rows with full metadata; JSON synced |
| 2 | Prompt versions tracked | ✅ | `ai_prompt_families`=6, `ai_prompt_versions` active=6; explorer + edge fn live |
| 3 | Model routing explicit | ✅ | `ai_routing_policies`=6, `ai_capability_routing`=6; routing-policy-update fn exists |
| 4 | AI provider health visible | ⚠️ | Tables seeded (4 health rows) but **no `sita-ai-health-2m` cron** — health rows will go stale immediately after deploy |
| 5 | Cost/budget controls | ✅ | `ai_workforce_budget_classes` + budget.service wired |
| 6 | Recommendation quality | ✅ | `ai_workforce_recommendations` + monitor wired |
| 7 | AI runtime failures triageable | ✅ | Phase 20 alerts + `ai_workforce_role_health` |
| 8 | Policy/approval/proof | ✅ | `ai_workforce_approval_queue` + receipts |
| 9 | Memory bounded + persisted | ✅ | `advisor_memories` + inspector |
| 10 | Hallucination protections + tested | ✅ | 61/61 tests passing |
| 11 | Simulated features marked | ❌ | `ai_workforce_launch_honesty` has **0 rows**; `AdvisorBoardCatalog` does **not** import `LaunchHonestyBadge`; pills never render |

### Real Gaps

- **G1 (Item 4):** No cron schedule for `ai-health` — provider health will not refresh after seed
- **G2 (Item 11a):** `ai_workforce_launch_honesty` is empty — UI badges have nothing to render
- **G3 (Item 11b):** `AdvisorBoardCatalog.tsx` and `AdvisorAgentDashboard.tsx` don't render `LaunchHonestyBadge` despite the component existing

---

## Phase 21.1 — Reality Closure (3 fixes, ~5 files)

### 21.1.A — Schedule AI provider health probe (G1)
Insert one cron row (data, not migration):
```sql
SELECT cron.schedule('sita-ai-health-2m','*/2 * * * *',
  $$ SELECT net.http_post(
       url:='https://fctupowhcljejygjfpty.supabase.co/functions/v1/ai-health',
       headers:='{"Content-Type":"application/json","Authorization":"Bearer <anon>"}'::jsonb,
       body:='{}'::jsonb); $$);
```
Verify `cron.job` row exists; first run within 2 min populates fresh `ai_provider_health` rows.

### 21.1.B — Seed launch honesty for all 6 advisors (G2)
Insert 6 rows into `ai_workforce_launch_honesty` keyed by each advisor's `advisor_id`:
- `business-advisor` → `alpha`
- `money-advisor` → `alpha`
- `concierge-advisor` → `alpha`
- `strategy-advisor` → `scaffold` (Simulated)
- `business-scout` → `beta`
- `money-guardian` → `beta`

Sourced directly from `advisor_registry.maturity` to stay consistent.

### 21.1.C — Render Launch Honesty badges in advisor UI (G3)
Edit `src/pages/admin/AdvisorBoardCatalog.tsx` and `src/pages/admin/AdvisorAgentDashboard.tsx`:
- Import `LaunchHonestyBadge` from `@/components/reality/LaunchHonestyBadge`
- Map `advisor_registry.maturity` → `honestyClass`:
  - `scaffold` → `demo_governed`
  - `alpha` → `qualified`
  - `beta` → `partial`
  - `production` → `truthful`
- Render `<LaunchHonestyBadge honestyClass={...} compact />` next to each advisor's name

### 21.1.D — Strengthen Gate 32 + refresh report
Edit `scripts/architecture/checks/check-ai-advisor-reality.ts`:
- Assert `cron.job` contains `sita-ai-health-2m`
- Assert `ai_workforce_launch_honesty` row count ≥ `advisor_registry` row count
- Assert `AdvisorBoardCatalog.tsx` imports `LaunchHonestyBadge`
- Re-emit `generated/ai-advisor-reality-report.json` with `cron_ai_health:true`, `launch_honesty_seeded:6`, `launch_honesty_ui_wired:true`

### 21.1.E — Deploy + smoke test
- Deploy `ai-health` (re-deploy current code); confirm cron fires within 2 min and `ai_provider_health.last_probed_at` is fresh
- Open `/admin/advisor-board` → confirm 6 advisors each show their pill (Demo/Qualified/Partial/Real)
- Open `/admin/ai/prompts` → confirm 6 families render
- Run `invokeAICapability({ capabilityId:"advisor.money.system" })` without `promptFamilyId` → expect runtime rejection

### Files

| Layer | Change |
|---|---|
| DB cron (insert) | Schedule `sita-ai-health-2m` |
| DB seed (insert) | 6 `ai_workforce_launch_honesty` rows |
| `src/pages/admin/AdvisorBoardCatalog.tsx` | Render `LaunchHonestyBadge` |
| `src/pages/admin/AdvisorAgentDashboard.tsx` | Render `LaunchHonestyBadge` |
| `scripts/architecture/checks/check-ai-advisor-reality.ts` | +3 assertions |
| `generated/ai-advisor-reality-report.json` | Refresh evidence |

### Acceptance

- `SELECT * FROM cron.job WHERE jobname='sita-ai-health-2m'` returns 1 active row
- `ai_provider_health.last_probed_at` < 5 min old after first cron tick
- `ai_workforce_launch_honesty` row count = 6 (one per advisor)
- `/admin/advisor-board` page renders Real/Qualified/Demo/Partial pill on every advisor card
- Gate 32 strengthened, report `ok:true, errors:0`
- Checklist 14 truthfully **11/11 — fully deployable**

