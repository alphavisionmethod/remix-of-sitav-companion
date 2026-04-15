// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Truth Layer — Barrel Export
// Single import point: import { ... } from "@/lib/runtime"
// ═══════════════════════════════════════════════════════════════

// ── Detection & Context ──
export { detectRuntime, getCachedRuntime, resetRuntimeCache } from "./runtime-detection";
export type { RuntimeTarget, RuntimeEnvironment, RuntimeDetectionResult } from "./runtime-detection";

export { createDefaultRuntimeContext, isRuntimeAuthorized } from "./runtime-context";
export type { RuntimeContext, RuntimeTrustState, RuntimeSessionState } from "./runtime-context";

// ── Flags & Assertions ──
export { resolveRuntimeFlags } from "./runtime-flags";
export type { RuntimeFlags } from "./runtime-flags";

export { assertTarget, assertMode, assertCapability, assertAuthenticated, assertMFA, checkTarget, checkCapability, RuntimeAssertionError } from "./runtime-assertions";

// ── Reality & Truth ──
export { PRODUCT_REALITY_TIERS, getTierDefinition, isTrustworthy, requiresDisclaimer } from "./product-reality-tiers";
export type { ProductRealityTier, ProductRealityTierDefinition } from "./product-reality-tiers";

export { TRUTH_CLASSIFICATIONS, getClassification, getClassificationsByTier, isRouteAvailableInMode } from "./runtime-truth-classification";
export type { TruthClassificationEntry } from "./runtime-truth-classification";

export { REALITY_CLASSIFICATIONS, getRouteClassification, getRoutesByTier, getOverallRealityScore } from "./reality-classification-registry";
export type { RealityClassificationEntry } from "./reality-classification-registry";

// ── Capability & Features ──
export { RUNTIME_CAPABILITIES, getCapabilitiesForTarget, isCapabilitySupported, getCapabilityFallback } from "./runtime-capability-matrix";
export type { RuntimeCapabilityEntry } from "./runtime-capability-matrix";

export { RUNTIME_FEATURES, getFeature, getFeaturesByDomain, isFeatureAvailable } from "./runtime-feature-registry";
export type { RuntimeFeatureEntry } from "./runtime-feature-registry";

// ── Messages ──
export { RUNTIME_MESSAGES, getMessage, getMessagesByCategory } from "./runtime-message-registry";
export type { RuntimeMessageDefinition, MessageCategory, MessagePriority } from "./runtime-message-registry";

export { TRANSPORT_MAP, getTransport, getTransportBinding } from "./runtime-transport-map";
export type { TransportMechanism, TransportBinding } from "./runtime-transport-map";

export { MESSAGE_TRUST_CLASSIFICATIONS, getMessageTrust, isMessageTrusted } from "./message-trust-classification";
export type { MessageTrustLevel, MessageTrustClassification } from "./message-trust-classification";

export { MESSAGE_REPLAY_POLICIES, getReplayPolicy, shouldRejectReplay } from "./message-replay-policy";
export type { ReplayStrategy, MessageReplayPolicy } from "./message-replay-policy";

export { MESSAGE_FAILURE_POLICIES, getFailurePolicy, shouldEscalate } from "./message-failure-policy";
export type { FailureAction, MessageFailurePolicy } from "./message-failure-policy";

// ── Services ──
export { getValidTransitions, isTransitionValid, getNextState } from "./service-lifecycle-registry";
export type { ServiceState, ServiceTransition, ServiceLifecycleEntry } from "./service-lifecycle-registry";

export { STARTUP_ORDER, TOTAL_PHASES, getPhaseServices, getCriticalServices, getServiceDependencies, getEstimatedBootTimeMs } from "./service-startup-order";
export type { StartupServiceEntry } from "./service-startup-order";

export { SERVICE_DOMAIN_MAP, getServiceDomain, getServicesByDomain, getCrossDomainServices } from "./service-domain-map";
export type { ServiceDomain, ServiceDomainEntry } from "./service-domain-map";

export { SERVICE_FAILURE_CONSEQUENCES, getFailureConsequence, getCriticalFailures } from "./service-failure-consequence-map";
export type { FailureSeverity, UserImpact, ServiceFailureConsequence } from "./service-failure-consequence-map";

// ── System Commands ──
export { SYSTEM_COMMANDS, getCommand, getCommandsByDomain, getCommandsByAuthority } from "./system-command-registry";
export type { CommandAuthority, SystemCommandEntry } from "./system-command-registry";

// ── Host Bridges ──
export { HOST_BRIDGES, getBridgeForTarget, getBridgeCapabilities, isBridgeBidirectional } from "./host-bridge-registry";
export type { BridgeType, BridgeStatus, HostBridgeEntry } from "./host-bridge-registry";

// ── Recovery ──
export { RECOVERY_BEHAVIORS, getRecoveryBehavior, getMaxRecoveryLevel } from "./recovery-behavior-registry";
export type { RecoveryStrategy, RecoveryBehaviorEntry, RecoveryStep } from "./recovery-behavior-registry";

// ── Simulated Surfaces ──
export { SIMULATED_SURFACES, getSurfaceReality, getRealSurfaces, getSimulatedSurfaces } from "./simulated-surface-registry";
export type { SurfaceReality, SimulatedSurfaceEntry } from "./simulated-surface-registry";
