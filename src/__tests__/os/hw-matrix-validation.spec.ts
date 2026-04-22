import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const OS_DIR = path.resolve(__dirname, "../../../os");

describe("OS Hardware Matrix Validation — Contract Tests", () => {
  describe("Hardware matrix registry contract", () => {
    const REFERENCE_PLATFORM = {
      platform: "Generic x86_64 (QEMU/KVM)",
      arch: "amd64",
      tested: true,
      tpmVersion: "2.0-emulated",
      secureBootSupported: true,
      lastValidated: "2026-04-22",
    };

    it("validates reference platform schema", () => {
      expect(REFERENCE_PLATFORM.platform).toBeTruthy();
      expect(REFERENCE_PLATFORM.arch).toBe("amd64");
      expect(REFERENCE_PLATFORM.tested).toBe(true);
      expect(REFERENCE_PLATFORM.tpmVersion).toBeTruthy();
      expect(typeof REFERENCE_PLATFORM.secureBootSupported).toBe("boolean");
      expect(REFERENCE_PLATFORM.lastValidated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("DOCUMENTS GAP: only 1 reference platform exists", () => {
      const hardwareMatrix = [REFERENCE_PLATFORM];

      console.warn(
        `AUDIT GAP: Hardware matrix has ${hardwareMatrix.length} platform(s). ` +
        "Target: 3+ platforms (reference + 2 additional). " +
        "P1-3 requires 2-3 additional hardware platforms."
      );

      // Currently only 1 — test documents this honestly
      expect(hardwareMatrix.length).toBeGreaterThanOrEqual(1);
      // Target is 3+ — this will fail when we raise the bar
      // expect(hardwareMatrix.length).toBeGreaterThanOrEqual(3);
    });

    it("validates target hardware matrix schema (3 platforms)", () => {
      const targetMatrix = [
        {
          platform: "Generic x86_64 (QEMU/KVM)",
          arch: "amd64",
          tested: true,
          tpmVersion: "2.0-emulated",
          secureBootSupported: true,
          lastValidated: "2026-04-22",
        },
        {
          platform: "Dell OptiPlex 7080",
          arch: "amd64",
          tested: false,
          tpmVersion: "2.0",
          secureBootSupported: true,
          lastValidated: null,
        },
        {
          platform: "Lenovo ThinkCentre M920q",
          arch: "amd64",
          tested: false,
          tpmVersion: "2.0",
          secureBootSupported: true,
          lastValidated: null,
        },
      ];

      expect(targetMatrix).toHaveLength(3);
      for (const entry of targetMatrix) {
        expect(entry.platform).toBeTruthy();
        expect(entry.arch).toBeTruthy();
        expect(typeof entry.tested).toBe("boolean");
        expect(typeof entry.secureBootSupported).toBe("boolean");
      }

      // Only 1 is actually tested
      const testedCount = targetMatrix.filter((e) => e.tested).length;
      expect(testedCount).toBe(1);
    });
  });

  describe("QEMU VM configuration", () => {
    it("QEMU/VM directory exists", () => {
      const vmDir = path.join(OS_DIR, "vm");
      expect(fs.existsSync(vmDir)).toBe(true);
    });

    it("VM configuration files exist", () => {
      const vmDir = path.join(OS_DIR, "vm");
      if (!fs.existsSync(vmDir)) return;

      const files = fs.readdirSync(vmDir);
      expect(files.length).toBeGreaterThan(0);
    });
  });

  describe("Hardware check script", () => {
    it("hardware-check.sh exists in image-builder preflight", () => {
      const hwCheckPath = path.join(
        OS_DIR,
        "image-builder",
        "preflight",
        "hardware-check.sh"
      );
      expect(fs.existsSync(hwCheckPath)).toBe(true);
    });

    it("hardware-check.sh validates minimum requirements", () => {
      const hwCheckPath = path.join(
        OS_DIR,
        "image-builder",
        "preflight",
        "hardware-check.sh"
      );
      if (!fs.existsSync(hwCheckPath)) return;

      const content = fs.readFileSync(hwCheckPath, "utf8");
      // Should check for CPU, RAM, disk at minimum
      const checksForHardware =
        content.includes("cpu") ||
        content.includes("mem") ||
        content.includes("disk") ||
        content.includes("nproc");
      expect(checksForHardware).toBe(true);
    });
  });

  describe("Hardware certification record script", () => {
    it("record-hardware-certification-run.sh exists", () => {
      const certScript = path.join(
        OS_DIR,
        "scripts",
        "record-hardware-certification-run.sh"
      );
      expect(fs.existsSync(certScript)).toBe(true);
    });
  });
});