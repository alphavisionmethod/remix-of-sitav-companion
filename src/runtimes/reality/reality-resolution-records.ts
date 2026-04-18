// ═══════════════════════════════════════════════════════════════
// SITA OS — Reality Resolution Records
// Part 9 data model: all canonical record types for the
// dual reality + surface separation architecture
// ═══════════════════════════════════════════════════════════════

import type { RealityModeKey } from "./reality-mode-registry";
import type { SurfaceClass, SurfacePosture } from "./surface-class-registry";

// ── Core Records ────────────────────────────────────────────────

/** Reality mode policy for a domain/capability */
export interface RealityModePolicyRecord {
  id: string;
  domain: string;
  capabilityKey?: string;
  appliedMode: RealityModeKey;
  policySource: "tenant" | "feature_flag" | "operator_override" | "environment_default";
  sideEffectPermissions: {
    externalWritesAllowed: boolean;
    connectorWritesAllowed: boolean;
    notificationsLive: boolean;
    approvalExecutesLive: boolean;
    billingLive: boolean;
  };
  analyticsBucket: "real" | "demo" | "internal_test" | "discard";
  launchHonestyClass: "truthful" | "demo_backed" | "sandbox_simulated" | "unavailable" | "planned";
  updatedAt: string;
}

/** Resolution result for a specific request */
export interface RealityModeResolutionRecord {
  id: string;
  route: string;
  resolvedMode: RealityModeKey;
  resolutionSource: string;
  surfaceClass: SurfaceClass;
  providerSource: "real_provider" | "demo_provider" | "internal_provider" | "none";
  scenarioId?: string;
  resolvedAt: string;
  userId?: string;
}

/** Demo provider registry entry */
export interface DemoProviderRegistryRecord {
  id: string;
  domain: string;
  providerName: string;
  scenarioFamily: string;
  seededEntities: number;
  seededWorkflows: number;
  interactionBehavior: "full_interactive" | "read_only" | "guided";
  launchHonestyClass: string;
  supportedSurfaces: SurfaceClass[];
  writableInteractionsSimulated: boolean;
  updatedAt: string;
}

/** Demo scenario pack record */
export interface DemoScenarioPackRecord {
  id: string;
  packId: string;
  name: string;
  description: string;
  targetAudience: string[];
  domains: string[];
  narrativeArc: string;
  defaultLandingRoute: string;
  entityCount: number;
  tourStepCount: number;
  supportedSurfaces: string[];
  status: "active" | "draft" | "archived";
}

/** Demo scenario entity */
export interface DemoScenarioEntityRecord {
  id: string;
  scenarioPackId: string;
  domain: string;
  entityType: string;
  entityKey: string;
  label: string;
  data: Record<string, unknown>;
}

/** Demo interaction policy record */
export interface DemoInteractionPolicyRecord {
  id: string;
  interactionType: string;
  allowedInDemo: boolean;
  sideEffectCategory: string | null;
  uiResponse: "full" | "simulated" | "preview_only" | "blocked_with_message";
  writesToDemoStore: boolean;
  requiresScenarioContext: boolean;
}

/** Real provider activation record */
export interface RealProviderActivationRecord {
  id: string;
  providerId: string;
  category: string;
  providerName: string;
  activationState: "active" | "configured" | "degraded" | "inactive" | "blocked" | "planned";
  healthScore: number;
  domains: string[];
  launchHonestyClass: string;
  secretConfigured: boolean;
  updatedAt: string;
}

/** Surface class registry record */
export interface SurfaceClassRegistryRecord {
  id: string;
  surfaceClass: SurfaceClass;
  name: string;
  posture: SurfacePosture;
  routePrefixes: string[];
  targetAudience: string[];
  density: string;
  tone: string;
  diagnosticsVisible: boolean;
}

/** Surface mode binding record */
export interface SurfaceModeBindingRecord {
  id: string;
  surfaceClass: SurfaceClass;
  route: string;
  realityMode: RealityModeKey;
  providerSource: string;
  launchHonestyClass: string;
  sideEffectPolicy: string;
  analyticsBucket: string;
  userFacingStateClass: string;
}

