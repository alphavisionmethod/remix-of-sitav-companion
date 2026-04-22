// ═══════════════════════════════════════════════════════════════
// SITA OS — Brain Core Smoke Test
// Hit /health, /ready, /brain/intent with test payload.
// Run: npx tsx smoke.test.ts
// ═══════════════════════════════════════════════════════════════

const BASE = process.env.BRAIN_CORE_URL || "http://localhost:3001";

async function smoke() {
  const results: { name: string; pass: boolean; detail?: string }[] = [];

  // Health
  try {
    const res = await fetch(`${BASE}/health`);
    const body = await res.json();
    const pass = res.status === 200 && body.status === "healthy" && body.service === "sita-brain-core";
    results.push({ name: "/health", pass, detail: pass ? undefined : JSON.stringify(body) });
  } catch (err) {
    results.push({ name: "/health", pass: false, detail: (err as Error).message });
  }

  // Ready
  try {
    const res = await fetch(`${BASE}/ready`);
    const body = await res.json();
    const pass = (res.status === 200 || res.status === 503) && typeof body.ready === "boolean";
    results.push({ name: "/ready", pass, detail: pass ? undefined : JSON.stringify(body) });
  } catch (err) {
    results.push({ name: "/ready", pass: false, detail: (err as Error).message });
  }

  // Metrics
  try {
    const res = await fetch(`${BASE}/metrics`);
    const body = await res.json();
    const pass = res.status === 200 && typeof body.totalRequests === "number";
    results.push({ name: "/metrics", pass, detail: pass ? undefined : JSON.stringify(body) });
  } catch (err) {
    results.push({ name: "/metrics", pass: false, detail: (err as Error).message });
  }

  // Intent endpoint
  try {
    const res = await fetch(`${BASE}/brain/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "Check my invoice status for client Acme" }),
    });
    const body = await res.json();
    const pass = res.status === 200 && body.intent && body.plan && body.advisors;
    results.push({ name: "POST /brain/intent", pass, detail: pass ? undefined : JSON.stringify(body).slice(0, 200) });
  } catch (err) {
    results.push({ name: "POST /brain/intent", pass: false, detail: (err as Error).message });
  }

  // Intent validation (missing input)
  try {
    const res = await fetch(`${BASE}/brain/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const body = await res.json();
    const pass = res.status === 400 && body.error;
    results.push({ name: "POST /brain/intent (validation)", pass });
  } catch (err) {
    results.push({ name: "POST /brain/intent (validation)", pass: false, detail: (err as Error).message });
  }

  // Model budget
  try {
    const res = await fetch(`${BASE}/brain/model/budget`);
    const body = await res.json();
    const pass = res.status === 200 && body.budget && typeof body.budget.remainingCents === "number";
    results.push({ name: "GET /brain/model/budget", pass });
  } catch (err) {
    results.push({ name: "GET /brain/model/budget", pass: false, detail: (err as Error).message });
  }

  // Report
  console.log("\n═══ Brain Core Smoke Test Results ═══");
  let allPass = true;
  for (const r of results) {
    console.log(`  ${r.pass ? "✅" : "❌"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
    if (!r.pass) allPass = false;
  }
  console.log(`\n${allPass ? "✅ All smoke tests passed" : "❌ Some smoke tests failed"}`);
  process.exit(allPass ? 0 : 1);
}

smoke();