#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Load Test Runner
// Configurable load test targeting edge functions
// Usage: npx tsx scripts/testing/load-test.ts [--concurrency 10] [--duration 30]
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2);
const getArg = (name: string, def: number) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? parseInt(args[idx + 1]) || def : def;
};

const CONCURRENCY = getArg("concurrency", 5);
const DURATION_SECONDS = getArg("duration", 10);
const TARGET_URL = args.find(a => a.startsWith("http")) || "http://localhost:54321/functions/v1/brain-core";

interface RequestResult {
  status: number;
  latency_ms: number;
  error?: string;
}

async function makeRequest(url: string): Promise<RequestResult> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
    });
    return { status: res.status, latency_ms: Date.now() - start };
  } catch (e: any) {
    return { status: 0, latency_ms: Date.now() - start, error: e.message };
  }
}

async function runLoadTest() {
  console.log(`🔥 Load test: ${CONCURRENCY} concurrent, ${DURATION_SECONDS}s duration`);
  console.log(`   Target: ${TARGET_URL}\n`);

  const results: RequestResult[] = [];
  const endTime = Date.now() + DURATION_SECONDS * 1000;

  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (Date.now() < endTime) {
      results.push(await makeRequest(TARGET_URL));
    }
  });

  await Promise.all(workers);

  // Report
  const successful = results.filter(r => r.status >= 200 && r.status < 400);
  const failed = results.filter(r => r.status === 0 || r.status >= 400);
  const latencies = successful.map(r => r.latency_ms).sort((a, b) => a - b);

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  console.log(`📊 Results:`);
  console.log(`   Total requests: ${results.length}`);
  console.log(`   Successful: ${successful.length} (${Math.round(successful.length / results.length * 100)}%)`);
  console.log(`   Failed: ${failed.length}`);
  console.log(`   RPS: ${Math.round(results.length / DURATION_SECONDS)}`);
  console.log(`   Latency — avg: ${avg}ms, p50: ${p50}ms, p95: ${p95}ms, p99: ${p99}ms`);
}

runLoadTest().catch(console.error);
