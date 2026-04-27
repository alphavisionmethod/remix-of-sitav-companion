#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// Phase 16 — Webhook Surface snapshot builder
// ───────────────────────────────────────────────────────────────
// For every webhook-shaped edge function, captures:
//   • shape (intake / dispatch / processor / replay / signer)
//   • signature surface (HMAC, header parsing, presence check)
//   • CORS exposure of webhook signature headers
//   • idempotency anchors (external_id, event_id, dedup)
//   • dead-letter posture
// Output: generated/webhooks/webhook-snapshot.json
// ═══════════════════════════════════════════════════════════════
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FN_DIR = path.join(ROOT, "supabase/functions");
const OUT = path.join(ROOT, "generated/webhooks/webhook-snapshot.json");

const WEBHOOK_NAME_RX = /^(webhook|.*-ingest|.*-webhook-.*|external-workforce-webhook-dispatcher)$/i;

function isWebhookFn(name) {
  return WEBHOOK_NAME_RX.test(name) || name.startsWith("webhook-") || name.endsWith("-ingest");
}

const RX = {
  hmac: /createHmac\(|crypto\.subtle\.(sign|verify)\b|HMAC[-_ ]?SHA(?:1|256|512)/i,
  timingSafe: /timingSafeEqual\(|constantTime/i,
  sigHeader: /(x-signature|x-webhook-signature|stripe-signature|x-hub-signature|x-shopify-hmac|x-twilio-signature)/i,
  exposesSigHeaderInCors: /Access-Control-Allow-Headers[\s\S]{0,400}?(x-signature|x-webhook-signature|stripe-signature|x-hub-signature)/i,
  idempotencyExternalId: /external_id\s*[:=]/,
  idempotencyHeader: /x-event-id|event_id|eventId/,
  deadLetter: /dead_letter|dead-letter|DLQ|deadLetter/i,
  retryCount: /retry_count|retryCount|max_attempts|maxAttempts|\battempt\b\s*[<>=]=?\s*\(?\s*(?:row\.)?max/i,
  serviceRole: /SUPABASE_SERVICE_ROLE_KEY/,
  rateLimit: /checkRateLimit\(/,
  killSwitch: /checkKillSwitch/,
  webhookSecret: /(WEBHOOK_SECRET|SIGNING_SECRET|HMAC_SECRET|VAPID_PRIVATE_KEY|signing_secret(?:_hash)?|signingSecret)/,
  signatureValidWrite: /signature_valid\s*[:=]/,
  webhookEventsTable: /from\(\s*["']webhook_events["']\s*\)/,
  signatureRetryReplay: /webhook_replay|webhook_retry/i,
};

const entries = [];

for (const dir of fs.readdirSync(FN_DIR)) {
  if (dir.startsWith("_")) continue;
  if (!isWebhookFn(dir)) continue;
  const idx = path.join(FN_DIR, dir, "index.ts");
  if (!fs.existsSync(idx)) continue;
  const text = fs.readFileSync(idx, "utf8");
  entries.push({
    name: dir,
    file: path.relative(ROOT, idx),
    role: classifyRole(dir, text),
    capabilities: {
      hasHmac: RX.hmac.test(text),
      hasTimingSafeCompare: RX.timingSafe.test(text),
      readsSigHeader: RX.sigHeader.test(text),
      exposesSigHeaderInCors: RX.exposesSigHeaderInCors.test(text),
      writesSignatureValidFlag: RX.signatureValidWrite.test(text),
      hasIdempotencyAnchor: RX.idempotencyExternalId.test(text) || RX.idempotencyHeader.test(text),
      writesToWebhookEvents: RX.webhookEventsTable.test(text),
      hasDeadLetterPosture: RX.deadLetter.test(text),
      hasRetryCount: RX.retryCount.test(text),
      usesServiceRole: RX.serviceRole.test(text),
      hasRateLimit: RX.rateLimit.test(text),
      hasKillSwitch: RX.killSwitch.test(text),
      readsWebhookSecret: RX.webhookSecret.test(text),
    },
  });
}

function classifyRole(name, _text) {
  if (name === "webhook-ingest") return "intake";
  if (name === "webhook-process") return "processor";
  if (name === "webhook-replay") return "replay";
  if (name === "webhook-retry-processor") return "retry";
  if (name === "external-workforce-webhook-dispatcher") return "dispatcher";
  if (name.endsWith("-ingest")) return "domain-ingest";
  return "other";
}

const snapshot = {
  generatedAt: new Date().toISOString(),
  count: entries.length,
  byRole: entries.reduce((acc, e) => {
    acc[e.role] = (acc[e.role] ?? 0) + 1;
    return acc;
  }, {}),
  entries: entries.sort((a, b) => a.name.localeCompare(b.name)),
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
console.log(`[webhook-snapshot] wrote ${OUT} — ${entries.length} entries`);
for (const [role, n] of Object.entries(snapshot.byRole)) {
  console.log(`  ${role}: ${n}`);
}