--
-- PostgreSQL database dump
--

\restrict hv7IgbCwBeYdzWNEifOxBs8HjzRLcbdzR4wsfzvc0kX1GFdzGR60ja3rOtcsRzg

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: get_db_truth_snapshot(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_db_truth_snapshot(_op text DEFAULT 'summary'::text) RETURNS jsonb
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public', 'pg_catalog'
    AS $$
DECLARE
  result jsonb;
BEGIN
  -- Admin gate enforced inside the function itself
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  IF _op = 'schema' THEN
    SELECT jsonb_build_object(
      'tables', COALESCE(jsonb_agg(
        jsonb_build_object(
          'tablename', tablename,
          'rowsecurity', rowsecurity,
          'hasindexes', hasindexes,
          'hastriggers', hastriggers
        ) ORDER BY tablename
      ), '[]'::jsonb),
      'count', COUNT(*)
    )
    INTO result
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public';

  ELSIF _op = 'policies' THEN
    SELECT jsonb_build_object(
      'policies', COALESCE(jsonb_agg(
        jsonb_build_object(
          'tablename', tablename,
          'policyname', policyname,
          'permissive', permissive,
          'roles', roles,
          'cmd', cmd
        ) ORDER BY tablename, policyname
      ), '[]'::jsonb),
      'count', COUNT(*)
    )
    INTO result
    FROM pg_catalog.pg_policies
    WHERE schemaname = 'public';

  ELSIF _op = 'drift' THEN
    -- Tables with RLS enabled but no policies (high-risk drift)
    WITH no_policy_tables AS (
      SELECT t.tablename
      FROM pg_catalog.pg_tables t
      WHERE t.schemaname = 'public'
        AND t.rowsecurity = true
        AND NOT EXISTS (
          SELECT 1 FROM pg_catalog.pg_policies p
          WHERE p.schemaname = 'public' AND p.tablename = t.tablename
        )
    ),
    no_rls_tables AS (
      SELECT tablename
      FROM pg_catalog.pg_tables
      WHERE schemaname = 'public' AND rowsecurity = false
    )
    SELECT jsonb_build_object(
      'rls_enabled_no_policies', COALESCE((SELECT jsonb_agg(tablename ORDER BY tablename) FROM no_policy_tables), '[]'::jsonb),
      'rls_disabled', COALESCE((SELECT jsonb_agg(tablename ORDER BY tablename) FROM no_rls_tables), '[]'::jsonb),
      'rls_enabled_no_policies_count', (SELECT COUNT(*) FROM no_policy_tables),
      'rls_disabled_count', (SELECT COUNT(*) FROM no_rls_tables)
    )
    INTO result;

  ELSE
    -- 'summary' (default): aggregate counts only
    SELECT jsonb_build_object(
      'totalTables', (SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public'),
      'tablesWithRls', (SELECT COUNT(*) FROM pg_catalog.pg_tables WHERE schemaname = 'public' AND rowsecurity = true),
      'totalPolicies', (SELECT COUNT(*) FROM pg_catalog.pg_policies WHERE schemaname = 'public'),
      'tablesWithPolicies', (SELECT COUNT(DISTINCT tablename) FROM pg_catalog.pg_policies WHERE schemaname = 'public'),
      'generatedAt', now()
    )
    INTO result;
  END IF;

  RETURN result;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_metadata->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_metadata->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: has_admin_permission(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_admin_permission(_user_id uuid, _permission text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_role_permissions arp
    JOIN public.cloud_admin_role_assignments cara ON cara.user_id = _user_id
    JOIN public.cloud_admin_roles car ON car.id = cara.role_id AND car.role_key = arp.role_key
    WHERE arp.permission = _permission
      AND arp.granted = true
  )
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;


--
-- Name: is_org_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;


--
-- Name: is_org_owner(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_org_owner(_user_id uuid, _org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  )
$$;


--
-- Name: is_tenant_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_tenant_member(_user_id uuid, _tenant_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cloud_tenant_memberships
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_safety_classifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_safety_classifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    action_key text NOT NULL,
    safety_class text DEFAULT 'passive'::text NOT NULL,
    trust_threshold numeric DEFAULT 0.5 NOT NULL,
    requires_confirmation boolean DEFAULT false NOT NULL,
    requires_audit boolean DEFAULT true NOT NULL,
    confirmation_prompt text,
    rollback_capable boolean DEFAULT false NOT NULL,
    max_autonomy_level integer DEFAULT 3 NOT NULL,
    policy_overrides jsonb DEFAULT '{}'::jsonb,
    description text,
    domain text DEFAULT 'general'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_action_audit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_action_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id uuid NOT NULL,
    action text NOT NULL,
    target_type text,
    target_id text,
    plane text DEFAULT 'control'::text NOT NULL,
    justification text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    session_id uuid,
    severity text DEFAULT 'info'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_action_confirmations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_action_confirmations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_key text NOT NULL,
    actor_user_id uuid NOT NULL,
    justification text DEFAULT ''::text NOT NULL,
    dry_run_result jsonb,
    impact_summary text DEFAULT ''::text,
    status text DEFAULT 'pending'::text NOT NULL,
    params jsonb DEFAULT '{}'::jsonb,
    approved_by uuid,
    approved_at timestamp with time zone,
    rejected_by uuid,
    rejected_at timestamp with time zone,
    executed_at timestamp with time zone,
    cooldown_expires_at timestamp with time zone,
    correlation_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_role_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_role_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    permission text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    granted boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_safety_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_safety_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text,
    risk_level text DEFAULT 'medium'::text NOT NULL,
    requires_dry_run boolean DEFAULT false NOT NULL,
    requires_confirmation boolean DEFAULT true NOT NULL,
    requires_dual_approval boolean DEFAULT false NOT NULL,
    requires_justification boolean DEFAULT true NOT NULL,
    cooldown_seconds integer DEFAULT 0 NOT NULL,
    impact_summary_template text DEFAULT ''::text,
    required_permission text NOT NULL,
    plane text DEFAULT 'control'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '02:00:00'::interval) NOT NULL,
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    mfa_verified boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    revoked_at timestamp with time zone,
    revoke_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_action_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_action_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    action_type text DEFAULT 'recommend'::text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    confidence numeric DEFAULT 0 NOT NULL,
    status text DEFAULT 'proposed'::text NOT NULL,
    requires_approval boolean DEFAULT true NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    executed_at timestamp with time zone,
    receipt_hash text,
    rollback_payload jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    display_name text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    autonomy_level integer DEFAULT 2 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    personality jsonb DEFAULT '{}'::jsonb NOT NULL,
    scope_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    confidence_threshold numeric DEFAULT 0.8 NOT NULL,
    budget_daily_tokens integer DEFAULT 10000 NOT NULL,
    tokens_used_today integer DEFAULT 0 NOT NULL,
    invocations_today integer DEFAULT 0 NOT NULL,
    max_invocations_per_hour integer DEFAULT 5 NOT NULL,
    last_observation_at timestamp with time zone,
    last_action_at timestamp with time zone,
    escalation_target text DEFAULT 'human'::text NOT NULL,
    mission text,
    special_ability text,
    maturity text DEFAULT 'alpha'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_autonomy_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_autonomy_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    domain text DEFAULT 'global'::text NOT NULL,
    autonomy_level integer DEFAULT 1 NOT NULL,
    max_financial_impact_cents integer DEFAULT 0 NOT NULL,
    allow_communication boolean DEFAULT false NOT NULL,
    allow_scheduling boolean DEFAULT false NOT NULL,
    allow_financial boolean DEFAULT false NOT NULL,
    allow_client_facing boolean DEFAULT false NOT NULL,
    require_approval_above_confidence numeric DEFAULT 0.8 NOT NULL,
    quiet_hours_start text,
    quiet_hours_end text,
    emergency_stop boolean DEFAULT false NOT NULL,
    paused_at timestamp with time zone,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_board_actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_board_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recommendation_id uuid,
    advisor_id text NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    action_type text DEFAULT 'task'::text NOT NULL,
    domain text DEFAULT 'business'::text NOT NULL,
    risk_tier text DEFAULT 'standard'::text NOT NULL,
    status text DEFAULT 'proposed'::text NOT NULL,
    confidence numeric DEFAULT 0.7 NOT NULL,
    requires_approval boolean DEFAULT true NOT NULL,
    approved_by text,
    approved_at timestamp with time zone,
    executed_at timestamp with time zone,
    completed_at timestamp with time zone,
    failed_at timestamp with time zone,
    reverted_at timestamp with time zone,
    error_message text,
    proof_receipt jsonb DEFAULT '{}'::jsonb,
    rollback_data jsonb,
    parameters jsonb DEFAULT '{}'::jsonb,
    result jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_board_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_board_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    memory_layer text DEFAULT 'short_term'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    content text NOT NULL,
    context_ref text,
    importance numeric DEFAULT 0.5 NOT NULL,
    confidence numeric DEFAULT 0.7 NOT NULL,
    access_count integer DEFAULT 0 NOT NULL,
    last_accessed_at timestamp with time zone,
    expires_at timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_board_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_board_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    title text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    rationale text DEFAULT ''::text NOT NULL,
    domain text DEFAULT 'business'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    confidence_score numeric DEFAULT 0.5 NOT NULL,
    urgency_score numeric DEFAULT 0.5 NOT NULL,
    business_impact_score numeric DEFAULT 0.5 NOT NULL,
    reversibility_score numeric DEFAULT 0.8 NOT NULL,
    profitability_score numeric DEFAULT 0.5 NOT NULL,
    relationship_risk_score numeric DEFAULT 0.2 NOT NULL,
    operational_risk_score numeric DEFAULT 0.2 NOT NULL,
    clarity_score numeric DEFAULT 0.7 NOT NULL,
    contributing_advisors jsonb DEFAULT '[]'::jsonb,
    evidence_refs jsonb DEFAULT '[]'::jsonb,
    action_plan jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'new'::text NOT NULL,
    resolved_at timestamp with time zone,
    resolution_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_board_reflections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_board_reflections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recommendation_id uuid,
    advisor_id text NOT NULL,
    owner_action text DEFAULT 'ignored'::text NOT NULL,
    owner_feedback text,
    outcome_observed text,
    outcome_quality numeric,
    lesson_learned text,
    should_repeat boolean,
    pattern_tags jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_board_tool_executions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_board_tool_executions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    action_id uuid,
    advisor_id text NOT NULL,
    tool_category text NOT NULL,
    tool_name text NOT NULL,
    operation text NOT NULL,
    parameters jsonb DEFAULT '{}'::jsonb,
    result jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    approval_state text DEFAULT 'pending'::text NOT NULL,
    approved_by text,
    approved_at timestamp with time zone,
    executed_at timestamp with time zone,
    duration_ms integer,
    error_message text,
    rollback_capable boolean DEFAULT false NOT NULL,
    rollback_data jsonb,
    rolled_back_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    feedback_type text DEFAULT 'rating'::text NOT NULL,
    rating integer,
    comment text,
    request_ref text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_knowledge; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_knowledge (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    confidence numeric DEFAULT 0.8 NOT NULL,
    source text DEFAULT 'system'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_memories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_memories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    memory_type text DEFAULT 'observation'::text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    importance numeric DEFAULT 0.5 NOT NULL,
    context_ref text,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: advisor_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advisor_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    advisor_id text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    display_name text NOT NULL,
    avatar_url text,
    personality_traits jsonb DEFAULT '{}'::jsonb,
    visual_style text DEFAULT 'professional'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_inference_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_inference_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    model text NOT NULL,
    capability_id text,
    prompt_family text,
    input_tokens integer DEFAULT 0,
    output_tokens integer DEFAULT 0,
    latency_ms integer,
    status text DEFAULT 'completed'::text,
    created_at timestamp with time zone DEFAULT now(),
    provider text,
    cost_estimate_cents integer DEFAULT 0,
    route_reason text,
    verification_outcome text
);


--
-- Name: ai_workforce_approval_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_approval_queue (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendation_id uuid,
    title text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    reviewer_user_id uuid,
    reviewer_comments text,
    evidence_links jsonb DEFAULT '[]'::jsonb NOT NULL,
    cost_implications text,
    launch_implications text,
    remediation_binding_id uuid,
    decision_at timestamp with time zone,
    escalated boolean DEFAULT false NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_budget_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_budget_classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_key text NOT NULL,
    display_name text NOT NULL,
    priority_order integer DEFAULT 0 NOT NULL,
    max_tokens_per_call integer DEFAULT 4000 NOT NULL,
    max_cost_cents_per_call integer DEFAULT 50 NOT NULL,
    max_calls_per_hour integer DEFAULT 10 NOT NULL,
    allowed_models jsonb DEFAULT '[]'::jsonb NOT NULL,
    description text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_cached_outputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_cached_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    cache_key text NOT NULL,
    role_key text NOT NULL,
    task_key text NOT NULL,
    output jsonb DEFAULT '{}'::jsonb NOT NULL,
    model_used text,
    tokens_used integer,
    cost_cents numeric(10,4),
    expires_at timestamp with time zone,
    hit_count integer DEFAULT 0 NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_invocations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_invocations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    task_key text NOT NULL,
    scope_type text,
    scope_ref text,
    scope_payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    budget_posture text DEFAULT 'normal'::text NOT NULL,
    mode text DEFAULT 'standard'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    model_used text,
    tokens_in integer,
    tokens_out integer,
    cost_cents numeric(10,4),
    duration_ms integer,
    error_message text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_launch_honesty; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_launch_honesty (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    launch_claim text DEFAULT ''::text NOT NULL,
    actual_status text DEFAULT 'scaffold'::text NOT NULL,
    honesty_score numeric(5,2) DEFAULT 0 NOT NULL,
    evidence jsonb DEFAULT '[]'::jsonb NOT NULL,
    last_audit_at timestamp with time zone,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_outputs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invocation_id uuid NOT NULL,
    output_type text DEFAULT 'text'::text NOT NULL,
    content jsonb DEFAULT '{}'::jsonb NOT NULL,
    quality_score numeric(5,2),
    flagged boolean DEFAULT false NOT NULL,
    flag_reason text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_recommendation_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_recommendation_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendation_id uuid NOT NULL,
    score_overall numeric(5,2) DEFAULT 0 NOT NULL,
    score_accuracy numeric(5,2),
    score_usefulness numeric(5,2),
    score_actionability numeric(5,2),
    score_evidence_quality numeric(5,2),
    score_cost_efficiency numeric(5,2),
    score_launch_honesty_alignment numeric(5,2),
    score_execution_success_likelihood numeric(5,2),
    score_realized_outcome_value numeric(5,2),
    review_method text DEFAULT 'human'::text NOT NULL,
    reviewed_by_user_id uuid,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invocation_id uuid,
    role_key text NOT NULL,
    task_key text,
    domain text DEFAULT 'general'::text NOT NULL,
    title text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    evidence jsonb DEFAULT '[]'::jsonb NOT NULL,
    severity text DEFAULT 'info'::text NOT NULL,
    confidence numeric(5,2) DEFAULT 0.5 NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    lifecycle_status text DEFAULT 'new'::text NOT NULL,
    approval_decision_at timestamp with time zone,
    approved_by_user_id uuid,
    rejected_by_user_id uuid,
    deferred_reason text,
    execution_required boolean DEFAULT false NOT NULL,
    execution_priority text,
    flagship_loop_key text,
    customer_journey_impact_key text,
    launch_blocker_impact_class text,
    outcome_verification_required boolean DEFAULT false NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_role_health; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_role_health (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    health_status text DEFAULT 'healthy'::text NOT NULL,
    total_invocations integer DEFAULT 0 NOT NULL,
    successful_invocations integer DEFAULT 0 NOT NULL,
    failed_invocations integer DEFAULT 0 NOT NULL,
    avg_latency_ms integer,
    avg_cost_cents numeric(10,4),
    avg_quality_score numeric(5,2),
    last_invocation_at timestamp with time zone,
    last_error text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_role_task_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_role_task_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    task_key text NOT NULL,
    permission_level text DEFAULT 'allowed'::text NOT NULL,
    max_autonomy integer DEFAULT 2 NOT NULL,
    requires_approval boolean DEFAULT true NOT NULL,
    budget_class_key text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    display_name text NOT NULL,
    council text DEFAULT 'general'::text NOT NULL,
    mission text,
    special_ability text,
    max_autonomy_level integer DEFAULT 2 NOT NULL,
    allowed_tools jsonb DEFAULT '[]'::jsonb NOT NULL,
    forbidden_tools jsonb DEFAULT '[]'::jsonb NOT NULL,
    memory_scope text DEFAULT 'session'::text NOT NULL,
    trigger_conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    escalation_targets jsonb DEFAULT '[]'::jsonb NOT NULL,
    kpis jsonb DEFAULT '[]'::jsonb NOT NULL,
    cost_budget_cents integer DEFAULT 100 NOT NULL,
    maturity text DEFAULT 'scaffold'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_workforce_task_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_workforce_task_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    task_key text NOT NULL,
    display_name text NOT NULL,
    description text,
    council text DEFAULT 'general'::text NOT NULL,
    input_schema jsonb DEFAULT '{}'::jsonb NOT NULL,
    output_schema jsonb DEFAULT '{}'::jsonb NOT NULL,
    default_model text,
    max_tokens integer DEFAULT 4000 NOT NULL,
    temperature numeric(3,2) DEFAULT 0.7 NOT NULL,
    requires_approval boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: api_gateway_routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_gateway_routes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    route_pattern text NOT NULL,
    method text DEFAULT 'POST'::text NOT NULL,
    plane text DEFAULT 'shared-core'::text NOT NULL,
    required_token_class text DEFAULT 'user'::text NOT NULL,
    required_permission text,
    rate_limit_per_minute integer DEFAULT 60 NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    provider text,
    appointment_date timestamp with time zone,
    status text DEFAULT 'confirmed'::text,
    prep_items text[] DEFAULT '{}'::text[],
    docs_needed text[] DEFAULT '{}'::text[],
    transport_time text,
    category text DEFAULT 'personal'::text,
    owner text,
    location text,
    who text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: approval_decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.approval_decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id uuid NOT NULL,
    request_type text DEFAULT 'approval_queue'::text NOT NULL,
    decision text DEFAULT 'pending'::text NOT NULL,
    actor_user_id uuid,
    rationale text,
    conditions jsonb DEFAULT '{}'::jsonb,
    decided_at timestamp with time zone,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: biometric_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.biometric_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id text NOT NULL,
    credential_type text DEFAULT 'webauthn'::text NOT NULL,
    public_key text NOT NULL,
    device_id uuid,
    display_name text,
    sign_count integer DEFAULT 0 NOT NULL,
    last_used_at timestamp with time zone,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: boardroom_decision_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boardroom_decision_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    item_id uuid,
    recommendation_id uuid,
    approved_motion text DEFAULT ''::text NOT NULL,
    rationale_summary text DEFAULT ''::text NOT NULL,
    evidence_snapshot jsonb DEFAULT '[]'::jsonb NOT NULL,
    simulation_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    approval_conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'sealed'::text NOT NULL,
    expected_outcome text,
    follow_up_review_date timestamp with time zone,
    linked_execution_items jsonb DEFAULT '[]'::jsonb NOT NULL,
    proof_trail jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: boardroom_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boardroom_evidence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    item_id uuid,
    source_type text DEFAULT 'inferred'::text NOT NULL,
    source_name text DEFAULT ''::text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    confidence numeric DEFAULT 0.5 NOT NULL,
    freshness text DEFAULT 'fresh'::text NOT NULL,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    lineage_chain jsonb DEFAULT '[]'::jsonb NOT NULL,
    proof_receipt_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: boardroom_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boardroom_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id uuid,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    severity text DEFAULT 'medium'::text NOT NULL,
    source_signals jsonb DEFAULT '[]'::jsonb NOT NULL,
    escalation_reason text,
    advisor_summaries jsonb DEFAULT '{}'::jsonb NOT NULL,
    recommendation_state text DEFAULT 'pending'::text NOT NULL,
    simulation_state text DEFAULT 'none'::text NOT NULL,
    confidence_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    evidence_refs jsonb DEFAULT '[]'::jsonb NOT NULL,
    freshness_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    blocking_conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: boardroom_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boardroom_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    item_id uuid,
    session_id uuid,
    summary text DEFAULT ''::text NOT NULL,
    rationale text DEFAULT ''::text NOT NULL,
    evidence_basis jsonb DEFAULT '[]'::jsonb NOT NULL,
    confidence_score numeric DEFAULT 0.5 NOT NULL,
    scenario_basis text,
    domain_impacts jsonb DEFAULT '[]'::jsonb NOT NULL,
    urgency text DEFAULT 'medium'::text NOT NULL,
    reversibility text DEFAULT 'reversible'::text NOT NULL,
    conditions_for_approval jsonb DEFAULT '[]'::jsonb NOT NULL,
    next_best_alternative text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: boardroom_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.boardroom_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_type text DEFAULT 'executive'::text NOT NULL,
    scope text DEFAULT 'global'::text NOT NULL,
    status text DEFAULT 'assembling'::text NOT NULL,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    current_issue_id uuid,
    participating_advisors jsonb DEFAULT '[]'::jsonb NOT NULL,
    session_mode text DEFAULT 'review'::text NOT NULL,
    decision_receipt_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: business_health_scores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_health_scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    dimension text NOT NULL,
    score numeric DEFAULT 0.5 NOT NULL,
    previous_score numeric,
    trend text DEFAULT 'stable'::text NOT NULL,
    contributing_signals jsonb DEFAULT '[]'::jsonb,
    biggest_drag text,
    biggest_mover text,
    improvement_opportunity text,
    scored_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: business_onboarding; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_onboarding (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    onboarding_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    event_date date NOT NULL,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    domain text DEFAULT 'personal'::text NOT NULL,
    event_type text DEFAULT 'meeting'::text NOT NULL,
    location text,
    priority text DEFAULT 'medium'::text,
    notes text,
    source text DEFAULT 'manual'::text NOT NULL,
    source_id text,
    color text,
    recurring text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: client_capability_matrix; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.client_capability_matrix (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_type text NOT NULL,
    display_name text NOT NULL,
    platform text DEFAULT 'web'::text NOT NULL,
    min_version text DEFAULT '1.0.0'::text,
    current_version text DEFAULT '1.0.0'::text,
    supported_features text[] DEFAULT '{}'::text[] NOT NULL,
    unsupported_features text[] DEFAULT '{}'::text[],
    capabilities jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_abuse_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_abuse_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    event_type text DEFAULT 'unknown'::text NOT NULL,
    severity text DEFAULT 'medium'::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    pattern_data jsonb DEFAULT '{}'::jsonb,
    device_id uuid,
    ip_address text,
    action_taken text DEFAULT 'none'::text,
    resolved boolean DEFAULT false NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_account_closure_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_account_closure_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    reason text DEFAULT ''::text,
    stage text DEFAULT 'requested'::text NOT NULL,
    export_completed boolean DEFAULT false NOT NULL,
    export_job_id uuid,
    cancellation_deadline timestamp with time zone,
    purge_completed_at timestamp with time zone,
    secrets_destroyed boolean DEFAULT false NOT NULL,
    tombstone_finalized boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_activity_journal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_activity_journal (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_type text DEFAULT 'unknown'::text NOT NULL,
    object_id uuid,
    object_type text,
    object_name text,
    device_id uuid,
    device_name text,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_admin_role_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_admin_role_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    assigned_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_admin_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_admin_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_key text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_archive_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_archive_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    object_id uuid NOT NULL,
    object_type text DEFAULT 'file'::text NOT NULL,
    direction text DEFAULT 'archive'::text NOT NULL,
    source_tier text DEFAULT 'hot'::text,
    target_tier text DEFAULT 'cold'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    actor_user_id uuid NOT NULL,
    action text NOT NULL,
    target_type text,
    target_id text,
    details jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    severity text DEFAULT 'info'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_backup_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_backup_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    snapshot_type text DEFAULT 'full'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    region text DEFAULT 'us-east-1'::text,
    size_bytes bigint DEFAULT 0,
    object_count integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    restore_tested_at timestamp with time zone,
    retention_days integer DEFAULT 30,
    triggered_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_blobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_blobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    storage_key text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    checksum text,
    compression text DEFAULT 'none'::text,
    encryption_class text DEFAULT 'standard'::text,
    storage_backend text DEFAULT 'supabase'::text,
    finalized boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_bootstrap_markers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_bootstrap_markers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_id uuid,
    marker_type text DEFAULT 'first_device'::text NOT NULL,
    status text DEFAULT 'completed'::text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_compliance_hooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_compliance_hooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    hook_type text DEFAULT 'legal_hold'::text NOT NULL,
    target_type text DEFAULT 'user'::text NOT NULL,
    target_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    reason text DEFAULT ''::text,
    activated_by uuid,
    activated_at timestamp with time zone DEFAULT now(),
    deactivated_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_conflicts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_conflicts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    object_id uuid NOT NULL,
    base_version integer DEFAULT 0 NOT NULL,
    device_a uuid,
    device_b uuid,
    state text DEFAULT 'pending'::text NOT NULL,
    strategy text DEFAULT 'last-write-wins'::text,
    details jsonb DEFAULT '{}'::jsonb,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_device_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_device_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_id uuid NOT NULL,
    refresh_token_hash text,
    push_token text,
    last_ip text,
    last_seen timestamp with time zone DEFAULT now(),
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_devices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_devices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_name text DEFAULT 'Unknown Device'::text NOT NULL,
    platform text DEFAULT 'web'::text NOT NULL,
    client_version text DEFAULT '1.0.0'::text,
    trust_state text DEFAULT 'trusted'::text NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    ip_address text,
    user_agent text,
    is_current boolean DEFAULT false,
    requires_reauth boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_feature_flags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_feature_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    flag_key text NOT NULL,
    display_name text NOT NULL,
    description text,
    enabled boolean DEFAULT false NOT NULL,
    scope text DEFAULT 'global'::text NOT NULL,
    conditions jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_file_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_file_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    file_id uuid NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    blob_id uuid,
    size bigint DEFAULT 0 NOT NULL,
    checksum text,
    origin_device_id uuid,
    restore_point boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    folder_id uuid,
    name text DEFAULT 'Untitled'::text NOT NULL,
    blob_id uuid,
    size bigint DEFAULT 0 NOT NULL,
    mime_type text DEFAULT 'application/octet-stream'::text,
    checksum text,
    version integer DEFAULT 1 NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    last_opened_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    parent_id uuid,
    name text DEFAULT 'Untitled'::text NOT NULL,
    path_cache text DEFAULT '/'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_import_export_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_import_export_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    job_type text DEFAULT 'export'::text NOT NULL,
    source text DEFAULT ''::text,
    destination text DEFAULT ''::text,
    status text DEFAULT 'pending'::text NOT NULL,
    progress_pct integer DEFAULT 0,
    total_items integer DEFAULT 0,
    processed_items integer DEFAULT 0,
    error_message text,
    download_url text,
    expires_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_lifecycle_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_lifecycle_rules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    rule_name text DEFAULT ''::text NOT NULL,
    source_tier text DEFAULT 'hot'::text,
    target_tier text DEFAULT 'cold'::text,
    condition_type text DEFAULT 'age_days'::text NOT NULL,
    condition_value integer DEFAULT 90 NOT NULL,
    applies_to text DEFAULT 'all'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    last_run_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_maintenance_modes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_maintenance_modes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    mode_key text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    active boolean DEFAULT false NOT NULL,
    activated_by uuid,
    activated_at timestamp with time zone,
    deactivated_at timestamp with time zone,
    reason text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_metrics_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_metrics_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_key text DEFAULT ''::text NOT NULL,
    metric_value numeric DEFAULT 0 NOT NULL,
    dimensions jsonb DEFAULT '{}'::jsonb,
    snapshot_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_namespace_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_namespace_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    namespace text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    owner_type text DEFAULT 'system'::text NOT NULL,
    owner_id text,
    schema_version integer DEFAULT 1 NOT NULL,
    data_class text DEFAULT 'standard'::text NOT NULL,
    retention_class text DEFAULT 'default'::text NOT NULL,
    encryption_class text DEFAULT 'standard'::text NOT NULL,
    conflict_strategy text DEFAULT 'last-write-wins'::text NOT NULL,
    searchable boolean DEFAULT true NOT NULL,
    exportable boolean DEFAULT true NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_key text NOT NULL,
    display_name text NOT NULL,
    storage_limit_bytes bigint DEFAULT '5368709120'::bigint NOT NULL,
    max_devices integer DEFAULT 3 NOT NULL,
    max_file_size_bytes bigint DEFAULT 104857600 NOT NULL,
    features jsonb DEFAULT '[]'::jsonb NOT NULL,
    price_cents integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    policy_key text NOT NULL,
    display_name text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    value_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    description text,
    enforced boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_preview_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_preview_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    file_id uuid NOT NULL,
    job_type text DEFAULT 'thumbnail'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    input_mime text,
    output_key text,
    output_mime text,
    dimensions jsonb,
    error_message text,
    attempts integer DEFAULT 0 NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_reconciliation_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_reconciliation_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    run_type text DEFAULT 'full'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    orphaned_blobs integer DEFAULT 0,
    missing_blobs integer DEFAULT 0,
    size_mismatches integer DEFAULT 0,
    quota_drifts integer DEFAULT 0,
    broken_chains integer DEFAULT 0,
    stale_tombstones integer DEFAULT 0,
    repairs_applied integer DEFAULT 0,
    affected_users integer DEFAULT 0,
    details jsonb DEFAULT '{}'::jsonb,
    triggered_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_search_index; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_search_index (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    object_id uuid NOT NULL,
    object_type text DEFAULT 'file'::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    path text DEFAULT ''::text,
    mime_type text,
    tags text[] DEFAULT '{}'::text[],
    content_snippet text DEFAULT ''::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    indexed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_shared_workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_shared_workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text,
    owner_user_id uuid NOT NULL,
    visibility text DEFAULT 'internal'::text NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_shares; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_shares (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_user_id uuid NOT NULL,
    target_user_id uuid,
    object_type text DEFAULT 'file'::text NOT NULL,
    object_id uuid NOT NULL,
    permission text DEFAULT 'read'::text NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_storage_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_storage_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_key text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    provider_type text DEFAULT 's3'::text NOT NULL,
    endpoint text DEFAULT ''::text,
    region text DEFAULT ''::text,
    bucket_name text DEFAULT ''::text,
    status text DEFAULT 'active'::text NOT NULL,
    capabilities jsonb DEFAULT '[]'::jsonb,
    config jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_storage_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_storage_tiers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tier_key text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    provider_id uuid,
    cost_per_gb_cents numeric DEFAULT 0 NOT NULL,
    retrieval_latency_ms integer DEFAULT 0 NOT NULL,
    min_retention_days integer DEFAULT 0 NOT NULL,
    tier_order integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_storage_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_storage_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    used_bytes bigint DEFAULT 0 NOT NULL,
    quota_bytes bigint DEFAULT '5368709120'::bigint NOT NULL,
    file_count integer DEFAULT 0 NOT NULL,
    largest_file_bytes bigint DEFAULT 0,
    orphaned_blobs integer DEFAULT 0,
    failed_uploads integer DEFAULT 0,
    failed_downloads integer DEFAULT 0,
    last_reconciled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_support_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_support_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    support_user_id uuid NOT NULL,
    target_user_id uuid NOT NULL,
    reason text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    actions_taken jsonb DEFAULT '[]'::jsonb,
    redacted_fields text[] DEFAULT '{}'::text[],
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_sync_changes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_sync_changes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    object_id uuid NOT NULL,
    change_type text DEFAULT 'update'::text NOT NULL,
    from_version integer,
    to_version integer,
    origin_device_id uuid,
    payload jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_sync_checkpoints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_sync_checkpoints (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_id uuid NOT NULL,
    last_change_id uuid,
    namespace text DEFAULT 'default'::text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_sync_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_sync_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_type text DEFAULT 'reindex'::text NOT NULL,
    target_user_id uuid,
    status text DEFAULT 'pending'::text NOT NULL,
    progress_pct integer DEFAULT 0,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    result_summary text,
    error_message text,
    triggered_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_sync_objects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_sync_objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    namespace text DEFAULT 'default'::text NOT NULL,
    type text DEFAULT 'generic'::text NOT NULL,
    version integer DEFAULT 1 NOT NULL,
    origin_device_id uuid,
    deleted boolean DEFAULT false NOT NULL,
    metadata_json jsonb DEFAULT '{}'::jsonb,
    blob_ref uuid,
    content_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_tenant_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_tenant_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    invited_by uuid,
    joined_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_tenant_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_tenant_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    plan_id uuid,
    storage_limit_bytes bigint DEFAULT '10737418240'::bigint NOT NULL,
    max_members integer DEFAULT 10 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_tenant_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_tenant_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    policy_key text DEFAULT ''::text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    value_json jsonb DEFAULT '{}'::jsonb NOT NULL,
    enforced boolean DEFAULT true NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_tenant_quotas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_tenant_quotas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    used_bytes bigint DEFAULT 0 NOT NULL,
    quota_bytes bigint DEFAULT '10737418240'::bigint NOT NULL,
    file_count integer DEFAULT 0 NOT NULL,
    last_reconciled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    slug text DEFAULT ''::text NOT NULL,
    type text DEFAULT 'team'::text NOT NULL,
    region text DEFAULT 'us-east-1'::text,
    residency text DEFAULT 'standard'::text,
    status text DEFAULT 'active'::text NOT NULL,
    owner_user_id uuid NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_trash; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_trash (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    object_type text DEFAULT 'file'::text NOT NULL,
    object_id uuid NOT NULL,
    original_name text,
    original_path text,
    size bigint DEFAULT 0,
    deleted_at timestamp with time zone DEFAULT now() NOT NULL,
    purge_after timestamp with time zone DEFAULT (now() + '30 days'::interval) NOT NULL,
    deleted_by_device_id uuid
);


--
-- Name: cloud_user_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_user_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_id uuid,
    status text DEFAULT 'active'::text NOT NULL,
    trial_ends_at timestamp with time zone,
    bonus_storage_bytes bigint DEFAULT 0,
    overage_allowed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cloud_worker_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cloud_worker_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    job_type text DEFAULT 'generic'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    priority integer DEFAULT 5 NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    result jsonb,
    error_message text,
    attempts integer DEFAULT 0 NOT NULL,
    max_attempts integer DEFAULT 3 NOT NULL,
    locked_by text,
    locked_at timestamp with time zone,
    scheduled_at timestamp with time zone DEFAULT now(),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    dead_letter boolean DEFAULT false NOT NULL,
    idempotency_key text,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: command_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    command_id uuid,
    intent text NOT NULL,
    context_json jsonb DEFAULT '{}'::jsonb,
    risk text DEFAULT 'low'::text,
    outcome text DEFAULT 'success'::text,
    user_preferences_json jsonb DEFAULT '{}'::jsonb,
    duration_ms integer DEFAULT 0,
    learned_at timestamp with time zone DEFAULT now() NOT NULL,
    pattern_tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: command_routing_decisions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_routing_decisions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    command_id uuid,
    route_layers text[] DEFAULT '{}'::text[],
    approval_flow text DEFAULT 'none'::text,
    guarantee_checks_json jsonb DEFAULT '[]'::jsonb,
    rationale text,
    decided_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: command_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.command_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    command_id uuid NOT NULL,
    step_index integer DEFAULT 0 NOT NULL,
    action text NOT NULL,
    target text,
    status text DEFAULT 'pending'::text NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    result jsonb DEFAULT '{}'::jsonb,
    error_message text,
    retry_count integer DEFAULT 0 NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: communication_metrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communication_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    metric_type text NOT NULL,
    value double precision DEFAULT 0 NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    user_id uuid NOT NULL,
    device_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: concierge_automations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concierge_automations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    trigger_event text,
    conditions jsonb DEFAULT '{}'::jsonb,
    trust_level text DEFAULT 'review'::text,
    status text DEFAULT 'proposed'::text,
    safety_boundary text,
    last_run timestamp with time zone,
    recent_runs_count integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: concierge_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concierge_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    doc_type text DEFAULT 'general'::text,
    sensitivity text DEFAULT 'normal'::text,
    linked_context text,
    expiry_date date,
    file_path text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: concierge_errands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concierge_errands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    location text,
    estimated_minutes integer,
    priority text DEFAULT 'medium'::text,
    status text DEFAULT 'pending'::text,
    bundle_id text,
    combinable boolean DEFAULT false,
    due_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: concierge_recurring_obligations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.concierge_recurring_obligations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    category text DEFAULT 'admin'::text,
    frequency text DEFAULT 'monthly'::text,
    next_due date,
    last_completed date,
    status text DEFAULT 'on-track'::text,
    effort text DEFAULT 'medium'::text,
    automatable boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: config_change_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.config_change_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_scope text NOT NULL,
    config_key text NOT NULL,
    previous_value jsonb,
    new_value jsonb NOT NULL,
    diff jsonb,
    actor_user_id uuid NOT NULL,
    justification text DEFAULT ''::text,
    status text DEFAULT 'applied'::text NOT NULL,
    rollback_of uuid,
    approval_required boolean DEFAULT false NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: connector_oauth_flows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connector_oauth_flows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    provider text NOT NULL,
    status text DEFAULT 'initiated'::text,
    scopes text[],
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: connector_sync_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connector_sync_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    connector text NOT NULL,
    status text DEFAULT 'pending'::text,
    records_synced integer DEFAULT 0,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: connector_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.connector_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    connector_id uuid,
    provider text NOT NULL,
    token_type text DEFAULT 'access'::text NOT NULL,
    encrypted_token_ref text NOT NULL,
    scopes text[] DEFAULT '{}'::text[],
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    last_refreshed_at timestamp with time zone,
    rotation_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: context_graph_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.context_graph_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    snapshot_type text DEFAULT 'periodic'::text NOT NULL,
    context_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    active_signals text[] DEFAULT '{}'::text[] NOT NULL,
    freshness_score numeric DEFAULT 1.0 NOT NULL,
    workspace_id text,
    device_id text,
    cognitive_load numeric DEFAULT 0,
    active_mode text DEFAULT 'default'::text,
    signal_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_automations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_automations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text,
    trigger_type text DEFAULT 'manual'::text NOT NULL,
    trigger_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    actions jsonb DEFAULT '[]'::jsonb NOT NULL,
    delay_minutes integer DEFAULT 0,
    trust_gate text DEFAULT 'suggested'::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    target_entity text DEFAULT 'contact'::text NOT NULL,
    runs integer DEFAULT 0 NOT NULL,
    last_run_at timestamp with time zone,
    execution_log jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_communications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    contact_id uuid,
    company_id uuid,
    opportunity_id uuid,
    comm_type text DEFAULT 'note'::text NOT NULL,
    direction text DEFAULT 'outbound'::text,
    subject text,
    content text,
    channel text,
    outcome text,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    domain text,
    industry text,
    size text,
    annual_revenue numeric,
    health_score integer DEFAULT 50,
    owner text,
    phone text,
    address text,
    city text,
    state text,
    country text,
    website text,
    tags text[] DEFAULT '{}'::text[],
    custom_fields jsonb DEFAULT '{}'::jsonb,
    notes text,
    import_source text,
    import_job_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_contact_company; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_contact_company (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    company_id uuid NOT NULL,
    role text,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    first_name text DEFAULT ''::text NOT NULL,
    last_name text DEFAULT ''::text NOT NULL,
    email text,
    phone text,
    title text,
    lifecycle_stage text DEFAULT 'lead'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    owner text,
    source text,
    health_score integer DEFAULT 50,
    avatar_url text,
    address text,
    city text,
    state text,
    country text,
    website text,
    tags text[] DEFAULT '{}'::text[],
    custom_fields jsonb DEFAULT '{}'::jsonb,
    last_contacted_at timestamp with time zone,
    next_follow_up_at timestamp with time zone,
    import_source text,
    import_job_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_import_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_import_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    source text DEFAULT 'csv'::text NOT NULL,
    file_name text,
    status text DEFAULT 'pending'::text NOT NULL,
    total_rows integer DEFAULT 0,
    created_count integer DEFAULT 0,
    updated_count integer DEFAULT 0,
    skipped_count integer DEFAULT 0,
    error_count integer DEFAULT 0,
    field_mappings jsonb DEFAULT '{}'::jsonb,
    errors jsonb DEFAULT '[]'::jsonb,
    stats jsonb DEFAULT '{}'::jsonb,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_merge_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_merge_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    entity_type text DEFAULT 'contact'::text NOT NULL,
    winner_id uuid NOT NULL,
    loser_id uuid NOT NULL,
    merged_fields jsonb DEFAULT '{}'::jsonb,
    merge_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text,
    content text DEFAULT ''::text NOT NULL,
    note_type text DEFAULT 'general'::text,
    is_pinned boolean DEFAULT false,
    entity_type text,
    entity_id uuid,
    contact_id uuid,
    company_id uuid,
    opportunity_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_opportunities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_opportunities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    value numeric DEFAULT 0,
    stage text DEFAULT 'Discovery'::text NOT NULL,
    stage_id uuid,
    probability integer DEFAULT 20,
    expected_close_date date,
    source text,
    owner text,
    contact_id uuid,
    company_id uuid,
    status text DEFAULT 'open'::text NOT NULL,
    lost_reason text,
    won_at timestamp with time zone,
    lost_at timestamp with time zone,
    notes text,
    tags text[] DEFAULT '{}'::text[],
    custom_fields jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_pipeline_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_pipeline_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    display_order integer DEFAULT 0 NOT NULL,
    color text DEFAULT '#6366f1'::text,
    is_won boolean DEFAULT false,
    is_lost boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_segments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_segments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    filter_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system boolean DEFAULT false,
    contact_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    color text DEFAULT '#6366f1'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: crm_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.crm_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    priority text DEFAULT 'medium'::text,
    due_date timestamp with time zone,
    completed_at timestamp with time zone,
    contact_id uuid,
    company_id uuid,
    opportunity_id uuid,
    task_type text DEFAULT 'follow-up'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: device_attestations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_attestations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    attestation_type text DEFAULT 'boot-integrity'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    evidence jsonb DEFAULT '{}'::jsonb,
    key_fingerprint text,
    verified_by text,
    verified_at timestamp with time zone,
    expires_at timestamp with time zone,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: device_mesh_peers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_mesh_peers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_name text NOT NULL,
    device_type text DEFAULT 'desktop'::text NOT NULL,
    role text DEFAULT 'anchor'::text NOT NULL,
    capabilities text[] DEFAULT '{}'::text[] NOT NULL,
    trust_score numeric DEFAULT 0.5 NOT NULL,
    proximity_status text DEFAULT 'remote'::text NOT NULL,
    last_handshake timestamp with time zone,
    mesh_group text DEFAULT 'default'::text,
    is_online boolean DEFAULT false NOT NULL,
    platform text DEFAULT 'web'::text,
    os_version text,
    battery_level numeric,
    network_type text DEFAULT 'unknown'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: device_ownership; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_ownership (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    device_id uuid NOT NULL,
    owner_user_id uuid NOT NULL,
    device_name text DEFAULT 'Unknown Device'::text NOT NULL,
    device_type text DEFAULT 'desktop'::text NOT NULL,
    platform text DEFAULT 'web'::text NOT NULL,
    trust_level text DEFAULT 'standard'::text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb,
    capabilities jsonb DEFAULT '[]'::jsonb,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    sync_enabled boolean DEFAULT true NOT NULL,
    selective_sync_config jsonb DEFAULT '{}'::jsonb,
    revoked boolean DEFAULT false NOT NULL,
    revoked_at timestamp with time zone,
    revoked_by uuid,
    revoke_scope text,
    environment text DEFAULT 'production'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: domain_ownership_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain_ownership_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    domain_key text NOT NULL,
    display_name text NOT NULL,
    owning_service text NOT NULL,
    plane text DEFAULT 'shared-core'::text NOT NULL,
    team text DEFAULT 'platform'::text NOT NULL,
    description text DEFAULT ''::text,
    dependencies jsonb DEFAULT '[]'::jsonb,
    api_surface jsonb DEFAULT '{"public": [], "internal": []}'::jsonb,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: dual_authority_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dual_authority_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    command_id uuid,
    action text NOT NULL,
    risk_level text DEFAULT 'high'::text,
    challenge_token uuid DEFAULT gen_random_uuid(),
    expires_at timestamp with time zone NOT NULL,
    status text DEFAULT 'pending'::text,
    response text,
    responded_at timestamp with time zone,
    explanation text,
    consequences jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ecosystem_commands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecosystem_commands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    input text NOT NULL,
    intent text,
    scope text DEFAULT 'device_local'::text,
    risk_class text DEFAULT 'low'::text,
    target_layers text[] DEFAULT '{}'::text[],
    approval_required boolean DEFAULT false,
    status text DEFAULT 'submitted'::text,
    result_summary text,
    correlation_id uuid DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: ecosystem_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecosystem_contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    feature_name text NOT NULL,
    os_ownership text,
    cloud_ownership text,
    app_ownership text,
    failure_behavior text,
    approval_required boolean DEFAULT false,
    rollback_exists boolean DEFAULT false,
    events text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ecosystem_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ecosystem_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_type text NOT NULL,
    correlation_id uuid,
    source_layer text NOT NULL,
    payload_json jsonb DEFAULT '{}'::jsonb,
    emitted_at timestamp with time zone DEFAULT now() NOT NULL,
    version integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: environment_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.environment_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    env_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    api_base_url text,
    feature_flag_context jsonb DEFAULT '{}'::jsonb,
    config jsonb DEFAULT '{}'::jsonb,
    is_current boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: flagship_loops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flagship_loops (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    loop_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    primary_persona text DEFAULT 'user'::text NOT NULL,
    launch_importance text DEFAULT 'important_to_launch'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    core_routes jsonb DEFAULT '[]'::jsonb NOT NULL,
    core_journeys jsonb DEFAULT '[]'::jsonb NOT NULL,
    primary_services jsonb DEFAULT '[]'::jsonb NOT NULL,
    owner_team text,
    ux_quality_target text DEFAULT 'premium'::text NOT NULL,
    proof_required boolean DEFAULT true NOT NULL,
    launch_honesty_class text DEFAULT 'needs_proof'::text NOT NULL,
    proof_status text DEFAULT 'not_started'::text NOT NULL,
    blocker_count integer DEFAULT 0 NOT NULL,
    demo_vs_real text DEFAULT 'demo'::text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: founder_directives; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.founder_directives (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    intent_text text NOT NULL,
    domain_classification text DEFAULT 'general'::text NOT NULL,
    priority text DEFAULT 'medium'::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    decomposed_plan jsonb DEFAULT '[]'::jsonb NOT NULL,
    task_graph jsonb DEFAULT '{}'::jsonb NOT NULL,
    execution_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    outcome_summary text,
    risk_assessment jsonb DEFAULT '{}'::jsonb NOT NULL,
    agent_assignments jsonb DEFAULT '[]'::jsonb NOT NULL,
    approvals_required boolean DEFAULT false NOT NULL,
    approvals_received jsonb DEFAULT '[]'::jsonb NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: gift_tracker; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gift_tracker (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    recipient text NOT NULL,
    occasion text,
    gift_idea text,
    budget numeric(8,2),
    status text DEFAULT 'idea'::text,
    target_date date,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: graph_edges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.graph_edges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    source_node_type text NOT NULL,
    source_node_id text NOT NULL,
    target_node_type text NOT NULL,
    target_node_id text NOT NULL,
    edge_type text NOT NULL,
    weight numeric DEFAULT 1.0,
    metadata jsonb DEFAULT '{}'::jsonb,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grocery_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    list_id uuid,
    name text NOT NULL,
    category text DEFAULT 'General'::text,
    quantity text,
    estimated_cost numeric(8,2),
    checked boolean DEFAULT false,
    recurring boolean DEFAULT false,
    urgent boolean DEFAULT false,
    store text,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grocery_lists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grocery_lists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text DEFAULT 'Shopping List'::text NOT NULL,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: health_validation_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_validation_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    update_id uuid,
    component text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    details text,
    checked_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: incidents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    severity text DEFAULT 'medium'::text NOT NULL,
    title text NOT NULL,
    description text,
    affected_services jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'open'::text NOT NULL,
    owner_user_id uuid,
    remediation_notes text,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: layer_health_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.layer_health_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    layer text NOT NULL,
    services_total integer DEFAULT 0,
    services_healthy integer DEFAULT 0,
    services_degraded integer DEFAULT 0,
    health_score numeric DEFAULT 100,
    captured_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lead_inbox_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_inbox_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    contact_name text DEFAULT ''::text NOT NULL,
    contact_email text,
    contact_phone text,
    company text,
    source text DEFAULT 'manual'::text NOT NULL,
    inquiry_text text,
    urgency text DEFAULT 'low'::text NOT NULL,
    quality_score integer DEFAULT 0,
    quality_hints jsonb DEFAULT '[]'::jsonb,
    completeness_score integer DEFAULT 0,
    missing_fields text[] DEFAULT '{}'::text[],
    duplicate_status text DEFAULT 'none'::text NOT NULL,
    duplicate_match_id uuid,
    suggested_owner text,
    suggested_route text DEFAULT 'lead'::text NOT NULL,
    advisor_suggestion text,
    triage_status text DEFAULT 'new'::text NOT NULL,
    routed_to text,
    accepted_at timestamp with time zone,
    business_profile_mode text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    email text,
    phone text,
    company text,
    source text,
    status text DEFAULT 'new'::text NOT NULL,
    likely_value numeric DEFAULT 0,
    opportunity_score integer DEFAULT 0,
    next_action text,
    last_contact_at timestamp with time zone,
    stale_risk boolean DEFAULT false,
    notes text,
    urgency text DEFAULT 'low'::text,
    inbox_item_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: license_activations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_activations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    license_id uuid NOT NULL,
    device_fingerprint text NOT NULL,
    device_name text,
    platform text,
    activated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_heartbeat timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: license_audit_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.license_audit_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    license_id uuid NOT NULL,
    event text NOT NULL,
    device_fingerprint text,
    ip_address text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: licenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.licenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    license_key text NOT NULL,
    product_tier text DEFAULT 'standard'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    max_devices integer DEFAULT 3 NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    key_signature text
);


--
-- Name: managed_apps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.managed_apps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    app_key text NOT NULL,
    display_name text NOT NULL,
    description text,
    version text DEFAULT '0.0.0'::text NOT NULL,
    trust_level text DEFAULT 'untrusted'::text NOT NULL,
    health_status text DEFAULT 'unknown'::text NOT NULL,
    install_source text DEFAULT 'manual'::text NOT NULL,
    install_state text DEFAULT 'installed'::text NOT NULL,
    permissions jsonb DEFAULT '[]'::jsonb NOT NULL,
    config jsonb DEFAULT '{}'::jsonb,
    crash_count integer DEFAULT 0 NOT NULL,
    last_crash_at timestamp with time zone,
    last_health_check_at timestamp with time zone,
    domain text DEFAULT 'general'::text NOT NULL,
    device_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mobile_push_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mobile_push_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    os text NOT NULL,
    transport text NOT NULL,
    token text NOT NULL,
    device_id text,
    app_version text,
    expires_at timestamp with time zone,
    rotated_from uuid,
    status text DEFAULT 'active'::text NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mobile_push_tokens_os_check CHECK ((os = ANY (ARRAY['ios'::text, 'android'::text, 'web'::text]))),
    CONSTRAINT mobile_push_tokens_status_check CHECK ((status = ANY (ARRAY['active'::text, 'rotated'::text, 'revoked'::text, 'expired'::text]))),
    CONSTRAINT mobile_push_tokens_transport_check CHECK ((transport = ANY (ARRAY['apns'::text, 'fcm'::text, 'web-push'::text])))
);


--
-- Name: notification_delivery_receipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_delivery_receipts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    notification_id uuid,
    channel text DEFAULT 'web_push'::text,
    status text DEFAULT 'pending'::text,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    platform text DEFAULT 'web'::text,
    failure_reason text,
    latency_ms integer,
    sent_at timestamp with time zone
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    channel text DEFAULT 'in_app'::text NOT NULL,
    scope text DEFAULT 'all'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    quiet_hours_start time without time zone,
    quiet_hours_end time without time zone,
    urgency_filter text DEFAULT 'all'::text NOT NULL,
    push_enabled boolean DEFAULT true NOT NULL,
    email_enabled boolean DEFAULT false NOT NULL,
    in_app_enabled boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    body text,
    urgency text DEFAULT 'low'::text NOT NULL,
    domain text DEFAULT 'general'::text,
    action_url text,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    dismissed boolean DEFAULT false NOT NULL,
    target_app text,
    target_module text,
    signal_type text DEFAULT 'info'::text,
    icon_name text,
    metadata jsonb DEFAULT '{}'::jsonb
);


--
-- Name: onboarding_choices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_choices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    key text NOT NULL,
    value jsonb,
    source text DEFAULT 'user'::text NOT NULL,
    applied boolean DEFAULT false NOT NULL,
    applied_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_completion_markers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_completion_markers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    marker_name text NOT NULL,
    satisfied boolean DEFAULT false NOT NULL,
    satisfied_at timestamp with time zone,
    details text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_hardware_detection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_hardware_detection (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    hardware_model text,
    battery_present boolean DEFAULT false,
    biometric_present boolean DEFAULT false,
    tpm_present boolean DEFAULT false,
    wifi_present boolean DEFAULT false,
    ethernet_present boolean DEFAULT false,
    bluetooth_present boolean DEFAULT false,
    display_resolution text,
    storage_bytes bigint,
    memory_bytes bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_restore_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_restore_sources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    source_type text DEFAULT 'cloud'::text NOT NULL,
    selected boolean DEFAULT false NOT NULL,
    status text DEFAULT 'available'::text NOT NULL,
    metadata_ref text,
    validation_status text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    device_id text NOT NULL,
    boot_id text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    state text DEFAULT 'not_started'::text NOT NULL,
    current_step text DEFAULT 'welcome'::text NOT NULL,
    version text DEFAULT '1.0.0'::text NOT NULL,
    interrupted boolean DEFAULT false NOT NULL,
    resume_token text,
    managed_enrollment_mode boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: onboarding_steps; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onboarding_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    step_name text NOT NULL,
    required boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    entered_at timestamp with time zone,
    completed_at timestamp with time zone,
    skipped_at timestamp with time zone,
    failed_at timestamp with time zone,
    validation_error_code text,
    validation_error_message text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: org_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.org_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    invited_at timestamp with time zone DEFAULT now(),
    joined_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    owner_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_audit_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_id text NOT NULL,
    actor_session_id text,
    actor_service text,
    action text NOT NULL,
    resource text,
    decision text DEFAULT 'allowed'::text NOT NULL,
    reason text,
    severity text DEFAULT 'info'::text NOT NULL,
    correlation_id text,
    auth_method text,
    metadata jsonb DEFAULT '{}'::jsonb,
    ts timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_auth_methods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_auth_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    method_type text DEFAULT 'password'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone,
    policy_flags jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_capabilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_capabilities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    capability_id text NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text,
    sensitivity_level text DEFAULT 'low'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_command_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_command_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    command_id uuid NOT NULL,
    from_state text,
    to_state text NOT NULL,
    actor text,
    reason text,
    metadata jsonb DEFAULT '{}'::jsonb,
    correlation_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_commands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_commands (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    command_type text DEFAULT 'structured'::text NOT NULL,
    command_text text,
    structured_command jsonb DEFAULT '{}'::jsonb,
    target_device_id text,
    target_device_ids text[] DEFAULT '{}'::text[],
    origin text DEFAULT 'mobile_app'::text NOT NULL,
    safety_mode text DEFAULT 'standard'::text NOT NULL,
    simulation_first boolean DEFAULT false NOT NULL,
    status text DEFAULT 'created'::text NOT NULL,
    plan_json jsonb,
    approval_state text DEFAULT 'none'::text,
    approval_requested_at timestamp with time zone,
    approved_by text,
    approved_at timestamp with time zone,
    verification_state text DEFAULT 'none'::text,
    verified_at timestamp with time zone,
    rollback_available boolean DEFAULT false NOT NULL,
    rollback_payload jsonb,
    correlation_id text DEFAULT (gen_random_uuid())::text NOT NULL,
    actor_user_id uuid,
    result jsonb,
    error_message text,
    dispatched_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_elevation_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_elevation_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_id text NOT NULL,
    session_id text NOT NULL,
    action text NOT NULL,
    target_service text NOT NULL,
    issued_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    single_use boolean DEFAULT true NOT NULL,
    nonce text,
    signature text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_keyrings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_keyrings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    keyring_id text NOT NULL,
    scope text DEFAULT 'user'::text NOT NULL,
    protection_class text DEFAULT 'standard'::text NOT NULL,
    hardware_backed boolean DEFAULT false NOT NULL,
    secret_count integer DEFAULT 0 NOT NULL,
    rotated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_policies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_policies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    policy_key text NOT NULL,
    display_name text NOT NULL,
    description text,
    scope text DEFAULT 'global'::text NOT NULL,
    scope_ref text,
    conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    actions jsonb DEFAULT '[]'::jsonb NOT NULL,
    priority integer DEFAULT 100 NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    domain text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_role_capabilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_role_capabilities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    capability_id text NOT NULL,
    default_allowed boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_secrets_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_secrets_metadata (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    secret_id text NOT NULL,
    owner_scope text DEFAULT 'user'::text NOT NULL,
    secret_type text NOT NULL,
    keyring_id text NOT NULL,
    label text DEFAULT ''::text,
    exportable boolean DEFAULT false NOT NULL,
    hardware_backed boolean DEFAULT false NOT NULL,
    access_policy_id text,
    version integer DEFAULT 1 NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    last_accessed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_service_identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_service_identities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    service_name text NOT NULL,
    service_uid text NOT NULL,
    privileged boolean DEFAULT false NOT NULL,
    allowed_actions text[] DEFAULT '{}'::text[],
    secret_scope text[] DEFAULT '{}'::text[],
    registered_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_id text NOT NULL,
    role text DEFAULT 'standard'::text NOT NULL,
    state text DEFAULT 'active'::text NOT NULL,
    locked boolean DEFAULT false NOT NULL,
    auth_fresh_until timestamp with time zone,
    display_id text DEFAULT ':0'::text,
    seat_id text DEFAULT 'seat0'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_activity_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: os_user_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.os_user_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    username text NOT NULL,
    display_name text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'standard'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    password_hash_ref text,
    profile_ref text,
    enrolled_methods text[] DEFAULT '{}'::text[] NOT NULL,
    failed_attempts integer DEFAULT 0 NOT NULL,
    lockout_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: outcome_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.outcome_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendation_id uuid NOT NULL,
    verification_type text DEFAULT 'manual'::text NOT NULL,
    expected_outcome text DEFAULT ''::text NOT NULL,
    actual_outcome text,
    status text DEFAULT 'pending'::text NOT NULL,
    verified_by_user_id uuid,
    verified_at timestamp with time zone,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: plane_service_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plane_service_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plane_id uuid NOT NULL,
    service_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    service_type text DEFAULT 'backbone'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    audience text DEFAULT 'user'::text NOT NULL,
    target_user_id uuid,
    title text NOT NULL,
    body text DEFAULT ''::text,
    category text DEFAULT 'info'::text NOT NULL,
    severity text DEFAULT 'info'::text NOT NULL,
    source_service text DEFAULT ''::text,
    source_event_type text DEFAULT ''::text,
    correlation_id text,
    read boolean DEFAULT false NOT NULL,
    dismissed boolean DEFAULT false NOT NULL,
    action_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_planes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_planes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plane_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    color text DEFAULT '#888888'::text NOT NULL,
    icon text DEFAULT 'layers'::text NOT NULL,
    service_count integer DEFAULT 0 NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: platform_runbooks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.platform_runbooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    domain text DEFAULT 'ops'::text NOT NULL,
    severity text DEFAULT 'medium'::text NOT NULL,
    trigger_conditions jsonb DEFAULT '[]'::jsonb NOT NULL,
    steps jsonb DEFAULT '[]'::jsonb NOT NULL,
    agent_assignments jsonb DEFAULT '[]'::jsonb NOT NULL,
    auto_heal_enabled boolean DEFAULT false NOT NULL,
    auto_heal_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    tags text[] DEFAULT '{}'::text[] NOT NULL,
    execution_count integer DEFAULT 0 NOT NULL,
    last_executed_at timestamp with time zone,
    last_execution_result jsonb,
    incident_patterns jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    display_name text,
    avatar_url text,
    bio text,
    preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profit_signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profit_signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    signal_type text NOT NULL,
    category text DEFAULT 'leak'::text NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    estimated_impact_cents integer,
    confidence numeric DEFAULT 0.5 NOT NULL,
    urgency text DEFAULT 'medium'::text NOT NULL,
    source_data jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'detected'::text NOT NULL,
    resolved_at timestamp with time zone,
    resolution_outcome text,
    actual_impact_cents integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: read_model_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.read_model_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_type text NOT NULL,
    subject_id text NOT NULL,
    subject_type text DEFAULT 'user'::text NOT NULL,
    snapshot jsonb DEFAULT '{}'::jsonb NOT NULL,
    freshness_at timestamp with time zone DEFAULT now() NOT NULL,
    ttl_seconds integer DEFAULT 300 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recommendation_execution_bindings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_execution_bindings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendation_id uuid NOT NULL,
    approval_queue_item_id uuid,
    binding_type text DEFAULT 'remediation_task'::text NOT NULL,
    binding_status text DEFAULT 'bound'::text NOT NULL,
    linked_program_id uuid,
    linked_task_id uuid,
    owner_team text,
    owner_user_id uuid,
    due_at timestamp with time zone,
    completed_at timestamp with time zone,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recommendation_execution_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_execution_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binding_id uuid NOT NULL,
    event_type text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_by_user_id uuid,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recommendation_learning_signals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_learning_signals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendation_id uuid NOT NULL,
    signal_type text NOT NULL,
    signal_strength numeric(5,2) DEFAULT 0 NOT NULL,
    signal_source text DEFAULT 'human_review'::text NOT NULL,
    notes text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recommendation_outcome_verifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recommendation_outcome_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recommendation_id uuid NOT NULL,
    binding_id uuid,
    verification_method text DEFAULT 'manual_review'::text NOT NULL,
    expected_improvement text DEFAULT ''::text NOT NULL,
    actual_improvement text,
    verification_status text DEFAULT 'pending'::text NOT NULL,
    customer_journey_delta text,
    launch_truth_delta text,
    notes text,
    verified_by_user_id uuid,
    verified_at timestamp with time zone,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: release_compatibility_matrix; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.release_compatibility_matrix (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_type text NOT NULL,
    client_version text NOT NULL,
    api_version text DEFAULT 'v1'::text NOT NULL,
    backend_version text DEFAULT '1.0.0'::text NOT NULL,
    compatibility text DEFAULT 'compatible'::text NOT NULL,
    breaking_changes text[] DEFAULT '{}'::text[],
    migration_required boolean DEFAULT false NOT NULL,
    rollout_stage text DEFAULT 'canary'::text NOT NULL,
    rollout_percentage integer DEFAULT 0 NOT NULL,
    notes text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: remediation_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remediation_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    focus_area text DEFAULT 'general'::text NOT NULL,
    program_status text DEFAULT 'active'::text NOT NULL,
    flagship_loop_key text,
    owner_team text,
    owner_user_id uuid,
    start_at timestamp with time zone,
    target_at timestamp with time zone,
    completed_at timestamp with time zone,
    launch_impact_class text,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: remediation_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.remediation_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    program_id uuid,
    task_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    task_status text DEFAULT 'new'::text NOT NULL,
    execution_type text DEFAULT 'frontend'::text NOT NULL,
    owner_team text,
    owner_user_id uuid,
    related_route_key text,
    related_service_key text,
    related_customer_journey_key text,
    related_flagship_loop_key text,
    due_at timestamp with time zone,
    completed_at timestamp with time zone,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: rollback_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rollback_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    update_id uuid,
    source_slot text NOT NULL,
    rollback_to_slot text NOT NULL,
    trigger_type text DEFAULT 'auto'::text NOT NULL,
    reason_code text,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: runtime_agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.runtime_agents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    agent_type text DEFAULT 'desktop'::text NOT NULL,
    hostname text,
    version text,
    capabilities jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'offline'::text NOT NULL,
    last_heartbeat_at timestamp with time zone,
    registered_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: school_activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    child_name text,
    activity_type text DEFAULT 'event'::text,
    schedule text,
    location text,
    status text DEFAULT 'active'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_identity_registry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_identity_registry (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text,
    plane text DEFAULT 'shared-core'::text NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    trust_level text DEFAULT 'standard'::text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    last_authenticated_at timestamp with time zone,
    token_ttl_seconds integer DEFAULT 3600 NOT NULL,
    allowed_targets text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: service_providers_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_providers_list (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    category text,
    phone text,
    location text,
    rating numeric(2,1) DEFAULT 0,
    trusted boolean DEFAULT false,
    total_spent numeric(10,2) DEFAULT 0,
    response_time text,
    cost_range text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: simulations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.simulations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    scenario_type text NOT NULL,
    title text NOT NULL,
    input_payload jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending'::text NOT NULL,
    result_artifacts jsonb DEFAULT '[]'::jsonb,
    model_used text,
    duration_ms integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


--
-- Name: support_access_grants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_access_grants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    target_user_id uuid NOT NULL,
    granted_to_user_id uuid NOT NULL,
    reason text NOT NULL,
    scope text DEFAULT 'read-only'::text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '01:00:00'::interval) NOT NULL,
    revoked_at timestamp with time zone,
    actions_performed jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: support_case_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_case_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    event_type text DEFAULT 'comment'::text NOT NULL,
    actor_user_id uuid NOT NULL,
    content text DEFAULT ''::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: support_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.support_cases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text,
    category text DEFAULT 'general'::text NOT NULL,
    priority text DEFAULT 'normal'::text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    assigned_to uuid,
    escalated_to_role text,
    correlation_id text,
    diagnostic_package jsonb,
    resolution text,
    resolved_at timestamp with time zone,
    self_repair_attempted boolean DEFAULT false NOT NULL,
    self_repair_result text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_guarantees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_guarantees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    command_id uuid,
    guarantee_type text NOT NULL,
    status text DEFAULT 'unverified'::text,
    explanation text,
    checked_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: system_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    slot_id text NOT NULL,
    version text NOT NULL,
    build_id text NOT NULL,
    status text DEFAULT 'inactive'::text NOT NULL,
    boot_count integer DEFAULT 0,
    health_status text DEFAULT 'unknown'::text,
    integrity_verified boolean DEFAULT false,
    last_boot_at timestamp with time zone,
    installed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.timeline_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    event_type text NOT NULL,
    actor_type text DEFAULT 'system'::text NOT NULL,
    actor_id text,
    subject_type text,
    subject_id text,
    action text NOT NULL,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    receipt_id uuid,
    domain text DEFAULT 'general'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: token_classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token_classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    class_key text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    default_ttl_seconds integer DEFAULT 3600 NOT NULL,
    max_ttl_seconds integer DEFAULT 86400 NOT NULL,
    scope_template jsonb DEFAULT '[]'::jsonb,
    requires_mfa boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: travel_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.travel_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    destination text NOT NULL,
    start_date date,
    end_date date,
    readiness_percent integer DEFAULT 0,
    status text DEFAULT 'planning'::text,
    travelers text,
    budget numeric(10,2),
    spent numeric(10,2) DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: update_boot_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_boot_attempts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    update_id uuid,
    target_slot text NOT NULL,
    reboot_requested_at timestamp with time zone,
    booted_at timestamp with time zone,
    startup_validation_ok boolean,
    health_validation_ok boolean,
    rollback_triggered boolean DEFAULT false,
    rollback_reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: update_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    version text NOT NULL,
    build_id text NOT NULL,
    channel text DEFAULT 'stable'::text NOT NULL,
    update_type text DEFAULT 'full'::text NOT NULL,
    package_format text DEFAULT 'image'::text,
    metadata_hash text,
    signature_ref text,
    payload_size bigint DEFAULT 0,
    delta_from_version text,
    published_at timestamp with time zone DEFAULT now() NOT NULL,
    critical boolean DEFAULT false NOT NULL,
    min_supported_version text,
    rollout_percentage integer DEFAULT 100,
    release_notes text,
    components jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: update_channels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_channels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text DEFAULT 'stable'::text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    user_selectable boolean DEFAULT true NOT NULL,
    policy_allowed boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: update_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    update_id uuid,
    from_version text,
    to_version text NOT NULL,
    action text DEFAULT 'installed'::text NOT NULL,
    actor text DEFAULT 'system'::text NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: update_preflight_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_preflight_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    update_id uuid,
    battery_percent integer,
    charger_connected boolean DEFAULT false,
    free_storage_bytes bigint,
    network_type text,
    policy_allowed boolean DEFAULT true,
    channel_allowed boolean DEFAULT true,
    slot_available boolean DEFAULT true,
    passed boolean DEFAULT false NOT NULL,
    reason_code text,
    checked_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: update_staging; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.update_staging (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    update_id uuid,
    target_slot text DEFAULT 'B'::text NOT NULL,
    snapshot_id text,
    state text DEFAULT 'pending'::text NOT NULL,
    integrity_verified boolean DEFAULT false,
    staged_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL
);


--
-- Name: v_outcome_verification_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_outcome_verification_summary WITH (security_invoker='true') AS
 SELECT r.domain,
    r.role_key,
    r.flagship_loop_key,
    ov.verification_status,
    ov.verification_method,
    count(*) AS count,
    r.user_id
   FROM (public.recommendation_outcome_verifications ov
     JOIN public.ai_workforce_recommendations r ON ((r.id = ov.recommendation_id)))
  GROUP BY r.domain, r.role_key, r.flagship_loop_key, ov.verification_status, ov.verification_method, r.user_id;


--
-- Name: v_recommendation_closure_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_recommendation_closure_summary WITH (security_invoker='true') AS
 SELECT r.id AS recommendation_id,
    r.title,
    r.role_key,
    r.domain,
    r.lifecycle_status,
    r.flagship_loop_key,
    r.execution_required,
    r.outcome_verification_required,
    COALESCE(s.avg_score, (0)::numeric) AS avg_score,
    aq.status AS approval_status,
    eb.binding_status,
    eb.binding_type,
    rp.display_name AS program_name,
    ov.verification_status AS outcome_status,
    r.user_id,
    r.created_at
   FROM (((((public.ai_workforce_recommendations r
     LEFT JOIN LATERAL ( SELECT avg(ai_workforce_recommendation_scores.score_overall) AS avg_score
           FROM public.ai_workforce_recommendation_scores
          WHERE (ai_workforce_recommendation_scores.recommendation_id = r.id)) s ON (true))
     LEFT JOIN public.ai_workforce_approval_queue aq ON ((aq.recommendation_id = r.id)))
     LEFT JOIN public.recommendation_execution_bindings eb ON ((eb.recommendation_id = r.id)))
     LEFT JOIN public.remediation_programs rp ON ((rp.id = eb.linked_program_id)))
     LEFT JOIN public.recommendation_outcome_verifications ov ON ((ov.recommendation_id = r.id)));


--
-- Name: v_recommendation_execution_pipeline; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_recommendation_execution_pipeline WITH (security_invoker='true') AS
 SELECT lifecycle_status AS stage,
    count(*) AS count,
    user_id
   FROM public.ai_workforce_recommendations
  GROUP BY lifecycle_status, user_id;


--
-- Name: v_remediation_program_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_remediation_program_summary WITH (security_invoker='true') AS
 SELECT rp.id AS program_id,
    rp.program_key,
    rp.display_name,
    rp.focus_area,
    rp.program_status,
    rp.flagship_loop_key,
    rp.owner_team,
    rp.launch_impact_class,
    COALESCE(t.total_tasks, (0)::bigint) AS total_tasks,
    COALESCE(t.done_tasks, (0)::bigint) AS done_tasks,
    COALESCE(t.blocked_tasks, (0)::bigint) AS blocked_tasks,
    COALESCE(b.linked_recs, (0)::bigint) AS linked_recommendations,
    rp.user_id,
    rp.created_at
   FROM ((public.remediation_programs rp
     LEFT JOIN LATERAL ( SELECT count(*) AS total_tasks,
            count(*) FILTER (WHERE (remediation_tasks.task_status = 'done'::text)) AS done_tasks,
            count(*) FILTER (WHERE (remediation_tasks.task_status = 'blocked'::text)) AS blocked_tasks
           FROM public.remediation_tasks
          WHERE (remediation_tasks.program_id = rp.id)) t ON (true))
     LEFT JOIN LATERAL ( SELECT count(*) AS linked_recs
           FROM public.recommendation_execution_bindings
          WHERE (recommendation_execution_bindings.linked_program_id = rp.id)) b ON (true));


--
-- Name: vapid_keys; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vapid_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    public_key text NOT NULL,
    private_key_ref text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    activated_at timestamp with time zone DEFAULT now(),
    rotated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Data for Name: action_safety_classifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.action_safety_classifications (id, user_id, action_key, safety_class, trust_threshold, requires_confirmation, requires_audit, confirmation_prompt, rollback_capable, max_autonomy_level, policy_overrides, description, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_action_audit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_action_audit (id, actor_user_id, action, target_type, target_id, plane, justification, metadata, ip_address, session_id, severity, created_at) FROM stdin;
\.


--
-- Data for Name: admin_action_confirmations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_action_confirmations (id, action_key, actor_user_id, justification, dry_run_result, impact_summary, status, params, approved_by, approved_at, rejected_by, rejected_at, executed_at, cooldown_expires_at, correlation_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_role_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_role_permissions (id, role_key, permission, description, granted, created_at, updated_at) FROM stdin;
d9cd2f5f-a87a-4989-8aad-bbb91bf18ef0	super-admin	users.view	View all user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
628d57a5-5415-45a1-841d-5bc13bd0724e	super-admin	users.suspend	Suspend user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
1ffbf401-174c-425c-bfe2-6b6a8f4bdb2a	super-admin	users.delete	Delete user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
2fee6f6b-f781-4c74-9f8f-45edbda46b6f	super-admin	devices.view	View all devices	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
fad33046-393c-4df4-9168-00f6ff52114d	super-admin	devices.revoke	Revoke any device	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
5cf3c6ef-dddf-4fbf-b7ac-1a035ce71d90	super-admin	devices.force_reauth	Force re-authentication	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
76af3845-b15e-496b-a94a-e316760abfae	super-admin	storage.view	View storage operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
c5e8b7c6-5c33-483a-9547-6f74b7131f34	super-admin	storage.repair	Run storage repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
5272d117-fbba-4404-aae6-2cb49e757db3	super-admin	storage.quota	Modify storage quotas	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
54b31538-380e-422d-9b45-310f6ed2fc20	super-admin	sync.view	View sync operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
fc2b8703-fe7d-4463-96fc-c3bc453fe2a1	super-admin	sync.repair	Run sync repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
dc9e90c9-1c32-43e8-8a6a-86bfdd7a2b63	super-admin	policy.view	View policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
b1d9bad9-12ff-4747-97f0-ac122eecb4be	super-admin	policy.edit	Edit policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
92fb86de-5890-4ea6-8478-99e154fc1951	super-admin	flags.view	View feature flags	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
775131ff-56a7-4a45-97ef-7b127f9ccf0b	super-admin	flags.rollout	Control flag rollouts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
e43e7ab5-cd90-46ee-974c-f6bd40b93394	super-admin	audit.view	View audit logs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
630d629d-7fe2-44ac-b145-8c6c6f431436	super-admin	audit.export	Export audit data	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
d35694ef-de49-4a96-a4b6-4164eefbf6f3	super-admin	support.view	View support tools	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
53a2cbff-bbe2-4e4f-84e2-673becd7ed1e	super-admin	support.grant	Grant support access	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
3469c047-fb57-4355-8fdd-6dd6f76477e4	super-admin	support.repair	Run safe repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
ca79dfc8-0061-4b71-b462-1006e6cef377	super-admin	maintenance.view	View maintenance jobs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
67a30a42-0aa5-406b-890a-c9177d5b9b4e	super-admin	maintenance.run	Run maintenance tasks	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
ef15c6bb-8c87-4f11-a6c8-2a34cda2bd96	super-admin	maintenance.emergency	Emergency controls	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
a5e04967-0264-47af-a793-bec4bab11bb0	platform-admin	users.view	View all user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
3a069960-40aa-4d90-812b-aa40b83ae2aa	platform-admin	users.suspend	Suspend user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
c44742a3-ff75-4d87-9957-79436a3d6a77	platform-admin	devices.view	View all devices	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
c4a80827-80ae-4243-9fc2-58f518f6ae7e	platform-admin	devices.revoke	Revoke any device	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
f79d7ca0-3668-42f4-a089-20dd55393f05	platform-admin	storage.view	View storage operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
fd426893-95be-439c-98da-2dd4869f6a21	platform-admin	storage.repair	Run storage repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
a0bf8c09-8119-4425-a4bb-f036672b6c63	platform-admin	storage.quota	Modify storage quotas	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
587ba7e7-fd3e-4bd8-9f60-efa0ba8c235e	platform-admin	sync.view	View sync operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
41c61668-6694-4108-9826-fcc7f18c4b25	platform-admin	sync.repair	Run sync repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
1ecc852d-8560-4898-a633-0f60e5ed1f99	platform-admin	policy.view	View policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
989bbf41-c117-4219-a2f6-7d95dde91fdb	platform-admin	policy.edit	Edit policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
4f9d4188-d491-436a-b7c9-4900890c17cd	platform-admin	flags.view	View feature flags	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
e5c66aaf-7ef2-4fec-8b18-604457089fb1	platform-admin	flags.rollout	Control flag rollouts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
e5cd572d-8cb1-4a97-85da-2e10e5752747	platform-admin	audit.view	View audit logs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
8a50978a-6ef5-40fe-8a5c-8640f134f4a8	platform-admin	support.view	View support tools	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
8c802fe4-c0f4-48dc-a3f5-35e4543cedf4	platform-admin	support.grant	Grant support access	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
fd3d1ff8-aa9d-47fa-a7ed-eb3450a5c86e	platform-admin	maintenance.view	View maintenance jobs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
94ef11a8-e2fa-4c11-beba-92878f42637b	platform-admin	maintenance.run	Run maintenance tasks	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
810db3e0-f716-41b5-8564-643b12670e4c	storage-admin	storage.view	View storage operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
45bbe18f-528a-4cd5-a306-1231ef451b3c	storage-admin	storage.repair	Run storage repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
37060caa-81ff-4e9a-93e1-888dd3b2d6b5	storage-admin	storage.quota	Modify storage quotas	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
214f4ae1-2b22-4ccf-9fc8-a86f0896b2b8	storage-admin	sync.view	View sync operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
fddca636-7a62-49b5-83c8-74cdbbb4292e	storage-admin	sync.repair	Run sync repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
7584e9d3-cc60-4669-bf19-b1b00a457409	storage-admin	maintenance.view	View maintenance jobs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
b5316cdf-86cc-441a-95b1-8056749859e9	security-admin	users.view	View all user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
5b022f40-3a21-4a66-b5dd-51af9d6603fb	security-admin	users.suspend	Suspend user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
4dcd6b24-e32e-432b-a45d-b08b3245d013	security-admin	devices.view	View all devices	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
96188557-5259-4e9c-8f89-61c9d780db30	security-admin	devices.revoke	Revoke any device	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
b3ad9a05-7404-4bfa-860d-d2e8772b9694	security-admin	devices.force_reauth	Force re-authentication	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
21b2d404-4e30-4312-81fb-36f4a0809bbb	security-admin	audit.view	View audit logs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
2fb11473-b915-4457-94c5-ccdb1453a5c6	security-admin	audit.export	Export audit data	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
f1a6a010-2935-4d7c-91bb-3193394307f1	security-admin	policy.view	View policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
ed3ea393-997e-4f9b-8ee0-43b1fb375a7f	security-admin	policy.edit	Edit policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
5619c486-8e30-4c9f-85e9-4ec64964906d	support-admin	users.view	View all user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
5f1ce32e-9f19-45c1-8842-2b9e799f140b	support-admin	devices.view	View all devices	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
d49d8c3f-93c9-482e-b946-c154f7540c1b	support-admin	sync.view	View sync operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
c304fec0-b6d6-4e32-95da-f0043080a4db	support-admin	support.view	View support tools	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
8ab97f73-2aea-44da-a900-696dbc7853f6	support-admin	support.grant	Grant support access	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
e50c85b5-f8fe-486a-81c5-932de45ac345	support-admin	support.repair	Run safe repairs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
a753a90b-2918-4095-9e30-4c560200cc8a	billing-admin	users.view	View all user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
1e2cd189-2480-4193-83ec-3c3e08604444	billing-admin	storage.view	View storage operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
3886d4eb-914e-4f8f-8547-24efc2cf7910	billing-admin	storage.quota	Modify storage quotas	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
63f2151f-1d05-4c48-b3bc-a9cbce2bde95	read-only-auditor	users.view	View all user accounts	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
345f5ef9-96ce-46a0-b37d-843ccc48ef3d	read-only-auditor	devices.view	View all devices	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
54afcea2-9965-4ad6-bbf5-6ce7926f1ddb	read-only-auditor	storage.view	View storage operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
6a2da743-05ce-478b-aad7-9b8f6eb8986a	read-only-auditor	sync.view	View sync operations	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
2837c245-9407-4039-98df-de5838e52caf	read-only-auditor	policy.view	View policies	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
877ba289-ed0c-4a0d-abf5-0ae71a7a068c	read-only-auditor	flags.view	View feature flags	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
c8fb37ac-b117-4ce5-9976-787728e91532	read-only-auditor	audit.view	View audit logs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
a508c7fa-f3da-4ed7-af06-552408fab038	read-only-auditor	support.view	View support tools	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
c156c718-4ff5-4d6d-8da0-4939afcbe92c	read-only-auditor	maintenance.view	View maintenance jobs	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
\.


--
-- Data for Name: admin_safety_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_safety_actions (id, action_key, display_name, description, risk_level, requires_dry_run, requires_confirmation, requires_dual_approval, requires_justification, cooldown_seconds, impact_summary_template, required_permission, plane, created_at, updated_at) FROM stdin;
973dfdc0-d0af-487b-8260-c3b3e41fc835	quota.override	Override User Quota	Manually change storage quota for a user or tenant	high	t	t	f	t	300		storage.quota.override	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
bca72201-b9d6-4b49-ad34-9d680f845af8	device.mass_revoke	Mass Device Revocation	Revoke multiple devices across users	critical	t	t	t	t	600		devices.mass_revoke	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
acef49b1-e240-4de1-afd8-5eaaa77d1ff6	policy.global_edit	Edit Global Policy	Modify platform-wide policy settings	critical	t	t	t	t	900		policy.edit	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
ea89be86-0bce-44ba-bfca-f667b9c48d67	feature.global_kill	Global Feature Kill Switch	Disable a feature for all users immediately	critical	f	t	t	t	60		flags.rollout	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
893db516-ec01-45da-9b80-29145f3cf044	user.suspend	Suspend User Account	Temporarily disable a user account	high	f	t	f	t	120		users.suspend	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
f2910000-5009-43c5-8dd0-782ad44e4a12	sync.force_reset	Force Sync Reset	Destructively reset sync state for a user	high	t	t	f	t	300		sync.repair	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
880d5f44-a22e-44af-8e92-58f3d9915a33	data.bulk_repair	Bulk Data Repair	Run repair operations across multiple users	critical	t	t	t	t	600		storage.repair	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
07d85d0a-9414-4f36-9a50-a18ffeb2e8de	account.purge	Purge User Account	Permanently delete all user data	critical	t	t	t	t	1800		users.delete	control	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
\.


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_sessions (id, user_id, started_at, expires_at, last_activity_at, ip_address, user_agent, mfa_verified, status, revoked_at, revoke_reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_action_queue; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_action_queue (id, user_id, advisor_id, action_type, domain, summary, payload, confidence, status, requires_approval, approved_by, approved_at, executed_at, receipt_hash, rollback_payload, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_agents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_agents (id, user_id, advisor_id, display_name, domain, autonomy_level, is_active, personality, scope_config, confidence_threshold, budget_daily_tokens, tokens_used_today, invocations_today, max_invocations_per_hour, last_observation_at, last_action_at, escalation_target, mission, special_ability, maturity, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_autonomy_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_autonomy_policies (id, user_id, domain, autonomy_level, max_financial_impact_cents, allow_communication, allow_scheduling, allow_financial, allow_client_facing, require_approval_above_confidence, quiet_hours_start, quiet_hours_end, emergency_stop, paused_at, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_board_actions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_board_actions (id, user_id, recommendation_id, advisor_id, title, description, action_type, domain, risk_tier, status, confidence, requires_approval, approved_by, approved_at, executed_at, completed_at, failed_at, reverted_at, error_message, proof_receipt, rollback_data, parameters, result, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_board_memory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_board_memory (id, user_id, advisor_id, memory_layer, category, content, context_ref, importance, confidence, access_count, last_accessed_at, expires_at, status, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_board_recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_board_recommendations (id, user_id, advisor_id, title, summary, rationale, domain, category, confidence_score, urgency_score, business_impact_score, reversibility_score, profitability_score, relationship_risk_score, operational_risk_score, clarity_score, contributing_advisors, evidence_refs, action_plan, status, resolved_at, resolution_notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_board_reflections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_board_reflections (id, user_id, recommendation_id, advisor_id, owner_action, owner_feedback, outcome_observed, outcome_quality, lesson_learned, should_repeat, pattern_tags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_board_tool_executions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_board_tool_executions (id, user_id, action_id, advisor_id, tool_category, tool_name, operation, parameters, result, status, approval_state, approved_by, approved_at, executed_at, duration_ms, error_message, rollback_capable, rollback_data, rolled_back_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_feedback; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_feedback (id, user_id, advisor_id, domain, feedback_type, rating, comment, request_ref, created_at) FROM stdin;
\.


--
-- Data for Name: advisor_knowledge; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_knowledge (id, user_id, advisor_id, domain, title, content, tags, confidence, source, status, created_at, updated_at) FROM stdin;
b324d9a1-a540-43ea-8946-ec58cdc5dd47	00000000-0000-0000-0000-000000000000	money-advisor	money	Cash Flow Waterfall Methodology	Analyze cash flow in a waterfall sequence: Revenue In → Fixed Costs → Variable Costs → Debt Service → Savings → Discretionary. Each tier must be fully funded before the next. Flag any tier consuming >40% of inflow. Track weekly velocity (7-day rolling average) and monthly trend. Alert when the waterfall breaks (a tier is underfunded for 2+ consecutive weeks).	{cash-flow,waterfall,methodology}	0.92	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
a6ee4b3c-2446-4932-89e2-8a936ec8cc6a	00000000-0000-0000-0000-000000000000	money-advisor	money	50/30/20 Founder Adaptation	The classic 50/30/20 rule (needs/wants/savings) adapts for founders: 40% business reinvestment, 30% personal needs, 20% reserves, 10% growth experiments. During pre-revenue phase, shift to 60/25/15 (runway/needs/buffer). Track adherence monthly. Flag deviations >15% from target allocation.	{budgeting,founder,allocation}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
d744b0e2-0607-44d1-a435-d37e74c22b66	00000000-0000-0000-0000-000000000000	money-advisor	money	Subscription Audit Framework	Monthly subscription audit: 1) List all recurring charges. 2) Categorize as Essential/Useful/Redundant/Unknown. 3) Flag subscriptions unused in 30+ days. 4) Identify overlapping services. 5) Calculate annual cost per category. 6) Recommend consolidation opportunities. Target: reduce subscription spend by 15-25% quarterly. Alert on new subscriptions exceeding $50/month.	{subscriptions,audit,cost-reduction}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
d4f74af7-97a4-4de1-8ddc-bb35b7e42b81	00000000-0000-0000-0000-000000000000	money-advisor	money	Reserve Adequacy Formula	Minimum reserve = Monthly Burn × 3 (stable business) or × 6 (variable income/startup). Calculate burn rate as: (Total Outflow - One-time Expenses) / months. Include: rent, utilities, insurance, minimum debt payments, essential subscriptions. Exclude: variable income, one-time windfalls. Alert states: Green (>6mo), Yellow (3-6mo), Orange (1-3mo), Red (<1mo). Recalculate monthly.	{reserves,emergency-fund,burn-rate}	0.93	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
3d513e5b-a010-48b6-b585-b75d3b0a3c98	00000000-0000-0000-0000-000000000000	money-advisor	money	Bill Payment Triage Protocol	Priority triage for bills: P0 (immediate): penalties, interest-accruing, service disconnection risk. P1 (within 3 days): rent/mortgage, insurance, payroll. P2 (within 7 days): utilities, regular vendors. P3 (within 14 days): non-essential subscriptions, optional services. Auto-schedule P0/P1. Review P2/P3 weekly. Flag any bill overdue >7 days.	{bills,triage,priority}	0.91	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
af04848f-a90a-45a9-85d2-816d24f78956	00000000-0000-0000-0000-000000000000	money-advisor	money	Invoice Aging Brackets	Track invoices in aging brackets: Current (0-30 days), Aging (31-60), At Risk (61-90), Critical (90+). Healthy portfolio: >80% current, <10% aging, <5% at-risk, <2% critical. Escalation triggers: At-Risk → send reminder + call. Critical → formal demand + consider collections. Calculate DSO (Days Sales Outstanding) monthly. Target DSO: <45 days for services, <30 for products.	{invoices,aging,collections}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
f814540a-cb00-4698-931e-d4bf48924df9	00000000-0000-0000-0000-000000000000	money-advisor	money	Tax Quarterly Calendar	Key quarterly tax dates (US): Q1 estimated due Apr 15, Q2 Jun 15, Q3 Sep 15, Q4 Jan 15. Preparation timeline: T-30 days gather documents, T-14 calculate liability, T-7 review with advisor, T-3 submit payment. Set aside 25-30% of net income for tax obligations. Maintain separate tax reserve account. Alert 45 days before each deadline.	{taxes,quarterly,calendar}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
39e21bec-f2b1-4db5-9f07-e4b5814b187d	00000000-0000-0000-0000-000000000000	money-advisor	money	Debt Prioritization Strategy	Two proven methods: Avalanche (highest interest first — mathematically optimal, saves most money) vs Snowball (smallest balance first — psychologically motivating, builds momentum). Hybrid approach: pay minimums on all, then allocate extra to highest-interest debt unless a small debt can be eliminated within 2 months (snowball win). Never pay only minimums. Target: reduce total debt by 10% annually.	{debt,avalanche,snowball}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
c0ab9b2c-4df5-44c1-bc08-124ccd6a763f	00000000-0000-0000-0000-000000000000	money-advisor	money	Emergency Fund Sizing	Emergency fund tiers: Tier 1 ($1,000) immediate emergencies. Tier 2 (1 month expenses) short-term disruption. Tier 3 (3-6 months) job loss/major event. For entrepreneurs: extend to 6-12 months. Fund in order: Tier 1 first, then Tier 2, then Tier 3. Keep in high-yield savings, not invested. Replenish within 90 days of any withdrawal.	{emergency-fund,savings,tiers}	0.91	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
74ec32ac-8de6-4707-8e21-36fd183efeba	00000000-0000-0000-0000-000000000000	money-advisor	money	Spending Anomaly Detection	Flag spending anomalies using these rules: 1) Single transaction >2x average for category. 2) Category total >30% above 3-month average. 3) New vendor with charge >$100. 4) Duplicate charges (same amount, same vendor, within 48hrs). 5) Weekend/holiday charges from business vendors. 6) Round-number charges from unfamiliar sources. Severity: Low (informational), Medium (review needed), High (potential fraud).	{anomaly,fraud,monitoring}	0.92	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
5880a332-27aa-4cb9-9100-147f55b35147	00000000-0000-0000-0000-000000000000	money-advisor	money	Net Worth Tracking Cadence	Track net worth monthly. Components: Assets (cash + investments + property + receivables) minus Liabilities (debt + payables + obligations). Calculate month-over-month change and 12-month trend. Healthy indicators: positive trend, debt ratio decreasing, liquid assets growing. Warning signs: 3+ months of decline, debt ratio >60%, liquid assets below 1 month expenses.	{net-worth,tracking,monthly}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
b7b10dfd-3e48-4af2-98d1-0e5784903700	00000000-0000-0000-0000-000000000000	money-advisor	money	Financial Boundary Definitions	Define clear financial boundaries: Never lend more than you can afford to lose. Never co-sign without full risk awareness. Business expenses stay in business accounts. Personal emergency fund is untouchable for business use. Set spending limits per category and enforce. Any purchase >$500 requires 24-hour cooling period. Any commitment >$5,000 requires written analysis.	{boundaries,rules,discipline}	0.86	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
86980915-4268-4964-bde9-a93812d0e728	00000000-0000-0000-0000-000000000000	business-advisor	business	BANT Lead Scoring Framework	Score leads on four dimensions: Budget (can they afford it? 0-25pts), Authority (are they the decision maker? 0-25pts), Need (do they have a genuine problem you solve? 0-25pts), Timeline (when do they need a solution? 0-25pts). Hot lead: 75+. Warm: 50-74. Cold: <50. Re-score every 14 days. Leads scoring <30 after 30 days should be archived. Prioritize outreach by score descending.	{leads,scoring,BANT}	0.91	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
7601fdea-0ce6-49cf-8b2e-ce0319c03987	00000000-0000-0000-0000-000000000000	business-advisor	business	Pipeline Velocity Benchmarks	Pipeline Velocity = (Number of Deals × Average Deal Size × Win Rate) / Average Sales Cycle Length. Healthy benchmarks by stage: Qualification→Discovery: <7 days. Discovery→Proposal: <14 days. Proposal→Negotiation: <10 days. Negotiation→Close: <7 days. Total cycle target: <45 days for SMB, <90 for enterprise. Flag any deal stuck in a stage >2x the benchmark.	{pipeline,velocity,benchmarks}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
82ad3e8b-bcc7-414e-9cd1-a0af5540b279	00000000-0000-0000-0000-000000000000	business-advisor	business	Customer Health Score Methodology	Composite health score (0-100): Usage frequency (0-20), Feature adoption breadth (0-15), Support ticket trend (0-15, inverse), Payment timeliness (0-15), Engagement recency (0-15), NPS/satisfaction (0-10), Expansion signals (0-10). Healthy: 70+. At-risk: 40-69. Churning: <40. Calculate weekly. Alert on any 15+ point drop in 30 days.	{customer-health,scoring,retention}	0.92	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
3409854b-1558-40c2-913c-bf30c4964643	00000000-0000-0000-0000-000000000000	business-advisor	business	Deal Stage Exit Criteria	Each deal stage needs clear exit criteria before advancing: Qualification: confirmed budget range + identified pain. Discovery: documented requirements + stakeholder map. Proposal: proposal sent + pricing discussed. Negotiation: terms agreed + legal review started. Closing: contract signed + payment terms set. Never advance a deal without meeting ALL exit criteria. Flag deals that skip stages.	{deals,stages,criteria}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
136936e7-9c12-492d-bf81-7f53b64b9575	00000000-0000-0000-0000-000000000000	business-advisor	business	Follow-Up Cadence Matrix	Optimal follow-up cadence by lead temperature: Hot leads: Day 0 (immediate), Day 1, Day 3, Day 7, Day 14. Warm leads: Day 1, Day 4, Day 10, Day 21. Cold leads: Day 3, Day 10, Day 30. Post-sale: Day 1 (thank you), Day 7 (onboarding check), Day 30 (satisfaction), Day 90 (expansion). Never go more than 21 days without touching a hot lead. Mix channels: email, call, LinkedIn.	{follow-up,cadence,outreach}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
a1ba09e1-a001-4fff-b11b-f161ae36c287	00000000-0000-0000-0000-000000000000	business-advisor	business	Weighted Pipeline Forecasting	Forecast revenue by weighting each deal by its stage probability: Qualification: 10%, Discovery: 25%, Proposal: 50%, Negotiation: 75%, Verbal Close: 90%, Closed Won: 100%. Monthly forecast = sum of (deal_value × stage_probability). Track forecast accuracy monthly. Adjust stage probabilities quarterly based on actual conversion data. Flag when forecast variance exceeds ±20%.	{forecasting,pipeline,revenue}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
f254346b-f981-47c8-8db5-4218f487b099	00000000-0000-0000-0000-000000000000	business-advisor	business	Churn Early Warning Signals	Top churn predictors (in order of severity): 1) Login frequency drops >50% month-over-month. 2) Support tickets increase 3x in 30 days. 3) Key user leaves the organization. 4) Payment fails or is delayed. 5) Feature usage narrows to <20% of available features. 6) No response to last 3 communications. 7) Competitor mentioned in support tickets. Trigger automated retention workflow at 2+ signals.	{churn,early-warning,retention}	0.93	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
4a886dcd-0326-45d1-a796-f9c74a5df9ec	00000000-0000-0000-0000-000000000000	business-advisor	business	Proposal-to-Close Conversion	Healthy proposal-to-close rate: 25-40% for new business, 50-70% for existing customers. Track by: proposal source, deal size tier, industry vertical. Improve conversion: include ROI calculator, add social proof, offer implementation timeline, provide risk mitigation. Follow up within 2 hours of proposal view. If no response in 48 hours, call directly. Analyze lost proposals quarterly for pattern detection.	{proposals,conversion,closing}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
b09b35e2-3e3c-48c6-b910-31defec42e42	00000000-0000-0000-0000-000000000000	business-advisor	business	Competitive Displacement Playbook	When competing against an incumbent: 1) Identify switching costs (financial, operational, emotional). 2) Quantify gap between current solution and needs. 3) Offer migration support/guarantee. 4) Provide parallel-run option. 5) Lead with unique differentiators, not price. 6) Get champion inside the organization. 7) Create urgency through cost-of-inaction analysis. Never badmouth competitors — elevate your value instead.	{competition,displacement,strategy}	0.86	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
4a848cc9-9f9c-4d1a-afcc-2c794940189c	00000000-0000-0000-0000-000000000000	business-advisor	business	Account Expansion Triggers	Signals indicating expansion readiness: 1) Usage at >80% of current plan limits. 2) New department/team requesting access. 3) Positive NPS score (9-10). 4) Customer referral given. 5) Feature request for premium capabilities. 6) Contract renewal approaching (90 days out). 7) Budget cycle alignment. Expansion conversation framework: celebrate current success → identify new pain → present upgraded solution → quantify additional ROI.	{expansion,upsell,growth}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
5de1240f-fb57-4930-af3e-18161c0cb723	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Eisenhower Matrix for Task Triage	Categorize every task into four quadrants: Q1 Urgent+Important (do immediately), Q2 Important+Not Urgent (schedule — this is where growth lives), Q3 Urgent+Not Important (delegate or automate), Q4 Neither (eliminate). Target time allocation: Q1 <20%, Q2 >40%, Q3 <25%, Q4 <5%. Review and re-triage daily. Flag when Q1 exceeds 35% — indicates poor planning.	{triage,eisenhower,priority}	0.92	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
30d5e9ab-ce6c-42b8-8082-631fd8e69db4	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Errand Batching by Zone	Group errands by geographic proximity to minimize travel time. Create zones: Home Zone (walkable), Near Zone (<10 min drive), Far Zone (>10 min). Batch all Near Zone errands into one trip. Schedule Far Zone errands only when 3+ tasks align. Optimal errand day: Tuesday or Wednesday (less crowded). Time windows: grocery early AM, bank/post midday, returns late afternoon. Save 2-4 hours/week through batching.	{errands,batching,efficiency}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
8d41c9f4-f65c-46ed-9901-8a9c448a6dd6	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Booking Confirmation Checklist	For every booking/appointment: 1) Confirm date, time, location. 2) Note cancellation policy and deadline. 3) List required documents/IDs. 4) Set transport time buffer (+15 min). 5) Add calendar reminder at T-24h and T-2h. 6) Note parking/transit instructions. 7) Record confirmation number. 8) Prepare questions/agenda. Flag bookings without confirmation 48h before.	{bookings,checklist,preparation}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
e3a0e9e8-024d-4d76-b3db-210eb0c61b36	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Recurring Obligation Calendar	Track all recurring obligations by frequency: Weekly (trash, groceries, cleaning), Biweekly (lawn, car wash), Monthly (bills, subscriptions, maintenance checks), Quarterly (filter changes, pest control, financial review), Semi-annual (dental, car service), Annual (insurance renewal, tax prep, deep clean). Auto-generate reminders 3 days before due. Flag overdue items daily.	{recurring,obligations,calendar}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
30114497-96c7-4d30-b671-84d0d2079111	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Household Maintenance Schedules	Seasonal maintenance checklist: Spring (HVAC service, gutter clean, pest inspection), Summer (exterior paint check, AC filter, deck/patio maintenance), Fall (heating system check, chimney sweep, weatherstripping), Winter (pipe insulation, roof inspection, emergency kit refresh). Monthly: smoke detector test, water filter change, appliance clean. Track vendor contacts and service history per system.	{household,maintenance,seasonal}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
ba4b9e89-3190-471e-8d3f-67ddb595dbeb	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Meal Planning Framework	Weekly meal planning system: 1) Check pantry inventory. 2) Plan 5-6 dinners (leave 1-2 flex nights). 3) Prep ingredients on Sunday. 4) Batch-cook proteins and grains. 5) Generate grocery list from plan. 6) Estimate weekly food budget. Rotation system: new recipe 1x/week, family favorites 2x, quick meals 2x. Track per-meal cost. Flag when food spend exceeds budget by >20%.	{meals,planning,grocery}	0.85	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
6aa18bb3-cac5-43a9-9bf1-54778ae0477c	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Travel Planning Checklist	Travel prep timeline: T-60 days: book flights/hotels, check passport/visa. T-30: arrange pet/house care, notify bank, check health requirements. T-14: create packing list, arrange transport to/from airport. T-7: confirm all reservations, download offline maps, prepare travel documents folder. T-1: charge devices, set out-of-office, share itinerary with emergency contact. Track all bookings with confirmation numbers.	{travel,planning,checklist}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
b48428cf-b037-45f3-8687-d84714214628	00000000-0000-0000-0000-000000000000	concierge-advisor	concierge	Vendor Evaluation Criteria	Score service providers on: Reliability (shows up on time, completes work — 0-25), Quality (workmanship, attention to detail — 0-25), Communication (responsive, clear updates — 0-20), Value (fair pricing relative to quality — 0-20), Trustworthiness (licensed, insured, references — 0-10). Minimum score for retention: 60. Review after each service. Keep backup vendor for critical services (plumbing, electric, HVAC).	{vendors,evaluation,service-providers}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
543fce0c-0ca9-48a3-9ffc-daf0ffcd9453	00000000-0000-0000-0000-000000000000	family-advisor	family	Family Pulse Assessment	Weekly family pulse check across 5 dimensions: Connection (quality time together, 1-5), Communication (open dialogue, conflicts resolved, 1-5), Health (physical and mental wellness, 1-5), Growth (learning, development activities, 1-5), Joy (fun, laughter, celebrations, 1-5). Score weekly. Trend over time. Alert when any dimension drops below 3 for 2+ weeks. Monthly family meeting to review and adjust.	{family,pulse,assessment}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
81543ec2-4004-4be4-909a-75ac5d2be457	00000000-0000-0000-0000-000000000000	family-advisor	family	School Calendar Integration	Key school dates to track: term start/end, parent-teacher conferences, report card dates, school holidays, early dismissals, field trip dates, project due dates, extracurricular schedules, picture days, spirit weeks. Sync with family calendar 30 days ahead. Set reminders for action items (forms, payments, costumes). Flag scheduling conflicts with work/travel.	{school,calendar,children}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
dfa4374d-17f1-483b-8aa1-e035f5e21575	00000000-0000-0000-0000-000000000000	family-advisor	family	Age-Appropriate Responsibility Matrix	Chore assignments by age range: 3-5 (pick up toys, feed pets, make bed with help), 6-8 (set table, water plants, sort laundry), 9-11 (load dishwasher, vacuum, take out trash), 12-14 (cook simple meals, mow lawn, babysit briefly), 15+ (grocery shopping, car maintenance, manage own schedule). Rotate chores monthly. Track completion. Tie to allowance if applicable. Adjust for individual capability.	{children,responsibilities,chores}	0.85	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
d381bf4f-abc8-42e7-b3d4-21778ab6051c	00000000-0000-0000-0000-000000000000	family-advisor	family	Family Meeting Agenda Template	Weekly family meeting structure (30 min max): 1) Appreciations round (2 min each — what went well). 2) Calendar review (upcoming week). 3) Issue discussion (one topic, use talking stick). 4) Chore/responsibility check. 5) Fun planning (weekend activity, special event). 6) Closing ritual (family motto, group high-five). Rotate meeting leader. Keep minutes. Follow up on action items next week.	{meetings,family,communication}	0.86	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
a35e114b-7b37-465d-add4-8faf4e952e57	00000000-0000-0000-0000-000000000000	family-advisor	family	Milestone Tracking Categories	Track milestones across categories: Academic (grades, achievements, graduations), Health (checkups, vaccinations, growth), Social (friendships, events, activities), Skills (sports, music, coding, cooking), Emotional (confidence markers, coping skills), Financial literacy (first savings, budgeting lessons). Document with photos/notes. Celebrate milestones visibly. Review progress semi-annually.	{milestones,tracking,development}	0.84	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
f8565cc4-973f-4640-b849-af801658fdf4	00000000-0000-0000-0000-000000000000	family-advisor	family	Medical Appointment Coordination	Annual medical calendar: Pediatrician (annual well-visit), Dentist (every 6 months), Eye doctor (annual or as needed), Specialists (as required). Track: vaccination schedule, growth measurements, allergy updates, medication changes. Pre-appointment: list concerns, update medication list, bring insurance card. Post-appointment: file records, schedule follow-ups, fill prescriptions. Keep emergency contacts and medical history accessible.	{medical,appointments,health}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
93496934-774d-4ce2-b5af-9da232e7bf98	00000000-0000-0000-0000-000000000000	family-advisor	family	Extracurricular Balance Guidelines	Maximum activities per child: ages 4-7 (1-2 activities), 8-12 (2-3 activities), 13+ (2-4 activities). Balance across categories: physical (sport), creative (art/music), social (team/group), intellectual (STEM/chess). Ensure minimum 2 free afternoons per week. Watch for burnout signals: resistance, fatigue, declining grades, social withdrawal. Re-evaluate commitment each semester.	{extracurricular,balance,children}	0.85	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
f6a95a64-ec3c-436a-aa7c-028d42ae6d9f	00000000-0000-0000-0000-000000000000	family-advisor	family	Family Communication Preferences	Establish communication norms: Daily check-in time (e.g., dinner). Emergency contact chain (who to call first). Shared family calendar (digital). Group chat for logistics only. One-on-one time scheduled weekly per child. Screen-free zones/times defined. Conflict resolution protocol: cool down → state feelings → listen → find solution together. Review norms quarterly.	{communication,norms,family}	0.83	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
55a2d7b6-53eb-4462-8418-3fd78337d8c7	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Growth Loop Identification	Identify and map growth loops: Viral (user invites → new users → more invites), Content (create content → SEO traffic → more content), Paid (revenue → ad spend → new customers → revenue), Product (usage → data → better product → more usage). For each loop: measure cycle time, conversion at each step, and compounding rate. Focus on loops with <14 day cycle time and >10% compounding rate. Kill loops that don't compound.	{growth-loops,viral,compounding}	0.91	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
48c71cd0-1d5c-45c4-8840-89558eee61a8	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Experiment Design Template	Every growth experiment needs: Hypothesis (If we do X, then Y will improve by Z%). Primary metric (one measurable outcome). Kill criteria (stop if metric drops below threshold). Sample size (minimum for statistical significance). Duration (minimum 2 weeks, maximum 6 weeks). Control group (if applicable). Expected impact (conservative/moderate/optimistic). Document learnings regardless of outcome. Run max 3 experiments simultaneously.	{experiments,testing,methodology}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
0269a859-2352-42df-a252-2eb19b47843e	00000000-0000-0000-0000-000000000000	growth-advisor	growth	CAC/LTV Benchmarks	Healthy LTV:CAC ratio by stage: Pre-PMF: just track, don't optimize. Post-PMF: target 3:1 minimum. Scaling: target 5:1+. Calculate CAC = Total Sales+Marketing Cost / New Customers Acquired. LTV = Average Revenue Per User × Gross Margin × Average Lifespan. Payback period target: <12 months for SaaS, <6 months for e-commerce. Flag when CAC increases >20% quarter-over-quarter without corresponding LTV increase.	{CAC,LTV,unit-economics}	0.92	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
98fb1b94-1276-4c51-8695-5af2bf6d1564	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Pricing Strategy Frameworks	Three pricing approaches: Cost-plus (cost × markup — simple but leaves money on table), Value-based (price = perceived value — optimal but hard to measure), Competitive (market rate ± positioning — safe but commoditizing). Pricing experiments: test 3 price points simultaneously. Anchor high, offer tiers. Free tier → Pro → Enterprise. Annual discount: 15-20% vs monthly. Review pricing every 6 months. Never compete solely on price.	{pricing,strategy,revenue}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
89ec2cf6-eacb-4c4e-97a1-0ca4ea1ad7cb	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Market Sizing Methodology	Three approaches to market sizing: Top-down (TAM from industry reports → SAM by segment → SOM by realistic capture). Bottom-up (unit economics × addressable customers × penetration rate). Value-theory (problem cost × number of sufferers × willingness to pay). Use all three and triangulate. Be honest about assumptions. SOM should be <5% of SAM for year 1. Update annually with real data.	{market-sizing,TAM,strategy}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
f22e673d-b509-49fd-a2e6-d389db81843b	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Competitive Moat Assessment	Evaluate moat strength across 7 dimensions: Network effects (does value increase with users? 0-15), Switching costs (how painful to leave? 0-15), Data advantage (do you learn faster? 0-15), Brand (is there trust/recognition? 0-10), Scale economies (does cost decrease with volume? 0-15), Regulatory (are there barriers to entry? 0-10), Speed (can you iterate faster? 0-10). Score quarterly. Invest in dimensions scoring <5.	{moat,competitive,strategy}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
d808ef05-b918-42e6-ac81-061c7c27da76	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Channel Prioritization Matrix	Score each acquisition channel on: Volume potential (1-5), CAC efficiency (1-5), Time to results (1-5), Controllability (1-5), Scalability (1-5). Total score determines priority. Top channels by stage: Pre-PMF (direct outreach, communities, content). Growth (paid ads, SEO, partnerships). Scale (brand, programmatic, referrals). Test one new channel per quarter. Double down on channels with ICE score >3.5. Kill channels with CAC >2x target after 90 days.	{channels,acquisition,prioritization}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
e5566424-7179-478a-9a56-68f6e0aa6910	00000000-0000-0000-0000-000000000000	growth-advisor	growth	Growth Stage Indicators	Identify your current growth stage: Pre-PMF (retention <40% at day 30, pivot freely), PMF Found (retention >40%, focus on one channel), Growth (MoM >15%, hire and systematize), Scale (MoM 5-15%, efficiency and unit economics), Maturity (MoM <5%, diversify and defend). Each stage has different KPIs, team needs, and investment profiles. Never scale before PMF — it's the #1 startup killer. Validate PMF with retention data, not vanity metrics.	{stages,PMF,scaling}	0.91	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
0b77b87d-4967-4184-90c4-db31ae931145	00000000-0000-0000-0000-000000000000	sita-advisor	general	Cross-Domain Correlation Patterns	Monitor correlations across domains: Financial stress → family tension → business performance drop. Business pipeline surge → time scarcity → concierge overload. Health issue → everything suffers. When one domain drops, proactively check adjacent domains. Alert priority: cascading failures (2+ domains declining simultaneously) are critical. Single-domain issues are standard. Recommend cross-domain rebalancing when correlation detected.	{cross-domain,correlation,holistic}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
77b6c50c-e406-4409-aa1b-9310ed40dc70	00000000-0000-0000-0000-000000000000	sita-advisor	general	Daily Briefing Structure	Morning briefing structure: 1) Priority alert (anything urgent from overnight). 2) Today's calendar + prep needed. 3) Top 3 tasks across all domains. 4) Financial pulse (cash position, pending bills). 5) Business metrics snapshot (leads, pipeline, revenue). 6) Family/concierge items needing attention. 7) Weather/travel impact. Keep briefing under 2 minutes read time. Highlight only actionable items.	{briefing,daily,structure}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
f55d415e-95f6-4016-a6f3-c5882e1ecd4e	00000000-0000-0000-0000-000000000000	sita-advisor	general	Priority Scoring Across Domains	Universal priority scoring: Impact (how much does this matter? 1-5) × Urgency (how time-sensitive? 1-5) × Effort (inverse — lower effort = higher score, 1-5) = Priority Score. Max: 125. Critical: >80. High: 50-79. Medium: 25-49. Low: <25. Apply across all domains for unified prioritization. Review and re-score weekly. Never have more than 3 critical items simultaneously — if you do, something needs delegation or rescheduling.	{priority,scoring,unified}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
4a7d3232-0ede-451c-9560-15a535a9e06a	00000000-0000-0000-0000-000000000000	sita-advisor	general	Escalation Criteria	Escalate to human attention when: 1) Confidence score <0.6 on any recommendation. 2) Financial impact >$1,000. 3) Irreversible action required. 4) Legal/compliance implications. 5) Affects multiple family members. 6) Contradicts previous user preferences. 7) Two advisors disagree on approach. 8) Novel situation with no historical pattern. Always err on the side of escalating. False alarms are better than missed critical issues.	{escalation,safety,criteria}	0.93	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
245fcd92-841c-4f94-9e14-6872a1435044	00000000-0000-0000-0000-000000000000	sita-advisor	general	Domain Handoff Protocols	When a task spans multiple domains, use handoff protocol: 1) Identify primary owner domain. 2) Create shared context packet (relevant data from both domains). 3) Primary advisor leads, secondary advises. 4) Document decisions in both domain logs. 5) Single execution point — never duplicate actions. Examples: business expense → money domain handles, but business advisor provides context. Family travel → concierge leads, money advisor provides budget check.	{handoff,cross-domain,coordination}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
8b7cdb15-b71f-449b-a3a1-b7370001aad5	00000000-0000-0000-0000-000000000000	sita-advisor	general	Executive Summary Format	Every report/analysis follows this format: 1) Bottom line (one sentence — what do they need to know?). 2) Key metrics (3-5 numbers that tell the story). 3) Changes since last period (what moved?). 4) Recommendations (max 3, prioritized). 5) Risks and watchpoints. Keep summaries under 200 words. Use visual indicators: ↑↓→ for trends, 🟢🟡🔴 for status. Link to details for those who want to drill down.	{reporting,summary,format}	0.86	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
135519d0-1a20-4e32-ba63-3c9a4e0f5f24	00000000-0000-0000-0000-000000000000	strategy-advisor	strategy	MECE Framework Application	Apply MECE (Mutually Exclusive, Collectively Exhaustive) to every strategic analysis: 1) Define the problem statement clearly. 2) Break into non-overlapping categories that cover 100% of the space. 3) Test: does every possible scenario fit into exactly one category? 4) Analyze each category independently. 5) Synthesize findings. Common MECE structures: by customer segment, by geography, by product line, by time horizon, by function. If categories overlap, restructure.	{MECE,framework,analysis}	0.90	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
5986fcd2-2028-4f0d-b3fb-21d5b98e376c	00000000-0000-0000-0000-000000000000	strategy-advisor	strategy	Scenario Modeling Template	Build three scenarios for every strategic decision: Base Case (most likely, 60% probability — continue current trajectory with moderate improvements). Upside Case (optimistic, 20% — what if key assumptions break positive). Downside Case (pessimistic, 20% — what if key risks materialize). For each: define assumptions, project financials 12 months out, identify trigger indicators, prepare response plan. Review scenario triggers monthly.	{scenarios,modeling,planning}	0.89	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
c699ba8b-8c8c-4a4e-82e5-ca38cb01549f	00000000-0000-0000-0000-000000000000	strategy-advisor	strategy	Strategic Drift Detection	Monitor for strategic drift: 1) Compare current activities against stated strategy quarterly. 2) Flag activities consuming >10% of resources that don't map to strategic priorities. 3) Track priority changes over time — >3 priority shifts per quarter indicates drift. 4) Check if daily decisions align with annual goals. 5) Survey team: "Can you name our top 3 priorities?" — if <70% can, strategy isn't clear. Course-correct within 30 days of detecting drift.	{drift,strategy,alignment}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
3d092308-96f0-4484-84a1-4d2b4af76b75	00000000-0000-0000-0000-000000000000	strategy-advisor	strategy	Resource Allocation Matrix	Allocate resources using the 70/20/10 framework: 70% to core business (proven, reliable revenue), 20% to adjacent opportunities (related markets, extensions), 10% to transformational bets (new markets, innovation). Within each tier, rank by expected ROI. Review allocation quarterly. Red flags: >85% in core (underinvesting in future), >30% in transformational (too risky), <5% in adjacent (missing easy wins).	{resources,allocation,investment}	0.87	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
3580fbd7-e855-4325-a6af-e394b8ff75e3	00000000-0000-0000-0000-000000000000	strategy-advisor	strategy	Decision Journal Format	For every significant decision, record: 1) Date and decision context. 2) Options considered (minimum 3). 3) Key assumptions. 4) Expected outcome and timeline. 5) Confidence level (1-10). 6) What would change your mind (pre-mortem). 7) Actual outcome (filled in later). Review journal quarterly. Look for patterns: systematic biases, overconfidence, recurring mistakes. This builds decision-making muscle over time.	{decisions,journal,learning}	0.86	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
70089cab-0ccf-42cd-ba0a-93bc7b406fad	00000000-0000-0000-0000-000000000000	strategy-advisor	strategy	Opportunity Cost Calculation	For every "yes," calculate the implicit "no": 1) List the top 3 things you can't do if you commit to this. 2) Estimate the value of each foregone option. 3) Compare: is this opportunity worth more than the sum of what you're giving up? 4) Consider reversibility — irreversible decisions need higher thresholds. 5) Time-box commitments: "We'll do this for 90 days, then reassess." This prevents indefinite commitment to mediocre initiatives.	{opportunity-cost,decisions,tradeoffs}	0.88	system	active	2026-04-13 12:22:59.631801+00	2026-04-13 12:22:59.631801+00
\.


