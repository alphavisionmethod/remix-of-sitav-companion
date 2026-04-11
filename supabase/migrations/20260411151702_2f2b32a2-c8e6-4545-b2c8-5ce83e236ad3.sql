-- app_default_associations: 4 policies
ALTER POLICY "Users manage own app associations (select)" ON public.app_default_associations TO authenticated;
ALTER POLICY "Users manage own app associations (insert)" ON public.app_default_associations TO authenticated;
ALTER POLICY "Users manage own app associations (update)" ON public.app_default_associations TO authenticated;
ALTER POLICY "Users manage own app associations (delete)" ON public.app_default_associations TO authenticated;

-- calibration_checkpoints: 3 policies
ALTER POLICY "Users can view own checkpoints" ON public.calibration_checkpoints TO authenticated;
ALTER POLICY "Users can create own checkpoints" ON public.calibration_checkpoints TO authenticated;
ALTER POLICY "Users can update own checkpoints" ON public.calibration_checkpoints TO authenticated;

-- installed_apps: 4 policies
ALTER POLICY "Users manage own installed apps (select)" ON public.installed_apps TO authenticated;
ALTER POLICY "Users manage own installed apps (insert)" ON public.installed_apps TO authenticated;
ALTER POLICY "Users manage own installed apps (update)" ON public.installed_apps TO authenticated;
ALTER POLICY "Users manage own installed apps (delete)" ON public.installed_apps TO authenticated;