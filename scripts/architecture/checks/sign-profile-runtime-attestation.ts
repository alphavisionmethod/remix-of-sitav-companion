#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase I — Signed Attestation
// Produces an HMAC-SHA256 signed attestation over the sealed
// baseline + all 4 evidence maps. Locks the entire hardening
// surface against silent tampering (manual edits to JSON files
// without re-running seal/attest).
//
// HMAC key source (in order): SITA_HARDENING_HMAC_KEY env var,
// or auto-generated dev key persisted to .sita-hmac-dev (gitignored
// recommended for real deployments — checked in here so dev/CI run).
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { join } from "node:path";

const SRC_DIR = "generated/profile-and-runtime-hardening";
const ATTESTATION_PATH = join(SRC_DIR, "attestation.signed.json");
const DEV_KEY_PATH = join(SRC_DIR, ".sita-hmac-dev.key");

function getKey(): { key: string; source: string } {
  if (process.env.SITA_HARDENING_HMAC_KEY) return { key: process.env.SITA_HARDENING_HMAC_KEY, source: "env" };
  if (existsSync(DEV_KEY_PATH)) return { key: readFileSync(DEV_KEY_PATH, "utf-8").trim(), source: "dev-key-file" };
  const k = randomBytes(32).toString("hex");
  writeFileSync(DEV_KEY_PATH, k);
  return { key: k, source: "generated-dev-key" };
}

const COVERED_FILES = [
  "baseline.sealed.json",
  "app-registry-map.json",
  "app-route-profile-map.json",
  "mobile-capability-map.json",
  "profile-separation-map.json",
];

function sha256(buf: Buffer | string): string {
  return createHash("sha256").update(buf).digest("hex");
}

const fileDigests: Record<string, string> = {};
for (const f of COVERED_FILES) {
  const p = join(SRC_DIR, f);
  if (!existsSync(p)) {
    console.error(`✗ missing required file: ${p}`);
    process.exit(1);
  }
  fileDigests[f] = sha256(readFileSync(p));
}

const baseline = JSON.parse(readFileSync(join(SRC_DIR, "baseline.sealed.json"), "utf-8")) as { fingerprint: string; sealedAt: string };

const payload = {
  schemaVersion: 1,
  attestedAt: new Date().toISOString(),
  attestor: process.env.USER ?? "ci",
  baselineFingerprint: baseline.fingerprint,
  baselineSealedAt: baseline.sealedAt,
  coveredFiles: COVERED_FILES,
  fileDigests,
};

const { key, source: keySource } = getKey();
const canonical = JSON.stringify(payload, Object.keys(payload).sort(), 0);
const signature = createHmac("sha256", key).update(canonical).digest("hex");
const keyId = sha256(key).slice(0, 16);

mkdirSync(SRC_DIR, { recursive: true });
writeFileSync(ATTESTATION_PATH, JSON.stringify({
  ...payload,
  signature: { algorithm: "HMAC-SHA256", keyId, value: signature, keySource },
}, null, 2));

console.log(`attestation signed → ${ATTESTATION_PATH}`);
console.log(`  algorithm: HMAC-SHA256`);
console.log(`  keyId:     ${keyId}  (source: ${keySource})`);
console.log(`  baseline:  ${baseline.fingerprint.slice(0, 16)}…`);
console.log(`  files:     ${COVERED_FILES.length}`);
