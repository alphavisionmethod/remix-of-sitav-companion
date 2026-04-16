#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Launch Tier Index Generator
// Maps services to launch tiers (MVP/pilot/GA) using real logic
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const svcManifest = JSON.parse(fs.readFileSync("generated/service-manifest.json", "utf-8"));
const services: { id: string; name: string; domain: string; status: string; owner: string; dependencies: string[] }[] = svcManifest.services || [];

// MVP: core platform spine — auth, brain, events, policy, execution, identity
const MVP_DOMAINS = new Set(["brain-core", "api-gateway", "event-bus", "identity", "auth", "executor-service", "receipt-service", "policy-engine", "approval-engine", "role-permission-engine", "security", "database"]);
const MVP_NAMES = new Set(["brain-core", "api-gateway", "event-bus", "identity", "identity-auth", "executor-service", "receipt-service", "policy-engine", "approval-engine", "role-permission-engine", "security", "database", "auth", "keyvault", "setup", "onboarding"]);

// Pilot: domain OS surfaces — business, finance, concierge
const PILOT_DOMAINS = new Set(["business-os", "finance-os", "concierge-os", "boardroom-service", "connector-control-plane", "connector-runners", "entity-graph", "verification-engine", "projections", "memory-service", "capability-router", "notifications"]);
const PILOT_NAMES = new Set(["business-os", "finance-os", "concierge-os", "boardroom-service", "connector-control-plane", "connector-runners", "entity-graph", "verification-engine", "projections", "memory-service", "capability-router", "notifications", "analytics", "booking-scheduling", "profiles"]);

function assignLaunchTier(svc: { name: string; domain: string }): "mvp" | "pilot" | "ga" {
  if (MVP_DOMAINS.has(svc.domain) || MVP_NAMES.has(svc.name)) return "mvp";
  if (PILOT_DOMAINS.has(svc.domain) || PILOT_NAMES.has(svc.name)) return "pilot";
  return "ga";
}

const tierEntries = services.map(svc => ({
  serviceId: svc.id || svc.name,
  serviceName: svc.name,
  owner: svc.owner || svc.domain,
  currentStatus: svc.status || "active",
  launchTier: assignLaunchTier(svc),
  dependencyCount: svc.dependencies?.length || 0,
  readyForTier: (svc.status || "") !== "skeleton",
}));

const tierDistribution = {
  mvp: tierEntries.filter(e => e.launchTier === "mvp").length,
  pilot: tierEntries.filter(e => e.launchTier === "pilot").length,
  ga: tierEntries.filter(e => e.launchTier === "ga").length,
};

const out = {
  version: "1.1.0",
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
