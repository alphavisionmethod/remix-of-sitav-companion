// @route-family: experimental
// @kind: aggregate
// @surface: user-product
// @profiles: user
// @canonical-page-owner: multiple (revenue-office, app-platform, store, digital-twins)
// @owns: topology-only
// @note: Aggregator for surfaces awaiting full split into sub-families.
// @phase-5: Investment Office routes removed — consolidated into the
//           single canonical /investment/* namespace (investment-routes.tsx
//           + investment-office-routes.tsx). Legacy /investments/* served
//           by USER_REDIRECTS in src/routes/redirects/user-redirect-map.ts.
import { Route, Navigate, Outlet } from "react-router-dom";
import { lazy } from "react";
const AppStoreCenter = lazy(() => import("@/pages/AppStoreCenter"));

// App Platform
const AppStorePage = lazy(() => import("@/pages/app-platform/AppStorePage"));
const AppPlatformDetailPage = lazy(() => import("@/pages/app-platform/AppDetailPage"));
const AppLibraryPage = lazy(() => import("@/pages/app-platform/AppLibraryPage"));
const BundleDetailPage = lazy(() => import("@/pages/app-platform/BundleDetailPage"));
const AppUpdatesPage = lazy(() => import("@/pages/app-platform/AppUpdatesPage"));
const AppPermissionsCenterPage = lazy(() => import("@/pages/app-platform/AppPermissionsCenterPage"));
const AppAssociationsPage = lazy(() => import("@/pages/app-platform/AppAssociationsPage"));
const AppComparePage = lazy(() => import("@/pages/app-platform/AppComparePage"));
const AppManagePage = lazy(() => import("@/pages/app-platform/AppManagePage"));
const WebAppInstallPage = lazy(() => import("@/pages/app-platform/WebAppInstallPage"));
const ExternalInstallerPage = lazy(() => import("@/pages/app-platform/ExternalInstallerPage"));
const AppReceiptsPage = lazy(() => import("@/pages/app-platform/AppReceiptsPage"));
const AppReceiptDetailPage = lazy(() => import("@/pages/app-platform/AppReceiptDetailPage"));
const EnterpriseCatalogPage = lazy(() => import("@/pages/app-platform/EnterpriseCatalogPage"));
const DevToolsCatalogPage = lazy(() => import("@/pages/app-platform/DevToolsCatalogPage"));
const OpenWithPage = lazy(() => import("@/pages/app-platform/OpenWithPage"));
const FirstLaunchPage = lazy(() => import("@/pages/app-platform/FirstLaunchPage"));

// Pack Store
const PackStorePage = lazy(() => import("@/pages/store/PackStorePage"));
const PackDetailPage = lazy(() => import("@/pages/store/PackDetailPage"));
const PackInstalledPage = lazy(() => import("@/pages/store/PackInstalledPage"));
const OldAppDetailPage = lazy(() => import("@/pages/store/StoreAppDetailPage"));
const StoreCategoryPage = lazy(() => import("@/pages/store/StoreCategoryPage"));
const StoreAnalyticsPage = lazy(() => import("@/pages/store/StoreAnalyticsPage"));

// Digital Twins / Scenario / AI Economics
const DigitalTwinsPage = lazy(() => import("@/pages/DigitalTwinsPage"));
const ScenarioLabPage = lazy(() => import("@/pages/ScenarioLabPage"));
const AIEconomicsPage = lazy(() => import("@/pages/AIEconomicsPage"));
const RecoveredValuePage = lazy(() => import("@/pages/RecoveredValuePage"));
const FirstWinActivation = lazy(() => import("@/pages/FirstWinActivation"));

