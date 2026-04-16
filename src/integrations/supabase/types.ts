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
      action_safety_classifications: {
        Row: {
          action_key: string
          confirmation_prompt: string | null
          created_at: string
          description: string | null
          domain: string | null
          id: string
          max_autonomy_level: number
          policy_overrides: Json | null
          requires_audit: boolean
          requires_confirmation: boolean
          rollback_capable: boolean
          safety_class: string
          trust_threshold: number
          updated_at: string
          user_id: string
        }
        Insert: {
          action_key: string
          confirmation_prompt?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          max_autonomy_level?: number
          policy_overrides?: Json | null
          requires_audit?: boolean
          requires_confirmation?: boolean
          rollback_capable?: boolean
          safety_class?: string
          trust_threshold?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          action_key?: string
          confirmation_prompt?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          max_autonomy_level?: number
          policy_overrides?: Json | null
          requires_audit?: boolean
          requires_confirmation?: boolean
          rollback_capable?: boolean
          safety_class?: string
          trust_threshold?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_action_audit: {
        Row: {
          action: string
          actor_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          justification: string | null
          metadata: Json | null
          plane: string
          session_id: string | null
          severity: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          justification?: string | null
          metadata?: Json | null
          plane?: string
          session_id?: string | null
          severity?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          justification?: string | null
          metadata?: Json | null
          plane?: string
          session_id?: string | null
          severity?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_action_confirmations: {
        Row: {
          action_key: string
          actor_user_id: string
          approved_at: string | null
          approved_by: string | null
          cooldown_expires_at: string | null
          correlation_id: string | null
          created_at: string
          dry_run_result: Json | null
          executed_at: string | null
          id: string
          impact_summary: string | null
          justification: string
          params: Json | null
          rejected_at: string | null
          rejected_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action_key: string
          actor_user_id: string
          approved_at?: string | null
          approved_by?: string | null
          cooldown_expires_at?: string | null
          correlation_id?: string | null
          created_at?: string
          dry_run_result?: Json | null
          executed_at?: string | null
          id?: string
          impact_summary?: string | null
          justification?: string
          params?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action_key?: string
          actor_user_id?: string
          approved_at?: string | null
          approved_by?: string | null
          cooldown_expires_at?: string | null
          correlation_id?: string | null
          created_at?: string
          dry_run_result?: Json | null
          executed_at?: string | null
          id?: string
          impact_summary?: string | null
          justification?: string
          params?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_role_permissions: {
        Row: {
          created_at: string
          description: string
          granted: boolean
          id: string
          permission: string
          role_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          granted?: boolean
          id?: string
          permission: string
          role_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          granted?: boolean
          id?: string
          permission?: string
          role_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_safety_actions: {
        Row: {
          action_key: string
          cooldown_seconds: number
          created_at: string
          description: string | null
          display_name: string
          id: string
          impact_summary_template: string | null
          plane: string
          required_permission: string
          requires_confirmation: boolean
          requires_dry_run: boolean
          requires_dual_approval: boolean
          requires_justification: boolean
          risk_level: string
          updated_at: string
        }
        Insert: {
          action_key: string
          cooldown_seconds?: number
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          impact_summary_template?: string | null
          plane?: string
          required_permission: string
          requires_confirmation?: boolean
          requires_dry_run?: boolean
          requires_dual_approval?: boolean
          requires_justification?: boolean
          risk_level?: string
          updated_at?: string
        }
        Update: {
          action_key?: string
          cooldown_seconds?: number
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          impact_summary_template?: string | null
          plane?: string
          required_permission?: string
          requires_confirmation?: boolean
          requires_dry_run?: boolean
          requires_dual_approval?: boolean
          requires_justification?: boolean
          risk_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          last_activity_at: string
          mfa_verified: boolean
          revoke_reason: string | null
          revoked_at: string | null
          started_at: string
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          mfa_verified?: boolean
          revoke_reason?: string | null
          revoked_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_activity_at?: string
          mfa_verified?: boolean
          revoke_reason?: string | null
          revoked_at?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
      advisor_autonomy_policies: {
        Row: {
          allow_client_facing: boolean
          allow_communication: boolean
          allow_financial: boolean
          allow_scheduling: boolean
          autonomy_level: number
          created_at: string
          domain: string
          emergency_stop: boolean
          id: string
          max_financial_impact_cents: number
          paused_at: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          require_approval_above_confidence: number
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_client_facing?: boolean
          allow_communication?: boolean
          allow_financial?: boolean
          allow_scheduling?: boolean
          autonomy_level?: number
          created_at?: string
          domain?: string
          emergency_stop?: boolean
          id?: string
          max_financial_impact_cents?: number
          paused_at?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          require_approval_above_confidence?: number
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_client_facing?: boolean
          allow_communication?: boolean
          allow_financial?: boolean
          allow_scheduling?: boolean
          autonomy_level?: number
          created_at?: string
          domain?: string
          emergency_stop?: boolean
          id?: string
          max_financial_impact_cents?: number
          paused_at?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          require_approval_above_confidence?: number
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_board_actions: {
        Row: {
          action_type: string
          advisor_id: string
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          confidence: number
          created_at: string
          description: string
          domain: string
          error_message: string | null
          executed_at: string | null
          failed_at: string | null
          id: string
          parameters: Json | null
          proof_receipt: Json | null
          recommendation_id: string | null
          requires_approval: boolean
          result: Json | null
          reverted_at: string | null
          risk_tier: string
          rollback_data: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type?: string
          advisor_id: string
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          confidence?: number
          created_at?: string
          description?: string
          domain?: string
          error_message?: string | null
          executed_at?: string | null
          failed_at?: string | null
          id?: string
          parameters?: Json | null
          proof_receipt?: Json | null
          recommendation_id?: string | null
          requires_approval?: boolean
          result?: Json | null
          reverted_at?: string | null
          risk_tier?: string
          rollback_data?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          advisor_id?: string
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          confidence?: number
          created_at?: string
          description?: string
          domain?: string
          error_message?: string | null
          executed_at?: string | null
          failed_at?: string | null
          id?: string
          parameters?: Json | null
          proof_receipt?: Json | null
          recommendation_id?: string | null
          requires_approval?: boolean
          result?: Json | null
          reverted_at?: string | null
          risk_tier?: string
          rollback_data?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_board_actions_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "advisor_board_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_board_memory: {
        Row: {
          access_count: number
          advisor_id: string
          category: string
          confidence: number
          content: string
          context_ref: string | null
          created_at: string
          expires_at: string | null
          id: string
          importance: number
          last_accessed_at: string | null
          memory_layer: string
          metadata: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_count?: number
          advisor_id: string
          category?: string
          confidence?: number
          content: string
          context_ref?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_layer?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_count?: number
          advisor_id?: string
          category?: string
          confidence?: number
          content?: string
          context_ref?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_layer?: string
          metadata?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_board_recommendations: {
        Row: {
          action_plan: Json | null
          advisor_id: string
          business_impact_score: number
          category: string
          clarity_score: number
          confidence_score: number
          contributing_advisors: Json | null
          created_at: string
          domain: string
          evidence_refs: Json | null
          id: string
          operational_risk_score: number
          profitability_score: number
          rationale: string
          relationship_risk_score: number
          resolution_notes: string | null
          resolved_at: string | null
          reversibility_score: number
          status: string
          summary: string
          title: string
          updated_at: string
          urgency_score: number
          user_id: string
        }
        Insert: {
          action_plan?: Json | null
          advisor_id: string
          business_impact_score?: number
          category?: string
          clarity_score?: number
          confidence_score?: number
          contributing_advisors?: Json | null
          created_at?: string
          domain?: string
          evidence_refs?: Json | null
          id?: string
          operational_risk_score?: number
          profitability_score?: number
          rationale?: string
          relationship_risk_score?: number
          resolution_notes?: string | null
          resolved_at?: string | null
          reversibility_score?: number
          status?: string
          summary?: string
          title: string
          updated_at?: string
          urgency_score?: number
          user_id: string
        }
        Update: {
          action_plan?: Json | null
          advisor_id?: string
          business_impact_score?: number
          category?: string
          clarity_score?: number
          confidence_score?: number
          contributing_advisors?: Json | null
          created_at?: string
          domain?: string
          evidence_refs?: Json | null
          id?: string
          operational_risk_score?: number
          profitability_score?: number
          rationale?: string
          relationship_risk_score?: number
          resolution_notes?: string | null
          resolved_at?: string | null
          reversibility_score?: number
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          urgency_score?: number
          user_id?: string
        }
        Relationships: []
      }
      advisor_board_reflections: {
        Row: {
          advisor_id: string
          created_at: string
          id: string
          lesson_learned: string | null
          outcome_observed: string | null
          outcome_quality: number | null
          owner_action: string
          owner_feedback: string | null
          pattern_tags: Json | null
          recommendation_id: string | null
          should_repeat: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_id: string
          created_at?: string
          id?: string
          lesson_learned?: string | null
          outcome_observed?: string | null
          outcome_quality?: number | null
          owner_action?: string
          owner_feedback?: string | null
          pattern_tags?: Json | null
          recommendation_id?: string | null
          should_repeat?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_id?: string
          created_at?: string
          id?: string
          lesson_learned?: string | null
          outcome_observed?: string | null
          outcome_quality?: number | null
          owner_action?: string
          owner_feedback?: string | null
          pattern_tags?: Json | null
          recommendation_id?: string | null
          should_repeat?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_board_reflections_recommendation_id_fkey"
            columns: ["recommendation_id"]
            isOneToOne: false
            referencedRelation: "advisor_board_recommendations"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_board_tool_executions: {
        Row: {
          action_id: string | null
          advisor_id: string
          approval_state: string
          approved_at: string | null
          approved_by: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          executed_at: string | null
          id: string
          operation: string
          parameters: Json | null
          result: Json | null
          rollback_capable: boolean
          rollback_data: Json | null
          rolled_back_at: string | null
          status: string
          tool_category: string
          tool_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_id?: string | null
          advisor_id: string
          approval_state?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          operation: string
          parameters?: Json | null
          result?: Json | null
          rollback_capable?: boolean
          rollback_data?: Json | null
          rolled_back_at?: string | null
          status?: string
          tool_category: string
          tool_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_id?: string | null
          advisor_id?: string
          approval_state?: string
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          operation?: string
          parameters?: Json | null
          result?: Json | null
          rollback_capable?: boolean
          rollback_data?: Json | null
          rolled_back_at?: string | null
          status?: string
          tool_category?: string
          tool_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_board_tool_executions_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "advisor_board_actions"
            referencedColumns: ["id"]
          },
        ]
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
      api_gateway_routes: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          id: string
          method: string
          plane: string
          rate_limit_per_minute: number
          required_permission: string | null
          required_token_class: string
          route_pattern: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          method?: string
          plane?: string
          rate_limit_per_minute?: number
          required_permission?: string | null
          required_token_class?: string
          route_pattern: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          id?: string
          method?: string
          plane?: string
          rate_limit_per_minute?: number
          required_permission?: string | null
          required_token_class?: string
          route_pattern?: string
          updated_at?: string
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
      approval_decisions: {
        Row: {
          actor_user_id: string | null
          conditions: Json | null
          created_at: string
          decided_at: string | null
          decision: string
          id: string
          rationale: string | null
          request_id: string
          request_type: string
          user_id: string
        }
        Insert: {
          actor_user_id?: string | null
          conditions?: Json | null
          created_at?: string
          decided_at?: string | null
          decision?: string
          id?: string
          rationale?: string | null
          request_id: string
          request_type?: string
          user_id: string
        }
        Update: {
          actor_user_id?: string | null
          conditions?: Json | null
          created_at?: string
          decided_at?: string | null
          decision?: string
          id?: string
          rationale?: string | null
          request_id?: string
          request_type?: string
          user_id?: string
        }
        Relationships: []
      }
      biometric_credentials: {
        Row: {
          created_at: string
          credential_id: string
          credential_type: string
          device_id: string | null
          display_name: string | null
          id: string
          last_used_at: string | null
          public_key: string
          sign_count: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_id: string
          credential_type?: string
          device_id?: string | null
          display_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string
          credential_type?: string
          device_id?: string | null
          display_name?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number
          status?: string
          user_id?: string
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
      business_health_scores: {
        Row: {
          biggest_drag: string | null
          biggest_mover: string | null
          contributing_signals: Json | null
          created_at: string
          dimension: string
          id: string
          improvement_opportunity: string | null
          previous_score: number | null
          score: number
          scored_at: string
          trend: string
          updated_at: string
          user_id: string
        }
        Insert: {
          biggest_drag?: string | null
          biggest_mover?: string | null
          contributing_signals?: Json | null
          created_at?: string
          dimension: string
          id?: string
          improvement_opportunity?: string | null
          previous_score?: number | null
          score?: number
          scored_at?: string
          trend?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          biggest_drag?: string | null
          biggest_mover?: string | null
          contributing_signals?: Json | null
          created_at?: string
          dimension?: string
          id?: string
          improvement_opportunity?: string | null
          previous_score?: number | null
          score?: number
          scored_at?: string
          trend?: string
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
      calendar_events: {
        Row: {
          color: string | null
          created_at: string
          domain: string
          end_time: string | null
          event_date: string
          event_type: string
          id: string
          location: string | null
          notes: string | null
          priority: string | null
          recurring: string | null
          source: string
          source_id: string | null
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          domain?: string
          end_time?: string | null
          event_date: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          priority?: string | null
          recurring?: string | null
          source?: string
          source_id?: string | null
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          domain?: string
          end_time?: string | null
          event_date?: string
          event_type?: string
          id?: string
          location?: string | null
          notes?: string | null
          priority?: string | null
          recurring?: string | null
          source?: string
          source_id?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_capability_matrix: {
        Row: {
          capabilities: Json | null
          client_type: string
          created_at: string
          current_version: string | null
          display_name: string
          id: string
          min_version: string | null
          platform: string
          status: string
          supported_features: string[]
          unsupported_features: string[] | null
          updated_at: string
        }
        Insert: {
          capabilities?: Json | null
          client_type: string
          created_at?: string
          current_version?: string | null
          display_name: string
          id?: string
          min_version?: string | null
          platform?: string
          status?: string
          supported_features?: string[]
          unsupported_features?: string[] | null
          updated_at?: string
        }
        Update: {
          capabilities?: Json | null
          client_type?: string
          created_at?: string
          current_version?: string | null
          display_name?: string
          id?: string
          min_version?: string | null
          platform?: string
          status?: string
          supported_features?: string[]
          unsupported_features?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      cloud_abuse_events: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string
          device_id: string | null
          event_type: string
          id: string
          ip_address: string | null
          pattern_data: Json | null
          resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description?: string
          device_id?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          pattern_data?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string
          device_id?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          pattern_data?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cloud_account_closure_requests: {
        Row: {
          cancellation_deadline: string | null
          created_at: string
          export_completed: boolean
          export_job_id: string | null
          id: string
          purge_completed_at: string | null
          reason: string | null
          secrets_destroyed: boolean
          stage: string
          tombstone_finalized: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          cancellation_deadline?: string | null
          created_at?: string
          export_completed?: boolean
          export_job_id?: string | null
          id?: string
          purge_completed_at?: string | null
          reason?: string | null
          secrets_destroyed?: boolean
          stage?: string
          tombstone_finalized?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          cancellation_deadline?: string | null
          created_at?: string
          export_completed?: boolean
          export_job_id?: string | null
          id?: string
          purge_completed_at?: string | null
          reason?: string | null
          secrets_destroyed?: boolean
          stage?: string
          tombstone_finalized?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_account_closure_requests_export_job_id_fkey"
            columns: ["export_job_id"]
            isOneToOne: false
            referencedRelation: "cloud_import_export_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_activity_journal: {
        Row: {
          created_at: string
          details: Json | null
          device_id: string | null
          device_name: string | null
          event_type: string
          id: string
          ip_address: string | null
          object_id: string | null
          object_name: string | null
          object_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          device_id?: string | null
          device_name?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          object_id?: string | null
          object_name?: string | null
          object_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          device_id?: string | null
          device_name?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          object_id?: string | null
          object_name?: string | null
          object_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cloud_admin_role_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          id: string
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          id?: string
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_admin_role_assignments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "cloud_admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_admin_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          permissions: Json
          role_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          permissions?: Json
          role_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          permissions?: Json
          role_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_archive_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          direction: string
          error_message: string | null
          id: string
          object_id: string
          object_type: string
          source_tier: string | null
          started_at: string | null
          status: string
          target_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          direction?: string
          error_message?: string | null
          id?: string
          object_id: string
          object_type?: string
          source_tier?: string | null
          started_at?: string | null
          status?: string
          target_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          direction?: string
          error_message?: string | null
          id?: string
          object_id?: string
          object_type?: string
          source_tier?: string | null
          started_at?: string | null
          status?: string
          target_tier?: string | null
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
      cloud_backup_snapshots: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          object_count: number | null
          region: string | null
          restore_tested_at: string | null
          retention_days: number | null
          size_bytes: number | null
          snapshot_type: string
          started_at: string | null
          status: string
          triggered_by: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          object_count?: number | null
          region?: string | null
          restore_tested_at?: string | null
          retention_days?: number | null
          size_bytes?: number | null
          snapshot_type?: string
          started_at?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          object_count?: number | null
          region?: string | null
          restore_tested_at?: string | null
          retention_days?: number | null
          size_bytes?: number | null
          snapshot_type?: string
          started_at?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cloud_blobs: {
        Row: {
          checksum: string | null
          compression: string | null
          created_at: string
          encryption_class: string | null
          finalized: boolean
          id: string
          size: number
          storage_backend: string | null
          storage_key: string
          user_id: string
        }
        Insert: {
          checksum?: string | null
          compression?: string | null
          created_at?: string
          encryption_class?: string | null
          finalized?: boolean
          id?: string
          size?: number
          storage_backend?: string | null
          storage_key: string
          user_id: string
        }
        Update: {
          checksum?: string | null
          compression?: string | null
          created_at?: string
          encryption_class?: string | null
          finalized?: boolean
          id?: string
          size?: number
          storage_backend?: string | null
          storage_key?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_bootstrap_markers: {
        Row: {
          created_at: string
          details: Json | null
          device_id: string | null
          id: string
          marker_type: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          device_id?: string | null
          id?: string
          marker_type?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          device_id?: string | null
          id?: string
          marker_type?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_compliance_hooks: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          deactivated_at: string | null
          hook_type: string
          id: string
          metadata: Json | null
          reason: string | null
          status: string
          target_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          deactivated_at?: string | null
          hook_type?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          status?: string
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          deactivated_at?: string | null
          hook_type?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          status?: string
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_conflicts: {
        Row: {
          base_version: number
          created_at: string
          details: Json | null
          device_a: string | null
          device_b: string | null
          id: string
          object_id: string
          resolved_at: string | null
          state: string
          strategy: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_version?: number
          created_at?: string
          details?: Json | null
          device_a?: string | null
          device_b?: string | null
          id?: string
          object_id: string
          resolved_at?: string | null
          state?: string
          strategy?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_version?: number
          created_at?: string
          details?: Json | null
          device_a?: string | null
          device_b?: string | null
          id?: string
          object_id?: string
          resolved_at?: string | null
          state?: string
          strategy?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_device_sessions: {
        Row: {
          created_at: string
          device_id: string
          id: string
          last_ip: string | null
          last_seen: string | null
          push_token: string | null
          refresh_token_hash: string | null
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          last_ip?: string | null
          last_seen?: string | null
          push_token?: string | null
          refresh_token_hash?: string | null
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          last_ip?: string | null
          last_seen?: string | null
          push_token?: string | null
          refresh_token_hash?: string | null
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_device_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "cloud_devices"
            referencedColumns: ["id"]
          },
        ]
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
      cloud_file_versions: {
        Row: {
          blob_id: string | null
          checksum: string | null
          created_at: string
          file_id: string
          id: string
          origin_device_id: string | null
          restore_point: boolean
          size: number
          user_id: string
          version: number
        }
        Insert: {
          blob_id?: string | null
          checksum?: string | null
          created_at?: string
          file_id: string
          id?: string
          origin_device_id?: string | null
          restore_point?: boolean
          size?: number
          user_id: string
          version?: number
        }
        Update: {
          blob_id?: string | null
          checksum?: string | null
          created_at?: string
          file_id?: string
          id?: string
          origin_device_id?: string | null
          restore_point?: boolean
          size?: number
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cloud_file_versions_blob_id_fkey"
            columns: ["blob_id"]
            isOneToOne: false
            referencedRelation: "cloud_blobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_file_versions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "cloud_files"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_files: {
        Row: {
          blob_id: string | null
          checksum: string | null
          created_at: string
          deleted: boolean
          folder_id: string | null
          id: string
          last_opened_at: string | null
          mime_type: string | null
          name: string
          size: number
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          blob_id?: string | null
          checksum?: string | null
          created_at?: string
          deleted?: boolean
          folder_id?: string | null
          id?: string
          last_opened_at?: string | null
          mime_type?: string | null
          name?: string
          size?: number
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          blob_id?: string | null
          checksum?: string | null
          created_at?: string
          deleted?: boolean
          folder_id?: string | null
          id?: string
          last_opened_at?: string | null
          mime_type?: string | null
          name?: string
          size?: number
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cloud_files_blob_id_fkey"
            columns: ["blob_id"]
            isOneToOne: false
            referencedRelation: "cloud_blobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "cloud_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          path_cache: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          path_cache?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          path_cache?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "cloud_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_import_export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          destination: string | null
          download_url: string | null
          error_message: string | null
          expires_at: string | null
          id: string
          job_type: string
          processed_items: number | null
          progress_pct: number | null
          source: string | null
          started_at: string | null
          status: string
          total_items: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          destination?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          job_type?: string
          processed_items?: number | null
          progress_pct?: number | null
          source?: string | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          destination?: string | null
          download_url?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          job_type?: string
          processed_items?: number | null
          progress_pct?: number | null
          source?: string | null
          started_at?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_lifecycle_rules: {
        Row: {
          applies_to: string
          condition_type: string
          condition_value: number
          created_at: string
          enabled: boolean
          id: string
          last_run_at: string | null
          rule_name: string
          source_tier: string | null
          target_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applies_to?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          rule_name?: string
          source_tier?: string | null
          target_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applies_to?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          rule_name?: string
          source_tier?: string | null
          target_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_maintenance_modes: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          active: boolean
          created_at: string
          deactivated_at: string | null
          description: string | null
          display_name: string
          id: string
          mode_key: string
          reason: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          active?: boolean
          created_at?: string
          deactivated_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          mode_key: string
          reason?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          active?: boolean
          created_at?: string
          deactivated_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          mode_key?: string
          reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cloud_metrics_snapshots: {
        Row: {
          created_at: string
          dimensions: Json | null
          id: string
          metric_key: string
          metric_value: number
          snapshot_at: string
        }
        Insert: {
          created_at?: string
          dimensions?: Json | null
          id?: string
          metric_key?: string
          metric_value?: number
          snapshot_at?: string
        }
        Update: {
          created_at?: string
          dimensions?: Json | null
          id?: string
          metric_key?: string
          metric_value?: number
          snapshot_at?: string
        }
        Relationships: []
      }
      cloud_namespace_registry: {
        Row: {
          conflict_strategy: string
          created_at: string
          data_class: string
          display_name: string
          encryption_class: string
          exportable: boolean
          id: string
          namespace: string
          owner_id: string | null
          owner_type: string
          retention_class: string
          schema_version: number
          searchable: boolean
          status: string
          updated_at: string
        }
        Insert: {
          conflict_strategy?: string
          created_at?: string
          data_class?: string
          display_name?: string
          encryption_class?: string
          exportable?: boolean
          id?: string
          namespace: string
          owner_id?: string | null
          owner_type?: string
          retention_class?: string
          schema_version?: number
          searchable?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          conflict_strategy?: string
          created_at?: string
          data_class?: string
          display_name?: string
          encryption_class?: string
          exportable?: boolean
          id?: string
          namespace?: string
          owner_id?: string | null
          owner_type?: string
          retention_class?: string
          schema_version?: number
          searchable?: boolean
          status?: string
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
      cloud_preview_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          dimensions: Json | null
          error_message: string | null
          file_id: string
          id: string
          input_mime: string | null
          job_type: string
          output_key: string | null
          output_mime: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dimensions?: Json | null
          error_message?: string | null
          file_id: string
          id?: string
          input_mime?: string | null
          job_type?: string
          output_key?: string | null
          output_mime?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dimensions?: Json | null
          error_message?: string | null
          file_id?: string
          id?: string
          input_mime?: string | null
          job_type?: string
          output_key?: string | null
          output_mime?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_reconciliation_runs: {
        Row: {
          affected_users: number | null
          broken_chains: number | null
          completed_at: string | null
          created_at: string
          details: Json | null
          id: string
          missing_blobs: number | null
          orphaned_blobs: number | null
          quota_drifts: number | null
          repairs_applied: number | null
          run_type: string
          size_mismatches: number | null
          stale_tombstones: number | null
          started_at: string | null
          status: string
          triggered_by: string | null
          updated_at: string
        }
        Insert: {
          affected_users?: number | null
          broken_chains?: number | null
          completed_at?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          missing_blobs?: number | null
          orphaned_blobs?: number | null
          quota_drifts?: number | null
          repairs_applied?: number | null
          run_type?: string
          size_mismatches?: number | null
          stale_tombstones?: number | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Update: {
          affected_users?: number | null
          broken_chains?: number | null
          completed_at?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          missing_blobs?: number | null
          orphaned_blobs?: number | null
          quota_drifts?: number | null
          repairs_applied?: number | null
          run_type?: string
          size_mismatches?: number | null
          stale_tombstones?: number | null
          started_at?: string | null
          status?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cloud_search_index: {
        Row: {
          content_snippet: string | null
          created_at: string
          id: string
          indexed_at: string
          metadata: Json | null
          mime_type: string | null
          name: string
          object_id: string
          object_type: string
          path: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content_snippet?: string | null
          created_at?: string
          id?: string
          indexed_at?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          object_id: string
          object_type?: string
          path?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content_snippet?: string | null
          created_at?: string
          id?: string
          indexed_at?: string
          metadata?: Json | null
          mime_type?: string | null
          name?: string
          object_id?: string
          object_type?: string
          path?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cloud_shared_workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_user_id: string
          settings: Json | null
          tenant_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_user_id: string
          settings?: Json | null
          tenant_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_user_id?: string
          settings?: Json | null
          tenant_id?: string
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_shared_workspaces_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cloud_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_shares: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          object_id: string
          object_type: string
          owner_user_id: string
          permission: string
          target_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          object_id: string
          object_type?: string
          owner_user_id: string
          permission?: string
          target_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          object_id?: string
          object_type?: string
          owner_user_id?: string
          permission?: string
          target_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cloud_storage_providers: {
        Row: {
          bucket_name: string | null
          capabilities: Json | null
          config: Json | null
          created_at: string
          display_name: string
          endpoint: string | null
          id: string
          provider_key: string
          provider_type: string
          region: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bucket_name?: string | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string
          display_name?: string
          endpoint?: string | null
          id?: string
          provider_key: string
          provider_type?: string
          region?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bucket_name?: string | null
          capabilities?: Json | null
          config?: Json | null
          created_at?: string
          display_name?: string
          endpoint?: string | null
          id?: string
          provider_key?: string
          provider_type?: string
          region?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_storage_tiers: {
        Row: {
          cost_per_gb_cents: number
          created_at: string
          display_name: string
          id: string
          min_retention_days: number
          provider_id: string | null
          retrieval_latency_ms: number
          status: string
          tier_key: string
          tier_order: number
          updated_at: string
        }
        Insert: {
          cost_per_gb_cents?: number
          created_at?: string
          display_name?: string
          id?: string
          min_retention_days?: number
          provider_id?: string | null
          retrieval_latency_ms?: number
          status?: string
          tier_key: string
          tier_order?: number
          updated_at?: string
        }
        Update: {
          cost_per_gb_cents?: number
          created_at?: string
          display_name?: string
          id?: string
          min_retention_days?: number
          provider_id?: string | null
          retrieval_latency_ms?: number
          status?: string
          tier_key?: string
          tier_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_storage_tiers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "cloud_storage_providers"
            referencedColumns: ["id"]
          },
        ]
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
      cloud_support_sessions: {
        Row: {
          actions_taken: Json | null
          created_at: string
          ended_at: string | null
          id: string
          reason: string
          redacted_fields: string[] | null
          started_at: string
          status: string
          support_user_id: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          actions_taken?: Json | null
          created_at?: string
          ended_at?: string | null
          id?: string
          reason?: string
          redacted_fields?: string[] | null
          started_at?: string
          status?: string
          support_user_id: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          actions_taken?: Json | null
          created_at?: string
          ended_at?: string | null
          id?: string
          reason?: string
          redacted_fields?: string[] | null
          started_at?: string
          status?: string
          support_user_id?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_sync_changes: {
        Row: {
          change_type: string
          created_at: string
          from_version: number | null
          id: string
          object_id: string
          origin_device_id: string | null
          payload: Json | null
          to_version: number | null
          user_id: string
        }
        Insert: {
          change_type?: string
          created_at?: string
          from_version?: number | null
          id?: string
          object_id: string
          origin_device_id?: string | null
          payload?: Json | null
          to_version?: number | null
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          from_version?: number | null
          id?: string
          object_id?: string
          origin_device_id?: string | null
          payload?: Json | null
          to_version?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_sync_changes_object_id_fkey"
            columns: ["object_id"]
            isOneToOne: false
            referencedRelation: "cloud_sync_objects"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_sync_checkpoints: {
        Row: {
          device_id: string
          id: string
          last_change_id: string | null
          namespace: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          device_id: string
          id?: string
          last_change_id?: string | null
          namespace?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          device_id?: string
          id?: string
          last_change_id?: string | null
          namespace?: string | null
          updated_at?: string
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
      cloud_sync_objects: {
        Row: {
          blob_ref: string | null
          content_hash: string | null
          created_at: string
          deleted: boolean
          id: string
          metadata_json: Json | null
          namespace: string
          origin_device_id: string | null
          type: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          blob_ref?: string | null
          content_hash?: string | null
          created_at?: string
          deleted?: boolean
          id?: string
          metadata_json?: Json | null
          namespace?: string
          origin_device_id?: string | null
          type?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          blob_ref?: string | null
          content_hash?: string | null
          created_at?: string
          deleted?: boolean
          id?: string
          metadata_json?: Json | null
          namespace?: string
          origin_device_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      cloud_tenant_memberships: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_tenant_memberships_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cloud_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_tenant_plans: {
        Row: {
          created_at: string
          id: string
          max_members: number
          plan_id: string | null
          status: string
          storage_limit_bytes: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_members?: number
          plan_id?: string | null
          status?: string
          storage_limit_bytes?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          max_members?: number
          plan_id?: string | null
          status?: string
          storage_limit_bytes?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cloud_tenant_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "cloud_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cloud_tenant_plans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cloud_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_tenant_policies: {
        Row: {
          category: string
          created_at: string
          display_name: string
          enforced: boolean
          id: string
          policy_key: string
          tenant_id: string
          updated_at: string
          value_json: Json
        }
        Insert: {
          category?: string
          created_at?: string
          display_name?: string
          enforced?: boolean
          id?: string
          policy_key?: string
          tenant_id: string
          updated_at?: string
          value_json?: Json
        }
        Update: {
          category?: string
          created_at?: string
          display_name?: string
          enforced?: boolean
          id?: string
          policy_key?: string
          tenant_id?: string
          updated_at?: string
          value_json?: Json
        }
        Relationships: [
          {
            foreignKeyName: "cloud_tenant_policies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cloud_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_tenant_quotas: {
        Row: {
          created_at: string
          file_count: number
          id: string
          last_reconciled_at: string | null
          quota_bytes: number
          tenant_id: string
          updated_at: string
          used_bytes: number
        }
        Insert: {
          created_at?: string
          file_count?: number
          id?: string
          last_reconciled_at?: string | null
          quota_bytes?: number
          tenant_id: string
          updated_at?: string
          used_bytes?: number
        }
        Update: {
          created_at?: string
          file_count?: number
          id?: string
          last_reconciled_at?: string | null
          quota_bytes?: number
          tenant_id?: string
          updated_at?: string
          used_bytes?: number
        }
        Relationships: [
          {
            foreignKeyName: "cloud_tenant_quotas_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "cloud_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cloud_tenants: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_user_id: string
          region: string | null
          residency: string | null
          settings: Json | null
          slug: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id: string
          region?: string | null
          residency?: string | null
          settings?: Json | null
          slug?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_user_id?: string
          region?: string | null
          residency?: string | null
          settings?: Json | null
          slug?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      cloud_trash: {
        Row: {
          deleted_at: string
          deleted_by_device_id: string | null
          id: string
          object_id: string
          object_type: string
          original_name: string | null
          original_path: string | null
          purge_after: string
          size: number | null
          user_id: string
        }
        Insert: {
          deleted_at?: string
          deleted_by_device_id?: string | null
          id?: string
          object_id: string
          object_type?: string
          original_name?: string | null
          original_path?: string | null
          purge_after?: string
          size?: number | null
          user_id: string
        }
        Update: {
          deleted_at?: string
          deleted_by_device_id?: string | null
          id?: string
          object_id?: string
          object_type?: string
          original_name?: string | null
          original_path?: string | null
          purge_after?: string
          size?: number | null
          user_id?: string
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
      cloud_worker_jobs: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          dead_letter: boolean
          error_message: string | null
          id: string
          idempotency_key: string | null
          job_type: string
          locked_at: string | null
          locked_by: string | null
          max_attempts: number
          payload: Json
          priority: number
          result: Json | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dead_letter?: boolean
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          job_type?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          dead_letter?: boolean
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          job_type?: string
          locked_at?: string | null
          locked_by?: string | null
          max_attempts?: number
          payload?: Json
          priority?: number
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      command_steps: {
        Row: {
          action: string
          command_id: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          result: Json | null
          retry_count: number
          started_at: string | null
          status: string
          step_index: number
          target: string | null
          user_id: string
        }
        Insert: {
          action: string
          command_id: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: string
          step_index?: number
          target?: string | null
          user_id: string
        }
        Update: {
          action?: string
          command_id?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          result?: Json | null
          retry_count?: number
          started_at?: string | null
          status?: string
          step_index?: number
          target?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "command_steps_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "os_commands"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_metrics: {
        Row: {
          created_at: string
          device_id: string | null
          id: string
          metadata: Json | null
          metric_type: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type: string
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json | null
          metric_type?: string
          user_id?: string
          value?: number
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
      config_change_history: {
        Row: {
          actor_user_id: string
          approval_required: boolean
          approved_at: string | null
          approved_by: string | null
          config_key: string
          config_scope: string
          created_at: string
          diff: Json | null
          id: string
          justification: string | null
          new_value: Json
          previous_value: Json | null
          rollback_of: string | null
          status: string
        }
        Insert: {
          actor_user_id: string
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          config_key: string
          config_scope: string
          created_at?: string
          diff?: Json | null
          id?: string
          justification?: string | null
          new_value: Json
          previous_value?: Json | null
          rollback_of?: string | null
          status?: string
        }
        Update: {
          actor_user_id?: string
          approval_required?: boolean
          approved_at?: string | null
          approved_by?: string | null
          config_key?: string
          config_scope?: string
          created_at?: string
          diff?: Json | null
          id?: string
          justification?: string | null
          new_value?: Json
          previous_value?: Json | null
          rollback_of?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_change_history_rollback_of_fkey"
            columns: ["rollback_of"]
            isOneToOne: false
            referencedRelation: "config_change_history"
            referencedColumns: ["id"]
          },
        ]
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
      connector_tokens: {
        Row: {
          connector_id: string | null
          created_at: string
          encrypted_token_ref: string
          expires_at: string | null
          id: string
          issued_at: string
          last_refreshed_at: string | null
          provider: string
          rotation_count: number
          scopes: string[] | null
          status: string
          token_type: string
          user_id: string
        }
        Insert: {
          connector_id?: string | null
          created_at?: string
          encrypted_token_ref: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          last_refreshed_at?: string | null
          provider: string
          rotation_count?: number
          scopes?: string[] | null
          status?: string
          token_type?: string
          user_id: string
        }
        Update: {
          connector_id?: string | null
          created_at?: string
          encrypted_token_ref?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          last_refreshed_at?: string | null
          provider?: string
          rotation_count?: number
          scopes?: string[] | null
          status?: string
          token_type?: string
          user_id?: string
        }
        Relationships: []
      }
      context_graph_snapshots: {
        Row: {
          active_mode: string | null
          active_signals: string[]
          cognitive_load: number | null
          context_data: Json
          created_at: string
          device_id: string | null
          freshness_score: number
          id: string
          signal_count: number
          snapshot_type: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          active_mode?: string | null
          active_signals?: string[]
          cognitive_load?: number | null
          context_data?: Json
          created_at?: string
          device_id?: string | null
          freshness_score?: number
          id?: string
          signal_count?: number
          snapshot_type?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          active_mode?: string | null
          active_signals?: string[]
          cognitive_load?: number | null
          context_data?: Json
          created_at?: string
          device_id?: string | null
          freshness_score?: number
          id?: string
          signal_count?: number
          snapshot_type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
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
      device_attestations: {
        Row: {
          attestation_type: string
          created_at: string
          device_id: string
          evidence: Json | null
          expires_at: string | null
          id: string
          key_fingerprint: string | null
          status: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          attestation_type?: string
          created_at?: string
          device_id: string
          evidence?: Json | null
          expires_at?: string | null
          id?: string
          key_fingerprint?: string | null
          status?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          attestation_type?: string
          created_at?: string
          device_id?: string
          evidence?: Json | null
          expires_at?: string | null
          id?: string
          key_fingerprint?: string | null
          status?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_attestations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "cloud_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_mesh_peers: {
        Row: {
          battery_level: number | null
          capabilities: string[]
          created_at: string
          device_name: string
          device_type: string
          id: string
          is_online: boolean
          last_handshake: string | null
          mesh_group: string | null
          network_type: string | null
          os_version: string | null
          platform: string | null
          proximity_status: string
          role: string
          trust_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_level?: number | null
          capabilities?: string[]
          created_at?: string
          device_name: string
          device_type?: string
          id?: string
          is_online?: boolean
          last_handshake?: string | null
          mesh_group?: string | null
          network_type?: string | null
          os_version?: string | null
          platform?: string | null
          proximity_status?: string
          role?: string
          trust_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_level?: number | null
          capabilities?: string[]
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          is_online?: boolean
          last_handshake?: string | null
          mesh_group?: string | null
          network_type?: string | null
          os_version?: string | null
          platform?: string | null
          proximity_status?: string
          role?: string
          trust_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_ownership: {
        Row: {
          capabilities: Json | null
          created_at: string
          device_id: string
          device_name: string
          device_type: string
          environment: string
          id: string
          last_seen_at: string
          owner_user_id: string
          permissions: Json | null
          platform: string
          revoke_scope: string | null
          revoked: boolean
          revoked_at: string | null
          revoked_by: string | null
          selective_sync_config: Json | null
          sync_enabled: boolean
          trust_level: string
          updated_at: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string
          device_id: string
          device_name?: string
          device_type?: string
          environment?: string
          id?: string
          last_seen_at?: string
          owner_user_id: string
          permissions?: Json | null
          platform?: string
          revoke_scope?: string | null
          revoked?: boolean
          revoked_at?: string | null
          revoked_by?: string | null
          selective_sync_config?: Json | null
          sync_enabled?: boolean
          trust_level?: string
          updated_at?: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string
          device_id?: string
          device_name?: string
          device_type?: string
          environment?: string
          id?: string
          last_seen_at?: string
          owner_user_id?: string
          permissions?: Json | null
          platform?: string
          revoke_scope?: string | null
          revoked?: boolean
          revoked_at?: string | null
          revoked_by?: string | null
          selective_sync_config?: Json | null
          sync_enabled?: boolean
          trust_level?: string
          updated_at?: string
        }
        Relationships: []
      }
      domain_ownership_registry: {
        Row: {
          api_surface: Json | null
          created_at: string
          dependencies: Json | null
          description: string | null
          display_name: string
          domain_key: string
          id: string
          owning_service: string
          plane: string
          status: string
          team: string
          updated_at: string
        }
        Insert: {
          api_surface?: Json | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          display_name: string
          domain_key: string
          id?: string
          owning_service: string
          plane?: string
          status?: string
          team?: string
          updated_at?: string
        }
        Update: {
          api_surface?: Json | null
          created_at?: string
          dependencies?: Json | null
          description?: string | null
          display_name?: string
          domain_key?: string
          id?: string
          owning_service?: string
          plane?: string
          status?: string
          team?: string
          updated_at?: string
        }
        Relationships: []
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
      environment_configs: {
        Row: {
          api_base_url: string | null
          config: Json | null
          created_at: string
          description: string
          display_name: string
          env_key: string
          feature_flag_context: Json | null
          id: string
          is_current: boolean
          status: string
          updated_at: string
        }
        Insert: {
          api_base_url?: string | null
          config?: Json | null
          created_at?: string
          description?: string
          display_name: string
          env_key: string
          feature_flag_context?: Json | null
          id?: string
          is_current?: boolean
          status?: string
          updated_at?: string
        }
        Update: {
          api_base_url?: string | null
          config?: Json | null
          created_at?: string
          description?: string
          display_name?: string
          env_key?: string
          feature_flag_context?: Json | null
          id?: string
          is_current?: boolean
          status?: string
          updated_at?: string
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
      founder_directives: {
        Row: {
          agent_assignments: Json
          approvals_received: Json
          approvals_required: boolean
          completed_at: string | null
          created_at: string
          decomposed_plan: Json
          domain_classification: string
          execution_state: Json
          id: string
          intent_text: string
          outcome_summary: string | null
          priority: string
          risk_assessment: Json
          started_at: string | null
          status: string
          task_graph: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_assignments?: Json
          approvals_received?: Json
          approvals_required?: boolean
          completed_at?: string | null
          created_at?: string
          decomposed_plan?: Json
          domain_classification?: string
          execution_state?: Json
          id?: string
          intent_text: string
          outcome_summary?: string | null
          priority?: string
          risk_assessment?: Json
          started_at?: string | null
          status?: string
          task_graph?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_assignments?: Json
          approvals_received?: Json
          approvals_required?: boolean
          completed_at?: string | null
          created_at?: string
          decomposed_plan?: Json
          domain_classification?: string
          execution_state?: Json
          id?: string
          intent_text?: string
          outcome_summary?: string | null
          priority?: string
          risk_assessment?: Json
          started_at?: string | null
          status?: string
          task_graph?: Json
          updated_at?: string
          user_id?: string
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
      graph_edges: {
        Row: {
          created_at: string
          edge_type: string
          id: string
          metadata: Json | null
          source_node_id: string
          source_node_type: string
          target_node_id: string
          target_node_type: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          edge_type: string
          id?: string
          metadata?: Json | null
          source_node_id: string
          source_node_type: string
          target_node_id: string
          target_node_type: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          edge_type?: string
          id?: string
          metadata?: Json | null
          source_node_id?: string
          source_node_type?: string
          target_node_id?: string
          target_node_type?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
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
      incidents: {
        Row: {
          affected_services: Json | null
          created_at: string
          description: string | null
          id: string
          owner_user_id: string | null
          remediation_notes: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_services?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          remediation_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_services?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          owner_user_id?: string | null
          remediation_notes?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      managed_apps: {
        Row: {
          app_key: string
          config: Json | null
          crash_count: number
          created_at: string
          description: string | null
          device_id: string | null
          display_name: string
          domain: string
          health_status: string
          id: string
          install_source: string
          install_state: string
          last_crash_at: string | null
          last_health_check_at: string | null
          permissions: Json
          trust_level: string
          updated_at: string
          user_id: string
          version: string
        }
        Insert: {
          app_key: string
          config?: Json | null
          crash_count?: number
          created_at?: string
          description?: string | null
          device_id?: string | null
          display_name: string
          domain?: string
          health_status?: string
          id?: string
          install_source?: string
          install_state?: string
          last_crash_at?: string | null
          last_health_check_at?: string | null
          permissions?: Json
          trust_level?: string
          updated_at?: string
          user_id: string
          version?: string
        }
        Update: {
          app_key?: string
          config?: Json | null
          crash_count?: number
          created_at?: string
          description?: string | null
          device_id?: string | null
          display_name?: string
          domain?: string
          health_status?: string
          id?: string
          install_source?: string
          install_state?: string
          last_crash_at?: string | null
          last_health_check_at?: string | null
          permissions?: Json
          trust_level?: string
          updated_at?: string
          user_id?: string
          version?: string
        }
        Relationships: []
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
      notification_preferences: {
        Row: {
          channel: string
          created_at: string
          email_enabled: boolean
          enabled: boolean
          id: string
          in_app_enabled: boolean
          push_enabled: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          scope: string
          updated_at: string
          urgency_filter: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          email_enabled?: boolean
          enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          scope?: string
          updated_at?: string
          urgency_filter?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          email_enabled?: boolean
          enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          push_enabled?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          scope?: string
          updated_at?: string
          urgency_filter?: string
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
      os_command_events: {
        Row: {
          actor: string | null
          command_id: string
          correlation_id: string | null
          created_at: string
          from_state: string | null
          id: string
          metadata: Json | null
          reason: string | null
          to_state: string
          user_id: string
        }
        Insert: {
          actor?: string | null
          command_id: string
          correlation_id?: string | null
          created_at?: string
          from_state?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          to_state: string
          user_id: string
        }
        Update: {
          actor?: string | null
          command_id?: string
          correlation_id?: string | null
          created_at?: string
          from_state?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          to_state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_command_events_command_id_fkey"
            columns: ["command_id"]
            isOneToOne: false
            referencedRelation: "os_commands"
            referencedColumns: ["id"]
          },
        ]
      }
      os_commands: {
        Row: {
          actor_user_id: string | null
          approval_requested_at: string | null
          approval_state: string | null
          approved_at: string | null
          approved_by: string | null
          command_text: string | null
          command_type: string
          completed_at: string | null
          correlation_id: string
          created_at: string
          dispatched_at: string | null
          error_message: string | null
          id: string
          origin: string
          plan_json: Json | null
          result: Json | null
          rollback_available: boolean
          rollback_payload: Json | null
          safety_mode: string
          simulation_first: boolean
          status: string
          structured_command: Json | null
          target_device_id: string | null
          target_device_ids: string[] | null
          updated_at: string
          user_id: string
          verification_state: string | null
          verified_at: string | null
        }
        Insert: {
          actor_user_id?: string | null
          approval_requested_at?: string | null
          approval_state?: string | null
          approved_at?: string | null
          approved_by?: string | null
          command_text?: string | null
          command_type?: string
          completed_at?: string | null
          correlation_id?: string
          created_at?: string
          dispatched_at?: string | null
          error_message?: string | null
          id?: string
          origin?: string
          plan_json?: Json | null
          result?: Json | null
          rollback_available?: boolean
          rollback_payload?: Json | null
          safety_mode?: string
          simulation_first?: boolean
          status?: string
          structured_command?: Json | null
          target_device_id?: string | null
          target_device_ids?: string[] | null
          updated_at?: string
          user_id: string
          verification_state?: string | null
          verified_at?: string | null
        }
        Update: {
          actor_user_id?: string | null
          approval_requested_at?: string | null
          approval_state?: string | null
          approved_at?: string | null
          approved_by?: string | null
          command_text?: string | null
          command_type?: string
          completed_at?: string | null
          correlation_id?: string
          created_at?: string
          dispatched_at?: string | null
          error_message?: string | null
          id?: string
          origin?: string
          plan_json?: Json | null
          result?: Json | null
          rollback_available?: boolean
          rollback_payload?: Json | null
          safety_mode?: string
          simulation_first?: boolean
          status?: string
          structured_command?: Json | null
          target_device_id?: string | null
          target_device_ids?: string[] | null
          updated_at?: string
          user_id?: string
          verification_state?: string | null
          verified_at?: string | null
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
      os_policies: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          description: string | null
          display_name: string
          domain: string
          enabled: boolean
          id: string
          policy_key: string
          priority: number
          scope: string
          scope_ref: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          display_name: string
          domain?: string
          enabled?: boolean
          id?: string
          policy_key: string
          priority?: number
          scope?: string
          scope_ref?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          domain?: string
          enabled?: boolean
          id?: string
          policy_key?: string
          priority?: number
          scope?: string
          scope_ref?: string | null
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
      plane_service_assignments: {
        Row: {
          created_at: string
          description: string
          display_name: string
          id: string
          plane_id: string
          service_key: string
          service_type: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          display_name: string
          id?: string
          plane_id: string
          service_key: string
          service_type?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_name?: string
          id?: string
          plane_id?: string
          service_key?: string
          service_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plane_service_assignments_plane_id_fkey"
            columns: ["plane_id"]
            isOneToOne: false
            referencedRelation: "platform_planes"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_notifications: {
        Row: {
          action_url: string | null
          audience: string
          body: string | null
          category: string
          correlation_id: string | null
          created_at: string
          dismissed: boolean
          id: string
          metadata: Json | null
          read: boolean
          severity: string
          source_event_type: string | null
          source_service: string | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          audience?: string
          body?: string | null
          category?: string
          correlation_id?: string | null
          created_at?: string
          dismissed?: boolean
          id?: string
          metadata?: Json | null
          read?: boolean
          severity?: string
          source_event_type?: string | null
          source_service?: string | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          audience?: string
          body?: string | null
          category?: string
          correlation_id?: string | null
          created_at?: string
          dismissed?: boolean
          id?: string
          metadata?: Json | null
          read?: boolean
          severity?: string
          source_event_type?: string | null
          source_service?: string | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: []
      }
      platform_planes: {
        Row: {
          color: string
          created_at: string
          description: string
          display_name: string
          icon: string
          id: string
          plane_key: string
          service_count: number
          status: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          display_name: string
          icon?: string
          id?: string
          plane_key: string
          service_count?: number
          status?: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          display_name?: string
          icon?: string
          id?: string
          plane_key?: string
          service_count?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_runbooks: {
        Row: {
          agent_assignments: Json
          auto_heal_config: Json
          auto_heal_enabled: boolean
          created_at: string
          description: string
          domain: string
          execution_count: number
          id: string
          incident_patterns: Json
          last_executed_at: string | null
          last_execution_result: Json | null
          severity: string
          status: string
          steps: Json
          tags: string[]
          title: string
          trigger_conditions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_assignments?: Json
          auto_heal_config?: Json
          auto_heal_enabled?: boolean
          created_at?: string
          description?: string
          domain?: string
          execution_count?: number
          id?: string
          incident_patterns?: Json
          last_executed_at?: string | null
          last_execution_result?: Json | null
          severity?: string
          status?: string
          steps?: Json
          tags?: string[]
          title: string
          trigger_conditions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_assignments?: Json
          auto_heal_config?: Json
          auto_heal_enabled?: boolean
          created_at?: string
          description?: string
          domain?: string
          execution_count?: number
          id?: string
          incident_patterns?: Json
          last_executed_at?: string | null
          last_execution_result?: Json | null
          severity?: string
          status?: string
          steps?: Json
          tags?: string[]
          title?: string
          trigger_conditions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      profit_signals: {
        Row: {
          actual_impact_cents: number | null
          category: string
          confidence: number
          created_at: string
          description: string
          estimated_impact_cents: number | null
          id: string
          resolution_outcome: string | null
          resolved_at: string | null
          signal_type: string
          source_data: Json | null
          status: string
          title: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          actual_impact_cents?: number | null
          category?: string
          confidence?: number
          created_at?: string
          description?: string
          estimated_impact_cents?: number | null
          id?: string
          resolution_outcome?: string | null
          resolved_at?: string | null
          signal_type: string
          source_data?: Json | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          actual_impact_cents?: number | null
          category?: string
          confidence?: number
          created_at?: string
          description?: string
          estimated_impact_cents?: number | null
          id?: string
          resolution_outcome?: string | null
          resolved_at?: string | null
          signal_type?: string
          source_data?: Json | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      read_model_snapshots: {
        Row: {
          created_at: string
          freshness_at: string
          id: string
          model_type: string
          snapshot: Json
          subject_id: string
          subject_type: string
          ttl_seconds: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          freshness_at?: string
          id?: string
          model_type: string
          snapshot?: Json
          subject_id: string
          subject_type?: string
          ttl_seconds?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          freshness_at?: string
          id?: string
          model_type?: string
          snapshot?: Json
          subject_id?: string
          subject_type?: string
          ttl_seconds?: number
          updated_at?: string
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
      release_compatibility_matrix: {
        Row: {
          api_version: string
          backend_version: string
          breaking_changes: string[] | null
          client_type: string
          client_version: string
          compatibility: string
          created_at: string
          id: string
          migration_required: boolean
          notes: string | null
          rollout_percentage: number
          rollout_stage: string
          updated_at: string
        }
        Insert: {
          api_version?: string
          backend_version?: string
          breaking_changes?: string[] | null
          client_type: string
          client_version: string
          compatibility?: string
          created_at?: string
          id?: string
          migration_required?: boolean
          notes?: string | null
          rollout_percentage?: number
          rollout_stage?: string
          updated_at?: string
        }
        Update: {
          api_version?: string
          backend_version?: string
          breaking_changes?: string[] | null
          client_type?: string
          client_version?: string
          compatibility?: string
          created_at?: string
          id?: string
          migration_required?: boolean
          notes?: string | null
          rollout_percentage?: number
          rollout_stage?: string
          updated_at?: string
        }
        Relationships: []
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
      runtime_agents: {
        Row: {
          agent_type: string
          capabilities: Json | null
          created_at: string
          hostname: string | null
          id: string
          last_heartbeat_at: string | null
          registered_at: string
          status: string
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          agent_type?: string
          capabilities?: Json | null
          created_at?: string
          hostname?: string | null
          id?: string
          last_heartbeat_at?: string | null
          registered_at?: string
          status?: string
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          agent_type?: string
          capabilities?: Json | null
          created_at?: string
          hostname?: string | null
          id?: string
          last_heartbeat_at?: string | null
          registered_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
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
      service_identity_registry: {
        Row: {
          allowed_targets: string[] | null
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          last_authenticated_at: string | null
          plane: string
          scopes: string[]
          service_key: string
          token_ttl_seconds: number
          trust_level: string
          updated_at: string
        }
        Insert: {
          allowed_targets?: string[] | null
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          last_authenticated_at?: string | null
          plane?: string
          scopes?: string[]
          service_key: string
          token_ttl_seconds?: number
          trust_level?: string
          updated_at?: string
        }
        Update: {
          allowed_targets?: string[] | null
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          last_authenticated_at?: string | null
          plane?: string
          scopes?: string[]
          service_key?: string
          token_ttl_seconds?: number
          trust_level?: string
          updated_at?: string
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
      simulations: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          id: string
          input_payload: Json | null
          model_used: string | null
          result_artifacts: Json | null
          scenario_type: string
          status: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          input_payload?: Json | null
          model_used?: string | null
          result_artifacts?: Json | null
          scenario_type: string
          status?: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          input_payload?: Json | null
          model_used?: string | null
          result_artifacts?: Json | null
          scenario_type?: string
          status?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      support_access_grants: {
        Row: {
          actions_performed: Json | null
          created_at: string
          expires_at: string
          granted_at: string
          granted_to_user_id: string
          id: string
          reason: string
          revoked_at: string | null
          scope: string
          target_user_id: string
          updated_at: string
        }
        Insert: {
          actions_performed?: Json | null
          created_at?: string
          expires_at?: string
          granted_at?: string
          granted_to_user_id: string
          id?: string
          reason: string
          revoked_at?: string | null
          scope?: string
          target_user_id: string
          updated_at?: string
        }
        Update: {
          actions_performed?: Json | null
          created_at?: string
          expires_at?: string
          granted_at?: string
          granted_to_user_id?: string
          id?: string
          reason?: string
          revoked_at?: string | null
          scope?: string
          target_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_case_events: {
        Row: {
          actor_user_id: string
          case_id: string
          content: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor_user_id: string
          case_id: string
          content?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor_user_id?: string
          case_id?: string
          content?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "support_case_events_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "support_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      support_cases: {
        Row: {
          assigned_to: string | null
          category: string
          correlation_id: string | null
          created_at: string
          description: string | null
          diagnostic_package: Json | null
          escalated_to_role: string | null
          id: string
          priority: string
          resolution: string | null
          resolved_at: string | null
          self_repair_attempted: boolean
          self_repair_result: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          diagnostic_package?: Json | null
          escalated_to_role?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          self_repair_attempted?: boolean
          self_repair_result?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          diagnostic_package?: Json | null
          escalated_to_role?: string | null
          id?: string
          priority?: string
          resolution?: string | null
          resolved_at?: string | null
          self_repair_attempted?: boolean
          self_repair_result?: string | null
          status?: string
          title?: string
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
      timeline_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          created_at: string
          description: string | null
          domain: string
          event_type: string
          id: string
          metadata: Json | null
          receipt_id: string | null
          subject_id: string | null
          subject_type: string | null
          user_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          description?: string | null
          domain?: string
          event_type: string
          id?: string
          metadata?: Json | null
          receipt_id?: string | null
          subject_id?: string | null
          subject_type?: string | null
          user_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          description?: string | null
          domain?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          receipt_id?: string | null
          subject_id?: string | null
          subject_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      token_classes: {
        Row: {
          class_key: string
          created_at: string
          default_ttl_seconds: number
          description: string
          display_name: string
          id: string
          max_ttl_seconds: number
          requires_mfa: boolean
          scope_template: Json | null
          updated_at: string
        }
        Insert: {
          class_key: string
          created_at?: string
          default_ttl_seconds?: number
          description?: string
          display_name: string
          id?: string
          max_ttl_seconds?: number
          requires_mfa?: boolean
          scope_template?: Json | null
          updated_at?: string
        }
        Update: {
          class_key?: string
          created_at?: string
          default_ttl_seconds?: number
          description?: string
          display_name?: string
          id?: string
          max_ttl_seconds?: number
          requires_mfa?: boolean
          scope_template?: Json | null
          updated_at?: string
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
      vapid_keys: {
        Row: {
          activated_at: string | null
          created_at: string
          id: string
          private_key_ref: string
          public_key: string
          rotated_at: string | null
          status: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          id?: string
          private_key_ref: string
          public_key: string
          rotated_at?: string | null
          status?: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          id?: string
          private_key_ref?: string
          public_key?: string
          rotated_at?: string | null
          status?: string
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
      has_admin_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
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
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
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
