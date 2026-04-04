#!/usr/bin/env node
// SITA OS — Workflow State Completeness Check
import { ViolationCollector, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const REQUIRED_STATES = ["idle", "active", "success", "failed", "error"];
const workflowFiles = scanDir("src/lib/services", [".ts"]).filter(f => f.includes("workflow") || f.includes("state-machine") || f.includes("orchestrat"));
for (const file of workflowFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileContent(file);
  if (content.includes("State") || content.includes("state")) {
    const missingStates = REQUIRED_STATES.filter(s => !content.toLowerCase().includes(`"${s}"`) && !content.toLowerCase().includes(`'${s}'`));
    if (missingStates.length > 0 && missingStates.length < REQUIRED_STATES.length) {
      vc.add(file, "incomplete-states", `Missing states: ${missingStates.join(", ")}`, "warning");
    }
  }
}
console.log(`  🔄 ${workflowFiles.length} workflow files checked`);
vc.report("check-workflow-states");
vc.exitIfErrors();
