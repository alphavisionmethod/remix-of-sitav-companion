
## Re-Audit: Auth/Identity (11) + Permissions/Trust/Policy (11) — Real Gaps Found

**Scorecard against disk truth**

### Checklist 12 — Auth / Identity (11 items)

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Signup/signin works | ✅ | `AuthContext.tsx` signUp/signIn via Supabase, `Login.tsx`/`Signup.tsx` wired |
| 2 | Password reset works | ✅ | `ForgotPassword.tsx` + `ResetPassword.tsx` + `resetPassword`/`updatePassword` in context |
| 3 | Session refresh | ✅ | `onAuthStateChange` + `TOKEN_REFRESHED` handling in `AuthContext` |
| 4 | **MFA works if claimed** | ⚠️ **gap** | `AuthService.verifyMFA` is a stub (`s.mfaVerified=true; return true`). No real TOTP/SMS, no enrollment UI, no `auth.mfa.*` Supabase calls. `OS-MFA-REQUIRED` policy exists but no enrollment surface |
| 5 | Apple/Google/Microsoft | ✅ | `GoogleSignInButton`, `AppleSignInButton` via `lovable.auth.signInWithOAuth` |
| 6 | **Passkey/WebAuthn if claimed** | ⚠️ **gap** | `AccessProtectionFlow` lists "Passkey" + `IDENTITY_AUTH_METHODS` includes `passkey` + `web-fallbacks` cites `webauthn`, but **zero** `navigator.credentials.create/get` calls anywhere. Pure label, no implementation |
| 7 | Trusted device model | ✅ | `device-trust-registry.ts` (5 levels × form-factors), `device-identity-registry.ts` |
| 8 | Admin auth separated | ✅ | `AdminRoute.tsx`, `useRequireAdmin`, `PermissionGatedRoute`, `has_admin_permission` RPC |
| 9 | Identity provider contracts | ✅ | `identity-provider.service.ts`, `oauth_client_registry`, `IDENTITY_AUTH_METHODS` |
| 10 | Connector auth separate | ✅ | `connector-access.service.ts`, `auth-connector-separation.types.ts`, `account-graph.service.ts` |
| 11 | Account/env/device graph | ✅ | `identity-relationship-graph.ts`, account-graph service, `unified_account_nodes/edges` |

**Gaps:** items 4 + 6 — both claimed in registries/UI, both unimplemented in code.

### Checklist 13 — Permissions / Trust / Policy (11 items)

| # | Item | Status | Evidence |
|---|---|---|---|
| 1 | Unified permission matrix | ✅ | `admin_role_permissions` + `has_admin_permission` RPC + permission-coverage CI gate |
| 2 | Unified policy matrix | ✅ | `unified-policy-matrix.ts` + 9-dimension Phase 3 (actor/domain/surface/proof/reversibility/trust/approval) |
| 3.a | Trust level mapping | ✅ | `policy-trust-thresholds.ts` |
| 3.b | Proof requirement mapping | ✅ | `policy-proof-requirements.ts` |
| 3.c | Approval requirement | ✅ | `policy-approval-map.ts` |
| 3.d | Reversibility class | ✅ | `policy-reversibility-map.ts` + `reversibility-writer.ts` |
| 3.e | Surface restriction | ✅ | `policy-surface-map.ts` |
| 4 | Autonomy policy engine explicit | ✅ | `policy-engine.ts` + `AdvisorAutonomyPolicyEditor.tsx` + `ADV-AUTO-*` policies |
| 5 | Kill-switch-aware execution | ✅ | `kill-switch-enforcement-map.ts` (every switch has enforcement points), `checkKillSwitchOrReject` in edge fns |
| 6 | **Sensitive actions can't bypass** | ⚠️ **gap** | `resolveUnifiedPolicy` is **only referenced inside `src/lib/policy/`** — zero call sites in components, hooks, edge functions, or services. Doc claims "Edge functions read `_shared/policy.ts`" but **`supabase/functions/_shared/policy.ts` does not exist**. Policy resolver is decorative |
| 7 | UI trust states reflect backend | ⚠️ partial | Trust badges + admin pages exist, but no canonical hook (`usePolicyDecision`) that components consume — they read raw role/permission flags individually |
| 8 | Proof model real | ✅ | `unified-proof-layer.ts` + `receipt-service.ts` + `proof-orchestrator.ts` + `epistemic-firewall/negative-receipt.ts` |
| 9 | **Reversibility implemented** | ⚠️ partial | `rollback-engine.ts` exists but the rollback loop just `push({reversed:true})` — no compensating side-effect dispatch (no `executeCompensation(effect)` wired to actual reverse handlers) |

**Gaps:** items 6 (critical bypass risk), 7 (consumer hook), 9 (rollback no-op).

---

## Phase 19 — Auth/Policy/Trust Reality Closure

### 19.A — MFA enrollment + verification (Checklist 12 #4)
- **New** `src/lib/services/identity-auth/mfa.service.ts` — wraps `supabase.auth.mfa.enroll/challenge/verify/unenroll` (TOTP factor)
- **New** `src/pages/settings/MFAEnrollment.tsx` — QR enrollment flow + recovery codes display
- **New** `src/components/auth/MFAChallenge.tsx` — challenge prompt during sign-in / step-up
- **Update** `AuthContext.tsx` — detect AAL2 requirement, surface `requiresMFA` state
- **Update** `AuthService.verifyMFA` — call real MFA verify, not stub
- **DB migration** — `user_mfa_factors` view + RLS over Supabase auth schema mirror for admin visibility

