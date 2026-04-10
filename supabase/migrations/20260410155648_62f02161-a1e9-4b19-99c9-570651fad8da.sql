-- Implementation Spec Registry
CREATE TABLE public.implementation_spec_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spec_id TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  owning_module TEXT NOT NULL DEFAULT 'unassigned',
  description TEXT,
  required_routes TEXT[] DEFAULT '{}',
  required_components TEXT[] DEFAULT '{}',
  required_services TEXT[] DEFAULT '{}',
  required_contracts TEXT[] DEFAULT '{}',
  required_events TEXT[] DEFAULT '{}',
  required_tests TEXT[] DEFAULT '{}',
  required_proofs TEXT[] DEFAULT '{}',
  implementation_status TEXT NOT NULL DEFAULT 'not_started',
  prompt_origin TEXT,
  acceptance_criteria TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  spec_score INT DEFAULT 0,
  ui_score INT DEFAULT 0,
  contract_score INT DEFAULT 0,
  wiring_score INT DEFAULT 0,
  runtime_score INT DEFAULT 0,
  overall_readiness INT DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, spec_id)
);

ALTER TABLE public.implementation_spec_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own specs" ON public.implementation_spec_registry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own specs" ON public.implementation_spec_registry FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own specs" ON public.implementation_spec_registry FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own specs" ON public.implementation_spec_registry FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_implementation_spec_registry_updated_at
  BEFORE UPDATE ON public.implementation_spec_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Implementation Wiring Edges
CREATE TABLE public.implementation_wiring_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spec_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_name TEXT NOT NULL,
  edge_status TEXT NOT NULL DEFAULT 'missing',
  evidence TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.implementation_wiring_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own edges" ON public.implementation_wiring_edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own edges" ON public.implementation_wiring_edges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own edges" ON public.implementation_wiring_edges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own edges" ON public.implementation_wiring_edges FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_implementation_wiring_edges_updated_at
  BEFORE UPDATE ON public.implementation_wiring_edges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wiring_edges_spec ON public.implementation_wiring_edges(spec_id);
CREATE INDEX idx_spec_registry_status ON public.implementation_spec_registry(implementation_status);