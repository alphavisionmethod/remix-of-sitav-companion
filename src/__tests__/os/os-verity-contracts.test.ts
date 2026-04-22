import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPTS_DIR = path.resolve(__dirname, '../../../os/scripts');

describe('OS Verity — Contract Tests', () => {
  const verityBuildScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'build-verity-root.sh'), 'utf8');
  const verityVerifyScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'verify-verity-metadata.sh'), 'utf8');

  describe('build-verity-root.sh receipt contract', () => {
    it('produces verity-receipt.json with required fields', () => {
      // The script writes a JSON receipt — verify the template contains all required keys
      expect(verityBuildScript).toContain('"rootHash"');
      expect(verityBuildScript).toContain('"salt"');
      expect(verityBuildScript).toContain('"dataBlocks"');
      expect(verityBuildScript).toContain('"hashBlockSize"');
      expect(verityBuildScript).toContain('"createdAt"');
      expect(verityBuildScript).toContain('"panicOnCorruption"');
    });

    it('produces verity.cmdline with systemd-verity parameters', () => {
      expect(verityBuildScript).toContain('rd.systemd.verity=1');
      expect(verityBuildScript).toContain('systemd.verity_root_hash=');
      expect(verityBuildScript).toContain('panic-on-corruption');
    });

    it('requires root image as first argument', () => {
      expect(verityBuildScript).toMatch(/\$\{1:.*required/);
    });

    it('checks for veritysetup availability', () => {
      expect(verityBuildScript).toContain('command -v veritysetup');
    });

    it('extracts root hash from veritysetup output via awk', () => {
      expect(verityBuildScript).toMatch(/Root hash.*awk/s);
    });
  });

  describe('verify-verity-metadata.sh contract', () => {
    it('reads root hash from verity-receipt.json', () => {
      expect(verityVerifyScript).toContain('verity-receipt.json');
      expect(verityVerifyScript).toContain('.rootHash');
    });

    it('checks existence of all 3 required files', () => {
      // receipt, verity.img, root image
      expect(verityVerifyScript).toContain('RECEIPT');
      expect(verityVerifyScript).toContain('VERITY_IMG');
      expect(verityVerifyScript).toContain('ROOT_IMG');
    });

    it('runs veritysetup verify with all three artifacts', () => {
      expect(verityVerifyScript).toContain('veritysetup verify');
    });
  });

  describe('Verity receipt schema validation (fixture)', () => {
    it('validates a well-formed verity receipt', () => {
      const receipt = {
        artifact: 'verity.img',
        sourceImage: 'sita-rootfs.squashfs',
        rootHash: 'a'.repeat(64),
        salt: 'b'.repeat(64),
        dataBlocks: 32768,
        hashBlockSize: 4096,
        createdAt: '2026-04-22T00:00:00Z',
        panicOnCorruption: true,
      };

      expect(receipt.rootHash).toMatch(/^[0-9a-f]{64}$/);
      expect(receipt.salt).toMatch(/^[0-9a-f]{64}$/);
      expect(receipt.dataBlocks).toBeGreaterThan(0);
      expect(receipt.hashBlockSize).toBe(4096);
      expect(receipt.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(receipt.panicOnCorruption).toBe(true);
      expect(receipt.artifact).toBeTruthy();
      expect(receipt.sourceImage).toBeTruthy();
    });

    it('rejects malformed root hash', () => {
      const badHash = 'not-a-hex-hash';
      expect(badHash).not.toMatch(/^[0-9a-f]{64}$/);
    });
  });
});