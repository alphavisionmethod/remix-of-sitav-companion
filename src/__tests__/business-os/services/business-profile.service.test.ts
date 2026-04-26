import { describe, it, expect, beforeEach } from "vitest";
import {
  saveBusinessProfile,
  loadBusinessProfile,
  clearBusinessProfile,
} from "@/lib/services/business-os/business-profile.service";
import { computeBusinessProfile } from "@/domains/engines/business-profile-engine";

describe("business-profile.service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("save → load round-trips the same profile", () => {
    const profile = computeBusinessProfile({});
    saveBusinessProfile(profile);
    const loaded = loadBusinessProfile();
    expect(loaded).not.toBeNull();
    expect(loaded!.primaryMode).toBe(profile.primaryMode);
  });

  it("load returns null when nothing persisted", () => {
    expect(loadBusinessProfile()).toBeNull();
  });

  it("clear removes a previously-saved profile", () => {
    saveBusinessProfile(computeBusinessProfile({}));
    expect(loadBusinessProfile()).not.toBeNull();
    clearBusinessProfile();
    expect(loadBusinessProfile()).toBeNull();
  });

  it("load survives a corrupted JSON payload (returns null)", () => {
    localStorage.setItem("sita-business-profile", "{not-json");
    expect(loadBusinessProfile()).toBeNull();
  });
});
