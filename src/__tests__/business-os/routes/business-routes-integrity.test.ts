// ═══════════════════════════════════════════════════════════════
// Phase 4 — Business OS route integrity
//
// Verifies that every path declared in
// `src/routes/families/business-routes.tsx` is:
//   1) syntactically a unique `/business/...` path
//   2) handled by the BusinessCenter dispatcher
//      (`src/modules/business/pages/BusinessCenter.tsx`)
//
// We intentionally parse the source files (no runtime react-router
// reflection) so this test catches drift the moment a new route is
// declared but the dispatcher's `subpageFromPath` is not updated.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const BUSINESS_ROUTES = resolve(
  process.cwd(),
  "src/routes/families/business-routes.tsx",
);
const BUSINESS_CENTER = resolve(
  process.cwd(),
  "src/modules/business/pages/BusinessCenter.tsx",
);

function readPaths(): string[] {
  const src = readFileSync(BUSINESS_ROUTES, "utf8");
  // Match path="…/business/…" — anchor on /business so we never grab a child route.
  const matches = [...src.matchAll(/path="(\/business[^"]*)"/g)];
  return matches.map((m) => m[1]);
}

function readDispatcher(): string {
  return readFileSync(BUSINESS_CENTER, "utf8");
}

describe("business routes — integrity", () => {
  const paths = readPaths();
  const dispatcher = readDispatcher();

  it("declares at least the canonical Business OS surface (>= 40 routes)", () => {
    // We have 49 routes today — set a hard floor that signals truncation
    // rather than asserting an exact number that would churn on every add.
    expect(paths.length).toBeGreaterThanOrEqual(40);
  });

  it("every declared path starts with /business", () => {
    for (const p of paths) {
      expect(p.startsWith("/business"), `bad route: ${p}`).toBe(true);
    }
  });

  it("contains no duplicate route paths", () => {
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const p of paths) {
      if (seen.has(p)) dups.push(p);
      seen.add(p);
    }
    expect(dups, `duplicate routes: ${dups.join(", ")}`).toEqual([]);
  });

  it("BusinessCenter dispatcher handles every static /business sub-segment", () => {
    // For each declared path, derive the last static segment after `/business/`
    // (skipping `:id` placeholders and the bare `/business` root) and require
    // the dispatcher source to mention it via a `path.includes("/<seg>")` clause
    // OR have an explicit fallback. The dispatcher is allowed to map siblings
    // to the same module (e.g. /revenue → revenue-home) so we accept either
    // the segment itself or the canonical alias the dispatcher produces.
    const segments = new Set<string>();
    for (const p of paths) {
      if (p === "/business") continue;
      const tail = p.replace(/^\/business\//, "");
      const firstStatic = tail.split("/")[0];
      if (!firstStatic || firstStatic.startsWith(":")) continue;
      segments.add(firstStatic);
    }

    const KNOWN_ALIAS_FALLBACKS = new Set<string>([
      // /business/revenue is intentionally re-routed to revenue-home by the dispatcher.
      "revenue",
      // Fallback module — handled implicitly by the trailing `return "crm-home"`.
      "overview",
      // Settings + files have their own dedicated module surfaces below.
      "settings",
      "files",
    ]);

    const unhandled: string[] = [];
    for (const seg of segments) {
      const referenced =
        dispatcher.includes(`"/${seg}"`) ||
        dispatcher.includes(`return "${seg}"`) ||
        KNOWN_ALIAS_FALLBACKS.has(seg);
      if (!referenced) unhandled.push(seg);
    }
    expect(
      unhandled,
      `Dispatcher missing handler for: ${unhandled.join(", ")}`,
    ).toEqual([]);
  });

  it("dispatcher returns a fallback string (never undefined)", () => {
    // The fallback `return "crm-home"` is what guarantees no /business/* path
    // can ever crash the windowed shell. Removing it would silently break dozens
    // of routes — the test fails loudly instead.
    expect(dispatcher).toMatch(/return "crm-home"/);
  });

  it("dispatcher dispatches via the global sita-open-business event", () => {
    expect(dispatcher).toContain("sita-open-business");
    expect(dispatcher).toContain('navigate("/desktop"');
  });
});