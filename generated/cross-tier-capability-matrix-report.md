# Cross-Tier Capability Matrix Report

> Generated: 2026-04-20T07:41:54.957Z
> Verdict: **✅ GREEN**

## Summary

| Metric | Value |
|---|---|
| Registered features | 48 |
| Referenced feature ids in code | 1 |
| Tiers per feature (must be 4) | 4 |
| Hard-coded tier literals outside `src/runtimes/` | 0 |
| Errors | 0 |
| Warnings | 0 |

## Feature × Tier matrix

| Feature | WEB_APP | DESKTOP_HOST | APPLIANCE_RUNTIME | SIMULATED_OS_EXPERIENCE | Honesty |
|---|---|---|---|---|---|
| `auth-email` | supported | supported | supported | prohibited | honest |
| `auth-google` | supported | supported | supported | prohibited | honest |
| `biometric-auth` | fallback | fallback | prohibited | prohibited | honest |
| `boardroom` | supported | supported | supported | supported | honest |
| `business-os` | supported | supported | supported | supported | honest |
| `money-os` | supported | supported | supported | supported | honest |
| `concierge` | supported | supported | supported | supported | honest |
| `files` | supported | supported | supported | supported | honest |
| `communications` | supported | supported | supported | supported | honest |
| `search` | supported | supported | supported | supported | honest |
| `command-palette` | supported | supported | supported | supported | honest |
| `approval-flows` | supported | supported | supported | supported | honest |
| `proof-receipts` | supported | supported | supported | supported | honest |
| `filesystem-local` | fallback | supported | supported | prohibited | honest |
| `file-picker` | supported | supported | supported | supported | honest |
| `local-backup` | fallback | supported | supported | prohibited | honest |
| `notifications-push` | supported | supported | prohibited | prohibited | honest |
| `notifications-native` | fallback | supported | prohibited | prohibited | honest |
| `in-app-toast` | supported | supported | supported | supported | honest |
| `window-control` | simulated | supported | simulated | prohibited | needs-disclosure |
| `tray-icon` | prohibited | supported | prohibited | prohibited | honest |
| `menu-bar` | simulated | supported | simulated | prohibited | needs-disclosure |
| `auto-update-desktop` | prohibited | supported | prohibited | prohibited | honest |
| `crash-reporter-ui` | fallback | supported | fallback | prohibited | honest |
| `first-boot-ceremony` | simulated | simulated | supported | prohibited | needs-disclosure |
| `ota-update` | prohibited | prohibited | supported | prohibited | honest |
| `appliance-recovery` | prohibited | prohibited | supported | prohibited | honest |
| `managed-runtime-services` | prohibited | prohibited | supported | prohibited | honest |
| `desktop-shell` | simulated | simulated | simulated | simulated | needs-disclosure |
| `dock` | simulated | simulated | simulated | simulated | honest |
| `lock-screen` | simulated | simulated | simulated | simulated | honest |
| `control-center` | simulated | simulated | simulated | simulated | honest |
| `mission-control` | simulated | simulated | simulated | simulated | honest |
| `app-launcher` | simulated | simulated | simulated | simulated | honest |
| `boot-sequence-ux` | simulated | simulated | supported | prohibited | needs-disclosure |
| `ambient-widgets` | simulated | simulated | simulated | simulated | honest |
| `wallpaper` | simulated | simulated | simulated | simulated | honest |
| `nova-kernel-runtime` | simulated | simulated | simulated | simulated | needs-disclosure |
| `nova-filesystem-runtime` | simulated | simulated | simulated | simulated | needs-disclosure |
| `nova-compositor-runtime` | simulated | simulated | simulated | simulated | needs-disclosure |
| `process-model-runtime` | simulated | simulated | simulated | simulated | honest |
| `trust-zones` | simulated | simulated | supported | prohibited | needs-disclosure |
| `mobile-pwa-install` | supported | prohibited | prohibited | prohibited | honest |
| `session-restore` | supported | supported | supported | supported | honest |
| `connectors` | supported | supported | supported | supported | honest |
| `integration-oauth` | supported | supported | supported | supported | honest |
| `admin-dashboard` | supported | supported | supported | supported | honest |
| `kill-switches` | supported | supported | supported | supported | honest |
