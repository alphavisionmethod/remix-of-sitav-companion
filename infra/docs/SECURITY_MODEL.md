# SITA OS — End-to-End Security Model

_Generated 2026-04-24. Companion to `SECURITY_ARCHITECTURE.md` (kernel/userland)
and `security/threat-models/edge-functions.md` (per-function STRIDE)._

This document is the **canonical end-to-end security contract** for the
SITA OS web/cloud surface. It covers four layers — from the moment a user
presses _Sign in_ to the moment an AI agent reads a row from the DB:

1. **Auth flows** — how identities are minted, refreshed, and revoked.
2. **Authorization boundaries** — who is allowed to call what, where.
3. **RLS / tenant enforcement** — how Postgres guarantees row isolation.
4. **AI / tooling data access** — how agents and tools touch user data.

Each layer lists: the **invariant** it must uphold, **how it is enforced**,
and the **failure mode** that triggers the kill-switch.

---

## 0. Trust principles (non-negotiable)

| # | Principle | Why |
|---|-----------|-----|
| 1 | **Least privilege by default** | Every actor (user, function, agent) starts with zero scopes; capability is granted, never assumed. |
| 2 | **Defense in depth** | Auth + RLS + per-function `has_role()` + admin-action audit — any one layer alone is insufficient. |
| 3 | **Server-side authority** | No security-relevant decision is made on the client. `localStorage` flags, role chips, and feature toggles are UX hints only. |
| 4 | **Receipts for every privileged action** | Admin, AI, and connector actions emit a tamper-evident receipt to `receipts` / `ai_receipt_records` / `admin_action_audit`. |
| 5 | **Refusal beats silence** | If policy can't decide, the system refuses (HTTP 403 + receipt) instead of degrading open. |
| 6 | **No provider SDKs in app code** | All AI provider calls go through the canonical `ai-gateway` edge function — single chokepoint for budget, redaction, and audit. |
| 7 | **Two-person + CODEOWNERS for any patch** | Self-healing automation can never apply a patch without 2 distinct CODEOWNERS-matched approvers (see `config/self-healing-policy.json` § patchApplicationGate). |

---

## 1. Auth flows

### 1.1 Methods supported
| Method | Provider | Status |
|--------|----------|--------|
| Email + password | Lovable Cloud / Supabase Auth | ✅ Default |
| Google OAuth | Lovable Cloud / Supabase Auth | ✅ Default |
| Apple OAuth | Lovable Cloud / Supabase Auth | Optional |
| SAML SSO | Lovable Cloud / Supabase Auth | Enterprise tier |
| Phone (SMS) | Lovable Cloud / Supabase Auth | Optional |
| Anonymous sign-in | — | ❌ **Disabled** |

### 1.2 Token lifecycle
- **Access token**: JWT, RS256, ≤ 60 min lifetime, signed by Supabase Auth.
- **Refresh token**: rotated on every use; old token immediately revoked.
- **Storage**: `localStorage` under `sb-<ref>-auth-token`. Cleared on
  sign-out and on detected tampering (corrupted access_token → forced
  redirect to `/login`, see `tests/e2e/auth-full-journey.spec.ts`).
- **Session resumption**: handled by Supabase JS client `autoRefreshToken: true`.
- **Forced expiry**: admin-side session revocation flips
  `admin_sessions.status = 'revoked'`; next request rejected by
  `admin-bff-gateway` with HTTP 401.

### 1.3 Account lifecycle
| Phase | Surface | DB effects |
|-------|---------|------------|
| Signup | `/signup` → `auth.users` insert + `profiles` row via trigger | profile + default workspace seeded |
| Email verify | Lovable Cloud default | `auth.users.email_confirmed_at` |
| Forgot password | `/forgot-password` → magic-link email | `auth.users.recovery_sent_at` |
| Reset password | `/reset-password` (token-gated) | `auth.users.encrypted_password` |
| Account deletion | `/settings/privacy` → `account-delete` edge function | `account_deletion_requests` row, scheduled purge after 30-day cooling-off |

### 1.4 Invariants
- **I-A1**: A non-`OPTIONS`, non-public route MUST present a verifiable JWT.
- **I-A2**: Sign-out MUST clear `sb-*` keys and bounce all guarded routes.
- **I-A3**: Refresh failure MUST surface as a redirect to `/login`, never a stale UI.
- **I-A4**: No client-side "isAdmin" boolean is ever trusted on the server.

---

## 2. Authorization boundaries

### 2.1 Three concentric rings

