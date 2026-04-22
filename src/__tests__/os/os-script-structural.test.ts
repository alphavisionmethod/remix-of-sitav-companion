import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPTS_DIR = path.resolve(__dirname, '../../../os/scripts');

const ALL_SCRIPTS = [
  'build-raw-img.sh',
  'build-update-bundle.sh',
  'build-verity-root.sh',
  'check-update-state.sh',
  'emit-attestation.sh',
  'enroll-secureboot-mok.sh',
  'generate-sbom.sh',
  'generate-support-bundle.sh',
  'record-hardware-certification-run.sh',
  'release.sh',
  'reproducible-build-env.sh',
  'rollback-to-previous.sh',
  'run-rls-stress-probe.sh',
  'seal-verity-to-tpm.sh',
  'sign-initramfs.sh',
  'sign-kernel.sh',
  'verify-boot-artifacts.sh',
  'verify-reproducibility.sh',
  'verify-sbom.sh',
  'verify-tpm-seal.sh',
  'verify-update-bundle.sh',
  'verify-verity-metadata.sh',
];

// Scripts that produce output artifacts must use SITA_OUT_DIR
const OUTPUT_PRODUCING_SCRIPTS = ALL_SCRIPTS.filter(
  s => !['reproducible-build-env.sh', 'run-rls-stress-probe.sh', 'record-hardware-certification-run.sh'].includes(s)
);

// Scripts that need external tools should check command -v
const TOOL_DEPENDENT_SCRIPTS = [
  'build-verity-root.sh',    // veritysetup
  'sign-kernel.sh',          // sbsign
  'sign-initramfs.sh',       // openssl
  'seal-verity-to-tpm.sh',   // tpm2_createpolicy
  'verify-tpm-seal.sh',      // jq
  'enroll-secureboot-mok.sh', // openssl, sbsign, sbverify
  'verify-sbom.sh',          // node
  'build-raw-img.sh',        // sgdisk, parted, etc.
];

describe('OS Scripts — Structural Contract Tests', () => {
  describe('File existence', () => {
    it.each(ALL_SCRIPTS)('%s exists', (script) => {
      const full = path.join(SCRIPTS_DIR, script);
      expect(fs.existsSync(full), `${script} must exist`).toBe(true);
    });
  });

  describe('Bash shebang', () => {
    it.each(ALL_SCRIPTS)('%s starts with #!/usr/bin/env bash', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    });
  });

  describe('Strict mode (set -euo pipefail)', () => {
    it.each(ALL_SCRIPTS)('%s uses set -euo pipefail', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      expect(content).toContain('set -euo pipefail');
    });
  });

  describe('No hardcoded home directories', () => {
    it.each(ALL_SCRIPTS)('%s has no /home/ or /root/ hardcoded paths', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      // Filter out comments
      const lines = content.split('\n').filter(l => !l.trimStart().startsWith('#'));
      const code = lines.join('\n');
      expect(code).not.toMatch(/\/home\/[a-z]/);
      expect(code).not.toMatch(/\/root\//);
    });
  });

  describe('SITA_OUT_DIR convention', () => {
    it.each(OUTPUT_PRODUCING_SCRIPTS)('%s references SITA_OUT_DIR or OUT_DIR', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      const hasOutDir = content.includes('SITA_OUT_DIR') || content.includes('OUT_DIR');
      expect(hasOutDir, `${script} should use SITA_OUT_DIR/OUT_DIR for output`).toBe(true);
    });
  });

  describe('Tool availability checks (command -v)', () => {
    it.each(TOOL_DEPENDENT_SCRIPTS)('%s checks tool availability before use', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      expect(content).toMatch(/command -v/);
    });
  });

  describe('Script header documentation', () => {
    it.each(ALL_SCRIPTS)('%s has a descriptive header comment block', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      const lines = content.split('\n');
      // Must have at least 3 comment lines in the first 10 lines (shebang + header)
      const headerComments = lines.slice(0, 15).filter(l => l.startsWith('#'));
      expect(headerComments.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('No TODO/FIXME/HACK in production scripts', () => {
    it.each(ALL_SCRIPTS)('%s has no unresolved TODO/FIXME markers', (script) => {
      const content = fs.readFileSync(path.join(SCRIPTS_DIR, script), 'utf8');
      expect(content.toUpperCase()).not.toMatch(/\bTODO\b/);
      expect(content.toUpperCase()).not.toMatch(/\bFIXME\b/);
      expect(content.toUpperCase()).not.toMatch(/\bHACK\b/);
    });
  });
});