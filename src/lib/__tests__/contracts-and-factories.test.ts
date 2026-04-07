import { describe, it, expect } from "vitest";

describe("Kernel Contracts - Barrel Exports", () => {
  it("exports all kernel contract types", async () => {
    const kernel = await import("@/packages/contracts/kernel/index");
    expect(kernel).toBeTruthy();
    const exportNames = Object.keys(kernel);
    expect(exportNames.length).toBeGreaterThan(0);
  });
});

describe("Test Factories", () => {
  it("builds user", async () => {
    const { buildUser } = await import("@/test/factories/index");
    const user = buildUser();
    expect(user.id).toBeTruthy();
    expect(user.email).toBe("test@sita.os");
  });

  it("builds document", async () => {
    const { buildDocument } = await import("@/test/factories/index");
    const doc = buildDocument({ title: "Custom" });
    expect(doc.title).toBe("Custom");
    expect(doc.doc_type).toBe("doc");
  });

  it("builds note", async () => {
    const { buildNote } = await import("@/test/factories/index");
    const note = buildNote({ pinned: true });
    expect(note.pinned).toBe(true);
    expect(note.folder).toBe("general");
  });

  it("builds calendar event", async () => {
    const { buildCalendarEvent } = await import("@/test/factories/index");
    const evt = buildCalendarEvent();
    expect(evt.event_type).toBe("meeting");
  });

  it("builds customer", async () => {
    const { buildCustomer } = await import("@/test/factories/index");
    const customer = buildCustomer({ name: "Acme" });
    expect(customer.name).toBe("Acme");
  });

  it("builds receipt", async () => {
    const { buildReceipt } = await import("@/test/factories/index");
    const receipt = buildReceipt();
    expect(receipt.capability_key).toBe("test.capability");
  });

  it("builds workflow", async () => {
    const { buildWorkflow } = await import("@/test/factories/index");
    const wf = buildWorkflow();
    expect(wf.status).toBe("active");
  });
});
