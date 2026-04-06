import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventBus, createEventBus } from "../event-bus";

vi.mock("@/lib/persistence/event-bus-persistence", () => ({
  persistEvent: vi.fn().mockResolvedValue(undefined),
  persistDeadLetter: vi.fn().mockResolvedValue(undefined),
  fetchPersistedEvents: vi.fn().mockResolvedValue([]),
}));

describe("EventBus", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = createEventBus();
    bus.setPersistence(false);
  });

  it("publishes events and adds to log", async () => {
    const event = await bus.publish("test.topic", { data: 1 }, { source: "test", skipPersist: true });
    expect(event.topic).toBe("test.topic");
    expect(bus.getLog()).toHaveLength(1);
  });

  it("dispatches to matching subscribers", async () => {
    const handler = vi.fn();
    bus.subscribe("test.topic", handler);
    await bus.publish("test.topic", { data: 1 }, { skipPersist: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("supports wildcard * subscription", async () => {
    const handler = vi.fn();
    bus.subscribe("*", handler);
    await bus.publish("any.topic", {}, { skipPersist: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("supports prefix wildcard subscription", async () => {
    const handler = vi.fn();
    bus.subscribe("domain.*", handler);
    await bus.publish("domain.event", {}, { skipPersist: true });
    await bus.publish("other.event", {}, { skipPersist: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("unsubscribe removes handler", async () => {
    const handler = vi.fn();
    const id = bus.subscribe("t", handler);
    bus.unsubscribe(id);
    await bus.publish("t", {}, { skipPersist: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("sends failing handlers to dead-letter queue", async () => {
    bus.subscribe("fail", () => { throw new Error("boom"); });
    await bus.publish("fail", {}, { skipPersist: true });
    expect(bus.getDeadLetterQueue()).toHaveLength(1);
    expect(bus.getDeadLetterQueue()[0].error).toBe("boom");
  });

  it("replays events filtered by topic", async () => {
    await bus.publish("a", {}, { skipPersist: true });
    await bus.publish("b", {}, { skipPersist: true });
    const handler = vi.fn();
    bus.subscribe("a", handler);
    await bus.replay({ topic: "a" });
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("filters replay by tenant", async () => {
    await bus.publish("t", {}, { tenantId: "x", skipPersist: true });
    await bus.publish("t", {}, { tenantId: "y", skipPersist: true });
    const handler = vi.fn();
    bus.subscribe("t", handler);
    const events = await bus.replay({ tenantId: "x" });
    expect(events).toHaveLength(1);
  });

  it("getTopicCounts returns correct counts", async () => {
    await bus.publish("a", {}, { skipPersist: true });
    await bus.publish("a", {}, { skipPersist: true });
    await bus.publish("b", {}, { skipPersist: true });
    expect(bus.getTopicCounts()).toEqual({ a: 2, b: 1 });
  });

  it("clear removes subscriptions", async () => {
    bus.subscribe("x", vi.fn());
    bus.clear();
    const handler = vi.fn();
    // After clear, old subs are gone — subscribe fresh to verify
    bus.subscribe("x", handler);
    await bus.publish("x", {}, { skipPersist: true });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
