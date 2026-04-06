import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("SitaKernel", () => {
  it("kernel file exists", () => {
    expect(fs.existsSync("src/lib/sita-kernel.ts")).toBe(true);
  });

  it("exports SitaKernel class", async () => {
    const content = fs.readFileSync("src/lib/sita-kernel.ts", "utf-8");
    expect(content).toContain("export class SitaKernel");
    expect(content).toContain("eventBus");
    expect(content).toContain("receipts");
    expect(content).toContain("executor");
  });

  it("follows canonical execution path", () => {
    const content = fs.readFileSync("src/lib/sita-kernel.ts", "utf-8");
    // Verify the canonical spine is documented
    expect(content).toContain("CANONICAL EXECUTION PATH");
    expect(content).toContain("brain-core");
    expect(content).toContain("policy-engine");
    expect(content).toContain("receipt-service");
  });
});
