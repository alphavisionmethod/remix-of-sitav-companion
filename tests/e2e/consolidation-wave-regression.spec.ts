// ═══════════════════════════════════════════════════════════════
// SITA OS — Consolidation Wave Regression Tests
//
// Automated path-level regression that validates every route and
// workflow affected by each consolidation wave. Runs both
// "pre-wave" assertions (routes still reachable before merge)
// and "post-wave" assertions (redirects work, targets healthy).
// ═══════════════════════════════════════════════════════════════

import { test, expect } from "@playwright/test";
import {
  CONSOLIDATION_WAVES,
  type ConsolidationWave,
  type AffectedRoute,
} from "../../src/lib/admin/consolidation-wave-registry";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:8080";
const TEST_EMAIL = process.env.TEST_USER_EMAIL || "";
const TEST_PASS = process.env.TEST_USER_PASSWORD || "";

// ── Helpers ─────────────────────────────────────────────────────

async function loginIfNeeded(page: import("@playwright/test").Page) {
  await page.goto(`${BASE_URL}/login`);
  await page
    .locator("input[type='email'], input[placeholder*='email' i]")
    .fill(TEST_EMAIL);
  await page.locator("input[type='password']").fill(TEST_PASS);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/^(?!.*\/(login|signup))/, { timeout: 15000 });
}

async function assertRouteReachable(
  page: import("@playwright/test").Page,
  route: string,
  label: string,
) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
  const body = await page.textContent("body");
  expect(body, `${label} (${route}) should not error`).not.toContain(
    "Something went wrong",
  );
  expect(body, `${label} (${route}) should not 404`).not.toContain(
    "Page not found",
  );
}

async function assertRouteRedirects(
  page: import("@playwright/test").Page,
  from: string,
  to: string,
) {
  await page.goto(`${BASE_URL}${from}`, { waitUntil: "networkidle" });
  const finalUrl = new URL(page.url());
  expect(
    finalUrl.pathname,
    `${from} should redirect to ${to}`,
  ).toBe(to);
}

// ── Pre-Wave Tests ──────────────────────────────────────────────
// Verify all affected routes are still reachable BEFORE the wave.
// These must pass on the current codebase to establish baseline.

function createPreWaveSuite(wave: ConsolidationWave) {
  test.describe(`Pre-Wave: ${wave.name} (${wave.id})`, () => {
    test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");

    test.beforeEach(async ({ page }) => {
      await loginIfNeeded(page);
    });

    for (const route of wave.affectedRoutes) {
      if (route.preWave === "reachable" || route.preWave === "reachable-deprecated") {
        test(`PRE | ${route.label} (${route.path}) is reachable`, async ({
          page,
        }) => {
          await assertRouteReachable(page, route.path, route.label);
        });
      }
    }

    // Verify workflow critical routes are functional
    for (const wf of wave.affectedWorkflows) {
      test(`PRE | Workflow "${wf.name}" critical routes intact`, async ({
        page,
      }) => {
        for (const critRoute of wf.criticalRoutes) {
          await assertRouteReachable(page, critRoute, `${wf.name}:${critRoute}`);
        }
      });
    }
  });
}

// ── Post-Wave Tests ─────────────────────────────────────────────
// Verify routes behave correctly AFTER a wave is applied:
//   - "reachable" → still loads
//   - "redirected" → navigates to the target
//   - "merged" → target route works, source may redirect
//   - "removed" → returns 404 or redirect

