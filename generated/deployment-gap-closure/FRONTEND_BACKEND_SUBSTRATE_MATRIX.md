# Frontend ↔ Backend ↔ Substrate Matrix

_Generated: 2026-04-18T13:11:51.571Z_

## Action coverage: 16 actions

| Action | Backend | Substrate | Status |
|--------|---------|-----------|--------|
| App install | edge:app-install | db:installed_apps | real |
| App uninstall | edge:app-uninstall | db:installed_apps | real |
| App update check | edge:app-update-check | db:installed_apps | real |
| AI inference | edge:ai-gateway | db:ai_invocations + ai_usage_ledger | real |
| Connector token refresh (Google) | edge:connector-token-refresh | db:connector_oauth_tokens | real |
| Connector token refresh (Microsoft) | edge:connector-token-refresh | db:connector_oauth_tokens | real |
| Connector OAuth init | edge:connector-oauth | db:connector_credentials | real |
| Global search | rpc:supabase tables | db:multi-domain | real |
| Draft autosave | client-only | localStorage + IndexedDB (offline-db.ts) | real |
| File picker | client-only | FilePickerService context | real |
| Window snap | client-only | WindowContext + SnapGuideOverlay | real |
| Offline queue (web) | client-sync | IndexedDB:offline-db.ts | real |
| Offline queue (mobile) | n/a | n/a | archived-honestly |
| Approval requests | edge:approval-engine | db:approval_decisions | real |
| Receipt emission | edge:receipt-issuer | db:receipts | real |
| Kill-switch arm | edge:kill-switch-control | db:kill_switch_audit_log | real |

## Summary
- **Real:** 15
- **Honestly archived:** 1
- **Pending real implementation:** 0

