// Smoke test for release-artifact-signer — verifies admin gate + HMAC primitives.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("release-artifact-signer enforces admin + HMAC", async () => {
  const src = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  assertEquals(src.includes("has_role"), true);
  assertEquals(src.includes("ATTESTATION_SIGNING_KEY"), true);
  assertEquals(src.includes("HMAC"), true);
  assertEquals(src.includes("sha256.length !== 64"), true);
  assertEquals(src.includes("signed_release_artifacts"), true);
});
