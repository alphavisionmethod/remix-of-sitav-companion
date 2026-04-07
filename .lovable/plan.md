

# SITA OS — Full Wiring & Polish: User Dashboard, Finance/CRM, Settings, Admin AI/Budget & Operations

## Audit Results

### What's ALREADY wired to live data (good)
- **Money**: BillsWorkspace, SubscriptionsWaste, MoneyApprovals, CashTiming, ReceivablesObligations, MoneyBoardroom, MoneyOverview, ReservesSavings, TaxEstimator — all query Supabase or edge functions
- **Business/CRM**: All 15 pages (LeadsInbox, CustomersPage, OpportunitiesCenter, InvoicesCollections, QuotesWorkspace, etc.) — fully wired with isDemoMode gates
- **Revenue Office**: 7 pages wired (PipelineStudio, BookingCenter, CampaignOrchestrator, LeakDetector, RevenueGate, GrowthBoardroom, RelationshipCenter)
- **Admin Dashboard**: Queries ai_token_usage, approval_queue, incidents, audit_logs, advisor_performance — fully live
- **Admin AI Budget (AIG04)**: Queries via ai-gateway service functions — fully live
- **UserProfilePage**: Queries profiles table, trust_weighted_actions — fully live with avatar upload
- **MissionControlPage**: Uses useAdminIncidents, useFleetHealth, useTrustCenter hooks
- **OwnerCenter**: Uses 12+ hooks from use-admin-data.ts

### What's STILL hardcoded (needs fixing)

| Area | Page | Static Data | Fix |
|------|------|-------------|-----|
| **MoneySettings** | connectors array (L16-24) | 7 hardcoded connectors | Wire to `connected_accounts` table via isDemoMode gate |
| **OperationsCommandCenter** | ALERTS, SLOS, RUNBOOKS (L17-36) | 3 hardcoded arrays | Wire ALERTS to incidents table, keep SLOs/Runbooks as demo fallback |
| **Digital Presence** (19 pages) | ConnectedSites, BrandStudio, SiteBuilder, etc. | All have inline arrays (PLATFORMS, AUDIT_FINDINGS, etc.) | Wire to `sites`, `brand_assets`, `seo_reports` tables via use-digital-presence hook |
| **Concierge** (13 pages) | TravelPlanning, GroceryPlanning, SchoolActivities, etc. | All have inline arrays (trips, itinerary, etc.) | Wire to `travel_plans`, `grocery_lists`, `appointments` tables via use-concierge-data hook |
| **Apps** (6 pages) | HealthApp, VaultApp, GalleryApp, etc. | sleepData, mockEntries, etc. | Wire to `health_logs`, `vault_items` tables via use-apps-data hook |
| **Revenue Office** (32 remaining pages) | FormsBuilder, FunnelBuilder, OffersWorkspace, etc. | FORMS, FUNNELS, OFFERS arrays | Wire to `forms`, `funnels`, `offers` tables via use-revenue-office hook |
| **Atlas** pages | OperationsCommandCenter, ConnectorControlCenter | connectors, alerts arrays | Wire to incidents/connected_accounts |

### Hooks exist but aren't imported by pages
- `use-digital-presence.ts` — 0 pages import it
- `use-concierge-data.ts` — 0 pages import it  
- `use-apps-data.ts` — 0 pages import it
- `use-admin-data.ts` — only 3 pages import it (SystemStatus, OwnerCenter, MissionControlPage)
- `use-revenue-office.ts` — 7 of 39 pages import it

## Implementation Plan

### Phase 1: MoneySettings Connector Wiring
- Replace hardcoded `connectors` array with `connected_accounts` query
- Add isDemoMode gate: show hardcoded connectors in demo, query table in live
- Add connect/disconnect buttons that write to `connected_accounts`

### Phase 2: Admin Operations Wiring (OperationsCommandCenter × 2)
- Wire `admin/OperationsCommandCenter.tsx` ALERTS to `useAdminIncidents()` from use-admin-data
- Wire `atlas/OperationsCommandCenter.tsx` alerts similarly
- Keep SLOs and Runbooks as demo data (no tables for these yet — they're infra metrics)

### Phase 3: Revenue Office Remaining 32 Pages
Wire each page's inline arrays behind isDemoMode gate using existing hooks from `use-revenue-office.ts`:
- FormsBuilder → `useForms()`
- FunnelBuilder → `useFunnels()`
- OffersWorkspace → `useOffers()`
- MembershipCourseOffice → `useMemberships()`
- ReputationEngine → `useReputationReviews()`
- RetentionOffice → `useRetentionAlerts()`
- AutomationBuilder/Office/Policy/Health/Receipts/SimLab/Templates → `useAutomationRules()`
- Remaining pages (CallDesk, ConversionLab, DecisionTheater, etc.) → use closest available hook or keep demo with isDemoMode badge

### Phase 4: Digital Presence 19 Pages
Wire each to `use-digital-presence.ts` hooks:
- ConnectedSites → `useSites()`
- BrandStudio → `useBrandAssets()`
- PresenceAnalytics/SiteBuilder → `useSeoReports()`
- EcommerceOffice → `useEcommerceProducts()`
- PromotionsOffice → `usePromotions()`
- Remaining pages → isDemoMode gate with existing inline data as demo fallback

### Phase 5: Concierge 13 Pages
Wire each to `use-concierge-data.ts` hooks:
- TravelPlanning → `useTravelPlans()`
- GroceryPlanning → `useGroceryLists()` + `useGroceryItems()`
- SchoolActivities → `useSchoolActivities()`
- ServiceProviders → `useServiceProviders()`
- EventsGifts → `useGiftTracker()`
- AppointmentsPrep → `useAppointments()`
- Remaining concierge pages → isDemoMode gate

### Phase 6: Apps 6 Pages  
Wire each to `use-apps-data.ts` hooks:
- HealthApp → `useHealthLogs()`
- VaultApp → `useVaultItems()`
- Remaining apps → isDemoMode gate with demo fallback

### Phase 7: Atlas Pages
Wire ConnectorControlCenter and other atlas pages with hardcoded arrays to use admin hooks.

## Pattern for Every Page

```typescript
// Before (hardcoded):
const ITEMS = [{ id: "1", name: "Demo" }];

// After (isDemoMode gate):
const DEMO_ITEMS = [{ id: "1", name: "Demo" }];

const MyPage = () => {
  const { isDemoMode } = useDataMode();
  const { data: liveItems, isLoading } = useMyHook();
  const items = isDemoMode ? DEMO_ITEMS : (liveItems ?? []);
  
  if (isLoading && !isDemoMode) return <SectionSkeleton cards={3} />;
  if (!isDemoMode && items.length === 0) return <EmptyState ... />;
  // ... render
};
```

## Scope
- **~75 page files updated** with live data wiring
- **0 new files** (all hooks already exist)
- **0 new tables** (all tables already created)
- **0 new migrations**

Implementation will proceed in phases, starting with the highest-impact fixes (MoneySettings, Operations) and working through the remaining unwired pages.

