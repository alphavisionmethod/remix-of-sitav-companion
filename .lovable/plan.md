

# OS Identity, Auth, Privilege & Secrets Foundation — Implementation Plan

## Current State

The project already has significant foundations:
- **`src/packages/auth/index.ts`** — AuthSession, AuthScope, AuthRole, MFA types, session validation, permission grants
- **`src/lib/services/auth/index.ts`** — Basic AuthService with session create/validate/revoke/MFA
- **`src/lib/services/keyvault/index.ts`** — KeyvaultService with encrypted storage, rotation policies, access logging
- **`src/lib/services/biometric-auth/index.ts`** — WebAuthn/Passkey bridge (register + authenticate)
- **`src/lib/services/audit-ledger/index.ts`** — AuditLedgerService with severity levels, correlation IDs
- **`src/lib/core-services/policy-engine.ts`** — PolicyEngine with rules, conditions, effects (allow/deny/require-approval)
- **`src/lib/core-services/kernel/system-daemons.ts`** — DaemonRegistry with `sita-sessiond`, `sita-polkitd`, `sita-tpmd` defined
- **`src/lib/services/identity-auth/`** — Identity provider separation, consent ledger, account graph
- **`src/lib/services/security/security-posture-engine.ts`** — Full threat model and scoring
- **`src/components/sita/shell/EnhancedLockScreen.tsx`** — Working lock screen with password auth
- **`src/contexts/AuthContext.tsx`** — Supabase auth + demo mode

## What Needs Building

The existing pieces are disconnected fragments. This plan wires them into a unified OS security subsystem with 6 real daemon services, a capability/elevation model, and integrated UI.

---

## Batch 1: Core Daemon Services (authd, policyd, secretsd)

### Files Created
- **`src/lib/os-security/types.ts`** — All shared enums, interfaces, and contracts:
  - `UserRole` (Guest/Standard/Admin/System), `AuthMethod` (Password/PIN/Biometric/SecurityKey)
  - `UserSession`, `ServiceIdentity`, `DeviceIdentity`, `ElevationApprovalToken`
  - `SecretType`, `SecretMetadata`, `Capability`, `ActionPolicy`
  - `AuditEvent`, `SessionState` (active/inactive/locked/authenticating/terminating)
  - Full capability registry (wifi.toggle, shield.vpn.toggle, cert.install.system, etc.)
  - Action authorization table mapping action → required role, capability, elevation, fresh-auth

- **`src/lib/os-security/authd.ts`** — Authentication daemon:
  - User account database (local accounts, guest, standard, admin, system/service identities)
  - Password verification with salted hashing (Web Crypto PBKDF2), rate limiting, lockout
  - PIN verification (separate from password), biometric bridge delegation
  - Session creation/lock/unlock state machine, credential freshness tracking
  - Elevation authentication: challenge → verify → issue signed short-lived approval token
  - Credential enrollment/change/rotation workflows
  - Integrates with existing `BiometricAuthBridge` and `AuthService`

- **`src/lib/os-security/policyd.ts`** — Authorization daemon:
  - Capability-based + role-based evaluation
  - Action registry with full authorization matrix (50+ system actions)
  - Contextual checks: locked screen, guest session, enterprise mode, public WiFi, lockdown
  - Deny-by-default evaluation with signed policy loading
  - Decision logging to auditd
  - Extends existing `PolicyEngine` with OS-specific system action rules

- **`src/lib/os-security/secretsd.ts`** — Secrets management daemon:
  - System/User/Service/Ephemeral keyrings
  - Encrypted storage using Web Crypto AES-256-GCM with AEAD
  - Master key → KEK → per-secret DEK hierarchy
  - TPM integration abstraction (degrade gracefully to software)
  - Opaque handle pattern: services request operations by handle, plaintext never leaves secretsd
  - Secret types: WiFi PSK, VPN private key, API token, certificate key, Bluetooth bond, app credential
  - Rotation, revocation, secure erase (zeroization)
  - Wraps and replaces current `KeyvaultService` with real encryption
  - Access control: only authorized service identities can read specific scopes

