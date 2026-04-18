CREATE OR REPLACE FUNCTION public.get_compliance_rls_summary()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
  WITH t AS (
    SELECT c.relname,
           c.relrowsecurity AS rls_enabled,
           (SELECT COUNT(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policy_count
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname NOT LIKE 'pg\_%'
  )
  SELECT jsonb_build_object(
    'totalTables', (SELECT COUNT(*) FROM t),
    'tablesWithRls', (SELECT COUNT(*) FROM t WHERE rls_enabled),
    'tablesWithPolicies', (SELECT COUNT(*) FROM t WHERE policy_count > 0),
    'totalPolicies', (SELECT COALESCE(SUM(policy_count), 0) FROM t)
  );
$$;

REVOKE ALL ON FUNCTION public.get_compliance_rls_summary() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_compliance_rls_summary() TO service_role, authenticated;

COMMENT ON FUNCTION public.get_compliance_rls_summary() IS
  'Phase 9: Service-role-callable RLS coverage summary for the compliance evidence collector. Returns aggregate counts only (no row data).';