```
 ┌─────────────────────────────────────────────────────────┐
 │ Ring 3 — Public (anonymous): /, /login, /signup, /reset │
 ├─────────────────────────────────────────────────────────┤
 │ Ring 2 — Authenticated user: /personal-brain, /owner,   │
 │   /files, /workflows — gated by <ProtectedRoute>        │
 ├─────────────────────────────────────────────────────────┤
 │ Ring 1 — Admin: /admin/*, /security/* — gated by        │
 │   <PermissionGuard> + has_role(uid, 'admin')            │
 └─────────────────────────────────────────────────────────┘
 Ring 0 — Service role: NEVER reachable from the browser;
   only from edge functions with `SUPABASE_SERVICE_ROLE_KEY`.
```

### 2.2 Roles
Defined as a Postgres `app_role` enum and stored in `user_roles` (NEVER on
`profiles` — see `mem://constraints/multi-tenancy-and-admin-gate`):

- `user` — default; full access to own rows only.
- `moderator` — read access to flagged content + moderation queues.
- `admin` — full read/write within the platform plane; gated by
  `requireAdmin()` in every admin edge function.
- `super_admin` — billing, kill-switches, role grants. Requires step-up MFA
  (`admin_sessions.mfa_verified = true`).

Server-side check is **always**:
```sql
select public.has_role(auth.uid(), 'admin')
```
(SECURITY DEFINER function; never inlined into RLS predicates to avoid
recursion — see `mem://constraints/multi-tenancy-and-admin-gate`.)

### 2.3 Edge-function authorization layers
| Layer | Enforced by | Failure mode |
|-------|-------------|--------------|
| JWT signature | `_shared/auth.ts` `verifyJwt()` | 401 |
| Role check | `requireAdmin()` / `requirePermission()` | 403 + audit row |
| Action policy | `admin_safety_actions` table → confirmation + cooldown | 403 + receipt |
| Rate limit | `_shared/rate-limit.ts` (per-user, per-action) | 429 |
| Output redaction | `_shared/dlp-guard.ts` | 200 with `[REDACTED]` |

### 2.4 Invariants
- **I-Z1**: Every admin edge function calls `requireAdmin()` BEFORE any
  DB read or external call.
- **I-Z2**: Roles are read only from `user_roles`, never from JWT claims
  or profile rows.
- **I-Z3**: A successful 200 response MUST be paired with an
  `admin_action_audit` row (for admin actions) within the same request.
- **I-Z4**: Failed authorization attempts emit `{action, actor_user_id,
  result: 'failure'}` to `admin_action_audit` for incident review.

---

## 3. RLS / tenant enforcement

### 3.1 Coverage
- 420 tables, **100% RLS coverage** (934 policies — see
  `mem://architecture/database-truth-layer`).
- 0 tables with `ROW LEVEL SECURITY DISABLED` on `public.*`.
- Single-tenant rows: scoped by `auth.uid() = user_id`.
- Multi-tenant rows: scoped by `org_id IN (select org_id from
  user_organizations where user_id = auth.uid())`.

### 3.2 Policy patterns
| Pattern | When to use | Example |
|---------|-------------|---------|
| **Owner-only** | Personal data (`pb_profile`, `pb_goals`) | `auth.uid() = user_id` |
| **Org-scoped** | Shared workspace data (`accounts`, `workflows`) | `org_id IN (select ...)` |
| **Role-gated** | Admin-only tables (`admin_action_audit`, `admin_sessions`) | `public.has_role(auth.uid(), 'admin')` |
| **Public read** | Catalog / metadata (`ai_model_registry`, `app_lifecycle_states`) | `true` for SELECT only |
| **Function-only** | Receipts, ledger | RLS denies all; only SECURITY DEFINER functions write |

### 3.3 Anti-patterns (build-time blocked)
- ❌ `(select role from profiles where id = auth.uid()) = 'admin'` — causes
  infinite recursion. Always use `has_role()` SECURITY DEFINER function.
- ❌ `user_id` columns marked nullable on RLS-protected tables.
- ❌ Storing role on `profiles` or in JWT user_metadata.

### 3.4 Service-role usage rules
- Edge functions MAY use `SUPABASE_SERVICE_ROLE_KEY` only for:
  - System operations not tied to a single user (cron, backfills, receipts).
  - Reading from tables the user already proved access to via JWT.
- Edge functions MUST use the **user's JWT** for any user-scoped query.
- Bypass detection: `scripts/governance/scan-service-role-misuse.mjs`
  flags any function that uses service role for a user-scoped read.

### 3.5 Invariants
- **I-R1**: Every public table has RLS enabled.
- **I-R2**: No RLS policy references the table it protects (recursion).
- **I-R3**: Service-role usage in user-scoped paths emits a CI warning.
- **I-R4**: `org_id` columns are NOT NULL and indexed.