### Files Modified
- **`src/lib/core-services/kernel/system-daemons.ts`** — Add `sita-authd`, `sita-policyd`, `sita-secretsd` daemon definitions

---

## Batch 2: Session Manager, Audit, & Control Center Daemon

### Files Created
- **`src/lib/os-security/sessiond.ts`** — Session manager daemon:
  - Full session lifecycle: login → active → idle → locked → authenticating → unlocked → terminating
  - Guest session lifecycle with auto-teardown
  - Idle timeout, screen saver → lock transition
  - Session token rotation and revocation
  - Auth freshness tracking (sensitive actions need fresh auth within N minutes)
  - Fast user switching support, multi-session readiness
  - Lock screen rules: what's accessible while locked (battery yes, WiFi policy-driven, certs no)

- **`src/lib/os-security/auditd.ts`** — Enhanced audit daemon:
  - Tamper-evident append-only chain with hash chaining
  - Structured events: actor, session, service, target, action, decision, severity, correlation ID
  - Covers: auth success/failure, elevation, role changes, secret access, firewall changes, cert imports
  - Export tooling and privacy-aware redaction
  - Integrates with existing `AuditLedgerService` as backend

- **`src/lib/os-security/controlcenterd.ts`** — Control center daemon:
  - Command entry point from UI — validates caller identity
  - Request normalization and policy preflight via policyd
  - Elevation routing: if action needs admin, trigger secure prompt flow
  - Service orchestration: routes approved commands to wifid/shieldd/powerd/btd/certd
  - Async response and event fanout
  - Wires into existing `DesktopSystemWidget` and `SecurityCenterWindow`

- **`src/lib/os-security/index.ts`** — Barrel export for all daemons, boot initialization

### Files Modified
- **`src/lib/core-services/kernel/system-daemons.ts`** — Add `sita-auditd`, `sita-controlcenterd` definitions
- **`src/lib/core-services/index.ts`** — Export os-security barrel

---

## Batch 3: Elevation Flow & Secure Prompt UI

### Files Created
- **`src/lib/os-security/elevation-engine.ts`** — PolicyKit-style elevation:
  - Elevation request lifecycle: UI → controlcenterd → policyd → challenge → authd → approval token
  - Approval token: scoped to single action, short-lived (60s), signed, single-use, with nonce
  - Token validation: target service validates with authd/policyd before executing
  - Rate limiting and replay protection
  - Audit logging of every elevation attempt

- **`src/components/sita/shell/SecurePrompt.tsx`** — Trusted elevation prompt UI:
  - Glassmorphic modal (matches OS style) with clear action description
  - Shows: requesting app/service, target action, risk level, impact description
  - Supports password/PIN/biometric/security key input based on policy
  - Auto-timeout (60s), cancel button, cannot be dismissed by clicking outside
  - Example: "Administrator approval is required to disable Firewall protection"
  - Prevents spoofing: only rendered by shell layer, not by apps
  - `onPointerDown={stopPropagation}` to prevent interaction leaking

- **`src/components/sita/shell/SecurePromptProvider.tsx`** — Context provider:
  - `useSecurePrompt()` hook for triggering elevation from anywhere in the OS
  - Queue management for multiple elevation requests
  - Integrates with controlcenterd

### Files Modified
- **`src/components/sita/shell/ShellWindowLayer.tsx`** — Mount SecurePromptProvider
- **`src/components/sita/shell/desktop/DesktopSystemWidget.tsx`** — Wire toggles through controlcenterd instead of direct state

---

## Batch 4: Integration Flows & Service Wiring

### Files Created
- **`src/lib/os-security/flows/wifi-connect.ts`** — End-to-end WiFi connect flow:
  - User selects network → controlcenterd → policyd check → credential capture via secure prompt → secretsd stores PSK → wifid connects → auditd logs

- **`src/lib/os-security/flows/vpn-cert-install.ts`** — VPN/certificate install flow:
  - Admin-only + fresh elevation → secure prompt → authd verifies → certd imports → key stored in secretsd → shield notified → audit logged

