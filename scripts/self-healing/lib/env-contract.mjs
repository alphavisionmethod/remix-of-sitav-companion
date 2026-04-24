// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Environment Contract Validator
// Captures environment baseline for every repair run so we know
// the exact context where a repair was decided + executed.
// ═══════════════════════════════════════════════════════════════
import { execSync } from "node:child_process";
import { readFileSync, existsSync, statSync } from "node:fs";
import crypto from "node:crypto";

function safeExec(cmd) {
  try { return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { return null; }
}

function fileHash(p) {
  if (!existsSync(p)) return null;
  const buf = readFileSync(p);
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

/** Capture full environment baseline. */
export function captureEnvironment() {
  const lockfile = ["bun.lock", "package-lock.json", "pnpm-lock.yaml"].find(existsSync);
  return {
    capturedAt: new Date().toISOString(),
    nodeVersion: process.version,
    platform: `${process.platform}-${process.arch}`,
    cwd: process.cwd(),
    branch: safeExec("git rev-parse --abbrev-ref HEAD") || "unknown",
    headSha: safeExec("git rev-parse HEAD") || "unknown",
    workspaceClean: (safeExec("git status --porcelain") || "").length === 0,
    lockfile: lockfile ? { name: lockfile, hash: fileHash(lockfile) } : null,
    packageJsonHash: fileHash("package.json"),
    secretAvailability: detectSecrets(),
    externalDeps: detectExternalDeps(),
  };
}

function detectSecrets() {
  // Detect by name only — never read values.
  const names = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY",
    "LOVABLE_API_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
  return Object.fromEntries(names.map(n => [n, Boolean(process.env[n])]));
}

function detectExternalDeps() {
  return {
    supabaseReachable: null, // populated lazily
    lovableAiReachable: null,
  };
}

/** True if env baseline is acceptable to begin a repair run. */
export function isEnvironmentRepairReady(env) {
  const reasons = [];
  if (!env.workspaceClean) reasons.push("workspace-dirty");
  if (!env.lockfile) reasons.push("missing-lockfile");
  if (env.branch === "main") reasons.push("on-main-branch");
  return { ok: reasons.length === 0, reasons };
}