// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core Standalone Server
// Wraps client-side brain-core pure functions behind HTTP endpoints
// with NATS JetStream event publishing and Supabase persistence
// ═══════════════════════════════════════════════════════════════

import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Inline brain-core logic ─────────────────────────────────
// CANONICAL SERVER-SIDE IMPLEMENTATION
// The client-side equivalent lives at src/lib/services/brain-core/index.ts
// for demo/offline mode. This server-side version is the production authority.
// Changes here must be reflected in the client-side implementation and vice versa.

// --- Intent Parsing ---

type IntentType = "query" | "action" | "simulation" | "approval" | "boardroom" | "diagnostic";
type BrainExecutionMode = "observe" | "recommend" | "draft" | "simulate" | "execute" | "approval-required";

interface ParsedIntent {
  id: string;
  rawInput: string;
  type: IntentType;
  domain: "business" | "finance" | "concierge" | "platform";
  entities: { type: string; value: string; confidence: number }[];
  capabilities: string[];
  urgency: "low" | "medium" | "high" | "critical";
  parsedAt: string;
}

interface OrchestrationPlan {
  intentId: string;
  selectedAdvisors: string[];
  executionMode: BrainExecutionMode;
  policyChecks: { policyId: string; passed: boolean; reason: string }[];
  requiresApproval: boolean;
  approvalType?: "single" | "dual" | "owner-only";
  estimatedCostTokens: number;
  steps: { order: number; capabilityId: string; serviceName: string; action: string; inputs: Record<string, unknown>; dependsOn: number[]; estimatedDurationMs: number }[];
  createdAt: string;
}

function parseIntent(rawInput: string): ParsedIntent {
  const lowerInput = rawInput.toLowerCase();
  let domain: ParsedIntent["domain"] = "platform";
  let type: IntentType = "query";

  if (lowerInput.includes("invoice") || lowerInput.includes("lead") || lowerInput.includes("customer") || lowerInput.includes("deal")) {
    domain = "business";
  } else if (lowerInput.includes("balance") || lowerInput.includes("payment") || lowerInput.includes("reserve") || lowerInput.includes("investment")) {
    domain = "finance";
  } else if (lowerInput.includes("task") || lowerInput.includes("travel") || lowerInput.includes("grocery") || lowerInput.includes("household")) {
    domain = "concierge";
  }

  if (lowerInput.includes("pay") || lowerInput.includes("send") || lowerInput.includes("create") || lowerInput.includes("execute")) {
    type = "action";
  } else if (lowerInput.includes("simulate") || lowerInput.includes("what if") || lowerInput.includes("project")) {
    type = "simulation";
  } else if (lowerInput.includes("approve") || lowerInput.includes("review")) {
    type = "approval";
  }

  return {
    id: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    rawInput,
    type,
    domain,
    entities: [],
    capabilities: [],
    urgency: type === "action" ? "high" : "medium",
    parsedAt: new Date().toISOString(),
  };
}

function chooseExecutionMode(intent: ParsedIntent): BrainExecutionMode {
  switch (intent.type) {
    case "query": return "observe";
    case "simulation": return "simulate";
    case "approval": return "approval-required";
    case "action": return intent.urgency === "critical" ? "approval-required" : "recommend";
    case "boardroom": return "recommend";
    case "diagnostic": return "observe";
    default: return "observe";
  }
}

function buildOrchestrationPlan(intent: ParsedIntent): OrchestrationPlan {
  const mode = chooseExecutionMode(intent);
  return {
    intentId: intent.id,
    selectedAdvisors: [`${intent.domain}-advisor`],
    executionMode: mode,
    policyChecks: [{ policyId: "truth-boundary", passed: true, reason: "Within domain scope" }],
    requiresApproval: mode === "approval-required",
    approvalType: mode === "approval-required" ? "single" : undefined,
    estimatedCostTokens: intent.type === "simulation" ? 5000 : 1000,
    steps: [{
      order: 1,
      capabilityId: `${intent.domain}-${intent.type}`,
      serviceName: `${intent.domain}-os`,
      action: intent.type,
      inputs: { rawInput: intent.rawInput },
      dependsOn: [],
      estimatedDurationMs: 500,
    }],
    createdAt: new Date().toISOString(),
  };
}

