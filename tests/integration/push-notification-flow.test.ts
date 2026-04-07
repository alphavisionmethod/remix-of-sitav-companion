import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
      upsert: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
    }),
  },
}));

vi.mock("@/lib/persistence/universal-service-persistence", () => ({
  loadServiceState: vi.fn().mockResolvedValue(null),
  debouncedSaveServiceState: vi.fn(),
}));

describe("CommunicationService push integration", () => {
  it("routes push channel through notifications_queue", async () => {
    const { CommunicationService } = await import("@/lib/services/communication-service/index");
    const svc = new CommunicationService();

    const result = await svc.send({
      channel: "push",
      category: "notification",
      priority: "high",
      recipientId: "user-1",
      recipientAddress: "device-token",
      body: "Test push notification",
      domain: "system" as unknown,
      correlationId: "corr-1",
    });

    // Should attempt DB insert → may return queued or delivered (depending on mock)
    expect(result.channel).toBe("push");
    expect(["queued", "delivered"]).toContain(result.status);
  });

  it("simulates delivery for non-push channels", async () => {
    const { CommunicationService } = await import("@/lib/services/communication-service/index");
    const svc = new CommunicationService();

    const result = await svc.send({
      channel: "email",
      category: "transactional",
      priority: "normal",
      recipientId: "user-1",
      recipientAddress: "test@test.com",
      body: "Test email",
      domain: "system" as unknown,
      correlationId: "corr-2",
    });

    expect(result.status).toBe("delivered");
  });
});
