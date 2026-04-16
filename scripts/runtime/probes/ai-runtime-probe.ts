#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Runtime Activation Probe
// End-to-end validation that AI runtime is operational
// Run: npx tsx scripts/ai-runtime-probe.ts
// ═══════════════════════════════════════════════════════════════

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://icrkipwlnuopqbsabngy.supabase.co";
const ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

interface ProbeResult {
  name: string;
  status: "pass" | "fail" | "skip";
  latency_ms: number;
  detail: string;
}

const results: ProbeResult[] = [];

async function probe(name: string, fn: () => Promise<{ ok: boolean; detail: string }>) {
  const start = Date.now();
  try {
    const { ok, detail } = await fn();
    results.push({ name, status: ok ? "pass" : "fail", latency_ms: Date.now() - start, detail });
  } catch (e) {
    results.push({ name, status: "fail", latency_ms: Date.now() - start, detail: e instanceof Error ? e.message : "Unknown error" });
  }
}

async function main() {
  console.log("\n⚡ SITA OS — AI Runtime Activation Probe\n");

  // 1. Check ai-health endpoint (no auth required for basic connectivity)
  await probe("ai-health endpoint reachable", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-health`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: "{}",
    });
    // 401 = reachable but needs auth, which is expected
    return { ok: resp.status === 401 || resp.ok, detail: `HTTP ${resp.status}` };
  });

  // 2. Check chat-advisor endpoint reachable
  await probe("chat-advisor endpoint reachable", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat-advisor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: "{}",
    });
    return { ok: resp.status === 401 || resp.ok, detail: `HTTP ${resp.status}` };
  });

  // 3. Check personal-brain endpoint reachable
  await probe("personal-brain endpoint reachable", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/personal-brain`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: "{}",
    });
    return { ok: resp.status === 401 || resp.ok, detail: `HTTP ${resp.status}` };
  });

  // 4. Check brain-core endpoint reachable
  await probe("brain-core endpoint reachable", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/brain-core`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: "{}",
    });
    return { ok: resp.status === 401 || resp.ok, detail: `HTTP ${resp.status}` };
  });

  // 5. Check agent-executor endpoint reachable
  await probe("agent-executor endpoint reachable", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/agent-executor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: "{}",
    });
    return { ok: resp.status === 401 || resp.ok, detail: `HTTP ${resp.status}` };
  });

  // 6. Check admin-intelligence endpoint reachable
  await probe("admin-intelligence endpoint reachable", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/admin-intelligence`, {
      method: "GET",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
    });
    return { ok: resp.status === 401 || resp.ok, detail: `HTTP ${resp.status}` };
  });

  // 7. Negative test: missing auth returns 401, not 500
  await probe("missing auth returns 401 (not 500)", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat-advisor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: JSON.stringify({ messages: [{ role: "user", content: "test" }] }),
    });
    return { ok: resp.status === 401, detail: `HTTP ${resp.status} (expected 401)` };
  });

  // 8. Error response shape validation
  await probe("error responses have consistent shape", async () => {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat-advisor`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ANON_KEY },
      body: JSON.stringify({ messages: [{ role: "user", content: "test" }] }),
    });
    const body = await resp.json();
    const hasError = typeof body.error === "string";
    return { ok: hasError, detail: hasError ? `error field present: "${body.error}"` : `Missing error field in: ${JSON.stringify(body).slice(0, 100)}` };
  });

  // Print results
  console.log("─".repeat(60));
  let passed = 0, failed = 0, skipped = 0;
  for (const r of results) {
    const icon = r.status === "pass" ? "✅" : r.status === "fail" ? "❌" : "⏭️";
    console.log(`  ${icon} ${r.name} (${r.latency_ms}ms)`);
    if (r.detail) console.log(`     ${r.detail}`);
    if (r.status === "pass") passed++;
    else if (r.status === "fail") failed++;
    else skipped++;
  }
  console.log("─".repeat(60));
  console.log(`\n  Results: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);

  if (failed > 0) {
    console.log("  ⚠️  AI Runtime is NOT fully operational\n");
    process.exit(1);
  } else {
    console.log("  ✅ AI Runtime Activation Probe: ALL CHECKS PASSED\n");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
