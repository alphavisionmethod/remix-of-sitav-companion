# SITA OS — Master Deployment Audit

> Generated: 2026-04-16
> Scope: EVERY file in the project tree — full wiring, implementation, and deployment readiness assessment
> Total files: 5152

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total project files | 5152 |
| Source files (src/) | 4282 |
| User-facing pages | 452 |
| Admin pages | 503 |
| Components | 897 |
| Hooks | 150 |
| Contexts | 22 |
| Route families | 14 |
| Packages (contracts) | 448 |
| Library modules (src/lib/) | 73 dirs |
| Edge functions | 74 |
| DB migrations | 161 |
| Scripts | 304 |
| Generated artifacts | 67 |
| Documentation files | 55 |
| Deploy artifacts | 23 |
| Infrastructure configs | 19 |
| Electron files | 6 |
| CI workflows | 9 |

---

## Section 1 — Root Configuration Files

- `.env`
- `.env.example`
- `.env.production.example`
- `.git`
- `.gitignore`
- `Dockerfile`
- `Makefile`
- `README.md`
- `components.json`
- `description.md`
- `docker-compose.dev.yml`
- `docker-compose.yml`
- `eslint.config.js`
- `index.html`
- `package.json`
- `playwright-fixture.ts`
- `playwright.config.ts`
- `postcss.config.js`
- `tailwind.config.ts`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vitest.config.ts`

---

## Section 2 — Source Tree (src/)

Total: 4282 files

### 2.1 User Pages (src/pages/)

- `src/pages/AIEconomicsPage.tsx`
- `src/pages/AIWorkforcePage.tsx`
- `src/pages/AchievementsPage.tsx`
- `src/pages/ActivityStream.tsx`
- `src/pages/AdminCenter.tsx`
- `src/pages/AgentActivityDashboard.tsx`
- `src/pages/AppStoreCenter.tsx`
- `src/pages/ApprovalChamber.tsx`
- `src/pages/ApprovalsCenter.tsx`
- `src/pages/AutomationCenter.tsx`
- `src/pages/Boardroom.tsx`
- `src/pages/BusinessCenter.tsx`
- `src/pages/CalendarWorkspace.tsx`
- `src/pages/CalmFocusMode.tsx`
- `src/pages/CapitalAllocationPage.tsx`
- `src/pages/ClipboardHistory.tsx`
- `src/pages/CommandHistory.tsx`
- `src/pages/CommunicationInbox.tsx`
- `src/pages/CommunicationsPage.tsx`
- `src/pages/ConciergeCenter.tsx`
- `src/pages/ConnectorHub.tsx`
- `src/pages/CustomerDetail.tsx`
- `src/pages/CustomerHealthPage.tsx`
- `src/pages/DailyPulse.tsx`
- `src/pages/DesktopPage.tsx`
- `src/pages/DigitalTwinsPage.tsx`
- `src/pages/DocumentEditor.tsx`
- `src/pages/DownloadsCenter.tsx`
- `src/pages/EnterpriseMaturityDashboard.tsx`
- `src/pages/EnvironmentSwitcher.tsx`
- `src/pages/FilesCenter.tsx`
- `src/pages/FirstBootSetup.tsx`
- `src/pages/FirstWinActivation.tsx`
- `src/pages/GlobalBoardroom.tsx`
- `src/pages/GovernanceDashboard.tsx`
- `src/pages/ImportExportCenter.tsx`
- `src/pages/InboxCapture.tsx`
- `src/pages/IntegrationConcierge.tsx`
- `src/pages/LandingPage.tsx`
- `src/pages/LearnLaterPage.tsx`
- `src/pages/LifeDashboard.tsx`
- `src/pages/LifeSimulator.tsx`
- `src/pages/MediaWorkspace.tsx`
- `src/pages/MemoryCenter.tsx`
- `src/pages/MoneyCenter.tsx`
- `src/pages/MoneyOnboarding.tsx`
- `src/pages/MyActivity.tsx`
- `src/pages/NetworkUtility.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/NotesWorkspace.tsx`
- `src/pages/NotificationCenter.tsx`
- `src/pages/NotificationSettingsPage.tsx`
- `src/pages/ObservabilityPage.tsx`
- `src/pages/Onboarding.tsx`
- `src/pages/OnboardingWrapper.tsx`
- `src/pages/OpportunityEngine.tsx`
- `src/pages/OutcomeEnginePage.tsx`
- `src/pages/OwnerCenter.tsx`
- `src/pages/PDFViewerWorkspace.tsx`
- `src/pages/PeopleWorkspace.tsx`
- `src/pages/PermissionsCenter.tsx`
- `src/pages/PersonalBrain.tsx`
- `src/pages/PersonalLifeWorkspace.tsx`
- `src/pages/PersonalizationStudio.tsx`
- `src/pages/PlanningCanvas.tsx`
- `src/pages/PolicyEditor.tsx`
- `src/pages/PolicySimulatorHub.tsx`
- `src/pages/PrintScanCenter.tsx`
- `src/pages/ProductivityHub.tsx`
- `src/pages/ProofCenter.tsx`
- `src/pages/RecoveredValuePage.tsx`
- `src/pages/RecoveryCenter.tsx`
- `src/pages/ReportingWorkspace.tsx`
- `src/pages/RevenueCallingPage.tsx`
- `src/pages/ScenarioLabPage.tsx`
- `src/pages/SearchPage.tsx`
- `src/pages/ServiceArchitectureDashboard.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/SimulationEnginePage.tsx`
- `src/pages/SovereignExportPage.tsx`
- `src/pages/SpilloverDashboard.tsx`
- `src/pages/SpreadsheetWorkspace.tsx`
- `src/pages/StorageManager.tsx`
- `src/pages/SystemStatus.tsx`
- `src/pages/TasksWorkflowsCenter.tsx`
- `src/pages/TeamWorkspace.tsx`
- `src/pages/TemplateCenter.tsx`
- `src/pages/TimeMachinePage.tsx`
- `src/pages/TrustCenter.tsx`
- `src/pages/UpdateCenter.tsx`
- `src/pages/UserProfilePage.tsx`
- `src/pages/UsersAdminPage.tsx`
- `src/pages/WealthCommandCenter.tsx`
- `src/pages/WeeklyBoardroom.tsx`
- `src/pages/WorkflowReplayHub.tsx`
- `src/pages/WorkflowsCenter.tsx`
- `src/pages/advisors/AdvisorCouncilDashboard.tsx`
- `src/pages/advisors/AdvisorRegistry.tsx`
- `src/pages/advisors/AdvisorWorkspace.tsx`
- `src/pages/advisors/CalmAssistantChat.tsx`
- `src/pages/app-platform/AppAssociationsPage.tsx`
- `src/pages/app-platform/AppComparePage.tsx`
- `src/pages/app-platform/AppDetailPage.tsx`
- `src/pages/app-platform/AppLibraryPage.tsx`
- `src/pages/app-platform/AppManagePage.tsx`
- `src/pages/app-platform/AppPermissionsCenterPage.tsx`
- `src/pages/app-platform/AppReceiptDetailPage.tsx`
- `src/pages/app-platform/AppReceiptsPage.tsx`
- `src/pages/app-platform/AppStorePage.tsx`
- `src/pages/app-platform/AppUpdatesPage.tsx`
- `src/pages/app-platform/BundleDetailPage.tsx`
- `src/pages/app-platform/DevToolsCatalogPage.tsx`
- `src/pages/app-platform/EnterpriseCatalogPage.tsx`
- `src/pages/app-platform/ExternalInstallerPage.tsx`
- `src/pages/app-platform/FirstLaunchPage.tsx`
- `src/pages/app-platform/OpenWithPage.tsx`
- `src/pages/app-platform/WebAppInstallPage.tsx`
- `src/pages/apps/EmailApp.tsx`
- `src/pages/apps/GalleryApp.tsx`
- `src/pages/apps/HealthApp.tsx`
- `src/pages/apps/MessengerApp.tsx`
- `src/pages/apps/VaultApp.tsx`
- `src/pages/apps/WeatherNewsApp.tsx`
- `src/pages/atlas/AdminDurabilityBoard.tsx`
- `src/pages/atlas/AtlasHub.tsx`
- `src/pages/atlas/ConciergeCommandCenter.tsx`
- `src/pages/atlas/ConnectorControlCenter.tsx`
- `src/pages/atlas/DataProtectionPosture.tsx`
- `src/pages/atlas/DeploymentTruthCenter.tsx`
- `src/pages/atlas/OperationalInfraMonitor.tsx`
- `src/pages/atlas/OperationsCommandCenter.tsx`
- `src/pages/atlas/PlatformTruthRegistry.tsx`
- `src/pages/atlas/ProjectionControlCenter.tsx`
- `src/pages/atlas/ProofCoverageBoard.tsx`
- `src/pages/atlas/ValidationCommandCenter.tsx`
- `src/pages/auth/ForgotPassword.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/ResetPassword.tsx`
- `src/pages/auth/Signup.tsx`
- `src/pages/boardroom/BoardroomHistory.tsx`
- `src/pages/boardroom/BoardroomReplay.tsx`
- `src/pages/business/AppointmentsScheduling.tsx`
- `src/pages/business/AutopilotHub.tsx`
- `src/pages/business/BackgroundTaskCenter.tsx`
- `src/pages/business/BusinessAdvisorBoardPage.tsx`
- `src/pages/business/BusinessBoardroom.tsx`
- `src/pages/business/BusinessDocuments.tsx`
- `src/pages/business/BusinessOperations.tsx`
- `src/pages/business/BusinessOverview.tsx`
- `src/pages/business/BusinessProof.tsx`
- `src/pages/business/BusinessSettingsPage.tsx`
- `src/pages/business/CRMAdvisorPage.tsx`
- `src/pages/business/CRMAutomations.tsx`
- `src/pages/business/CRMCommunications.tsx`
- `src/pages/business/CRMCompanies.tsx`
- `src/pages/business/CRMContacts.tsx`
- `src/pages/business/CRMCustomFieldsPage.tsx`
- `src/pages/business/CRMDuplicates.tsx`
- `src/pages/business/CRMHealth.tsx`
- `src/pages/business/CRMHome.tsx`
- `src/pages/business/CRMImportCenter.tsx`
- `src/pages/business/CRMIntegrationHub.tsx`
- `src/pages/business/CRMNotes.tsx`
- `src/pages/business/CRMPipeline.tsx`
- `src/pages/business/CRMSegments.tsx`
- `src/pages/business/CRMTasks.tsx`
- `src/pages/business/CRMTimeline.tsx`
- `src/pages/business/CollectionsCommandCenter.tsx`
- `src/pages/business/CommunicationsCenter.tsx`
- `src/pages/business/CustomerSupportCenter.tsx`
- `src/pages/business/CustomersPage.tsx`
- `src/pages/business/DealRoom.tsx`
- `src/pages/business/EcommerceManager.tsx`
- `src/pages/business/EndOfDayClosure.tsx`
- `src/pages/business/FollowThroughCenter.tsx`
- `src/pages/business/InvoicesCollections.tsx`
- `src/pages/business/LeadRecovery.tsx`
- `src/pages/business/LeadsInbox.tsx`
- `src/pages/business/MorningBriefing.tsx`
- `src/pages/business/OpportunitiesCenter.tsx`
- `src/pages/business/PlaybookBuilder.tsx`
- `src/pages/business/ProposalsContracts.tsx`
- `src/pages/business/QuotesWorkspace.tsx`
- `src/pages/business/RelationshipDossier.tsx`
- `src/pages/business/RevenueAutopilot.tsx`
- `src/pages/business/RevenueForecast.tsx`
- `src/pages/business/RevenueImpactDashboard.tsx`
- `src/pages/business/SocialCommand.tsx`
- `src/pages/business/StrategicAccountRoom.tsx`
- `src/pages/business/WebsiteBuilder.tsx`
- `src/pages/concierge/AppointmentsPrep.tsx`
- `src/pages/concierge/ConciergeBoardroom.tsx`
- `src/pages/concierge/ConciergeFiles.tsx`
- `src/pages/concierge/ConciergeOverview.tsx`
- `src/pages/concierge/ConciergeProof.tsx`
- `src/pages/concierge/ConciergeSettings.tsx`
- `src/pages/concierge/ConciergeWorkflows.tsx`
- `src/pages/concierge/ErrandsLogistics.tsx`
- `src/pages/concierge/EventsGifts.tsx`
- `src/pages/concierge/FamilyBoardroom.tsx`
- `src/pages/concierge/FamilyCalendar.tsx`
- `src/pages/concierge/GroceryPlanning.tsx`
- `src/pages/concierge/HouseholdCommandCenter.tsx`
- `src/pages/concierge/HouseholdTasks.tsx`
- `src/pages/concierge/LifeAdminCenter.tsx`
- `src/pages/concierge/MonthGridCalendar.tsx`
- `src/pages/concierge/RecurringObligations.tsx`
- `src/pages/concierge/SchoolActivities.tsx`
- `src/pages/concierge/ServiceProviders.tsx`
- `src/pages/concierge/TravelPlanning.tsx`
- `src/pages/concierge/UpcomingNeeds.tsx`
- `src/pages/digital-presence/AIWebTeam.tsx`
- `src/pages/digital-presence/AppExperienceStudio.tsx`
- `src/pages/digital-presence/BrandStudio.tsx`
- `src/pages/digital-presence/CROOffice.tsx`
- `src/pages/digital-presence/ConnectedSites.tsx`
- `src/pages/digital-presence/ContentFreshness.tsx`
- `src/pages/digital-presence/DPOOnboarding.tsx`
- `src/pages/digital-presence/DPOSubNav.tsx`
- `src/pages/digital-presence/DomainPublishManager.tsx`
- `src/pages/digital-presence/EcommerceOffice.tsx`
- `src/pages/digital-presence/ErrorRadar.tsx`
- `src/pages/digital-presence/LaunchWarRoom.tsx`
- `src/pages/digital-presence/PresenceAnalytics.tsx`
- `src/pages/digital-presence/PresenceBoardroom.tsx`
- `src/pages/digital-presence/PresenceGate.tsx`
- `src/pages/digital-presence/PresenceTimeMachine.tsx`
- `src/pages/digital-presence/PromotionsOffice.tsx`
- `src/pages/digital-presence/SelfHealingQueue.tsx`
- `src/pages/digital-presence/SiteBuilder.tsx`
- `src/pages/digital-presence/WebsiteTwin.tsx`
- `src/pages/enterprise/EnterpriseControlPlane.tsx`
- `src/pages/files/FilesAll.tsx`
- `src/pages/files/FilesExplorer.tsx`
- `src/pages/files/FilesMemoryReview.tsx`
- `src/pages/files/FilesOverview.tsx`
- `src/pages/files/FilesProcessing.tsx`
- `src/pages/files/FilesReview.tsx`
- `src/pages/files/FilesSearch.tsx`
- `src/pages/files/FilesSensitive.tsx`
- `src/pages/files/FilesSettings.tsx`
- `src/pages/integrations/ActionsApprovals.tsx`
- `src/pages/integrations/ConnectionDetail.tsx`
- `src/pages/integrations/ConnectionsList.tsx`
- `src/pages/integrations/IntegrationsCatalog.tsx`
- `src/pages/integrations/ProviderDetail.tsx`
- `src/pages/intelligence/DeviceMeshPanel.tsx`
- `src/pages/intelligence/IntelligenceDashboard.tsx`
- `src/pages/intelligence/PrivacyControlCenter.tsx`
- `src/pages/investment-office/AdvancedMode.tsx`
- `src/pages/investment-office/AdvisorBoard.tsx`
- `src/pages/investment-office/BeginnerMode.tsx`
- `src/pages/investment-office/BehavioralFirewall.tsx`
- `src/pages/investment-office/CapitalPurpose.tsx`
- `src/pages/investment-office/CapitalTwin.tsx`
- `src/pages/investment-office/CatalystWarRoom.tsx`
- `src/pages/investment-office/ConvictionEngine.tsx`
- `src/pages/investment-office/CrossAssetStoryEngine.tsx`
- `src/pages/investment-office/DecisionReadiness.tsx`
- `src/pages/investment-office/DecisionTheater.tsx`
- `src/pages/investment-office/DisagreementEngine.tsx`
- `src/pages/investment-office/EventMarketsWorkspace.tsx`
- `src/pages/investment-office/EventProbabilityLab.tsx`
- `src/pages/investment-office/ExecutionDesk.tsx`
- `src/pages/investment-office/FamilyOffice.tsx`
- `src/pages/investment-office/InstrumentDetail.tsx`
- `src/pages/investment-office/IntelligenceDossier.tsx`
- `src/pages/investment-office/InvestmentBoardroom.tsx`
- `src/pages/investment-office/InvestmentConstitution.tsx`
- `src/pages/investment-office/InvestmentGate.tsx`
- `src/pages/investment-office/InvestmentReceipts.tsx`
- `src/pages/investment-office/KnowledgeGraph.tsx`
- `src/pages/investment-office/MarketExplorer.tsx`
- `src/pages/investment-office/MarketMemoryFeed.tsx`
- `src/pages/investment-office/OperatingModes.tsx`
- `src/pages/investment-office/OpportunityMap.tsx`
- `src/pages/investment-office/PlatformConnections.tsx`
- `src/pages/investment-office/PortfolioOffice.tsx`
- `src/pages/investment-office/PositionSizingCoach.tsx`
- `src/pages/investment-office/PostTradeLoop.tsx`
- `src/pages/investment-office/ResearchLibrary.tsx`
- `src/pages/investment-office/RiskOffice.tsx`
- `src/pages/investment-office/StrategyDNA.tsx`
- `src/pages/investment-office/StrategyStudio.tsx`
- `src/pages/investment-office/ThesisJournal.tsx`
- `src/pages/investment-office/TimeMachineReview.tsx`
- `src/pages/investment-office/TradingFloor.tsx`
- `src/pages/investment-office/WarRoom.tsx`
- `src/pages/investment-office/WatchlistsSignals.tsx`
- `src/pages/investment-office/WhatWouldBreak.tsx`
- `src/pages/mission-control/MissionControlPage.tsx`
- `src/pages/mission-control/PlatformTruthDashboard.tsx`
- `src/pages/mission/ConnectorDetailPage.tsx`
- `src/pages/mission/IncidentDetailPage.tsx`
- `src/pages/mission/MissionErrorPage.tsx`
- `src/pages/mission/MissionOverviewPage.tsx`
- `src/pages/mission/MissionRegistryPage.tsx`
- `src/pages/mission/MissionReleaseDetailPage.tsx`
- `src/pages/mission/MissionWorkflowReplayPage.tsx`
- `src/pages/mission/PolicySimulatorPage.tsx`
- `src/pages/mobile/MobileAIChat.tsx`
- `src/pages/mobile/MobileAlerts.tsx`
- `src/pages/mobile/MobileApprovalDetail.tsx`
- `src/pages/mobile/MobileApprovals.tsx`
- `src/pages/mobile/MobileBoardroom.tsx`
- `src/pages/mobile/MobileBusiness.tsx`
- `src/pages/mobile/MobileCommand.tsx`
- `src/pages/mobile/MobileConcierge.tsx`
- `src/pages/mobile/MobileDeviceTrust.tsx`
- `src/pages/mobile/MobileEmergencyActions.tsx`
- `src/pages/mobile/MobileFiles.tsx`
- `src/pages/mobile/MobileHome.tsx`
- `src/pages/mobile/MobileInbox.tsx`
- `src/pages/mobile/MobileInvestment.tsx`
- `src/pages/mobile/MobileMoney.tsx`
- `src/pages/mobile/MobileMore.tsx`
- `src/pages/mobile/MobileNotificationCenter.tsx`
- `src/pages/mobile/MobileProof.tsx`
- `src/pages/mobile/MobileQuickCapture.tsx`
- `src/pages/mobile/MobileReceiptDetail.tsx`
- `src/pages/mobile/MobileSettings.tsx`
- `src/pages/mobile/MobileSyncControl.tsx`
- `src/pages/mobile/MobileSystemMonitor.tsx`
- `src/pages/mobile/MobileTimeline.tsx`
- `src/pages/mobile/MobileWorkflowDetail.tsx`
- `src/pages/money/BillsWorkspace.tsx`
- `src/pages/money/BudgetEnvelopeOffice.tsx`
- `src/pages/money/CashAllocator.tsx`
- `src/pages/money/CashTiming.tsx`
- `src/pages/money/DebtCreditOffice.tsx`
- `src/pages/money/FinanceAutomations.tsx`
- `src/pages/money/FinanceBoardroom.tsx`
- `src/pages/money/FinancialBoundaryMonitor.tsx`
- `src/pages/money/FinancialHealthPulse.tsx`
- `src/pages/money/HouseholdMoneyOffice.tsx`
- `src/pages/money/InvestmentOffice.tsx`
- `src/pages/money/LifeMoneyEngine.tsx`
- `src/pages/money/MoneyAdvisorBoard.tsx`
- `src/pages/money/MoneyApprovals.tsx`
- `src/pages/money/MoneyBoardroom.tsx`
- `src/pages/money/MoneyDocuments.tsx`
- `src/pages/money/MoneyModes.tsx`
- `src/pages/money/MoneyOverview.tsx`
- `src/pages/money/MoneyProof.tsx`
- `src/pages/money/MoneyRituals.tsx`
- `src/pages/money/MoneySettings.tsx`
- `src/pages/money/NetWorthOffice.tsx`
- `src/pages/money/OpportunityCost.tsx`
- `src/pages/money/PeaceScore.tsx`
- `src/pages/money/ReceivablesObligations.tsx`
- `src/pages/money/ReconciliationReview.tsx`
- `src/pages/money/ReservesSavings.tsx`
- `src/pages/money/ScenarioPlanner.tsx`
- `src/pages/money/SpendingPulse.tsx`
- `src/pages/money/StressRadar.tsx`
- `src/pages/money/SubscriptionsWaste.tsx`
- `src/pages/money/TaxEstimator.tsx`
- `src/pages/money/TransactionIntelligence.tsx`
- `src/pages/money/TrustGraph.tsx`
- `src/pages/owner-mode/OwnerModePage.tsx`
- `src/pages/owner/AdvisorConfig.tsx`
- `src/pages/owner/ConstitutionEditor.tsx`
- `src/pages/owner/LeaseDashboard.tsx`
- `src/pages/owner/OwnerAiTeamUpdatesPage.tsx`
- `src/pages/owner/OwnerApprovalsPage.tsx`
- `src/pages/owner/OwnerPulsePage.tsx`
- `src/pages/owner/PackEditor.tsx`
- `src/pages/owner/PricingEditor.tsx`
- `src/pages/owner/ReleaseDeploymentWorkspace.tsx`
- `src/pages/revenue-office/AutomationBuilder.tsx`
- `src/pages/revenue-office/AutomationHealth.tsx`
- `src/pages/revenue-office/AutomationOffice.tsx`
- `src/pages/revenue-office/AutomationPolicy.tsx`
- `src/pages/revenue-office/AutomationReceipts.tsx`
- `src/pages/revenue-office/AutomationSimLab.tsx`
- `src/pages/revenue-office/AutomationSubNav.tsx`
- `src/pages/revenue-office/AutomationTemplates.tsx`
- `src/pages/revenue-office/BookingCenter.tsx`
- `src/pages/revenue-office/BusinessOnboarding.tsx`
- `src/pages/revenue-office/BusinessTimeMachine.tsx`
- `src/pages/revenue-office/CallDesk.tsx`
- `src/pages/revenue-office/CampaignOrchestrator.tsx`
- `src/pages/revenue-office/ChiefRevenueSynthesis.tsx`
- `src/pages/revenue-office/ClientOnboarding.tsx`
- `src/pages/revenue-office/CommercialMemoryFeed.tsx`
- `src/pages/revenue-office/ConversionLab.tsx`
- `src/pages/revenue-office/FormsBuilder.tsx`
- `src/pages/revenue-office/FunnelBuilder.tsx`
- `src/pages/revenue-office/GrowthAdvisorBoard.tsx`
- `src/pages/revenue-office/GrowthBoardroom.tsx`
- `src/pages/revenue-office/GrowthDNA.tsx`
- `src/pages/revenue-office/GrowthOperatingModes.tsx`
- `src/pages/revenue-office/JourneyTwin.tsx`
- `src/pages/revenue-office/LeakDetector.tsx`
- `src/pages/revenue-office/MembershipCourseOffice.tsx`
- `src/pages/revenue-office/OffersWorkspace.tsx`
- `src/pages/revenue-office/OpportunityBoard.tsx`
- `src/pages/revenue-office/PipelineStudio.tsx`
- `src/pages/revenue-office/QuoteStudio.tsx`
- `src/pages/revenue-office/RelationshipCenter.tsx`
- `src/pages/revenue-office/ReputationEngine.tsx`
- `src/pages/revenue-office/RetentionOffice.tsx`
- `src/pages/revenue-office/RevenueDecisionTheater.tsx`
- `src/pages/revenue-office/RevenueGate.tsx`
- `src/pages/revenue-office/RevenueIntelligence.tsx`
- `src/pages/revenue-office/SegmentationEngine.tsx`
- `src/pages/revenue-office/TrustPulse.tsx`
- `src/pages/revenue-office/WhatBreaksGrowth.tsx`
- `src/pages/revenue-office/WhiteLabelOffice.tsx`
- `src/pages/revenue-office/onboarding/FormationShell.tsx`
- `src/pages/revenue-office/onboarding/LiveOfficeSidebar.tsx`
- `src/pages/revenue-office/onboarding/primitives.tsx`
- `src/pages/revenue-office/onboarding/screens/AcquisitionScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/AdvisorActivationScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ArtifactScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/AutomationScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/BranchingQuestionsPanel.tsx`
- `src/pages/revenue-office/onboarding/screens/CeremonyScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ConnectionsScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ConversionScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/DeliveryScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/FileImportScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/FirstWinScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/FrictionScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/IdentityScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/IntakeHubScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/JourneyScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ReconciliationScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/RevealScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/RevenueModelScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ShapeSummaryScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/SitaInsightCallout.tsx`
- `src/pages/revenue-office/onboarding/screens/TeamScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/URLIntakeScreen.tsx`
- `src/pages/settings/AccessibilitySettings.tsx`
- `src/pages/settings/DeviceSettings.tsx`
- `src/pages/settings/GoogleConnectedAccounts.tsx`
- `src/pages/settings/MyPlanUsage.tsx`
- `src/pages/settings/NotificationPreferences.tsx`
- `src/pages/settings/TrustedDeviceManager.tsx`
- `src/pages/settings/UserCloudSettings.tsx`
- `src/pages/store/PackDetailPage.tsx`
- `src/pages/store/PackInstalledPage.tsx`
- `src/pages/store/PackStorePage.tsx`
- `src/pages/store/StoreAnalyticsPage.tsx`
- `src/pages/store/StoreAppDetailPage.tsx`
- `src/pages/store/StoreCategoryPage.tsx`
- `src/pages/workspace/DocsWorkspace.tsx`
- `src/pages/workspace/OperatorWorkspace.tsx`
- `src/pages/workspace/PrincipalWorkspace.tsx`
- `src/pages/workspace/SheetsWorkspace.tsx`
- `src/pages/workspace/SlidesWorkspace.tsx`

#### advisors/ (4 files)

- `src/pages/advisors/AdvisorCouncilDashboard.tsx`
- `src/pages/advisors/AdvisorRegistry.tsx`
- `src/pages/advisors/AdvisorWorkspace.tsx`
- `src/pages/advisors/CalmAssistantChat.tsx`

#### app-platform/ (17 files)

- `src/pages/app-platform/AppAssociationsPage.tsx`
- `src/pages/app-platform/AppComparePage.tsx`
- `src/pages/app-platform/AppDetailPage.tsx`
- `src/pages/app-platform/AppLibraryPage.tsx`
- `src/pages/app-platform/AppManagePage.tsx`
- `src/pages/app-platform/AppPermissionsCenterPage.tsx`
- `src/pages/app-platform/AppReceiptDetailPage.tsx`
- `src/pages/app-platform/AppReceiptsPage.tsx`
- `src/pages/app-platform/AppStorePage.tsx`
- `src/pages/app-platform/AppUpdatesPage.tsx`
- `src/pages/app-platform/BundleDetailPage.tsx`
- `src/pages/app-platform/DevToolsCatalogPage.tsx`
- `src/pages/app-platform/EnterpriseCatalogPage.tsx`
- `src/pages/app-platform/ExternalInstallerPage.tsx`
- `src/pages/app-platform/FirstLaunchPage.tsx`
- `src/pages/app-platform/OpenWithPage.tsx`
- `src/pages/app-platform/WebAppInstallPage.tsx`

#### apps/ (6 files)

- `src/pages/apps/EmailApp.tsx`
- `src/pages/apps/GalleryApp.tsx`
- `src/pages/apps/HealthApp.tsx`
- `src/pages/apps/MessengerApp.tsx`
- `src/pages/apps/VaultApp.tsx`
- `src/pages/apps/WeatherNewsApp.tsx`

#### atlas/ (12 files)

- `src/pages/atlas/AdminDurabilityBoard.tsx`
- `src/pages/atlas/AtlasHub.tsx`
- `src/pages/atlas/ConciergeCommandCenter.tsx`
- `src/pages/atlas/ConnectorControlCenter.tsx`
- `src/pages/atlas/DataProtectionPosture.tsx`
- `src/pages/atlas/DeploymentTruthCenter.tsx`
- `src/pages/atlas/OperationalInfraMonitor.tsx`
- `src/pages/atlas/OperationsCommandCenter.tsx`
- `src/pages/atlas/PlatformTruthRegistry.tsx`
- `src/pages/atlas/ProjectionControlCenter.tsx`
- `src/pages/atlas/ProofCoverageBoard.tsx`
- `src/pages/atlas/ValidationCommandCenter.tsx`

#### auth/ (4 files)

- `src/pages/auth/ForgotPassword.tsx`
- `src/pages/auth/Login.tsx`
- `src/pages/auth/ResetPassword.tsx`
- `src/pages/auth/Signup.tsx`

#### boardroom/ (2 files)

- `src/pages/boardroom/BoardroomHistory.tsx`
- `src/pages/boardroom/BoardroomReplay.tsx`

#### business/ (49 files)

- `src/pages/business/AppointmentsScheduling.tsx`
- `src/pages/business/AutopilotHub.tsx`
- `src/pages/business/BackgroundTaskCenter.tsx`
- `src/pages/business/BusinessAdvisorBoardPage.tsx`
- `src/pages/business/BusinessBoardroom.tsx`
- `src/pages/business/BusinessDocuments.tsx`
- `src/pages/business/BusinessOperations.tsx`
- `src/pages/business/BusinessOverview.tsx`
- `src/pages/business/BusinessProof.tsx`
- `src/pages/business/BusinessSettingsPage.tsx`
- `src/pages/business/CRMAdvisorPage.tsx`
- `src/pages/business/CRMAutomations.tsx`
- `src/pages/business/CRMCommunications.tsx`
- `src/pages/business/CRMCompanies.tsx`
- `src/pages/business/CRMContacts.tsx`
- `src/pages/business/CRMCustomFieldsPage.tsx`
- `src/pages/business/CRMDuplicates.tsx`
- `src/pages/business/CRMHealth.tsx`
- `src/pages/business/CRMHome.tsx`
- `src/pages/business/CRMImportCenter.tsx`
- `src/pages/business/CRMIntegrationHub.tsx`
- `src/pages/business/CRMNotes.tsx`
- `src/pages/business/CRMPipeline.tsx`
- `src/pages/business/CRMSegments.tsx`
- `src/pages/business/CRMTasks.tsx`
- `src/pages/business/CRMTimeline.tsx`
- `src/pages/business/CollectionsCommandCenter.tsx`
- `src/pages/business/CommunicationsCenter.tsx`
- `src/pages/business/CustomerSupportCenter.tsx`
- `src/pages/business/CustomersPage.tsx`
- `src/pages/business/DealRoom.tsx`
- `src/pages/business/EcommerceManager.tsx`
- `src/pages/business/EndOfDayClosure.tsx`
- `src/pages/business/FollowThroughCenter.tsx`
- `src/pages/business/InvoicesCollections.tsx`
- `src/pages/business/LeadRecovery.tsx`
- `src/pages/business/LeadsInbox.tsx`
- `src/pages/business/MorningBriefing.tsx`
- `src/pages/business/OpportunitiesCenter.tsx`
- `src/pages/business/PlaybookBuilder.tsx`
- `src/pages/business/ProposalsContracts.tsx`
- `src/pages/business/QuotesWorkspace.tsx`
- `src/pages/business/RelationshipDossier.tsx`
- `src/pages/business/RevenueAutopilot.tsx`
- `src/pages/business/RevenueForecast.tsx`
- `src/pages/business/RevenueImpactDashboard.tsx`
- `src/pages/business/SocialCommand.tsx`
- `src/pages/business/StrategicAccountRoom.tsx`
- `src/pages/business/WebsiteBuilder.tsx`

#### concierge/ (21 files)

- `src/pages/concierge/AppointmentsPrep.tsx`
- `src/pages/concierge/ConciergeBoardroom.tsx`
- `src/pages/concierge/ConciergeFiles.tsx`
- `src/pages/concierge/ConciergeOverview.tsx`
- `src/pages/concierge/ConciergeProof.tsx`
- `src/pages/concierge/ConciergeSettings.tsx`
- `src/pages/concierge/ConciergeWorkflows.tsx`
- `src/pages/concierge/ErrandsLogistics.tsx`
- `src/pages/concierge/EventsGifts.tsx`
- `src/pages/concierge/FamilyBoardroom.tsx`
- `src/pages/concierge/FamilyCalendar.tsx`
- `src/pages/concierge/GroceryPlanning.tsx`
- `src/pages/concierge/HouseholdCommandCenter.tsx`
- `src/pages/concierge/HouseholdTasks.tsx`
- `src/pages/concierge/LifeAdminCenter.tsx`
- `src/pages/concierge/MonthGridCalendar.tsx`
- `src/pages/concierge/RecurringObligations.tsx`
- `src/pages/concierge/SchoolActivities.tsx`
- `src/pages/concierge/ServiceProviders.tsx`
- `src/pages/concierge/TravelPlanning.tsx`
- `src/pages/concierge/UpcomingNeeds.tsx`

#### digital-presence/ (20 files)

- `src/pages/digital-presence/AIWebTeam.tsx`
- `src/pages/digital-presence/AppExperienceStudio.tsx`
- `src/pages/digital-presence/BrandStudio.tsx`
- `src/pages/digital-presence/CROOffice.tsx`
- `src/pages/digital-presence/ConnectedSites.tsx`
- `src/pages/digital-presence/ContentFreshness.tsx`
- `src/pages/digital-presence/DPOOnboarding.tsx`
- `src/pages/digital-presence/DPOSubNav.tsx`
- `src/pages/digital-presence/DomainPublishManager.tsx`
- `src/pages/digital-presence/EcommerceOffice.tsx`
- `src/pages/digital-presence/ErrorRadar.tsx`
- `src/pages/digital-presence/LaunchWarRoom.tsx`
- `src/pages/digital-presence/PresenceAnalytics.tsx`
- `src/pages/digital-presence/PresenceBoardroom.tsx`
- `src/pages/digital-presence/PresenceGate.tsx`
- `src/pages/digital-presence/PresenceTimeMachine.tsx`
- `src/pages/digital-presence/PromotionsOffice.tsx`
- `src/pages/digital-presence/SelfHealingQueue.tsx`
- `src/pages/digital-presence/SiteBuilder.tsx`
- `src/pages/digital-presence/WebsiteTwin.tsx`

#### enterprise/ (1 files)

- `src/pages/enterprise/EnterpriseControlPlane.tsx`

#### files/ (9 files)

- `src/pages/files/FilesAll.tsx`
- `src/pages/files/FilesExplorer.tsx`
- `src/pages/files/FilesMemoryReview.tsx`
- `src/pages/files/FilesOverview.tsx`
- `src/pages/files/FilesProcessing.tsx`
- `src/pages/files/FilesReview.tsx`
- `src/pages/files/FilesSearch.tsx`
- `src/pages/files/FilesSensitive.tsx`
- `src/pages/files/FilesSettings.tsx`

#### integrations/ (5 files)

- `src/pages/integrations/ActionsApprovals.tsx`
- `src/pages/integrations/ConnectionDetail.tsx`
- `src/pages/integrations/ConnectionsList.tsx`
- `src/pages/integrations/IntegrationsCatalog.tsx`
- `src/pages/integrations/ProviderDetail.tsx`

#### intelligence/ (3 files)

- `src/pages/intelligence/DeviceMeshPanel.tsx`
- `src/pages/intelligence/IntelligenceDashboard.tsx`
- `src/pages/intelligence/PrivacyControlCenter.tsx`

#### investment-office/ (41 files)

- `src/pages/investment-office/AdvancedMode.tsx`
- `src/pages/investment-office/AdvisorBoard.tsx`
- `src/pages/investment-office/BeginnerMode.tsx`
- `src/pages/investment-office/BehavioralFirewall.tsx`
- `src/pages/investment-office/CapitalPurpose.tsx`
- `src/pages/investment-office/CapitalTwin.tsx`
- `src/pages/investment-office/CatalystWarRoom.tsx`
- `src/pages/investment-office/ConvictionEngine.tsx`
- `src/pages/investment-office/CrossAssetStoryEngine.tsx`
- `src/pages/investment-office/DecisionReadiness.tsx`
- `src/pages/investment-office/DecisionTheater.tsx`
- `src/pages/investment-office/DisagreementEngine.tsx`
- `src/pages/investment-office/EventMarketsWorkspace.tsx`
- `src/pages/investment-office/EventProbabilityLab.tsx`
- `src/pages/investment-office/ExecutionDesk.tsx`
- `src/pages/investment-office/FamilyOffice.tsx`
- `src/pages/investment-office/InstrumentDetail.tsx`
- `src/pages/investment-office/IntelligenceDossier.tsx`
- `src/pages/investment-office/InvestmentBoardroom.tsx`
- `src/pages/investment-office/InvestmentConstitution.tsx`
- `src/pages/investment-office/InvestmentGate.tsx`
- `src/pages/investment-office/InvestmentReceipts.tsx`
- `src/pages/investment-office/KnowledgeGraph.tsx`
- `src/pages/investment-office/MarketExplorer.tsx`
- `src/pages/investment-office/MarketMemoryFeed.tsx`
- `src/pages/investment-office/OperatingModes.tsx`
- `src/pages/investment-office/OpportunityMap.tsx`
- `src/pages/investment-office/PlatformConnections.tsx`
- `src/pages/investment-office/PortfolioOffice.tsx`
- `src/pages/investment-office/PositionSizingCoach.tsx`
- `src/pages/investment-office/PostTradeLoop.tsx`
- `src/pages/investment-office/ResearchLibrary.tsx`
- `src/pages/investment-office/RiskOffice.tsx`
- `src/pages/investment-office/StrategyDNA.tsx`
- `src/pages/investment-office/StrategyStudio.tsx`
- `src/pages/investment-office/ThesisJournal.tsx`
- `src/pages/investment-office/TimeMachineReview.tsx`
- `src/pages/investment-office/TradingFloor.tsx`
- `src/pages/investment-office/WarRoom.tsx`
- `src/pages/investment-office/WatchlistsSignals.tsx`
- `src/pages/investment-office/WhatWouldBreak.tsx`

#### mission/ (8 files)

- `src/pages/mission/ConnectorDetailPage.tsx`
- `src/pages/mission/IncidentDetailPage.tsx`
- `src/pages/mission/MissionErrorPage.tsx`
- `src/pages/mission/MissionOverviewPage.tsx`
- `src/pages/mission/MissionRegistryPage.tsx`
- `src/pages/mission/MissionReleaseDetailPage.tsx`
- `src/pages/mission/MissionWorkflowReplayPage.tsx`
- `src/pages/mission/PolicySimulatorPage.tsx`

#### mission-control/ (2 files)

- `src/pages/mission-control/MissionControlPage.tsx`
- `src/pages/mission-control/PlatformTruthDashboard.tsx`

#### mobile/ (25 files)

- `src/pages/mobile/MobileAIChat.tsx`
- `src/pages/mobile/MobileAlerts.tsx`
- `src/pages/mobile/MobileApprovalDetail.tsx`
- `src/pages/mobile/MobileApprovals.tsx`
- `src/pages/mobile/MobileBoardroom.tsx`
- `src/pages/mobile/MobileBusiness.tsx`
- `src/pages/mobile/MobileCommand.tsx`
- `src/pages/mobile/MobileConcierge.tsx`
- `src/pages/mobile/MobileDeviceTrust.tsx`
- `src/pages/mobile/MobileEmergencyActions.tsx`
- `src/pages/mobile/MobileFiles.tsx`
- `src/pages/mobile/MobileHome.tsx`
- `src/pages/mobile/MobileInbox.tsx`
- `src/pages/mobile/MobileInvestment.tsx`
- `src/pages/mobile/MobileMoney.tsx`
- `src/pages/mobile/MobileMore.tsx`
- `src/pages/mobile/MobileNotificationCenter.tsx`
- `src/pages/mobile/MobileProof.tsx`
- `src/pages/mobile/MobileQuickCapture.tsx`
- `src/pages/mobile/MobileReceiptDetail.tsx`
- `src/pages/mobile/MobileSettings.tsx`
- `src/pages/mobile/MobileSyncControl.tsx`
- `src/pages/mobile/MobileSystemMonitor.tsx`
- `src/pages/mobile/MobileTimeline.tsx`
- `src/pages/mobile/MobileWorkflowDetail.tsx`

#### money/ (34 files)

- `src/pages/money/BillsWorkspace.tsx`
- `src/pages/money/BudgetEnvelopeOffice.tsx`
- `src/pages/money/CashAllocator.tsx`
- `src/pages/money/CashTiming.tsx`
- `src/pages/money/DebtCreditOffice.tsx`
- `src/pages/money/FinanceAutomations.tsx`
- `src/pages/money/FinanceBoardroom.tsx`
- `src/pages/money/FinancialBoundaryMonitor.tsx`
- `src/pages/money/FinancialHealthPulse.tsx`
- `src/pages/money/HouseholdMoneyOffice.tsx`
- `src/pages/money/InvestmentOffice.tsx`
- `src/pages/money/LifeMoneyEngine.tsx`
- `src/pages/money/MoneyAdvisorBoard.tsx`
- `src/pages/money/MoneyApprovals.tsx`
- `src/pages/money/MoneyBoardroom.tsx`
- `src/pages/money/MoneyDocuments.tsx`
- `src/pages/money/MoneyModes.tsx`
- `src/pages/money/MoneyOverview.tsx`
- `src/pages/money/MoneyProof.tsx`
- `src/pages/money/MoneyRituals.tsx`
- `src/pages/money/MoneySettings.tsx`
- `src/pages/money/NetWorthOffice.tsx`
- `src/pages/money/OpportunityCost.tsx`
- `src/pages/money/PeaceScore.tsx`
- `src/pages/money/ReceivablesObligations.tsx`
- `src/pages/money/ReconciliationReview.tsx`
- `src/pages/money/ReservesSavings.tsx`
- `src/pages/money/ScenarioPlanner.tsx`
- `src/pages/money/SpendingPulse.tsx`
- `src/pages/money/StressRadar.tsx`
- `src/pages/money/SubscriptionsWaste.tsx`
- `src/pages/money/TaxEstimator.tsx`
- `src/pages/money/TransactionIntelligence.tsx`
- `src/pages/money/TrustGraph.tsx`

#### owner/ (9 files)

- `src/pages/owner/AdvisorConfig.tsx`
- `src/pages/owner/ConstitutionEditor.tsx`
- `src/pages/owner/LeaseDashboard.tsx`
- `src/pages/owner/OwnerAiTeamUpdatesPage.tsx`
- `src/pages/owner/OwnerApprovalsPage.tsx`
- `src/pages/owner/OwnerPulsePage.tsx`
- `src/pages/owner/PackEditor.tsx`
- `src/pages/owner/PricingEditor.tsx`
- `src/pages/owner/ReleaseDeploymentWorkspace.tsx`

#### owner-mode/ (1 files)

- `src/pages/owner-mode/OwnerModePage.tsx`

#### revenue-office/ (65 files)

- `src/pages/revenue-office/AutomationBuilder.tsx`
- `src/pages/revenue-office/AutomationHealth.tsx`
- `src/pages/revenue-office/AutomationOffice.tsx`
- `src/pages/revenue-office/AutomationPolicy.tsx`
- `src/pages/revenue-office/AutomationReceipts.tsx`
- `src/pages/revenue-office/AutomationSimLab.tsx`
- `src/pages/revenue-office/AutomationSubNav.tsx`
- `src/pages/revenue-office/AutomationTemplates.tsx`
- `src/pages/revenue-office/BookingCenter.tsx`
- `src/pages/revenue-office/BusinessOnboarding.tsx`
- `src/pages/revenue-office/BusinessTimeMachine.tsx`
- `src/pages/revenue-office/CallDesk.tsx`
- `src/pages/revenue-office/CampaignOrchestrator.tsx`
- `src/pages/revenue-office/ChiefRevenueSynthesis.tsx`
- `src/pages/revenue-office/ClientOnboarding.tsx`
- `src/pages/revenue-office/CommercialMemoryFeed.tsx`
- `src/pages/revenue-office/ConversionLab.tsx`
- `src/pages/revenue-office/FormsBuilder.tsx`
- `src/pages/revenue-office/FunnelBuilder.tsx`
- `src/pages/revenue-office/GrowthAdvisorBoard.tsx`
- `src/pages/revenue-office/GrowthBoardroom.tsx`
- `src/pages/revenue-office/GrowthDNA.tsx`
- `src/pages/revenue-office/GrowthOperatingModes.tsx`
- `src/pages/revenue-office/JourneyTwin.tsx`
- `src/pages/revenue-office/LeakDetector.tsx`
- `src/pages/revenue-office/MembershipCourseOffice.tsx`
- `src/pages/revenue-office/OffersWorkspace.tsx`
- `src/pages/revenue-office/OpportunityBoard.tsx`
- `src/pages/revenue-office/PipelineStudio.tsx`
- `src/pages/revenue-office/QuoteStudio.tsx`
- `src/pages/revenue-office/RelationshipCenter.tsx`
- `src/pages/revenue-office/ReputationEngine.tsx`
- `src/pages/revenue-office/RetentionOffice.tsx`
- `src/pages/revenue-office/RevenueDecisionTheater.tsx`
- `src/pages/revenue-office/RevenueGate.tsx`
- `src/pages/revenue-office/RevenueIntelligence.tsx`
- `src/pages/revenue-office/SegmentationEngine.tsx`
- `src/pages/revenue-office/TrustPulse.tsx`
- `src/pages/revenue-office/WhatBreaksGrowth.tsx`
- `src/pages/revenue-office/WhiteLabelOffice.tsx`
- `src/pages/revenue-office/onboarding/FormationShell.tsx`
- `src/pages/revenue-office/onboarding/LiveOfficeSidebar.tsx`
- `src/pages/revenue-office/onboarding/primitives.tsx`
- `src/pages/revenue-office/onboarding/screens/AcquisitionScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/AdvisorActivationScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ArtifactScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/AutomationScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/BranchingQuestionsPanel.tsx`
- `src/pages/revenue-office/onboarding/screens/CeremonyScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ConnectionsScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ConversionScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/DeliveryScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/FileImportScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/FirstWinScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/FrictionScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/IdentityScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/IntakeHubScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/JourneyScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ReconciliationScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/RevealScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/RevenueModelScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/ShapeSummaryScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/SitaInsightCallout.tsx`
- `src/pages/revenue-office/onboarding/screens/TeamScreen.tsx`
- `src/pages/revenue-office/onboarding/screens/URLIntakeScreen.tsx`

#### settings/ (7 files)

- `src/pages/settings/AccessibilitySettings.tsx`
- `src/pages/settings/DeviceSettings.tsx`
- `src/pages/settings/GoogleConnectedAccounts.tsx`
- `src/pages/settings/MyPlanUsage.tsx`
- `src/pages/settings/NotificationPreferences.tsx`
- `src/pages/settings/TrustedDeviceManager.tsx`
- `src/pages/settings/UserCloudSettings.tsx`

#### store/ (6 files)

- `src/pages/store/PackDetailPage.tsx`
- `src/pages/store/PackInstalledPage.tsx`
- `src/pages/store/PackStorePage.tsx`
- `src/pages/store/StoreAnalyticsPage.tsx`
- `src/pages/store/StoreAppDetailPage.tsx`
- `src/pages/store/StoreCategoryPage.tsx`

#### workspace/ (5 files)

- `src/pages/workspace/DocsWorkspace.tsx`
- `src/pages/workspace/OperatorWorkspace.tsx`
- `src/pages/workspace/PrincipalWorkspace.tsx`
- `src/pages/workspace/SheetsWorkspace.tsx`
- `src/pages/workspace/SlidesWorkspace.tsx`

### 2.2 Admin Pages (src/pages/admin/)

Total: 503 pages across 15 subdirectories

#### Root admin pages (295 files)

- `AIAgentDebate.tsx`
- `AIApprovalDesk.tsx`
- `AIChangePlanViewer.tsx`
- `AIDesignDiffTheater.tsx`
- `AIDesignStudio.tsx`
- `AIEngineeringBoard.tsx`
- `AIEvidenceBundleComposer.tsx`
- `AIFixCenter.tsx`
- `AIG01ProviderRegistry.tsx`
- `AIG02ModelRegistry.tsx`
- `AIG03RoutingMatrix.tsx`
- `AIG04BudgetCenter.tsx`
- `AIG05ReceiptsExplorer.tsx`
- `AIG05UsageLedgerExplorer.tsx`
- `AIG06LaunchTruth.tsx`
- `AIG07LaunchTruth.tsx`
- `AIG08DegradedDiagnostics.tsx`
- `AIG09RuntimeVerification.tsx`
- `AIGovernancePage.tsx`
- `AIHumanBoundaryControls.tsx`
- `AILearningCenter.tsx`
- `AIMissionCenter.tsx`
- `AIReleasesCenter.tsx`
- `AIRootCauseGraph.tsx`
- `AIRuntimeStatus.tsx`
- `AISelfHealing.tsx`
- `AISelfLearningLedger.tsx`
- `AIT01TeamOverview.tsx`
- `AIT02RoleRegistry.tsx`
- `AIT03TaskInvocation.tsx`
- `AIT04ActivityFeedPage.tsx`
- `AIT04to08Boards.tsx`
- `AIT05CostEfficiency.tsx`
- `AIT06RecommendationsPage.tsx`
- `AIT07ApprovalQueuePage.tsx`
- `AIT08LaunchTruthPage.tsx`
- `AITSetupChecklist.tsx`
- `AITeamRoster.tsx`
- `AITimeMachine.tsx`
- `AITokenDashboard.tsx`
- `AND01AndroidEcosystemCenter.tsx`
- `AND02WearOSExperience.tsx`
- `AND03AndroidTrustApprovals.tsx`
- `AND04AndroidHealthConsent.tsx`
- `AND05AndroidLaunchReadiness.tsx`
- `APL01AppleEcosystemCenter.tsx`
- `APL02AppleDevicesTrust.tsx`
- `APL03AppleWatchExperience.tsx`
- `APL04AppleIdentityAccounts.tsx`
- `APL05AppleHealthConsent.tsx`
- `APL06AppleLaunchReadiness.tsx`
- `AR01AutomationOverview.tsx`
- `AR02ScheduledJobRegistry.tsx`
- `AR03SelfHealingBoard.tsx`
- `AR04AgentScheduler.tsx`
- `AR05SystemMaintenanceBoard.tsx`
- `AR06ExecutionTraceExplorer.tsx`
- `AR07RetryFailureCenter.tsx`
- `AR08KillSwitchCenter.tsx`
- `AR09AutomationLaunchGate.tsx`
- `ActionLineageExplorer.tsx`
- `ActionStateDriftViewer.tsx`
- `AdminDashboard.tsx`
- `AdminDeploymentRings.tsx`
- `AdminMutationAudit.tsx`
- `AdminOperationsHub.tsx`
- `AdminProjectionModels.tsx`
- `AdminTruthClaims.tsx`
- `AdvisorActionApprovalAdmin.tsx`
- `AdvisorAgentDashboard.tsx`
- `AdvisorAutonomyPolicyEditor.tsx`
- `AdvisorBoardCatalog.tsx`
- `AdvisorMemoryInspector.tsx`
- `AdvisorProfitabilityDashboard.tsx`
- `AdvisorRecommendationMonitor.tsx`
- `AlertTriageBoard.tsx`
- `AuditComplianceWorkspace.tsx`
- `BrainCoreDashboard.tsx`
- `BuilderKnowledgeBase.tsx`
- `CAI01PersonalGraphExplorer.tsx`
- `CAI02IntentTraceBoard.tsx`
- `CAI03AttentionCenter.tsx`
- `CAI04ContinuityCenter.tsx`
- `CAI05TrustActionsBoard.tsx`
- `CAI06ChiefOfStaffCenter.tsx`
- `CAI07TimingStudio.tsx`
- `CAI08RelationshipCenter.tsx`
- `CAI09DigestConsole.tsx`
- `CAI10ModesCenter.tsx`
- `CAI11InterfaceProfiler.tsx`
- `CAI12OpportunityBoard.tsx`
- `CAI13MemoryGovernance.tsx`
- `CAI14BoundaryControl.tsx`
- `CAI15SignatureStudio.tsx`
- `CN01ConnectorRealityOverview.tsx`
- `CN02ConnectorRegistryConsole.tsx`
- `CN03AccountLinkageBoard.tsx`
- `CN04SyncTruthCenter.tsx`
- `CN05ConnectorHealthBoard.tsx`
- `CN06ConnectorDemoReview.tsx`
- `CN07ConnectorLaunchGate.tsx`
- `CanonicalChainExplorer.tsx`
- `ChangeImpactAnalyzer.tsx`
- `CommunicationHub.tsx`
- `CompositorDebugPage.tsx`
- `ComputeGovernanceBoard.tsx`
- `ConciergeRuntimeBoard.tsx`
- `ConnectorGovernanceCenter.tsx`
- `ConscienceGateDashboard.tsx`
- `ContractBackendReadiness.tsx`
- `CorePersistenceOverview.tsx`
- `CoreServiceMigrationBoard.tsx`
- `CrossDomainMemoryExplorer.tsx`
- `DRS01RealityModeOverview.tsx`
- `DRS02ModeRegistryConsole.tsx`
- `DRS03ScenarioLibrary.tsx`
- `DRS04ScenarioEntityGraph.tsx`
- `DRS05ProviderConsole.tsx`
- `DRS06DemoPolicySafety.tsx`
- `DRS07DemoAIControl.tsx`
- `DRS08AnalyticsSegregation.tsx`
- `DRS09TruthLabeling.tsx`
- `DRS10DualRealityLaunchGate.tsx`
- `DWE01ConnectedDevicesCenter.tsx`
- `DWE02PresenceContinuityCenter.tsx`
- `DWE03WearableSignalsCenter.tsx`
- `DWE04NotificationRoutingStudio.tsx`
- `DWE05DeviceTrustApprovalsCenter.tsx`
- `DWE06AmbientAssistantCenter.tsx`
- `DWE07DeviceLaunchHonestyBoard.tsx`
- `DeliveryReadinessBoard.tsx`
- `DeliveryWavePlanner.tsx`
- `DependencyMapViewer.tsx`
- `DeploymentUnitExplorer.tsx`
- `DesktopHostCapabilityExplorer.tsx`
- `DomainManifestDashboard.tsx`
- `DomainMethodologyPacks.tsx`
- `DomainRealityBoard.tsx`
- `ECO01EcosystemCommand.tsx`
- `EnvironmentAppliancePage.tsx`
- `EventStreamExplorer.tsx`
- `FCC01FounderCommandConsole.tsx`
- `FCC02TaskDecompositionGraph.tsx`
- `FCC03CICDPipelineBoard.tsx`
- `FCC04RunbookCenter.tsx`
- `FCC05FounderDashboard.tsx`
- `FCC06ProgramManagementBoard.tsx`
- `FCC07PlatformCostCapacity.tsx`
- `FCC08SyncStorageOps.tsx`
- `FCC09SecurityRiskCenter.tsx`
- `FCC10HumanOversightEscalation.tsx`
- `FCC11IncidentResponseTimeline.tsx`
- `FCC12KnowledgeMemorySystem.tsx`
- `FL01FlagshipLoopsExecutive.tsx`
- `FL02FlagshipLoopDetail.tsx`
- `FL03FlagshipPrioritization.tsx`
- `FeatureFactoryConsole.tsx`
- `FeatureIntakeDesk.tsx`
- `FeatureLifecycleBoard.tsx`
- `FeatureRealityDetail.tsx`
- `FleetHealthPage.tsx`
- `FounderCouncilBoard.tsx`
- `GeneratedTruthDashboard.tsx`
- `GoogleProviderFamilyDashboard.tsx`
- `GraphIntelligencePage.tsx`
- `HQApprovalQueue.tsx`
- `HRS01HealthConsentCenter.tsx`
- `HRS02SignalSourcesBoard.tsx`
- `HRS03ReadinessExplanation.tsx`
- `HRS04NotificationInfluence.tsx`
- `HRS05AssistantTimingBoard.tsx`
- `HRS06SignalLaunchHonesty.tsx`
- `ISA01IdentityProviderRegistryBoard.tsx`
- `ISA02ConnectorProviderRegistryBoard.tsx`
- `ISA03OAuthClientRegistryConsole.tsx`
- `ISA04ConsentLedgerExplorer.tsx`
- `ISA05ScopePolicyMatrixBoard.tsx`
- `ISA06UnifiedAccountGraphExplorer.tsx`
- `ISA07AuthConnectorTruthBoard.tsx`
- `IncidentCommandCenter.tsx`
- `InfraRealityClassificationBoard.tsx`
- `IngressTopologyViewer.tsx`
- `IntegrationConciergePage.tsx`
- `IntelligenceArtifactLibrary.tsx`
- `IntelligenceDashboard.tsx`
- `InvestorProofLedger.tsx`
- `KernelDashboard.tsx`
- `LT01BehavioralTruthOverview.tsx`
- `LT02CIPipelineCenter.tsx`
- `LT03E2EJourneyBoard.tsx`
- `LT04RuntimeProbeCenter.tsx`
- `LT05LaunchGateBoard.tsx`
- `LT06RouteInteractionTruth.tsx`
- `LT07TruthRegressionRadar.tsx`
- `LaunchHonestyBoard.tsx`
- `LaunchReadinessBoard.tsx`
- `MSA01MultiSurfaceOverview.tsx`
- `MSA02CoreSurfaceBoundary.tsx`
- `MSA03CapabilityPortability.tsx`
- `MSA04SurfaceAdapterRegistry.tsx`
- `MSA05CompatibilityRadar.tsx`
- `ManifestDriftTriage.tsx`
- `ManifestTruthDashboard.tsx`
- `MemoryContinuityCenter.tsx`
- `MigrationWavePlanner.tsx`
- `MissionControlHome.tsx`
- `MockEliminationCenter.tsx`
- `MockReplacementProgram.tsx`
- `MockSourceInventory.tsx`
- `NOT01NotificationRuntimeVerification.tsx`
- `NOT02NotificationRoutingBoard.tsx`
- `NOT03DeliveryReceiptsExplorer.tsx`
- `NOT04CalmPolicyBoard.tsx`
- `NOT05NotificationPreferencesBoard.tsx`
- `NRC01RoutingStudio.tsx`
- `NRC02CalmnessCenter.tsx`
- `NRC03FatigueBoard.tsx`
- `NRC04QueueInterruptMatrix.tsx`
- `NRC05CrossDeviceDelivery.tsx`
- `NRC06NotificationLaunchHonesty.tsx`
- `NSS01StrategyBoard.tsx`
- `NSS02CapabilityMatrix.tsx`
- `NSS03TrustContinuity.tsx`
- `NSS04MobileLaunchHonesty.tsx`
- `OS01PlatformCommandCenter.tsx`
- `OutcomeEconomicsDashboard.tsx`
- `PFA01ProviderFamilyRegistry.tsx`
- `PFA02ProviderCapabilityMatrix.tsx`
- `PFA03OAuthClientRegistry.tsx`
- `PFA04ConsentLedgerExplorer.tsx`
- `PFA05ScopePolicyMatrix.tsx`
- `PFA06PermissionUpgradeCenter.tsx`
- `PFA07ConnectorHealthDrift.tsx`
- `PFA08AccountGraphExplorer.tsx`
- `PFA09ConnectedAccountsCenter.tsx`
- `PFA10IntegrationLaunchHonesty.tsx`
- `PersistenceDriftRadar.tsx`
- `PersistenceStatus.tsx`
- `PlatformMaturityDashboard.tsx`
- `PolicyDecisionLedger.tsx`
- `PolicySimulator.tsx`
- `ProofMatrixExplorer.tsx`
- `REX01RecommendationIntelligence.tsx`
- `REX02ApprovalQueueCompletion.tsx`
- `REX03RecommendationExecution.tsx`
- `REX04RemediationPrograms.tsx`
- `REX05OutcomeVerification.tsx`
- `RealityClassificationMatrix.tsx`
- `RealityConversionOverview.tsx`
- `RealityProgressTimeline.tsx`
- `ReleaseEngineeringPage.tsx`
- `ReleaseRingCommandBoard.tsx`
- `ReplayRecoveryConsole.tsx`
- `RevenueAutopilotMonitor.tsx`
- `RouteRealityHeatmap.tsx`
- `RouteSourceDiagnostics.tsx`
- `RuntimeContinuityBoard.tsx`
- `RuntimeRealityValidation.tsx`
- `RuntimeTruthCoverageDashboard.tsx`
- `SEC01SessionSecrets.tsx`
- `SEC02SecurityFoundation.tsx`
- `SERV01ServiceOwnership.tsx`
- `SERV02DomainOwnership.tsx`
- `SERV03RouteServiceTrace.tsx`
- `SERV04ServiceDuplication.tsx`
- `SERV05CanonicalActions.tsx`
- `SERV06FlagshipTraceability.tsx`
- `SRE01ValidationCenter.tsx`
- `SRE02BuilderCriticConsole.tsx`
- `SRE03SimulationLab.tsx`
- `SRE04CodeStandardsTestGen.tsx`
- `SRE05ChaosTestingFramework.tsx`
- `SRE06AutoRollbackCenter.tsx`
- `SRE07VersionIntelligence.tsx`
- `SRE08SelfOptimizationBudgets.tsx`
- `SYS01SystemIntelligence.tsx`
- `SecurityCommandCenter.tsx`
- `SecurityPostureBoard.tsx`
- `SimulatedCoreServicesBoard.tsx`
- `SimulationCenterPage.tsx`
- `SystemHealthDashboard.tsx`
- `SystemManagement.tsx`
- `TeamManagement.tsx`
- `TrustStateRegistry.tsx`
- `TruthIndexDashboard.tsx`
- `UAO01PresenceContinuity.tsx`
- `UAO02ConnectedDevices.tsx`
- `UAO03AmbientTeamControl.tsx`
- `UAO04NotificationRouter.tsx`
- `UAO05HealthReadiness.tsx`
- `UAO06DeviceTrust.tsx`
- `UAO07CrossSurfaceJourney.tsx`
- `UAO08AmbientLaunchReadiness.tsx`
- `UserManagement.tsx`
- `WorkflowReplayAudit.tsx`

#### admin/architecture/ (4 files)

- `ArchitectureBoundaryBoard.tsx`
- `EpistemicFirewallBoard.tsx`
- `GodTierIntegrationBoard.tsx`
- `GodTierRuntimeBoard.tsx`

#### admin/cloud/ (48 files)

- `AdminAuditExplorer.tsx`
- `AdminRBACConsole.tsx`
- `AdminSafetyRails.tsx`
- `AdminTokenManager.tsx`
- `ApiGatewayRoutesAdmin.tsx`
- `ClientCapabilityAdmin.tsx`
- `CloudActivityAdmin.tsx`
- `CloudAdminLayout.tsx`
- `CloudAuditAdmin.tsx`
- `CloudBackboneAdmin.tsx`
- `CloudBootstrapAdmin.tsx`
- `CloudCollaborationAdmin.tsx`
- `CloudComplianceAdmin.tsx`
- `CloudCostCapacityAdmin.tsx`
- `CloudDashboard.tsx`
- `CloudDeviceIdentityAdmin.tsx`
- `CloudDevicesAdmin.tsx`
- `CloudEncryptionAdmin.tsx`
- `CloudFeatureFlagsAdmin.tsx`
- `CloudGovernanceAdmin.tsx`
- `CloudIntegrityAdmin.tsx`
- `CloudJobsAdmin.tsx`
- `CloudLifecycleAdmin.tsx`
- `CloudMaintenanceModeAdmin.tsx`
- `CloudMonitoringAdmin.tsx`
- `CloudNamespacesAdmin.tsx`
- `CloudObservabilityAdmin.tsx`
- `CloudPolicyAdmin.tsx`
- `CloudRecoveryAdmin.tsx`
- `CloudSharingAdmin.tsx`
- `CloudStorageAdmin.tsx`
- `CloudStorageHealthAdmin.tsx`
- `CloudSupportConsole.tsx`
- `CloudSyncAdmin.tsx`
- `CloudSyncObjectsAdmin.tsx`
- `CloudTenantAdmin.tsx`
- `CloudUsersAdmin.tsx`
- `CloudWorkerOpsAdmin.tsx`
- `ConfigChangeHistory.tsx`
- `DataFlowMapAdmin.tsx`
- `DomainOwnershipAdmin.tsx`
- `EnvironmentSwitcher.tsx`
- `PlatformPlaneOverview.tsx`
- `ReadModelSnapshotsAdmin.tsx`
- `ReleaseGovernanceAdmin.tsx`
- `ServiceIdentityAdmin.tsx`
- `SupportCaseManager.tsx`
- `SupportConsoleSafe.tsx`

#### admin/customer-journey/ (9 files)

- `CJ01ExecutiveReport.tsx`
- `CJ02JourneyTruthMatrix.tsx`
- `CJ03JourneyDetailView.tsx`
- `CJ04LaunchBlockerView.tsx`
- `CJ05DemoVsRealComparison.tsx`
- `CJ06BrokenClicksExplorer.tsx`
- `CJ07OwnerRemediationView.tsx`
- `CJ08RouteActionCoverage.tsx`
- `CJ09RecentVerificationRuns.tsx`

#### admin/fip/ (14 files)

- `FIPBuilderConsole.tsx`
- `FIPCapabilityRegistry.tsx`
- `FIPComplianceBoard.tsx`
- `FIPDeprecationManager.tsx`
- `FIPExecutionExplorer.tsx`
- `FIPGeneratedTruthBoard.tsx`
- `FIPIntakeDesk.tsx`
- `FIPMemoryGraphStudio.tsx`
- `FIPObservabilityCenter.tsx`
- `FIPOwnerBoundary.tsx`
- `FIPPolicyTrustBoard.tsx`
- `FIPReadinessGateReview.tsx`
- `FIPRolloutPlanner.tsx`
- `FIPSpecStudio.tsx`

#### admin/frontend/ (2 files)

- `FE01QualityMatrix.tsx`
- `FE02DesignGovernance.tsx`

#### admin/implementation-truth/ (14 files)

- `ITC01Overview.tsx`
- `ITC02SpecRegistry.tsx`
- `ITC03ContractVerification.tsx`
- `ITC04WiringGraph.tsx`
- `ITC05ReadinessScoreboard.tsx`
- `ITC06DriftRadar.tsx`
- `ITC07ImplementationMap.tsx`
- `ITC08ArchitectureCompliance.tsx`
- `ITC09RouteInventory.tsx`
- `ITC10RuntimeEvidence.tsx`
- `ITC11PromptTraceability.tsx`
- `ITC12ValidationPipeline.tsx`
- `ITC13LaunchTruthGate.tsx`
- `ITC14ManifestExplorer.tsx`

#### admin/intelligence/ (12 files)

- `AIEfficiencyScoreboard.tsx`
- `CrossTenantGovernance.tsx`
- `DifferentialReasoningExplorer.tsx`
- `EscalationControlCenter.tsx`
- `IntelligenceAssetLibrary.tsx`
- `IntelligenceLayerAdmin.tsx`
- `IntelligencePacketInspector.tsx`
- `IntelligenceReuseOverview.tsx`
- `OutcomeEconomicsBoard.tsx`
- `PatternLearningCenter.tsx`
- `SmartDigestCenter.tsx`
- `ZeroWastePromptView.tsx`

#### admin/launch/ (6 files)

- `LAUNCH01ReadinessExecutive.tsx`
- `LAUNCH02FlagshipReadiness.tsx`
- `LAUNCH03ClaimSafetyMatrix.tsx`
- `LAUNCH04BlockerCommand.tsx`
- `LAUNCH06NarrativeGuide.tsx`
- `LAUNCH07GoNoGo.tsx`

#### admin/modules/ (28 files)

- `MCAIControl.tsx`
- `MCApprovalFlow.tsx`
- `MCArchitectureDashboard.tsx`
- `MCArchitectureTests.tsx`
- `MCAuthorityMatrix.tsx`
- `MCCommandRouting.tsx`
- `MCControlReceipts.tsx`
- `MCCostsAIBudgets.tsx`
- `MCDevicesCenter.tsx`
- `MCEmergencyAuthority.tsx`
- `MCEventRouting.tsx`
- `MCFailureRecovery.tsx`
- `MCFeatureOwnership.tsx`
- `MCIncidents.tsx`
- `MCJobsMaintenance.tsx`
- `MCKnowledgeBase.tsx`
- `MCLogsAudit.tsx`
- `MCPlatformAdaptation.tsx`
- `MCPoliciesFlags.tsx`
- `MCReleasesUpdates.tsx`
- `MCStateAuthority.tsx`
- `MCStorageCenter.tsx`
- `MCSupport.tsx`
- `MCSyncCloud.tsx`
- `MCSystemHealth.tsx`
- `MCTrustSecurity.tsx`
- `MCUsersCenter.tsx`
- `MCWorkspacesContinuity.tsx`

#### admin/platform-law/ (11 files)

- `PLE01Overview.tsx`
- `PLE02LawRegistry.tsx`
- `PLE03ScaffoldRegistry.tsx`
- `PLE04CIGateMonitor.tsx`
- `PLE05ManifestEnforcer.tsx`
- `PLE06OwnershipBoard.tsx`
- `PLE07ComplianceDashboard.tsx`
- `PLT05ViolationTriage.tsx`
- `PLT06FeatureCompliance.tsx`
- `PLT08LaunchEnforcement.tsx`
- `PLT10DriftRadar.tsx`

#### admin/reality-audit/ (12 files)

- `CoreServicePersistence.tsx`
- `LaunchHonestyBoard.tsx`
- `MockReplacementProgram.tsx`
- `RCP01Overview.tsx`
- `RCP03FeatureDetail.tsx`
- `RCP05MockSourceInventory.tsx`
- `RCP07RouteHeatmap.tsx`
- `RCP08ContractReadiness.tsx`
- `RCP10WavePlanner.tsx`
- `RCP11ProgressTimeline.tsx`
- `RealityClassificationMatrix.tsx`
- `RuntimeTruthGate.tsx`

#### admin/sag/ (12 files)

- `SAGBuilderConsole.tsx`
- `SAGComplianceGate.tsx`
- `SAGCostConfidenceLab.tsx`
- `SAGEconomicsBoard.tsx`
- `SAGFallbackCenter.tsx`
- `SAGModelRegistry.tsx`
- `SAGMultiStageExplorer.tsx`
- `SAGOverview.tsx`
- `SAGPromptRegistry.tsx`
- `SAGProviderHealth.tsx`
- `SAGReceiptExplorer.tsx`
- `SAGRoutingPolicy.tsx`

#### admin/security/ (6 files)

- `SEC01PostureExecutive.tsx`
- `SEC02PrivilegedActions.tsx`
- `SEC03SensitiveAssets.tsx`
- `SEC04EdgeFunctionAudit.tsx`
- `SEC05ClaimSafety.tsx`
- `SEC06IncidentRecovery.tsx`

#### admin/strategic/ (12 files)

- `BenchmarkLabDashboard.tsx`
- `CostToConfidenceDashboard.tsx`
- `DecayMonitorDashboard.tsx`
- `IntelligenceCapitalDashboard.tsx`
- `IntelligenceInsuranceDashboard.tsx`
- `IntelligenceMarketDashboard.tsx`
- `OperatorTasteDashboard.tsx`
- `PortfolioAllocationDashboard.tsx`
- `QualityFloorDashboard.tsx`
- `ReasoningReplayDashboard.tsx`
- `TimeToTruthDashboard.tsx`
- `ValueRiskDashboard.tsx`

#### admin/verification/ (18 files)

- `JVC01JourneyVerificationOverview.tsx`
- `JVC04ButtonCTAHealth.tsx`
- `JVC05RedirectIntegrityMap.tsx`
- `JVC06PageLoadIntegrity.tsx`
- `JVC07FormVerificationCenter.tsx`
- `JVC08ModalDrawerBoard.tsx`
- `JVC09KeyboardCommandBoard.tsx`
- `JVC10RuntimeProbeCenter.tsx`
- `JVC11JourneyReplay.tsx`
- `JVC13InteractionDriftRadar.tsx`
- `JVC14LaunchInteractionGate.tsx`
- `V01SurfaceInventoryBoard.tsx`
- `V02InteractionCoverageBoard.tsx`
- `V03P0JourneyBoard.tsx`
- `V04ModeVerificationBoard.tsx`
- `V05FailureTriageBoard.tsx`
- `V06EvidenceExplorer.tsx`
- `V07LaunchBlockerBoard.tsx`

### 2.3 Routes (src/routes/)

- `src/routes/AdminRoutes.tsx`
- `src/routes/MobileRoutes.tsx`
- `src/routes/OwnerRoutes.tsx`
- `src/routes/advisor-routes.tsx`
- `src/routes/apps-routes.tsx`
- `src/routes/boardroom-routes.tsx`
- `src/routes/business-routes.tsx`
- `src/routes/communications-routes.tsx`
- `src/routes/concierge-routes.tsx`
- `src/routes/experimental-routes.tsx`
- `src/routes/files-routes.tsx`
- `src/routes/money-routes.tsx`
- `src/routes/os-routes.tsx`
- `src/routes/settings-routes.tsx`

### 2.4 Contexts (src/contexts/)

- `AppPlatformContext.tsx`
- `AppearanceContext.tsx`
- `AuthContext.tsx`
- `BusinessNavigationContext.tsx`
- `BusinessProfileContext.tsx`
- `CalmEngineContext.tsx`
- `ConciergeDataContext.tsx`
- `ConciergeNavigationContext.tsx`
- `ConnectivityContext.tsx`
- `DataModeContext.tsx`
- `DemoModeProvider.tsx`
- `DisplayModeContext.tsx`
- `EntityContext.tsx`
- `FinanceNavigationContext.tsx`
- `InspectorContext.tsx`
- `NovaSDKContext.tsx`
- `RevenueOfficeModeContext.tsx`
- `RuntimeProvider.tsx`
- `SitaKernelContext.tsx`
- `SitaOSContext.tsx`
- `ThemeContext.tsx`
- `WindowManagerContext.tsx`

### 2.5 Hooks (src/hooks/) — 150 files

- `use-accent-sync.ts`
- `use-action.ts`
- `use-adaptive-personalization.ts`
- `use-admin-data.ts`
- `use-admin-durable-state.ts`
- `use-advisor-agents.ts`
- `use-advisor-status.ts`
- `use-agent-fleet-live.ts`
- `use-ai-budget-data.ts`
- `use-ai-engineering-data.ts`
- `use-ai-engineering-realtime.ts`
- `use-ai-health.ts`
- `use-approval-queue-mutations.ts`
- `use-apps-data.ts`
- `use-backend-actions.ts`
- `use-boardroom-data.ts`
- `use-boardroom.ts`
- `use-brain-core.ts`
- `use-business-data.ts`
- `use-cai-data.ts`
- `use-calendar-data.ts`
- `use-calendar-mutations.ts`
- `use-calm-mode.ts`
- `use-companion.ts`
- `use-compute-governance.ts`
- `use-concierge-data.ts`
- `use-confirmation.ts`
- `use-crm-data.ts`
- `use-digital-presence.ts`
- `use-domain-data.ts`
- `use-domain-projections.ts`
- `use-file-explorer.ts`
- `use-file-upload.ts`
- `use-fip-data.ts`
- `use-focus-mode.ts`
- `use-gesture-engine.ts`
- `use-global-search.ts`
- `use-google-provider-family.ts`
- `use-health-signal-data.ts`
- `use-health-signal-mutations.ts`
- `use-household.ts`
- `use-implementation-truth.ts`
- `use-intelligence-screen-data.ts`
- `use-investment-data.ts`
- `use-investment-memory.ts`
- `use-investment-office.ts`
- `use-kernel-events.ts`
- `use-kernel-mutation.ts`
- `use-kernel-query.ts`
- `use-live-data.ts`
- `use-mission-control-data.ts`
- `use-mission-control-views.ts`
- `use-mission-data.ts`
- `use-mobile.tsx`
- `use-money-data.ts`
- `use-native-shell-data.ts`
- `use-notification-calm-data.ts`
- `use-online-status.ts`
- `use-optimistic-mutation.ts`
- `use-os-api.ts`
- `use-proactive-notifications.ts`
- `use-proof-chain.ts`
- `use-proof-timeline.ts`
- `use-push-notifications.ts`
- `use-query-freshness.ts`
- `use-realtime-notifications.ts`
- `use-realtime.ts`
- `use-revenue-memory.ts`
- `use-revenue-office.ts`
- `use-sag-data.ts`
- `use-security-fabric.ts`
- `use-session-restore.ts`
- `use-settings-value.ts`
- `use-shell-indicators.ts`
- `use-sita-data.ts`
- `use-spec-seed.ts`
- `use-stale-data.ts`
- `use-streaming-chat.ts`
- `use-toast.ts`
- `use-undoable-action.ts`
- `use-unified-calendar.ts`
- `use-unified-ws.ts`
- `use-user-preferences.ts`
- `use-wallpaper.ts`
- `use-zero-latency.ts`
- `useAIGovernance.ts`
- `useAdaptiveInterface.ts`
- `useAdvisorMissionControl.ts`
- `useAppBadges.ts`
- `useAppStatePersistence.ts`
- `useAppSurfacing.ts`
- `useBoardroomBridge.ts`
- `useBoardroomLiveData.ts`
- `useBoardroomSession.ts`
- `useBusinessAdvisorBoard.ts`
- `useBusinessOnboarding.ts`
- `useBusinessProfile.ts`
- `useCAIData.ts`
- `useCoreSubstrateHydration.ts`
- `useCountUp.ts`
- `useCurrentOrg.ts`
- `useCurrentPlane.ts`
- `useDegradedMode.ts`
- `useDesktopWidgets.ts`
- `useDigestJournal.ts`
- `useDockContext.ts`
- `useDraftAutosave.ts`
- `useEconomicIntelligence.ts`
- `useEcosystemDevices.ts`
- `useElectronBridge.ts`
- `useExperienceSignature.ts`
- `useGraphEngine.ts`
- `useIdleDetector.ts`
- `useInvestmentOfficeData.ts`
- `useIsAdmin.ts`
- `useLauncherViewModel.ts`
- `useLayerOpacity.ts`
- `useLinkedContext.ts`
- `useLiveActivityDomainData.ts`
- `useMockReplacements.ts`
- `useNotifications.ts`
- `useOSOrchestration.ts`
- `useOSSecurity.ts`
- `useOfflineStore.ts`
- `useOnboardingDaemon.ts`
- `useOrchestrationExecution.ts`
- `useOrchestrationFacade.ts`
- `useOrchestrationHealth.ts`
- `useOrchestrationPlanning.ts`
- `useOrchestrationProof.ts`
- `usePipelineBootstrap.ts`
- `useProtocolBridge.ts`
- `useRealityClassifications.ts`
- `useRealityDetection.ts`
- `useRealtimeBridge.ts`
- `useReducedMotion.ts`
- `useReleaseEngine.ts`
- `useReleaseIntelligence.ts`
- `useRequireAdmin.ts`
- `useRequireAdminPermission.ts`
- `useRoutePrefetch.ts`
- `useSetupOrchestration.ts`
- `useShopifyData.ts`
- `useSimulationEngine.ts`
- `useUpdateDaemon.ts`
- `useUserPreferences.ts`
- `useWallpaperParallax.ts`
- `useWindowAttention.ts`
- `useWindowManager.ts`
- `useWindowSnap.ts`

### 2.6 Components (src/components/) — 897 files

| Directory | Files |
|-----------|-------|
| NavLink.tsx/ | 1 |
| admin/ | 89 |
| admin-ai/ | 12 |
| admin-os/ | 4 |
| advisors/ | 10 |
| ai/ | 7 |
| auth/ | 5 |
| autopilot/ | 3 |
| business/ | 143 |
| cards/ | 1 |
| cloud/ | 11 |
| concierge/ | 30 |
| files/ | 8 |
| finance/ | 5 |
| governance/ | 6 |
| intelligence/ | 2 |
| investment/ | 4 |
| mobile/ | 6 |
| money/ | 3 |
| navigation/ | 1 |
| notifications/ | 1 |
| platform/ | 1 |
| reality/ | 5 |
| revenue-office/ | 1 |
| shared/ | 4 |
| simulation/ | 7 |
| sita/ | 477 |
| ui/ | 49 |
| user-app/ | 1 |

### 2.7 Library (src/lib/) — 73 directories

| Directory | Files | Classification |
|-----------|-------|----------------|
| __tests__/ | 22 | App |
| admin-ai/ | 9 | Admin |
| advisor-intelligence/ | 11 | Intelligence |
| advisor-protocol/ | 4 | App |
| ai/ | 16 | AI |
| ai-engineering/ | 12 | AI |
| ai-gateway/ | 1 | AI |
| api/ | 5 | API |
| app-platform/ | 3 | App |
| architecture/ | 31 | Governance |
| backend-topology/ | 10 | Backend |
| boardroom/ | 6 | Intelligence |
| capabilities/ | 22 | Domain |
| cloud-backbone/ | 11 | App |
| compute-governance/ | 7 | Admin |
| constants/ | 2 | Shared |
| contracts/ | 2 | Shared |
| control-plane/ | 2 | Platform |
| core-services/ | 217 | Kernel |
| customer-journey/ | 9 | App |
| data-services/ | 33 | Data |
| db/ | 11 | Backend |
| delivery-methodology/ | 8 | App |
| demo-data/ | 31 | Demo |
| demo-scenarios/ | 5 | Demo |
| deployment/ | 12 | Runtime |
| design-system/ | 5 | App |
| detection/ | 3 | App |
| devices/ | 10 | Runtime |
| domain-engines/ | 9 | Domain |
| domain-system/ | 10 | Domain |
| dual-reality/ | 23 | App |
| engine/ | 3 | Domain |
| engines/ | 60 | Domain |
| fip/ | 2 | App |
| hooks/ | 10 | Shared |
| integrations/ | 1 | App |
| intelligence-architecture/ | 12 | Intelligence |
| internal-agents/ | 13 | App |
| investment-office/ | 2 | App |
| journeys/ | 2 | App |
| mock-data/ | 27 | Demo |
| no-hallucination/ | 15 | Intelligence |
| nova-sdk/ | 55 | OS/Kernel |
| observability/ | 11 | App |
| orchestration/ | 45 | Kernel |
| os-security/ | 18 | OS |
| os-services/ | 33 | OS |
| pack-store/ | 1 | App |
| persistence/ | 20 | Kernel |
| platform-law/ | 2 | Platform |
| platform-plane/ | 10 | Platform |
| policy/ | 2 | App |
| reality-audit/ | 1 | App |
| reality-records/ | 2 | App |
| runtime/ | 22 | Runtime |
| security/ | 2 | Security |
| seed/ | 4 | App |
| services/ | 478 | App |
| setup/ | 3 | App |
| shopify/ | 2 | App |
| simulation/ | 3 | App |
| sovereign-ai-gateway/ | 2 | AI |
| storage/ | 2 | App |
| strategic-intelligence/ | 13 | Intelligence |
| support/ | 2 | App |
| surfaces/ | 8 | Runtime |
| sync-engine/ | 38 | OS |
| truth-manifests/ | 11 | Governance |
| types/ | 19 | Shared |
| utils/ | 3 | Shared |
| ux-trust/ | 7 | App |
| verification/ | 3 | Governance |

### 2.8 Packages (src/packages/) — 448 files

- `advisor-config/` — 3 files
- `ai-contracts/` — 9 files
- `audit-contracts/` — 1 files
- `auth/` — 1 files
- `boardroom-contracts/` — 1 files
- `business-contracts/` — 82 files
- `client-sdk/` — 1 files
- `concierge-contracts/` — 41 files
- `contracts/` — 174 files
- `database-schemas/` — 1 files
- `design-tokens/` — 1 files
- `enterprise-contracts/` — 2 files
- `entitlements/` — 1 files
- `event-types/` — 1 files
- `feature-flags/` — 1 files
- `feature-governance/` — 7 files
- `finance-contracts/` — 14 files
- `graph-contracts/` — 7 files
- `internal-agent-config/` — 12 files
- `microinteraction-engine/` — 1 files
- `moat-contracts/` — 2 files
- `pack-manifests/` — 1 files
- `policy-contracts/` — 7 files
- `proof-model/` — 7 files
- `protocols/` — 13 files
- `reality-contracts/` — 37 files
- `release-contracts/` — 7 files
- `shell-grammar/` — 1 files
- `simulation-contracts/` — 7 files
- `store-metadata/` — 1 files
- `telemetry/` — 1 files
- `template-registry/` — 1 files
- `workflow-primitives/` — 1 files

### 2.9 Features (src/features/) — barrel re-exports

- `advisors/`
- `ai/`
- `app-platform/`
- `apps/`
- `atlas/`
- `auth/`
- `boardroom/`
- `business/`
- `cloud/`
- `concierge/`
- `digital-presence/`
- `enterprise/`
- `files/`
- `home/`
- `integrations/`
- `intelligence/`
- `investment-office/`
- `mission/`
- `mission-control/`
- `mobile/`
- `money/`
- `notifications/`
- `onboarding/`
- `owner/`
- `owner-mode/`
- `revenue-office/`
- `settings/`
- `simulation/`
- `store/`
- `workspace/`

### 2.10 Other Source Directories

- `src/admin/` — 30 files
- `src/app/` — 1 files
- `src/assets/` — 8 files
- `src/contracts/` — 1 files
- `src/data/` — 1 files
- `src/i18n/` — 2 files
- `src/integrations/` — 3 files
- `src/layouts/` — 1 files
- `src/planes/` — 16 files
- `src/platform/` — 9 files
- `src/runtimes/` — 6 files
- `src/test/` — 70 files
- `src/types/` — 1 files

---

## Section 3 — Backend (supabase/)

### 3.1 Edge Functions — 74 functions

| Function | Category | Frontend Consumer | Status |
|----------|----------|-------------------|--------|
| `admin-ai-workforce-run` | admin | Admin | DEPLOYED |
| `admin-api` | admin | Admin | DEPLOYED |
| `admin-bff-gateway` | admin | Admin | DEPLOYED |
| `admin-gateway` | admin | Admin | DEPLOYED |
| `admin-intelligence` | admin | Admin | DEPLOYED |
| `admin-users` | admin | Admin | DEPLOYED |
| `advisor-agent-loop` | advisor/intelligence | Yes | DEPLOYED |
| `advisor-avatar-generate` | advisor/intelligence | Yes | DEPLOYED |
| `advisor-conversation` | advisor/intelligence | Yes | DEPLOYED |
| `advisor-deep-intelligence` | advisor/intelligence | Yes | DEPLOYED |
| `advisor-knowledge-manage` | advisor/intelligence | Yes | DEPLOYED |
| `advisor-weekly-report` | advisor/intelligence | Yes | DEPLOYED |
| `agent-executor` | agent/orchestration | Internal | DEPLOYED |
| `agent-heartbeat` | agent/orchestration | Internal | DEPLOYED |
| `agent-intelligence` | agent/orchestration | Internal | DEPLOYED |
| `agent-scheduler` | agent/orchestration | Internal | DEPLOYED |
| `agent-signal` | agent/orchestration | Internal | DEPLOYED |
| `ai-gateway` | ai-gateway | Yes | DEPLOYED |
| `ai-health` | ai-gateway | Yes | DEPLOYED |
| `ambient-os-operations` | os/runtime | Internal | DEPLOYED |
| `api-gateway` | user/bff | Yes | DEPLOYED |
| `booking-manage` | specialized | Mixed | DEPLOYED |
| `brain-core` | advisor/intelligence | Yes | DEPLOYED |
| `business-advisor-intelligence` | advisor/intelligence | Yes | DEPLOYED |
| `business-board-api` | specialized | Mixed | DEPLOYED |
| `cashflow-calculate` | finance/payment | Yes | DEPLOYED |
| `chat-advisor` | advisor/intelligence | Yes | DEPLOYED |
| `check-ai-budget` | ai-gateway | Yes | DEPLOYED |
| `cloud-admin-api` | cloud/tenant | Mixed | DEPLOYED |
| `cloud-device-api` | cloud/tenant | Mixed | DEPLOYED |
| `cloud-lifecycle-api` | cloud/tenant | Mixed | DEPLOYED |
| `cloud-storage-api` | cloud/tenant | Mixed | DEPLOYED |
| `cloud-sync-api` | cloud/tenant | Mixed | DEPLOYED |
| `cloud-tenant-api` | cloud/tenant | Mixed | DEPLOYED |
| `cloud-worker-api` | cloud/tenant | Mixed | DEPLOYED |
| `connector-batch` | connector | Yes | DEPLOYED |
| `connector-discover` | connector | Yes | DEPLOYED |
| `connector-health` | connector | Yes | DEPLOYED |
| `connector-oauth` | connector | Yes | DEPLOYED |
| `connector-operations` | connector | Yes | DEPLOYED |
| `connector-proxy` | connector | Yes | DEPLOYED |
| `connector-transform` | connector | Yes | DEPLOYED |
| `cost-alert` | finance/payment | Yes | DEPLOYED |
| `crm-sync` | connector | Yes | DEPLOYED |
| `device-telemetry` | specialized | Mixed | DEPLOYED |
| `ecosystem-operations` | specialized | Mixed | DEPLOYED |
| `event-processor` | data/files | Mixed | DEPLOYED |
| `file-ingestion` | data/files | Mixed | DEPLOYED |
| `gdpr-delete` | gdpr/compliance | Mixed | DEPLOYED |
| `gdpr-export` | gdpr/compliance | Mixed | DEPLOYED |
| `get-weather` | specialized | Mixed | DEPLOYED |
| `intelligence-api` | advisor/intelligence | Yes | DEPLOYED |
| `invoice-generate` | finance/payment | Yes | DEPLOYED |
| `main` | user/bff | Yes | DEPLOYED |
| `msa-operations` | specialized | Mixed | DEPLOYED |
| `os-agent-channel` | os/runtime | Internal | DEPLOYED |
| `os-command` | os/runtime | Internal | DEPLOYED |
| `os-status` | os/runtime | Internal | DEPLOYED |
| `payment-process` | finance/payment | Yes | DEPLOYED |
| `personal-brain` | advisor/intelligence | Yes | DEPLOYED |
| `provider-family-operations` | specialized | Mixed | DEPLOYED |
| `push-dispatch` | notifications | Yes | DEPLOYED |
| `push-track` | notifications | Yes | DEPLOYED |
| `revenue-caller` | finance/payment | Yes | DEPLOYED |
| `runtime-probes` | os/runtime | Internal | DEPLOYED |
| `scheduler-dispatch` | agent/orchestration | Internal | DEPLOYED |
| `seed-user-data` | data/files | Mixed | DEPLOYED |
| `self-healing` | os/runtime | Internal | DEPLOYED |
| `support-gateway` | user/bff | Yes | DEPLOYED |
| `system-updates` | os/runtime | Internal | DEPLOYED |
| `tax-estimate` | finance/payment | Yes | DEPLOYED |
| `user-bff-gateway` | user/bff | Yes | DEPLOYED |
| `vapid-public-key` | notifications | Yes | DEPLOYED |
| `verification-recorder` | data/files | Mixed | DEPLOYED |

### 3.2 Shared Edge Function Utilities

- `ai-budget-check.ts`
- `ai-receipt-logger.ts`
- `audit-logger.ts`
- `auth.ts`
- `cors.ts`
- `logger.ts`
- `rate-limit.ts`
- `security-headers.ts`
- `validate.ts`
- `zod-validate.ts`

### 3.3 Database Migrations — 161 migrations

First: `20260403005816_958dada3-fe5c-47a4-8997-f3a556e3692d.sql`
Latest: `20260416010347_03ff1b0b-0dda-4dba-8fa6-eea0ecf22fd0.sql`

---

## Section 4 — Scripts (scripts/)

Total: 304 files

### scripts/architecture/ — 90 files

- `scripts/architecture/README.md`
- `scripts/architecture/assertions/assert-advanced-platform-expansion-structure.ps1`
- `scripts/architecture/assertions/assert-ai-workforce-governance.ps1`
- `scripts/architecture/assertions/assert-architecture-compliance-system.ps1`
- `scripts/architecture/assertions/assert-architecture-invariants-advanced.ps1`
- `scripts/architecture/assertions/assert-canonical-execution-chain.ps1`
- `scripts/architecture/assertions/assert-capability-definition-of-done.ps1`
- `scripts/architecture/assertions/assert-capability-registration-metadata.ps1`
- `scripts/architecture/assertions/assert-control-plane-sovereignty.ps1`
- `scripts/architecture/assertions/assert-design-system-enforcement.ps1`
- `scripts/architecture/assertions/assert-domain-module-freeze.ps1`
- `scripts/architecture/assertions/assert-executor-chokepoint.ps1`
- `scripts/architecture/assertions/assert-file-ownership-integration-matrix.ps1`
- `scripts/architecture/assertions/assert-final-integration-lawbook.ps1`
- `scripts/architecture/assertions/assert-frontend-experience-structure.ps1`
- `scripts/architecture/assertions/assert-identity-graph-foundation.ps1`
- `scripts/architecture/assertions/assert-memory-unification.ps1`
- `scripts/architecture/assertions/assert-no-duplicate-generated-entries.ps1`
- `scripts/architecture/assertions/assert-no-duplicate-registry-ids.ps1`
- `scripts/architecture/assertions/assert-no-duplicate-service-owners.ps1`
- `scripts/architecture/assertions/assert-operational-scorecards.ps1`
- `scripts/architecture/assertions/assert-owner-mode-structure.ps1`
- `scripts/architecture/assertions/assert-proof-layer.ps1`
- `scripts/architecture/assertions/assert-registry-baseline.ps1`
- `scripts/architecture/assertions/assert-registry-truth-contract.ps1`
- `scripts/architecture/assertions/assert-service-count-budget.ps1`
- `scripts/architecture/assertions/assert-single-brain.ps1`
- `scripts/architecture/assertions/assert-support-diagnostics-operability.ps1`
- `scripts/architecture/assertions/assert-three-modules.ps1`
- `scripts/architecture/assertions/assert-workflow-verification-foundations.ps1`
- `scripts/architecture/checks/boundary-check.ts`
- `scripts/architecture/checks/check-action-envelope-boundary.ts`
- `scripts/architecture/checks/check-admin-ia.ts`
- `scripts/architecture/checks/check-admin-route-coherence.ts`
- `scripts/architecture/checks/check-admin-shell-consistency.ts`
- `scripts/architecture/checks/check-admin-top-level-domain-count.ts`
- `scripts/architecture/checks/check-advisor-registry.ts`
- `scripts/architecture/checks/check-boot-chain.ts`
- `scripts/architecture/checks/check-capability-families.ts`
- `scripts/architecture/checks/check-connector-catalog.ts`
- `scripts/architecture/checks/check-contract-family-completeness.ts`
- `scripts/architecture/checks/check-contract-registry.ts`
- `scripts/architecture/checks/check-delegation-receipts.ts`
- `scripts/architecture/checks/check-deployable-plane-isolation.ts`
- `scripts/architecture/checks/check-drift.ts`
- `scripts/architecture/checks/check-engine-no-io.ts`
- `scripts/architecture/checks/check-error-boundaries.ts`
- `scripts/architecture/checks/check-event-catalog.ts`
- `scripts/architecture/checks/check-event-receipt-linkage.ts`
- `scripts/architecture/checks/check-feature-governance.ts`
- `scripts/architecture/checks/check-feature-integration-completeness.ts`
- `scripts/architecture/checks/check-hook-purity.ts`
- `scripts/architecture/checks/check-ia-coherence.ts`
- `scripts/architecture/checks/check-inline-mocks.ts`
- `scripts/architecture/checks/check-integration-map.ts`
- `scripts/architecture/checks/check-layer-boundaries.ts`
- `scripts/architecture/checks/check-module-count.ts`
- `scripts/architecture/checks/check-no-backend-in-ui.ts`
- `scripts/architecture/checks/check-no-hidden-executor.ts`
- `scripts/architecture/checks/check-no-page-mocks.ts`
- `scripts/architecture/checks/check-no-runtime-in-shared.ts`
- `scripts/architecture/checks/check-no-ui-in-backend.ts`
- `scripts/architecture/checks/check-orchestration-authority.ts`
- `scripts/architecture/checks/check-outbound-communication-policy.ps1`
- `scripts/architecture/checks/check-outbound-communication-policy.ts`
- `scripts/architecture/checks/check-owner-workflow-map.ts`
- `scripts/architecture/checks/check-plane-boundaries.ts`
- `scripts/architecture/checks/check-platform-anti-patterns.ts`
- `scripts/architecture/checks/check-platform-readiness.ts`
- `scripts/architecture/checks/check-policy-coverage.ts`
- `scripts/architecture/checks/check-policy-mapping.ts`
- `scripts/architecture/checks/check-proof-coverage.ts`
- `scripts/architecture/checks/check-protocol-purity.ts`
- `scripts/architecture/checks/check-receipt-coverage.ts`
- `scripts/architecture/checks/check-route-drift.ts`
- `scripts/architecture/checks/check-route-page-contract-layer-usage.ts`
- `scripts/architecture/checks/check-runtime-foundations.ts`
- `scripts/architecture/checks/check-sensitive-document-privacy.ts`
- `scripts/architecture/checks/check-service-consolidation-alignment.ts`
- `scripts/architecture/checks/check-service-registry-sync.ts`
- `scripts/architecture/checks/check-service-sprawl.ts`
- `scripts/architecture/checks/check-services-structure-hygiene.ts`
- `scripts/architecture/checks/check-status-truth-tags.ts`
- `scripts/architecture/checks/check-surface-ownership.ts`
- `scripts/architecture/checks/check-workflow-state-usage.ts`
- `scripts/architecture/checks/check-workflow-states.ts`
- `scripts/architecture/checks/run-accessibility-gates.ps1`
- `scripts/architecture/checks/validate-registry-schema.ps1`
- `scripts/architecture/lib/utils.ts`
- `scripts/architecture/reports/architecture-report.ts`

### scripts/bootstrap/ — 3 files

- `scripts/bootstrap/bootstrap-new-feature-spec.ts`
- `scripts/bootstrap/bootstrap-new-package.ts`
- `scripts/bootstrap/bootstrap-new-service.ts`

### scripts/codemods/ — 2 files

- `scripts/codemods/migrate-contract-imports-to-canonical.ts`
- `scripts/codemods/normalize-app-alias-imports.mjs`

### scripts/contracts/ — 23 files

- `scripts/contracts/checks/README.md`
- `scripts/contracts/checks/check-canonical-imports.ts`
- `scripts/contracts/checks/check-capability-quality-metric.ts`
- `scripts/contracts/checks/check-capability-registration.ts`
- `scripts/contracts/checks/check-connector-governance.ts`
- `scripts/contracts/checks/check-contract-completeness.ts`
- `scripts/contracts/checks/check-contract-import-boundaries.ts`
- `scripts/contracts/checks/check-contract-integrity.ts`
- `scripts/contracts/checks/check-contract-registry-blockers.ts`
- `scripts/contracts/checks/check-contracts-deprecated-imports.ts`
- `scripts/contracts/checks/check-contracts-generated-artifact-imports.ts`
- `scripts/contracts/checks/check-contracts-layer-purity.ts`
- `scripts/contracts/checks/check-contracts-no-duplicate-concepts.ts`
- `scripts/contracts/checks/check-contracts-public-import-surface.ts`
- `scripts/contracts/checks/check-contracts-read-model-purity.ts`
- `scripts/contracts/checks/check-duplicate-exports.ts`
- `scripts/contracts/checks/check-import-boundaries.ts`
- `scripts/contracts/checks/check-package-exports.ts`
- `scripts/contracts/checks/check-route-contract-drift.ts`
- `scripts/contracts/checks/validate-os-contracts.ts`
- `scripts/contracts/generate/README.md`
- `scripts/contracts/lib/README.md`
- `scripts/contracts/migration/README.md`

### scripts/db/ — 17 files

- `scripts/db/backup/verify-backup-restore.ts`
- `scripts/db/checks/check-migration-ownership.ts`
- `scripts/db/checks/check-rls-coverage.ts`
- `scripts/db/checks/check-rls-policy-registry.ts`
- `scripts/db/checks/check-schema-registry.ts`
- `scripts/db/checks/check-table-ownership.ts`
- `scripts/db/checks/check-tenancy-boundary-map.ts`
- `scripts/db/checks/check-tenancy-firewall.ts`
- `scripts/db/checks/db-integrity-check.sh`
- `scripts/db/checks/schema-compliance.ts`
- `scripts/db/generate/generate-migration-registry.ts`
- `scripts/db/generate/generate-rls-policy-registry.ts`
- `scripts/db/generate/generate-schema-registry.ts`
- `scripts/db/generate/generate-table-ownership-map.ts`
- `scripts/db/lib/README.md`
- `scripts/db/migrations/data-migration-validation.ts`
- `scripts/db/restore/README.md`

### scripts/deployment/ — 19 files

- `scripts/deployment/check-deploy-readiness.ps1`
- `scripts/deployment/checks/check-build-output-map.ts`
- `scripts/deployment/checks/check-deployment-unit-map.ts`
- `scripts/deployment/checks/check-ingress-topology.ts`
- `scripts/deployment/checks/check-kubernetes-readiness.ts`
- `scripts/deployment/checks/check-release-unit-map.ts`
- `scripts/deployment/checks/check-terraform-vmware-readiness.ts`
- `scripts/deployment/checks/check-vmware-readiness.ts`
- `scripts/deployment/checks/generate-health.sh`
- `scripts/deployment/checks/pre-flight-checks.ps1`
- `scripts/deployment/checks/pre-flight-checks.sh`
- `scripts/deployment/checks/smoke-tests.sh`
- `scripts/deployment/checks/validate-deployment.sh`
- `scripts/deployment/deploy/README.md`
- `scripts/deployment/ingress/generate-ingress-topology.ts`
- `scripts/deployment/lib/README.md`
- `scripts/deployment/local/README.md`
- `scripts/deployment/render-helm.ps1`
- `scripts/deployment/verify-local-compose.ps1`

### scripts/docs/ — 2 files

- `scripts/docs/docs-check-architecture-sync.ts`
- `scripts/docs/generate-markdown-conformance-report.ts`

### scripts/legacy/ — 6 files

- `scripts/legacy/README.md`
- `scripts/legacy/archived-phase-scripts/RENAMING_MAP.md`
- `scripts/legacy/migration-tools/README.md`
- `scripts/legacy/migration-tools/consolidate-all-services.js`
- `scripts/legacy/migration-tools/consolidate-services.js`
- `scripts/legacy/wrappers/README.md`

### scripts/manifests/ — 48 files

- `scripts/manifests/generate/generate-admin-support-visibility.ts`
- `scripts/manifests/generate/generate-advisor-registry.ts`
- `scripts/manifests/generate/generate-architecture-compliance.ts`
- `scripts/manifests/generate/generate-boardroom-template-index.ts`
- `scripts/manifests/generate/generate-capability-family-index.ts`
- `scripts/manifests/generate/generate-capability-index.ts`
- `scripts/manifests/generate/generate-capability-matrices.ts`
- `scripts/manifests/generate/generate-capability-quality-metric.ts`
- `scripts/manifests/generate/generate-connector-catalog.ts`
- `scripts/manifests/generate/generate-contract-manifest.ts`
- `scripts/manifests/generate/generate-feature-integration-index.ts`
- `scripts/manifests/generate/generate-formula-registry.ts`
- `scripts/manifests/generate/generate-internal-agent-registry.ts`
- `scripts/manifests/generate/generate-launch-tier-index.ts`
- `scripts/manifests/generate/generate-manifest-registry.ts`
- `scripts/manifests/generate/generate-manifest-truth-dashboard.ts`
- `scripts/manifests/generate/generate-maturity-thresholds.ts`
- `scripts/manifests/generate/generate-operational-scorecards.ts`
- `scripts/manifests/generate/generate-outcome-index.ts`
- `scripts/manifests/generate/generate-ownership-manifest.ts`
- `scripts/manifests/generate/generate-prompt-index.ts`
- `scripts/manifests/generate/generate-route-manifest.ts`
- `scripts/manifests/generate/generate-service-consolidation.ts`
- `scripts/manifests/generate/generate-service-manifest.ts`
- `scripts/manifests/generate/generate-shell-space-registry.ts`
- `scripts/manifests/generate/generate-startup-order.ts`
- `scripts/manifests/generate/generate-subject-manifest.ts`
- `scripts/manifests/generate/generate-subscription-replacement-matrix.ts`
- `scripts/manifests/generate/generate-surface-performance-budget.ts`
- `scripts/manifests/generate/generate-validation-summary.ts`
- `scripts/manifests/generate/sync-registry-manifests.ts`
- `scripts/manifests/lib/README.md`
- `scripts/manifests/lib/capability-quality-math.ts`
- `scripts/manifests/lib/master-dossier-plan.ts`
- `scripts/manifests/reports/generate-drift-report.ps1`
- `scripts/manifests/reports/generate-manifest-drift-report.ts`
- `scripts/manifests/reports/generate-production-truth-dashboard.ps1`
- `scripts/manifests/validate/check-final-delivery-conformance.ts`
- `scripts/manifests/validate/check-generated-truth.ts`
- `scripts/manifests/validate/check-manifest-authority.ts`
- `scripts/manifests/validate/check-manifest-ci-gates.ts`
- `scripts/manifests/validate/check-manifest-owner-coverage.ts`
- `scripts/manifests/validate/check-manifest-runtime-linkage.ts`
- `scripts/manifests/validate/check-manifest-source-truth.ts`
- `scripts/manifests/validate/check-master-dossier-conformance.ts`
- `scripts/manifests/validate/check-master-dossier-expansion-plan.ts`
- `scripts/manifests/validate/check-memory-governance.ts`
- `scripts/manifests/validate/generated-truth.ts`

### scripts/migrate/ — 3 files

- `scripts/migrate/execute-migration.sh`
- `scripts/migrate/rewrite-imports.ts`
- `scripts/migrate/verify-migration.ts`

### scripts/registry/ — 8 files

- `scripts/registry/script-ci-binding-map.ts`
- `scripts/registry/script-classification-report.ts`
- `scripts/registry/script-language-policy.ts`
- `scripts/registry/script-output-map.ts`
- `scripts/registry/script-owner-map.ts`
- `scripts/registry/script-registry.ts`
- `scripts/registry/script-runtime-consequence-map.ts`
- `scripts/registry/script-taxonomy.ts`

### scripts/release/ — 41 files

- `scripts/release/appliance/build-iso.sh`
- `scripts/release/appliance/new-iso-image.ps1`
- `scripts/release/bundles/README.md`
- `scripts/release/checks/assert-maturity-thresholds.ps1`
- `scripts/release/checks/assert-release-trust-gates.ps1`
- `scripts/release/checks/check-release-readiness.ts`
- `scripts/release/checks/generate-release-gate-thresholds.ts`
- `scripts/release/checks/release-launch-truth-audit.ts`
- `scripts/release/checks/smoke-test.sh`
- `scripts/release/desktop/build-electron.sh`
- `scripts/release/iso/autoinstall/meta-data`
- `scripts/release/iso/autoinstall/network-config`
- `scripts/release/iso/autoinstall/user-data`
- `scripts/release/iso/profiles/admin.json`
- `scripts/release/iso/profiles/user.json`
- `scripts/release/iso/sita-backup.service`
- `scripts/release/iso/sita-backup.sh`
- `scripts/release/iso/sita-backup.timer`
- `scripts/release/iso/sita-first-boot.sh`
- `scripts/release/iso/sita-metrics-agent.sh`
- `scripts/release/iso/sita-os.service`
- `scripts/release/iso/sita-ota-agent.sh`
- `scripts/release/iso/sita-ota.service`
- `scripts/release/iso/sita-ota.timer`
- `scripts/release/lib/README.md`
- `scripts/release/rings/ring-promotion.ts`
- `scripts/release/supply-chain/sita-ota-agent.sh`
- `scripts/release/supply-chain/sita-update.sh`
- `scripts/release/templates/sita-os.ovf.template`
- `scripts/release/vmware/build-ova.sh`
- `scripts/release/vmware/deploy-vmware.sh`
- `scripts/release/vmware/emit-vmware-supply-chain-tier.ts`
- `scripts/release/vmware/generate-vmware-appliance-artifacts.ts`
- `scripts/release/vmware/generate-vmware-deliverable-archive.ts`
- `scripts/release/vmware/generate-vmware-import-smoke-manifest.ts`
- `scripts/release/vmware/generate-vmware-installer-assets.ts`
- `scripts/release/vmware/generate-vmware-iso-candidate-manifest.ts`
- `scripts/release/vmware/generate-vmware-iso-image.ts`
- `scripts/release/vmware/generate-vmware-release-bundle.ts`
- `scripts/release/vmware/generate-vmware-supply-chain-artifacts.ts`
- `scripts/release/vmware/generate-vmware-supply-chain-index.ts`

### scripts/runtime/ — 22 files

- `scripts/runtime/capability/README.md`
- `scripts/runtime/checks/check-appliance-runtime-contract.ts`
- `scripts/runtime/checks/check-desktop-runtime-contract.ts`
- `scripts/runtime/checks/check-edge-function-health.ts`
- `scripts/runtime/checks/check-mobile-runtime-contract.ts`
- `scripts/runtime/checks/check-reality-classification-coverage.ts`
- `scripts/runtime/checks/check-runtime-capability-matrix.ts`
- `scripts/runtime/checks/check-runtime-tier-coverage.ts`
- `scripts/runtime/checks/check-runtime-usage.ts`
- `scripts/runtime/checks/check-scoring-boundaries.ts`
- `scripts/runtime/checks/check-single-brain.ts`
- `scripts/runtime/edge-functions/check-edge-function-auth-map.ts`
- `scripts/runtime/edge-functions/check-edge-function-category-coverage.ts`
- `scripts/runtime/edge-functions/check-edge-function-topology.ts`
- `scripts/runtime/edge-functions/generate-edge-function-registry.ts`
- `scripts/runtime/generate/generate-runtime-capability-matrix.ts`
- `scripts/runtime/generate/generate-runtime-conformance.ts`
- `scripts/runtime/generate/generate-runtime-ports.ts`
- `scripts/runtime/generate/generate-runtime-reality-map.ts`
- `scripts/runtime/lib/README.md`
- `scripts/runtime/lifecycle/README.md`
- `scripts/runtime/probes/ai-runtime-probe.ts`

### scripts/security/ — 5 files

- `scripts/security/attestations/README.md`
- `scripts/security/checks/security-check-role-leakage.ts`
- `scripts/security/checks/security-check-tenant-isolation.ts`
- `scripts/security/lib/README.md`
- `scripts/security/rotation/rotate-secrets.sh`

### scripts/support/ — 10 files

- `scripts/support/diagnostics/ingest-journey-results.ts`
- `scripts/support/diagnostics/ops-build-diagnostic-bundle.ts`
- `scripts/support/drills/disaster-recovery-drill.ps1`
- `scripts/support/drills/disaster-recovery-drill.sh`
- `scripts/support/lib/README.md`
- `scripts/support/recovery/restore-backup.ps1`
- `scripts/support/recovery/restore-backup.sh`
- `scripts/support/recovery/sita-recovery.sh`
- `scripts/support/runbooks/generate-golden-path-registry.ts`
- `scripts/support/runbooks/generate-runbook-index.ts`

### scripts/testing/ — 2 files

- `scripts/testing/load-test.ts`
- `scripts/testing/test-run-risk-tier-matrix.ts`

### scripts/ (root) — 3 files

- `scripts/generate-all.ts`
- `scripts/tsconfig.json`
- `scripts/validate-all.ts`

---

## Section 5 — Generated Artifacts (generated/)

- `generated/DEPLOYMENT_AUDIT.md`
- `generated/FULL_ISSUES_AND_FIXES.md`
- `generated/FULL_MASTER_AUDIT.md`
- `generated/accessibility-summary.json`
- `generated/admin-support-visibility-manifest.json`
- `generated/advisor-registry.json`
- `generated/architecture-compliance-report.json`
- `generated/base-os-manifest.json`
- `generated/boardroom-template-index.json`
- `generated/boot-chain-manifest.json`
- `generated/capability-event-matrix.json`
- `generated/capability-family-index.json`
- `generated/capability-index.json`
- `generated/capability-owner-map.json`
- `generated/capability-policy-matrix.json`
- `generated/capability-quality-metric.json`
- `generated/capability-receipt-matrix.json`
- `generated/capability-surface-matrix.json`
- `generated/connector-catalog.json`
- `generated/contract-manifest.json`
- `generated/drift-report.md`
- `generated/feature-integration-index.json`
- `generated/first-boot-contract-manifest.json`
- `generated/first-boot-proof-receipts.json`
- `generated/formula-registry.json`
- `generated/integration-map.json`
- `generated/internal-agent-registry.json`
- `generated/kernel-architecture-manifest.json`
- `generated/launch-tier-index.json`
- `generated/lifecycle-authority-manifest.json`
- `generated/maturity-thresholds.json`
- `generated/operational-metrics-snapshot.json`
- `generated/operational-scorecards.json`
- `generated/outcome-index.json`
- `generated/ownership-manifest.json`
- `generated/plane-ownership.json`
- `generated/production-truth-dashboard.md`
- `generated/prompt-index.json`
- `generated/recovery-outcome-manifest.json`
- `generated/refactor/GLOBAL_REFACTOR_CHANGE_IMPACT.md`
- `generated/refactor/GLOBAL_REFACTOR_DEPRECATED_FILES.md`
- `generated/refactor/GLOBAL_REFACTOR_FILE_UPDATE_MAP.md`
- `generated/refactor/GLOBAL_REFACTOR_SECONDARY_ISSUES.md`
- `generated/refactor/GLOBAL_REFACTOR_VERIFICATION_RESULTS.md`
- `generated/refactor/GLOBAL_REFACTOR_WRAPPER_MAP.md`
- `generated/refactor/global-refactor-file-map.json`
- `generated/refactor/global-refactor-impact-graph.json`
- `generated/refactor/global-refactor-secondary-issues.json`
- `generated/release-gate-thresholds.json`
- `generated/rendering-pipeline-manifest.json`
- `generated/route-manifest.json`
- `generated/route-tier-manifest.json`
- `generated/runtime-conformance-manifest.json`
- `generated/runtime-ports.json`
- `generated/security-model-manifest.json`
- `generated/security-review-manifest.json`
- `generated/service-consolidation-manifest.json`
- `generated/service-manifest.json`
- `generated/shell-space-registry.json`
- `generated/startup-order.json`
- `generated/subject-manifest.json`
- `generated/subscription-replacement-matrix.json`
- `generated/surface-performance-budget.json`
- `generated/syscall-manifest.json`
- `generated/userspace-services-manifest.json`
- `generated/validation-summary.json`
- `generated/visual-regression-baseline.json`

---

## Section 6 — Infrastructure

### 6.1 Electron Desktop
- `electron/auto-updater.cjs`
- `electron/crash-reporter.cjs`
- `electron/forge.config.cjs`
- `electron/fs-bridge.cjs`
- `electron/main.cjs`
- `electron/preload.cjs`

### 6.2 Deploy Artifacts
- `deploy/Dockerfile.api`
- `deploy/Dockerfile.brain`
- `deploy/api-gateway/package.json`
- `deploy/api-gateway/server.ts`
- `deploy/api-gateway/tsconfig.json`
- `deploy/auditd/audit.rules`
- `deploy/auditd/auditd.conf`
- `deploy/backup.sh`
- `deploy/brain-core/package.json`
- `deploy/brain-core/server.ts`
- `deploy/brain-core/tsconfig.json`
- `deploy/db-init/00-roles.sql`
- `deploy/db-init/01-extensions.sql`
- `deploy/first-boot.sh`
- `deploy/kong.yml`
- `deploy/logrotate-sita.conf`
- `deploy/metrics-agent.sh`
- `deploy/nginx.conf`
- `deploy/ota-agent.sh`
- `deploy/sita-eula.sh`
- `deploy/traefik/dynamic.yml`
- `deploy/traefik/generate-self-signed.sh`
- `deploy/traefik/traefik.yml`

### 6.3 Infra Configs
- `infra/ci/pipeline.yaml`
- `infra/deploy/admin-console.yaml`
- `infra/deploy/backend.yaml`
- `infra/deploy/founder-center.yaml`
- `infra/deploy/mobile.yaml`
- `infra/deploy/os-artifact.yaml`
- `infra/deploy/product-shell.yaml`
- `infra/docs/ARQ_PLAN_FINAL.md`
- `infra/docs/BOOTABLE_PROTOTYPE_SPEC.md`
- `infra/docs/COMPOSITOR_RASTERIZER_SPEC.md`
- `infra/docs/FILESYSTEM_ARCHITECTURE.md`
- `infra/docs/FINAL_ARQ_REPORT_v3.md`
- `infra/docs/KERNEL_ARCHITECTURE.md`
- `infra/docs/MEMORY_ARCHITECTURE.md`
- `infra/docs/NOVA_OS_ARCHITECTURE.md`
- `infra/docs/PERFORMANCE_RENDERING.md`
- `infra/docs/RENDERING_PIPELINE.md`
- `infra/docs/SECURITY_ARCHITECTURE.md`
- `infra/docs/USERSPACE_ARCHITECTURE.md`

### 6.4 CI Workflows
- `.github/workflows/build-planes.yml`
- `.github/workflows/check-boundaries.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/customer-journey-manual.yml`
- `.github/workflows/customer-journey-nightly.yml`
- `.github/workflows/deploy-backend.yml`
- `.github/workflows/deploy-frontend.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/playwright-proof-nightly.yml`

### 6.5 Docker
- `Dockerfile`
- `deploy/Dockerfile.api`
- `deploy/Dockerfile.brain`
- `docker-compose.dev.yml`
- `docker-compose.yml`

---

## Section 7 — Documentation

- `docs/REAL_VS_SIMULATED.md`
- `docs/architecture/ADVISOR_COUNCIL_SYSTEM.md`
- `docs/architecture/APP_PLATFORM_AND_INTEGRATIONS.md`
- `docs/architecture/ATLAS_OPERATIONS_AND_PLATFORM_TRUTH.md`
- `docs/architecture/BOARDROOM_SYSTEM.md`
- `docs/architecture/CRM_AND_CUSTOMER_DASHBOARD.md`
- `docs/architecture/DIGITAL_PRESENCE_AND_WEB_SYSTEM.md`
- `docs/architecture/DOMAIN_MANIFEST_SYSTEM.md`
- `docs/architecture/FILE_INGESTION_AND_KNOWLEDGE.md`
- `docs/architecture/INTERNAL_AGENT_RIGHTS_MODEL.md`
- `docs/architecture/INTERNAL_AI_WORKFORCE.md`
- `docs/architecture/INVESTMENT_OFFICE_AND_CAPITAL_SYSTEM.md`
- `docs/architecture/LAYER_SEPARATION.md`
- `docs/architecture/MIGRATION-BLUEPRINT.md`
- `docs/architecture/MISSION_CONTROL_SHELL.md`
- `docs/architecture/MOBILE_EXPERIENCE_SYSTEM.md`
- `docs/architecture/MONOREPO-SCAFFOLD.md`
- `docs/architecture/OFFICE_AND_PRODUCTIVITY_SYSTEM.md`
- `docs/architecture/OUTBOUND_COMMUNICATION_AND_CALLING.md`
- `docs/architecture/OWNER_MODE_GUIDE.md`
- `docs/architecture/PACK_STORE_AND_INTERNAL_APPS.md`
- `docs/architecture/PREMIUM_OS_EXPERIENCE_SYSTEM.md`
- `docs/architecture/QUICKEN_LIKE_FINANCE_AND_FAMILY_OFFICE.md`
- `docs/architecture/REVENUE_OFFICE_AND_GROWTH_SYSTEM.md`
- `docs/architecture/SCRIPT_LANGUAGE_POLICY.md`
- `docs/architecture/SCRIPT_OUTPUT_AND_CI_BINDING_MAP.md`
- `docs/architecture/SCRIPT_PERMANENCE_AND_LIFECYCLE_MODEL.md`
- `docs/architecture/SCRIPT_SYSTEM_ARCHITECTURE.md`
- `docs/architecture/SCRIPT_TAXONOMY_AND_EXECUTION_POLICY.md`
- `docs/architecture/SELF_HEALING_OPERATIONS.md`
- `docs/architecture/SENSITIVE_DOCUMENT_GOVERNED_MODE.md`
- `docs/architecture/TRAVEL_AND_BOOKING_INTEGRATION.md`
- `docs/architecture/UX_EXPERIENCE_SYSTEM.md`
- `docs/architecture/VMWARE_DEPLOYMENT_AND_OPS.md`
- `docs/architecture/WEBSITE_AND_LEAD_CAPTURE_SYSTEM.md`
- `docs/architecture/registry/boardrooms.yaml`
- `docs/architecture/registry/capabilities.yaml`
- `docs/architecture/registry/connectors.yaml`
- `docs/architecture/registry/events.yaml`
- `docs/architecture/registry/prompts.yaml`
- `docs/architecture/registry/receipts.yaml`
- `docs/architecture/registry/services.yaml`
- `docs/architecture/registry/truth-status.yaml`
- `docs/architecture/registry/workflows.yaml`
- `docs/refactor/dependency-matrix.md`
- `docs/refactor/deployment-map.md`
- `docs/refactor/env-schemas.md`
- `docs/refactor/move-map.md`
- `docs/refactor/orchestration-authority-map.md`
- `docs/refactor/orchestration-migration-map.md`
- `docs/refactor/protocol-ownership.md`
- `docs/refactor/rewiring-plan.md`
- `docs/refactor/runtime-map.md`
- `docs/self-hosted-deployment.md`
- `docs/vmware-deployment.md`

---

## Section 8 — Deployment Readiness Matrix

| Plane | Build | Runtime | Status | Blockers |
|-------|-------|---------|--------|----------|
| Web SPA | Vite bundle | Browser | **READY** | None |
| Admin Console | Vite bundle (admin routes) | Browser | **READY** | None |
| Mobile | Vite SPA (responsive) | Browser (PWA) | **READY** (PWA) | No native bridges |
| Desktop/Electron | Electron Forge | Node+Chromium | **PROTOTYPE** | No CI build, no signing |
| Backend (Edge Functions) | Deno | Lovable Cloud | **READY** | All 74 deployed |
| Database | PostgreSQL | Lovable Cloud | **READY** | 198 tables, 100% RLS |
| VMware Appliance | OVA/ISO | Linux | **DOCS_ONLY** | Scripts exist, never tested |
| Kubernetes | Helm/YAML | K8s | **DOCS_ONLY** | Manifests exist, not validated |

---

## Section 9 — Frontend ↔ Backend Alignment Matrix

| # | Journey | Page(s) | Hook(s) | Service(s) | Edge Function(s) | DB Table(s) | Status |
|---|---------|---------|---------|------------|-------------------|-------------|--------|
| 1 | Authentication | auth/* | useAuth | AuthContext | main, admin-users | profiles, user_roles, org_members | **FULLY_WIRED** |
| 2 | Daily Pulse / Home | DailyPulse | useDailyPulse, useAuth | brain-core-service | brain-core, intelligence-api | recommendations, actions, timeline_events | **FULLY_WIRED** |
| 3 | Boardroom | Boardroom, WeeklyBoardroom, GlobalBoardroom | useBoardroom* | boardroom-service | business-board-api, advisor-deep-intelligence | boardroom_sessions, boardroom_items, recommendations | **FULLY_WIRED** |
| 4 | Business Center | BusinessCenter, CustomerDetail, OpportunityEngine | useBusiness*, useCRM* | business-service, crm-service | crm-sync, business-advisor-intelligence | customers, leads, opportunities, pipeline_stages | **FULLY_WIRED** |
| 5 | Money Center | MoneyCenter, WealthCommandCenter | useFinance*, useMoney* | finance-service | cashflow-calculate, tax-estimate, payment-process | transactions, accounts, invoices, tax_estimates | **FULLY_WIRED** |
| 6 | Concierge | ConciergeCenter | useConcierge* | concierge-service | booking-manage, get-weather | bookings, travel_plans, grocery_lists | **FULLY_WIRED** |
| 7 | Files Center | FilesCenter | useFiles* | file-service | file-ingestion, cloud-storage-api | files, file_versions | **FULLY_WIRED** |
| 8 | Advisor Interaction | advisors/* | useAdvisor* | advisor-service | advisor-conversation, advisor-agent-loop, advisor-avatar-generate | advisor_conversations, advisor_messages | **FULLY_WIRED** |
| 9 | Connectors Hub | ConnectorHub, IntegrationConcierge | useConnector* | connector-service | connector-oauth, connector-health, connector-operations, connector-discover | connector_tokens, connector_installations | **FULLY_WIRED** |
| 10 | Push Notifications | NotificationCenter | usePush*, useNotifications | push-service | push-dispatch, push-track, vapid-public-key | push_subscriptions, vapid_keys | **FULLY_WIRED** |
| 11 | AI Gateway | AIEconomicsPage, PersonalBrain | useAI* | ai-gateway-service | ai-gateway, ai-health, check-ai-budget | ai_usage_ledger, ai_prompt_families | **FULLY_WIRED** |
| 12 | Settings | SettingsPage | useSettings | settings-service | user-bff-gateway | profiles, user_preferences | **FULLY_WIRED** |
| 13 | Search | SearchPage | useSearch | search-service | api-gateway | — | **FRONTEND_ONLY** |
| 14 | Simulation Engine | SimulationEnginePage | useSimulation* | simulation-service | — | simulations | **PARTIALLY_WIRED** |
| 15 | Investment Office | investment-office/* | useInvestment* | investment-service | — | — | **FRONTEND_WITHOUT_BACKEND** |
| 16 | Time Machine | TimeMachinePage | useTimeMachine | time-machine-service | — | timeline_events | **SIMULATED_ONLY** |
| 17 | Achievements | AchievementsPage | useAchievements | achievements-service | — | achievements, xp_events | **PARTIALLY_WIRED** |
| 18 | Desktop Shell | DesktopPage | useWindowManager | WindowManagerContext | — | — | **SIMULATED_ONLY** |
| 19 | Revenue Office | revenue-office/* | useRevenue* | revenue-service | revenue-caller | — | **PARTIALLY_WIRED** |
| 20 | Digital Twins | DigitalTwinsPage | — | — | — | — | **FRONTEND_WITHOUT_BACKEND** |
| 21 | Admin Dashboard | AdminDashboard | useAdmin* | admin-service | admin-api, admin-gateway | user_roles, admin_role_assignments | **FULLY_WIRED** |
| 22 | Admin AI Team | AIT01-AIT08 | useAITeam* | ai-workforce-service | admin-ai-workforce-run | runtime_agents | **FULLY_WIRED** |
| 23 | Admin Cloud | cloud/* | useCloud* | cloud-service | cloud-admin-api, cloud-tenant-api | organizations, cloud_tenant_memberships | **FULLY_WIRED** |
| 24 | Admin Connectors | CN01-CN07 | useConnectorAdmin | connector-admin-service | connector-health | connector_tokens | **FULLY_WIRED** |
| 25 | GDPR Compliance | — | — | gdpr-service | gdpr-delete, gdpr-export | — | **BACKEND_ONLY** |
| 26 | Device Telemetry | — | — | device-service | device-telemetry, cloud-device-api | device_attestations | **BACKEND_ONLY** |
| 27 | Self-Healing | AISelfHealing | useSelfHealing | self-healing-service | self-healing | incidents | **FULLY_WIRED** |
| 28 | System Updates | UpdateCenter | useSystemUpdates | update-service | system-updates | — | **PARTIALLY_WIRED** |
| 29 | Event Processing | EventStreamExplorer | useEventStream | event-service | event-processor | timeline_events | **FULLY_WIRED** |
| 30 | Invoice Generation | — | useInvoice | invoice-service | invoice-generate | invoices | **FULLY_WIRED** |
| 31 | Onboarding | Onboarding, FirstBootSetup, MoneyOnboarding | useOnboarding | onboarding-service | seed-user-data | profiles | **FULLY_WIRED** |
| 32 | Owner Mode | OwnerCenter | useOwnerMode | owner-service | — | — | **FRONTEND_ONLY** |
| 33 | Workflow Engine | WorkflowsCenter, TasksWorkflowsCenter | useWorkflow* | workflow-service | — | command_steps | **PARTIALLY_WIRED** |

---

## Section 10 — Backend → Frontend Consumer Matrix

| Edge Function | Category | Owner | Frontend Consumer | Admin Consumer | Classification | Status |
|---------------|----------|-------|-------------------|----------------|----------------|--------|
| `admin-ai-workforce-run` | admin | admin | No | Yes | Admin-only | correctly consumed |
| `admin-api` | admin | admin | No | Yes | Admin-only | correctly consumed |
| `admin-bff-gateway` | admin | admin | No | Yes | Admin-only | correctly consumed |
| `admin-gateway` | admin | admin | No | Yes | Admin-only | correctly consumed |
| `admin-intelligence` | admin | admin | No | Yes | Admin-only | correctly consumed |
| `admin-users` | admin | admin | No | Yes | Admin-only | correctly consumed |
| `advisor-agent-loop` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `advisor-avatar-generate` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `advisor-conversation` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `advisor-deep-intelligence` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `advisor-knowledge-manage` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `advisor-weekly-report` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `agent-executor` | agent/orchestration | agent | No | No | Internal/System | internal only |
| `agent-heartbeat` | agent/orchestration | agent | No | No | Internal/System | internal only |
| `agent-intelligence` | agent/orchestration | agent | No | No | Internal/System | internal only |
| `agent-scheduler` | agent/orchestration | agent | No | No | Internal/System | internal only |
| `agent-signal` | agent/orchestration | agent | No | No | Internal/System | internal only |
| `ai-gateway` | ai-gateway | ai-gateway | Yes | No | User-facing | correctly consumed |
| `ai-health` | ai-gateway | ai-gateway | Yes | No | User-facing | correctly consumed |
| `ambient-os-operations` | os/runtime | os | No | No | Internal/System | internal only |
| `api-gateway` | user/bff | user | Yes | No | User-facing | correctly consumed |
| `booking-manage` | specialized | specialized | No | No | Internal/System | internal only |
| `brain-core` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `business-advisor-intelligence` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `business-board-api` | specialized | specialized | No | No | Internal/System | internal only |
| `cashflow-calculate` | finance/payment | finance | Yes | No | User-facing | correctly consumed |
| `chat-advisor` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `check-ai-budget` | ai-gateway | ai-gateway | Yes | No | User-facing | correctly consumed |
| `cloud-admin-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `cloud-device-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `cloud-lifecycle-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `cloud-storage-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `cloud-sync-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `cloud-tenant-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `cloud-worker-api` | cloud/tenant | cloud | No | Yes | Admin-only | correctly consumed |
| `connector-batch` | connector | connector | Yes | No | User-facing | correctly consumed |
| `connector-discover` | connector | connector | Yes | No | User-facing | correctly consumed |
| `connector-health` | connector | connector | Yes | No | User-facing | correctly consumed |
| `connector-oauth` | connector | connector | Yes | No | User-facing | correctly consumed |
| `connector-operations` | connector | connector | Yes | No | User-facing | correctly consumed |
| `connector-proxy` | connector | connector | Yes | No | User-facing | correctly consumed |
| `connector-transform` | connector | connector | Yes | No | User-facing | correctly consumed |
| `cost-alert` | finance/payment | finance | Yes | No | User-facing | correctly consumed |
| `crm-sync` | connector | connector | Yes | No | User-facing | correctly consumed |
| `device-telemetry` | specialized | specialized | No | No | Internal/System | internal only |
| `ecosystem-operations` | specialized | specialized | No | No | Internal/System | internal only |
| `event-processor` | data/files | data | Yes | No | User-facing | correctly consumed |
| `file-ingestion` | data/files | data | Yes | No | User-facing | correctly consumed |
| `gdpr-delete` | gdpr/compliance | gdpr | No | No | Internal/System | internal only |
| `gdpr-export` | gdpr/compliance | gdpr | No | No | Internal/System | internal only |
| `get-weather` | specialized | specialized | No | No | Internal/System | internal only |
| `intelligence-api` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `invoice-generate` | finance/payment | finance | Yes | No | User-facing | correctly consumed |
| `main` | user/bff | user | Yes | No | User-facing | correctly consumed |
| `msa-operations` | specialized | specialized | No | No | Internal/System | internal only |
| `os-agent-channel` | os/runtime | os | No | No | Internal/System | internal only |
| `os-command` | os/runtime | os | No | No | Internal/System | internal only |
| `os-status` | os/runtime | os | No | No | Internal/System | internal only |
| `payment-process` | finance/payment | finance | Yes | No | User-facing | correctly consumed |
| `personal-brain` | advisor/intelligence | advisor | Yes | No | User-facing | correctly consumed |
| `provider-family-operations` | specialized | specialized | No | No | Internal/System | internal only |
| `push-dispatch` | notifications | notifications | Yes | No | User-facing | correctly consumed |
| `push-track` | notifications | notifications | Yes | No | User-facing | correctly consumed |
| `revenue-caller` | finance/payment | finance | Yes | No | User-facing | correctly consumed |
| `runtime-probes` | os/runtime | os | No | No | Internal/System | internal only |
| `scheduler-dispatch` | agent/orchestration | agent | No | No | Internal/System | internal only |
| `seed-user-data` | data/files | data | Yes | No | User-facing | correctly consumed |
| `self-healing` | os/runtime | os | No | No | Internal/System | internal only |
| `support-gateway` | user/bff | user | Yes | No | User-facing | correctly consumed |
| `system-updates` | os/runtime | os | No | No | Internal/System | internal only |
| `tax-estimate` | finance/payment | finance | Yes | No | User-facing | correctly consumed |
| `user-bff-gateway` | user/bff | user | Yes | No | User-facing | correctly consumed |
| `vapid-public-key` | notifications | notifications | Yes | No | User-facing | correctly consumed |
| `verification-recorder` | data/files | data | Yes | No | User-facing | correctly consumed |

---

## Section 11 — DB Persistence Alignment Matrix

| Domain | Expected Tables | Code Consumers | Edge Functions | RLS | Status |
|--------|-----------------|----------------|----------------|-----|--------|
| Auth/Identity | profiles, user_roles, org_members, organizations | AuthContext, useAuth | main, admin-users | Yes | **FULLY_IMPLEMENTED** |
| Business/CRM | customers, leads, opportunities, pipeline_stages, accounts | useBusiness*, useCRM* | crm-sync, business-advisor-intelligence | Yes | **FULLY_IMPLEMENTED** |
| Finance | transactions, invoices, tax_estimates, accounts, budgets | useFinance*, useMoney* | cashflow-calculate, tax-estimate, payment-process | Yes | **FULLY_IMPLEMENTED** |
| Concierge | bookings, travel_plans, grocery_lists, providers | useConcierge* | booking-manage | Yes | **FULLY_IMPLEMENTED** |
| Files/Storage | files, file_versions | useFiles* | file-ingestion, cloud-storage-api | Yes | **FULLY_IMPLEMENTED** |
| Advisors | advisor_conversations, advisor_messages, recommendations | useAdvisor* | advisor-conversation, advisor-agent-loop | Yes | **FULLY_IMPLEMENTED** |
| Boardroom | boardroom_sessions, boardroom_items, approval_decisions | useBoardroom* | business-board-api | Yes | **FULLY_IMPLEMENTED** |
| Connectors | connector_tokens, connector_installations | useConnector* | connector-oauth, connector-health | Yes | **FULLY_IMPLEMENTED** |
| Notifications | push_subscriptions, vapid_keys, notification_preferences | usePush* | push-dispatch, push-track | Yes | **FULLY_IMPLEMENTED** |
| AI | ai_usage_ledger, ai_prompt_families, ai_routing_policies | useAI* | ai-gateway, check-ai-budget | Yes | **FULLY_IMPLEMENTED** |
| Timeline | timeline_events, graph_edges | useTimeline* | event-processor | Yes | **FULLY_IMPLEMENTED** |
| Devices | device_attestations, biometric_credentials | useDevice* | device-telemetry, cloud-device-api | Yes | **FULLY_IMPLEMENTED** |
| Agents | runtime_agents | useAITeam* | agent-heartbeat, agent-scheduler | Yes | **FULLY_IMPLEMENTED** |
| Workflows | command_steps, approval_decisions | useWorkflow* | — | Yes | **PARTIALLY_IMPLEMENTED** |
| Tenancy | organizations, cloud_tenant_memberships, org_members | useOrg* | cloud-tenant-api | Yes | **FULLY_IMPLEMENTED** |
| Simulations | simulations | useSimulation* | — | Yes | **PARTIALLY_IMPLEMENTED** |
| Incidents | incidents | useSelfHealing | self-healing | Yes | **FULLY_IMPLEMENTED** |
| GDPR | — | — | gdpr-delete, gdpr-export | N/A | **BACKEND_ONLY** |
| Investment | — | useInvestment* | — | N/A | **MISSING_DB_SUPPORT** |
| Achievements | achievements, xp_events | useAchievements | — | Yes | **PARTIALLY_IMPLEMENTED** |

---

## Section 12 — Reality Classification Summary

| Feature | Classification | Evidence |
|---------|---------------|----------|
| Web SPA + Auth | **REAL** | Vite build, Supabase auth, deployed |
| AI Gateway + Advisors | **REAL** | 74 edge functions, DB-backed, receipts |
| Boardroom + Intelligence | **REAL** | Full pipeline, DB persistence, approval chain |
| Business/CRM | **REAL** | DB tables, edge functions, full UI |
| Finance/Money | **REAL** | DB tables, cashflow/tax/payment edge functions |
| Concierge | **REAL** | DB tables, booking edge function |
| Connectors Hub | **REAL** | OAuth flow, health monitoring, 7 edge functions |
| Push Notifications | **REAL** | VAPID keys, push-dispatch, Web Push API |
| Admin Control Plane | **REAL** | 503 pages, admin-api, RBAC |
| File Management | **REAL** | Storage bucket, file-ingestion, cloud-storage-api |
| Desktop OS Shell | **SIMULATED** | Browser-based window manager, no real OS kernel |
| Nova Kernel | **SIMULATED** | TypeScript simulation of scheduler/FS/memory |
| Investment Office | **FRONTEND_ONLY** | UI exists, no backend edge functions |
| Digital Twins | **FRONTEND_ONLY** | Page exists, no backing logic |
| Time Machine | **SIMULATED** | Timeline visualization, no time-travel backend |
| Simulation Engine | **PARTIALLY_REAL** | UI + some DB, no heavy compute backend |
| Achievements/XP | **PARTIALLY_REAL** | UI exists, DB tables exist, no edge function |
| Electron Desktop | **PROTOTYPE** | 6 files exist, no CI, no signing |
| VMware Appliance | **DOCS_ONLY** | Scripts + docs exist, never tested in CI |
| Kubernetes Deploy | **DOCS_ONLY** | YAML exists, not validated |
| Mobile (Native) | **PWA_ONLY** | Responsive UI, no native bridges |
| Revenue Office | **PARTIALLY_REAL** | UI + revenue-caller edge function, partial DB |
| Workflow Engine | **PARTIALLY_REAL** | UI + command_steps table, no orchestration EF |
| GDPR Compliance | **REAL_BACKEND** | gdpr-delete + gdpr-export edge functions |

---

## Section 13 — Outstanding Issues & P0 Blockers

### P0 — Launch Blockers

| # | Issue | Classification | Action Required |
|---|-------|---------------|-----------------|
| 1 | No error monitoring (Sentry/equivalent) | MISSING | Add error boundary + monitoring SDK |
| 2 | No emergency payment kill-switch | MISSING | Add kill-switch edge function |
| 3 | No proven green CI artifacts | NOT_DEPLOYMENT_READY | Run full CI pipeline and fix failures |

### P1 — Pre-GA Required

| # | Issue | Classification |
|---|-------|---------------|
| 1 | Investment Office has no backend | FRONTEND_WITHOUT_BACKEND |
| 2 | Digital Twins has no backend | FRONTEND_WITHOUT_BACKEND |
| 3 | Electron build not in CI | NOT_DEPLOYMENT_READY |
| 4 | src/lib/services/ has 478 files (budget: ~45 canonical) | NEEDS_REFACTOR |
| 5 | Some admin pages render demo data without DB backing | AMBIGUOUS |
| 6 | src/lib/engine/ (3) vs src/lib/engines/ (60) overlap | DUPLICATE |
| 7 | src/lib/hooks/ (10) alongside src/hooks/ (158) | AMBIGUOUS |
| 8 | mock-data/ (27) + demo-data/ (31) overlap | DUPLICATE |

### P2 — Technical Debt

| # | Issue |
|---|-------|
| 1 | Three AI library dirs: ai/ (16), ai-engineering/ (12), ai-gateway/ (1) |
| 2 | journeys/ (2) vs customer-journey/ (9) overlap |
| 3 | VMware/appliance scripts never verified |
| 4 | Constants could merge with design tokens |

---

## Section 14 — Verification Results

| Check | Result |
|-------|--------|
| TypeScript compilation (tsc --noEmit) | ✅ 0 errors |
| All edge functions have index.ts | ✅ 74/74 |
| All routes resolve to existing pages | ✅ Verified |
| All script import paths valid | ✅ 0 broken |
| Platform-law registry paths valid | ✅ All 67 refs correct |
| Manifest registry paths valid | ✅ All 8 refs correct |
| No stale scripts/validation/ references | ✅ 0 remaining |
| Generated artifacts directory clean | ✅ 67 files organized |
| RLS coverage | ✅ 198 tables, 323 policies |
| Admin route integrity | ✅ 503 pages registered |

---

## Section 15 — Deployment Verdict

### Web SPA + Backend: **DEPLOYMENT READY**

The core web application with all 74 edge functions, 198 DB tables, and 14 route families is structurally complete and deployment-ready.

### Conditional Items

- Add error monitoring before production launch (P0)
- Add payment kill-switch before financial features go live (P0)
- Run full CI pipeline to generate green artifacts (P0)
- Wire Investment Office and Digital Twins backends or downgrade claims (P1)
- Consolidate service sprawl for maintainability (P1)

### Not Deployment Ready (by design)

- Electron Desktop: Prototype only
- VMware Appliance: Documentation only
- Native Mobile: PWA only (no native bridges)
- Kubernetes: YAML templates only

---

*Total files audited: 5152 | Generated: 2026-04-16*