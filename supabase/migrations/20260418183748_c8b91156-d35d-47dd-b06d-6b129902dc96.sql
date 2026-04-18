CREATE OR REPLACE FUNCTION public.seed_internal_agents_from_json(_agents jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inserted int := 0;
  v_updated  int := 0;
  v_state_created int := 0;
  v_agent jsonb;
  v_existing record;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    -- allow service role bypass (auth.uid() is null in service role context)
    IF auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
    END IF;
  END IF;

  IF jsonb_typeof(_agents) <> 'array' THEN
    RAISE EXCEPTION 'expected jsonb array';
  END IF;

  FOR v_agent IN SELECT * FROM jsonb_array_elements(_agents)
  LOOP
    SELECT id INTO v_existing FROM public.internal_agent_definitions
    WHERE agent_id = v_agent->>'agent_id';

    INSERT INTO public.internal_agent_definitions (
      agent_id, name, council, mission, special_ability,
      max_autonomy_level, current_autonomy_level,
      schedule_type, schedule_cron,
      scope, out_of_scope, tools_allowed, tools_forbidden,
      memory_scope, trigger_conditions, trigger_events,
      escalation_targets, receives_escalations_from, primary_escalation_target,
      confidence_threshold_act, confidence_threshold_recommend,
      simulation_requirements, human_approval_requirements,
      rollback_authority, reporting_outputs, measurable_kpis,
      cost_budget_guidance, cost_budget_daily_cents, max_invocations_per_day,
      failure_handling_rules, related_services, related_docs, tags,
      maturity, is_active, spec_hash
    ) VALUES (
      v_agent->>'agent_id',
      v_agent->>'name',
      v_agent->>'council',
      v_agent->>'mission',
      v_agent->>'special_ability',
      v_agent->>'max_autonomy_level',
      v_agent->>'current_autonomy_level',
      v_agent->>'schedule_type',
      v_agent->>'schedule_cron',
      COALESCE(v_agent->'scope', '[]'::jsonb),
      COALESCE(v_agent->'out_of_scope', '[]'::jsonb),
      COALESCE(v_agent->'tools_allowed', '[]'::jsonb),
      COALESCE(v_agent->'tools_forbidden', '[]'::jsonb),
      v_agent->>'memory_scope',
      COALESCE(v_agent->'trigger_conditions', '[]'::jsonb),
      COALESCE(v_agent->'trigger_events', '[]'::jsonb),
      COALESCE(v_agent->'escalation_targets', '[]'::jsonb),
      COALESCE(v_agent->'receives_escalations_from', '[]'::jsonb),
      v_agent->>'primary_escalation_target',
      (v_agent->>'confidence_threshold_act')::numeric,
      (v_agent->>'confidence_threshold_recommend')::numeric,
      COALESCE(v_agent->'simulation_requirements', '[]'::jsonb),
      COALESCE(v_agent->'human_approval_requirements', '[]'::jsonb),
      v_agent->>'rollback_authority',
      COALESCE(v_agent->'reporting_outputs', '[]'::jsonb),
      COALESCE(v_agent->'measurable_kpis', '[]'::jsonb),
      v_agent->>'cost_budget_guidance',
      (v_agent->>'cost_budget_daily_cents')::int,
      (v_agent->>'max_invocations_per_day')::int,
      COALESCE(v_agent->'failure_handling_rules', '[]'::jsonb),
      COALESCE(v_agent->'related_services', '[]'::jsonb),
      COALESCE(v_agent->'related_docs', '[]'::jsonb),
      COALESCE(v_agent->'tags', '[]'::jsonb),
      v_agent->>'maturity',
      COALESCE((v_agent->>'is_active')::boolean, true),
      v_agent->>'spec_hash'
    )
    ON CONFLICT (agent_id) DO UPDATE SET
      name = EXCLUDED.name,
      council = EXCLUDED.council,
      mission = EXCLUDED.mission,
      special_ability = EXCLUDED.special_ability,
      max_autonomy_level = EXCLUDED.max_autonomy_level,
      schedule_type = EXCLUDED.schedule_type,
      schedule_cron = EXCLUDED.schedule_cron,
      scope = EXCLUDED.scope,
      out_of_scope = EXCLUDED.out_of_scope,
      tools_allowed = EXCLUDED.tools_allowed,
      tools_forbidden = EXCLUDED.tools_forbidden,
      memory_scope = EXCLUDED.memory_scope,
      trigger_conditions = EXCLUDED.trigger_conditions,
      trigger_events = EXCLUDED.trigger_events,
      escalation_targets = EXCLUDED.escalation_targets,
      receives_escalations_from = EXCLUDED.receives_escalations_from,
      primary_escalation_target = EXCLUDED.primary_escalation_target,
      confidence_threshold_act = EXCLUDED.confidence_threshold_act,
      confidence_threshold_recommend = EXCLUDED.confidence_threshold_recommend,
      simulation_requirements = EXCLUDED.simulation_requirements,
      human_approval_requirements = EXCLUDED.human_approval_requirements,
      rollback_authority = EXCLUDED.rollback_authority,
      reporting_outputs = EXCLUDED.reporting_outputs,
      measurable_kpis = EXCLUDED.measurable_kpis,
      cost_budget_guidance = EXCLUDED.cost_budget_guidance,
      cost_budget_daily_cents = EXCLUDED.cost_budget_daily_cents,
      max_invocations_per_day = EXCLUDED.max_invocations_per_day,
      failure_handling_rules = EXCLUDED.failure_handling_rules,
      related_services = EXCLUDED.related_services,
      related_docs = EXCLUDED.related_docs,
      tags = EXCLUDED.tags,
      maturity = EXCLUDED.maturity,
      spec_hash = EXCLUDED.spec_hash,
      updated_at = now();

    IF v_existing.id IS NULL THEN v_inserted := v_inserted + 1;
    ELSE v_updated := v_updated + 1;
    END IF;
  END LOOP;

  -- backfill runtime_state
  WITH inserted AS (
    INSERT INTO public.internal_agent_runtime_state (agent_id, current_status, trust_score)
    SELECT d.agent_id, 'idle', 0.5
    FROM public.internal_agent_definitions d
    LEFT JOIN public.internal_agent_runtime_state s ON s.agent_id = d.agent_id
    WHERE s.agent_id IS NULL
    RETURNING 1
  )
  SELECT COUNT(*) INTO v_state_created FROM inserted;

  RETURN jsonb_build_object(
    'inserted', v_inserted,
    'updated', v_updated,
    'state_created', v_state_created,
    'total', v_inserted + v_updated
  );
END;
$$;

-- Public callable by admins; service role bypasses
GRANT EXECUTE ON FUNCTION public.seed_internal_agents_from_json(jsonb) TO authenticated, service_role;