---

## 4. AI / tooling data access

### 4.1 Single AI chokepoint
All AI traffic flows through `supabase/functions/ai-gateway/index.ts`:

```
 user/agent → ai-gateway → [budget check] → [DLP redact in] →
   provider (LLM) → [DLP redact out] → [receipt] → caller
```

Direct provider SDK use is **forbidden** in app code (see
`mem://constraints/sovereign-ai-gateway`). Build-time check:
`scripts/governance/check-no-direct-provider-sdks.mjs`.

### 4.2 Budget enforcement
- Pre-flight: `check_ai_budget_policies()` RPC — daily/monthly caps per
  user, per capability, per provider.
- Decision logged to `ai_budget_decision_receipts` with `pre_check_state`
  snapshot for replay.
- Over-budget → fallback chain (see `ai_capability_routing.fallback_chain`)
  → if exhausted, refuse with HTTP 429 + receipt.

### 4.3 Data access by AI agents
| Agent class | Allowed reads | Allowed writes | Mechanism |
|-------------|---------------|----------------|-----------|
| **Advisor (L0–L2)** | User's own rows only | None | User JWT passed through |
| **Advisor (L3+)** | User's own rows only | Approved actions only | User JWT + `advisor_action_queue` approval gate |
| **Internal agents** | Aggregated + anonymized | Receipts + advisory rows | Service role, scoped to non-PII tables |
| **Boardroom council** | User's own rows | None directly; emits recommendations to `advisor_board_recommendations` | User JWT |
| **External tools** (connectors) | Connector-scoped rows | Connector-scoped writes | Per-connector OAuth token; receipts in `connector_receipts` |

### 4.4 Tool-call authorization
Every tool call (`advisor_board_tool_executions`) carries:
- `approval_state` ∈ {`auto`, `pending`, `approved`, `rejected`}.
- `tool_category` ∈ {`read`, `notify`, `mutate`, `external`} — `mutate`
  + `external` always require approval.
- `rollback_capable` + `rollback_data` for reversible ops.
- `proof_receipt` written to `advisor_action_proof_packs` on execute.

### 4.5 Output safety
- **DLP guard**: `_shared/dlp-guard.ts` redacts emails, phone numbers,
  SSNs, API keys, and JWTs before returning to caller.
- **AI Output Firewall**: rejects responses containing prompt-injection
  payloads, refusal bypasses, or instruction leakage.
- **Refusal log**: every refusal writes a row to `ai_runtime_failure_alerts`
  with `failure_class = 'refusal'` for trend monitoring.

### 4.6 Invariants
- **I-AI1**: No app code calls a provider SDK directly.
- **I-AI2**: Every AI invocation has a paired `ai_invocations` + `ai_receipt_records` row.
- **I-AI3**: Mutate / external tool calls require explicit approval row.
- **I-AI4**: Receipt coverage ≥ 95% per nightly verification.

---

## 5. Failure modes & kill-switches

| Trigger | Effect | Recovery |
|---------|--------|----------|
| RLS coverage < 100% | CI blocks merge | Add policy or table-level DENY |
| Service-role misuse | CI warning + dashboard alert | Refactor to user JWT |
| Auth signature failure | 401 + audit | Refresh or re-login |
| Admin role check failure | 403 + audit | Request elevation |
| AI budget exceeded | 429 + fallback chain | Wait for reset or request increase |
| Tool refusal | Receipt + dashboard alert | Human review of the refusal |
| Self-heal patch gate failure | DOWNGRADE-TO-GATED (PR opened, never merged) | 2-person CODEOWNERS attestation |

---

## 6. Verification ledger

- **CI gates**: `scripts/check-rls-coverage.mjs`,
  `scripts/check-edge-function-ownership-completeness.mjs`,
  `scripts/governance/build-edge-functions-index.mjs` (this run),
  `scripts/test-self-heal.mjs` (T0 classifier tests).
- **Nightly**: `ai-runtime-nightly-verify` — provider calls, receipts,
  ledger consistency, fallback chain.
- **On-demand**: `security--run_security_scan` (Lovable security scanner).
- **E2E proofs**: `tests/e2e/auth-full-journey.spec.ts`,
  `tests/e2e/personal-brain-calibration.spec.ts`,
  `tests/e2e/kill-switch-drill.spec.ts`.

---

_End. For per-function threat models see
`security/threat-models/edge-functions.md`. For OS-level / kernel security
see `infra/docs/SECURITY_ARCHITECTURE.md`._