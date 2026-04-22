import { describe, it, expect } from "vitest";
import { AppManifestSchema, safeValidateManifest } from "@/lib/app-platform/manifest-schema";

describe("manifest-schema", () => {
  it("accepts a valid internal manifest", () => {
    const r = safeValidateManifest({
      app_id: "sita.business", slug: "business", name: "Business OS",
      app_type: "internal", launch_strategy: "internal_route",
      launch_target: { route: "/business" },
    });
    expect(r.success).toBe(true);
  });

  it("rejects unknown app_type", () => {
    const r = safeValidateManifest({
      app_id: "xx", slug: "xx", name: "X",
      app_type: "alien" as unknown,
      launch_strategy: "internal_route",
      launch_target: {},
    });
    expect(r.success).toBe(false);
  });

  it("rejects unknown launch_strategy", () => {
    const r = safeValidateManifest({
      app_id: "xx", slug: "xx", name: "X",
      app_type: "internal", launch_strategy: "telepathy" as unknown,
      launch_target: {},
    });
    expect(r.success).toBe(false);
  });

  it("applies defaults", () => {
    const m = AppManifestSchema.parse({
      app_id: "xx", slug: "xx", name: "X",
      app_type: "web", launch_strategy: "embedded_webview",
      launch_target: { url: "https://example.com" },
    });
    expect(m.installability).toBe("installable");
    expect(m.trust_level).toBe("standard");
    expect(m.supported_surfaces).toEqual(["desktop"]);
  });
});
