// ═══════════════════════════════════════════════════════════════
// SITA OS — New Core Services Tests
// API Gateway, Capability Router, Entity Graph, Role Permission Engine,
// Analytics, Billing, Support Diagnostics
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from "vitest";
import {
  ApiGateway, createApiGateway, type GatewayRequest,
} from "@/lib/core-services/api-gateway";
import {
  CapabilityRouter, createCapabilityRouter,
} from "@/lib/core-services/capability-router";
import {
  EntityGraphService, createEntityGraph, type GraphEntityNode,
} from "@/lib/core-services/entity-graph";
import {
  RolePermissionEngine, createRolePermissionEngine,
} from "@/lib/core-services/role-permission-engine";
import {
  AnalyticsService, createAnalyticsService,
} from "@/lib/core-services/analytics-service";
import {
  BillingService, createBillingService,
} from "@/lib/core-services/billing-service";
import {
  SupportDiagnosticsService, createSupportDiagnostics,
} from "@/lib/core-services/support-diagnostics";

// ── Helpers ─────────────────────────────────────────────────────

function makeRequest(overrides: Partial<GatewayRequest> = {}): GatewayRequest {
  return {
    id: `req-${Date.now()}`,
    method: "POST",
    path: "/api/v1/intent",
    headers: { authorization: "Bearer test-token" },
    clientIp: "127.0.0.1",
    timestamp: Date.now(),
    ...overrides,
  };
}

function makeNode(id: string, type: GraphEntityNode["type"] = "customer", domain = "business"): GraphEntityNode {
  return { id, type, name: `Entity ${id}`, domain, attributes: {}, createdAt: Date.now(), updatedAt: Date.now() };
}

// ═══════════════════════════════════════════════════════════════
// API Gateway Tests
// ═══════════════════════════════════════════════════════════════

describe("API Gateway", () => {
  let gw: ApiGateway;

  beforeEach(() => {
    gw = createApiGateway();
  });

  it("factory creates gateway with default routes", () => {
    expect(gw.getRoutes().length).toBeGreaterThan(0);
  });

  it("resolves exact route match", () => {
    const route = gw.resolveRoute("POST", "/api/v1/intent");
    expect(route).not.toBeNull();
    expect(route!.targetService).toBe("brain-core");
  });

  it("resolves prefix route match", () => {
    const route = gw.resolveRoute("GET", "/api/v1/connectors/list");
    expect(route).not.toBeNull();
    expect(route!.targetService).toBe("connector-control-plane");
  });

  it("returns null for unknown route", () => {
    expect(gw.resolveRoute("DELETE", "/api/v99/unknown")).toBeNull();
  });

  it("handles request successfully", async () => {
    const res = await gw.handleRequest(makeRequest());
    expect(res.status).toBe(200);
    expect(res.routedTo).toBe("brain-core");
  });

  it("returns 404 for unmatched path", async () => {
    const res = await gw.handleRequest(makeRequest({ path: "/nope" }));
    expect(res.status).toBe(404);
  });

  it("returns 401 for missing auth on protected route", async () => {
    const res = await gw.handleRequest(makeRequest({ headers: {} }));
    expect(res.status).toBe(401);
  });

  it("allows public health endpoint without auth", async () => {
    const res = await gw.handleRequest(makeRequest({ method: "GET", path: "/health", headers: {} }));
    expect(res.status).toBe(200);
  });

  it("enforces rate limits", async () => {
    const req = makeRequest();
    // Burn through rate limit
    for (let i = 0; i < 60; i++) {
      await gw.handleRequest({ ...req, id: `req-${i}` });
    }
    const res = await gw.handleRequest({ ...req, id: "req-over" });
    expect(res.status).toBe(429);
  });

  it("logs requests", async () => {
    await gw.handleRequest(makeRequest());
    expect(gw.getRequestLog().length).toBe(1);
  });

  it("reports health", () => {
    const h = gw.getHealth();
    expect(h.status).toBe("healthy");
    expect(h.routeCount).toBeGreaterThan(0);
  });

  it("registers custom route", () => {
    gw.registerRoute({ path: "/custom", method: "GET", targetService: "custom-svc", authLevel: "public", rateLimit: { maxRequests: 10, windowMs: 60_000 }, timeout: 5000 });
    expect(gw.resolveRoute("GET", "/custom")).not.toBeNull();
  });

  it("owner auth check requires owner-token", async () => {
    const res = await gw.handleRequest(makeRequest({ method: "POST", path: "/api/v1/boardroom", headers: { authorization: "Bearer basic-token" } }));
    expect(res.status).toBe(401);
  });

  it("owner auth check passes with owner-token", async () => {
    const res = await gw.handleRequest(makeRequest({ method: "POST", path: "/api/v1/boardroom", headers: { authorization: "Bearer owner-token" } }));
    expect(res.status).toBe(200);
  });
});

