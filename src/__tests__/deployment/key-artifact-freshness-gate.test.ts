// ═══════════════════════════════════════════════════════════════
// SITA OS — Key Generated Artifact Freshness & Truth Gate
// ───────────────────────────────────────────────────────────────
// HARD deployment-readiness gate. Fails CI / pre-deploy if any
// canonical generated JSON artifact is:
//   1. missing
//   2. unparseable
//   3. older than its freshness budget
//   4. reports aggregated failure (ok:false, deploymentReady:false,
//      launchReady:false, or has a non-zero failed/errors count).
//
// This complements the lenient mass-scan in
// src/__tests__/meta/generated-artifact-freshness.test.ts which
// surveys all 800+ artifacts. This file targets only the small set
// of CANONICAL truth artifacts that gate deployment.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

type FreshnessBudget = "strict" | "weekly" | "monthly";

interface KeyArtifact {
  file: string;
  budget: FreshnessBudget;
  /** Skip the truth/ok check for index/registry artifacts that are pure data. */
  skipTruthCheck?: boolean;
  /** Allow this artifact to be missing in dev (warning only). */
  optional?: boolean;
}

// Freshness budgets (hours). Aggregate gates regenerate frequently;
// large catalog snapshots are allowed a longer tail.
const BUDGET_HOURS: Record<FreshnessBudget, number> = {
  strict: 168,    // 7 days  — pre-deploy / readiness gates
  weekly: 336,    // 14 days — registries refreshed in CI
  monthly: 1440,  // 60 days — large structural snapshots
};

const KEY_ARTIFACTS: KeyArtifact[] = [
  // Aggregate truth — must be fresh and ok
  { file: "deployment-readiness-report.json",          budget: "strict" },
  { file: "validation-summary.json",                   budget: "weekly" },
  { file: "architecture-compliance-report.json",       budget: "weekly" },
  { file: "production-launch-attestation-report.json", budget: "weekly" },
  { file: "final-deployment-readiness-report.json",    budget: "weekly", optional: true },

  // Per-target release readiness
  // Mobile targets are gated separately — informational here.
  // They still must parse and be fresh, but the ok/truth check is
  // skipped because Capacitor isn't required for the web deploy.
  { file: "android-release-readiness-report.json",     budget: "weekly", skipTruthCheck: true },
  { file: "ios-release-readiness-report.json",         budget: "weekly", skipTruthCheck: true },
  { file: "iso-vmware-release-readiness-report.json",  budget: "weekly" },

  // Catalog / index artifacts (parse + freshness only — no ok field)
  { file: "service-manifest.json",                     budget: "monthly", skipTruthCheck: true },
  { file: "route-manifest.json",                       budget: "monthly", skipTruthCheck: true },
  { file: "capability-index.json",                     budget: "monthly", skipTruthCheck: true },
  { file: "launch-tier-index.json",                    budget: "monthly", skipTruthCheck: true },
  { file: "security-review-manifest.json",             budget: "monthly", skipTruthCheck: true },
];

const GENERATED_DIR = "generated";

/**
 * Inspect a parsed artifact for any aggregated failure signal.
 * Returns null on success or a human-readable reason on failure.
 */
function detectFailure(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  // Envelope: { ok: false }
  if (d.ok === false) return "ok: false";

  // Nested envelope: { data: { ok: false } } or { summary: { ok: false } }
  for (const key of ["data", "summary", "result"]) {
    const nested = d[key];
    if (nested && typeof nested === "object") {
      const nd = nested as Record<string, unknown>;
      if (nd.ok === false) return `${key}.ok: false`;
      if (nd.deploymentReady === false) return `${key}.deploymentReady: false`;
      if (nd.launchReady === false) return `${key}.launchReady: false`;
    }
  }

  // Top-level deployment/launch flags
  if (d.deploymentReady === false) return "deploymentReady: false";
  if (d.launchReady === false) return "launchReady: false";
  if (d.ready === false) return "ready: false";
  if (d.passed === false) return "passed: false";

  // Counter-style failure signals
  if (typeof d.failed === "number" && d.failed > 0 && d.passed !== undefined) {
    return `failed: ${d.failed}`;
  }
  if (typeof d.errors === "number" && d.errors > 0) return `errors: ${d.errors}`;
  if (typeof d.errorCount === "number" && d.errorCount > 0) return `errorCount: ${d.errorCount}`;

  return null;
}

