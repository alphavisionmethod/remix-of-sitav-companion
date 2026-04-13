
-- ═══════════════════════════════════════════════════════════════
-- RLS Hardening: Migrate all public-role policies to authenticated
-- Affects 27 tables with "Users manage own ..." ALL policies
-- ═══════════════════════════════════════════════════════════════

-- advisor_action_queue
DROP POLICY "Users manage own advisor_action_queue" ON public.advisor_action_queue;
CREATE POLICY "Users manage own advisor_action_queue" ON public.advisor_action_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- advisor_agents
DROP POLICY "Users manage own advisor_agents" ON public.advisor_agents;
CREATE POLICY "Users manage own advisor_agents" ON public.advisor_agents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_approval_queue
DROP POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue;
CREATE POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_budget_classes
DROP POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes;
CREATE POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_cached_outputs
DROP POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs;
CREATE POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_invocations
DROP POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations;
CREATE POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_launch_honesty
DROP POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty;
CREATE POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_outputs
DROP POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs;
CREATE POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_recommendation_scores
DROP POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores;
CREATE POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_recommendations
DROP POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations;
CREATE POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_role_health
DROP POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health;
CREATE POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_role_task_permissions
DROP POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions;
CREATE POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_roles
DROP POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles;
CREATE POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_task_types
DROP POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types;
CREATE POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- appointments
DROP POLICY "Users manage own appointments" ON public.appointments;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_automations
DROP POLICY "Users manage own automations" ON public.concierge_automations;
CREATE POLICY "Users manage own automations" ON public.concierge_automations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_documents
DROP POLICY "Users manage own documents" ON public.concierge_documents;
CREATE POLICY "Users manage own documents" ON public.concierge_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_errands
DROP POLICY "Users manage own errands" ON public.concierge_errands;
CREATE POLICY "Users manage own errands" ON public.concierge_errands FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_recurring_obligations
DROP POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations;
CREATE POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- flagship_loops
DROP POLICY "Users manage own flagship_loops" ON public.flagship_loops;
CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- gift_tracker
DROP POLICY "Users manage own gift_tracker" ON public.gift_tracker;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- grocery_items
DROP POLICY "Users manage own grocery_items" ON public.grocery_items;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- grocery_lists
DROP POLICY "Users manage own grocery_lists" ON public.grocery_lists;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- outcome_verifications
DROP POLICY "Users manage own outcome_verifications" ON public.outcome_verifications;
CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_execution_bindings
DROP POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings;
CREATE POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_execution_events
DROP POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events;
CREATE POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_learning_signals
DROP POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals;
CREATE POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_outcome_verifications
DROP POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications;
CREATE POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- remediation_programs
DROP POLICY "Users manage own remediation_programs" ON public.remediation_programs;
CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- remediation_tasks
DROP POLICY "Users manage own remediation_tasks" ON public.remediation_tasks;
CREATE POLICY "Users manage own remediation_tasks" ON public.remediation_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- school_activities
DROP POLICY "Users manage own school_activities" ON public.school_activities;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- service_providers_list
DROP POLICY "Users manage own service_providers" ON public.service_providers_list;
CREATE POLICY "Users manage own service_providers" ON public.service_providers_list FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- travel_plans
DROP POLICY "Users manage own travel_plans" ON public.travel_plans;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
