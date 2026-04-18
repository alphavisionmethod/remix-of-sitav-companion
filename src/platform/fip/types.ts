// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Integration Protocol Types
// ═══════════════════════════════════════════════════════════════

export type FeatureType = 'greenfield' | 'extension' | 'refactor' | 'pack' | 'simulation' | 'connector' | 'workflow' | 'advisor' | 'admin-tool';
export type WedgePriority = 'critical' | 'high' | 'medium' | 'low' | 'deferred';
export type RiskTier = 'standard' | 'elevated' | 'critical';
export type AutonomyTier = 'observe' | 'diagnose' | 'recommend' | 'draft' | 'simulate' | 'approval_ready' | 'constrained_action_ready';
export type IntakeStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';
export type ReadinessStage = 'spec-ready' | 'architecture-ready' | 'implementation-ready' | 'internal-ready' | 'simulation-ready' | 'shadow-ready' | 'pilot-ready' | 'launch-ready' | 'production-hardened' | 'scale-ready';
export type RolloutMode = 'dev-only' | 'staging-only' | 'internal-shadow' | 'internal-real' | 'limited-tenant-ring' | 'premium-ring' | 'general-availability';
export type KillSwitchClass = 'ui-hide' | 'side-effects-disabled' | 'connector-writes-disabled' | 'recurring-disabled' | 'approval-paused' | 'full-workflow-disabled';
export type RetirementStatus = 'active' | 'deprecated' | 'retiring' | 'retired';
export type CapabilityClass = 'observe' | 'classify' | 'summarize' | 'recommend' | 'draft' | 'simulate' | 'approve' | 'execute' | 'verify' | 'notify' | 'boardroom-compose' | 'projection-build' | 'support-diagnose' | 'billing-gate' | 'pack-install';
export type ViolationSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type OwnerRecommendation = 'extend_existing' | 'use_shared_package' | 'use_worker' | 'use_projection' | 'create_new_owner';

export const READINESS_STAGES: ReadinessStage[] = [
  'spec-ready', 'architecture-ready', 'implementation-ready', 'internal-ready',
  'simulation-ready', 'shadow-ready', 'pilot-ready', 'launch-ready',
  'production-hardened', 'scale-ready'
];

export const CAPABILITY_CLASSES: CapabilityClass[] = [
  'observe', 'classify', 'summarize', 'recommend', 'draft', 'simulate',
  'approve', 'execute', 'verify', 'notify', 'boardroom-compose',
  'projection-build', 'support-diagnose', 'billing-gate', 'pack-install'
];

export const COMPLIANCE_SECTIONS = [
  { key: 'owner_declared', label: 'Owner Declared', icon: 'Users' },
  { key: 'capabilities_registered', label: 'Capabilities Registered', icon: 'Layers' },
  { key: 'contracts_defined', label: 'Contracts Defined', icon: 'FileText' },
  { key: 'workflow_defined', label: 'Workflow Defined', icon: 'GitBranch' },
  { key: 'policy_defined', label: 'Policy/Approval Defined', icon: 'Shield' },
  { key: 'execution_path_defined', label: 'Execution Path Defined', icon: 'Zap' },
  { key: 'receipts_defined', label: 'Receipts/Proof Defined', icon: 'Receipt' },
  { key: 'memory_effects_declared', label: 'Memory Effects Declared', icon: 'Brain' },
  { key: 'boardroom_integration', label: 'Boardroom Integration', icon: 'LayoutDashboard' },
  { key: 'observability_defined', label: 'Observability Defined', icon: 'Activity' },
  { key: 'testing_defined', label: 'Testing Defined', icon: 'TestTube2' },
  { key: 'rollout_defined', label: 'Rollout Defined', icon: 'Rocket' },
  { key: 'generated_truth_updated', label: 'Generated Truth Updated', icon: 'Database' },
  { key: 'deprecation_planned', label: 'Deprecation Planned', icon: 'Archive' },
] as const;

export const RED_TEAM_QUESTIONS = [
  "Could this create a second brain?",
  "Could this become a fourth module in disguise?",
  "Could this bypass policy or approval?",
  "Could this leak data across boundaries?",
  "Could this silently escalate autonomy?",
  "Could support diagnose it today?",
  "Could it be replayed safely?",
  "Could it survive connector degradation?",
  "Could it mislead users with false completion?",
  "Is model usage covering for poor deterministic modeling?",
  "Is it truly wedge-critical?",
];
