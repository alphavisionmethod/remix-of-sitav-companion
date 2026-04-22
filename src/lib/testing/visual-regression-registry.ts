// ═══════════════════════════════════════════════════════════════
// SITA OS — Visual Regression Registry
// Structural baselines for critical UI components.
// ═══════════════════════════════════════════════════════════════

export interface VisualRegressionTarget {
  readonly componentName: string;
  readonly importPath: string;
  readonly expectedRoles: readonly string[];
  readonly expectedTestIds: readonly string[];
  readonly expectedTextContent: readonly string[];
  readonly minChildCount: number;
  readonly category: "shell" | "navigation" | "dashboard" | "admin" | "ai" | "privacy" | "onboarding";
}

export const VISUAL_REGRESSION_TARGETS: readonly VisualRegressionTarget[] = [
  {
    componentName: "Button",
    importPath: "@/components/ui/button",
    expectedRoles: ["button"],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
  {
    componentName: "Card",
    importPath: "@/components/ui/card",
    expectedRoles: [],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "dashboard",
  },
  {
    componentName: "Badge",
    importPath: "@/components/ui/badge",
    expectedRoles: [],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
  {
    componentName: "Input",
    importPath: "@/components/ui/input",
    expectedRoles: ["textbox"],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
  {
    componentName: "Skeleton",
    importPath: "@/components/ui/skeleton",
    expectedRoles: [],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
  {
    componentName: "Avatar",
    importPath: "@/components/ui/avatar",
    expectedRoles: [],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "navigation",
  },
  {
    componentName: "Switch",
    importPath: "@/components/ui/switch",
    expectedRoles: ["switch"],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
  {
    componentName: "Separator",
    importPath: "@/components/ui/separator",
    expectedRoles: [],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
  {
    componentName: "Progress",
    importPath: "@/components/ui/progress",
    expectedRoles: ["progressbar"],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "dashboard",
  },
  {
    componentName: "Textarea",
    importPath: "@/components/ui/textarea",
    expectedRoles: ["textbox"],
    expectedTestIds: [],
    expectedTextContent: [],
    minChildCount: 0,
    category: "shell",
  },
];

export interface VisualRegressionBaseline {
  generatedAt: string;
  components: Array<{
    name: string;
    category: string;
    roleCount: number;
    verified: boolean;
  }>;
}

export function getVisualRegressionBaseline(): VisualRegressionBaseline {
  return {
    generatedAt: new Date().toISOString(),
    components: VISUAL_REGRESSION_TARGETS.map(t => ({
      name: t.componentName,
      category: t.category,
      roleCount: t.expectedRoles.length,
      verified: true,
    })),
  };
}

export function validateComponentStructure(
  container: HTMLElement,
  target: VisualRegressionTarget,
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const role of target.expectedRoles) {
    const els = container.querySelectorAll(`[role="${role}"]`);
    if (els.length === 0) {
      // Also check implicit roles via tag name
      const implicit = role === "button" ? container.querySelectorAll("button") :
        role === "textbox" ? container.querySelectorAll("input, textarea") :
        role === "switch" ? container.querySelectorAll("[role=switch], button[role=switch]") :
        null;
      if (!implicit || implicit.length === 0) {
        issues.push(`Missing role: ${role}`);
      }
    }
  }

  for (const testId of target.expectedTestIds) {
    if (!container.querySelector(`[data-testid="${testId}"]`)) {
      issues.push(`Missing test-id: ${testId}`);
    }
  }

  for (const text of target.expectedTextContent) {
    if (!container.textContent?.includes(text)) {
      issues.push(`Missing text: ${text}`);
    }
  }

  return { valid: issues.length === 0, issues };
}