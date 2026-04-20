// ═══════════════════════════════════════════════════════════════
// SITA OS — onboardingd: First-Boot Onboarding Daemon
// Persistent state machine, policy-driven defaults,
// hardware detection, resumable flow, completion gating
// ═══════════════════════════════════════════════════════════════

import { getContextualDecisionEngine } from "./policyd-decisions";
import { getPolicyBundleManager, type DeviceMode } from "./policyd-bundles";
import { getDevicePlatform } from "@/runtimes/runtime-platform";

// ── Types ───────────────────────────────────────────────────

export type OnboardingStepStatus = "pending" | "active" | "complete" | "skipped" | "failed";

export interface OnboardingStep {
  stepId: string;
  name: string;
  displayName: string;
  description: string;
  required: boolean;
  status: OnboardingStepStatus;
  enteredAt?: number;
  completedAt?: number;
  validationError?: string;
  order: number;
  icon: string;
}

export interface OnboardingChoice {
  key: string;
  value: unknown;
  source: "user" | "policy_default" | "auto_detected";
  createdAt: number;
}

export interface HardwareDetection {
  hardwareModel: string;
  batteryPresent: boolean;
  tpmPresent: boolean;
  biometricPresent: boolean;
  networkDevices: Array<{ type: "wifi" | "ethernet" | "cellular"; name: string; available: boolean }>;
  storageTotal: number;
  memoryTotal: number;
  detectedAt: number;
}

export interface OnboardingSession {
  sessionId: string;
  deviceId: string;
  startedAt: number;
  updatedAt: number;
  completedAt?: number;
  interrupted: boolean;
  currentStep: string;
  version: string;
  deviceMode: DeviceMode;
  hardware: HardwareDetection;
  steps: OnboardingStep[];
  choices: OnboardingChoice[];
}

export interface ProtectionDefaults {
  firewallBaseline: boolean;
  vpnOnPublicWifi: boolean;
  threatMonitoring: boolean;
  telemetry: "opt_in" | "opt_out" | "forced";
  batterySaverThreshold: number;
  quietModeEnabled: boolean;
  cloudRestoreAllowed: boolean;
}

// ── Step Definitions ────────────────────────────────────────

const STEP_DEFINITIONS: Array<Omit<OnboardingStep, "status" | "enteredAt" | "completedAt" | "validationError">> = [
  { stepId: "welcome", name: "welcome", displayName: "Welcome", description: "Welcome to SITA OS", required: true, order: 0, icon: "👋" },
  { stepId: "region", name: "region", displayName: "Region & Language", description: "Set your timezone, language, and keyboard layout", required: true, order: 1, icon: "🌍" },
  { stepId: "accessibility", name: "accessibility", displayName: "Accessibility", description: "Configure accessibility preferences", required: false, order: 2, icon: "♿" },
  { stepId: "network", name: "network", displayName: "Network", description: "Connect to WiFi or ethernet", required: true, order: 3, icon: "📡" },
  { stepId: "account", name: "account", displayName: "Account & Security", description: "Create your account and set up device protection", required: true, order: 4, icon: "🔐" },
  { stepId: "privacy", name: "privacy", displayName: "Privacy & Security", description: "Choose your privacy and security preferences", required: true, order: 5, icon: "🛡️" },
  { stepId: "protection", name: "protection", displayName: "Device Protection", description: "Review and activate security features", required: true, order: 6, icon: "⚡" },
  { stepId: "restore", name: "restore", displayName: "Restore & Import", description: "Restore from backup or import settings", required: false, order: 7, icon: "📦" },
  { stepId: "update_check", name: "update_check", displayName: "System Updates", description: "Check for and install available updates", required: false, order: 8, icon: "🔄" },
  { stepId: "optimization", name: "optimization", displayName: "Device Optimization", description: "Optimize performance and battery settings", required: false, order: 9, icon: "⚙️" },
  { stepId: "finish", name: "finish", displayName: "All Set!", description: "Review your settings and launch SITA OS", required: true, order: 10, icon: "🎉" },
];

// ── Onboarding Daemon ───────────────────────────────────────

export class OnboardingDaemon {
  private session: OnboardingSession | null = null;
  private protectionDefaults: ProtectionDefaults | null = null;
  private initialized = false;
  private completionCallbacks: Array<() => void> = [];

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Try to restore interrupted session
    const saved = this.loadSavedSession();
    if (saved && !saved.completedAt) {
      this.session = saved;
      this.session.interrupted = true;
    }

