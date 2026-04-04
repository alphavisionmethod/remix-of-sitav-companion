#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Subscription Replacement Matrix Generator
// Maps event type names to canonical/deprecated status
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";

const eventSource = fs.readFileSync("src/packages/event-types/index.ts", "utf-8");

// Extract all event type strings
const eventTypeMatches = [...eventSource.matchAll(/type:\s*"([^"]+)"/g)].map(m => m[1]);

// Group events by domain prefix
const eventsByDomain: Record<string, string[]> = {};
for (const et of eventTypeMatches) {
  const domain = et.split(".")[0];
  if (!eventsByDomain[domain]) eventsByDomain[domain] = [];
  eventsByDomain[domain].push(et);
}

// Build replacement matrix — all current events are canonical
const matrix = eventTypeMatches.map(eventType => {
  const domain = eventType.split(".")[0];
  const action = eventType.split(".").slice(1).join(".");
  return {
    eventType,
    domain,
    action,
    status: "canonical" as const,
    replacedBy: null as string | null,
    deprecatedAt: null as string | null,
    migrationNotes: null as string | null,
  };
});

// Add known deprecated patterns that may exist in old consumers
const deprecated = [
  { eventType: "customer.updated", replacedBy: "customer.health-changed", deprecatedAt: "2026-03-01", migrationNotes: "Use health-changed for state transitions" },
  { eventType: "payment.initiated", replacedBy: "payment.executed", deprecatedAt: "2026-03-01", migrationNotes: "Renamed for clarity" },
  { eventType: "task.assigned", replacedBy: "task.created", deprecatedAt: "2026-02-15", migrationNotes: "Assignment now part of creation payload" },
];

for (const dep of deprecated) {
  matrix.push({ eventType: dep.eventType, domain: dep.eventType.split(".")[0], action: dep.eventType.split(".").slice(1).join("."), status: "deprecated", replacedBy: dep.replacedBy, deprecatedAt: dep.deprecatedAt, migrationNotes: dep.migrationNotes });
}

const out = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalEvents: matrix.length,
  canonical: matrix.filter(m => m.status === "canonical").length,
  deprecated: matrix.filter(m => m.status === "deprecated").length,
  byDomain: eventsByDomain,
  matrix,
};

fs.writeFileSync("generated/subscription-replacement-matrix.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated subscription replacement matrix: ${matrix.length} events (${deprecated.length} deprecated)`);
