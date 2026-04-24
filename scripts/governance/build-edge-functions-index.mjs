#!/usr/bin/env node
// Build a categorized edge-functions.json with owners, IO, linked routes.
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FN_DIR = path.join(ROOT, "supabase/functions");
const OWNERS_PATH = path.join(FN_DIR, "_owners.json");
const SRC_DIR = path.join(ROOT, "src");
const OUT = path.join(ROOT, "public/generated/edge-functions.json");

// 1. Discover function dirs.
const fnNames = readdirSync(FN_DIR).filter((d) => {
  const full = path.join(FN_DIR, d);
  if (!statSync(full).isDirectory()) return false;
  if (d.startsWith("_")) return false;
  return existsSync(path.join(full, "index.ts"));
});

// 2. Owner map.
const ownersDoc = JSON.parse(readFileSync(OWNERS_PATH, "utf8"));
const ownersByName = Object.fromEntries(ownersDoc.entries.map((e) => [e.name, e]));

// 3. Categorization rules — bucket by name pattern.
function bucketOf(name) {
  if (/^admin-|^audit-|^compliance-|^role-/.test(name)) return "admin-and-governance";
  if (/^advisor-|^boardroom-|^advice-|coaching/.test(name)) return "advisor-intelligence";
  if (/^agent-|workforce|orchestrator|scheduler|heartbeat/.test(name)) return "agent-runtime";
  if (/^ai-|brain-|^chat-|inference|prompt|llm|gateway/.test(name)) return "ai-engineering";
  if (/connector|oauth|webhook|relay|^proxy-|integration/.test(name)) return "connector-integrations";
  if (/^crm-|revenue|quote|deal|invoice|finance|payment|billing|stripe/.test(name)) return "revenue-and-finance";
  if (/^auth-|signup|reset-|session|user|profile|consent|account|password/.test(name)) return "identity-and-auth";
  if (/^alert-|^kill-|^incident-|^slo-|^drill-|^runbook-|recovery|pager|on-?call/.test(name)) return "ops-and-reliability";
  if (/^notif|^email-|^sms-|^push-|broadcast|message/.test(name)) return "notifications";
  if (/^storage-|^file-|^upload-|^doc-|export|import|^pdf-|^csv-/.test(name)) return "data-and-files";
  if (/^analytics-|^metric-|^report-|^snapshot-|^summary-|telemetry|insight/.test(name)) return "analytics-and-insights";
  if (/^connector-|^webhook-/.test(name)) return "connector-integrations";
  if (/seed-|cron-|nightly-|backfill|migrate|sync-|repair/.test(name)) return "platform-jobs";
  return "domain-functions";
}

// 4. Caller index — scan src/ for invoke("<name>")
const invokeRe = /functions\.invoke\(\s*["'`]([a-z0-9-]+)["'`]/g;
const fetchRe = /\/functions\/v1\/([a-z0-9-]+)/g;
const callerByFn = new Map();
function scan(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      scan(full);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      const txt = readFileSync(full, "utf8");
      let m;
      while ((m = invokeRe.exec(txt)) !== null) {
        const fn = m[1];
        if (!callerByFn.has(fn)) callerByFn.set(fn, new Set());
        callerByFn.get(fn).add(path.relative(ROOT, full));
      }
      while ((m = fetchRe.exec(txt)) !== null) {
        const fn = m[1];
        if (!callerByFn.has(fn)) callerByFn.set(fn, new Set());
        callerByFn.get(fn).add(path.relative(ROOT, full));
      }
    }
  }
}
scan(SRC_DIR);