// Revenue Office
import { RevenueOfficeModeProvider } from "@/modules/business/contexts/RevenueOfficeModeContext";
const RevenueOfficeModeLayout = () => <RevenueOfficeModeProvider><Outlet /></RevenueOfficeModeProvider>;
const RevenueGate = lazy(() => import("@/pages/revenue-office/RevenueGate"));
const GrowthBoardroom = lazy(() => import("@/pages/revenue-office/GrowthBoardroom"));
const RelationshipCenter = lazy(() => import("@/pages/revenue-office/RelationshipCenter"));
const PipelineStudio = lazy(() => import("@/pages/revenue-office/PipelineStudio"));
const FunnelBuilder = lazy(() => import("@/pages/revenue-office/FunnelBuilder"));
const CampaignOrchestrator = lazy(() => import("@/pages/revenue-office/CampaignOrchestrator"));
const BookingCenter = lazy(() => import("@/pages/revenue-office/BookingCenter"));
const OffersWorkspace = lazy(() => import("@/pages/revenue-office/OffersWorkspace"));
const ReputationEngine = lazy(() => import("@/pages/revenue-office/ReputationEngine"));
const RevenueIntelligence = lazy(() => import("@/pages/revenue-office/RevenueIntelligence"));
const RetentionOffice = lazy(() => import("@/pages/revenue-office/RetentionOffice"));
const GrowthAdvisorBoard = lazy(() => import("@/pages/revenue-office/GrowthAdvisorBoard"));
const JourneyTwin = lazy(() => import("@/pages/revenue-office/JourneyTwin"));
const LeakDetector = lazy(() => import("@/pages/revenue-office/LeakDetector"));
const ConversionLab = lazy(() => import("@/pages/revenue-office/ConversionLab"));
const MembershipCourseOffice = lazy(() => import("@/pages/revenue-office/MembershipCourseOffice"));
const OpportunityBoard = lazy(() => import("@/pages/revenue-office/OpportunityBoard"));
const TrustPulse = lazy(() => import("@/pages/revenue-office/TrustPulse"));
const WhiteLabelOffice = lazy(() => import("@/pages/revenue-office/WhiteLabelOffice"));
const BusinessTimeMachine = lazy(() => import("@/pages/revenue-office/BusinessTimeMachine"));
const RevenueDecisionTheater = lazy(() => import("@/pages/revenue-office/RevenueDecisionTheater"));
const WhatBreaksGrowth = lazy(() => import("@/pages/revenue-office/WhatBreaksGrowth"));
const GrowthDNA = lazy(() => import("@/pages/revenue-office/GrowthDNA"));
const GrowthOperatingModes = lazy(() => import("@/pages/revenue-office/GrowthOperatingModes"));
const ChiefRevenueSynthesis = lazy(() => import("@/pages/revenue-office/ChiefRevenueSynthesis"));
const CommercialMemoryFeed = lazy(() => import("@/pages/revenue-office/CommercialMemoryFeed"));
const FormsBuilder = lazy(() => import("@/pages/revenue-office/FormsBuilder"));
const SegmentationEngine = lazy(() => import("@/pages/revenue-office/SegmentationEngine"));
const ClientOnboarding = lazy(() => import("@/pages/revenue-office/ClientOnboarding"));
const AutomationOffice = lazy(() => import("@/pages/revenue-office/AutomationOffice"));
const AutomationBuilder = lazy(() => import("@/pages/revenue-office/AutomationBuilder"));
const AutomationTemplates = lazy(() => import("@/pages/revenue-office/AutomationTemplates"));
const AutomationSimLab = lazy(() => import("@/pages/revenue-office/AutomationSimLab"));
const AutomationHealth = lazy(() => import("@/pages/revenue-office/AutomationHealth"));
const AutomationReceipts = lazy(() => import("@/pages/revenue-office/AutomationReceipts"));
const AutomationPolicy = lazy(() => import("@/pages/revenue-office/AutomationPolicy"));
const QuoteStudio = lazy(() => import("@/pages/revenue-office/QuoteStudio"));
const CallDesk = lazy(() => import("@/pages/revenue-office/CallDesk"));
const BusinessOnboarding = lazy(() => import("@/pages/revenue-office/BusinessOnboarding"));

