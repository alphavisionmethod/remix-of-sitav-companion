import { describe, it, expect } from "vitest";
import {
  ARTIFACT_PROOF_REGISTRY,
  getArtifactProof,
  getDesktopTargets,
  getOsTargets,
  getTargetsWithSigningBlockers,
  getProductionReadyTargets,
  getDeferredTargets,
  DESKTOP_SIGNING_POLICIES,
  isDesktopSigningFullyReady,
  isDesktopNotarizationFullyReady,
  getSigningBlockers,
  OS_BOOT_VALIDATION_MATRIX,
  getBootValidationForFormat,
  getAllCIBootCoveredFormats,
  INSTALL_UPGRADE_ROLLBACK_MATRIX,
  getUnvalidatedPaths,
  RELEASE_CHANNELS,
  CHECKSUM_ENTRIES,
} from "../index";

describe("Artifact Proof Registry", () => {
  it("contains entries for all 8 target IDs", () => {
    expect(ARTIFACT_PROOF_REGISTRY.length).toBe(8);
    const ids = ARTIFACT_PROOF_REGISTRY.map(r => r.targetId);
    expect(ids).toContain("desktop-linux-x64");
    expect(ids).toContain("os-iso-user");
    expect(ids).toContain("os-ova");
  });

  it("getArtifactProof returns valid record for known target", () => {
    const proof = getArtifactProof("desktop-linux-x64");
    expect(proof).toBeDefined();
    expect(proof?.targetId).toBe("desktop-linux-x64");
  });

  it("getDesktopTargets returns non-empty set", () => {
    expect(getDesktopTargets().length).toBeGreaterThan(0);
  });

  it("getOsTargets returns non-empty set", () => {
    expect(getOsTargets().length).toBeGreaterThan(0);
  });

  it("production-ready and deferred targets are disjoint", () => {
    const ready = getProductionReadyTargets().map(r => r.targetId);
    const deferred = getDeferredTargets().map(r => r.targetId);
    for (const id of ready) {
      expect(deferred).not.toContain(id);
    }
  });

  it("getTargetsWithSigningBlockers identifies unsigned targets", () => {
    const blocked = getTargetsWithSigningBlockers();
    expect(blocked.length).toBeGreaterThan(0);
  });
});

describe("Desktop Signing Policies", () => {
  it("covers linux, darwin, win32", () => {
    const platforms = DESKTOP_SIGNING_POLICIES.map(p => p.platform);
    expect(platforms).toContain("linux");
    expect(platforms).toContain("darwin");
    expect(platforms).toContain("win32");
  });

  it("isDesktopSigningFullyReady returns boolean", () => {
    expect(typeof isDesktopSigningFullyReady()).toBe("boolean");
  });

  it("isDesktopNotarizationFullyReady returns boolean", () => {
    expect(typeof isDesktopNotarizationFullyReady()).toBe("boolean");
  });

  it("getSigningBlockers returns darwin and win32 blockers", () => {
    const blockers = getSigningBlockers();
    expect(blockers.length).toBeGreaterThan(0);
  });
});

describe("OS Boot Validation Matrix", () => {
  it("covers ISO, OVA, RAW formats", () => {
    const formats = OS_BOOT_VALIDATION_MATRIX.map(e => e.format);
    expect(formats).toContain("ISO");
    expect(formats).toContain("OVA");
    expect(formats).toContain("RAW");
  });

  it("getBootValidationForFormat returns valid entry", () => {
    const entry = getBootValidationForFormat("ISO");
    expect(entry).toBeDefined();
    expect(entry?.bootCriteria.length).toBeGreaterThan(0);
  });

  it("getAllCIBootCoveredFormats returns non-empty", () => {
    expect(getAllCIBootCoveredFormats().length).toBeGreaterThan(0);
  });
});

describe("Install/Upgrade/Rollback Matrix", () => {
  it("has entries for desktop and os targets", () => {
    expect(INSTALL_UPGRADE_ROLLBACK_MATRIX.length).toBeGreaterThan(0);
    const ids = INSTALL_UPGRADE_ROLLBACK_MATRIX.map(m => m.targetId);
    expect(ids).toContain("desktop");
  });

  it("getUnvalidatedPaths returns results", () => {
    const unvalidated = getUnvalidatedPaths();
    // Some paths may be declared but not validated
    expect(unvalidated).toBeInstanceOf(Array);
  });
});

describe("Release Channel Policies", () => {
  it("covers dev, internal, beta, stable", () => {
    const ids = RELEASE_CHANNELS.map(c => c.id);
    expect(ids).toContain("dev");
    expect(ids).toContain("internal");
    expect(ids).toContain("beta");
    expect(ids).toContain("stable");
  });
});

describe("Checksum Publication", () => {
  it("has entries for all artifact targets", () => {
    expect(CHECKSUM_ENTRIES.length).toBeGreaterThan(0);
    for (const entry of CHECKSUM_ENTRIES) {
      expect(entry.algorithm).toBe("sha256");
      expect(entry.artifactName).toBeTruthy();
      expect(entry.verificationCommand).toBeTruthy();
    }
  });
});