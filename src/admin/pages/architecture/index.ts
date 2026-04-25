// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Pages: Architecture / Service Mapping
// Canonical import: @/admin/pages/architecture
// ═══════════════════════════════════════════════════════════════

// ── Flat architecture pages ──
export { default as CanonicalChainExplorer } from "@/pages/admin/CanonicalChainExplorer";
export { default as ChangeImpactAnalyzer } from "@/pages/admin/ChangeImpactAnalyzer";
export { default as CorePersistenceOverview } from "@/pages/admin/CorePersistenceOverview";
export { default as CoreServiceMigrationBoard } from "@/pages/admin/CoreServiceMigrationBoard";
export { default as DependencyMapViewer } from "@/pages/admin/DependencyMapViewer";
export { default as DomainMethodologyPacks } from "@/pages/admin/DomainMethodologyPacks";
export { default as DomainRealityBoard } from "@/pages/admin/DomainRealityBoard";
export { default as FeatureRealityDetail } from "@/pages/admin/FeatureRealityDetail";
export { default as FeatureFactoryConsole } from "@/pages/admin/FeatureFactoryConsole";
export { default as FeatureIntakeDesk } from "@/pages/admin/FeatureIntakeDesk";
export { default as FeatureLifecycleBoard } from "@/pages/admin/FeatureLifecycleBoard";
export { default as MigrationWavePlanner } from "@/pages/admin/MigrationWavePlanner";

// ── SERV (Service) ──
export { default as SERV01ServiceOwnership } from "@/pages/admin/SERV01ServiceOwnership";
export { default as SERV02DomainOwnership } from "@/pages/admin/SERV02DomainOwnership";
export { default as SERV03RouteServiceTrace } from "@/pages/admin/SERV03RouteServiceTrace";
export { default as SERV04ServiceDuplication } from "@/pages/admin/SERV04ServiceDuplication";
export { default as SERV05CanonicalActions } from "@/pages/admin/SERV05CanonicalActions";
export { default as SERV06FlagshipTraceability } from "@/pages/admin/SERV06FlagshipTraceability";

// ── Architecture subdirectory ──
export { default as ArchitectureBoundaryBoard } from "@/pages/admin/architecture/ArchitectureBoundaryBoard";
export { default as SystemArchitecture } from "@/pages/admin/SystemArchitecture";
export { default as EpistemicFirewallBoard } from "@/pages/admin/architecture/EpistemicFirewallBoard";
export { default as GodTierIntegrationBoard } from "@/pages/admin/architecture/GodTierIntegrationBoard";
export { default as GodTierRuntimeBoard } from "@/pages/admin/architecture/GodTierRuntimeBoard";
export { default as KnowledgeSpineBoard } from "@/pages/admin/architecture/KnowledgeSpineBoard";
export { default as SemanticSpineBoard } from "@/pages/admin/architecture/SemanticSpineBoard";
export { default as LiveCortexBoard } from "@/pages/admin/architecture/LiveCortexBoard";

// ── MC Architecture pages (from modules/) ──
export { default as MCArchitectureDashboard } from "@/pages/admin/modules/MCArchitectureDashboard";
export { default as MCArchitectureTests } from "@/pages/admin/modules/MCArchitectureTests";
export { default as MCPlatformAdaptation } from "@/pages/admin/modules/MCPlatformAdaptation";

// ── Deployment & Runtime Truth ──
export { default as DeploymentUnitExplorer } from "@/pages/admin/DeploymentUnitExplorer";
export { default as IngressTopologyViewer } from "@/pages/admin/IngressTopologyViewer";
export { default as DesktopHostCapabilityExplorer } from "@/pages/admin/DesktopHostCapabilityExplorer";
export { default as RuntimeTruthCoverageDashboard } from "@/pages/admin/RuntimeTruthCoverageDashboard";
export { default as DomainManifestDashboard } from "@/pages/admin/DomainManifestDashboard";
