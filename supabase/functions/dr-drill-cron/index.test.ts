// Smoke test for dr-drill-cron — verifies probe + always-simulation behavior.
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("dr-drill-cron stays in simulation mode", async () => {
  const src = await Deno.readTextFile(new URL("./index.ts", import.meta.url));
  assertEquals(src.includes('mode: "simulation"'), true);
  assertEquals(src.includes("DR_FAILOVER_TARGET_URL"), true);
  assertEquals(src.includes("dr_drills"), true);
  // Must never auto-execute a real failover from the cron path.
  assertEquals(src.includes('mode: "live"') || src.includes("auto_failover"), false);
});
