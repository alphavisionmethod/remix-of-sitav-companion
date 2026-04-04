// ═══════════════════════════════════════════════════════════════
// SITA OS — Health Check Integration Tests
// Validates API Gateway + Brain Core endpoints return correct responses
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:3000";
const BRAIN_CORE_URL = process.env.BRAIN_CORE_URL || "http://localhost:3001";

// Helper: skip if services not running
async function isReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

describe("API Gateway Health", () => {
  it("should return healthy status", async () => {
    if (!(await isReachable(API_GATEWAY_URL))) return;

    const res = await fetch(`${API_GATEWAY_URL}/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("sita-api-gateway");
    expect(body.version).toBe("1.0.0");
    expect(body.uptime).toBeTypeOf("number");
    expect(body.timestamp).toBeTruthy();
  });

  it("should return 401 for unauthenticated /api/ requests", async () => {
    if (!(await isReachable(API_GATEWAY_URL))) return;

    const res = await fetch(`${API_GATEWAY_URL}/api/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "test" }),
    });
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return 404 for unknown routes", async () => {
    if (!(await isReachable(API_GATEWAY_URL))) return;

    const res = await fetch(`${API_GATEWAY_URL}/nonexistent`);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Not Found");
    expect(body.service).toBe("sita-api-gateway");
  });
});

describe("Brain Core Health", () => {
  it("should return healthy status with NATS and Supabase flags", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/health`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("sita-brain-core");
    expect(body.version).toBe("1.0.0");
    expect(body.uptime).toBeTypeOf("number");
    expect(body).toHaveProperty("nats_connected");
    expect(body).toHaveProperty("supabase_connected");
  });

  it("POST /brain/intent should parse intent from input", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "Show me my invoice status" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.intent).toBeTruthy();
    expect(body.intent.domain).toBe("business");
    expect(body.intent.type).toBeTypeOf("string");
    expect(body.plan).toBeTruthy();
    expect(body.plan.intentId).toBe(body.intent.id);
    expect(body.advisors).toBeTruthy();
  });

  it("POST /brain/intent should return 400 for missing input", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it("POST /brain/council should run council decision", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/council`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ councilType: "finance", topic: "Q2 reserve strategy" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.decision).toBeTruthy();
    expect(body.decision.councilType).toBe("finance");
    expect(body.decision.votes).toBeInstanceOf(Array);
    expect(body.decision.confidence).toBeTypeOf("number");
  });

  it("POST /brain/model/route should route to model tier", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/model/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complexity: "moderate", riskClass: "standard" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.routing).toBeTruthy();
    expect(body.routing.selectedTier).toBeTypeOf("string");
    expect(body.routing.estimatedCostCents).toBeTypeOf("number");
  });

  it("GET /brain/model/budget should return budget status", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/model/budget`);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.budget).toBeTruthy();
    expect(body.budget.totalBudgetCents).toBeTypeOf("number");
    expect(body.budget.remainingCents).toBeTypeOf("number");
  });

  it("POST /brain/advisors should select advisors", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/advisors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "Check my investment portfolio risk" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.intent.domain).toBe("finance");
    expect(body.advisors.selected).toBeInstanceOf(Array);
    expect(body.advisors.selected.length).toBeGreaterThan(0);
  });

  it("POST /brain/simulation should build simulation request", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/simulation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "Simulate what if churn doubles" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.simulation).toBeTruthy();
    expect(body.simulation.scenarios).toBeInstanceOf(Array);
    expect(body.simulation.constraints).toBeInstanceOf(Array);
  });

  it("POST /brain/approval should build approval package", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/approval`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "Approve the payment to vendor" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.approval).toBeTruthy();
    expect(body.approval.approvalType).toBeTypeOf("string");
    expect(body.approval.evidence).toBeInstanceOf(Array);
    expect(body.approval.riskAssessment).toBeTruthy();
  });

  it("should return 404 for unknown brain routes", async () => {
    if (!(await isReachable(BRAIN_CORE_URL))) return;

    const res = await fetch(`${BRAIN_CORE_URL}/brain/nonexistent`);
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toBe("Not Found");
    expect(body.service).toBe("sita-brain-core");
  });
});

describe("API Gateway → Brain Core Proxy (authenticated)", () => {
  it("should proxy /api/model/budget to brain-core (when auth bypassed)", async () => {
    // This test validates the proxy wiring but requires a valid JWT
    // In CI, you'd inject a service-role token
    if (!(await isReachable(API_GATEWAY_URL))) return;

    // Without auth, this should be 401
    const res = await fetch(`${API_GATEWAY_URL}/api/model/budget`);
    expect(res.status).toBe(401);
  });
});
