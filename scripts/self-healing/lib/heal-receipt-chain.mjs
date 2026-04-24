// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Tamper-evident hash-chained receipts (Phase 6).
// Every receipt embeds the SHA-256 of the previous receipt, forming
// an append-only Merkle-style chain. Verifier can replay and detect
// any insert/delete/modification.
// ═══════════════════════════════════════════════════════════════
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
} from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DIR = path.resolve("generated/self-healing/receipts");
const HEAD = path.join(DIR, "_head.json");

function hash(obj) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex");
}

function loadHead() {
  if (!existsSync(HEAD)) return { lastHash: null, count: 0 };
  try {
    return JSON.parse(readFileSync(HEAD, "utf8"));
  } catch {
    return { lastHash: null, count: 0 };
  }
}

/**
 * Append a receipt to the chain. Returns the receipt + its hash.
 * Each receipt is canonical-serialized (sorted keys not enforced —
 * deterministic field order via spread is enough for the chain).
 */
export function emitChainedReceipt(payload) {
  mkdirSync(DIR, { recursive: true });
  const head = loadHead();
  const id = `rcpt_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const body = {
    id,
    schema: "self-healing/receipt@2",
    seq: head.count + 1,
    prevHash: head.lastHash,
    timestamp: new Date().toISOString(),
    payload,
  };
  const selfHash = hash(body);
  const sealed = { ...body, hash: selfHash };
  writeFileSync(path.join(DIR, `${id}.json`), JSON.stringify(sealed, null, 2));
  writeFileSync(HEAD, JSON.stringify({ lastHash: selfHash, count: body.seq, lastId: id }, null, 2));
  return sealed;
}

/**
 * Replay every receipt in seq order and verify the chain.
 * Returns { ok, brokenAt, total } — ok=true means no tamper detected.
 */
export function verifyChain() {
  if (!existsSync(DIR)) return { ok: true, total: 0 };
  const files = readdirSync(DIR)
    .filter((f) => f.startsWith("rcpt_") && f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(path.join(DIR, f), "utf8")))
    .sort((a, b) => a.seq - b.seq);

  let prev = null;
  for (const r of files) {
    if (r.prevHash !== prev) return { ok: false, brokenAt: r.id, reason: "prevHash-mismatch", total: files.length };
    const { hash: storedHash, ...body } = r;
    if (hash(body) !== storedHash) return { ok: false, brokenAt: r.id, reason: "selfHash-mismatch", total: files.length };
    prev = storedHash;
  }
  return { ok: true, total: files.length, headHash: prev };
}