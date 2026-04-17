# Notification Runtime Model

> **Layer:** L3 Platform Service · **Registry:** `src/lib/platform/notifications/notification-topology.ts`

## Purpose

Cross-surface notification routing, calm/fatigue control, and per-channel capability truth.

## Notification Classes

| Class | Audience | Default Channels | Calm Category |
|-------|----------|------------------|---------------|
| `system.alert` | admin | in-app + push-web + email + tray | interrupting |
| `security.event` | user | in-app + push-web + email | interrupting |
| `approval.required` | user | in-app + push-web | important |
| `approval.decided` | user | in-app | ambient |
| `advisor.recommendation` | user | in-app | digestible |
| `execution.completed` | user | in-app | ambient |
| `execution.failed` | user | in-app + push-web | important |
| `incident.opened` | admin | in-app + push-web + tray + email | interrupting |
| `boardroom.escalation` | owner | in-app + push-web + email | important |
| `marketing.update` | user | in-app + email | digestible |
| `calm.summary` | user | email + in-app | digestible |

## Channels

| Channel | Web | Desktop | Appliance | Mobile | Credential |
|---------|-----|---------|-----------|--------|------------|
| `in-app` | ✓ | ✓ | ✓ | ✓ | — |
| `push-web` | ✓ | ✓ | ✓ | — | `VAPID_PUBLIC_KEY` |
| `push-mobile` | — | — | — | ✓ | `FCM_SERVICE_ACCOUNT_JSON` (planned) |
| `push-apple` | — | — | — | ✓ | `APNS_KEY_ID` (deferred) |
| `email` | ✓ | ✓ | ✓ | ✓ | — |
| `sms` | ✓ | ✓ | ✓ | ✓ | `TWILIO_AUTH_TOKEN` |
| `system-tray` | — | ✓ | ✓ | — | — |

## Calm / Fatigue Control

- `interrupting` notifications bypass calm gates (security, incidents).
- `important` honors a fatigue window (5–60 min).
- `ambient` and `digestible` are eligible for the daily `calm.summary` digest.
- Each class declares `fatigueWindowMinutes` to suppress duplicate notifications.

## Proof of Delivery / Open

Critical classes (`system.alert`, `security.event`, `approval.required`, `execution.failed`, `incident.opened`, `boardroom.escalation`) require delivery proof recorded in `notification_deliveries`. Opens are tracked for `interrupting` classes.

## Tier Resolution

`resolveDeliveryPlan(className, tier)` returns the effective primary + fallback channel set after filtering by what the runtime actually supports.

## Apple Push (deferred)

Apple push is *declared* but not active. UI does not promise the channel; admin surfaces label it `planned`.

## Enforcement

- Channel kill switches: `notifications-kill`, `marketing-kill`, `comms-kill`.
- Rate limits at the bus prevent storm conditions.
- Every send writes to `notification_deliveries` with `dispatched_at`, `delivered_at`, `opened_at`.
