/* eslint-disable no-console */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { CI_GATE_REGISTRY } from "../../src/lib/ci/ci-gate-registry";

interface GateVerdict {
  gateId: string;
  phase: string;
  severity: string;
  reportPath?: string;
  ok: boolean;
  detail?: string;
}

const verdicts: GateVerdict[] = [];
for (const g of CI_GATE_REGISTRY) {
  let ok = true;
  let detail: string | undefined;
  if (g.producesArtifact && existsSync(g.producesArtifact)) {
    try {
      const data = JSON.parse(readFileSync(g.producesArtifact, "utf8"));
      if (typeof data.ok === "boolean") ok = data.ok;
      else if (typeof data.integrity?.ok === "boolean") ok = data.integrity.ok;
      if (data.errorCount && data.errorCount > 0) {
        ok = false;
        detail = `${data.errorCount} errors in ${g.producesArtifact}`;
      }
    } catch (e) {
      ok = false;
      detail = `Could not parse ${g.producesArtifact}`;
    }
  }
  verdicts.push({ gateId: g.id, phase: g.phase, severity: g.severity, reportPath: g.producesArtifact, ok, detail });
}

const blockerFails = verdicts.filter((v) => !v.ok && v.severity === "blocker").length;
const warningFails = verdicts.filter((v) => !v.ok && v.severity === "warning").length;
const totalGates = verdicts.length;
const passedGates = verdicts.filter((v) => v.ok).length;

// Pull deployability scores
let deployScores: Array<{ surface: string; score: number; status: string }> = [];
if (existsSync("generated/deployability-report.json")) {
  try {
    const d = JSON.parse(readFileSync("generated/deployability-report.json", "utf8"));
    deployScores = (d.scores ?? d.surfaces ?? []).map((s: any) => ({
      surface: s.surface,
      score: s.score,
      status: s.score >= 80 ? "ready" : "blocked",
    }));
  } catch { /* ignore */ }
}

const verdict: "ready" | "not-ready" =
  blockerFails === 0 && deployScores.every((s) => s.score >= 80) ? "ready" : "not-ready";

const final = {
  generatedAt: new Date().toISOString(),
  verdict,
  totals: { totalGates, passedGates, blockerFails, warningFails },
  byPhase: verdicts.reduce<Record<string, { total: number; passed: number }>>((acc, v) => {
    acc[v.phase] ??= { total: 0, passed: 0 };
    acc[v.phase].total++;
    if (v.ok) acc[v.phase].passed++;
    return acc;
  }, {}),
  gates: verdicts,
  deployability: deployScores,
  acceptanceCriteria: {
    "20-gates-green": totalGates === 20 && blockerFails === 0,
    "edge-functions-claimed": existsSync("generated/edge-function-membership-report.json"),
    "tables-claimed": existsSync("generated/table-membership-report.json"),
    "routes-owned": (() => {
      try {
        const r = JSON.parse(readFileSync("generated/route-registry-completeness-report.json", "utf8"));
        return r.ok === true;
      } catch { return false; }
    })(),
    "feature-floor-met": (() => {
      try {
        const f = JSON.parse(readFileSync("generated/feature-reality-report.json", "utf8"));
        return f.featureCount >= 50 && f.ok === true;
      } catch { return false; }
    })(),
    "page-state-floor-met": (() => {
      try {
        const p = JSON.parse(readFileSync("generated/page-registry-completeness-report.json", "utf8"));
        return p.ok === true;
      } catch { return false; }
    })(),
  },
  ok: verdict === "ready",
};

mkdirSync("generated", { recursive: true });
writeFileSync("generated/production-truth-final.json", JSON.stringify(final, null, 2));
console.log(`Verdict: ${verdict.toUpperCase()}  (${passedGates}/${totalGates} gates green, ${blockerFails} blocker fails)`);
console.log(`Acceptance:`, final.acceptanceCriteria);
