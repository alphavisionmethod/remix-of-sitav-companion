ALTER POLICY "Users can view their own specs" ON public.implementation_spec_registry TO authenticated;
ALTER POLICY "Users can create their own specs" ON public.implementation_spec_registry TO authenticated;
ALTER POLICY "Users can update their own specs" ON public.implementation_spec_registry TO authenticated;
ALTER POLICY "Users can delete their own specs" ON public.implementation_spec_registry TO authenticated;

ALTER POLICY "Users can view their own edges" ON public.implementation_wiring_edges TO authenticated;
ALTER POLICY "Users can create their own edges" ON public.implementation_wiring_edges TO authenticated;
ALTER POLICY "Users can update their own edges" ON public.implementation_wiring_edges TO authenticated;
ALTER POLICY "Users can delete their own edges" ON public.implementation_wiring_edges TO authenticated;

ALTER POLICY "Users manage own oauth state sessions" ON public.oauth_state_sessions TO authenticated;