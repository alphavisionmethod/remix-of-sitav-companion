// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Repair Context (snapshots + UUID + reversibility)
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { captureEnvironment } from "./env-contract.mjs";

export function newRepairId() {
  return "rep_" + crypto.randomBytes(8).toString("hex");
}

export function snapshotFile(filePath) {
  if (!existsSync(filePath)) return { path: filePath, exists: false, content: null, hash: null };
  const content = readFileSync(filePath, "utf8");
  return {
    path: filePath,
    exists: true,
    content,
    hash: crypto.createHash("sha256").update(content).digest("hex").slice(0, 16),
    size: content.length,
    capturedAt: new Date().toISOString(),
  };
}

export function restoreSnapshot(snap) {
  if (!snap.exists) {
    // File didn't exist before — would need to delete; skip for safety.
    return { restored: false, reason: "snapshot-marked-nonexistent" };
  }
  mkdirSync(path.dirname(snap.path), { recursive: true });
  writeFileSync(snap.path, snap.content);
  return { restored: true };
}

export function createRepairContext({ cluster, decision, files }) {
  const repairId = newRepairId();
  const env = captureEnvironment();
  return {
    repairId,
    createdAt: new Date().toISOString(),
    cluster: { class: cluster.class, anchor: cluster.anchor, severity: cluster.severity },
    decision,
    environment: env,
    snapshotsBefore: files.map(snapshotFile),
    snapshotsAfter: null,
    strategyExecuted: null,
    outcome: null,
  };
}

export function persistRepairContext(ctx, suffix = "") {
  const dir = path.resolve("generated/self-healing");
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `repair-${ctx.repairId}${suffix}.json`);
  writeFileSync(file, JSON.stringify(ctx, null, 2));
  return file;
}