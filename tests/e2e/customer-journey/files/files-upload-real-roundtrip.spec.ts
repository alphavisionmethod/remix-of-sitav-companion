/**
 * SITA OS — Files Flagship Loop Round-Trip
 * Closes audit findings C-004 + C-006 with a single end-to-end proof:
 *   1. Sign in (real auth)
 *   2. Upload a real file via FileUploader → user-files/{uid}/...
 *   3. file_metadata row created (file-ingestion edge function)
 *   4. flagship_loop_completions row created (loop=files-ai-assist, step=file_upload)
 *   5. File appears in /files/all list
 *
 * Skipped automatically if E2E_EMAIL / E2E_PASSWORD are not set so CI doesn't
 * fail on local checkouts without test credentials.
 */
import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
const TEST_EMAIL = process.env.E2E_EMAIL ?? "";
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? "";

const HAS_CREDS = !!(SUPABASE_URL && SUPABASE_ANON && TEST_EMAIL && TEST_PASSWORD);

test.describe("Flagship Loop 2 — files-ai-assist round-trip", () => {
  test.skip(!HAS_CREDS, "E2E credentials not configured");

  test("upload → storage → file_metadata → flagship_loop_completions → display", async ({ page }) => {
    // 1. Sign in via UI
    await page.goto("/auth");
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/(dashboard|pulse|files|app)/, { timeout: 15_000 });

    // 2. Navigate to Files Center → All Files
    await page.goto("/files/all");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // 3. Upload a real file
    const fileBuffer = Buffer.from(
      `SITA OS round-trip proof generated at ${new Date().toISOString()}`,
      "utf-8",
    );
    const filename = `roundtrip-${Date.now()}.txt`;

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: filename,
      mimeType: "text/plain",
      buffer: fileBuffer,
    });

    // 4. Wait for ingestion toast / list refresh
    await expect(
      page.getByText(filename, { exact: false }).first(),
    ).toBeVisible({ timeout: 30_000 });

    // 5. Backend assertions via authenticated client
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON);
    const { error: authErr } = await sb.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    expect(authErr).toBeNull();
    const { data: userData } = await sb.auth.getUser();
    const uid = userData.user!.id;

    // file_metadata row created
    const { data: meta, error: metaErr } = await sb
      .from("file_metadata")
      .select("id, filename, status")
      .eq("user_id", uid)
      .eq("filename", filename)
      .maybeSingle();
    expect(metaErr).toBeNull();
    expect(meta).not.toBeNull();

    // flagship_loop_completions receipt durably written
    const { data: receipts, error: rxErr } = await (sb as any)
      .from("flagship_loop_completions")
      .select("loop_key, step_key, outcome")
      .eq("user_id", uid)
      .eq("loop_key", "files-ai-assist")
      .eq("step_key", "file_upload")
      .order("emitted_at", { ascending: false })
      .limit(1);
    expect(rxErr).toBeNull();
    expect(receipts?.[0]?.outcome).toBe("success");
  });
});
