#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployable Plane Isolation Check
// Validates each plane's dependencies are within allowed bounds
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";

const vc = new ViolationCollector();

const PLANE_RULES: Record<string, { dirs: string[]; forbidden: RegExp[]; ruleName: string }> = {
  shared: {
    dirs: ["src/packages"],
    forbidden: [/from\s+["']@\/lib\/services\//, /from\s+["']@\/lib\/core-services\//, /from\s+["']@\/pages\//],
    ruleName: "shared-plane-isolation",
  },
  product: {
    dirs: ["src/pages"],
    forbidden: [/from\s+["']@\/lib\/core-services\//],
    ruleName: "product-plane-isolation",
  },
};

for (const [plane, rule] of Object.entries(PLANE_RULES)) {
  for (const dir of rule.dirs) {
    const files = scanDir(dir, [".ts", ".tsx"]);
    for (const file of files) {
      const content = readFileContent(file);
      for (const pattern of rule.forbidden) {
        if (pattern.test(content)) {
          vc.add(file, rule.ruleName, `${plane} plane imports forbidden dependency`, "warning");
        }
      }
    }
  }
}

vc.report("check-deployable-plane-isolation");
vc.exitIfErrors();
