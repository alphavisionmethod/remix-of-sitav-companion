

# SITA OS — Full Module Implementation Audit & 100% Plan

## Audit Summary

| Module | Pages | Live Data | CRUD | Status | Grade |
|--------|-------|-----------|------|--------|-------|
| **Auth** | 4 | 0 (auth is via hooks) | N/A | ✅ Complete | A |
| **Money** | 13 | 3 (23%) | 3 | ⚠️ 10 pages static | C |
| **Business** | 15 | 8 (53%) | 4 | ⚠️ 7 pages static | B- |
| **Concierge** | 16 | 3 (19%) | 2 | ❌ 13 pages static | D |
| **Investment Office** | 38 | 1 (3%) | 1 | ❌ 37 pages static | F |
| **Revenue Office** | 63 | 0 (0%) | 0 | ❌ All static | F |
| **Digital Presence** | 19 | 0 (0%) | 0 | ❌ All static | F |
| **Workspace** | 5 | 0 (hooks in service layer) | 0 | ⚠️ Partially wired | C |
| **Store** | 6 | 0 | 0 | ⚠️ Partially wired | C |
| **Atlas** | 11 | 1 | 0 | ❌ 10 static | D |
| **Apps** | 6 | 0 | 0 | ❌ All static | F |
| **Mobile** | 9 | 0 | 0 | ❌ All static | F |
| **Mission** | 8 | 0 | 0 | ❌ All static | F |
| **Owner** | 8 | 0 | 0 | ❌ All static | F |
| **Admin** | 297 | 135 (45%) | N/A | ⚠️ Internal tooling | C |
| **Top-level pages** | ~65 | ~30 | Mixed | ⚠️ Mixed | C |

**Overall: 629 page files. 169 (27%) have live data queries. 460 (73%) are completely static with inline hardcoded arrays.**

---

## What "100% Implemented" Means

Every user-facing page must:
1. **Query real Supabase data** when `isDemoMode === false`
2. **Fall back to demo data** when `isDemoMode === true`
3. **Have CRUD operations** where applicable (create, edit, delete via mutations)
4. **Show proper empty states** when no data exists
5. **Have loading/error states** via `useQuery` suspense

---

## Implementation Plan — 8 Phases

### Phase 1: Revenue Office (63 pages, 0% live) — CRITICAL

The largest module with zero live data. Pages like PipelineStudio, CallDesk, FormsBuilder, AutomationOffice all have rich UI but 100% inline hardcoded arrays.

**Tables needed** (most already exist): `deals`, `customers`, `communication_log`, `calling_contacts`, `revenue_leak_items`, `automation_rules`

**New tables needed**: `pipeline_stages`, `campaigns`, `bookings`, `forms`, `funnels`, `offers`, `memberships`, `reputation_reviews`, `retention_alerts`

**Work**: Create ~10 new tables. Create `src/hooks/use-revenue-office.ts` with ~15 hooks. Wire all 63 pages with isDemoMode gate.

| Sub-task | Pages |
|----------|-------|
| Pipeline & Deals (PipelineStudio, OpportunityBoard, ConversionLab, LeakDetector) | 4 |
| Automation suite (AutomationOffice, Builder, Health, Policy, Receipts, SimLab, Templates) | 7 |
| Communication (CallDesk, CampaignOrchestrator, RelationshipCenter) | 3 |
| Growth suite (GrowthDNA, GrowthBoardroom, GrowthAdvisorBoard, GrowthOperatingModes) | 4 |
| Commerce (BookingCenter, OffersWorkspace, QuoteStudio, FormsBuilder, FunnelBuilder) | 5 |
| Intelligence (RevenueIntelligence, ChiefRevenueSynthesis, SegmentationEngine, ReputationEngine) | 4 |
| Remaining (RetentionOffice, ClientOnboarding, JourneyTwin, MembershipCourseOffice, etc.) | 16+ |

### Phase 2: Investment Office (38 pages, 3% live) — CRITICAL

Tables exist: `investment_watchlists`, `investment_strategy_records`, `capital_purpose_buckets`, `investment_thesis_entries`

**New tables needed**: `portfolio_positions`, `trade_orders`, `market_watchlist_items`, `investment_decisions`, `risk_scenarios`

**Work**: Create ~5 new tables. Create `src/hooks/use-investment-office.ts` with ~10 hooks. Wire all 38 pages.

### Phase 3: Digital Presence (19 pages, 0% live) — HIGH

Brand new module with zero backend. Pages like SiteBuilder, BrandStudio, CROOffice, PresenceAnalytics all render inline data.

**New tables needed**: `sites`, `site_pages`, `brand_assets`, `seo_reports`, `campaigns_dp`, `promotions`

