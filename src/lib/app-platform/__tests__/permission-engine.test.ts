// Tests for permission engine
import { describe, it, expect } from "vitest";
import { permissionEngine } from "@/lib/app-platform/permission-engine";

describe("permission engine", () => {
  it("rejects permissions not declared in manifest", () => {
    const r = permissionEngine.decide({
      permission: "files.write",
      manifestRequested: ["network"],
      userGrants: [],
    });
    expect(r.granted).toBe(false);
    expect(r.source).toBe("missing");
  });

  it("auto-grants low-risk if declared", () => {
    const r = permissionEngine.decide({
      permission: "network",
      manifestRequested: ["network"],
      userGrants: [],
    });
    expect(r.granted).toBe(true);
    expect(r.source).toBe("default");
  });

  it("requires explicit grant for high-risk", () => {
    const r = permissionEngine.decide({
      permission: "files.write",
      manifestRequested: ["files.write"],
      userGrants: [],
    });
    expect(r.granted).toBe(false);
    expect(r.source).toBe("denied");
  });

  it("respects user explicit grant", () => {
    const r = permissionEngine.decide({
      permission: "files.write",
      manifestRequested: ["files.write"],
      userGrants: [{ app_id: "x", permission_key: "files.write", granted: true }],
    });
    expect(r.granted).toBe(true);
    expect(r.source).toBe("user");
  });

  it("respects user explicit denial even for low-risk", () => {
    const r = permissionEngine.decide({
      permission: "network",
      manifestRequested: ["network"],
      userGrants: [{ app_id: "x", permission_key: "network", granted: false }],
    });
    expect(r.granted).toBe(false);
    expect(r.source).toBe("user");
  });

  it("isHighRisk identifies sensitive perms", () => {
    expect(permissionEngine.isHighRisk("files.write")).toBe(true);
    expect(permissionEngine.isHighRisk("shell.window")).toBe(true);
    expect(permissionEngine.isHighRisk("network")).toBe(false);
  });
});
