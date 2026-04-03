# SITA OS — Security Attestations

## Overview
This document records security attestations — formal declarations that specific security controls are in place and verified.

---

## Attestation Records

### ATT-001: Row-Level Security Coverage
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: All 40 database tables
- **Statement**: Every table in the SITA OS database has Row-Level Security (RLS) enabled with appropriate policies that restrict data access to the owning user via `auth.uid() = user_id`. Admin-only tables use `has_role()` checks.
- **Evidence**: Full RLS audit in `security/threat-models/data-access.md`
- **Status**: ✅ Verified

### ATT-002: No Raw SQL Execution
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: All edge functions and client code
- **Statement**: SITA OS does not execute raw SQL queries. All database operations use the typed Supabase client with parameterized queries. No `execute_sql` RPC or string interpolation in SQL.
- **Evidence**: Code review of all edge functions and client-side data access
- **Status**: ✅ Verified

### ATT-003: Secrets Management
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: API keys, service role keys, connector tokens
- **Statement**: All secrets are managed through Lovable Cloud's secret management. No secrets are stored in code, environment files, or client-accessible locations. The service role key is only accessible in edge function runtime.
- **Evidence**: Secrets audit; no hardcoded keys in codebase
- **Status**: ✅ Verified

### ATT-004: Authentication Flow Security
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: Login, signup, password reset, session management
- **Statement**: Authentication uses Lovable Cloud (Supabase Auth) with email verification required before account activation. Password reset requires explicit `/reset-password` page with token validation. Sessions use JWT with refresh rotation.
- **Evidence**: Auth flow code review; threat model in `security/threat-models/auth-identity.md`
- **Status**: ✅ Verified

### ATT-005: AI Safety Controls
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: Advisor pipeline, brain-core, AI model interactions
- **Statement**: All AI interactions pass through the no-hallucination framework (grounding, confidence scoring, contradiction detection, refusal protocol). High-risk AI actions require explicit owner approval via the approval queue. All AI interactions are logged with model, tokens, latency, and correlation_id.
- **Evidence**: No-hallucination module tests; AI threat model in `security/threat-models/advisor-ai.md`
- **Status**: ✅ Verified

### ATT-006: Input Validation
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: Edge functions, form inputs
- **Statement**: All edge functions validate request bodies using Zod schemas. Client-side forms use validation before submission. No unvalidated user input is passed to external APIs or database queries.
- **Evidence**: Edge function code review
- **Status**: ✅ Verified

### ATT-007: CORS Configuration
- **Date**: 2026-04-03
- **Attester**: Architecture Team
- **Scope**: All edge functions
- **Statement**: All edge functions include proper CORS headers in every response (including error responses) and handle OPTIONS preflight requests. CORS allows all origins (`*`) as the API is protected by JWT authentication.
- **Evidence**: Edge function code review
- **Status**: ✅ Verified

---

## Attestation Schedule
- **Quarterly**: Re-verify ATT-001 (RLS coverage) after any migration
- **Per-Release**: Re-verify ATT-002 (no raw SQL) and ATT-006 (input validation)
- **Annually**: Full re-attestation of all items
- **On-Demand**: After any security incident or significant architecture change
