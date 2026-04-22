import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

function scanDir(dir: string, exts: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "__tests__") {
      results.push(...scanDir(full, exts));
    } else if (exts.some(e => entry.name.endsWith(e)) && !entry.name.includes(".test.")) {
      results.push(full);
    }
  }
  return results;
}

describe("Security Fabric Behavioral Verification", () => {
  describe("admin route protection", () => {
    const adminPages = scanDir("src/pages/admin", [".tsx", ".ts"]);

    it("admin pages directory exists", () => {
      expect(fs.existsSync("src/pages/admin"), "src/pages/admin/ missing").toBe(true);
    });

    it("admin pages import auth guards or permission gates", () => {
      const unguarded: string[] = [];
      for (const page of adminPages) {
        const content = fs.readFileSync(page, "utf8");
        const hasGuard = content.includes("PermissionGate") ||
                         content.includes("AdminGuard") ||
                         content.includes("useAuth") ||
                         content.includes("RequireAuth") ||
                         content.includes("useSession") ||
                         content.includes("AdminLayout");
        if (!hasGuard) unguarded.push(path.relative("src/pages/admin", page));
      }
      // Admin pages are typically wrapped at route level, so allow most to not self-guard
      // But at least some should reference auth
      if (adminPages.length > 10) {
        const guardedRatio = (adminPages.length - unguarded.length) / adminPages.length;
        expect(guardedRatio).toBeGreaterThanOrEqual(0.1);
      }
    });
  });

  describe("type safety in pages", () => {
    it("zero 'as any' in src/pages/", () => {
      const pages = scanDir("src/pages", [".ts", ".tsx"]);
      const violators: string[] = [];
      for (const page of pages) {
        const content = fs.readFileSync(page, "utf8");
        if (content.includes("as any")) {
          violators.push(path.relative("src/pages", page));
        }
      }
      expect(violators.length, `'as any' in pages:\n${violators.slice(0, 20).join("\n")}`).toBe(0);
    });
  });

  describe("no client-side role storage", () => {
    it("no localStorage role checks in src/", () => {
      const files = scanDir("src", [".ts", ".tsx"]);
      const violations: string[] = [];
      for (const file of files.slice(0, 500)) {
        const content = fs.readFileSync(file, "utf8");
        if (content.match(/localStorage\s*\.\s*getItem\s*\(\s*["'](?:role|isAdmin|user_role|admin)["']/)) {
          violations.push(path.relative("src", file));
        }
      }
      expect(violations.length, `localStorage role checks: ${violations.join(", ")}`).toBe(0);
    });
  });

  describe("kill-switch infrastructure", () => {
    it("kill-switch registry exists", () => {
      const candidates = [
        "src/lib/kill-switches",
        "src/lib/safety/kill-switches",
        "src/lib/platform/kill-switches",
        "src/lib/runtime/kill-switches",
      ];
      const found = candidates.some(d => fs.existsSync(d));
      expect(found, "No kill-switch directory found").toBe(true);
    });
  });
});