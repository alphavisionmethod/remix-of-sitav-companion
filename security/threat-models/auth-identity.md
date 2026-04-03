# Threat Model: Authentication & Identity

## System Description
SITA OS uses Lovable Cloud (Supabase Auth) for user authentication with email/password flows, session management, and device trust scoring.

## Assets
- User credentials (email, hashed password)
- JWT session tokens (access + refresh)
- Device trust records
- Profile data (display name, avatar, role)
- User memory and preferences

## Trust Boundaries
1. **Browser ↔ Lovable Cloud API** — TLS 1.3, JWT bearer tokens
2. **Edge Functions ↔ Database** — Service role key, server-side only
3. **Client ↔ Edge Functions** — Anon key + JWT validation in code

---

## STRIDE Analysis

### S — Spoofing
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Credential stuffing via login endpoint | High | Rate limiting on auth endpoints; HIBP password check available | Mitigated |
| Session hijacking via stolen JWT | High | Short-lived access tokens (1h); refresh rotation; `httpOnly` where possible | Mitigated |
| Forged device trust records | Medium | Device trust is server-validated; client cannot set `trusted=true` directly | Mitigated |

### T — Tampering
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| JWT modification | Critical | JWTs signed with HS256 server secret; `verify_jwt` in edge functions | Mitigated |
| Profile role escalation | High | `role` field on profiles is display-only; actual roles in `user_roles` with admin-only RLS | Mitigated |
| Client-side auth state manipulation | Medium | All data access gated by RLS using `auth.uid()`; no client-side role checks for data | Mitigated |

### R — Repudiation
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Denial of login activity | Medium | `audit_logs` table records all auth events with timestamp, IP, user agent | Mitigated |
| Unsigned proof of identity changes | Low | Profile updates trigger `updated_at` timestamp | Monitored |

### I — Information Disclosure
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| User enumeration via signup/login error messages | Medium | Generic error messages for auth failures | Mitigated |
| JWT payload exposure in browser DevTools | Low | JWT contains only `user_id`, `role`, `exp` — no PII in claims | Accepted |
| Profile data visible to other users | Medium | RLS: users can only SELECT their own profile | Mitigated |

### D — Denial of Service
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Brute-force login attempts | High | Lovable Cloud rate limiting; account lockout after N failures | Mitigated |
| Excessive signup registrations | Medium | Email verification required before account activation | Mitigated |

### E — Elevation of Privilege
| Threat | Severity | Mitigation | Status |
|--------|----------|------------|--------|
| Self-assign admin role | Critical | `user_roles` table has admin-only RLS; `has_role()` is `SECURITY DEFINER` | Mitigated |
| Bypass RLS via direct SQL | Critical | No raw SQL execution allowed; all queries via typed Supabase client | Mitigated |
| Access other user's data via modified `user_id` | High | All tables use `auth.uid() = user_id` in RLS policies | Mitigated |

---

## Residual Risks
1. **Refresh token theft** — If device is compromised, refresh token grants re-authentication. Mitigation: device trust scoring + anomaly detection.
2. **Email account compromise** — Password reset via email link. Mitigation: MFA can be enabled; sensitive actions require re-auth.

## Review Schedule
- Quarterly review by security lead
- Re-assess after any auth flow changes
- Annual penetration test scope includes auth surface
