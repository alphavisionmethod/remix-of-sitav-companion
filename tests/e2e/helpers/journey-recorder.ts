// ═══════════════════════════════════════════════════════
// SITA OS — Journey Recorder
// Accumulates step results during a test, emits structured
// JSON for DB ingestion via the journey reporter
// ═══════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

export interface JourneyStep {
  step_order: number;
  action: string;
  status: "pass" | "fail" | "skipped";
  duration_ms: number;
  evidence_ref?: string;
  error_summary?: string;
}

export interface JourneyRecord {
  journey_key: string;
  route: string;
  mode: "demo" | "real" | "both";
  status: "pass" | "partial" | "fail" | "blocked";
  steps: JourneyStep[];
  started_at: string;
  completed_at: string;
  evidence_refs: string[];
}

const OUTPUT_DIR = path.join(process.cwd(), "test-results", "journey-records");

export class JourneyRecorder {
  private journeyKey: string;
  private route: string;
  private mode: "demo" | "real" | "both";
  private steps: JourneyStep[] = [];
  private evidenceRefs: string[] = [];
  private startedAt: string;

  constructor(journeyKey: string, route: string, mode: "demo" | "real" | "both" = "real") {
    this.journeyKey = journeyKey;
    this.route = route;
    this.mode = mode;
    this.startedAt = new Date().toISOString();
  }

  /**
   * Record a step execution.
   */
  async recordStep(action: string, fn: () => Promise<void>): Promise<void> {
    const stepOrder = this.steps.length + 1;
    const start = Date.now();
    try {
      await fn();
      this.steps.push({
        step_order: stepOrder,
        action,
        status: "pass",
        duration_ms: Date.now() - start,
      });
    } catch (err) {
      this.steps.push({
        step_order: stepOrder,
        action,
        status: "fail",
        duration_ms: Date.now() - start,
        error_summary: err instanceof Error ? err.message.slice(0, 500) : String(err),
      });
      throw err; // Re-throw so the test still fails
    }
  }

  /**
   * Add an evidence reference (screenshot path, trace path, etc.)
   */
  addEvidence(ref: string): void {
    this.evidenceRefs.push(ref);
  }

  /**
   * Finalize and write the journey record to disk.
   */
  finalize(): JourneyRecord {
    const passed = this.steps.filter((s) => s.status === "pass").length;
    const failed = this.steps.filter((s) => s.status === "fail").length;

    let status: JourneyRecord["status"];
    if (failed === 0 && passed > 0) status = "pass";
    else if (failed > 0 && passed > 0) status = "partial";
    else if (this.steps.length === 0) status = "blocked";
    else status = "fail";

    const record: JourneyRecord = {
      journey_key: this.journeyKey,
      route: this.route,
      mode: this.mode,
      status,
      steps: this.steps,
      started_at: this.startedAt,
      completed_at: new Date().toISOString(),
      evidence_refs: this.evidenceRefs,
    };

    // Write to disk
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const filename = `${this.journeyKey}-${this.mode}-${Date.now()}.json`;
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(record, null, 2));

    return record;
  }
}
