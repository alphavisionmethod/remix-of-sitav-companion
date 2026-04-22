// ═══════════════════════════════════════════════════════════════
// SITA OS — API Gateway Smoke Test
// Start server, hit /health and /ready, verify JSON structure.
// Run: PORT=0 npx tsx smoke.test.ts
// ═══════════════════════════════════════════════════════════════

const BASE = process.env.API_GATEWAY_URL || "http://localhost:3000";

async function smoke() {
  const results: { name: string; pass: boolean; detail?: string }[] = [];

  // Health endpoint
  try {
    const res = await fetch(`${BASE}/health`);
    const body = await res.json();
    const pass = res.status === 200 && body.status === "healthy" && body.service === "sita-api-gateway";
    results.push({ name: "/health", pass, detail: pass ? undefined : JSON.stringify(body) });
  } catch (err) {
    results.push({ name: "/health", pass: false, detail: (err as Error).message });
  }

  // Ready endpoint
  try {
    const res = await fetch(`${BASE}/ready`);
    const body = await res.json();
    const pass = (res.status === 200 || res.status === 503) && typeof body.ready === "boolean";
    results.push({ name: "/ready", pass, detail: pass ? undefined : JSON.stringify(body) });
  } catch (err) {
    results.push({ name: "/ready", pass: false, detail: (err as Error).message });
  }

  // Metrics endpoint
  try {
    const res = await fetch(`${BASE}/metrics`);
    const body = await res.json();
    const pass = res.status === 200 && typeof body.totalRequests === "number";
    results.push({ name: "/metrics", pass, detail: pass ? undefined : JSON.stringify(body) });
  } catch (err) {
    results.push({ name: "/metrics", pass: false, detail: (err as Error).message });
  }

  // 404 handling
  try {
    const res = await fetch(`${BASE}/nonexistent-path-xyz`);
    const body = await res.json();
    const pass = res.status === 404 && body.error === "Not Found";
    results.push({ name: "404 handling", pass });
  } catch (err) {
    results.push({ name: "404 handling", pass: false, detail: (err as Error).message });
  }

  // Request-ID propagation
  try {
    const res = await fetch(`${BASE}/health`, { headers: { "X-Request-Id": "smoke-test-123" } });
    await res.text();
    const pass = res.headers.get("X-Request-Id") === "smoke-test-123";
    results.push({ name: "X-Request-Id propagation", pass });
  } catch (err) {
    results.push({ name: "X-Request-Id propagation", pass: false, detail: (err as Error).message });
  }

  // Report
  console.log("\n═══ API Gateway Smoke Test Results ═══");
  let allPass = true;
  for (const r of results) {
    console.log(`  ${r.pass ? "✅" : "❌"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
    if (!r.pass) allPass = false;
  }
  console.log(`\n${allPass ? "✅ All smoke tests passed" : "❌ Some smoke tests failed"}`);
  process.exit(allPass ? 0 : 1);
}

smoke();