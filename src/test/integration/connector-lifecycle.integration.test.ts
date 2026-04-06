import { describe, it, expect } from "vitest";
import {
  createConnectorControlPlane,
  calculateHealthScore,
  qualifiesForLive,
  type HealthMetrics,
} from "@/lib/core-services/connector-control";

describe("Connector Lifecycle — Integration", () => {
  it("registers, connects, and disconnects a connector", () => {
    const plane = createConnectorControlPlane();
    const connector = plane.register("Google Drive", "google-drive");

    expect(connector.status).toBe("registered");
    expect(connector.mode).toBe("sandbox");

    const connected = plane.connect(connector.id);
    expect(connected).toBe(true);

    const disconnected = plane.disconnect(connector.id);
    expect(disconnected).toBe(true);
  });

  it("records sync results and updates health", () => {
    const plane = createConnectorControlPlane();
    const connector = plane.register("Stripe", "stripe");
    plane.connect(connector.id);

    plane.recordSync(connector.id, {
      connectorId: connector.id,
      status: "completed",
      recordsSynced: 100,
      recordsFailed: 2,
      durationMs: 500,
    });

    const updated = plane.getConnector(connector.id);
    expect(updated?.healthMetrics.totalRequests).toBe(102);
    expect(updated?.healthMetrics.totalErrors).toBe(2);
  });

  it("calculates health scores correctly", () => {
    const perfect: HealthMetrics = {
      uptimeMinutes: 1000,
      totalMinutes: 1000,
      errorRate: 0,
      totalRequests: 1000,
      totalErrors: 0,
      avgLatencyMs: 50,
      p99LatencyMs: 200,
      syncFrequencyMs: 60000,
    };
    expect(calculateHealthScore(perfect)).toBeGreaterThanOrEqual(100);

    const degraded: HealthMetrics = {
      ...perfect,
      uptimeMinutes: 500,
      totalErrors: 100,
      p99LatencyMs: 3000,
    };
    expect(calculateHealthScore(degraded)).toBeLessThan(90);
  });

  it("qualifies for live only with high health", () => {
    const plane = createConnectorControlPlane();
    const connector = plane.register("Test", "test-service");

    // Fresh connector with perfect health
    expect(qualifiesForLive(connector)).toBe(true);

    // After failures
    for (let i = 0; i < 10; i++) {
      plane.recordSync(connector.id, {
        connectorId: connector.id,
        status: "failed",
        recordsSynced: 0,
        recordsFailed: 10,
        durationMs: 100,
      });
    }
    const degraded = plane.getConnector(connector.id);
    expect(degraded && qualifiesForLive(degraded)).toBe(false);
  });

  it("moves connector to error state after repeated failures", () => {
    const plane = createConnectorControlPlane();
    const connector = plane.register("Unstable", "unstable-service");
    plane.connect(connector.id);

    for (let i = 0; i < 5; i++) {
      plane.recordSync(connector.id, {
        connectorId: connector.id,
        status: "failed",
        recordsSynced: 0,
        recordsFailed: 1,
        durationMs: 100,
      });
    }

    const updated = plane.getConnector(connector.id);
    expect(updated?.status).toBe("error");
  });
});