**Work**: Create ~6 new tables. Create `src/hooks/use-digital-presence.ts`. Wire all 19 pages.

### Phase 4: Concierge (16 pages, 19% live) — HIGH

HouseholdCommandCenter and HouseholdTasks are wired. 13 pages (TravelPlanning, GroceryPlanning, FamilyCalendar, ServiceProviders, etc.) are static.

**Tables exist**: `households`, `household_members`, `calendar_events`

**New tables needed**: `travel_plans`, `grocery_lists`, `grocery_items`, `service_providers`, `school_activities`, `gift_tracker`, `appointments`

**Work**: Create ~7 new tables. Wire 13 pages.

### Phase 5: Money (13 pages, 23% live) — MEDIUM

BillsWorkspace, SubscriptionsWaste, ReservesSavings are wired. 10 pages static.

**Tables exist**: `bills`, `subscriptions`, `savings_goals`, `money_accounts`

**New tables needed**: `tax_estimates`, `receivables`, `money_approvals`

**Work**: Create ~3 tables. Wire 10 pages.

### Phase 6: Apps + Mobile + Mission + Owner (31 pages, 0% live) — MEDIUM

- **Apps** (6): HealthApp, EmailApp, MessengerApp, VaultApp, GalleryApp, WeatherNewsApp — these are "companion apps" that need their own tables or to aggregate from existing ones
- **Mobile** (9): Mobile shell versions of core features — should reuse the same hooks as desktop
- **Mission** (8): Mission/goal tracking pages — need `mission_goals` table
- **Owner** (8): Owner dashboard/control pages — need owner-specific views

**New tables needed**: `health_logs`, `vault_items`, `mission_goals`, `mission_milestones`

### Phase 7: Remaining Business + Workspace + Store + Atlas — LOW

- **Business** (7 remaining): Wire to existing `deals`, `customers`, `invoices` tables
- **Workspace** (5): Already partially wired via workspace-data-service — verify mode gates
- **Store** (6): PackStorePage partially wired — complete remaining 5
- **Atlas** (10): System admin pages — wire to system health tables

### Phase 8: Admin Pages (162 remaining static) — LOW

These are internal admin/diagnostic pages. Many are config-driven, not user-data-driven. Add isDemoMode gates and empty states. Not all need CRUD.

---

## Database Migration Summary

| Phase | New Tables | Count |
|-------|-----------|-------|
| 1 — Revenue Office | pipeline_stages, campaigns, bookings, forms, funnels, offers, memberships, reputation_reviews, retention_alerts | 9 |
| 2 — Investment Office | portfolio_positions, trade_orders, market_watchlist_items, investment_decisions, risk_scenarios | 5 |
| 3 — Digital Presence | sites, site_pages, brand_assets, seo_reports, promotions, ecommerce_products | 6 |
| 4 — Concierge | travel_plans, grocery_lists, grocery_items, service_providers_list, school_activities, gift_tracker, appointments | 7 |
| 5 — Money | tax_estimates, receivables, money_approvals | 3 |
| 6 — Apps/Mobile/Mission/Owner | health_logs, vault_items, mission_goals, mission_milestones | 4 |
| **Total** | | **34 new tables** |

## Hook Files to Create

| File | Hooks | Serves |
|------|-------|--------|
| `src/hooks/use-revenue-office.ts` | ~15 hooks | 63 pages |
| `src/hooks/use-investment-office.ts` | ~10 hooks | 38 pages |
| `src/hooks/use-digital-presence.ts` | ~8 hooks | 19 pages |
| `src/hooks/use-concierge-data.ts` | ~7 hooks | 13 pages |
| `src/hooks/use-money-data.ts` | ~5 hooks | 10 pages |
| `src/hooks/use-apps-data.ts` | ~4 hooks | 6 pages |
| `src/hooks/use-mission-data.ts` | ~3 hooks | 8 pages |

## Implementation Pattern (same across all phases)

```typescript
// In hook file:
export function usePipelineDeals() {
  const { isDemoMode } = useDataMode();
  const { user } = useAuth();
  return useQuery({
    queryKey: ["pipeline-deals", user?.id],
    enabled: !isDemoMode && !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("deals").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
  });
}

// In page:
const { data: liveDeals } = usePipelineDeals();
const deals = isDemoMode ? DEMO_DEALS : (liveDeals ?? []);
```

## Total Scope

- **34 new database tables** (1 large migration)
- **7 new hook files** (~52 hooks total)
- **~460 page files updated** with isDemoMode gates
- **~30 new empty state designs** for when users have no data yet

This is a large undertaking. I recommend executing Phase 1 (Revenue Office) first as it's the largest gap, then Phase 2 (Investment Office), and so on. Each phase is independent and can be shipped separately.

