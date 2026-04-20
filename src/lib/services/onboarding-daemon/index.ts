// ════════════════════════════════════════════════════════════════
// SITA OS — Onboarding Daemon (onboardingd)  [DEPRECATED]
// ----------------------------------------------------------------
// DEPRECATED: This module implements an alternative 11-step OS
// onboarding orchestrator that has been SUPERSEDED by the canonical
// OSSetupExperience (~50 phases, 29-screen master spec).
//
// CANONICAL REPLACEMENT:  src/components/sita/OSSetupExperience.tsx
// REGISTRY:               src/lib/architecture/onboarding-surface-registry.ts
//                         (see ONBOARDING_DEPRECATED_SURFACES)
//
// Retained for compat with src/pages/FirstBootSetup.tsx and the
// useOnboardingDaemon hook. NEW CODE MUST NOT IMPORT THIS MODULE —
// enforced by scripts/architecture/checks/check-onboarding-surface-truth.ts
//
// Original purpose: First-boot detection, session management, step
// orchestration, hardware detection, policy-aware defaults, resume.
// ════════════════════════════════════════════════════════════════

export type OnboardingGlobalState =
  | "not_started" | "initializing" | "in_progress" | "blocked"
  | "awaiting_network" | "awaiting_auth" | "awaiting_restore"
  | "awaiting_update" | "ready_to_finish" | "completed" | "failed" | "resumed";

export type StepStatus = "pending" | "active" | "complete" | "skipped" | "failed" | "deferred";

export interface OnboardingStep {
  id: string;
  name: string;
  label: string;
  description: string;
  required: boolean;
  orderIndex: number;
  status: StepStatus;
  enteredAt: string | null;
  completedAt: string | null;
  skippedAt: string | null;
  failedAt: string | null;
  validationError: string | null;
}

export interface OnboardingChoice {
  key: string;
  value: unknown;
  source: "user" | "policy_default" | "auto_detected" | "restored";
  applied: boolean;
  appliedAt: string | null;
}

export interface HardwareDetection {
  hardwareModel: string;
  batteryPresent: boolean;
  biometricPresent: boolean;
  tpmPresent: boolean;
  wifiPresent: boolean;
  ethernetPresent: boolean;
  bluetoothPresent: boolean;
  displayResolution: string;
  storageBytes: number;
  memoryBytes: number;
}

export interface RestoreSource {
  id: string;
  sourceType: "cloud" | "local_backup" | "external_media";
  selected: boolean;
  status: "available" | "validating" | "ready" | "failed";
  metadataRef: string | null;
  label: string;
}

export interface OnboardingSession {
  sessionId: string;
  deviceId: string;
  bootId: string;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
  state: OnboardingGlobalState;
  currentStep: string;
  version: string;
  interrupted: boolean;
  resumeToken: string;
  managedEnrollmentMode: boolean;
  steps: OnboardingStep[];
  choices: OnboardingChoice[];
  hardware: HardwareDetection;
  restoreSources: RestoreSource[];
  completionMarkers: { name: string; satisfied: boolean; details: string }[];
}

// ── Step Definitions ──
const STEP_DEFS: Omit<OnboardingStep, "status" | "enteredAt" | "completedAt" | "skippedAt" | "failedAt" | "validationError">[] = [
  { id: "welcome",        name: "welcome",        label: "Welcome",              description: "OS branding, language selection, accessibility shortcuts", required: true,  orderIndex: 0 },
  { id: "region",         name: "region",          label: "Region & Time Zone",   description: "Time zone, keyboard layout, regional formats",           required: true,  orderIndex: 1 },
  { id: "accessibility",  name: "accessibility",   label: "Accessibility",        description: "Screen reader, contrast, motion, text size",             required: false, orderIndex: 2 },
  { id: "network",        name: "network",         label: "Network Setup",        description: "Wi-Fi scan, ethernet detection, captive portal",         required: true,  orderIndex: 3 },
  { id: "account",        name: "account",         label: "Account & Security",   description: "Create user, password, PIN, biometric enrollment",       required: true,  orderIndex: 4 },
  { id: "privacy",        name: "privacy",         label: "Privacy & Security",   description: "Telemetry, cloud sync, Shield defaults",                required: true,  orderIndex: 5 },
  { id: "restore",        name: "restore",         label: "Restore / Import",     description: "Local backup, cloud restore, settings import",           required: false, orderIndex: 6 },
  { id: "update_check",   name: "update_check",    label: "Update Check",         description: "Check for available system updates",                     required: true,  orderIndex: 7 },
  { id: "optimization",   name: "optimization",    label: "Device Optimization",  description: "Battery, Calm Mode, hardware-specific tuning",           required: false, orderIndex: 8 },
  { id: "protection",     name: "protection",      label: "Device Protection",    description: "Firewall, VPN, smart blocking, quiet schedule",          required: true,  orderIndex: 9 },
  { id: "finish",         name: "finish",          label: "Finish & Launch",      description: "Summary of choices, launch desktop session",             required: true,  orderIndex: 10 },
];

