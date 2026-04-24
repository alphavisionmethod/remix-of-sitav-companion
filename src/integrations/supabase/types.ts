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
      account_deletion_requests: {
        Row: {
          cancelled_at: string | null
          created_at: string
          id: string
          purged_at: string | null
          reason: string | null
          receipt_hash: string | null
          requested_at: string
          scheduled_purge_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          purged_at?: string | null
          reason?: string | null
          receipt_hash?: string | null
          requested_at?: string
          scheduled_purge_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          id?: string
          purged_at?: string | null
          reason?: string | null
          receipt_hash?: string | null
          requested_at?: string
          scheduled_purge_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accounts: {
        Row: {
          created_at: string
          display_name: string
          id: string
          industry: string | null
          metadata: Json
          org_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          industry?: string | null
          metadata?: Json
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          industry?: string | null
          metadata?: Json
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      advisor_action_proof_packs: {
        Row: {
          action_id: string
          advisor_id: string
          created_at: string
          evidence: Json
          id: string
          reversible: boolean
          rollback_evidence: Json | null
          rollback_executed_at: string | null
          rollback_token: string | null
          user_id: string
        }
        Insert: {
          action_id: string
          advisor_id: string
          created_at?: string
          evidence?: Json
          id?: string
          reversible?: boolean
          rollback_evidence?: Json | null
          rollback_executed_at?: string | null
          rollback_token?: string | null
          user_id: string
        }
        Update: {
          action_id?: string
          advisor_id?: string
          created_at?: string
          evidence?: Json
          id?: string
          reversible?: boolean
          rollback_evidence?: Json | null
          rollback_executed_at?: string | null
          rollback_token?: string | null
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
          boardroom_item_id: string | null
          created_at: string
          dispatch_id: string | null
          execution_fitness_score: number | null
          id: string
          lesson_learned: string | null
          outcome_observed: string | null
          outcome_quality: number | null
          outcome_record_id: string | null
          owner_action: string
          owner_feedback: string | null
          pattern_tags: Json | null
          recommendation_id: string | null
          recommendation_quality_score: number | null
          should_repeat: boolean | null
          updated_at: string
          usefulness_score: number | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          boardroom_item_id?: string | null
          created_at?: string
          dispatch_id?: string | null
          execution_fitness_score?: number | null
          id?: string
          lesson_learned?: string | null
          outcome_observed?: string | null
          outcome_quality?: number | null
          outcome_record_id?: string | null
          owner_action?: string
          owner_feedback?: string | null
          pattern_tags?: Json | null
          recommendation_id?: string | null
          recommendation_quality_score?: number | null
          should_repeat?: boolean | null
          updated_at?: string
          usefulness_score?: number | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          boardroom_item_id?: string | null
          created_at?: string
          dispatch_id?: string | null
          execution_fitness_score?: number | null
          id?: string
          lesson_learned?: string | null
          outcome_observed?: string | null
          outcome_quality?: number | null
          outcome_record_id?: string | null
          owner_action?: string
          owner_feedback?: string | null
          pattern_tags?: Json | null
          recommendation_id?: string | null
          recommendation_quality_score?: number | null
          should_repeat?: boolean | null
          updated_at?: string
          usefulness_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_board_reflections_brd_item_fk"
            columns: ["boardroom_item_id"]
            isOneToOne: false
            referencedRelation: "boardroom_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_board_reflections_dispatch_fk"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "boardroom_followthrough_dispatches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advisor_board_reflections_outcome_fk"
            columns: ["outcome_record_id"]
            isOneToOne: false
            referencedRelation: "boardroom_outcome_records"
            referencedColumns: ["id"]
          },
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
      advisor_registry: {
        Row: {
          advisor_id: string
          autonomy_level: string
          blocked_actions: Json
          capabilities: Json
          confidence_threshold: number | null
          council: string
          created_at: string
          default_model: string | null
          display_name: string
          domain: string
          maturity: string
          metadata: Json
          prompt_family_id: string | null
          required_inputs: Json
          risk_tier: string
          updated_at: string
        }
        Insert: {
          advisor_id: string
          autonomy_level?: string
          blocked_actions?: Json
          capabilities?: Json
          confidence_threshold?: number | null
          council?: string
          created_at?: string
          default_model?: string | null
          display_name: string
          domain: string
          maturity?: string
          metadata?: Json
          prompt_family_id?: string | null
          required_inputs?: Json
          risk_tier?: string
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          autonomy_level?: string
          blocked_actions?: Json
          capabilities?: Json
          confidence_threshold?: number | null
          council?: string
          created_at?: string
          default_model?: string | null
          display_name?: string
          domain?: string
          maturity?: string
          metadata?: Json
          prompt_family_id?: string | null
          required_inputs?: Json
          risk_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_action_receipts: {
        Row: {
          action_payload: Json
          action_type: string
          approval_request_id: string | null
          confidence: number
          created_at: string
          executed_at: string | null
          id: string
          invocation_id: string | null
          metadata: Json
          receipt_id: string | null
          recommendation_summary: string
          risk_tier: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_payload?: Json
          action_type: string
          approval_request_id?: string | null
          confidence?: number
          created_at?: string
          executed_at?: string | null
          id?: string
          invocation_id?: string | null
          metadata?: Json
          receipt_id?: string | null
          recommendation_summary: string
          risk_tier?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_payload?: Json
          action_type?: string
          approval_request_id?: string | null
          confidence?: number
          created_at?: string
          executed_at?: string | null
          id?: string
          invocation_id?: string | null
          metadata?: Json
          receipt_id?: string | null
          recommendation_summary?: string
          risk_tier?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_action_receipts_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_action_receipts_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_invocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_action_receipts_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_budget_alerts: {
        Row: {
          alert_state: string
          created_at: string
          expires_at: string
          id: string
          observed_cost_usd: number | null
          period_class: string
          scope_ref: string | null
          scope_type: string
          threshold_percent: number | null
          user_id: string
        }
        Insert: {
          alert_state?: string
          created_at?: string
          expires_at?: string
          id?: string
          observed_cost_usd?: number | null
          period_class?: string
          scope_ref?: string | null
          scope_type?: string
          threshold_percent?: number | null
          user_id: string
        }
        Update: {
          alert_state?: string
          created_at?: string
          expires_at?: string
          id?: string
          observed_cost_usd?: number | null
          period_class?: string
          scope_ref?: string | null
          scope_type?: string
          threshold_percent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_budget_decision_receipts: {
        Row: {
          actual_cost_cents: number | null
          capability_key: string
          correlation_id: string | null
          cost_estimate_cents: number | null
          created_at: string
          daily_pct: number | null
          decision: string
          expires_at: string
          fallback_model_id: string | null
          id: string
          monthly_pct: number | null
          policy_rule: string
          pre_check_state: Json
          reason: string
          user_id: string
        }
        Insert: {
          actual_cost_cents?: number | null
          capability_key: string
          correlation_id?: string | null
          cost_estimate_cents?: number | null
          created_at?: string
          daily_pct?: number | null
          decision: string
          expires_at?: string
          fallback_model_id?: string | null
          id?: string
          monthly_pct?: number | null
          policy_rule: string
          pre_check_state?: Json
          reason: string
          user_id: string
        }
        Update: {
          actual_cost_cents?: number | null
          capability_key?: string
          correlation_id?: string | null
          cost_estimate_cents?: number | null
          created_at?: string
          daily_pct?: number | null
          decision?: string
          expires_at?: string
          fallback_model_id?: string | null
          id?: string
          monthly_pct?: number | null
          policy_rule?: string
          pre_check_state?: Json
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_capability_routing: {
        Row: {
          budget_class: string
          capability_key: string
          created_at: string
          description: string | null
          display_name: string
          fallback_chain: Json
          is_active: boolean
          primary_model: string
          risk_tier: string
          task_class: string
          updated_at: string
        }
        Insert: {
          budget_class?: string
          capability_key: string
          created_at?: string
          description?: string | null
          display_name: string
          fallback_chain?: Json
          is_active?: boolean
          primary_model: string
          risk_tier?: string
          task_class?: string
          updated_at?: string
        }
        Update: {
          budget_class?: string
          capability_key?: string
          created_at?: string
          description?: string | null
          display_name?: string
          fallback_chain?: Json
          is_active?: boolean
          primary_model?: string
          risk_tier?: string
          task_class?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_capability_routing_primary_model_fkey"
            columns: ["primary_model"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["model_id"]
          },
        ]
      }
      ai_fallback_events: {
        Row: {
          capability_key: string
          created_at: string
          expires_at: string
          fallback_reason: string
          id: string
          result_state: string
          user_id: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          expires_at?: string
          fallback_reason: string
          id?: string
          result_state?: string
          user_id: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          expires_at?: string
          fallback_reason?: string
          id?: string
          result_state?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_implementation_suggestions: {
        Row: {
          created_at: string
          estimated_effort: string
          evidence_refs: Json
          expected_value: string
          id: string
          priority: string
          proposed_change_type: string
          rationale: string
          review_comments: string | null
          reviewed_at: string | null
          reviewer_user_id: string | null
          source_agent_id: string
          source_council: string
          source_signal_ref: string
          source_signal_type: string
          status: string
          summary: string
          superseded_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_effort?: string
          evidence_refs?: Json
          expected_value?: string
          id?: string
          priority?: string
          proposed_change_type?: string
          rationale?: string
          review_comments?: string | null
          reviewed_at?: string | null
          reviewer_user_id?: string | null
          source_agent_id: string
          source_council?: string
          source_signal_ref: string
          source_signal_type: string
          status?: string
          summary?: string
          superseded_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_effort?: string
          evidence_refs?: Json
          expected_value?: string
          id?: string
          priority?: string
          proposed_change_type?: string
          rationale?: string
          review_comments?: string | null
          reviewed_at?: string | null
          reviewer_user_id?: string | null
          source_agent_id?: string
          source_council?: string
          source_signal_ref?: string
          source_signal_type?: string
          status?: string
          summary?: string
          superseded_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_implementation_suggestions_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "ai_implementation_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_inference_receipts: {
        Row: {
          capability_id: string | null
          cost_estimate_cents: number | null
          created_at: string | null
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
      ai_invocations: {
        Row: {
          capability_key: string
          completion_tokens: number | null
          correlation_id: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          estimated_cost_usd: number | null
          expires_at: string
          id: string
          invoked_by_role: string | null
          latency_ms: number | null
          model: string
          prompt_class: string
          prompt_family_id: string | null
          prompt_tokens: number | null
          prompt_version_id: string | null
          provider: string | null
          request_payload: Json
          response_payload: Json
          status: string
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          capability_key: string
          completion_tokens?: number | null
          correlation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          expires_at?: string
          id?: string
          invoked_by_role?: string | null
          latency_ms?: number | null
          model: string
          prompt_class?: string
          prompt_family_id?: string | null
          prompt_tokens?: number | null
          prompt_version_id?: string | null
          provider?: string | null
          request_payload?: Json
          response_payload?: Json
          status?: string
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          capability_key?: string
          completion_tokens?: number | null
          correlation_id?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          estimated_cost_usd?: number | null
          expires_at?: string
          id?: string
          invoked_by_role?: string | null
          latency_ms?: number | null
          model?: string
          prompt_class?: string
          prompt_family_id?: string | null
          prompt_tokens?: number | null
          prompt_version_id?: string | null
          provider?: string | null
          request_payload?: Json
          response_payload?: Json
          status?: string
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_model_registry: {
        Row: {
          context_length: number
          cost_per_1k_in_cents: number | null
          cost_per_1k_out_cents: number | null
          cost_tier: string
          created_at: string
          deprecated_at: string | null
          display_name: string
          is_deprecated: boolean
          latency_tier: string
          max_tokens_in: number | null
          max_tokens_out: number | null
          model_class: string
          model_id: string
          provider_key: string
          quality_tier: string
          recommended_use_cases: Json
          structured_output_support: boolean
          tool_calling_support: boolean
          updated_at: string
        }
        Insert: {
          context_length?: number
          cost_per_1k_in_cents?: number | null
          cost_per_1k_out_cents?: number | null
          cost_tier?: string
          created_at?: string
          deprecated_at?: string | null
          display_name: string
          is_deprecated?: boolean
          latency_tier?: string
          max_tokens_in?: number | null
          max_tokens_out?: number | null
          model_class?: string
          model_id: string
          provider_key: string
          quality_tier?: string
          recommended_use_cases?: Json
          structured_output_support?: boolean
          tool_calling_support?: boolean
          updated_at?: string
        }
        Update: {
          context_length?: number
          cost_per_1k_in_cents?: number | null
          cost_per_1k_out_cents?: number | null
          cost_tier?: string
          created_at?: string
          deprecated_at?: string | null
          display_name?: string
          is_deprecated?: boolean
          latency_tier?: string
          max_tokens_in?: number | null
          max_tokens_out?: number | null
          model_class?: string
          model_id?: string
          provider_key?: string
          quality_tier?: string
          recommended_use_cases?: Json
          structured_output_support?: boolean
          tool_calling_support?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_registry_provider_key_fkey"
            columns: ["provider_key"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["provider_key"]
          },
        ]
      }
      ai_prompt_families: {
        Row: {
          capability_keys: string[]
          created_at: string
          current_version_id: string | null
          description: string | null
          display_name: string
          family_id: string
          owner_domain: string
          updated_at: string
        }
        Insert: {
          capability_keys?: string[]
          created_at?: string
          current_version_id?: string | null
          description?: string | null
          display_name: string
          family_id: string
          owner_domain?: string
          updated_at?: string
        }
        Update: {
          capability_keys?: string[]
          created_at?: string
          current_version_id?: string | null
          description?: string | null
          display_name?: string
          family_id?: string
          owner_domain?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_prompt_invocations: {
        Row: {
          advisor_id: string | null
          capability_key: string | null
          family_id: string
          id: string
          invocation_id: string | null
          ts: string
          user_id: string
          version_id: string | null
        }
        Insert: {
          advisor_id?: string | null
          capability_key?: string | null
          family_id: string
          id?: string
          invocation_id?: string | null
          ts?: string
          user_id: string
          version_id?: string | null
        }
        Update: {
          advisor_id?: string | null
          capability_key?: string | null
          family_id?: string
          id?: string
          invocation_id?: string | null
          ts?: string
          user_id?: string
          version_id?: string | null
        }
        Relationships: []
      }
      ai_prompt_versions: {
        Row: {
          activated_at: string | null
          created_at: string
          created_by: string | null
          deprecated_at: string | null
          family_id: string
          hash: string
          id: string
          status: string
          system_prompt: string
          template: string
          updated_at: string
          variables: Json
          version: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          created_by?: string | null
          deprecated_at?: string | null
          family_id: string
          hash: string
          id?: string
          status?: string
          system_prompt?: string
          template?: string
          updated_at?: string
          variables?: Json
          version: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          created_by?: string | null
          deprecated_at?: string | null
          family_id?: string
          hash?: string
          id?: string
          status?: string
          system_prompt?: string
          template?: string
          updated_at?: string
          variables?: Json
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_prompt_versions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "ai_prompt_families"
            referencedColumns: ["family_id"]
          },
        ]
      }
      ai_provider_health: {
        Row: {
          created_at: string
          error_rate_pct: number | null
          failure_count: number
          id: string
          last_error: string | null
          last_probed_at: string
          latency_ms_p50: number | null
          latency_ms_p95: number | null
          provider_key: string
          status: string
          success_count: number
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string
          error_rate_pct?: number | null
          failure_count?: number
          id?: string
          last_error?: string | null
          last_probed_at?: string
          latency_ms_p50?: number | null
          latency_ms_p95?: number | null
          provider_key: string
          status?: string
          success_count?: number
          window_end?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          error_rate_pct?: number | null
          failure_count?: number
          id?: string
          last_error?: string | null
          last_probed_at?: string
          latency_ms_p50?: number | null
          latency_ms_p95?: number | null
          provider_key?: string
          status?: string
          success_count?: number
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_health_provider_key_fkey"
            columns: ["provider_key"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["provider_key"]
          },
        ]
      }
      ai_provider_registry: {
        Row: {
          auth_kind: string
          base_url: string | null
          created_at: string
          deprecated_at: string | null
          display_name: string
          is_active: boolean
          metadata: Json
          provider_key: string
          region: string | null
          sla_tier: string
          updated_at: string
        }
        Insert: {
          auth_kind?: string
          base_url?: string | null
          created_at?: string
          deprecated_at?: string | null
          display_name: string
          is_active?: boolean
          metadata?: Json
          provider_key: string
          region?: string | null
          sla_tier?: string
          updated_at?: string
        }
        Update: {
          auth_kind?: string
          base_url?: string | null
          created_at?: string
          deprecated_at?: string | null
          display_name?: string
          is_active?: boolean
          metadata?: Json
          provider_key?: string
          region?: string | null
          sla_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_receipt_completeness_snapshots: {
        Row: {
          created_at: string
          id: string
          invocations_with_receipt: number
          missing_receipt_ids: Json
          receipt_coverage_pct: number
          total_invocations: number
          window_end: string
          window_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          invocations_with_receipt?: number
          missing_receipt_ids?: Json
          receipt_coverage_pct?: number
          total_invocations?: number
          window_end: string
          window_start: string
        }
        Update: {
          created_at?: string
          id?: string
          invocations_with_receipt?: number
          missing_receipt_ids?: Json
          receipt_coverage_pct?: number
          total_invocations?: number
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      ai_receipt_records: {
        Row: {
          capability_key: string
          created_at: string
          decision_class: string
          degraded_reason: string | null
          expires_at: string
          id: string
          mode: string
          usage_ledger_id: string | null
          user_id: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          decision_class?: string
          degraded_reason?: string | null
          expires_at?: string
          id?: string
          mode?: string
          usage_ledger_id?: string | null
          user_id: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          decision_class?: string
          degraded_reason?: string | null
          expires_at?: string
          id?: string
          mode?: string
          usage_ledger_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_receipt_records_usage_ledger_id_fkey"
            columns: ["usage_ledger_id"]
            isOneToOne: false
            referencedRelation: "ai_usage_ledger"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_routing_policies: {
        Row: {
          capability_id: string
          created_at: string
          enabled: boolean
          fallback_models: string[]
          id: string
          max_cost_cents: number
          primary_model: string
          rationale: string | null
          risk_tier: string
          updated_at: string
        }
        Insert: {
          capability_id: string
          created_at?: string
          enabled?: boolean
          fallback_models?: string[]
          id?: string
          max_cost_cents?: number
          primary_model: string
          rationale?: string | null
          risk_tier?: string
          updated_at?: string
        }
        Update: {
          capability_id?: string
          created_at?: string
          enabled?: boolean
          fallback_models?: string[]
          id?: string
          max_cost_cents?: number
          primary_model?: string
          rationale?: string | null
          risk_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_routing_policies_primary_model_fkey"
            columns: ["primary_model"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["model_id"]
          },
        ]
      }
      ai_runtime_failure_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          acknowledgment_notes: string | null
          created_at: string
          evidence: Json
          failure_class: string
          id: string
          run_id: string
          severity: string
          summary: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_notes?: string | null
          created_at?: string
          evidence?: Json
          failure_class: string
          id?: string
          run_id: string
          severity?: string
          summary: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          acknowledgment_notes?: string | null
          created_at?: string
          evidence?: Json
          failure_class?: string
          id?: string
          run_id?: string
          severity?: string
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_runtime_failure_alerts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "ai_runtime_nightly_runs"
            referencedColumns: ["run_id"]
          },
        ]
      }
      ai_runtime_nightly_runs: {
        Row: {
          budget_enforced: boolean
          completed_at: string | null
          created_at: string
          estimated_cost_usd: number
          evidence: Json
          failure_class: string | null
          failure_detail: string | null
          fallback_verified: boolean
          id: string
          ledger_verified: boolean
          provider_calls_ok: boolean
          receipts_verified: boolean
          run_id: string
          started_at: string
          status: string
          total_invocations: number
          triggered_by: string
        }
        Insert: {
          budget_enforced?: boolean
          completed_at?: string | null
          created_at?: string
          estimated_cost_usd?: number
          evidence?: Json
          failure_class?: string | null
          failure_detail?: string | null
          fallback_verified?: boolean
          id?: string
          ledger_verified?: boolean
          provider_calls_ok?: boolean
          receipts_verified?: boolean
          run_id: string
          started_at?: string
          status: string
          total_invocations?: number
          triggered_by?: string
        }
        Update: {
          budget_enforced?: boolean
          completed_at?: string | null
          created_at?: string
          estimated_cost_usd?: number
          evidence?: Json
          failure_class?: string | null
          failure_detail?: string | null
          fallback_verified?: boolean
          id?: string
          ledger_verified?: boolean
          provider_calls_ok?: boolean
          receipts_verified?: boolean
          run_id?: string
          started_at?: string
          status?: string
          total_invocations?: number
          triggered_by?: string
        }
        Relationships: []
      }
      ai_runtime_streak_state: {
        Row: {
          current_streak_days: number
          id: string
          last_fail_at: string | null
          last_failure_class: string | null
          last_pass_at: string | null
          last_run_id: string | null
          longest_streak_days: number
          singleton_key: string
          streak_started_at: string | null
          updated_at: string
        }
        Insert: {
          current_streak_days?: number
          id?: string
          last_fail_at?: string | null
          last_failure_class?: string | null
          last_pass_at?: string | null
          last_run_id?: string | null
          longest_streak_days?: number
          singleton_key?: string
          streak_started_at?: string | null
          updated_at?: string
        }
        Update: {
          current_streak_days?: number
          id?: string
          last_fail_at?: string | null
          last_failure_class?: string | null
          last_pass_at?: string | null
          last_run_id?: string | null
          longest_streak_days?: number
          singleton_key?: string
          streak_started_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ai_usage_ledger: {
        Row: {
          capability_key: string
          completion_tokens: number | null
          created_at: string
          error_code: string | null
          error_summary: string | null
          estimated_cost_usd: number | null
          expires_at: string
          id: string
          latency_ms: number | null
          mode: string
          prompt_tokens: number | null
          request_class: string | null
          status: string
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          capability_key: string
          completion_tokens?: number | null
          created_at?: string
          error_code?: string | null
          error_summary?: string | null
          estimated_cost_usd?: number | null
          expires_at?: string
          id?: string
          latency_ms?: number | null
          mode?: string
          prompt_tokens?: number | null
          request_class?: string | null
          status?: string
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          capability_key?: string
          completion_tokens?: number | null
          created_at?: string
          error_code?: string | null
          error_summary?: string | null
          estimated_cost_usd?: number | null
          expires_at?: string
          id?: string
          latency_ms?: number | null
          mode?: string
          prompt_tokens?: number | null
          request_class?: string | null
          status?: string
          total_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_user_hard_ceilings: {
        Row: {
          created_at: string
          daily_calls_cap: number
          daily_cost_cents_cap: number
          degrade_to_model_id: string
          effective_from: string
          monthly_cost_cents_cap: number
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_calls_cap?: number
          daily_cost_cents_cap?: number
          degrade_to_model_id?: string
          effective_from?: string
          monthly_cost_cents_cap?: number
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_calls_cap?: number
          daily_cost_cents_cap?: number
          degrade_to_model_id?: string
          effective_from?: string
          monthly_cost_cents_cap?: number
          notes?: string | null
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
      alert_dedup_log: {
        Row: {
          alert_id: string | null
          created_at: string
          dedup_key: string | null
          fingerprint: string
          id: string
          occurrence_count: number
          original_severity: string
          simulation_run_id: string | null
          suppression_rule_id: string | null
          user_id: string
          was_deduplicated: boolean
          was_suppressed: boolean
        }
        Insert: {
          alert_id?: string | null
          created_at?: string
          dedup_key?: string | null
          fingerprint: string
          id?: string
          occurrence_count?: number
          original_severity?: string
          simulation_run_id?: string | null
          suppression_rule_id?: string | null
          user_id: string
          was_deduplicated?: boolean
          was_suppressed?: boolean
        }
        Update: {
          alert_id?: string | null
          created_at?: string
          dedup_key?: string | null
          fingerprint?: string
          id?: string
          occurrence_count?: number
          original_severity?: string
          simulation_run_id?: string | null
          suppression_rule_id?: string | null
          user_id?: string
          was_deduplicated?: boolean
          was_suppressed?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "alert_dedup_log_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_dedup_log_simulation_run_id_fkey"
            columns: ["simulation_run_id"]
            isOneToOne: false
            referencedRelation: "alert_simulation_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_dedup_log_suppression_rule_id_fkey"
            columns: ["suppression_rule_id"]
            isOneToOne: false
            referencedRelation: "alert_suppression_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_routes: {
        Row: {
          channel: string
          config: Json
          created_at: string
          enabled: boolean
          id: string
          severity_min: string
          source_pattern: string
          target: string
          updated_at: string
        }
        Insert: {
          channel: string
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          severity_min?: string
          source_pattern: string
          target: string
          updated_at?: string
        }
        Update: {
          channel?: string
          config?: Json
          created_at?: string
          enabled?: boolean
          id?: string
          severity_min?: string
          source_pattern?: string
          target?: string
          updated_at?: string
        }
        Relationships: []
      }
      alert_simulation_runs: {
        Row: {
          burst_size: number
          created_at: string
          dedup_count: number
          event_count: number
          id: string
          interval_ms: number
          name: string
          severity: string
          suppress_count: number
          suppression_window_ms: number
          user_id: string
        }
        Insert: {
          burst_size?: number
          created_at?: string
          dedup_count?: number
          event_count?: number
          id?: string
          interval_ms?: number
          name?: string
          severity?: string
          suppress_count?: number
          suppression_window_ms?: number
          user_id: string
        }
        Update: {
          burst_size?: number
          created_at?: string
          dedup_count?: number
          event_count?: number
          id?: string
          interval_ms?: number
          name?: string
          severity?: string
          suppress_count?: number
          suppression_window_ms?: number
          user_id?: string
        }
        Relationships: []
      }
      alert_suppression_rules: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          fingerprint_pattern: string | null
          id: string
          is_active: boolean
          match_count: number
          reason: string
          severity_filter: string[] | null
          source: string | null
          starts_at: string
          subsystem: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          expires_at: string
          fingerprint_pattern?: string | null
          id?: string
          is_active?: boolean
          match_count?: number
          reason?: string
          severity_filter?: string[] | null
          source?: string | null
          starts_at?: string
          subsystem?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          fingerprint_pattern?: string | null
          id?: string
          is_active?: boolean
          match_count?: number
          reason?: string
          severity_filter?: string[] | null
          source?: string | null
          starts_at?: string
          subsystem?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          ack_at: string | null
          ack_by: string | null
          assignee_user_id: string | null
          count: number
          created_at: string
          dedup_key: string | null
          description: string
          escalation_count: number
          fingerprint: string
          first_seen_at: string
          id: string
          last_escalated_at: string | null
          last_seen_at: string
          metadata: Json
          related_incident_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          runbook_id: string | null
          severity: string
          source: string
          status: string
          subsystem: string
          suppressed_until: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ack_at?: string | null
          ack_by?: string | null
          assignee_user_id?: string | null
          count?: number
          created_at?: string
          dedup_key?: string | null
          description?: string
          escalation_count?: number
          fingerprint: string
          first_seen_at?: string
          id?: string
          last_escalated_at?: string | null
          last_seen_at?: string
          metadata?: Json
          related_incident_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          runbook_id?: string | null
          severity?: string
          source: string
          status?: string
          subsystem: string
          suppressed_until?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ack_at?: string | null
          ack_by?: string | null
          assignee_user_id?: string | null
          count?: number
          created_at?: string
          dedup_key?: string | null
          description?: string
          escalation_count?: number
          fingerprint?: string
          first_seen_at?: string
          id?: string
          last_escalated_at?: string | null
          last_seen_at?: string
          metadata?: Json
          related_incident_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          runbook_id?: string | null
          severity?: string
          source?: string
          status?: string
          subsystem?: string
          suppressed_until?: string | null
          title?: string
          updated_at?: string
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
      app_assets: {
        Row: {
          app_id: string
          asset_type: string
          checksum: string | null
          created_at: string
          height: number | null
          id: string
          metadata: Json
          mime_type: string | null
          size_bytes: number | null
          source_url: string | null
          storage_path: string
          width: number | null
        }
        Insert: {
          app_id: string
          asset_type: string
          checksum?: string | null
          created_at?: string
          height?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          size_bytes?: number | null
          source_url?: string | null
          storage_path: string
          width?: number | null
        }
        Update: {
          app_id?: string
          asset_type?: string
          checksum?: string | null
          created_at?: string
          height?: number | null
          id?: string
          metadata?: Json
          mime_type?: string | null
          size_bytes?: number | null
          source_url?: string | null
          storage_path?: string
          width?: number | null
        }
        Relationships: []
      }
      app_ingestion_jobs: {
        Row: {
          app_id: string | null
          created_at: string
          error_json: Json | null
          id: string
          job_type: string
          requested_by: string | null
          result_json: Json | null
          source_url: string
          status: string
          updated_at: string
        }
        Insert: {
          app_id?: string | null
          created_at?: string
          error_json?: Json | null
          id?: string
          job_type: string
          requested_by?: string | null
          result_json?: Json | null
          source_url: string
          status?: string
          updated_at?: string
        }
        Update: {
          app_id?: string | null
          created_at?: string
          error_json?: Json | null
          id?: string
          job_type?: string
          requested_by?: string | null
          result_json?: Json | null
          source_url?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_launch_events: {
        Row: {
          app_id: string
          created_at: string
          expires_at: string
          id: string
          launch_context: Json | null
          launch_result: string
          surface: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          expires_at?: string
          id?: string
          launch_context?: Json | null
          launch_result?: string
          surface?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          launch_context?: Json | null
          launch_result?: string
          surface?: string
          user_id?: string
        }
        Relationships: []
      }
      app_packages: {
        Row: {
          app_id: string
          channel: string
          checksum: string | null
          created_at: string
          id: string
          metadata: Json
          min_platform_version: string
          package_type: string
          package_url: string | null
          runtime_target: string
          signature_metadata: Json
          size_bytes: number | null
          version: string
        }
        Insert: {
          app_id: string
          channel?: string
          checksum?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          min_platform_version?: string
          package_type?: string
          package_url?: string | null
          runtime_target?: string
          signature_metadata?: Json
          size_bytes?: number | null
          version: string
        }
        Update: {
          app_id?: string
          channel?: string
          checksum?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          min_platform_version?: string
          package_type?: string
          package_url?: string | null
          runtime_target?: string
          signature_metadata?: Json
          size_bytes?: number | null
          version?: string
        }
        Relationships: []
      }
      app_permissions_overrides: {
        Row: {
          app_id: string
          created_at: string
          granted: boolean
          id: string
          permission_key: string
          permission_value: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          app_id: string
          created_at?: string
          granted?: boolean
          id?: string
          permission_key: string
          permission_value?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          app_id?: string
          created_at?: string
          granted?: boolean
          id?: string
          permission_key?: string
          permission_value?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_sdk_extension_events: {
        Row: {
          app_id: string
          created_at: string
          event_type: string
          evidence: Json
          extension_id: string
          extension_kind: string
          id: string
          installed_by: string | null
          occurred_at: string
          signature_hash: string | null
          version: string
        }
        Insert: {
          app_id: string
          created_at?: string
          event_type: string
          evidence?: Json
          extension_id: string
          extension_kind: string
          id?: string
          installed_by?: string | null
          occurred_at?: string
          signature_hash?: string | null
          version?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          event_type?: string
          evidence?: Json
          extension_id?: string
          extension_kind?: string
          id?: string
          installed_by?: string | null
          occurred_at?: string
          signature_hash?: string | null
          version?: string
        }
        Relationships: []
      }
      app_sdk_extensions: {
        Row: {
          app_id: string
          created_at: string
          extension_id: string
          extension_kind: string
          id: string
          manifest: Json
          registered_at: string
          retired_at: string | null
          signature: string | null
          status: string
          updated_at: string
          version: string
        }
        Insert: {
          app_id: string
          created_at?: string
          extension_id: string
          extension_kind: string
          id?: string
          manifest?: Json
          registered_at?: string
          retired_at?: string | null
          signature?: string | null
          status?: string
          updated_at?: string
          version: string
        }
        Update: {
          app_id?: string
          created_at?: string
          extension_id?: string
          extension_kind?: string
          id?: string
          manifest?: Json
          registered_at?: string
          retired_at?: string | null
          signature?: string | null
          status?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      app_signatures: {
        Row: {
          app_id: string
          created_at: string
          id: string
          manifest_hash: string | null
          package_id: string
          publisher_key_id: string
          signature: string
          status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          manifest_hash?: string | null
          package_id: string
          publisher_key_id: string
          signature: string
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          manifest_hash?: string | null
          package_id?: string
          publisher_key_id?: string
          signature?: string
          status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_signatures_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "app_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_signatures_publisher_key_id_fkey"
            columns: ["publisher_key_id"]
            isOneToOne: false
            referencedRelation: "publisher_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      app_sources: {
        Row: {
          app_id: string
          created_at: string
          id: string
          notes: string | null
          signature_info: Json | null
          source_type: string
          source_url: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          notes?: string | null
          signature_info?: Json | null
          source_type?: string
          source_url?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          signature_info?: Json | null
          source_type?: string
          source_url?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      app_trust_records: {
        Row: {
          app_id: string
          badge: string
          created_at: string
          evaluated_at: string
          evidence: Json
          id: string
          score: number
          source_kind: string
        }
        Insert: {
          app_id: string
          badge?: string
          created_at?: string
          evaluated_at?: string
          evidence?: Json
          id?: string
          score?: number
          source_kind: string
        }
        Update: {
          app_id?: string
          badge?: string
          created_at?: string
          evaluated_at?: string
          evidence?: Json
          id?: string
          score?: number
          source_kind?: string
        }
        Relationships: []
      }
      app_update_channels: {
        Row: {
          app_id: string
          channel: string
          created_at: string
          id: string
          latest_version: string
          package_id: string | null
          published_at: string
          release_notes: string | null
          updated_at: string
        }
        Insert: {
          app_id: string
          channel?: string
          created_at?: string
          id?: string
          latest_version: string
          package_id?: string | null
          published_at?: string
          release_notes?: string | null
          updated_at?: string
        }
        Update: {
          app_id?: string
          channel?: string
          created_at?: string
          id?: string
          latest_version?: string
          package_id?: string | null
          published_at?: string
          release_notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_update_channels_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "app_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      app_versions: {
        Row: {
          app_id: string
          created_at: string
          id: string
          is_latest: boolean
          manifest_json: Json | null
          published_at: string
          release_notes: string | null
          version: string
        }
        Insert: {
          app_id: string
          created_at?: string
          id?: string
          is_latest?: boolean
          manifest_json?: Json | null
          published_at?: string
          release_notes?: string | null
          version: string
        }
        Update: {
          app_id?: string
          created_at?: string
          id?: string
          is_latest?: boolean
          manifest_json?: Json | null
          published_at?: string
          release_notes?: string | null
          version?: string
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
      approval_requests: {
        Row: {
          action_key: string
          approver_roles: string[]
          context: Json
          created_at: string
          escalated_at: string | null
          escalation_state: string
          expires_at: string
          id: string
          metadata: Json
          policy_basis: Json
          policy_id: string | null
          requested_by: string
          required_approvers: number
          risk_tier: string
          status: string
          subject_id: string | null
          subject_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_key: string
          approver_roles?: string[]
          context?: Json
          created_at?: string
          escalated_at?: string | null
          escalation_state?: string
          expires_at?: string
          id?: string
          metadata?: Json
          policy_basis?: Json
          policy_id?: string | null
          requested_by: string
          required_approvers?: number
          risk_tier?: string
          status?: string
          subject_id?: string | null
          subject_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_key?: string
          approver_roles?: string[]
          context?: Json
          created_at?: string
          escalated_at?: string | null
          escalation_state?: string
          expires_at?: string
          id?: string
          metadata?: Json
          policy_basis?: Json
          policy_id?: string | null
          requested_by?: string
          required_approvers?: number
          risk_tier?: string
          status?: string
          subject_id?: string | null
          subject_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      apps: {
        Row: {
          app_id: string
          app_type: string
          banner_url: string | null
          category: string | null
          created_at: string
          default_channel: string
          description: string | null
          enabled: boolean
          featured: boolean
          icon_url: string | null
          id: string
          installability: string
          latest_version: string
          launch_strategy: string
          launch_target: Json
          manifest_json: Json | null
          min_platform_version: string
          name: string
          offline_support: string
          permissions_required: Json | null
          pinned_default: boolean
          publisher: string | null
          publisher_id: string | null
          requires_auth: boolean
          requires_shell: boolean
          runtime_target: string
          screenshots: Json | null
          short_name: string | null
          slug: string
          sort_order: number
          supported_surfaces: string[] | null
          tags: string[] | null
          trust_level: string
          update_channel: string
          updated_at: string
          verification_status: string
          version: string
          window_defaults: Json | null
        }
        Insert: {
          app_id: string
          app_type: string
          banner_url?: string | null
          category?: string | null
          created_at?: string
          default_channel?: string
          description?: string | null
          enabled?: boolean
          featured?: boolean
          icon_url?: string | null
          id?: string
          installability?: string
          latest_version?: string
          launch_strategy: string
          launch_target?: Json
          manifest_json?: Json | null
          min_platform_version?: string
          name: string
          offline_support?: string
          permissions_required?: Json | null
          pinned_default?: boolean
          publisher?: string | null
          publisher_id?: string | null
          requires_auth?: boolean
          requires_shell?: boolean
          runtime_target?: string
          screenshots?: Json | null
          short_name?: string | null
          slug: string
          sort_order?: number
          supported_surfaces?: string[] | null
          tags?: string[] | null
          trust_level?: string
          update_channel?: string
          updated_at?: string
          verification_status?: string
          version?: string
          window_defaults?: Json | null
        }
        Update: {
          app_id?: string
          app_type?: string
          banner_url?: string | null
          category?: string | null
          created_at?: string
          default_channel?: string
          description?: string | null
          enabled?: boolean
          featured?: boolean
          icon_url?: string | null
          id?: string
          installability?: string
          latest_version?: string
          launch_strategy?: string
          launch_target?: Json
          manifest_json?: Json | null
          min_platform_version?: string
          name?: string
          offline_support?: string
          permissions_required?: Json | null
          pinned_default?: boolean
          publisher?: string | null
          publisher_id?: string | null
          requires_auth?: boolean
          requires_shell?: boolean
          runtime_target?: string
          screenshots?: Json | null
          short_name?: string | null
          slug?: string
          sort_order?: number
          supported_surfaces?: string[] | null
          tags?: string[] | null
          trust_level?: string
          update_channel?: string
          updated_at?: string
          verification_status?: string
          version?: string
          window_defaults?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "apps_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          acquired_at: string | null
          asset_class: string | null
          created_at: string
          current_value_cents: number
          id: string
          metadata: Json
          name: string
          org_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          asset_class?: string | null
          created_at?: string
          current_value_cents?: number
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          asset_class?: string | null
          created_at?: string
          current_value_cents?: number
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attestation_packets: {
        Row: {
          bundle_sha256: string
          controls_passing: number
          controls_total: number
          created_at: string
          delivered_at: string | null
          evidence_count: number
          framework: string
          id: string
          packet_key: string
          period_end: string
          period_start: string
          signature: string
          signed_by: string
          status: string
          storage_path: string | null
        }
        Insert: {
          bundle_sha256: string
          controls_passing?: number
          controls_total?: number
          created_at?: string
          delivered_at?: string | null
          evidence_count?: number
          framework: string
          id?: string
          packet_key: string
          period_end: string
          period_start: string
          signature: string
          signed_by?: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          bundle_sha256?: string
          controls_passing?: number
          controls_total?: number
          created_at?: string
          delivered_at?: string | null
          evidence_count?: number
          framework?: string
          id?: string
          packet_key?: string
          period_end?: string
          period_start?: string
          signature?: string
          signed_by?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: []
      }
      audit_export_bundles: {
        Row: {
          bundle_key: string
          created_at: string
          exported_at: string | null
          id: string
          period_end: string
          period_start: string
          record_count: number
          sha256: string
          signature: string
          status: string
          storage_path: string | null
        }
        Insert: {
          bundle_key: string
          created_at?: string
          exported_at?: string | null
          id?: string
          period_end: string
          period_start: string
          record_count?: number
          sha256: string
          signature: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          bundle_key?: string
          created_at?: string
          exported_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          record_count?: number
          sha256?: string
          signature?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_kind: string
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          correlation_id: string | null
          created_at: string
          domain: string
          id: string
          ip_address: unknown
          metadata: Json
          payload: Json
          reason: string | null
          result: string
          session_id: string | null
          severity: string
          subject_id: string | null
          subject_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          actor_kind?: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          correlation_id?: string | null
          created_at?: string
          domain?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          payload?: Json
          reason?: string | null
          result?: string
          session_id?: string | null
          severity?: string
          subject_id?: string | null
          subject_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          actor_kind?: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          correlation_id?: string | null
          created_at?: string
          domain?: string
          id?: string
          ip_address?: unknown
          metadata?: Json
          payload?: Json
          reason?: string | null
          result?: string
          session_id?: string | null
          severity?: string
          subject_id?: string | null
          subject_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_kill_switches: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          deactivated_at: string | null
          deactivated_by: string | null
          enabled: boolean
          expires_at: string | null
          id: string
          metadata: Json
          reason: string | null
          requires_approval: boolean
          scope: string
          scope_id: string | null
          severity: string
          switch_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          enabled?: boolean
          expires_at?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          requires_approval?: boolean
          scope?: string
          scope_id?: string | null
          severity?: string
          switch_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          created_at?: string
          deactivated_at?: string | null
          deactivated_by?: string | null
          enabled?: boolean
          expires_at?: string | null
          id?: string
          metadata?: Json
          reason?: string | null
          requires_approval?: boolean
          scope?: string
          scope_id?: string | null
          severity?: string
          switch_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      beta_applications: {
        Row: {
          country: string | null
          created_at: string
          device_targets: string[]
          email: string
          full_name: string
          id: string
          invite_code: string | null
          profile: Json
          score: number
          source: string | null
          status: string
          technical_level: string | null
          updated_at: string
          use_case: string | null
          why: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          device_targets?: string[]
          email: string
          full_name: string
          id?: string
          invite_code?: string | null
          profile?: Json
          score?: number
          source?: string | null
          status?: string
          technical_level?: string | null
          updated_at?: string
          use_case?: string | null
          why?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          device_targets?: string[]
          email?: string
          full_name?: string
          id?: string
          invite_code?: string | null
          profile?: Json
          score?: number
          source?: string | null
          status?: string
          technical_level?: string | null
          updated_at?: string
          use_case?: string | null
          why?: string | null
        }
        Relationships: []
      }
      bills: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          due_at: string | null
          id: string
          metadata: Json
          org_id: string | null
          paid_at: string | null
          recurrence: string | null
          status: string
          updated_at: string
          user_id: string
          vendor: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          paid_at?: string | null
          recurrence?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vendor: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          paid_at?: string | null
          recurrence?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vendor?: string
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
      boardroom_cockpit_tab_views: {
        Row: {
          created_at: string
          duration_ms: number | null
          engagement_score: number | null
          id: string
          metadata: Json
          opened_at: string
          session_id: string | null
          tab_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          engagement_score?: number | null
          id?: string
          metadata?: Json
          opened_at?: string
          session_id?: string | null
          tab_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          engagement_score?: number | null
          id?: string
          metadata?: Json
          opened_at?: string
          session_id?: string | null
          tab_key?: string
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
      boardroom_followthrough_dispatches: {
        Row: {
          action_payload: Json
          action_type: string
          approval_queue_id: string | null
          approved_at: string
          approved_by: string | null
          boardroom_item_id: string
          command_id: string | null
          command_step_id: string | null
          correlation_id: string
          created_at: string
          execution_completed_at: string | null
          execution_result: Json | null
          execution_started_at: string | null
          failure_reason: string | null
          id: string
          metadata: Json
          outcome_record_id: string | null
          receipt_id: string | null
          recommendation_id: string | null
          retry_count: number
          risk_tier: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_payload?: Json
          action_type: string
          approval_queue_id?: string | null
          approved_at?: string
          approved_by?: string | null
          boardroom_item_id: string
          command_id?: string | null
          command_step_id?: string | null
          correlation_id: string
          created_at?: string
          execution_completed_at?: string | null
          execution_result?: Json | null
          execution_started_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          outcome_record_id?: string | null
          receipt_id?: string | null
          recommendation_id?: string | null
          retry_count?: number
          risk_tier?: string
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_payload?: Json
          action_type?: string
          approval_queue_id?: string | null
          approved_at?: string
          approved_by?: string | null
          boardroom_item_id?: string
          command_id?: string | null
          command_step_id?: string | null
          correlation_id?: string
          created_at?: string
          execution_completed_at?: string | null
          execution_result?: Json | null
          execution_started_at?: string | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          outcome_record_id?: string | null
          receipt_id?: string | null
          recommendation_id?: string | null
          retry_count?: number
          risk_tier?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_followthrough_dispatches_boardroom_item_id_fkey"
            columns: ["boardroom_item_id"]
            isOneToOne: false
            referencedRelation: "boardroom_items"
            referencedColumns: ["id"]
          },
        ]
      }
      boardroom_followthrough_sla_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          age_hours: number
          alert_router_ok: boolean
          boardroom_item_id: string
          bucket: string
          created_at: string
          dispatch_id: string
          id: string
          payload: Json
          severity: string
          state: string
          triggered_by: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          age_hours: number
          alert_router_ok?: boolean
          boardroom_item_id: string
          bucket: string
          created_at?: string
          dispatch_id: string
          id?: string
          payload?: Json
          severity: string
          state: string
          triggered_by?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          age_hours?: number
          alert_router_ok?: boolean
          boardroom_item_id?: string
          bucket?: string
          created_at?: string
          dispatch_id?: string
          id?: string
          payload?: Json
          severity?: string
          state?: string
          triggered_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_followthrough_sla_alerts_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "boardroom_followthrough_dispatches"
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
          dispatch_id: string | null
          domain: string
          escalation_reason: string | null
          evidence_refs: Json
          execution_command_step_id: string | null
          followthrough_failure_reason: string | null
          followthrough_state: string
          freshness_state: Json
          id: string
          last_followthrough_event_at: string | null
          outcome_recorded_at: string | null
          outcome_status: string | null
          recommendation_state: string
          reflection_id: string | null
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
          dispatch_id?: string | null
          domain?: string
          escalation_reason?: string | null
          evidence_refs?: Json
          execution_command_step_id?: string | null
          followthrough_failure_reason?: string | null
          followthrough_state?: string
          freshness_state?: Json
          id?: string
          last_followthrough_event_at?: string | null
          outcome_recorded_at?: string | null
          outcome_status?: string | null
          recommendation_state?: string
          reflection_id?: string | null
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
          dispatch_id?: string | null
          domain?: string
          escalation_reason?: string | null
          evidence_refs?: Json
          execution_command_step_id?: string | null
          followthrough_failure_reason?: string | null
          followthrough_state?: string
          freshness_state?: Json
          id?: string
          last_followthrough_event_at?: string | null
          outcome_recorded_at?: string | null
          outcome_status?: string | null
          recommendation_state?: string
          reflection_id?: string | null
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
      boardroom_outcome_records: {
        Row: {
          actual_outcome: string
          affected_entities: Json
          boardroom_item_id: string
          confidence: number
          created_at: string
          dispatch_id: string
          expected_outcome: string
          id: string
          metadata: Json
          notes: string | null
          outcome_status: string
          retry_required: boolean
          updated_at: string
          user_id: string
          verification_source: string
          verified_by: string | null
        }
        Insert: {
          actual_outcome?: string
          affected_entities?: Json
          boardroom_item_id: string
          confidence?: number
          created_at?: string
          dispatch_id: string
          expected_outcome?: string
          id?: string
          metadata?: Json
          notes?: string | null
          outcome_status?: string
          retry_required?: boolean
          updated_at?: string
          user_id: string
          verification_source?: string
          verified_by?: string | null
        }
        Update: {
          actual_outcome?: string
          affected_entities?: Json
          boardroom_item_id?: string
          confidence?: number
          created_at?: string
          dispatch_id?: string
          expected_outcome?: string
          id?: string
          metadata?: Json
          notes?: string | null
          outcome_status?: string
          retry_required?: boolean
          updated_at?: string
          user_id?: string
          verification_source?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boardroom_outcome_records_boardroom_item_id_fkey"
            columns: ["boardroom_item_id"]
            isOneToOne: false
            referencedRelation: "boardroom_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boardroom_outcome_records_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "boardroom_followthrough_dispatches"
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
      bookings: {
        Row: {
          created_at: string
          customer_id: string | null
          ends_at: string | null
          id: string
          location: string | null
          metadata: Json
          org_id: string | null
          starts_at: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json
          org_id?: string | null
          starts_at: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          ends_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json
          org_id?: string | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          allocated_cents: number
          category: string
          created_at: string
          id: string
          metadata: Json
          org_id: string | null
          period_end: string
          period_start: string
          spent_cents: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_cents?: number
          category: string
          created_at?: string
          id?: string
          metadata?: Json
          org_id?: string | null
          period_end: string
          period_start: string
          spent_cents?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_cents?: number
          category?: string
          created_at?: string
          id?: string
          metadata?: Json
          org_id?: string | null
          period_end?: string
          period_start?: string
          spent_cents?: number
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
      capital_buckets: {
        Row: {
          balance_cents: number
          created_at: string
          id: string
          metadata: Json
          name: string
          org_id: string | null
          purpose: string | null
          status: string
          target_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          purpose?: string | null
          status?: string
          target_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          purpose?: string | null
          status?: string
          target_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chaos_drill_results: {
        Row: {
          blast_radius: string
          completed_at: string | null
          created_at: string
          detection_seconds: number | null
          drill_name: string
          evidence: Json
          id: string
          outcome: string
          recovery_seconds: number | null
          started_at: string
          triggered_by: string
        }
        Insert: {
          blast_radius?: string
          completed_at?: string | null
          created_at?: string
          detection_seconds?: number | null
          drill_name: string
          evidence?: Json
          id?: string
          outcome?: string
          recovery_seconds?: number | null
          started_at?: string
          triggered_by: string
        }
        Update: {
          blast_radius?: string
          completed_at?: string | null
          created_at?: string
          detection_seconds?: number | null
          drill_name?: string
          evidence?: Json
          id?: string
          outcome?: string
          recovery_seconds?: number | null
          started_at?: string
          triggered_by?: string
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
      commercial_memory_events: {
        Row: {
          created_at: string
          detail: string | null
          domain: string
          event_at: string
          event_type: string
          id: string
          impact_score: number | null
          metadata: Json | null
          sentiment: string | null
          source_agent_id: string | null
          source_ref: string | null
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          domain?: string
          event_at?: string
          event_type?: string
          id?: string
          impact_score?: number | null
          metadata?: Json | null
          sentiment?: string | null
          source_agent_id?: string | null
          source_ref?: string | null
          summary: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          domain?: string
          event_at?: string
          event_type?: string
          id?: string
          impact_score?: number | null
          metadata?: Json | null
          sentiment?: string | null
          source_agent_id?: string | null
          source_ref?: string | null
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      communications: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          customer_id: string | null
          delivered_at: string | null
          direction: string
          id: string
          metadata: Json
          org_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string
          id?: string
          metadata?: Json
          org_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          customer_id?: string | null
          delivered_at?: string | null
          direction?: string
          id?: string
          metadata?: Json
          org_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      compliance_controls: {
        Row: {
          category: string | null
          collection_cadence: string
          control_id: string
          created_at: string
          description: string | null
          evidence_query: string | null
          framework: string
          id: string
          required: boolean
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          collection_cadence?: string
          control_id: string
          created_at?: string
          description?: string | null
          evidence_query?: string | null
          framework: string
          id?: string
          required?: boolean
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          collection_cadence?: string
          control_id?: string
          created_at?: string
          description?: string | null
          evidence_query?: string | null
          framework?: string
          id?: string
          required?: boolean
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      compliance_evidence: {
        Row: {
          collected_at: string
          control_id: string
          evidence_kind: string
          expires_at: string
          failure_reason: string | null
          id: string
          pass: boolean
          payload: Json
          sha256: string
        }
        Insert: {
          collected_at?: string
          control_id: string
          evidence_kind: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          pass?: boolean
          payload?: Json
          sha256: string
        }
        Update: {
          collected_at?: string
          control_id?: string
          evidence_kind?: string
          expires_at?: string
          failure_reason?: string | null
          id?: string
          pass?: boolean
          payload?: Json
          sha256?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_evidence_control_id_fkey"
            columns: ["control_id"]
            isOneToOne: false
            referencedRelation: "compliance_controls"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidence_collectors: {
        Row: {
          collector_key: string
          control_id: string | null
          created_at: string
          description: string | null
          display_name: string
          framework: string
          id: string
          is_active: boolean
        }
        Insert: {
          collector_key: string
          control_id?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          framework: string
          id?: string
          is_active?: boolean
        }
        Update: {
          collector_key?: string
          control_id?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          framework?: string
          id?: string
          is_active?: boolean
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
      connector_accounts: {
        Row: {
          account_email: string | null
          connected_at: string
          connector_type: string
          created_at: string
          demo_mode: boolean
          disconnected_at: string | null
          display_name: string | null
          id: string
          last_health_at: string | null
          last_health_status: string | null
          metadata: Json
          registry_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email?: string | null
          connected_at?: string
          connector_type: string
          created_at?: string
          demo_mode?: boolean
          disconnected_at?: string | null
          display_name?: string | null
          id?: string
          last_health_at?: string | null
          last_health_status?: string | null
          metadata?: Json
          registry_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string | null
          connected_at?: string
          connector_type?: string
          created_at?: string
          demo_mode?: boolean
          disconnected_at?: string | null
          display_name?: string | null
          id?: string
          last_health_at?: string | null
          last_health_status?: string | null
          metadata?: Json
          registry_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_accounts_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "connector_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_configs: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_sync_at: string | null
          service: string
          status: string
          sync_interval_min: number
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          last_sync_at?: string | null
          service: string
          status?: string
          sync_interval_min?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          last_sync_at?: string | null
          service?: string
          status?: string
          sync_interval_min?: number
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
      connector_oauth_tokens: {
        Row: {
          access_token: string | null
          account_id: string
          created_at: string
          expires_at: string | null
          id: string
          last_refreshed_at: string | null
          provider: string
          reauth_required: boolean
          refresh_token: string | null
          rotation_count: number
          scopes_granted: string[]
          token_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          provider: string
          reauth_required?: boolean
          refresh_token?: string | null
          rotation_count?: number
          scopes_granted?: string[]
          token_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          provider?: string
          reauth_required?: boolean
          refresh_token?: string | null
          rotation_count?: number
          scopes_granted?: string[]
          token_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_oauth_tokens_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "connector_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_oauth_tokens_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "connector_effective_state"
            referencedColumns: ["account_id"]
          },
        ]
      }
      connector_reauth_events: {
        Row: {
          attempts: number
          created_at: string
          id: string
          metadata: Json
          prompted_at: string
          provider: string
          resolution_state: string
          resolved_at: string | null
          trigger_reason: string
          user_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          metadata?: Json
          prompted_at?: string
          provider: string
          resolution_state?: string
          resolved_at?: string | null
          trigger_reason: string
          user_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          metadata?: Json
          prompted_at?: string
          provider?: string
          resolution_state?: string
          resolved_at?: string | null
          trigger_reason?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_receipts: {
        Row: {
          account_id: string | null
          connector_type: string
          created_at: string
          details: Json
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          connector_type: string
          created_at?: string
          details?: Json
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          connector_type?: string
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_refresh_nightly_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          evidence: Json
          expiry_pressure_passed: boolean
          failure_summary: string | null
          id: string
          providers_failed: string[]
          providers_passed: string[]
          providers_reauth_required: string[]
          run_id: string
          started_at: string
          state_consistency_passed: boolean
          status: string
          triggered_by: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          evidence?: Json
          expiry_pressure_passed?: boolean
          failure_summary?: string | null
          id?: string
          providers_failed?: string[]
          providers_passed?: string[]
          providers_reauth_required?: string[]
          run_id: string
          started_at?: string
          state_consistency_passed?: boolean
          status?: string
          triggered_by?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          evidence?: Json
          expiry_pressure_passed?: boolean
          failure_summary?: string | null
          id?: string
          providers_failed?: string[]
          providers_passed?: string[]
          providers_reauth_required?: string[]
          run_id?: string
          started_at?: string
          state_consistency_passed?: boolean
          status?: string
          triggered_by?: string
        }
        Relationships: []
      }
      connector_refresh_streak_state: {
        Row: {
          current_streak_days: number
          id: string
          last_fail_at: string | null
          last_failure_class: string | null
          last_pass_at: string | null
          last_run_id: string | null
          longest_streak_days: number
          provider: string
          streak_started_at: string | null
          successful_runs_7d: number
          total_runs_7d: number
          updated_at: string
        }
        Insert: {
          current_streak_days?: number
          id?: string
          last_fail_at?: string | null
          last_failure_class?: string | null
          last_pass_at?: string | null
          last_run_id?: string | null
          longest_streak_days?: number
          provider: string
          streak_started_at?: string | null
          successful_runs_7d?: number
          total_runs_7d?: number
          updated_at?: string
        }
        Update: {
          current_streak_days?: number
          id?: string
          last_fail_at?: string | null
          last_failure_class?: string | null
          last_pass_at?: string | null
          last_run_id?: string | null
          longest_streak_days?: number
          provider?: string
          streak_started_at?: string | null
          successful_runs_7d?: number
          total_runs_7d?: number
          updated_at?: string
        }
        Relationships: []
      }
      connector_registry: {
        Row: {
          auth_method: string
          connector_class: string
          connector_id: string
          created_at: string
          default_scopes: string[]
          display_name: string
          icon_url: string | null
          id: string
          launch_stage: string
          metadata: Json
          provider: string
          read_supported: boolean
          refresh_supported: boolean
          sync_supported: boolean
          updated_at: string
          webhook_supported: boolean
          write_supported: boolean
        }
        Insert: {
          auth_method?: string
          connector_class?: string
          connector_id: string
          created_at?: string
          default_scopes?: string[]
          display_name: string
          icon_url?: string | null
          id?: string
          launch_stage?: string
          metadata?: Json
          provider: string
          read_supported?: boolean
          refresh_supported?: boolean
          sync_supported?: boolean
          updated_at?: string
          webhook_supported?: boolean
          write_supported?: boolean
        }
        Update: {
          auth_method?: string
          connector_class?: string
          connector_id?: string
          created_at?: string
          default_scopes?: string[]
          display_name?: string
          icon_url?: string | null
          id?: string
          launch_stage?: string
          metadata?: Json
          provider?: string
          read_supported?: boolean
          refresh_supported?: boolean
          sync_supported?: boolean
          updated_at?: string
          webhook_supported?: boolean
          write_supported?: boolean
        }
        Relationships: []
      }
      connector_sync_cursors: {
        Row: {
          account_id: string
          created_at: string
          cursor: string | null
          etag: string | null
          id: string
          last_synced_at: string | null
          resource_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          cursor?: string | null
          etag?: string | null
          id?: string
          last_synced_at?: string | null
          resource_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          cursor?: string | null
          etag?: string | null
          id?: string
          last_synced_at?: string | null
          resource_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_sync_cursors_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connector_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_sync_cursors_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connector_effective_state"
            referencedColumns: ["account_id"]
          },
        ]
      }
      connector_sync_runs: {
        Row: {
          completed_at: string | null
          connector: string
          created_at: string | null
          cursor: string | null
          dead_letter: boolean
          direction: string | null
          error: string | null
          id: string
          last_cursor: string | null
          records_synced: number | null
          resource_type: string | null
          started_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connector: string
          created_at?: string | null
          cursor?: string | null
          dead_letter?: boolean
          direction?: string | null
          error?: string | null
          id?: string
          last_cursor?: string | null
          records_synced?: number | null
          resource_type?: string | null
          started_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connector?: string
          created_at?: string | null
          cursor?: string | null
          dead_letter?: boolean
          direction?: string | null
          error?: string | null
          id?: string
          last_cursor?: string | null
          records_synced?: number | null
          resource_type?: string | null
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
      consent_scope_records: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          granted_at: string
          id: string
          metadata: Json
          provider_family: string
          revoked_at: string | null
          scope_category: string
          scope_label: string | null
          scope_value: string
          user_id: string
        }
        Insert: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string
          id?: string
          metadata?: Json
          provider_family: string
          revoked_at?: string | null
          scope_category?: string
          scope_label?: string | null
          scope_value: string
          user_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          granted_at?: string
          id?: string
          metadata?: Json
          provider_family?: string
          revoked_at?: string | null
          scope_category?: string
          scope_label?: string | null
          scope_value?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          created_at: string
          customer_id: string | null
          display_name: string
          email: string | null
          id: string
          metadata: Json
          org_id: string | null
          phone: string | null
          role: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          display_name: string
          email?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          phone?: string | null
          role?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          display_name?: string
          email?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          phone?: string | null
          role?: string | null
          status?: string
          updated_at?: string
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
      conversion_experiments: {
        Row: {
          confidence_level: number | null
          conversion_rate_a: number | null
          conversion_rate_b: number | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          name: string
          sample_size: number | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          variant_a: string
          variant_b: string
          winner: string | null
        }
        Insert: {
          confidence_level?: number | null
          conversion_rate_a?: number | null
          conversion_rate_b?: number | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          sample_size?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          variant_a?: string
          variant_b?: string
          winner?: string | null
        }
        Update: {
          confidence_level?: number | null
          conversion_rate_a?: number | null
          conversion_rate_b?: number | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          sample_size?: number | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          variant_a?: string
          variant_b?: string
          winner?: string | null
        }
        Relationships: []
      }
      council_escalations: {
        Row: {
          correlation_id: string | null
          created_at: string
          escalation_reason: string
          evidence: Json
          id: string
          meta_escalated_at: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          source_agent_id: string
          source_council: string
          status: string
          target_supervisor: string
          updated_at: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          escalation_reason?: string
          evidence?: Json
          id?: string
          meta_escalated_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_agent_id: string
          source_council: string
          status?: string
          target_supervisor: string
          updated_at?: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          escalation_reason?: string
          evidence?: Json
          id?: string
          meta_escalated_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          source_agent_id?: string
          source_council?: string
          status?: string
          target_supervisor?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "council_escalations_source_agent_id_fkey"
            columns: ["source_agent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
        ]
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
      cron_run_receipts: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          finished_at: string | null
          id: string
          job_name: string
          payload: Json
          schedule_expression: string | null
          started_at: string
          status: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_name: string
          payload?: Json
          schedule_expression?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          job_name?: string
          payload?: Json
          schedule_expression?: string | null
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      customer_journey_stages: {
        Row: {
          avg_duration_days: number | null
          conversion_rate: number | null
          created_at: string
          description: string | null
          entry_count: number | null
          exit_count: number | null
          id: string
          metadata: Json | null
          stage_name: string
          stage_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_duration_days?: number | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          entry_count?: number | null
          exit_count?: number | null
          id?: string
          metadata?: Json | null
          stage_name: string
          stage_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_duration_days?: number | null
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          entry_count?: number | null
          exit_count?: number | null
          id?: string
          metadata?: Json | null
          stage_name?: string
          stage_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_lifecycle_stages: {
        Row: {
          avg_revenue_cents: number | null
          color: string | null
          created_at: string
          criteria: string | null
          customer_count: number | null
          description: string | null
          id: string
          metadata: Json | null
          stage_name: string
          stage_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_revenue_cents?: number | null
          color?: string | null
          created_at?: string
          criteria?: string | null
          customer_count?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          stage_name: string
          stage_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_revenue_cents?: number | null
          color?: string | null
          created_at?: string
          criteria?: string | null
          customer_count?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          stage_name?: string
          stage_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_profile_snapshots: {
        Row: {
          created_at: string
          customer_id: string
          engagement_level: string | null
          health_score: number | null
          id: string
          lifetime_revenue_cents: number | null
          metadata: Json | null
          snapshot_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          engagement_level?: string | null
          health_score?: number | null
          id?: string
          lifetime_revenue_cents?: number | null
          metadata?: Json | null
          snapshot_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          engagement_level?: string | null
          health_score?: number | null
          id?: string
          lifetime_revenue_cents?: number | null
          metadata?: Json | null
          snapshot_date?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          display_name: string
          health_score: number | null
          id: string
          metadata: Json
          org_id: string | null
          primary_email: string | null
          primary_phone: string | null
          status: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          health_score?: number | null
          id?: string
          metadata?: Json
          org_id?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          health_score?: number | null
          id?: string
          metadata?: Json
          org_id?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          bytes_exported: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          export_format: string
          id: string
          requested_at: string
          row_count: number | null
          status: string
          table_count: number | null
          user_id: string
        }
        Insert: {
          bytes_exported?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_format?: string
          id?: string
          requested_at?: string
          row_count?: number | null
          status?: string
          table_count?: number | null
          user_id: string
        }
        Update: {
          bytes_exported?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          export_format?: string
          id?: string
          requested_at?: string
          row_count?: number | null
          status?: string
          table_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      data_retention_runs: {
        Row: {
          dry_run: boolean
          duration_ms: number
          error: string | null
          id: string
          metadata: Json
          mode: string
          ran_at: string
          rows_deleted: number
          table_name: string
        }
        Insert: {
          dry_run?: boolean
          duration_ms?: number
          error?: string | null
          id?: string
          metadata?: Json
          mode?: string
          ran_at?: string
          rows_deleted?: number
          table_name: string
        }
        Update: {
          dry_run?: boolean
          duration_ms?: number
          error?: string | null
          id?: string
          metadata?: Json
          mode?: string
          ran_at?: string
          rows_deleted?: number
          table_name?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          currency: string
          customer_id: string | null
          expected_close_at: string | null
          id: string
          metadata: Json
          org_id: string | null
          probability: number
          stage: string
          status: string
          title: string
          updated_at: string
          user_id: string
          value_cents: number
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          expected_close_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          probability?: number
          stage?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          value_cents?: number
        }
        Update: {
          created_at?: string
          currency?: string
          customer_id?: string | null
          expected_close_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          probability?: number
          stage?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          value_cents?: number
        }
        Relationships: []
      }
      debt_obligations: {
        Row: {
          apr: number | null
          balance_cents: number
          created_at: string
          id: string
          lender: string
          metadata: Json
          next_payment_at: string | null
          org_id: string | null
          principal_cents: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          apr?: number | null
          balance_cents?: number
          created_at?: string
          id?: string
          lender: string
          metadata?: Json
          next_payment_at?: string | null
          org_id?: string | null
          principal_cents?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          apr?: number | null
          balance_cents?: number
          created_at?: string
          id?: string
          lender?: string
          metadata?: Json
          next_payment_at?: string | null
          org_id?: string | null
          principal_cents?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dependency_upgrade_findings: {
        Row: {
          advisory_id: string | null
          created_at: string
          current_version: string | null
          ecosystem: string
          id: string
          issue_class: string
          package_name: string
          related_suggestion_id: string | null
          scanned_at: string
          severity: string
          source_evidence: Json
          status: string
          suggested_action: string | null
          target_version: string | null
          updated_at: string
          upgrade_risk: string
        }
        Insert: {
          advisory_id?: string | null
          created_at?: string
          current_version?: string | null
          ecosystem?: string
          id?: string
          issue_class?: string
          package_name: string
          related_suggestion_id?: string | null
          scanned_at?: string
          severity?: string
          source_evidence?: Json
          status?: string
          suggested_action?: string | null
          target_version?: string | null
          updated_at?: string
          upgrade_risk?: string
        }
        Update: {
          advisory_id?: string | null
          created_at?: string
          current_version?: string | null
          ecosystem?: string
          id?: string
          issue_class?: string
          package_name?: string
          related_suggestion_id?: string | null
          scanned_at?: string
          severity?: string
          source_evidence?: Json
          status?: string
          suggested_action?: string | null
          target_version?: string | null
          updated_at?: string
          upgrade_risk?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_upgrade_findings_related_suggestion_id_fkey"
            columns: ["related_suggestion_id"]
            isOneToOne: false
            referencedRelation: "ai_implementation_suggestions"
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
      digital_twin_snapshots: {
        Row: {
          created_at: string
          id: string
          label: string
          snapshot_type: string
          state_snapshot: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string
          snapshot_type?: string
          state_snapshot?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          snapshot_type?: string
          state_snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
      digital_twin_state: {
        Row: {
          created_at: string
          health_score: number | null
          id: string
          last_simulation_at: string | null
          parameters: Json
          simulation_config: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          health_score?: number | null
          id?: string
          last_simulation_at?: string | null
          parameters?: Json
          simulation_config?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          health_score?: number | null
          id?: string
          last_simulation_at?: string | null
          parameters?: Json
          simulation_config?: Json
          updated_at?: string
          user_id?: string
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
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          donor_email: string | null
          donor_name: string | null
          id: string
          is_public: boolean
          message: string | null
          paid_at: string | null
          receipt_hash: string | null
          status: string
          stripe_session_id: string | null
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_public?: boolean
          message?: string | null
          paid_at?: string | null
          receipt_hash?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          is_public?: boolean
          message?: string | null
          paid_at?: string | null
          receipt_hash?: string | null
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dr_drill_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          drill_kind: string
          evidence: Json
          failover_target: string | null
          id: string
          outcome: string
          rpo_seconds: number | null
          rto_seconds: number | null
          started_at: string
          triggered_by: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          drill_kind: string
          evidence?: Json
          failover_target?: string | null
          id?: string
          outcome?: string
          rpo_seconds?: number | null
          rto_seconds?: number | null
          started_at?: string
          triggered_by: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          drill_kind?: string
          evidence?: Json
          failover_target?: string | null
          id?: string
          outcome?: string
          rpo_seconds?: number | null
          rto_seconds?: number | null
          started_at?: string
          triggered_by?: string
        }
        Relationships: []
      }
      dr_drills: {
        Row: {
          created_at: string
          data_integrity_pct: number | null
          drill_key: string
          drill_type: string
          evidence: Json
          finished_at: string | null
          id: string
          notes: string | null
          rpo_actual_seconds: number | null
          rpo_target_seconds: number
          rto_actual_seconds: number | null
          rto_target_seconds: number
          scheduled_at: string
          scope: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_integrity_pct?: number | null
          drill_key: string
          drill_type?: string
          evidence?: Json
          finished_at?: string | null
          id?: string
          notes?: string | null
          rpo_actual_seconds?: number | null
          rpo_target_seconds?: number
          rto_actual_seconds?: number | null
          rto_target_seconds?: number
          scheduled_at?: string
          scope?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_integrity_pct?: number | null
          drill_key?: string
          drill_type?: string
          evidence?: Json
          finished_at?: string | null
          id?: string
          notes?: string | null
          rpo_actual_seconds?: number | null
          rpo_target_seconds?: number
          rto_actual_seconds?: number | null
          rto_target_seconds?: number
          scheduled_at?: string
          scope?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      drill_cadence_registry: {
        Row: {
          backup_owner_role: string | null
          cadence_interval_hours: number
          cadence_label: string
          category: string
          created_at: string
          description: string | null
          display_name: string
          drill_key: string
          evidence_path: string | null
          evidence_table: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          last_status: string | null
          next_due_at: string | null
          owner_role: string
          updated_at: string
        }
        Insert: {
          backup_owner_role?: string | null
          cadence_interval_hours: number
          cadence_label: string
          category: string
          created_at?: string
          description?: string | null
          display_name: string
          drill_key: string
          evidence_path?: string | null
          evidence_table?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_status?: string | null
          next_due_at?: string | null
          owner_role: string
          updated_at?: string
        }
        Update: {
          backup_owner_role?: string | null
          cadence_interval_hours?: number
          cadence_label?: string
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          drill_key?: string
          evidence_path?: string | null
          evidence_table?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          last_status?: string | null
          next_due_at?: string | null
          owner_role?: string
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
      envelopes: {
        Row: {
          balance_cents: number
          created_at: string
          id: string
          metadata: Json
          name: string
          org_id: string | null
          status: string
          target_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          status?: string
          target_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          status?: string
          target_cents?: number | null
          updated_at?: string
          user_id?: string
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
      errands: {
        Row: {
          bundle_id: string | null
          combinable: boolean
          created_at: string
          due_date: string | null
          estimated_minutes: number | null
          id: string
          location: string | null
          metadata: Json
          notes: string | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bundle_id?: string | null
          combinable?: boolean
          created_at?: string
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          location?: string | null
          metadata?: Json
          notes?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bundle_id?: string | null
          combinable?: boolean
          created_at?: string
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          location?: string | null
          metadata?: Json
          notes?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      error_events: {
        Row: {
          correlation_id: string | null
          count: number
          created_at: string
          environment: string
          expires_at: string | null
          fingerprint: string
          first_seen_at: string
          id: string
          last_seen_at: string
          message: string
          metadata: Json
          release: string | null
          resolved_at: string | null
          resolved_by: string | null
          route: string | null
          sentry_event_id: string | null
          severity: string
          source: string
          stack: string | null
          tenant_id: string | null
          updated_at: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          count?: number
          created_at?: string
          environment?: string
          expires_at?: string | null
          fingerprint: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          message: string
          metadata?: Json
          release?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          route?: string | null
          sentry_event_id?: string | null
          severity?: string
          source?: string
          stack?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          count?: number
          created_at?: string
          environment?: string
          expires_at?: string | null
          fingerprint?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          message?: string
          metadata?: Json
          release?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          route?: string | null
          sentry_event_id?: string | null
          severity?: string
          source?: string
          stack?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      error_patrol_detections: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_resource_id: string | null
          affected_resource_type: string | null
          created_at: string
          first_seen_at: string
          follow_up_recommendation: string | null
          frequency: number
          id: string
          last_seen_at: string
          linked_agent_action_id: string | null
          linked_incident_id: string | null
          linked_intent_id: string | null
          muted_until: string | null
          pattern_key: string
          raw_signal: Json
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          signature_hash: string
          status: string
          subsystem: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_resource_id?: string | null
          affected_resource_type?: string | null
          created_at?: string
          first_seen_at?: string
          follow_up_recommendation?: string | null
          frequency?: number
          id?: string
          last_seen_at?: string
          linked_agent_action_id?: string | null
          linked_incident_id?: string | null
          linked_intent_id?: string | null
          muted_until?: string | null
          pattern_key: string
          raw_signal?: Json
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          signature_hash: string
          status?: string
          subsystem: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_resource_id?: string | null
          affected_resource_type?: string | null
          created_at?: string
          first_seen_at?: string
          follow_up_recommendation?: string | null
          frequency?: number
          id?: string
          last_seen_at?: string
          linked_agent_action_id?: string | null
          linked_incident_id?: string | null
          linked_intent_id?: string | null
          muted_until?: string | null
          pattern_key?: string
          raw_signal?: Json
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          signature_hash?: string
          status?: string
          subsystem?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_patrol_detections_linked_agent_action_id_fkey"
            columns: ["linked_agent_action_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_patrol_detections_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_patrol_detections_linked_intent_id_fkey"
            columns: ["linked_intent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_action_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      event_plans: {
        Row: {
          budget_cents: number | null
          created_at: string
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          location: string | null
          metadata: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_cents?: number | null
          created_at?: string
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          location?: string | null
          metadata?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_cents?: number | null
          created_at?: string
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          location?: string | null
          metadata?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      evidence_graph_edges: {
        Row: {
          created_at: string
          from_node: string
          id: string
          metadata: Json
          relation: string
          to_node: string
        }
        Insert: {
          created_at?: string
          from_node: string
          id?: string
          metadata?: Json
          relation: string
          to_node: string
        }
        Update: {
          created_at?: string
          from_node?: string
          id?: string
          metadata?: Json
          relation?: string
          to_node?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_graph_edges_from_node_fkey"
            columns: ["from_node"]
            isOneToOne: false
            referencedRelation: "evidence_graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_graph_edges_to_node_fkey"
            columns: ["to_node"]
            isOneToOne: false
            referencedRelation: "evidence_graph_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_graph_nodes: {
        Row: {
          created_at: string
          id: string
          kind: string
          metadata: Json
          owner: string
          ref: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          owner?: string
          ref: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          owner?: string
          ref?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_workforce_api_keys: {
        Row: {
          created_at: string
          id: string
          key_id: string
          last_used_at: string | null
          revoked_at: string | null
          scope: string
          secret_hash: string
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_id: string
          last_used_at?: string | null
          revoked_at?: string | null
          scope?: string
          secret_hash: string
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_id?: string
          last_used_at?: string | null
          revoked_at?: string | null
          scope?: string
          secret_hash?: string
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      external_workforce_subscriptions: {
        Row: {
          callback_url: string
          created_at: string
          event_types: string[]
          failure_count: number
          id: string
          last_delivered_at: string | null
          signing_secret_hash: string
          status: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          callback_url: string
          created_at?: string
          event_types?: string[]
          failure_count?: number
          id?: string
          last_delivered_at?: string | null
          signing_secret_hash: string
          status?: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          callback_url?: string
          created_at?: string
          event_types?: string[]
          failure_count?: number
          id?: string
          last_delivered_at?: string | null
          signing_secret_hash?: string
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      external_workforce_webhook_deliveries: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          event_type: string
          http_status: number | null
          id: string
          payload_hash: string
          retry_count: number
          signed_with_key: string | null
          subscription_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          http_status?: number | null
          id?: string
          payload_hash: string
          retry_count?: number
          signed_with_key?: string | null
          subscription_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          http_status?: number | null
          id?: string
          payload_hash?: string
          retry_count?: number
          signed_with_key?: string | null
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_workforce_webhook_deliveries_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "external_workforce_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          birthdate: string | null
          created_at: string
          display_name: string
          id: string
          metadata: Json
          notes: string | null
          relationship: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          birthdate?: string | null
          created_at?: string
          display_name: string
          id?: string
          metadata?: Json
          notes?: string | null
          relationship?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          birthdate?: string | null
          created_at?: string
          display_name?: string
          id?: string
          metadata?: Json
          notes?: string | null
          relationship?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      federated_knowledge_shares: {
        Row: {
          created_at: string
          dp_epsilon: number
          id: string
          pattern_hash: string
          pattern_kind: string
          payload: Json
          redaction_level: string
          source_tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dp_epsilon: number
          id?: string
          pattern_hash: string
          pattern_kind: string
          payload?: Json
          redaction_level?: string
          source_tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          dp_epsilon?: number
          id?: string
          pattern_hash?: string
          pattern_kind?: string
          payload?: Json
          redaction_level?: string
          source_tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      federated_pattern_aggregates: {
        Row: {
          confidence_band: string
          contributing_tenant_count: number
          created_at: string
          frequency_band: string
          id: string
          pattern_key: string
          payload: Json
          user_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          confidence_band: string
          contributing_tenant_count?: number
          created_at?: string
          frequency_band: string
          id?: string
          pattern_key: string
          payload?: Json
          user_id: string
          window_end: string
          window_start: string
        }
        Update: {
          confidence_band?: string
          contributing_tenant_count?: number
          created_at?: string
          frequency_band?: string
          id?: string
          pattern_key?: string
          payload?: Json
          user_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      federation_optin_events: {
        Row: {
          consent_kind: string
          consent_scope: Json
          consented_at: string
          consented_by: string
          created_at: string
          id: string
          signature: string
          tenant_id: string
        }
        Insert: {
          consent_kind: string
          consent_scope?: Json
          consented_at?: string
          consented_by: string
          created_at?: string
          id?: string
          signature: string
          tenant_id: string
        }
        Update: {
          consent_kind?: string
          consent_scope?: Json
          consented_at?: string
          consented_by?: string
          created_at?: string
          id?: string
          signature?: string
          tenant_id?: string
        }
        Relationships: []
      }
      file_metadata: {
        Row: {
          classification: string
          created_at: string
          extracted_data: Json
          filename: string
          id: string
          mime_type: string | null
          sensitivity: string
          size_bytes: number | null
          status: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          classification?: string
          created_at?: string
          extracted_data?: Json
          filename: string
          id?: string
          mime_type?: string | null
          sensitivity?: string
          size_bytes?: number | null
          status?: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          classification?: string
          created_at?: string
          extracted_data?: Json
          filename?: string
          id?: string
          mime_type?: string | null
          sensitivity?: string
          size_bytes?: number | null
          status?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      file_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flagship_loop_completions: {
        Row: {
          emitted_at: string
          evidence: Json
          id: string
          latency_ms: number | null
          loop_key: string
          outcome: string
          step_key: string
          user_id: string
        }
        Insert: {
          emitted_at?: string
          evidence?: Json
          id?: string
          latency_ms?: number | null
          loop_key: string
          outcome?: string
          step_key: string
          user_id: string
        }
        Update: {
          emitted_at?: string
          evidence?: Json
          id?: string
          latency_ms?: number | null
          loop_key?: string
          outcome?: string
          step_key?: string
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
      gift_plans: {
        Row: {
          budget_cents: number | null
          created_at: string
          id: string
          idea: string | null
          metadata: Json
          occasion: string | null
          recipient: string
          status: string
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_cents?: number | null
          created_at?: string
          id?: string
          idea?: string | null
          metadata?: Json
          occasion?: string | null
          recipient: string
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_cents?: number | null
          created_at?: string
          id?: string
          idea?: string | null
          metadata?: Json
          occasion?: string | null
          recipient?: string
          status?: string
          target_date?: string | null
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
      graph_nodes: {
        Row: {
          attributes: Json
          created_at: string
          description: string | null
          display_name: string
          id: string
          importance: number
          metadata: Json
          node_key: string
          node_type: string
          source: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attributes?: Json
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          importance?: number
          metadata?: Json
          node_key: string
          node_type: string
          source?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attributes?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          importance?: number
          metadata?: Json
          node_key?: string
          node_type?: string
          source?: string
          status?: string
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
      hardware_certification_runs: {
        Row: {
          ab_rollback_pass: boolean
          attestation_quote_b64: string | null
          created_at: string
          device_class: string
          device_model: string | null
          dm_verity_pass: boolean
          firmware: string | null
          id: string
          log_refs: Json
          notes: string | null
          overall_pass: boolean
          recovery_pass: boolean
          run_at: string
          run_id: string
          runner_id: string | null
          secure_boot_pass: boolean
          tpm_pass: boolean
          updated_at: string
        }
        Insert: {
          ab_rollback_pass?: boolean
          attestation_quote_b64?: string | null
          created_at?: string
          device_class: string
          device_model?: string | null
          dm_verity_pass?: boolean
          firmware?: string | null
          id?: string
          log_refs?: Json
          notes?: string | null
          overall_pass?: boolean
          recovery_pass?: boolean
          run_at?: string
          run_id: string
          runner_id?: string | null
          secure_boot_pass?: boolean
          tpm_pass?: boolean
          updated_at?: string
        }
        Update: {
          ab_rollback_pass?: boolean
          attestation_quote_b64?: string | null
          created_at?: string
          device_class?: string
          device_model?: string | null
          dm_verity_pass?: boolean
          firmware?: string | null
          id?: string
          log_refs?: Json
          notes?: string | null
          overall_pass?: boolean
          recovery_pass?: boolean
          run_at?: string
          run_id?: string
          runner_id?: string | null
          secure_boot_pass?: boolean
          tpm_pass?: boolean
          updated_at?: string
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
      holdings: {
        Row: {
          avg_cost_cents: number
          created_at: string
          current_value_cents: number
          id: string
          metadata: Json
          org_id: string | null
          portfolio_id: string | null
          quantity: number
          status: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_cost_cents?: number
          created_at?: string
          current_value_cents?: number
          id?: string
          metadata?: Json
          org_id?: string | null
          portfolio_id?: string | null
          quantity?: number
          status?: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_cost_cents?: number
          created_at?: string
          current_value_cents?: number
          id?: string
          metadata?: Json
          org_id?: string | null
          portfolio_id?: string | null
          quantity?: number
          status?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      household_tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json
          recurrence: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          recurrence?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json
          recurrence?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      incident_classifications: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          escalation_owner: string
          id: string
          is_active: boolean
          recommended_runbook_id: string
          recommended_switch_id: string | null
          severity: string
          subsystem: string
          symptom_code: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          escalation_owner?: string
          id?: string
          is_active?: boolean
          recommended_runbook_id: string
          recommended_switch_id?: string | null
          severity?: string
          subsystem: string
          symptom_code: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          escalation_owner?: string
          id?: string
          is_active?: boolean
          recommended_runbook_id?: string
          recommended_switch_id?: string | null
          severity?: string
          subsystem?: string
          symptom_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          affected_services: Json | null
          created_at: string
          description: string | null
          id: string
          owner_user_id: string | null
          primary_runbook_id: string | null
          remediation_notes: string | null
          resolved_at: string | null
          runbook_ids: string[]
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
          primary_runbook_id?: string | null
          remediation_notes?: string | null
          resolved_at?: string | null
          runbook_ids?: string[]
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
          primary_runbook_id?: string | null
          remediation_notes?: string | null
          resolved_at?: string | null
          runbook_ids?: string[]
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      installed_apps: {
        Row: {
          app_id: string
          config_json: Json | null
          enabled: boolean
          favorite: boolean
          id: string
          install_status: string
          installed_at: string
          last_launched_at: string | null
          last_update_check_at: string | null
          launch_count: number
          package_id: string | null
          permissions_granted: Json | null
          pinned: boolean
          pinned_order: number
          source_channel: string
          update_channel: string
          updated_at: string
          user_id: string
          version_installed: string | null
        }
        Insert: {
          app_id: string
          config_json?: Json | null
          enabled?: boolean
          favorite?: boolean
          id?: string
          install_status?: string
          installed_at?: string
          last_launched_at?: string | null
          last_update_check_at?: string | null
          launch_count?: number
          package_id?: string | null
          permissions_granted?: Json | null
          pinned?: boolean
          pinned_order?: number
          source_channel?: string
          update_channel?: string
          updated_at?: string
          user_id: string
          version_installed?: string | null
        }
        Update: {
          app_id?: string
          config_json?: Json | null
          enabled?: boolean
          favorite?: boolean
          id?: string
          install_status?: string
          installed_at?: string
          last_launched_at?: string | null
          last_update_check_at?: string | null
          launch_count?: number
          package_id?: string | null
          permissions_granted?: Json | null
          pinned?: boolean
          pinned_order?: number
          source_channel?: string
          update_channel?: string
          updated_at?: string
          user_id?: string
          version_installed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installed_apps_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "app_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      installed_apps_receipts: {
        Row: {
          action: string
          app_id: string
          created_at: string
          id: string
          manifest_hash: string | null
          manifest_signature: string | null
          metadata: Json
          occurred_at: string
          signature_verified: boolean
          source_channel: string
          user_id: string
        }
        Insert: {
          action: string
          app_id: string
          created_at?: string
          id?: string
          manifest_hash?: string | null
          manifest_signature?: string | null
          metadata?: Json
          occurred_at?: string
          signature_verified?: boolean
          source_channel?: string
          user_id: string
        }
        Update: {
          action?: string
          app_id?: string
          created_at?: string
          id?: string
          manifest_hash?: string | null
          manifest_signature?: string | null
          metadata?: Json
          occurred_at?: string
          signature_verified?: boolean
          source_channel?: string
          user_id?: string
        }
        Relationships: []
      }
      instruments: {
        Row: {
          asset_class: string | null
          created_at: string
          display_name: string | null
          exchange: string | null
          id: string
          metadata: Json
          org_id: string | null
          status: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_class?: string | null
          created_at?: string
          display_name?: string | null
          exchange?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          status?: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_class?: string | null
          created_at?: string
          display_name?: string | null
          exchange?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          status?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_action_intents: {
        Row: {
          action_class: string
          action_id: string | null
          agent_id: string
          approval_request_id: string | null
          confidence: number
          correlation_id: string | null
          created_at: string
          denial_reason: string | null
          error_message: string | null
          executed_at: string | null
          execution_result: Json | null
          gate_results: Json
          id: string
          invocation_id: string | null
          precondition_check_passed: boolean
          precondition_evidence: Json
          receipt_id: string | null
          rollback_capable: boolean
          rollback_intent_id: string | null
          rollback_plan: Json | null
          rolled_back_at: string | null
          rolled_back_by: string | null
          status: string
          target_id: string
          target_resource_type: string
          updated_at: string
        }
        Insert: {
          action_class: string
          action_id?: string | null
          agent_id: string
          approval_request_id?: string | null
          confidence?: number
          correlation_id?: string | null
          created_at?: string
          denial_reason?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          gate_results?: Json
          id?: string
          invocation_id?: string | null
          precondition_check_passed?: boolean
          precondition_evidence?: Json
          receipt_id?: string | null
          rollback_capable?: boolean
          rollback_intent_id?: string | null
          rollback_plan?: Json | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          status?: string
          target_id: string
          target_resource_type: string
          updated_at?: string
        }
        Update: {
          action_class?: string
          action_id?: string | null
          agent_id?: string
          approval_request_id?: string | null
          confidence?: number
          correlation_id?: string | null
          created_at?: string
          denial_reason?: string | null
          error_message?: string | null
          executed_at?: string | null
          execution_result?: Json | null
          gate_results?: Json
          id?: string
          invocation_id?: string | null
          precondition_check_passed?: boolean
          precondition_evidence?: Json
          receipt_id?: string | null
          rollback_capable?: boolean
          rollback_intent_id?: string | null
          rollback_plan?: Json | null
          rolled_back_at?: string | null
          rolled_back_by?: string | null
          status?: string
          target_id?: string
          target_resource_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_action_intents_action_class_fkey"
            columns: ["action_class"]
            isOneToOne: false
            referencedRelation: "internal_agent_action_whitelist"
            referencedColumns: ["action_class"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_action_id_fkey"
            columns: ["action_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "v_user_pending_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "ai_action_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_rollback_intent_id_fkey"
            columns: ["rollback_intent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_action_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_action_whitelist: {
        Row: {
          action_class: string
          created_at: string
          description: string
          display_name: string
          gate_function_name: string
          id: string
          is_active: boolean
          is_reversible: boolean
          max_autonomy_required: string
          rate_limit_per_hour: number
          requires_approval_above_confidence: number
          requires_rollback: boolean
          reverse_action_class: string | null
          target_resource_type: string
          updated_at: string
        }
        Insert: {
          action_class: string
          created_at?: string
          description?: string
          display_name: string
          gate_function_name?: string
          id?: string
          is_active?: boolean
          is_reversible?: boolean
          max_autonomy_required?: string
          rate_limit_per_hour?: number
          requires_approval_above_confidence?: number
          requires_rollback?: boolean
          reverse_action_class?: string | null
          target_resource_type: string
          updated_at?: string
        }
        Update: {
          action_class?: string
          created_at?: string
          description?: string
          display_name?: string
          gate_function_name?: string
          id?: string
          is_active?: boolean
          is_reversible?: boolean
          max_autonomy_required?: string
          rate_limit_per_hour?: number
          requires_approval_above_confidence?: number
          requires_rollback?: boolean
          reverse_action_class?: string | null
          target_resource_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_actions: {
        Row: {
          action_type: string
          agent_id: string
          approval_request_id: string | null
          autonomy_level_used: string
          confidence: number
          correlation_id: string | null
          council: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          escalation_id: string | null
          execution_result: Json | null
          id: string
          invocation_id: string | null
          observation_payload: Json
          rationale: string | null
          rollback_data: Json | null
          simulation_result: Json | null
          status: string
          summary: string
          updated_at: string
        }
        Insert: {
          action_type?: string
          agent_id: string
          approval_request_id?: string | null
          autonomy_level_used?: string
          confidence?: number
          correlation_id?: string | null
          council: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          escalation_id?: string | null
          execution_result?: Json | null
          id?: string
          invocation_id?: string | null
          observation_payload?: Json
          rationale?: string | null
          rollback_data?: Json | null
          simulation_result?: Json | null
          status?: string
          summary?: string
          updated_at?: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          approval_request_id?: string | null
          autonomy_level_used?: string
          confidence?: number
          correlation_id?: string | null
          council?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          escalation_id?: string | null
          execution_result?: Json | null
          id?: string
          invocation_id?: string | null
          observation_payload?: Json
          rationale?: string | null
          rollback_data?: Json | null
          simulation_result?: Json | null
          status?: string
          summary?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_actions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "internal_agent_actions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_actions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_actions_approval_request_id_fkey"
            columns: ["approval_request_id"]
            isOneToOne: false
            referencedRelation: "v_user_pending_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_actions_escalation_id_fkey"
            columns: ["escalation_id"]
            isOneToOne: false
            referencedRelation: "council_escalations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_actions_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_anomaly_signals: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          agent_id: string | null
          council: string | null
          created_at: string
          detected_at: string
          id: string
          metric_payload: Json
          severity: string
          signal_kind: string
          status: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          agent_id?: string | null
          council?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          metric_payload?: Json
          severity?: string
          signal_kind: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          agent_id?: string | null
          council?: string | null
          created_at?: string
          detected_at?: string
          id?: string
          metric_payload?: Json
          severity?: string
          signal_kind?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_assurance_reports: {
        Row: {
          assurance_score: number
          breach_count: number
          created_at: string
          drill_count: number
          evidence_refs: Json
          id: string
          period_end: string
          period_start: string
          summary: string | null
          user_id: string
        }
        Insert: {
          assurance_score?: number
          breach_count?: number
          created_at?: string
          drill_count?: number
          evidence_refs?: Json
          id?: string
          period_end: string
          period_start: string
          summary?: string | null
          user_id: string
        }
        Update: {
          assurance_score?: number
          breach_count?: number
          created_at?: string
          drill_count?: number
          evidence_refs?: Json
          id?: string
          period_end?: string
          period_start?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_auto_rollback_events: {
        Row: {
          applied_autonomy: number
          created_at: string
          id: string
          reason: string
          receipt_payload: Json | null
          rollback_target: string
          slo_snapshot_id: string | null
          status: string
          triggered_by: string
          user_id: string
        }
        Insert: {
          applied_autonomy?: number
          created_at?: string
          id?: string
          reason: string
          receipt_payload?: Json | null
          rollback_target: string
          slo_snapshot_id?: string | null
          status?: string
          triggered_by?: string
          user_id: string
        }
        Update: {
          applied_autonomy?: number
          created_at?: string
          id?: string
          reason?: string
          receipt_payload?: Json | null
          rollback_target?: string
          slo_snapshot_id?: string | null
          status?: string
          triggered_by?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_canary_runs: {
        Row: {
          created_at: string
          expected: Json
          failure_reason: string | null
          finished_at: string | null
          golden_path_id: string
          id: string
          observed: Json
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expected?: Json
          failure_reason?: string | null
          finished_at?: string | null
          golden_path_id: string
          id?: string
          observed?: Json
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expected?: Json
          failure_reason?: string | null
          finished_at?: string | null
          golden_path_id?: string
          id?: string
          observed?: Json
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_chaos_drills: {
        Row: {
          blast_radius: number
          created_at: string
          drill_key: string
          enabled: boolean
          id: string
          last_outcome: Json | null
          last_run_at: string | null
          scenario: string
          schedule_cron: string | null
          status: string
          target_system: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blast_radius?: number
          created_at?: string
          drill_key: string
          enabled?: boolean
          id?: string
          last_outcome?: Json | null
          last_run_at?: string | null
          scenario: string
          schedule_cron?: string | null
          status?: string
          target_system: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blast_radius?: number
          created_at?: string
          drill_key?: string
          enabled?: boolean
          id?: string
          last_outcome?: Json | null
          last_run_at?: string | null
          scenario?: string
          schedule_cron?: string | null
          status?: string
          target_system?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_consensus_sessions: {
        Row: {
          action_class: string
          ceiling_capped: boolean
          conflict_detected: boolean
          created_at: string
          effective_autonomy_level: number
          expires_at: string
          id: string
          initiating_agent_id: string
          participating_agent_ids: string[]
          participating_councils: string[]
          proposed_autonomy_level: number
          quorum_required: number
          resolution_payload: Json | null
          resolution_summary: string | null
          resolved_at: string | null
          resolved_by: string | null
          session_key: string
          status: string
          topic: string
          updated_at: string
        }
        Insert: {
          action_class?: string
          ceiling_capped?: boolean
          conflict_detected?: boolean
          created_at?: string
          effective_autonomy_level?: number
          expires_at?: string
          id?: string
          initiating_agent_id: string
          participating_agent_ids?: string[]
          participating_councils?: string[]
          proposed_autonomy_level?: number
          quorum_required?: number
          resolution_payload?: Json | null
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_key: string
          status?: string
          topic: string
          updated_at?: string
        }
        Update: {
          action_class?: string
          ceiling_capped?: boolean
          conflict_detected?: boolean
          created_at?: string
          effective_autonomy_level?: number
          expires_at?: string
          id?: string
          initiating_agent_id?: string
          participating_agent_ids?: string[]
          participating_councils?: string[]
          proposed_autonomy_level?: number
          quorum_required?: number
          resolution_payload?: Json | null
          resolution_summary?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_key?: string
          status?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_consensus_votes: {
        Row: {
          agent_id: string
          cast_at: string
          confidence: number
          council: string
          evidence_refs: Json
          expires_at: string
          id: string
          position: string
          rationale: string
          session_id: string
        }
        Insert: {
          agent_id: string
          cast_at?: string
          confidence?: number
          council: string
          evidence_refs?: Json
          expires_at?: string
          id?: string
          position: string
          rationale?: string
          session_id: string
        }
        Update: {
          agent_id?: string
          cast_at?: string
          confidence?: number
          council?: string
          evidence_refs?: Json
          expires_at?: string
          id?: string
          position?: string
          rationale?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_consensus_votes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_consensus_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_cost_proposals: {
        Row: {
          created_at: string
          current_state: Json
          decided_at: string | null
          decision_notes: string | null
          estimated_monthly_savings_usd: number
          estimated_quality_delta: number
          evidence_refs: Json
          expires_at: string
          id: string
          proposal_key: string
          proposal_type: string
          proposed_state: Json
          proposing_agent_id: string
          rationale: string
          reviewer_user_id: string | null
          risk_assessment: string
          scope: string
          status: string
          target_capability: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_state?: Json
          decided_at?: string | null
          decision_notes?: string | null
          estimated_monthly_savings_usd?: number
          estimated_quality_delta?: number
          evidence_refs?: Json
          expires_at?: string
          id?: string
          proposal_key: string
          proposal_type: string
          proposed_state?: Json
          proposing_agent_id: string
          rationale: string
          reviewer_user_id?: string | null
          risk_assessment?: string
          scope?: string
          status?: string
          target_capability?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_state?: Json
          decided_at?: string | null
          decision_notes?: string | null
          estimated_monthly_savings_usd?: number
          estimated_quality_delta?: number
          evidence_refs?: Json
          expires_at?: string
          id?: string
          proposal_key?: string
          proposal_type?: string
          proposed_state?: Json
          proposing_agent_id?: string
          rationale?: string
          reviewer_user_id?: string | null
          risk_assessment?: string
          scope?: string
          status?: string
          target_capability?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_definitions: {
        Row: {
          agent_id: string
          confidence_threshold_act: number
          confidence_threshold_recommend: number
          cost_budget_daily_cents: number
          cost_budget_guidance: string
          council: string
          created_at: string
          current_autonomy_level: string
          escalation_targets: Json
          failure_handling_rules: Json
          human_approval_requirements: Json
          id: string
          is_active: boolean
          maturity: string
          max_autonomy_level: string
          max_invocations_per_day: number
          measurable_kpis: Json
          memory_scope: string
          mission: string
          name: string
          out_of_scope: Json
          primary_escalation_target: string | null
          receives_escalations_from: Json
          related_docs: Json
          related_services: Json
          reporting_outputs: Json
          rollback_authority: string
          schedule_cron: string | null
          schedule_type: string
          scope: Json
          simulation_requirements: Json
          spec_hash: string | null
          special_ability: string
          tags: Json
          tools_allowed: Json
          tools_forbidden: Json
          trigger_conditions: Json
          trigger_events: Json
          updated_at: string
        }
        Insert: {
          agent_id: string
          confidence_threshold_act?: number
          confidence_threshold_recommend?: number
          cost_budget_daily_cents?: number
          cost_budget_guidance?: string
          council: string
          created_at?: string
          current_autonomy_level?: string
          escalation_targets?: Json
          failure_handling_rules?: Json
          human_approval_requirements?: Json
          id?: string
          is_active?: boolean
          maturity?: string
          max_autonomy_level?: string
          max_invocations_per_day?: number
          measurable_kpis?: Json
          memory_scope?: string
          mission?: string
          name: string
          out_of_scope?: Json
          primary_escalation_target?: string | null
          receives_escalations_from?: Json
          related_docs?: Json
          related_services?: Json
          reporting_outputs?: Json
          rollback_authority?: string
          schedule_cron?: string | null
          schedule_type?: string
          scope?: Json
          simulation_requirements?: Json
          spec_hash?: string | null
          special_ability?: string
          tags?: Json
          tools_allowed?: Json
          tools_forbidden?: Json
          trigger_conditions?: Json
          trigger_events?: Json
          updated_at?: string
        }
        Update: {
          agent_id?: string
          confidence_threshold_act?: number
          confidence_threshold_recommend?: number
          cost_budget_daily_cents?: number
          cost_budget_guidance?: string
          council?: string
          created_at?: string
          current_autonomy_level?: string
          escalation_targets?: Json
          failure_handling_rules?: Json
          human_approval_requirements?: Json
          id?: string
          is_active?: boolean
          maturity?: string
          max_autonomy_level?: string
          max_invocations_per_day?: number
          measurable_kpis?: Json
          memory_scope?: string
          mission?: string
          name?: string
          out_of_scope?: Json
          primary_escalation_target?: string | null
          receives_escalations_from?: Json
          related_docs?: Json
          related_services?: Json
          reporting_outputs?: Json
          rollback_authority?: string
          schedule_cron?: string | null
          schedule_type?: string
          scope?: Json
          simulation_requirements?: Json
          spec_hash?: string | null
          special_ability?: string
          tags?: Json
          tools_allowed?: Json
          tools_forbidden?: Json
          trigger_conditions?: Json
          trigger_events?: Json
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_drift_findings: {
        Row: {
          created_at: string
          detector_key: string
          drift_score: number
          expected: Json
          id: string
          observed: Json
          severity: string
          status: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          detector_key: string
          drift_score?: number
          expected?: Json
          id?: string
          observed?: Json
          severity?: string
          status?: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          detector_key?: string
          drift_score?: number
          expected?: Json
          id?: string
          observed?: Json
          severity?: string
          status?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_knowledge_bus: {
        Row: {
          applies_to_agents: string[]
          applies_to_councils: string[]
          confidence: number
          consumed_by: Json
          created_at: string
          expires_at: string
          id: string
          learning_summary: string
          pattern_tag: string
          recommended_guard: string | null
          source_agent_id: string
          status: string
          updated_at: string
        }
        Insert: {
          applies_to_agents?: string[]
          applies_to_councils?: string[]
          confidence?: number
          consumed_by?: Json
          created_at?: string
          expires_at?: string
          id?: string
          learning_summary: string
          pattern_tag: string
          recommended_guard?: string | null
          source_agent_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          applies_to_agents?: string[]
          applies_to_councils?: string[]
          confidence?: number
          consumed_by?: Json
          created_at?: string
          expires_at?: string
          id?: string
          learning_summary?: string
          pattern_tag?: string
          recommended_guard?: string | null
          source_agent_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_ladder_history: {
        Row: {
          agent_id: string
          created_at: string
          direction: string
          evaluator: string
          from_rung: number
          human_approved: boolean
          human_approver_user_id: string | null
          id: string
          metadata: Json
          reason: string
          to_rung: number
          trust_score_at_change: number
        }
        Insert: {
          agent_id: string
          created_at?: string
          direction: string
          evaluator?: string
          from_rung: number
          human_approved?: boolean
          human_approver_user_id?: string | null
          id?: string
          metadata?: Json
          reason: string
          to_rung: number
          trust_score_at_change: number
        }
        Update: {
          agent_id?: string
          created_at?: string
          direction?: string
          evaluator?: string
          from_rung?: number
          human_approved?: boolean
          human_approver_user_id?: string | null
          id?: string
          metadata?: Json
          reason?: string
          to_rung?: number
          trust_score_at_change?: number
        }
        Relationships: []
      }
      internal_agent_policy_drafts: {
        Row: {
          agent_id: string
          applied_externally_at: string | null
          applied_externally_evidence: string | null
          created_at: string
          current_state: Json
          draft_kind: string
          evidence: Json
          id: string
          proposed_state: Json
          rationale: string
          reviewed_at: string | null
          reviewer_notes: string | null
          reviewer_user_id: string | null
          risk_assessment: string
          sql_preview: string
          status: string
          target_resource: string
          target_schema: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id?: string
          applied_externally_at?: string | null
          applied_externally_evidence?: string | null
          created_at?: string
          current_state?: Json
          draft_kind: string
          evidence?: Json
          id?: string
          proposed_state?: Json
          rationale?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          reviewer_user_id?: string | null
          risk_assessment?: string
          sql_preview?: string
          status?: string
          target_resource: string
          target_schema?: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          applied_externally_at?: string | null
          applied_externally_evidence?: string | null
          created_at?: string
          current_state?: Json
          draft_kind?: string
          evidence?: Json
          id?: string
          proposed_state?: Json
          rationale?: string
          reviewed_at?: string | null
          reviewer_notes?: string | null
          reviewer_user_id?: string | null
          risk_assessment?: string
          sql_preview?: string
          status?: string
          target_resource?: string
          target_schema?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_policy_review_log: {
        Row: {
          action: string
          created_at: string
          draft_id: string
          evidence: Json
          id: string
          notes: string | null
          reviewer_user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          draft_id: string
          evidence?: Json
          id?: string
          notes?: string | null
          reviewer_user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          draft_id?: string
          evidence?: Json
          id?: string
          notes?: string | null
          reviewer_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_policy_review_log_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_policy_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_reflections: {
        Row: {
          action_class: string
          agent_id: string
          confidence_calibration: number | null
          created_at: string
          evidence: Json
          gate_fitness_score: number
          id: string
          intent_id: string
          intent_status: string
          lesson_learned: string
          outcome_quality: number
          pattern_tags: Json
          recommendation: string | null
          reflected_at: string
          should_repeat: boolean | null
          updated_at: string
        }
        Insert: {
          action_class: string
          agent_id: string
          confidence_calibration?: number | null
          created_at?: string
          evidence?: Json
          gate_fitness_score?: number
          id?: string
          intent_id: string
          intent_status: string
          lesson_learned?: string
          outcome_quality?: number
          pattern_tags?: Json
          recommendation?: string | null
          reflected_at?: string
          should_repeat?: boolean | null
          updated_at?: string
        }
        Update: {
          action_class?: string
          agent_id?: string
          confidence_calibration?: number | null
          created_at?: string
          evidence?: Json
          gate_fitness_score?: number
          id?: string
          intent_id?: string
          intent_status?: string
          lesson_learned?: string
          outcome_quality?: number
          pattern_tags?: Json
          recommendation?: string | null
          reflected_at?: string
          should_repeat?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_reflections_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "internal_agent_reflections_intent_id_fkey"
            columns: ["intent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_action_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_runbook_bindings: {
        Row: {
          agent_id: string
          created_at: string
          enabled: boolean
          id: string
          max_autonomy_level: number
          prerequisites: Json
          rollback_required: boolean
          runbook_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          max_autonomy_level?: number
          prerequisites?: Json
          rollback_required?: boolean
          runbook_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          max_autonomy_level?: number
          prerequisites?: Json
          rollback_required?: boolean
          runbook_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_runbook_executions: {
        Row: {
          agent_id: string
          autonomy_level_used: number
          binding_id: string | null
          ceiling_capped: boolean
          completed_at: string | null
          duration_ms: number | null
          execution_key: string
          expires_at: string
          id: string
          outcome_status: string
          outcome_summary: string | null
          rollback_data: Json | null
          runbook_id: string
          started_at: string
          steps_executed: Json
          trigger_evidence_refs: Json
          trigger_reason: string
        }
        Insert: {
          agent_id: string
          autonomy_level_used?: number
          binding_id?: string | null
          ceiling_capped?: boolean
          completed_at?: string | null
          duration_ms?: number | null
          execution_key: string
          expires_at?: string
          id?: string
          outcome_status?: string
          outcome_summary?: string | null
          rollback_data?: Json | null
          runbook_id: string
          started_at?: string
          steps_executed?: Json
          trigger_evidence_refs?: Json
          trigger_reason: string
        }
        Update: {
          agent_id?: string
          autonomy_level_used?: number
          binding_id?: string | null
          ceiling_capped?: boolean
          completed_at?: string | null
          duration_ms?: number | null
          execution_key?: string
          expires_at?: string
          id?: string
          outcome_status?: string
          outcome_summary?: string | null
          rollback_data?: Json | null
          runbook_id?: string
          started_at?: string
          steps_executed?: Json
          trigger_evidence_refs?: Json
          trigger_reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_runbook_executions_binding_id_fkey"
            columns: ["binding_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_runbook_bindings"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_runtime_state: {
        Row: {
          agent_id: string
          consecutive_failures: number
          cooldown_until: string | null
          created_at: string
          current_run_correlation_id: string | null
          current_status: string
          id: string
          last_error_message: string | null
          last_failure_at: string | null
          last_invocation_id: string | null
          last_run_at: string | null
          last_success_at: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          total_actions_recorded: number
          total_escalations: number
          total_failures: number
          total_runs: number
          total_successes: number
          trust_score: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          consecutive_failures?: number
          cooldown_until?: string | null
          created_at?: string
          current_run_correlation_id?: string | null
          current_status?: string
          id?: string
          last_error_message?: string | null
          last_failure_at?: string | null
          last_invocation_id?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          total_actions_recorded?: number
          total_escalations?: number
          total_failures?: number
          total_runs?: number
          total_successes?: number
          trust_score?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          consecutive_failures?: number
          cooldown_until?: string | null
          created_at?: string
          current_run_correlation_id?: string | null
          current_status?: string
          id?: string
          last_error_message?: string | null
          last_failure_at?: string | null
          last_invocation_id?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          total_actions_recorded?: number
          total_escalations?: number
          total_failures?: number
          total_runs?: number
          total_successes?: number
          trust_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_agent_runtime_state_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "internal_agent_runtime_state_last_invocation_id_fkey"
            columns: ["last_invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_agent_slo_snapshots: {
        Row: {
          action_count: number
          agent_id: string | null
          cost_cents: number
          council: string | null
          created_at: string
          escalation_rate: number
          id: string
          p50_latency_ms: number
          p95_latency_ms: number
          slo_status: string
          success_rate: number
          tenant_id: string | null
          user_id: string
          window_end: string
          window_start: string
        }
        Insert: {
          action_count?: number
          agent_id?: string | null
          cost_cents?: number
          council?: string | null
          created_at?: string
          escalation_rate?: number
          id?: string
          p50_latency_ms?: number
          p95_latency_ms?: number
          slo_status?: string
          success_rate?: number
          tenant_id?: string | null
          user_id: string
          window_end: string
          window_start: string
        }
        Update: {
          action_count?: number
          agent_id?: string | null
          cost_cents?: number
          council?: string | null
          created_at?: string
          escalation_rate?: number
          id?: string
          p50_latency_ms?: number
          p95_latency_ms?: number
          slo_status?: string
          success_rate?: number
          tenant_id?: string | null
          user_id?: string
          window_end?: string
          window_start?: string
        }
        Relationships: []
      }
      internal_agent_tenant_kill_switches: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          active: boolean
          created_at: string
          expires_at: string | null
          id: string
          justification: string
          switch_key: string
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          justification: string
          switch_key: string
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          justification?: string
          switch_key?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_tenant_quotas: {
        Row: {
          consumed_actions_hour: number
          consumed_cents_today: number
          daily_cents_cap: number
          day_window_start: string
          hour_window_start: string
          id: string
          max_actions_per_hour: number
          tenant_id: string
          updated_at: string
          user_id: string
          weekly_cents_cap: number
        }
        Insert: {
          consumed_actions_hour?: number
          consumed_cents_today?: number
          daily_cents_cap?: number
          day_window_start?: string
          hour_window_start?: string
          id?: string
          max_actions_per_hour?: number
          tenant_id: string
          updated_at?: string
          user_id: string
          weekly_cents_cap?: number
        }
        Update: {
          consumed_actions_hour?: number
          consumed_cents_today?: number
          daily_cents_cap?: number
          day_window_start?: string
          hour_window_start?: string
          id?: string
          max_actions_per_hour?: number
          tenant_id?: string
          updated_at?: string
          user_id?: string
          weekly_cents_cap?: number
        }
        Relationships: []
      }
      internal_agent_tenant_scopes: {
        Row: {
          agent_id: string
          created_at: string
          enabled: boolean
          id: string
          notes: string | null
          tenant_id: string
          trust_rung: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          enabled?: boolean
          id?: string
          notes?: string | null
          tenant_id: string
          trust_rung?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          enabled?: boolean
          id?: string
          notes?: string | null
          tenant_id?: string
          trust_rung?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internal_agent_trust_ladder: {
        Row: {
          agent_id: string
          created_at: string
          current_rung: number
          human_approval_required_above_rung: number
          id: string
          last_evaluated_at: string
          previous_rung: number
          promotion_lock_reason: string | null
          promotion_locked: boolean
          reflection_count: number
          rung_reason: string
          trust_score: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          current_rung?: number
          human_approval_required_above_rung?: number
          id?: string
          last_evaluated_at?: string
          previous_rung?: number
          promotion_lock_reason?: string | null
          promotion_locked?: boolean
          reflection_count?: number
          rung_reason?: string
          trust_score?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          current_rung?: number
          human_approval_required_above_rung?: number
          id?: string
          last_evaluated_at?: string
          previous_rung?: number
          promotion_lock_reason?: string | null
          promotion_locked?: boolean
          reflection_count?: number
          rung_reason?: string
          trust_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      internal_agent_weekly_digests: {
        Row: {
          created_at: string
          delivery_state: string
          escalations: Json
          evidence_refs: Json
          generated_by: string
          highlights: Json
          id: string
          period_end: string
          period_start: string
          summary_markdown: string
          top_cost_anomalies: Json
          top_incidents: Json
          top_suggestions: Json
          trust_changes: Json
        }
        Insert: {
          created_at?: string
          delivery_state?: string
          escalations?: Json
          evidence_refs?: Json
          generated_by?: string
          highlights?: Json
          id?: string
          period_end: string
          period_start: string
          summary_markdown?: string
          top_cost_anomalies?: Json
          top_incidents?: Json
          top_suggestions?: Json
          trust_changes?: Json
        }
        Update: {
          created_at?: string
          delivery_state?: string
          escalations?: Json
          evidence_refs?: Json
          generated_by?: string
          highlights?: Json
          id?: string
          period_end?: string
          period_start?: string
          summary_markdown?: string
          top_cost_anomalies?: Json
          top_incidents?: Json
          top_suggestions?: Json
          trust_changes?: Json
        }
        Relationships: []
      }
      investment_theses: {
        Row: {
          conviction: number
          created_at: string
          horizon: string | null
          id: string
          invalidated_at: string | null
          metadata: Json
          org_id: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          user_id: string
          validated_at: string | null
        }
        Insert: {
          conviction?: number
          created_at?: string
          horizon?: string | null
          id?: string
          invalidated_at?: string | null
          metadata?: Json
          org_id?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
          validated_at?: string | null
        }
        Update: {
          conviction?: number
          created_at?: string
          horizon?: string | null
          id?: string
          invalidated_at?: string | null
          metadata?: Json
          org_id?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          validated_at?: string | null
        }
        Relationships: []
      }
      investor_requests: {
        Row: {
          contact_name: string
          contact_role: string | null
          created_at: string
          email: string
          fund_name: string
          id: string
          jurisdiction: string | null
          notes: string | null
          stage_interest: string | null
          status: string
          ticket_band: string
          updated_at: string
        }
        Insert: {
          contact_name: string
          contact_role?: string | null
          created_at?: string
          email: string
          fund_name: string
          id?: string
          jurisdiction?: string | null
          notes?: string | null
          stage_interest?: string | null
          status?: string
          ticket_band: string
          updated_at?: string
        }
        Update: {
          contact_name?: string
          contact_role?: string | null
          created_at?: string
          email?: string
          fund_name?: string
          id?: string
          jurisdiction?: string | null
          notes?: string | null
          stage_interest?: string | null
          status?: string
          ticket_band?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_id: string | null
          due_at: string | null
          id: string
          invoice_number: string | null
          issued_at: string | null
          line_items: Json
          metadata: Json
          org_id: string | null
          paid_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          due_at?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          line_items?: Json
          metadata?: Json
          org_id?: string | null
          paid_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          due_at?: string | null
          id?: string
          invoice_number?: string | null
          issued_at?: string | null
          line_items?: Json
          metadata?: Json
          org_id?: string | null
          paid_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_executions: {
        Row: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          error_message: string | null
          id: string
          job_id: string
          mode: string
          output: Json | null
          policy_decision: string
          retries: number
          retryable: boolean
          started_at: string
          status: string
          triggered_by: string
          user_id: string
          workflow_run_id: string | null
        }
        Insert: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          error_message?: string | null
          id?: string
          job_id: string
          mode?: string
          output?: Json | null
          policy_decision?: string
          retries?: number
          retryable?: boolean
          started_at?: string
          status?: string
          triggered_by?: string
          user_id: string
          workflow_run_id?: string | null
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          error_message?: string | null
          id?: string
          job_id?: string
          mode?: string
          output?: Json | null
          policy_decision?: string
          retries?: number
          retryable?: boolean
          started_at?: string
          status?: string
          triggered_by?: string
          user_id?: string
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_executions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scheduled_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_executions_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      kill_switch_approvals: {
        Row: {
          approver_user_id: string | null
          created_at: string
          decided_at: string | null
          expires_at: string
          id: string
          initiated_by: string
          intended_action: string
          metadata: Json
          reason: string
          status: string
          switch_id: string
          updated_at: string
        }
        Insert: {
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          expires_at?: string
          id?: string
          initiated_by: string
          intended_action: string
          metadata?: Json
          reason: string
          status?: string
          switch_id: string
          updated_at?: string
        }
        Update: {
          approver_user_id?: string | null
          created_at?: string
          decided_at?: string | null
          expires_at?: string
          id?: string
          initiated_by?: string
          intended_action?: string
          metadata?: Json
          reason?: string
          status?: string
          switch_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      kill_switch_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          id: string
          metadata: Json
          reason: string | null
          runbook_id: string | null
          switch_id: string
          switch_row_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
          runbook_id?: string | null
          switch_id: string
          switch_row_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
          runbook_id?: string | null
          switch_id?: string
          switch_row_id?: string | null
        }
        Relationships: []
      }
      kill_switch_drill_results: {
        Row: {
          completed_at: string | null
          created_at: string | null
          drill_type: string
          failure_notes: string | null
          id: string
          operator_id: string | null
          rollback_verified: boolean | null
          started_at: string
          success: boolean | null
          switch_id: string
          time_to_disable_ms: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          drill_type: string
          failure_notes?: string | null
          id?: string
          operator_id?: string | null
          rollback_verified?: boolean | null
          started_at?: string
          success?: boolean | null
          switch_id: string
          time_to_disable_ms?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          drill_type?: string
          failure_notes?: string | null
          id?: string
          operator_id?: string | null
          rollback_verified?: boolean | null
          started_at?: string
          success?: boolean | null
          switch_id?: string
          time_to_disable_ms?: number | null
        }
        Relationships: []
      }
      kill_switch_recommendations: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          approval_id: string | null
          blast_radius: string
          created_at: string
          evidence: Json
          id: string
          reason: string
          recommended_action: string
          severity: string
          source_agent_id: string
          source_finding_id: string | null
          status: string
          switch_id: string
          updated_at: string
          urgency: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          approval_id?: string | null
          blast_radius?: string
          created_at?: string
          evidence?: Json
          id?: string
          reason: string
          recommended_action?: string
          severity?: string
          source_agent_id: string
          source_finding_id?: string | null
          status?: string
          switch_id: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          approval_id?: string | null
          blast_radius?: string
          created_at?: string
          evidence?: Json
          id?: string
          reason?: string
          recommended_action?: string
          severity?: string
          source_agent_id?: string
          source_finding_id?: string | null
          status?: string
          switch_id?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "kill_switch_recommendations_approval_id_fkey"
            columns: ["approval_id"]
            isOneToOne: false
            referencedRelation: "kill_switch_approvals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kill_switch_recommendations_source_finding_id_fkey"
            columns: ["source_finding_id"]
            isOneToOne: false
            referencedRelation: "security_council_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      kill_switch_ttl_expiry_receipts: {
        Row: {
          created_at: string
          expired_at: string
          expired_by_actor: string
          id: string
          prior_state: Json
          switch_id: string
          switch_row_id: string | null
        }
        Insert: {
          created_at?: string
          expired_at?: string
          expired_by_actor?: string
          id?: string
          prior_state?: Json
          switch_id: string
          switch_row_id?: string | null
        }
        Update: {
          created_at?: string
          expired_at?: string
          expired_by_actor?: string
          id?: string
          prior_state?: Json
          switch_id?: string
          switch_row_id?: string | null
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
      license_activations: {
        Row: {
          activated_at: string
          created_at: string
          device_fingerprint: string
          device_name: string | null
          id: string
          is_active: boolean
          last_heartbeat: string
          license_id: string
          platform: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_heartbeat?: string
          license_id: string
          platform?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          id?: string
          is_active?: boolean
          last_heartbeat?: string
          license_id?: string
          platform?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_activations_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      license_audit_log: {
        Row: {
          created_at: string
          details: Json | null
          device_fingerprint: string | null
          event: string
          id: string
          ip_address: string | null
          license_id: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event: string
          id?: string
          ip_address?: string | null
          license_id: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          device_fingerprint?: string | null
          event?: string
          id?: string
          ip_address?: string | null
          license_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "license_audit_log_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          issued_at: string
          key_signature: string | null
          license_key: string
          max_devices: number
          product_tier: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          key_signature?: string | null
          license_key: string
          max_devices?: number
          product_tier?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          issued_at?: string
          key_signature?: string | null
          license_key?: string
          max_devices?: number
          product_tier?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_items: {
        Row: {
          asset: string
          cadence: string | null
          created_at: string
          id: string
          metadata: Json
          next_due: string | null
          provider_id: string | null
          status: string
          task: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset: string
          cadence?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          next_due?: string | null
          provider_id?: string | null
          status?: string
          task: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset?: string
          cadence?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          next_due?: string | null
          provider_id?: string | null
          status?: string
          task?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      mobile_deferral_attestations: {
        Row: {
          archive_path: string
          attested_at: string
          attested_by: string
          created_at: string
          evidence_hash: string
          id: string
          metadata: Json
          notes: string | null
          posture: string
          signature: string
        }
        Insert: {
          archive_path?: string
          attested_at?: string
          attested_by: string
          created_at?: string
          evidence_hash: string
          id?: string
          metadata?: Json
          notes?: string | null
          posture?: string
          signature: string
        }
        Update: {
          archive_path?: string
          attested_at?: string
          attested_by?: string
          created_at?: string
          evidence_hash?: string
          id?: string
          metadata?: Json
          notes?: string | null
          posture?: string
          signature?: string
        }
        Relationships: []
      }
      mobile_push_tokens: {
        Row: {
          app_version: string | null
          created_at: string
          device_id: string | null
          expires_at: string | null
          id: string
          last_seen_at: string
          metadata: Json | null
          os: string
          rotated_from: string | null
          status: string
          token: string
          transport: string
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          expires_at?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json | null
          os: string
          rotated_from?: string | null
          status?: string
          token: string
          transport: string
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          created_at?: string
          device_id?: string | null
          expires_at?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json | null
          os?: string
          rotated_from?: string | null
          status?: string
          token?: string
          transport?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mobile_push_tokens_rotated_from_fkey"
            columns: ["rotated_from"]
            isOneToOne: false
            referencedRelation: "mobile_push_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_deliveries: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          delivered_at: string | null
          endpoint_ref: string | null
          error_code: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          last_attempt_at: string | null
          metadata: Json
          notification_id: string
          provider_response: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          delivered_at?: string | null
          endpoint_ref?: string | null
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json
          notification_id: string
          provider_response?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          delivered_at?: string | null
          endpoint_ref?: string | null
          error_code?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          last_attempt_at?: string | null
          metadata?: Json
          notification_id?: string
          provider_response?: Json
          status?: string
          updated_at?: string
          user_id?: string
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
          expires_at: string | null
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
          expires_at?: string | null
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
          expires_at?: string | null
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
      oauth_refresh_probe_results: {
        Row: {
          account_id: string | null
          alert_state: string
          created_at: string
          duration_ms: number | null
          evidence: Json
          failure_class: string | null
          failure_reason: string | null
          id: string
          lifecycle_state: string
          next_probe_due_at: string | null
          probe_finished_at: string | null
          probe_id: string
          probe_started_at: string
          provider: string
          reauth_required: boolean
          retry_count: number
          status: string
          token_row_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          alert_state?: string
          created_at?: string
          duration_ms?: number | null
          evidence?: Json
          failure_class?: string | null
          failure_reason?: string | null
          id?: string
          lifecycle_state?: string
          next_probe_due_at?: string | null
          probe_finished_at?: string | null
          probe_id: string
          probe_started_at?: string
          provider: string
          reauth_required?: boolean
          retry_count?: number
          status?: string
          token_row_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          alert_state?: string
          created_at?: string
          duration_ms?: number | null
          evidence?: Json
          failure_class?: string | null
          failure_reason?: string | null
          id?: string
          lifecycle_state?: string
          next_probe_due_at?: string | null
          probe_finished_at?: string | null
          probe_id?: string
          probe_started_at?: string
          provider?: string
          reauth_required?: boolean
          retry_count?: number
          status?: string
          token_row_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      observability_metrics: {
        Row: {
          created_at: string
          dimension: Json
          expires_at: string
          id: string
          metadata: Json
          metric_key: string
          observed_at: string
          scope: string
          scope_ref: string | null
          source: string
          unit: string | null
          user_id: string | null
          value: number
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          created_at?: string
          dimension?: Json
          expires_at?: string
          id?: string
          metadata?: Json
          metric_key: string
          observed_at?: string
          scope?: string
          scope_ref?: string | null
          source?: string
          unit?: string | null
          user_id?: string | null
          value: number
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          created_at?: string
          dimension?: Json
          expires_at?: string
          id?: string
          metadata?: Json
          metric_key?: string
          observed_at?: string
          scope?: string
          scope_ref?: string | null
          source?: string
          unit?: string | null
          user_id?: string | null
          value?: number
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: []
      }
      onboarding_branch_events: {
        Row: {
          branch_path: string
          created_at: string
          event_type: string
          id: string
          occurred_at: string
          payload: Json
          screen_index: number
          screen_key: string
          user_id: string
        }
        Insert: {
          branch_path?: string
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          screen_index: number
          screen_key: string
          user_id: string
        }
        Update: {
          branch_path?: string
          created_at?: string
          event_type?: string
          id?: string
          occurred_at?: string
          payload?: Json
          screen_index?: number
          screen_key?: string
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
      onboarding_resume_checkpoints: {
        Row: {
          branch: string
          conditional_state: Json
          created_at: string
          current_screen: number
          expires_at: string
          id: string
          last_completed_screen: number | null
          profile_snapshot: Json
          resume_token: string
          session_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          branch: string
          conditional_state?: Json
          created_at?: string
          current_screen: number
          expires_at?: string
          id?: string
          last_completed_screen?: number | null
          profile_snapshot?: Json
          resume_token?: string
          session_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          branch?: string
          conditional_state?: Json
          created_at?: string
          current_screen?: number
          expires_at?: string
          id?: string
          last_completed_screen?: number | null
          profile_snapshot?: Json
          resume_token?: string
          session_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      operator_drill_executions: {
        Row: {
          confirm_pass: boolean
          created_at: string
          detect_pass: boolean
          drill_id: string
          evidence_pass: boolean
          executed_at: string
          friction_notes: string | null
          id: string
          kill_switch_id: string | null
          kill_switch_pass: boolean
          mttd_seconds: number | null
          mttr_seconds: number | null
          operator_id: string | null
          operator_label: string | null
          overall_pass: boolean
          rollback_pass: boolean
          runbook_id: string | null
          scenario: string
          scenario_category: string
          select_runbook_pass: boolean
          signoff_at: string | null
          updated_at: string
        }
        Insert: {
          confirm_pass?: boolean
          created_at?: string
          detect_pass?: boolean
          drill_id: string
          evidence_pass?: boolean
          executed_at?: string
          friction_notes?: string | null
          id?: string
          kill_switch_id?: string | null
          kill_switch_pass?: boolean
          mttd_seconds?: number | null
          mttr_seconds?: number | null
          operator_id?: string | null
          operator_label?: string | null
          overall_pass?: boolean
          rollback_pass?: boolean
          runbook_id?: string | null
          scenario: string
          scenario_category?: string
          select_runbook_pass?: boolean
          signoff_at?: string | null
          updated_at?: string
        }
        Update: {
          confirm_pass?: boolean
          created_at?: string
          detect_pass?: boolean
          drill_id?: string
          evidence_pass?: boolean
          executed_at?: string
          friction_notes?: string | null
          id?: string
          kill_switch_id?: string | null
          kill_switch_pass?: boolean
          mttd_seconds?: number | null
          mttr_seconds?: number | null
          operator_id?: string | null
          operator_label?: string | null
          overall_pass?: boolean
          rollback_pass?: boolean
          runbook_id?: string | null
          scenario?: string
          scenario_category?: string
          select_runbook_pass?: boolean
          signoff_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
      owner_copilot_briefings: {
        Row: {
          body: string
          confidence: number
          created_at: string
          evidence: Json
          id: string
          source_kind: string
          source_ref: string | null
          status: string
          summary: string
          tenant_id: string | null
          tenant_owner_id: string
          topic: string
          updated_at: string
        }
        Insert: {
          body: string
          confidence?: number
          created_at?: string
          evidence?: Json
          id?: string
          source_kind?: string
          source_ref?: string | null
          status?: string
          summary: string
          tenant_id?: string | null
          tenant_owner_id: string
          topic: string
          updated_at?: string
        }
        Update: {
          body?: string
          confidence?: number
          created_at?: string
          evidence?: Json
          id?: string
          source_kind?: string
          source_ref?: string | null
          status?: string
          summary?: string
          tenant_id?: string | null
          tenant_owner_id?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      owner_copilot_handoffs: {
        Row: {
          briefing_id: string
          created_at: string
          decision: string
          id: string
          rationale: string | null
          tenant_owner_id: string
        }
        Insert: {
          briefing_id: string
          created_at?: string
          decision: string
          id?: string
          rationale?: string | null
          tenant_owner_id: string
        }
        Update: {
          briefing_id?: string
          created_at?: string
          decision?: string
          id?: string
          rationale?: string | null
          tenant_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_copilot_handoffs_briefing_id_fkey"
            columns: ["briefing_id"]
            isOneToOne: false
            referencedRelation: "owner_copilot_briefings"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_copilot_sessions: {
        Row: {
          copilot_kind: string
          created_at: string
          evidence: Json
          id: string
          prompt_count: number
          read_only_verified: boolean
          session_ended_at: string | null
          session_started_at: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          copilot_kind?: string
          created_at?: string
          evidence?: Json
          id?: string
          prompt_count?: number
          read_only_verified?: boolean
          session_ended_at?: string | null
          session_started_at?: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          copilot_kind?: string
          created_at?: string
          evidence?: Json
          id?: string
          prompt_count?: number
          read_only_verified?: boolean
          session_ended_at?: string | null
          session_started_at?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pb_chats: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          last_message_at: string
          message_count: number
          mode: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          message_count?: number
          mode?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          last_message_at?: string
          message_count?: number
          mode?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pb_chats_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "pb_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_digests: {
        Row: {
          created_at: string
          generated_by_model: string | null
          highlights: Json
          id: string
          period: string
          period_end: string
          period_start: string
          source_counts: Json
          status: string
          summary: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_by_model?: string | null
          highlights?: Json
          id?: string
          period?: string
          period_end: string
          period_start: string
          source_counts?: Json
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_by_model?: string | null
          highlights?: Json
          id?: string
          period?: string
          period_end?: string
          period_start?: string
          source_counts?: Json
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pb_files: {
        Row: {
          created_at: string
          filename: string
          id: string
          indexed_at: string | null
          mime_type: string | null
          scope: string
          size_bytes: number | null
          storage_path: string
          summary: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          filename: string
          id?: string
          indexed_at?: string | null
          mime_type?: string | null
          scope?: string
          size_bytes?: number | null
          storage_path: string
          summary?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          filename?: string
          id?: string
          indexed_at?: string | null
          mime_type?: string | null
          scope?: string
          size_bytes?: number | null
          storage_path?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pb_files_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "pb_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_goals: {
        Row: {
          created_at: string
          description: string | null
          horizon_days: number
          id: string
          kind: string
          progress_pct: number
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          horizon_days?: number
          id?: string
          kind?: string
          progress_pct?: number
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          horizon_days?: number
          id?: string
          kind?: string
          progress_pct?: number
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pb_insights_signals: {
        Row: {
          body: string
          confidence: number
          created_at: string
          id: string
          kind: string
          source_refs: Json
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          confidence?: number
          created_at?: string
          id?: string
          kind?: string
          source_refs?: Json
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          confidence?: number
          created_at?: string
          id?: string
          kind?: string
          source_refs?: Json
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pb_memories: {
        Row: {
          category: string
          confidence: number
          content: string
          created_at: string
          decay_at: string | null
          id: string
          kind: string
          metadata: Json
          source_chat_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          confidence?: number
          content: string
          created_at?: string
          decay_at?: string | null
          id?: string
          kind?: string
          metadata?: Json
          source_chat_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          confidence?: number
          content?: string
          created_at?: string
          decay_at?: string | null
          id?: string
          kind?: string
          metadata?: Json
          source_chat_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pb_memories_source_chat_id_fkey"
            columns: ["source_chat_id"]
            isOneToOne: false
            referencedRelation: "pb_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string
          id: string
          role: string
          sources: Json
          tokens: number | null
          user_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string
          id?: string
          role: string
          sources?: Json
          tokens?: number | null
          user_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json
          tokens?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pb_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "pb_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_profile: {
        Row: {
          coaching_style: string
          context_sources: Json
          created_at: string
          depth: string
          display_name: string | null
          format_pref: string
          id: string
          language: string
          life_context: string | null
          mode_overrides: Json
          onboarded_at: string | null
          personalization_depth: string
          role: string | null
          timezone: string
          tone: string
          updated_at: string
          use_cases: Json
          user_id: string
          work_mode: string
        }
        Insert: {
          coaching_style?: string
          context_sources?: Json
          created_at?: string
          depth?: string
          display_name?: string | null
          format_pref?: string
          id?: string
          language?: string
          life_context?: string | null
          mode_overrides?: Json
          onboarded_at?: string | null
          personalization_depth?: string
          role?: string | null
          timezone?: string
          tone?: string
          updated_at?: string
          use_cases?: Json
          user_id: string
          work_mode?: string
        }
        Update: {
          coaching_style?: string
          context_sources?: Json
          created_at?: string
          depth?: string
          display_name?: string | null
          format_pref?: string
          id?: string
          language?: string
          life_context?: string | null
          mode_overrides?: Json
          onboarded_at?: string | null
          personalization_depth?: string
          role?: string | null
          timezone?: string
          tone?: string
          updated_at?: string
          use_cases?: Json
          user_id?: string
          work_mode?: string
        }
        Relationships: []
      }
      pb_security_events: {
        Row: {
          created_at: string
          detail: Json
          event_type: string
          id: string
          ip_address: string | null
          severity: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: Json
          event_type: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: Json
          event_type?: string
          id?: string
          ip_address?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pb_security_prefs: {
        Row: {
          autolearn_enabled: boolean
          autolearn_threshold: number
          created_at: string
          id: string
          learn_from_chats: boolean
          learn_from_files: boolean
          retention_days: number
          sensitive_mode: boolean
          updated_at: string
          user_id: string
          voice_transcript_retention: string
        }
        Insert: {
          autolearn_enabled?: boolean
          autolearn_threshold?: number
          created_at?: string
          id?: string
          learn_from_chats?: boolean
          learn_from_files?: boolean
          retention_days?: number
          sensitive_mode?: boolean
          updated_at?: string
          user_id: string
          voice_transcript_retention?: string
        }
        Update: {
          autolearn_enabled?: boolean
          autolearn_threshold?: number
          created_at?: string
          id?: string
          learn_from_chats?: boolean
          learn_from_files?: boolean
          retention_days?: number
          sensitive_mode?: boolean
          updated_at?: string
          user_id?: string
          voice_transcript_retention?: string
        }
        Relationships: []
      }
      pb_tools: {
        Row: {
          config: Json
          created_at: string
          description: string
          display_name: string
          enabled: boolean
          id: string
          kind: string
          last_used_at: string | null
          tool_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          created_at?: string
          description?: string
          display_name: string
          enabled?: boolean
          id?: string
          kind?: string
          last_used_at?: string | null
          tool_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          description?: string
          display_name?: string
          enabled?: boolean
          id?: string
          kind?: string
          last_used_at?: string | null
          tool_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pb_voice_prefs: {
        Row: {
          autoread: boolean
          created_at: string
          id: string
          input_mode: string
          pitch: number
          rate: number
          transcript_retention: string
          updated_at: string
          use_cloud_stt: boolean
          user_id: string
          voice_id: string
        }
        Insert: {
          autoread?: boolean
          created_at?: string
          id?: string
          input_mode?: string
          pitch?: number
          rate?: number
          transcript_retention?: string
          updated_at?: string
          use_cloud_stt?: boolean
          user_id: string
          voice_id?: string
        }
        Update: {
          autoread?: boolean
          created_at?: string
          id?: string
          input_mode?: string
          pitch?: number
          rate?: number
          transcript_retention?: string
          updated_at?: string
          use_cloud_stt?: boolean
          user_id?: string
          voice_id?: string
        }
        Relationships: []
      }
      pb_workspace_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invite_token: string
          invited_by: string
          member_email: string
          member_user_id: string | null
          role: string
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_token?: string
          invited_by: string
          member_email: string
          member_user_id?: string | null
          role?: string
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          member_email?: string
          member_user_id?: string | null
          role?: string
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pb_workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "pb_workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      pb_workspaces: {
        Row: {
          archived_at: string | null
          color: string
          created_at: string
          custom_instructions: string | null
          default_mode: string
          id: string
          kind: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          color?: string
          created_at?: string
          custom_instructions?: string | null
          default_mode?: string
          id?: string
          kind?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          color?: string
          created_at?: string
          custom_instructions?: string | null
          default_mode?: string
          id?: string
          kind?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      policies: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          domain: string
          effective_from: string
          effective_until: string | null
          evaluation_mode: string
          id: string
          is_active: boolean
          metadata: Json
          parameters: Json
          policy_key: string
          rule_logic: Json
          scope: string
          updated_at: string
          user_id: string | null
          version: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          domain?: string
          effective_from?: string
          effective_until?: string | null
          evaluation_mode?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          parameters?: Json
          policy_key: string
          rule_logic?: Json
          scope?: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          domain?: string
          effective_from?: string
          effective_until?: string | null
          evaluation_mode?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          parameters?: Json
          policy_key?: string
          rule_logic?: Json
          scope?: string
          updated_at?: string
          user_id?: string | null
          version?: number
        }
        Relationships: []
      }
      policy_as_code_rules: {
        Row: {
          bound_controls: Json
          created_at: string
          description: string | null
          display_name: string
          enforcement: string
          id: string
          rule_body: string
          rule_format: string
          rule_key: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          bound_controls?: Json
          created_at?: string
          description?: string | null
          display_name: string
          enforcement?: string
          id?: string
          rule_body: string
          rule_format?: string
          rule_key: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          bound_controls?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          enforcement?: string
          id?: string
          rule_body?: string
          rule_format?: string
          rule_key?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          base_currency: string
          created_at: string
          id: string
          metadata: Json
          name: string
          org_id: string | null
          status: string
          total_value_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          base_currency?: string
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          status?: string
          total_value_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          base_currency?: string
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          status?: string
          total_value_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portrait_load_failures: {
        Row: {
          advisor_id: string | null
          created_at: string
          domain: string
          error_type: string
          id: string
          retry_count: number
          status_code: number | null
          url: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          advisor_id?: string | null
          created_at?: string
          domain: string
          error_type?: string
          id?: string
          retry_count?: number
          status_code?: number | null
          url: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          advisor_id?: string | null
          created_at?: string
          domain?: string
          error_type?: string
          id?: string
          retry_count?: number
          status_code?: number | null
          url?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      positions: {
        Row: {
          closed_at: string | null
          created_at: string
          entry_price_cents: number
          id: string
          metadata: Json
          opened_at: string
          org_id: string | null
          portfolio_id: string | null
          quantity: number
          side: string
          status: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          entry_price_cents?: number
          id?: string
          metadata?: Json
          opened_at?: string
          org_id?: string | null
          portfolio_id?: string | null
          quantity?: number
          side?: string
          status?: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          entry_price_cents?: number
          id?: string
          metadata?: Json
          opened_at?: string
          org_id?: string | null
          portfolio_id?: string | null
          quantity?: number
          side?: string
          status?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      press_inquiries: {
        Row: {
          beat: string | null
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          outlet: string
          status: string
          updated_at: string
        }
        Insert: {
          beat?: string | null
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          outlet: string
          status?: string
          updated_at?: string
        }
        Update: {
          beat?: string | null
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          outlet?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      production_launch_attestations: {
        Row: {
          attested_at: string
          attested_by: string
          created_at: string
          evidence: Json
          evidence_hash: string
          id: string
          launch_posture: string
          release_tag: string | null
          signature: string
          surface_key: string
        }
        Insert: {
          attested_at?: string
          attested_by: string
          created_at?: string
          evidence?: Json
          evidence_hash: string
          id?: string
          launch_posture: string
          release_tag?: string | null
          signature: string
          surface_key: string
        }
        Update: {
          attested_at?: string
          attested_by?: string
          created_at?: string
          evidence?: Json
          evidence_hash?: string
          id?: string
          launch_posture?: string
          release_tag?: string | null
          signature?: string
          surface_key?: string
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
      proposals: {
        Row: {
          content: Json
          created_at: string
          customer_id: string | null
          decided_at: string | null
          id: string
          metadata: Json
          org_id: string | null
          scope: string | null
          sent_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          customer_id?: string | null
          decided_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          scope?: string | null
          sent_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          customer_id?: string | null
          decided_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          scope?: string | null
          sent_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      providers: {
        Row: {
          category: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
          notes: string | null
          rating: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          notes?: string | null
          rating?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          notes?: string | null
          rating?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      publisher_keys: {
        Row: {
          algorithm: string
          created_at: string
          id: string
          key_id: string
          public_key: string
          publisher_id: string
          revoked_at: string | null
        }
        Insert: {
          algorithm?: string
          created_at?: string
          id?: string
          key_id: string
          public_key: string
          publisher_id: string
          revoked_at?: string | null
        }
        Update: {
          algorithm?: string
          created_at?: string
          id?: string
          key_id?: string
          public_key?: string
          publisher_id?: string
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publisher_keys_publisher_id_fkey"
            columns: ["publisher_id"]
            isOneToOne: false
            referencedRelation: "publishers"
            referencedColumns: ["id"]
          },
        ]
      }
      publishers: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          owner_user_id: string | null
          slug: string
          support_email: string | null
          trust_tier: string
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          owner_user_id?: string | null
          slug: string
          support_email?: string | null
          trust_tier?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          owner_user_id?: string | null
          slug?: string
          support_email?: string | null
          trust_tier?: string
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          customer_id: string | null
          expires_at: string | null
          id: string
          line_items: Json
          metadata: Json
          org_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          line_items?: Json
          metadata?: Json
          org_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          line_items?: Json
          metadata?: Json
          org_id?: string | null
          status?: string
          title?: string
          updated_at?: string
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
      receipts: {
        Row: {
          action_key: string
          actor_kind: string
          actor_user_id: string | null
          correlation_id: string | null
          created_at: string
          evidence: Json
          expires_at: string | null
          hash: string | null
          id: string
          outcome: string
          parent_receipt_id: string | null
          payload: Json
          prev_hash: string | null
          receipt_class: string
          signature: string | null
          subject_id: string | null
          subject_type: string
          user_id: string
        }
        Insert: {
          action_key: string
          actor_kind?: string
          actor_user_id?: string | null
          correlation_id?: string | null
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          hash?: string | null
          id?: string
          outcome?: string
          parent_receipt_id?: string | null
          payload?: Json
          prev_hash?: string | null
          receipt_class: string
          signature?: string | null
          subject_id?: string | null
          subject_type: string
          user_id: string
        }
        Update: {
          action_key?: string
          actor_kind?: string
          actor_user_id?: string | null
          correlation_id?: string | null
          created_at?: string
          evidence?: Json
          expires_at?: string | null
          hash?: string | null
          id?: string
          outcome?: string
          parent_receipt_id?: string | null
          payload?: Json
          prev_hash?: string | null
          receipt_class?: string
          signature?: string | null
          subject_id?: string | null
          subject_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_parent_receipt_id_fkey"
            columns: ["parent_receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          amount_cents: number
          collected_at: string | null
          created_at: string
          currency: string
          customer_id: string | null
          due_at: string | null
          id: string
          metadata: Json
          org_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          collected_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          collected_at?: string | null
          created_at?: string
          currency?: string
          customer_id?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          status?: string
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
            foreignKeyName: "recommendation_execution_bindings_approval_queue_item_id_fkey"
            columns: ["approval_queue_item_id"]
            isOneToOne: false
            referencedRelation: "approval_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_execution_bindings_approval_queue_item_id_fkey"
            columns: ["approval_queue_item_id"]
            isOneToOne: false
            referencedRelation: "v_user_pending_approvals"
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
      recovery_boot_evidence: {
        Row: {
          bless_state: string | null
          collected_at: string
          device_id: string
          evidence_hash: string
          failed_units: Json
          id: string
          inserted_at: string
          inserted_by: string | null
          kernel_version: string | null
          recovery_reason: string
          shell_crash_count: number
          signature: string
          slot: string
          tpm_pcr_snapshot: Json
          verity_state: string | null
        }
        Insert: {
          bless_state?: string | null
          collected_at: string
          device_id: string
          evidence_hash: string
          failed_units?: Json
          id?: string
          inserted_at?: string
          inserted_by?: string | null
          kernel_version?: string | null
          recovery_reason: string
          shell_crash_count?: number
          signature: string
          slot: string
          tpm_pcr_snapshot?: Json
          verity_state?: string | null
        }
        Update: {
          bless_state?: string | null
          collected_at?: string
          device_id?: string
          evidence_hash?: string
          failed_units?: Json
          id?: string
          inserted_at?: string
          inserted_by?: string | null
          kernel_version?: string | null
          recovery_reason?: string
          shell_crash_count?: number
          signature?: string
          slot?: string
          tpm_pcr_snapshot?: Json
          verity_state?: string | null
        }
        Relationships: []
      }
      recovery_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          error_stack: string | null
          id: string
          is_dry_run: boolean
          label: string
          parameters: Json | null
          progress: number
          result: Json | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          error_stack?: string | null
          id?: string
          is_dry_run?: boolean
          label: string
          parameters?: Json | null
          progress?: number
          result?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          error_stack?: string | null
          id?: string
          is_dry_run?: boolean
          label?: string
          parameters?: Json | null
          progress?: number
          result?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recovery_snapshots: {
        Row: {
          completed_at: string | null
          created_at: string
          encryption_kind: string
          failed_at: string | null
          failure_reason: string | null
          hash: string | null
          id: string
          metadata: Json
          retention_until: string | null
          scope: string
          scope_ref: string | null
          size_bytes: number | null
          snapshot_key: string
          snapshot_type: string
          started_at: string | null
          status: string
          storage_location: string
          updated_at: string
          user_id: string
          verification_result: Json
          verified_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          encryption_kind?: string
          failed_at?: string | null
          failure_reason?: string | null
          hash?: string | null
          id?: string
          metadata?: Json
          retention_until?: string | null
          scope?: string
          scope_ref?: string | null
          size_bytes?: number | null
          snapshot_key: string
          snapshot_type?: string
          started_at?: string | null
          status?: string
          storage_location: string
          updated_at?: string
          user_id: string
          verification_result?: Json
          verified_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          encryption_kind?: string
          failed_at?: string | null
          failure_reason?: string | null
          hash?: string | null
          id?: string
          metadata?: Json
          retention_until?: string | null
          scope?: string
          scope_ref?: string | null
          size_bytes?: number | null
          snapshot_key?: string
          snapshot_type?: string
          started_at?: string | null
          status?: string
          storage_location?: string
          updated_at?: string
          user_id?: string
          verification_result?: Json
          verified_at?: string | null
        }
        Relationships: []
      }
      region_failover_events: {
        Row: {
          approval_request_id: string | null
          created_at: string
          data_loss_seconds: number | null
          duration_seconds: number | null
          from_region: string
          id: string
          notes: string | null
          staged_payload: Json
          status: string
          to_region: string
          trigger_kind: string
          updated_at: string
        }
        Insert: {
          approval_request_id?: string | null
          created_at?: string
          data_loss_seconds?: number | null
          duration_seconds?: number | null
          from_region: string
          id?: string
          notes?: string | null
          staged_payload?: Json
          status?: string
          to_region: string
          trigger_kind: string
          updated_at?: string
        }
        Update: {
          approval_request_id?: string | null
          created_at?: string
          data_loss_seconds?: number | null
          duration_seconds?: number | null
          from_region?: string
          id?: string
          notes?: string | null
          staged_payload?: Json
          status?: string
          to_region?: string
          trigger_kind?: string
          updated_at?: string
        }
        Relationships: []
      }
      release_artifacts: {
        Row: {
          artifact_key: string
          channel: string
          compatibility: Json
          component: string
          created_at: string
          download_url: string | null
          hash: string
          id: string
          is_yanked: boolean
          metadata: Json
          release_notes: string | null
          signature: string | null
          size_bytes: number | null
          updated_at: string
          version: string
          yanked_reason: string | null
        }
        Insert: {
          artifact_key: string
          channel?: string
          compatibility?: Json
          component: string
          created_at?: string
          download_url?: string | null
          hash: string
          id?: string
          is_yanked?: boolean
          metadata?: Json
          release_notes?: string | null
          signature?: string | null
          size_bytes?: number | null
          updated_at?: string
          version: string
          yanked_reason?: string | null
        }
        Update: {
          artifact_key?: string
          channel?: string
          compatibility?: Json
          component?: string
          created_at?: string
          download_url?: string | null
          hash?: string
          id?: string
          is_yanked?: boolean
          metadata?: Json
          release_notes?: string | null
          signature?: string | null
          size_bytes?: number | null
          updated_at?: string
          version?: string
          yanked_reason?: string | null
        }
        Relationships: []
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
      release_decisions: {
        Row: {
          created_at: string
          decided_at: string
          decided_by: string
          decision: string
          evidence: Json
          gate_name: string
          id: string
          release_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string
          decided_by?: string
          decision: string
          evidence?: Json
          gate_name: string
          id?: string
          release_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string
          decided_by?: string
          decision?: string
          evidence?: Json
          gate_name?: string
          id?: string
          release_id?: string
        }
        Relationships: []
      }
      release_evidence_graph_snapshots: {
        Row: {
          coverage_pct: number
          created_at: string
          edge_count: number
          evidence: Json
          graph_hash: string
          id: string
          manifest_count: number
          node_count: number
          release_tag: string | null
          snapshot_at: string
        }
        Insert: {
          coverage_pct?: number
          created_at?: string
          edge_count?: number
          evidence?: Json
          graph_hash: string
          id?: string
          manifest_count?: number
          node_count?: number
          release_tag?: string | null
          snapshot_at?: string
        }
        Update: {
          coverage_pct?: number
          created_at?: string
          edge_count?: number
          evidence?: Json
          graph_hash?: string
          id?: string
          manifest_count?: number
          node_count?: number
          release_tag?: string | null
          snapshot_at?: string
        }
        Relationships: []
      }
      release_rings: {
        Row: {
          cohort_definition: Json
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          metadata: Json
          promotes_to: string | null
          ring_key: string
          rollout_order: number
          rollout_percent: number
          updated_at: string
        }
        Insert: {
          cohort_definition?: Json
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          metadata?: Json
          promotes_to?: string | null
          ring_key: string
          rollout_order?: number
          rollout_percent?: number
          updated_at?: string
        }
        Update: {
          cohort_definition?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          promotes_to?: string | null
          ring_key?: string
          rollout_order?: number
          rollout_percent?: number
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
      reservations: {
        Row: {
          confirmation_code: string | null
          created_at: string
          id: string
          metadata: Json
          party_size: number | null
          reservation_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          confirmation_code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          party_size?: number | null
          reservation_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          confirmation_code?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          party_size?: number | null
          reservation_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
      reserves: {
        Row: {
          balance_cents: number
          created_at: string
          id: string
          metadata: Json
          name: string
          org_id: string | null
          reserve_type: string | null
          status: string
          target_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          reserve_type?: string | null
          status?: string
          target_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance_cents?: number
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          reserve_type?: string | null
          status?: string
          target_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      responsibilities: {
        Row: {
          area: string | null
          cadence: string | null
          created_at: string
          id: string
          metadata: Json
          next_review: string | null
          owner: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area?: string | null
          cadence?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          next_review?: string | null
          owner?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area?: string | null
          cadence?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          next_review?: string | null
          owner?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      restore_drill_receipts: {
        Row: {
          artifact_path: string | null
          backup_file: string | null
          backup_mode: string | null
          backup_table_count: number
          created_at: string
          critical_route_fail_count: number
          critical_route_pass_count: number
          drill_class: string
          drill_id: string
          duration_ms: number
          environment: string
          errors: Json
          finished_at: string
          id: string
          match_percent: number
          mode: string
          registry_table_count: number
          rls_fail_count: number
          rls_pass_count: number
          runner_identity: string | null
          started_at: string
          status: string
          verification_matrix: Json
          warnings: Json
        }
        Insert: {
          artifact_path?: string | null
          backup_file?: string | null
          backup_mode?: string | null
          backup_table_count?: number
          created_at?: string
          critical_route_fail_count?: number
          critical_route_pass_count?: number
          drill_class?: string
          drill_id: string
          duration_ms: number
          environment?: string
          errors?: Json
          finished_at: string
          id?: string
          match_percent?: number
          mode: string
          registry_table_count?: number
          rls_fail_count?: number
          rls_pass_count?: number
          runner_identity?: string | null
          started_at: string
          status: string
          verification_matrix?: Json
          warnings?: Json
        }
        Update: {
          artifact_path?: string | null
          backup_file?: string | null
          backup_mode?: string | null
          backup_table_count?: number
          created_at?: string
          critical_route_fail_count?: number
          critical_route_pass_count?: number
          drill_class?: string
          drill_id?: string
          duration_ms?: number
          environment?: string
          errors?: Json
          finished_at?: string
          id?: string
          match_percent?: number
          mode?: string
          registry_table_count?: number
          rls_fail_count?: number
          rls_pass_count?: number
          runner_identity?: string | null
          started_at?: string
          status?: string
          verification_matrix?: Json
          warnings?: Json
        }
        Relationships: []
      }
      revenue_leaks: {
        Row: {
          amount_at_risk: number
          created_at: string
          description: string
          detected_at: string
          id: string
          leak_type: string
          resolved_at: string | null
          severity: string
          source: string | null
          stage: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_at_risk?: number
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          leak_type?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          stage?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_at_risk?: number
          created_at?: string
          description?: string
          detected_at?: string
          id?: string
          leak_type?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          stage?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_risk_areas: {
        Row: {
          area_name: string
          created_at: string
          description: string | null
          evidence_refs: Json | null
          id: string
          impact_estimate_cents: number | null
          metadata: Json | null
          mitigation_status: string
          risk_type: string
          severity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          area_name: string
          created_at?: string
          description?: string | null
          evidence_refs?: Json | null
          id?: string
          impact_estimate_cents?: number | null
          metadata?: Json | null
          mitigation_status?: string
          risk_type?: string
          severity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          area_name?: string
          created_at?: string
          description?: string | null
          evidence_refs?: Json | null
          id?: string
          impact_estimate_cents?: number | null
          metadata?: Json | null
          mitigation_status?: string
          risk_type?: string
          severity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      risk_register: {
        Row: {
          category: string
          created_at: string
          id: string
          impact: string
          likelihood: string
          metadata: Json | null
          mitigation_plan: string | null
          owner: string | null
          risk_name: string
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          impact?: string
          likelihood?: string
          metadata?: Json | null
          mitigation_plan?: string | null
          owner?: string | null
          risk_name: string
          severity?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          impact?: string
          likelihood?: string
          metadata?: Json | null
          mitigation_plan?: string | null
          owner?: string | null
          risk_name?: string
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      rollbacks: {
        Row: {
          artifact_id: string | null
          cause: string
          cause_evidence: Json
          completed_at: string | null
          created_at: string
          failed_at: string | null
          from_version: string | null
          id: string
          initiated_by: string
          metadata: Json
          receipt_id: string | null
          started_at: string | null
          status: string
          subject_id: string | null
          subject_type: string
          to_version: string
          updated_at: string
          user_id: string
          verification_result: Json
        }
        Insert: {
          artifact_id?: string | null
          cause: string
          cause_evidence?: Json
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          from_version?: string | null
          id?: string
          initiated_by: string
          metadata?: Json
          receipt_id?: string | null
          started_at?: string | null
          status?: string
          subject_id?: string | null
          subject_type: string
          to_version: string
          updated_at?: string
          user_id: string
          verification_result?: Json
        }
        Update: {
          artifact_id?: string | null
          cause?: string
          cause_evidence?: Json
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          from_version?: string | null
          id?: string
          initiated_by?: string
          metadata?: Json
          receipt_id?: string | null
          started_at?: string | null
          status?: string
          subject_id?: string | null
          subject_type?: string
          to_version?: string
          updated_at?: string
          user_id?: string
          verification_result?: Json
        }
        Relationships: [
          {
            foreignKeyName: "rollbacks_artifact_id_fkey"
            columns: ["artifact_id"]
            isOneToOne: false
            referencedRelation: "release_artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rollbacks_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      runbook_drill_results: {
        Row: {
          created_at: string
          duration_ms: number | null
          executed_at: string
          id: string
          mode: string
          notes: string | null
          passed: boolean
          runbook_id: string
          step_outcomes: Json
          triggered_by: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          executed_at?: string
          id?: string
          mode?: string
          notes?: string | null
          passed?: boolean
          runbook_id: string
          step_outcomes?: Json
          triggered_by?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          executed_at?: string
          id?: string
          mode?: string
          notes?: string | null
          passed?: boolean
          runbook_id?: string
          step_outcomes?: Json
          triggered_by?: string
          user_id?: string | null
        }
        Relationships: []
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
      scenarios: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          name: string
          org_id: string | null
          outputs: Json
          scenario_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          name: string
          org_id?: string | null
          outputs?: Json
          scenario_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          name?: string
          org_id?: string | null
          outputs?: Json
          scenario_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_jobs: {
        Row: {
          consecutive_failures: number
          created_at: string
          cron_expression: string | null
          description: string | null
          display_name: string
          domain: string | null
          enabled: boolean
          fail_count: number
          id: string
          job_class: string
          job_key: string
          kill_switch_class: string | null
          last_run_at: string | null
          last_run_status: string | null
          max_retries: number
          metadata: Json
          name: string | null
          next_run_at: string | null
          payload: Json
          policy_family: string | null
          run_count: number
          schedule_cron: string
          state: string
          target_function: string
          updated_at: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          consecutive_failures?: number
          created_at?: string
          cron_expression?: string | null
          description?: string | null
          display_name: string
          domain?: string | null
          enabled?: boolean
          fail_count?: number
          id?: string
          job_class?: string
          job_key: string
          kill_switch_class?: string | null
          last_run_at?: string | null
          last_run_status?: string | null
          max_retries?: number
          metadata?: Json
          name?: string | null
          next_run_at?: string | null
          payload?: Json
          policy_family?: string | null
          run_count?: number
          schedule_cron: string
          state?: string
          target_function?: string
          updated_at?: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          consecutive_failures?: number
          created_at?: string
          cron_expression?: string | null
          description?: string | null
          display_name?: string
          domain?: string | null
          enabled?: boolean
          fail_count?: number
          id?: string
          job_class?: string
          job_key?: string
          kill_switch_class?: string | null
          last_run_at?: string | null
          last_run_status?: string | null
          max_retries?: number
          metadata?: Json
          name?: string | null
          next_run_at?: string | null
          payload?: Json
          policy_family?: string | null
          run_count?: number
          schedule_cron?: string
          state?: string
          target_function?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_jobs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          location: string | null
          metadata: Json
          start_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json
          start_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          location?: string | null
          metadata?: Json
          start_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
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
      secret_rotation_log: {
        Row: {
          cadence_due_at: string | null
          created_at: string
          dry_run: boolean
          id: string
          result: Json
          rotated_at: string
          rotated_by: string | null
          secret_class: string
          secret_name: string
        }
        Insert: {
          cadence_due_at?: string | null
          created_at?: string
          dry_run?: boolean
          id?: string
          result?: Json
          rotated_at?: string
          rotated_by?: string | null
          secret_class: string
          secret_name: string
        }
        Update: {
          cadence_due_at?: string | null
          created_at?: string
          dry_run?: boolean
          id?: string
          result?: Json
          rotated_at?: string
          rotated_by?: string | null
          secret_class?: string
          secret_name?: string
        }
        Relationships: []
      }
      secret_rotation_triggers: {
        Row: {
          anomaly_evidence: Json
          anomaly_type: string
          created_at: string
          id: string
          orchestrator_dryrun_result: Json
          provider_key: string | null
          receipt_id: string | null
          rotation_executed_at: string | null
          rotation_executed_by: string | null
          secret_scope: string
          severity: string
          source_agent_id: string
          source_finding_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          anomaly_evidence?: Json
          anomaly_type: string
          created_at?: string
          id?: string
          orchestrator_dryrun_result?: Json
          provider_key?: string | null
          receipt_id?: string | null
          rotation_executed_at?: string | null
          rotation_executed_by?: string | null
          secret_scope: string
          severity?: string
          source_agent_id: string
          source_finding_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          anomaly_evidence?: Json
          anomaly_type?: string
          created_at?: string
          id?: string
          orchestrator_dryrun_result?: Json
          provider_key?: string | null
          receipt_id?: string | null
          rotation_executed_at?: string | null
          rotation_executed_by?: string | null
          secret_scope?: string
          severity?: string
          source_agent_id?: string
          source_finding_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secret_rotation_triggers_source_finding_id_fkey"
            columns: ["source_finding_id"]
            isOneToOne: false
            referencedRelation: "security_council_findings"
            referencedColumns: ["id"]
          },
        ]
      }
      security_council_findings: {
        Row: {
          agent_id: string
          council: string
          created_at: string
          evidence: Json
          finding_type: string
          first_seen_at: string
          id: string
          last_seen_at: string
          occurrences: number
          resolution_notes: string | null
          resolved_at: string | null
          routed_suggestion_id: string | null
          severity: string
          source_signal_ref: string
          source_signal_type: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          council?: string
          created_at?: string
          evidence?: Json
          finding_type: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          occurrences?: number
          resolution_notes?: string | null
          resolved_at?: string | null
          routed_suggestion_id?: string | null
          severity?: string
          source_signal_ref: string
          source_signal_type?: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          council?: string
          created_at?: string
          evidence?: Json
          finding_type?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          occurrences?: number
          resolution_notes?: string | null
          resolved_at?: string | null
          routed_suggestion_id?: string | null
          severity?: string
          source_signal_ref?: string
          source_signal_type?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_council_findings_routed_suggestion_id_fkey"
            columns: ["routed_suggestion_id"]
            isOneToOne: false
            referencedRelation: "ai_implementation_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      security_fabric_probe_results: {
        Row: {
          created_at: string
          evidence: Json
          expected: Json
          id: string
          layer_name: string
          observed: Json
          observed_at: string
          probe_id: string
          severity: string
          status: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          expected?: Json
          id?: string
          layer_name: string
          observed?: Json
          observed_at?: string
          probe_id: string
          severity?: string
          status: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          expected?: Json
          id?: string
          layer_name?: string
          observed?: Json
          observed_at?: string
          probe_id?: string
          severity?: string
          status?: string
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
      service_orders: {
        Row: {
          completed_at: string | null
          created_at: string
          customer_id: string | null
          deal_id: string | null
          id: string
          metadata: Json
          org_id: string | null
          scheduled_for: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          deal_id?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          scheduled_for?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          customer_id?: string | null
          deal_id?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          scheduled_for?: string | null
          status?: string
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
      signed_release_artifacts: {
        Row: {
          artifact_kind: string
          artifact_name: string
          attestation: Json
          created_at: string
          id: string
          release_tag: string
          sha256: string
          signature: string
          signed_by: string
          size_bytes: number
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          artifact_kind: string
          artifact_name: string
          attestation?: Json
          created_at?: string
          id?: string
          release_tag: string
          sha256: string
          signature: string
          signed_by?: string
          size_bytes?: number
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          artifact_kind?: string
          artifact_name?: string
          attestation?: Json
          created_at?: string
          id?: string
          release_tag?: string
          sha256?: string
          signature?: string
          signed_by?: string
          size_bytes?: number
          verified?: boolean
          verified_at?: string | null
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
      sinking_funds: {
        Row: {
          contribute_per_period_cents: number | null
          created_at: string
          current_cents: number
          id: string
          metadata: Json
          name: string
          org_id: string | null
          status: string
          target_cents: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contribute_per_period_cents?: number | null
          created_at?: string
          current_cents?: number
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          status?: string
          target_cents?: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contribute_per_period_cents?: number | null
          created_at?: string
          current_cents?: number
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          status?: string
          target_cents?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_agent_plans: {
        Row: {
          approved_at: string | null
          autonomy_tier: number
          completed_at: string | null
          created_at: string
          domain: string
          error: string | null
          expires_at: string
          id: string
          intent: string
          org_id: string | null
          plan: Json
          result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          autonomy_tier?: number
          completed_at?: string | null
          created_at?: string
          domain?: string
          error?: string | null
          expires_at?: string
          id?: string
          intent: string
          org_id?: string | null
          plan?: Json
          result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          autonomy_tier?: number
          completed_at?: string | null
          created_at?: string
          domain?: string
          error?: string | null
          expires_at?: string
          id?: string
          intent?: string
          org_id?: string | null
          plan?: Json
          result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_app_open_log: {
        Row: {
          app_id: string
          context: Json
          expires_at: string
          id: string
          opened_at: string
          user_id: string
        }
        Insert: {
          app_id: string
          context?: Json
          expires_at?: string
          id?: string
          opened_at?: string
          user_id: string
        }
        Update: {
          app_id?: string
          context?: Json
          expires_at?: string
          id?: string
          opened_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_autonomy_preferences: {
        Row: {
          created_at: string
          tiers: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          tiers?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          tiers?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_conflict_resolutions: {
        Row: {
          conflict_kind: string
          created_at: string
          description: string
          evidence: Json
          id: string
          options: Json
          recommended_option: string | null
          resolved_at: string | null
          resolved_option: string | null
          status: string
          user_id: string
        }
        Insert: {
          conflict_kind: string
          created_at?: string
          description: string
          evidence?: Json
          id?: string
          options?: Json
          recommended_option?: string | null
          resolved_at?: string | null
          resolved_option?: string | null
          status?: string
          user_id: string
        }
        Update: {
          conflict_kind?: string
          created_at?: string
          description?: string
          evidence?: Json
          id?: string
          options?: Json
          recommended_option?: string | null
          resolved_at?: string | null
          resolved_option?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_council_votes: {
        Row: {
          advisor_id: string
          created_at: string
          id: string
          plan_id: string
          rationale: string | null
          score: number
          user_id: string
          vote: string
        }
        Insert: {
          advisor_id: string
          created_at?: string
          id?: string
          plan_id: string
          rationale?: string | null
          score?: number
          user_id: string
          vote?: string
        }
        Update: {
          advisor_id?: string
          created_at?: string
          id?: string
          plan_id?: string
          rationale?: string | null
          score?: number
          user_id?: string
          vote?: string
        }
        Relationships: []
      }
      sita_handoff_sessions: {
        Row: {
          accepted_at: string | null
          created_at: string
          expires_at: string
          id: string
          intent: string
          payload: Json
          plan_id: string | null
          source_device: string
          status: string
          target_device: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          intent: string
          payload?: Json
          plan_id?: string | null
          source_device: string
          status?: string
          target_device?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          intent?: string
          payload?: Json
          plan_id?: string | null
          source_device?: string
          status?: string
          target_device?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sita_journal_entries: {
        Row: {
          blockers: Json
          created_at: string
          entry_date: string
          id: string
          lessons: Json
          summary: Json
          user_id: string
          wins: Json
        }
        Insert: {
          blockers?: Json
          created_at?: string
          entry_date?: string
          id?: string
          lessons?: Json
          summary?: Json
          user_id: string
          wins?: Json
        }
        Update: {
          blockers?: Json
          created_at?: string
          entry_date?: string
          id?: string
          lessons?: Json
          summary?: Json
          user_id?: string
          wins?: Json
        }
        Relationships: []
      }
      sita_knowledge_edges: {
        Row: {
          created_at: string
          from_node_id: string
          id: string
          metadata: Json
          relation: string
          to_node_id: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          from_node_id: string
          id?: string
          metadata?: Json
          relation: string
          to_node_id: string
          user_id: string
          weight?: number
        }
        Update: {
          created_at?: string
          from_node_id?: string
          id?: string
          metadata?: Json
          relation?: string
          to_node_id?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "sita_knowledge_edges_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "sita_knowledge_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sita_knowledge_edges_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "sita_knowledge_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      sita_knowledge_nodes: {
        Row: {
          body: string | null
          confidence: number
          created_at: string
          id: string
          kind: string
          label: string
          last_seen_at: string
          metadata: Json
          source: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          confidence?: number
          created_at?: string
          id?: string
          kind: string
          label: string
          last_seen_at?: string
          metadata?: Json
          source?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          confidence?: number
          created_at?: string
          id?: string
          kind?: string
          label?: string
          last_seen_at?: string
          metadata?: Json
          source?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_mission_milestones: {
        Row: {
          created_at: string
          due_at: string | null
          id: string
          mission_id: string
          ordering: number
          plan_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          id?: string
          mission_id: string
          ordering?: number
          plan_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          id?: string
          mission_id?: string
          ordering?: number
          plan_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sita_mission_milestones_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "sita_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      sita_missions: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          id: string
          priority: number
          status: string
          success_criteria: Json
          target_at: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          priority?: number
          status?: string
          success_criteria?: Json
          target_at?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          priority?: number
          status?: string
          success_criteria?: Json
          target_at?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_perception_events: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          payload: Json
          source: string
          ttl_seconds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          payload?: Json
          source: string
          ttl_seconds?: number
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          payload?: Json
          source?: string
          ttl_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
      sita_personality_profiles: {
        Row: {
          created_at: string
          formality: number
          honorific: string | null
          humor: number
          language: string
          metadata: Json
          preferred_pronouns: string | null
          proactivity: number
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
          verbosity: number
          voice_persona: string
        }
        Insert: {
          created_at?: string
          formality?: number
          honorific?: string | null
          humor?: number
          language?: string
          metadata?: Json
          preferred_pronouns?: string | null
          proactivity?: number
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
          verbosity?: number
          voice_persona?: string
        }
        Update: {
          created_at?: string
          formality?: number
          honorific?: string | null
          humor?: number
          language?: string
          metadata?: Json
          preferred_pronouns?: string | null
          proactivity?: number
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
          verbosity?: number
          voice_persona?: string
        }
        Relationships: []
      }
      sita_proactive_briefings: {
        Row: {
          acknowledged_at: string | null
          body: string | null
          created_at: string
          delivered_at: string | null
          evidence: Json
          expires_at: string
          headline: string
          id: string
          kind: string
          priority: number
          scheduled_for: string
          status: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          body?: string | null
          created_at?: string
          delivered_at?: string | null
          evidence?: Json
          expires_at?: string
          headline: string
          id?: string
          kind: string
          priority?: number
          scheduled_for?: string
          status?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          body?: string | null
          created_at?: string
          delivered_at?: string | null
          evidence?: Json
          expires_at?: string
          headline?: string
          id?: string
          kind?: string
          priority?: number
          scheduled_for?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_spatial_events: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          kind: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          kind: string
          payload?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      sita_spatial_layout: {
        Row: {
          layout: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          layout?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          layout?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_world_state: {
        Row: {
          snapshot: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          snapshot?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          snapshot?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      sla_breach_contributing_events: {
        Row: {
          contributing_alert_id: string | null
          contribution_summary: string
          created_at: string
          drill_result_id: string | null
          event_type: string
          id: string
          occurred_at: string
          severity: string
          sla_alert_id: string
          user_id: string
        }
        Insert: {
          contributing_alert_id?: string | null
          contribution_summary?: string
          created_at?: string
          drill_result_id?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          severity?: string
          sla_alert_id: string
          user_id: string
        }
        Update: {
          contributing_alert_id?: string | null
          contribution_summary?: string
          created_at?: string
          drill_result_id?: string | null
          event_type?: string
          id?: string
          occurred_at?: string
          severity?: string
          sla_alert_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_breach_contributing_events_contributing_alert_id_fkey"
            columns: ["contributing_alert_id"]
            isOneToOne: false
            referencedRelation: "alerts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sla_breach_contributing_events_sla_alert_id_fkey"
            columns: ["sla_alert_id"]
            isOneToOne: false
            referencedRelation: "boardroom_followthrough_sla_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_definitions: {
        Row: {
          breach_severity: string
          created_at: string
          enabled: boolean
          id: string
          metric_key: string
          name: string
          target_value: number
          time_window: string
          unit: string
          updated_at: string
        }
        Insert: {
          breach_severity?: string
          created_at?: string
          enabled?: boolean
          id?: string
          metric_key: string
          name: string
          target_value: number
          time_window?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          breach_severity?: string
          created_at?: string
          enabled?: boolean
          id?: string
          metric_key?: string
          name?: string
          target_value?: number
          time_window?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      sla_snapshots: {
        Row: {
          computed_at: string
          created_at: string
          current_value: number
          id: string
          met: boolean
          sla_id: string
          target_value: number
          window_end: string
          window_start: string
        }
        Insert: {
          computed_at?: string
          created_at?: string
          current_value: number
          id?: string
          met?: boolean
          sla_id: string
          target_value: number
          window_end: string
          window_start: string
        }
        Update: {
          computed_at?: string
          created_at?: string
          current_value?: number
          id?: string
          met?: boolean
          sla_id?: string
          target_value?: number
          window_end?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_snapshots_sla_id_fkey"
            columns: ["sla_id"]
            isOneToOne: false
            referencedRelation: "sla_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount_cents: number
          cadence: string
          created_at: string
          currency: string
          id: string
          metadata: Json
          next_charge_at: string | null
          org_id: string | null
          status: string
          updated_at: string
          user_id: string
          vendor: string
        }
        Insert: {
          amount_cents?: number
          cadence?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          next_charge_at?: string | null
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vendor: string
        }
        Update: {
          amount_cents?: number
          cadence?: string
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json
          next_charge_at?: string | null
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      supervisor_decisions: {
        Row: {
          correlation_id: string | null
          created_at: string
          decided_by: string | null
          decision_type: string
          evidence_refs: Json
          executed_at: string
          id: string
          new_state: Json | null
          previous_state: Json | null
          rationale: string
          supervisor_key: string
          target_action_id: string | null
          target_agent_id: string | null
          target_escalation_id: string | null
          updated_at: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          decided_by?: string | null
          decision_type: string
          evidence_refs?: Json
          executed_at?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          rationale?: string
          supervisor_key: string
          target_action_id?: string | null
          target_agent_id?: string | null
          target_escalation_id?: string | null
          updated_at?: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          decided_by?: string | null
          decision_type?: string
          evidence_refs?: Json
          executed_at?: string
          id?: string
          new_state?: Json | null
          previous_state?: Json | null
          rationale?: string
          supervisor_key?: string
          target_action_id?: string | null
          target_agent_id?: string | null
          target_escalation_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_decisions_target_action_id_fkey"
            columns: ["target_action_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_decisions_target_agent_id_fkey"
            columns: ["target_agent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
          {
            foreignKeyName: "supervisor_decisions_target_escalation_id_fkey"
            columns: ["target_escalation_id"]
            isOneToOne: false
            referencedRelation: "council_escalations"
            referencedColumns: ["id"]
          },
        ]
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
      sync_conflicts: {
        Row: {
          conflict_kind: string
          created_at: string
          id: string
          local_payload: Json
          local_version: number | null
          metadata: Json
          namespace: string
          remote_payload: Json
          remote_version: number | null
          resolution_strategy: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolved_payload: Json | null
          status: string
          sync_object_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conflict_kind?: string
          created_at?: string
          id?: string
          local_payload?: Json
          local_version?: number | null
          metadata?: Json
          namespace: string
          remote_payload?: Json
          remote_version?: number | null
          resolution_strategy?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_payload?: Json | null
          status?: string
          sync_object_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conflict_kind?: string
          created_at?: string
          id?: string
          local_payload?: Json
          local_version?: number | null
          metadata?: Json
          namespace?: string
          remote_payload?: Json
          remote_version?: number | null
          resolution_strategy?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolved_payload?: Json | null
          status?: string
          sync_object_id?: string
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
      tenant_dp_epsilon_ledger: {
        Row: {
          capability_key: string
          created_at: string
          epsilon_spent: number
          id: string
          period_start: string
          request_ref: string | null
          user_id: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          epsilon_spent: number
          id?: string
          period_start?: string
          request_ref?: string | null
          user_id: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          epsilon_spent?: number
          id?: string
          period_start?: string
          request_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_federation_optins: {
        Row: {
          created_at: string
          id: string
          opt_in_version: string
          opted_in_at: string
          opted_in_by: string
          revoked_at: string | null
          scope: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opt_in_version: string
          opted_in_at?: string
          opted_in_by: string
          revoked_at?: string | null
          scope?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opt_in_version?: string
          opted_in_at?: string
          opted_in_by?: string
          revoked_at?: string | null
          scope?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_kill_switches: {
        Row: {
          created_at: string
          disabled_at: string | null
          enabled: boolean
          enabled_at: string | null
          id: string
          justification: string | null
          switch_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disabled_at?: string | null
          enabled?: boolean
          enabled_at?: string | null
          id?: string
          justification?: string | null
          switch_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disabled_at?: string | null
          enabled?: boolean
          enabled_at?: string | null
          id?: string
          justification?: string | null
          switch_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_quotas: {
        Row: {
          current_usage: number
          hard_ceiling: number
          id: string
          last_reset_at: string
          quota_key: string
          quota_value: number
          reset_period: string
          tenant_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          current_usage?: number
          hard_ceiling?: number
          id?: string
          last_reset_at?: string
          quota_key: string
          quota_value?: number
          reset_period?: string
          tenant_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          current_usage?: number
          hard_ceiling?: number
          id?: string
          last_reset_at?: string
          quota_key?: string
          quota_value?: number
          reset_period?: string
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      tenant_self_service_actions: {
        Row: {
          action_kind: string
          after_state: Json | null
          before_state: Json | null
          created_at: string
          id: string
          justification: string | null
          receipt_hash: string | null
          status: string
          target_ref: string
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          action_kind: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          justification?: string | null
          receipt_hash?: string | null
          status?: string
          target_ref: string
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          action_kind?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          justification?: string | null
          receipt_hash?: string | null
          status?: string
          target_ref?: string
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      theses: {
        Row: {
          conviction: number
          created_at: string
          id: string
          metadata: Json
          org_id: string | null
          portfolio_id: string | null
          status: string
          summary: string | null
          symbol: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conviction?: number
          created_at?: string
          id?: string
          metadata?: Json
          org_id?: string | null
          portfolio_id?: string | null
          status?: string
          summary?: string | null
          symbol?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conviction?: number
          created_at?: string
          id?: string
          metadata?: Json
          org_id?: string | null
          portfolio_id?: string | null
          status?: string
          summary?: string | null
          symbol?: string | null
          title?: string
          updated_at?: string
          user_id?: string
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
      trace_spans: {
        Row: {
          correlation_id: string | null
          created_at: string
          duration_ms: number
          end_ts: string
          error: string | null
          http_status: number | null
          id: string
          operation: string
          parent_span_id: string | null
          service: string
          span_id: string
          start_ts: string
          status: string
          tags: Json
          trace_id: string
          user_id: string | null
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          duration_ms: number
          end_ts: string
          error?: string | null
          http_status?: number | null
          id?: string
          operation: string
          parent_span_id?: string | null
          service: string
          span_id: string
          start_ts: string
          status?: string
          tags?: Json
          trace_id: string
          user_id?: string | null
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          duration_ms?: number
          end_ts?: string
          error?: string | null
          http_status?: number | null
          id?: string
          operation?: string
          parent_span_id?: string | null
          service?: string
          span_id?: string
          start_ts?: string
          status?: string
          tags?: Json
          trace_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          executed_at: string | null
          id: string
          metadata: Json
          org_id: string | null
          portfolio_id: string | null
          price_cents: number
          quantity: number
          side: string
          status: string
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          portfolio_id?: string | null
          price_cents?: number
          quantity?: number
          side: string
          status?: string
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
          portfolio_id?: string | null
          price_cents?: number
          quantity?: number
          side?: string
          status?: string
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_label: string | null
          amount_cents: number
          category: string | null
          created_at: string
          currency: string
          description: string | null
          direction: string
          id: string
          metadata: Json
          occurred_at: string
          org_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_label?: string | null
          amount_cents?: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          direction?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          org_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_label?: string | null
          amount_cents?: number
          category?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          direction?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          org_id?: string | null
          status?: string
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
      trips: {
        Row: {
          created_at: string
          destination: string | null
          end_date: string | null
          id: string
          itinerary: Json
          metadata: Json
          start_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          end_date?: string | null
          id?: string
          itinerary?: Json
          metadata?: Json
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          end_date?: string | null
          id?: string
          itinerary?: Json
          metadata?: Json
          start_date?: string | null
          status?: string
          title?: string
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
      updates: {
        Row: {
          artifact_id: string | null
          component: string
          created_at: string
          current_version: string | null
          failed_at: string | null
          failure_reason: string | null
          id: string
          install_status: string
          installed_at: string | null
          metadata: Json
          release_notes: string | null
          ring_key: string
          scheduled_at: string | null
          target_version: string
          update_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_id?: string | null
          component: string
          created_at?: string
          current_version?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          install_status?: string
          installed_at?: string | null
          metadata?: Json
          release_notes?: string | null
          ring_key?: string
          scheduled_at?: string | null
          target_version: string
          update_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_id?: string | null
          component?: string
          created_at?: string
          current_version?: string | null
          failed_at?: string | null
          failure_reason?: string | null
          id?: string
          install_status?: string
          installed_at?: string | null
          metadata?: Json
          release_notes?: string | null
          ring_key?: string
          scheduled_at?: string | null
          target_version?: string
          update_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uptime_heartbeats: {
        Row: {
          id: string
          latency_ms: number | null
          metadata: Json
          region: string | null
          source: string
          status: string
          subsystem: string
          ts: string
        }
        Insert: {
          id?: string
          latency_ms?: number | null
          metadata?: Json
          region?: string | null
          source: string
          status: string
          subsystem: string
          ts?: string
        }
        Update: {
          id?: string
          latency_ms?: number | null
          metadata?: Json
          region?: string | null
          source?: string
          status?: string
          subsystem?: string
          ts?: string
        }
        Relationships: []
      }
      user_passkeys: {
        Row: {
          aaguid: string | null
          backup_eligible: boolean
          backup_state: boolean
          created_at: string
          credential_id: string
          device_label: string | null
          id: string
          last_used_at: string | null
          public_key: string
          sign_count: number
          transports: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          aaguid?: string | null
          backup_eligible?: boolean
          backup_state?: boolean
          created_at?: string
          credential_id: string
          device_label?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          sign_count?: number
          transports?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          aaguid?: string | null
          backup_eligible?: boolean
          backup_state?: boolean
          created_at?: string
          credential_id?: string
          device_label?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          sign_count?: number
          transports?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_seed_runs: {
        Row: {
          created_at: string
          error_summary: string | null
          expires_at: string
          id: string
          metadata: Json
          reason: string | null
          rows_count: number
          seed_version: number
          status: string
          tables_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          error_summary?: string | null
          expires_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
          rows_count?: number
          seed_version?: number
          status?: string
          tables_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          error_summary?: string | null
          expires_at?: string
          id?: string
          metadata?: Json
          reason?: string | null
          rows_count?: number
          seed_version?: number
          status?: string
          tables_count?: number
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
      waitlist_signups: {
        Row: {
          confirmed_at: string | null
          created_at: string
          email: string
          id: string
          ip_country: string | null
          position: number
          referral_code: string
          referred_by: string | null
          source: string | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          email: string
          id?: string
          ip_country?: string | null
          position: number
          referral_code: string
          referred_by?: string | null
          source?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          ip_country?: string | null
          position?: number
          referral_code?: string
          referred_by?: string | null
          source?: string | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      watchlists: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          name: string
          org_id: string | null
          status: string
          symbols: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          name: string
          org_id?: string | null
          status?: string
          symbols?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
          org_id?: string | null
          status?: string
          symbols?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webauthn_challenges: {
        Row: {
          ceremony_type: string
          challenge: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          user_id: string
        }
        Insert: {
          ceremony_type: string
          challenge: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          user_id: string
        }
        Update: {
          ceremony_type?: string
          challenge?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_delivery_log: {
        Row: {
          created_at: string
          event_type: string | null
          id: string
          last_error: string | null
          payload: Json | null
          retry_count: number
          source: string | null
          status: string
          target_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_type?: string | null
          id?: string
          last_error?: string | null
          payload?: Json | null
          retry_count?: number
          source?: string | null
          status?: string
          target_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_type?: string | null
          id?: string
          last_error?: string | null
          payload?: Json | null
          retry_count?: number
          source?: string | null
          status?: string
          target_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          dead_letter: boolean
          event_type: string | null
          external_id: string | null
          id: string
          last_error: string | null
          payload: Json
          processed_at: string | null
          provider: string
          received_at: string
          retry_count: number
          signature: string | null
          signature_valid: boolean | null
          status: string
        }
        Insert: {
          created_at?: string
          dead_letter?: boolean
          event_type?: string | null
          external_id?: string | null
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          provider: string
          received_at?: string
          retry_count?: number
          signature?: string | null
          signature_valid?: boolean | null
          status?: string
        }
        Update: {
          created_at?: string
          dead_letter?: boolean
          event_type?: string | null
          external_id?: string | null
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: string
          received_at?: string
          retry_count?: number
          signature?: string | null
          signature_valid?: boolean | null
          status?: string
        }
        Relationships: []
      }
      webhook_retry_queue: {
        Row: {
          attempt_count: number
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          payload: Json
          status: string
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload?: Json
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          payload?: Json
          status?: string
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflow_receipts: {
        Row: {
          action: string
          created_at: string
          evidence: Json
          hash: string
          id: string
          run_id: string
          step_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          evidence?: Json
          hash: string
          id?: string
          run_id: string
          step_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          evidence?: Json
          hash?: string
          id?: string
          run_id?: string
          step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_receipts_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_receipts_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          context: Json
          correlation_id: string | null
          created_at: string
          current_step: number
          error: string | null
          force_terminated_by: string | null
          id: string
          last_progress_at: string
          next_retry_at: string | null
          replayed_from: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          context?: Json
          correlation_id?: string | null
          created_at?: string
          current_step?: number
          error?: string | null
          force_terminated_by?: string | null
          id?: string
          last_progress_at?: string
          next_retry_at?: string | null
          replayed_from?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          context?: Json
          correlation_id?: string | null
          created_at?: string
          current_step?: number
          error?: string | null
          force_terminated_by?: string | null
          id?: string
          last_progress_at?: string
          next_retry_at?: string | null
          replayed_from?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_replayed_from_fkey"
            columns: ["replayed_from"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_state_transitions: {
        Row: {
          actor: string
          from_state: string | null
          id: string
          reason: string | null
          run_id: string
          to_state: string
          ts: string
          user_id: string
        }
        Insert: {
          actor?: string
          from_state?: string | null
          id?: string
          reason?: string | null
          run_id: string
          to_state: string
          ts?: string
          user_id: string
        }
        Update: {
          actor?: string
          from_state?: string | null
          id?: string
          reason?: string | null
          run_id?: string
          to_state?: string
          ts?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_state_transitions_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          error: string | null
          id: string
          input: Json
          output: Json | null
          receipt_id: string | null
          retries: number
          run_id: string
          started_at: string | null
          status: string
          step_id: string
          step_index: number
          step_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          receipt_id?: string | null
          retries?: number
          run_id: string
          started_at?: string | null
          status?: string
          step_id: string
          step_index: number
          step_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error?: string | null
          id?: string
          input?: Json
          output?: Json | null
          receipt_id?: string | null
          retries?: number
          run_id?: string
          started_at?: string | null
          status?: string
          step_id?: string
          step_index?: number
          step_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          approval_required: boolean
          created_at: string
          domain: string
          enabled: boolean
          id: string
          kill_switch_class: string | null
          metadata: Json
          name: string
          policy_family: string | null
          retry_policy: Json
          steps: Json
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          approval_required?: boolean
          created_at?: string
          domain?: string
          enabled?: boolean
          id?: string
          kill_switch_class?: string | null
          metadata?: Json
          name: string
          policy_family?: string | null
          retry_policy?: Json
          steps?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          approval_required?: boolean
          created_at?: string
          domain?: string
          enabled?: boolean
          id?: string
          kill_switch_class?: string | null
          metadata?: Json
          name?: string
          policy_family?: string | null
          retry_policy?: Json
          steps?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      approval_queue: {
        Row: {
          action_summary: string | null
          action_type: string | null
          cost_implications: string | null
          created_at: string | null
          decided_at: string | null
          decision_reason: string | null
          description: string | null
          domain: string | null
          escalated: boolean | null
          evidence: Json | null
          id: string | null
          launch_implications: string | null
          priority: string | null
          proposed_action: Json | null
          recommendation_id: string | null
          remediation_binding_id: string | null
          resolved_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
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
      connector_effective_state: {
        Row: {
          account_email: string | null
          account_id: string | null
          account_status: string | null
          connector_type: string | null
          demo_mode: boolean | null
          display_name: string | null
          effective_state: string | null
          last_health_at: string | null
          provider_health_status: string | null
          provider_last_probed_at: string | null
          token_expires_at: string | null
          token_id: string | null
          token_last_refreshed_at: string | null
          token_reauth_required: boolean | null
          token_rotation_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      error_patrol_triage_view: {
        Row: {
          acknowledged_at: string | null
          affected_resource_id: string | null
          affected_resource_type: string | null
          agent_action_status: string | null
          agent_action_type: string | null
          agent_confidence: number | null
          first_seen_at: string | null
          follow_up_recommendation: string | null
          frequency: number | null
          id: string | null
          incident_severity: string | null
          incident_title: string | null
          intent_action_class: string | null
          intent_executed_at: string | null
          intent_receipt_id: string | null
          intent_status: string | null
          last_seen_at: string | null
          linked_agent_action_id: string | null
          linked_incident_id: string | null
          linked_intent_id: string | null
          muted_until: string | null
          pattern_key: string | null
          resolved_at: string | null
          responding_agent_council: string | null
          responding_agent_id: string | null
          rollback_availability: string | null
          rollback_capable: boolean | null
          rolled_back_at: string | null
          severity: string | null
          status: string | null
          subsystem: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_patrol_detections_linked_agent_action_id_fkey"
            columns: ["linked_agent_action_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_actions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_patrol_detections_linked_incident_id_fkey"
            columns: ["linked_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_patrol_detections_linked_intent_id_fkey"
            columns: ["linked_intent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_action_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_action_class_fkey"
            columns: ["intent_action_class"]
            isOneToOne: false
            referencedRelation: "internal_agent_action_whitelist"
            referencedColumns: ["action_class"]
          },
          {
            foreignKeyName: "internal_agent_action_intents_receipt_id_fkey"
            columns: ["intent_receipt_id"]
            isOneToOne: false
            referencedRelation: "ai_action_receipts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_agent_actions_agent_id_fkey"
            columns: ["responding_agent_id"]
            isOneToOne: false
            referencedRelation: "internal_agent_definitions"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      public_donations_wall: {
        Row: {
          donor_name: string | null
          id: string | null
          message: string | null
          paid_at: string | null
          receipt_hash: string | null
          tier: string | null
        }
        Insert: {
          donor_name?: never
          id?: string | null
          message?: never
          paid_at?: string | null
          receipt_hash?: string | null
          tier?: never
        }
        Update: {
          donor_name?: never
          id?: string | null
          message?: never
          paid_at?: string | null
          receipt_hash?: string | null
          tier?: never
        }
        Relationships: []
      }
      uptime_status: {
        Row: {
          current_status: string | null
          d30_total: number | null
          d7_total: number | null
          h24_total: number | null
          last_check_at: string | null
          subsystem: string | null
          uptime_24h_pct: number | null
          uptime_30d_pct: number | null
          uptime_7d_pct: number | null
        }
        Relationships: []
      }
      v_admin_user_mfa_factors: {
        Row: {
          created_at: string | null
          factor_id: string | null
          factor_type: "totp" | "webauthn" | "phone" | null
          status: "unverified" | "verified" | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          factor_id?: string | null
          factor_type?: "totp" | "webauthn" | "phone" | null
          status?: "unverified" | "verified" | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          factor_id?: string | null
          factor_type?: "totp" | "webauthn" | "phone" | null
          status?: "unverified" | "verified" | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      v_user_pending_approvals: {
        Row: {
          cost_implications: string | null
          created_at: string | null
          decision_at: string | null
          escalated: boolean | null
          evidence_links: Json | null
          id: string | null
          launch_implications: string | null
          priority: string | null
          rec_confidence: number | null
          rec_domain: string | null
          rec_evidence: Json | null
          rec_execution_required: boolean | null
          rec_flagship_loop_key: string | null
          rec_lifecycle_status: string | null
          rec_role_key: string | null
          rec_severity: string | null
          rec_task_key: string | null
          recommendation_id: string | null
          reviewer_comments: string | null
          reviewer_user_id: string | null
          status: string | null
          summary: string | null
          title: string | null
          user_id: string | null
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
    }
    Functions: {
      acknowledge_ai_runtime_failure_alert: {
        Args: { _alert_id: string; _notes?: string }
        Returns: Json
      }
      acknowledge_error_patrol_detection: {
        Args: { _detection_id: string }
        Returns: Json
      }
      acknowledge_security_finding: {
        Args: { _finding_id: string; _new_status: string; _notes?: string }
        Returns: string
      }
      brd_followthrough_transition: {
        Args: {
          _correlation_id: string
          _failure_reason?: string
          _item_id: string
          _metadata?: Json
          _to_state: string
        }
        Returns: undefined
      }
      cast_internal_agent_consensus_vote: {
        Args: {
          p_agent_id: string
          p_confidence: number
          p_council: string
          p_evidence_refs?: Json
          p_position: string
          p_rationale: string
          p_session_id: string
        }
        Returns: string
      }
      check_ai_budget_policies: {
        Args: {
          p_capability_key: string
          p_estimated_cost_usd: number
          p_user_id: string
        }
        Returns: Json
      }
      check_user_hard_ceiling: {
        Args: { p_estimated_cost_cents?: number; p_user_id: string }
        Returns: Json
      }
      clamp_assurance_action_autonomy: {
        Args: { p_requested_level: number }
        Returns: number
      }
      clamp_dr_action_autonomy: { Args: { requested: number }; Returns: number }
      clamp_tenant_action_autonomy: {
        Args: { p_requested_level: number }
        Returns: number
      }
      dp_noise_clamp: { Args: { p_epsilon: number }; Returns: number }
      evaluate_action_safety_gates: {
        Args: {
          _action_class: string
          _agent_id: string
          _confidence: number
          _precondition_evidence?: Json
          _target_id: string
        }
        Returns: Json
      }
      evaluate_internal_agent_ladder: {
        Args: {
          _agent_id: string
          _hint_reason?: string
          _reflection_count: number
          _trust_score: number
        }
        Returns: Json
      }
      expire_overdue_kill_switches: { Args: never; Returns: number }
      gen_short_code: { Args: { len?: number }; Returns: string }
      get_ai_runtime_streak_summary: { Args: never; Returns: Json }
      get_compliance_rls_summary: { Args: never; Returns: Json }
      get_connector_refresh_streak_summary: { Args: never; Returns: Json }
      get_db_truth_snapshot: { Args: { _op?: string }; Returns: Json }
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
      is_tenant_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      list_stale_locked_workflow_runs: {
        Args: { _max_age_minutes?: number }
        Returns: {
          id: string
          last_progress_at: string
          status: string
          user_id: string
          workflow_id: string
        }[]
      }
      list_unescalated_security_events: {
        Args: { _lookback_minutes?: number }
        Returns: {
          action: string
          audit_id: string
          created_at: string
          severity: string
          target_id: string
          target_type: string
        }[]
      }
      list_unhealthy_connector_accounts: {
        Args: never
        Returns: {
          connector_type: string
          display_name: string
          id: string
          last_health_at: string
          last_health_status: string
          status: string
          user_id: string
        }[]
      }
      mute_error_patrol_pattern: {
        Args: { _hours?: number; _pattern_key: string }
        Returns: Json
      }
      open_internal_agent_consensus: {
        Args: {
          p_action_class: string
          p_initiating_agent_id: string
          p_participating_agent_ids: string[]
          p_participating_councils: string[]
          p_proposed_autonomy_level: number
          p_quorum_required: number
          p_session_key: string
          p_topic: string
        }
        Returns: string
      }
      pb_is_workspace_member: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      pb_is_workspace_owner: {
        Args: { _user_id: string; _workspace_id: string }
        Returns: boolean
      }
      propose_implementation_suggestion: {
        Args: {
          p_estimated_effort?: string
          p_evidence_refs?: Json
          p_expected_value?: string
          p_priority?: string
          p_proposed_change_type?: string
          p_rationale: string
          p_source_agent_id: string
          p_source_council: string
          p_source_signal_ref: string
          p_source_signal_type: string
          p_summary: string
          p_title: string
        }
        Returns: string
      }
      propose_internal_cost_optimization: {
        Args: {
          p_current_state: Json
          p_estimated_monthly_savings_usd: number
          p_estimated_quality_delta: number
          p_evidence_refs?: Json
          p_proposal_key: string
          p_proposal_type: string
          p_proposed_state: Json
          p_proposing_agent_id: string
          p_rationale: string
          p_risk_assessment?: string
          p_scope: string
          p_target_capability: string
        }
        Returns: string
      }
      propose_kill_switch_recommendation: {
        Args: {
          _blast_radius: string
          _evidence: Json
          _reason: string
          _recommended_action: string
          _severity: string
          _source_agent_id: string
          _source_finding_id: string
          _switch_id: string
          _urgency: string
        }
        Returns: string
      }
      publish_agent_learning: {
        Args: {
          _applies_to_agents?: string[]
          _applies_to_councils?: string[]
          _confidence?: number
          _learning_summary: string
          _pattern_tag: string
          _recommended_guard?: string
          _source_agent_id: string
        }
        Returns: string
      }
      purge_expired_budget_decision_receipts: { Args: never; Returns: number }
      purge_sita_app_open_log: { Args: never; Returns: undefined }
      purge_sita_perception_events: { Args: never; Returns: undefined }
      record_dp_epsilon_spend: {
        Args: {
          _capability_key: string
          _epsilon: number
          _max_per_day?: number
          _request_ref?: string
        }
        Returns: Json
      }
      record_error_patrol_detection: {
        Args: {
          _affected_resource_id?: string
          _affected_resource_type?: string
          _follow_up_recommendation?: string
          _linked_agent_action_id?: string
          _linked_incident_id?: string
          _linked_intent_id?: string
          _pattern_key: string
          _raw_signal?: Json
          _severity: string
          _signature_hash: string
          _subsystem: string
          _user_id?: string
        }
        Returns: string
      }
      record_implementation_suggestion_decision: {
        Args: {
          p_action: string
          p_comments?: string
          p_suggestion_id: string
          p_supersedes?: string
        }
        Returns: Json
      }
      record_internal_agent_reflection: {
        Args: {
          _confidence_calibration?: number
          _evidence?: Json
          _gate_fitness_score: number
          _intent_id: string
          _lesson_learned?: string
          _outcome_quality: number
          _pattern_tags?: Json
          _recommendation?: string
          _should_repeat?: boolean
        }
        Returns: string
      }
      record_internal_runbook_execution: {
        Args: {
          p_agent_id: string
          p_duration_ms: number
          p_execution_key: string
          p_outcome_status: string
          p_outcome_summary: string
          p_requested_autonomy_level: number
          p_rollback_data: Json
          p_runbook_id: string
          p_steps_executed: Json
          p_trigger_evidence_refs: Json
          p_trigger_reason: string
        }
        Returns: string
      }
      record_owner_copilot_handoff: {
        Args: {
          p_briefing_id: string
          p_decision: string
          p_rationale?: string
        }
        Returns: string
      }
      record_policy_draft_decision: {
        Args: {
          _action: string
          _draft_id: string
          _evidence?: Json
          _notes?: string
        }
        Returns: Json
      }
      record_security_finding: {
        Args: {
          _agent_id: string
          _evidence: Json
          _finding_type: string
          _severity: string
          _source_signal_ref: string
          _source_signal_type: string
          _summary: string
          _title: string
        }
        Returns: string
      }
      resolve_error_patrol_detection: {
        Args: { _detection_id: string; _notes?: string }
        Returns: Json
      }
      resolve_internal_agent_consensus: {
        Args: { p_resolved_by?: string; p_session_id: string }
        Returns: Json
      }
      seed_default_budget_classes: {
        Args: { _user_id: string }
        Returns: undefined
      }
      seed_default_installed_apps: {
        Args: { _user_id: string }
        Returns: undefined
      }
      seed_internal_agents_from_json: { Args: { _agents: Json }; Returns: Json }
      seed_master_internal_agent_kill_switch: {
        Args: { _user_id: string }
        Returns: string
      }
      summarize_implementation_suggestions: { Args: never; Returns: Json }
      summarize_internal_agent_learning: {
        Args: { _lookback_hours?: number }
        Returns: {
          agent_id: string
          avg_gate_fitness: number
          avg_outcome_quality: number
          avoid_count: number
          last_reflected_at: string
          reflections_count: number
          repeat_count: number
          top_patterns: Json
          trust_score: number
        }[]
      }
      summarize_policy_draft_health: { Args: never; Returns: Json }
      summarize_security_council: { Args: never; Returns: Json }
      summarize_trust_ladder: { Args: never; Returns: Json }
      trigger_anomaly_secret_rotation: {
        Args: {
          _anomaly_evidence: Json
          _anomaly_type: string
          _dryrun_result: Json
          _provider_key: string
          _secret_scope: string
          _severity: string
          _source_agent_id: string
          _source_finding_id: string
        }
        Returns: string
      }
      trim_kill_switch_audit_log: {
        Args: { _keep_days?: number }
        Returns: number
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
