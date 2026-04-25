// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Twin Data Model
// Complete typed schema for the Revenue Office Business Twin
// ═══════════════════════════════════════════════════════════════

// A. Business Twin Profile
export interface BusinessTwinProfile {
  businessTwinId: string;
  userId: string;
  businessName: string;
  primaryBusinessArchetype: BusinessArchetype;
  secondaryArchetypes: BusinessArchetype[];
  businessStage: "starting" | "growing" | "established" | "scaling";
  organizationStructure: "solo" | "small_team" | "growing_team" | "multi_client" | "multi_location";
  teamSizeCategory: string;
  multiBrand: boolean;
  multiClient: boolean;
  multiLocation: boolean;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export type BusinessArchetype =
  | "service" | "agency" | "coaching" | "creator" | "ecommerce"
  | "local" | "membership" | "hybrid" | "evolving";

// B. Revenue Model
export interface BusinessRevenueModel {
  revenueModelId: string;
  businessTwinId: string;
  primaryRevenueModes: RevenueMode[];
  secondaryRevenueModes: RevenueMode[];
  primaryConversionMotion: string;
  closesBy: string[];
  pricingStyle: "fixed" | "custom" | "tiered" | "dynamic" | "mixed";
  recurringRevenuePresent: boolean;
  quoteDriven: boolean;
  bookingDriven: boolean;
  checkoutDriven: boolean;
  referralDriven: boolean;
  launchDriven: boolean;
  localVisitDriven: boolean;
  notes: string;
}

export type RevenueMode =
  | "appointments" | "proposals" | "retainers" | "digital_products"
  | "memberships" | "ecommerce" | "in_person" | "referrals"
  | "launches" | "subscriptions" | "mixed";

// C. Acquisition Model
export interface AcquisitionModel {
  acquisitionModelId: string;
  businessTwinId: string;
  primarySources: string[];
  strongestSource: string;
  weakestSource: string;
  desiredGrowthSource: string;
  sourceImportanceWeights: Record<string, number>;
  sourceConfidence: number;
}

// D. Customer Journey Model
export interface CustomerJourneyModel {
  journeyModelId: string;
  businessTwinId: string;
  stages: JourneyStage[];
  revenueMoments: string[];
  dropoffPoints: string[];
  conversionMoments: string[];
  reviewMoments: string[];
  retentionMoments: string[];
  advocacyMoments: string[];
  journeyComplexityScore: number;
  notes: string;
}

export interface JourneyStage {
  stageId: string;
  stageType: "awareness" | "capture" | "nurture" | "conversion" | "delivery" | "retention" | "advocacy" | "custom";
  label: string;
  order: number;
  entryConditions: string[];
  exitConditions: string[];
  linkedAssets: string[];
  linkedAutomations: string[];
  linkedOffers: string[];
  leakageRiskScore: number;
  revenueImpactEstimate: number;
  ownerRoles: string[];
}

// E. Delivery Model
export interface DeliveryModel {
  deliveryModelId: string;
  businessTwinId: string;
  deliveryTypes: string[];
  onboardingSteps: string[];
  fulfillmentSteps: string[];
  retentionSteps: string[];
  renewalSteps: string[];
  reviewRequestMoments: string[];
  postSaleRiskPoints: string[];
}

// F. Relationship Model
export interface RelationshipModel {
  relationshipModelId: string;
  businessTwinId: string;
  entityTypesPresent: ("lead" | "customer" | "member" | "client" | "subscriber" | "visitor")[];
  keySegments: string[];
  vipSegmentRules: Record<string, unknown>;
  lifecycleStages: string[];
  relationshipOwners: string[];
  accountAssignmentRules: Record<string, unknown>;
  trustSignalsTracked: string[];
}

// G. Team Responsibility Model
export interface TeamResponsibilityModel {
  responsibilityModelId: string;
  businessTwinId: string;
  teamRoles: TeamRole[];
  roleAssignments: Record<string, string>;
  approvalRequirements: ApprovalRequirement[];
  delegatedDomains: string[];
  escalationPaths: EscalationPath[];
}

export interface TeamRole {
  roleId: string;
  label: string;
  domain: string;
  assignedTo: string;
}

export interface ApprovalRequirement {
  action: string;
  requiredBy: string;
  threshold?: number;
}

export interface EscalationPath {
  trigger: string;
  escalateTo: string;
  timeoutMinutes: number;
}

// H. Tooling Model
export interface ToolingModel {
  toolingModelId: string;
  businessTwinId: string;
  connectedSystems: ConnectedSystem[];
  importedSystems: string[];
  uploadedArtifacts: UploadedArtifact[];
  pastedUrls: string[];
  syncConfidence: number;
  migrationConfidence: number;
  duplicateRiskLevel: "low" | "medium" | "high";
  systemCoverageSummary: Record<string, boolean>;
}

export interface ConnectedSystem {
  systemId: string;
  provider: string;
  category: string;
  status: "connected" | "pending" | "failed" | "disconnected";
  syncScope: string[];
  lastSyncAt?: string;
}

export interface UploadedArtifact {
  artifactId: string;
  artifactType: string;
  title: string;
  sourceRef: string;
  extractedSignals: string[];
  extractionConfidence: number;
  processingStatus: "pending" | "processing" | "complete" | "failed";
}

// I. Growth Bottleneck Model
export interface GrowthBottleneckModel {
  bottleneckModelId: string;
  businessTwinId: string;
  primaryBottlenecks: string[];
  secondaryBottlenecks: string[];
  estimatedLeakAreas: LeakArea[];
  reliefPriorities: string[];
  urgencyScore: number;
  confidenceScore: number;
}

export interface LeakArea {
  area: string;
  estimatedRevenueLossCents: number;
  confidence: number;
  suggestedFix: string;
}

// J. Automation Trust Model
export interface AutomationTrustModel {
  automationTrustModelId: string;
  businessTwinId: string;
  automationMode: "manual" | "assisted" | "guardrailed" | "broad";
  humanOnlyActions: string[];
  assistedActions: string[];
  autoAllowedActions: string[];
  approvalRequiredActions: string[];
  noGuessModeEnabled: boolean;
  rolloutPreference: "cautious" | "balanced" | "aggressive";
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  trigger: string;
  action: string;
  notifyRole: string;
}

// K. Advisor Activation Model
export interface AdvisorActivationModel {
  advisorActivationModelId: string;
  businessTwinId: string;
  activeAdvisors: AdvisorConfig[];
  advisorPriorityOrder: string[];
  advisorIntensityLevels: Record<string, "low" | "medium" | "high">;
  advisorSurfacePreferences: Record<string, string[]>;
  synthesisMode: "summary" | "detailed" | "strategic";
}

export interface AdvisorConfig {
  advisorId: string;
  name: string;
  domain: string;
  active: boolean;
  intensity: "low" | "medium" | "high";
  activationReason: string;
}

// L. First Win Model
export interface FirstWinModel {
  firstWinModelId: string;
  businessTwinId: string;
  recommendedFirstWins: FirstWinRecommendation[];
  selectedFirstWin: string;
  recommendationReasons: string[];
  estimatedImpact: string;
  confidenceScore: number;
  requiredDependencies: string[];
}

export interface FirstWinRecommendation {
  id: string;
  label: string;
  reason: string;
  estimatedImpact: string;
  effort: "low" | "medium" | "high";
  confidence: number;
  dependencies: string[];
}

// M. Import Artifact Record
export interface ImportArtifactRecord {
  artifactId: string;
  businessTwinId: string;
  artifactType: string;
  sourceType: "upload" | "url" | "integration" | "csv_import";
  title: string;
  sourceRef: string;
  extractedSignals: string[];
  extractionConfidence: number;
  mappedEntities: string[];
  processingStatus: "pending" | "processing" | "complete" | "failed";
  createdAt: string;
}

// N. Inferred Business Signal
export interface InferredBusinessSignal {
  signalId: string;
  businessTwinId: string;
  signalType: BusinessSignalType;
  title: string;
  summary: string;
  confidence: number;
  evidenceRefs: string[];
  editable: boolean;
  sensitive: boolean;
  createdAt: string;
}

export type BusinessSignalType =
  | "booking_heavy_business" | "quote_driven_service_model"
  | "likely_retainer_business" | "likely_creator_membership_model"
  | "onboarding_document_heavy" | "review_opportunity_high"
  | "retention_gap_detected" | "referral_engine_strong"
  | "checkout_driven_model" | "local_discovery_dependent"
  | "hybrid_revenue_model" | "proposal_heavy_workflow"
  | "fulfillment_bottleneck" | "campaign_dependent_growth";

// O. Business Onboarding Session
export interface BusinessOnboardingSession {
  sessionId: string;
  businessTwinId: string;
  onboardingDepth: "quick" | "balanced" | "deep";
  currentStep: string;
  completedSteps: string[];
  skippedSteps: string[];
  confidenceSummary: Record<string, number>;
  startedAt: string;
  completedAt?: string;
}

// Complete Business Twin (aggregated)
export interface BusinessTwin {
  profile: BusinessTwinProfile;
  revenueModel: BusinessRevenueModel;
  acquisitionModel: AcquisitionModel;
  customerJourney: CustomerJourneyModel;
  deliveryModel: DeliveryModel;
  relationshipModel: RelationshipModel;
  teamResponsibility: TeamResponsibilityModel;
  toolingModel: ToolingModel;
  growthBottlenecks: GrowthBottleneckModel;
  automationTrust: AutomationTrustModel;
  advisorActivation: AdvisorActivationModel;
  firstWin: FirstWinModel;
  artifacts: ImportArtifactRecord[];
  signals: InferredBusinessSignal[];
  session: BusinessOnboardingSession;
}
