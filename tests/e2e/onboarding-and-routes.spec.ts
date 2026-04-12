import { test, expect } from "@playwright/test";

test.describe("Onboarding Flow E2E", () => {
  test("setup route renders", async ({ page }) => {
    await page.goto("/setup");
    await expect(page.locator("body")).toBeVisible();
  });

  test("first boot screen renders on fresh session", async ({ page }) => {
    await page.goto("/first-boot");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Lock Screen E2E", () => {
  test("lock screen page renders", async ({ page }) => {
    await page.goto("/lock");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Protected Routes E2E", () => {
  test("/owner requires auth", async ({ page }) => {
    await page.goto("/owner");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/approvals requires auth", async ({ page }) => {
    await page.goto("/approvals");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/workflows requires auth", async ({ page }) => {
    await page.goto("/workflows");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });

  test("/files requires auth", async ({ page }) => {
    await page.goto("/files");
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
  });
});
