// ═══════════════════════════════════════════════════════════════
// SITA OS — Jarvis Bridge page test (Phase J6)
// ═══════════════════════════════════════════════════════════════
// Structural test: the canonical /sita surface exists, mounts the
// 7 panels, and is wired into os-routes + the spatial workspace.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import * as fs from "fs";

const PAGE = "src/pages/sita/JarvisBridge.tsx";
const ENTITY = "src/pages/sita/EntityView.tsx";
const ROUTES = "src/routes/os-routes.tsx";
const RAIL = "src/components/sita/shell/SpatialDesktop.tsx";

const PANELS = [
  "NowPanel",
  "WorldModelPanel",
  "CouncilPanel",
  "ActionQueuePanel",
  "TimelinePanel",
  "ExplainPanel",
];

describe("Jarvis Bridge surface (/sita)", () => {
  it("page file exists", () => {
    expect(fs.existsSync(PAGE)).toBe(true);
    expect(fs.existsSync(ENTITY)).toBe(true);
  });

  it("page mounts the 6 canonical panels", () => {
    const src = fs.readFileSync(PAGE, "utf-8");
    for (const panel of PANELS) {
      expect(src).toContain(panel);
    }
  });

  it("/sita and /sita/entity routes are registered", () => {
    const src = fs.readFileSync(ROUTES, "utf-8");
    expect(src).toMatch(/["']\/sita["']/);
    expect(src).toMatch(/sita\/entity/);
  });

  it("Jarvis Bridge appears in the Intelligence workspace", () => {
    const src = fs.readFileSync(RAIL, "utf-8");
    expect(src).toContain("/sita");
    expect(src).toContain("Jarvis Bridge");
  });

  it("page uses honest empty states (no demo arrays)", () => {
    const src = fs.readFileSync(PAGE, "utf-8");
    expect(src).not.toMatch(/const\s+(DEMO|MOCK|FAKE|SAMPLE)_/);
  });
});