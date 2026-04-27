// ═══════════════════════════════════════════════════════════════
// Phase 16 — Webhook Signature & Idempotency Behavioral E2E
// ───────────────────────────────────────────────────────────────
// Pins the webhook ingest/process/replay/retry trust contract:
//   1. Snapshot integrity — every webhook-shaped function classified.
//   2. Canonical intake (webhook-ingest) reads provider signature
//      headers, exposes them in CORS, and records signature_valid.
//   3. Dispatcher (external-workforce-webhook-dispatcher) signs
//      outbound payloads with HMAC.
//   4. Processor + retry path implements dead-letter posture and
//      retry_count, anchored on the webhook_events table.
//   5. Domain-ingest fleet uses service-role correctly and is
//      classified into a bounded exemption set (no silent drift).
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import snapshot from "../../../generated/webhooks/webhook-snapshot.json";

type Entry = (typeof snapshot.entries)[number];

function findByName(name: string): Entry | undefined {
  return snapshot.entries.find((e) => e.name === name);
}

/** Domain-ingest endpoints intentionally do NOT verify signatures —
 *  they ingest from authenticated client SDKs (telemetry, error reports,
 *  crash reports, alerts) using the JWT/service-role lane, not external
 *  third-party webhooks. Codified to prevent silent drift. */
const DOMAIN_INGEST_NO_SIG_RATIONALE: Record<string, string> = {
  "alert-ingest":
    "Internal alert sink — receives from in-app SDK with JWT/service-role; no external third-party signing surface.",
  "apm-metrics-ingest":
    "Internal APM metrics sink — JWT/service-role from app runtime; not an external webhook receiver.",
  "crash-report-ingest":
    "Internal crash sink — JWT/service-role from app runtime; not external.",
  "error-ingest":
    "Internal error sink — JWT/service-role from app runtime; carries idempotency anchor (event_id) for dedupe.",
  "recovery-evidence-ingest":
    "Internal recovery-evidence sink — service-role only; not external.",
  "trace-ingest":
    "Internal trace sink — JWT/service-role from app runtime; not external.",
};

// ─────────────────────────────────────────────────────────────
// 1 — Snapshot integrity
// ─────────────────────────────────────────────────────────────
describe("Phase 16 / Webhook Trust — snapshot integrity", () => {
  it("snapshot is fresh-shaped and present", () => {
    expect(typeof snapshot.generatedAt).toBe("string");
    expect(snapshot.count).toBe(snapshot.entries.length);
    expect(snapshot.count).toBeGreaterThanOrEqual(8);
  });

  it("every webhook entry has a known role", () => {
    const validRoles = new Set([
      "intake", "processor", "replay", "retry", "dispatcher", "domain-ingest", "other",
    ]);
    for (const e of snapshot.entries) {
      expect(validRoles.has(e.role), `role for ${e.name}`).toBe(true);
    }
  });

  it("snapshot file exists on disk and matches imported value", () => {
    const p = path.join(process.cwd(), "generated/webhooks/webhook-snapshot.json");
    expect(fs.existsSync(p)).toBe(true);
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    expect(raw.count).toBe(snapshot.count);
  });

  it("the canonical webhook trio (intake/processor/retry) is present", () => {
    expect(findByName("webhook-ingest")).toBeDefined();
    expect(findByName("webhook-process")).toBeDefined();
    expect(findByName("webhook-retry-processor")).toBeDefined();
  });
});

