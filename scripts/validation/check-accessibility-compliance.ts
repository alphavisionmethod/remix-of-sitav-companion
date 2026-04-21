#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Accessibility Compliance Validator (BLOCK gate)
// Scans UI primitives and shell surfaces for real ARIA compliance.
// ═══════════════════════════════════════════════════════════════
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

// ── ARIA patterns to detect ─────────────────────────────────
const ARIA_PATTERNS = [
  /role\s*=\s*["']/,
  /aria-label\s*=\s*["'{]/,
  /aria-labelledby\s*=\s*["'{]/,
  /aria-describedby\s*=\s*["'{]/,
  /aria-live\s*=\s*["']/,
  /aria-hidden\s*=\s*["'{]/,
  /aria-invalid\s*=\s*["'{]/,
  /aria-expanded\s*=\s*["'{]/,
  /aria-controls\s*=\s*["'{]/,
  /aria-valuenow\s*=\s*[{"'0-9]/,
  /aria-valuemin\s*=\s*[{"'0-9]/,
  /aria-valuemax\s*=\s*[{"'0-9]/,
  /aria-checked\s*=\s*["'{]/,
  /aria-orientation\s*=\s*["'{]/,
  /sr-only/,
  /tabIndex\s*=\s*[{"'-]/,
  /role="progressbar"/,
  /role="alert"/,
  /role="status"/,
  /role="tooltip"/,
  /role="presentation"/,
  /role="dialog"/,
  /role="navigation"/,
  /role="main"/,
  /role="complementary"/,
];

// Components classified by type
const INTERACTIVE_COMPONENTS = [
  "button.tsx", "input.tsx", "textarea.tsx", "select.tsx", "switch.tsx",
  "slider.tsx", "checkbox.tsx", "radio-group.tsx", "toggle.tsx", "toggle-group.tsx",
  "command.tsx", "menubar.tsx", "dropdown-menu.tsx", "context-menu.tsx",
  "navigation-menu.tsx", "pagination.tsx",
];

const DECORATIVE_COMPONENTS = [
  "skeleton.tsx", "separator.tsx", "aspect-ratio.tsx",
];

const OVERLAY_COMPONENTS = [
  "dialog.tsx", "alert-dialog.tsx", "sheet.tsx", "drawer.tsx",
  "popover.tsx", "tooltip.tsx", "hover-card.tsx",
];

const FEEDBACK_COMPONENTS = [
  "toast.tsx", "alert.tsx", "progress.tsx", "badge.tsx", "sonner.tsx",
];

interface ComponentReport {
  file: string;
  category: "interactive" | "decorative" | "overlay" | "feedback" | "structural";
  ariaAttributesFound: string[];
  ariaCount: number;
  compliant: boolean;
}

function scanDir(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(".tsx"));
}

function categorize(filename: string): ComponentReport["category"] {
  if (INTERACTIVE_COMPONENTS.includes(filename)) return "interactive";
  if (DECORATIVE_COMPONENTS.includes(filename)) return "decorative";
  if (OVERLAY_COMPONENTS.includes(filename)) return "overlay";
  if (FEEDBACK_COMPONENTS.includes(filename)) return "feedback";
  return "structural";
}

function scanFile(dir: string, filename: string): ComponentReport {
  const filepath = join(dir, filename);
  const content = readFileSync(filepath, "utf-8");
  const category = categorize(filename);

  const found: string[] = [];
  for (const pattern of ARIA_PATTERNS) {
    if (pattern.test(content)) {
      found.push(pattern.source.replace(/\\s\*=\\s\*.*/, "").replace(/\\/g, ""));
    }
  }

  // Compliance rules by category
  let compliant = false;
  switch (category) {
    case "interactive":
      // Must have at least one aria attribute or role
      compliant = found.length >= 1;
      break;
    case "decorative":
      // Must have aria-hidden or role=presentation
      compliant = found.some(f => f.includes("aria-hidden") || f.includes("presentation"));
      break;
    case "overlay":
      // Must have role or aria-label or focus-trap evidence (sr-only)
      compliant = found.length >= 1;
      break;
    case "feedback":
      // Must have role=alert/status or aria-live
      compliant = found.some(f => f.includes("role") || f.includes("aria-live"));
      break;
    case "structural":
      // Advisory — always passes
      compliant = true;
      break;
  }

  return { file: filename, category, ariaAttributesFound: found, ariaCount: found.length, compliant };
}

// ── Main scan ────────────────────────────────────────────────
const uiDir = "src/components/ui";
const uiFiles = scanDir(uiDir);
const reports = uiFiles.map(f => scanFile(uiDir, f));

const issues: GateIssue[] = [];
const nonCompliant = reports.filter(r => !r.compliant);

for (const r of nonCompliant) {
  issues.push({
    severity: "error",
    area: `ui/${r.file}`,
    message: `${r.category} component lacks required ARIA attributes (found ${r.ariaCount})`,
  });
}

// Components with zero ARIA at all get warnings
const zeroAria = reports.filter(r => r.ariaCount === 0 && r.compliant);
for (const r of zeroAria) {
  issues.push({
    severity: "warning",
    area: `ui/${r.file}`,
    message: `No explicit ARIA attributes detected (may rely on Radix defaults)`,
  });
}

const totalScanned = reports.length;
const totalCompliant = reports.filter(r => r.compliant).length;
const compliancePct = totalScanned > 0 ? Math.round((totalCompliant / totalScanned) * 100) : 0;

const file = emitGateReport({
  gate: "accessibility-compliance",
  ok: nonCompliant.length === 0,
  issues,
  extra: {
    totalComponents: totalScanned,
    compliantComponents: totalCompliant,
    nonCompliantComponents: nonCompliant.length,
    compliancePct,
    componentReports: reports,
  },
});

console.log(`Accessibility compliance: ${totalCompliant}/${totalScanned} compliant (${compliancePct}%) → ${file}`);
if (nonCompliant.length > 0) {
  console.error(`  ❌ ${nonCompliant.length} components failed compliance:`);
  for (const r of nonCompliant) {
    console.error(`     - ${r.file} (${r.category}): ${r.ariaCount} ARIA attrs found`);
  }
  process.exit(1);
}