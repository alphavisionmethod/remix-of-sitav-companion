
-- Fix system_config RLS: restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read system_config" ON public.system_config;
DROP POLICY IF EXISTS "System config is readable by authenticated users" ON public.system_config;
DROP POLICY IF EXISTS "system_config_select" ON public.system_config;

-- Only admins can read system_config
CREATE POLICY "Admins can read system_config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can modify system_config
DROP POLICY IF EXISTS "system_config_insert" ON public.system_config;
DROP POLICY IF EXISTS "system_config_update" ON public.system_config;
DROP POLICY IF EXISTS "system_config_delete" ON public.system_config;

CREATE POLICY "Admins can insert system_config"
  ON public.system_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update system_config"
  ON public.system_config
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete system_config"
  ON public.system_config
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
