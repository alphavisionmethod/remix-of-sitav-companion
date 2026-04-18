// ═══════════════════════════════════════════════════════════════
// Nova SDK — Design Contract
// Enforces that apps comply with the OS design system
// ═══════════════════════════════════════════════════════════════

import type { AppManifest } from "./manifest";
import type { DesignViolation } from "./enforcement";

// Supported design versions — apps must declare one
const SUPPORTED_DESIGN_VERSIONS = ["nova-1.0"] as const;
export type DesignVersion = (typeof SUPPORTED_DESIGN_VERSIONS)[number];

// ── Allowed Color Tokens ─────────────────────────────────────
// Only HSL values from the design system are permitted

const ALLOWED_HSL_HUES = new Set([
  0, 15, 30, 35, 38, 45,           // warm: red, orange, gold
  130, 150, 152, 180, 200,         // cool: green, teal
  210, 235, 240, 250, 260, 265,    // blue, indigo, purple
  280, 320, 330, 350,              // purple, pink
]);

export function auditColor(value: string): DesignViolation | null {
  // Flag hardcoded hex colors
  if (/^#[0-9a-fA-F]{3,8}$/.test(value.trim())) {
    return {
      element: "color",
      rule: "no-hardcoded-hex",
      severity: "error",
      suggestion: `Use HSL design tokens instead of hardcoded hex "${value}". Use hsl(H S% L%) format.`,
    };
  }
  // Flag rgb/rgba
  if (/^rgba?\(/.test(value.trim())) {
    return {
      element: "color",
      rule: "no-rgb-colors",
      severity: "error",
      suggestion: `Use HSL design tokens instead of RGB "${value}". Use hsl(H S% L%) format.`,
    };
  }
  return null;
}

// ── Motion Enforcement ───────────────────────────────────────

const ALLOWED_DURATIONS = [0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5];
const ALLOWED_STIFFNESS_RANGE = [100, 400];
const ALLOWED_DAMPING_RANGE = [10, 30];

export interface MotionConfig {
  duration?: number;
  stiffness?: number;
  damping?: number;
}

export function auditMotion(config: MotionConfig): DesignViolation | null {
  if (config.duration !== undefined) {
    if (!ALLOWED_DURATIONS.includes(config.duration) && config.duration > 0.5) {
      return {
        element: "motion",
        rule: "duration-limit",
        severity: "warning",
        suggestion: `Animation duration ${config.duration}s exceeds max 0.5s. Use NOVA_MOTION tokens: ${ALLOWED_DURATIONS.join(", ")}s.`,
      };
    }
  }
  if (config.stiffness !== undefined) {
    if (config.stiffness < ALLOWED_STIFFNESS_RANGE[0] || config.stiffness > ALLOWED_STIFFNESS_RANGE[1]) {
      return {
        element: "motion",
        rule: "spring-stiffness",
        severity: "warning",
        suggestion: `Spring stiffness ${config.stiffness} outside allowed range [${ALLOWED_STIFFNESS_RANGE.join("-")}]. Use NOVA_MOTION.spring presets.`,
      };
    }
  }
  if (config.damping !== undefined) {
    if (config.damping < ALLOWED_DAMPING_RANGE[0] || config.damping > ALLOWED_DAMPING_RANGE[1]) {
      return {
        element: "motion",
        rule: "spring-damping",
        severity: "warning",
        suggestion: `Spring damping ${config.damping} outside allowed range [${ALLOWED_DAMPING_RANGE.join("-")}]. Use NOVA_MOTION.spring presets.`,
      };
    }
  }
  return null;
}

// ── Shadow Enforcement ───────────────────────────────────────

const ALLOWED_SHADOW_TOKENS = [
  "shadow-sm", "shadow-md", "shadow-lg", "shadow-xl",
  // App window system shadows
  "focused", "unfocused", "innerGlow",
  // Nova shadows
  "window", "windowFocused", "windowUnfocused", "dock", "menuBar", "widget",
];

export function auditShadow(value: string): DesignViolation | null {
  // Check for inline box-shadow with non-system values
  if (/box-shadow:\s/.test(value) && !ALLOWED_SHADOW_TOKENS.some(t => value.includes(t))) {
    return {
      element: "shadow",
      rule: "use-system-shadows",
      severity: "warning",
      suggestion: `Use APP_SHADOWS or NOVA_SHADOWS tokens instead of custom box-shadow. Allowed: ${ALLOWED_SHADOW_TOKENS.join(", ")}.`,
    };
  }
  return null;
}

// ── Component Base Class Enforcement ─────────────────────────

const REQUIRED_COMPONENT_BASES: Record<string, string[]> = {
  button: ["rounded-lg", "transition-all", "active:scale-[0.98]"],
  input: ["rounded-lg", "border", "focus:outline-none", "focus:ring-2"],
  card: ["rounded-xl", "border"],
  listItem: ["rounded-lg", "transition-colors"],
};

export function auditComponent(type: keyof typeof REQUIRED_COMPONENT_BASES, classes: string): DesignViolation | null {
  const required = REQUIRED_COMPONENT_BASES[type];
  if (!required) return null;

  const missing = required.filter(cls => !classes.includes(cls));
  if (missing.length > 0) {
    return {
      element: `component:${type}`,
      rule: "component-base-classes",
      severity: "warning",
      suggestion: `${type} component is missing required base classes: ${missing.join(", ")}. Use APP_COMPONENTS.${type}.base.`,
    };
  }
  return null;
}

// ── Design Contract Validator ────────────────────────────────

export type DesignEnforcementMode = "permissive" | "strict";

let enforcementMode: DesignEnforcementMode = "permissive";

export function setDesignEnforcementMode(mode: DesignEnforcementMode): void {
  enforcementMode = mode;
  console.log(`[DesignContract] Enforcement mode set to: ${mode}`);
}

export function getDesignEnforcementMode(): DesignEnforcementMode {
  return enforcementMode;
}

export interface DesignComplianceResult {
  compliant: boolean;
  violations: DesignViolation[];
  designVersion: string | undefined;
  mode: DesignEnforcementMode;
}

export function validateDesignCompliance(manifest: AppManifest): DesignComplianceResult {
  const violations: DesignViolation[] = [];

  // Check designVersion is declared
  if (!manifest.designVersion) {
    violations.push({
      element: "manifest",
      rule: "design-version-required",
      severity: enforcementMode === "strict" ? "error" : "warning",
      suggestion: `App must declare designVersion in manifest (e.g. "nova-1.0"). Supported: ${SUPPORTED_DESIGN_VERSIONS.join(", ")}.`,
    });
  } else if (!SUPPORTED_DESIGN_VERSIONS.includes(manifest.designVersion as any)) {
    violations.push({
      element: "manifest",
      rule: "design-version-unsupported",
      severity: "error",
      suggestion: `Design version "${manifest.designVersion}" is not supported. Use: ${SUPPORTED_DESIGN_VERSIONS.join(", ")}.`,
    });
  }

  // Log violations
  if (violations.length > 0) {
    console.warn(`[NovaSDK Design Audit] "${manifest.name}" has ${violations.length} violation(s):`, violations);
  } else {
    console.log(`[NovaSDK Design Audit] ✓ "${manifest.name}" is design-compliant (${manifest.designVersion})`);
  }

  const hasErrors = violations.some(v => v.severity === "error");
  return {
    compliant: !hasErrors,
    violations,
    designVersion: manifest.designVersion,
    mode: enforcementMode,
  };
}
