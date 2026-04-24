// ═══════════════════════════════════════════════════════════════
// Heal strategies — pure side-effecting actions, all idempotent.
// Each returns { applied: bool, before, after, notes }.
// ═══════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function safeRm(p) {
  const abs = path.resolve(ROOT, p);
  if (!abs.startsWith(ROOT)) return false;
  if (existsSync(abs)) { rmSync(abs, { recursive: true, force: true }); return true; }
  return false;
}

export const STRATEGIES = {
  "clear-vite-cache": () => {
    const a = safeRm("node_modules/.vite");
    const b = safeRm("node_modules/.cache");
    return { applied: a || b, notes: `vite=${a} cache=${b}` };
  },
  "rerun-fresh-env": () => {
    return { applied: true, notes: "Caller must re-spawn child with clean env (PATH/HOME only)." };
  },
  "rerun-global-setup": () => {
    const a = safeRm("test-results/.auth");
    return { applied: a, notes: "Cleared Playwright auth state; global.setup will re-run." };
  },
  "update-snapshots": ({ file, allow }) => {
    if (!allow) return { applied: false, notes: "Gated by --allow-snapshot-updates." };
    try {
      execSync(`npx vitest run ${JSON.stringify(file)} -u --no-coverage`, { stdio: "pipe", timeout: 180_000 });
      return { applied: true, notes: "Snapshots updated." };
    } catch (e) {
      return { applied: false, notes: `Snapshot update failed: ${String(e?.message || e).slice(0, 200)}` };
    }
  },
  "quarantine-and-log": ({ file }) => ({ applied: true, notes: `Tagged ${file} as flaky in report; no code change.` }),
  "propose-mock-patch": ({ file }) => ({ applied: false, notes: `T3: see proposed-patches/ for ${file}.` }),
  "propose-unstub-globals": ({ file }) => ({ applied: false, notes: `T3: propose vi.unstubAllGlobals() for ${file}.` }),
  "codemod-rename": () => ({ applied: false, notes: "T4: requires SITA_HEAL_T4=1 + 2-person attestation." }),
  "surface-only": () => ({ applied: false, notes: "real-bug class — surfaced in RCA." }),
  "human-only": () => ({ applied: false, notes: "Refusal path — humans only." }),
};

export function runStrategy(action, ctx = {}) {
  const fn = STRATEGIES[action];
  if (!fn) return { applied: false, notes: `Unknown strategy: ${action}` };
  return fn(ctx);
}
