// Receipt emitter — every heal action gets an audit trail.
import { mkdirSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
const DIR = path.resolve("coverage/triage/heal-receipts");
export function emitReceipt(r) {
  mkdirSync(DIR, { recursive: true });
  const id = `heal_${Date.now()}_${randomUUID().slice(0, 8)}`;
  const body = { id, timestamp: new Date().toISOString(), attestation: "auto", approvers: [], ...r };
  writeFileSync(path.join(DIR, `${id}.json`), JSON.stringify(body, null, 2));
  return id;
}
