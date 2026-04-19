#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from "node:fs";
import { emitGateReport, type GateIssue } from "./_lib/emit-gate-report";

const GATE = "desktop-honest-narrow-width";
const DESKTOP_PAGE = "src/pages/DesktopPage.tsx";
const issues: GateIssue[] = [];

if (!existsSync(DESKTOP_PAGE)) {
  issues.push({
    severity: "error",
    area: "desktop-page-missing",
    message: `Expected ${DESKTOP_PAGE} not found`,
  });
} else {
  const content = readFileSync(DESKTOP_PAGE, "utf-8");
  // Honest disclosure must contain BOTH a "Desktop view" label AND a md:hidden / md:block
  // narrow-width gate so it only renders below the md breakpoint.
  const hasLabel = /Desktop view/i.test(content) || /open on a wider screen/i.test(content);
  const hasNarrowGate =
    /md:hidden/.test(content) ||
    /\bsm:hidden\b/.test(content) ||
    /useIsMobile\(\)/.test(content);
  if (!hasLabel) {
    issues.push({
      severity: "error",
      area: "missing-disclosure-copy",
      message: 'Desktop page missing narrow-width disclosure copy ("Desktop view" / "open on a wider screen")',
    });
  }
  if (!hasNarrowGate) {
    issues.push({
      severity: "error",
      area: "missing-narrow-gate",
      message: "Desktop page disclosure not gated to narrow widths (md:hidden / useIsMobile)",
    });
  }
}

const ok = issues.filter((i) => i.severity === "error").length === 0;
console.log(`${ok ? "✅" : "❌"} ${GATE}: ${issues.length} issue(s)`);
issues.slice(0, 20).forEach((i) => console.error(`   [${i.severity}] ${i.area}: ${i.message}`));
emitGateReport({
  gate: GATE,
  ok,
  issues,
  extra: {
    desktopPage: DESKTOP_PAGE,
    classification: "block-tier-honest-disclosure",
    requiredCopyTokens: ["Desktop view", "open on a wider screen"],
  },
});
process.exit(ok ? 0 : 1);
