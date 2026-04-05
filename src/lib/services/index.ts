// ═══════════════════════════════════════════════════════════════
// SITA OS — Services Barrel Export
//
// ARCHITECTURE ROLE:
//   Backend-ready service implementations. These contain the
//   business logic for approval flows, capability routing,
//   event processing, receipts, verification, projections, etc.
//
//   ✅ core-services/ re-exports from here (facade pattern)
//   ✅ Hooks and context providers may import from here
//   ✅ Edge functions and persistence adapters use these
//   ❌ Pages SHOULD NOT import directly — use engines/ or hooks/
//   ❌ Services MUST NOT import from engines/ (wrong direction)
//
//   For page-facing pure engines, use src/lib/engines/
//   For persistence, use src/lib/persistence/
// ═══════════════════════════════════════════════════════════════

export * from "./brain-core";
export * from "./business-os";
export * from "./finance-os";
export * from "./concierge-os";

export { evaluateTruthBoundaries, getBoundaryRule, listProtectedFields, isFieldProtected } from "./policy-engine";
export { resolveApprovalRequirements, getThresholdsForDomain } from "./policy-engine";
export { classifyDocument, getRedactionRules, bulkClassify } from "./policy-engine";
export { validateOutboundCommunication, getPolicyForType, getRemainingQuota } from "./policy-engine";
export { createApprovalRequest, addDecision, getRequest, listPending, updateStatus, expireStale } from "./approval-engine";
export { routeApproval, canDelegate, getNextDelegate } from "./approval-engine";
export { getEscalationConfig, shouldEscalate, getNextEscalationTarget, createMultiStepApproval, advanceMultiStep } from "./approval-engine";
export { recordApproval, getApprovalHistory, computeMetrics } from "./approval-engine";
export { registerCapability, getCapability, listByDomain, listByFamily, listByRiskTier, findCapabilities, getAllCapabilities, getRegistryHealth } from "./capability-router";
export { checkCapabilityEnabled, listEnabledCapabilities, getPackDefinition, listPacks } from "./capability-router";
export { resolveRoute, resolveSection, listRoutesForSection, getDeepLinkableRoutes, registerRoute } from "./capability-router";
export { executeAction, getEnvelope, markFailed, markRolledBack, listExecutions } from "./executor-service";
export { initWorkflowState, executeStep, canRetry } from "./executor-service";
export { executeConnectorAction, getConnectorHealth, getAllConnectorHealth, setConnectorHealth } from "./executor-service";
export { createActionReceipt, createSystemReceipt, getChain, verifyChainIntegrity, getReceiptById } from "./receipt-service";
export { assembleProofBundle, validateBundle, mergeBundles } from "./receipt-service";
export { generateApprovalReceipt, generateSingleApprovalReceipt } from "./receipt-service";
export { generateExecutionReceipt, generateBatchExecutionReceipts } from "./receipt-service";
export { verify, getVerificationHistory, getVerificationStats } from "./verification-engine";
export { detectRollbackCondition, generateRollbackProof } from "./verification-engine";
export { createPostconditionCheck, runPostconditionChecks, summarizeChecks } from "./verification-engine";
export { createEventEnvelope, markDelivered, markDeadLettered, incrementRetry } from "./event-bus";
export { publish, publishBatch, getEventLog, getDeadLetterQueue } from "./event-bus";
export { subscribe, unsubscribe, listSubscriptions, clearSubscriptions, subscribeOnce } from "./event-bus";
export { generateHomePulse } from "./projections";
export { generateBusinessProjection } from "./projections";
export { generateMoneyProjection } from "./projections";
export { generateConciergeProjection } from "./projections";
export { generateAdvisorProjection } from "./projections";
export { generateBoardroomProjection } from "./projections";
export { generateProofProjection } from "./projections";
export { generateStoreProjection } from "./projections";
export { storeProfileMemory, getProfileMemory, listProfileMemories, deleteProfileMemory, clearExpired } from "./memory-service";
export { saveWorkflowCheckpoint, getWorkflowCheckpoint, getLatestCheckpoint, listWorkflowCheckpoints, deleteWorkflowCheckpoint, pruneOldCheckpoints } from "./memory-service";
export { getPreference, setPreference, listPreferences, resetToDefaults, exportPreferences } from "./memory-service";
export { recordDecision as recordBoardroomDecision, getDecision as getBoardroomDecision, listDecisions as listBoardroomDecisions, addCarryover, ageCarryovers, resolveCarryover, listCarryovers } from "./memory-service";
export { initializeTrust, updateTrustFactor, getTrustState, addTrustFlag, resolveFlag } from "./memory-service";
export { recordCorrection, getCorrections, computeCorrectionStats } from "./memory-service";
export * from "./connector-control-plane";
export { generateBusinessPacket as generateBoardroomBusinessPacket, generateFinancePacket as generateBoardroomFinancePacket, generateFamilyPacket as generateBoardroomFamilyPacket, generateOpportunityPacket as generateBoardroomOpportunityPacket, generateCommitteePacket as generateBoardroomCommitteePacket } from "./boardroom-service";
export { createCarryover, ageAllCarryovers, resolveCarryoverItem, getOpenCarryovers, getAllCarryovers } from "./boardroom-service";
export { storeDecision, getDecisionById, listSessionDecisions, searchDecisions, getRecentDecisions } from "./boardroom-service";
export { composeAdvisorTracks, getAdvisorName } from "./boardroom-service";
export { generateDiagnosticBundle as generateExtDiagnosticBundle, generateExtendedDiagnostic } from "./support-diagnostics";
export { generateSupportSummary } from "./support-diagnostics";
export { captureReplayMetadata, redactReplayForSupport } from "./support-diagnostics";
export { classifyIncident as classifySupportIncident } from "./support-diagnostics";
export * from "./sovereign-calculation";
export { OpportunityGraphService, createOpportunityGraphService } from "./opportunity-graph";
export { IntegrationConciergeService, createIntegrationConciergeService } from "./integration-concierge";
export { OSUnificationService, createOSUnificationService } from "./os-unification";
export { OwnerControlRoomService, createOwnerControlRoomService } from "./owner-control-room";
export { ObservabilityService, createObservabilityService } from "./observability";
export { TenantFirewallService, createTenantFirewallService } from "./tenant-firewall";
export { TrustedDeviceService, createTrustedDeviceService } from "./trusted-device";

