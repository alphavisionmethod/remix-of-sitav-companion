#!/usr/bin/env node
/* eslint-disable no-console */
import { emitGateReport, type GateIssue } from "../validation/_lib/emit-gate-report";
import { OS_APP_EXPERIENCE_CONTRACT, MERGE_RULES, CONTEXT_HANDOFFS } from "../../src/platform/experience/os-app-experience-contract";

const issues: GateIssue[] = [];

if (OS_APP_EXPERIENCE_CONTRACT.shellSurfaces.length < 5) issues.push({ severity: "error", area: "shell-surfaces", message: "Fewer than 5 shell surfaces defined" });
if (OS_APP_EXPERIENCE_CONTRACT.appSurfaces.length < 3) issues.push({ severity: "error", area: "app-surfaces", message: "Fewer than 3 app surfaces defined" });
if (OS_APP_EXPERIENCE_CONTRACT.sharedSurfaces.length < 3) issues.push({ severity: "error", area: "shared-surfaces", message: "Fewer than 3 shared surfaces defined" });
if (MERGE_RULES.length < 4) issues.push({ severity: "error", area: "merge-rules", message: "Fewer than 4 merge rules defined" });
if (CONTEXT_HANDOFFS.length < 3) issues.push({ severity: "error", area: "context-handoffs", message: "Fewer than 3 context handoffs defined" });

const errorCount = issues.filter(i => i.severity === "error").length;
const file = emitGateReport({ gate: "os-app-experience-contract", ok: errorCount === 0, issues });
console.log(`OS-App experience contract: ${OS_APP_EXPERIENCE_CONTRACT.totalSurfaces} surfaces, ${MERGE_RULES.length} rules → ${file}`);