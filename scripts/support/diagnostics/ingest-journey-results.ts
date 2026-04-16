#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Playwright Journey Result Ingestion Script
// Reads JSON output from journey-reporter and ingests into DB
// 
// Usage: npx tsx scripts/ingest-journey-results.ts
// 
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   COMMIT_SHA (optional)
//   BRANCH_NAME (optional)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const COMMIT_SHA = process.env.COMMIT_SHA || process.env.GITHUB_SHA || "";
const BRANCH_NAME = process.env.BRANCH_NAME || process.env.GITHUB_REF_NAME || "";
const RESULTS_DIR = process.env.RESULTS_DIR || "test-results/journey-reports";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface JourneyRunResult {
  journey_key: string;
  mode: string;
  status: "pass" | "partial" | "fail" | "blocked";
  steps_passed: number;
  steps_failed: number;
  steps_total: number;
  proof_confidence: string;
  started_at: string;
  completed_at: string;
  steps: Array<{
    step_order: number;
    status: "pass" | "fail" | "skipped";
    test_title: string;
    duration_ms: number;
    error_summary?: string;
  }>;
}

async function ingest() {
  console.log(`\n📥 SITA OS — Journey Result Ingestion`);
  console.log(`   Results dir: ${RESULTS_DIR}`);
  console.log(`   Commit: ${COMMIT_SHA || "unknown"}`);
  console.log(`   Branch: ${BRANCH_NAME || "unknown"}\n`);

  if (!fs.existsSync(RESULTS_DIR)) {
    console.log("⚠️  No results directory found. Skipping ingestion.");
    return;
  }

  const files = fs.readdirSync(RESULTS_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log("⚠️  No JSON result files found. Skipping ingestion.");
    return;
  }

  let totalRuns = 0;
  let totalSteps = 0;

  for (const file of files) {
    const filePath = path.join(RESULTS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    let runs: JourneyRunResult[];

    try {
      runs = JSON.parse(raw);
    } catch {
      console.error(`❌ Failed to parse ${file}`);
      continue;
    }

    for (const run of runs) {
      // Look up journey in registry
      const { data: registry } = await supabase
        .from("customer_journey_registry" as never)
        .select("id")
        .eq("journey_key", run.journey_key)
        .single();

      if (!registry) {
        console.warn(`⚠️  Journey "${run.journey_key}" not in registry. Skipping.`);
        continue;
      }

      // Insert verification run
      const { data: runData, error: runError } = await supabase
        .from("journey_verification_runs" as never)
        .insert({
          journey_id: (registry as Record<string, unknown>).id,
          mode: run.mode,
          environment: "ci",
          verification_type: "e2e_playwright",
          status: run.status,
          proof_confidence: run.proof_confidence || "verified_e2e",
          steps_passed: run.steps_passed,
          steps_failed: run.steps_failed,
          steps_skipped: run.steps_total - run.steps_passed - run.steps_failed,
          launch_impact: null,
          summary: `${run.steps_passed}/${run.steps_total} steps passed`,
          run_identifier: `ci-${Date.now()}`,
          commit_sha: COMMIT_SHA,
          branch_name: BRANCH_NAME,
          started_at: run.started_at,
          completed_at: run.completed_at,
        } as never)
        .select()
        .single();

      if (runError) {
        console.error(`❌ Failed to insert run for ${run.journey_key}:`, runError.message);
        continue;
      }

      totalRuns++;

      // Insert step results
      for (const step of run.steps) {
        await fromTable("journey_step_results").insert({
          verification_run_id: (runData as Record<string, unknown>).id,
          step_order: step.step_order,
          status: step.status,
          actual_behavior: step.test_title,
          error_summary: step.error_summary || null,
          duration_ms: step.duration_ms,
        } as never);
        totalSteps++;
      }

      // Update journey status
      await supabase
        .from("customer_journey_status" as never)
        .upsert(
          {
            journey_id: (registry as Record<string, unknown>).id,
            current_status: run.status === "pass" ? "working" : run.status === "partial" ? "partial" : "broken",
            last_verified_run_id: (runData as Record<string, unknown>).id,
            last_verified_at: new Date().toISOString(),
            proof_confidence: run.proof_confidence || "verified_e2e",
            actual_outcome_summary: `${run.steps_passed}/${run.steps_total} steps passed`,
          } as never,
          { onConflict: "journey_id" }
        );
    }
  }

  console.log(`\n✅ Ingestion complete: ${totalRuns} runs, ${totalSteps} step results`);
}

ingest().catch((err) => {
  console.error("❌ Ingestion failed:", err);
  process.exit(1);
});
