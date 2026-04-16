// ═══════════════════════════════════════════════════════════════
// SITA OS — ASAR Integrity Verification
// Defense Layer 3: Detects binary tampering via SHA-256 hashing
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Build-time hash is embedded here during CI/CD packaging step.
// Replace this placeholder with the actual hash after `electron-forge make`.
const EXPECTED_ASAR_HASH = process.env.SITA_ASAR_HASH || 'BUILD_TIME_HASH_PLACEHOLDER';

/**
 * Compute SHA-256 hash of the ASAR archive.
 * Returns null if ASAR is not found (dev mode).
 */
function computeAsarHash() {
  try {
    const asarPath = path.join(__dirname, '..', 'app.asar');
    if (!fs.existsSync(asarPath)) {
      // Not packaged as ASAR (dev mode) — skip check
      return null;
    }
    const data = fs.readFileSync(asarPath);
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch {
    return null;
  }
}

/**
 * Verify ASAR integrity. Returns an object with:
 * - `passed`: boolean
 * - `reason`: string
 * - `hash`: computed hash (if available)
 */
function verifyIntegrity() {
  const hash = computeAsarHash();

  // Dev mode — no ASAR, skip
  if (hash === null) {
    return { passed: true, reason: 'dev_mode', hash: null };
  }

  // Build hash not embedded yet
  if (EXPECTED_ASAR_HASH === 'BUILD_TIME_HASH_PLACEHOLDER') {
    console.warn('[integrity-check] No build-time hash embedded — skipping verification');
    return { passed: true, reason: 'no_expected_hash', hash };
  }

  if (hash === EXPECTED_ASAR_HASH) {
    return { passed: true, reason: 'hash_match', hash };
  }

  // TAMPER DETECTED
  console.error('[integrity-check] ⚠️ ASAR HASH MISMATCH — possible tampering detected!');
  console.error(`  Expected: ${EXPECTED_ASAR_HASH}`);
  console.error(`  Got:      ${hash}`);

  return { passed: false, reason: 'hash_mismatch', hash };
}

/**
 * Check code signing (platform-specific, best-effort)
 */
function verifyCodeSigning() {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      const { execSync } = require('child_process');
      const appPath = path.join(__dirname, '..');
      const result = execSync(`codesign --verify --deep --strict "${appPath}" 2>&1`, { encoding: 'utf-8' });
      return { signed: true, detail: result.trim() || 'valid' };
    }

    if (platform === 'win32') {
      const { execSync } = require('child_process');
      const exePath = process.execPath;
      const result = execSync(`powershell -Command "Get-AuthenticodeSignature '${exePath}' | Select-Object -ExpandProperty Status"`, { encoding: 'utf-8' }).trim();
      return { signed: result === 'Valid', detail: result };
    }
  } catch (err) {
    return { signed: false, detail: err.message };
  }

  // Linux — no standard code signing
  return { signed: false, detail: 'not_applicable' };
}

/**
 * Full integrity check — ASAR hash + code signing
 */
function runFullIntegrityCheck() {
  const asarResult = verifyIntegrity();
  const signingResult = verifyCodeSigning();

  return {
    asar: asarResult,
    signing: signingResult,
    overall_passed: asarResult.passed, // ASAR is the hard gate
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  computeAsarHash,
  verifyIntegrity,
  verifyCodeSigning,
  runFullIntegrityCheck,
};
