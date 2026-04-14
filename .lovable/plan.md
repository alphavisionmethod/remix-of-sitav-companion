

# Enhanced Session, Secrets, and Key Hierarchy — Implementation Plan

## Current State Assessment

The OS security subsystem is already substantial:
- **sessiond** (250 lines): Login, lock/unlock, idle timeout, guest sessions, event bus — but lacks session tokens, fast user switching, suspend/resume policy, extended states
- **secretsd** (372 lines): Full AES-256-GCM crypto, master→KEK→DEK hierarchy, keyrings (system/user/service/ephemeral), opaque handles, rotation, revocation — but lacks secret versioning, soft-delete/secure-erase lifecycle, policy bindings, TPM abstraction
- **authd** (504 lines): PBKDF2 + ECDSA token signing, elevation tokens, rate limiting, account management — fully wired
- **controlcenterd** (336 lines): IPC routing, policy preflight, elevation orchestration — fully wired
- **policyd** (326 lines): RBAC + capability evaluation, environmental context — fully wired
- **auditd** (255 lines): Hash-chained audit log — fully wired
- **types.ts** (338 lines): Core contracts — needs extension for new models
- **EnhancedLockScreen** (637 lines): Premium lock screen UI — already integrated
- **flows/index.ts**: WiFi, VPN, firewall, session unlock flows — already wired

## What Needs to Be Added

### Missing from sessiond
1. **Session tokens** — No `SessionToken` model; no issuance, rotation, revocation, scope-based invalidation on lock
2. **Extended session states** — Missing `creating`, `resuming`, `suspended`, `expired`, `revoked`
3. **Fast user switching** — No multi-session switching with isolation
4. **Suspend/resume lock policy** — No powerd integration or elapsed-time policy
5. **Screen saver → lock transition** — Basic idle→lock exists but no configurable grace/screensaver phase
6. **Remote session restriction** — No remote session model or policy
7. **Session type** — No `local`/`guest`/`remote` field distinction
8. **Lockscreen action matrix** — Partial; needs full matrix with audit severity per action

### Missing from secretsd
1. **Secret status lifecycle** — Missing `soft_deleted`, `destroyed` states and deletion queue
2. **Secret versioning** — No version history; rotation overwrites in-place
3. **Secret access policy bindings** — No per-type policy registry (allowed services, rotation interval, export rules)
4. **TPM abstraction** — Referenced but not implemented as a subsystem
5. **Enhanced handle model** — Missing `allowed_operations` (decrypt, sign, derive, unwrap_temp, reveal_once)
6. **Memory hygiene** — Best-effort zeroization exists but no structured secure allocator pattern
7. **Key rotation at keyring level** — KEK rotation not implemented

### Missing from types.ts
1. `SessionToken` with audience, scopes, key_id, signature, token classes
2. `SecretStatus` enum (active/revoked/soft_deleted/destroyed)
3. `SecretAccessPolicyBinding` with allowed_services, rotation_interval, export rules
4. `SecretVersion` with ciphertext_ref, wrapping_key_id
5. `SecretDeletionEntry` for secure erase queue
6. `SuspendLockPolicy` and `IdlePolicy` types
7. `LockscreenActionRule` for the full matrix

### No DB tables exist for this subsystem — all state is in-memory singletons (appropriate for a simulated OS)

## Implementation Plan — 4 Batches

### Batch 1: Extended Types + Session Token Engine (~300 lines)

**Extend `src/lib/os-security/types.ts`** — Add:
- `ExtendedSessionState`: `creating | active | inactive | locked | authenticating | terminating | resuming | suspended | expired | revoked`
- `SessionType`: `local | guest | remote`
- `SessionToken` model: `token_id`, `session_id`, `user_id`, `audience`, `scopes[]`, `issued_at`, `expires_at`, `sensitive`, `revoked`, `key_id`, `signature`, `token_class` (ui_session | privileged_action | broker | service_delegation | lockscreen_limited | fresh_auth)
- `SuspendLockPolicy`: `always_lock | lock_after_threshold | never_lock`, threshold_ms, force_reauth_sensitive
- `IdlePolicy`: idle_timeout_ms, screensaver_delay_ms, grace_interval_ms, auto_lock
- `LockscreenActionRule`: action, allowed/denied/conditional, policy_source, auth_required, audit_severity
- `SecretStatus`: `active | revoked | soft_deleted | destroyed`
- `SecretVersion`: version_id, secret_id, version, ciphertext_ref, wrapping_key_id, created_at, superseded_at
- `SecretAccessPolicyBinding`: secret_type, owner_scope_pattern, allowed_services[], export_allowed, hardware_required, rotation_interval_sec
- `SecretDeletionEntry`: deletion_id, secret_id, delete_mode (soft/secure_erase), scheduled_at, completed_at
- `EnhancedSecretHandle`: extends SecretHandle with `allowed_operations[]` (decrypt, sign, derive, unwrap_temp, reveal_once, connect_auth, import_protected)
- `TPMState`: present, sealed_keys[], fallback_mode, posture_flag

