// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Prompt Drift Detection
// Tracks prompt/config/model drift signals per capability.
// Reads from ai_prompt_families table schema for version tracking.
// ═══════════════════════════════════════════════════════════════

export type DriftDimension =
  | "prompt-family-version"
  | "routing-config-change"
  | "model-behavior-shift"
  | "output-profile-drift"
  | "evidence-grade-drift";

export type DetectionMethod = "version-compare" | "output-sampling" | "config-diff";

export interface DriftSignal {
  dimension: DriftDimension;
  detected: boolean;
  detail: string;
}

export interface PromptDriftConfig {
  capabilityId: string;
  lastKnownPromptVersion: string;
  lastKnownModel: string;
  detectionMethod: DetectionMethod;
  operatorAlertRequired: boolean;
  monitoredDimensions: readonly DriftDimension[];
}

export const PROMPT_DRIFT_CONFIGS: readonly PromptDriftConfig[] = [
  { capabilityId: "advisor.money", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change", "evidence-grade-drift"] },
  { capabilityId: "advisor.business", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change"] },
  { capabilityId: "advisor.concierge", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change"] },
  { capabilityId: "advisor.strategy", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change", "model-behavior-shift", "evidence-grade-drift"] },
  { capabilityId: "advisor.security", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change", "model-behavior-shift"] },
  { capabilityId: "advisor.legal", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change", "evidence-grade-drift"] },
  { capabilityId: "advisor.tax", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change", "evidence-grade-drift"] },
  { capabilityId: "boardroom.synthesis", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change", "model-behavior-shift", "output-profile-drift"] },
  { capabilityId: "boardroom.debate", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change"] },
  { capabilityId: "simulation.monte-carlo", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-pro", detectionMethod: "output-sampling", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "output-profile-drift"] },
  { capabilityId: "brain.personal", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash-lite", detectionMethod: "config-diff", operatorAlertRequired: false, monitoredDimensions: ["prompt-family-version", "routing-config-change"] },
  { capabilityId: "brain.core", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash-lite", detectionMethod: "config-diff", operatorAlertRequired: false, monitoredDimensions: ["prompt-family-version"] },
  { capabilityId: "admin.intelligence", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash", detectionMethod: "version-compare", operatorAlertRequired: true, monitoredDimensions: ["prompt-family-version", "routing-config-change"] },
  { capabilityId: "gateway.general", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash", detectionMethod: "config-diff", operatorAlertRequired: false, monitoredDimensions: ["prompt-family-version", "routing-config-change"] },
  { capabilityId: "files.ai-processing", lastKnownPromptVersion: "v1.0", lastKnownModel: "google/gemini-2.5-flash", detectionMethod: "config-diff", operatorAlertRequired: false, monitoredDimensions: ["prompt-family-version"] },
];

export function detectPromptDrift(
  capabilityId: string,
  currentConfig: { promptVersion?: string; model?: string },
): DriftSignal[] {
  const config = PROMPT_DRIFT_CONFIGS.find((c) => c.capabilityId === capabilityId);
  if (!config) return [];

  const signals: DriftSignal[] = [];

  if (currentConfig.promptVersion && currentConfig.promptVersion !== config.lastKnownPromptVersion) {
    signals.push({ dimension: "prompt-family-version", detected: true, detail: `Version changed: ${config.lastKnownPromptVersion} → ${currentConfig.promptVersion}` });
  }
  if (currentConfig.model && currentConfig.model !== config.lastKnownModel) {
    signals.push({ dimension: "routing-config-change", detected: true, detail: `Model changed: ${config.lastKnownModel} → ${currentConfig.model}` });
  }

  return signals;
}

export function getDriftConfig(capabilityId: string): PromptDriftConfig | undefined {
  return PROMPT_DRIFT_CONFIGS.find((c) => c.capabilityId === capabilityId);
}