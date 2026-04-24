// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Policy Engine (pure resolver)
// Decides per failure cluster: SAFE-AUTO | GATED-PR | HUMAN-ONLY
// + per-class limits + refusal-path enforcement.
// NEVER MUTATES STATE — pure functions only.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";

const POLICY = JSON.parse(readFileSync(path.resolve("config/self-healing-policy.json"), "utf8"));
const RISK = JSON.parse(readFileSync(path.resolve("config/self-healing-risk-classes.json"), "utf8"));
const REFUSAL = JSON.parse(readFileSync(path.resolve("config/self-healing-refusal-paths.json"), "utf8"));

// ─── CODEOWNERS (minimal GitHub-syntax parser) ─────────────────
const CODEOWNERS_PATH = path.resolve(".github/CODEOWNERS");
let CODEOWNERS_RULES = null;
function loadCodeowners() {
  if (CODEOWNERS_RULES !== null) return CODEOWNERS_RULES;
  if (!existsSync(CODEOWNERS_PATH)) { CODEOWNERS_RULES = []; return CODEOWNERS_RULES; }
  const raw = readFileSync(CODEOWNERS_PATH, "utf8");
  const rules = [];
  for (const line of raw.split("\n")) {
    const t = line.replace(/#.*$/, "").trim();
    if (!t) continue;
    const parts = t.split(/\s+/);
    const pattern = parts.shift();
    const owners = parts.filter((p) => p.startsWith("@") || p.includes("/"));
    if (pattern && owners.length) rules.push({ pattern, owners });
  }
  // CODEOWNERS semantics: LAST matching rule wins.
  CODEOWNERS_RULES = rules;
  return CODEOWNERS_RULES;
}
function matchCodeownersPattern(pattern, filePath) {
  let p = pattern;
  if (p === "*") return true;
  if (p.endsWith("/")) return ("/" + filePath).startsWith(p);
  const anchored = p.startsWith("/");
  if (anchored) p = p.slice(1);
  const re = new RegExp(
    "^" + p
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "::DOUBLESTAR::")
      .replace(/\*/g, "[^/]*")
      .replace(/::DOUBLESTAR::/g, ".*") + "$",
  );
  return re.test(filePath) || (!anchored && re.test(filePath.split("/").pop() || ""));
}
function ownersFor(filePath) {
  const rules = loadCodeowners();
  let owners = [];
  for (const { pattern, owners: o } of rules) {
    if (matchCodeownersPattern(pattern, filePath)) owners = o;
  }
  return owners;
}

/**
 * Hard floor: NO patch is applied unless every impacted file has at least
 * one CODEOWNERS-matched team AND the supplied attestation set contains at
 * least N distinct approvers from those teams. Cannot be bypassed by any
 * feature flag — `rejectIfFlagsAttempted` actively rejects bypass attempts.
 * Pure function; relies entirely on `env` for attestations.
 */
export function enforcePatchApplicationGate(cluster, env = {}) {
  const gate = POLICY.globalLimits?.patchApplicationGate;
  if (!gate) return { ok: true };

  // 1. Reject any attempt to ride a bypass flag.
  for (const flag of gate.rejectIfFlagsAttempted || []) {
    if (Array.isArray(env.bypassAttempted) && env.bypassAttempted.includes(flag)) {
      return { ok: false, reason: `bypass-flag-rejected:${flag}` };
    }
  }

  // 2. CODEOWNERS coverage — every impacted file must resolve to ≥1 owner.
  const allOwners = new Set();
  if (gate.requireCodeownersMatch) {
    const uncovered = [];
    for (const f of cluster.impactedFiles || []) {
      const owners = ownersFor(f);
      if (gate.requireCodeownersForEveryFile && owners.length === 0) uncovered.push(f);
      owners.forEach((o) => allOwners.add(o.toLowerCase()));
    }
    if (uncovered.length) return { ok: false, reason: `codeowners-uncovered:${uncovered.join(",")}` };
    if (allOwners.size === 0) return { ok: false, reason: "codeowners-no-team-matched" };
  }

  // 3. Two-person approval — distinct, fresh, and from CODEOWNERS-matched team.
  if (gate.requireTwoPersonApproval) {
    const approvals = Array.isArray(env.approvals) ? env.approvals : [];
    const now = Date.now();
    const lifetimeMs = (gate.approvalLifetimeMinutes || 60) * 60 * 1000;
    const fresh = approvals.filter(
      (a) => a?.user && a?.ts && (now - new Date(a.ts).getTime()) <= lifetimeMs,
    );
    const distinct = new Set(fresh.map((a) => String(a.user).toLowerCase()));
    if (distinct.size < (gate.minDistinctApprovers || 2)) {
      return { ok: false, reason: `insufficient-approvals:${distinct.size}/${gate.minDistinctApprovers || 2}` };
    }
    if (gate.requireCodeownersMatch) {
      const matched = fresh.filter(
        (a) => a.team && allOwners.has(String(a.team).toLowerCase()),
      );
      const distinctMatched = new Set(matched.map((a) => String(a.user).toLowerCase()));
      if (distinctMatched.size < (gate.minDistinctApprovers || 2)) {
        return {
          ok: false,
          reason: `approvers-not-from-codeowners-team:${distinctMatched.size}/${gate.minDistinctApprovers || 2}`,
        };
      }
    }
  }

  return { ok: true, matchedOwners: Array.from(allOwners) };
}

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

  // 5. HARD patch-application gate — 2-person + CODEOWNERS, NEVER bypassable
  //    by any feature flag. Applied to BOTH safe-auto and gated-pr lanes.
  const gateResult = enforcePatchApplicationGate(cluster, env);

  // 6. If the gate failed, force the cluster into GATED-PR (or ESCALATE
  //    for human-only). Surfaces the proposed patch + missing attestation
  //    to humans without ever silently applying.
  if (!gateResult.ok) {
    return {
      decision: lane === "human-only" ? "ESCALATE" : "DOWNGRADE-TO-GATED",
      lane: lane === "human-only" ? "human-only" : "gated-pr",
      requiredStages: limits.requiredStages,
      blastRadiusCap: limits.blastRadiusCap,
      autoMergeAllowed: false,
      gate: gateResult,
      reason: `patch-gate-blocked:${gateResult.reason}`,
    };
  }

  // 7. Auto-merge gate — now requires gateResult.ok IN ADDITION to the
  //    existing flag + confidence floors. SITA_SAFE_AUTOMERGE alone is
  //    no longer sufficient.
  const autoMergeAllowed =
    gateResult.ok &&
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
    gate: gateResult,
    reason: `lane:${lane}; conf:${cluster.maxConfidence.toFixed(2)}`,
  };
}

export function getPolicyVersion() { return POLICY.version; }
export function getGlobalLimits() { return POLICY.globalLimits; }