#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Startup Order Generator
// Defines initialization order for core services
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const startupOrder = [
  { phase: 1, name: "event-bus", description: "Core event system" },
  { phase: 1, name: "memory-service", description: "User memory and context" },
  { phase: 2, name: "policy-engine", description: "Policy evaluation" },
  { phase: 2, name: "trust-state-service", description: "Trust state management" },
  { phase: 3, name: "receipt-service", description: "Proof and receipt generation" },
  { phase: 3, name: "workflow-engine", description: "Workflow orchestration" },
  { phase: 3, name: "executor-service", description: "Action execution" },
  { phase: 4, name: "search-fabric", description: "Cross-domain search" },
  { phase: 4, name: "fraud-sentinel", description: "Fraud detection" },
  { phase: 4, name: "projection-service", description: "Financial projections" },
  { phase: 5, name: "connector-control", description: "External integrations" },
  { phase: 5, name: "file-ingestion", description: "Document processing" },
  { phase: 6, name: "brain-core", description: "AI orchestration" },
];

const out = { version: "1.0.0", generatedAt: new Date().toISOString(), phases: 6, services: startupOrder };
fs.writeFileSync("generated/startup-order.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated startup order: ${startupOrder.length} services in 6 phases`);