// ── Phase 1: Trust & Security ────────────────────────────────
export { TrustGovernorService, createTrustGovernor } from "./trust-governor";
export { KeyvaultService, createKeyvault } from "./keyvault";
export { DuressDetectionService, createDuressDetection } from "./duress-detection";
export { EmergencyHaltService, createEmergencyHalt } from "./emergency-halt";
export { InjectionFirewallService, createInjectionFirewall } from "./injection-firewall";

// ── Phase 2: AI Workforce & Intelligence ─────────────────────
export { AIWorkforceService, createAIWorkforce } from "./ai-workforce";
export { AIEconomicsService, createAIEconomics } from "./ai-economics";
export { ModelRouterService, createModelRouter } from "./model-router";
export { InferenceGatewayService, createInferenceGateway } from "./inference-gateway";
export { CouncilOrchestratorService, createCouncilOrchestrator } from "./council-orchestrator";

// ── Phase 3: Communication & Workflow ────────────────────────
export { CommunicationService, createCommunicationService } from "./communication-service";
export { MessagingGatewayService, createMessagingGateway } from "./messaging-gateway";
export { NotificationsService, createNotifications } from "./notifications";
export { BookingSchedulingService, createBookingScheduling } from "./booking-scheduling";
export { DocumentSignatureService, createDocumentSignature } from "./document-signature";
export { TimelineCalendarService, createTimelineCalendar } from "./timeline-calendar";

// ── Phase 4: Revenue & Business Intelligence ─────────────────
export { RevenueAutopilotService, createRevenueAutopilot } from "./revenue-autopilot";
export { CapitalAllocationService, createCapitalAllocation } from "./capital-allocation";
export { OutcomeEngineService, createOutcomeEngine } from "./outcome-engine";
export { DataScopeModelService, createDataScopeModel } from "./data-scope-model";

// ── Phase 5: Platform Infrastructure ─────────────────────────
export { RealtimeGatewayService, createRealtimeGateway } from "./realtime-gateway";
export { ServiceRegistryService, createServiceRegistry } from "./service-registry";
export { SovereignExporterService, createSovereignExporter } from "./sovereign-exporter";
export { SovereignTimeService, createSovereignTime } from "./sovereign-time";
export { DatabaseService, createDatabaseService } from "./database";

// ── Phase 6: Admin Consolidation ─────────────────────────────
export { AdminService, createAdminService } from "./admin-service";

// ── Phase 7: Infrastructure Services ─────────────────────────
export { CloudControlPlaneService, createCloudControlPlaneInfra } from "./cloud-control-plane-infra";
export { EdgeDeviceRuntimeService, createEdgeDeviceRuntime } from "./edge-device-runtime";
export { FleetOTAService, createFleetOTA } from "./fleet-ota";
export { IncidentManagementService, createIncidentManagement } from "./incident-management";

