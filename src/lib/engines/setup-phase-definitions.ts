// ═══════════════════════════════════════════════════════════════
// SITA OS — Setup Phase Definitions Registry
// Clean 24-phase flow: boot → trust-certificate
// ═══════════════════════════════════════════════════════════════

import type {
  SetupPhaseDefinition, SetupPhaseStatus, PhaseStatusUX, PhaseTimeoutConfig,
  SetupBranchCondition, SetupPhaseId,
} from "@/packages/contracts/specialized/setup-orchestration";

// ── Helpers ─────────────────────────────────────────────────

const DEFAULT_TIMEOUT: PhaseTimeoutConfig = {
  timeoutMs: 300_000,
  autoRetry: false,
  maxRetries: 0,
  backoffBaseMs: 1000,
  backoffCap: 30_000,
};

const FAST_TIMEOUT: PhaseTimeoutConfig = {
  ...DEFAULT_TIMEOUT,
  timeoutMs: 30_000,
  autoRetry: true,
  maxRetries: 2,
};

const SYSTEM_TIMEOUT: PhaseTimeoutConfig = {
  ...DEFAULT_TIMEOUT,
  timeoutMs: 45_000,
  autoRetry: true,
  maxRetries: 3,
};

function defaultStatusUX(title: string): Record<SetupPhaseStatus, PhaseStatusUX> {
  return {
    idle:       { userMessage: `${title} waiting to start`, allowedActions: [], iconState: "pending" },
    preparing:  { userMessage: `Preparing ${title.toLowerCase()}…`, allowedActions: ["cancel"], iconState: "spinner" },
    active:     { userMessage: title, allowedActions: ["continue", "skip", "view-details"], iconState: "active" },
    validating: { userMessage: `Validating ${title.toLowerCase()}…`, allowedActions: ["cancel"], iconState: "spinner" },
    syncing:    { userMessage: `Saving ${title.toLowerCase()}…`, allowedActions: [], iconState: "spinner" },
    success:    { userMessage: `${title} complete`, allowedActions: ["continue"], iconState: "check" },
    warning:    { userMessage: `${title} completed with warnings`, allowedActions: ["continue", "retry", "view-details"], iconState: "warning" },
    degraded:   { userMessage: `${title} partially complete`, allowedActions: ["retry", "skip", "rollback"], iconState: "warning" },
    blocked:    { userMessage: `${title} blocked`, allowedActions: ["retry", "skip", "rollback"], iconState: "error" },
    skipped:    { userMessage: `${title} skipped`, allowedActions: [], iconState: "skip" },
    resumed:    { userMessage: `Resuming ${title.toLowerCase()}…`, allowedActions: ["cancel"], iconState: "spinner" },
    completed:  { userMessage: `${title} done`, allowedActions: [], iconState: "check" },
  };
}

// ── Branch condition factories ──────────────────────────────

function setupStyleCondition(styles: string[]): SetupBranchCondition {
  return { type: "setup-style", description: `Include for styles: ${styles.join(", ")}`, evaluatorKey: `style:${styles.join(",")}`, includeWhen: true };
}

// ── Phase Definitions ───────────────────────────────────────