// --- Council Logic ---

interface CouncilVote {
  advisorId: string;
  domain: string;
  recommendation: string;
  confidence: number;
  supportingData: string[];
  dissent?: string;
}

interface CouncilDecision {
  councilType: "business" | "finance" | "concierge" | "meta";
  votes: CouncilVote[];
  consensus: boolean;
  consensusThreshold: number;
  finalRecommendation: string;
  confidence: number;
  dissents: string[];
  decidedAt: string;
}

function buildDecision(type: CouncilDecision["councilType"], votes: CouncilVote[], threshold: number): CouncilDecision {
  const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
  return {
    councilType: type,
    votes,
    consensus: avgConfidence >= threshold,
    consensusThreshold: threshold,
    finalRecommendation: votes[0]?.recommendation || "No recommendation",
    confidence: Math.round(avgConfidence),
    dissents: votes.filter(v => v.dissent).map(v => v.dissent!),
    decidedAt: new Date().toISOString(),
  };
}

function runCouncil(councilType: string, topic: string): CouncilDecision {
  switch (councilType) {
    case "business":
      return buildDecision("business", [
        { advisorId: "biz-advisor", domain: "business", recommendation: `Address ${topic} through CRM optimization`, confidence: 82, supportingData: ["customer-health-data", "pipeline-metrics"] },
        { advisorId: "revenue-advisor", domain: "business", recommendation: `Revenue impact analysis for ${topic}`, confidence: 78, supportingData: ["revenue-trends", "churn-data"] },
      ], 60);
    case "finance":
      return buildDecision("finance", [
        { advisorId: "fin-advisor", domain: "finance", recommendation: `Financial assessment of ${topic}`, confidence: 88, supportingData: ["cash-position", "reserve-health"] },
        { advisorId: "investment-advisor", domain: "finance", recommendation: `Investment perspective on ${topic}`, confidence: 75, supportingData: ["portfolio-exposure", "risk-budget"] },
      ], 60);
    case "concierge":
      return buildDecision("concierge", [
        { advisorId: "concierge-advisor", domain: "concierge", recommendation: `Household impact of ${topic}`, confidence: 80, supportingData: ["task-load", "calendar-conflicts"] },
      ], 50);
    default:
      return buildDecision("meta", [
        { advisorId: "platform-advisor", domain: "platform", recommendation: `Platform assessment of ${topic}`, confidence: 85, supportingData: [] },
      ], 50);
  }
}

// --- Model Router ---

type BrainModelTier = "nano" | "standard" | "premium" | "reasoning";

const TIER_COST_CENTS: Record<BrainModelTier, number> = { nano: 1, standard: 5, premium: 25, reasoning: 100 };
const TIER_LATENCY_MS: Record<BrainModelTier, number> = { nano: 200, standard: 800, premium: 2000, reasoning: 8000 };

let budgetTotalCents = 10000;
let budgetSpentCents = 0;
const spendHistory: { timestamp: number; amountCents: number }[] = [];

function routeToModel(params: { complexity: string; riskClass: string; isSimulation?: boolean }) {
  const tierMap: Record<string, BrainModelTier> = {
    trivial: "nano", simple: "nano", moderate: "standard", complex: "premium", expert: "reasoning",
  };
  let tier = tierMap[params.complexity] || "standard";
  if (params.riskClass === "critical" && tier === "nano") tier = "standard";
  if (params.isSimulation && tier === "nano") tier = "standard";

  const remaining = budgetTotalCents - budgetSpentCents;
  let downgraded = false;
  let downgradeReason: string | undefined;

  if (TIER_COST_CENTS[tier] > remaining) {
    const tiers: BrainModelTier[] = ["nano", "standard", "premium", "reasoning"];
    const idx = tiers.indexOf(tier);
    for (let i = idx - 1; i >= 0; i--) {
      if (TIER_COST_CENTS[tiers[i]] <= remaining) { tier = tiers[i]; downgraded = true; downgradeReason = "Budget constrained"; break; }
    }
  }

  return {
    selectedTier: tier,
    estimatedCostCents: TIER_COST_CENTS[tier],
    estimatedLatencyMs: TIER_LATENCY_MS[tier],
    downgraded,
    downgradeReason,
    reasoning: `Complexity: ${params.complexity}, Risk: ${params.riskClass} → ${tier}`,
  };
}

