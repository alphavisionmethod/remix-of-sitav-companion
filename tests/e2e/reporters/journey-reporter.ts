// ═══════════════════════════════════════════════════════
// SITA OS — Playwright Journey Reporter
// Outputs structured JSON for DB ingestion into
// customer_journey_runs + journey_step_results
// ═══════════════════════════════════════════════════════

import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

interface JourneyRunOutput {
  journey_key: string;
  mode: string;
  status: "pass" | "partial" | "fail" | "blocked";
  steps_passed: number;
  steps_failed: number;
  steps_total: number;
  proof_confidence: string;
  started_at: string;
  completed_at: string;
  steps: StepOutput[];
}

interface StepOutput {
  step_order: number;
  status: "pass" | "fail" | "skipped";
  test_title: string;
  duration_ms: number;
  error_summary?: string;
}

class JourneyReporter implements Reporter {
  private runs: JourneyRunOutput[] = [];
  private outputDir: string;

  constructor(options?: { outputDir?: string }) {
    this.outputDir = options?.outputDir || "test-results/journey-reports";
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    // Ensure output dir exists
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    // Extract journey key from test title annotations
    const journeyMatch = test.title.match(/\[journey:([^\]]+)\]/);
    if (!journeyMatch) return;

    const journeyKey = journeyMatch[1];
    const modeMatch = test.title.match(/\[mode:([^\]]+)\]/);
    const mode = modeMatch ? modeMatch[1] : "real";

    // Find or create run for this journey+mode
    let run = this.runs.find((r) => r.journey_key === journeyKey && r.mode === mode);
    if (!run) {
      run = {
        journey_key: journeyKey,
        mode,
        status: "pass",
        steps_passed: 0,
        steps_failed: 0,
        steps_total: 0,
        proof_confidence: "verified_e2e",
        started_at: new Date(result.startTime).toISOString(),
        completed_at: new Date(result.startTime.getTime() + result.duration).toISOString(),
        steps: [],
      };
      this.runs.push(run);
    }

    run.steps_total++;
    const stepStatus = result.status === "passed" ? "pass" : result.status === "skipped" ? "skipped" : "fail";

    if (stepStatus === "pass") run.steps_passed++;
    else if (stepStatus === "fail") run.steps_failed++;

    run.steps.push({
      step_order: run.steps.length + 1,
      status: stepStatus,
      test_title: test.title,
      duration_ms: result.duration,
      error_summary: result.errors?.[0]?.message?.slice(0, 500),
    });

    // Update run status
    if (run.steps_failed > 0 && run.steps_passed === 0) run.status = "fail";
    else if (run.steps_failed > 0) run.status = "partial";
    else run.status = "pass";
  }

  onEnd(_result: FullResult): void {
    const outputPath = path.join(this.outputDir, `journey-results-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(this.runs, null, 2));
    console.log(`\n📊 Journey report: ${outputPath} (${this.runs.length} journeys)`);
  }
}

export default JourneyReporter;
