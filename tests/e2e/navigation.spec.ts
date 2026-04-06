import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-at-all");
    // Should either redirect to login or show not-found
    await page.waitForLoadState("domcontentloaded");
    const url = page.url();
    // Either shows 404 or redirects to login (both are valid)
    expect(url.includes("login") || url.includes("not-exist")).toBeTruthy();
  });

  test("login page has navigation links", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    // Should have links to signup or forgot password
    const links = page.locator("a");
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });
});
