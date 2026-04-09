# SITA OS — Mobile Experience System

## Ownership

Domain: `platform`
Service: `mobile-shell`
Status: alpha

## Core Capabilities

| Capability | Description |
|------------|-------------|
| Mobile Shell | Responsive OS shell optimized for touch and small screens |
| Mobile Approvals | Swipe-to-approve for trust-weighted actions |
| Boardroom Mobile | Presentation mode for mobile devices |
| Receipt Viewer | Mobile-optimized receipt chain browsing |
| Push Alerts | Native and web push notification handling |
| Offline Mode | Service worker caching, offline-first data access |
| Biometric Auth | Fingerprint/face unlock integration (Capacitor) |

## Page Map

| Route | Purpose |
|-------|---------|
| `/mobile` | Mobile home — daily pulse, quick actions |
| `/mobile/approvals` | Pending approvals with swipe gestures |
| `/mobile/boardroom` | Mobile presentation mode |
| `/mobile/receipts` | Receipt chain browser |
| `/mobile/alerts` | Notification center |
| `/mobile/settings` | Mobile-specific settings |

## Data Model

- Shares core tables with desktop (no separate mobile schema)
- `push_subscriptions` — web push registration
- `device_registry` — registered devices and capabilities
- `notification_preferences` — per-device notification settings

## Proof Model

- Approval receipt (device ID, biometric verification, timestamp)
- Push delivery receipt (sent, delivered, opened)

## Integration Points

- `push-registration-service` — VAPID web push, FCM Android
- `trust-weighted-actions` — approval flow
- `receipt-service` — mobile receipt viewing
- `adaptive-interface-profiles` — density/mode per device
- PWA manifest + service worker for installability
