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
      advisor_feedback: {
        Row: {
          advisor_id: string
          comment: string | null
          created_at: string
          domain: string
          feedback_type: string
          id: string
          rating: number | null
          request_ref: string | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          comment?: string | null
          created_at?: string
          domain?: string
          feedback_type?: string
          id?: string
          rating?: number | null
          request_ref?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          comment?: string | null
          created_at?: string
          domain?: string
          feedback_type?: string
          id?: string
          rating?: number | null
          request_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advisor_knowledge: {
        Row: {
          advisor_id: string
          confidence: number
          content: string
          created_at: string
          domain: string
          id: string
          source: string
          status: string
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_id: string
          confidence?: number
          content?: string
          created_at?: string
          domain?: string
          id?: string
          source?: string
          status?: string
          tags?: string[]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_id?: string
          confidence?: number
          content?: string
          created_at?: string
          domain?: string
          id?: string
          source?: string
          status?: string
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_memories: {
        Row: {
          advisor_id: string
          content: string
          context_ref: string | null
          created_at: string
          domain: string
          id: string
          importance: number
          memory_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_id: string
          content?: string
          context_ref?: string | null
          created_at?: string
          domain?: string
          id?: string
          importance?: number
          memory_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_id?: string
          content?: string
          context_ref?: string | null
          created_at?: string
          domain?: string
          id?: string
          importance?: number
          memory_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_profiles: {
        Row: {
          advisor_id: string
          avatar_url: string | null
          created_at: string
          display_name: string
          domain: string
          id: string
          personality_traits: Json | null
          updated_at: string
          user_id: string
          visual_style: string | null
        }
        Insert: {
          advisor_id: string
          avatar_url?: string | null
          created_at?: string
          display_name: string
          domain?: string
          id?: string
          personality_traits?: Json | null
          updated_at?: string
          user_id: string
          visual_style?: string | null
        }
        Update: {
          advisor_id?: string
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          domain?: string
          id?: string
          personality_traits?: Json | null
          updated_at?: string
          user_id?: string
          visual_style?: string | null
        }
        Relationships: []
      }
      ai_inference_receipts: {
        Row: {
          capability_id: string | null
          cost_estimate_cents: number | null
          created_at: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model: string
          output_tokens: number | null
          prompt_family: string | null
          provider: string | null
          route_reason: string | null
          status: string | null
          user_id: string
          verification_outcome: string | null
        }
        Insert: {
          capability_id?: string | null
          cost_estimate_cents?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model: string
          output_tokens?: number | null
          prompt_family?: string | null
          provider?: string | null
          route_reason?: string | null
          status?: string | null
          user_id: string
          verification_outcome?: string | null
        }
        Update: {
          capability_id?: string | null
          cost_estimate_cents?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string
          output_tokens?: number | null
          prompt_family?: string | null
          provider?: string | null
          route_reason?: string | null
          status?: string | null
          user_id?: string
          verification_outcome?: string | null
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
      boardroom_decision_receipts: {
        Row: {
          approval_conditions: Json
          approved_motion: string
          created_at: string
          evidence_snapshot: Json
          expected_outcome: string | null
          follow_up_review_date: string | null
          id: string
          item_id: string | null
          linked_execution_items: Json
          proof_trail: Json
          rationale_summary: string
          recommendation_id: string | null
          session_id: string | null
          simulation_snapshot: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_conditions?: Json
          approved_motion?: string
          created_at?: string
          evidence_snapshot?: Json
          expected_outcome?: string | null
          follow_up_review_date?: string | null
          id?: string
          item_id?: string | null
          linked_execution_items?: Json
          proof_trail?: Json
          rationale_summary?: string
          recommendation_id?: string | null
          session_id?: string | null
          simulation_snapshot?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_conditions?: Json
          approved_motion?: string
          created_at?: string
          evidence_snapshot?: Json
          expected_outcome?: string | null
          follow_up_review_date?: string | null
          id?: string
          item_id?: string | null
          linked_execution_items?: Json
          proof_trail?: Json
          rationale_summary?: string
          recommendation_id?: string | null
          session_id?: string | null
          simulation_snapshot?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_decision_receipts_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "boardroom_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boardroom_decision_receipts_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "boardroom_recommendations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boardroom_decision_receipts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "boardroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_evidence: {
        Row: {
          confidence: number
          content: string
          created_at: string
          freshness: string
          id: string
          item_id: string | null
          last_updated: string
          lineage_chain: Json
          proof_receipt_id: string | null
          source_name: string
          source_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          content?: string
          created_at?: string
          freshness?: string
          id?: string
          item_id?: string | null
          last_updated?: string
          lineage_chain?: Json
          proof_receipt_id?: string | null
          source_name?: string
          source_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          content?: string
          created_at?: string
          freshness?: string
          id?: string
          item_id?: string | null
          last_updated?: string
          lineage_chain?: Json
          proof_receipt_id?: string | null
          source_name?: string
          source_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_evidence_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "boardroom_items"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_items: {
        Row: {
          advisor_summaries: Json
          blocking_conditions: Json
          confidence_state: Json
          created_at: string
          description: string
          domain: string
          escalation_reason: string | null
          evidence_refs: Json
          freshness_state: Json
          id: string
          recommendation_state: string
          session_id: string | null
          severity: string
          simulation_state: string
          source_signals: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_summaries?: Json
          blocking_conditions?: Json
          confidence_state?: Json
          created_at?: string
          description?: string
          domain?: string
          escalation_reason?: string | null
          evidence_refs?: Json
          freshness_state?: Json
          id?: string
          recommendation_state?: string
          session_id?: string | null
          severity?: string
          simulation_state?: string
          source_signals?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_summaries?: Json
          blocking_conditions?: Json
          confidence_state?: Json
          created_at?: string
          description?: string
          domain?: string
          escalation_reason?: string | null
          evidence_refs?: Json
          freshness_state?: Json
          id?: string
          recommendation_state?: string
          session_id?: string | null
          severity?: string
          simulation_state?: string
          source_signals?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_items_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "boardroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_recommendations: {
        Row: {
          conditions_for_approval: Json
          confidence_score: number
          created_at: string
          domain_impacts: Json
          evidence_basis: Json
          id: string
          item_id: string | null
          next_best_alternative: string | null
          rationale: string
          reversibility: string
          scenario_basis: string | null
          session_id: string | null
          status: string
          summary: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          conditions_for_approval?: Json
          confidence_score?: number
          created_at?: string
          domain_impacts?: Json
          evidence_basis?: Json
          id?: string
          item_id?: string | null
          next_best_alternative?: string | null
          rationale?: string
          reversibility?: string
          scenario_basis?: string | null
          session_id?: string | null
          status?: string
          summary?: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          conditions_for_approval?: Json
          confidence_score?: number
          created_at?: string
          domain_impacts?: Json
          evidence_basis?: Json
          id?: string
          item_id?: string | null
          next_best_alternative?: string | null
          rationale?: string
          reversibility?: string
          scenario_basis?: string | null
          session_id?: string | null
          status?: string
          summary?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_recommendations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "boardroom_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boardroom_recommendations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "boardroom_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_sessions: {
        Row: {
          closed_at: string | null
          created_at: string
          current_issue_id: string | null
          decision_receipt_ids: Json
          id: string
          opened_at: string
          participating_advisors: Json
          scope: string
          session_mode: string
          session_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          current_issue_id?: string | null
          decision_receipt_ids?: Json
          id?: string
          opened_at?: string
          participating_advisors?: Json
          scope?: string
          session_mode?: string
          session_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          current_issue_id?: string | null
          decision_receipt_ids?: Json
          id?: string
          opened_at?: string
          participating_advisors?: Json
          scope?: string
          session_mode?: string
          session_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_onboarding: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          onboarding_state: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          onboarding_state?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          onboarding_state?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_audit_events: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          severity: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          severity?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          severity?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      cloud_devices: {
        Row: {
          client_version: string | null
          created_at: string
          device_name: string
          id: string
          ip_address: string | null
          is_current: boolean | null
          last_seen_at: string
          platform: string
          requires_reauth: boolean | null
          trust_state: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          client_version?: string | null
          created_at?: string
          device_name?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_seen_at?: string
          platform?: string
          requires_reauth?: boolean | null
          trust_state?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          client_version?: string | null
          created_at?: string
          device_name?: string
          id?: string
          ip_address?: string | null
          is_current?: boolean | null
          last_seen_at?: string
          platform?: string
          requires_reauth?: boolean | null
          trust_state?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cloud_feature_flags: {
        Row: {
          conditions: Json | null
          created_at: string
          description: string | null
          display_name: string
          enabled: boolean
          flag_key: string
          id: string
          scope: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          enabled?: boolean
          flag_key: string
          id?: string
          scope?: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          enabled?: boolean
          flag_key?: string
          id?: string
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_plans: {
        Row: {
          created_at: string
          display_name: string
          features: Json
          id: string
          is_active: boolean | null
          max_devices: number
          max_file_size_bytes: number
          plan_key: string
          price_cents: number | null
          storage_limit_bytes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_devices?: number
          max_file_size_bytes?: number
          plan_key: string
          price_cents?: number | null
          storage_limit_bytes?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          features?: Json
          id?: string
          is_active?: boolean | null
          max_devices?: number
          max_file_size_bytes?: number
          plan_key?: string
          price_cents?: number | null
          storage_limit_bytes?: number
          updated_at?: string
        }
        Relationships: []
      }
      cloud_policies: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          enforced: boolean
          id: string
          policy_key: string
          updated_at: string
          value_json: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          enforced?: boolean
          id?: string
          policy_key: string
          updated_at?: string
          value_json?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          enforced?: boolean
          id?: string
          policy_key?: string
          updated_at?: string
          value_json?: Json
        }
        Relationships: []
      }
      cloud_storage_usage: {
        Row: {
          created_at: string
          failed_downloads: number | null
          failed_uploads: number | null
          file_count: number
          id: string
          largest_file_bytes: number | null
          last_reconciled_at: string | null
          orphaned_blobs: number | null
          quota_bytes: number
          updated_at: string
          used_bytes: number
          user_id: string
        }
        Insert: {
          created_at?: string
          failed_downloads?: number | null
          failed_uploads?: number | null
          file_count?: number
          id?: string
          largest_file_bytes?: number | null
          last_reconciled_at?: string | null
          orphaned_blobs?: number | null
          quota_bytes?: number
          updated_at?: string
          used_bytes?: number
          user_id: string
        }
        Update: {
          created_at?: string
          failed_downloads?: number | null
          failed_uploads?: number | null
          file_count?: number
          id?: string
          largest_file_bytes?: number | null
          last_reconciled_at?: string | null
          orphaned_blobs?: number | null
          quota_bytes?: number
          updated_at?: string
          used_bytes?: number
          user_id?: string
        }
        Relationships: []
      }
      cloud_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          job_type: string
          progress_pct: number | null
          result_summary: string | null
          started_at: string | null
          status: string
          target_user_id: string | null
          triggered_by: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          progress_pct?: number | null
          result_summary?: string | null
          started_at?: string | null
          status?: string
          target_user_id?: string | null
          triggered_by: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          job_type?: string
          progress_pct?: number | null
          result_summary?: string | null
          started_at?: string | null
          status?: string
          target_user_id?: string | null
          triggered_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_user_plans: {
        Row: {
          bonus_storage_bytes: number | null
          created_at: string
          id: string
          overage_allowed: boolean | null
          plan_id: string | null
          status: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_storage_bytes?: number | null
          created_at?: string
          id?: string
          overage_allowed?: boolean | null
          plan_id?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_storage_bytes?: number | null
          created_at?: string
          id?: string
          overage_allowed?: boolean | null
          plan_id?: string | null
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cloud_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      command_memory: {
        Row: {
          command_id: string | null
          context_json: Json | null
          created_at: string
          duration_ms: number | null
          id: string
          intent: string
          learned_at: string
          outcome: string | null
          pattern_tags: string[] | null
          risk: string | null
          updated_at: string
          user_id: string
          user_preferences_json: Json | null
        }
        Insert: {
          command_id?: string | null
          context_json?: Json | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          intent: string
          learned_at?: string
          outcome?: string | null
          pattern_tags?: string[] | null
          risk?: string | null
          updated_at?: string
          user_id: string
          user_preferences_json?: Json | null
        }
        Update: {
          command_id?: string | null
          context_json?: Json | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          intent?: string
          learned_at?: string
          outcome?: string | null
          pattern_tags?: string[] | null
          risk?: string | null
          updated_at?: string
          user_id?: string
          user_preferences_json?: Json | null
        }
        Relationships: []
      }
      command_routing_decisions: {
        Row: {
          approval_flow: string | null
          command_id: string | null
          created_at: string
          decided_at: string
          guarantee_checks_json: Json | null
          id: string
          rationale: string | null
          route_layers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_flow?: string | null
          command_id?: string | null
          created_at?: string
          decided_at?: string
          guarantee_checks_json?: Json | null
          id?: string
          rationale?: string | null
          route_layers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_flow?: string | null
          command_id?: string | null
          created_at?: string
          decided_at?: string
          guarantee_checks_json?: Json | null
          id?: string
          rationale?: string | null
          route_layers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "command_routing_decisions_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_commands"
            referencedColumns: ["id"]
          },
        ]
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
      connector_oauth_flows: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          provider: string
          scopes: string[] | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          provider: string
          scopes?: string[] | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          provider?: string
          scopes?: string[] | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      connector_sync_runs: {
        Row: {
          completed_at: string | null
          connector: string
          created_at: string | null
          id: string
          records_synced: number | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connector: string
          created_at?: string | null
          id?: string
          records_synced?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connector?: string
          created_at?: string | null
          id?: string
          records_synced?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      crm_automations: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          delay_minutes: number | null
          description: string | null
          execution_log: Json
          id: string
          last_run_at: string | null
          runs: number
          status: string
          target_entity: string
          title: string
          trigger_config: Json
          trigger_type: string
          trust_gate: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          delay_minutes?: number | null
          description?: string | null
          execution_log?: Json
          id?: string
          last_run_at?: string | null
          runs?: number
          status?: string
          target_entity?: string
          title: string
          trigger_config?: Json
          trigger_type?: string
          trust_gate?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          delay_minutes?: number | null
          description?: string | null
          execution_log?: Json
          id?: string
          last_run_at?: string | null
          runs?: number
          status?: string
          target_entity?: string
          title?: string
          trigger_config?: Json
          trigger_type?: string
          trust_gate?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_communications: {
        Row: {
          channel: string | null
          comm_type: string
          company_id: string | null
          contact_id: string | null
          content: string | null
          created_at: string
          direction: string | null
          id: string
          occurred_at: string
          opportunity_id: string | null
          outcome: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel?: string | null
          comm_type?: string
          company_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          occurred_at?: string
          opportunity_id?: string | null
          outcome?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string | null
          comm_type?: string
          company_id?: string | null
          contact_id?: string | null
          content?: string | null
          created_at?: string
          direction?: string | null
          id?: string
          occurred_at?: string
          opportunity_id?: string | null
          outcome?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_communications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_communications_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_communications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          address: string | null
          annual_revenue: number | null
          city: string | null
          country: string | null
          created_at: string
          custom_fields: Json | null
          domain: string | null
          health_score: number | null
          id: string
          import_job_id: string | null
          import_source: string | null
          industry: string | null
          name: string
          notes: string | null
          owner: string | null
          phone: string | null
          size: string | null
          state: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          domain?: string | null
          health_score?: number | null
          id?: string
          import_job_id?: string | null
          import_source?: string | null
          industry?: string | null
          name: string
          notes?: string | null
          owner?: string | null
          phone?: string | null
          size?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          domain?: string | null
          health_score?: number | null
          id?: string
          import_job_id?: string | null
          import_source?: string | null
          industry?: string | null
          name?: string
          notes?: string | null
          owner?: string | null
          phone?: string | null
          size?: string | null
          state?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      crm_contact_company: {
        Row: {
          company_id: string
          contact_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          contact_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          contact_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_contact_company_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contact_company_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          custom_fields: Json | null
          email: string | null
          first_name: string
          health_score: number | null
          id: string
          import_job_id: string | null
          import_source: string | null
          last_contacted_at: string | null
          last_name: string
          lifecycle_stage: string
          next_follow_up_at: string | null
          owner: string | null
          phone: string | null
          source: string | null
          state: string | null
          status: string
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_name?: string
          health_score?: number | null
          id?: string
          import_job_id?: string | null
          import_source?: string | null
          last_contacted_at?: string | null
          last_name?: string
          lifecycle_stage?: string
          next_follow_up_at?: string | null
          owner?: string | null
          phone?: string | null
          source?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          custom_fields?: Json | null
          email?: string | null
          first_name?: string
          health_score?: number | null
          id?: string
          import_job_id?: string | null
          import_source?: string | null
          last_contacted_at?: string | null
          last_name?: string
          lifecycle_stage?: string
          next_follow_up_at?: string | null
          owner?: string | null
          phone?: string | null
          source?: string | null
          state?: string | null
          status?: string
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      crm_import_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_count: number | null
          error_count: number | null
          errors: Json | null
          field_mappings: Json | null
          file_name: string | null
          id: string
          skipped_count: number | null
          source: string
          stats: Json | null
          status: string
          total_rows: number | null
          updated_at: string
          updated_count: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_count?: number | null
          error_count?: number | null
          errors?: Json | null
          field_mappings?: Json | null
          file_name?: string | null
          id?: string
          skipped_count?: number | null
          source?: string
          stats?: Json | null
          status?: string
          total_rows?: number | null
          updated_at?: string
          updated_count?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_count?: number | null
          error_count?: number | null
          errors?: Json | null
          field_mappings?: Json | null
          file_name?: string | null
          id?: string
          skipped_count?: number | null
          source?: string
          stats?: Json | null
          status?: string
          total_rows?: number | null
          updated_at?: string
          updated_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      crm_merge_log: {
        Row: {
          created_at: string
          entity_type: string
          id: string
          loser_id: string
          merge_reason: string | null
          merged_fields: Json | null
          user_id: string
          winner_id: string
        }
        Insert: {
          created_at?: string
          entity_type?: string
          id?: string
          loser_id: string
          merge_reason?: string | null
          merged_fields?: Json | null
          user_id: string
          winner_id: string
        }
        Update: {
          created_at?: string
          entity_type?: string
          id?: string
          loser_id?: string
          merge_reason?: string | null
          merged_fields?: Json | null
          user_id?: string
          winner_id?: string
        }
        Relationships: []
      }
      crm_notes: {
        Row: {
          company_id: string | null
          contact_id: string | null
          content: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          is_pinned: boolean | null
          note_type: string | null
          opportunity_id: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          content?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          opportunity_id?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          content?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_pinned?: boolean | null
          note_type?: string | null
          opportunity_id?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          custom_fields: Json | null
          expected_close_date: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          notes: string | null
          owner: string | null
          probability: number | null
          source: string | null
          stage: string
          stage_id: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          value: number | null
          won_at: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          notes?: string | null
          owner?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          stage_id?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
          won_at?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          notes?: string | null
          owner?: string | null
          probability?: number | null
          source?: string | null
          stage?: string
          stage_id?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          display_order: number
          id: string
          is_lost: boolean | null
          is_won: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_lost?: boolean | null
          is_won?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_segments: {
        Row: {
          contact_count: number | null
          created_at: string
          description: string | null
          filter_config: Json
          id: string
          is_system: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          filter_config?: Json
          id?: string
          is_system?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          description?: string | null
          filter_config?: Json
          id?: string
          is_system?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      crm_tasks: {
        Row: {
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          opportunity_id: string | null
          priority: string | null
          status: string
          task_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          opportunity_id?: string | null
          priority?: string | null
          status?: string
          task_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          opportunity_id?: string | null
          priority?: string | null
          status?: string
          task_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      dual_authority_challenges: {
        Row: {
          action: string
          challenge_token: string | null
          command_id: string | null
          consequences: Json | null
          created_at: string
          expires_at: string
          explanation: string | null
          id: string
          responded_at: string | null
          response: string | null
          risk_level: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action: string
          challenge_token?: string | null
          command_id?: string | null
          consequences?: Json | null
          created_at?: string
          expires_at: string
          explanation?: string | null
          id?: string
          responded_at?: string | null
          response?: string | null
          risk_level?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action?: string
          challenge_token?: string | null
          command_id?: string | null
          consequences?: Json | null
          created_at?: string
          expires_at?: string
          explanation?: string | null
          id?: string
          responded_at?: string | null
          response?: string | null
          risk_level?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dual_authority_challenges_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_commands"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_commands: {
        Row: {
          approval_required: boolean | null
          completed_at: string | null
          correlation_id: string | null
          created_at: string
          id: string
          input: string
          intent: string | null
          result_summary: string | null
          risk_class: string | null
          scope: string | null
          status: string | null
          target_layers: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_required?: boolean | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          input: string
          intent?: string | null
          result_summary?: string | null
          risk_class?: string | null
          scope?: string | null
          status?: string | null
          target_layers?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_required?: boolean | null
          completed_at?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          input?: string
          intent?: string | null
          result_summary?: string | null
          risk_class?: string | null
          scope?: string | null
          status?: string | null
          target_layers?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_contracts: {
        Row: {
          app_ownership: string | null
          approval_required: boolean | null
          cloud_ownership: string | null
          created_at: string
          events: string[] | null
          failure_behavior: string | null
          feature_name: string
          id: string
          os_ownership: string | null
          rollback_exists: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_ownership?: string | null
          approval_required?: boolean | null
          cloud_ownership?: string | null
          created_at?: string
          events?: string[] | null
          failure_behavior?: string | null
          feature_name: string
          id?: string
          os_ownership?: string | null
          rollback_exists?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_ownership?: string | null
          approval_required?: boolean | null
          cloud_ownership?: string | null
          created_at?: string
          events?: string[] | null
          failure_behavior?: string | null
          feature_name?: string
          id?: string
          os_ownership?: string | null
          rollback_exists?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_events: {
        Row: {
          correlation_id: string | null
          created_at: string
          emitted_at: string
          event_type: string
          id: string
          payload_json: Json | null
          source_layer: string
          user_id: string
          version: number | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          emitted_at?: string
          event_type: string
          id?: string
          payload_json?: Json | null
          source_layer: string
          user_id: string
          version?: number | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          emitted_at?: string
          event_type?: string
          id?: string
          payload_json?: Json | null
          source_layer?: string
          user_id?: string
          version?: number | null
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
      health_validation_results: {
        Row: {
          checked_at: string
          component: string
          details: string | null
          id: string
          status: string
          update_id: string | null
          user_id: string
        }
        Insert: {
          checked_at?: string
          component: string
          details?: string | null
          id?: string
          status?: string
          update_id?: string | null
          user_id: string
        }
        Update: {
          checked_at?: string
          component?: string
          details?: string | null
          id?: string
          status?: string
          update_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_validation_results_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "update_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      layer_health_snapshots: {
        Row: {
          captured_at: string
          created_at: string
          health_score: number | null
          id: string
          layer: string
          services_degraded: number | null
          services_healthy: number | null
          services_total: number | null
          user_id: string
        }
        Insert: {
          captured_at?: string
          created_at?: string
          health_score?: number | null
          id?: string
          layer: string
          services_degraded?: number | null
          services_healthy?: number | null
          services_total?: number | null
          user_id: string
        }
        Update: {
          captured_at?: string
          created_at?: string
          health_score?: number | null
          id?: string
          layer?: string
          services_degraded?: number | null
          services_healthy?: number | null
          services_total?: number | null
          user_id?: string
        }
        Relationships: []
      }
      lead_inbox_items: {
        Row: {
          accepted_at: string | null
          advisor_suggestion: string | null
          business_profile_mode: string | null
          company: string | null
          completeness_score: number | null
          contact_email: string | null
          contact_name: string
          contact_phone: string | null
          created_at: string
          duplicate_match_id: string | null
          duplicate_status: string
          id: string
          inquiry_text: string | null
          missing_fields: string[] | null
          quality_hints: Json | null
          quality_score: number | null
          routed_to: string | null
          source: string
          suggested_owner: string | null
          suggested_route: string
          triage_status: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          advisor_suggestion?: string | null
          business_profile_mode?: string | null
          company?: string | null
          completeness_score?: number | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          duplicate_match_id?: string | null
          duplicate_status?: string
          id?: string
          inquiry_text?: string | null
          missing_fields?: string[] | null
          quality_hints?: Json | null
          quality_score?: number | null
          routed_to?: string | null
          source?: string
          suggested_owner?: string | null
          suggested_route?: string
          triage_status?: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          advisor_suggestion?: string | null
          business_profile_mode?: string | null
          company?: string | null
          completeness_score?: number | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          duplicate_match_id?: string | null
          duplicate_status?: string
          id?: string
          inquiry_text?: string | null
          missing_fields?: string[] | null
          quality_hints?: Json | null
          quality_score?: number | null
          routed_to?: string | null
          source?: string
          suggested_owner?: string | null
          suggested_route?: string
          triage_status?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          inbox_item_id: string | null
          last_contact_at: string | null
          likely_value: number | null
          name: string
          next_action: string | null
          notes: string | null
          opportunity_score: number | null
          phone: string | null
          source: string | null
          stale_risk: boolean | null
          status: string
          updated_at: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inbox_item_id?: string | null
          last_contact_at?: string | null
          likely_value?: number | null
          name?: string
          next_action?: string | null
          notes?: string | null
          opportunity_score?: number | null
          phone?: string | null
          source?: string | null
          stale_risk?: boolean | null
          status?: string
          updated_at?: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          inbox_item_id?: string | null
          last_contact_at?: string | null
          likely_value?: number | null
          name?: string
          next_action?: string | null
          notes?: string | null
          opportunity_score?: number | null
          phone?: string | null
          source?: string | null
          stale_risk?: boolean | null
          status?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_inbox_item_id_fkey"
            columns: ["inbox_item_id"]
            isOneToOne: false
            referencedRelation: "lead_inbox_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_receipts: {
        Row: {
          channel: string | null
          created_at: string | null
          delivered_at: string | null
          failure_reason: string | null
          id: string
          latency_ms: number | null
          notification_id: string | null
          platform: string | null
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          channel?: string | null
          created_at?: string | null
          delivered_at?: string | null
          failure_reason?: string | null
          id?: string
          latency_ms?: number | null
          notification_id?: string | null
          platform?: string | null
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          channel?: string | null
          created_at?: string | null
          delivered_at?: string | null
          failure_reason?: string | null
          id?: string
          latency_ms?: number | null
          notification_id?: string | null
          platform?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          dismissed: boolean
          domain: string | null
          icon_name: string | null
          id: string
          metadata: Json | null
          read: boolean
          signal_type: string | null
          target_app: string | null
          target_module: string | null
          title: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          dismissed?: boolean
          domain?: string | null
          icon_name?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean
          signal_type?: string | null
          target_app?: string | null
          target_module?: string | null
          title: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          dismissed?: boolean
          domain?: string | null
          icon_name?: string | null
          id?: string
          metadata?: Json | null
          read?: boolean
          signal_type?: string | null
          target_app?: string | null
          target_module?: string | null
          title?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_choices: {
        Row: {
          applied: boolean
          applied_at: string | null
          created_at: string
          id: string
          key: string
          session_id: string
          source: string
          value: Json | null
        }
        Insert: {
          applied?: boolean
          applied_at?: string | null
          created_at?: string
          id?: string
          key: string
          session_id: string
          source?: string
          value?: Json | null
        }
        Update: {
          applied?: boolean
          applied_at?: string | null
          created_at?: string
          id?: string
          key?: string
          session_id?: string
          source?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_choices_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_completion_markers: {
        Row: {
          created_at: string
          details: string | null
          id: string
          marker_name: string
          satisfied: boolean
          satisfied_at: string | null
          session_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          marker_name: string
          satisfied?: boolean
          satisfied_at?: string | null
          session_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          marker_name?: string
          satisfied?: boolean
          satisfied_at?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_completion_markers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_hardware_detection: {
        Row: {
          battery_present: boolean | null
          biometric_present: boolean | null
          bluetooth_present: boolean | null
          created_at: string
          display_resolution: string | null
          ethernet_present: boolean | null
          hardware_model: string | null
          id: string
          memory_bytes: number | null
          session_id: string
          storage_bytes: number | null
          tpm_present: boolean | null
          wifi_present: boolean | null
        }
        Insert: {
          battery_present?: boolean | null
          biometric_present?: boolean | null
          bluetooth_present?: boolean | null
          created_at?: string
          display_resolution?: string | null
          ethernet_present?: boolean | null
          hardware_model?: string | null
          id?: string
          memory_bytes?: number | null
          session_id: string
          storage_bytes?: number | null
          tpm_present?: boolean | null
          wifi_present?: boolean | null
        }
        Update: {
          battery_present?: boolean | null
          biometric_present?: boolean | null
          bluetooth_present?: boolean | null
          created_at?: string
          display_resolution?: string | null
          ethernet_present?: boolean | null
          hardware_model?: string | null
          id?: string
          memory_bytes?: number | null
          session_id?: string
          storage_bytes?: number | null
          tpm_present?: boolean | null
          wifi_present?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_hardware_detection_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_restore_sources: {
        Row: {
          created_at: string
          id: string
          metadata_ref: string | null
          selected: boolean
          session_id: string
          source_type: string
          status: string
          validation_status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata_ref?: string | null
          selected?: boolean
          session_id: string
          source_type?: string
          status?: string
          validation_status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata_ref?: string | null
          selected?: boolean
          session_id?: string
          source_type?: string
          status?: string
          validation_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_restore_sources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_sessions: {
        Row: {
          boot_id: string
          completed_at: string | null
          created_at: string
          current_step: string
          device_id: string
          id: string
          interrupted: boolean
          managed_enrollment_mode: boolean
          resume_token: string | null
          started_at: string
          state: string
          updated_at: string
          user_id: string
          version: string
        }
        Insert: {
          boot_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: string
          device_id: string
          id?: string
          interrupted?: boolean
          managed_enrollment_mode?: boolean
          resume_token?: string | null
          started_at?: string
          state?: string
          updated_at?: string
          user_id: string
          version?: string
        }
        Update: {
          boot_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: string
          device_id?: string
          id?: string
          interrupted?: boolean
          managed_enrollment_mode?: boolean
          resume_token?: string | null
          started_at?: string
          state?: string
          updated_at?: string
          user_id?: string
          version?: string
        }
        Relationships: []
      }
      onboarding_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          entered_at: string | null
          failed_at: string | null
          id: string
          order_index: number
          required: boolean
          session_id: string
          skipped_at: string | null
          status: string
          step_name: string
          updated_at: string
          validation_error_code: string | null
          validation_error_message: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          entered_at?: string | null
          failed_at?: string | null
          id?: string
          order_index?: number
          required?: boolean
          session_id: string
          skipped_at?: string | null
          status?: string
          step_name: string
          updated_at?: string
          validation_error_code?: string | null
          validation_error_message?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          entered_at?: string | null
          failed_at?: string | null
          id?: string
          order_index?: number
          required?: boolean
          session_id?: string
          skipped_at?: string | null
          status?: string
          step_name?: string
          updated_at?: string
          validation_error_code?: string | null
          validation_error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "onboarding_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          joined_at: string | null
          org_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          org_id: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          joined_at?: string | null
          org_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      os_audit_events: {
        Row: {
          action: string
          actor_service: string | null
          actor_session_id: string | null
          auth_method: string | null
          correlation_id: string | null
          created_at: string
          decision: string
          event_id: string
          id: string
          metadata: Json | null
          reason: string | null
          resource: string | null
          severity: string
          ts: string
          user_id: string
        }
        Insert: {
          action: string
          actor_service?: string | null
          actor_session_id?: string | null
          auth_method?: string | null
          correlation_id?: string | null
          created_at?: string
          decision?: string
          event_id: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          resource?: string | null
          severity?: string
          ts?: string
          user_id: string
        }
        Update: {
          action?: string
          actor_service?: string | null
          actor_session_id?: string | null
          auth_method?: string | null
          correlation_id?: string | null
          created_at?: string
          decision?: string
          event_id?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          resource?: string | null
          severity?: string
          ts?: string
          user_id?: string
        }
        Relationships: []
      }
      os_auth_methods: {
        Row: {
          created_at: string
          enabled: boolean
          enrolled_at: string
          id: string
          last_used_at: string | null
          method_type: string
          policy_flags: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          enrolled_at?: string
          id?: string
          last_used_at?: string | null
          method_type?: string
          policy_flags?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          enrolled_at?: string
          id?: string
          last_used_at?: string | null
          method_type?: string
          policy_flags?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_capabilities: {
        Row: {
          capability_id: string
          created_at: string
          description: string | null
          id: string
          name: string
          sensitivity_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          capability_id: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sensitivity_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          capability_id?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sensitivity_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_elevation_tokens: {
        Row: {
          action: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          issued_at: string
          nonce: string | null
          session_id: string
          signature: string | null
          single_use: boolean
          target_service: string
          token_id: string
          user_id: string
        }
        Insert: {
          action: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          issued_at?: string
          nonce?: string | null
          session_id: string
          signature?: string | null
          single_use?: boolean
          target_service: string
          token_id: string
          user_id: string
        }
        Update: {
          action?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          issued_at?: string
          nonce?: string | null
          session_id?: string
          signature?: string | null
          single_use?: boolean
          target_service?: string
          token_id?: string
          user_id?: string
        }
        Relationships: []
      }
      os_keyrings: {
        Row: {
          created_at: string
          hardware_backed: boolean
          id: string
          keyring_id: string
          protection_class: string
          rotated_at: string
          scope: string
          secret_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hardware_backed?: boolean
          id?: string
          keyring_id: string
          protection_class?: string
          rotated_at?: string
          scope?: string
          secret_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hardware_backed?: boolean
          id?: string
          keyring_id?: string
          protection_class?: string
          rotated_at?: string
          scope?: string
          secret_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_role_capabilities: {
        Row: {
          capability_id: string
          created_at: string
          default_allowed: boolean
          id: string
          role: string
          user_id: string
        }
        Insert: {
          capability_id: string
          created_at?: string
          default_allowed?: boolean
          id?: string
          role: string
          user_id: string
        }
        Update: {
          capability_id?: string
          created_at?: string
          default_allowed?: boolean
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      os_secrets_metadata: {
        Row: {
          access_policy_id: string | null
          created_at: string
          exportable: boolean
          hardware_backed: boolean
          id: string
          keyring_id: string
          label: string | null
          last_accessed_at: string | null
          owner_scope: string
          revoked: boolean
          secret_id: string
          secret_type: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          access_policy_id?: string | null
          created_at?: string
          exportable?: boolean
          hardware_backed?: boolean
          id?: string
          keyring_id: string
          label?: string | null
          last_accessed_at?: string | null
          owner_scope?: string
          revoked?: boolean
          secret_id: string
          secret_type: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          access_policy_id?: string | null
          created_at?: string
          exportable?: boolean
          hardware_backed?: boolean
          id?: string
          keyring_id?: string
          label?: string | null
          last_accessed_at?: string | null
          owner_scope?: string
          revoked?: boolean
          secret_id?: string
          secret_type?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      os_service_identities: {
        Row: {
          allowed_actions: string[] | null
          created_at: string
          id: string
          privileged: boolean
          registered_at: string
          secret_scope: string[] | null
          service_name: string
          service_uid: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_actions?: string[] | null
          created_at?: string
          id?: string
          privileged?: boolean
          registered_at?: string
          secret_scope?: string[] | null
          service_name: string
          service_uid: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_actions?: string[] | null
          created_at?: string
          id?: string
          privileged?: boolean
          registered_at?: string
          secret_scope?: string[] | null
          service_name?: string
          service_uid?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_sessions: {
        Row: {
          auth_fresh_until: string | null
          created_at: string
          display_id: string | null
          id: string
          last_activity_at: string
          locked: boolean
          role: string
          seat_id: string | null
          session_id: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_fresh_until?: string | null
          created_at?: string
          display_id?: string | null
          id?: string
          last_activity_at?: string
          locked?: boolean
          role?: string
          seat_id?: string | null
          session_id: string
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_fresh_until?: string | null
          created_at?: string
          display_id?: string | null
          id?: string
          last_activity_at?: string
          locked?: boolean
          role?: string
          seat_id?: string | null
          session_id?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_user_accounts: {
        Row: {
          created_at: string
          display_name: string
          enrolled_methods: string[]
          failed_attempts: number
          id: string
          lockout_until: string | null
          password_hash_ref: string | null
          profile_ref: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          enrolled_methods?: string[]
          failed_attempts?: number
          id?: string
          lockout_until?: string | null
          password_hash_ref?: string | null
          profile_ref?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          enrolled_methods?: string[]
          failed_attempts?: number
          id?: string
          lockout_until?: string | null
          password_hash_ref?: string | null
          profile_ref?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string
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
      rollback_events: {
        Row: {
          completed_at: string | null
          created_at: string
          detected_at: string
          id: string
          reason_code: string | null
          rollback_to_slot: string
          source_slot: string
          trigger_type: string
          update_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          reason_code?: string | null
          rollback_to_slot: string
          source_slot: string
          trigger_type?: string
          update_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          reason_code?: string | null
          rollback_to_slot?: string
          source_slot?: string
          trigger_type?: string
          update_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rollback_events_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "update_catalog"
            referencedColumns: ["id"]
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
      system_guarantees: {
        Row: {
          checked_at: string
          command_id: string | null
          created_at: string
          explanation: string | null
          guarantee_type: string
          id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          command_id?: string | null
          created_at?: string
          explanation?: string | null
          guarantee_type: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_at?: string
          command_id?: string | null
          created_at?: string
          explanation?: string | null
          guarantee_type?: string
          id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_guarantees_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_commands"
            referencedColumns: ["id"]
          },
        ]
      }
      system_slots: {
        Row: {
          boot_count: number | null
          build_id: string
          created_at: string
          health_status: string | null
          id: string
          installed_at: string
          integrity_verified: boolean | null
          last_boot_at: string | null
          slot_id: string
          status: string
          updated_at: string
          user_id: string
          version: string
        }
        Insert: {
          boot_count?: number | null
          build_id: string
          created_at?: string
          health_status?: string | null
          id?: string
          installed_at?: string
          integrity_verified?: boolean | null
          last_boot_at?: string | null
          slot_id: string
          status?: string
          updated_at?: string
          user_id: string
          version: string
        }
        Update: {
          boot_count?: number | null
          build_id?: string
          created_at?: string
          health_status?: string | null
          id?: string
          installed_at?: string
          integrity_verified?: boolean | null
          last_boot_at?: string | null
          slot_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: string
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
      update_boot_attempts: {
        Row: {
          booted_at: string | null
          created_at: string
          health_validation_ok: boolean | null
          id: string
          reboot_requested_at: string | null
          rollback_reason: string | null
          rollback_triggered: boolean | null
          startup_validation_ok: boolean | null
          target_slot: string
          update_id: string | null
          user_id: string
        }
        Insert: {
          booted_at?: string | null
          created_at?: string
          health_validation_ok?: boolean | null
          id?: string
          reboot_requested_at?: string | null
          rollback_reason?: string | null
          rollback_triggered?: boolean | null
          startup_validation_ok?: boolean | null
          target_slot: string
          update_id?: string | null
          user_id: string
        }
        Update: {
          booted_at?: string | null
          created_at?: string
          health_validation_ok?: boolean | null
          id?: string
          reboot_requested_at?: string | null
          rollback_reason?: string | null
          rollback_triggered?: boolean | null
          startup_validation_ok?: boolean | null
          target_slot?: string
          update_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_boot_attempts_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "update_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      update_catalog: {
        Row: {
          build_id: string
          channel: string
          components: Json | null
          created_at: string
          critical: boolean
          delta_from_version: string | null
          id: string
          metadata_hash: string | null
          min_supported_version: string | null
          package_format: string | null
          payload_size: number | null
          published_at: string
          release_notes: string | null
          rollout_percentage: number | null
          signature_ref: string | null
          update_type: string
          version: string
        }
        Insert: {
          build_id: string
          channel?: string
          components?: Json | null
          created_at?: string
          critical?: boolean
          delta_from_version?: string | null
          id?: string
          metadata_hash?: string | null
          min_supported_version?: string | null
          package_format?: string | null
          payload_size?: number | null
          published_at?: string
          release_notes?: string | null
          rollout_percentage?: number | null
          signature_ref?: string | null
          update_type?: string
          version: string
        }
        Update: {
          build_id?: string
          channel?: string
          components?: Json | null
          created_at?: string
          critical?: boolean
          delta_from_version?: string | null
          id?: string
          metadata_hash?: string | null
          min_supported_version?: string | null
          package_format?: string | null
          payload_size?: number | null
          published_at?: string
          release_notes?: string | null
          rollout_percentage?: number | null
          signature_ref?: string | null
          update_type?: string
          version?: string
        }
        Relationships: []
      }
      update_channels: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          name: string
          policy_allowed: boolean
          user_id: string
          user_selectable: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          policy_allowed?: boolean
          user_id: string
          user_selectable?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          name?: string
          policy_allowed?: boolean
          user_id?: string
          user_selectable?: boolean
        }
        Relationships: []
      }
      update_history: {
        Row: {
          action: string
          actor: string
          created_at: string
          from_version: string | null
          id: string
          reason: string | null
          to_version: string
          update_id: string | null
          user_id: string
        }
        Insert: {
          action?: string
          actor?: string
          created_at?: string
          from_version?: string | null
          id?: string
          reason?: string | null
          to_version: string
          update_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string
          from_version?: string | null
          id?: string
          reason?: string | null
          to_version?: string
          update_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_history_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "update_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      update_preflight_results: {
        Row: {
          battery_percent: number | null
          channel_allowed: boolean | null
          charger_connected: boolean | null
          checked_at: string
          free_storage_bytes: number | null
          id: string
          network_type: string | null
          passed: boolean
          policy_allowed: boolean | null
          reason_code: string | null
          slot_available: boolean | null
          update_id: string | null
          user_id: string
        }
        Insert: {
          battery_percent?: number | null
          channel_allowed?: boolean | null
          charger_connected?: boolean | null
          checked_at?: string
          free_storage_bytes?: number | null
          id?: string
          network_type?: string | null
          passed?: boolean
          policy_allowed?: boolean | null
          reason_code?: string | null
          slot_available?: boolean | null
          update_id?: string | null
          user_id: string
        }
        Update: {
          battery_percent?: number | null
          channel_allowed?: boolean | null
          charger_connected?: boolean | null
          checked_at?: string
          free_storage_bytes?: number | null
          id?: string
          network_type?: string | null
          passed?: boolean
          policy_allowed?: boolean | null
          reason_code?: string | null
          slot_available?: boolean | null
          update_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_preflight_results_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "update_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      update_staging: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          integrity_verified: boolean | null
          snapshot_id: string | null
          staged_at: string | null
          state: string
          target_slot: string
          update_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          integrity_verified?: boolean | null
          snapshot_id?: string | null
          staged_at?: string | null
          state?: string
          target_slot?: string
          update_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          integrity_verified?: boolean | null
          snapshot_id?: string | null
          staged_at?: string | null
          state?: string
          target_slot?: string
          update_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_staging_update_id_fkey"
            columns: ["update_id"]
            isOneToOne: false
            referencedRelation: "update_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
