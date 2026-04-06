import { describe, it, expect, vi } from "vitest";
import { EventBus } from "@/lib/core-services/event-bus";

// Mock persistence to avoid DB calls
vi.mock("@/lib/persistence/event-bus-persistence", () => ({
  persistEvent: vi.fn().mockResolvedValue("mock-id"),
  persistDeadLetter: vi.fn().mockResolvedValue(undefined),
  fetchPersistedEvents: vi.fn().mockResolvedValue([]),
}));

describe("EventBus — publish", () => {
  it("publishes and dispatches an event", async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe("test.topic", handler);
    const event = await bus.publish("test.topic", { key: "value" }, { source: "test", skipPersist: true });
    expect(event.topic).toBe("test.topic");
    expect(handler).toHaveBeenCalledOnce();
  });

  it("assigns unique IDs to events", async () => {
    const bus = new EventBus();
    const e1 = await bus.publish("a", {}, { skipPersist: true });
    const e2 = await bus.publish("b", {}, { skipPersist: true });
    expect(e1.id).not.toBe(e2.id);
  });

  it("stores events in the log", async () => {
    const bus = new EventBus();
    await bus.publish("a", {}, { skipPersist: true });
    await bus.publish("b", {}, { skipPersist: true });
    const log = bus.getLog();
    expect(log.length).toBe(2);
  });
});

describe("EventBus — subscribe/unsubscribe", () => {
  it("subscribes and receives matching events", async () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe("orders.*", (e) => { received.push(e.topic); });
    await bus.publish("orders.created", {}, { skipPersist: true });
    await bus.publish("orders.updated", {}, { skipPersist: true });
    await bus.publish("users.created", {}, { skipPersist: true });
    expect(received).toEqual(["orders.created", "orders.updated"]);
  });

  it("unsubscribes correctly", async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const subId = bus.subscribe("test", handler);
    await bus.publish("test", {}, { skipPersist: true });
    expect(handler).toHaveBeenCalledOnce();
    const removed = bus.unsubscribe(subId);
    expect(removed).toBe(true);
    await bus.publish("test", {}, { skipPersist: true });
    expect(handler).toHaveBeenCalledOnce();
  });

  it("wildcard * matches all events", async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe("*", handler);
    await bus.publish("any.topic", {}, { skipPersist: true });
    await bus.publish("other.topic", {}, { skipPersist: true });
    expect(handler).toHaveBeenCalledTimes(2);
  });
});

describe("EventBus — replay", () => {
  it("replays events from in-memory log", async () => {
    const bus = new EventBus();
    await bus.publish("a.event", { n: 1 }, { skipPersist: true });
    await bus.publish("b.event", { n: 2 }, { skipPersist: true });

    const replayed = vi.fn();
    bus.subscribe("a.event", replayed);
    await bus.replay({ topic: "a.event" });
    expect(replayed).toHaveBeenCalledOnce();
  });

  it("filters by time range", async () => {
    const bus = new EventBus();
    await bus.publish("x", {}, { skipPersist: true });
    const cutoff = Date.now() + 1000;
    const events = await bus.replay({ since: cutoff });
    expect(events.length).toBe(0);
  });
});

describe("EventBus — getLog", () => {
  it("returns a copy of the log", async () => {
    const bus = new EventBus();
    await bus.publish("test", {}, { skipPersist: true });
    const log1 = bus.getLog();
    const log2 = bus.getLog();
    expect(log1).not.toBe(log2);
    expect(log1).toEqual(log2);
  });

  it("limits results", async () => {
    const bus = new EventBus();
    for (let i = 0; i < 10; i++) await bus.publish("test", {}, { skipPersist: true });
    expect(bus.getLog(3).length).toBe(3);
  });
});

describe("EventBus — dead letter queue", () => {
  it("captures handler errors in DLQ", async () => {
    const bus = new EventBus();
    bus.subscribe("fail", () => { throw new Error("handler failed"); });
    await bus.publish("fail", {}, { skipPersist: true });
    const dlq = bus.getDeadLetterQueue();
    expect(dlq.length).toBe(1);
    expect(dlq[0].error).toContain("handler failed");
  });
});
