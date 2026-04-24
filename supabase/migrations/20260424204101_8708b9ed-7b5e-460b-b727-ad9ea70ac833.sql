-- Phase 7C — Final RLS hardening pass

-- ai_prompt_versions: lock proprietary system prompts to admin-only reads
DROP POLICY IF EXISTS "ai_prompt_versions_select_authenticated" ON public.ai_prompt_versions;
CREATE POLICY "ai_prompt_versions_admin_select"
  ON public.ai_prompt_versions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- environment_configs: lock internal topology
DROP POLICY IF EXISTS "Authenticated can view envs" ON public.environment_configs;
CREATE POLICY "environment_configs_admin_select"
  ON public.environment_configs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- cloud_storage_providers: lock provider config
DROP POLICY IF EXISTS "Auth users can view providers" ON public.cloud_storage_providers;
CREATE POLICY "cloud_storage_providers_admin_select"
  ON public.cloud_storage_providers
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));