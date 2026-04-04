#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Workflow State Usage Validator
// Validates workflow state machine usage across services
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "./lib/utils";

const vc = new ViolationCollector();

const VALID_WORKFLOW_STATES = [
  "idle", "preparing", "active", "validating", "syncing",
  "success", "warning", "degraded", "blocked", "skipped",
  "resumed", "completed", "failed", "error", "cancelled",
  "pending", "processing", "awaiting_approval", "approved", "rejected",
];

// Find workflow state references in services
const serviceFiles = scanDir("src/lib/services", [".ts"]);
const engineFiles = scanDir("src/lib/engines", [".ts"]);
const allFiles = [...serviceFiles, ...engineFiles];

const stateUsages: Record<string, Set<string>> = {};
const unknownStates = new Set<string>();

for (const file of allFiles) {
  if (file.includes(".test.") || file.includes(".spec.")) continue;
  const content = readFileContent(file);

  // Match state string literals in state machine patterns
  const statePatterns = [
    /state:\s*["'](\w+)["']/g,
    /status:\s*["'](\w+)["']/g,
    /WorkflowState\.(\w+)/g,
    /SetupPhaseState\.(\w+)/g,
    /phase_state:\s*["'](\w+)["']/g,
  ];

  for (const pattern of statePatterns) {
    let match;
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      const state = match[1].toLowerCase();
      if (!stateUsages[state]) stateUsages[state] = new Set();
      stateUsages[state].add(file);

      if (!VALID_WORKFLOW_STATES.includes(state) && state.length > 2) {
        unknownStates.add(state);
      }
    }
  }
}

if (unknownStates.size > 0) {
  for (const state of unknownStates) {
    const files = stateUsages[state];
    if (files && files.size > 0) {
      vc.add([...files][0], "unknown-state", `Non-standard workflow state "${state}" used`, "warning");
    }
  }
}

console.log(`  🔄 ${Object.keys(stateUsages).length} distinct workflow states found across ${allFiles.length} files`);
console.log(`  ✅ ${VALID_WORKFLOW_STATES.filter(s => stateUsages[s]).length}/${VALID_WORKFLOW_STATES.length} canonical states in use`);

vc.report("check-workflow-state-usage");
vc.exitIfErrors();
