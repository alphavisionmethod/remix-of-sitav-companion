#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Event-Receipt Linkage Validator
// Validates every event type has a corresponding receipt type
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, scanDir, readFileContent, extractExports } from "./lib/utils";

const vc = new ViolationCollector();

// Discover event types and receipt types from contracts
const contractFiles = scanDir("src/packages", [".ts"]);
const eventTypes = new Set<string>();
const receiptTypes = new Set<string>();

// Exclude domain types that happen to contain "Event" but aren't event-sourcing events
const EVENT_EXCLUSIONS = new Set([
  "TimelineEventType", "EventPlan", "EventReminder", "EventProcessorRequest",
  "EventProcessorResponse", "EventCategory", "EventType", "EventStatus",
  "EventPriority", "EventItem", "EventCost", "EventGuest", "EventVenue",
  "EventRSVP", "EventNotification", "EventTemplate", "EventOccurrence",
  "TimelineEvent", "CalendarEvent", "ScheduledEvent", "EventAttendee",
  "LifecycleEvent", "EventMetadata", "EventContext", "EventHandler",
  "EventListener", "EventEmitter", "EventBusEvent", "SystemEvent",
  "DomainEvent", "ContinuityEvent", "DragEvent",
  "InvisibleLaborEvent", "FounderBottleneckEvent", "LearningEvent",
  "TrustStateEvent", "CrashEvent", "LifecycleGovernanceEvent",
  "ControlPlaneEvent", "BillingEvent", "SitaEvent", "MoatEvent", "TelemetryEvent",
]);

for (const file of contractFiles) {
  if (file.includes(".test.") || file.includes("node_modules")) continue;
  const exports = extractExports(file);
  for (const exp of exports) {
    if (exp.startsWith("__reexport_")) continue;
    if ((exp.endsWith("Event") || exp.endsWith("EVENT")) && !EVENT_EXCLUSIONS.has(exp)) {
      eventTypes.add(exp);
    }
    if (exp.endsWith("Receipt") || exp.endsWith("RECEIPT") || exp.includes("Receipt")) {
      receiptTypes.add(exp);
    }
  }
}

// Check linkage: for each event, expect a corresponding receipt
let linked = 0;
let unlinked = 0;

for (const event of eventTypes) {
  // Derive expected receipt name
  const baseName = event.replace(/Event$/, "").replace(/_EVENT$/, "");
  const expectedReceipt = `${baseName}Receipt`;
  const expectedReceiptUpper = `${baseName}_RECEIPT`;

  if (receiptTypes.has(expectedReceipt) || receiptTypes.has(expectedReceiptUpper)) {
    linked++;
  } else {
    // Check if any receipt references this event
    const hasIndirectLink = [...receiptTypes].some(r =>
      r.toLowerCase().includes(baseName.toLowerCase())
    );
    if (hasIndirectLink) {
      linked++;
    } else {
      vc.add("contracts", "missing-receipt", `Event "${event}" has no corresponding receipt type`, "warning");
      unlinked++;
    }
  }
}

console.log(`  🔗 ${linked} event-receipt pairs linked, ${unlinked} events without receipts`);
console.log(`  📨 ${eventTypes.size} event types, 🧾 ${receiptTypes.size} receipt types`);
vc.report("check-event-receipt-linkage");
vc.exitIfErrors();
