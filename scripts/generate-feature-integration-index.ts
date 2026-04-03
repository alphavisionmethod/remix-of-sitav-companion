#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Feature Integration Index Generator
// Maps features to their required services and capabilities
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const features = [
  { feature: "daily-pulse", domains: ["business", "finance", "concierge"], services: ["brain-core", "cross-domain"], pages: ["/"] },
  { feature: "lead-management", domains: ["business"], services: ["lead-scoring", "communication"], pages: ["/business/leads"] },
  { feature: "invoice-collections", domains: ["business", "finance"], services: ["revenue-autopilot", "payment-execution"], pages: ["/business/invoices", "/business/collections"] },
  { feature: "bill-management", domains: ["finance"], services: ["reserve-engine", "bill-calendar"], pages: ["/money/bills"] },
  { feature: "subscription-waste", domains: ["finance"], services: ["subscription-waste"], pages: ["/money/subscriptions"] },
  { feature: "household-ops", domains: ["concierge"], services: ["household-ops", "task-prioritization"], pages: ["/concierge/tasks"] },
  { feature: "travel-planning", domains: ["concierge"], services: ["travel-continuity"], pages: ["/concierge/travel"] },
  { feature: "advisor-council", domains: ["all"], services: ["brain-core", "advisor-protocol"], pages: ["/advisors"] },
  { feature: "boardroom", domains: ["all"], services: ["boardroom-packets", "governance-simulator"], pages: ["/boardroom"] },
  { feature: "proof-center", domains: ["all"], services: ["receipt-service", "verification-engine"], pages: ["/proof"] },
  { feature: "file-ingestion", domains: ["all"], services: ["file-ingestion", "search-fabric"], pages: ["/files"] },
  { feature: "mission-control", domains: ["system"], services: ["fraud-sentinel", "trust-state"], pages: ["/owner"] },
];

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), total: features.length, features };
fs.writeFileSync("generated/feature-integration-index.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated feature integration index: ${features.length} features`);
