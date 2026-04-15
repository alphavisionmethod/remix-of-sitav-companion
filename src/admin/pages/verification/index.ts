// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: Verification / Testing / Quality Gates
// Canonical import: @/admin/pages/verification
// ═══════════════════════════════════════════════════════════════

// ── SRE ──
export { default as SRE01ValidationCenter } from "@/pages/admin/SRE01ValidationCenter";
export { default as SRE02BuilderCriticConsole } from "@/pages/admin/SRE02BuilderCriticConsole";
export { default as SRE04CodeStandardsTestGen } from "@/pages/admin/SRE04CodeStandardsTestGen";
export { default as SRE05ChaosTestingFramework } from "@/pages/admin/SRE05ChaosTestingFramework";
export { default as SRE06AutoRollbackCenter } from "@/pages/admin/SRE06AutoRollbackCenter";
export { default as SRE07VersionIntelligence } from "@/pages/admin/SRE07VersionIntelligence";
export { default as SRE08SelfOptimizationBudgets } from "@/pages/admin/SRE08SelfOptimizationBudgets";

// ── Other ──
export { default as CompositorDebugPage } from "@/pages/admin/CompositorDebugPage";
export { default as ContractBackendReadiness } from "@/pages/admin/ContractBackendReadiness";

// ── Verification subdirectory ──
export { default as JVC01JourneyVerificationOverview } from "@/pages/admin/verification/JVC01JourneyVerificationOverview";
export { default as JVC04ButtonCTAHealth } from "@/pages/admin/verification/JVC04ButtonCTAHealth";
export { default as JVC05RedirectIntegrityMap } from "@/pages/admin/verification/JVC05RedirectIntegrityMap";
export { default as JVC06PageLoadIntegrity } from "@/pages/admin/verification/JVC06PageLoadIntegrity";
export { default as JVC07FormVerificationCenter } from "@/pages/admin/verification/JVC07FormVerificationCenter";
export { default as JVC08ModalDrawerBoard } from "@/pages/admin/verification/JVC08ModalDrawerBoard";
export { default as JVC09KeyboardCommandBoard } from "@/pages/admin/verification/JVC09KeyboardCommandBoard";
export { default as JVC10RuntimeProbeCenter } from "@/pages/admin/verification/JVC10RuntimeProbeCenter";
export { default as JVC11JourneyReplay } from "@/pages/admin/verification/JVC11JourneyReplay";
export { default as JVC13InteractionDriftRadar } from "@/pages/admin/verification/JVC13InteractionDriftRadar";
export { default as JVC14LaunchInteractionGate } from "@/pages/admin/verification/JVC14LaunchInteractionGate";
export { default as V01SurfaceInventoryBoard } from "@/pages/admin/verification/V01SurfaceInventoryBoard";
export { default as V02InteractionCoverageBoard } from "@/pages/admin/verification/V02InteractionCoverageBoard";
export { default as V03P0JourneyBoard } from "@/pages/admin/verification/V03P0JourneyBoard";
export { default as V04ModeVerificationBoard } from "@/pages/admin/verification/V04ModeVerificationBoard";
export { default as V05FailureTriageBoard } from "@/pages/admin/verification/V05FailureTriageBoard";
export { default as V06EvidenceExplorer } from "@/pages/admin/verification/V06EvidenceExplorer";
export { default as V07LaunchBlockerBoard } from "@/pages/admin/verification/V07LaunchBlockerBoard";

// ── Customer Journey subdirectory ──
export { default as CJ01ExecutiveReport } from "@/pages/admin/customer-journey/CJ01ExecutiveReport";
export { default as CJ02JourneyTruthMatrix } from "@/pages/admin/customer-journey/CJ02JourneyTruthMatrix";
export { default as CJ03JourneyDetailView } from "@/pages/admin/customer-journey/CJ03JourneyDetailView";
export { default as CJ04LaunchBlockerView } from "@/pages/admin/customer-journey/CJ04LaunchBlockerView";
export { default as CJ05DemoVsRealComparison } from "@/pages/admin/customer-journey/CJ05DemoVsRealComparison";
export { default as CJ06BrokenClicksExplorer } from "@/pages/admin/customer-journey/CJ06BrokenClicksExplorer";
export { default as CJ07OwnerRemediationView } from "@/pages/admin/customer-journey/CJ07OwnerRemediationView";
export { default as CJ08RouteActionCoverage } from "@/pages/admin/customer-journey/CJ08RouteActionCoverage";
export { default as CJ09RecentVerificationRuns } from "@/pages/admin/customer-journey/CJ09RecentVerificationRuns";

// ── Frontend subdirectory ──
export { default as FE01QualityMatrix } from "@/pages/admin/frontend/FE01QualityMatrix";
export { default as FE02DesignGovernance } from "@/pages/admin/frontend/FE02DesignGovernance";
