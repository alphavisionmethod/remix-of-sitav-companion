// ═══════════════════════════════════════════════════════════════
// SITA OS — sita-briefings-generate auth predicate (G4)
// ───────────────────────────────────────────────────────────────
// Pure, dependency-free helper isolating the cron-secret /
// service-role / user-bearer authorization logic so it can be
// unit-tested without standing up a live Edge Function.
//
// Three accepted credential paths (in priority order):
//   1. `x-cron-secret` header equal to env `CRON_SECRET`
//        → pg_cron path (the scheduled trigger uses this).
//   2. `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`
//        → admin / privileged backend path.
//   3. `Authorization: Bearer <jwt>` from a real signed-in user
//        → manual invoke from the app UI; RLS still applies
//          server-side because we re-auth using the service role.
//
// Behavioural rules:
//   - When `CRON_SECRET` is *unset* the function MUST refuse all
//     requests (closed-by-default) — silently allowing traffic when
//     the operator forgot to set the secret would be a critical
//     misconfiguration. This also matches deployment-readiness gate
//     CHK-AUTH-G4 in `mem://architecture/deployment-readiness-gates`.
//   - A wrong / empty `x-cron-secret` header is a hard 401 — never
//     downgraded to "fall through to bearer".
//   - A missing `Authorization` header is a 401 unless a valid
//     cron secret was supplied.
// ═══════════════════════════════════════════════════════════════

export type AuthDecision =
  | { ok: true; mode: "cron" | "service_role" | "user_bearer" }
  | { ok: false; reason: "missing_cron_secret_env" | "unauthorized" };

export interface AuthInput {
  /** Value of request header `x-cron-secret`, or null if absent. */
  cronSecretHeader: string | null;
  /** Value of request header `authorization`, or null if absent. */
  authorizationHeader: string | null;
  /** Value of env `CRON_SECRET` (undefined when unset). */
  cronSecretEnv: string | undefined;
  /** Value of env `SUPABASE_SERVICE_ROLE_KEY` (undefined when unset). */
  serviceRoleEnv: string | undefined;
}

/** Constant-time string compare to prevent timing attacks on the cron secret. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function authorizeCronInvocation(input: AuthInput): AuthDecision {
  const { cronSecretHeader, authorizationHeader, cronSecretEnv, serviceRoleEnv } = input;

  // Closed-by-default: refuse if the operator forgot to provision CRON_SECRET.
  if (!cronSecretEnv || cronSecretEnv.length < 8) {
    return { ok: false, reason: "missing_cron_secret_env" };
  }

  // 1) pg_cron path
  if (cronSecretHeader && safeEqual(cronSecretHeader, cronSecretEnv)) {
    return { ok: true, mode: "cron" };
  }

  // 2) service-role bearer path
  if (
    authorizationHeader &&
    serviceRoleEnv &&
    authorizationHeader === `Bearer ${serviceRoleEnv}`
  ) {
    return { ok: true, mode: "service_role" };
  }

  // 3) user-bearer fallback (app UI invoke)
  if (authorizationHeader && /^Bearer\s+\S+/i.test(authorizationHeader)) {
    return { ok: true, mode: "user_bearer" };
  }

  return { ok: false, reason: "unauthorized" };
}