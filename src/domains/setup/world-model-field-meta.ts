// ═══════════════════════════════════════════════════════════════
// SITA OS — World Model Field Metadata
// Per-field data quality tracking for the initial world model
// ═══════════════════════════════════════════════════════════════

export type WorldModelSource =
  | "explicit-input"
  | "device-detection"
  | "locale-default"
  | "connected-account"
  | "imported-system"
  | "inferred"
  | "deferred-placeholder";

export type SensitivityLevel = "low" | "medium" | "high" | "critical";

export interface WorldModelFieldMeta {
  /** Where this value came from */
  source: WorldModelSource;
  /** 0-1 confidence score */
  confidence: number;
  /** Whether the user explicitly confirmed this value */
  confirmed: boolean;
  /** Whether this was inferred vs explicitly provided */
  inferred: boolean;
  /** Sensitivity classification */
  sensitivity: SensitivityLevel;
  /** When this value was captured */
  capturedAt: string;
  /** Whether this value is safe to use immediately without further confirmation */
  safeToUseImmediately: boolean;
  /** Whether the user can edit this later */
  editableLater: boolean;
}

/** Create default field metadata for explicit user input */
export function explicitInputMeta(sensitivity: SensitivityLevel = "low"): WorldModelFieldMeta {
  return {
    source: "explicit-input",
    confidence: 1.0,
    confirmed: true,
    inferred: false,
    sensitivity,
    capturedAt: new Date().toISOString(),
    safeToUseImmediately: true,
    editableLater: true,
  };
}

/** Create metadata for device-detected values */
export function deviceDetectedMeta(): WorldModelFieldMeta {
  return {
    source: "device-detection",
    confidence: 0.95,
    confirmed: false,
    inferred: true,
    sensitivity: "low",
    capturedAt: new Date().toISOString(),
    safeToUseImmediately: true,
    editableLater: true,
  };
}

/** Create metadata for locale-defaulted values */
export function localeDefaultMeta(): WorldModelFieldMeta {
  return {
    source: "locale-default",
    confidence: 0.8,
    confirmed: false,
    inferred: true,
    sensitivity: "low",
    capturedAt: new Date().toISOString(),
    safeToUseImmediately: true,
    editableLater: true,
  };
}

/** Create metadata for inferred values */
export function inferredMeta(confidence = 0.6): WorldModelFieldMeta {
  return {
    source: "inferred",
    confidence,
    confirmed: false,
    inferred: true,
    sensitivity: "low",
    capturedAt: new Date().toISOString(),
    safeToUseImmediately: confidence >= 0.7,
    editableLater: true,
  };
}

/** Create metadata for deferred/placeholder values */
export function deferredMeta(): WorldModelFieldMeta {
  return {
    source: "deferred-placeholder",
    confidence: 0,
    confirmed: false,
    inferred: false,
    sensitivity: "low",
    capturedAt: new Date().toISOString(),
    safeToUseImmediately: false,
    editableLater: true,
  };
}