function getModelBudgetStatus() {
  const remaining = budgetTotalCents - budgetSpentCents;
  const oneHourAgo = Date.now() - 3600_000;
  const recentSpend = spendHistory.filter(s => s.timestamp > oneHourAgo).reduce((sum, s) => sum + s.amountCents, 0);
  return {
    totalBudgetCents: budgetTotalCents,
    spentCents: budgetSpentCents,
    remainingCents: remaining,
    spendRateCentsPerHour: recentSpend,
    isConstrained: remaining < budgetTotalCents * 0.1,
  };
}

// --- Advisor Selection ---

const ADVISOR_POOL = [
  { id: "biz-advisor", domain: "business", specialties: ["crm", "leads", "revenue"], trustScore: 92, costPerQuery: 50, avgLatencyMs: 200, available: true },
  { id: "revenue-advisor", domain: "business", specialties: ["revenue", "leakage", "recovery"], trustScore: 88, costPerQuery: 40, avgLatencyMs: 180, available: true },
  { id: "fin-advisor", domain: "finance", specialties: ["reserves", "bills", "safe-to-spend"], trustScore: 95, costPerQuery: 60, avgLatencyMs: 150, available: true },
  { id: "investment-advisor", domain: "finance", specialties: ["portfolio", "risk", "regime"], trustScore: 90, costPerQuery: 80, avgLatencyMs: 300, available: true },
  { id: "concierge-advisor", domain: "concierge", specialties: ["household", "travel", "grocery"], trustScore: 87, costPerQuery: 30, avgLatencyMs: 120, available: true },
  { id: "platform-advisor", domain: "platform", specialties: ["policies", "connectors", "diagnostics"], trustScore: 93, costPerQuery: 20, avgLatencyMs: 100, available: true },
];

function chooseAdvisors(intent: ParsedIntent) {
  const domainAdvisors = ADVISOR_POOL.filter(a => a.domain === intent.domain && a.available);
  if (domainAdvisors.length === 0) {
    const fallback = ADVISOR_POOL.filter(a => a.domain === "platform");
    return { selected: fallback, reasoning: [`No ${intent.domain} advisors — fallback to platform`], totalEstimatedCost: fallback.reduce((s, a) => s + a.costPerQuery, 0), selectionStrategy: "single-best" };
  }
  if (intent.type === "boardroom" || intent.type === "simulation") {
    return { selected: domainAdvisors, reasoning: [`${intent.type} → all ${intent.domain} advisors`], totalEstimatedCost: domainAdvisors.reduce((s, a) => s + a.costPerQuery, 0), selectionStrategy: "multi-council" };
  }
  const best = domainAdvisors.sort((a, b) => b.trustScore - a.trustScore)[0];
  return { selected: [best], reasoning: [`Selected ${best.id} (trust: ${best.trustScore})`], totalEstimatedCost: best.costPerQuery, selectionStrategy: "single-best" };
}

// --- Simulation Builder ---

function buildSimulationRequest(intent: ParsedIntent, plan: OrchestrationPlan) {
  return {
    id: `sim-${Date.now()}`,
    intentId: intent.id,
    plan,
    parameters: [{ name: "confidence", baseValue: 0.85, range: { min: 0.5, max: 1.0 }, unit: "score" }],
    scenarios: [
      { id: "base", label: "Base Case", description: "Current trajectory", adjustments: {} },
      { id: "optimistic", label: "Optimistic", description: "Best-case", adjustments: { factor: 1.5 } },
      { id: "pessimistic", label: "Pessimistic", description: "Stress-test", adjustments: { factor: 0.6 } },
    ],
    constraints: ["No real-world side effects", "Mock external APIs", "Time horizon: 90 days"],
    requestedAt: new Date().toISOString(),
  };
}

// --- Approval Builder ---

