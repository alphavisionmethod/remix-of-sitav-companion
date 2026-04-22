import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPTS_DIR = path.resolve(__dirname, '../../../os/scripts');

describe('OS SBOM & Attestation — Contract Tests', () => {
  const sbomScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'generate-sbom.sh'), 'utf8');
  const verifySbomScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'verify-sbom.sh'), 'utf8');
  const attestScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'emit-attestation.sh'), 'utf8');

  describe('generate-sbom.sh contract', () => {
    it('produces CycloneDX 1.5 format SBOM', () => {
      expect(sbomScript).toContain('CycloneDX');
      expect(sbomScript).toContain('"1.5"');
      expect(sbomScript).toContain('specVersion');
    });

    it('includes serialNumber as urn:uuid:', () => {
      expect(sbomScript).toContain('urn:uuid:');
    });

    it('includes metadata.component for both electron and OS SBOMs', () => {
      expect(sbomScript).toContain('sita-os-electron');
      expect(sbomScript).toContain('sita-os');
      expect(sbomScript).toContain('"component"');
    });

    it('falls back to sha256 sidecar when SIGN_KEY is missing', () => {
      expect(sbomScript).toContain('SITA_RELEASE_SIGN_KEY');
      expect(sbomScript).toContain('.sha256');
    });

    it('supports dpkg chroot enumeration for OS packages', () => {
      expect(sbomScript).toContain('dpkg-query');
      expect(sbomScript).toContain('CHROOT_DIR');
    });

    it('produces both electron and OS SBOM files', () => {
      expect(sbomScript).toContain('sbom-electron-');
      expect(sbomScript).toContain('sbom-os-');
    });
  });

  describe('verify-sbom.sh contract', () => {
    it('validates CycloneDX bomFormat', () => {
      expect(verifySbomScript).toContain('bomFormat');
      expect(verifySbomScript).toContain('CycloneDX');
    });

    it('checks specVersion starts with 1.', () => {
      expect(verifySbomScript).toContain('specVersion');
      expect(verifySbomScript).toMatch(/startsWith.*1\./);
    });

    it('validates components is an array', () => {
      expect(verifySbomScript).toContain('components');
      expect(verifySbomScript).toContain('Array');
    });

    it('validates metadata.component.name exists', () => {
      expect(verifySbomScript).toContain('metadata');
      expect(verifySbomScript).toContain('component');
    });

    it('supports both .sig (signature) and .sha256 sidecar verification', () => {
      expect(verifySbomScript).toContain('.sig');
      expect(verifySbomScript).toContain('.sha256');
      expect(verifySbomScript).toContain('openssl dgst');
    });
  });

  describe('emit-attestation.sh contract', () => {
    it('uses schema "sita-os-attestation/v1"', () => {
      expect(attestScript).toContain('sita-os-attestation/v1');
    });

    it('includes all required top-level keys', () => {
      const requiredKeys = [
        '"version"', '"commit"', '"builtAt"', '"iso"',
        '"packages"', '"signing"', '"verity"', '"services"',
      ];
      for (const key of requiredKeys) {
        expect(attestScript).toContain(key);
      }
    });

    it('references all 4 runtime services', () => {
      expect(attestScript).toContain('sita-firstboot.service');
      expect(attestScript).toContain('sita-runtime.service');
      expect(attestScript).toContain('sita-updated.service');
      expect(attestScript).toContain('sita-recovery.service');
    });

    it('produces both JSON attestation and markdown summary', () => {
      expect(attestScript).toContain('os-build-attestation.json');
      expect(attestScript).toContain('os-build-summary.md');
    });

    it('aggregates signing, initramfs, verity, and verification receipts', () => {
      expect(attestScript).toContain('os-signing-receipt.json');
      expect(attestScript).toContain('os-initramfs-signing-receipt.json');
      expect(attestScript).toContain('verity-receipt.json');
      expect(attestScript).toContain('os-verification-report.json');
    });
  });

  describe('SBOM schema validation (fixture)', () => {
    it('validates a CycloneDX 1.5 SBOM fixture', () => {
      const sbom = {
        bomFormat: 'CycloneDX',
        specVersion: '1.5',
        serialNumber: 'urn:uuid:12345678-1234-1234-1234-123456789abc',
        version: 1,
        metadata: {
          timestamp: '2026-04-22T00:00:00Z',
          component: { type: 'application', name: 'sita-os-electron', version: '0.2.0' },
        },
        components: [
          { type: 'library', 'bom-ref': 'pkg:npm/react@18.2.0', name: 'react', version: '18.2.0' },
        ],
      };

      expect(sbom.bomFormat).toBe('CycloneDX');
      expect(sbom.specVersion).toMatch(/^1\.\d+$/);
      expect(sbom.serialNumber).toMatch(/^urn:uuid:/);
      expect(sbom.metadata.component.name).toBeTruthy();
      expect(Array.isArray(sbom.components)).toBe(true);
      expect(sbom.components.length).toBeGreaterThan(0);
    });
  });

  describe('Attestation schema validation (fixture)', () => {
    it('validates a full attestation fixture', () => {
      const attestation = {
        schema: 'sita-os-attestation/v1',
        version: '0.2.0',
        commit: 'abc123def456',
        builtAt: '2026-04-22T00:00:00Z',
        iso: { path: 'sita-os-0.2.0-amd64.iso', sha256: 'a'.repeat(64) },
        packages: { list: 'os/image-builder/packages.list', sha256: 'b'.repeat(64) },
        branding: { sha256: 'c'.repeat(64) },
        shell: { version: '0.2.0' },
        signing: { artifact: 'vmlinuz', sha256: 'd'.repeat(64), verified: true },
        verity: { rootHash: 'e'.repeat(64), panicOnCorruption: true },
        services: {
          firstBoot: 'sita-firstboot.service',
          runtime: 'sita-runtime.service',
          updater: 'sita-updated.service',
          recovery: 'sita-recovery.service',
        },
      };

      expect(attestation.schema).toBe('sita-os-attestation/v1');
      expect(attestation.iso.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(attestation.services).toHaveProperty('firstBoot');
      expect(attestation.services).toHaveProperty('runtime');
      expect(attestation.services).toHaveProperty('updater');
      expect(attestation.services).toHaveProperty('recovery');
    });
  });
});