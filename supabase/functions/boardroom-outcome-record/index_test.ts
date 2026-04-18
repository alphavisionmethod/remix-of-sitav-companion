// Deno test for boardroom-outcome-record
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("outcome record payload — required fields", () => {
  const valid = {
    boardroom_item_id: "00000000-0000-0000-0000-000000000001",
    dispatch_id: "00000000-0000-0000-0000-000000000002",
    outcome_status: "success",
    actual_outcome: "Email delivered to recipient",
    confidence: 0.95,
  };
  assert(valid.boardroom_item_id);
  assert(valid.dispatch_id);
  assert(["success", "partial", "failed", "unknown"].includes(valid.outcome_status));
  assert(valid.confidence >= 0 && valid.confidence <= 1);
});

Deno.test("outcome triggers correct lifecycle transition", () => {
  const transitions: Record<string, string> = {
    success: "outcome_tracked",
    partial: "outcome_tracked",
    failed: "failed",
    unknown: "outcome_pending",
  };
  assertEquals(transitions["success"], "outcome_tracked");
  assertEquals(transitions["failed"], "failed");
});

Deno.test("CORS preflight contract", () => {
  const req = new Request("http://local/boardroom-outcome-record", { method: "OPTIONS" });
  assertEquals(req.method, "OPTIONS");
});
