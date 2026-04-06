// ═══════════════════════════════════════════════════════
// SITA OS — Evidence Helper
// Screenshot, console error, and network failure capture
// ═══════════════════════════════════════════════════════

import { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const EVIDENCE_DIR = path.join(process.cwd(), "test-results", "evidence");

/**
 * Capture evidence from the current page state.
 * Returns the screenshot path for use as evidence ref.
 */
export async function captureEvidence(
  page: Page,
  label: string
): Promise<string> {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });

  const sanitizedLabel = label.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  const timestamp = Date.now();

  // Screenshot
  const screenshotPath = path.join(EVIDENCE_DIR, `${sanitizedLabel}-${timestamp}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  // Console errors
  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  // Write console errors if any
  if (consoleErrors.length > 0) {
    const errPath = path.join(EVIDENCE_DIR, `${sanitizedLabel}-${timestamp}-console.txt`);
    fs.writeFileSync(errPath, consoleErrors.join("\n"));
  }

  return screenshotPath;
}

/**
 * Capture evidence automatically on test failure.
 * Use in afterEach hooks.
 */
export async function captureEvidenceOnFailure(
  page: Page,
  testTitle: string,
  testStatus: string
): Promise<string | undefined> {
  if (testStatus === "failed" || testStatus === "timedOut") {
    return captureEvidence(page, `FAIL-${testTitle}`);
  }
  return undefined;
}
