# Communications Inbox Closure Spec — Honest Deferral

**Scope:** Admin AI Engineering closure pass
**Verdict:** DEFERRED — out of admin AI engineering scope
**Cross-references:** [ADMIN_INTEGRATIONS_CLOSURE_SPEC.md](./ADMIN_INTEGRATIONS_CLOSURE_SPEC.md)
**Validator:** `scripts/validation/check-communications-connector-state-alignment.ts` (WARN-tier)

## Spec compliance verdict

Communications Inbox is listed in the spec, but `src/pages/communications/` does not exist as a top-level user surface. Per **"integrate it correctly only on the admin AI engineer team"**, inbox UI polish is **out-of-admin-AI-scope**. The connector backbone IS in scope and IS green.

## What IS in admin AI scope (already done)

- `OAuthRefreshHealthBoard` — admin-facing connector health & refresh streak.
- `IntegrationsHome` (`/admin/integrations`) — canonical connector hub with `ConnectorStateBadge` (6-state canonical chip: connected / degraded / reauth-required / failing / manual / archived).
- 7-day refresh streak model + receipt drawers.
- `connector_provider_health`, `connector_refresh_receipts`, and related canonical truth tables.
- BLOCK validator `admin-integrations-health-visibility` enforces this surface.

## What is NOT in admin AI scope

- A user-facing inbox UI that renders messages with live/degraded/reauth-required/failing/manual chips — **user-flagship-pass-required**.
- Inbox-specific empty/loading/error/retry treatments — **user-flagship-pass-required**.
- Inbox provider-state copy that distinguishes "long-tail / manual" from "live-provider" — **user-flagship-pass-required**.

## Canonical evidence locations

| Concern | Source of truth |
|---|---|
| Connector state chip | `src/components/connectors/ConnectorStateBadge.tsx` |
| Refresh health board | `src/pages/admin/integrations/OAuthRefreshHealthBoard.tsx` |
| Integrations hub | `/admin/integrations` (`IntegrationsHome`) |
| Connector health table | `connector_provider_health` |
| Refresh receipts | `connector_refresh_receipts` |
| BLOCK gate | `scripts/validation/check-admin-integrations-health-visibility.ts` |

## Honest WARN-tier classification

The connector backbone IS proven. The inbox UI is honestly deferred. The validator emits WARN-tier with cross-reference to this spec and to the canonical chip component.

## Required for green

A future user-flagship-pass must:
1. Build `/communications/inbox` (or equivalent) consuming `ConnectorStateBadge`.
2. Eliminate any ambiguous "connected" states by routing through `connector_provider_health`.
3. Add reauth/retry CTAs sourced from the canonical connector state contract.

Until then, this gate stays honest WARN.
