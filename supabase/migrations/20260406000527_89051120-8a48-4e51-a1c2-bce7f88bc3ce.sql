
-- Surface Types
CREATE TABLE IF NOT EXISTS public.surface_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surface_key text NOT NULL,
  display_name text NOT NULL,
  surface_class text NOT NULL DEFAULT 'planned' CHECK (surface_class IN ('active','planned','experimental','deprecated')),
  interaction_model text DEFAULT 'touch_and_click',
  notification_model text DEFAULT 'push',
  input_modes text[] DEFAULT '{"keyboard","mouse"}',
  output_modes text[] DEFAULT '{"screen"}',
  offline_support boolean NOT NULL DEFAULT false,
  readiness_stage text NOT NULL DEFAULT 'planned' CHECK (readiness_stage IN ('planned','prototyping','alpha','beta','production','deprecated')),
  constraints jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(surface_key, user_id)
);
ALTER TABLE public.surface_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface_types" ON public.surface_types FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Surface Adapters
CREATE TABLE IF NOT EXISTS public.surface_adapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  adapter_name text NOT NULL,
  shell_type text NOT NULL DEFAULT 'WebShell' CHECK (shell_type IN ('WebShell','MobileShell','DesktopShell','SpatialShell','VoiceShell','AmbientShell')),
  navigation_grammar jsonb DEFAULT '{}',
  interaction_grammar jsonb DEFAULT '{}',
  notification_grammar jsonb DEFAULT '{}',
  trust_presentation jsonb DEFAULT '{}',
  receipt_presentation jsonb DEFAULT '{}',
  performance_profile jsonb DEFAULT '{}',
  constraints jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_development','active','deprecated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surface_adapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface_adapters" ON public.surface_adapters FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Capability Definitions
CREATE TABLE IF NOT EXISTS public.capability_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  display_name text NOT NULL,
  domain text NOT NULL DEFAULT 'general',
  description text,
  action_type text NOT NULL DEFAULT 'query' CHECK (action_type IN ('query','command','workflow','event','subscription')),
  risk_tier text NOT NULL DEFAULT 'low' CHECK (risk_tier IN ('low','medium','high','critical')),
  portability_class text NOT NULL DEFAULT 'portable' CHECK (portability_class IN ('portable','web_preferred','surface_specific','not_portable')),
  requires_auth boolean NOT NULL DEFAULT true,
  requires_approval boolean NOT NULL DEFAULT false,
  ai_eligible boolean NOT NULL DEFAULT false,
  contract_schema jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(capability_key, user_id)
);
ALTER TABLE public.capability_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capability_definitions" ON public.capability_definitions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_capability_definitions_domain ON public.capability_definitions(domain);

-- Capability Surface Bindings
CREATE TABLE IF NOT EXISTS public.capability_surface_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_id uuid REFERENCES public.capability_definitions(id) ON DELETE CASCADE NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  binding_status text NOT NULL DEFAULT 'planned' CHECK (binding_status IN ('planned','implemented','tested','production','deprecated')),
  adaptation_notes text,
  interaction_pattern text,
  priority integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(capability_id, surface_id)
);
ALTER TABLE public.capability_surface_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capability_surface_bindings" ON public.capability_surface_bindings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Shell Implementations
CREATE TABLE IF NOT EXISTS public.shell_implementations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shell_type text NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  version text DEFAULT '0.1.0',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','prototyping','alpha','beta','production','deprecated')),
  technology_stack text[] DEFAULT '{}',
  capability_coverage_pct numeric DEFAULT 0,
  route_count integer DEFAULT 0,
  component_count integer DEFAULT 0,
  boundary_violations integer DEFAULT 0,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shell_implementations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shell_implementations" ON public.shell_implementations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Surface Readiness Records
CREATE TABLE IF NOT EXISTS public.surface_readiness_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  portability_score numeric DEFAULT 0,
  contract_coverage_pct numeric DEFAULT 0,
  capability_coverage_pct numeric DEFAULT 0,
  trust_portability boolean NOT NULL DEFAULT false,
  workflow_portability boolean NOT NULL DEFAULT false,
  receipt_portability boolean NOT NULL DEFAULT false,
  blockers text[] DEFAULT '{}',
  evidence jsonb DEFAULT '{}',
  last_audited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surface_readiness_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface_readiness_records" ON public.surface_readiness_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Architecture Boundary Records
CREATE TABLE IF NOT EXISTS public.architecture_boundary_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  component_path text NOT NULL,
  component_type text NOT NULL DEFAULT 'page' CHECK (component_type IN ('page','hook','component','service','capability','workflow','adapter','contract','unknown')),
  layer text NOT NULL DEFAULT 'surface' CHECK (layer IN ('core_runtime','contract','capability','adapter','surface','unknown')),
  owns_business_logic boolean NOT NULL DEFAULT false,
  is_boundary_violation boolean NOT NULL DEFAULT false,
  violation_type text,
  migration_priority text DEFAULT 'low' CHECK (migration_priority IN ('critical','high','medium','low','none')),
  migration_target text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.architecture_boundary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own architecture_boundary_records" ON public.architecture_boundary_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cross-Surface Consistency Records
CREATE TABLE IF NOT EXISTS public.cross_surface_consistency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('contract','truth','workflow','receipt','capability','notification','trust_presentation')),
  scope text NOT NULL,
  surfaces_checked text[] DEFAULT '{}',
  consistent boolean NOT NULL DEFAULT true,
  drift_description text,
  severity text DEFAULT 'low' CHECK (severity IN ('critical','high','medium','low')),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_surface_consistency_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cross_surface_consistency_records" ON public.cross_surface_consistency_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_surface_types_updated_at BEFORE UPDATE ON public.surface_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surface_adapters_updated_at BEFORE UPDATE ON public.surface_adapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capability_definitions_updated_at BEFORE UPDATE ON public.capability_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capability_surface_bindings_updated_at BEFORE UPDATE ON public.capability_surface_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shell_implementations_updated_at BEFORE UPDATE ON public.shell_implementations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surface_readiness_records_updated_at BEFORE UPDATE ON public.surface_readiness_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_architecture_boundary_records_updated_at BEFORE UPDATE ON public.architecture_boundary_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cross_surface_consistency_records_updated_at BEFORE UPDATE ON public.cross_surface_consistency_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