const COMPLETION_MARKERS = [
  "language_set", "region_set", "network_configured", "account_created",
  "privacy_configured", "protection_configured", "update_checked"
];

// ── Simulated Hardware Detection ──
function detectHardware(): HardwareDetection {
  return {
    hardwareModel: navigator.platform || "Unknown",
    batteryPresent: true,
    biometricPresent: "credentials" in navigator,
    tpmPresent: true,
    wifiPresent: true,
    ethernetPresent: false,
    bluetoothPresent: "bluetooth" in navigator,
    displayResolution: `${screen.width}x${screen.height}`,
    storageBytes: 512_000_000_000,
    memoryBytes: ((navigator as any).deviceMemory || 8) * 1_000_000_000,
  };
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Onboarding Daemon Engine ──
class OnboardingDaemonEngine {
  private _session: OnboardingSession;
  private _listeners: Set<() => void> = new Set();

  constructor() {
    // Check for existing session in localStorage
    const saved = localStorage.getItem("sita-onboarding-session");
    if (saved) {
      try {
        this._session = JSON.parse(saved);
        if (this._session.state !== "completed") {
          this._session.state = "resumed";
          this._session.interrupted = true;
        }
      } catch {
        this._session = this.createNewSession();
      }
    } else {
      this._session = this.createNewSession();
    }
  }

  private createNewSession(): OnboardingSession {
    return {
      sessionId: crypto.randomUUID(),
      deviceId: localStorage.getItem("sita-device-id") || crypto.randomUUID(),
      bootId: crypto.randomUUID(),
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      state: "not_started",
      currentStep: "welcome",
      version: "2.8.1",
      interrupted: false,
      resumeToken: crypto.randomUUID(),
      managedEnrollmentMode: false,
      steps: STEP_DEFS.map(d => ({
        ...d,
        status: "pending" as StepStatus,
        enteredAt: null, completedAt: null, skippedAt: null, failedAt: null, validationError: null,
      })),
      choices: [],
      hardware: detectHardware(),
      restoreSources: [
        { id: "cloud-1", sourceType: "cloud", selected: false, status: "available", metadataRef: null, label: "SITA Cloud Backup (2.4 MB)" },
        { id: "local-1", sourceType: "local_backup", selected: false, status: "available", metadataRef: null, label: "Local Backup — Apr 10, 2026" },
      ],
      completionMarkers: COMPLETION_MARKERS.map(name => ({ name, satisfied: false, details: "" })),
    };
  }

  getSession(): OnboardingSession { return this._session; }

  subscribe(fn: () => void) {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  }

  private emit() {
    this._session = { ...this._session, updatedAt: new Date().toISOString() };
    localStorage.setItem("sita-onboarding-session", JSON.stringify(this._session));
    this._listeners.forEach(fn => fn());
  }

  private set(partial: Partial<OnboardingSession>) {
    Object.assign(this._session, partial);
    this.emit();
  }

  // ── First-boot detection ──
  isFirstBoot(): boolean {
    return this._session.state !== "completed";
  }

  // ── Start onboarding ──
  async startOnboarding() {
    this.set({ state: "initializing" });
    await delay(500);
    // Hardware detection
    const hw = detectHardware();
    this.set({ state: "in_progress", hardware: hw, currentStep: "welcome" });
    this.setStepActive("welcome");
  }

  // ── Step navigation ──
  private setStepActive(stepId: string) {
    const steps = this._session.steps.map(s =>
      s.id === stepId ? { ...s, status: "active" as StepStatus, enteredAt: new Date().toISOString() } : s
    );
    this.set({ steps, currentStep: stepId });
  }

  getCurrentStep(): OnboardingStep | undefined {
    return this._session.steps.find(s => s.id === this._session.currentStep);
  }

  getStepIndex(): number {
    return this._session.steps.findIndex(s => s.id === this._session.currentStep);
  }

  async completeStep(stepId: string, choices?: Record<string, unknown>) {
    const steps = this._session.steps.map(s =>
      s.id === stepId ? { ...s, status: "complete" as StepStatus, completedAt: new Date().toISOString(), validationError: null } : s
    );

    // Record choices
    const newChoices = [...this._session.choices];
    if (choices) {
      Object.entries(choices).forEach(([key, value]) => {
        const existing = newChoices.findIndex(c => c.key === key);
        const choice: OnboardingChoice = { key, value, source: "user", applied: true, appliedAt: new Date().toISOString() };
        if (existing >= 0) newChoices[existing] = choice;
        else newChoices.push(choice);
      });
    }

    // Update completion markers
    const markers = [...this._session.completionMarkers];
    const markerMap: Record<string, string> = {
      welcome: "language_set", region: "region_set", network: "network_configured",
      account: "account_created", privacy: "privacy_configured",
      protection: "protection_configured", update_check: "update_checked",
    };
    const markerName = markerMap[stepId];
    if (markerName) {
      const mi = markers.findIndex(m => m.name === markerName);
      if (mi >= 0) markers[mi] = { ...markers[mi], satisfied: true, details: `Set at ${new Date().toLocaleTimeString()}` };
    }

    // Determine next step
    const currentIdx = steps.findIndex(s => s.id === stepId);
    const nextStep = steps.find((s, i) => i > currentIdx && s.status === "pending");

    // Update global state based on step
    let globalState: OnboardingGlobalState = "in_progress";
    if (stepId === "network" && !choices?.networkConnected) globalState = "awaiting_network";
    if (stepId === "account" && !choices?.accountCreated) globalState = "awaiting_auth";
    if (stepId === "restore" && choices?.restoreSelected) globalState = "awaiting_restore";

    if (!nextStep) {
      globalState = "ready_to_finish";
    }

    this.set({
      steps, choices: newChoices, completionMarkers: markers,
      state: globalState,
      currentStep: nextStep?.id || this._session.currentStep,
    });

    if (nextStep) {
      this.setStepActive(nextStep.id);
    }
  }

  async skipStep(stepId: string) {
    const step = this._session.steps.find(s => s.id === stepId);
    if (step?.required) return; // Cannot skip required

    const steps = this._session.steps.map(s =>
      s.id === stepId ? { ...s, status: "skipped" as StepStatus, skippedAt: new Date().toISOString() } : s
    );

    const currentIdx = steps.findIndex(s => s.id === stepId);
    const nextStep = steps.find((s, i) => i > currentIdx && s.status === "pending");

    this.set({ steps, currentStep: nextStep?.id || this._session.currentStep });
    if (nextStep) this.setStepActive(nextStep.id);
  }

  goBack() {
    const currentIdx = this.getStepIndex();
    if (currentIdx <= 0) return;
    const prevStep = this._session.steps[currentIdx - 1];
    this.setStepActive(prevStep.id);
  }

  async completeOnboarding() {
    const allRequiredDone = this._session.steps
      .filter(s => s.required)
      .every(s => s.status === "complete");

    if (!allRequiredDone) {
      this.set({ state: "blocked" });
      return false;
    }

    this.set({
      state: "completed",
      completedAt: new Date().toISOString(),
    });
    return true;
  }

  // ── Reset (for testing) ──
  resetOnboarding() {
    localStorage.removeItem("sita-onboarding-session");
    this._session = this.createNewSession();
    this.emit();
  }

  // ── Restore sources ──
  selectRestoreSource(sourceId: string) {
    const sources = this._session.restoreSources.map(s => ({ ...s, selected: s.id === sourceId }));
    this.set({ restoreSources: sources });
  }

  async validateRestoreSource(sourceId: string) {
    const sources = this._session.restoreSources.map(s =>
      s.id === sourceId ? { ...s, status: "validating" as const } : s
    );
    this.set({ restoreSources: sources });
    await delay(1500);
    const finalSources = this._session.restoreSources.map(s =>
      s.id === sourceId ? { ...s, status: "ready" as const } : s
    );
    this.set({ restoreSources: finalSources });
  }
}

// Singleton
export const onboardingDaemon = new OnboardingDaemonEngine();
