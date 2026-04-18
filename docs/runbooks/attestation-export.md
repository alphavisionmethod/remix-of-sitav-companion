# Runbook: Compliance Attestation Export

**Risk tier:** R3  
**Autonomy ceiling:** L3 — packets are sealed but generation is admin-triggered.  
**Owner:** Compliance / Security

## Purpose

Produce a sealed, HMAC-signed attestation packet suitable for SOC2 / ISO27001
auditors or regulators.

## Inputs

- Active collectors in `compliance_evidence_collectors` (≥ 12).
- Recent rows in `compliance_evidence` (last 90 days by default).
- `ATTESTATION_SIGNING_KEY` secret configured.

## Procedure

1. Open `/admin/ai-runtime/compliance` → **Generate packet**.
2. Choose framework (`SOC2`, `ISO27001`, `GDPR`, `HIPAA`).
3. Optionally narrow to a control set (e.g., `CC6.*`).
4. Click **Build** — invokes `attestation-packet-builder` edge function.
5. Packet appears in the table with:
   - `bundle_sha256` — full-content hash
   - `signature` — HMAC-SHA256 over canonical JSON
   - `sealed_at` — immutable timestamp
6. Download JSON (and optionally render to PDF — Phase 10 feature).

## Verifying a packet

Auditors should:
1. Recompute SHA-256 of the packet body — must match `bundle_sha256`.
2. Recompute HMAC with the published verification key — must match `signature`.
3. Confirm `sealed_at` is monotonically increasing relative to prior packets.

## Frequency

- Quarterly minimum.
- Before any external audit.
- After any security incident (within 14 days).
