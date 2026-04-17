// Tests for package validator
import { describe, it, expect } from "vitest";
import { validatePackage } from "@/lib/app-platform/package-validator";

const valid = {
  app_id: "com.example.test",
  name: "Test",
  version: "1.0.0",
  publisher: "Example Inc",
  runtime: "sita-web-runtime",
  icons: { "128": "icons/128.png" },
  surfaces: ["desktop"],
  permissions: ["network"],
};

describe("package validator", () => {
  it("accepts a valid manifest", async () => {
    const r = await validatePackage(valid);
    expect(r.ok).toBe(true);
    expect(r.issues).toEqual([]);
  });

  it("rejects invalid app_id", async () => {
    const r = await validatePackage({ ...valid, app_id: "INVALID UPPER" });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.field === "app_id")).toBe(true);
  });

  it("rejects bad semver", async () => {
    const r = await validatePackage({ ...valid, version: "v1" });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.field === "version")).toBe(true);
  });

  it("rejects pwa-link with files.write permission", async () => {
    const r = await validatePackage({ ...valid, runtime: "pwa-link", permissions: ["files.write"] });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "permission_not_supported")).toBe(true);
  });

  it("rejects native-link without desktop surface", async () => {
    const r = await validatePackage({ ...valid, runtime: "native-link", surfaces: ["mobile"] });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "incompatible_runtime")).toBe(true);
  });

  it("rejects missing icons", async () => {
    const r = await validatePackage({ ...valid, icons: {} });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "no_icons")).toBe(true);
  });

  it("rejects platform too old", async () => {
    const r = await validatePackage({ ...valid, min_platform_version: "99.0.0" });
    expect(r.ok).toBe(false);
    expect(r.issues.some((i) => i.code === "platform_too_old")).toBe(true);
  });
});
