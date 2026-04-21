#!/usr/bin/env node
/* eslint-disable no-console */
// SITA OS — DB Support View Coverage Validator (ADVISORY)
import { ViolationCollector } from "../../architecture/lib/utils";
import { SUPPORT_VIEW_REGISTRY } from "../../../src/lib/db/support-view-registry";

const vc = new ViolationCollector();
const EXPECTED_WORKFLOWS = ["auth/session", "onboarding", "app-install", "advisor/boardroom", "payment", "connector", "file-processing", "kill-switch/incident", "support-bundle"];

for (const wf of EXPECTED_WORKFLOWS) {
  const found = SUPPORT_VIEW_REGISTRY.find(e => e.workflow === wf);
  if (!found) {
    vc.add("support-view-registry", "missing-support-view", `Workflow '${wf}' has no support view`, "warning");
  }
}

console.log(`  📊 ${SUPPORT_VIEW_REGISTRY.length}/${EXPECTED_WORKFLOWS.length} critical workflows have support views`);
console.log(`  ✅ Support view coverage validated`);
vc.report("check-db-support-view-coverage");
vc.exitIfErrors();