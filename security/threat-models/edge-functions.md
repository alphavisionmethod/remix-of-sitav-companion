# Threat Model: Edge Functions

## System Description
Lovable Cloud edge functions handle AI advisor requests, brain-core orchestration, event processing, admin intelligence, and connector proxying.

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Unauthenticated function invocation | High | JWT validation in function code; correlation_id tracking | Mitigated |
| Forged authorization header | High | JWT signature verified against Supabase secret | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Request body manipulation | Medium | Input validation with Zod schemas; reject malformed requests | Mitigated |
| Response modification in transit | Low | TLS 1.3 end-to-end | Mitigated |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Error messages leak internals | Medium | Generic error responses; detailed errors only in server logs | Mitigated |
| Service role key in client | Critical | Service role key only available as edge function secret; never exposed | Mitigated |

### D — Denial of Service
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Function invocation flood | High | Lovable Cloud rate limiting; per-user request throttling | Mitigated |
| Long-running function timeout | Medium | Default timeout enforced; AbortSignal in external calls | Mitigated |

### E — Elevation of Privilege
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Edge function bypasses RLS | High | Functions use service role only for system operations; user-scoped queries use user JWT | Mitigated |
| Admin API accessible to non-admins | Critical | `admin-api` and `admin-intelligence` functions check `has_role()` server-side | Mitigated |

---

## Function Inventory

| Function | Purpose | Auth | CORS |
|----------|---------|------|------|
| `brain-core` | AI orchestration | JWT in code | ✅ |
| `connector-proxy` | External service relay | JWT in code | ✅ |
| `event-processor` | Event bus handler | JWT in code | ✅ |
| `admin-api` | Admin operations | JWT + admin role check | ✅ |
| `admin-intelligence` | System intelligence | JWT + admin role check | ✅ |
