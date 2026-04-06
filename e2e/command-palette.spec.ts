import { test, expect } from "@playwright/test";

test.describe("Command Palette", () => {
  test("opens with keyboard shortcut", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Cmd+K or Ctrl+K should open the palette
    await page.keyboard.press("Meta+k");
    // Give it a moment to open
    await page.waitForTimeout(500);
  });
});