- **`src/lib/os-security/flows/firewall-disable.ts`** — Firewall disable flow:
  - Standard user denied → admin requires fresh auth → approval token → shieldd validates → state changed → high-severity audit

- **`src/lib/os-security/flows/session-unlock.ts`** — Session unlock flow:
  - Lock screen → authd → policy-driven method selection → session unlocked → freshness window updated

### Files Modified
- **`src/components/sita/shell/desktop/SystemWifiPanel.tsx`** — Wire "Connect" through controlcenterd flow
- **`src/components/sita/shell/desktop/SystemBluetoothPanel.tsx`** — Wire pairing through controlcenterd
- **`src/components/sita/shell/windows/SecurityCenterWindow.tsx`** — Wire firewall/VPN/cert actions through controlcenterd with elevation

---

## Batch 5: Lock Screen Enhancement & Settings Integration

### Files Modified
- **`src/components/sita/shell/EnhancedLockScreen.tsx`** — Wire through sessiond/authd:
  - Multiple auth method support (password, PIN, biometric button)
  - Auth freshness tracking on unlock
  - Policy-driven locked-screen capabilities (show battery, restrict WiFi toggle)
  - Failed attempt rate limiting with lockout display

- **`src/components/sita/PlatformInit.tsx`** — Initialize os-security subsystem on boot:
  - Boot authd → policyd → secretsd → sessiond → auditd → controlcenterd (ordered)
  - Register service identities for wifid/shieldd/powerd/btd

### Files Created
- **`src/components/sita/shell/windows/SecurityAccountsPanel.tsx`** — Settings panel for identity management:
  - View enrolled auth methods (password, PIN, biometric, security key)
  - Manage trusted devices
  - View active sessions
  - Credential change workflows
  - Service identity registry view (for admin)

---

## Batch 6: Database Tables & Persistence

### Database Migration
New tables (all with RLS `auth.uid() = user_id`):

- **`os_user_accounts`** — user_id, username, role, status, password_hash_ref, profile_ref, created_at
- **`os_auth_methods`** — user_id, type (password/pin/biometric/security_key), enabled, enrolled_at, last_used_at
- **`os_sessions`** — user_id, session_id, role, state, locked, auth_fresh_until, created_at, last_activity_at
- **`os_capabilities`** — capability_id, name, description, sensitivity_level
- **`os_role_capabilities`** — role, capability_id, default_allowed
- **`os_service_identities`** — service_name, uid, privileged, allowed_actions, secret_scope
- **`os_secrets_metadata`** — user_id, secret_id, owner_scope, type, keyring_id, created_at, version, revoked
- **`os_keyrings`** — user_id, keyring_id, scope, protection_class, hardware_backed, rotated_at
- **`os_elevation_tokens`** — user_id, token_id, session_id, action, target_service, issued_at, expires_at, consumed_at, single_use
- **`os_audit_events`** — user_id, event_id, actor_session_id, actor_service, action, resource, decision, severity, correlation_id, ts

All tables get RLS policies scoped to authenticated users viewing their own data.

---

## Technical Details

- **Encryption**: Web Crypto API — AES-256-GCM for secrets, PBKDF2 for password hashing, ECDSA for token signing
- **Key hierarchy**: Device key (derived from user credential + entropy) → KEK → per-keyring master → per-secret DEK
- **TPM fallback**: Software-only mode with `hardware_backed: false` flag, stronger KDF parameters
- **Token format**: JWT-like signed tokens with `{token_id, session_id, user_id, action, target_service, issued_at, expires_at, nonce, signature}`
- **IPC pattern**: All daemon methods are async, return typed results with error codes
- **Persistence**: Daemons use `universal-service-persistence` for in-memory state + Supabase tables for durable data
- **No breaking changes**: Existing auth flow (Supabase Auth + demo mode) remains unchanged; OS security layer sits on top

## Scope Summary
- ~15 new files, ~5 modified files
- ~2500 lines new code across 6 batches
- 10 new database tables with RLS
- 0 new npm dependencies (uses Web Crypto API)