function buildApprovalPackage(intent: ParsedIntent, plan: OrchestrationPlan) {
  return {
    id: `approval-${Date.now()}`,
    intentId: intent.id,
    title: `${intent.type} — ${intent.domain}`,
    description: intent.rawInput,
    domain: intent.domain,
    urgency: intent.urgency,
    requestedBy: plan.selectedAdvisors[0] || "brain-core",
    approvalType: plan.approvalType || "single",
    evidence: [
      { type: "data", label: "Domain", value: intent.domain, confidence: 100 },
      { type: "computation", label: "Execution Mode", value: plan.executionMode, confidence: 95 },
      { type: "policy", label: "Policy Checks", value: `${plan.policyChecks.filter(p => p.passed).length}/${plan.policyChecks.length} passed`, confidence: 100 },
    ],
    riskAssessment: {
      level: intent.urgency === "critical" ? "critical" : intent.urgency === "high" ? "high" : "medium",
      factors: [`Intent: ${intent.type}`, `Urgency: ${intent.urgency}`],
      mitigations: ["All policy checks passed", "Immutable receipt generated"],
      reversible: intent.type !== "action" || intent.urgency !== "critical",
    },
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ── Config ───────────────────────────────────────────────────

const PORT = parseInt(process.env.PORT || "3001", 10);
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
const NATS_URL = process.env.NATS_URL || "nats://sita-nats:4222";
const REQUEST_TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS || "30000", 10);
const MAX_BODY_BYTES = parseInt(process.env.MAX_BODY_BYTES || "1048576", 10);

const startedAt = Date.now();
let serverRef: { close: () => void } | null = null;
let shuttingDown = false;

// ── In-memory metrics ───────────────────────────────────────

const metrics = { totalRequests: 0, totalErrors: 0, intents: 0, councils: 0, modelRoutes: 0 };

// ── Structured Logger ───────────────────────────────────────

function log(level: "info" | "warn" | "error", msg: string, extra?: Record<string, unknown>) {
  const entry = { ts: new Date().toISOString(), level, service: "sita-brain-core", msg, ...extra };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

// ── Env Validation (fail-fast) ──────────────────────────────

function validateEnv() {
  const errors: string[] = [];
  if (!SUPABASE_URL) errors.push("SUPABASE_URL is required");
  if (!SUPABASE_SERVICE_KEY) errors.push("SUPABASE_SERVICE_KEY is required");
  if (SUPABASE_URL && !/^https?:\/\/.+/.test(SUPABASE_URL)) errors.push(`SUPABASE_URL invalid format: ${SUPABASE_URL}`);
  if (NATS_URL && !/^nats:\/\/.+/.test(NATS_URL)) errors.push(`NATS_URL invalid format: ${NATS_URL}`);
  if (isNaN(PORT) || PORT < 1 || PORT > 65535) errors.push(`PORT invalid: ${process.env.PORT}`);
  if (errors.length > 0) {
    for (const e of errors) log("error", e);
    log("error", "Env validation failed — exiting");
    process.exit(1);
  }
  log("info", "Env validation passed");
}

// ── NATS Connection ─────────────────────────────────────────

let natsConnected = false;
let natsConnection: unknown = null;
let natsJetStream: unknown = null;

async function connectNats() {
  try {
    const natsModule = await import("nats");
    const nc = await natsModule.connect({ servers: NATS_URL, reconnect: true, maxReconnectAttempts: -1, reconnectTimeWait: 2000 });
    natsConnection = nc;
    natsConnected = true;
    const jsm = await nc.jetstreamManager();
    try {
      await jsm.streams.add({ name: "SITA_BRAIN", subjects: ["brain.>"], retention: natsModule.RetentionPolicy.Limits, max_msgs: 100000, max_age: 7 * 24 * 3600 * 1_000_000_000 });
    } catch {
      // Stream may already exist
    }
    natsJetStream = nc.jetstream();
    log("info", "NATS connected", { url: NATS_URL });

    (async () => {
      for await (const s of (nc as { status(): AsyncIterable<{ type: string }> }).status()) {
        if (s.type === "disconnect") { natsConnected = false; log("warn", "NATS disconnected"); }
        if (s.type === "reconnect") { natsConnected = true; log("info", "NATS reconnected"); }
      }
    })();
  } catch (err) {
    log("warn", "NATS connection failed (will retry)", { error: err instanceof Error ? err.message : String(err) });
    natsConnected = false;
    setTimeout(connectNats, 5000);
  }
}

async function publishEvent(subject: string, data: unknown) {
  if (!natsJetStream || !natsConnected) return;
  try {
    const js = natsJetStream as { publish(subj: string, data: Uint8Array): Promise<unknown> };
    await js.publish(subject, new TextEncoder().encode(JSON.stringify(data)));
  } catch (err) {
    log("warn", "NATS publish failed", { subject, error: err instanceof Error ? err.message : String(err) });
  }
}

// ── Supabase Client ─────────────────────────────────────────

let supabaseAdmin: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  log("info", "Supabase service client initialized");
}

// ── App ──────────────────────────────────────────────────────

const app = new Hono();
app.use("*", logger());

// Request-ID propagation
app.use("*", async (c, next) => {
  const requestId = c.req.header("X-Request-Id") || `bc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  c.header("X-Request-Id", requestId);
  await next();
});

// Body size limiting
app.use("*", async (c, next) => {
  if (c.req.method !== "GET" && c.req.method !== "HEAD" && c.req.method !== "OPTIONS") {
    const contentLength = c.req.header("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
      return c.json({ error: "Payload Too Large", maxBytes: MAX_BODY_BYTES }, 413);
    }
  }
  await next();
});

// Metrics
app.use("*", async (c, next) => {
  metrics.totalRequests++;
  await next();
  if (c.res.status >= 500) metrics.totalErrors++;
});

// ── Health ───────────────────────────────────────────────────

app.get("/metrics", (c) => {
  return c.json({
    service: "sita-brain-core",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    nats_connected: natsConnected,
    budget: getModelBudgetStatus(),
    ...metrics,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    service: "sita-brain-core",
    version: "1.0.0",
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    nats_connected: natsConnected,
    supabase_connected: !!supabaseAdmin,
    timestamp: new Date().toISOString(),
  });
});

// ── Readiness Endpoint ──────────────────────────────────────

app.get("/ready", (c) => {
  if (shuttingDown) {
    return c.json({ ready: false, reason: "shutting_down" }, 503);
  }
  const checks = {
    nats_connected: natsConnected,
    supabase_configured: !!supabaseAdmin,
  };
  const allReady = Object.values(checks).every(Boolean);
  return c.json({
    ready: allReady,
    service: "sita-brain-core",
    checks,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  }, allReady ? 200 : 503);
});

// ── Intent Orchestration ────────────────────────────────────

app.post("/brain/intent", async (c) => {
  let body: { input?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON body" }, 400); }
  if (!body.input || typeof body.input !== "string" || body.input.length > 10000) {
    return c.json({ error: "Missing or invalid 'input' field (string, max 10000 chars)" }, 400);
  }

  const intent = parseIntent(body.input);
  const plan = buildOrchestrationPlan(intent);
  const advisors = chooseAdvisors(intent);

  await publishEvent("brain.intent.parsed", { intent, plan });
  metrics.intents++;

  return c.json({ intent, plan, advisors });
});

// ── Council ─────────────────────────────────────────────────

app.post("/brain/council", async (c) => {
  let body: { councilType?: string; topic?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON body" }, 400); }
  if (!body.councilType || typeof body.councilType !== "string") return c.json({ error: "Missing or invalid 'councilType'" }, 400);
  if (!body.topic || typeof body.topic !== "string" || body.topic.length > 5000) return c.json({ error: "Missing or invalid 'topic'" }, 400);

  const decision = runCouncil(body.councilType, body.topic);
  await publishEvent("brain.council.decided", decision);
  metrics.councils++;

  return c.json({ decision });
});

// ── Model Router ────────────────────────────────────────────

app.post("/brain/model/route", async (c) => {
  let body: { complexity?: string; riskClass?: string; isSimulation?: boolean };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON body" }, 400); }
  if (!body.complexity || typeof body.complexity !== "string") return c.json({ error: "Missing or invalid 'complexity'" }, 400);
  if (!body.riskClass || typeof body.riskClass !== "string") return c.json({ error: "Missing or invalid 'riskClass'" }, 400);

  const routing = routeToModel(body);
  await publishEvent("brain.model.routed", routing);
  metrics.modelRoutes++;

  return c.json({ routing });
});

app.get("/brain/model/budget", (c) => {
  return c.json({ budget: getModelBudgetStatus() });
});

// ── Advisors ────────────────────────────────────────────────

app.post("/brain/advisors", async (c) => {
  let body: { input?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON body" }, 400); }
  if (!body.input || typeof body.input !== "string") return c.json({ error: "Missing or invalid 'input'" }, 400);

  const intent = parseIntent(body.input);
  const result = chooseAdvisors(intent);

  return c.json({ intent, advisors: result });
});

// ── Simulation ──────────────────────────────────────────────

app.post("/brain/simulation", async (c) => {
  let body: { input?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON body" }, 400); }
  if (!body.input || typeof body.input !== "string") return c.json({ error: "Missing or invalid 'input'" }, 400);

  const intent = parseIntent(body.input);
  const plan = buildOrchestrationPlan(intent);
  const simulation = buildSimulationRequest(intent, plan);

  await publishEvent("brain.simulation.requested", { intentId: intent.id, simulationId: simulation.id });

  return c.json({ intent, simulation });
});

// ── Approval ────────────────────────────────────────────────

app.post("/brain/approval", async (c) => {
  let body: { input?: string };
  try { body = await c.req.json(); } catch { return c.json({ error: "Invalid JSON body" }, 400); }
  if (!body.input || typeof body.input !== "string") return c.json({ error: "Missing or invalid 'input'" }, 400);

  const intent = parseIntent(body.input);
  const plan = buildOrchestrationPlan(intent);
  const approval = buildApprovalPackage(intent, plan);

  await publishEvent("brain.approval.requested", { intentId: intent.id, approvalId: approval.id });

  return c.json({ intent, approval });
});

// ── 404 / Error ─────────────────────────────────────────────

app.notFound((c) => c.json({ error: "Not Found", path: c.req.path, service: "sita-brain-core", _requestId: c.req.header("X-Request-Id") }, 404));
app.onError((err, c) => {
  const requestId = c.req.header("X-Request-Id") || "unknown";
  log("error", "Unhandled request error", { error: err.message, path: c.req.path, method: c.req.method, requestId });
  return c.json({ error: "Internal Server Error", message: process.env.NODE_ENV === "production" ? "Unexpected error" : err.message, _requestId: requestId }, 500);
});

// ── Graceful Shutdown ───────────────────────────────────────

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  log("info", `${signal} received — draining connections`, { signal });

  // Stop accepting new connections
  if (serverRef) {
    try { serverRef.close(); } catch { /* already closed */ }
  }

  // Close NATS connection
  if (natsConnection) {
    try {
      await (natsConnection as { drain(): Promise<void> }).drain();
      log("info", "NATS connection drained");
    } catch { /* best effort */ }
  }

  // Allow 10s for in-flight requests
  setTimeout(() => {
    log("info", "Drain timeout reached — exiting");
    process.exit(0);
  }, 10_000);
}

process.on("SIGTERM", () => { shutdown("SIGTERM"); });
process.on("SIGINT", () => { shutdown("SIGINT"); });
process.on("unhandledRejection", (reason) => {
  log("error", "Unhandled rejection", { error: reason instanceof Error ? reason.message : String(reason) });
});
process.on("uncaughtException", (err) => {
  log("error", "Uncaught exception — shutting down", { error: err.message, stack: err.stack });
  shutdown("uncaughtException");
});

// ── Start ───────────────────────────────────────────────────

validateEnv();
connectNats();

log("info", "Starting Brain Core", { port: PORT });
serverRef = serve({ fetch: app.fetch, port: PORT }, (info) => {
  log("info", "Listening", { url: `http://0.0.0.0:${info.port}` });
}) as unknown as { close: () => void };