// Digital Presence
const PresenceGate = lazy(() => import("@/pages/digital-presence/PresenceGate"));
const PresenceBoardroom = lazy(() => import("@/pages/digital-presence/PresenceBoardroom"));
const WebsiteTwin = lazy(() => import("@/pages/digital-presence/WebsiteTwin"));
const SiteBuilder = lazy(() => import("@/pages/digital-presence/SiteBuilder"));
const BrandStudio = lazy(() => import("@/pages/digital-presence/BrandStudio"));
const ConnectedSites = lazy(() => import("@/pages/digital-presence/ConnectedSites"));
const CROOffice = lazy(() => import("@/pages/digital-presence/CROOffice"));
const EcommerceOffice = lazy(() => import("@/pages/digital-presence/EcommerceOffice"));
const PromotionsOffice = lazy(() => import("@/pages/digital-presence/PromotionsOffice"));
const AIWebTeam = lazy(() => import("@/pages/digital-presence/AIWebTeam"));
const ErrorRadar = lazy(() => import("@/pages/digital-presence/ErrorRadar"));
const ContentFreshness = lazy(() => import("@/pages/digital-presence/ContentFreshness"));
const LaunchWarRoom = lazy(() => import("@/pages/digital-presence/LaunchWarRoom"));
const PresenceTimeMachine = lazy(() => import("@/pages/digital-presence/PresenceTimeMachine"));
const SelfHealingQueue = lazy(() => import("@/pages/digital-presence/SelfHealingQueue"));
const AppExperienceStudio = lazy(() => import("@/pages/digital-presence/AppExperienceStudio"));
const PresenceAnalytics = lazy(() => import("@/pages/digital-presence/PresenceAnalytics"));
const DomainPublishManager = lazy(() => import("@/pages/digital-presence/DomainPublishManager"));
const DPOOnboarding = lazy(() => import("@/pages/digital-presence/DPOOnboarding"));

