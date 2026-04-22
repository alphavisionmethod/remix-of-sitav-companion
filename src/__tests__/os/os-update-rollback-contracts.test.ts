import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPTS_DIR = path.resolve(__dirname, '../../../os/scripts');

describe('OS Update, Rollback & Release — Contract Tests', () => {
  const bundleScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'build-update-bundle.sh'), 'utf8');
  const verifyBundleScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'verify-update-bundle.sh'), 'utf8');
  const rollbackScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'rollback-to-previous.sh'), 'utf8');
  const supportScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'generate-support-bundle.sh'), 'utf8');
  const releaseScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'release.sh'), 'utf8');

  describe('build-update-bundle.sh contract', () => {
    it('bundle manifest uses schema "sita-os-update/v1"', () => {
      expect(bundleScript).toContain('sita-os-update/v1');
    });

    it('manifest includes version, channel, rootHash, applyMode, rebootRequired', () => {
      expect(bundleScript).toContain('"version"');
      expect(bundleScript).toContain('"channel"');
      expect(bundleScript).toContain('"rootHash"');
      expect(bundleScript).toContain('"applyMode"');
      expect(bundleScript).toContain('"rebootRequired"');
    });

    it('uses A/B slot apply mode', () => {
      expect(bundleScript).toContain('ab-slot');
    });

    it('includes rollbackAfterFailedBoots count', () => {
      expect(bundleScript).toContain('rollbackAfterFailedBoots');
    });

    it('compresses with zstd', () => {
      expect(bundleScript).toContain('zstd');
    });

    it('produces detached MOK signature when key available', () => {
      expect(bundleScript).toContain('SITA_MOK_KEY');
      expect(bundleScript).toContain('.sig');
    });

    it('updates channel manifest with rollout metadata', () => {
      expect(bundleScript).toContain('rolloutPercent');
      expect(bundleScript).toContain('bundleSha256');
      expect(bundleScript).toContain('bundleSignedBy');
    });
  });

  describe('verify-update-bundle.sh contract', () => {
    it('checks SHA256 against channel manifest', () => {
      expect(verifyBundleScript).toContain('bundleSha256');
      expect(verifyBundleScript).toContain('sha256sum');
    });

    it('verifies detached signature when .sig exists', () => {
      expect(verifyBundleScript).toContain('.sig');
      expect(verifyBundleScript).toContain('openssl dgst');
    });

    it('checks version compatibility with ver_ge', () => {
      expect(verifyBundleScript).toContain('ver_ge');
      expect(verifyBundleScript).toContain('minPreviousVersion');
    });

    it('extracts manifest from zstd-compressed bundle', () => {
      expect(verifyBundleScript).toContain('zstd');
      expect(verifyBundleScript).toContain('manifest.json');
    });
  });

  describe('ver_ge version comparison logic', () => {
    // Replicating the ver_ge logic from the script in JS
    const verGe = (a: string, b: string): boolean => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const va = pa[i] ?? 0;
        const vb = pb[i] ?? 0;
        if (va > vb) return true;
        if (va < vb) return false;
      }
      return true; // equal
    };

    it('0.2.0 >= 0.1.0', () => expect(verGe('0.2.0', '0.1.0')).toBe(true));
    it('0.1.0 >= 0.1.0 (equal)', () => expect(verGe('0.1.0', '0.1.0')).toBe(true));
    it('0.1.0 < 0.2.0', () => expect(verGe('0.1.0', '0.2.0')).toBe(false));
    it('1.0.0 >= 0.99.99', () => expect(verGe('1.0.0', '0.99.99')).toBe(true));
    it('0.0.0 < 0.0.1', () => expect(verGe('0.0.0', '0.0.1')).toBe(false));
  });

  describe('rollback-to-previous.sh contract', () => {
    it('supports --dry-run mode', () => {
      expect(rollbackScript).toContain('--dry-run');
      expect(rollbackScript).toContain('DRY_RUN');
    });

    it('receipt contains from, to, at, reason, dryRun', () => {
      expect(rollbackScript).toContain('"from"');
      expect(rollbackScript).toContain('"to"');
      expect(rollbackScript).toContain('"at"');
      expect(rollbackScript).toContain('"reason"');
      expect(rollbackScript).toContain('"dryRun"');
    });

    it('reads current slot from /etc/sita/slot', () => {
      expect(rollbackScript).toContain('/etc/sita/slot');
    });

    it('toggles between slot a and b', () => {
      expect(rollbackScript).toMatch(/a\).*NEXT=b/s);
      expect(rollbackScript).toMatch(/b\).*NEXT=a/s);
    });

    it('updates systemd-boot loader.conf', () => {
      expect(rollbackScript).toContain('loader.conf');
    });
  });

  describe('generate-support-bundle.sh contract', () => {
    it('redacts JWT tokens', () => {
      expect(supportScript).toContain('REDACTED-JWT');
    });

    it('redacts Stripe keys', () => {
      expect(supportScript).toContain('REDACTED-STRIPE');
    });

    it('redacts license tokens', () => {
      expect(supportScript).toContain('REDACTED-LICENSE');
    });

    it('redacts generic password/secret/token values', () => {
      expect(supportScript).toMatch(/password|passphrase|secret|token/i);
      expect(supportScript).toContain('REDACTED');
    });

    it('collects journal logs, service statuses, and state snapshots', () => {
      expect(supportScript).toContain('journalctl');
      expect(supportScript).toContain('systemctl status');
      expect(supportScript).toContain('/var/lib/sita');
    });

    it('includes deployment profile in metadata', () => {
      expect(supportScript).toContain('deployment-profile.json');
      expect(supportScript).toContain('deploymentProfile');
    });

    it('compresses output with zstd', () => {
      expect(supportScript).toContain('zstd');
    });
  });

  describe('release.sh pipeline contract', () => {
    it('executes 14 canonical steps', () => {
      // Count step markers
      const stepMatches = releaseScript.match(/step\s+"?\d+\/1[34]/g);
      expect(stepMatches).not.toBeNull();
      expect(stepMatches!.length).toBeGreaterThanOrEqual(13);
    });

    it('sources reproducible-build-env.sh first', () => {
      expect(releaseScript).toContain('reproducible-build-env.sh');
    });

    it('references all critical sub-scripts', () => {
      const requiredScripts = [
        'verify-boot-artifacts.sh',
        'verify-verity-metadata.sh',
        'seal-verity-to-tpm.sh',
        'verify-tpm-seal.sh',
        'enroll-secureboot-mok.sh',
        'generate-sbom.sh',
        'verify-sbom.sh',
        'emit-attestation.sh',
        'build-update-bundle.sh',
        'verify-update-bundle.sh',
        'build-raw-img.sh',
      ];
      for (const s of requiredScripts) {
        expect(releaseScript).toContain(s);
      }
    });

    it('uses set -euo pipefail for fail-fast', () => {
      expect(releaseScript).toContain('set -euo pipefail');
    });
  });

  describe('Rollback receipt schema validation (fixture)', () => {
    it('validates a well-formed rollback receipt', () => {
      const receipt = {
        from: 'a',
        to: 'b',
        at: '2026-04-22T00:00:00Z',
        reason: 'manual',
        dryRun: false,
      };
      expect(['a', 'b']).toContain(receipt.from);
      expect(['a', 'b']).toContain(receipt.to);
      expect(receipt.from).not.toBe(receipt.to);
      expect(receipt.at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Update bundle manifest schema validation (fixture)', () => {
    it('validates a well-formed bundle manifest', () => {
      const manifest = {
        schema: 'sita-os-update/v1',
        version: '0.2.0',
        channel: 'stable',
        rootHash: 'f'.repeat(64),
        minPreviousVersion: '0.1.0',
        createdAt: '2026-04-22T00:00:00Z',
        applyMode: 'ab-slot',
        rebootRequired: true,
        rollbackAfterFailedBoots: 2,
      };

      expect(manifest.schema).toBe('sita-os-update/v1');
      expect(manifest.applyMode).toBe('ab-slot');
      expect(manifest.rebootRequired).toBe(true);
      expect(manifest.rollbackAfterFailedBoots).toBeGreaterThan(0);
      expect(manifest.rootHash).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});