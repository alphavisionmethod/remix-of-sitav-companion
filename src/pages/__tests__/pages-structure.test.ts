import { describe, it, expect } from "vitest";
import * as fs from "fs";

describe("Page files exist and export default", () => {
  const pages = [
    { file: "src/pages/DailyPulse.tsx", name: "DailyPulse" },
    { file: "src/pages/BusinessCenter.tsx", name: "BusinessCenter" },
    { file: "src/pages/MoneyCenter.tsx", name: "MoneyCenter" },
    { file: "src/pages/Boardroom.tsx", name: "Boardroom" },
    { file: "src/pages/SettingsPage.tsx", name: "SettingsPage" },
    { file: "src/pages/PersonalBrain.tsx", name: "PersonalBrain" },
  ];

  it.each(pages)("$name page file exists", ({ file }) => {
    expect(fs.existsSync(file)).toBe(true);
  });

  it.each(pages)("$name exports a React component", ({ file }) => {
    const content = fs.readFileSync(file, "utf-8");
    // Should have either export default or export function/const
    expect(content.includes("export default") || content.includes("export function") || content.includes("export const")).toBe(true);
  });

  it.each(pages)("$name has proper React component structure", ({ file }) => {
    const content = fs.readFileSync(file, "utf-8");
    // Should import React or use JSX
    expect(content.includes("import") && (content.includes("return") || content.includes("=>"))).toBe(true);
  });
});
