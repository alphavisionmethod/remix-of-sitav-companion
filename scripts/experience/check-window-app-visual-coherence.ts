#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { CHROME_SPECS, SHARED_CHROME_DEFAULTS } from "../../src/platform/experience/window-chrome-grammar";

const issues: GateIssue[] = [];

// Check window and panel share corner radius
if (CHROME_SPECS.window.cornerRadius !== CHROME_SPECS.panel.cornerRadius) {
  issues.push({ severity: "warning", area: "corner-radius", message: `Window (${CHROME_SPECS.window.cornerRadius}) and panel (${CHROME_SPECS.panel.cornerRadius}) corner radii differ` });
}

// Verify shared defaults are consistent
if (CHROME_SPECS.window.cornerRadius !== SHARED_CHROME_DEFAULTS.defaultCornerRadius) {
  issues.push({ severity: "error", area: "defaults-mismatch", message: "Window corner radius doesn't match shared default" });
}
if (CHROME_SPECS.window.titleBarHeight !== SHARED_CHROME_DEFAULTS.defaultTitleBarHeight) {
  issues.push({ severity: "error", area: "defaults-mismatch", message: "Window title bar height doesn't match shared default" });
}

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "window-app-visual-coherence", ok: errorCount === 0, issues, extra: { surfaceCount: Object.keys(CHROME_SPECS).length } });
console.log(`Window-app visual coherence: ${Object.keys(CHROME_SPECS).length} chrome surfaces → ${file}`);