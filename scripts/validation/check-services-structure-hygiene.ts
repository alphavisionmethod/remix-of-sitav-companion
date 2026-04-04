#!/usr/bin/env node
// SITA OS — Service Structure Hygiene Check
import * as fs from "fs";
import * as path from "path";
import { ViolationCollector, discoverServiceDirs } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const services = discoverServiceDirs();
for (const svc of services) {
  const svcPath = path.join("src/lib/services", svc);
  const barrel = path.join(svcPath, "index.ts");
  if (!fs.existsSync(barrel)) {
    vc.add(svcPath, "no-barrel", `Service "${svc}" has no index.ts barrel export`, "warning");
  }
}
console.log(`  📁 ${services.length} service directories checked`);
vc.report("check-services-structure-hygiene");
vc.exitIfErrors();
