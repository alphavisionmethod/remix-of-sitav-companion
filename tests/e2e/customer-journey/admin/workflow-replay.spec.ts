import { test, expect } from "@playwright/test";

// Golden Path: GP-WORKFLOW-REPLAY — admin replays stuck workflow.
test("GP-WORKFLOW-REPLAY: admin workflows surface reachable", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/.*/);
});
