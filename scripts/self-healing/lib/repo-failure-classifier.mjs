// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Repo-Wide Failure Classifier
// 18 deterministic classes covering this repo's real failure
// families. Pure rule engine — no LLMs, fully testable.
// Output: { class, confidence, signals[], suggestedRepairFamily }
// ═══════════════════════════════════════════════════════════════

/** @typedef {(
 *  | "missing-symbol"
 *  | "import-drift"
 *  | "barrel-export-broken"
 *  | "stale-generated"
 *  | "contract-drift"
 *  | "route-wiring-drift"
 *  | "cta-wiring-drift"
 *  | "feature-ownership-drift"
 *  | "service-duplication-fallout"
 *  | "manifest-drift"
 *  | "dependency-drift"
 *  | "demo-removal-fallout"
 *  | "auth-boundary-regression"
 *  | "release-readiness-mismatch"
 *  | "semantic-ui-regression"
 *  | "external-dep-unavailable"
 *  | "flaky-test"
 *  | "real-bug"
 * )} FailureClass */

const RULES = [
  // ── auth/security regressions — HIGHEST PRIORITY (refusal lane) ──
  { cls: "auth-boundary-regression", weight: 100,
    patterns: [/__tests__\/security\//i, /\brls[-_]/i, /\bpolicy[-_]/i, /kill[-_]switch/i, /\bauth[-_]boundary/i] },

  // ── release-readiness mismatches ──
  { cls: "release-readiness-mismatch", weight: 90,
    patterns: [/deployment[-_]readiness/i, /readiness[-_]gate/i, /release[-_]blocker/i, /freshness[-_]gate/i] },

  // ── manifest / generated-artifact drift ──
  { cls: "stale-generated", weight: 80,
    patterns: [/generated\/[\w/-]+\.json/i, /artifact[-_]freshness/i, /generated[-_]is[-_]stale/i, /run\s+`?npm run generate/i] },
  { cls: "manifest-drift", weight: 75,
    patterns: [/manifest[-_]drift/i, /artifact[-_]ownership[-_]missing/i, /capability[-_]registry/i, /route[-_]manifest/i] },

  // ── contract drift ──
  { cls: "contract-drift", weight: 70,
    patterns: [/contract[-_]integrity/i, /contract[-_]registry/i, /package[-_]exports/i, /duplicate[-_]export/i] },

  // ── route / page / CTA wiring ──
  { cls: "route-wiring-drift", weight: 65,
    patterns: [/route[-_]drift/i, /orphan[-_]page/i, /unreachable[-_]route/i, /missing[-_]route/i] },
  { cls: "cta-wiring-drift", weight: 60,
    patterns: [/cta[-_]wiring/i, /surface[-_]ownership/i, /missing[-_]cta/i] },
  { cls: "feature-ownership-drift", weight: 58,
    patterns: [/feature[-_]integration/i, /feature[-_]governance/i, /missing[-_]owner/i] },

  // ── service duplication ──
  { cls: "service-duplication-fallout", weight: 55,
    patterns: [/service[-_]sprawl/i, /duplicate[-_]service/i, /service[-_]consolidation/i] },

  // ── demo / mock leakage ──
  { cls: "demo-removal-fallout", weight: 50,
    patterns: [/demo[-_]leak/i, /MOCK_/, /isDemoMode/, /no[-_]page[-_]mocks/i, /inline[-_]mocks/i] },

  // ── import / symbol drift ──
  { cls: "barrel-export-broken", weight: 48,
    patterns: [/has no exported member/i, /Module ['"][^'"]+\/index['"]\s+has no/i] },
  { cls: "missing-symbol", weight: 45,
    patterns: [/Cannot find name ['"][^'"]+['"]/i, /is not defined/i, /TS2304/, /TS2552/] },
  { cls: "import-drift", weight: 43,
    patterns: [/Cannot find module/i, /Module not found/i, /TS2307/, /Failed to resolve import/i] },

  // ── dependency drift ──
  { cls: "dependency-drift", weight: 40,
    patterns: [/peer dep/i, /ERESOLVE/, /lockfile.*out[-_]of[-_]date/i, /package.*missing/i] },

  // ── external-dep unavailable (NEVER auto-repair) ──
  { cls: "external-dep-unavailable", weight: 38,
    patterns: [/ECONNREFUSED/, /ETIMEDOUT/, /getaddrinfo/, /DNS lookup/, /503 Service Unavailable/, /upstream\s+(timeout|error)/i] },

  // ── semantic UI regression ──
  { cls: "semantic-ui-regression", weight: 35,
    patterns: [/snapshot.*mismatch/i, /visual[-_]regression/i, /accessibility.*violation/i, /wcag[-_]violation/i] },

  // ── flaky tests ──
  { cls: "flaky-test", weight: 20,
    patterns: [/timeout.*\d+ms exceeded/i, /Element.*not visible/i, /retry attempt/i, /flaky/i] },
];

/**
 * Classify a single check failure into one of 18 classes.
 * @param {{ stdout: string, stderr: string, checkId: string, subsystem: string }} input
 * @returns {{ class: string, confidence: number, signals: string[], suggestedRepairFamily: string }}
 */
export function classifyFailure(input) {
  const text = `${input.stdout || ""}\n${input.stderr || ""}`;
  const matches = [];

  for (const rule of RULES) {
    for (const p of rule.patterns) {
      const m = text.match(p);
      if (m) {
        matches.push({ cls: rule.cls, weight: rule.weight, signal: m[0].slice(0, 200) });
        break;
      }
    }
  }

  if (matches.length === 0) {
    return {
      class: "real-bug",
      confidence: 0.4,
      signals: [`unmatched failure on ${input.checkId}`],
      suggestedRepairFamily: "human-only",
    };
  }

  matches.sort((a, b) => b.weight - a.weight);
  const top = matches[0];
  const confidence = Math.min(0.95, 0.5 + (top.weight / 200));

  return {
    class: top.cls,
    confidence,
    signals: matches.slice(0, 4).map(m => `[${m.cls}] ${m.signal}`),
    suggestedRepairFamily: repairFamilyFor(top.cls),
  };
}

function repairFamilyFor(cls) {
  // Maps class → policy lane (resolved fully in Phase 4)
  const HUMAN_ONLY = new Set([
    "auth-boundary-regression", "release-readiness-mismatch",
    "external-dep-unavailable", "real-bug",
  ]);
  const GATED = new Set([
    "route-wiring-drift", "cta-wiring-drift", "feature-ownership-drift",
    "service-duplication-fallout", "semantic-ui-regression",
  ]);
  const SAFE = new Set([
    "stale-generated", "manifest-drift", "contract-drift",
    "barrel-export-broken", "missing-symbol", "import-drift",
    "demo-removal-fallout", "dependency-drift",
  ]);
  if (HUMAN_ONLY.has(cls)) return "human-only";
  if (GATED.has(cls)) return "gated-pr";
  if (SAFE.has(cls)) return "safe-auto";
  if (cls === "flaky-test") return "quarantine";
  return "human-only";
}

export const ALL_CLASSES = [
  "missing-symbol", "import-drift", "barrel-export-broken", "stale-generated",
  "contract-drift", "route-wiring-drift", "cta-wiring-drift",
  "feature-ownership-drift", "service-duplication-fallout", "manifest-drift",
  "dependency-drift", "demo-removal-fallout", "auth-boundary-regression",
  "release-readiness-mismatch", "semantic-ui-regression",
  "external-dep-unavailable", "flaky-test", "real-bug",
];