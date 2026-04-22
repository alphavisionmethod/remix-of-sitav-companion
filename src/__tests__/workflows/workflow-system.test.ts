import { describe, it, expect } from "vitest";
import * as fs from "fs";

// ═══════════════════════════════════════════════════════════════
// Workflow & Approval System — Verification
// ═══════════════════════════════════════════════════════════════

describe("Workflow System", () => {
  const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");

  it("approval_requests table exists", () => {
    expect(types).toContain("approval_requests");
  });

  it("advisor action queue table exists", () => {
    expect(types).toContain("advisor_action_queue");
    expect(types).toContain("requires_approval");
  });

  it("admin action confirmations with dual approval", () => {
    expect(types).toContain("admin_action_confirmations");
    expect(types).toContain("approved_by");
    expect(types).toContain("rejected_by");
  });

  it("TasksWorkflowsCenter page exists", () => {
    const page = fs.readFileSync("src/pages/TasksWorkflowsCenter.tsx", "utf8");
    expect(page.split("\n").length).toBeGreaterThan(100);
  });

  it("approval hook exists", () => {
    const hookExists = fs.existsSync("src/hooks/use-approval-queue-mutations.ts");
    expect(hookExists).toBe(true);
  });
});

describe("Boardroom Follow-Through System", () => {
  const types = fs.readFileSync("src/integrations/supabase/types.ts", "utf8");

  it("boardroom followthrough dispatches table", () => {
    expect(types).toContain("boardroom_followthrough_dispatches");
  });

  it("boardroom outcome records table", () => {
    expect(types).toContain("boardroom_outcome_records");
  });

  it("advisor board reflections with lesson learned", () => {
    expect(types).toContain("advisor_board_reflections");
    expect(types).toContain("lesson_learned");
  });
});