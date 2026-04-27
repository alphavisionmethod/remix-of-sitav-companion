#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Phase 14 — Sovereign AI Gateway snapshot builder
// ───────────────────────────────────────────────────────────────
// Captures the live state of:
//   • Direct Lovable AI URL callers (drift from canonical gateway)
//   • Direct provider SDK imports (must be ZERO outside ai-gateway)
//   • Gateway invariants (auth, kill-switch, budget gate, receipts)
//   • Canonical client surfaces (invokeAI, callable wrappers)
// Output: generated/ai-gateway/gateway-snapshot.json
// ═══════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FN_DIR = path.join(ROOT, "supabase/functions");
const SRC_DIR = path.join(ROOT, "src");
const OUT = path.join(ROOT, "generated/ai-gateway/gateway-snapshot.json");

const PROVIDER_URL_RX =
  /(https?:\/\/[^"'`\s]*?(?:ai\.gateway\.lovable\.dev|ai-gateway\.lovable\.dev|api\.openai\.com|api\.anthropic\.com|api\.quatarly\.cloud|generativelanguage\.googleapis\.com)[^"'`\s]*)/g;

const PROVIDER_SDK_RX =
  /from\s+["'](?:openai|@anthropic-ai\/[^"']+|@google\/generative-ai|cohere-ai|@cohere-ai\/[^"']+|@google-cloud\/vertexai)["']/g;

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".git") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|mjs|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

function scanFile(p) {
  const text = fs.readFileSync(p, "utf8");
  const urls = [];
  let m;
  PROVIDER_URL_RX.lastIndex = 0;
  while ((m = PROVIDER_URL_RX.exec(text))) urls.push(m[1]);
  const sdks = [];
  PROVIDER_SDK_RX.lastIndex = 0;
  while ((m = PROVIDER_SDK_RX.exec(text))) sdks.push(m[0]);
  return { urls, sdks, text };
}

const directProviderCallers = []; // { file, urls[], context: 'edge'|'src' }
const directSdkImports = [];      // { file, imports[] }
const canonicalCallers = [];      // { file, surface: 'invokeAI'|'functions.invoke ai-gateway' }
const gatewayInvariants = {
  hasAuthCheck: false,
  hasKillSwitchGate: false,
  hasBudgetGate: false,
  writesUsageLedger: false,
  writesReceiptRecord: false,
  writesInferenceReceipt: false,
  writesFallbackEvent: false,
  rejectsRawSystemOnR3Plus: false,
  hasRateLimit: false,
};

const allFiles = [...walk(FN_DIR), ...walk(SRC_DIR)];

for (const file of allFiles) {
  const rel = path.relative(ROOT, file);
  const isEdge = rel.startsWith("supabase/functions/");
  const { urls, sdks, text } = scanFile(file);

  const isGatewayItself = rel === "supabase/functions/ai-gateway/index.ts";
  const isGatewayTest = /ai-gateway[\\/].*test/.test(rel);

  if (urls.length && !isGatewayItself && !isGatewayTest) {
    // Heuristic: a real runtime call has the URL inside a fetch() within ~80 chars.
    const runtimeCalls = urls.filter((u) => {
      const idx = text.indexOf(u);
      if (idx < 0) return false;
      const window = text.substring(Math.max(0, idx - 80), idx);
      return /\bfetch\s*\(/.test(window);
    });
    if (runtimeCalls.length) {
      directProviderCallers.push({
        file: rel,
        urls: [...new Set(runtimeCalls)],
        context: isEdge ? "edge" : "src",
      });
    }
  }

  if (sdks.length) {
    directSdkImports.push({ file: rel, imports: [...new Set(sdks)] });
  }

  if (/supabase\.functions\.invoke\(\s*["']ai-gateway["']/.test(text)) {
    canonicalCallers.push({ file: rel, surface: "functions.invoke ai-gateway" });
  }
  if (/\binvokeAI\s*\(/.test(text) && rel !== "src/lib/services/ai-gateway/invoke.ts") {
    canonicalCallers.push({ file: rel, surface: "invokeAI" });
  }

  if (isGatewayItself) {
    gatewayInvariants.hasAuthCheck = /\.auth\.getUser\s*\(/.test(text);
    gatewayInvariants.hasKillSwitchGate = /checkKillSwitchOrReject\(\s*["']KS-MODEL-PROVIDERS/.test(text);
    gatewayInvariants.hasBudgetGate = /checkAIBudget\s*\([^)]*strict\s*:\s*true/s.test(text);
    gatewayInvariants.writesUsageLedger = /from\(\s*["']ai_usage_ledger["']\s*\)\s*\.insert/.test(text);
    gatewayInvariants.writesReceiptRecord = /from\(\s*["']ai_receipt_records["']\s*\)\s*\.insert/.test(text);
    gatewayInvariants.writesInferenceReceipt = /from\(\s*["']ai_inference_receipts["']\s*\)\s*\.insert/.test(text);
    gatewayInvariants.writesFallbackEvent = /from\(\s*["']ai_fallback_events["']\s*\)\s*\.insert/.test(text);
    gatewayInvariants.rejectsRawSystemOnR3Plus = /raw_prompt_on_r3/.test(text);
    gatewayInvariants.hasRateLimit = /checkRateLimit\(/.test(text);
  }
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  canonicalGateway: "supabase/functions/ai-gateway/index.ts",
  canonicalClient: "src/lib/services/ai-gateway/invoke.ts",
  invariants: gatewayInvariants,
  directProviderCallers: directProviderCallers.sort((a, b) => a.file.localeCompare(b.file)),
  directSdkImports: directSdkImports.sort((a, b) => a.file.localeCompare(b.file)),
  canonicalCallers: canonicalCallers.sort((a, b) => a.file.localeCompare(b.file)),
  counts: {
    directProviderCallers: directProviderCallers.length,
    directSdkImports: directSdkImports.length,
    canonicalCallers: canonicalCallers.length,
    edgeProviderCallers: directProviderCallers.filter((x) => x.context === "edge").length,
    srcProviderCallers: directProviderCallers.filter((x) => x.context === "src").length,
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
console.log(`[gateway-snapshot] wrote ${OUT}`);
console.log(`  edge direct provider callers: ${snapshot.counts.edgeProviderCallers}`);
console.log(`  src  direct provider callers: ${snapshot.counts.srcProviderCallers}`);
console.log(`  direct SDK imports          : ${snapshot.counts.directSdkImports}`);
console.log(`  canonical callers           : ${snapshot.counts.canonicalCallers}`);