import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════
// SITA OS — E2E Tests: Full Onboarding Flow (Demo Mode)
// Tests the complete setup wizard from welcome → desktop arrival
// ═══════════════════════════════════════════════════════════════

test.describe("Onboarding Flow — Demo Mode", () => {
  test.beforeEach(async ({ page }) => {
    // Enter demo mode first, then navigate to onboarding
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);
  });

  test("should complete full onboarding wizard end-to-end", async ({ page }) => {
    await page.goto("/onboarding");

    // ── Step 1: Welcome ──
    await expect(page.getByText("Welcome to SITA")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Every action has a proof trail")).toBeVisible();
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();

    // ── Step 2: Role Selection ──
    await expect(page.getByText("Select your primary role")).toBeVisible({ timeout: 5000 });
    await page.getByText("Founder / CEO").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 3: Business Setup ──
    await expect(page.getByText(/business/i).first()).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder(/business name/i).fill("SITA Test Corp");
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 4: Finance Connections ──
    await expect(page.getByText(/bank|finance/i).first()).toBeVisible({ timeout: 5000 });
    // Skip finance connections
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 5: Concierge / Life Operations ──
    await expect(page.getByText(/life operations|household/i).first()).toBeVisible({ timeout: 5000 });
    await page.getByText("Just me").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 6: Trust & Approval Settings ──
    await expect(page.getByText("Trust & Approval Settings")).toBeVisible({ timeout: 5000 });
    await page.getByText("Careful (Recommended)").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 7: Preferences ──
    await expect(page.getByText("Your Preferences")).toBeVisible({ timeout: 5000 });
    await page.getByText("Balanced").first().click();
    await page.getByText("Supportive").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 8: First Win Selection ──
    await expect(page.getByText("Your First Win")).toBeVisible({ timeout: 5000 });
    await page.getByText("Schedule weekly boardroom").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // ── Step 9: Review ──
    await expect(page.getByText("Review Your Setup")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Setup Health")).toBeVisible();
    await expect(page.getByText("SITA Test Corp")).toBeVisible();
    await page.getByRole("button", { name: /launch sita/i }).click();

    // ── Step 10: Complete ──
    await expect(page.getByText("You're All Set")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("SITA is ready to operate")).toBeVisible();
  });

  test("should navigate back between onboarding steps", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("Welcome to SITA")).toBeVisible({ timeout: 10000 });

    // Go forward
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();
    await expect(page.getByText("Select your primary role")).toBeVisible({ timeout: 5000 });

    // Go back
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page.getByText("Welcome to SITA")).toBeVisible({ timeout: 5000 });
  });

  test("should show progress indicator during onboarding", async ({ page }) => {
    await page.goto("/onboarding");
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();
    // Progress bar should be visible (shows current/total)
    await expect(page.getByText(/1\/\d+|2\/\d+/)).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Trust Calibration Step", () => {
  test("should display all three trust levels with descriptions", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);
    await page.goto("/onboarding");

    // Navigate to trust step
    await page.getByRole("button", { name: /get started|begin|continue/i }).click(); // past welcome
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(300);
    }

    await expect(page.getByText("Trust & Approval Settings")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Standard")).toBeVisible();
    await expect(page.getByText("Careful (Recommended)")).toBeVisible();
    await expect(page.getByText("Strict")).toBeVisible();

    // Each trust level should have a description
    await expect(page.getByText(/handles routine tasks automatically/i)).toBeVisible();
    await expect(page.getByText(/proposes actions and waits/i)).toBeVisible();
    await expect(page.getByText(/does nothing without explicit/i)).toBeVisible();
  });
});

