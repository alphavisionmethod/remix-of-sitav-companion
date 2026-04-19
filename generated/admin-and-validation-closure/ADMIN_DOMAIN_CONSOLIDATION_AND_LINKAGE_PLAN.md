# Admin Domain — Consolidation & Linkage Plan

> Generated: 2026-04-19. Owner: Admin & Validation Truth Closure.

## Rule

> **No new admin domains.** The Admin Control Plane is locked at 12 canonical
> domains (overview, alerts, approvals, environments, ai-runtime, integrations,
> trust-security, health, releases, verification, config, support).

## Cross-link plan (no new domains)

| From | Action surface | Cross-link target |
|---|---|---|
| ai-runtime / Nightly Truth | "View provider failover" | integrations / providers |
| ai-runtime / Connector Truth | "Manage connector" | integrations / connector hub |
| ai-runtime / Security Council | "Acknowledge finding" | trust-security / kill switches |
| ai-runtime / Mobile Scope Truth | "Distribution registry" | releases / distribution |
| ai-runtime / Frontend Polish Truth | "Re-emit closure" | (script: `polish:closure:emit`) |
| ai-runtime / Admin & Validation Truth | "Open release readiness" | releases / verification |
| ai-runtime / Hardware & Operator Truth | "Run drill" | (edge: `runbook-drill`), "Record hw run" (script) |
| alerts / row | "Open runbook" | support / runbooks |
| approvals / row | "View receipts" | verification / receipts |
| environments / service | "Open kill switch" | trust-security / kill switches |

## What this closure does NOT change

- Does NOT add a 13th domain.
- Does NOT split existing domains.
- Does NOT alter the AdminControlPlaneShell.
- Does NOT touch any non-AI-runtime hub.

All NEW UI surfacing in this closure lives strictly inside `src/pages/admin/ai-runtime/`
as additional `HubModule` tabs on the existing `AIRuntimeHome.tsx`.
