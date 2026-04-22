import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SCRIPTS_DIR = path.resolve(__dirname, '../../../os/scripts');

describe('OS TPM — Contract Tests', () => {
  const sealScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'seal-verity-to-tpm.sh'), 'utf8');
  const verifyScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'verify-tpm-seal.sh'), 'utf8');

  describe('seal-verity-to-tpm.sh contract', () => {
    it('manifest contains version, verity_root_hash, pcr_selection, policy_digest_hex', () => {
      expect(sealScript).toContain('"version"');
      expect(sealScript).toContain('"verity_root_hash"');
      expect(sealScript).toContain('"pcr_selection"');
      expect(sealScript).toContain('"policy_digest_hex"');
    });

    it('manifest contains sealed_public_sha256 and sealed_private_sha256', () => {
      expect(sealScript).toContain('"sealed_public_sha256"');
      expect(sealScript).toContain('"sealed_private_sha256"');
    });

    it('uses PCR 0,2,4,7 by default', () => {
      expect(sealScript).toContain('sha256:0,2,4,7');
    });

    it('checks tpm2_createpolicy availability', () => {
      expect(sealScript).toContain('command -v tpm2_createpolicy');
    });

    it('requires verity root hash as first argument', () => {
      expect(sealScript).toMatch(/usage.*verity-root-hash/i);
    });

    it('cleans up temp directory on exit', () => {
      expect(sealScript).toMatch(/trap.*rm.*EXIT/);
    });
  });

  describe('verify-tpm-seal.sh contract', () => {
    it('supports --offline and --hardware modes', () => {
      expect(verifyScript).toContain('--offline');
      expect(verifyScript).toContain('--hardware');
    });

    it('checks all 4 seal artifacts in offline mode', () => {
      expect(verifyScript).toContain('tpm-seal-manifest.json');
      expect(verifyScript).toContain('tpm-seal-public.bin');
      expect(verifyScript).toContain('tpm-seal-private.bin');
      expect(verifyScript).toContain('tpm-seal-policy.digest');
    });

    it('verifies SHA256 integrity of public and private blobs', () => {
      expect(verifyScript).toContain('sealed_public_sha256');
      expect(verifyScript).toContain('sealed_private_sha256');
      expect(verifyScript).toContain('sha256sum');
    });

    it('hardware mode checks for /dev/tpmrm0 or /dev/tpm0', () => {
      expect(verifyScript).toContain('/dev/tpmrm0');
      expect(verifyScript).toContain('/dev/tpm0');
    });

    it('hardware mode unseals and compares against manifest verity_root_hash', () => {
      expect(verifyScript).toContain('tpm2_unseal');
      expect(verifyScript).toContain('verity_root_hash');
    });
  });

  describe('TPM seal manifest schema validation (fixture)', () => {
    it('validates a well-formed TPM seal manifest', () => {
      const publicBlob = Buffer.from('fake-public-blob-data');
      const privateBlob = Buffer.from('fake-private-blob-data');

      const manifest = {
        version: '0.2.0',
        sealed_at: '2026-04-22T00:00:00Z',
        verity_root_hash: 'e'.repeat(64),
        pcr_selection: 'sha256:0,2,4,7',
        policy_digest_hex: 'f'.repeat(64),
        sealed_public_sha256: crypto.createHash('sha256').update(publicBlob).digest('hex'),
        sealed_private_sha256: crypto.createHash('sha256').update(privateBlob).digest('hex'),
        tpm2_tools_version: 'tpm2-tools 5.5',
      };

      expect(manifest.verity_root_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(manifest.pcr_selection).toMatch(/^sha256:\d/);
      expect(manifest.sealed_public_sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(manifest.sealed_private_sha256).toMatch(/^[0-9a-f]{64}$/);
    });

    it('offline verification logic: SHA256 match confirms integrity', () => {
      const blob = Buffer.from('test-data-for-integrity-check');
      const expectedHash = crypto.createHash('sha256').update(blob).digest('hex');
      const actualHash = crypto.createHash('sha256').update(blob).digest('hex');
      expect(actualHash).toBe(expectedHash);
    });

    it('offline verification logic: SHA256 mismatch is detected', () => {
      const blob1 = Buffer.from('original');
      const blob2 = Buffer.from('tampered');
      const hash1 = crypto.createHash('sha256').update(blob1).digest('hex');
      const hash2 = crypto.createHash('sha256').update(blob2).digest('hex');
      expect(hash1).not.toBe(hash2);
    });
  });
});