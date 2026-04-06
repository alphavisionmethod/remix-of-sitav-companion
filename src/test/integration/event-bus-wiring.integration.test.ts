import { describe, it, expect, beforeEach } from "vitest";
import { EventBus, type BusEvent } from "@/lib/core-services/event-bus";

describe("Event Bus Wiring — Integration", () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it("publishes and dispatches to subscribers", async () => {
    const received: BusEvent[] = [];
    bus.subscribe("test.topic", (e) => { received.push(e); });

    await bus.publish("test.topic", { value: 42 }, { source: "test", skipPersist: true });

    expect(received).toHaveLength(1);
    expect(received[0].payload.value).toBe(42);
    expect(received[0].topic).toBe("test.topic");
  });

  it("supports wildcard subscriptions", async () => {
    const received: BusEvent[] = [];
    bus.subscribe("test.*", (e) => { received.push(e); });

    await bus.publish("test.alpha", { a: 1 }, { source: "test", skipPersist: true });
    await bus.publish("test.beta", { b: 2 }, { source: "test", skipPersist: true });
    await bus.publish("other.gamma", { c: 3 }, { source: "test", skipPersist: true });

    expect(received).toHaveLength(2);
  });

  it("unsubscribes correctly", async () => {
    let count = 0;
    const subId = bus.subscribe("test.topic", () => { count++; });
    await bus.publish("test.topic", {}, { source: "test", skipPersist: true });
    expect(count).toBe(1);

    bus.unsubscribe(subId);
    await bus.publish("test.topic", {}, { source: "test", skipPersist: true });
    expect(count).toBe(1);
  });

  it("maintains immutable event log", async () => {
    await bus.publish("a", { x: 1 }, { source: "test", skipPersist: true });
    await bus.publish("b", { x: 2 }, { source: "test", skipPersist: true });

    const log = bus.getLog();
    expect(log).toHaveLength(2);
    expect(log[0].topic).toBe("a");
    expect(log[1].topic).toBe("b");
  });

  it("replays events by topic", async () => {
    await bus.publish("replay.a", { v: 1 }, { source: "test", skipPersist: true });
    await bus.publish("replay.b", { v: 2 }, { source: "test", skipPersist: true });
    await bus.publish("replay.a", { v: 3 }, { source: "test", skipPersist: true });

    const replayed: BusEvent[] = [];
    bus.subscribe("replay.a", (e) => { replayed.push(e); });

    await bus.replay({ topic: "replay.a" });
    expect(replayed).toHaveLength(2);
  });

  it("handles dead letter queue on handler error", async () => {
    bus.subscribe("error.topic", () => { throw new Error("Handler failure"); }, "failing-handler");
    await bus.publish("error.topic", {}, { source: "test", skipPersist: true });

    const dlq = bus.getDeadLetterQueue();
    expect(dlq.length).toBeGreaterThanOrEqual(1);
    expect(dlq[0].error).toContain("Handler failure");
  });

  it("passes correlation IDs through the chain", async () => {
    const received: BusEvent[] = [];
    bus.subscribe("corr.test", (e) => { received.push(e); });

    await bus.publish("corr.test", {}, { source: "test", correlationId: "corr-123", skipPersist: true });

    expect(received[0].correlationId).toBe("corr-123");
  });
});
