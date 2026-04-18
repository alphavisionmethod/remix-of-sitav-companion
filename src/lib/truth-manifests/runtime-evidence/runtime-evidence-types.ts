// ═══════════════════════════════════════════════════════════════
// SITA OS — Runtime Evidence Types
//
// Runtime-class manifests must be backed by *live evidence*
// captured during actual application boot — not by static source
// scans. These types model the evidence record format that every
// runtime collector emits.
// ═══════════════════════════════════════════════════════════════

/** A single evidence record produced by a runtime collector. */
export interface RuntimeEvidenceRecord {
  /** Stable id of the collector that produced this record. */
  collectorId: string;
  /** Manifest id this evidence backs (must exist in MANIFEST_REGISTRY). */
  manifestId: string;
  /** ISO-8601 timestamp of capture. */
  capturedAt: string;
  /** Active runtime tier when captured (web/desktop/appliance/simulated). */
  runtimeTier: string;
  /** Whether the collector ran successfully end-to-end. */
  ok: boolean;
  /** Number of items observed (services, capabilities, registrations…). */
  itemCount: number;
  /** Free-form payload — must be JSON-serialisable. */
  payload: Record<string, unknown>;
  /** Soft warnings the collector wants to surface. */
  warnings: string[];
  /** Hard errors that invalidate this evidence record. */
  errors: string[];
}

/** Aggregate evidence bundle written to disk after boot. */
export interface RuntimeEvidenceBundle {
  bundleVersion: 1;
  generatedAt: string;
  runtimeTier: string;
  records: RuntimeEvidenceRecord[];
  /** Map of manifestId → number of records covering it. */
  coverage: Record<string, number>;
}

/** Function signature every collector must implement. */
export type RuntimeEvidenceCollector = () => Promise<RuntimeEvidenceRecord> | RuntimeEvidenceRecord;

/** Collector registration metadata. */
export interface RuntimeEvidenceCollectorRegistration {
  id: string;
  manifestId: string;
  description: string;
  collector: RuntimeEvidenceCollector;
}
