# Auth & Identity Runtime

> **Layer:** L3 Platform Service · **Registry:** `src/lib/platform/auth/auth-runtime.ts`, `session-registry.ts`

## Purpose

Single source of truth for identity, sessions, MFA/passkey, trusted devices, and admin/owner/connector session separation.

## Auth Methods

The supported authentication methods are declared in `AUTH_RUNTIME_CONTRACTS`:

| Method | Default Plane | Required Factor(s) | Trusted Device? |
|--------|---------------|--------------------|-----------------|
| `password` | user | password | no |
| `magic-link` | user | email | no |
| `oauth-google` | user | provider proof | no |
| `passkey` | user | passkey | yes (≥ secondary) |
| `sso-saml` | user | password | no (org-managed) |
| `phone-otp` | user | sms | no |

> Apple OAuth is *declared* (deferred). Web push is the active push channel.

## Session Planes

| Plane | Issued By | Idle TTL | Absolute TTL | Concurrent Max |
|-------|-----------|----------|--------------|----------------|
| `user` | any standard auth | 24h | 7d | 8 |
| `admin` | password / passkey / SAML + MFA | 30m | 8h | 3 |
| `owner` | passkey only | 15m | 4h | 2 |
| `connector` | SAML / service | 24h | 30d | 32 |
| `support` | password / passkey | 15m | 1h | 1 |

## Elevation Rules

`requiresElevation(plane, capabilityKey)` returns true when a capability requires *recently re-authenticated* state (within `elevationTtlMinutes`). Elevation always emits an `audit-event` proof.

## State Machine

States: `active` → `elevated`/`stale`/`revoked`/`expired`/`locked`.
Transitions are declared in `SESSION_TRANSITIONS`; receipts are emitted on every revoke / expire / lock / unlock.

## Trusted Device Classes

`personal-primary > personal-secondary > shared-trusted > kiosk > untrusted`. Owner plane requires `personal-primary`; admin plane requires at least `personal-secondary`.

## Recovery

- `self-serve`: standard email recovery
- `support-required`: SAML / phone-OTP — operator must assist
- `owner-only`: lockouts of owner plane

## Enforcement Points

- **Client guard**: `useAuth()` + `<ProtectedRoute>` / `<ElevatedRoute>` wrappers
- **Edge**: every privileged edge function calls `assertSession({plane, capability})`
- **DB**: `has_role`, `has_admin_permission`, RLS user-isolation policies
