// ═══════════════════════════════════════════════════════
// SITA OS — Playwright Journey Reporter
// Outputs structured JSON for DB ingestion into
// customer_journey_runs + journey_step_results
// + flagship loop proof summary
// ═══════════════════════════════════════════════════════

import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";
import { classifyToLoop, classifyFailure, getLaunchImpact, generateLoopSummaries, type FlagshipLoop, type FailureClass } from "../helpers/proof-classifier";

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
  failure_class?: FailureClass;
  flagship_loop?: FlagshipLoop | "support";
  launch_impact?: string;
}

class JourneyReporter implements Reporter {
  private runs: JourneyRunOutput[] = [];
  private classifiedResults: Array<{
    loop: FlagshipLoop | "support";
    passed: boolean;
    skipped: boolean;
    title: string;
    failureClass: FailureClass;
  }> = [];
  private outputDir: string;

  constructor(options?: { outputDir?: string }) {
    this.outputDir = options?.outputDir || "test-results/journey-reports";
  }

  onBegin(_config: FullConfig, _suite: Suite): void {
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    // Classify into loop
    const specFile = test.location?.file || "";
    const loop = classifyToLoop(specFile, test.title);
    const isPassed = result.status === "passed";
    const isSkipped = result.status === "skipped";
    const errorMsg = result.errors?.[0]?.message;
    const failureClass = isPassed ? ("pass_verified" as const) : classifyFailure(errorMsg);

    this.classifiedResults.push({
      loop,
      passed: isPassed,
      skipped: isSkipped,
      title: test.title,
      failureClass,
    });

    // Journey-keyed grouping (original behavior)
    const journeyMatch = test.title.match(/\[journey:([^\]]+)\]/);
    if (!journeyMatch) return;

    const journeyKey = journeyMatch[1];
    const modeMatch = test.title.match(/\[mode:([^\]]+)\]/);
    const mode = modeMatch ? modeMatch[1] : "real";

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
    const stepStatus = isPassed ? "pass" : isSkipped ? "skipped" : "fail";

    if (stepStatus === "pass") run.steps_passed++;
    else if (stepStatus === "fail") run.steps_failed++;

    run.steps.push({
      step_order: run.steps.length + 1,
      status: stepStatus,
      test_title: test.title,
      duration_ms: result.duration,
      error_summary: errorMsg?.slice(0, 500),
      failure_class: failureClass,
      flagship_loop: loop,
      launch_impact: getLaunchImpact(loop),
    });

    if (run.steps_failed > 0 && run.steps_passed === 0) run.status = "fail";
    else if (run.steps_failed > 0) run.status = "partial";
    else run.status = "pass";
  }

  onEnd(_result: FullResult): void {
    // Write journey results
    const outputPath = path.join(this.outputDir, `journey-results-${Date.now()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(this.runs, null, 2));
    console.log(`\n📊 Journey report: ${outputPath} (${this.runs.length} journeys)`);

    // Write flagship loop proof summary
    const loopSummaries = generateLoopSummaries(this.classifiedResults);
    const summaryPath = path.join(this.outputDir, "flagship-loop-proof-summary.json");
    fs.writeFileSync(summaryPath, JSON.stringify(loopSummaries, null, 2));
    console.log(`🎯 Loop proof summary: ${summaryPath} (${loopSummaries.length} loops)`);

    // Print markdown summary for CI
    console.log("\n## 🎯 Flagship Loop Proof Summary\n");
    console.log("| Loop | Total | ✅ Pass | ❌ Fail | ⏭ Skip | Confidence | Impact |");
    console.log("|------|-------|---------|---------|--------|------------|--------|");
    for (const s of loopSummaries) {
      console.log(`| ${s.loop_name} | ${s.total} | ${s.passed} | ${s.failed} | ${s.skipped} | ${s.proof_confidence} | ${s.launch_impact} |`);
    }

    const totalPassed = this.classifiedResults.filter((r) => r.passed).length;
    const totalFailed = this.classifiedResults.filter((r) => !r.passed && !r.skipped).length;
    console.log(`\n**Total: ${this.classifiedResults.length} tests — ${totalPassed} passed, ${totalFailed} failed**\n`);

    // Write markdown for GH step summary
    const mdPath = path.join(this.outputDir, "proof-summary.md");
    const md = this.generateMarkdown(loopSummaries, totalPassed, totalFailed);
    fs.writeFileSync(mdPath, md);
  }

  private generateMarkdown(
    summaries: ReturnType<typeof generateLoopSummaries>,
    totalPassed: number,
    totalFailed: number
  ): string {
    let md = "## 🎯 SITA OS — Flagship Loop Proof Summary\n\n";
    md += `**${totalPassed} passed** | **${totalFailed} failed** | ${this.classifiedResults.length} total\n\n`;
    md += "| Loop | Total | ✅ | ❌ | Confidence | Launch Impact |\n";
    md += "|------|-------|----|----|------------|---------------|\n";
    for (const s of summaries) {
      md += `| ${s.loop_name} | ${s.total} | ${s.passed} | ${s.failed} | \`${s.proof_confidence}\` | \`${s.launch_impact}\` |\n`;
    }
    if (totalFailed > 0) {
      md += "\n### Top Failures\n\n";
      for (const s of summaries) {
        if (s.top_failures.length > 0) {
          md += `**${s.loop_name}:**\n`;
          for (const f of s.top_failures) md += `- ${f}\n`;
        }
      }
    }
    return md;
  }
}

export default JourneyReporter;
