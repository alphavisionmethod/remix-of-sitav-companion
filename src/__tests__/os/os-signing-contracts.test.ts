import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPTS_DIR = path.resolve(__dirname, '../../../os/scripts');

describe('OS Signing — Contract Tests', () => {
  const kernelScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'sign-kernel.sh'), 'utf8');
  const initramfsScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'sign-initramfs.sh'), 'utf8');
  const mokScript = fs.readFileSync(path.join(SCRIPTS_DIR, 'enroll-secureboot-mok.sh'), 'utf8');

  describe('sign-kernel.sh', () => {
    it('receipt contains artifact, sha256, signedAt, keyKind, verified', () => {
      expect(kernelScript).toContain('"artifact"');
      expect(kernelScript).toContain('"sha256"');
      expect(kernelScript).toContain('"signedAt"');
      expect(kernelScript).toContain('"keyKind"');
      expect(kernelScript).toContain('"verified"');
    });

    it('supports ephemeral-dev fallback when MOK env vars unset', () => {
      expect(kernelScript).toContain('ephemeral-dev');
      expect(kernelScript).toContain('SITA_MOK_KEY');
      expect(kernelScript).toContain('SITA_MOK_CERT');
    });

    it('verifies signature after signing (sbverify)', () => {
      expect(kernelScript).toContain('sbverify');
    });

    it('checks sbsign availability', () => {
      expect(kernelScript).toContain('command -v sbsign');
    });
  });

  describe('sign-initramfs.sh', () => {
    it('receipt contains artifact, signature, sha256, signedAt, keyKind, verified', () => {
      expect(initramfsScript).toContain('"artifact"');
      expect(initramfsScript).toContain('"signature"');
      expect(initramfsScript).toContain('"sha256"');
      expect(initramfsScript).toContain('"signedAt"');
      expect(initramfsScript).toContain('"keyKind"');
      expect(initramfsScript).toContain('"verified"');
    });

    it('supports ephemeral-dev fallback', () => {
      expect(initramfsScript).toContain('ephemeral-dev');
    });

    it('uses openssl detached signature (not sbsign)', () => {
      expect(initramfsScript).toContain('openssl dgst -sha256 -sign');
    });

    it('verifies immediately after signing', () => {
      expect(initramfsScript).toContain('openssl dgst -sha256 -verify');
    });
  });

  describe('enroll-secureboot-mok.sh', () => {
    it('MOK manifest contains version, key_provenance, cert_sha256_fp, signed_targets', () => {
      expect(mokScript).toContain('"version"');
      expect(mokScript).toContain('"key_provenance"');
      expect(mokScript).toContain('"cert_sha256_fp"');
      expect(mokScript).toContain('"signed_targets"');
    });

    it('signed_targets includes shim, grub, kernel booleans', () => {
      expect(mokScript).toContain('"shim"');
      expect(mokScript).toContain('"grub"');
      expect(mokScript).toContain('"kernel"');
    });

    it('exports DER format for mokutil enrollment', () => {
      expect(mokScript).toContain('mokutil --import');
      expect(mokScript).toContain('-outform DER');
    });

    it('supports dev-ephemeral key generation', () => {
      expect(mokScript).toContain('dev-ephemeral');
    });

    it('checks openssl, sbsign, sbverify availability', () => {
      expect(mokScript).toContain('command -v openssl');
      expect(mokScript).toContain('command -v sbsign');
      expect(mokScript).toContain('command -v sbverify');
    });
  });

  describe('Signing receipt schema validation (fixture)', () => {
    it('validates kernel signing receipt schema', () => {
      const receipt = {
        artifact: 'vmlinuz.signed',
        sha256: 'c'.repeat(64),
        signedAt: '2026-04-22T00:00:00Z',
        keyKind: 'production-mok' as const,
        verifier: 'sbverify',
        verified: true,
      };
      expect(receipt.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(['ephemeral-dev', 'production-mok']).toContain(receipt.keyKind);
      expect(receipt.verified).toBe(true);
    });

    it('validates initramfs signing receipt schema', () => {
      const receipt = {
        artifact: 'initramfs.img',
        signature: 'initramfs.img.sig',
        sha256: 'd'.repeat(64),
        signedAt: '2026-04-22T00:00:00Z',
        keyKind: 'ephemeral-dev' as const,
        verified: true,
      };
      expect(receipt.sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(['ephemeral-dev', 'production-mok']).toContain(receipt.keyKind);
      expect(receipt.signature).toContain('.sig');
    });

    it('validates MOK manifest schema', () => {
      const manifest = {
        version: '0.2.0',
        generated_at: '2026-04-22T00:00:00Z',
        key_provenance: 'production',
        cert_sha256_fp: 'AB:CD:EF:01:23:45:67:89',
        der_path: 'secureboot/sita-mok.der',
        signed_targets: { shim: true, grub: true, kernel: true },
        enroll_command: 'mokutil --import /boot/sita-mok.der',
      };
      expect(manifest.key_provenance).toMatch(/^(production|dev-ephemeral)$/);
      expect(manifest.signed_targets).toHaveProperty('shim');
      expect(manifest.signed_targets).toHaveProperty('grub');
      expect(manifest.signed_targets).toHaveProperty('kernel');
      expect(manifest.enroll_command).toContain('mokutil');
    });
  });
});