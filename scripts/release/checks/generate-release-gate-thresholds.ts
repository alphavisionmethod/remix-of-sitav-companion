#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Release Gate Thresholds Generator
// Quality gate configs for release rings
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const releaseRings = [
  {
    ring: "canary",
    description: "Internal testing, 1% traffic",
    trafficPercentage: 1,
    gates: {
      maxErrorRate: 0.05,
      maxLatencyP99Ms: 2000,
      minUptimePercent: 95,
      requiredTestsPassing: true,
      requiresManualApproval: false,
      rollbackTrigger: { errorRateThreshold: 0.10, latencyP99Threshold: 5000 },
      minimumBakeTimeMinutes: 30,
    },
  },
  {
    ring: "pilot",
    description: "Early adopters, 10% traffic",
    trafficPercentage: 10,
    gates: {
      maxErrorRate: 0.02,
      maxLatencyP99Ms: 1500,
      minUptimePercent: 99,
      requiredTestsPassing: true,
      requiresManualApproval: true,
      rollbackTrigger: { errorRateThreshold: 0.05, latencyP99Threshold: 3000 },
      minimumBakeTimeMinutes: 120,
    },
  },
  {
    ring: "ga",
    description: "General availability, 100% traffic",
    trafficPercentage: 100,
    gates: {
      maxErrorRate: 0.01,
      maxLatencyP99Ms: 1000,
      minUptimePercent: 99.9,
      requiredTestsPassing: true,
      requiresManualApproval: true,
      rollbackTrigger: { errorRateThreshold: 0.02, latencyP99Threshold: 2000 },
      minimumBakeTimeMinutes: 1440,
    },
  },
];

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalRings: releaseRings.length,
  rings: releaseRings,
};

fs.writeFileSync("generated/release-gate-thresholds.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated release gate thresholds: ${releaseRings.length} rings`);
