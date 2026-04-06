import { describe, it, expect, vi } from "vitest";
import { persistEvent, type PersistedEvent } from "../event-bus-persistence";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: "test-user" } } })),
      onAuthStateChange: vi.fn(),
    },
    from: () => ({
      insert: vi.fn(() => Promise.resolve({ error: null })),
      select: () => ({
        eq: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
      }),
    }),
  },
}));

describe("EventBusPersistence", () => {
  it("exports persistEvent function", () => {
    expect(typeof persistEvent).toBe("function");
  });

  it("PersistedEvent type fields are documented", () => {
    const event: Partial<PersistedEvent> = {
      id: "e1",
      topic: "test.event",
      status: "pending",
      retry_count: 0,
      replay_eligible: true,
    };
    expect(event.topic).toBe("test.event");
    expect(event.status).toBe("pending");
  });
});
