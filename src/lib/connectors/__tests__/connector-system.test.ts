import { describe, it, expect } from "vitest";
import {
  CONNECTOR_STATE_GRAMMAR,
  normalizeConnectorState,
  getConnectorStateMeta,
  type ConnectorState,
} from "../connector-state-grammar";
import { getConnector, listConnectors, CONNECTOR_CAPABILITIES } from "../registry";

describe("Connector State Grammar", () => {
  const ALL_STATES: ConnectorState[] = [
    "connected", "degraded", "reauth_required", "failing", "manual", "demo_simulated",
  ];

  it("has entries for all 6 states", () => {
    for (const state of ALL_STATES) {
      expect(CONNECTOR_STATE_GRAMMAR[state]).toBeDefined();
    }
  });

  it("each state has valid label, tone, description, nextAction", () => {
    for (const state of ALL_STATES) {
      const meta = CONNECTOR_STATE_GRAMMAR[state];
      expect(meta.label).toBeTruthy();
      expect(meta.tone).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(meta.nextAction).toBeDefined();
      expect(meta.nextAction.kind).toBeTruthy();
    }
  });

  it("normalizeConnectorState maps known aliases", () => {
    expect(normalizeConnectorState("active")).toBe("connected");
    expect(normalizeConnectorState("healthy")).toBe("connected");
    expect(normalizeConnectorState("expired")).toBe("reauth_required");
    expect(normalizeConnectorState("blocked")).toBe("failing");
    expect(normalizeConnectorState("demo")).toBe("demo_simulated");
    expect(normalizeConnectorState("disconnected")).toBe("manual");
    expect(normalizeConnectorState(null)).toBe("manual");
    expect(normalizeConnectorState(undefined)).toBe("manual");
  });

  it("getConnectorStateMeta returns valid meta for raw string", () => {
    const meta = getConnectorStateMeta("active");
    expect(meta.state).toBe("connected");
    expect(meta.tone).toBe("success");
  });
});

describe("Connector Registry", () => {
  it("CONNECTOR_CAPABILITIES has 12+ entries", () => {
    expect(CONNECTOR_CAPABILITIES.length).toBeGreaterThanOrEqual(12);
  });

  it("no duplicate connector IDs", () => {
    const ids = CONNECTOR_CAPABILITIES.map(c => c.connectorId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("getConnector returns entry for known connectors", () => {
    const knownIds = ["dropbox", "gmail", "slack", "stripe", "twilio"];
    for (const id of knownIds) {
      const entry = getConnector(id);
      expect(entry).toBeDefined();
      expect(entry?.capability.connectorId).toBe(id);
    }
  });

  it("getConnector returns undefined for unknown ID", () => {
    expect(getConnector("nonexistent-connector")).toBeUndefined();
  });

  it("listConnectors returns entries with capability", () => {
    const connectors = listConnectors();
    expect(connectors.length).toBeGreaterThanOrEqual(12);
    for (const entry of connectors) {
      expect(entry.capability).toBeDefined();
      expect(entry.capability.connectorId).toBeTruthy();
      expect(entry.capability.name).toBeTruthy();
    }
  });

  it("each capability has valid shape", () => {
    for (const cap of CONNECTOR_CAPABILITIES) {
      expect(cap.connectorId).toBeTruthy();
      expect(cap.name).toBeTruthy();
      expect(cap.scopes).toBeInstanceOf(Array);
      expect(cap.actions).toBeInstanceOf(Array);
      expect(["beta", "planned", "ga", "deprecated"]).toContain(cap.status);
    }
  });
});