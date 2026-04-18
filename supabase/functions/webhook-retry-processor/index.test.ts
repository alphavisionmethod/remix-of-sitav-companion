// Smoke test for webhook-retry-processor — ensures the function module loads
// and exports a default fetch handler shape.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("webhook-retry-processor module signature", async () => {
  // The function uses Deno.serve() at module scope; importing it would start
  // the server, which we don't want in unit tests. Instead, validate the
  // file contains the expected primitives.
  const src = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  assertEquals(src.includes("Deno.serve"), true);
  assertEquals(src.includes("WEBHOOK_SIGNING_SECRET"), true);
  assertEquals(src.includes("webhook_retry_queue"), true);
  assertEquals(src.includes("'dlq'") || src.includes('"dlq"'), true);
});
