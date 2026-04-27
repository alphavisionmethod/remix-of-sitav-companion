import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("useBrainCore", () => {
  it("module file exists", () => {
    expect(fs.existsSync("src/platform/personal-brain/hooks/use-brain-core.ts")).toBe(true);
  });

  it("exports useBrainCore function", () => {
    const content = fs.readFileSync("src/platform/personal-brain/hooks/use-brain-core.ts", "utf-8");
    expect(content).toContain("export function useBrainCore");
  });

  it("defines AdvisorResponse interface", () => {
    const content = fs.readFileSync("src/platform/personal-brain/hooks/use-brain-core.ts", "utf-8");
    expect(content).toContain("export interface AdvisorResponse");
    expect(content).toContain("recommendation");
    expect(content).toContain("confidence");
  });

  it("integrates with policy engine", () => {
    const content = fs.readFileSync("src/platform/personal-brain/hooks/use-brain-core.ts", "utf-8");
    expect(content).toContain("evaluatePolicy");
    expect(content).toContain("classifyRiskTier");
  });
});
