# Communications — Trust Copy Spec

**Surface**: `/communications/*`, `/admin/CommunicationHub`, `/admin/integrations/*`
**Owner**: Communications + Integrations domains

## Distinction: live OAuth-backed vs manual long-tail providers

| Provider class | Examples | Allowed copy | Forbidden copy |
|---|---|---|---|
| Live OAuth | Google, Microsoft, Slack | "Live OAuth · auto-refresh · 7-day streak" + `ConnectorStateBadge state="connected"` | "Connected" (naked), "always-on" |
| Manual long-tail | All non-OAuth providers | "Manual provider · operator-supplied credentials" + `ConnectorStateBadge state="manual"` | "Connected" (without manual disclosure) |
| Reauth required | Any failed refresh | "Reauth required — last refresh failed at {ts}" + `ConnectorStateBadge state="reauth_required"` | "Connected", silent failure |
| Wired (no proof yet) | New connector | "Wired · runtime proof pending" + `ConnectorStateBadge state="wired"` | "Live", "Connected" |

## Required state coverage

- Connector list loading: `Skeleton` rows
- Connector list empty: `EmptyState` with "Add connector" CTA
- Per-connector state: `ConnectorStateBadge` (always; never bare text)
- Refresh streak: integer day-count from `connector_refresh_streak` ledger
- Reauth: red badge + remediation link

## Approved hero phrases

- "Live OAuth refresh on Google, Microsoft, and Slack — verified nightly"
- "Manual providers labeled clearly — no implied automation"
- "Reauth surfaces immediately — never silent disconnection"

## Validation

`check-communications-connector-state-alignment.ts` (existing) verifies every provider row carries a `ConnectorStateBadge` and forbidden phrases are absent.
