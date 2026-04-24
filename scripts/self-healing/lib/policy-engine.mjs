// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Policy Engine (pure resolver)
// Decides per failure cluster: SAFE-AUTO | GATED-PR | HUMAN-ONLY
// + per-class limits + refusal-path enforcement.
// NEVER MUTATES STATE — pure functions only.
// ═══════════════════════════════════════════════════════════════
import { readFileSync } from "node:fs";
import path from "node:path";

const POLICY = JSON.parse(readFileSync(path.resolve("config/self-healing-policy.json"), "utf8"));
const RISK = JSON.parse(readFileSync(path.resolve("config/self-healing-risk-classes.json"), "utf8"));
const REFUSAL = JSON.parse(readFileSync(path.resolve("config/self-healing-refusal-paths.json"), "utf8"));

/** True if any path matches the refusal list. */
export function isRefusalPath(filePath) {
  if (!filePath) return false;
  if (REFUSAL.pathPrefixes.some(p => filePath.startsWith(p))) return true;
  if (REFUSAL.pathContains.some(p => filePath.includes(p))) return true;
  if (REFUSAL.pathSuffixes.some(p => filePath.endsWith(p))) return true;
  for (const g of REFUSAL.globPatterns) {
    // Treat **/*token* as case-insensitive substring match anywhere in path
    const m = g.match(/^\*\*\/\*(.+)\*$/);
    if (m) {
      if (filePath.toLowerCase().includes(m[1].toLowerCase())) return true;
      continue;
    }
    const re = new RegExp("^" + g.replace(/\./g, "\\.").replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*") + "$", "i");
    if (re.test(filePath)) return true;
  }
  return false;
}

/** Resolve which lane a class belongs to. */
export function laneFor(cls) {
  for (const [lane, def] of Object.entries(POLICY.lanes)) {
    if (def.classes.includes(cls)) return lane;
  }
  return "human-only";
}

/** Get risk-class limits, with safe defaults for unknown classes. */
export function limitsFor(cls) {
  return RISK.classes[cls] || {
    maxFilesTouched: 1,
    maxSubsystemsTouched: 1,
    requiredStages: ["local", "subsystem", "global", "semantic"],
    blastRadiusCap: 10,
    autoMergeAllowed: false,
  };
}

/** Final decision for a cluster. */
export function decideRepair(cluster, env = {}) {
  // 1. Refusal-path check first — wins everything
  for (const f of cluster.impactedFiles) {
    if (isRefusalPath(f)) {
      return { decision: "REFUSE", lane: "human-only", reason: `refusal-path:${f}`, autoMergeAllowed: false };
    }
  }

  // 2. Confidence floor
  if (cluster.maxConfidence < POLICY.globalLimits.minConfidenceToAct) {
    return { decision: "ESCALATE", lane: "human-only", reason: `low-confidence:${cluster.maxConfidence}`, autoMergeAllowed: false };
  }

  // 3. Lane lookup
  const lane = laneFor(cluster.class);
  const limits = limitsFor(cluster.class);

  // 4. File-count cap
  if (cluster.impactedFiles.length > limits.maxFilesTouched) {
    return {
      decision: lane === "human-only" ? "ESCALATE" : "DOWNGRADE-TO-GATED",
      lane: lane === "human-only" ? "human-only" : "gated-pr",
      reason: `file-cap-exceeded:${cluster.impactedFiles.length}>${limits.maxFilesTouched}`,
      autoMergeAllowed: false,
    };
  }

  // 5. Auto-merge gate
  const autoMergeAllowed =
    lane === "safe-auto" &&
    limits.autoMergeAllowed === true &&
    cluster.maxConfidence >= POLICY.globalLimits.minConfidenceToAutoMerge &&
    process.env.SITA_SAFE_AUTOMERGE === "1";

  return {
    decision: lane === "human-only" ? "ESCALATE" : "PROCEED",
    lane,
    requiredStages: limits.requiredStages,
    blastRadiusCap: limits.blastRadiusCap,
    autoMergeAllowed,
    reason: `lane:${lane}; conf:${cluster.maxConfidence.toFixed(2)}`,
  };
}

export function getPolicyVersion() { return POLICY.version; }
export function getGlobalLimits() { return POLICY.globalLimits; }