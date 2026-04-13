// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Signal Emitter
// Publishes structured domain signals to the event bus
// ═══════════════════════════════════════════════════════════════

import { getEventBus } from "@/lib/core-services/event-bus";
import type { DomainSignal, TransmissionLogEntry } from "./types";

const transmissionLog: TransmissionLogEntry[] = [];
const batchBuffer: DomainSignal[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
const BATCH_INTERVAL_MS = 60_000;
const MAX_LOG_SIZE = 500;

function logTransmission(entry: Omit<TransmissionLogEntry, "id">) {
  const full: TransmissionLogEntry = { ...entry, id: crypto.randomUUID() };
  transmissionLog.push(full);
  if (transmissionLog.length > MAX_LOG_SIZE) transmissionLog.splice(0, transmissionLog.length - MAX_LOG_SIZE);
}

export function getTransmissionLog(): TransmissionLogEntry[] {
  return [...transmissionLog];
}

async function publishSignal(signal: DomainSignal) {
  const bus = getEventBus();
  const topic = `domain.signal.${signal.module}`;

  try {
    await bus.publish(topic, signal as unknown as Record<string, unknown>, {
      source: `signal-emitter:${signal.module}`,
      domain: signal.domain,
      correlationId: signal.signal_id,
      skipPersist: false,
    });

    logTransmission({
      source_layer: "A:domain-data",
      destination_layer: "B:module-signal",
      packet_type: "DomainSignal",
      packet_id: signal.signal_id,
      timestamp: Date.now(),
      confidence: signal.confidence,
      freshness: signal.freshness,
      missing_data_flags: [],
      status: "delivered",
    });
  } catch (err) {
    logTransmission({
      source_layer: "A:domain-data",
      destination_layer: "B:module-signal",
      packet_type: "DomainSignal",
      packet_id: signal.signal_id,
      timestamp: Date.now(),
      confidence: signal.confidence,
      freshness: signal.freshness,
      missing_data_flags: [],
      status: "failed",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function flushBatch() {
  const signals = batchBuffer.splice(0);
  for (const sig of signals) {
    publishSignal(sig);
  }
  batchTimer = null;
}

/**
 * Emit a domain signal. Critical/high severity signals are sent immediately;
 * low/medium are batched and flushed every 60s.
 */
export function emitDomainSignal(signal: DomainSignal): void {
  if (signal.severity === "critical" || signal.severity === "high" || signal.trigger_type === "immediate") {
    publishSignal(signal);
  } else {
    batchBuffer.push(signal);
    if (!batchTimer) {
      batchTimer = setTimeout(flushBatch, BATCH_INTERVAL_MS);
    }
  }
}

/** Force flush any buffered signals */
export function flushSignalBuffer(): void {
  if (batchTimer) {
    clearTimeout(batchTimer);
    flushBatch();
  }
}

/** Create a properly-formed DomainSignal with defaults */
export function createDomainSignal(
  partial: Pick<DomainSignal, "module" | "domain" | "severity" | "summary"> & Partial<DomainSignal>
): DomainSignal {
  return {
    signal_id: crypto.randomUUID(),
    triggering_conditions: [],
    linked_objects: [],
    freshness: new Date().toISOString(),
    confidence: 50,
    source: partial.module,
    trigger_type: partial.severity === "critical" || partial.severity === "high" ? "immediate" : "batched",
    ...partial,
  };
}
