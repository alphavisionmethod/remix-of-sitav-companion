import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// ═══════════════════════════════════════════════════════════════
// Shell, Window & App System — Structural Verification
// ═══════════════════════════════════════════════════════════════

const SHELL_DIR = "src/components/sita/shell";
const WINDOWS_DIR = path.join(SHELL_DIR, "windows");

function listTsx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith(".tsx"));
}

describe("Shell Architecture", () => {
  const shellFiles = listTsx(SHELL_DIR);

  it("shell has 10+ core components", () => {
    expect(shellFiles.length).toBeGreaterThanOrEqual(10);
  });

  it("AppLauncher, AppSwitcher, AppToolbar all exist", () => {
    for (const name of ["AppLauncherPanel", "AppSwitcher", "AppToolbar"]) {
      expect(shellFiles.some(f => f.includes(name))).toBe(true);
    }
  });

  it("permission gate exists for app access control", () => {
    expect(shellFiles.some(f => f.includes("PermissionGate"))).toBe(true);
  });
});

describe("Window System", () => {
  const windowFiles = listTsx(WINDOWS_DIR);

  it("has 10+ windowed applications", () => {
    expect(windowFiles.length).toBeGreaterThanOrEqual(10);
  });

  it("each window component has a default export", () => {
    const missing: string[] = [];
    for (const f of windowFiles) {
      const content = fs.readFileSync(path.join(WINDOWS_DIR, f), "utf8");
      if (!content.includes("export default") && !content.includes("export {")) {
        missing.push(f);
      }
    }
    expect(missing, `Windows missing exports: ${missing.join(", ")}`).toEqual([]);
  });

  it("no window uses localStorage for auth", () => {
    for (const f of windowFiles) {
      const content = fs.readFileSync(path.join(WINDOWS_DIR, f), "utf8");
      expect(content).not.toMatch(/localStorage\.(get|set)Item\(["']auth/);
    }
  });
});

describe("Mobile Pages", () => {
  const mobileDir = "src/pages/mobile";
  const mobileFiles = listTsx(mobileDir);

  it("has 20+ mobile pages", () => {
    expect(mobileFiles.length).toBeGreaterThanOrEqual(20);
  });

  it("all mobile pages use MobileShell wrapper", () => {
    const missing: string[] = [];
    for (const f of mobileFiles) {
      const content = fs.readFileSync(path.join(mobileDir, f), "utf8");
      if (!content.includes("MobileShell")) {
        missing.push(f);
      }
    }
    expect(missing, `Pages not using MobileShell: ${missing.join(", ")}`).toEqual([]);
  });
});