--
-- Data for Name: advisor_memories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_memories (id, user_id, advisor_id, domain, memory_type, content, importance, context_ref, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: advisor_profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.advisor_profiles (id, user_id, advisor_id, domain, display_name, avatar_url, personality_traits, visual_style, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_inference_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_inference_receipts (id, user_id, model, capability_id, prompt_family, input_tokens, output_tokens, latency_ms, status, created_at, provider, cost_estimate_cents, route_reason, verification_outcome) FROM stdin;
\.


--
-- Data for Name: ai_workforce_approval_queue; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_approval_queue (id, recommendation_id, title, summary, priority, status, reviewer_user_id, reviewer_comments, evidence_links, cost_implications, launch_implications, remediation_binding_id, decision_at, escalated, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_budget_classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_budget_classes (id, class_key, display_name, priority_order, max_tokens_per_call, max_cost_cents_per_call, max_calls_per_hour, allowed_models, description, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_cached_outputs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_cached_outputs (id, cache_key, role_key, task_key, output, model_used, tokens_used, cost_cents, expires_at, hit_count, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_invocations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_invocations (id, role_key, task_key, scope_type, scope_ref, scope_payload, budget_posture, mode, status, model_used, tokens_in, tokens_out, cost_cents, duration_ms, error_message, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_launch_honesty; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_launch_honesty (id, role_key, launch_claim, actual_status, honesty_score, evidence, last_audit_at, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_outputs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_outputs (id, invocation_id, output_type, content, quality_score, flagged, flag_reason, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_recommendation_scores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_recommendation_scores (id, recommendation_id, score_overall, score_accuracy, score_usefulness, score_actionability, score_evidence_quality, score_cost_efficiency, score_launch_honesty_alignment, score_execution_success_likelihood, score_realized_outcome_value, review_method, reviewed_by_user_id, notes, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_recommendations (id, invocation_id, role_key, task_key, domain, title, summary, details, evidence, severity, confidence, status, lifecycle_status, approval_decision_at, approved_by_user_id, rejected_by_user_id, deferred_reason, execution_required, execution_priority, flagship_loop_key, customer_journey_impact_key, launch_blocker_impact_class, outcome_verification_required, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_role_health; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_role_health (id, role_key, health_status, total_invocations, successful_invocations, failed_invocations, avg_latency_ms, avg_cost_cents, avg_quality_score, last_invocation_at, last_error, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_role_task_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_role_task_permissions (id, role_key, task_key, permission_level, max_autonomy, requires_approval, budget_class_key, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_roles (id, role_key, display_name, council, mission, special_ability, max_autonomy_level, allowed_tools, forbidden_tools, memory_scope, trigger_conditions, escalation_targets, kpis, cost_budget_cents, maturity, status, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ai_workforce_task_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ai_workforce_task_types (id, task_key, display_name, description, council, input_schema, output_schema, default_model, max_tokens, temperature, requires_approval, status, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: api_gateway_routes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.api_gateway_routes (id, route_pattern, method, plane, required_token_class, required_permission, rate_limit_per_minute, description, enabled, created_at, updated_at) FROM stdin;
b79941d1-cc27-4de6-8b00-0f7eb2ab38a3	/admin/users	POST	control	admin	users.view	30	User management operations	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
3584ebdc-3c76-409e-a14c-563eced4e14a	/admin/users/suspend	POST	control	admin	users.suspend	10	Suspend user accounts	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
523cce4c-5012-4ecd-8914-1e1b4d127bfb	/admin/devices	POST	control	admin	devices.view	30	Device management operations	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
7d1ba1e4-ae9e-4a32-8202-40db76ed1e36	/admin/devices/revoke	POST	control	admin	devices.revoke	10	Revoke devices globally	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
8952c9ff-f529-4064-948c-756f6b83dcbd	/admin/storage	POST	control	admin	storage.view	30	Storage operations	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
3dad8017-d12c-41ab-ac7d-ccc0910b6bdc	/admin/storage/repair	POST	control	admin	storage.repair	5	Run storage repairs	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
1ce350eb-a60d-466d-889a-39436eb5b667	/admin/policy	POST	control	admin	policy.edit	10	Policy management	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
1767aa65-e061-4a52-bec9-6e737a06cc74	/admin/flags	POST	control	admin	flags.rollout	10	Feature flag rollout	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
78034644-4e85-4d12-b42f-4bd8d7c19859	/admin/audit	GET	control	admin	audit.view	60	Audit log queries	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
0bb6ece0-8d7b-4479-a349-cabb90e30caa	/support/user-lookup	POST	control	admin	support.view	30	Support user lookup	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
39007c2a-239c-47e0-89b8-67d499c42c7e	/support/safe-repair	POST	control	admin	support.repair	5	Support safe repair actions	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
1a563380-eeb8-4f89-96cb-cd36df3b16cd	/api/sync	POST	shared-core	user	\N	120	User sync operations	t	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, user_id, title, provider, appointment_date, status, prep_items, docs_needed, transport_time, category, owner, location, who, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: approval_decisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.approval_decisions (id, request_id, request_type, decision, actor_user_id, rationale, conditions, decided_at, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: biometric_credentials; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.biometric_credentials (id, user_id, credential_id, credential_type, public_key, device_id, display_name, sign_count, last_used_at, status, created_at) FROM stdin;
\.


--
-- Data for Name: boardroom_decision_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boardroom_decision_receipts (id, user_id, session_id, item_id, recommendation_id, approved_motion, rationale_summary, evidence_snapshot, simulation_snapshot, approval_conditions, status, expected_outcome, follow_up_review_date, linked_execution_items, proof_trail, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boardroom_evidence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boardroom_evidence (id, user_id, item_id, source_type, source_name, content, confidence, freshness, last_updated, lineage_chain, proof_receipt_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boardroom_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boardroom_items (id, user_id, session_id, title, description, domain, severity, source_signals, escalation_reason, advisor_summaries, recommendation_state, simulation_state, confidence_state, evidence_refs, freshness_state, blocking_conditions, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boardroom_recommendations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boardroom_recommendations (id, user_id, item_id, session_id, summary, rationale, evidence_basis, confidence_score, scenario_basis, domain_impacts, urgency, reversibility, conditions_for_approval, next_best_alternative, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boardroom_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.boardroom_sessions (id, user_id, session_type, scope, status, opened_at, closed_at, current_issue_id, participating_advisors, session_mode, decision_receipt_ids, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_health_scores; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_health_scores (id, user_id, dimension, score, previous_score, trend, contributing_signals, biggest_drag, biggest_mover, improvement_opportunity, scored_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: business_onboarding; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_onboarding (id, user_id, onboarding_state, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_events (id, user_id, title, event_date, start_time, end_time, domain, event_type, location, priority, notes, source, source_id, color, recurring, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: client_capability_matrix; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.client_capability_matrix (id, client_type, display_name, platform, min_version, current_version, supported_features, unsupported_features, capabilities, status, created_at, updated_at) FROM stdin;
cc1fc486-5f60-443c-97a8-393ef5ca82b2	desktop-macos	SITA OS Desktop (macOS)	macos	1.0.0	1.2.0	{sync,storage,offline,notifications,device-trust,file-preview,local-encryption}	{push-native}	{"offline_capable": true, "concurrent_syncs": 8, "max_file_size_mb": 10240}	active	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
11b43e07-dc5d-4d45-b824-080385e36d51	desktop-windows	SITA OS Desktop (Windows)	windows	1.0.0	1.1.0	{sync,storage,offline,notifications,device-trust,file-preview}	{push-native,local-encryption}	{"offline_capable": true, "concurrent_syncs": 8, "max_file_size_mb": 10240}	active	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
b79cee65-41bf-4dd1-a839-657792f9802b	mobile-ios	SITA OS Mobile (iOS)	ios	1.0.0	1.0.5	{sync,storage,notifications,push-native,device-trust}	{offline,file-preview,local-encryption}	{"offline_capable": false, "concurrent_syncs": 4, "max_file_size_mb": 2048}	active	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
9024b4dc-97c4-4d1f-bdee-87c39b6c5ff7	mobile-android	SITA OS Mobile (Android)	android	1.0.0	1.0.3	{sync,storage,notifications,push-native,device-trust}	{offline,file-preview,local-encryption}	{"offline_capable": false, "concurrent_syncs": 4, "max_file_size_mb": 2048}	active	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
f93cef0f-a713-4604-8ca7-8317a84f2d4e	web-app	SITA OS Web	web	1.0.0	1.3.0	{sync,storage,notifications,file-preview}	{offline,push-native,device-trust,local-encryption}	{"offline_capable": false, "concurrent_syncs": 6, "max_file_size_mb": 5120}	active	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
1044a5d7-dff0-4582-9d0f-05cc0d4dd440	admin-console	Admin Console	web	1.0.0	1.3.0	{admin-ops,audit-view,support-tools,policy-management,monitoring}	{sync,storage,offline}	{"offline_capable": false, "concurrent_syncs": 0, "max_file_size_mb": 0}	active	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
\.


--
-- Data for Name: cloud_abuse_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_abuse_events (id, user_id, event_type, severity, description, pattern_data, device_id, ip_address, action_taken, resolved, resolved_at, resolved_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_account_closure_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_account_closure_requests (id, user_id, reason, stage, export_completed, export_job_id, cancellation_deadline, purge_completed_at, secrets_destroyed, tombstone_finalized, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_activity_journal; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_activity_journal (id, user_id, event_type, object_id, object_type, object_name, device_id, device_name, details, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_admin_role_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_admin_role_assignments (id, user_id, role_id, assigned_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_admin_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_admin_roles (id, role_key, display_name, description, permissions, created_at, updated_at) FROM stdin;
1e5f53ff-783e-447c-a7b1-48f25984677a	super_admin	Super Admin	Full platform access	["*"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
5aa7cf06-c323-47a7-aac6-9802448acb5e	support_admin	Support Admin	User troubleshooting and safe repairs	["view_users", "view_devices", "run_diagnostics", "safe_repair"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
3bdd078e-8d24-4195-b636-c907b5f55aec	storage_admin	Storage Admin	Storage backend and quota management	["view_storage", "manage_quotas", "run_reconciliation", "manage_providers"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
d1c7d29f-1140-4809-aa21-c2edf7aabbdf	security_admin	Security Admin	Security, abuse detection, compliance	["view_audit", "manage_abuse", "manage_compliance", "revoke_devices"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
b92f7217-f4c3-4758-bcc2-2350ac83ae93	billing_admin	Billing Admin	Plans, quotas, cost visibility	["view_plans", "manage_plans", "view_costs", "quota_override"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
e8529d5f-7659-42f8-89fe-1018b7e067c8	auditor	Read-Only Auditor	View-only access to all admin data	["view_all"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
452ffc02-a710-493e-9ef3-20a2bcf082ba	tenant_admin	Tenant Admin	Tenant/org management	["view_tenants", "manage_tenants", "manage_memberships"]	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
22b0f133-2799-42e2-b2ba-500b14b7de1a	super-admin	Super Admin	Full platform access with all capabilities	{"all": true}	2026-04-15 07:14:43.728197+00	2026-04-15 07:14:43.728197+00
301eaa3e-d8bd-486b-93e2-03f15f5d4bf4	support-admin	Support Admin	User troubleshooting, device/session viewer, diagnostic bundles	{"view_users": true, "view_devices": true, "view_sessions": true, "run_diagnostics": true}	2026-04-15 07:14:43.728197+00	2026-04-15 07:14:43.728197+00
9a64b412-bcf2-4fcb-9d03-1f316746bd3b	storage-admin	Storage Admin	Storage backends, tiering, quotas, repair jobs	{"run_repairs": true, "manage_quotas": true, "manage_storage": true}	2026-04-15 07:14:43.728197+00	2026-04-15 07:14:43.728197+00
e9e36547-0f05-43bc-a876-a57b778aee01	security-admin	Security Admin	Audit logs, abuse detection, compliance hooks, device trust	{"view_audit": true, "manage_abuse": true, "manage_compliance": true}	2026-04-15 07:14:43.728197+00	2026-04-15 07:14:43.728197+00
98928e0a-1e1a-4b0b-af2b-f8a39a662754	billing-admin	Billing Admin	Cost attribution, plan management, usage analytics	{"view_costs": true, "manage_plans": true}	2026-04-15 07:14:43.728197+00	2026-04-15 07:14:43.728197+00
23be5e31-db29-4782-a696-fe4e677d10ef	tenant-admin	Tenant Admin	Manage tenant accounts, memberships, and policies	{"view_users": true, "manage_tenants": true}	2026-04-15 07:14:43.728197+00	2026-04-15 07:14:43.728197+00
\.


--
-- Data for Name: cloud_archive_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_archive_jobs (id, user_id, object_id, object_type, direction, source_tier, target_tier, status, started_at, completed_at, error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_audit_events (id, actor_user_id, action, target_type, target_id, details, ip_address, severity, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_backup_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_backup_snapshots (id, snapshot_type, status, region, size_bytes, object_count, started_at, completed_at, restore_tested_at, retention_days, triggered_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_blobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_blobs (id, user_id, storage_key, size, checksum, compression, encryption_class, storage_backend, finalized, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_bootstrap_markers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_bootstrap_markers (id, user_id, device_id, marker_type, status, details, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_compliance_hooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_compliance_hooks (id, hook_type, target_type, target_id, status, reason, activated_by, activated_at, deactivated_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_conflicts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_conflicts (id, user_id, object_id, base_version, device_a, device_b, state, strategy, details, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_device_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_device_sessions (id, user_id, device_id, refresh_token_hash, push_token, last_ip, last_seen, revoked_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_devices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_devices (id, user_id, device_name, platform, client_version, trust_state, last_seen_at, ip_address, user_agent, is_current, requires_reauth, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_feature_flags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_feature_flags (id, flag_key, display_name, description, enabled, scope, conditions, created_at, updated_at) FROM stdin;
787f748d-5739-4ea3-af0b-e7f44a3d0acd	delta-sync	Delta Sync	Efficient delta-based sync instead of full re-scan	t	global	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
c8a9b3b9-fb75-4200-bce9-123c65d86010	e2ee-classes	E2EE Encryption Classes	End-to-end encryption for select namespaces	f	beta	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
a49a5d28-c8e1-4386-89df-3160f18a199d	previews	File Previews	Thumbnail and preview generation for files	t	global	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
b845e374-e439-4c37-aea8-0f3808a8789e	archive-tiering	Archive Tiering	Automatic hot/warm/cold storage tiering	f	internal	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
d6a2f719-b9fd-460e-8095-b097400bc7b7	sharing	File & Folder Sharing	Share files and folders with other users	f	beta	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
3459f09e-f12b-4dbf-90c1-16ee2ef27faa	app-cloud-apis	App Cloud APIs	Developer cloud sync SDK and app namespace APIs	f	internal	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
55c4a485-0011-456c-9512-28803a7ed626	nearby-sync	Nearby Sync	Local network file transfer between devices	f	beta	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
6772a51a-0b1c-44a5-9f0e-30107b1dee1e	new-conflict-engines	New Conflict Engines	Advanced conflict resolution strategies	f	internal	{}	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
\.


--
-- Data for Name: cloud_file_versions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_file_versions (id, user_id, file_id, version, blob_id, size, checksum, origin_device_id, restore_point, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_files; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_files (id, user_id, folder_id, name, blob_id, size, mime_type, checksum, version, deleted, last_opened_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_folders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_folders (id, user_id, parent_id, name, path_cache, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_import_export_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_import_export_jobs (id, user_id, job_type, source, destination, status, progress_pct, total_items, processed_items, error_message, download_url, expires_at, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_lifecycle_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_lifecycle_rules (id, user_id, rule_name, source_tier, target_tier, condition_type, condition_value, applies_to, enabled, last_run_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_maintenance_modes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_maintenance_modes (id, mode_key, display_name, description, active, activated_by, activated_at, deactivated_at, reason, created_at, updated_at) FROM stdin;
3f3575ea-d779-4328-a038-99bd3c1fd318	pause-uploads	Pause New Uploads	Temporarily prevent new file uploads platform-wide	f	\N	\N	\N		2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
d66f1bbf-3ee1-4749-8dd1-05de4fc82471	read-only	Read-Only Mode	Allow reads but prevent all writes	f	\N	\N	\N		2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
bba6b271-604d-492a-967f-9def11fda6fa	rebuild-indexes	Rebuild Indexes	Trigger full search index rebuild	f	\N	\N	\N		2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
93792b58-684b-4adb-92c9-4c7ef234e7e9	throttle-previews	Throttle Preview Gen	Reduce preview generation throughput	f	\N	\N	\N		2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
3740b6d1-83c5-47db-a569-96292d30f8bb	pause-sync	Pause Sync Fanout	Temporarily halt sync propagation to devices	f	\N	\N	\N		2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
961e52a3-e02f-4583-8f8f-051f193ac52d	disable-enrollment	Disable Device Enrollment	Prevent new device registrations	f	\N	\N	\N		2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
34789ef4-0089-4de8-9956-6a79f3da4afa	pause-sync-fanout	Pause Sync Fanout	Stop pushing sync updates to devices	f	\N	\N	\N		2026-04-15 07:15:00.007747+00	2026-04-15 07:15:00.007747+00
\.


--
-- Data for Name: cloud_metrics_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_metrics_snapshots (id, metric_key, metric_value, dimensions, snapshot_at, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_namespace_registry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_namespace_registry (id, namespace, display_name, owner_type, owner_id, schema_version, data_class, retention_class, encryption_class, conflict_strategy, searchable, exportable, status, created_at, updated_at) FROM stdin;
cc4fe764-4e2f-46c2-8bc1-34bd345e8cd3	files.documents	Documents	system	\N	1	standard	standard	encrypted-at-rest	last-write-wins	t	t	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
ff8971ad-0528-4eb0-8d3c-2245ac4d14a9	files.photos	Photos & Media	system	\N	1	standard	extended	standard	keep-both	t	t	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
561a3a24-51cd-4da1-a873-d38c1c01d08e	settings.preferences	Settings & Preferences	system	\N	1	standard	default	e2ee	last-write-wins	f	t	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
09dd62f3-1564-47b8-a5f9-eeea24e718ab	session.continuity	Session Continuity	system	\N	1	standard	ephemeral	device-bound	device-priority	f	f	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
490275f6-9343-4356-9edd-b03cdc05f071	vault.credentials	Secure Vault	system	\N	1	standard	permanent	e2ee	manual-resolve	f	f	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
\.


--
-- Data for Name: cloud_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_plans (id, plan_key, display_name, storage_limit_bytes, max_devices, max_file_size_bytes, features, price_cents, is_active, created_at, updated_at) FROM stdin;
7964c282-a623-47a8-8e94-c1ff954fc391	free	Free	5368709120	3	104857600	["5GB storage", "3 devices", "100MB file limit"]	0	t	2026-04-15 01:12:10.910933+00	2026-04-15 01:12:10.910933+00
b6ae5f1d-bbdf-4092-b929-3b7f462959ce	pro	Pro	107374182400	10	1073741824	["100GB storage", "10 devices", "1GB file limit", "Priority sync", "Version history"]	999	t	2026-04-15 01:12:10.910933+00	2026-04-15 01:12:10.910933+00
e0cf9f65-c559-4f1b-b2eb-9814c187c3ff	enterprise	Enterprise	1099511627776	50	5368709120	["1TB storage", "50 devices", "5GB file limit", "Priority sync", "Version history", "Admin tools", "SSO"]	4999	t	2026-04-15 01:12:10.910933+00	2026-04-15 01:12:10.910933+00
\.


--
-- Data for Name: cloud_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_policies (id, policy_key, display_name, category, value_json, description, enforced, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_preview_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_preview_jobs (id, user_id, file_id, job_type, status, input_mime, output_key, output_mime, dimensions, error_message, attempts, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_reconciliation_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_reconciliation_runs (id, run_type, status, started_at, completed_at, orphaned_blobs, missing_blobs, size_mismatches, quota_drifts, broken_chains, stale_tombstones, repairs_applied, affected_users, details, triggered_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_search_index; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_search_index (id, user_id, object_id, object_type, name, path, mime_type, tags, content_snippet, metadata, indexed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_shared_workspaces; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_shared_workspaces (id, tenant_id, name, description, owner_user_id, visibility, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_shares; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_shares (id, owner_user_id, target_user_id, object_type, object_id, permission, expires_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_storage_providers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_storage_providers (id, provider_key, display_name, provider_type, endpoint, region, bucket_name, status, capabilities, config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_storage_tiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_storage_tiers (id, tier_key, display_name, provider_id, cost_per_gb_cents, retrieval_latency_ms, min_retention_days, tier_order, status, created_at, updated_at) FROM stdin;
5bd054f0-d7a1-4e5e-90d3-bb15dfc385a6	hot	Hot (Active)	\N	2.3	5	0	1	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
1717bfb8-130d-4f8f-bbe0-faf802f37977	warm	Warm (Infrequent)	\N	1.2	100	0	2	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
34e944ba-bfd1-4d65-a854-858696f5e0f5	cold	Cold (Archive)	\N	0.4	3600000	0	3	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
a23c5143-2a4f-44bb-9573-3ede3cd6de3d	glacier	Glacier (Deep Archive)	\N	0.1	43200000	0	4	active	2026-04-15 07:10:37.961126+00	2026-04-15 07:10:37.961126+00
\.


--
-- Data for Name: cloud_storage_usage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_storage_usage (id, user_id, used_bytes, quota_bytes, file_count, largest_file_bytes, orphaned_blobs, failed_uploads, failed_downloads, last_reconciled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_support_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_support_sessions (id, support_user_id, target_user_id, reason, status, actions_taken, redacted_fields, started_at, ended_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_sync_changes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_sync_changes (id, user_id, object_id, change_type, from_version, to_version, origin_device_id, payload, created_at) FROM stdin;
\.


--
-- Data for Name: cloud_sync_checkpoints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_sync_checkpoints (id, user_id, device_id, last_change_id, namespace, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_sync_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_sync_jobs (id, job_type, target_user_id, status, progress_pct, started_at, completed_at, result_summary, error_message, triggered_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_sync_objects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_sync_objects (id, user_id, namespace, type, version, origin_device_id, deleted, metadata_json, blob_ref, content_hash, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_tenant_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_tenant_memberships (id, tenant_id, user_id, role, invited_by, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_tenant_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_tenant_plans (id, tenant_id, plan_id, storage_limit_bytes, max_members, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_tenant_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_tenant_policies (id, tenant_id, policy_key, display_name, value_json, enforced, category, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_tenant_quotas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_tenant_quotas (id, tenant_id, used_bytes, quota_bytes, file_count, last_reconciled_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_tenants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_tenants (id, name, slug, type, region, residency, status, owner_user_id, settings, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_trash; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_trash (id, user_id, object_type, object_id, original_name, original_path, size, deleted_at, purge_after, deleted_by_device_id) FROM stdin;
\.


--
-- Data for Name: cloud_user_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_user_plans (id, user_id, plan_id, status, trial_ends_at, bonus_storage_bytes, overage_allowed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: cloud_worker_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cloud_worker_jobs (id, job_type, status, priority, payload, result, error_message, attempts, max_attempts, locked_by, locked_at, scheduled_at, started_at, completed_at, dead_letter, idempotency_key, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: command_memory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.command_memory (id, user_id, command_id, intent, context_json, risk, outcome, user_preferences_json, duration_ms, learned_at, pattern_tags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: command_routing_decisions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.command_routing_decisions (id, user_id, command_id, route_layers, approval_flow, guarantee_checks_json, rationale, decided_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: command_steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.command_steps (id, command_id, step_index, action, target, status, started_at, completed_at, result, error_message, retry_count, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: communication_metrics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.communication_metrics (id, metric_type, value, metadata, user_id, device_id, created_at) FROM stdin;
\.


--
-- Data for Name: concierge_automations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.concierge_automations (id, user_id, title, trigger_event, conditions, trust_level, status, safety_boundary, last_run, recent_runs_count, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: concierge_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.concierge_documents (id, user_id, name, doc_type, sensitivity, linked_context, expiry_date, file_path, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: concierge_errands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.concierge_errands (id, user_id, title, location, estimated_minutes, priority, status, bundle_id, combinable, due_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: concierge_recurring_obligations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.concierge_recurring_obligations (id, user_id, title, category, frequency, next_due, last_completed, status, effort, automatable, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: config_change_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.config_change_history (id, config_scope, config_key, previous_value, new_value, diff, actor_user_id, justification, status, rollback_of, approval_required, approved_by, approved_at, created_at) FROM stdin;
\.


--
-- Data for Name: connector_oauth_flows; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.connector_oauth_flows (id, user_id, provider, status, scopes, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: connector_sync_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.connector_sync_runs (id, user_id, connector, status, records_synced, started_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: connector_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.connector_tokens (id, user_id, connector_id, provider, token_type, encrypted_token_ref, scopes, issued_at, expires_at, last_refreshed_at, rotation_count, status, created_at) FROM stdin;
\.


--
-- Data for Name: context_graph_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.context_graph_snapshots (id, user_id, snapshot_type, context_data, active_signals, freshness_score, workspace_id, device_id, cognitive_load, active_mode, signal_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_automations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_automations (id, user_id, title, description, trigger_type, trigger_config, conditions, actions, delay_minutes, trust_gate, status, target_entity, runs, last_run_at, execution_log, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_communications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_communications (id, user_id, contact_id, company_id, opportunity_id, comm_type, direction, subject, content, channel, outcome, occurred_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_companies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_companies (id, user_id, name, domain, industry, size, annual_revenue, health_score, owner, phone, address, city, state, country, website, tags, custom_fields, notes, import_source, import_job_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_contact_company; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_contact_company (id, user_id, contact_id, company_id, role, is_primary, created_at) FROM stdin;
\.


--
-- Data for Name: crm_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_contacts (id, user_id, first_name, last_name, email, phone, title, lifecycle_stage, status, owner, source, health_score, avatar_url, address, city, state, country, website, tags, custom_fields, last_contacted_at, next_follow_up_at, import_source, import_job_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_import_jobs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_import_jobs (id, user_id, source, file_name, status, total_rows, created_count, updated_count, skipped_count, error_count, field_mappings, errors, stats, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_merge_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_merge_log (id, user_id, entity_type, winner_id, loser_id, merged_fields, merge_reason, created_at) FROM stdin;
\.


--
-- Data for Name: crm_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_notes (id, user_id, title, content, note_type, is_pinned, entity_type, entity_id, contact_id, company_id, opportunity_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_opportunities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_opportunities (id, user_id, title, value, stage, stage_id, probability, expected_close_date, source, owner, contact_id, company_id, status, lost_reason, won_at, lost_at, notes, tags, custom_fields, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_pipeline_stages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_pipeline_stages (id, user_id, name, display_order, color, is_won, is_lost, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_segments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_segments (id, user_id, name, description, filter_config, is_system, contact_count, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: crm_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_tags (id, user_id, name, color, created_at) FROM stdin;
\.


--
-- Data for Name: crm_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.crm_tasks (id, user_id, title, description, status, priority, due_date, completed_at, contact_id, company_id, opportunity_id, task_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: device_attestations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_attestations (id, device_id, attestation_type, status, evidence, key_fingerprint, verified_by, verified_at, expires_at, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: device_mesh_peers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_mesh_peers (id, user_id, device_name, device_type, role, capabilities, trust_score, proximity_status, last_handshake, mesh_group, is_online, platform, os_version, battery_level, network_type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: device_ownership; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.device_ownership (id, device_id, owner_user_id, device_name, device_type, platform, trust_level, permissions, capabilities, last_seen_at, sync_enabled, selective_sync_config, revoked, revoked_at, revoked_by, revoke_scope, environment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: domain_ownership_registry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.domain_ownership_registry (id, domain_key, display_name, owning_service, plane, team, description, dependencies, api_surface, status, created_at, updated_at) FROM stdin;
b177d37a-2d28-489c-a3c6-b08790583b75	identity	Identity & Auth	auth-service	shared-core	identity	User identity, login, session issuance, MFA	[]	{"public": ["auth.login", "auth.signup", "auth.logout"], "internal": ["session.validate", "mfa.verify"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
ddfac133-8794-443b-b274-30d928042045	sessions	Session Management	auth-service	shared-core	identity	Session lifecycle, token refresh, revocation	["identity"]	{"public": ["session.refresh"], "internal": ["session.create", "session.revoke"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
3cb2e56d-d20f-4dff-bf5f-87990a20b170	devices	Device Registry	device-service	shared-core	platform	Device enrollment, trust state, revocation	["identity"]	{"public": ["device.register", "device.list", "device.revoke"], "internal": ["device.trust.evaluate"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
c0df986b-17cd-4315-93b9-a75c4bea65e5	storage	Storage & Blobs	storage-service	product	storage	Blob storage, metadata linking, file lifecycle	["identity", "quotas"]	{"public": ["file.upload", "file.download", "file.delete"], "internal": ["blob.store", "blob.verify", "metadata.link"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
f5129fcd-7b84-40de-8c96-eff02e4530e4	sync	Sync Engine	sync-service	product	sync	Checkpoint/change feed, conflict resolution	["storage", "devices"]	{"public": ["sync.start", "sync.status", "sync.pause"], "internal": ["checkpoint.create", "change.apply"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
e192a743-5e26-4301-ae05-2eccffce64b9	quotas	Quota & Accounting	quota-service	control	platform	Storage limits, usage accounting, plan enforcement	["identity"]	{"public": ["usage.summary"], "internal": ["quota.check", "quota.adjust"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
060f0982-a067-45ee-b2ac-15e6d18c4865	policy	Policy Engine	policy-service	control	governance	Effective policy evaluation, tenant policies	["identity", "quotas"]	{"public": ["settings.get", "settings.update"], "internal": ["policy.evaluate", "policy.compile"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
cd307313-dffa-4786-b79a-7c9d768a3567	feature-flags	Feature Flags	feature-flag-service	control	governance	Rollout state, A/B testing, kill switches	[]	{"public": ["flags.active"], "internal": ["flag.evaluate.batch"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
43985b23-2368-4456-ac23-98adc7043a08	audit	Audit Trail	audit-service	control	security	Immutable admin/user action logs	["identity"]	{"public": [], "internal": ["audit.write", "audit.query"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
62463832-8dd4-44ba-8350-5e3ae90d215e	support	Support Actions	support-service	control	support	Case management, diagnostics, safe repair	["identity", "devices", "sync", "storage"]	{"public": ["case.create", "case.status"], "internal": ["case.escalate", "diagnostic.generate"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
195e55cb-0e30-4348-acfa-8a67cdf623c2	notifications	Notifications	notification-service	shared-core	platform	Multi-plane notification routing and delivery	["identity"]	{"public": ["notifications.list", "notifications.read"], "internal": ["notify.route", "notify.deliver"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
d1bc12dd-2ce0-481d-b407-f7a60e1dba21	recovery	Recovery & Repair	recovery-service	control	platform	Self-healing, manual repair, rollback	["storage", "sync", "devices"]	{"public": [], "internal": ["repair.execute", "rollback.initiate"]}	active	2026-04-15 07:43:18.018815+00	2026-04-15 07:43:18.018815+00
\.


--
-- Data for Name: dual_authority_challenges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dual_authority_challenges (id, user_id, command_id, action, risk_level, challenge_token, expires_at, status, response, responded_at, explanation, consequences, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ecosystem_commands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ecosystem_commands (id, user_id, input, intent, scope, risk_class, target_layers, approval_required, status, result_summary, correlation_id, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: ecosystem_contracts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ecosystem_contracts (id, user_id, feature_name, os_ownership, cloud_ownership, app_ownership, failure_behavior, approval_required, rollback_exists, events, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ecosystem_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ecosystem_events (id, user_id, event_type, correlation_id, source_layer, payload_json, emitted_at, version, created_at) FROM stdin;
\.


--
-- Data for Name: environment_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.environment_configs (id, env_key, display_name, description, api_base_url, feature_flag_context, config, is_current, status, created_at, updated_at) FROM stdin;
f7428394-f613-43c9-8095-91791f177ffa	dev	Development	Local development environment	http://localhost:54321	{}	{"debug": true, "log_level": "verbose"}	f	active	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
360a5233-6247-4550-8a67-18d8a2c4f678	staging	Staging	Pre-production testing environment	https://staging-api.sita-os.dev	{}	{"debug": false, "log_level": "info"}	f	active	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
39872a26-73e2-4c08-bc92-482816f4a612	production	Production	Live production environment	https://api.sita-os.dev	{}	{"debug": false, "log_level": "warn"}	t	active	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
\.


--
-- Data for Name: flagship_loops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flagship_loops (id, loop_key, display_name, description, primary_persona, launch_importance, status, core_routes, core_journeys, primary_services, owner_team, ux_quality_target, proof_required, launch_honesty_class, proof_status, blocker_count, demo_vs_real, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: founder_directives; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.founder_directives (id, user_id, intent_text, domain_classification, priority, status, decomposed_plan, task_graph, execution_state, outcome_summary, risk_assessment, agent_assignments, approvals_required, approvals_received, started_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: gift_tracker; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.gift_tracker (id, user_id, recipient, occasion, gift_idea, budget, status, target_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: graph_edges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.graph_edges (id, source_node_type, source_node_id, target_node_type, target_node_id, edge_type, weight, metadata, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: grocery_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grocery_items (id, user_id, list_id, name, category, quantity, estimated_cost, checked, recurring, urgent, store, note, created_at) FROM stdin;
\.


--
-- Data for Name: grocery_lists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.grocery_lists (id, user_id, name, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: health_validation_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.health_validation_results (id, user_id, update_id, component, status, details, checked_at) FROM stdin;
\.


--
-- Data for Name: incidents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incidents (id, user_id, severity, title, description, affected_services, status, owner_user_id, remediation_notes, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: layer_health_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.layer_health_snapshots (id, user_id, layer, services_total, services_healthy, services_degraded, health_score, captured_at, created_at) FROM stdin;
\.


--
-- Data for Name: lead_inbox_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lead_inbox_items (id, user_id, contact_name, contact_email, contact_phone, company, source, inquiry_text, urgency, quality_score, quality_hints, completeness_score, missing_fields, duplicate_status, duplicate_match_id, suggested_owner, suggested_route, advisor_suggestion, triage_status, routed_to, accepted_at, business_profile_mode, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: leads; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leads (id, user_id, name, email, phone, company, source, status, likely_value, opportunity_score, next_action, last_contact_at, stale_risk, notes, urgency, inbox_item_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: license_activations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_activations (id, license_id, device_fingerprint, device_name, platform, activated_at, last_heartbeat, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: license_audit_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.license_audit_log (id, license_id, event, device_fingerprint, ip_address, details, created_at) FROM stdin;
\.


--
-- Data for Name: licenses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.licenses (id, user_id, license_key, product_tier, status, max_devices, issued_at, expires_at, created_at, updated_at, key_signature) FROM stdin;
\.


--
-- Data for Name: managed_apps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.managed_apps (id, user_id, app_key, display_name, description, version, trust_level, health_status, install_source, install_state, permissions, config, crash_count, last_crash_at, last_health_check_at, domain, device_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mobile_push_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mobile_push_tokens (id, user_id, os, transport, token, device_id, app_version, expires_at, rotated_from, status, last_seen_at, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_delivery_receipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_delivery_receipts (id, user_id, notification_id, channel, status, delivered_at, created_at, platform, failure_reason, latency_ms, sent_at) FROM stdin;
\.


--
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_preferences (id, user_id, channel, scope, enabled, quiet_hours_start, quiet_hours_end, urgency_filter, push_enabled, email_enabled, in_app_enabled, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, body, urgency, domain, action_url, read, created_at, updated_at, dismissed, target_app, target_module, signal_type, icon_name, metadata) FROM stdin;
\.


--
-- Data for Name: onboarding_choices; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_choices (id, session_id, key, value, source, applied, applied_at, created_at) FROM stdin;
\.


--
-- Data for Name: onboarding_completion_markers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_completion_markers (id, session_id, marker_name, satisfied, satisfied_at, details, created_at) FROM stdin;
\.


--
-- Data for Name: onboarding_hardware_detection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_hardware_detection (id, session_id, hardware_model, battery_present, biometric_present, tpm_present, wifi_present, ethernet_present, bluetooth_present, display_resolution, storage_bytes, memory_bytes, created_at) FROM stdin;
\.


--
-- Data for Name: onboarding_restore_sources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_restore_sources (id, session_id, source_type, selected, status, metadata_ref, validation_status, created_at) FROM stdin;
\.


--
-- Data for Name: onboarding_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_sessions (id, user_id, device_id, boot_id, started_at, completed_at, state, current_step, version, interrupted, resume_token, managed_enrollment_mode, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: onboarding_steps; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.onboarding_steps (id, session_id, step_name, required, order_index, status, entered_at, completed_at, skipped_at, failed_at, validation_error_code, validation_error_message, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: org_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.org_members (id, org_id, user_id, role, invited_at, joined_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.organizations (id, name, slug, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_audit_events (id, user_id, event_id, actor_session_id, actor_service, action, resource, decision, reason, severity, correlation_id, auth_method, metadata, ts, created_at) FROM stdin;
\.


--
-- Data for Name: os_auth_methods; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_auth_methods (id, user_id, method_type, enabled, enrolled_at, last_used_at, policy_flags, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_capabilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_capabilities (id, user_id, capability_id, name, description, sensitivity_level, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_command_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_command_events (id, user_id, command_id, from_state, to_state, actor, reason, metadata, correlation_id, created_at) FROM stdin;
\.


--
-- Data for Name: os_commands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_commands (id, user_id, command_type, command_text, structured_command, target_device_id, target_device_ids, origin, safety_mode, simulation_first, status, plan_json, approval_state, approval_requested_at, approved_by, approved_at, verification_state, verified_at, rollback_available, rollback_payload, correlation_id, actor_user_id, result, error_message, dispatched_at, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_elevation_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_elevation_tokens (id, user_id, token_id, session_id, action, target_service, issued_at, expires_at, consumed_at, single_use, nonce, signature, created_at) FROM stdin;
\.


--
-- Data for Name: os_keyrings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_keyrings (id, user_id, keyring_id, scope, protection_class, hardware_backed, secret_count, rotated_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_policies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_policies (id, user_id, policy_key, display_name, description, scope, scope_ref, conditions, actions, priority, enabled, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_role_capabilities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_role_capabilities (id, user_id, role, capability_id, default_allowed, created_at) FROM stdin;
\.


--
-- Data for Name: os_secrets_metadata; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_secrets_metadata (id, user_id, secret_id, owner_scope, secret_type, keyring_id, label, exportable, hardware_backed, access_policy_id, version, revoked, last_accessed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_service_identities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_service_identities (id, user_id, service_name, service_uid, privileged, allowed_actions, secret_scope, registered_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_sessions (id, user_id, session_id, role, state, locked, auth_fresh_until, display_id, seat_id, created_at, last_activity_at, updated_at) FROM stdin;
\.


--
-- Data for Name: os_user_accounts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.os_user_accounts (id, user_id, username, display_name, role, status, password_hash_ref, profile_ref, enrolled_methods, failed_attempts, lockout_until, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: outcome_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.outcome_verifications (id, recommendation_id, verification_type, expected_outcome, actual_outcome, status, verified_by_user_id, verified_at, notes, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: plane_service_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.plane_service_assignments (id, plane_id, service_key, display_name, description, service_type, status, created_at, updated_at) FROM stdin;
6f7d9a65-70fa-4fd4-9255-de163985d080	958607e0-657c-4b06-b933-25749f986fcb	admin-dashboard	Admin Dashboard	Platform administration overview	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
bb7cc12c-5be5-450c-a8d0-35d97dae6200	958607e0-657c-4b06-b933-25749f986fcb	user-management	User Management	Search, suspend, inspect user accounts	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
5382e89c-1cd2-4e57-a290-2626c1a02965	958607e0-657c-4b06-b933-25749f986fcb	device-management	Device Management	Global device control and revocation	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
ad25826d-1e03-4e3f-a3c0-169125f1178b	958607e0-657c-4b06-b933-25749f986fcb	audit-explorer	Audit Explorer	Admin action audit log search and export	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
5628c28f-039c-4167-b983-604a2f181ddb	958607e0-657c-4b06-b933-25749f986fcb	support-console	Support Console	Safe support tools with limited access	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
b717a7ce-6011-4b92-8338-f4d6f9ef077e	958607e0-657c-4b06-b933-25749f986fcb	rbac-engine	RBAC Engine	Granular role-permission management	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
24947b93-7842-4aff-aaf8-c02167b96308	958607e0-657c-4b06-b933-25749f986fcb	policy-management	Policy Management	Platform policy editing and simulation	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
86737558-2540-4309-bbdf-c5063b426991	958607e0-657c-4b06-b933-25749f986fcb	flag-management	Flag Management	Feature flag rollout and kill switches	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
75c76090-4b2f-497b-a02a-80c4b3dc7f63	958607e0-657c-4b06-b933-25749f986fcb	maintenance-ops	Maintenance Ops	Repair, reindex, and reconciliation jobs	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
07ccdb5e-8d61-4b0e-a97d-ca7b6bef41d9	958607e0-657c-4b06-b933-25749f986fcb	environment-config	Environment Config	Dev/staging/prod environment management	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
bafccde3-9dba-4719-beec-4ab15b70e2ee	958607e0-657c-4b06-b933-25749f986fcb	token-management	Token Management	Token class and admin session control	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
75c809b2-0b5c-4044-b621-12e884c245d3	958607e0-657c-4b06-b933-25749f986fcb	admin-gateway	Admin Gateway	Unified admin API gateway with permission checks	edge-function	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
4305b6b2-6500-46cd-8e87-632f59874ba2	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	desktop-shell	Desktop Shell	OS desktop environment and window manager	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
763ce974-cb82-4953-a50b-aac3bb347cfc	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	settings-app	Settings App	User preferences and account settings	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
b7c66012-bb7d-497d-b05d-21d77ea93777	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	cloud-drive	Cloud Drive	Cloud file browser and sync UI	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
d4c52784-f74d-49dc-889f-dea24cad1418	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	device-ownership	Device Ownership	User self-service device management	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
f18db5ac-7008-46d3-8fe5-39555274b0ff	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	sync-client	Sync Client	Local sync daemon and status UI	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
1f245279-438c-4c67-9873-ad1c91b2bfa5	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	notifications	Notifications	User notification center	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
5da7b022-7c4b-4aed-822c-5dd2697ea89c	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	onboarding	Onboarding	First-use ceremony and guided setup	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
3fee598e-4ce7-4a96-bd7b-231d70bb5173	a339d938-2c40-4e6f-b5ac-496efe1f4a2c	recovery-tools	Recovery Tools	User self-repair and account recovery	ui	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
7b69be63-4899-40cd-bcae-73f5413603d8	ce340cd1-af35-4902-822d-e6b72d04c5fb	auth-service	Auth Service	Authentication and identity management	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
5556e693-541c-416b-a3df-9c31bb1ad1ee	ce340cd1-af35-4902-822d-e6b72d04c5fb	user-service	User Service	User profile and preference storage	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
b196ecfe-0bca-416e-9798-4367dcf8ef35	ce340cd1-af35-4902-822d-e6b72d04c5fb	device-service	Device Service	Device registration and trust management	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
0c281cc8-59c3-4df1-a06b-b86d7974030b	ce340cd1-af35-4902-822d-e6b72d04c5fb	sync-service	Sync Service	Real-time sync coordination and conflict resolution	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
805b5a21-b4ad-497a-a7bb-5971dee6e9a3	ce340cd1-af35-4902-822d-e6b72d04c5fb	storage-service	Storage Service	Object storage, blob management, and buckets	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
a2930a9d-4d10-46d3-a53b-4cb9d499729d	ce340cd1-af35-4902-822d-e6b72d04c5fb	quota-service	Quota Service	User and tenant quota enforcement	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
0b1bcaa6-85d4-4ca7-8d15-68fcff50e49d	ce340cd1-af35-4902-822d-e6b72d04c5fb	policy-service	Policy Service	Policy evaluation and enforcement engine	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
a7147ce4-6070-4bc2-b296-c42739de8925	ce340cd1-af35-4902-822d-e6b72d04c5fb	feature-flag-service	Feature Flag Service	Remote feature control and rollout engine	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
76db729a-6ad1-40e8-b344-b1e1948a9ad6	ce340cd1-af35-4902-822d-e6b72d04c5fb	audit-log-service	Audit Log Service	Security event and audit trail storage	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
c188db5e-63dd-44ac-8617-a30c5747f44b	ce340cd1-af35-4902-822d-e6b72d04c5fb	notification-service	Notification Service	Push, email, and in-app notification routing	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
22d9b174-b17f-4ca7-9518-bfbe10348747	ce340cd1-af35-4902-822d-e6b72d04c5fb	update-service	Update Service	Client version management and update channels	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
2780d3b8-9d7f-452c-9a02-2a7cda498fca	ce340cd1-af35-4902-822d-e6b72d04c5fb	telemetry-service	Telemetry Service	Anonymous usage metrics and health telemetry	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
a80c1a20-e10d-4d4b-b83b-7e235eab7203	ce340cd1-af35-4902-822d-e6b72d04c5fb	worker-service	Worker Service	Background job queue and retry management	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
8211774f-42d0-4659-b9c7-22b845699a82	ce340cd1-af35-4902-822d-e6b72d04c5fb	lifecycle-service	Lifecycle Service	Data retention, archival, and account closure	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
61edf0fb-2948-4ad5-8477-5eefa555cb9d	ce340cd1-af35-4902-822d-e6b72d04c5fb	tenant-service	Tenant Service	Multi-tenant isolation and workspace management	backbone	active	2026-04-15 07:33:28.655601+00	2026-04-15 07:33:28.655601+00
\.


--
-- Data for Name: platform_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_notifications (id, audience, target_user_id, title, body, category, severity, source_service, source_event_type, correlation_id, read, dismissed, action_url, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: platform_planes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_planes (id, plane_key, display_name, description, color, icon, service_count, status, created_at, updated_at) FROM stdin;
958607e0-657c-4b06-b933-25749f986fcb	control	Control Plane	Administrative, operator, support, and system-management layer	#9b87f5	shield	12	active	2026-04-15 07:26:22.906618+00	2026-04-15 07:33:28.655601+00
a339d938-2c40-4e6f-b5ac-496efe1f4a2c	product	Product Plane	User-facing OS, apps, sync experience, and consumer UX	#38bdf8	monitor	8	active	2026-04-15 07:26:22.906618+00	2026-04-15 07:33:28.655601+00
ce340cd1-af35-4902-822d-e6b72d04c5fb	shared-core	Shared Core	Backend identity, sync, storage, policy, update, telemetry, device, and messaging infrastructure	#f59e0b	server	15	active	2026-04-15 07:26:22.906618+00	2026-04-15 07:33:28.655601+00
\.


--
-- Data for Name: platform_runbooks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.platform_runbooks (id, user_id, title, description, domain, severity, trigger_conditions, steps, agent_assignments, auto_heal_enabled, auto_heal_config, tags, execution_count, last_executed_at, last_execution_result, incident_patterns, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, user_id, display_name, avatar_url, bio, preferences, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: profit_signals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profit_signals (id, user_id, signal_type, category, title, description, estimated_impact_cents, confidence, urgency, source_data, status, resolved_at, resolution_outcome, actual_impact_cents, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: read_model_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.read_model_snapshots (id, model_type, subject_id, subject_type, snapshot, freshness_at, ttl_seconds, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recommendation_execution_bindings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation_execution_bindings (id, recommendation_id, approval_queue_item_id, binding_type, binding_status, linked_program_id, linked_task_id, owner_team, owner_user_id, due_at, completed_at, notes, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recommendation_execution_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation_execution_events (id, binding_id, event_type, summary, details, created_by_user_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: recommendation_learning_signals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation_learning_signals (id, recommendation_id, signal_type, signal_strength, signal_source, notes, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: recommendation_outcome_verifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recommendation_outcome_verifications (id, recommendation_id, binding_id, verification_method, expected_improvement, actual_improvement, verification_status, customer_journey_delta, launch_truth_delta, notes, verified_by_user_id, verified_at, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: release_compatibility_matrix; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.release_compatibility_matrix (id, client_type, client_version, api_version, backend_version, compatibility, breaking_changes, migration_required, rollout_stage, rollout_percentage, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: remediation_programs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.remediation_programs (id, program_key, display_name, description, focus_area, program_status, flagship_loop_key, owner_team, owner_user_id, start_at, target_at, completed_at, launch_impact_class, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: remediation_tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.remediation_tasks (id, program_id, task_key, display_name, description, task_status, execution_type, owner_team, owner_user_id, related_route_key, related_service_key, related_customer_journey_key, related_flagship_loop_key, due_at, completed_at, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: rollback_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.rollback_events (id, user_id, update_id, source_slot, rollback_to_slot, trigger_type, reason_code, detected_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: runtime_agents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.runtime_agents (id, user_id, agent_type, hostname, version, capabilities, status, last_heartbeat_at, registered_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: school_activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.school_activities (id, user_id, title, child_name, activity_type, schedule, location, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: service_identity_registry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_identity_registry (id, service_key, display_name, description, plane, scopes, trust_level, is_active, last_authenticated_at, token_ttl_seconds, allowed_targets, created_at, updated_at) FROM stdin;
6ffd52ad-b1fd-4276-9f4b-e484279b8d76	auth-service	Authentication Service	Manages identity and session lifecycle	shared-core	{identity.read,identity.write,session.manage}	elevated	t	\N	3600	{device-service,audit-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
14ce405b-1e26-4aab-a2ce-432b5d3c3883	device-service	Device Service	Device registry and trust management	shared-core	{device.read,device.write,device.trust}	elevated	t	\N	3600	{auth-service,sync-service,audit-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
0cb86cb3-b852-4737-a187-55da177c1aa8	storage-service	Storage Service	Blob storage and metadata management	product	{blob.read,blob.write,metadata.manage}	standard	t	\N	3600	{sync-service,quota-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
fcde6616-6ae6-426f-bbe3-092ecc9af1e3	sync-service	Sync Engine	Checkpoint and change feed management	product	{sync.read,sync.write,checkpoint.manage}	standard	t	\N	3600	{storage-service,device-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
8b7b5e40-534f-4346-8c1f-571758ca2c2c	quota-service	Quota Service	Storage limits and usage accounting	control	{quota.read,quota.write,accounting.manage}	elevated	t	\N	3600	{storage-service,policy-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
832a0726-d696-4cce-9d57-ad77bda8a9c5	policy-service	Policy Engine	Effective policy evaluation	control	{policy.read,policy.write,policy.evaluate}	elevated	t	\N	3600	{quota-service,feature-flag-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
25ada985-466c-4955-9ad2-a67755ccd20a	feature-flag-service	Feature Flags	Rollout and kill switch management	control	{flags.read,flags.write,rollout.manage}	elevated	t	\N	3600	{policy-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
b514f5f7-9cd3-4ce4-a7dc-e915ce706069	audit-service	Audit Service	Immutable action logging	control	{audit.write,audit.read}	critical	t	\N	3600	{}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
adc87212-4afc-4079-8031-b996bd9fb0d1	support-service	Support Service	Case management and diagnostics	control	{support.cases,support.diagnostics,support.repair}	elevated	t	\N	3600	{device-service,sync-service,storage-service,audit-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
f81754b2-1b5b-40bc-b34e-8d3e7fb5642a	notification-service	Notification Service	Multi-plane notification routing	shared-core	{notify.user,notify.admin,notify.support,notify.route}	standard	t	\N	3600	{auth-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
e0ee7603-8ff1-402e-98c1-f901cd71734b	recovery-service	Recovery Service	Self-healing and manual repair orchestration	control	{repair.execute,rollback.manage,health.check}	critical	t	\N	3600	{storage-service,sync-service,device-service,audit-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
a9245273-340d-4355-89fc-bc90ba523259	user-bff	User BFF	User-facing aggregation layer	product	{bff.user.read,bff.user.aggregate}	standard	t	\N	3600	{auth-service,device-service,storage-service,sync-service,notification-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
d429ae7a-6c37-4604-b6dc-81a4f7e4a82e	admin-bff	Admin BFF	Admin-facing aggregation layer	control	{bff.admin.read,bff.admin.aggregate,bff.admin.action}	elevated	t	\N	3600	{auth-service,device-service,storage-service,sync-service,quota-service,audit-service,support-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
3bdad95f-9e4e-4047-827d-0ac627193010	orchestrator	Workflow Orchestrator	Long-running workflow/saga coordination	shared-core	{workflow.execute,workflow.manage,saga.coordinate}	critical	t	\N	3600	{storage-service,sync-service,device-service,audit-service,recovery-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
edc96cf1-aec4-496b-8daa-46a6ff235329	scheduler	Task Scheduler	Cron and delayed job management	shared-core	{scheduler.dispatch,scheduler.manage}	standard	t	\N	3600	{orchestrator,audit-service}	2026-04-15 07:44:18.814575+00	2026-04-15 07:44:18.814575+00
\.


--
-- Data for Name: service_providers_list; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_providers_list (id, user_id, name, category, phone, location, rating, trusted, total_spent, response_time, cost_range, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: simulations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.simulations (id, user_id, scenario_type, title, input_payload, status, result_artifacts, model_used, duration_ms, created_at, completed_at) FROM stdin;
\.


--
-- Data for Name: support_access_grants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_access_grants (id, target_user_id, granted_to_user_id, reason, scope, granted_at, expires_at, revoked_at, actions_performed, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: support_case_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_case_events (id, case_id, event_type, actor_user_id, content, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: support_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.support_cases (id, user_id, title, description, category, priority, status, assigned_to, escalated_to_role, correlation_id, diagnostic_package, resolution, resolved_at, self_repair_attempted, self_repair_result, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_guarantees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_guarantees (id, user_id, command_id, guarantee_type, status, explanation, checked_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_slots (id, user_id, slot_id, version, build_id, status, boot_count, health_status, integrity_verified, last_boot_at, installed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: timeline_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.timeline_events (id, user_id, event_type, actor_type, actor_id, subject_type, subject_id, action, description, metadata, receipt_id, domain, created_at) FROM stdin;
\.


--
-- Data for Name: token_classes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.token_classes (id, class_key, display_name, description, default_ttl_seconds, max_ttl_seconds, scope_template, requires_mfa, created_at, updated_at) FROM stdin;
9934a0c9-3d58-4704-951c-89ec7b869f16	user	User Token	Standard user session tokens for OS and apps	3600	86400	["read:own", "write:own", "sync:own", "devices:own"]	f	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
4e35b2ca-5844-44b2-97f9-641da3a04c6f	admin	Admin Token	Elevated admin tokens with short TTL and MFA	7200	14400	["admin:read", "admin:write", "admin:audit"]	t	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
d4b06f6b-46fb-43b3-9994-2de070cb29bc	service	Service Token	Machine-to-machine service tokens	300	3600	["service:sync", "service:storage", "service:policy"]	f	2026-04-15 07:26:22.906618+00	2026-04-15 07:26:22.906618+00
\.


--
-- Data for Name: travel_plans; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.travel_plans (id, user_id, destination, start_date, end_date, readiness_percent, status, travelers, budget, spent, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: update_boot_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.update_boot_attempts (id, user_id, update_id, target_slot, reboot_requested_at, booted_at, startup_validation_ok, health_validation_ok, rollback_triggered, rollback_reason, created_at) FROM stdin;
\.


--
-- Data for Name: update_catalog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.update_catalog (id, version, build_id, channel, update_type, package_format, metadata_hash, signature_ref, payload_size, delta_from_version, published_at, critical, min_supported_version, rollout_percentage, release_notes, components, created_at) FROM stdin;
\.


--
-- Data for Name: update_channels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.update_channels (id, user_id, name, enabled, user_selectable, policy_allowed, created_at) FROM stdin;
\.


--
-- Data for Name: update_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.update_history (id, user_id, update_id, from_version, to_version, action, actor, reason, created_at) FROM stdin;
\.


--
-- Data for Name: update_preflight_results; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.update_preflight_results (id, user_id, update_id, battery_percent, charger_connected, free_storage_bytes, network_type, policy_allowed, channel_allowed, slot_available, passed, reason_code, checked_at) FROM stdin;
\.


--
-- Data for Name: update_staging; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.update_staging (id, user_id, update_id, target_slot, snapshot_id, state, integrity_verified, staged_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_roles (id, user_id, role) FROM stdin;
\.


--
-- Data for Name: vapid_keys; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vapid_keys (id, public_key, private_key_ref, status, activated_at, rotated_at, created_at) FROM stdin;
\.


--
-- Name: action_safety_classifications action_safety_classifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_safety_classifications
    ADD CONSTRAINT action_safety_classifications_pkey PRIMARY KEY (id);


--
-- Name: action_safety_classifications action_safety_classifications_user_id_action_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_safety_classifications
    ADD CONSTRAINT action_safety_classifications_user_id_action_key_key UNIQUE (user_id, action_key);


--
-- Name: admin_action_audit admin_action_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_action_audit
    ADD CONSTRAINT admin_action_audit_pkey PRIMARY KEY (id);


--
-- Name: admin_action_confirmations admin_action_confirmations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_action_confirmations
    ADD CONSTRAINT admin_action_confirmations_pkey PRIMARY KEY (id);


--
-- Name: admin_role_permissions admin_role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_pkey PRIMARY KEY (id);


--
-- Name: admin_role_permissions admin_role_permissions_role_key_permission_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_role_permissions
    ADD CONSTRAINT admin_role_permissions_role_key_permission_key UNIQUE (role_key, permission);


--
-- Name: admin_safety_actions admin_safety_actions_action_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_safety_actions
    ADD CONSTRAINT admin_safety_actions_action_key_key UNIQUE (action_key);


--
-- Name: admin_safety_actions admin_safety_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_safety_actions
    ADD CONSTRAINT admin_safety_actions_pkey PRIMARY KEY (id);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (id);


--
-- Name: advisor_action_queue advisor_action_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_action_queue
    ADD CONSTRAINT advisor_action_queue_pkey PRIMARY KEY (id);


--
-- Name: advisor_agents advisor_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_agents
    ADD CONSTRAINT advisor_agents_pkey PRIMARY KEY (id);


--
-- Name: advisor_agents advisor_agents_user_id_advisor_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_agents
    ADD CONSTRAINT advisor_agents_user_id_advisor_id_key UNIQUE (user_id, advisor_id);


--
-- Name: advisor_autonomy_policies advisor_autonomy_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_autonomy_policies
    ADD CONSTRAINT advisor_autonomy_policies_pkey PRIMARY KEY (id);


--
-- Name: advisor_autonomy_policies advisor_autonomy_policies_user_id_domain_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_autonomy_policies
    ADD CONSTRAINT advisor_autonomy_policies_user_id_domain_key UNIQUE (user_id, domain);


--
-- Name: advisor_board_actions advisor_board_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_actions
    ADD CONSTRAINT advisor_board_actions_pkey PRIMARY KEY (id);


--
-- Name: advisor_board_memory advisor_board_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_memory
    ADD CONSTRAINT advisor_board_memory_pkey PRIMARY KEY (id);


--
-- Name: advisor_board_recommendations advisor_board_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_recommendations
    ADD CONSTRAINT advisor_board_recommendations_pkey PRIMARY KEY (id);


--
-- Name: advisor_board_reflections advisor_board_reflections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_reflections
    ADD CONSTRAINT advisor_board_reflections_pkey PRIMARY KEY (id);


--
-- Name: advisor_board_tool_executions advisor_board_tool_executions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_tool_executions
    ADD CONSTRAINT advisor_board_tool_executions_pkey PRIMARY KEY (id);


--
-- Name: advisor_feedback advisor_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_feedback
    ADD CONSTRAINT advisor_feedback_pkey PRIMARY KEY (id);


--
-- Name: advisor_knowledge advisor_knowledge_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_knowledge
    ADD CONSTRAINT advisor_knowledge_pkey PRIMARY KEY (id);


--
-- Name: advisor_memories advisor_memories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_memories
    ADD CONSTRAINT advisor_memories_pkey PRIMARY KEY (id);


--
-- Name: advisor_profiles advisor_profiles_advisor_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_profiles
    ADD CONSTRAINT advisor_profiles_advisor_id_user_id_key UNIQUE (advisor_id, user_id);


--
-- Name: advisor_profiles advisor_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_profiles
    ADD CONSTRAINT advisor_profiles_pkey PRIMARY KEY (id);


--
-- Name: ai_inference_receipts ai_inference_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_inference_receipts
    ADD CONSTRAINT ai_inference_receipts_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_approval_queue ai_workforce_approval_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_approval_queue
    ADD CONSTRAINT ai_workforce_approval_queue_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_budget_classes ai_workforce_budget_classes_class_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_budget_classes
    ADD CONSTRAINT ai_workforce_budget_classes_class_key_key UNIQUE (class_key);


--
-- Name: ai_workforce_budget_classes ai_workforce_budget_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_budget_classes
    ADD CONSTRAINT ai_workforce_budget_classes_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_cached_outputs ai_workforce_cached_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_cached_outputs
    ADD CONSTRAINT ai_workforce_cached_outputs_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_invocations ai_workforce_invocations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_invocations
    ADD CONSTRAINT ai_workforce_invocations_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_launch_honesty ai_workforce_launch_honesty_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_launch_honesty
    ADD CONSTRAINT ai_workforce_launch_honesty_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_outputs ai_workforce_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_outputs
    ADD CONSTRAINT ai_workforce_outputs_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_recommendation_scores ai_workforce_recommendation_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_recommendation_scores
    ADD CONSTRAINT ai_workforce_recommendation_scores_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_recommendations ai_workforce_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_recommendations
    ADD CONSTRAINT ai_workforce_recommendations_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_role_health ai_workforce_role_health_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_role_health
    ADD CONSTRAINT ai_workforce_role_health_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_role_task_permissions ai_workforce_role_task_permission_role_key_task_key_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_role_task_permissions
    ADD CONSTRAINT ai_workforce_role_task_permission_role_key_task_key_user_id_key UNIQUE (role_key, task_key, user_id);


--
-- Name: ai_workforce_role_task_permissions ai_workforce_role_task_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_role_task_permissions
    ADD CONSTRAINT ai_workforce_role_task_permissions_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_roles ai_workforce_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_roles
    ADD CONSTRAINT ai_workforce_roles_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_roles ai_workforce_roles_role_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_roles
    ADD CONSTRAINT ai_workforce_roles_role_key_key UNIQUE (role_key);


--
-- Name: ai_workforce_task_types ai_workforce_task_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_task_types
    ADD CONSTRAINT ai_workforce_task_types_pkey PRIMARY KEY (id);


--
-- Name: ai_workforce_task_types ai_workforce_task_types_task_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_task_types
    ADD CONSTRAINT ai_workforce_task_types_task_key_key UNIQUE (task_key);


--
-- Name: api_gateway_routes api_gateway_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_gateway_routes
    ADD CONSTRAINT api_gateway_routes_pkey PRIMARY KEY (id);


--
-- Name: api_gateway_routes api_gateway_routes_route_pattern_method_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_gateway_routes
    ADD CONSTRAINT api_gateway_routes_route_pattern_method_key UNIQUE (route_pattern, method);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: approval_decisions approval_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.approval_decisions
    ADD CONSTRAINT approval_decisions_pkey PRIMARY KEY (id);


--
-- Name: biometric_credentials biometric_credentials_credential_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_credentials
    ADD CONSTRAINT biometric_credentials_credential_id_key UNIQUE (credential_id);


--
-- Name: biometric_credentials biometric_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.biometric_credentials
    ADD CONSTRAINT biometric_credentials_pkey PRIMARY KEY (id);


--
-- Name: boardroom_decision_receipts boardroom_decision_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_decision_receipts
    ADD CONSTRAINT boardroom_decision_receipts_pkey PRIMARY KEY (id);


--
-- Name: boardroom_evidence boardroom_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_evidence
    ADD CONSTRAINT boardroom_evidence_pkey PRIMARY KEY (id);


--
-- Name: boardroom_items boardroom_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_items
    ADD CONSTRAINT boardroom_items_pkey PRIMARY KEY (id);


--
-- Name: boardroom_recommendations boardroom_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_recommendations
    ADD CONSTRAINT boardroom_recommendations_pkey PRIMARY KEY (id);


--
-- Name: boardroom_sessions boardroom_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_sessions
    ADD CONSTRAINT boardroom_sessions_pkey PRIMARY KEY (id);


--
-- Name: business_health_scores business_health_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_health_scores
    ADD CONSTRAINT business_health_scores_pkey PRIMARY KEY (id);


--
-- Name: business_onboarding business_onboarding_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_onboarding
    ADD CONSTRAINT business_onboarding_pkey PRIMARY KEY (id);


--
-- Name: business_onboarding business_onboarding_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_onboarding
    ADD CONSTRAINT business_onboarding_user_id_key UNIQUE (user_id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: client_capability_matrix client_capability_matrix_client_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_capability_matrix
    ADD CONSTRAINT client_capability_matrix_client_type_key UNIQUE (client_type);


--
-- Name: client_capability_matrix client_capability_matrix_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.client_capability_matrix
    ADD CONSTRAINT client_capability_matrix_pkey PRIMARY KEY (id);


--
-- Name: cloud_abuse_events cloud_abuse_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_abuse_events
    ADD CONSTRAINT cloud_abuse_events_pkey PRIMARY KEY (id);


--
-- Name: cloud_account_closure_requests cloud_account_closure_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_account_closure_requests
    ADD CONSTRAINT cloud_account_closure_requests_pkey PRIMARY KEY (id);


--
-- Name: cloud_activity_journal cloud_activity_journal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_activity_journal
    ADD CONSTRAINT cloud_activity_journal_pkey PRIMARY KEY (id);


--
-- Name: cloud_admin_role_assignments cloud_admin_role_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_admin_role_assignments
    ADD CONSTRAINT cloud_admin_role_assignments_pkey PRIMARY KEY (id);


--
-- Name: cloud_admin_role_assignments cloud_admin_role_assignments_user_id_role_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_admin_role_assignments
    ADD CONSTRAINT cloud_admin_role_assignments_user_id_role_id_key UNIQUE (user_id, role_id);


--
-- Name: cloud_admin_roles cloud_admin_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_admin_roles
    ADD CONSTRAINT cloud_admin_roles_pkey PRIMARY KEY (id);


--
-- Name: cloud_admin_roles cloud_admin_roles_role_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_admin_roles
    ADD CONSTRAINT cloud_admin_roles_role_key_key UNIQUE (role_key);


--
-- Name: cloud_archive_jobs cloud_archive_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_archive_jobs
    ADD CONSTRAINT cloud_archive_jobs_pkey PRIMARY KEY (id);


--
-- Name: cloud_audit_events cloud_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_audit_events
    ADD CONSTRAINT cloud_audit_events_pkey PRIMARY KEY (id);


--
-- Name: cloud_backup_snapshots cloud_backup_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_backup_snapshots
    ADD CONSTRAINT cloud_backup_snapshots_pkey PRIMARY KEY (id);


--
-- Name: cloud_blobs cloud_blobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_blobs
    ADD CONSTRAINT cloud_blobs_pkey PRIMARY KEY (id);


--
-- Name: cloud_bootstrap_markers cloud_bootstrap_markers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_bootstrap_markers
    ADD CONSTRAINT cloud_bootstrap_markers_pkey PRIMARY KEY (id);


--
-- Name: cloud_compliance_hooks cloud_compliance_hooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_compliance_hooks
    ADD CONSTRAINT cloud_compliance_hooks_pkey PRIMARY KEY (id);


--
-- Name: cloud_conflicts cloud_conflicts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_conflicts
    ADD CONSTRAINT cloud_conflicts_pkey PRIMARY KEY (id);


--
-- Name: cloud_device_sessions cloud_device_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_device_sessions
    ADD CONSTRAINT cloud_device_sessions_pkey PRIMARY KEY (id);


--
-- Name: cloud_devices cloud_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_devices
    ADD CONSTRAINT cloud_devices_pkey PRIMARY KEY (id);


--
-- Name: cloud_feature_flags cloud_feature_flags_flag_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_feature_flags
    ADD CONSTRAINT cloud_feature_flags_flag_key_key UNIQUE (flag_key);


--
-- Name: cloud_feature_flags cloud_feature_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_feature_flags
    ADD CONSTRAINT cloud_feature_flags_pkey PRIMARY KEY (id);


--
-- Name: cloud_file_versions cloud_file_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_file_versions
    ADD CONSTRAINT cloud_file_versions_pkey PRIMARY KEY (id);


--
-- Name: cloud_files cloud_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_files
    ADD CONSTRAINT cloud_files_pkey PRIMARY KEY (id);


--
-- Name: cloud_folders cloud_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_folders
    ADD CONSTRAINT cloud_folders_pkey PRIMARY KEY (id);


--
-- Name: cloud_import_export_jobs cloud_import_export_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_import_export_jobs
    ADD CONSTRAINT cloud_import_export_jobs_pkey PRIMARY KEY (id);


--
-- Name: cloud_lifecycle_rules cloud_lifecycle_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_lifecycle_rules
    ADD CONSTRAINT cloud_lifecycle_rules_pkey PRIMARY KEY (id);


--
-- Name: cloud_maintenance_modes cloud_maintenance_modes_mode_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_maintenance_modes
    ADD CONSTRAINT cloud_maintenance_modes_mode_key_key UNIQUE (mode_key);


--
-- Name: cloud_maintenance_modes cloud_maintenance_modes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_maintenance_modes
    ADD CONSTRAINT cloud_maintenance_modes_pkey PRIMARY KEY (id);


--
-- Name: cloud_metrics_snapshots cloud_metrics_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_metrics_snapshots
    ADD CONSTRAINT cloud_metrics_snapshots_pkey PRIMARY KEY (id);


--
-- Name: cloud_namespace_registry cloud_namespace_registry_namespace_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_namespace_registry
    ADD CONSTRAINT cloud_namespace_registry_namespace_key UNIQUE (namespace);


--
-- Name: cloud_namespace_registry cloud_namespace_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_namespace_registry
    ADD CONSTRAINT cloud_namespace_registry_pkey PRIMARY KEY (id);


--
-- Name: cloud_plans cloud_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_plans
    ADD CONSTRAINT cloud_plans_pkey PRIMARY KEY (id);


--
-- Name: cloud_plans cloud_plans_plan_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_plans
    ADD CONSTRAINT cloud_plans_plan_key_key UNIQUE (plan_key);


--
-- Name: cloud_policies cloud_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_policies
    ADD CONSTRAINT cloud_policies_pkey PRIMARY KEY (id);


--
-- Name: cloud_policies cloud_policies_policy_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_policies
    ADD CONSTRAINT cloud_policies_policy_key_key UNIQUE (policy_key);


--
-- Name: cloud_preview_jobs cloud_preview_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_preview_jobs
    ADD CONSTRAINT cloud_preview_jobs_pkey PRIMARY KEY (id);


--
-- Name: cloud_reconciliation_runs cloud_reconciliation_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_reconciliation_runs
    ADD CONSTRAINT cloud_reconciliation_runs_pkey PRIMARY KEY (id);


--
-- Name: cloud_search_index cloud_search_index_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_search_index
    ADD CONSTRAINT cloud_search_index_pkey PRIMARY KEY (id);


--
-- Name: cloud_shared_workspaces cloud_shared_workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_shared_workspaces
    ADD CONSTRAINT cloud_shared_workspaces_pkey PRIMARY KEY (id);


--
-- Name: cloud_shares cloud_shares_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_shares
    ADD CONSTRAINT cloud_shares_pkey PRIMARY KEY (id);


--
-- Name: cloud_storage_providers cloud_storage_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_providers
    ADD CONSTRAINT cloud_storage_providers_pkey PRIMARY KEY (id);


--
-- Name: cloud_storage_providers cloud_storage_providers_provider_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_providers
    ADD CONSTRAINT cloud_storage_providers_provider_key_key UNIQUE (provider_key);


--
-- Name: cloud_storage_tiers cloud_storage_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_tiers
    ADD CONSTRAINT cloud_storage_tiers_pkey PRIMARY KEY (id);


--
-- Name: cloud_storage_tiers cloud_storage_tiers_tier_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_tiers
    ADD CONSTRAINT cloud_storage_tiers_tier_key_key UNIQUE (tier_key);


--
-- Name: cloud_storage_usage cloud_storage_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_usage
    ADD CONSTRAINT cloud_storage_usage_pkey PRIMARY KEY (id);


--
-- Name: cloud_storage_usage cloud_storage_usage_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_usage
    ADD CONSTRAINT cloud_storage_usage_user_id_key UNIQUE (user_id);


--
-- Name: cloud_support_sessions cloud_support_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_support_sessions
    ADD CONSTRAINT cloud_support_sessions_pkey PRIMARY KEY (id);


--
-- Name: cloud_sync_changes cloud_sync_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_sync_changes
    ADD CONSTRAINT cloud_sync_changes_pkey PRIMARY KEY (id);


--
-- Name: cloud_sync_checkpoints cloud_sync_checkpoints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_sync_checkpoints
    ADD CONSTRAINT cloud_sync_checkpoints_pkey PRIMARY KEY (id);


--
-- Name: cloud_sync_jobs cloud_sync_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_sync_jobs
    ADD CONSTRAINT cloud_sync_jobs_pkey PRIMARY KEY (id);


--
-- Name: cloud_sync_objects cloud_sync_objects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_sync_objects
    ADD CONSTRAINT cloud_sync_objects_pkey PRIMARY KEY (id);


--
-- Name: cloud_tenant_memberships cloud_tenant_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_memberships
    ADD CONSTRAINT cloud_tenant_memberships_pkey PRIMARY KEY (id);


--
-- Name: cloud_tenant_memberships cloud_tenant_memberships_tenant_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_memberships
    ADD CONSTRAINT cloud_tenant_memberships_tenant_id_user_id_key UNIQUE (tenant_id, user_id);


--
-- Name: cloud_tenant_plans cloud_tenant_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_plans
    ADD CONSTRAINT cloud_tenant_plans_pkey PRIMARY KEY (id);


--
-- Name: cloud_tenant_policies cloud_tenant_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_policies
    ADD CONSTRAINT cloud_tenant_policies_pkey PRIMARY KEY (id);


--
-- Name: cloud_tenant_policies cloud_tenant_policies_tenant_id_policy_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_policies
    ADD CONSTRAINT cloud_tenant_policies_tenant_id_policy_key_key UNIQUE (tenant_id, policy_key);


--
-- Name: cloud_tenant_quotas cloud_tenant_quotas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_quotas
    ADD CONSTRAINT cloud_tenant_quotas_pkey PRIMARY KEY (id);


--
-- Name: cloud_tenants cloud_tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenants
    ADD CONSTRAINT cloud_tenants_pkey PRIMARY KEY (id);


--
-- Name: cloud_tenants cloud_tenants_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenants
    ADD CONSTRAINT cloud_tenants_slug_key UNIQUE (slug);


--
-- Name: cloud_trash cloud_trash_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_trash
    ADD CONSTRAINT cloud_trash_pkey PRIMARY KEY (id);


--
-- Name: cloud_user_plans cloud_user_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_user_plans
    ADD CONSTRAINT cloud_user_plans_pkey PRIMARY KEY (id);


--
-- Name: cloud_user_plans cloud_user_plans_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_user_plans
    ADD CONSTRAINT cloud_user_plans_user_id_key UNIQUE (user_id);


--
-- Name: cloud_worker_jobs cloud_worker_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_worker_jobs
    ADD CONSTRAINT cloud_worker_jobs_pkey PRIMARY KEY (id);


--
-- Name: command_memory command_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_memory
    ADD CONSTRAINT command_memory_pkey PRIMARY KEY (id);


--
-- Name: command_routing_decisions command_routing_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_routing_decisions
    ADD CONSTRAINT command_routing_decisions_pkey PRIMARY KEY (id);


--
-- Name: command_steps command_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_steps
    ADD CONSTRAINT command_steps_pkey PRIMARY KEY (id);


--
-- Name: communication_metrics communication_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communication_metrics
    ADD CONSTRAINT communication_metrics_pkey PRIMARY KEY (id);


--
-- Name: concierge_automations concierge_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concierge_automations
    ADD CONSTRAINT concierge_automations_pkey PRIMARY KEY (id);


--
-- Name: concierge_documents concierge_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concierge_documents
    ADD CONSTRAINT concierge_documents_pkey PRIMARY KEY (id);


--
-- Name: concierge_errands concierge_errands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concierge_errands
    ADD CONSTRAINT concierge_errands_pkey PRIMARY KEY (id);


--
-- Name: concierge_recurring_obligations concierge_recurring_obligations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.concierge_recurring_obligations
    ADD CONSTRAINT concierge_recurring_obligations_pkey PRIMARY KEY (id);


--
-- Name: config_change_history config_change_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_change_history
    ADD CONSTRAINT config_change_history_pkey PRIMARY KEY (id);


--
-- Name: connector_oauth_flows connector_oauth_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connector_oauth_flows
    ADD CONSTRAINT connector_oauth_flows_pkey PRIMARY KEY (id);


--
-- Name: connector_sync_runs connector_sync_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connector_sync_runs
    ADD CONSTRAINT connector_sync_runs_pkey PRIMARY KEY (id);


--
-- Name: connector_tokens connector_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.connector_tokens
    ADD CONSTRAINT connector_tokens_pkey PRIMARY KEY (id);


--
-- Name: context_graph_snapshots context_graph_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.context_graph_snapshots
    ADD CONSTRAINT context_graph_snapshots_pkey PRIMARY KEY (id);


--
-- Name: crm_automations crm_automations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_automations
    ADD CONSTRAINT crm_automations_pkey PRIMARY KEY (id);


--
-- Name: crm_communications crm_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_communications
    ADD CONSTRAINT crm_communications_pkey PRIMARY KEY (id);


--
-- Name: crm_companies crm_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_companies
    ADD CONSTRAINT crm_companies_pkey PRIMARY KEY (id);


--
-- Name: crm_contact_company crm_contact_company_contact_id_company_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contact_company
    ADD CONSTRAINT crm_contact_company_contact_id_company_id_key UNIQUE (contact_id, company_id);


--
-- Name: crm_contact_company crm_contact_company_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contact_company
    ADD CONSTRAINT crm_contact_company_pkey PRIMARY KEY (id);


--
-- Name: crm_contacts crm_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contacts
    ADD CONSTRAINT crm_contacts_pkey PRIMARY KEY (id);


--
-- Name: crm_import_jobs crm_import_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_import_jobs
    ADD CONSTRAINT crm_import_jobs_pkey PRIMARY KEY (id);


--
-- Name: crm_merge_log crm_merge_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_merge_log
    ADD CONSTRAINT crm_merge_log_pkey PRIMARY KEY (id);


--
-- Name: crm_notes crm_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notes
    ADD CONSTRAINT crm_notes_pkey PRIMARY KEY (id);


--
-- Name: crm_opportunities crm_opportunities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_opportunities
    ADD CONSTRAINT crm_opportunities_pkey PRIMARY KEY (id);


--
-- Name: crm_pipeline_stages crm_pipeline_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_pipeline_stages
    ADD CONSTRAINT crm_pipeline_stages_pkey PRIMARY KEY (id);


--
-- Name: crm_segments crm_segments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_segments
    ADD CONSTRAINT crm_segments_pkey PRIMARY KEY (id);


--
-- Name: crm_tags crm_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_pkey PRIMARY KEY (id);


--
-- Name: crm_tags crm_tags_user_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tags
    ADD CONSTRAINT crm_tags_user_id_name_key UNIQUE (user_id, name);


--
-- Name: crm_tasks crm_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_pkey PRIMARY KEY (id);


--
-- Name: device_attestations device_attestations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_attestations
    ADD CONSTRAINT device_attestations_pkey PRIMARY KEY (id);


--
-- Name: device_mesh_peers device_mesh_peers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_mesh_peers
    ADD CONSTRAINT device_mesh_peers_pkey PRIMARY KEY (id);


--
-- Name: device_ownership device_ownership_device_id_owner_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_ownership
    ADD CONSTRAINT device_ownership_device_id_owner_user_id_key UNIQUE (device_id, owner_user_id);


--
-- Name: device_ownership device_ownership_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_ownership
    ADD CONSTRAINT device_ownership_pkey PRIMARY KEY (id);


--
-- Name: domain_ownership_registry domain_ownership_registry_domain_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_ownership_registry
    ADD CONSTRAINT domain_ownership_registry_domain_key_key UNIQUE (domain_key);


--
-- Name: domain_ownership_registry domain_ownership_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain_ownership_registry
    ADD CONSTRAINT domain_ownership_registry_pkey PRIMARY KEY (id);


--
-- Name: dual_authority_challenges dual_authority_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dual_authority_challenges
    ADD CONSTRAINT dual_authority_challenges_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_commands ecosystem_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_commands
    ADD CONSTRAINT ecosystem_commands_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_contracts ecosystem_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_contracts
    ADD CONSTRAINT ecosystem_contracts_pkey PRIMARY KEY (id);


--
-- Name: ecosystem_events ecosystem_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ecosystem_events
    ADD CONSTRAINT ecosystem_events_pkey PRIMARY KEY (id);


--
-- Name: environment_configs environment_configs_env_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.environment_configs
    ADD CONSTRAINT environment_configs_env_key_key UNIQUE (env_key);


--
-- Name: environment_configs environment_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.environment_configs
    ADD CONSTRAINT environment_configs_pkey PRIMARY KEY (id);


--
-- Name: flagship_loops flagship_loops_loop_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flagship_loops
    ADD CONSTRAINT flagship_loops_loop_key_key UNIQUE (loop_key);


--
-- Name: flagship_loops flagship_loops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flagship_loops
    ADD CONSTRAINT flagship_loops_pkey PRIMARY KEY (id);


--
-- Name: founder_directives founder_directives_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.founder_directives
    ADD CONSTRAINT founder_directives_pkey PRIMARY KEY (id);


--
-- Name: gift_tracker gift_tracker_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gift_tracker
    ADD CONSTRAINT gift_tracker_pkey PRIMARY KEY (id);


--
-- Name: graph_edges graph_edges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.graph_edges
    ADD CONSTRAINT graph_edges_pkey PRIMARY KEY (id);


--
-- Name: grocery_items grocery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_items
    ADD CONSTRAINT grocery_items_pkey PRIMARY KEY (id);


--
-- Name: grocery_lists grocery_lists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_lists
    ADD CONSTRAINT grocery_lists_pkey PRIMARY KEY (id);


--
-- Name: health_validation_results health_validation_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_validation_results
    ADD CONSTRAINT health_validation_results_pkey PRIMARY KEY (id);


--
-- Name: incidents incidents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidents
    ADD CONSTRAINT incidents_pkey PRIMARY KEY (id);


--
-- Name: layer_health_snapshots layer_health_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layer_health_snapshots
    ADD CONSTRAINT layer_health_snapshots_pkey PRIMARY KEY (id);


--
-- Name: lead_inbox_items lead_inbox_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_inbox_items
    ADD CONSTRAINT lead_inbox_items_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: license_activations license_activations_license_id_device_fingerprint_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_activations
    ADD CONSTRAINT license_activations_license_id_device_fingerprint_key UNIQUE (license_id, device_fingerprint);


--
-- Name: license_activations license_activations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_activations
    ADD CONSTRAINT license_activations_pkey PRIMARY KEY (id);


--
-- Name: license_audit_log license_audit_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_audit_log
    ADD CONSTRAINT license_audit_log_pkey PRIMARY KEY (id);


--
-- Name: licenses licenses_license_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_license_key_key UNIQUE (license_key);


--
-- Name: licenses licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.licenses
    ADD CONSTRAINT licenses_pkey PRIMARY KEY (id);


--
-- Name: managed_apps managed_apps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.managed_apps
    ADD CONSTRAINT managed_apps_pkey PRIMARY KEY (id);


--
-- Name: mobile_push_tokens mobile_push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobile_push_tokens
    ADD CONSTRAINT mobile_push_tokens_pkey PRIMARY KEY (id);


--
-- Name: mobile_push_tokens mobile_push_tokens_user_id_transport_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobile_push_tokens
    ADD CONSTRAINT mobile_push_tokens_user_id_transport_token_key UNIQUE (user_id, transport, token);


--
-- Name: notification_delivery_receipts notification_delivery_receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_delivery_receipts
    ADD CONSTRAINT notification_delivery_receipts_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_channel_scope_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_channel_scope_key UNIQUE (user_id, channel, scope);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: onboarding_choices onboarding_choices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_choices
    ADD CONSTRAINT onboarding_choices_pkey PRIMARY KEY (id);


--
-- Name: onboarding_completion_markers onboarding_completion_markers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_completion_markers
    ADD CONSTRAINT onboarding_completion_markers_pkey PRIMARY KEY (id);


--
-- Name: onboarding_hardware_detection onboarding_hardware_detection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_hardware_detection
    ADD CONSTRAINT onboarding_hardware_detection_pkey PRIMARY KEY (id);


--
-- Name: onboarding_restore_sources onboarding_restore_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_restore_sources
    ADD CONSTRAINT onboarding_restore_sources_pkey PRIMARY KEY (id);


--
-- Name: onboarding_sessions onboarding_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_sessions
    ADD CONSTRAINT onboarding_sessions_pkey PRIMARY KEY (id);


--
-- Name: onboarding_steps onboarding_steps_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_steps
    ADD CONSTRAINT onboarding_steps_pkey PRIMARY KEY (id);


--
-- Name: org_members org_members_org_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_org_id_user_id_key UNIQUE (org_id, user_id);


--
-- Name: org_members org_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


--
-- Name: os_audit_events os_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_audit_events
    ADD CONSTRAINT os_audit_events_pkey PRIMARY KEY (id);


--
-- Name: os_auth_methods os_auth_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_auth_methods
    ADD CONSTRAINT os_auth_methods_pkey PRIMARY KEY (id);


--
-- Name: os_capabilities os_capabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_capabilities
    ADD CONSTRAINT os_capabilities_pkey PRIMARY KEY (id);


--
-- Name: os_command_events os_command_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_command_events
    ADD CONSTRAINT os_command_events_pkey PRIMARY KEY (id);


--
-- Name: os_commands os_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_commands
    ADD CONSTRAINT os_commands_pkey PRIMARY KEY (id);


--
-- Name: os_elevation_tokens os_elevation_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_elevation_tokens
    ADD CONSTRAINT os_elevation_tokens_pkey PRIMARY KEY (id);


--
-- Name: os_keyrings os_keyrings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_keyrings
    ADD CONSTRAINT os_keyrings_pkey PRIMARY KEY (id);


--
-- Name: os_policies os_policies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_policies
    ADD CONSTRAINT os_policies_pkey PRIMARY KEY (id);


--
-- Name: os_role_capabilities os_role_capabilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_role_capabilities
    ADD CONSTRAINT os_role_capabilities_pkey PRIMARY KEY (id);


--
-- Name: os_secrets_metadata os_secrets_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_secrets_metadata
    ADD CONSTRAINT os_secrets_metadata_pkey PRIMARY KEY (id);


--
-- Name: os_service_identities os_service_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_service_identities
    ADD CONSTRAINT os_service_identities_pkey PRIMARY KEY (id);


--
-- Name: os_sessions os_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_sessions
    ADD CONSTRAINT os_sessions_pkey PRIMARY KEY (id);


--
-- Name: os_user_accounts os_user_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_user_accounts
    ADD CONSTRAINT os_user_accounts_pkey PRIMARY KEY (id);


--
-- Name: outcome_verifications outcome_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outcome_verifications
    ADD CONSTRAINT outcome_verifications_pkey PRIMARY KEY (id);


--
-- Name: plane_service_assignments plane_service_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plane_service_assignments
    ADD CONSTRAINT plane_service_assignments_pkey PRIMARY KEY (id);


--
-- Name: plane_service_assignments plane_service_assignments_plane_id_service_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plane_service_assignments
    ADD CONSTRAINT plane_service_assignments_plane_id_service_key_key UNIQUE (plane_id, service_key);


--
-- Name: platform_notifications platform_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_notifications
    ADD CONSTRAINT platform_notifications_pkey PRIMARY KEY (id);


--
-- Name: platform_planes platform_planes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_planes
    ADD CONSTRAINT platform_planes_pkey PRIMARY KEY (id);


--
-- Name: platform_planes platform_planes_plane_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_planes
    ADD CONSTRAINT platform_planes_plane_key_key UNIQUE (plane_key);


--
-- Name: platform_runbooks platform_runbooks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.platform_runbooks
    ADD CONSTRAINT platform_runbooks_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: profit_signals profit_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profit_signals
    ADD CONSTRAINT profit_signals_pkey PRIMARY KEY (id);


--
-- Name: read_model_snapshots read_model_snapshots_model_type_subject_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.read_model_snapshots
    ADD CONSTRAINT read_model_snapshots_model_type_subject_id_key UNIQUE (model_type, subject_id);


--
-- Name: read_model_snapshots read_model_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.read_model_snapshots
    ADD CONSTRAINT read_model_snapshots_pkey PRIMARY KEY (id);


--
-- Name: recommendation_execution_bindings recommendation_execution_bindings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_bindings
    ADD CONSTRAINT recommendation_execution_bindings_pkey PRIMARY KEY (id);


--
-- Name: recommendation_execution_events recommendation_execution_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_events
    ADD CONSTRAINT recommendation_execution_events_pkey PRIMARY KEY (id);


--
-- Name: recommendation_learning_signals recommendation_learning_signals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_learning_signals
    ADD CONSTRAINT recommendation_learning_signals_pkey PRIMARY KEY (id);


--
-- Name: recommendation_outcome_verifications recommendation_outcome_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_outcome_verifications
    ADD CONSTRAINT recommendation_outcome_verifications_pkey PRIMARY KEY (id);


--
-- Name: release_compatibility_matrix release_compatibility_matrix_client_type_client_version_api_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_compatibility_matrix
    ADD CONSTRAINT release_compatibility_matrix_client_type_client_version_api_key UNIQUE (client_type, client_version, api_version);


--
-- Name: release_compatibility_matrix release_compatibility_matrix_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.release_compatibility_matrix
    ADD CONSTRAINT release_compatibility_matrix_pkey PRIMARY KEY (id);


--
-- Name: remediation_programs remediation_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remediation_programs
    ADD CONSTRAINT remediation_programs_pkey PRIMARY KEY (id);


--
-- Name: remediation_programs remediation_programs_program_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remediation_programs
    ADD CONSTRAINT remediation_programs_program_key_key UNIQUE (program_key);


--
-- Name: remediation_tasks remediation_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remediation_tasks
    ADD CONSTRAINT remediation_tasks_pkey PRIMARY KEY (id);


--
-- Name: remediation_tasks remediation_tasks_task_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remediation_tasks
    ADD CONSTRAINT remediation_tasks_task_key_key UNIQUE (task_key);


--
-- Name: rollback_events rollback_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rollback_events
    ADD CONSTRAINT rollback_events_pkey PRIMARY KEY (id);


--
-- Name: runtime_agents runtime_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.runtime_agents
    ADD CONSTRAINT runtime_agents_pkey PRIMARY KEY (id);


--
-- Name: school_activities school_activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_activities
    ADD CONSTRAINT school_activities_pkey PRIMARY KEY (id);


--
-- Name: service_identity_registry service_identity_registry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_identity_registry
    ADD CONSTRAINT service_identity_registry_pkey PRIMARY KEY (id);


--
-- Name: service_identity_registry service_identity_registry_service_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_identity_registry
    ADD CONSTRAINT service_identity_registry_service_key_key UNIQUE (service_key);


--
-- Name: service_providers_list service_providers_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_providers_list
    ADD CONSTRAINT service_providers_list_pkey PRIMARY KEY (id);


--
-- Name: simulations simulations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.simulations
    ADD CONSTRAINT simulations_pkey PRIMARY KEY (id);


--
-- Name: support_access_grants support_access_grants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_access_grants
    ADD CONSTRAINT support_access_grants_pkey PRIMARY KEY (id);


--
-- Name: support_case_events support_case_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_case_events
    ADD CONSTRAINT support_case_events_pkey PRIMARY KEY (id);


--
-- Name: support_cases support_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_cases
    ADD CONSTRAINT support_cases_pkey PRIMARY KEY (id);


--
-- Name: system_guarantees system_guarantees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_guarantees
    ADD CONSTRAINT system_guarantees_pkey PRIMARY KEY (id);


--
-- Name: system_slots system_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_slots
    ADD CONSTRAINT system_slots_pkey PRIMARY KEY (id);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: token_classes token_classes_class_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_classes
    ADD CONSTRAINT token_classes_class_key_key UNIQUE (class_key);


--
-- Name: token_classes token_classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token_classes
    ADD CONSTRAINT token_classes_pkey PRIMARY KEY (id);


--
-- Name: travel_plans travel_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.travel_plans
    ADD CONSTRAINT travel_plans_pkey PRIMARY KEY (id);


--
-- Name: update_boot_attempts update_boot_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_boot_attempts
    ADD CONSTRAINT update_boot_attempts_pkey PRIMARY KEY (id);


--
-- Name: update_catalog update_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_catalog
    ADD CONSTRAINT update_catalog_pkey PRIMARY KEY (id);


--
-- Name: update_channels update_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_channels
    ADD CONSTRAINT update_channels_pkey PRIMARY KEY (id);


--
-- Name: update_history update_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_history
    ADD CONSTRAINT update_history_pkey PRIMARY KEY (id);


--
-- Name: update_preflight_results update_preflight_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_preflight_results
    ADD CONSTRAINT update_preflight_results_pkey PRIMARY KEY (id);


--
-- Name: update_staging update_staging_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_staging
    ADD CONSTRAINT update_staging_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: vapid_keys vapid_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vapid_keys
    ADD CONSTRAINT vapid_keys_pkey PRIMARY KEY (id);


--
-- Name: idx_aap_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aap_user ON public.advisor_autonomy_policies USING btree (user_id);


--
-- Name: idx_aba_advisor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aba_advisor ON public.advisor_board_actions USING btree (user_id, advisor_id);


--
-- Name: idx_aba_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_aba_user_status ON public.advisor_board_actions USING btree (user_id, status);


--
-- Name: idx_abm_layer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abm_layer ON public.advisor_board_memory USING btree (user_id, memory_layer);


--
-- Name: idx_abm_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abm_status ON public.advisor_board_memory USING btree (status);


--
-- Name: idx_abm_user_advisor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abm_user_advisor ON public.advisor_board_memory USING btree (user_id, advisor_id);


--
-- Name: idx_abr_advisor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abr_advisor ON public.advisor_board_recommendations USING btree (user_id, advisor_id);


--
-- Name: idx_abr_urgency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abr_urgency ON public.advisor_board_recommendations USING btree (urgency_score DESC);


--
-- Name: idx_abr_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abr_user_status ON public.advisor_board_recommendations USING btree (user_id, status);


--
-- Name: idx_abrefl_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abrefl_user ON public.advisor_board_reflections USING btree (user_id, advisor_id);


--
-- Name: idx_abte_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abte_action ON public.advisor_board_tool_executions USING btree (action_id);


--
-- Name: idx_abte_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abte_user ON public.advisor_board_tool_executions USING btree (user_id);


--
-- Name: idx_abuse_events_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_abuse_events_user ON public.cloud_abuse_events USING btree (user_id, created_at DESC);


--
-- Name: idx_account_closure_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_account_closure_user ON public.cloud_account_closure_requests USING btree (user_id);


--
-- Name: idx_action_safety_class; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_action_safety_class ON public.action_safety_classifications USING btree (user_id, safety_class);


--
-- Name: idx_action_safety_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_action_safety_user ON public.action_safety_classifications USING btree (user_id);


--
-- Name: idx_activations_fingerprint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activations_fingerprint ON public.license_activations USING btree (device_fingerprint);


--
-- Name: idx_activations_license; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activations_license ON public.license_activations USING btree (license_id);


--
-- Name: idx_activity_journal_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_journal_user ON public.cloud_activity_journal USING btree (user_id, created_at DESC);


--
-- Name: idx_admin_audit_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_action ON public.admin_action_audit USING btree (action);


--
-- Name: idx_admin_audit_actor; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_actor ON public.admin_action_audit USING btree (actor_user_id);


--
-- Name: idx_admin_audit_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_created ON public.admin_action_audit USING btree (created_at DESC);


--
-- Name: idx_admin_audit_plane; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_audit_plane ON public.admin_action_audit USING btree (plane);


--
-- Name: idx_admin_sessions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_sessions_status ON public.admin_sessions USING btree (status);


--
-- Name: idx_admin_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_sessions_user ON public.admin_sessions USING btree (user_id);


--
-- Name: idx_advisor_feedback_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advisor_feedback_lookup ON public.advisor_feedback USING btree (user_id, advisor_id, domain);


--
-- Name: idx_advisor_knowledge_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advisor_knowledge_lookup ON public.advisor_knowledge USING btree (user_id, advisor_id, domain, status);


--
-- Name: idx_advisor_memories_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advisor_memories_lookup ON public.advisor_memories USING btree (user_id, advisor_id, domain, status);


--
-- Name: idx_ai_workforce_invocations_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_invocations_role ON public.ai_workforce_invocations USING btree (role_key);


--
-- Name: idx_ai_workforce_invocations_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_invocations_status ON public.ai_workforce_invocations USING btree (status);


--
-- Name: idx_ai_workforce_invocations_task; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_invocations_task ON public.ai_workforce_invocations USING btree (task_key);


--
-- Name: idx_ai_workforce_outputs_invocation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_outputs_invocation ON public.ai_workforce_outputs USING btree (invocation_id);


--
-- Name: idx_ai_workforce_rec_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_rec_domain ON public.ai_workforce_recommendations USING btree (domain);


--
-- Name: idx_ai_workforce_rec_exec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_rec_exec ON public.ai_workforce_recommendations USING btree (execution_required);


--
-- Name: idx_ai_workforce_rec_flagship; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_rec_flagship ON public.ai_workforce_recommendations USING btree (flagship_loop_key);


--
-- Name: idx_ai_workforce_rec_lifecycle; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_rec_lifecycle ON public.ai_workforce_recommendations USING btree (lifecycle_status);


--
-- Name: idx_ai_workforce_rec_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_rec_role ON public.ai_workforce_recommendations USING btree (role_key);


--
-- Name: idx_ai_workforce_rec_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_rec_status ON public.ai_workforce_recommendations USING btree (status);


--
-- Name: idx_ai_workforce_roles_council; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_roles_council ON public.ai_workforce_roles USING btree (council);


--
-- Name: idx_ai_workforce_roles_role_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_roles_role_key ON public.ai_workforce_roles USING btree (role_key);


--
-- Name: idx_ai_workforce_task_types_task_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_workforce_task_types_task_key ON public.ai_workforce_task_types USING btree (task_key);


--
-- Name: idx_approval_decisions_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_decisions_request_id ON public.approval_decisions USING btree (request_id);


--
-- Name: idx_approval_decisions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_decisions_user_id ON public.approval_decisions USING btree (user_id);


--
-- Name: idx_approval_queue_rec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_queue_rec ON public.ai_workforce_approval_queue USING btree (recommendation_id);


--
-- Name: idx_approval_queue_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_approval_queue_status ON public.ai_workforce_approval_queue USING btree (status);


--
-- Name: idx_archive_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_archive_jobs_status ON public.cloud_archive_jobs USING btree (status);


--
-- Name: idx_audit_event; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_event ON public.license_audit_log USING btree (event);


--
-- Name: idx_audit_license; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_license ON public.license_audit_log USING btree (license_id);


--
-- Name: idx_bhs_scored; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bhs_scored ON public.business_health_scores USING btree (scored_at DESC);


--
-- Name: idx_bhs_user_dim; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bhs_user_dim ON public.business_health_scores USING btree (user_id, dimension);


--
-- Name: idx_biometric_credentials_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_biometric_credentials_user_id ON public.biometric_credentials USING btree (user_id);


--
-- Name: idx_bootstrap_markers_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bootstrap_markers_user ON public.cloud_bootstrap_markers USING btree (user_id);


--
-- Name: idx_cached_outputs_cache_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cached_outputs_cache_key ON public.ai_workforce_cached_outputs USING btree (cache_key);


--
-- Name: idx_calendar_events_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_domain ON public.calendar_events USING btree (user_id, domain);


--
-- Name: idx_calendar_events_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_calendar_events_user_date ON public.calendar_events USING btree (user_id, event_date);


--
-- Name: idx_cloud_audit_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_audit_created ON public.cloud_audit_events USING btree (created_at DESC);


--
-- Name: idx_cloud_blobs_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_blobs_key ON public.cloud_blobs USING btree (storage_key);


--
-- Name: idx_cloud_blobs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_blobs_user ON public.cloud_blobs USING btree (user_id);


--
-- Name: idx_cloud_conflicts_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_conflicts_state ON public.cloud_conflicts USING btree (state);


--
-- Name: idx_cloud_conflicts_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_conflicts_user ON public.cloud_conflicts USING btree (user_id);


--
-- Name: idx_cloud_device_sessions_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_device_sessions_device ON public.cloud_device_sessions USING btree (device_id);


--
-- Name: idx_cloud_device_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_device_sessions_user ON public.cloud_device_sessions USING btree (user_id);


--
-- Name: idx_cloud_devices_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_devices_user ON public.cloud_devices USING btree (user_id);


--
-- Name: idx_cloud_file_versions_file; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_file_versions_file ON public.cloud_file_versions USING btree (file_id);


--
-- Name: idx_cloud_file_versions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_file_versions_user ON public.cloud_file_versions USING btree (user_id);


--
-- Name: idx_cloud_files_blob; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_files_blob ON public.cloud_files USING btree (blob_id);


--
-- Name: idx_cloud_files_folder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_files_folder ON public.cloud_files USING btree (folder_id);


--
-- Name: idx_cloud_files_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_files_user ON public.cloud_files USING btree (user_id);


--
-- Name: idx_cloud_folders_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_folders_parent ON public.cloud_folders USING btree (parent_id);


--
-- Name: idx_cloud_folders_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_folders_user ON public.cloud_folders USING btree (user_id);


--
-- Name: idx_cloud_shares_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_shares_owner ON public.cloud_shares USING btree (owner_user_id);


--
-- Name: idx_cloud_shares_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_shares_target ON public.cloud_shares USING btree (target_user_id);


--
-- Name: idx_cloud_sync_changes_object; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_sync_changes_object ON public.cloud_sync_changes USING btree (object_id);


--
-- Name: idx_cloud_sync_changes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_sync_changes_user ON public.cloud_sync_changes USING btree (user_id);


--
-- Name: idx_cloud_sync_checkpoints_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_cloud_sync_checkpoints_unique ON public.cloud_sync_checkpoints USING btree (user_id, device_id, namespace);


--
-- Name: idx_cloud_sync_objects_ns; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_sync_objects_ns ON public.cloud_sync_objects USING btree (user_id, namespace);


--
-- Name: idx_cloud_sync_objects_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_sync_objects_user ON public.cloud_sync_objects USING btree (user_id);


--
-- Name: idx_cloud_trash_purge; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_trash_purge ON public.cloud_trash USING btree (purge_after);


--
-- Name: idx_cloud_trash_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cloud_trash_user ON public.cloud_trash USING btree (user_id);


--
-- Name: idx_comm_metrics_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comm_metrics_created ON public.communication_metrics USING btree (created_at DESC);


--
-- Name: idx_comm_metrics_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comm_metrics_type ON public.communication_metrics USING btree (metric_type);


--
-- Name: idx_comm_metrics_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comm_metrics_user ON public.communication_metrics USING btree (user_id);


--
-- Name: idx_command_memory_user_intent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_command_memory_user_intent ON public.command_memory USING btree (user_id, intent);


--
-- Name: idx_command_steps_command_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_command_steps_command_id ON public.command_steps USING btree (command_id);


--
-- Name: idx_command_steps_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_command_steps_user_id ON public.command_steps USING btree (user_id);


--
-- Name: idx_compliance_hooks_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_compliance_hooks_target ON public.cloud_compliance_hooks USING btree (target_type, target_id);


--
-- Name: idx_connector_tokens_provider; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connector_tokens_provider ON public.connector_tokens USING btree (provider);


--
-- Name: idx_connector_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_connector_tokens_user_id ON public.connector_tokens USING btree (user_id);


--
-- Name: idx_context_graph_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_context_graph_type ON public.context_graph_snapshots USING btree (user_id, snapshot_type);


--
-- Name: idx_context_graph_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_context_graph_user ON public.context_graph_snapshots USING btree (user_id);


--
-- Name: idx_crm_communications_contact; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_communications_contact ON public.crm_communications USING btree (user_id, contact_id);


--
-- Name: idx_crm_companies_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_companies_user ON public.crm_companies USING btree (user_id);


--
-- Name: idx_crm_contacts_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_contacts_email ON public.crm_contacts USING btree (user_id, email);


--
-- Name: idx_crm_contacts_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_contacts_stage ON public.crm_contacts USING btree (user_id, lifecycle_stage);


--
-- Name: idx_crm_contacts_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_contacts_user ON public.crm_contacts USING btree (user_id);


--
-- Name: idx_crm_opportunities_stage; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_opportunities_stage ON public.crm_opportunities USING btree (user_id, stage);


--
-- Name: idx_crm_opportunities_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_opportunities_user ON public.crm_opportunities USING btree (user_id);


--
-- Name: idx_crm_tasks_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_crm_tasks_user ON public.crm_tasks USING btree (user_id, status);


--
-- Name: idx_device_attestations_device_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_attestations_device_id ON public.device_attestations USING btree (device_id);


--
-- Name: idx_device_attestations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_attestations_user_id ON public.device_attestations USING btree (user_id);


--
-- Name: idx_device_mesh_peers_online; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_mesh_peers_online ON public.device_mesh_peers USING btree (user_id, is_online);


--
-- Name: idx_device_mesh_peers_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_mesh_peers_user ON public.device_mesh_peers USING btree (user_id);


--
-- Name: idx_device_ownership_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_ownership_device ON public.device_ownership USING btree (device_id);


--
-- Name: idx_device_ownership_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_ownership_owner ON public.device_ownership USING btree (owner_user_id);


--
-- Name: idx_dual_authority_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dual_authority_user_status ON public.dual_authority_challenges USING btree (user_id, status);


--
-- Name: idx_ecosystem_commands_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ecosystem_commands_user_status ON public.ecosystem_commands USING btree (user_id, status);


--
-- Name: idx_ecosystem_events_user_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ecosystem_events_user_type ON public.ecosystem_events USING btree (user_id, event_type);


--
-- Name: idx_exec_bindings_rec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exec_bindings_rec ON public.recommendation_execution_bindings USING btree (recommendation_id);


--
-- Name: idx_exec_bindings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exec_bindings_status ON public.recommendation_execution_bindings USING btree (binding_status);


--
-- Name: idx_exec_bindings_team; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exec_bindings_team ON public.recommendation_execution_bindings USING btree (owner_team);


--
-- Name: idx_exec_bindings_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exec_bindings_type ON public.recommendation_execution_bindings USING btree (binding_type);


--
-- Name: idx_exec_events_binding; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exec_events_binding ON public.recommendation_execution_events USING btree (binding_id);


--
-- Name: idx_exec_events_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exec_events_type ON public.recommendation_execution_events USING btree (event_type);


--
-- Name: idx_flagship_loops_loop_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flagship_loops_loop_key ON public.flagship_loops USING btree (loop_key);


--
-- Name: idx_flagship_loops_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_flagship_loops_status ON public.flagship_loops USING btree (status);


--
-- Name: idx_founder_directives_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_founder_directives_domain ON public.founder_directives USING btree (domain_classification);


--
-- Name: idx_founder_directives_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_founder_directives_user_status ON public.founder_directives USING btree (user_id, status);


--
-- Name: idx_graph_edges_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_graph_edges_source ON public.graph_edges USING btree (source_node_type, source_node_id);


--
-- Name: idx_graph_edges_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_graph_edges_target ON public.graph_edges USING btree (target_node_type, target_node_id);


--
-- Name: idx_graph_edges_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_graph_edges_user_id ON public.graph_edges USING btree (user_id);


--
-- Name: idx_import_export_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_import_export_user ON public.cloud_import_export_jobs USING btree (user_id);


--
-- Name: idx_incidents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_status ON public.incidents USING btree (status);


--
-- Name: idx_incidents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_incidents_user_id ON public.incidents USING btree (user_id);


--
-- Name: idx_launch_honesty_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_launch_honesty_role ON public.ai_workforce_launch_honesty USING btree (role_key);


--
-- Name: idx_lead_inbox_items_urgency; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lead_inbox_items_urgency ON public.lead_inbox_items USING btree (urgency);


--
-- Name: idx_lead_inbox_items_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lead_inbox_items_user_status ON public.lead_inbox_items USING btree (user_id, triage_status);


--
-- Name: idx_leads_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leads_user_status ON public.leads USING btree (user_id, status);


--
-- Name: idx_learning_signals_rec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_signals_rec ON public.recommendation_learning_signals USING btree (recommendation_id);


--
-- Name: idx_learning_signals_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_learning_signals_type ON public.recommendation_learning_signals USING btree (signal_type);


--
-- Name: idx_licenses_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licenses_key ON public.licenses USING btree (license_key);


--
-- Name: idx_licenses_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licenses_user ON public.licenses USING btree (user_id);


--
-- Name: idx_lifecycle_rules_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lifecycle_rules_user ON public.cloud_lifecycle_rules USING btree (user_id);


--
-- Name: idx_managed_apps_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_managed_apps_key ON public.managed_apps USING btree (app_key);


--
-- Name: idx_managed_apps_user_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_managed_apps_user_device ON public.managed_apps USING btree (user_id, device_id);


--
-- Name: idx_metrics_snapshots_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metrics_snapshots_key ON public.cloud_metrics_snapshots USING btree (metric_key, snapshot_at DESC);


--
-- Name: idx_mobile_push_tokens_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mobile_push_tokens_status ON public.mobile_push_tokens USING btree (status) WHERE (status = 'active'::text);


--
-- Name: idx_mobile_push_tokens_transport; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mobile_push_tokens_transport ON public.mobile_push_tokens USING btree (transport, os);


--
-- Name: idx_mobile_push_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mobile_push_tokens_user_id ON public.mobile_push_tokens USING btree (user_id);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read) WHERE (NOT dismissed);


--
-- Name: idx_onboarding_choices_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_choices_session ON public.onboarding_choices USING btree (session_id);


--
-- Name: idx_onboarding_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_sessions_user ON public.onboarding_sessions USING btree (user_id);


--
-- Name: idx_onboarding_steps_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_onboarding_steps_session ON public.onboarding_steps USING btree (session_id);


--
-- Name: idx_org_members_org_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_members_org_id ON public.org_members USING btree (org_id);


--
-- Name: idx_org_members_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_org_members_user_id ON public.org_members USING btree (user_id);


--
-- Name: idx_os_audit_events_action; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_audit_events_action ON public.os_audit_events USING btree (action);


--
-- Name: idx_os_audit_events_severity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_audit_events_severity ON public.os_audit_events USING btree (severity);


--
-- Name: idx_os_audit_events_ts; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_audit_events_ts ON public.os_audit_events USING btree (ts DESC);


--
-- Name: idx_os_command_events_command; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_command_events_command ON public.os_command_events USING btree (command_id);


--
-- Name: idx_os_command_events_correlation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_command_events_correlation ON public.os_command_events USING btree (correlation_id);


--
-- Name: idx_os_commands_correlation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_commands_correlation ON public.os_commands USING btree (correlation_id);


--
-- Name: idx_os_commands_target_device; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_commands_target_device ON public.os_commands USING btree (target_device_id);


--
-- Name: idx_os_commands_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_commands_user_status ON public.os_commands USING btree (user_id, status);


--
-- Name: idx_os_policies_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_policies_key ON public.os_policies USING btree (policy_key);


--
-- Name: idx_os_policies_user_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_os_policies_user_domain ON public.os_policies USING btree (user_id, domain);


--
-- Name: idx_outcome_ver_rec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_outcome_ver_rec ON public.recommendation_outcome_verifications USING btree (recommendation_id);


--
-- Name: idx_outcome_ver_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_outcome_ver_status ON public.recommendation_outcome_verifications USING btree (verification_status);


--
-- Name: idx_outcome_verifications_rec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_outcome_verifications_rec ON public.outcome_verifications USING btree (recommendation_id);


--
-- Name: idx_platform_notifications_audience; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_notifications_audience ON public.platform_notifications USING btree (audience, target_user_id);


--
-- Name: idx_platform_notifications_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_notifications_created ON public.platform_notifications USING btree (created_at DESC);


--
-- Name: idx_platform_runbooks_tags; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_runbooks_tags ON public.platform_runbooks USING gin (tags);


--
-- Name: idx_platform_runbooks_user_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_platform_runbooks_user_domain ON public.platform_runbooks USING btree (user_id, domain);


--
-- Name: idx_preview_jobs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preview_jobs_status ON public.cloud_preview_jobs USING btree (status);


--
-- Name: idx_ps_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ps_category ON public.profit_signals USING btree (user_id, category);


--
-- Name: idx_ps_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ps_user_status ON public.profit_signals USING btree (user_id, status);


--
-- Name: idx_rec_scores_rec; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rec_scores_rec ON public.ai_workforce_recommendation_scores USING btree (recommendation_id);


--
-- Name: idx_reconciliation_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reconciliation_status ON public.cloud_reconciliation_runs USING btree (status);


--
-- Name: idx_remediation_programs_flagship; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_programs_flagship ON public.remediation_programs USING btree (flagship_loop_key);


--
-- Name: idx_remediation_programs_focus_area; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_programs_focus_area ON public.remediation_programs USING btree (focus_area);


--
-- Name: idx_remediation_programs_program_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_programs_program_key ON public.remediation_programs USING btree (program_key);


--
-- Name: idx_remediation_programs_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_programs_status ON public.remediation_programs USING btree (program_status);


--
-- Name: idx_remediation_tasks_journey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_tasks_journey ON public.remediation_tasks USING btree (related_customer_journey_key);


--
-- Name: idx_remediation_tasks_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_tasks_key ON public.remediation_tasks USING btree (task_key);


--
-- Name: idx_remediation_tasks_program; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_tasks_program ON public.remediation_tasks USING btree (program_id);


--
-- Name: idx_remediation_tasks_route; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_tasks_route ON public.remediation_tasks USING btree (related_route_key);


--
-- Name: idx_remediation_tasks_service; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_tasks_service ON public.remediation_tasks USING btree (related_service_key);


--
-- Name: idx_remediation_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_remediation_tasks_status ON public.remediation_tasks USING btree (task_status);


--
-- Name: idx_role_health_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_role_health_role ON public.ai_workforce_role_health USING btree (role_key);


--
-- Name: idx_rollback_events_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_rollback_events_user ON public.rollback_events USING btree (user_id);


--
-- Name: idx_runtime_agents_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_runtime_agents_status ON public.runtime_agents USING btree (status);


--
-- Name: idx_runtime_agents_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_runtime_agents_user_id ON public.runtime_agents USING btree (user_id);


--
-- Name: idx_search_index_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_index_name ON public.cloud_search_index USING gin (to_tsvector('english'::regconfig, name));


--
-- Name: idx_search_index_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_search_index_user ON public.cloud_search_index USING btree (user_id);


--
-- Name: idx_simulations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_simulations_user_id ON public.simulations USING btree (user_id);


--
-- Name: idx_support_grants_grantee; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_grants_grantee ON public.support_access_grants USING btree (granted_to_user_id);


--
-- Name: idx_support_grants_target; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_support_grants_target ON public.support_access_grants USING btree (target_user_id);


--
-- Name: idx_system_slots_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_system_slots_user ON public.system_slots USING btree (user_id);


--
-- Name: idx_tenant_memberships_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_memberships_tenant ON public.cloud_tenant_memberships USING btree (tenant_id);


--
-- Name: idx_tenant_memberships_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenant_memberships_user ON public.cloud_tenant_memberships USING btree (user_id);


--
-- Name: idx_timeline_events_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_events_created_at ON public.timeline_events USING btree (created_at DESC);


--
-- Name: idx_timeline_events_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_events_domain ON public.timeline_events USING btree (domain);


--
-- Name: idx_timeline_events_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_events_user_id ON public.timeline_events USING btree (user_id);


--
-- Name: idx_update_catalog_channel; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_update_catalog_channel ON public.update_catalog USING btree (channel);


--
-- Name: idx_update_history_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_update_history_user ON public.update_history USING btree (user_id);


--
-- Name: idx_worker_jobs_dead_letter; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_worker_jobs_dead_letter ON public.cloud_worker_jobs USING btree (dead_letter) WHERE (dead_letter = true);


--
-- Name: idx_worker_jobs_status_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_worker_jobs_status_priority ON public.cloud_worker_jobs USING btree (status, priority DESC, scheduled_at);


--
-- Name: action_safety_classifications update_action_safety_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_action_safety_updated_at BEFORE UPDATE ON public.action_safety_classifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_action_confirmations update_admin_confirmations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_confirmations_updated_at BEFORE UPDATE ON public.admin_action_confirmations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_role_permissions update_admin_role_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_role_permissions_updated_at BEFORE UPDATE ON public.admin_role_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_safety_actions update_admin_safety_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_safety_updated_at BEFORE UPDATE ON public.admin_safety_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_sessions update_admin_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_admin_sessions_updated_at BEFORE UPDATE ON public.admin_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_action_queue update_advisor_action_queue_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_action_queue_updated_at BEFORE UPDATE ON public.advisor_action_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_agents update_advisor_agents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_agents_updated_at BEFORE UPDATE ON public.advisor_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_autonomy_policies update_advisor_autonomy_policies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_autonomy_policies_updated_at BEFORE UPDATE ON public.advisor_autonomy_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_board_actions update_advisor_board_actions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_board_actions_updated_at BEFORE UPDATE ON public.advisor_board_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_board_memory update_advisor_board_memory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_board_memory_updated_at BEFORE UPDATE ON public.advisor_board_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_board_recommendations update_advisor_board_recommendations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_board_recommendations_updated_at BEFORE UPDATE ON public.advisor_board_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_board_reflections update_advisor_board_reflections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_board_reflections_updated_at BEFORE UPDATE ON public.advisor_board_reflections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_board_tool_executions update_advisor_board_tool_executions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_board_tool_executions_updated_at BEFORE UPDATE ON public.advisor_board_tool_executions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_knowledge update_advisor_knowledge_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_knowledge_updated_at BEFORE UPDATE ON public.advisor_knowledge FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_memories update_advisor_memories_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_memories_updated_at BEFORE UPDATE ON public.advisor_memories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_profiles update_advisor_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_advisor_profiles_updated_at BEFORE UPDATE ON public.advisor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_approval_queue update_ai_workforce_approval_queue_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_approval_queue_updated_at BEFORE UPDATE ON public.ai_workforce_approval_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_budget_classes update_ai_workforce_budget_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_budget_classes_updated_at BEFORE UPDATE ON public.ai_workforce_budget_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_cached_outputs update_ai_workforce_cached_outputs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_cached_outputs_updated_at BEFORE UPDATE ON public.ai_workforce_cached_outputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_invocations update_ai_workforce_invocations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_invocations_updated_at BEFORE UPDATE ON public.ai_workforce_invocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_launch_honesty update_ai_workforce_launch_honesty_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_launch_honesty_updated_at BEFORE UPDATE ON public.ai_workforce_launch_honesty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_recommendations update_ai_workforce_recommendations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_recommendations_updated_at BEFORE UPDATE ON public.ai_workforce_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_role_health update_ai_workforce_role_health_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_role_health_updated_at BEFORE UPDATE ON public.ai_workforce_role_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_roles update_ai_workforce_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_roles_updated_at BEFORE UPDATE ON public.ai_workforce_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_workforce_task_types update_ai_workforce_task_types_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_workforce_task_types_updated_at BEFORE UPDATE ON public.ai_workforce_task_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: api_gateway_routes update_api_gateway_routes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_api_gateway_routes_updated_at BEFORE UPDATE ON public.api_gateway_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: concierge_automations update_automations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.concierge_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: boardroom_decision_receipts update_boardroom_decision_receipts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_boardroom_decision_receipts_updated_at BEFORE UPDATE ON public.boardroom_decision_receipts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: boardroom_evidence update_boardroom_evidence_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_boardroom_evidence_updated_at BEFORE UPDATE ON public.boardroom_evidence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: boardroom_items update_boardroom_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_boardroom_items_updated_at BEFORE UPDATE ON public.boardroom_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: boardroom_recommendations update_boardroom_recommendations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_boardroom_recommendations_updated_at BEFORE UPDATE ON public.boardroom_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: boardroom_sessions update_boardroom_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_boardroom_sessions_updated_at BEFORE UPDATE ON public.boardroom_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_health_scores update_business_health_scores_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_health_scores_updated_at BEFORE UPDATE ON public.business_health_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: business_onboarding update_business_onboarding_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_business_onboarding_updated_at BEFORE UPDATE ON public.business_onboarding FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: calendar_events update_calendar_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: client_capability_matrix update_client_capability_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_client_capability_updated_at BEFORE UPDATE ON public.client_capability_matrix FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_abuse_events update_cloud_abuse_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_abuse_events_updated_at BEFORE UPDATE ON public.cloud_abuse_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_account_closure_requests update_cloud_account_closure_requests_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_account_closure_requests_updated_at BEFORE UPDATE ON public.cloud_account_closure_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_admin_role_assignments update_cloud_admin_role_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_admin_role_assignments_updated_at BEFORE UPDATE ON public.cloud_admin_role_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_admin_roles update_cloud_admin_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_admin_roles_updated_at BEFORE UPDATE ON public.cloud_admin_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_archive_jobs update_cloud_archive_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_archive_jobs_updated_at BEFORE UPDATE ON public.cloud_archive_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_backup_snapshots update_cloud_backup_snapshots_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_backup_snapshots_updated_at BEFORE UPDATE ON public.cloud_backup_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_compliance_hooks update_cloud_compliance_hooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_compliance_hooks_updated_at BEFORE UPDATE ON public.cloud_compliance_hooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_conflicts update_cloud_conflicts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_conflicts_updated_at BEFORE UPDATE ON public.cloud_conflicts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_device_sessions update_cloud_device_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_device_sessions_updated_at BEFORE UPDATE ON public.cloud_device_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_devices update_cloud_devices_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_devices_ts BEFORE UPDATE ON public.cloud_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_files update_cloud_files_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_files_updated_at BEFORE UPDATE ON public.cloud_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_feature_flags update_cloud_flags_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_flags_ts BEFORE UPDATE ON public.cloud_feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_folders update_cloud_folders_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_folders_updated_at BEFORE UPDATE ON public.cloud_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_import_export_jobs update_cloud_import_export_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_import_export_jobs_updated_at BEFORE UPDATE ON public.cloud_import_export_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_lifecycle_rules update_cloud_lifecycle_rules_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_lifecycle_rules_updated_at BEFORE UPDATE ON public.cloud_lifecycle_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_maintenance_modes update_cloud_maintenance_modes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_maintenance_modes_updated_at BEFORE UPDATE ON public.cloud_maintenance_modes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_namespace_registry update_cloud_namespace_registry_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_namespace_registry_updated_at BEFORE UPDATE ON public.cloud_namespace_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_plans update_cloud_plans_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_plans_ts BEFORE UPDATE ON public.cloud_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_policies update_cloud_policies_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_policies_ts BEFORE UPDATE ON public.cloud_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_preview_jobs update_cloud_preview_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_preview_jobs_updated_at BEFORE UPDATE ON public.cloud_preview_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_reconciliation_runs update_cloud_reconciliation_runs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_reconciliation_runs_updated_at BEFORE UPDATE ON public.cloud_reconciliation_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_search_index update_cloud_search_index_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_search_index_updated_at BEFORE UPDATE ON public.cloud_search_index FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_shared_workspaces update_cloud_shared_workspaces_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_shared_workspaces_updated_at BEFORE UPDATE ON public.cloud_shared_workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_shares update_cloud_shares_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_shares_updated_at BEFORE UPDATE ON public.cloud_shares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_storage_providers update_cloud_storage_providers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_storage_providers_updated_at BEFORE UPDATE ON public.cloud_storage_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_storage_tiers update_cloud_storage_tiers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_storage_tiers_updated_at BEFORE UPDATE ON public.cloud_storage_tiers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_storage_usage update_cloud_storage_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_storage_ts BEFORE UPDATE ON public.cloud_storage_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_support_sessions update_cloud_support_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_support_sessions_updated_at BEFORE UPDATE ON public.cloud_support_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_sync_checkpoints update_cloud_sync_checkpoints_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_sync_checkpoints_updated_at BEFORE UPDATE ON public.cloud_sync_checkpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_sync_jobs update_cloud_sync_jobs_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_sync_jobs_ts BEFORE UPDATE ON public.cloud_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_sync_objects update_cloud_sync_objects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_sync_objects_updated_at BEFORE UPDATE ON public.cloud_sync_objects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_tenant_memberships update_cloud_tenant_memberships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_tenant_memberships_updated_at BEFORE UPDATE ON public.cloud_tenant_memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_tenant_plans update_cloud_tenant_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_tenant_plans_updated_at BEFORE UPDATE ON public.cloud_tenant_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_tenant_policies update_cloud_tenant_policies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_tenant_policies_updated_at BEFORE UPDATE ON public.cloud_tenant_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_tenant_quotas update_cloud_tenant_quotas_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_tenant_quotas_updated_at BEFORE UPDATE ON public.cloud_tenant_quotas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_tenants update_cloud_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_tenants_updated_at BEFORE UPDATE ON public.cloud_tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_user_plans update_cloud_user_plans_ts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_user_plans_ts BEFORE UPDATE ON public.cloud_user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cloud_worker_jobs update_cloud_worker_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cloud_worker_jobs_updated_at BEFORE UPDATE ON public.cloud_worker_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: command_memory update_command_memory_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_command_memory_updated_at BEFORE UPDATE ON public.command_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: command_routing_decisions update_command_routing_decisions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_command_routing_decisions_updated_at BEFORE UPDATE ON public.command_routing_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: context_graph_snapshots update_context_graph_snapshots_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_context_graph_snapshots_updated_at BEFORE UPDATE ON public.context_graph_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_automations update_crm_automations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_automations_updated_at BEFORE UPDATE ON public.crm_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_communications update_crm_communications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_communications_updated_at BEFORE UPDATE ON public.crm_communications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_companies update_crm_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_companies_updated_at BEFORE UPDATE ON public.crm_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_contacts update_crm_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON public.crm_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_import_jobs update_crm_import_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_import_jobs_updated_at BEFORE UPDATE ON public.crm_import_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_notes update_crm_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_notes_updated_at BEFORE UPDATE ON public.crm_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_opportunities update_crm_opportunities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_opportunities_updated_at BEFORE UPDATE ON public.crm_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_pipeline_stages update_crm_pipeline_stages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_pipeline_stages_updated_at BEFORE UPDATE ON public.crm_pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_segments update_crm_segments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_segments_updated_at BEFORE UPDATE ON public.crm_segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: crm_tasks update_crm_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_crm_tasks_updated_at BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: device_mesh_peers update_device_mesh_peers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_device_mesh_peers_updated_at BEFORE UPDATE ON public.device_mesh_peers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: device_ownership update_device_ownership_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_device_ownership_updated_at BEFORE UPDATE ON public.device_ownership FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: concierge_documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.concierge_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: domain_ownership_registry update_domain_ownership_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_domain_ownership_updated_at BEFORE UPDATE ON public.domain_ownership_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: dual_authority_challenges update_dual_authority_challenges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_dual_authority_challenges_updated_at BEFORE UPDATE ON public.dual_authority_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ecosystem_commands update_ecosystem_commands_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ecosystem_commands_updated_at BEFORE UPDATE ON public.ecosystem_commands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ecosystem_contracts update_ecosystem_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ecosystem_contracts_updated_at BEFORE UPDATE ON public.ecosystem_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: environment_configs update_environment_configs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_environment_configs_updated_at BEFORE UPDATE ON public.environment_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: concierge_errands update_errands_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_errands_updated_at BEFORE UPDATE ON public.concierge_errands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: flagship_loops update_flagship_loops_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_flagship_loops_updated_at BEFORE UPDATE ON public.flagship_loops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: founder_directives update_founder_directives_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_founder_directives_updated_at BEFORE UPDATE ON public.founder_directives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: gift_tracker update_gift_tracker_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_gift_tracker_updated_at BEFORE UPDATE ON public.gift_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: graph_edges update_graph_edges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_graph_edges_updated_at BEFORE UPDATE ON public.graph_edges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: grocery_lists update_grocery_lists_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON public.grocery_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: incidents update_incidents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lead_inbox_items update_lead_inbox_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lead_inbox_items_updated_at BEFORE UPDATE ON public.lead_inbox_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: license_activations update_license_activations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_license_activations_updated_at BEFORE UPDATE ON public.license_activations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: licenses update_licenses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON public.licenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: managed_apps update_managed_apps_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_managed_apps_updated_at BEFORE UPDATE ON public.managed_apps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: mobile_push_tokens update_mobile_push_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_mobile_push_tokens_updated_at BEFORE UPDATE ON public.mobile_push_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notification_preferences update_notification_preferences_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notifications update_notifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: org_members update_org_members_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON public.org_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: os_auth_methods update_os_auth_methods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_os_auth_methods_updated_at BEFORE UPDATE ON public.os_auth_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: os_commands update_os_commands_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_os_commands_updated_at BEFORE UPDATE ON public.os_commands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: os_policies update_os_policies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_os_policies_updated_at BEFORE UPDATE ON public.os_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: os_secrets_metadata update_os_secrets_metadata_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_os_secrets_metadata_updated_at BEFORE UPDATE ON public.os_secrets_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: os_sessions update_os_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_os_sessions_updated_at BEFORE UPDATE ON public.os_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: os_user_accounts update_os_user_accounts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_os_user_accounts_updated_at BEFORE UPDATE ON public.os_user_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: outcome_verifications update_outcome_verifications_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_outcome_verifications_updated_at BEFORE UPDATE ON public.outcome_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: plane_service_assignments update_plane_service_assignments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_plane_service_assignments_updated_at BEFORE UPDATE ON public.plane_service_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: platform_planes update_platform_planes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_platform_planes_updated_at BEFORE UPDATE ON public.platform_planes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: platform_runbooks update_platform_runbooks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_platform_runbooks_updated_at BEFORE UPDATE ON public.platform_runbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profit_signals update_profit_signals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profit_signals_updated_at BEFORE UPDATE ON public.profit_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: read_model_snapshots update_read_model_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_read_model_updated_at BEFORE UPDATE ON public.read_model_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recommendation_execution_bindings update_recommendation_execution_bindings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recommendation_execution_bindings_updated_at BEFORE UPDATE ON public.recommendation_execution_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: concierge_recurring_obligations update_recurring_obligations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_recurring_obligations_updated_at BEFORE UPDATE ON public.concierge_recurring_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: release_compatibility_matrix update_release_compat_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_release_compat_updated_at BEFORE UPDATE ON public.release_compatibility_matrix FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: remediation_programs update_remediation_programs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_remediation_programs_updated_at BEFORE UPDATE ON public.remediation_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: remediation_tasks update_remediation_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_remediation_tasks_updated_at BEFORE UPDATE ON public.remediation_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: runtime_agents update_runtime_agents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_runtime_agents_updated_at BEFORE UPDATE ON public.runtime_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: school_activities update_school_activities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_school_activities_updated_at BEFORE UPDATE ON public.school_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_identity_registry update_service_identity_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_identity_updated_at BEFORE UPDATE ON public.service_identity_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: service_providers_list update_service_providers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_access_grants update_support_access_grants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_access_grants_updated_at BEFORE UPDATE ON public.support_access_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: support_cases update_support_cases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_support_cases_updated_at BEFORE UPDATE ON public.support_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_guarantees update_system_guarantees_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_system_guarantees_updated_at BEFORE UPDATE ON public.system_guarantees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: token_classes update_token_classes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_token_classes_updated_at BEFORE UPDATE ON public.token_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: travel_plans update_travel_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON public.travel_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: advisor_board_actions advisor_board_actions_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_actions
    ADD CONSTRAINT advisor_board_actions_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.advisor_board_recommendations(id) ON DELETE SET NULL;


--
-- Name: advisor_board_reflections advisor_board_reflections_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_reflections
    ADD CONSTRAINT advisor_board_reflections_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.advisor_board_recommendations(id) ON DELETE SET NULL;


--
-- Name: advisor_board_tool_executions advisor_board_tool_executions_action_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advisor_board_tool_executions
    ADD CONSTRAINT advisor_board_tool_executions_action_id_fkey FOREIGN KEY (action_id) REFERENCES public.advisor_board_actions(id) ON DELETE SET NULL;


--
-- Name: ai_workforce_approval_queue ai_workforce_approval_queue_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_approval_queue
    ADD CONSTRAINT ai_workforce_approval_queue_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE;


--
-- Name: ai_workforce_outputs ai_workforce_outputs_invocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_outputs
    ADD CONSTRAINT ai_workforce_outputs_invocation_id_fkey FOREIGN KEY (invocation_id) REFERENCES public.ai_workforce_invocations(id) ON DELETE CASCADE;


--
-- Name: ai_workforce_recommendation_scores ai_workforce_recommendation_scores_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_recommendation_scores
    ADD CONSTRAINT ai_workforce_recommendation_scores_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE;


--
-- Name: ai_workforce_recommendations ai_workforce_recommendations_invocation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_workforce_recommendations
    ADD CONSTRAINT ai_workforce_recommendations_invocation_id_fkey FOREIGN KEY (invocation_id) REFERENCES public.ai_workforce_invocations(id) ON DELETE SET NULL;


--
-- Name: boardroom_decision_receipts boardroom_decision_receipts_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_decision_receipts
    ADD CONSTRAINT boardroom_decision_receipts_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.boardroom_items(id) ON DELETE SET NULL;


--
-- Name: boardroom_decision_receipts boardroom_decision_receipts_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_decision_receipts
    ADD CONSTRAINT boardroom_decision_receipts_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.boardroom_recommendations(id) ON DELETE SET NULL;


--
-- Name: boardroom_decision_receipts boardroom_decision_receipts_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_decision_receipts
    ADD CONSTRAINT boardroom_decision_receipts_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.boardroom_sessions(id) ON DELETE SET NULL;


--
-- Name: boardroom_evidence boardroom_evidence_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_evidence
    ADD CONSTRAINT boardroom_evidence_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.boardroom_items(id) ON DELETE CASCADE;


--
-- Name: boardroom_items boardroom_items_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_items
    ADD CONSTRAINT boardroom_items_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.boardroom_sessions(id) ON DELETE SET NULL;


--
-- Name: boardroom_recommendations boardroom_recommendations_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_recommendations
    ADD CONSTRAINT boardroom_recommendations_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.boardroom_items(id) ON DELETE CASCADE;


--
-- Name: boardroom_recommendations boardroom_recommendations_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.boardroom_recommendations
    ADD CONSTRAINT boardroom_recommendations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.boardroom_sessions(id) ON DELETE SET NULL;


--
-- Name: cloud_account_closure_requests cloud_account_closure_requests_export_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_account_closure_requests
    ADD CONSTRAINT cloud_account_closure_requests_export_job_id_fkey FOREIGN KEY (export_job_id) REFERENCES public.cloud_import_export_jobs(id);


--
-- Name: cloud_admin_role_assignments cloud_admin_role_assignments_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_admin_role_assignments
    ADD CONSTRAINT cloud_admin_role_assignments_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.cloud_admin_roles(id) ON DELETE CASCADE;


--
-- Name: cloud_device_sessions cloud_device_sessions_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_device_sessions
    ADD CONSTRAINT cloud_device_sessions_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.cloud_devices(id) ON DELETE CASCADE;


--
-- Name: cloud_file_versions cloud_file_versions_blob_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_file_versions
    ADD CONSTRAINT cloud_file_versions_blob_id_fkey FOREIGN KEY (blob_id) REFERENCES public.cloud_blobs(id);


--
-- Name: cloud_file_versions cloud_file_versions_file_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_file_versions
    ADD CONSTRAINT cloud_file_versions_file_id_fkey FOREIGN KEY (file_id) REFERENCES public.cloud_files(id) ON DELETE CASCADE;


--
-- Name: cloud_files cloud_files_blob_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_files
    ADD CONSTRAINT cloud_files_blob_id_fkey FOREIGN KEY (blob_id) REFERENCES public.cloud_blobs(id);


--
-- Name: cloud_files cloud_files_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_files
    ADD CONSTRAINT cloud_files_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.cloud_folders(id) ON DELETE SET NULL;


--
-- Name: cloud_folders cloud_folders_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_folders
    ADD CONSTRAINT cloud_folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.cloud_folders(id) ON DELETE CASCADE;


--
-- Name: cloud_shared_workspaces cloud_shared_workspaces_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_shared_workspaces
    ADD CONSTRAINT cloud_shared_workspaces_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.cloud_tenants(id) ON DELETE CASCADE;


--
-- Name: cloud_storage_tiers cloud_storage_tiers_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_storage_tiers
    ADD CONSTRAINT cloud_storage_tiers_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.cloud_storage_providers(id);


--
-- Name: cloud_sync_changes cloud_sync_changes_object_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_sync_changes
    ADD CONSTRAINT cloud_sync_changes_object_id_fkey FOREIGN KEY (object_id) REFERENCES public.cloud_sync_objects(id) ON DELETE CASCADE;


--
-- Name: cloud_tenant_memberships cloud_tenant_memberships_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_memberships
    ADD CONSTRAINT cloud_tenant_memberships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.cloud_tenants(id) ON DELETE CASCADE;


--
-- Name: cloud_tenant_plans cloud_tenant_plans_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_plans
    ADD CONSTRAINT cloud_tenant_plans_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.cloud_plans(id);


--
-- Name: cloud_tenant_plans cloud_tenant_plans_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_plans
    ADD CONSTRAINT cloud_tenant_plans_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.cloud_tenants(id) ON DELETE CASCADE;


--
-- Name: cloud_tenant_policies cloud_tenant_policies_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_policies
    ADD CONSTRAINT cloud_tenant_policies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.cloud_tenants(id) ON DELETE CASCADE;


--
-- Name: cloud_tenant_quotas cloud_tenant_quotas_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_tenant_quotas
    ADD CONSTRAINT cloud_tenant_quotas_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.cloud_tenants(id) ON DELETE CASCADE;


--
-- Name: cloud_user_plans cloud_user_plans_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cloud_user_plans
    ADD CONSTRAINT cloud_user_plans_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.cloud_plans(id);


--
-- Name: command_routing_decisions command_routing_decisions_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_routing_decisions
    ADD CONSTRAINT command_routing_decisions_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.ecosystem_commands(id) ON DELETE CASCADE;


--
-- Name: command_steps command_steps_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.command_steps
    ADD CONSTRAINT command_steps_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.os_commands(id) ON DELETE CASCADE;


--
-- Name: config_change_history config_change_history_rollback_of_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.config_change_history
    ADD CONSTRAINT config_change_history_rollback_of_fkey FOREIGN KEY (rollback_of) REFERENCES public.config_change_history(id);


--
-- Name: crm_communications crm_communications_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_communications
    ADD CONSTRAINT crm_communications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.crm_companies(id) ON DELETE SET NULL;


--
-- Name: crm_communications crm_communications_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_communications
    ADD CONSTRAINT crm_communications_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_communications crm_communications_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_communications
    ADD CONSTRAINT crm_communications_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.crm_opportunities(id) ON DELETE SET NULL;


--
-- Name: crm_contact_company crm_contact_company_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contact_company
    ADD CONSTRAINT crm_contact_company_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.crm_companies(id) ON DELETE CASCADE;


--
-- Name: crm_contact_company crm_contact_company_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_contact_company
    ADD CONSTRAINT crm_contact_company_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE CASCADE;


--
-- Name: crm_notes crm_notes_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notes
    ADD CONSTRAINT crm_notes_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.crm_companies(id) ON DELETE SET NULL;


--
-- Name: crm_notes crm_notes_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notes
    ADD CONSTRAINT crm_notes_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE SET NULL;


--
-- Name: crm_notes crm_notes_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_notes
    ADD CONSTRAINT crm_notes_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.crm_opportunities(id) ON DELETE SET NULL;


--
-- Name: crm_opportunities crm_opportunities_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_opportunities
    ADD CONSTRAINT crm_opportunities_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.crm_companies(id) ON DELETE SET NULL;


--
-- Name: crm_opportunities crm_opportunities_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_opportunities
    ADD CONSTRAINT crm_opportunities_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE SET NULL;


--
-- Name: crm_opportunities crm_opportunities_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_opportunities
    ADD CONSTRAINT crm_opportunities_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.crm_pipeline_stages(id) ON DELETE SET NULL;


--
-- Name: crm_tasks crm_tasks_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.crm_companies(id) ON DELETE SET NULL;


--
-- Name: crm_tasks crm_tasks_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.crm_contacts(id) ON DELETE SET NULL;


--
-- Name: crm_tasks crm_tasks_opportunity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.crm_tasks
    ADD CONSTRAINT crm_tasks_opportunity_id_fkey FOREIGN KEY (opportunity_id) REFERENCES public.crm_opportunities(id) ON DELETE SET NULL;


--
-- Name: device_attestations device_attestations_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_attestations
    ADD CONSTRAINT device_attestations_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.cloud_devices(id) ON DELETE CASCADE;


--
-- Name: dual_authority_challenges dual_authority_challenges_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dual_authority_challenges
    ADD CONSTRAINT dual_authority_challenges_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.ecosystem_commands(id) ON DELETE CASCADE;


--
-- Name: grocery_items grocery_items_list_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grocery_items
    ADD CONSTRAINT grocery_items_list_id_fkey FOREIGN KEY (list_id) REFERENCES public.grocery_lists(id) ON DELETE CASCADE;


--
-- Name: health_validation_results health_validation_results_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_validation_results
    ADD CONSTRAINT health_validation_results_update_id_fkey FOREIGN KEY (update_id) REFERENCES public.update_catalog(id);


--
-- Name: health_validation_results health_validation_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_validation_results
    ADD CONSTRAINT health_validation_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: leads leads_inbox_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_inbox_item_id_fkey FOREIGN KEY (inbox_item_id) REFERENCES public.lead_inbox_items(id);


--
-- Name: license_activations license_activations_license_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_activations
    ADD CONSTRAINT license_activations_license_id_fkey FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;


--
-- Name: license_audit_log license_audit_log_license_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.license_audit_log
    ADD CONSTRAINT license_audit_log_license_id_fkey FOREIGN KEY (license_id) REFERENCES public.licenses(id) ON DELETE CASCADE;


--
-- Name: mobile_push_tokens mobile_push_tokens_rotated_from_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mobile_push_tokens
    ADD CONSTRAINT mobile_push_tokens_rotated_from_fkey FOREIGN KEY (rotated_from) REFERENCES public.mobile_push_tokens(id) ON DELETE SET NULL;


--
-- Name: onboarding_choices onboarding_choices_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_choices
    ADD CONSTRAINT onboarding_choices_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE;


--
-- Name: onboarding_completion_markers onboarding_completion_markers_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_completion_markers
    ADD CONSTRAINT onboarding_completion_markers_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE;


--
-- Name: onboarding_hardware_detection onboarding_hardware_detection_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_hardware_detection
    ADD CONSTRAINT onboarding_hardware_detection_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE;


--
-- Name: onboarding_restore_sources onboarding_restore_sources_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_restore_sources
    ADD CONSTRAINT onboarding_restore_sources_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE;


--
-- Name: onboarding_sessions onboarding_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_sessions
    ADD CONSTRAINT onboarding_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: onboarding_steps onboarding_steps_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onboarding_steps
    ADD CONSTRAINT onboarding_steps_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE;


--
-- Name: org_members org_members_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.org_members
    ADD CONSTRAINT org_members_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: os_command_events os_command_events_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.os_command_events
    ADD CONSTRAINT os_command_events_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.os_commands(id) ON DELETE CASCADE;


--
-- Name: outcome_verifications outcome_verifications_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.outcome_verifications
    ADD CONSTRAINT outcome_verifications_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE;


--
-- Name: plane_service_assignments plane_service_assignments_plane_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plane_service_assignments
    ADD CONSTRAINT plane_service_assignments_plane_id_fkey FOREIGN KEY (plane_id) REFERENCES public.platform_planes(id) ON DELETE CASCADE;


--
-- Name: recommendation_execution_bindings recommendation_execution_bindings_approval_queue_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_bindings
    ADD CONSTRAINT recommendation_execution_bindings_approval_queue_item_id_fkey FOREIGN KEY (approval_queue_item_id) REFERENCES public.ai_workforce_approval_queue(id) ON DELETE SET NULL;


--
-- Name: recommendation_execution_bindings recommendation_execution_bindings_linked_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_bindings
    ADD CONSTRAINT recommendation_execution_bindings_linked_program_id_fkey FOREIGN KEY (linked_program_id) REFERENCES public.remediation_programs(id) ON DELETE SET NULL;


--
-- Name: recommendation_execution_bindings recommendation_execution_bindings_linked_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_bindings
    ADD CONSTRAINT recommendation_execution_bindings_linked_task_id_fkey FOREIGN KEY (linked_task_id) REFERENCES public.remediation_tasks(id) ON DELETE SET NULL;


--
-- Name: recommendation_execution_bindings recommendation_execution_bindings_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_bindings
    ADD CONSTRAINT recommendation_execution_bindings_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE;


--
-- Name: recommendation_execution_events recommendation_execution_events_binding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_execution_events
    ADD CONSTRAINT recommendation_execution_events_binding_id_fkey FOREIGN KEY (binding_id) REFERENCES public.recommendation_execution_bindings(id) ON DELETE CASCADE;


--
-- Name: recommendation_learning_signals recommendation_learning_signals_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_learning_signals
    ADD CONSTRAINT recommendation_learning_signals_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE;


--
-- Name: recommendation_outcome_verifications recommendation_outcome_verifications_binding_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_outcome_verifications
    ADD CONSTRAINT recommendation_outcome_verifications_binding_id_fkey FOREIGN KEY (binding_id) REFERENCES public.recommendation_execution_bindings(id) ON DELETE SET NULL;


--
-- Name: recommendation_outcome_verifications recommendation_outcome_verifications_recommendation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recommendation_outcome_verifications
    ADD CONSTRAINT recommendation_outcome_verifications_recommendation_id_fkey FOREIGN KEY (recommendation_id) REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE;


--
-- Name: remediation_tasks remediation_tasks_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.remediation_tasks
    ADD CONSTRAINT remediation_tasks_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.remediation_programs(id) ON DELETE SET NULL;


--
-- Name: rollback_events rollback_events_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rollback_events
    ADD CONSTRAINT rollback_events_update_id_fkey FOREIGN KEY (update_id) REFERENCES public.update_catalog(id);


--
-- Name: rollback_events rollback_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rollback_events
    ADD CONSTRAINT rollback_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: support_case_events support_case_events_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.support_case_events
    ADD CONSTRAINT support_case_events_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.support_cases(id) ON DELETE CASCADE;


--
-- Name: system_guarantees system_guarantees_command_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_guarantees
    ADD CONSTRAINT system_guarantees_command_id_fkey FOREIGN KEY (command_id) REFERENCES public.ecosystem_commands(id) ON DELETE CASCADE;


--
-- Name: system_slots system_slots_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_slots
    ADD CONSTRAINT system_slots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: update_boot_attempts update_boot_attempts_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_boot_attempts
    ADD CONSTRAINT update_boot_attempts_update_id_fkey FOREIGN KEY (update_id) REFERENCES public.update_catalog(id);


--
-- Name: update_boot_attempts update_boot_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_boot_attempts
    ADD CONSTRAINT update_boot_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: update_channels update_channels_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_channels
    ADD CONSTRAINT update_channels_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: update_history update_history_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_history
    ADD CONSTRAINT update_history_update_id_fkey FOREIGN KEY (update_id) REFERENCES public.update_catalog(id);


--
-- Name: update_history update_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_history
    ADD CONSTRAINT update_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: update_preflight_results update_preflight_results_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_preflight_results
    ADD CONSTRAINT update_preflight_results_update_id_fkey FOREIGN KEY (update_id) REFERENCES public.update_catalog(id);


--
-- Name: update_preflight_results update_preflight_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_preflight_results
    ADD CONSTRAINT update_preflight_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: update_staging update_staging_update_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_staging
    ADD CONSTRAINT update_staging_update_id_fkey FOREIGN KEY (update_id) REFERENCES public.update_catalog(id);


--
-- Name: update_staging update_staging_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.update_staging
    ADD CONSTRAINT update_staging_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: cloud_abuse_events Admin can manage abuse events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage abuse events" ON public.cloud_abuse_events TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_admin_roles Admin can manage admin roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage admin roles" ON public.cloud_admin_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_backup_snapshots Admin can manage backups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage backups" ON public.cloud_backup_snapshots TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_compliance_hooks Admin can manage compliance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage compliance" ON public.cloud_compliance_hooks TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_maintenance_modes Admin can manage maintenance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage maintenance" ON public.cloud_maintenance_modes TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_metrics_snapshots Admin can manage metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage metrics" ON public.cloud_metrics_snapshots TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_namespace_registry Admin can manage namespaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage namespaces" ON public.cloud_namespace_registry TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_storage_providers Admin can manage providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage providers" ON public.cloud_storage_providers TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_reconciliation_runs Admin can manage reconciliation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage reconciliation" ON public.cloud_reconciliation_runs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_admin_role_assignments Admin can manage role assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage role assignments" ON public.cloud_admin_role_assignments TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_support_sessions Admin can manage support sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage support sessions" ON public.cloud_support_sessions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_tenant_plans Admin can manage tenant plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage tenant plans" ON public.cloud_tenant_plans TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_tenant_policies Admin can manage tenant policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage tenant policies" ON public.cloud_tenant_policies TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_tenant_quotas Admin can manage tenant quotas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage tenant quotas" ON public.cloud_tenant_quotas TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_storage_tiers Admin can manage tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage tiers" ON public.cloud_storage_tiers TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_worker_jobs Admin can manage worker jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage worker jobs" ON public.cloud_worker_jobs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_account_closure_requests Admin can view account closure; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view account closure" ON public.cloud_account_closure_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_activity_journal Admin can view activity journal; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view activity journal" ON public.cloud_activity_journal FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_archive_jobs Admin can view archive jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view archive jobs" ON public.cloud_archive_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_bootstrap_markers Admin can view bootstrap markers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view bootstrap markers" ON public.cloud_bootstrap_markers FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_import_export_jobs Admin can view import export; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view import export" ON public.cloud_import_export_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_lifecycle_rules Admin can view lifecycle rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view lifecycle rules" ON public.cloud_lifecycle_rules FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_preview_jobs Admin can view preview jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view preview jobs" ON public.cloud_preview_jobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_search_index Admin can view search index; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view search index" ON public.cloud_search_index FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_action_confirmations Admins can create confirmations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create confirmations" ON public.admin_action_confirmations FOR INSERT TO authenticated WITH CHECK ((auth.uid() = actor_user_id));


--
-- Name: admin_action_audit Admins can insert audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert audit" ON public.admin_action_audit FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: config_change_history Admins can insert config changes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert config changes" ON public.config_change_history FOR INSERT TO authenticated WITH CHECK ((auth.uid() = actor_user_id));


--
-- Name: device_ownership Admins can manage all devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all devices" ON public.device_ownership TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: plane_service_assignments Admins can manage assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage assignments" ON public.plane_service_assignments TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: client_capability_matrix Admins can manage client capabilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage client capabilities" ON public.client_capability_matrix TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text)) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'::text));


--
-- Name: domain_ownership_registry Admins can manage domain ownership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage domain ownership" ON public.domain_ownership_registry TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text)) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'::text));


--
-- Name: environment_configs Admins can manage envs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage envs" ON public.environment_configs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: support_access_grants Admins can manage grants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage grants" ON public.support_access_grants TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_role_permissions Admins can manage permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage permissions" ON public.admin_role_permissions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: platform_planes Admins can manage planes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage planes" ON public.platform_planes TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: release_compatibility_matrix Admins can manage release compat; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage release compat" ON public.release_compatibility_matrix TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text)) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'::text));


--
-- Name: api_gateway_routes Admins can manage routes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage routes" ON public.api_gateway_routes TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_safety_actions Admins can manage safety actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage safety actions" ON public.admin_safety_actions TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text)) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'::text));


--
-- Name: service_identity_registry Admins can manage service identities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage service identities" ON public.service_identity_registry TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text)) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'::text));


--
-- Name: admin_sessions Admins can manage sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage sessions" ON public.admin_sessions TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: token_classes Admins can manage tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage tokens" ON public.token_classes TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_action_confirmations Admins can update confirmations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update confirmations" ON public.admin_action_confirmations FOR UPDATE TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'::text));


--
-- Name: platform_notifications Admins can view admin notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view admin notifications" ON public.platform_notifications FOR SELECT TO authenticated USING (((audience = 'admin'::text) AND public.has_admin_permission(auth.uid(), 'security.audit'::text)));


--
-- Name: device_ownership Admins can view all devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all devices" ON public.device_ownership FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_sessions Admins can view all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all sessions" ON public.admin_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: admin_action_audit Admins can view audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view audit" ON public.admin_action_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: config_change_history Admins can view config history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view config history" ON public.config_change_history FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'::text));


--
-- Name: admin_action_confirmations Admins can view confirmations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view confirmations" ON public.admin_action_confirmations FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'::text));


--
-- Name: read_model_snapshots Admins can view read model snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view read model snapshots" ON public.read_model_snapshots FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'::text));


--
-- Name: cloud_audit_events Admins insert audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins insert audit" ON public.cloud_audit_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_feature_flags Admins manage flags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage flags" ON public.cloud_feature_flags TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_plans Admins manage plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage plans" ON public.cloud_plans TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_policies Admins manage policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage policies" ON public.cloud_policies TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_sync_jobs Admins manage sync jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage sync jobs" ON public.cloud_sync_jobs TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_user_plans Admins manage user plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage user plans" ON public.cloud_user_plans TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: vapid_keys Admins manage vapid_keys; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage vapid_keys" ON public.vapid_keys TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_blobs Admins view all blobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all blobs" ON public.cloud_blobs FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_sync_checkpoints Admins view all checkpoints; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all checkpoints" ON public.cloud_sync_checkpoints FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_conflicts Admins view all conflicts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all conflicts" ON public.cloud_conflicts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_devices Admins view all devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all devices" ON public.cloud_devices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_files Admins view all files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all files" ON public.cloud_files FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_folders Admins view all folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all folders" ON public.cloud_folders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_device_sessions Admins view all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all sessions" ON public.cloud_device_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_shares Admins view all shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all shares" ON public.cloud_shares FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_storage_usage Admins view all storage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all storage" ON public.cloud_storage_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_sync_changes Admins view all sync changes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all sync changes" ON public.cloud_sync_changes FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_sync_objects Admins view all sync objects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all sync objects" ON public.cloud_sync_objects FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_trash Admins view all trash; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all trash" ON public.cloud_trash FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_file_versions Admins view all versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view all versions" ON public.cloud_file_versions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: cloud_audit_events Admins view audit; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins view audit" ON public.cloud_audit_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: update_catalog Anyone can read update catalog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read update catalog" ON public.update_catalog FOR SELECT USING (true);


--
-- Name: cloud_policies Anyone reads policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone reads policies" ON public.cloud_policies FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_plans Anyone views plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone views plans" ON public.cloud_plans FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_tenants Auth users can create tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can create tenants" ON public.cloud_tenants FOR INSERT TO authenticated WITH CHECK ((owner_user_id = auth.uid()));


--
-- Name: cloud_admin_roles Auth users can view admin roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view admin roles" ON public.cloud_admin_roles FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_maintenance_modes Auth users can view maintenance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view maintenance" ON public.cloud_maintenance_modes FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_metrics_snapshots Auth users can view metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view metrics" ON public.cloud_metrics_snapshots FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_namespace_registry Auth users can view namespaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view namespaces" ON public.cloud_namespace_registry FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_storage_providers Auth users can view providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view providers" ON public.cloud_storage_providers FOR SELECT TO authenticated USING (true);


--
-- Name: cloud_storage_tiers Auth users can view tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Auth users can view tiers" ON public.cloud_storage_tiers FOR SELECT TO authenticated USING (true);


--
-- Name: plane_service_assignments Authenticated can view assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view assignments" ON public.plane_service_assignments FOR SELECT TO authenticated USING (true);


--
-- Name: environment_configs Authenticated can view envs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view envs" ON public.environment_configs FOR SELECT TO authenticated USING (true);


--
-- Name: admin_role_permissions Authenticated can view permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view permissions" ON public.admin_role_permissions FOR SELECT TO authenticated USING (true);


--
-- Name: platform_planes Authenticated can view planes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view planes" ON public.platform_planes FOR SELECT TO authenticated USING (true);


--
-- Name: api_gateway_routes Authenticated can view routes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view routes" ON public.api_gateway_routes FOR SELECT TO authenticated USING (true);


--
-- Name: token_classes Authenticated can view tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated can view tokens" ON public.token_classes FOR SELECT TO authenticated USING (true);


--
-- Name: client_capability_matrix Authenticated users can view client capabilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view client capabilities" ON public.client_capability_matrix FOR SELECT TO authenticated USING (true);


--
-- Name: domain_ownership_registry Authenticated users can view domain ownership; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view domain ownership" ON public.domain_ownership_registry FOR SELECT TO authenticated USING (true);


--
-- Name: profiles Authenticated users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: release_compatibility_matrix Authenticated users can view release compat; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view release compat" ON public.release_compatibility_matrix FOR SELECT TO authenticated USING (true);


--
-- Name: admin_safety_actions Authenticated users can view safety actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view safety actions" ON public.admin_safety_actions FOR SELECT TO authenticated USING (true);


--
-- Name: service_identity_registry Authenticated users can view service identities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view service identities" ON public.service_identity_registry FOR SELECT TO authenticated USING (true);


--
-- Name: support_access_grants Grantee can view own grants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Grantee can view own grants" ON public.support_access_grants FOR SELECT TO authenticated USING ((auth.uid() = granted_to_user_id));


--
-- Name: cloud_tenant_memberships Members can view memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view memberships" ON public.cloud_tenant_memberships FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: org_members Members can view org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view org members" ON public.org_members FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), org_id));


--
-- Name: organizations Members can view their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Members can view their organization" ON public.organizations FOR SELECT TO authenticated USING (public.is_org_member(auth.uid(), id));


--
-- Name: cloud_tenant_memberships Own membership or admin can delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own membership or admin can delete" ON public.cloud_tenant_memberships FOR DELETE TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenant_memberships Own membership or admin can update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Own membership or admin can update" ON public.cloud_tenant_memberships FOR UPDATE TO authenticated USING (((user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenants Owner can delete tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can delete tenant" ON public.cloud_tenants FOR DELETE TO authenticated USING (((owner_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenants Owner can update tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner can update tenant" ON public.cloud_tenants FOR UPDATE TO authenticated USING (((owner_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_shared_workspaces Owner or admin can delete workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner or admin can delete workspace" ON public.cloud_shared_workspaces FOR DELETE TO authenticated USING (((owner_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_shared_workspaces Owner or admin can update workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owner or admin can update workspace" ON public.cloud_shared_workspaces FOR UPDATE TO authenticated USING (((owner_user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: org_members Owners can add org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can add org members" ON public.org_members FOR INSERT TO authenticated WITH CHECK (public.is_org_owner(auth.uid(), org_id));


--
-- Name: organizations Owners can delete their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can delete their organization" ON public.organizations FOR DELETE TO authenticated USING ((owner_id = auth.uid()));


--
-- Name: org_members Owners can remove org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can remove org members" ON public.org_members FOR DELETE TO authenticated USING (public.is_org_owner(auth.uid(), org_id));


--
-- Name: org_members Owners can update org members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update org members" ON public.org_members FOR UPDATE TO authenticated USING (public.is_org_owner(auth.uid(), org_id));


--
-- Name: organizations Owners can update their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners can update their organization" ON public.organizations FOR UPDATE TO authenticated USING ((owner_id = auth.uid()));


--
-- Name: cloud_shares Owners manage own shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Owners manage own shares" ON public.cloud_shares TO authenticated USING ((auth.uid() = owner_user_id)) WITH CHECK ((auth.uid() = owner_user_id));


--
-- Name: support_case_events Support agents can add events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Support agents can add events" ON public.support_case_events FOR INSERT TO authenticated WITH CHECK (public.has_admin_permission(auth.uid(), 'support.cases'::text));


--
-- Name: support_cases Support agents can update all cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Support agents can update all cases" ON public.support_cases FOR UPDATE TO authenticated USING (public.has_admin_permission(auth.uid(), 'support.cases'::text));


--
-- Name: support_case_events Support agents can view all case events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Support agents can view all case events" ON public.support_case_events FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'support.cases'::text));


--
-- Name: support_cases Support agents can view all cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Support agents can view all cases" ON public.support_cases FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'support.cases'::text));


--
-- Name: platform_notifications Support can view support notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Support can view support notifications" ON public.platform_notifications FOR SELECT TO authenticated USING (((audience = 'support'::text) AND public.has_admin_permission(auth.uid(), 'support.cases'::text)));


--
-- Name: cloud_support_sessions Support user can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Support user can view own sessions" ON public.cloud_support_sessions FOR SELECT TO authenticated USING ((support_user_id = auth.uid()));


--
-- Name: read_model_snapshots System can manage read model snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage read model snapshots" ON public.read_model_snapshots TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin'::text)) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'::text));


--
-- Name: support_access_grants Target user can view grants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Target user can view grants" ON public.support_access_grants FOR SELECT TO authenticated USING ((auth.uid() = target_user_id));


--
-- Name: cloud_shares Targets can view shares; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Targets can view shares" ON public.cloud_shares FOR SELECT TO authenticated USING ((auth.uid() = target_user_id));


--
-- Name: cloud_shared_workspaces Tenant members can create workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can create workspaces" ON public.cloud_shared_workspaces FOR INSERT TO authenticated WITH CHECK (public.is_tenant_member(auth.uid(), tenant_id));


--
-- Name: cloud_tenant_memberships Tenant members can insert memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can insert memberships" ON public.cloud_tenant_memberships FOR INSERT TO authenticated WITH CHECK ((public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenants Tenant members can view; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can view" ON public.cloud_tenants FOR SELECT TO authenticated USING ((public.is_tenant_member(auth.uid(), id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenant_plans Tenant members can view plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can view plans" ON public.cloud_tenant_plans FOR SELECT TO authenticated USING ((public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenant_policies Tenant members can view policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can view policies" ON public.cloud_tenant_policies FOR SELECT TO authenticated USING ((public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_tenant_quotas Tenant members can view quotas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can view quotas" ON public.cloud_tenant_quotas FOR SELECT TO authenticated USING ((public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: cloud_shared_workspaces Tenant members can view workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant members can view workspaces" ON public.cloud_shared_workspaces FOR SELECT TO authenticated USING ((public.is_tenant_member(auth.uid(), tenant_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: support_case_events Users can add events to own cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can add events to own cases" ON public.support_case_events FOR INSERT TO authenticated WITH CHECK (((auth.uid() = actor_user_id) AND (EXISTS ( SELECT 1
   FROM public.support_cases sc
  WHERE ((sc.id = support_case_events.case_id) AND (sc.user_id = auth.uid()))))));


--
-- Name: organizations Users can create organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create organizations" ON public.organizations FOR INSERT TO authenticated WITH CHECK ((owner_id = auth.uid()));


--
-- Name: calendar_events Users can create own calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own calendar events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_command_events Users can create own command events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own command events" ON public.os_command_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_commands Users can create own commands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own commands" ON public.os_commands FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: managed_apps Users can create own managed apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own managed apps" ON public.managed_apps FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_policies Users can create own policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own policies" ON public.os_policies FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: support_cases Users can create support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create support cases" ON public.support_cases FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_profiles Users can create their own advisor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own advisor profiles" ON public.advisor_profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: founder_directives Users can create their own directives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own directives" ON public.founder_directives FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: platform_runbooks Users can create their own runbooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own runbooks" ON public.platform_runbooks FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: calendar_events Users can delete own calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own calendar events" ON public.calendar_events FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: os_commands Users can delete own commands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own commands" ON public.os_commands FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: managed_apps Users can delete own managed apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own managed apps" ON public.managed_apps FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: os_policies Users can delete own policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own policies" ON public.os_policies FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: license_activations Users can delete their own activations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own activations" ON public.license_activations FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.licenses l
  WHERE ((l.id = license_activations.license_id) AND (l.user_id = auth.uid())))));


--
-- Name: advisor_profiles Users can delete their own advisor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own advisor profiles" ON public.advisor_profiles FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: founder_directives Users can delete their own directives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own directives" ON public.founder_directives FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Users can delete their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can delete their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: platform_runbooks Users can delete their own runbooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own runbooks" ON public.platform_runbooks FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: license_audit_log Users can insert audit logs for their licenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert audit logs for their licenses" ON public.license_audit_log FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.licenses l
  WHERE ((l.id = license_audit_log.license_id) AND (l.user_id = auth.uid())))));


--
-- Name: platform_notifications Users can insert own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own notifications" ON public.platform_notifications FOR INSERT TO authenticated WITH CHECK (((target_user_id = auth.uid()) OR public.has_admin_permission(auth.uid(), 'platform.admin'::text)));


--
-- Name: license_activations Users can insert their own activations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own activations" ON public.license_activations FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.licenses l
  WHERE ((l.id = license_activations.license_id) AND (l.user_id = auth.uid())))));


--
-- Name: licenses Users can insert their own licenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own licenses" ON public.licenses FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: notifications Users can insert their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: device_ownership Users can manage own devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own devices" ON public.device_ownership FOR UPDATE TO authenticated USING ((auth.uid() = owner_user_id));


--
-- Name: device_ownership Users can register devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can register devices" ON public.device_ownership FOR INSERT TO authenticated WITH CHECK ((auth.uid() = owner_user_id));


--
-- Name: calendar_events Users can update own calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own calendar events" ON public.calendar_events FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: support_cases Users can update own cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own cases" ON public.support_cases FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: os_commands Users can update own commands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own commands" ON public.os_commands FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: managed_apps Users can update own managed apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own managed apps" ON public.managed_apps FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: platform_notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.platform_notifications FOR UPDATE TO authenticated USING (((audience = 'user'::text) AND (target_user_id = auth.uid())));


--
-- Name: os_policies Users can update own policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own policies" ON public.os_policies FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: license_activations Users can update their own activations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own activations" ON public.license_activations FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.licenses l
  WHERE ((l.id = license_activations.license_id) AND (l.user_id = auth.uid())))));


--
-- Name: advisor_profiles Users can update their own advisor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own advisor profiles" ON public.advisor_profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: founder_directives Users can update their own directives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own directives" ON public.founder_directives FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: licenses Users can update their own licenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own licenses" ON public.licenses FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: platform_runbooks Users can update their own runbooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own runbooks" ON public.platform_runbooks FOR UPDATE TO authenticated USING ((auth.uid() = user_id));


--
-- Name: calendar_events Users can view own calendar events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own calendar events" ON public.calendar_events FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: support_case_events Users can view own case events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own case events" ON public.support_case_events FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.support_cases sc
  WHERE ((sc.id = support_case_events.case_id) AND (sc.user_id = auth.uid())))));


--
-- Name: os_command_events Users can view own command events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own command events" ON public.os_command_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: os_commands Users can view own commands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own commands" ON public.os_commands FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: device_ownership Users can view own devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own devices" ON public.device_ownership FOR SELECT TO authenticated USING ((auth.uid() = owner_user_id));


--
-- Name: managed_apps Users can view own managed apps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own managed apps" ON public.managed_apps FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: platform_notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.platform_notifications FOR SELECT TO authenticated USING (((audience = 'user'::text) AND (target_user_id = auth.uid())));


--
-- Name: os_policies Users can view own policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own policies" ON public.os_policies FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: cloud_admin_role_assignments Users can view own role assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own role assignments" ON public.cloud_admin_role_assignments FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: admin_sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.admin_sessions FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: support_cases Users can view own support cases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own support cases" ON public.support_cases FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: license_activations Users can view their own activations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own activations" ON public.license_activations FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.licenses l
  WHERE ((l.id = license_activations.license_id) AND (l.user_id = auth.uid())))));


--
-- Name: advisor_profiles Users can view their own advisor profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own advisor profiles" ON public.advisor_profiles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: license_audit_log Users can view their own audit logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own audit logs" ON public.license_audit_log FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.licenses l
  WHERE ((l.id = license_audit_log.license_id) AND (l.user_id = auth.uid())))));


--
-- Name: founder_directives Users can view their own directives; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own directives" ON public.founder_directives FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: licenses Users can view their own licenses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own licenses" ON public.licenses FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: platform_runbooks Users can view their own runbooks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own runbooks" ON public.platform_runbooks FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: advisor_knowledge Users delete own advisor_knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own advisor_knowledge" ON public.advisor_knowledge FOR DELETE TO authenticated USING (((auth.uid() = user_id) AND (user_id <> '00000000-0000-0000-0000-000000000000'::uuid)));


--
-- Name: mobile_push_tokens Users delete own push tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own push tokens" ON public.mobile_push_tokens FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: advisor_knowledge Users insert own advisor_knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own advisor_knowledge" ON public.advisor_knowledge FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (user_id <> '00000000-0000-0000-0000-000000000000'::uuid)));


--
-- Name: ai_inference_receipts Users insert own ai_inference_receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own ai_inference_receipts" ON public.ai_inference_receipts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: communication_metrics Users insert own comm metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own comm metrics" ON public.communication_metrics FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: connector_oauth_flows Users insert own connector_oauth_flows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own connector_oauth_flows" ON public.connector_oauth_flows FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: connector_sync_runs Users insert own connector_sync_runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own connector_sync_runs" ON public.connector_sync_runs FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: notification_delivery_receipts Users insert own notification_delivery_receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own notification_delivery_receipts" ON public.notification_delivery_receipts FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- Name: mobile_push_tokens Users insert own push tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own push tokens" ON public.mobile_push_tokens FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_board_actions Users manage own actions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own actions" ON public.advisor_board_actions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_board_memory Users manage own advisor memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own advisor memory" ON public.advisor_board_memory TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_action_queue Users manage own advisor_action_queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own advisor_action_queue" ON public.advisor_action_queue TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_agents Users manage own advisor_agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own advisor_agents" ON public.advisor_agents TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_feedback Users manage own advisor_feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own advisor_feedback" ON public.advisor_feedback TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_memories Users manage own advisor_memories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own advisor_memories" ON public.advisor_memories TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_approval_queue Users manage own ai_workforce_approval_queue; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_budget_classes Users manage own ai_workforce_budget_classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_cached_outputs Users manage own ai_workforce_cached_outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_invocations Users manage own ai_workforce_invocations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_launch_honesty Users manage own ai_workforce_launch_honesty; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_outputs Users manage own ai_workforce_outputs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_recommendation_scores Users manage own ai_workforce_recommendation_scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_recommendations Users manage own ai_workforce_recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_role_health Users manage own ai_workforce_role_health; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_role_task_permissions Users manage own ai_workforce_role_task_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_roles Users manage own ai_workforce_roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_workforce_task_types Users manage own ai_workforce_task_types; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: appointments Users manage own appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own appointments" ON public.appointments TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: approval_decisions Users manage own approval_decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own approval_decisions" ON public.approval_decisions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: concierge_automations Users manage own automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own automations" ON public.concierge_automations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_autonomy_policies Users manage own autonomy policies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own autonomy policies" ON public.advisor_autonomy_policies TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: biometric_credentials Users manage own biometric_credentials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own biometric_credentials" ON public.biometric_credentials TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_blobs Users manage own blobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own blobs" ON public.cloud_blobs TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: boardroom_decision_receipts Users manage own boardroom_decision_receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own boardroom_decision_receipts" ON public.boardroom_decision_receipts TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: boardroom_evidence Users manage own boardroom_evidence; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own boardroom_evidence" ON public.boardroom_evidence TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: boardroom_items Users manage own boardroom_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own boardroom_items" ON public.boardroom_items TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: boardroom_recommendations Users manage own boardroom_recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own boardroom_recommendations" ON public.boardroom_recommendations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: boardroom_sessions Users manage own boardroom_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own boardroom_sessions" ON public.boardroom_sessions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: update_boot_attempts Users manage own boot attempts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own boot attempts" ON public.update_boot_attempts USING ((auth.uid() = user_id));


--
-- Name: business_onboarding Users manage own business_onboarding; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own business_onboarding" ON public.business_onboarding TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_sync_checkpoints Users manage own checkpoints; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own checkpoints" ON public.cloud_sync_checkpoints TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: command_memory Users manage own command_memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own command_memory" ON public.command_memory TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: command_routing_decisions Users manage own command_routing_decisions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own command_routing_decisions" ON public.command_routing_decisions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: command_steps Users manage own command_steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own command_steps" ON public.command_steps TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: onboarding_completion_markers Users manage own completion markers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own completion markers" ON public.onboarding_completion_markers USING ((session_id IN ( SELECT onboarding_sessions.id
   FROM public.onboarding_sessions
  WHERE (onboarding_sessions.user_id = auth.uid()))));


--
-- Name: cloud_conflicts Users manage own conflicts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own conflicts" ON public.cloud_conflicts TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: connector_tokens Users manage own connector_tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own connector_tokens" ON public.connector_tokens TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: context_graph_snapshots Users manage own context snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own context snapshots" ON public.context_graph_snapshots TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_automations Users manage own crm_automations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_automations" ON public.crm_automations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_communications Users manage own crm_communications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_communications" ON public.crm_communications TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_companies Users manage own crm_companies; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_companies" ON public.crm_companies TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_contact_company Users manage own crm_contact_company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_contact_company" ON public.crm_contact_company TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_contacts Users manage own crm_contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_contacts" ON public.crm_contacts TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_import_jobs Users manage own crm_import_jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_import_jobs" ON public.crm_import_jobs TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_merge_log Users manage own crm_merge_log; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_merge_log" ON public.crm_merge_log TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_notes Users manage own crm_notes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_notes" ON public.crm_notes TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_opportunities Users manage own crm_opportunities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_opportunities" ON public.crm_opportunities TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_pipeline_stages Users manage own crm_pipeline_stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_pipeline_stages" ON public.crm_pipeline_stages TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_segments Users manage own crm_segments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_segments" ON public.crm_segments TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_tags Users manage own crm_tags; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_tags" ON public.crm_tags TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: crm_tasks Users manage own crm_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own crm_tasks" ON public.crm_tasks TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: device_attestations Users manage own device_attestations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own device_attestations" ON public.device_attestations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_devices Users manage own devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own devices" ON public.cloud_devices TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: concierge_documents Users manage own documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own documents" ON public.concierge_documents TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: dual_authority_challenges Users manage own dual_authority_challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own dual_authority_challenges" ON public.dual_authority_challenges TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ecosystem_commands Users manage own ecosystem_commands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ecosystem_commands" ON public.ecosystem_commands TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ecosystem_contracts Users manage own ecosystem_contracts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ecosystem_contracts" ON public.ecosystem_contracts TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ecosystem_events Users manage own ecosystem_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own ecosystem_events" ON public.ecosystem_events TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: concierge_errands Users manage own errands; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own errands" ON public.concierge_errands TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_files Users manage own files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own files" ON public.cloud_files TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: flagship_loops Users manage own flagship_loops; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_folders Users manage own folders; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own folders" ON public.cloud_folders TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: gift_tracker Users manage own gift_tracker; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: graph_edges Users manage own graph_edges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own graph_edges" ON public.graph_edges TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: grocery_items Users manage own grocery_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own grocery_items" ON public.grocery_items TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: grocery_lists Users manage own grocery_lists; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: business_health_scores Users manage own health scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own health scores" ON public.business_health_scores TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: health_validation_results Users manage own health validation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own health validation" ON public.health_validation_results USING ((auth.uid() = user_id));


--
-- Name: onboarding_hardware_detection Users manage own hw detection; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own hw detection" ON public.onboarding_hardware_detection USING ((session_id IN ( SELECT onboarding_sessions.id
   FROM public.onboarding_sessions
  WHERE (onboarding_sessions.user_id = auth.uid()))));


--
-- Name: incidents Users manage own incidents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own incidents" ON public.incidents TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: layer_health_snapshots Users manage own layer_health_snapshots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own layer_health_snapshots" ON public.layer_health_snapshots TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: lead_inbox_items Users manage own lead_inbox_items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own lead_inbox_items" ON public.lead_inbox_items TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: leads Users manage own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own leads" ON public.leads TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: device_mesh_peers Users manage own mesh peers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own mesh peers" ON public.device_mesh_peers TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: notification_preferences Users manage own notification prefs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own notification prefs" ON public.notification_preferences TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: onboarding_choices Users manage own onboarding choices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own onboarding choices" ON public.onboarding_choices USING ((session_id IN ( SELECT onboarding_sessions.id
   FROM public.onboarding_sessions
  WHERE (onboarding_sessions.user_id = auth.uid()))));


--
-- Name: onboarding_sessions Users manage own onboarding sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own onboarding sessions" ON public.onboarding_sessions USING ((auth.uid() = user_id));


--
-- Name: onboarding_steps Users manage own onboarding steps; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own onboarding steps" ON public.onboarding_steps USING ((session_id IN ( SELECT onboarding_sessions.id
   FROM public.onboarding_sessions
  WHERE (onboarding_sessions.user_id = auth.uid()))));


--
-- Name: os_audit_events Users manage own os_audit_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_audit_events" ON public.os_audit_events TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_auth_methods Users manage own os_auth_methods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_auth_methods" ON public.os_auth_methods TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_capabilities Users manage own os_capabilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_capabilities" ON public.os_capabilities TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_elevation_tokens Users manage own os_elevation_tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_elevation_tokens" ON public.os_elevation_tokens TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_keyrings Users manage own os_keyrings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_keyrings" ON public.os_keyrings TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_role_capabilities Users manage own os_role_capabilities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_role_capabilities" ON public.os_role_capabilities TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_secrets_metadata Users manage own os_secrets_metadata; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_secrets_metadata" ON public.os_secrets_metadata TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_service_identities Users manage own os_service_identities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_service_identities" ON public.os_service_identities TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_sessions Users manage own os_sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_sessions" ON public.os_sessions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: os_user_accounts Users manage own os_user_accounts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own os_user_accounts" ON public.os_user_accounts TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: outcome_verifications Users manage own outcome_verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: update_preflight_results Users manage own preflight results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own preflight results" ON public.update_preflight_results USING ((auth.uid() = user_id));


--
-- Name: profit_signals Users manage own profit signals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own profit signals" ON public.profit_signals TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: recommendation_execution_bindings Users manage own recommendation_execution_bindings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: recommendation_execution_events Users manage own recommendation_execution_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: recommendation_learning_signals Users manage own recommendation_learning_signals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: recommendation_outcome_verifications Users manage own recommendation_outcome_verifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_board_recommendations Users manage own recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own recommendations" ON public.advisor_board_recommendations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: concierge_recurring_obligations Users manage own recurring_obligations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_board_reflections Users manage own reflections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own reflections" ON public.advisor_board_reflections TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: remediation_programs Users manage own remediation_programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: remediation_tasks Users manage own remediation_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own remediation_tasks" ON public.remediation_tasks TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: onboarding_restore_sources Users manage own restore sources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own restore sources" ON public.onboarding_restore_sources USING ((session_id IN ( SELECT onboarding_sessions.id
   FROM public.onboarding_sessions
  WHERE (onboarding_sessions.user_id = auth.uid()))));


--
-- Name: rollback_events Users manage own rollback events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own rollback events" ON public.rollback_events USING ((auth.uid() = user_id));


--
-- Name: runtime_agents Users manage own runtime_agents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own runtime_agents" ON public.runtime_agents TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: action_safety_classifications Users manage own safety classifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own safety classifications" ON public.action_safety_classifications TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: school_activities Users manage own school_activities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own school_activities" ON public.school_activities TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: service_providers_list Users manage own service_providers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own service_providers" ON public.service_providers_list TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_device_sessions Users manage own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own sessions" ON public.cloud_device_sessions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: simulations Users manage own simulations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own simulations" ON public.simulations TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_sync_changes Users manage own sync changes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own sync changes" ON public.cloud_sync_changes TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_sync_objects Users manage own sync objects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own sync objects" ON public.cloud_sync_objects TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: system_slots Users manage own system slots; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own system slots" ON public.system_slots USING ((auth.uid() = user_id));


--
-- Name: system_guarantees Users manage own system_guarantees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own system_guarantees" ON public.system_guarantees TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: timeline_events Users manage own timeline_events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own timeline_events" ON public.timeline_events TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: advisor_board_tool_executions Users manage own tool executions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own tool executions" ON public.advisor_board_tool_executions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_trash Users manage own trash; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own trash" ON public.cloud_trash TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: travel_plans Users manage own travel_plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own travel_plans" ON public.travel_plans TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: update_channels Users manage own update channels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own update channels" ON public.update_channels USING ((auth.uid() = user_id));


--
-- Name: update_history Users manage own update history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own update history" ON public.update_history USING ((auth.uid() = user_id));


--
-- Name: update_staging Users manage own update staging; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own update staging" ON public.update_staging USING ((auth.uid() = user_id));


--
-- Name: cloud_file_versions Users manage own versions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users manage own versions" ON public.cloud_file_versions TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: cloud_account_closure_requests Users own account closure; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own account closure" ON public.cloud_account_closure_requests TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_activity_journal Users own activity journal; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own activity journal" ON public.cloud_activity_journal TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_archive_jobs Users own archive jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own archive jobs" ON public.cloud_archive_jobs TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_bootstrap_markers Users own bootstrap markers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own bootstrap markers" ON public.cloud_bootstrap_markers TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_import_export_jobs Users own import export jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own import export jobs" ON public.cloud_import_export_jobs TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_lifecycle_rules Users own lifecycle rules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own lifecycle rules" ON public.cloud_lifecycle_rules TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_preview_jobs Users own preview jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own preview jobs" ON public.cloud_preview_jobs TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_search_index Users own search index; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own search index" ON public.cloud_search_index TO authenticated USING ((user_id = auth.uid()));


--
-- Name: cloud_worker_jobs Users own worker jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users own worker jobs" ON public.cloud_worker_jobs TO authenticated USING (((user_id = auth.uid()) OR (user_id IS NULL)));


--
-- Name: advisor_knowledge Users read own and system advisor_knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own and system advisor_knowledge" ON public.advisor_knowledge FOR SELECT TO authenticated USING (((auth.uid() = user_id) OR (user_id = '00000000-0000-0000-0000-000000000000'::uuid)));


--
-- Name: ai_inference_receipts Users see own ai_inference_receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own ai_inference_receipts" ON public.ai_inference_receipts FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: connector_oauth_flows Users see own connector_oauth_flows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own connector_oauth_flows" ON public.connector_oauth_flows FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: connector_sync_runs Users see own connector_sync_runs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own connector_sync_runs" ON public.connector_sync_runs FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: notification_delivery_receipts Users see own notification_delivery_receipts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users see own notification_delivery_receipts" ON public.notification_delivery_receipts FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: advisor_knowledge Users update own advisor_knowledge; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users update own advisor_knowledge" ON public.advisor_knowledge FOR UPDATE TO authenticated USING (((auth.uid() = user_id) AND (user_id <> '00000000-0000-0000-0000-000000000000'::uuid)));


--
-- Name: mobile_push_tokens Users update own push tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users update own push tokens" ON public.mobile_push_tokens FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: communication_metrics Users view own comm metrics; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own comm metrics" ON public.communication_metrics FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: cloud_devices Users view own devices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own devices" ON public.cloud_devices FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: cloud_user_plans Users view own plan; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own plan" ON public.cloud_user_plans FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: mobile_push_tokens Users view own push tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own push tokens" ON public.mobile_push_tokens FOR SELECT USING (((auth.uid() = user_id) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: user_roles Users view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: cloud_storage_usage Users view own storage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view own storage" ON public.cloud_storage_usage FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: action_safety_classifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.action_safety_classifications ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_action_audit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_action_audit ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_action_confirmations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_action_confirmations ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_role_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_safety_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_safety_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_action_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_action_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_agents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_agents ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_autonomy_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_autonomy_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_board_actions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_board_actions ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_board_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_board_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_board_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_board_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_board_reflections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_board_reflections ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_board_tool_executions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_board_tool_executions ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_knowledge; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_knowledge ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_memories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_memories ENABLE ROW LEVEL SECURITY;

--
-- Name: advisor_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_inference_receipts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_inference_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_approval_queue; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_approval_queue ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_budget_classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_budget_classes ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_cached_outputs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_cached_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_invocations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_invocations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_launch_honesty; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_launch_honesty ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_outputs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_recommendation_scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_recommendation_scores ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_role_health; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_role_health ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_role_task_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_role_task_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_workforce_task_types; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_workforce_task_types ENABLE ROW LEVEL SECURITY;

--
-- Name: api_gateway_routes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.api_gateway_routes ENABLE ROW LEVEL SECURITY;

--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: approval_decisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.approval_decisions ENABLE ROW LEVEL SECURITY;

--
-- Name: biometric_credentials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;

--
-- Name: boardroom_decision_receipts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.boardroom_decision_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: boardroom_evidence; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.boardroom_evidence ENABLE ROW LEVEL SECURITY;

--
-- Name: boardroom_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.boardroom_items ENABLE ROW LEVEL SECURITY;

--
-- Name: boardroom_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.boardroom_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: boardroom_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: business_health_scores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_health_scores ENABLE ROW LEVEL SECURITY;

--
-- Name: business_onboarding; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.business_onboarding ENABLE ROW LEVEL SECURITY;

--
-- Name: calendar_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

--
-- Name: client_capability_matrix; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.client_capability_matrix ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_abuse_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_abuse_events ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_account_closure_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_account_closure_requests ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_activity_journal; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_activity_journal ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_admin_role_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_admin_role_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_admin_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_admin_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_archive_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_archive_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_audit_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_audit_events ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_backup_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_backup_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_blobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_blobs ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_bootstrap_markers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_bootstrap_markers ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_compliance_hooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_compliance_hooks ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_conflicts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_conflicts ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_device_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_device_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_devices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_devices ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_feature_flags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_feature_flags ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_file_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_file_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_files ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_folders; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_folders ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_import_export_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_import_export_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_lifecycle_rules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_lifecycle_rules ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_maintenance_modes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_maintenance_modes ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_metrics_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_metrics_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_namespace_registry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_namespace_registry ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_preview_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_preview_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_reconciliation_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_reconciliation_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_search_index; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_search_index ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_shared_workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_shared_workspaces ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_shares; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_shares ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_storage_providers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_storage_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_storage_tiers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_storage_tiers ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_storage_usage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_storage_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_support_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_support_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_sync_changes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_sync_changes ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_sync_checkpoints; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_sync_checkpoints ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_sync_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_sync_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_sync_objects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_sync_objects ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_tenant_memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_tenant_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_tenant_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_tenant_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_tenant_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_tenant_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_tenant_quotas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_tenant_quotas ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_trash; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_trash ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_user_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_user_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: cloud_worker_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cloud_worker_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: command_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.command_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: command_routing_decisions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.command_routing_decisions ENABLE ROW LEVEL SECURITY;

--
-- Name: command_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.command_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: communication_metrics; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.communication_metrics ENABLE ROW LEVEL SECURITY;

--
-- Name: concierge_automations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.concierge_automations ENABLE ROW LEVEL SECURITY;

--
-- Name: concierge_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.concierge_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: concierge_errands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.concierge_errands ENABLE ROW LEVEL SECURITY;

--
-- Name: concierge_recurring_obligations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.concierge_recurring_obligations ENABLE ROW LEVEL SECURITY;

--
-- Name: config_change_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.config_change_history ENABLE ROW LEVEL SECURITY;

--
-- Name: connector_oauth_flows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connector_oauth_flows ENABLE ROW LEVEL SECURITY;

--
-- Name: connector_sync_runs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connector_sync_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: connector_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.connector_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: context_graph_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.context_graph_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_automations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_automations ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_communications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_communications ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_contact_company; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_contact_company ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_import_jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_import_jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_merge_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_merge_log ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_opportunities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_opportunities ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_pipeline_stages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_pipeline_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_segments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_segments ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_tags; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: crm_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: device_attestations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.device_attestations ENABLE ROW LEVEL SECURITY;

--
-- Name: device_mesh_peers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.device_mesh_peers ENABLE ROW LEVEL SECURITY;

--
-- Name: device_ownership; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.device_ownership ENABLE ROW LEVEL SECURITY;

--
-- Name: domain_ownership_registry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.domain_ownership_registry ENABLE ROW LEVEL SECURITY;

--
-- Name: dual_authority_challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dual_authority_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: ecosystem_commands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ecosystem_commands ENABLE ROW LEVEL SECURITY;

--
-- Name: ecosystem_contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ecosystem_contracts ENABLE ROW LEVEL SECURITY;

--
-- Name: ecosystem_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ecosystem_events ENABLE ROW LEVEL SECURITY;

--
-- Name: environment_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.environment_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: flagship_loops; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.flagship_loops ENABLE ROW LEVEL SECURITY;

--
-- Name: founder_directives; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.founder_directives ENABLE ROW LEVEL SECURITY;

--
-- Name: gift_tracker; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.gift_tracker ENABLE ROW LEVEL SECURITY;

--
-- Name: graph_edges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;

--
-- Name: grocery_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

--
-- Name: grocery_lists; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

--
-- Name: health_validation_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_validation_results ENABLE ROW LEVEL SECURITY;

--
-- Name: incidents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

--
-- Name: layer_health_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.layer_health_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: lead_inbox_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lead_inbox_items ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: license_activations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

--
-- Name: license_audit_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.license_audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: licenses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

--
-- Name: managed_apps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.managed_apps ENABLE ROW LEVEL SECURITY;

--
-- Name: mobile_push_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mobile_push_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_delivery_receipts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_delivery_receipts ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_choices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_choices ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_completion_markers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_completion_markers ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_hardware_detection; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_hardware_detection ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_restore_sources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_restore_sources ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_steps; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;

--
-- Name: org_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: os_audit_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_audit_events ENABLE ROW LEVEL SECURITY;

--
-- Name: os_auth_methods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_auth_methods ENABLE ROW LEVEL SECURITY;

--
-- Name: os_capabilities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_capabilities ENABLE ROW LEVEL SECURITY;

--
-- Name: os_command_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_command_events ENABLE ROW LEVEL SECURITY;

--
-- Name: os_commands; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_commands ENABLE ROW LEVEL SECURITY;

--
-- Name: os_elevation_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_elevation_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: os_keyrings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_keyrings ENABLE ROW LEVEL SECURITY;

--
-- Name: os_policies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_policies ENABLE ROW LEVEL SECURITY;

--
-- Name: os_role_capabilities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_role_capabilities ENABLE ROW LEVEL SECURITY;

--
-- Name: os_secrets_metadata; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_secrets_metadata ENABLE ROW LEVEL SECURITY;

--
-- Name: os_service_identities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_service_identities ENABLE ROW LEVEL SECURITY;

--
-- Name: os_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: os_user_accounts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.os_user_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: outcome_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.outcome_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: plane_service_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.plane_service_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_planes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_planes ENABLE ROW LEVEL SECURITY;

--
-- Name: platform_runbooks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.platform_runbooks ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profit_signals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profit_signals ENABLE ROW LEVEL SECURITY;

--
-- Name: read_model_snapshots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.read_model_snapshots ENABLE ROW LEVEL SECURITY;

--
-- Name: recommendation_execution_bindings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recommendation_execution_bindings ENABLE ROW LEVEL SECURITY;

--
-- Name: recommendation_execution_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recommendation_execution_events ENABLE ROW LEVEL SECURITY;

--
-- Name: recommendation_learning_signals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recommendation_learning_signals ENABLE ROW LEVEL SECURITY;

--
-- Name: recommendation_outcome_verifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recommendation_outcome_verifications ENABLE ROW LEVEL SECURITY;

--
-- Name: release_compatibility_matrix; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.release_compatibility_matrix ENABLE ROW LEVEL SECURITY;

--
-- Name: remediation_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.remediation_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: remediation_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.remediation_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: rollback_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.rollback_events ENABLE ROW LEVEL SECURITY;

--
-- Name: runtime_agents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.runtime_agents ENABLE ROW LEVEL SECURITY;

--
-- Name: school_activities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;

--
-- Name: service_identity_registry; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_identity_registry ENABLE ROW LEVEL SECURITY;

--
-- Name: service_providers_list; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.service_providers_list ENABLE ROW LEVEL SECURITY;

--
-- Name: simulations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

--
-- Name: support_access_grants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_access_grants ENABLE ROW LEVEL SECURITY;

--
-- Name: support_case_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_case_events ENABLE ROW LEVEL SECURITY;

--
-- Name: support_cases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;

--
-- Name: system_guarantees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_guarantees ENABLE ROW LEVEL SECURITY;

--
-- Name: system_slots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: timeline_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

--
-- Name: token_classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.token_classes ENABLE ROW LEVEL SECURITY;

--
-- Name: travel_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: update_boot_attempts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_boot_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: update_catalog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_catalog ENABLE ROW LEVEL SECURITY;

--
-- Name: update_channels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_channels ENABLE ROW LEVEL SECURITY;

--
-- Name: update_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_history ENABLE ROW LEVEL SECURITY;

--
-- Name: update_preflight_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_preflight_results ENABLE ROW LEVEL SECURITY;

--
-- Name: update_staging; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.update_staging ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: vapid_keys; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vapid_keys ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict hv7IgbCwBeYdzWNEifOxBs8HjzRLcbdzR4wsfzvc0kX1GFdzGR60ja3rOtcsRzg

