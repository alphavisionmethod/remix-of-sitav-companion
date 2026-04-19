// SITA OS — Mobile push claim safety validator
// Posture: web-VAPID is real; APNs + FCM are deferred.
// Forbids any UI/store-metadata claims that imply mobile push is live.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, GateIssue } from "./_lib/emit-gate-report";

const issues: GateIssue[] = [];

// 1. mobile/android/FCM.md must declare deferred
if (existsSync("mobile/android/FCM.md")) {
  const s = readFileSync("mobile/android/FCM.md", "utf8");
  if (!/deferred/i.test(s)) issues.push({ severity: "error", area: "fcm", message: "mobile/android/FCM.md must declare push deferred" });
} else {
  issues.push({ severity: "error", area: "fcm", message: "mobile/android/FCM.md missing" });
}

// 2. mobile/ios/SIGNING.md must declare deferred (APNs follows membership)
if (existsSync("mobile/ios/SIGNING.md")) {
  const s = readFileSync("mobile/ios/SIGNING.md", "utf8");
  if (!/deferred|DEFERRED/i.test(s)) issues.push({ severity: "error", area: "apns", message: "mobile/ios/SIGNING.md must declare deferred status" });
}

// 3. infra/deploy/mobile.yaml must mark APNs + FCM status: deferred
if (existsSync("infra/deploy/mobile.yaml")) {
  const s = readFileSync("infra/deploy/mobile.yaml", "utf8");
  if (!/apns:[\s\S]{0,200}status:\s*deferred/i.test(s)) {
    issues.push({ severity: "error", area: "manifest", message: "infra/deploy/mobile.yaml must mark APNs status: deferred" });
  }
  if (!/fcm:[\s\S]{0,200}status:\s*deferred/i.test(s)) {
    issues.push({ severity: "error", area: "manifest", message: "infra/deploy/mobile.yaml must mark FCM status: deferred" });
  }
}

// 4. Store metadata must NOT advertise mobile push capability
const storeFiles = ["mobile/store-metadata/android.json", "mobile/store-metadata/ios.json"];
for (const f of storeFiles) {
  if (!existsSync(f)) continue;
  const s = readFileSync(f, "utf8").toLowerCase();
  // Allow general "notifications" mentions but flag explicit "push notifications" claims
  if (/"push.?notification/i.test(s) || /push\s+enabled|push\s+active|push\s+ready/i.test(s)) {
    issues.push({ severity: "error", area: "store-claim", message: `${f} appears to claim mobile push readiness while transport is deferred` });
  }
}

// 5. Scan src/components/mobile/ + src/pages/mobile/ for "push notification" UI strings (warning only)
function scan(dir: string, hits: string[]) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir)) {
    if (e.startsWith(".") || e === "node_modules") continue;
    const full = join(dir, e);
    const st = statSync(full);
    if (st.isDirectory()) scan(full, hits);
    else if (/\.(tsx|ts)$/.test(e)) {
      const s = readFileSync(full, "utf8");
      if (/Mobile push (?:is|now) (?:enabled|active|ready|live)/i.test(s)) {
        hits.push(`${full}: explicit mobile push readiness claim in UI`);
      }
    }
  }
}
const uiHits: string[] = [];
scan("src/components/mobile", uiHits);
scan("src/pages/mobile", uiHits);
for (const h of uiHits) issues.push({ severity: "warning", area: "ui-claim", message: h });

const errors = issues.filter(i => i.severity === "error").length;
const ok = errors === 0;
emitGateReport({
  gate: "mobile-push-claim-safety",
  ok,
  issues,
  extra: {
    transports: { web: "vapid-active", ios: "apns-deferred", android: "fcm-deferred" },
    realPushTransport: "web-vapid",
  },
});
console.log(`mobile-push-claim-safety: ${ok ? "GREEN" : "RED"} (${errors} errors, ${issues.length - errors} warnings)`);
process.exit(ok ? 0 : 1);