export function getExperimentalRoutes() {
  return (
    <>
      {/* Investment Office: routes moved to investment-routes.tsx +
          investment-office-routes.tsx (Phase 5 — single /investment/* namespace).
          Legacy /investments/* served by USER_REDIRECTS. */}

      {/* Revenue Office */}
      <Route element={<RevenueOfficeModeLayout />}>
        <Route path="/revenue-office" element={<RevenueGate />} />
        <Route path="/revenue-office/boardroom" element={<GrowthBoardroom />} />
        <Route path="/revenue-office/relationships" element={<RelationshipCenter />} />
        <Route path="/revenue-office/pipeline" element={<PipelineStudio />} />
        <Route path="/revenue-office/funnels" element={<FunnelBuilder />} />
        <Route path="/revenue-office/campaigns" element={<CampaignOrchestrator />} />
        <Route path="/revenue-office/bookings" element={<BookingCenter />} />
        <Route path="/revenue-office/offers" element={<OffersWorkspace />} />
        <Route path="/revenue-office/reputation" element={<ReputationEngine />} />
        <Route path="/revenue-office/intelligence" element={<RevenueIntelligence />} />
        <Route path="/revenue-office/retention" element={<RetentionOffice />} />
        <Route path="/revenue-office/advisors" element={<GrowthAdvisorBoard />} />
        <Route path="/revenue-office/journey-twin" element={<JourneyTwin />} />
        <Route path="/revenue-office/leaks" element={<LeakDetector />} />
        <Route path="/revenue-office/conversion-lab" element={<ConversionLab />} />
        <Route path="/revenue-office/memberships" element={<MembershipCourseOffice />} />
        <Route path="/revenue-office/opportunities" element={<OpportunityBoard />} />
        <Route path="/revenue-office/trust-pulse" element={<TrustPulse />} />
        <Route path="/revenue-office/white-label" element={<WhiteLabelOffice />} />
        <Route path="/revenue-office/time-machine" element={<BusinessTimeMachine />} />
        <Route path="/revenue-office/decision-theater" element={<RevenueDecisionTheater />} />
        <Route path="/revenue-office/what-breaks" element={<WhatBreaksGrowth />} />
        <Route path="/revenue-office/growth-dna" element={<GrowthDNA />} />
        <Route path="/revenue-office/operating-modes" element={<GrowthOperatingModes />} />
        <Route path="/revenue-office/synthesis" element={<ChiefRevenueSynthesis />} />
        <Route path="/revenue-office/memory-feed" element={<CommercialMemoryFeed />} />
        <Route path="/revenue-office/forms" element={<FormsBuilder />} />
        <Route path="/revenue-office/segmentation" element={<SegmentationEngine />} />
        <Route path="/revenue-office/client-onboarding" element={<ClientOnboarding />} />
        <Route path="/revenue-office/automation" element={<AutomationOffice />} />
        <Route path="/revenue-office/automation/builder" element={<AutomationBuilder />} />
        <Route path="/revenue-office/automation/templates" element={<AutomationTemplates />} />
        <Route path="/revenue-office/automation/simulation" element={<AutomationSimLab />} />
        <Route path="/revenue-office/automation/health" element={<AutomationHealth />} />
        <Route path="/revenue-office/automation/receipts" element={<AutomationReceipts />} />
        <Route path="/revenue-office/automation/policy" element={<AutomationPolicy />} />
        <Route path="/revenue-office/quotes" element={<QuoteStudio />} />
        <Route path="/revenue-office/calls" element={<CallDesk />} />
        <Route path="/revenue-office/onboarding" element={<BusinessOnboarding />} />
      </Route>

      {/* Digital Presence */}
      <Route path="/digital-presence" element={<PresenceGate />} />
      <Route path="/digital-presence/boardroom" element={<PresenceBoardroom />} />
      <Route path="/digital-presence/twin" element={<WebsiteTwin />} />
      <Route path="/digital-presence/builder" element={<SiteBuilder />} />
      <Route path="/digital-presence/brand-studio" element={<BrandStudio />} />
      <Route path="/digital-presence/connected-sites" element={<ConnectedSites />} />
      <Route path="/digital-presence/cro" element={<CROOffice />} />
      <Route path="/digital-presence/ecommerce" element={<EcommerceOffice />} />
      <Route path="/digital-presence/promotions" element={<PromotionsOffice />} />
      <Route path="/digital-presence/ai-team" element={<AIWebTeam />} />
      <Route path="/digital-presence/radar" element={<ErrorRadar />} />
      <Route path="/digital-presence/content-freshness" element={<ContentFreshness />} />
      <Route path="/digital-presence/launch" element={<LaunchWarRoom />} />
      <Route path="/digital-presence/time-machine" element={<PresenceTimeMachine />} />
      <Route path="/digital-presence/self-healing" element={<SelfHealingQueue />} />
      <Route path="/digital-presence/app-studio" element={<AppExperienceStudio />} />
      <Route path="/digital-presence/analytics" element={<PresenceAnalytics />} />
      <Route path="/digital-presence/domains" element={<DomainPublishManager />} />
      <Route path="/digital-presence/onboarding" element={<DPOOnboarding />} />

      {/* Pack Store */}
      <Route path="/store" element={<PackStorePage />} />
      <Route path="/store/featured" element={<PackStorePage />} />
      <Route path="/store/installed" element={<PackInstalledPage />} />
      <Route path="/store/analytics" element={<StoreAnalyticsPage />} />
      <Route path="/store/packs/:packId" element={<PackDetailPage />} />
      <Route path="/store/apps/:appId" element={<OldAppDetailPage />} />
      <Route path="/store/founders" element={<StoreCategoryPage />} />
      <Route path="/store/families" element={<StoreCategoryPage />} />
      <Route path="/store/finance" element={<StoreCategoryPage />} />
      <Route path="/store/connectors" element={<StoreCategoryPage />} />
      <Route path="/store/surfaces" element={<StoreCategoryPage />} />
      <Route path="/store/:segment" element={<StoreCategoryPage />} />

      {/* App Platform — redirect shim to windowed app */}
      <Route path="/app-store/*" element={<AppStoreCenter />} />

      {/* Digital Twins & Intelligence */}
      <Route path="/digital-twins" element={<DigitalTwinsPage />} />
      <Route path="/digital-twins/business" element={<DigitalTwinsPage />} />
      <Route path="/digital-twins/money" element={<DigitalTwinsPage />} />
      <Route path="/digital-twins/household" element={<DigitalTwinsPage />} />
      <Route path="/scenario-lab" element={<ScenarioLabPage />} />
      <Route path="/ai-economics" element={<AIEconomicsPage />} />
      <Route path="/recovered-value" element={<RecoveredValuePage />} />
    </>
  );
}