    this.initialized = true;
  }

  // ── Session Lifecycle ─────────────────────────────────────

  startSession(deviceMode: DeviceMode = "home"): OnboardingSession {
    const hardware = this.detectHardware();

    this.session = {
      sessionId: crypto.randomUUID(),
      deviceId: `sita-device-${Date.now().toString(36)}`,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      interrupted: false,
      currentStep: "welcome",
      version: "1.0.0",
      deviceMode,
      hardware,
      steps: STEP_DEFINITIONS.map(s => ({ ...s, status: "pending" as OnboardingStepStatus })),
      choices: [],
    };

    // Compute policy-driven defaults
    this.computeProtectionDefaults();
    this.saveSession();
    return this.session;
  }

  getSession(): OnboardingSession | null {
    return this.session ? { ...this.session } : null;
  }

  isComplete(): boolean {
    return !!this.session?.completedAt;
  }

  isDesktopLaunchAllowed(): boolean {
    if (!this.session) return true; // No onboarding active = allow
    if (this.session.completedAt) return true;

    // All required steps must be complete
    return this.session.steps
      .filter(s => s.required)
      .every(s => s.status === "complete");
  }

  // ── Step Navigation ───────────────────────────────────────

  getCurrentStep(): OnboardingStep | null {
    if (!this.session) return null;
    return this.session.steps.find(s => s.stepId === this.session!.currentStep) || null;
  }

  getCompletedSteps(): OnboardingStep[] {
    if (!this.session) return [];
    return this.session.steps.filter(s => s.status === "complete" || s.status === "skipped");
  }

  getRemainingSteps(): OnboardingStep[] {
    if (!this.session) return [];
    return this.session.steps.filter(s => s.status === "pending" || s.status === "active");
  }

  getProgress(): { completed: number; total: number; percent: number } {
    if (!this.session) return { completed: 0, total: 0, percent: 0 };
    const total = this.session.steps.length;
    const completed = this.session.steps.filter(s => s.status === "complete" || s.status === "skipped").length;
    return { completed, total, percent: Math.round((completed / total) * 100) };
  }

  advanceToStep(stepId: string): { success: boolean; error?: string } {
    if (!this.session) return { success: false, error: "No active session" };

    const currentIdx = this.session.steps.findIndex(s => s.stepId === this.session!.currentStep);
    const targetIdx = this.session.steps.findIndex(s => s.stepId === stepId);

    if (targetIdx < 0) return { success: false, error: "Step not found" };

    // Validate: cannot skip required steps
    if (targetIdx > currentIdx) {
      for (let i = currentIdx; i < targetIdx; i++) {
        const step = this.session.steps[i];
        if (step.required && step.status !== "complete") {
          return { success: false, error: `Required step "${step.displayName}" must be completed first` };
        }
      }
    }

    // Mark current as complete if moving forward
    if (targetIdx > currentIdx && this.session.steps[currentIdx].status === "active") {
      this.session.steps[currentIdx].status = "complete";
      this.session.steps[currentIdx].completedAt = Date.now();
    }

    // Activate target
    this.session.steps[targetIdx].status = "active";
    this.session.steps[targetIdx].enteredAt = Date.now();
    this.session.currentStep = stepId;
    this.session.updatedAt = Date.now();

    this.saveSession();
    return { success: true };
  }

  completeStep(stepId: string, choices?: Record<string, unknown>): { success: boolean; error?: string } {
    if (!this.session) return { success: false, error: "No active session" };

    const step = this.session.steps.find(s => s.stepId === stepId);
    if (!step) return { success: false, error: "Step not found" };

    step.status = "complete";
    step.completedAt = Date.now();

    // Store choices
    if (choices) {
      for (const [key, value] of Object.entries(choices)) {
        this.setChoice(key, value, "user");
      }
    }

    // Auto-advance to next step
    const currentIdx = this.session.steps.findIndex(s => s.stepId === stepId);
    if (currentIdx < this.session.steps.length - 1) {
      const next = this.session.steps[currentIdx + 1];
      next.status = "active";
      next.enteredAt = Date.now();
      this.session.currentStep = next.stepId;
    }

    this.session.updatedAt = Date.now();
    this.saveSession();

    // Check if all required complete
    if (stepId === "finish") {
      this.finalizeSession();
    }

    return { success: true };
  }

  skipStep(stepId: string): { success: boolean; error?: string } {
    if (!this.session) return { success: false, error: "No active session" };

    const step = this.session.steps.find(s => s.stepId === stepId);
    if (!step) return { success: false, error: "Step not found" };
    if (step.required) return { success: false, error: "Required steps cannot be skipped" };

    step.status = "skipped";
    step.completedAt = Date.now();

    // Auto-advance
    const currentIdx = this.session.steps.findIndex(s => s.stepId === stepId);
    if (currentIdx < this.session.steps.length - 1) {
      const next = this.session.steps[currentIdx + 1];
      next.status = "active";
      next.enteredAt = Date.now();
      this.session.currentStep = next.stepId;
    }

    this.session.updatedAt = Date.now();
    this.saveSession();
    return { success: true };
  }

  // ── Choices ───────────────────────────────────────────────

  setChoice(key: string, value: unknown, source: OnboardingChoice["source"] = "user"): void {
    if (!this.session) return;
    const existing = this.session.choices.findIndex(c => c.key === key);
    const choice: OnboardingChoice = { key, value, source, createdAt: Date.now() };
    if (existing >= 0) {
      this.session.choices[existing] = choice;
    } else {
      this.session.choices.push(choice);
    }
  }

  getChoice(key: string): unknown | undefined {
    return this.session?.choices.find(c => c.key === key)?.value;
  }

  // ── Protection Defaults ───────────────────────────────────

  getProtectionDefaults(): ProtectionDefaults {
    if (!this.protectionDefaults) this.computeProtectionDefaults();
    return this.protectionDefaults!;
  }

  applyProtectionChoices(choices: Partial<ProtectionDefaults>): void {
    const defaults = this.getProtectionDefaults();
    const merged = { ...defaults, ...choices };
    this.protectionDefaults = merged;

    // Store as onboarding choices
    for (const [key, value] of Object.entries(merged)) {
      this.setChoice(`protection.${key}`, value, "user");
    }
  }

  private computeProtectionDefaults(): void {
    try {
      const engine = getContextualDecisionEngine();
      const defaults = engine.evaluateOnboardingDefaults();
      this.protectionDefaults = {
        firewallBaseline: defaults.firewallBaseline,
        vpnOnPublicWifi: defaults.vpnOnPublicWifi,
        threatMonitoring: defaults.threatMonitoring,
        telemetry: defaults.telemetryDefault,
        batterySaverThreshold: defaults.batterySaverThreshold,
        quietModeEnabled: defaults.quietModeRecommended,
        cloudRestoreAllowed: defaults.cloudRestoreAllowed,
      };
    } catch {
      this.protectionDefaults = {
        firewallBaseline: true,
        vpnOnPublicWifi: true,
        threatMonitoring: true,
        telemetry: "opt_in",
        batterySaverThreshold: 15,
        quietModeEnabled: true,
        cloudRestoreAllowed: true,
      };
    }
  }

  // ── Hardware Detection ────────────────────────────────────

  private detectHardware(): HardwareDetection {
    // Registry-routed hardware model classification
    const platform = getDevicePlatform();
    return {
      hardwareModel: platform === "macos" ? "SITA Book Pro" : "SITA Station",
      batteryPresent: "getBattery" in navigator,
      tpmPresent: true, // simulated
      biometricPresent: "credentials" in navigator,
      networkDevices: [
        { type: "wifi", name: "wlan0", available: navigator.onLine },
        { type: "ethernet", name: "eth0", available: true },
      ],
      storageTotal: 512 * 1024 * 1024 * 1024, // 512GB simulated
      memoryTotal: 16 * 1024 * 1024 * 1024, // 16GB simulated
      detectedAt: Date.now(),
    };
  }

  // ── Finalization ──────────────────────────────────────────

  private finalizeSession(): void {
    if (!this.session) return;

    this.session.completedAt = Date.now();
    this.session.updatedAt = Date.now();
    this.saveSession();

    // Apply protection defaults to policyd
    const bundleManager = getPolicyBundleManager();
    if (this.session.deviceMode !== bundleManager.getCurrentMode()) {
      bundleManager.switchMode(this.session.deviceMode);
    }

    // Notify completion
    for (const cb of this.completionCallbacks) {
      try { cb(); } catch { /* ignore */ }
    }
  }

  onComplete(callback: () => void): void {
    this.completionCallbacks.push(callback);
  }

  // ── Persistence ───────────────────────────────────────────

  private saveSession(): void {
    if (!this.session) return;
    try {
      sessionStorage.setItem("sita-onboardingd-session", JSON.stringify(this.session));
    } catch { /* storage may be full */ }
  }

  private loadSavedSession(): OnboardingSession | null {
    try {
      const saved = sessionStorage.getItem("sita-onboardingd-session");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    this.session = null;
    this.protectionDefaults = null;
    try { sessionStorage.removeItem("sita-onboardingd-session"); } catch { /* ignore */ }
  }

  getStats() {
    const progress = this.getProgress();
    return {
      active: !!this.session && !this.session.completedAt,
      complete: !!this.session?.completedAt,
      progress: progress.percent,
      currentStep: this.session?.currentStep || null,
      deviceMode: this.session?.deviceMode || null,
      choicesCount: this.session?.choices.length || 0,
    };
  }
}

// ── Singleton ──────────────────────────────────────────────

let _onboardingd: OnboardingDaemon | null = null;
export function getOnboardingDaemon(): OnboardingDaemon {
  if (!_onboardingd) _onboardingd = new OnboardingDaemon();
  return _onboardingd;
}