export const SETUP_PHASE_DEFINITIONS: SetupPhaseDefinition[] = [
  // ── Phase 0: Boot & Foundation ──
  {
    id: "boot", title: "System Boot", description: "Hardware detection and device attestation",
    dependencies: [], blocking: true, required: true,
    backgroundTaskIds: ["hardware-detect", "device-attest"],
    branchConditions: [], requiredHardware: [],
    timeout: FAST_TIMEOUT, order: 0, excludedFromSteps: true,
    statusUX: defaultStatusUX("System Boot"),
  },
  {
    id: "secure-foundation", title: "Secure Foundation", description: "Set encryption, integrity, privacy baseline, recovery readiness",
    dependencies: ["boot"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: SYSTEM_TIMEOUT, order: 1, excludedFromSteps: true,
    statusUX: defaultStatusUX("Secure Foundation"),
  },

  // ── Phase 1: Machine Readiness ──
  {
    id: "language-region", title: "Language & Region", description: "Set language, region, timezone, and input preferences",
    dependencies: ["secure-foundation"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 2, excludedFromSteps: true,
    statusUX: defaultStatusUX("Language & Region"),
  },
  {
    id: "network-setup", title: "Network Setup", description: "Connect to a network for sync, restore, and updates",
    dependencies: ["language-region"], blocking: true, required: true,
    backgroundTaskIds: ["wifi-scan", "ethernet-detect"],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 3, excludedFromSteps: true,
    statusUX: defaultStatusUX("Network Setup"),
  },
  {
    id: "device-readiness", title: "Device Readiness", description: "Apply critical updates and verify device health",
    dependencies: ["network-setup"], blocking: true, required: true,
    backgroundTaskIds: ["check-updates", "driver-check"],
    branchConditions: [], requiredHardware: [],
    timeout: { ...DEFAULT_TIMEOUT, timeoutMs: 120_000 }, order: 4, excludedFromSteps: true,
    statusUX: defaultStatusUX("Device Readiness"),
  },
  {
    id: "device-ownership", title: "Device Ownership", description: "Determine privacy, sharing, and trust model",
    dependencies: ["device-readiness"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 5, excludedFromSteps: true,
    statusUX: defaultStatusUX("Device Ownership"),
  },

  // ── Phase 2: Identity & Trust Baseline ──
  {
    id: "account-environment", title: "Account / Environment", description: "Sign in, restore, or create a new SITA environment",
    dependencies: ["device-ownership"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 6, excludedFromSteps: true,
    statusUX: defaultStatusUX("Account / Environment"),
  },
  {
    id: "restore-preview", title: "Restore Preview", description: "Preview what will be restored from your backup",
    dependencies: ["account-environment"], blocking: false, required: false,
    backgroundTaskIds: [],
    branchConditions: [{ type: "custom", description: "Show when restore path chosen", evaluatorKey: "custom:restore-path", includeWhen: true }],
    requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 7, excludedFromSteps: true,
    statusUX: defaultStatusUX("Restore Preview"),
  },
  {
    id: "setup-style", title: "Setup Style", description: "Choose express, guided, or advanced setup",
    dependencies: ["account-environment"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 8, excludedFromSteps: true,
    statusUX: defaultStatusUX("Setup Style"),
  },
  {
    id: "access-protection", title: "Access Protection", description: "Protect access with PIN, password, and recovery",
    dependencies: ["setup-style"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 9, excludedFromSteps: true,
    statusUX: defaultStatusUX("Access Protection"),
  },
  {
    id: "recover-first", title: "Recover First", description: "Choose your first recovery action",
    dependencies: ["access-protection"], blocking: false, required: false,
    backgroundTaskIds: [],
    branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 9.5, excludedFromSteps: true,
    statusUX: defaultStatusUX("Recover First"),
  },
  {
    id: "privacy-transparency", title: "Privacy & Transparency", description: "Choose how SITA can learn, personalize, and assist",
    dependencies: ["access-protection"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 9.6, excludedFromSteps: true,
    statusUX: defaultStatusUX("Privacy & Transparency"),
  },
  {
    id: "memory-consent", title: "Memory Consent", description: "How much SITA should remember",
    dependencies: ["privacy-transparency"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 9.7, excludedFromSteps: true,
    statusUX: defaultStatusUX("Memory Consent"),
  },

  // ── Phase 3: Personalization Ceremony ──
  {
    id: "quick-identity", title: "Quick Identity", description: "Help SITA understand where to begin",
    dependencies: ["privacy-transparency"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 10, excludedFromSteps: true,
    statusUX: defaultStatusUX("Quick Identity"),
  },
  {
    id: "want-less-of", title: "Want Less Of", description: "Select what you want less of in life",
    dependencies: ["quick-identity"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 11, excludedFromSteps: true,
    statusUX: defaultStatusUX("Want Less Of"),
  },
  {
    id: "protect-most", title: "Protect Most", description: "Choose what SITA should protect most",
    dependencies: ["want-less-of"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 12, excludedFromSteps: true,
    statusUX: defaultStatusUX("Protect Most"),
  },
  {
    id: "deep-world-modeling", title: "World Modeling", description: "Help SITA understand your world",
    dependencies: ["quick-identity"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 13, excludedFromSteps: true,
    statusUX: defaultStatusUX("World Modeling"),
  },
  {
    id: "household-graph", title: "Household Graph", description: "Map the people in your world",
    dependencies: ["deep-world-modeling"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 14, excludedFromSteps: true,
    statusUX: defaultStatusUX("Household Graph"),
  },
  {
    id: "life-rhythm", title: "Life Rhythm", description: "Understand your weekly flow and planning cadence",
    dependencies: ["deep-world-modeling"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 15, excludedFromSteps: true,
    statusUX: defaultStatusUX("Life Rhythm"),
  },
  {
    id: "stress-slippage", title: "Stress & Slippage", description: "Map where support matters most",
    dependencies: ["deep-world-modeling"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 16, excludedFromSteps: true,
    statusUX: defaultStatusUX("Stress & Slippage"),
  },
  {
    id: "communications-context", title: "Communications", description: "Understand your communication load",
    dependencies: ["deep-world-modeling"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 17, excludedFromSteps: true,
    statusUX: defaultStatusUX("Communications"),
  },
  {
    id: "planning-style", title: "Planning Style", description: "How you think and plan best",
    dependencies: ["deep-world-modeling"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 18, excludedFromSteps: true,
    statusUX: defaultStatusUX("Planning Style"),
  },
  {
    id: "explanation-style", title: "Explanation Style", description: "How SITA explains things to you",
    dependencies: ["planning-style"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 19, excludedFromSteps: true,
    statusUX: defaultStatusUX("Explanation Style"),
  },
  {
    id: "presence-style", title: "Presence Style", description: "How SITA shows up in your day",
    dependencies: ["explanation-style"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 20, excludedFromSteps: true,
    statusUX: defaultStatusUX("Presence Style"),
  },
  {
    id: "interruption-style", title: "Interruption Style", description: "When SITA should interrupt you",
    dependencies: ["presence-style"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 21, excludedFromSteps: true,
    statusUX: defaultStatusUX("Interruption Style"),
  },
  {
    id: "rituals", title: "Rituals", description: "Operating rituals SITA supports",
    dependencies: ["interruption-style"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 22, excludedFromSteps: true,
    statusUX: defaultStatusUX("Rituals"),
  },
  {
    id: "home-composition", title: "Home Composition", description: "Choose your default home layout",
    dependencies: ["rituals"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 23, excludedFromSteps: true,
    statusUX: defaultStatusUX("Home Composition"),
  },
  {
    id: "desktop-preview", title: "Desktop Preview", description: "Tour your desktop before arrival",
    dependencies: ["home-composition"], blocking: false, required: false,
    backgroundTaskIds: [], branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 24, excludedFromSteps: true,
    statusUX: defaultStatusUX("Desktop Preview"),
  },
  {
    id: "primary-use-mode", title: "Primary Use Mode", description: "Choose what SITA should help you run first",
    dependencies: ["deep-world-modeling"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 25, excludedFromSteps: true,
    statusUX: defaultStatusUX("Primary Use Mode"),
  },
  {
    id: "trust-calibration", title: "Trust Calibration", description: "Choose how SITA should help — autonomy spectrum and controls",
    dependencies: ["primary-use-mode"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 26, excludedFromSteps: true,
    statusUX: defaultStatusUX("Trust Calibration"),
  },
  {
    id: "advisor-activation", title: "Advisor Activation", description: "Meet and activate your advisory team",
    dependencies: ["trust-calibration"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 27, excludedFromSteps: true,
    statusUX: defaultStatusUX("Advisor Activation"),
  },
  {
    id: "environment-summary", title: "Environment Summary", description: "Review your shaped environment before arrival",
    dependencies: ["advisor-activation"], blocking: true, required: true,
    backgroundTaskIds: [], branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 28, excludedFromSteps: true,
    statusUX: defaultStatusUX("Environment Summary"),
  },

  // ── Phase 4: Connections & First Value ──
  {
    id: "first-connections", title: "First Connections", description: "Connect email, calendar, payments",
    dependencies: ["environment-summary"], blocking: false, required: false,
    backgroundTaskIds: ["connector-readiness-check"],
    branchConditions: [setupStyleCondition(["guided", "advanced"])],
    requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 29, excludedFromSteps: true,
    statusUX: defaultStatusUX("First Connections"),
  },
  {
    id: "first-win-setup", title: "First Win Setup", description: "Choose your first win for immediate value",
    dependencies: ["environment-summary"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 30, excludedFromSteps: true,
    statusUX: defaultStatusUX("First Win Setup"),
  },
  {
    id: "first-simulation", title: "First Simulation", description: "See SITA handle a real scenario end-to-end",
    dependencies: ["first-win-setup"], blocking: false, required: false,
    backgroundTaskIds: [],
    branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 31, excludedFromSteps: true,
    statusUX: defaultStatusUX("First Simulation"),
  },
  {
    id: "first-actions", title: "First Actions", description: "Review your first 3 SITA actions",
    dependencies: ["first-simulation"], blocking: false, required: false,
    backgroundTaskIds: [],
    branchConditions: [setupStyleCondition(["guided", "advanced"])], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 32, excludedFromSteps: true,
    statusUX: defaultStatusUX("First Actions"),
  },

  // ── Phase 5: Arrival ──
  {
    id: "arrival-prep", title: "Arrival Preparation", description: "Final pre-launch preparation",
    dependencies: ["first-win-setup"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 33, excludedFromSteps: true,
    statusUX: defaultStatusUX("Arrival Preparation"),
  },
  {
    id: "desktop-transition", title: "Desktop Transition", description: "Cinematic transition into the desktop",
    dependencies: ["arrival-prep"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 34, excludedFromSteps: true,
    statusUX: defaultStatusUX("Desktop Transition"),
  },
  {
    id: "system-check", title: "System Check", description: "Verify all subsystems are operational",
    dependencies: ["desktop-transition"], blocking: true, required: true,
    backgroundTaskIds: [
      "check-advisor-intelligence", "check-trust-governance", "check-proof-ledger",
      "check-memory-subsystem", "check-connector-framework", "check-budget-automation",
      "check-fraud-sentinel", "check-workflow-engine",
    ],
    branchConditions: [], requiredHardware: [],
    timeout: SYSTEM_TIMEOUT, order: 24, excludedFromSteps: true,
    statusUX: defaultStatusUX("System Check"),
  },
  {
    id: "trust-certificate", title: "Trust Certificate", description: "Your personalized trust certificate",
    dependencies: ["system-check"], blocking: true, required: true,
    backgroundTaskIds: [],
    branchConditions: [], requiredHardware: [],
    timeout: DEFAULT_TIMEOUT, order: 25, excludedFromSteps: true,
    statusUX: defaultStatusUX("Trust Certificate"),
  },
];

/** Lookup map for O(1) access by phase ID */
export const PHASE_DEFINITION_MAP: Record<SetupPhaseId, SetupPhaseDefinition> =
  SETUP_PHASE_DEFINITIONS.reduce((acc, def) => {
    acc[def.id] = def;
    return acc;
  }, {} as Record<SetupPhaseId, SetupPhaseDefinition>);

/** Background task definitions (id → factory) */
export interface BackgroundTaskFactory {
  id: string;
  label: string;
  blocking: boolean;
  execute: (onProgress: (pct: number) => void) => Promise<void>;
}

/** Default background task factories */
export const BACKGROUND_TASK_FACTORIES: Record<string, BackgroundTaskFactory> = {
  "hardware-detect": {
    id: "hardware-detect", label: "Detecting hardware capabilities", blocking: true,
    execute: async (onProgress) => {
      onProgress(20); await new Promise(r => setTimeout(r, 400));
      onProgress(60); await new Promise(r => setTimeout(r, 300)); onProgress(100);
    },
  },
  "device-attest": {
    id: "device-attest", label: "Establishing device identity", blocking: true,
    execute: async (onProgress) => {
      onProgress(30); await new Promise(r => setTimeout(r, 500)); onProgress(100);
    },
  },
  "wifi-scan": {
    id: "wifi-scan", label: "Scanning for Wi-Fi networks", blocking: false,
    execute: async (onProgress) => {
      onProgress(20); await new Promise(r => setTimeout(r, 600));
      onProgress(70); await new Promise(r => setTimeout(r, 400)); onProgress(100);
    },
  },
  "ethernet-detect": {
    id: "ethernet-detect", label: "Checking ethernet connection", blocking: false,
    execute: async (onProgress) => {
      onProgress(50); await new Promise(r => setTimeout(r, 300)); onProgress(100);
    },
  },
  "check-updates": {
    id: "check-updates", label: "Checking for system updates", blocking: true,
    execute: async (onProgress) => {
      onProgress(20); await new Promise(r => setTimeout(r, 500));
      onProgress(60); await new Promise(r => setTimeout(r, 400)); onProgress(100);
    },
  },
  "driver-check": {
    id: "driver-check", label: "Verifying device drivers", blocking: false,
    execute: async (onProgress) => {
      onProgress(40); await new Promise(r => setTimeout(r, 350)); onProgress(100);
    },
  },
  "connector-readiness-check": {
    id: "connector-readiness-check", label: "Checking connector readiness", blocking: false,
    execute: async (onProgress) => {
      onProgress(25); await new Promise(r => setTimeout(r, 600));
      onProgress(75); await new Promise(r => setTimeout(r, 300)); onProgress(100);
    },
  },
  "check-advisor-intelligence": {
    id: "check-advisor-intelligence", label: "Advisor intelligence layer", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 300 + Math.random() * 200)); onProgress(100); },
  },
  "check-trust-governance": {
    id: "check-trust-governance", label: "Trust & governance engine", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 250 + Math.random() * 200)); onProgress(100); },
  },
  "check-proof-ledger": {
    id: "check-proof-ledger", label: "Proof ledger", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 200 + Math.random() * 200)); onProgress(100); },
  },
  "check-memory-subsystem": {
    id: "check-memory-subsystem", label: "Memory subsystem", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 300 + Math.random() * 150)); onProgress(100); },
  },
  "check-connector-framework": {
    id: "check-connector-framework", label: "Connector framework", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 350 + Math.random() * 200)); onProgress(100); },
  },
  "check-budget-automation": {
    id: "check-budget-automation", label: "Budget automation", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 200 + Math.random() * 250)); onProgress(100); },
  },
  "check-fraud-sentinel": {
    id: "check-fraud-sentinel", label: "Fraud sentinel", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 280 + Math.random() * 200)); onProgress(100); },
  },
  "check-workflow-engine": {
    id: "check-workflow-engine", label: "Workflow engine", blocking: true,
    execute: async (onProgress) => { onProgress(50); await new Promise(r => setTimeout(r, 320 + Math.random() * 150)); onProgress(100); },
  },
};
