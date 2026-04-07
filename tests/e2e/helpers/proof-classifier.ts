// ═══════════════════════════════════════════════════════
// SITA OS — Proof Classifier
// Maps specs → flagship loops, classifies failures
// ═══════════════════════════════════════════════════════

export type FlagshipLoop = "loop1_auth_dashboard" | "loop2_files_ai" | "loop3_boardroom" | "loop4_connected_services" | "loop5_admin_truth";

export type FailureClass =
  | "pass_verified"
  | "fail_behavioral"
  | "fail_setup"
  | "fail_env"
  | "fail_selector"
  | "fail_auth"
  | "fail_provider_dependency"
  | "blocked_external_dependency"
  | "skipped_not_configured";

export type LaunchImpact = "launch_blocker" | "pilot_blocker" | "claim_risk" | "important_non_blocker" | "non_blocking";

export interface LoopDefinition {
  key: FlagshipLoop;
  name: string;
  specFiles: string[];
  titlePatterns: string[];
  launchImpact: LaunchImpact;
}

export const FLAGSHIP_LOOPS: LoopDefinition[] = [
  {
    key: "loop1_auth_dashboard",
    name: "Auth + Dashboard + Pulse",
    specFiles: ["auth.spec.ts", "auth-journeys.spec.ts"],
    titlePatterns: ["sign-in", "sign-out", "dashboard-load", "auth", "login"],
    launchImpact: "launch_blocker",
  },
  {
    key: "loop2_files_ai",
    name: "Files + AI Assist",
    specFiles: ["files-journey.spec.ts"],
    titlePatterns: ["files-upload", "assistant-chat", "file"],
    launchImpact: "launch_blocker",
  },
  {
    key: "loop3_boardroom",
    name: "Boardroom + Summary + Decision",
    specFiles: ["boardroom-journey.spec.ts"],
    titlePatterns: ["boardroom", "summary", "decision"],
    launchImpact: "launch_blocker",
  },
  {
    key: "loop4_connected_services",
    name: "Connected Services + Sync",
    specFiles: ["connectors-journey.spec.ts"],
    titlePatterns: ["connected-services", "connector", "sync"],
    launchImpact: "pilot_blocker",
  },
  {
    key: "loop5_admin_truth",
    name: "Admin Truth + Recommendation + Approval",
    specFiles: ["admin-boards.spec.ts", "verification-boards.spec.ts", "approvals-journey.spec.ts", "customer-journey-boards.spec.ts"],
    titlePatterns: ["admin", "verification", "approval", "ai-team", "runtime-truth", "launch-truth", "customer-journey-report"],
    launchImpact: "pilot_blocker",
  },
];

/** Unclassified specs that don't map to a flagship loop */
export const SUPPORT_SPECS = [
  "demo-mode.spec.ts",
  "interactions.spec.ts",
  "navigation.spec.ts",
  "responsive.spec.ts",
  "route-health.spec.ts",
  "route-smoke.spec.ts",
  "settings-journey.spec.ts",
  "advisor-journey.spec.ts",
  "business-journey.spec.ts",
  "money-journey.spec.ts",
];

/**
 * Given a spec file name and test title, find the flagship loop it belongs to.
 */
export function classifyToLoop(specFile: string, testTitle: string): FlagshipLoop | "support" {
  const fileName = specFile.split("/").pop() || specFile;

  for (const loop of FLAGSHIP_LOOPS) {
    if (loop.specFiles.includes(fileName)) return loop.key;
    if (loop.titlePatterns.some((p) => testTitle.toLowerCase().includes(p))) return loop.key;
  }

  return "support";
}

/**
 * Classify a test failure into a category based on the error message.
 */
export function classifyFailure(errorMessage?: string): FailureClass {
  if (!errorMessage) return "pass_verified";

  const msg = errorMessage.toLowerCase();

  if (msg.includes("timeout") && msg.includes("waiting for selector")) return "fail_selector";
  if (msg.includes("locator.click") || msg.includes("strict mode violation")) return "fail_selector";
  if (msg.includes("getbytext") || msg.includes("getbyrole") || msg.includes("getbytestid")) return "fail_selector";
  if (msg.includes("net::err") || msg.includes("econnrefused")) return "fail_env";
  if (msg.includes("401") || msg.includes("403") || msg.includes("not authenticated")) return "fail_auth";
  if (msg.includes("supabase") && msg.includes("url")) return "fail_env";
  if (msg.includes("api key") || msg.includes("missing key")) return "fail_env";
  if (msg.includes("navigation") || msg.includes("page.goto")) return "fail_setup";
  if (msg.includes("openai") || msg.includes("anthropic") || msg.includes("provider")) return "fail_provider_dependency";

  return "fail_behavioral";
}

/**
 * Given a loop key, return the launch impact level.
 */
export function getLaunchImpact(loopKey: FlagshipLoop | "support"): LaunchImpact {
  if (loopKey === "support") return "non_blocking";
  const loop = FLAGSHIP_LOOPS.find((l) => l.key === loopKey);
  return loop?.launchImpact ?? "non_blocking";
}

export interface LoopProofSummary {
  loop_key: FlagshipLoop | "support";
  loop_name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  proof_confidence: "verified_e2e" | "partial" | "no_proof";
  launch_impact: LaunchImpact;
  top_failures: string[];
}

/**
 * Generate a summary per loop from classified results.
 */
export function generateLoopSummaries(
  results: Array<{ loop: FlagshipLoop | "support"; passed: boolean; skipped: boolean; title: string; failureClass: FailureClass }>
): LoopProofSummary[] {
  const groups = new Map<string, typeof results>();

  for (const r of results) {
    const key = r.loop;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const summaries: LoopProofSummary[] = [];

  for (const loop of [...FLAGSHIP_LOOPS, { key: "support" as const, name: "Support / Cross-cutting", launchImpact: "non_blocking" as const }]) {
    const items = groups.get(loop.key) || [];
    if (items.length === 0) continue;

    const passed = items.filter((i) => i.passed).length;
    const failed = items.filter((i) => !i.passed && !i.skipped).length;
    const skipped = items.filter((i) => i.skipped).length;

    let confidence: "verified_e2e" | "partial" | "no_proof" = "no_proof";
    if (passed > 0 && failed === 0) confidence = "verified_e2e";
    else if (passed > 0) confidence = "partial";

    summaries.push({
      loop_key: loop.key,
      loop_name: loop.name,
      total: items.length,
      passed,
      failed,
      skipped,
      proof_confidence: confidence,
      launch_impact: loop.launchImpact,
      top_failures: items
        .filter((i) => !i.passed && !i.skipped)
        .slice(0, 5)
        .map((i) => `${i.title} [${i.failureClass}]`),
    });
  }

  return summaries;
}