/** Admin OS capability record */
export interface AdminOsCapabilityRecord {
  id: string;
  capabilityKey: string;
  name: string;
  category: "runtime_truth" | "ai_governance" | "connector_admin" | "launch_truth" | "budget_cost" | "security_trust" | "device_ambient" | "demo_governance" | "system_diagnostics";
  route: string;
  operatorOnly: boolean;
  realityModeAware: boolean;
  description: string;
}

/** User App capability record */
export interface UserAppCapabilityRecord {
  id: string;
  capabilityKey: string;
  name: string;
  category: "daily_workflow" | "finance" | "business" | "assistant" | "files" | "boardroom" | "approvals" | "settings" | "connected_services";
  route: string;
  demoAvailable: boolean;
  realAvailable: boolean;
  userFacingHonestyLabel: "live" | "limited" | "demo" | "coming_soon";
  description: string;
}

/** Launch honesty per-surface record */
export interface LaunchHonestySurfaceRecord {
  id: string;
  surfaceClass: SurfaceClass;
  domain: string;
  honestyClass: "truthful" | "demo_backed" | "partial" | "unavailable" | "planned";
  userVisibleLabel: string;
  adminVisibleDetail: string;
  lastVerifiedAt: string;
}

/** Mode segregation audit record */
export interface ModeSegregationAuditRecord {
  id: string;
  checkType: "analytics_leak" | "side_effect_leak" | "data_contamination" | "provider_mismatch";
  mode: RealityModeKey;
  domain: string;
  passed: boolean;
  detail: string;
  checkedAt: string;
}

/** Analytics segregation policy record */
export interface AnalyticsSegregationPolicyRecord {
  id: string;
  mode: RealityModeKey;
  targetTable: string;
  segregationMethod: "separate_table" | "mode_column" | "discard";
  enforced: boolean;
  description: string;
}

// ── Admin OS Capability Definitions ─────────────────────────────

export const ADMIN_OS_CAPABILITIES: AdminOsCapabilityRecord[] = [
  { id: "ao-01", capabilityKey: "runtime_truth_boards", name: "Runtime Truth Boards", category: "runtime_truth", route: "/admin/truth-registry", operatorOnly: true, realityModeAware: true, description: "Domain-level runtime truth classification" },
  { id: "ao-02", capabilityKey: "ai_governance_center", name: "AI Governance Center", category: "ai_governance", route: "/admin/compute-governance", operatorOnly: true, realityModeAware: true, description: "AI model registry, budget policies, provider health" },
  { id: "ao-03", capabilityKey: "ai_workforce", name: "AI Engineering Team", category: "ai_governance", route: "/admin/ai-workforce", operatorOnly: true, realityModeAware: true, description: "Internal agent registry, tasks, invocations" },
  { id: "ao-04", capabilityKey: "connector_admin", name: "Connector Registry", category: "connector_admin", route: "/admin/connectors", operatorOnly: true, realityModeAware: true, description: "Connector health, OAuth registry, sync status" },
  { id: "ao-05", capabilityKey: "launch_truth", name: "Launch Truth Board", category: "launch_truth", route: "/admin/launch-readiness", operatorOnly: true, realityModeAware: true, description: "Feature gates, launch readiness, truth scores" },
  { id: "ao-06", capabilityKey: "budget_spend", name: "Budget & Spend", category: "budget_cost", route: "/admin/ai-budget", operatorOnly: true, realityModeAware: true, description: "AI cost ledger, budget policies, spend analysis" },
  { id: "ao-07", capabilityKey: "security_posture", name: "Security Posture", category: "security_trust", route: "/admin/security-posture", operatorOnly: true, realityModeAware: false, description: "RLS audit, GDPR compliance, audit trails" },
  { id: "ao-08", capabilityKey: "device_trust", name: "Device Trust", category: "device_ambient", route: "/admin/device-management", operatorOnly: true, realityModeAware: true, description: "Connected devices, trust levels, health" },
  { id: "ao-09", capabilityKey: "demo_governance", name: "Demo Governance", category: "demo_governance", route: "/admin/demo-governance", operatorOnly: true, realityModeAware: false, description: "Demo kill switches, receipts, scenario management" },
  { id: "ao-10", capabilityKey: "truth_index", name: "Truth Index Dashboard", category: "runtime_truth", route: "/admin/truth-index", operatorOnly: true, realityModeAware: false, description: "8 composite truth indices from DB" },
  { id: "ao-11", capabilityKey: "mission_control", name: "Mission Control", category: "system_diagnostics", route: "/admin/mission-control", operatorOnly: true, realityModeAware: true, description: "System pulse hero, urgent items, activity timeline" },
  { id: "ao-12", capabilityKey: "incidents", name: "Incident Management", category: "system_diagnostics", route: "/admin/incidents", operatorOnly: true, realityModeAware: true, description: "Severity, scope, root cause, timeline, rollback" },
];

