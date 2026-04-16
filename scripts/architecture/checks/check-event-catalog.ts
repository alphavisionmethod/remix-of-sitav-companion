#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Event Catalog Validator
// Validates event-types barrel matches event references in code
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, scanDir, readFileContent, extractExports } from "./lib/utils";

const vc = new ViolationCollector();

// Find event-types barrel
const eventBarrelPaths = [
  "src/packages/contracts/event-types.ts",
  "src/packages/contracts/event-types/index.ts",
  "src/packages/event-types/index.ts",
];

let eventBarrel: string | null = null;
for (const p of eventBarrelPaths) {
  if (fs.existsSync(p)) { eventBarrel = p; break; }
}

if (!eventBarrel) {
  console.log("⚠️ No event-types barrel found — skipping event catalog check");
  process.exit(0);
}

const eventExports = extractExports(eventBarrel);
const eventTypeNames = new Set(eventExports.filter(e =>
  e.includes("Event") || e.includes("EVENT") || e.endsWith("_EVENT") || e.endsWith("Event")
));

// Scan services for event type usage
const serviceFiles = scanDir("src/lib/services", [".ts"]);
const usedEventTypes = new Set<string>();

for (const file of serviceFiles) {
  const content = readFileContent(file);
  for (const eventType of eventTypeNames) {
    if (content.includes(eventType)) {
      usedEventTypes.add(eventType);
    }
  }
}

const unusedEvents = [...eventTypeNames].filter(e => !usedEventTypes.has(e));
if (unusedEvents.length > 0) {
  for (const unused of unusedEvents) {
    vc.add(eventBarrel, "unused-event-type", `Event type "${unused}" is exported but never consumed`, "warning");
  }
}

console.log(`  📨 ${eventTypeNames.size} event types exported, ${usedEventTypes.size} consumed in services`);
vc.report("check-event-catalog");
vc.exitIfErrors();