// ── Phase 8: Full Service Topology (non-conflicting with core-services) ──
export { AccuracyClassifierService, createAccuracyClassifier } from "./accuracy-classifier";
export { AttributionAnalyticsService, createAttributionAnalytics } from "./attribution-analytics";
export { AuthService, createAuthService } from "./auth";
export { ConstitutionEngineService, createConstitutionEngine } from "./constitution-engine";
export { DigitalTwinsService, createDigitalTwins } from "./digital-twins";
export { DocumentEngineService, createDocumentEngine } from "./document-engine";
export { EnterpriseControlPlaneService, createEnterpriseControlPlane } from "./enterprise-control-plane";
export { EventBrokerService, createEventBroker } from "./event-broker";
export { FleetService, createFleet } from "./fleet";
export { GoldenTraceRunnerService, createGoldenTraceRunner } from "./golden-trace-runner";
export { GroundednessGateService, createGroundednessGate } from "./groundedness-gate";
export { IntentInboxService, createIntentInbox } from "./intent-inbox";
export { MnemosyneService, createMnemosyne } from "./mnemosyne";
export { ObservabilityHubService, createObservabilityHub } from "./observability-hub";
export { OnboardingService, createOnboarding } from "./onboarding";
export { OperatingAutopilotService, createOperatingAutopilot } from "./operating-autopilot";
export { OpportunityEngineService, createOpportunityEngine } from "./opportunity-engine";
export { PackManagementService, createPackManagement } from "./pack-management-service";
export { PersonalOperatingModelService, createPersonalOperatingModel } from "./personal-operating-model";
export { PersonalizationEngineService, createPersonalizationEngine } from "./personalization-engine";
export { PreferencesService, createPreferences } from "./preferences";
export { ProfilesService, createProfiles } from "./profiles";
export { PromptAssemblerService, createPromptAssembler } from "./prompt-assembler";
export { ProofOrchestratorService, createProofOrchestrator } from "./proof-orchestrator";
export { SimulatorService, createSimulator } from "./simulator";
export { SitaModesService, createSitaModes } from "./sita-modes";
export { WebsiteManagementService, createWebsiteManagement } from "./website-management";
export { WorkflowEngineService, createWorkflowEngine as createWorkflowEngineService } from "./workflow-engine";
// Re-export from new service dirs (aliased to avoid core-services conflicts)
export { ActionQueueService, createActionQueue as createActionQueueService } from "./action-queue";
export { AnalyticsService as AnalyticsTrackingService, createAnalytics } from "./analytics";
export { APIGatewayService, createAPIGateway as createAPIGatewayService } from "./api-gateway";
export { BillingService as BillingMeteringService, createBillingService as createBillingMeteringService } from "./billing";
export { ConnectorRunnersService as ConnectorRunnersImpl, createConnectorRunners as createConnectorRunnersImpl } from "./connector-runners";
export { EntityGraphService as EntityGraphImpl, createEntityGraph as createEntityGraphImpl } from "./entity-graph";
export { FileIngestionService as FileIngestionImpl, createFileIngestion as createFileIngestionImpl } from "./file-ingestion";
export { FleetHealthService as FleetHealthImpl, createFleetHealth as createFleetHealthImpl } from "./fleet-health";
export { FraudSentinelService as FraudSentinelImpl, createFraudSentinel as createFraudSentinelImpl } from "./fraud-sentinel";
export { GovernanceSimulatorService as GovSimImpl, createGovernanceSimulator as createGovSimImpl } from "./governance-simulator";
export { HouseholdOrgGraphService as HouseholdOrgGraphImpl, createHouseholdOrgGraph as createHouseholdOrgGraphImpl } from "./household-org-graph";
export { IdentityService as IdentityServiceImpl, createIdentityService as createIdentityServiceImpl } from "./identity";
export { ImmuneController as ImmuneControllerImpl, createImmuneController as createImmuneControllerImpl } from "./immune-controller";
export { AuditLedgerService, createAuditLedger as createAuditLedgerService } from "./audit-ledger";
export { PaymentExecutionService as PaymentExecImpl, createPaymentExecution as createPaymentExecImpl } from "./payment-execution-service";
export { RolePermissionEngineService as RolePermImpl, createRolePermissionEngine as createRolePermImpl } from "./role-permission-engine";
export { SearchFabricService as SearchFabricImpl, createSearchFabric as createSearchFabricImpl } from "./search-fabric";
export { SelfHealingService as SelfHealingImpl, createSelfHealing as createSelfHealingImpl } from "./self-healing";
export { SelfLearningService as SelfLearningImpl, createSelfLearning as createSelfLearningImpl } from "./self-learning";
export { TrustStateService as TrustStateServiceImpl, createTrustStateService as createTrustStateServiceImpl } from "./trust-state-service";

// ── Phase 9: Runtime & Continuity ────────────────────────────
export { BootPersistenceService, getBootPersistenceService } from "./boot-persistence";
export { MetaGovernanceCollectorService, getMetaGovernanceCollector } from "./meta-governance";
export { SessionResumeService, getSessionResumeService } from "./session-resume";
export { useSurfaceType, detectSurfaceType, buildActiveSurface, getDeviceId, getDeviceName } from "./surface-detection";
export * from "./handoff";
export * from "./offline-queue";