// ── User App Capability Definitions ─────────────────────────────

export const USER_APP_CAPABILITIES: UserAppCapabilityRecord[] = [
  { id: "ua-01", capabilityKey: "dashboard", name: "Dashboard", category: "daily_workflow", route: "/dashboard", demoAvailable: true, realAvailable: true, userFacingHonestyLabel: "live", description: "Morning pulse with key metrics" },
  { id: "ua-02", capabilityKey: "assistant", name: "AI Assistant", category: "assistant", route: "/assistant", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "limited", description: "Contextual AI help across domains" },
  { id: "ua-03", capabilityKey: "files", name: "Files", category: "files", route: "/files", demoAvailable: true, realAvailable: true, userFacingHonestyLabel: "live", description: "Document management and storage" },
  { id: "ua-04", capabilityKey: "boardroom", name: "Boardroom", category: "boardroom", route: "/boardroom", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "demo", description: "Strategic overview with cross-domain insights" },
  { id: "ua-05", capabilityKey: "approvals", name: "Approvals", category: "approvals", route: "/approvals", demoAvailable: true, realAvailable: true, userFacingHonestyLabel: "limited", description: "Trust-weighted action review" },
  { id: "ua-06", capabilityKey: "money", name: "Money", category: "finance", route: "/money", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "demo", description: "Financial accounts and transactions" },
  { id: "ua-07", capabilityKey: "business", name: "Business", category: "business", route: "/business", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "demo", description: "CRM, pipeline, revenue metrics" },
  { id: "ua-08", capabilityKey: "investment", name: "Investment", category: "finance", route: "/investment", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "demo", description: "Portfolio management and analysis" },
  { id: "ua-09", capabilityKey: "workspace", name: "Workspace", category: "daily_workflow", route: "/workspace", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "demo", description: "Projects, tasks, and collaboration" },
  { id: "ua-10", capabilityKey: "settings", name: "Settings", category: "settings", route: "/settings", demoAvailable: true, realAvailable: true, userFacingHonestyLabel: "live", description: "User preferences and configuration" },
  { id: "ua-11", capabilityKey: "connected_services", name: "Connected Services", category: "connected_services", route: "/connected-services", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "limited", description: "External service integrations" },
  { id: "ua-12", capabilityKey: "calendar", name: "Calendar", category: "daily_workflow", route: "/calendar", demoAvailable: true, realAvailable: false, userFacingHonestyLabel: "demo", description: "Scheduling and event management" },
];

// ── Analytics Segregation Policies ──────────────────────────────

export const ANALYTICS_SEGREGATION_POLICIES: AnalyticsSegregationPolicyRecord[] = [
  { id: "asp-01", mode: "real", targetTable: "analytics_events", segregationMethod: "mode_column", enforced: true, description: "Real events tagged with mode='real'" },
  { id: "asp-02", mode: "demo", targetTable: "demo_analytics", segregationMethod: "separate_table", enforced: true, description: "Demo events written to separate demo_analytics table" },
  { id: "asp-03", mode: "sandbox", targetTable: "demo_analytics", segregationMethod: "separate_table", enforced: true, description: "Sandbox events share demo_analytics with sandbox tag" },
  { id: "asp-04", mode: "dev_demo", targetTable: "demo_analytics", segregationMethod: "separate_table", enforced: true, description: "Dev demo events in demo_analytics with internal tag" },
];
