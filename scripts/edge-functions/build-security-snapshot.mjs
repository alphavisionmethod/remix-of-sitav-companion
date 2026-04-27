import fs from 'node:fs';
import path from 'node:path';

const FUNCTIONS_DIR = 'supabase/functions';
const SHARED = new Set(['_shared', '_owners.json']);

const entries = [];
const dirs = fs.readdirSync(FUNCTIONS_DIR).filter(d => !SHARED.has(d) && fs.statSync(path.join(FUNCTIONS_DIR,d)).isDirectory());

const RX = {
  cors: /corsHeaders|handleCors|withCors|Access-Control-Allow-Origin/,
  withCors: /withCors\(/,
  optionsHandler: /req\.method\s*===\s*["']OPTIONS["']|handleCors\(|withCors\(/,
  requireAuth: /requireAuth\s*\(/,
  requireAdmin: /requireAdmin\s*\(/,
  getUser: /\.auth\.getUser\s*\(/,
  getClaims: /\.auth\.getClaims\s*\(/,
  hasRole: /rpc\(\s*["']has_role["']|from\(\s*["']user_roles["']\s*\)[\s\S]{0,200}?["']role["'][\s\S]{0,100}?["']admin["']|\.eq\(\s*["']role["']\s*,\s*["']admin["']\s*\)/,
  serviceRole: /SUPABASE_SERVICE_ROLE_KEY/,
  rateLimit: /checkRateLimit\(/,
  killSwitch: /checkKillSwitchOrReject\(|checkKillSwitch\(/,
  zodSchema: /from\s*["']https:\/\/esm\.sh\/zod|from\s*["']npm:zod|z\.object\(/,
  receiptEmit: /ai_action_receipts|emitActionReceipt\(|agent_action_receipts/,
  policyGate: /resolveUnifiedPolicy\(|negativeReceiptResponse\(/,
  webhookSecretCheck: /(WEBHOOK_SECRET|x-signature|verifySignature|HMAC)/i,
  consoleErrorLeak: /console\.error\([^)]*Deno\.env/,
  rawCorsAny: /Access-Control-Allow-Origin["']\s*:\s*["']\*/,
  esmShVersionPin: /esm\.sh\/@supabase\/supabase-js@(\d+\.\d+\.\d+)/g,
};

for (const dir of dirs) {
  const indexPath = path.join(FUNCTIONS_DIR, dir, 'index.ts');
  if (!fs.existsSync(indexPath)) {
    entries.push({ name: dir, hasIndex: false });
    continue;
  }
  const src = fs.readFileSync(indexPath, 'utf8');
  const versions = [...src.matchAll(RX.esmShVersionPin)].map(m=>m[1]);
  entries.push({
    name: dir,
    hasIndex: true,
    bytes: src.length,
    cors: {
      hasAny: RX.cors.test(src),
      usesWithCors: RX.withCors.test(src),
      hasOptionsHandler: RX.optionsHandler.test(src),
      allowsAllOrigins: RX.rawCorsAny.test(src),
    },
    auth: {
      requireAuth: RX.requireAuth.test(src),
      requireAdmin: RX.requireAdmin.test(src),
      getUser: RX.getUser.test(src),
      getClaims: RX.getClaims.test(src),
      hasRoleCheck: RX.hasRole.test(src),
      usesServiceRole: RX.serviceRole.test(src),
      webhookSecretCheck: RX.webhookSecretCheck.test(src),
    },
    safety: {
      rateLimit: RX.rateLimit.test(src),
      killSwitch: RX.killSwitch.test(src),
      zodValidation: RX.zodSchema.test(src),
      policyGate: RX.policyGate.test(src),
    },
    receipts: { emits: RX.receiptEmit.test(src) },
    leaks: { consoleErrorEnv: RX.consoleErrorLeak.test(src) },
    pinnedSupabaseSdkVersions: [...new Set(versions)],
  });
}

const out = {
  generatedAt: new Date().toISOString(),
  totalFunctions: entries.length,
  withIndex: entries.filter(e=>e.hasIndex).length,
  entries,
};
fs.mkdirSync('generated/edge-functions', { recursive: true });
fs.writeFileSync('generated/edge-functions/security-snapshot.json', JSON.stringify(out, null, 2));
console.log('snapshot total:', out.totalFunctions, 'withIndex:', out.withIndex);
