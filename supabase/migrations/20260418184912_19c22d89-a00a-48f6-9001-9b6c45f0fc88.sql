
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Connector Effective State View (Phase 4)
-- Read-only canonical truth: worst-of-3 across
-- connector_accounts.status, oauth-token expiry/reauth, provider health.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.connector_effective_state
WITH (security_invoker = true)
AS
SELECT
  a.id                              AS account_id,
  a.user_id                         AS user_id,
  a.connector_type                  AS connector_type,
  a.display_name                    AS display_name,
  a.account_email                   AS account_email,
  a.status                          AS account_status,
  a.demo_mode                       AS demo_mode,
  a.last_health_at                  AS last_health_at,
  t.id                              AS token_id,
  t.expires_at                      AS token_expires_at,
  t.last_refreshed_at               AS token_last_refreshed_at,
  t.rotation_count                  AS token_rotation_count,
  t.reauth_required                 AS token_reauth_required,
  ph.status                         AS provider_health_status,
  ph.last_probed_at                 AS provider_last_probed_at,
  -- ── worst-of-3 effective state ─────────────────────────────
  CASE
    WHEN a.demo_mode = true                                                    THEN 'demo_simulated'
    WHEN a.status IN ('disconnected', 'revoked')                                THEN 'manual'
    WHEN COALESCE(t.reauth_required, false) = true                              THEN 'reauth_required'
    WHEN a.status = 'failing'                                                   THEN 'failing'
    WHEN ph.status = 'failing'                                                  THEN 'failing'
    WHEN t.expires_at IS NOT NULL AND t.expires_at < now()                      THEN 'reauth_required'
    WHEN a.status = 'degraded'                                                  THEN 'degraded'
    WHEN ph.status = 'degraded'                                                 THEN 'degraded'
    WHEN a.last_health_status = 'degraded'                                      THEN 'degraded'
    WHEN a.status = 'connected'                                                 THEN 'connected'
    ELSE 'manual'
  END                                AS effective_state
FROM public.connector_accounts a
LEFT JOIN public.connector_oauth_tokens t ON t.account_id = a.id
LEFT JOIN public.ai_provider_health   ph ON ph.provider_key = a.connector_type;

COMMENT ON VIEW public.connector_effective_state IS
  'Canonical worst-of-3 connector state used by admin Integrations and Communications surfaces. Read-only; security_invoker honors connector_accounts RLS.';

GRANT SELECT ON public.connector_effective_state TO authenticated;
