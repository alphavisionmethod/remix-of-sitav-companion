#!/usr/bin/env node
// SITA OS — Supportability Requirements Check
import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, discoverServiceDirs, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const services = discoverServiceDirs();
let withDiagnostics = 0;
for (const svc of services) {
  const svcPath = path.join("src/lib/services", svc);
  const files = scanDir(svcPath, [".ts"]);
  const hasDiagnostic = files.some(f => f.includes("diagnostic") || f.includes("health") || f.includes("status"));
  const hasLogging = files.some(f => {
    const content = readFileContent(f);
    return content.includes("console.error") || content.includes("logger") || content.includes("telemetry");
  });
  if (hasDiagnostic || hasLogging) withDiagnostics++;
  else vc.add(svcPath, "no-diagnostics", `Service "${svc}" has no diagnostic/health support`, "warning");
}
console.log(`  🔧 ${withDiagnostics}/${services.length} services have diagnostic support`);
vc.report("check-supportability-requirements");
vc.exitIfErrors();
