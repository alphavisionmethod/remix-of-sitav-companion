#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Tier Index Generator
// Maps services to launch tiers (MVP/pilot/GA)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; status: string; owner: string; dependencies: string[] }[] = svcManifest.services || [];

// Tier assignment based on service criticality and dependencies
function assignLaunchTier(svc: { id: string; status: string; dependencies: string[] }): "mvp" | "pilot" | "ga" {
  const mvpServices = [
    "api-gateway", "brain-core", "event-bus", "policy-engine", "approval-engine",
    "executor-service", "receipt-service", "identity", "role-permission-engine",
  ];
  const pilotServices = [
    "business-os", "finance-os", "concierge-os", "capability-router",
    "verification-engine", "projections", "memory-service", "connector-control-plane",
    "connector-runners", "boardroom", "entity-graph",
  ];

  if (mvpServices.includes(svc.id)) return "mvp";
  if (pilotServices.includes(svc.id)) return "pilot";
  return "ga";
}

const tierEntries = services.map(svc => ({
  serviceId: svc.id,
  serviceName: svc.name,
  owner: svc.owner,
  currentStatus: svc.status,
  launchTier: assignLaunchTier(svc),
  dependencyCount: svc.dependencies?.length || 0,
  readyForTier: svc.status !== "skeleton",
}));

const tierDistribution = {
  mvp: tierEntries.filter(e => e.launchTier === "mvp").length,
  pilot: tierEntries.filter(e => e.launchTier === "pilot").length,
  ga: tierEntries.filter(e => e.launchTier === "ga").length,
};

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalServices: tierEntries.length,
  tierDistribution,
  tiers: [
    { tier: "mvp", description: "Minimum viable product — core platform spine", services: tierEntries.filter(e => e.launchTier === "mvp") },
    { tier: "pilot", description: "Early adopter features — domain OS surfaces", services: tierEntries.filter(e => e.launchTier === "pilot") },
    { tier: "ga", description: "General availability — full platform", services: tierEntries.filter(e => e.launchTier === "ga") },
  ],
};

fs.writeFileSync("generated/launch-tier-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated launch tier index: MVP=${tierDistribution.mvp}, Pilot=${tierDistribution.pilot}, GA=${tierDistribution.ga}`);
