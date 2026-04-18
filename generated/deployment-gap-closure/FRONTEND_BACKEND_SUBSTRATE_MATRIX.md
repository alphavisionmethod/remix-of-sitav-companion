# Frontend ↔ Backend ↔ Substrate Matrix

_Generated: 2026-04-18T14:07:07.137Z_

## Action coverage: 24 actions

| Action | Backend | Substrate | Status |
|--------|---------|-----------|--------|
| App install | edge:app-install | db:installed_apps | real |
| App uninstall | edge:app-uninstall | db:installed_apps | real |
| App update check | edge:app-update-check | db:installed_apps | real |
| AI inference | edge:ai-gateway | db:ai_invocations + ai_usage_ledger | real |
| Connector token refresh (Google) | edge:connector-token-refresh | db:connector_oauth_tokens | real |
| Connector token refresh (Microsoft) | edge:connector-token-refresh | db:connector_oauth_tokens | real |
| Connector token refresh (Slack) | edge:connector-token-refresh | db:connector_oauth_tokens | real |
| Connector token refresh (Salesforce) | edge:connector-token-refresh | db:connector_oauth_tokens | real |
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
| Admin action audit | trigger+rls | db:admin_action_audit | real |
| AI budget alerting | edge:ai-gateway | db:ai_budget_alerts | real |
| Advisor recommendation | edge:advisor-loop | db:advisor_board_recommendations | real |
| Advisor action queue | edge:advisor-loop | db:advisor_action_queue | real |
| AI prompt invocation log | edge:ai-gateway | db:ai_prompt_invocations | real |
| AI inference receipt | edge:ai-gateway | db:ai_inference_receipts | real |

## Summary
- **Real:** 23
- **Honestly archived:** 1
- **Pending real implementation:** 0