function createPostWaveSuite(wave: ConsolidationWave) {
  test.describe(`Post-Wave: ${wave.name} (${wave.id})`, () => {
    test.skip(!TEST_EMAIL, "Skipping: no TEST_USER_EMAIL configured");
    // Post-wave tests only run after wave is marked completed
    test.skip(
      wave.status !== "completed",
      `Wave ${wave.id} not yet completed (status: ${wave.status})`,
    );

    test.beforeEach(async ({ page }) => {
      await loginIfNeeded(page);
    });

    for (const route of wave.affectedRoutes) {
      switch (route.postWave) {
        case "reachable":
          test(`POST | ${route.label} (${route.path}) still reachable`, async ({
            page,
          }) => {
            await assertRouteReachable(page, route.path, route.label);
          });
          break;

        case "redirected":
          test(`POST | ${route.label} (${route.path}) → ${route.redirectTo}`, async ({
            page,
          }) => {
            expect(route.redirectTo).toBeTruthy();
            await assertRouteRedirects(page, route.path, route.redirectTo!);
            // Also verify target is healthy
            await assertRouteReachable(
              page,
              route.redirectTo!,
              `redirect target of ${route.label}`,
            );
          });
          break;

        case "merged":
          test(`POST | ${route.label} merged → target reachable`, async ({
            page,
          }) => {
            if (route.redirectTo) {
              await assertRouteReachable(
                page,
                route.redirectTo,
                `merge target of ${route.label}`,
              );
            }
          });
          break;

        case "removed":
          test(`POST | ${route.label} (${route.path}) returns 404 or redirect`, async ({
            page,
          }) => {
            const resp = await page.goto(`${BASE_URL}${route.path}`);
            const status = resp?.status() ?? 0;
            const isGone = status === 404 || status === 301 || status === 302;
            // SPA may not return HTTP 404, so also check body
            if (!isGone) {
              const body = await page.textContent("body");
              expect(
                body?.includes("Page not found") ||
                  body?.includes("Not Found") ||
                  page.url().includes(route.redirectTo || "__none__"),
              ).toBeTruthy();
            }
          });
          break;
      }
    }

    // Post-wave workflow integrity
    for (const wf of wave.affectedWorkflows) {
      test(`POST | Workflow "${wf.name}" critical routes survive`, async ({
        page,
      }) => {
        for (const critRoute of wf.criticalRoutes) {
          await assertRouteReachable(page, critRoute, `${wf.name}:${critRoute}`);
        }
      });
    }
  });
}

// ── Generate Suites ─────────────────────────────────────────────

for (const wave of CONSOLIDATION_WAVES) {
  createPreWaveSuite(wave);
  createPostWaveSuite(wave);
}

// ── Cross-Wave Integrity ────────────────────────────────────────
// Ensure no two waves claim conflicting redirect targets

test.describe("Cross-Wave Integrity", () => {
  test("no conflicting redirects across waves", () => {
    const redirectMap = new Map<string, { waveId: string; target: string }>();
    for (const wave of CONSOLIDATION_WAVES) {
      for (const route of wave.affectedRoutes) {
        if (route.postWave === "redirected" && route.redirectTo) {
          const existing = redirectMap.get(route.path);
          if (existing) {
            expect(
              existing.target,
              `${route.path} redirected by both ${existing.waveId} and ${wave.id}`,
            ).toBe(route.redirectTo);
          }
          redirectMap.set(route.path, {
            waveId: wave.id,
            target: route.redirectTo,
          });
        }
      }
    }
    expect(redirectMap.size).toBeGreaterThan(0);
  });

  test("redirect targets are not themselves redirected", () => {
    const redirectedPaths = new Set<string>();
    for (const wave of CONSOLIDATION_WAVES) {
      for (const route of wave.affectedRoutes) {
        if (route.postWave === "redirected") {
          redirectedPaths.add(route.path);
        }
      }
    }
    for (const wave of CONSOLIDATION_WAVES) {
      for (const route of wave.affectedRoutes) {
        if (route.redirectTo) {
          expect(
            redirectedPaths.has(route.redirectTo),
            `Redirect chain: ${route.path} → ${route.redirectTo} is itself redirected`,
          ).toBe(false);
        }
      }
    }
  });

  test("all waves have unique order values", () => {
    const orders = CONSOLIDATION_WAVES.map((w) => w.order);
    expect(new Set(orders).size).toBe(orders.length);
  });
});