**Extend `src/lib/os-security/sessiond.ts`** — Add:
- `SessionTokenIssuer` class: issue tokens with class/scope/audience, sign with ECDSA, rotate, revoke, invalidate sensitive scopes on lock, reissue on unlock
- Extended `OSSession` fields: `sessionType`, `tokens[]` (by reference), `suspendPolicy`
- `switchSession(fromId, toId)`: validate isolation, swap foreground, emit events, audit
- `suspendSession(sessionId)` / `resumeSession(sessionId, elapsedMs)`: evaluate policy, lock if threshold exceeded, invalidate sensitive handles
- `setIdlePolicy(sessionId, policy)`: configurable screensaver delay, grace interval
- Idle flow upgrade: `active → screensaver_active → lock_pending → locked` with configurable intervals
- `SessionEvent` extended: add `switch`, `suspend`, `resume`, `token-issued`, `token-revoked` event types
- Lockscreen action matrix: full `LockscreenActionRule[]` table with 20+ entries

### Batch 2: Enhanced Secrets Daemon (~250 lines)

**Extend `src/lib/os-security/secretsd.ts`** — Add:
- `SecretStatus` lifecycle: `active → revoked → soft_deleted → destroyed` with transitions
- `softDeleteSecret(secretId)`: mark soft_deleted, schedule secure erase after retention period
- `secureErase(secretId)`: overwrite encrypted store, remove DEK, remove metadata, audit
- `SecretVersionManager`: store version history on rotation (keep N versions), allow rollback to previous version
- `SecretAccessPolicyRegistry`: register per-type policy bindings (which services can access wifi-psk vs vpn-private-key), enforce on handle issuance and retrieval
- Enhanced handle model: `allowed_operations[]` enforcement — handle only permits specific crypto operations, not blanket read
- `deriveKey(secretId, context, callerService)`: HKDF-based key derivation from a stored secret, returns derived material without exposing parent
- `rotateKeyring(keyringId)`: re-wrap all DEKs under new KEK, version the KEK, audit
- `TPMAbstractionLayer`: interface for seal/unseal/attest, software fallback with degraded posture flag, integrate with key hierarchy root
- `DeletionQueue`: process scheduled deletions, configurable retention (24h default), audit on execution
- Memory hygiene: structured `SecureBuffer` wrapper that zeros on dispose (best-effort in JS via TypedArray fill)

### Batch 3: Flows + Integration Wiring (~200 lines)

**Extend `src/lib/os-security/flows/index.ts`** — Add complete end-to-end flows:
- **Login → session token issuance → user keyring unlock**: Full flow using new token issuer
- **Idle → screensaver → lock → sensitive token revocation**: Upgraded idle flow with grace interval
- **Suspend → resume → policy evaluation → lock/reauth**: New suspend/resume flow integrating with powerd concept
- **Fast user switch**: Session isolation, token separation, keyring rebinding
- **WiFi connect with constrained handle**: wifid gets handle with `connect_auth` operation only, single-use, 30s TTL
- **VPN sign with opaque handle**: shieldd gets handle with `sign` operation only, secretsd performs crypto internally
- **Guest teardown**: Destroy ephemeral keyring, erase guest secrets, purge tokens, audit

**Extend `src/lib/os-security/controlcenterd.ts`** — Add:
- `session.switch` and `session.suspend`/`session.resume` action routing
- Token-aware session validation (check token class matches action sensitivity)

### Batch 4: Admin UI — Session & Secrets Dashboard (~500 lines)

**Create `src/pages/admin/SEC01SessionSecrets.tsx`** — Admin-only Session & Secrets Command Center

Glassmorphic multi-tab dashboard:
- **Tab 1 — Sessions**: Active/locked/suspended sessions table, session tokens list with class/scope/expiry, fast-switch controls, idle policy editor
- **Tab 2 — Lockscreen Matrix**: Full action rules table (action, allowed/denied, policy, auth required, severity), editable policies
- **Tab 3 — Secrets Vault**: Keyrings with secret counts, secret metadata browser (no plaintext), handle issuance log, access events timeline
- **Tab 4 — Key Hierarchy**: Visual tree (Root Device Key → KEK → Per-Keyring Master → DEKs), TPM status, rotation history, posture indicator
- **Tab 5 — Diagnostics**: Token counts by session, secret backend health, recent denied access, deletion queue status, key migration status

**Extend `src/routes/AdminRoutes.tsx`**: Register `/admin/security/sessions` route
**Extend `src/pages/admin/AdminDashboard.tsx`**: Add Session & Secrets health card

## Design Language
- Same glassmorphic style: `bg-white/[0.04]`, `backdrop-blur-xl`, `border-white/[0.06]`
- Color coding: Sessions = blue, Secrets = amber, Keys = emerald, TPM = purple
- Token lifecycle timeline with state dots
- Key hierarchy as vertical tree diagram with connection lines

## File Summary
- **Modify**: `types.ts`, `sessiond.ts`, `secretsd.ts`, `flows/index.ts`, `controlcenterd.ts`, `AdminRoutes.tsx`, `AdminDashboard.tsx` (7 files)
- **Create**: `SEC01SessionSecrets.tsx` (1 file)
- **Total**: ~1,250 lines of new/modified code across 8 files

