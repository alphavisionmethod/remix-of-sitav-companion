#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Connector Catalog Generator (Phase 22.E)
// Emits structured connector objects (id, name, provider, class, auth,
// scopes, status) for catalog + Gate 33 validation.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface ConnectorEntry {
  id: string;
  name: string;
  provider: string;
  class: string;
  auth: string;
  scopes: string[];
  status: string;
  webhookSupported: boolean;
  refreshSupported: boolean;
}

const CANONICAL: ConnectorEntry[] = [
  { id: "gmail", name: "Gmail", provider: "google", class: "communication", auth: "oauth2", scopes: ["gmail.readonly","gmail.send"], status: "beta", webhookSupported: true, refreshSupported: true },
  { id: "google-calendar", name: "Google Calendar", provider: "google", class: "calendar", auth: "oauth2", scopes: ["calendar"], status: "beta", webhookSupported: true, refreshSupported: true },
  { id: "google-drive", name: "Google Drive", provider: "google", class: "cloud-storage", auth: "oauth2", scopes: ["drive.readonly"], status: "beta", webhookSupported: true, refreshSupported: true },
  { id: "plaid", name: "Plaid", provider: "plaid", class: "banking", auth: "oauth2", scopes: ["transactions","accounts"], status: "beta", webhookSupported: true, refreshSupported: true },
  { id: "stripe", name: "Stripe", provider: "stripe", class: "payments", auth: "api_key", scopes: ["read","write"], status: "beta", webhookSupported: true, refreshSupported: false },
  { id: "quickbooks", name: "QuickBooks", provider: "intuit", class: "accounting", auth: "oauth2", scopes: ["accounting"], status: "planned", webhookSupported: true, refreshSupported: true },
  { id: "twilio", name: "Twilio", provider: "twilio", class: "communication", auth: "api_key", scopes: ["sms","voice"], status: "beta", webhookSupported: true, refreshSupported: false },
  { id: "sendgrid", name: "SendGrid", provider: "sendgrid", class: "communication", auth: "api_key", scopes: ["mail.send"], status: "planned", webhookSupported: true, refreshSupported: false },
  { id: "instacart", name: "Instacart", provider: "instacart", class: "commerce", auth: "oauth2", scopes: ["orders.read"], status: "planned", webhookSupported: false, refreshSupported: true },
  { id: "hubspot", name: "HubSpot", provider: "hubspot", class: "crm", auth: "oauth2", scopes: ["contacts","deals"], status: "planned", webhookSupported: true, refreshSupported: true },
  { id: "slack", name: "Slack", provider: "slack", class: "communication", auth: "oauth2", scopes: ["chat:write","channels:read"], status: "planned", webhookSupported: true, refreshSupported: true },
  { id: "dropbox", name: "Dropbox", provider: "dropbox", class: "cloud-storage", auth: "oauth2", scopes: ["files.content.read"], status: "planned", webhookSupported: true, refreshSupported: true },
];

// Augment from any *.connector.ts files that explicitly declare connectorId
function scanSourceConnectors(): Set<string> {
  const ids = new Set<string>();
  const roots = ["src/lib/services/connector", "src/packages/connectors"];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop()!;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fp = path.join(dir, entry.name);
        if (entry.isDirectory()) { stack.push(fp); continue; }
        if (!entry.name.endsWith(".ts")) continue;
        const content = fs.readFileSync(fp, "utf-8");
        const matches = content.match(/connectorId:\s*["']([^"']+)["']/g) ?? [];
        for (const m of matches) {
          const id = m.match(/["']([^"']+)["']/)?.[1];
          if (id) ids.add(id);
        }
      }
    }
  }
  return ids;
}

const sourceIds = scanSourceConnectors();
const merged = [...CANONICAL];
for (const id of sourceIds) {
  if (!merged.some(c => c.id === id)) {
    merged.push({ id, name: id, provider: id, class: "integration", auth: "oauth2", scopes: [], status: "planned", webhookSupported: false, refreshSupported: true });
  }
}

const out = {
  version: "2.0.0",
  generatedAt: new Date().toISOString(),
  total: merged.length,
  connectors: merged,
};

fs.mkdirSync("generated", { recursive: true });
fs.writeFileSync("generated/connector-catalog.json", JSON.stringify(out, null, 2));
console.log(`✅ Generated connector catalog: ${merged.length} connectors`);