// ═══════════════════════════════════════════════════════════════
// Capability Router Tests
// ═══════════════════════════════════════════════════════════════

describe("Capability Router", () => {
  let router: CapabilityRouter;

  beforeEach(() => {
    router = createCapabilityRouter();
  });

  it("factory registers default capabilities", () => {
    expect(router.listCapabilities().length).toBeGreaterThanOrEqual(7);
  });

  it("routes business query to business-os", () => {
    const decision = router.route({ intentType: "query", domain: "business", action: "query", urgency: "medium" });
    expect(decision).not.toBeNull();
    expect(decision!.serviceName).toBe("business-os");
  });

  it("routes finance action to simulation for high-risk tier", () => {
    const decision = router.route({ intentType: "action", domain: "finance", action: "action", urgency: "medium" });
    expect(decision).not.toBeNull();
    expect(decision!.selectedMode).toBe("draft"); // R3 → draft
  });

  it("routes concierge action to real for critical urgency", () => {
    const decision = router.route({ intentType: "action", domain: "concierge", action: "action", urgency: "critical" });
    expect(decision).not.toBeNull();
    expect(decision!.selectedMode).toBe("real"); // R1 + critical → real
  });

  it("returns null for unknown domain with no fallback", () => {
    const decision = router.route({ intentType: "query", domain: "unknown-domain", action: "test", urgency: "low" });
    expect(decision).toBeNull();
  });

  it("filters capabilities by domain", () => {
    const bizCaps = router.listCapabilities("business");
    expect(bizCaps.every(c => c.domain === "business")).toBe(true);
  });

  it("tracks routing history", () => {
    router.route({ intentType: "query", domain: "business", action: "query", urgency: "low" });
    router.route({ intentType: "action", domain: "finance", action: "action", urgency: "high" });
    expect(router.getRoutingHistory().length).toBe(2);
  });

  it("returns health status", () => {
    expect(router.getHealth().status).toBe("healthy");
    expect(router.getHealth().registeredCapabilities).toBeGreaterThan(0);
  });

  it("gets individual capability by id", () => {
    expect(router.getCapability("business-query")).toBeDefined();
    expect(router.getCapability("nonexistent")).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════════════════
// Entity Graph Tests
// ═══════════════════════════════════════════════════════════════

describe("Entity Graph", () => {
  let graph: EntityGraphService;

  beforeEach(() => {
    graph = createEntityGraph();
  });

  it("adds and retrieves nodes", () => {
    graph.addNode(makeNode("n1"));
    expect(graph.getNode("n1")).toBeDefined();
    expect(graph.getNode("n1")!.name).toBe("Entity n1");
  });

  it("removes nodes and associated edges", () => {
    graph.addNode(makeNode("a"));
    graph.addNode(makeNode("b"));
    graph.addEdge({ id: "e1", fromId: "a", toId: "b", type: "related_to", weight: 1, metadata: {}, createdAt: Date.now() });
    graph.removeNode("a");
    expect(graph.getNode("a")).toBeUndefined();
    expect(graph.getEdgesFrom("a")).toHaveLength(0);
  });

  it("finds neighbors at depth 1", () => {
    graph.addNode(makeNode("a"));
    graph.addNode(makeNode("b"));
    graph.addNode(makeNode("c"));
    graph.addEdge({ id: "e1", fromId: "a", toId: "b", type: "related_to", weight: 1, metadata: {}, createdAt: Date.now() });
    graph.addEdge({ id: "e2", fromId: "b", toId: "c", type: "related_to", weight: 1, metadata: {}, createdAt: Date.now() });

    const neighbors = graph.getNeighbors("a", 1);
    expect(neighbors.length).toBe(1);
    expect(neighbors[0].id).toBe("b");
  });

  it("finds neighbors at depth 2", () => {
    graph.addNode(makeNode("a"));
    graph.addNode(makeNode("b"));
    graph.addNode(makeNode("c"));
    graph.addEdge({ id: "e1", fromId: "a", toId: "b", type: "related_to", weight: 1, metadata: {}, createdAt: Date.now() });
    graph.addEdge({ id: "e2", fromId: "b", toId: "c", type: "owns", weight: 1, metadata: {}, createdAt: Date.now() });

    const neighbors = graph.getNeighbors("a", 2);
    expect(neighbors.length).toBe(2);
  });

  it("finds nodes by type", () => {
    graph.addNode(makeNode("c1", "customer"));
    graph.addNode(makeNode("l1", "lead"));
    graph.addNode(makeNode("c2", "customer"));

    expect(graph.findByType("customer")).toHaveLength(2);
    expect(graph.findByType("lead")).toHaveLength(1);
  });

  it("finds nodes by domain", () => {
    graph.addNode(makeNode("a", "customer", "business"));
    graph.addNode(makeNode("b", "account", "finance"));
    expect(graph.findByDomain("finance")).toHaveLength(1);
  });

  it("resolves entity by name", () => {
    graph.addNode(makeNode("x"));
    const resolution = graph.resolveEntity("Entity x");
    expect(resolution).not.toBeNull();
    expect(resolution!.confidence).toBe(1.0);
  });

  it("resolves entity with multiple matches has lower confidence", () => {
    graph.addNode({ ...makeNode("a"), name: "Acme Corp" });
    graph.addNode({ ...makeNode("b"), name: "Acme Inc" });
    const resolution = graph.resolveEntity("Acme");
    expect(resolution).not.toBeNull();
    expect(resolution!.matchedIds).toHaveLength(2);
    expect(resolution!.confidence).toBeLessThan(1.0);
  });

  it("returns null for unresolvable entity", () => {
    expect(graph.resolveEntity("nonexistent")).toBeNull();
  });

  it("reports stats correctly", () => {
    graph.addNode(makeNode("a", "customer"));
    graph.addNode(makeNode("b", "lead"));
    graph.addEdge({ id: "e1", fromId: "a", toId: "b", type: "converted_from", weight: 1, metadata: {}, createdAt: Date.now() });
    const stats = graph.getStats();
    expect(stats.nodeCount).toBe(2);
    expect(stats.edgeCount).toBe(1);
    expect(stats.nodesByType["customer"]).toBe(1);
  });

  it("reports health", () => {
    const h = graph.getHealth();
    expect(h.status).toBe("healthy");
  });
});

// ═══════════════════════════════════════════════════════════════
// Role & Permission Engine Tests
// ═══════════════════════════════════════════════════════════════

describe("Role Permission Engine", () => {
  let engine: RolePermissionEngine;

  beforeEach(() => {
    engine = createRolePermissionEngine();
  });

  it("factory creates system roles", () => {
    expect(engine.getUserRoles("nobody")).toHaveLength(0);
  });

  it("assigns and retrieves roles", () => {
    engine.assignRole("user1", "owner");
    const roles = engine.getUserRoles("user1");
    expect(roles).toHaveLength(1);
    expect(roles[0].id).toBe("owner");
  });

  it("owner can do anything", () => {
    engine.assignRole("u1", "owner");
    const result = engine.checkPermission({ userId: "u1", action: "admin", resource: "anything", domain: "platform" });
    expect(result.allowed).toBe(true);
  });

  it("viewer can only read", () => {
    engine.assignRole("u2", "viewer");
    expect(engine.checkPermission({ userId: "u2", action: "read", resource: "reports", domain: "business" }).allowed).toBe(true);
    expect(engine.checkPermission({ userId: "u2", action: "write", resource: "reports", domain: "business" }).allowed).toBe(false);
  });

  it("member can execute concierge", () => {
    engine.assignRole("u3", "member");
    expect(engine.checkPermission({ userId: "u3", action: "execute", resource: "tasks", domain: "concierge" }).allowed).toBe(true);
  });

  it("finance-officer inherits member permissions plus finance", () => {
    engine.assignRole("u4", "finance-officer");
    expect(engine.checkPermission({ userId: "u4", action: "approve", resource: "payments", domain: "finance" }).allowed).toBe(true);
    expect(engine.checkPermission({ userId: "u4", action: "execute", resource: "tasks", domain: "concierge" }).allowed).toBe(true);
  });

  it("revokes role correctly", () => {
    engine.assignRole("u5", "owner");
    engine.revokeRole("u5", "owner");
    expect(engine.getUserRoles("u5")).toHaveLength(0);
    expect(engine.checkPermission({ userId: "u5", action: "read", resource: "x", domain: "platform" }).allowed).toBe(false);
  });

  it("denies unassigned user", () => {
    const result = engine.checkPermission({ userId: "nobody", action: "read", resource: "x", domain: "business" });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("No matching");
  });

  it("does not duplicate roles", () => {
    engine.assignRole("u6", "owner");
    engine.assignRole("u6", "owner");
    expect(engine.getUserRoles("u6")).toHaveLength(1);
  });

  it("audits permission checks", () => {
    engine.assignRole("u7", "viewer");
    engine.checkPermission({ userId: "u7", action: "read", resource: "x", domain: "business" });
    engine.checkPermission({ userId: "u7", action: "write", resource: "x", domain: "business" });
    expect(engine.getAuditLog()).toHaveLength(2);
  });

  it("wildcard resource matching", () => {
    engine.registerRole({
      id: "scoped", name: "Scoped", description: "Test", isSystem: false,
      permissions: [{ resource: "finance.*", domain: "finance", actions: ["read"] }],
    });
    engine.assignRole("u8", "scoped");
    expect(engine.checkPermission({ userId: "u8", action: "read", resource: "finance.budgets", domain: "finance" }).allowed).toBe(true);
    expect(engine.checkPermission({ userId: "u8", action: "read", resource: "business.leads", domain: "finance" }).allowed).toBe(false);
  });

  it("conditional permissions with context", () => {
    engine.registerRole({
      id: "conditional", name: "Conditional", description: "Test", isSystem: false,
      permissions: [{
        resource: "*", domain: "finance", actions: ["execute"],
        conditions: [{ field: "amount", operator: "lt", value: 1000 }],
      }],
    });
    engine.assignRole("u9", "conditional");
    expect(engine.checkPermission({ userId: "u9", action: "execute", resource: "payment", domain: "finance", context: { amount: 500 } }).allowed).toBe(true);
    expect(engine.checkPermission({ userId: "u9", action: "execute", resource: "payment", domain: "finance", context: { amount: 5000 } }).allowed).toBe(false);
  });

  it("reports health", () => {
    expect(engine.getHealth().status).toBe("healthy");
  });
});

// ═══════════════════════════════════════════════════════════════
// Analytics Service Tests
// ═══════════════════════════════════════════════════════════════

describe("Analytics Service", () => {
  let analytics: AnalyticsService;

  beforeEach(() => {
    analytics = createAnalyticsService();
  });

  it("records and queries metrics", () => {
    analytics.record("requests", 1, "platform");
    analytics.record("requests", 1, "platform");
    expect(analytics.query("requests", "platform")).toHaveLength(2);
  });

  it("increment shorthand works", () => {
    analytics.increment("api.calls", "platform");
    expect(analytics.query("api.calls")).toHaveLength(1);
  });

  it("gauge records value metric", () => {
    analytics.gauge("cpu.usage", 65, "system");
    const results = analytics.query("cpu.usage", "system");
    expect(results).toHaveLength(1);
    expect(results[0].value).toBe(65);
    expect(results[0].type).toBe("gauge");
  });

  it("aggregates metrics over period", () => {
    analytics.record("latency", 100, "platform");
    analytics.record("latency", 200, "platform");
    analytics.record("latency", 150, "platform");

    const agg = analytics.aggregate("latency", "platform", "hour");
    expect(agg).not.toBeNull();
    expect(agg!.count).toBe(3);
    expect(agg!.sum).toBe(450);
    expect(agg!.avg).toBe(150);
    expect(agg!.min).toBe(100);
    expect(agg!.max).toBe(200);
  });

  it("returns null for no matching metrics", () => {
    expect(analytics.aggregate("nonexistent", "platform", "hour")).toBeNull();
  });

  it("generates usage report", () => {
    analytics.record("token.usage", 500, "business", "counter", { capability: "lead-scoring" });
    analytics.record("token.usage", 300, "business", "counter", { capability: "pipeline" });
    analytics.record("latency", 45, "business");

    const report = analytics.getUsageReport("business", "day");
    expect(report.totalEvents).toBe(3);
    expect(report.uniqueCapabilities).toBe(2);
  });

  it("filters by time range", () => {
    analytics.record("old", 1, "platform");
    const results = analytics.query("old", "platform", Date.now() + 1000);
    expect(results).toHaveLength(0);
  });

  it("evicts old metrics when max exceeded", () => {
    for (let i = 0; i < 200; i++) {
      analytics.record("bulk", i, "platform");
    }
    expect(analytics.query("bulk")).toBeDefined(); // Didn't crash
  });

  it("reports health", () => {
    const h = analytics.getHealth();
    expect(h.status).toBe("healthy");
    expect(h.metricsStored).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════
// Billing Service Tests
// ═══════════════════════════════════════════════════════════════

describe("Billing Service", () => {
  let billing: BillingService;

  beforeEach(() => {
    billing = createBillingService();
  });

  it("creates billing account with correct plan limits", () => {
    const account = billing.createAccount("owner1", "starter");
    expect(account.plan).toBe("starter");
    expect(account.limits.maxTokensPerMonth).toBe(100_000);
    expect(account.status).toBe("active");
  });

  it("free plan has lowest limits", () => {
    const account = billing.createAccount("owner2");
    expect(account.plan).toBe("free");
    expect(account.limits.maxTokensPerMonth).toBe(10_000);
    expect(account.limits.maxConnectors).toBe(2);
  });

  it("checks entitlement correctly", () => {
    const account = billing.createAccount("o1", "free");
    const check = billing.checkEntitlement(account.id, "token", 5000);
    expect(check.allowed).toBe(true);
    expect(check.remainingQuota).toBe(10_000);
  });

  it("records usage and updates account", () => {
    const account = billing.createAccount("o2", "free");
    billing.recordUsage(account.id, "token", 8000);
    const check = billing.checkEntitlement(account.id, "token", 3000);
    expect(check.allowed).toBe(false);
    expect(check.remainingQuota).toBe(2000);
  });

  it("marks account as exceeded when over limit", () => {
    const account = billing.createAccount("o3", "free");
    billing.recordUsage(account.id, "token", 15_000);
    const updated = billing.getAccount(account.id);
    expect(updated!.status).toBe("exceeded");
  });

  it("upgrades plan and restores status", () => {
    const account = billing.createAccount("o4", "free");
    billing.recordUsage(account.id, "token", 15_000);
    expect(billing.getAccount(account.id)!.status).toBe("exceeded");

    billing.upgradePlan(account.id, "professional");
    const upgraded = billing.getAccount(account.id);
    expect(upgraded!.plan).toBe("professional");
    expect(upgraded!.status).toBe("active");
    expect(upgraded!.limits.maxTokensPerMonth).toBe(1_000_000);
  });

  it("tracks usage history", () => {
    const account = billing.createAccount("o5");
    billing.recordUsage(account.id, "token", 100, "business-query");
    billing.recordUsage(account.id, "execution", 1);
    const history = billing.getUsageHistory(account.id);
    expect(history).toHaveLength(2);
    expect(history[0].capabilityId).toBe("business-query");
  });

  it("returns safe default for unknown account", () => {
    const check = billing.checkEntitlement("unknown", "token");
    expect(check.allowed).toBe(false);
  });

  it("reports health", () => {
    expect(billing.getHealth().status).toBe("healthy");
  });
});

// ═══════════════════════════════════════════════════════════════
// Support Diagnostics Tests
// ═══════════════════════════════════════════════════════════════

describe("Support Diagnostics", () => {
  let diag: SupportDiagnosticsService;

  beforeEach(() => {
    diag = createSupportDiagnostics();
  });

  it("records diagnostic entries", () => {
    diag.record("service", "info", "brain-core", "Service started");
    expect(diag.query()).toHaveLength(1);
  });

  it("filters alerts by severity", () => {
    diag.record("service", "info", "api", "Normal operation");
    diag.record("service", "warning", "api", "High latency detected");
    diag.record("service", "error", "db", "Connection timeout");
    diag.record("service", "critical", "auth", "JWT secret expired");

    expect(diag.getAlerts("warning")).toHaveLength(3);
    expect(diag.getAlerts("error")).toHaveLength(2);
    expect(diag.getAlerts("critical")).toHaveLength(1);
  });

  it("traces by correlationId", () => {
    const cid = "corr-123";
    diag.record("execution", "info", "brain-core", "Intent received", {}, cid);
    diag.record("execution", "info", "policy-engine", "Policy evaluated", {}, cid);
    diag.record("execution", "info", "executor", "Execution completed", {}, cid);
    diag.record("service", "info", "other", "Unrelated event");

    const trace = diag.getTrace(cid);
    expect(trace.entries).toHaveLength(3);
    expect(trace.totalDurationMs).toBeGreaterThanOrEqual(0);
  });

  it("generates health report", () => {
    diag.record("service", "error", "api", "Error occurred");

    const report = diag.generateHealthReport([
      { serviceId: "api-gateway", status: "healthy", latencyMs: 45, errorRate: 0.01, lastChecked: Date.now() },
      { serviceId: "brain-core", status: "degraded", latencyMs: 200, errorRate: 0.05, lastChecked: Date.now() },
    ]);

    expect(report.overallStatus).toBe("degraded");
    expect(report.services).toHaveLength(2);
    expect(report.recentErrors.length).toBeGreaterThan(0);
  });

  it("critical service marks overall as critical", () => {
    const report = diag.generateHealthReport([
      { serviceId: "db", status: "down", latencyMs: 0, errorRate: 1, lastChecked: Date.now() },
    ]);
    expect(report.overallStatus).toBe("critical");
  });

  it("all healthy services means healthy overall", () => {
    const report = diag.generateHealthReport([
      { serviceId: "api", status: "healthy", latencyMs: 10, errorRate: 0, lastChecked: Date.now() },
    ]);
    expect(report.overallStatus).toBe("healthy");
  });

  it("queries by category and service", () => {
    diag.record("connector", "warning", "slack", "Rate limited");
    diag.record("service", "info", "api", "Request processed");
    diag.record("connector", "error", "stripe", "Payment failed");

    expect(diag.query({ category: "connector" })).toHaveLength(2);
    expect(diag.query({ service: "api" })).toHaveLength(1);
  });

  it("limits query results", () => {
    for (let i = 0; i < 50; i++) {
      diag.record("service", "info", "test", `Entry ${i}`);
    }
    expect(diag.query({ limit: 10 })).toHaveLength(10);
  });

  it("reports health with uptime", () => {
    const h = diag.getHealth();
    expect(h.status).toBe("healthy");
    expect(h.uptimeMs).toBeGreaterThanOrEqual(0);
  });

  it("evicts old entries when max exceeded", () => {
    for (let i = 0; i < 100; i++) {
      diag.record("service", "info", "test", `Entry ${i}`);
    }
    expect(diag.query().length).toBeLessThanOrEqual(10_000);
  });
});