### 19.B — WebAuthn / Passkey real implementation (Checklist 12 #6)
- **New** `src/lib/services/identity-auth/webauthn.service.ts` — `enrollPasskey()`, `assertPasskey()`, `listPasskeys()`, `revokePasskey()` using `navigator.credentials.create/get` + edge function for challenge issuance
- **New** `supabase/functions/webauthn-challenge/index.ts` — issues + verifies attestation/assertion, persists to `user_passkeys` table
- **New** `src/pages/settings/PasskeyManagement.tsx` — enroll, list, revoke
- **DB migration** — `user_passkeys` table (id, user_id, credential_id, public_key, counter, transports, created_at, last_used_at) + RLS user-scoped + I/O entry in `non-edge-table-io-sources.ts`

### 19.C — Wire `resolveUnifiedPolicy` into real call sites (Checklist 13 #6)
- **New** `supabase/functions/_shared/policy.ts` — Deno-port mirror exporting `resolveUnifiedPolicy` (subset for edge use). Used by every R3+ edge fn before mutating
- **New** `src/hooks/use-unified-policy.ts` — `useUnifiedPolicy(query) → decision` for client gating
- **Update** 6 highest-risk edge functions (advisor-execute, payment-* etc.) to call `resolveUnifiedPolicy` before side effects; refusal returns negative receipt
- **New** `scripts/architecture/checks/check-policy-resolver-coverage.ts` (CI Gate 30) — every R3+ entry in `frontend-action-api-map.ts` must have a call site to `resolveUnifiedPolicy` or `useUnifiedPolicy`

### 19.D — Canonical UI trust hook (Checklist 13 #7)
- **New** `src/hooks/use-policy-decision.ts` — single hook `usePolicyDecision({domain, riskClass, actor})` returning `{allowed, refusalReasons, requiredProofs, requiresStepUp}`
- Refactor `AdminCommandPalette` + `KillSwitchCenter` + `AIApprovalDesk` + 3 other high-risk surfaces to consume this hook

### 19.E — Real rollback dispatch (Checklist 13 #9)
- **New** `src/lib/orchestration/execution/compensation-handler-registry.ts` — registry mapping `effect.target → reverseHandler(effect)`
- **Update** `rollback-engine.ts` — invoke registered handler; only mark `reversed:true` on success; flag `unrollable` otherwise; emit `proof-record` of compensation
- **New** `src/lib/orchestration/execution/__tests__/rollback-engine.test.ts` — verifies dispatch + handler invocation

### 19.F — CI Gate 30 + Umbrella update
- Register `phase-19-auth-policy-trust-reality` in `ci-gate-registry.ts`
- Update `generated/ci-umbrella-manifest.json` → `gateCount: 30`
- New artifact `generated/auth-policy-reality-report.json`

### 19.G — Admin visibility
- **Update** `src/pages/admin/CAI05TrustActionsBoard.tsx` — surface MFA enrollment %, passkey enrollment %, policy resolver call-coverage %

---

### Files (≈14 new, ≈8 edited, ≈900 LOC)

| File | Change |
|---|---|
| `src/lib/services/identity-auth/mfa.service.ts` | New |
| `src/lib/services/identity-auth/webauthn.service.ts` | New |
| `src/pages/settings/MFAEnrollment.tsx` | New |
| `src/pages/settings/PasskeyManagement.tsx` | New |
| `src/components/auth/MFAChallenge.tsx` | New |
| `supabase/functions/webauthn-challenge/index.ts` | New |
| `supabase/functions/_shared/policy.ts` | New |
| `src/hooks/use-unified-policy.ts` | New |
| `src/hooks/use-policy-decision.ts` | New |
| `src/lib/orchestration/execution/compensation-handler-registry.ts` | New |
| `scripts/architecture/checks/check-policy-resolver-coverage.ts` | New (Gate 30) |
| `generated/auth-policy-reality-report.json` | New |
| DB migration | `user_passkeys` table + RLS |
| `AuthContext.tsx`, `AuthService`, `rollback-engine.ts`, 6 edge fns | Edited |
| `ci-gate-registry.ts`, `ci-umbrella-manifest.json` | Phase-19 added |
| `CAI05TrustActionsBoard.tsx` | New metrics tabs |
| `non-edge-table-io-sources.ts`, `edge-function-table-io-map.ts` | +entries |

### Acceptance

- MFA: real Supabase TOTP enroll/verify; admin sees enrollment % per user
- Passkey: real WebAuthn ceremony; passkeys persist in `user_passkeys`; manage page works
- `resolveUnifiedPolicy` is called by ≥6 R3+ edge functions and ≥6 R3+ UI surfaces; CI Gate 30 enforces coverage
- Rollback engine invokes registered compensation handlers; tests prove dispatch
- CI Umbrella **30/30 green**, `auth-policy-reality-report.json` `ok:true, errors:0`
- Checklist 12 truthful **11/11**; Checklist 13 truthful **11/11**
