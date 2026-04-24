// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Repair Strategies
// Pluggable, side-effecting, idempotent. Each returns
// { applied, modifiedFiles[], notes }.
// EVERY strategy must respect the refusal-path list.
// ═══════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { isRefusalPath } from "./policy-engine.mjs";

function refusalGuard(files) {
  const blocked = files.filter(isRefusalPath);
  if (blocked.length) {
    return { applied: false, modifiedFiles: [], notes: `REFUSED: refusal-path violation: ${blocked.join(", ")}` };
  }
  return null;
}

function safeExec(cmd, timeoutMs = 180_000) {
  try {
    const out = execSync(cmd, { stdio: "pipe", encoding: "utf8", timeout: timeoutMs });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, error: String(e.message || e).slice(0, 400) };
  }
}

export const STRATEGIES = {
  // ── stale-generated ────────────────────────────────────────
  "regenerate-manifests": ({ files }) => {
    const block = refusalGuard(files); if (block) return block;
    const r = safeExec("npm run generate:manifests", 300_000);
    return {
      applied: r.ok,
      modifiedFiles: files.filter(f => f.startsWith("generated/")),
      notes: r.ok ? "Regenerated manifests via canonical generator." : `Generator failed: ${r.error}`,
    };
  },
  "regenerate-runtime": ({ files }) => {
    const block = refusalGuard(files); if (block) return block;
    const r = safeExec("npm run generate:runtime", 300_000);
    return { applied: r.ok, modifiedFiles: files, notes: r.ok ? "ok" : r.error };
  },
  "regenerate-registry": ({ files }) => {
    const block = refusalGuard(files); if (block) return block;
    const r = safeExec("npm run generate:registry", 300_000);
    return { applied: r.ok, modifiedFiles: files, notes: r.ok ? "ok" : r.error };
  },

  // ── manifest-drift ─────────────────────────────────────────
  "regenerate-routes-inventory": ({ files }) => {
    const block = refusalGuard(files); if (block) return block;
    const r = safeExec("npm run generate:routes-inventory", 180_000);
    return { applied: r.ok, modifiedFiles: files, notes: r.ok ? "Routes inventory regenerated." : r.error };
  },

  // ── barrel-export-broken / missing-symbol / import-drift ───
  // PROPOSE-ONLY: actual symbol/path repair requires AST work in
  // a follow-up; we emit a structured patch suggestion that is
  // surfaced for review (no auto-write).
  "propose-import-patch": ({ files, cluster }) => {
    return {
      applied: false,
      modifiedFiles: [],
      proposedPatch: {
        kind: "import-patch-proposal",
        files,
        signals: cluster?.signals || [],
        note: "Surfaced for human review. Auto-rewrite of imports requires AST-aware codemod (Phase 9 evolution).",
      },
      notes: "Proposed only — no code change.",
    };
  },

  // ── demo-removal-fallout ───────────────────────────────────
  "propose-demo-replacement": ({ files }) => ({
    applied: false,
    modifiedFiles: [],
    proposedPatch: { kind: "demo-replacement-proposal", files,
      note: "Replace `MOCK_*` import with `useDataMode()` + empty array. Surfaced as draft." },
    notes: "Proposed only — gated lane requires PR review.",
  }),

  // ── dependency-drift ───────────────────────────────────────
  "regenerate-lockfile": ({ files }) => {
    const block = refusalGuard(files); if (block) return block;
    return {
      applied: false,
      modifiedFiles: [],
      notes: "Lockfile regeneration intentionally NOT auto-executed — escalated to human (dependency cascade risk).",
    };
  },

  // ── route / cta / contract / feature drift (gated) ─────────
  "propose-wiring-patch": ({ files, cluster }) => ({
    applied: false,
    modifiedFiles: [],
    proposedPatch: { kind: "wiring-patch-proposal", files, class: cluster.class },
    notes: "Gated-PR lane: proposed for review only.",
  }),

  // ── universal fallback ─────────────────────────────────────
  "human-only-surface": ({ cluster }) => ({
    applied: false,
    modifiedFiles: [],
    notes: `Class ${cluster.class} is human-only. Surfaced in dashboard for human action.`,
  }),
};

/** Pick the right strategy for a class. */
export function strategyForClass(cls) {
  switch (cls) {
    case "stale-generated": return "regenerate-manifests";
    case "manifest-drift": return "regenerate-routes-inventory";
    case "missing-symbol": return "propose-import-patch";
    case "import-drift": return "propose-import-patch";
    case "barrel-export-broken": return "propose-import-patch";
    case "demo-removal-fallout": return "propose-demo-replacement";
    case "dependency-drift": return "regenerate-lockfile";
    case "contract-drift":
    case "route-wiring-drift":
    case "cta-wiring-drift":
    case "feature-ownership-drift":
    case "service-duplication-fallout":
    case "semantic-ui-regression":
      return "propose-wiring-patch";
    default: return "human-only-surface";
  }
}

export function runStrategy(name, ctx) {
  const fn = STRATEGIES[name];
  if (!fn) return { applied: false, modifiedFiles: [], notes: `Unknown strategy: ${name}` };
  return fn(ctx);
}