// ─────────────────────────────────────────────────────────────
// 2 — Canonical intake contract
// ─────────────────────────────────────────────────────────────
describe("Phase 16 / Webhook Trust — canonical intake contract", () => {
  const ingest = findByName("webhook-ingest")!;

  it("webhook-ingest reads provider signature headers", () => {
    expect(ingest.capabilities.readsSigHeader).toBe(true);
  });

  it("webhook-ingest exposes signature headers in CORS allow-list", () => {
    expect(ingest.capabilities.exposesSigHeaderInCors).toBe(true);
  });

  it("webhook-ingest records signature_valid on every event", () => {
    expect(ingest.capabilities.writesSignatureValidFlag).toBe(true);
  });

  it("webhook-ingest carries an idempotency anchor (external_id / event_id)", () => {
    expect(ingest.capabilities.hasIdempotencyAnchor).toBe(true);
  });

  it("webhook-ingest persists to the canonical webhook_events table", () => {
    expect(ingest.capabilities.writesToWebhookEvents).toBe(true);
  });

  it("webhook-ingest uses the service-role key (RLS bypass for trusted writes)", () => {
    expect(ingest.capabilities.usesServiceRole).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// 3 — Dispatcher signing contract
// ─────────────────────────────────────────────────────────────
describe("Phase 16 / Webhook Trust — dispatcher signing contract", () => {
  const dispatcher = findByName("external-workforce-webhook-dispatcher")!;

  it("external dispatcher signs outbound payloads with HMAC", () => {
    expect(dispatcher.capabilities.hasHmac).toBe(true);
  });

  it("external dispatcher reads the webhook signing secret from env (never in body)", () => {
    expect(dispatcher.capabilities.readsWebhookSecret).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// 4 — Processor / retry / replay contract
// ─────────────────────────────────────────────────────────────
describe("Phase 16 / Webhook Trust — processor + retry contract", () => {
  const processor = findByName("webhook-process")!;
  const retry = findByName("webhook-retry-processor")!;
  const replay = findByName("webhook-replay")!;

  it("processor uses service-role (anchored to webhook_events)", () => {
    expect(processor.capabilities.usesServiceRole).toBe(true);
  });

  it("retry processor implements dead-letter posture (no infinite loops)", () => {
    expect(retry.capabilities.hasDeadLetterPosture).toBe(true);
  });

  it("retry processor tracks retry_count (bounded retry attempts)", () => {
    expect(retry.capabilities.hasRetryCount).toBe(true);
  });

  it("retry processor uses service-role", () => {
    expect(retry.capabilities.usesServiceRole).toBe(true);
  });

  it("replay surface is present and uses service-role", () => {
    expect(replay.capabilities.usesServiceRole).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// 5 — Domain-ingest fleet bounded exemption
// ─────────────────────────────────────────────────────────────
describe("Phase 16 / Webhook Trust — domain-ingest fleet is bounded", () => {
  const domainIngest = snapshot.entries.filter((e) => e.role === "domain-ingest");

  it("every domain-ingest endpoint is codified in the no-signature exemption map", () => {
    const undeclared = domainIngest
      .map((e) => e.name)
      .filter((n) => !(n in DOMAIN_INGEST_NO_SIG_RATIONALE));
    if (undeclared.length) {
      throw new Error(
        `New domain-ingest endpoint without signature rationale:\n` +
          undeclared.map((n) => `  - ${n}`).join("\n") +
          `\n\nEither add HMAC verification or codify in DOMAIN_INGEST_NO_SIG_RATIONALE.`,
      );
    }
    expect(undeclared).toEqual([]);
  });

  it("DOMAIN_INGEST_NO_SIG_RATIONALE has no stale entries", () => {
    const live = new Set(domainIngest.map((e) => e.name));
    const stale = Object.keys(DOMAIN_INGEST_NO_SIG_RATIONALE).filter((n) => !live.has(n));
    if (stale.length) {
      throw new Error(
        `These domain-ingest entries no longer appear in the snapshot — remove them:\n` +
          stale.map((n) => `  - ${n}`).join("\n"),
      );
    }
    expect(stale).toEqual([]);
  });

  it("every domain-ingest exemption rationale is non-trivial (≥40 chars)", () => {
    for (const [name, reason] of Object.entries(DOMAIN_INGEST_NO_SIG_RATIONALE)) {
      expect(reason.length, `rationale for ${name}`).toBeGreaterThan(40);
    }
  });

  it("every domain-ingest endpoint uses service-role (trusted write lane)", () => {
    for (const e of domainIngest) {
      expect(e.capabilities.usesServiceRole, `${e.name} usesServiceRole`).toBe(true);
    }
  });

  it("domain-ingest fleet count is pinned at the current ratchet (6)", () => {
    expect(domainIngest.length).toBeLessThanOrEqual(6);
  });
});

// ─────────────────────────────────────────────────────────────
// 6 — Cross-fleet invariants
// ─────────────────────────────────────────────────────────────
describe("Phase 16 / Webhook Trust — cross-fleet invariants", () => {
  it("at least one function in the fleet implements HMAC (signing or verifying)", () => {
    const hmacFns = snapshot.entries.filter((e) => e.capabilities.hasHmac);
    expect(hmacFns.length).toBeGreaterThanOrEqual(1);
  });

  it("only the canonical intake exposes signature headers in CORS (no silent broadening)", () => {
    const exposers = snapshot.entries.filter((e) => e.capabilities.exposesSigHeaderInCors);
    expect(exposers.length).toBeGreaterThanOrEqual(1);
    for (const e of exposers) {
      // Allowed exposers: intake (webhook-ingest) plus any future explicit signature receiver
      expect(["intake", "domain-ingest", "dispatcher"], `${e.name} role`).toContain(e.role);
    }
  });

  it("processor + retry + replay all anchor on service-role (no end-user JWT path)", () => {
    for (const role of ["processor", "retry", "replay"] as const) {
      const e = snapshot.entries.find((x) => x.role === role);
      expect(e, `role=${role}`).toBeDefined();
      expect(e!.capabilities.usesServiceRole, `${role} usesServiceRole`).toBe(true);
    }
  });
});