

# Connector Reality — Gap Fix Plan

## What Already Exists (Fully Built)

| Layer | Status | Details |
|---|---|---|
| **Database Tables** | Complete | `connector_registry`, `connector_accounts`, `connector_oauth_tokens`, `connector_oauth_flows`, `connector_receipts`, `connector_health_records`, `connector_launch_readiness`, `connector_policies`, `connector_sync_runs` — all with RLS, foreign keys |
| **Edge Functions** | Complete | `connector-oauth` (366 lines: initiate, callback, token exchange, disconnect, revocation, consent ledger), `connector-health` (86 lines: staleness checks, health reporting), `connector-operations`, `connector-proxy`, `connector-batch`, `connector-discover`, `connector-transform` |
| **7 CN Admin Pages** | Complete | CN01–CN07 at `/admin/connectors/*`, all with real Supabase queries, DemoModeBadge |
| **Routes** | Complete | All 7 CN pages routed in App.tsx |
| **OAuth Flow** | Complete | Google OAuth with state token, code exchange, token storage, refresh token, scope tracking, consent ledger, receipt generation |
| **Disconnect/Revoke** | Complete | Google token revocation, account status update, consent ledger revoke entry |
| **Agent Integration** | Complete | `connector-health` agent in reliability-ops council, scheduled via agent-scheduler |

## Gaps Found (2 Issues)

### Gap 1: No CNSubNav
CN01–CN07 pages lack a sub-navigation bar. SAG, AIG, AR, and LT pages all have sub-navs. CN pages have none.

**Fix**: Create `src/components/admin/CNSubNav.tsx` (same pattern as LTSubNav/ARSubNav) and inject into all 7 CN pages.

### Gap 2: No Command Palette Entries for CN Pages
The command palette has entries for AR (9), LT (7), AIG (9) — but zero for CN pages. Not discoverable via Cmd+K.

**Fix**: Add 7 entries to `UniversalCommandSurface.tsx` under a "Connector Reality" group.

## Implementation Steps

1. **Create `src/components/admin/CNSubNav.tsx`** — 7 navigation links: Overview, Registry, Accounts, Sync Truth, Health, Demo Review, Launch Gate
2. **Inject CNSubNav** into all 7 CN pages (CN01–CN07)
3. **Add 7 Command Palette entries** for all CN pages (cn-overview through cn-launch-gate)
4. **Build verification** — confirm clean TypeScript build

### Technical Details
- CNSubNav: ~45 lines, identical pattern to LTSubNav
- 7 page edits: ~3 lines each (import + render)
- Command palette: ~14 lines for 7 entries
- No new tables, edge functions, or migrations needed

