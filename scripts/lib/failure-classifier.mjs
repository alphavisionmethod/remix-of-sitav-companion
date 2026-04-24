// ═══════════════════════════════════════════════════════════════
// Failure Classifier — pure rule engine for test triage.
// classify(stdout, stderr, exitCode, file) → { class, confidence, signals[], suggestedTier, suggestedAction }
// 12 classes; deterministic; safe to call with empty inputs.
// ═══════════════════════════════════════════════════════════════

const RULES = [
  { cls: "db-rls-denied", tier: "REFUSAL", action: "human-only", patterns: [/row-level security/i, /rls.*denied/i, /policy.*violat/i] },
  { cls: "expired-auth", tier: "T2", action: "rerun-global-setup", patterns: [/storageState.*401/i, /redirect.*\/login/i, /401 unauthorized/i, /jwt.*expired/i] },
  { cls: "stale-vite-cache", tier: "T2", action: "clear-vite-cache", patterns: [/Failed to resolve import/i, /Cannot find module .*\/\.vite\//i, /optimized dep/i] },
  { cls: "port-collision", tier: "T2", action: "rerun-fresh-env", patterns: [/EADDRINUSE/i, /address already in use/i] },
  { cls: "oom-worker", tier: "T2", action: "rerun-fresh-env", patterns: [/JavaScript heap out of memory/i, /Worker terminated/i, /FATAL ERROR.*allocation/i] },
  { cls: "stale-snapshot", tier: "T2", action: "update-snapshots", patterns: [/Snapshot .* mismatched/i, /toMatchSnapshot.*failed/i, /obsolete snapshot/i] },
  { cls: "flake-network", tier: "T1", action: "quarantine-and-log", patterns: [/ECONNREFUSED/i, /fetch failed/i, /MSW.*no handler/i, /network.*timeout/i] },
  { cls: "missing-mock", tier: "T3", action: "propose-mock-patch", patterns: [/is not a function/i, /Cannot read propert.*of undefined.*supabase/i, /vi\.fn.*not.*configured/i] },
  { cls: "import-rename", tier: "T4", action: "codemod-rename", patterns: [/Module .* has no exported member/i, /TS2305/i, /TS2724/i] },
  { cls: "dirty-jsdom", tier: "T3", action: "propose-unstub-globals", patterns: [/localStorage.*leaked/i, /window\..*not reset/i, /jsdom.*global.*polluted/i] },
  { cls: "flake-timing", tier: "T1", action: "quarantine-and-log", patterns: [/Test timed out/i, /Exceeded timeout/i, /Promise resolved.*timeout/i] },
];

const REFUSAL_PATHS = [
  /__tests__\/security\//, /__tests__\/deployment\//, /__tests__\/ci\//,
  /edge-function-contracts\.spec\./, /\brls\b/i, /\bpolicy\b/i,
  /\bkill-switch\b/i, /\bcompliance\b/i,
  /tests\/e2e\/customer-journey\/(advisor|boardroom|auth)/,
];

export function isRefusalPath(file = "") {
  return REFUSAL_PATHS.some((re) => re.test(file));
}

export function classify(stdout = "", stderr = "", exitCode = 1, file = "") {
  const blob = `${stdout}\n${stderr}`;
  const signals = [];

  if (isRefusalPath(file)) {
    return {
      cls: "real-bug", tier: "REFUSAL", action: "human-only",
      confidence: 1.0, signals: ["refusal-path"],
      reason: "File is on the hard-refusal list; never auto-touched.",
    };
  }

  for (const rule of RULES) {
    const hits = rule.patterns.filter((re) => re.test(blob));
    if (hits.length > 0) {
      signals.push(...hits.map((h) => h.source));
      return {
        cls: rule.cls, tier: rule.tier, action: rule.action,
        confidence: Math.min(1, 0.6 + 0.15 * hits.length),
        signals,
      };
    }
  }

  if (exitCode === 0) {
    return { cls: "flake-timing", tier: "T1", action: "quarantine-and-log", confidence: 0.55, signals: ["passed-on-rerun"] };
  }

  return { cls: "real-bug", tier: "T0", action: "surface-only", confidence: 0.4, signals };
}

export const CLASSES = RULES.map((r) => r.cls).concat(["real-bug"]);
