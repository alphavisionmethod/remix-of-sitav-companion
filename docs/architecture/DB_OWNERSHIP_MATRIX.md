# DB Ownership Matrix — SITA OS

> **Authority:** `src/lib/db/table-ownership-map.ts` + `src/lib/db/schema-registry.ts`

## 1. Purpose

Every table has exactly **one canonical owner domain** (no shared invisible ownership).

## 2. The 14 Bounded-Context Owners

| Domain | Owns tables matching | Canonical writer category |
|---|---|---|
| `auth-identity` | `profiles`, `device_*`, `biometric_*`, `*_session` | Identity service |
| `admin-governance` | `admin_*`, `cloud_admin_*` | Admin control plane |
| `advisor-intelligence` | `advisor_*` | Advisor runtime |
| `ai-workforce` | `ai_workforce_*`, `ai_inference_*` | AI workforce orchestrator |
| `boardroom` | `boardroom_*`, `board_*` | Boardroom service |
| `business-crm` | `business_*`, `contact_*`, `crm_*` | Business OS |
| `cloud-infrastructure` | `cloud_*`, `tenant_*` | Cloud control plane |
| `connector-fabric` | `connector_*`, `webhook_*`, `integration_*` | Connector orchestrator |
| `finance` | `invoice_*`, `payment_*`, `transaction_*` | Finance OS |
| `notification` | `push_*`, `notification_*`, `vapid_*` | Notification service |
| `os-kernel` | `runtime_*`, `command_steps`, `capabilities` | OS kernel |
| `platform-core` | `approval_*`, `proof_*`, `simulations`, `timeline_events` | Platform core |
| `compliance` | `audit_*`, `policy_*`, `attestation_*` | Compliance plane |
| `user-experience` | `user_preferences`, `wallpapers` | UX service |

## 3. Write-Path Rules

- **Direct write** — Owner service issues `INSERT/UPDATE/DELETE` directly
- **Orchestrated write** — Goes through `agent-executor` (single choke point)
- **Connector-fed write** — Inbound from `connector-webhook` functions only

## 4. Read-Path Rules

- Any service may **read** any table (subject to RLS)
- Generated read models / projections live in tables marked `schemaClass: "read"`
- Cross-domain reads must respect RLS — no service role bypass without justification

## 5. Edge-Function Boundaries

Every edge function declares (in `src/lib/backend-topology/edge-function-registry.ts`):
- Tables it READS
- Tables it WRITES

The check `scripts/db/checks/check-table-ownership.ts` enforces:
- A function may only WRITE to tables in its owner domain
- A function may READ across domains (subject to RLS)
- Connector webhooks are exempt for ingestion targets

## 6. Service-to-Table Boundary

| Service category | Allowed write classes |
|---|---|
| Domain service | `write`, `read` |
| Audit/proof writer | `log` only |
| Config admin | `config` only |
| OS kernel | `system` |
| Connector ingest | Owner-domain `write` only |

## 7. Sensitive Data Tables

These tables store secrets/credentials/PII and require additional safeguards:
- `connector_tokens`
- `biometric_credentials`
- `vapid_keys`
- `cloud_admin_role_assignments`
- (full list in `schema-registry.ts` where `sensitiveData: true`)

For each: encrypted at rest, restricted to service-role + owner, audited on every access.
