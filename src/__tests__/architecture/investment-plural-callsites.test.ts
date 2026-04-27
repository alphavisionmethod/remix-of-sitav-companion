// Phase 8 — Investment route consolidation
// Asserts no production code navigates to the legacy plural
// `/investments/*` namespace. Only the redirect map and architecture
// registries may reference it (so /investments → /investment is preserved).

import { describe, it, expect } from "vitest";
import { execSync } from "node:child_process";

const ALLOW_LIST = [
  "src/routes/redirects/user-redirect-map.ts",
  "src/runtimes/reality/reality-audit-registry.ts",
  "src/__tests__/",
  "src/test/",
  "src/website-demo/",
];

describe("Phase 8 — investment route consolidation", () => {
  it("no production component navigates to /investments/*", () => {
    let out = "";
    try {
      out = execSync(
        `rg -nP "[\\x22\\x27\\x60]/investments/" src/ || true`,
        { encoding: "utf8" },
      );
    } catch {
      out = "";
    }
    const offending = out
      .split("\n")
      .filter(Boolean)
      .filter((line) => !ALLOW_LIST.some((a) => line.includes(a)));
    if (offending.length > 0) {
      // eslint-disable-next-line no-console
      console.error("Forbidden /investments/* call sites:\n" + offending.join("\n"));
    }
    expect(offending).toEqual([]);
  });
});
