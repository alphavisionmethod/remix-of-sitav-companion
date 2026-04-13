export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      advisor_action_queue: {
        Row: {
          action_type: string
          advisor_id: string
          approved_at: string | null
          approved_by: string | null
          confidence: number
          created_at: string
          domain: string
          error_message: string | null
          executed_at: string | null
          id: string
          payload: Json
          receipt_hash: string | null
          requires_approval: boolean
          rollback_payload: Json | null
          status: string
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type?: string
          advisor_id: string
          approved_at?: string | null
          approved_by?: string | null
          confidence?: number
          created_at?: string
          domain?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          payload?: Json
          receipt_hash?: string | null
          requires_approval?: boolean
          rollback_payload?: Json | null
          status?: string
          summary?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          advisor_id?: string
          approved_at?: string | null
          approved_by?: string | null
          confidence?: number
          created_at?: string
          domain?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          payload?: Json
          receipt_hash?: string | null
          requires_approval?: boolean
          rollback_payload?: Json | null
          status?: string
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_agents: {
        Row: {
          advisor_id: string
          autonomy_level: number
          budget_daily_tokens: number
          confidence_threshold: number
          created_at: string
          display_name: string
          domain: string
          escalation_target: string
          id: string
          invocations_today: number
          is_active: boolean
          last_action_at: string | null
          last_observation_at: string | null
          maturity: string
          max_invocations_per_hour: number
          mission: string | null
          personality: Json
          scope_config: Json
          special_ability: string | null
          tokens_used_today: number
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_id: string
          autonomy_level?: number
          budget_daily_tokens?: number
          confidence_threshold?: number
          created_at?: string
          display_name: string
          domain?: string
          escalation_target?: string
          id?: string
          invocations_today?: number
          is_active?: boolean
          last_action_at?: string | null
          last_observation_at?: string | null
          maturity?: string
          max_invocations_per_hour?: number
          mission?: string | null
          personality?: Json
          scope_config?: Json
          special_ability?: string | null
          tokens_used_today?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_id?: string
          autonomy_level?: number
          budget_daily_tokens?: number
          confidence_threshold?: number
          created_at?: string
          display_name?: string
          domain?: string
          escalation_target?: string
          id?: string
          invocations_today?: number
          is_active?: boolean
          last_action_at?: string | null
          last_observation_at?: string | null
          maturity?: string
          max_invocations_per_hour?: number
          mission?: string | null
          personality?: Json
          scope_config?: Json
          special_ability?: string | null
          tokens_used_today?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_approval_queue: {
        Row: {
          cost_implications: string | null
          created_at: string
          decision_at: string | null
          escalated: boolean
          evidence_links: Json
          id: string
          launch_implications: string | null
          priority: string
          recommendation_id: string | null
          remediation_binding_id: string | null
          reviewer_comments: string | null
          reviewer_user_id: string | null
          status: string
          summary: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cost_implications?: string | null
          created_at?: string
          decision_at?: string | null
          escalated?: boolean
          evidence_links?: Json
          id?: string
          launch_implications?: string | null
          priority?: string
          recommendation_id?: string | null
          remediation_binding_id?: string | null
          reviewer_comments?: string | null
          reviewer_user_id?: string | null
          status?: string
          summary?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cost_implications?: string | null
          created_at?: string
          decision_at?: string | null
          escalated?: boolean
          evidence_links?: Json
          id?: string
          launch_implications?: string | null
          priority?: string
          recommendation_id?: string | null
          remediation_binding_id?: string | null
          reviewer_comments?: string | null
          reviewer_user_id?: string | null
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_approval_queue_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_approval_queue_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "v_recommendation_closure_summary"
            referencedColumns: ["recommendation_id"]
          },
        ]
      }
      ai_workforce_budget_classes: {
        Row: {
          allowed_models: Json
          class_key: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          max_calls_per_hour: number
          max_cost_cents_per_call: number
          max_tokens_per_call: number
          priority_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_models?: Json
          class_key: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          max_calls_per_hour?: number
          max_cost_cents_per_call?: number
          max_tokens_per_call?: number
          priority_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_models?: Json
          class_key?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          max_calls_per_hour?: number
          max_cost_cents_per_call?: number
          max_tokens_per_call?: number
          priority_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_cached_outputs: {
        Row: {
          cache_key: string
          cost_cents: number | null
          created_at: string
          expires_at: string | null
          hit_count: number
          id: string
          model_used: string | null
          output: Json
          role_key: string
          task_key: string
          tokens_used: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cache_key: string
          cost_cents?: number | null
          created_at?: string
          expires_at?: string | null
          hit_count?: number
          id?: string
          model_used?: string | null
          output?: Json
          role_key: string
          task_key: string
          tokens_used?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          cost_cents?: number | null
          created_at?: string
          expires_at?: string | null
          hit_count?: number
          id?: string
          model_used?: string | null
          output?: Json
          role_key?: string
          task_key?: string
          tokens_used?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_invocations: {
        Row: {
          budget_posture: string
          cost_cents: number | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          mode: string
          model_used: string | null
          role_key: string
          scope_payload: Json
          scope_ref: string | null
          scope_type: string | null
          status: string
          task_key: string
          tokens_in: number | null
          tokens_out: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_posture?: string
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          mode?: string
          model_used?: string | null
          role_key: string
          scope_payload?: Json
          scope_ref?: string | null
          scope_type?: string | null
          status?: string
          task_key: string
          tokens_in?: number | null
          tokens_out?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_posture?: string
          cost_cents?: number | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          mode?: string
          model_used?: string | null
          role_key?: string
          scope_payload?: Json
          scope_ref?: string | null
          scope_type?: string | null
          status?: string
          task_key?: string
          tokens_in?: number | null
          tokens_out?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_launch_honesty: {
        Row: {
          actual_status: string
          created_at: string
          evidence: Json
          honesty_score: number
          id: string
          last_audit_at: string | null
          launch_claim: string
          role_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_status?: string
          created_at?: string
          evidence?: Json
          honesty_score?: number
          id?: string
          last_audit_at?: string | null
          launch_claim?: string
          role_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_status?: string
          created_at?: string
          evidence?: Json
          honesty_score?: number
          id?: string
          last_audit_at?: string | null
          launch_claim?: string
          role_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_outputs: {
        Row: {
          content: Json
          created_at: string
          flag_reason: string | null
          flagged: boolean
          id: string
          invocation_id: string
          output_type: string
          quality_score: number | null
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          id?: string
          invocation_id: string
          output_type?: string
          quality_score?: number | null
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          flag_reason?: string | null
          flagged?: boolean
          id?: string
          invocation_id?: string
          output_type?: string
          quality_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_outputs_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_recommendation_scores: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recommendation_id: string
          review_method: string
          reviewed_by_user_id: string | null
          score_accuracy: number | null
          score_actionability: number | null
          score_cost_efficiency: number | null
          score_evidence_quality: number | null
          score_execution_success_likelihood: number | null
          score_launch_honesty_alignment: number | null
          score_overall: number
          score_realized_outcome_value: number | null
          score_usefulness: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recommendation_id: string
          review_method?: string
          reviewed_by_user_id?: string | null
          score_accuracy?: number | null
          score_actionability?: number | null
          score_cost_efficiency?: number | null
          score_evidence_quality?: number | null
          score_execution_success_likelihood?: number | null
          score_launch_honesty_alignment?: number | null
          score_overall?: number
          score_realized_outcome_value?: number | null
          score_usefulness?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recommendation_id?: string
          review_method?: string
          reviewed_by_user_id?: string | null
          score_accuracy?: number | null
          score_actionability?: number | null
          score_cost_efficiency?: number | null
          score_evidence_quality?: number | null
          score_execution_success_likelihood?: number | null
          score_launch_honesty_alignment?: number | null
          score_overall?: number
          score_realized_outcome_value?: number | null
          score_usefulness?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_recommendation_scores_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_recommendation_scores_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "v_recommendation_closure_summary"
            referencedColumns: ["recommendation_id"]
          },
        ]
      }
      ai_workforce_recommendations: {
        Row: {
          approval_decision_at: string | null
          approved_by_user_id: string | null
          confidence: number
          created_at: string
          customer_journey_impact_key: string | null
          deferred_reason: string | null
          details: Json
          domain: string
          evidence: Json
          execution_priority: string | null
          execution_required: boolean
          flagship_loop_key: string | null
          id: string
          invocation_id: string | null
          launch_blocker_impact_class: string | null
          lifecycle_status: string
          outcome_verification_required: boolean
          rejected_by_user_id: string | null
          role_key: string
          severity: string
          status: string
          summary: string
          task_key: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_decision_at?: string | null
          approved_by_user_id?: string | null
          confidence?: number
          created_at?: string
          customer_journey_impact_key?: string | null
          deferred_reason?: string | null
          details?: Json
          domain?: string
          evidence?: Json
          execution_priority?: string | null
          execution_required?: boolean
          flagship_loop_key?: string | null
          id?: string
          invocation_id?: string | null
          launch_blocker_impact_class?: string | null
          lifecycle_status?: string
          outcome_verification_required?: boolean
          rejected_by_user_id?: string | null
          role_key: string
          severity?: string
          status?: string
          summary?: string
          task_key?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_decision_at?: string | null
          approved_by_user_id?: string | null
          confidence?: number
          created_at?: string
          customer_journey_impact_key?: string | null
          deferred_reason?: string | null
          details?: Json
          domain?: string
          evidence?: Json
          execution_priority?: string | null
          execution_required?: boolean
          flagship_loop_key?: string | null
          id?: string
          invocation_id?: string | null
          launch_blocker_impact_class?: string | null
          lifecycle_status?: string
          outcome_verification_required?: boolean
          rejected_by_user_id?: string | null
          role_key?: string
          severity?: string
          status?: string
          summary?: string
          task_key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_recommendations_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_role_health: {
        Row: {
          avg_cost_cents: number | null
          avg_latency_ms: number | null
          avg_quality_score: number | null
          created_at: string
          failed_invocations: number
          health_status: string
          id: string
          last_error: string | null
          last_invocation_at: string | null
          role_key: string
          successful_invocations: number
          total_invocations: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_cost_cents?: number | null
          avg_latency_ms?: number | null
          avg_quality_score?: number | null
          created_at?: string
          failed_invocations?: number
          health_status?: string
          id?: string
          last_error?: string | null
          last_invocation_at?: string | null
          role_key: string
          successful_invocations?: number
          total_invocations?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_cost_cents?: number | null
          avg_latency_ms?: number | null
          avg_quality_score?: number | null
          created_at?: string
          failed_invocations?: number
          health_status?: string
          id?: string
          last_error?: string | null
          last_invocation_at?: string | null
          role_key?: string
          successful_invocations?: number
          total_invocations?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_role_task_permissions: {
        Row: {
          budget_class_key: string | null
          created_at: string
          id: string
          max_autonomy: number
          permission_level: string
          requires_approval: boolean
          role_key: string
          task_key: string
          user_id: string
        }
        Insert: {
          budget_class_key?: string | null
          created_at?: string
          id?: string
          max_autonomy?: number
          permission_level?: string
          requires_approval?: boolean
          role_key: string
          task_key: string
          user_id: string
        }
        Update: {
          budget_class_key?: string | null
          created_at?: string
          id?: string
          max_autonomy?: number
          permission_level?: string
          requires_approval?: boolean
          role_key?: string
          task_key?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_roles: {
        Row: {
          allowed_tools: Json
          cost_budget_cents: number
          council: string
          created_at: string
          display_name: string
          escalation_targets: Json
          forbidden_tools: Json
          id: string
          kpis: Json
          maturity: string
          max_autonomy_level: number
          memory_scope: string
          mission: string | null
          role_key: string
          special_ability: string | null
          status: string
          trigger_conditions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_tools?: Json
          cost_budget_cents?: number
          council?: string
          created_at?: string
          display_name: string
          escalation_targets?: Json
          forbidden_tools?: Json
          id?: string
          kpis?: Json
          maturity?: string
          max_autonomy_level?: number
          memory_scope?: string
          mission?: string | null
          role_key: string
          special_ability?: string | null
          status?: string
          trigger_conditions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_tools?: Json
          cost_budget_cents?: number
          council?: string
          created_at?: string
          display_name?: string
          escalation_targets?: Json
          forbidden_tools?: Json
          id?: string
          kpis?: Json
          maturity?: string
          max_autonomy_level?: number
          memory_scope?: string
          mission?: string | null
          role_key?: string
          special_ability?: string | null
          status?: string
          trigger_conditions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_task_types: {
        Row: {
          council: string
          created_at: string
          default_model: string | null
          description: string | null
          display_name: string
          id: string
          input_schema: Json
          max_tokens: number
          output_schema: Json
          requires_approval: boolean
          status: string
          task_key: string
          temperature: number
          updated_at: string
          user_id: string
        }
        Insert: {
          council?: string
          created_at?: string
          default_model?: string | null
          description?: string | null
          display_name: string
          id?: string
          input_schema?: Json
          max_tokens?: number
          output_schema?: Json
          requires_approval?: boolean
          status?: string
          task_key: string
          temperature?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          council?: string
          created_at?: string
          default_model?: string | null
          description?: string | null
          display_name?: string
          id?: string
          input_schema?: Json
          max_tokens?: number
          output_schema?: Json
          requires_approval?: boolean
          status?: string
          task_key?: string
          temperature?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string | null
          category: string | null
          created_at: string
          docs_needed: string[] | null
          id: string
          location: string | null
          notes: string | null
          owner: string | null
          prep_items: string[] | null
          provider: string | null
          status: string | null
          title: string
          transport_time: string | null
          updated_at: string
          user_id: string
          who: string | null
        }
        Insert: {
          appointment_date?: string | null
          category?: string | null
          created_at?: string
          docs_needed?: string[] | null
          id?: string
          location?: string | null
          notes?: string | null
          owner?: string | null
          prep_items?: string[] | null
          provider?: string | null
          status?: string | null
          title: string
          transport_time?: string | null
          updated_at?: string
          user_id: string
          who?: string | null
        }
        Update: {
          appointment_date?: string | null
          category?: string | null
          created_at?: string
          docs_needed?: string[] | null
          id?: string
          location?: string | null
          notes?: string | null
          owner?: string | null
          prep_items?: string[] | null
          provider?: string | null
          status?: string | null
          title?: string
          transport_time?: string | null
          updated_at?: string
          user_id?: string
          who?: string | null
        }
        Relationships: []
      }
      concierge_automations: {
        Row: {
          conditions: Json | null
          created_at: string
          id: string
          last_run: string | null
          notes: string | null
          recent_runs_count: number | null
          safety_boundary: string | null
          status: string | null
          title: string
          trigger_event: string | null
          trust_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          id?: string
          last_run?: string | null
          notes?: string | null
          recent_runs_count?: number | null
          safety_boundary?: string | null
          status?: string | null
          title: string
          trigger_event?: string | null
          trust_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          id?: string
          last_run?: string | null
          notes?: string | null
          recent_runs_count?: number | null
          safety_boundary?: string | null
          status?: string | null
          title?: string
          trigger_event?: string | null
          trust_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      concierge_documents: {
        Row: {
          created_at: string
          doc_type: string | null
          expiry_date: string | null
          file_path: string | null
          id: string
          linked_context: string | null
          name: string
          notes: string | null
          sensitivity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doc_type?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          linked_context?: string | null
          name: string
          notes?: string | null
          sensitivity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doc_type?: string | null
          expiry_date?: string | null
          file_path?: string | null
          id?: string
          linked_context?: string | null
          name?: string
          notes?: string | null
          sensitivity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      concierge_errands: {
        Row: {
          bundle_id: string | null
          combinable: boolean | null
          created_at: string
          due_date: string | null
          estimated_minutes: number | null
          id: string
          location: string | null
          notes: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          combinable?: boolean | null
          created_at?: string
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          combinable?: boolean | null
          created_at?: string
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      concierge_recurring_obligations: {
        Row: {
          automatable: boolean | null
          category: string | null
          created_at: string
          effort: string | null
          frequency: string | null
          id: string
          last_completed: string | null
          next_due: string | null
          notes: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          automatable?: boolean | null
          category?: string | null
          created_at?: string
          effort?: string | null
          frequency?: string | null
          id?: string
          last_completed?: string | null
          next_due?: string | null
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          automatable?: boolean | null
          category?: string | null
          created_at?: string
          effort?: string | null
          frequency?: string | null
          id?: string
          last_completed?: string | null
          next_due?: string | null
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flagship_loops: {
        Row: {
          blocker_count: number
          core_journeys: Json
          core_routes: Json
          created_at: string
          demo_vs_real: string
          description: string
          display_name: string
          id: string
          launch_honesty_class: string
          launch_importance: string
          loop_key: string
          owner_team: string | null
          primary_persona: string
          primary_services: Json
          proof_required: boolean
          proof_status: string
          status: string
          updated_at: string
          user_id: string
          ux_quality_target: string
        }
        Insert: {
          blocker_count?: number
          core_journeys?: Json
          core_routes?: Json
          created_at?: string
          demo_vs_real?: string
          description?: string
          display_name: string
          id?: string
          launch_honesty_class?: string
          launch_importance?: string
          loop_key: string
          owner_team?: string | null
          primary_persona?: string
          primary_services?: Json
          proof_required?: boolean
          proof_status?: string
          status?: string
          updated_at?: string
          user_id: string
          ux_quality_target?: string
        }
        Update: {
          blocker_count?: number
          core_journeys?: Json
          core_routes?: Json
          created_at?: string
          demo_vs_real?: string
          description?: string
          display_name?: string
          id?: string
          launch_honesty_class?: string
          launch_importance?: string
          loop_key?: string
          owner_team?: string | null
          primary_persona?: string
          primary_services?: Json
          proof_required?: boolean
          proof_status?: string
          status?: string
          updated_at?: string
          user_id?: string
          ux_quality_target?: string
        }
        Relationships: []
      }
      gift_tracker: {
        Row: {
          budget: number | null
          created_at: string
          gift_idea: string | null
          id: string
          notes: string | null
          occasion: string | null
          recipient: string
          status: string | null
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          gift_idea?: string | null
          id?: string
          notes?: string | null
          occasion?: string | null
          recipient: string
          status?: string | null
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          gift_idea?: string | null
          id?: string
          notes?: string | null
          occasion?: string | null
          recipient?: string
          status?: string | null
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      grocery_items: {
        Row: {
          category: string | null
          checked: boolean | null
          created_at: string
          estimated_cost: number | null
          id: string
          list_id: string | null
          name: string
          note: string | null
          quantity: string | null
          recurring: boolean | null
          store: string | null
          urgent: boolean | null
          user_id: string
        }
        Insert: {
          category?: string | null
          checked?: boolean | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          list_id?: string | null
          name: string
          note?: string | null
          quantity?: string | null
          recurring?: boolean | null
          store?: string | null
          urgent?: boolean | null
          user_id: string
        }
        Update: {
          category?: string | null
          checked?: boolean | null
          created_at?: string
          estimated_cost?: number | null
          id?: string
          list_id?: string | null
          name?: string
          note?: string | null
          quantity?: string | null
          recurring?: boolean | null
          store?: string | null
          urgent?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "grocery_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_lists: {
        Row: {
          created_at: string
          id: string
          name: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          domain: string | null
          id: string
          read: boolean
          title: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          read?: boolean
          title: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          read?: boolean
          title?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      outcome_verifications: {
        Row: {
          actual_outcome: string | null
          created_at: string
          expected_outcome: string
          id: string
          notes: string | null
          recommendation_id: string
          status: string
          updated_at: string
          user_id: string
          verification_type: string
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          actual_outcome?: string | null
          created_at?: string
          expected_outcome?: string
          id?: string
          notes?: string | null
          recommendation_id: string
          status?: string
          updated_at?: string
          user_id: string
          verification_type?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          actual_outcome?: string | null
          created_at?: string
          expected_outcome?: string
          id?: string
          notes?: string | null
          recommendation_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          verification_type?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outcome_verifications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outcome_verifications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "v_recommendation_closure_summary"
            referencedColumns: ["recommendation_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_execution_bindings: {
        Row: {
          approval_queue_item_id: string | null
          binding_status: string
          binding_type: string
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          linked_program_id: string | null
          linked_task_id: string | null
          notes: string | null
          owner_team: string | null
          owner_user_id: string | null
          recommendation_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_queue_item_id?: string | null
          binding_status?: string
          binding_type?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          linked_program_id?: string | null
          linked_task_id?: string | null
          notes?: string | null
          owner_team?: string | null
          owner_user_id?: string | null
          recommendation_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_queue_item_id?: string | null
          binding_status?: string
          binding_type?: string
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          linked_program_id?: string | null
          linked_task_id?: string | null
          notes?: string | null
          owner_team?: string | null
          owner_user_id?: string | null
          recommendation_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_execution_bindings_approval_queue_item_id_fkey"
            columns: ["approval_queue_item_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_execution_bindings_linked_program_id_fkey"
            columns: ["linked_program_id"]
            isOneToOne: false
            referencedRelation: "remediation_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_execution_bindings_linked_program_id_fkey"
            columns: ["linked_program_id"]
            isOneToOne: false
            referencedRelation: "v_remediation_program_summary"
            referencedColumns: ["program_id"]
          },
          {
            foreignKeyName: "recommendation_execution_bindings_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "remediation_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_execution_bindings_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_execution_bindings_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "v_recommendation_closure_summary"
            referencedColumns: ["recommendation_id"]
          },
        ]
      }
      recommendation_execution_events: {
        Row: {
          binding_id: string
          created_at: string
          created_by_user_id: string | null
          details: Json
          event_type: string
          id: string
          summary: string
          user_id: string
        }
        Insert: {
          binding_id: string
          created_at?: string
          created_by_user_id?: string | null
          details?: Json
          event_type: string
          id?: string
          summary?: string
          user_id: string
        }
        Update: {
          binding_id?: string
          created_at?: string
          created_by_user_id?: string | null
          details?: Json
          event_type?: string
          id?: string
          summary?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_execution_events_binding_id_fkey"
            columns: ["binding_id"]
            isOneToOne: false
            referencedRelation: "recommendation_execution_bindings"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_learning_signals: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          recommendation_id: string
          signal_source: string
          signal_strength: number
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          recommendation_id: string
          signal_source?: string
          signal_strength?: number
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          recommendation_id?: string
          signal_source?: string
          signal_strength?: number
          signal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_learning_signals_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_learning_signals_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "v_recommendation_closure_summary"
            referencedColumns: ["recommendation_id"]
          },
        ]
      }
      recommendation_outcome_verifications: {
        Row: {
          actual_improvement: string | null
          binding_id: string | null
          created_at: string
          customer_journey_delta: string | null
          expected_improvement: string
          id: string
          launch_truth_delta: string | null
          notes: string | null
          recommendation_id: string
          user_id: string
          verification_method: string
          verification_status: string
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          actual_improvement?: string | null
          binding_id?: string | null
          created_at?: string
          customer_journey_delta?: string | null
          expected_improvement?: string
          id?: string
          launch_truth_delta?: string | null
          notes?: string | null
          recommendation_id: string
          user_id: string
          verification_method?: string
          verification_status?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          actual_improvement?: string | null
          binding_id?: string | null
          created_at?: string
          customer_journey_delta?: string | null
          expected_improvement?: string
          id?: string
          launch_truth_delta?: string | null
          notes?: string | null
          recommendation_id?: string
          user_id?: string
          verification_method?: string
          verification_status?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_outcome_verifications_binding_id_fkey"
            columns: ["binding_id"]
            isOneToOne: false
            referencedRelation: "recommendation_execution_bindings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_outcome_verifications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_outcome_verifications_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "v_recommendation_closure_summary"
            referencedColumns: ["recommendation_id"]
          },
        ]
      }
      remediation_programs: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          display_name: string
          flagship_loop_key: string | null
          focus_area: string
          id: string
          launch_impact_class: string | null
          owner_team: string | null
          owner_user_id: string | null
          program_key: string
          program_status: string
          start_at: string | null
          target_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string
          display_name: string
          flagship_loop_key?: string | null
          focus_area?: string
          id?: string
          launch_impact_class?: string | null
          owner_team?: string | null
          owner_user_id?: string | null
          program_key: string
          program_status?: string
          start_at?: string | null
          target_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          display_name?: string
          flagship_loop_key?: string | null
          focus_area?: string
          id?: string
          launch_impact_class?: string | null
          owner_team?: string | null
          owner_user_id?: string | null
          program_key?: string
          program_status?: string
          start_at?: string | null
          target_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      remediation_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string
          display_name: string
          due_at: string | null
          execution_type: string
          id: string
          owner_team: string | null
          owner_user_id: string | null
          program_id: string | null
          related_customer_journey_key: string | null
          related_flagship_loop_key: string | null
          related_route_key: string | null
          related_service_key: string | null
          task_key: string
          task_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string
          display_name: string
          due_at?: string | null
          execution_type?: string
          id?: string
          owner_team?: string | null
          owner_user_id?: string | null
          program_id?: string | null
          related_customer_journey_key?: string | null
          related_flagship_loop_key?: string | null
          related_route_key?: string | null
          related_service_key?: string | null
          task_key: string
          task_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string
          display_name?: string
          due_at?: string | null
          execution_type?: string
          id?: string
          owner_team?: string | null
          owner_user_id?: string | null
          program_id?: string | null
          related_customer_journey_key?: string | null
          related_flagship_loop_key?: string | null
          related_route_key?: string | null
          related_service_key?: string | null
          task_key?: string
          task_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remediation_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "remediation_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remediation_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "v_remediation_program_summary"
            referencedColumns: ["program_id"]
          },
        ]
      }
      school_activities: {
        Row: {
          activity_type: string | null
          child_name: string | null
          created_at: string
          id: string
          location: string | null
          notes: string | null
          schedule: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type?: string | null
          child_name?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          schedule?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: string | null
          child_name?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          schedule?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_providers_list: {
        Row: {
          category: string | null
          cost_range: string | null
          created_at: string
          id: string
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          rating: number | null
          response_time: string | null
          total_spent: number | null
          trusted: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_range?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          response_time?: string | null
          total_spent?: number | null
          trusted?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_range?: string | null
          created_at?: string
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          rating?: number | null
          response_time?: string | null
          total_spent?: number | null
          trusted?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      travel_plans: {
        Row: {
          budget: number | null
          created_at: string
          destination: string
          end_date: string | null
          id: string
          notes: string | null
          readiness_percent: number | null
          spent: number | null
          start_date: string | null
          status: string | null
          travelers: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          created_at?: string
          destination: string
          end_date?: string | null
          id?: string
          notes?: string | null
          readiness_percent?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          travelers?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          created_at?: string
          destination?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          readiness_percent?: number | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          travelers?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_outcome_verification_summary: {
        Row: {
          count: number | null
          domain: string | null
          flagship_loop_key: string | null
          role_key: string | null
          user_id: string | null
          verification_method: string | null
          verification_status: string | null
        }
        Relationships: []
      }
      v_recommendation_closure_summary: {
        Row: {
          approval_status: string | null
          avg_score: number | null
          binding_status: string | null
          binding_type: string | null
          created_at: string | null
          domain: string | null
          execution_required: boolean | null
          flagship_loop_key: string | null
          lifecycle_status: string | null
          outcome_status: string | null
          outcome_verification_required: boolean | null
          program_name: string | null
          recommendation_id: string | null
          role_key: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_recommendation_execution_pipeline: {
        Row: {
          count: number | null
          stage: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_remediation_program_summary: {
        Row: {
          blocked_tasks: number | null
          created_at: string | null
          display_name: string | null
          done_tasks: number | null
          flagship_loop_key: string | null
          focus_area: string | null
          launch_impact_class: string | null
          linked_recommendations: number | null
          owner_team: string | null
          program_id: string | null
          program_key: string | null
          program_status: string | null
          total_tasks: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