// 5. Linked routes — derive from caller files in src/pages or src/routes
function routesForCallers(callers) {
  const out = new Set();
  for (const f of callers) {
    if (f.startsWith("src/pages/")) {
      const route = "/" + f.replace(/^src\/pages\//, "")
        .replace(/\.(tsx?|jsx?)$/, "")
        .replace(/\/index$/, "")
        .toLowerCase();
      out.add(route);
    } else if (f.startsWith("src/routes/")) {
      out.add("/" + path.basename(f, path.extname(f)).toLowerCase());
    }
  }
  return Array.from(out);
}

// 6. Per-function IO inference from index.ts
function inferIO(fnName) {
  const file = path.join(FN_DIR, fnName, "index.ts");
  if (!existsSync(file)) return { input: null, output: null, methods: [], usesAuth: false, usesServiceRole: false, emitsReceipt: false };
  const src = readFileSync(file, "utf8");
  const methods = Array.from(new Set((src.match(/req\.method\s*===?\s*["']([A-Z]+)["']/g) || []).map((s) => s.match(/["']([A-Z]+)["']/)[1])));
  const zodTypes = Array.from(new Set((src.match(/z\.object\(\{[^}]{0,400}\}\)/g) || []).slice(0, 1)));
  const tableHits = Array.from(new Set((src.match(/\.from\(["'`]([a-z0-9_]+)["'`]\)/g) || []).map((m) => m.match(/["'`]([a-z0-9_]+)["'`]/)[1]))).slice(0, 12);
  const usesAuth = /requireAdmin|requireAuth|verifyJwt|verifyJWT|x-supabase-authorization|getUser\(\)|auth\.getUser/.test(src);
  const usesServiceRole = /SUPABASE_SERVICE_ROLE_KEY|service_role/.test(src);
  const emitsReceipt = /emitActionReceipt|emit_receipt|insert_receipt|\.from\(["']receipts["']\)|\.from\(["']ai_receipt_records["']\)/.test(src);
  return {
    input: zodTypes[0] ? "zod-validated" : "json-body",
    methods: methods.length ? methods : ["POST", "OPTIONS"],
    usesAuth,
    usesServiceRole,
    emitsReceipt,
    tablesTouched: tableHits,
  };
}

// 7. Build the final document.
const buckets = {};
for (const name of fnNames) {
  const bucket = bucketOf(name);
  if (!buckets[bucket]) buckets[bucket] = [];
  const owner = ownersByName[name] || null;
  const callers = callerByFn.get(name) || new Set();
  const routes = routesForCallers(callers);
  const io = inferIO(name);
  buckets[bucket].push({
    name,
    path: `supabase/functions/${name}/index.ts`,
    owner: owner ? {
      team: owner.ownerTeam,
      primary: owner.primaryContact,
      escalation: owner.escalationContact,
      slack: owner.slackChannel,
      runbook: owner.runbookRef,
      reviewers: owner.reviewerCodeOwners,
    } : null,
    io,
    callers: Array.from(callers).slice(0, 10),
    callerCount: callers.size,
    linkedRoutes: routes,
  });
}

for (const k of Object.keys(buckets)) buckets[k].sort((a, b) => a.name.localeCompare(b.name));

const totals = Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length]));
const owned = fnNames.filter((n) => ownersByName[n]).length;

const doc = {
  $schema: "sita/edge-functions-index@1",
  generatedAt: new Date().toISOString(),
  totalFunctions: fnNames.length,
  totalBuckets: Object.keys(buckets).length,
  ownerCoverage: { owned, missing: fnNames.length - owned, percent: Math.round((owned / fnNames.length) * 100) },
  receiptCoverage: {
    emitting: Object.values(buckets).flat().filter((f) => f.io?.emitsReceipt).length,
    total: fnNames.length,
  },
  authCoverage: {
    enforced: Object.values(buckets).flat().filter((f) => f.io?.usesAuth).length,
    total: fnNames.length,
  },
  bucketTotals: totals,
  buckets,
};

writeFileSync(OUT, JSON.stringify(doc, null, 2));
console.log(`✓ wrote ${OUT}`);
console.log(`  ${fnNames.length} functions across ${Object.keys(buckets).length} buckets`);
console.log(`  owner coverage: ${owned}/${fnNames.length} (${Math.round((owned/fnNames.length)*100)}%)`);
