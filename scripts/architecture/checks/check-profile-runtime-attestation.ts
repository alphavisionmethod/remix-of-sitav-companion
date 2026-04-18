#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase I — Attestation Verification (block-level)
// Verifies the signed attestation matches current file state.
// Detects:
//   - Missing attestation file
//   - Invalid HMAC signature (key mismatch / tampering)
//   - File digest mismatch (manual edits to evidence/baseline)
//   - Baseline fingerprint mismatch (re-seal without re-attest)
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { join } from "node:path";

const SRC_DIR = "generated/profile-and-runtime-hardening";
const ATTESTATION_PATH = join(SRC_DIR, "attestation.signed.json");
const DEV_KEY_PATH = join(SRC_DIR, ".sita-hmac-dev.key");
const OUT = "generated";
mkdirSync(OUT, { recursive: true });

function emitFail(reason: string, details: Record<string, unknown> = {}) {
  const payload = {
    generatedAt: new Date().toISOString(),
    gate: "profile-runtime-attestation",
    level: "block",
    ok: false,
    reason,
    ...details,
  };
  writeFileSync(join(OUT, "profile-runtime-attestation.json"), JSON.stringify(payload, null, 2));
  writeFileSync(join(OUT, "profile-runtime-attestation-report.json"), JSON.stringify({
    generatedAt: payload.generatedAt,
    gate: "profile-runtime-attestation",
    level: "block",
    ok: false,
    errorCount: 1,
    warningCount: 0,
    issues: [{ severity: "error", area: "attestation", message: reason }],
  }, null, 2));
  console.log(`attestation: FAIL — ${reason}`);
  process.exit(1);
}

if (!existsSync(ATTESTATION_PATH)) {
  emitFail("no signed attestation — run sign-profile-runtime-attestation.ts");
}

const attestation = JSON.parse(readFileSync(ATTESTATION_PATH, "utf-8")) as {
  baselineFingerprint: string;
  baselineSealedAt: string;
  coveredFiles: string[];
  fileDigests: Record<string, string>;
  attestedAt: string;
  attestor: string;
  schemaVersion: number;
  signature: { algorithm: string; keyId: string; value: string; keySource: string };
};

function getKey(): string | null {
  if (process.env.SITA_HARDENING_HMAC_KEY) return process.env.SITA_HARDENING_HMAC_KEY;
  if (existsSync(DEV_KEY_PATH)) return readFileSync(DEV_KEY_PATH, "utf-8").trim();
  return null;
}

const key = getKey();
if (!key) emitFail("no HMAC key available (set SITA_HARDENING_HMAC_KEY or run sign script first)");

// Re-derive canonical payload (must match signer's canonicalization exactly).
const { signature, ...payload } = attestation;
const canonical = JSON.stringify(payload, Object.keys(payload).sort(), 0);
const expectedSig = createHmac("sha256", key as string).update(canonical).digest("hex");

const sigOk = signature.value.length === expectedSig.length &&
  timingSafeEqual(Buffer.from(signature.value, "hex"), Buffer.from(expectedSig, "hex"));

if (!sigOk) {
  emitFail("HMAC signature invalid — attestation tampered or wrong key", {
    keyIdInAttestation: signature.keyId,
    currentKeyId: createHash("sha256").update(key as string).digest("hex").slice(0, 16),
  });
}

// Verify file digests.
const digestMismatches: Array<{ file: string; expected: string; actual: string }> = [];
for (const f of attestation.coveredFiles) {
  const p = join(SRC_DIR, f);
  if (!existsSync(p)) {
    digestMismatches.push({ file: f, expected: attestation.fileDigests[f], actual: "<missing>" });
    continue;
  }
  const actual = createHash("sha256").update(readFileSync(p)).digest("hex");
  const expected = attestation.fileDigests[f];
  if (actual !== expected) digestMismatches.push({ file: f, expected, actual });
}

// Verify baseline fingerprint cross-check.
const baseline = JSON.parse(readFileSync(join(SRC_DIR, "baseline.sealed.json"), "utf-8")) as { fingerprint: string };
const baselineMatches = baseline.fingerprint === attestation.baselineFingerprint;

const ok = digestMismatches.length === 0 && baselineMatches;

const report = {
  generatedAt: new Date().toISOString(),
  gate: "profile-runtime-attestation",
  level: "block",
  ok,
  attestationAttestedAt: attestation.attestedAt,
  attestationAttestor: attestation.attestor,
  baselineFingerprint: attestation.baselineFingerprint,
  baselineMatches,
  signatureValid: true,
  signatureAlgorithm: signature.algorithm,
  signatureKeyId: signature.keyId,
  coveredFileCount: attestation.coveredFiles.length,
  digestMismatchCount: digestMismatches.length,
  digestMismatches,
  guidance: ok
    ? "attestation valid — surface untampered"
    : "TAMPERING DETECTED — manual edits to sealed files. Investigate, then re-seal + re-attest if intentional.",
};

writeFileSync(join(OUT, "profile-runtime-attestation.json"), JSON.stringify(report, null, 2));
writeFileSync(join(OUT, "profile-runtime-attestation-report.json"), JSON.stringify({
  generatedAt: report.generatedAt,
  gate: "profile-runtime-attestation",
  level: "block",
  ok,
  errorCount: ok ? 0 : (digestMismatches.length + (baselineMatches ? 0 : 1)),
  warningCount: 0,
  issues: ok ? [] : [
    ...(baselineMatches ? [] : [{ severity: "error", area: "attestation", message: "baseline fingerprint mismatch" }]),
    ...digestMismatches.map(m => ({ severity: "error", area: "attestation", message: `digest mismatch: ${m.file}` })),
  ],
}, null, 2));

console.log(`attestation: ${ok ? "OK" : "FAIL"} — sig=valid baseline=${baselineMatches ? "match" : "MISMATCH"} digests=${digestMismatches.length} mismatch(es)`);
if (!ok) for (const m of digestMismatches) console.log(`  ✗ ${m.file}`);
process.exit(ok ? 0 : 1);