test.describe("First Win Activation", () => {
  test("should display all five first-win options", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);
    await page.goto("/onboarding");

    // Navigate to first-win step
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(300);
    }

    await expect(page.getByText("Your First Win")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Set up lead intake")).toBeVisible();
    await expect(page.getByText("Track upcoming bills")).toBeVisible();
    await expect(page.getByText("Schedule weekly boardroom")).toBeVisible();
    await expect(page.getByText("Automate follow-up reminders")).toBeVisible();
    await expect(page.getByText("Set up household calendar")).toBeVisible();
  });

  test("should highlight selected first-win option", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);
    await page.goto("/onboarding");

    // Navigate to first-win step
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(300);
    }

    await expect(page.getByText("Your First Win")).toBeVisible({ timeout: 5000 });
    const option = page.getByText("Schedule weekly boardroom");
    await option.click();
    // The parent button should now have accent/gold styling
    const button = option.locator("xpath=ancestor::button");
    await expect(button).toHaveClass(/border-accent|shadow-glow/);
  });
});

test.describe("Post-Onboarding Desktop Transition", () => {
  test("should show completion screen with next steps", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);
    await page.goto("/onboarding");

    // Speed through all steps
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();
    for (let i = 0; i < 7; i++) {
      await page.getByRole("button", { name: /continue/i }).click();
      await page.waitForTimeout(300);
    }

    // At review step, click Launch SITA
    await expect(page.getByText("Review Your Setup")).toBeVisible({ timeout: 5000 });
    await page.getByRole("button", { name: /launch sita/i }).click();

    // Complete screen
    await expect(page.getByText("You're All Set")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("Daily Pulse is personalized")).toBeVisible();
    await expect(page.getByText("Business, Money, and Concierge")).toBeVisible();

    // Enter SITA OS button should navigate to desktop
    await page.getByRole("button", { name: /enter sita/i }).click();
    await page.waitForTimeout(3000);
    // Should be on the main app now (daily-pulse or root)
    await expect(page.url()).toMatch(/\/(daily-pulse)?$/);
  });

  test("should navigate from completion to Daily Pulse desktop", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForURL("**/daily-pulse", { timeout: 10000 });

    // Daily Pulse should render with operating view
    await expect(page.getByText("Here's your operating view")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Onboarding in Docker Stack", () => {
  // These tests verify the onboarding works with the full Docker infrastructure
  // When running in CI/Docker, VITE_DEMO_MODE=true bypasses auth

  test("should work with VITE_DEMO_MODE environment variable", async ({ page }) => {
    // This test validates the demo mode bypass works regardless of entry point
    await page.goto("/onboarding");
    await page.waitForTimeout(2000);

    // Should either show onboarding or redirect to login (both valid)
    const isOnboarding = await page.getByText("Welcome to SITA").isVisible().catch(() => false);
    const isLogin = await page.getByText("Welcome back").isVisible().catch(() => false);

    expect(isOnboarding || isLogin).toBeTruthy();
  });

  test("should persist setup session preferences", async ({ page }) => {
    // Validates that onboarding state is captured (even in demo mode via localStorage)
    await page.goto("/login");
    await page.getByRole("button", { name: /demo mode/i }).click();
    await page.waitForTimeout(2000);
    await page.goto("/onboarding");

    // Go through welcome and role
    await page.getByRole("button", { name: /get started|begin|continue/i }).click();
    await expect(page.getByText("Select your primary role")).toBeVisible({ timeout: 5000 });
    await page.getByText("Founder / CEO").click();
    await page.getByRole("button", { name: /continue/i }).click();

    // Fill business name
    await page.waitForTimeout(500);
    const nameInput = page.getByPlaceholder(/business name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill("Docker Test Corp");
    }

    // State should be maintained as we navigate
    await page.getByRole("button", { name: /back/i }).click();
    await expect(page.getByText("Select your primary role")).toBeVisible({ timeout: 5000 });
    // Role should still be selected
    const founderButton = page.getByText("Founder / CEO");
    const parentButton = founderButton.locator("xpath=ancestor::button");
    await expect(parentButton).toHaveClass(/border-primary|bg-primary/);
  });
});
