// ═══════════════════════════════════════════════════════════════
// Nova SDK — Design Enforcement Layer
// Runtime checks to ensure apps comply with OS design rules
// ═══════════════════════════════════════════════════════════════

import { SPACE, TYPE } from "@/lib/design-system/app-window-system";
import { auditColor, auditMotion, auditShadow, auditComponent } from "./design-contract";

export interface DesignViolation {
  element: string;
  rule: string;
  severity: "warning" | "error";
  suggestion: string;
}

const VALID_SPACINGS = Object.values(SPACE);
const VALID_FONT_SIZES = Object.values(TYPE).map(t => t.size);
const VALID_RADII = [8, 12, 16, 20, 24];

export function auditSpacing(value: number): DesignViolation | null {
  if (!VALID_SPACINGS.includes(value as any)) {
    return {
      element: "spacing",
      rule: "spacing-system",
      severity: "warning",
      suggestion: `Use SPACE constants: ${VALID_SPACINGS.join(", ")}px. Got ${value}px.`,
    };
  }
  return null;
}

export function auditFontSize(value: number): DesignViolation | null {
  if (!(VALID_FONT_SIZES as readonly number[]).includes(value)) {
    return {
      element: "typography",
      rule: "type-scale",
      severity: "warning",
      suggestion: `Use TYPE scale: ${VALID_FONT_SIZES.join(", ")}px. Got ${value}px.`,
    };
  }
  return null;
}

export function auditBorderRadius(value: number): DesignViolation | null {
  if (!VALID_RADII.includes(value)) {
    return {
      element: "border-radius",
      rule: "corner-radius",
      severity: "warning",
      suggestion: `Use system radii: ${VALID_RADII.join(", ")}px. Got ${value}px.`,
    };
  }
  return null;
}

export class NovaEnforcement {
  private violations: DesignViolation[] = [];
  private devMode: boolean;

  constructor(devMode = false) {
    this.devMode = devMode;
  }

  check(checks: Array<DesignViolation | null>): DesignViolation[] {
    const found = checks.filter(Boolean) as DesignViolation[];
    this.violations.push(...found);
    if (this.devMode && found.length > 0) {
      console.warn("[NovaSDK Design Audit]", found);
    }
    return found;
  }

  getViolations(): DesignViolation[] {
    return [...this.violations];
  }

  clear(): void {
    this.violations = [];
  }

  static audit(spacing?: number[], fontSizes?: number[], radii?: number[]): DesignViolation[] {
    const violations: DesignViolation[] = [];
    spacing?.forEach(s => { const v = auditSpacing(s); if (v) violations.push(v); });
    fontSizes?.forEach(f => { const v = auditFontSize(f); if (v) violations.push(v); });
    radii?.forEach(r => { const v = auditBorderRadius(r); if (v) violations.push(v); });
    return violations;
  }

  /** Full audit including color, motion, shadow, and component checks */
  static fullAudit(options: {
    spacing?: number[];
    fontSizes?: number[];
    radii?: number[];
    colors?: string[];
    motionConfigs?: Array<{ duration?: number; stiffness?: number; damping?: number }>;
    shadows?: string[];
    components?: Array<{ type: string; classes: string }>;
  }): DesignViolation[] {
    const violations = NovaEnforcement.audit(options.spacing, options.fontSizes, options.radii);
    options.colors?.forEach(c => { const v = auditColor(c); if (v) violations.push(v); });
    options.motionConfigs?.forEach(m => { const v = auditMotion(m); if (v) violations.push(v); });
    options.shadows?.forEach(s => { const v = auditShadow(s); if (v) violations.push(v); });
    options.components?.forEach(c => { const v = auditComponent(c.type as any, c.classes); if (v) violations.push(v); });
    return violations;
  }
}