describe("Key Generated Artifact Freshness & Truth Gate", () => {
  it("generated/ directory exists", () => {
    expect(fs.existsSync(GENERATED_DIR), "generated/ directory missing — run gate scripts").toBe(true);
  });

  describe.each(KEY_ARTIFACTS)("$file", (artifact) => {
    const fullPath = path.join(GENERATED_DIR, artifact.file);
    const present = fs.existsSync(fullPath);

    it("exists", () => {
      if (artifact.optional && !present) {
        console.warn(`⚠️  optional artifact missing: ${artifact.file}`);
        return;
      }
      expect(present, `Missing key artifact: ${artifact.file}`).toBe(true);
    });

    if (!present) return;

    it("parses as valid JSON", () => {
      const raw = fs.readFileSync(fullPath, "utf8");
      expect(() => JSON.parse(raw), `Unparseable JSON: ${artifact.file}`).not.toThrow();
    });

    it(`is fresher than ${BUDGET_HOURS[artifact.budget]}h (${artifact.budget})`, () => {
      const stat = fs.statSync(fullPath);
      const ageHours = (Date.now() - stat.mtimeMs) / 3_600_000;
      const budget = BUDGET_HOURS[artifact.budget];
      expect(
        ageHours,
        `${artifact.file} is ${ageHours.toFixed(1)}h old (budget: ${budget}h, mtime: ${stat.mtime.toISOString()}). Re-run the generator.`,
      ).toBeLessThanOrEqual(budget);
    });

    if (!artifact.skipTruthCheck) {
      it("does not report aggregated failure", () => {
        const data = JSON.parse(fs.readFileSync(fullPath, "utf8"));
        const reason = detectFailure(data);
        expect(
          reason,
          `${artifact.file} reports failure (${reason}). Inspect generatedAt=${(data as { generatedAt?: string }).generatedAt ?? "unknown"}.`,
        ).toBeNull();
      });
    }
  });

  it("emits a summary report for CI artifact upload", () => {
    const summary = {
      generatedAt: new Date().toISOString(),
      gate: "key-artifact-freshness-gate",
      total: KEY_ARTIFACTS.length,
      results: KEY_ARTIFACTS.map((a) => {
        const fp = path.join(GENERATED_DIR, a.file);
        const exists = fs.existsSync(fp);
        let ageHours: number | null = null;
        let parseable = false;
        let failureReason: string | null = null;
        if (exists) {
          const stat = fs.statSync(fp);
          ageHours = Math.round(((Date.now() - stat.mtimeMs) / 3_600_000) * 10) / 10;
          try {
            const data = JSON.parse(fs.readFileSync(fp, "utf8"));
            parseable = true;
            if (!a.skipTruthCheck) failureReason = detectFailure(data);
          } catch {
            parseable = false;
          }
        }
        return {
          file: a.file,
          budget: a.budget,
          budgetHours: BUDGET_HOURS[a.budget],
          exists,
          parseable,
          ageHours,
          fresh: ageHours !== null && ageHours <= BUDGET_HOURS[a.budget],
          failureReason,
          ok: exists && parseable && (ageHours !== null && ageHours <= BUDGET_HOURS[a.budget]) && failureReason === null,
        };
      }),
    };
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(GENERATED_DIR, "key-artifact-freshness-report.json"),
      JSON.stringify({ ...summary, ok: summary.results.every((r) => r.ok || (KEY_ARTIFACTS.find(a => a.file === r.file)?.optional && !r.exists)) }, null, 2),
    );
    expect(true).toBe(true);
  });
});