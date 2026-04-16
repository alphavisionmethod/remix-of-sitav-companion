#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Module Count Budget Enforcer
// Enforces max service/module count budget per domain
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, discoverServiceDirs, classifyServiceDomain, loadServiceManifest } from "./lib/utils";

const vc = new ViolationCollector();

// Budget: max services per domain
const BUDGET: Record<string, number> = {
  "business-os": 25,
  "finance-os": 20,
  "concierge-os": 20,
  "platform": 150,
};

const TOTAL_BUDGET = 200;

const serviceDirs = discoverServiceDirs();
const manifest = loadServiceManifest();
const services = manifest?.services || serviceDirs.map((s: string) => ({ id: s }));

// Count by domain
const domainCounts: Record<string, string[]> = {
  "business-os": [],
  "finance-os": [],
  "concierge-os": [],
  "platform": [],
};

for (const svc of services) {
  const id = svc.id || svc.name || svc;
  const domain = classifyServiceDomain(typeof id === "string" ? id : "");
  if (!domainCounts[domain]) domainCounts[domain] = [];
  domainCounts[domain].push(typeof id === "string" ? id : String(id));
}

// Check budgets
let totalServices = 0;
for (const [domain, svcList] of Object.entries(domainCounts)) {
  totalServices += svcList.length;
  const budget = BUDGET[domain] || 30;
  console.log(`  📦 ${domain}: ${svcList.length}/${budget} services`);

  if (svcList.length > budget) {
    vc.add("service-manifest", "budget-exceeded", `${domain} has ${svcList.length} services (budget: ${budget})`);
  } else if (svcList.length > budget * 0.8) {
    vc.add("service-manifest", "budget-warning", `${domain} at ${Math.round(svcList.length/budget*100)}% capacity`, "warning");
  }
}

console.log(`  📊 Total: ${totalServices}/${TOTAL_BUDGET} services`);
if (totalServices > TOTAL_BUDGET) {
  vc.add("service-manifest", "total-budget-exceeded", `Total ${totalServices} services exceeds budget of ${TOTAL_BUDGET}`);
}

vc.report("check-module-count");
vc.exitIfErrors();
