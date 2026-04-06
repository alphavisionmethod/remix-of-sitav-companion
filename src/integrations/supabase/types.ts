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
      action_escalations: {
        Row: {
          created_at: string
          escalation_reason: string | null
          from_state: string | null
          id: string
          target_device_id: string | null
          target_surface: string | null
          to_state: string | null
          trust_weighted_action_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          escalation_reason?: string | null
          from_state?: string | null
          id?: string
          target_device_id?: string | null
          target_surface?: string | null
          to_state?: string | null
          trust_weighted_action_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          escalation_reason?: string | null
          from_state?: string | null
          id?: string
          target_device_id?: string | null
          target_surface?: string | null
          to_state?: string | null
          trust_weighted_action_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_escalations_trust_weighted_action_id_fkey"
            columns: ["trust_weighted_action_id"]
            isOneToOne: false
            referencedRelation: "trust_weighted_actions"
            referencedColumns: ["id"]
          },
        ]
      }
      adaptive_interface_profiles: {
        Row: {
          cognitive_load_class: string | null
          created_at: string
          current_mode: string | null
          density_preference: string | null
          id: string
          quick_action_bias: string | null
          summary_depth: string | null
          surface: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cognitive_load_class?: string | null
          created_at?: string
          current_mode?: string | null
          density_preference?: string | null
          id?: string
          quick_action_bias?: string | null
          summary_depth?: string | null
          surface?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cognitive_load_class?: string | null
          created_at?: string
          current_mode?: string | null
          density_preference?: string | null
          id?: string
          quick_action_bias?: string | null
          summary_depth?: string | null
          surface?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_configs: {
        Row: {
          active: boolean
          allowed_actions: Json
          created_at: string
          escalation_threshold: number | null
          id: string
          name: string
          persona: string
          rules: Json
          system_prompt: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          allowed_actions?: Json
          created_at?: string
          escalation_threshold?: number | null
          id?: string
          name: string
          persona?: string
          rules?: Json
          system_prompt?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          allowed_actions?: Json
          created_at?: string
          escalation_threshold?: number | null
          id?: string
          name?: string
          persona?: string
          rules?: Json
          system_prompt?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_feedback: {
        Row: {
          advisor_id: string
          category: string | null
          comment: string | null
          corrected_response: string | null
          created_at: string
          feedback_type: string
          id: string
          message_id: string | null
          original_response: string | null
          rating: number | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          category?: string | null
          comment?: string | null
          corrected_response?: string | null
          created_at?: string
          feedback_type?: string
          id?: string
          message_id?: string | null
          original_response?: string | null
          rating?: number | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          category?: string | null
          comment?: string | null
          corrected_response?: string | null
          created_at?: string
          feedback_type?: string
          id?: string
          message_id?: string | null
          original_response?: string | null
          rating?: number | null
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
          content: string
          created_at?: string
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
          created_at: string
          id: string
          memory_type: string
          metadata: Json
          user_id: string
        }
        Insert: {
          advisor_id: string
          content: string
          created_at?: string
          id?: string
          memory_type?: string
          metadata?: Json
          user_id: string
        }
        Update: {
          advisor_id?: string
          content?: string
          created_at?: string
          id?: string
          memory_type?: string
          metadata?: Json
          user_id?: string
        }
        Relationships: []
      }
      advisor_performance: {
        Row: {
          advisor_id: string
          avg_satisfaction: number | null
          correction_count: number | null
          created_at: string | null
          id: string
          period: string | null
          self_learning_events: number | null
          total_calls: number | null
          total_cost_cents: number | null
          total_tokens: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          avg_satisfaction?: number | null
          correction_count?: number | null
          created_at?: string | null
          id?: string
          period?: string | null
          self_learning_events?: number | null
          total_calls?: number | null
          total_cost_cents?: number | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          avg_satisfaction?: number | null
          correction_count?: number | null
          created_at?: string | null
          id?: string
          period?: string | null
          self_learning_events?: number | null
          total_calls?: number | null
          total_cost_cents?: number | null
          total_tokens?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advisor_registry: {
        Row: {
          active: boolean
          advisor_type: string
          capabilities: Json
          created_at: string
          display_name: string
          domain: string
          explanation_style: string
          id: string
          memory_scope: string
          tool_access: Json
          trust_threshold: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          advisor_type: string
          capabilities?: Json
          created_at?: string
          display_name: string
          domain?: string
          explanation_style?: string
          id?: string
          memory_scope?: string
          tool_access?: Json
          trust_threshold?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          advisor_type?: string
          capabilities?: Json
          created_at?: string
          display_name?: string
          domain?: string
          explanation_style?: string
          id?: string
          memory_scope?: string
          tool_access?: Json
          trust_threshold?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      advisor_requests: {
        Row: {
          advisor_config_id: string | null
          complexity: string | null
          context: Json
          correlation_id: string | null
          created_at: string
          id: string
          intent: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_config_id?: string | null
          complexity?: string | null
          context?: Json
          correlation_id?: string | null
          created_at?: string
          id?: string
          intent: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_config_id?: string | null
          complexity?: string | null
          context?: Json
          correlation_id?: string | null
          created_at?: string
          id?: string
          intent?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_requests_advisor_config_id_fkey"
            columns: ["advisor_config_id"]
            isOneToOne: false
            referencedRelation: "advisor_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_responses: {
        Row: {
          actions: Json
          confidence: number | null
          correlation_id: string | null
          created_at: string
          id: string
          latency_ms: number | null
          model_used: string | null
          reasoning: string | null
          recommendation: string | null
          request_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          actions?: Json
          confidence?: number | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          latency_ms?: number | null
          model_used?: string | null
          reasoning?: string | null
          recommendation?: string | null
          request_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          actions?: Json
          confidence?: number | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          latency_ms?: number | null
          model_used?: string | null
          reasoning?: string | null
          recommendation?: string | null
          request_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advisor_responses_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "advisor_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_action_receipts: {
        Row: {
          action_type: string
          agent_id: string
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          agent_id: string
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_schedules: {
        Row: {
          agent_id: string
          created_at: string | null
          cron_expression: string | null
          enabled: boolean | null
          id: string
          interval_ms: number | null
          last_run_at: string | null
          metadata: Json | null
          next_run_at: string | null
          schedule_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          cron_expression?: string | null
          enabled?: boolean | null
          id?: string
          interval_ms?: number | null
          last_run_at?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          schedule_type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          cron_expression?: string | null
          enabled?: boolean | null
          id?: string
          interval_ms?: number | null
          last_run_at?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          schedule_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      agent_signals: {
        Row: {
          agent_id: string
          created_at: string | null
          id: string
          payload: Json | null
          priority: string | null
          processed: boolean | null
          processed_at: string | null
          signal_type: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          priority?: string | null
          processed?: boolean | null
          processed_at?: string | null
          signal_type: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string | null
          id?: string
          payload?: Json | null
          priority?: string | null
          processed?: boolean | null
          processed_at?: string | null
          signal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_telemetry: {
        Row: {
          agent_id: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          recorded_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number
          recorded_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_agent_debate_records: {
        Row: {
          consensus_score: number | null
          created_at: string
          id: string
          participants: Json | null
          resolution: string | null
          status: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consensus_score?: number | null
          created_at?: string
          id?: string
          participants?: Json | null
          resolution?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consensus_score?: number | null
          created_at?: string
          id?: string
          participants?: Json | null
          resolution?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_budget_alerts: {
        Row: {
          alert_state: string
          created_at: string
          id: string
          observed_cost_usd: number
          period_class: string
          policy_id: string | null
          resolved_at: string | null
          scope_ref: string | null
          scope_type: string
          threshold_percent: number
          user_id: string
        }
        Insert: {
          alert_state?: string
          created_at?: string
          id?: string
          observed_cost_usd: number
          period_class?: string
          policy_id?: string | null
          resolved_at?: string | null
          scope_ref?: string | null
          scope_type: string
          threshold_percent: number
          user_id: string
        }
        Update: {
          alert_state?: string
          created_at?: string
          id?: string
          observed_cost_usd?: number
          period_class?: string
          policy_id?: string | null
          resolved_at?: string | null
          scope_ref?: string | null
          scope_type?: string
          threshold_percent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_budget_alerts_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "ai_budget_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_budget_policies: {
        Row: {
          alert_threshold_percent: number
          block_on_exceeded: boolean
          created_at: string
          critical_threshold_percent: number
          daily_budget_usd: number | null
          fallback_model_id: string | null
          fallback_on_exceeded: boolean
          id: string
          is_active: boolean
          max_daily_requests: number | null
          max_request_cost_usd: number | null
          metadata: Json
          monthly_budget_usd: number | null
          policy_key: string
          premium_allowed: boolean
          scope_ref: string | null
          scope_type: string
          updated_at: string
          user_id: string
          weekly_budget_usd: number | null
        }
        Insert: {
          alert_threshold_percent?: number
          block_on_exceeded?: boolean
          created_at?: string
          critical_threshold_percent?: number
          daily_budget_usd?: number | null
          fallback_model_id?: string | null
          fallback_on_exceeded?: boolean
          id?: string
          is_active?: boolean
          max_daily_requests?: number | null
          max_request_cost_usd?: number | null
          metadata?: Json
          monthly_budget_usd?: number | null
          policy_key: string
          premium_allowed?: boolean
          scope_ref?: string | null
          scope_type?: string
          updated_at?: string
          user_id: string
          weekly_budget_usd?: number | null
        }
        Update: {
          alert_threshold_percent?: number
          block_on_exceeded?: boolean
          created_at?: string
          critical_threshold_percent?: number
          daily_budget_usd?: number | null
          fallback_model_id?: string | null
          fallback_on_exceeded?: boolean
          id?: string
          is_active?: boolean
          max_daily_requests?: number | null
          max_request_cost_usd?: number | null
          metadata?: Json
          monthly_budget_usd?: number | null
          policy_key?: string
          premium_allowed?: boolean
          scope_ref?: string | null
          scope_type?: string
          updated_at?: string
          user_id?: string
          weekly_budget_usd?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_budget_policies_fallback_model_id_fkey"
            columns: ["fallback_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_capability_routing: {
        Row: {
          budget_class: string
          can_fallback_to_demo: boolean
          can_fallback_to_unavailable: boolean
          capability_key: string
          created_at: string
          default_model_id: string | null
          default_provider_id: string | null
          fallback_model_id: string | null
          fallback_provider_id: string | null
          id: string
          is_active: boolean
          launch_honesty_class: string
          max_latency_class: string
          metadata: Json
          quality_requirement: string
          routing_class: string
          structured_output_required: boolean
          tool_use_required: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_class?: string
          can_fallback_to_demo?: boolean
          can_fallback_to_unavailable?: boolean
          capability_key: string
          created_at?: string
          default_model_id?: string | null
          default_provider_id?: string | null
          fallback_model_id?: string | null
          fallback_provider_id?: string | null
          id?: string
          is_active?: boolean
          launch_honesty_class?: string
          max_latency_class?: string
          metadata?: Json
          quality_requirement?: string
          routing_class?: string
          structured_output_required?: boolean
          tool_use_required?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_class?: string
          can_fallback_to_demo?: boolean
          can_fallback_to_unavailable?: boolean
          capability_key?: string
          created_at?: string
          default_model_id?: string | null
          default_provider_id?: string | null
          fallback_model_id?: string | null
          fallback_provider_id?: string | null
          id?: string
          is_active?: boolean
          launch_honesty_class?: string
          max_latency_class?: string
          metadata?: Json
          quality_requirement?: string
          routing_class?: string
          structured_output_required?: boolean
          tool_use_required?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_capability_routing_default_model_id_fkey"
            columns: ["default_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_capability_routing_default_provider_id_fkey"
            columns: ["default_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_capability_routing_default_provider_id_fkey"
            columns: ["default_provider_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_capability_routing_fallback_model_id_fkey"
            columns: ["fallback_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_capability_routing_fallback_provider_id_fkey"
            columns: ["fallback_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_capability_routing_fallback_provider_id_fkey"
            columns: ["fallback_provider_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_change_plans: {
        Row: {
          affected_services: string[] | null
          applied_at: string | null
          approval_required: boolean | null
          autonomy_mode: string
          confidence: number | null
          created_at: string
          deployment_scope: string | null
          description: string | null
          evidence_refs: Json | null
          id: string
          intended_effect: string | null
          mission_id: string | null
          proposed_by_agent: string | null
          reviewed_by: string | null
          rollback_strategy: string | null
          status: string
          target_files: string[] | null
          target_surfaces: string[] | null
          tests_needed: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_services?: string[] | null
          applied_at?: string | null
          approval_required?: boolean | null
          autonomy_mode?: string
          confidence?: number | null
          created_at?: string
          deployment_scope?: string | null
          description?: string | null
          evidence_refs?: Json | null
          id?: string
          intended_effect?: string | null
          mission_id?: string | null
          proposed_by_agent?: string | null
          reviewed_by?: string | null
          rollback_strategy?: string | null
          status?: string
          target_files?: string[] | null
          target_surfaces?: string[] | null
          tests_needed?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_services?: string[] | null
          applied_at?: string | null
          approval_required?: boolean | null
          autonomy_mode?: string
          confidence?: number | null
          created_at?: string
          deployment_scope?: string | null
          description?: string | null
          evidence_refs?: Json | null
          id?: string
          intended_effect?: string | null
          mission_id?: string | null
          proposed_by_agent?: string | null
          reviewed_by?: string | null
          rollback_strategy?: string | null
          status?: string
          target_files?: string[] | null
          target_surfaces?: string[] | null
          tests_needed?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_change_plans_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "ai_engineering_missions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_compliance_violations: {
        Row: {
          blocks_launch: boolean | null
          capability_id: string | null
          created_at: string
          description: string
          evidence: Json | null
          feature_id: string | null
          id: string
          metadata: Json | null
          remediation: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          source_file: string | null
          updated_at: string
          user_id: string
          violation_type: string
        }
        Insert: {
          blocks_launch?: boolean | null
          capability_id?: string | null
          created_at?: string
          description: string
          evidence?: Json | null
          feature_id?: string | null
          id?: string
          metadata?: Json | null
          remediation?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          source_file?: string | null
          updated_at?: string
          user_id: string
          violation_type: string
        }
        Update: {
          blocks_launch?: boolean | null
          capability_id?: string | null
          created_at?: string
          description?: string
          evidence?: Json | null
          feature_id?: string | null
          id?: string
          metadata?: Json | null
          remediation?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          source_file?: string | null
          updated_at?: string
          user_id?: string
          violation_type?: string
        }
        Relationships: []
      }
      ai_cost_ledger: {
        Row: {
          cost_cents: number | null
          created_at: string | null
          id: string
          input_tokens: number | null
          metadata: Json | null
          model: string
          output_tokens: number | null
          provider: string | null
          purpose: string | null
          user_id: string
        }
        Insert: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model: string
          output_tokens?: number | null
          provider?: string | null
          purpose?: string | null
          user_id: string
        }
        Update: {
          cost_cents?: number | null
          created_at?: string | null
          id?: string
          input_tokens?: number | null
          metadata?: Json | null
          model?: string
          output_tokens?: number | null
          provider?: string | null
          purpose?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_design_diffs: {
        Row: {
          after_state: Json | null
          area: string | null
          before_state: Json | null
          confidence: number | null
          consistency_score: number | null
          created_at: string
          design_tokens_used: string[] | null
          id: string
          impact_level: string | null
          proposed_by_agent: string | null
          rationale: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          after_state?: Json | null
          area?: string | null
          before_state?: Json | null
          confidence?: number | null
          consistency_score?: number | null
          created_at?: string
          design_tokens_used?: string[] | null
          id?: string
          impact_level?: string | null
          proposed_by_agent?: string | null
          rationale?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          after_state?: Json | null
          area?: string | null
          before_state?: Json | null
          confidence?: number | null
          consistency_score?: number | null
          created_at?: string
          design_tokens_used?: string[] | null
          id?: string
          impact_level?: string | null
          proposed_by_agent?: string | null
          rationale?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_efficiency_scores: {
        Row: {
          acceptance_rate: number | null
          cache_contribution_rate: number | null
          composite_efficiency_score: number | null
          cost_efficiency_score: number | null
          downstream_value_score: number | null
          false_positive_rate: number | null
          id: string
          measured_at: string
          override_rate: number | null
          quality_score: number | null
          reuse_rate: number | null
          scope_id: string
          scope_type: string
          user_id: string
          verification_success_rate: number | null
        }
        Insert: {
          acceptance_rate?: number | null
          cache_contribution_rate?: number | null
          composite_efficiency_score?: number | null
          cost_efficiency_score?: number | null
          downstream_value_score?: number | null
          false_positive_rate?: number | null
          id?: string
          measured_at?: string
          override_rate?: number | null
          quality_score?: number | null
          reuse_rate?: number | null
          scope_id: string
          scope_type?: string
          user_id: string
          verification_success_rate?: number | null
        }
        Update: {
          acceptance_rate?: number | null
          cache_contribution_rate?: number | null
          composite_efficiency_score?: number | null
          cost_efficiency_score?: number | null
          downstream_value_score?: number | null
          false_positive_rate?: number | null
          id?: string
          measured_at?: string
          override_rate?: number | null
          quality_score?: number | null
          reuse_rate?: number | null
          scope_id?: string
          scope_type?: string
          user_id?: string
          verification_success_rate?: number | null
        }
        Relationships: []
      }
      ai_engineering_missions: {
        Row: {
          assigned_agents: string[] | null
          autonomy_mode: string
          blast_radius: string | null
          completed_at: string | null
          confidence: number | null
          created_at: string
          description: string | null
          evidence: Json | null
          id: string
          mission_type: string
          priority: string
          progress: number | null
          rollback_plan: string | null
          started_at: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agents?: string[] | null
          autonomy_mode?: string
          blast_radius?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          evidence?: Json | null
          id?: string
          mission_type?: string
          priority?: string
          progress?: number | null
          rollback_plan?: string | null
          started_at?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_agents?: string[] | null
          autonomy_mode?: string
          blast_radius?: string | null
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          evidence?: Json | null
          id?: string
          mission_type?: string
          priority?: string
          progress?: number | null
          rollback_plan?: string | null
          started_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_fallback_events: {
        Row: {
          capability_key: string
          created_at: string
          fallback_model_id: string | null
          fallback_provider_id: string | null
          fallback_reason: string
          id: string
          metadata: Json
          primary_model_id: string | null
          primary_provider_id: string | null
          result_state: string
          user_id: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          fallback_model_id?: string | null
          fallback_provider_id?: string | null
          fallback_reason: string
          id?: string
          metadata?: Json
          primary_model_id?: string | null
          primary_provider_id?: string | null
          result_state?: string
          user_id: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          fallback_model_id?: string | null
          fallback_provider_id?: string | null
          fallback_reason?: string
          id?: string
          metadata?: Json
          primary_model_id?: string | null
          primary_provider_id?: string | null
          result_state?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_fallback_events_fallback_model_id_fkey"
            columns: ["fallback_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_fallback_events_fallback_provider_id_fkey"
            columns: ["fallback_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_fallback_events_fallback_provider_id_fkey"
            columns: ["fallback_provider_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_fallback_events_primary_model_id_fkey"
            columns: ["primary_model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_fallback_events_primary_provider_id_fkey"
            columns: ["primary_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_fallback_events_primary_provider_id_fkey"
            columns: ["primary_provider_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_fix_proposals: {
        Row: {
          affected_area: string | null
          approval_needed: boolean | null
          auto_fix_eligible: boolean | null
          confidence: number | null
          created_at: string
          description: string | null
          detected_by_agent: string | null
          error_cluster_id: string | null
          id: string
          proposed_patch: string | null
          rollback_safety: string | null
          root_cause: string | null
          severity: string
          status: string
          test_impact: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_area?: string | null
          approval_needed?: boolean | null
          auto_fix_eligible?: boolean | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          detected_by_agent?: string | null
          error_cluster_id?: string | null
          id?: string
          proposed_patch?: string | null
          rollback_safety?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          test_impact?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_area?: string | null
          approval_needed?: boolean | null
          auto_fix_eligible?: boolean | null
          confidence?: number | null
          created_at?: string
          description?: string | null
          detected_by_agent?: string | null
          error_cluster_id?: string | null
          id?: string
          proposed_patch?: string | null
          rollback_safety?: string | null
          root_cause?: string | null
          severity?: string
          status?: string
          test_impact?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_inference_receipts: {
        Row: {
          action_refs: Json | null
          cache_hits: number | null
          cached_tokens: number | null
          capability_id: string | null
          context_sources_used: Json | null
          cost_actual_cents: number | null
          cost_estimate_cents: number | null
          created_at: string
          fallback_chain: Json | null
          hash: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model: string
          output_schema_used: string | null
          output_tokens: number | null
          policy_decision_ref: string | null
          previous_hash: string | null
          prompt_family_id: string | null
          provider: string
          redaction_applied: boolean | null
          reuse_artifacts: string[] | null
          route_reason: string | null
          task_request_id: string | null
          user_id: string
          verification_confidence: number | null
          verification_outcome: string | null
        }
        Insert: {
          action_refs?: Json | null
          cache_hits?: number | null
          cached_tokens?: number | null
          capability_id?: string | null
          context_sources_used?: Json | null
          cost_actual_cents?: number | null
          cost_estimate_cents?: number | null
          created_at?: string
          fallback_chain?: Json | null
          hash?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model: string
          output_schema_used?: string | null
          output_tokens?: number | null
          policy_decision_ref?: string | null
          previous_hash?: string | null
          prompt_family_id?: string | null
          provider: string
          redaction_applied?: boolean | null
          reuse_artifacts?: string[] | null
          route_reason?: string | null
          task_request_id?: string | null
          user_id: string
          verification_confidence?: number | null
          verification_outcome?: string | null
        }
        Update: {
          action_refs?: Json | null
          cache_hits?: number | null
          cached_tokens?: number | null
          capability_id?: string | null
          context_sources_used?: Json | null
          cost_actual_cents?: number | null
          cost_estimate_cents?: number | null
          created_at?: string
          fallback_chain?: Json | null
          hash?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model?: string
          output_schema_used?: string | null
          output_tokens?: number | null
          policy_decision_ref?: string | null
          previous_hash?: string | null
          prompt_family_id?: string | null
          provider?: string
          redaction_applied?: boolean | null
          reuse_artifacts?: string[] | null
          route_reason?: string | null
          task_request_id?: string | null
          user_id?: string
          verification_confidence?: number | null
          verification_outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_inference_receipts_task_request_id_fkey"
            columns: ["task_request_id"]
            isOneToOne: false
            referencedRelation: "ai_task_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_launch_honesty: {
        Row: {
          capability_key: string
          created_at: string
          id: string
          last_verified_at: string | null
          launch_honesty_class: string
          notes: string | null
          public_claim_allowed: boolean
          qualifier_required: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          capability_key: string
          created_at?: string
          id?: string
          last_verified_at?: string | null
          launch_honesty_class?: string
          notes?: string | null
          public_claim_allowed?: boolean
          qualifier_required?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          capability_key?: string
          created_at?: string
          id?: string
          last_verified_at?: string | null
          launch_honesty_class?: string
          notes?: string | null
          public_claim_allowed?: boolean
          qualifier_required?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_learning_patterns: {
        Row: {
          action_taken: string | null
          confidence: number | null
          contributing_events: Json | null
          created_at: string
          domain: string
          first_detected_at: string | null
          frequency: string | null
          id: string
          impact_result: string | null
          last_seen_at: string | null
          pattern_description: string
          pattern_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_taken?: string | null
          confidence?: number | null
          contributing_events?: Json | null
          created_at?: string
          domain?: string
          first_detected_at?: string | null
          frequency?: string | null
          id?: string
          impact_result?: string | null
          last_seen_at?: string | null
          pattern_description: string
          pattern_type?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_taken?: string | null
          confidence?: number | null
          contributing_events?: Json | null
          created_at?: string
          domain?: string
          first_detected_at?: string | null
          frequency?: string | null
          id?: string
          impact_result?: string | null
          last_seen_at?: string | null
          pattern_description?: string
          pattern_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_model_registry: {
        Row: {
          allowed_domains: string[] | null
          context_length: number | null
          cost_per_1k_input: number | null
          cost_per_1k_output: number | null
          cost_tier: string | null
          created_at: string
          deprecated: boolean | null
          deprecated_at: string | null
          disallowed_domains: string[] | null
          display_name: string | null
          fallback_suitability: string | null
          health_score: number | null
          id: string
          is_active: boolean | null
          latency_tier: string | null
          launch_stage: string | null
          max_output_tokens_default: number | null
          metadata: Json | null
          mode: string | null
          model_class: string
          model_id: string
          preferred_task_classes: string[] | null
          provider: string
          provider_model_name: string
          provider_registry_id: string | null
          quality_tier: string | null
          reasoning_strength: string | null
          recommended_use_cases: Json | null
          reliability_score: number | null
          safety_notes: string | null
          structured_output_support: boolean | null
          supports_json_mode: boolean | null
          supports_streaming: boolean | null
          tool_calling_support: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_domains?: string[] | null
          context_length?: number | null
          cost_per_1k_input?: number | null
          cost_per_1k_output?: number | null
          cost_tier?: string | null
          created_at?: string
          deprecated?: boolean | null
          deprecated_at?: string | null
          disallowed_domains?: string[] | null
          display_name?: string | null
          fallback_suitability?: string | null
          health_score?: number | null
          id?: string
          is_active?: boolean | null
          latency_tier?: string | null
          launch_stage?: string | null
          max_output_tokens_default?: number | null
          metadata?: Json | null
          mode?: string | null
          model_class?: string
          model_id: string
          preferred_task_classes?: string[] | null
          provider: string
          provider_model_name: string
          provider_registry_id?: string | null
          quality_tier?: string | null
          reasoning_strength?: string | null
          recommended_use_cases?: Json | null
          reliability_score?: number | null
          safety_notes?: string | null
          structured_output_support?: boolean | null
          supports_json_mode?: boolean | null
          supports_streaming?: boolean | null
          tool_calling_support?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_domains?: string[] | null
          context_length?: number | null
          cost_per_1k_input?: number | null
          cost_per_1k_output?: number | null
          cost_tier?: string | null
          created_at?: string
          deprecated?: boolean | null
          deprecated_at?: string | null
          disallowed_domains?: string[] | null
          display_name?: string | null
          fallback_suitability?: string | null
          health_score?: number | null
          id?: string
          is_active?: boolean | null
          latency_tier?: string | null
          launch_stage?: string | null
          max_output_tokens_default?: number | null
          metadata?: Json | null
          mode?: string | null
          model_class?: string
          model_id?: string
          preferred_task_classes?: string[] | null
          provider?: string
          provider_model_name?: string
          provider_registry_id?: string | null
          quality_tier?: string | null
          reasoning_strength?: string | null
          recommended_use_cases?: Json | null
          reliability_score?: number | null
          safety_notes?: string | null
          structured_output_support?: boolean | null
          supports_json_mode?: boolean | null
          supports_streaming?: boolean | null
          tool_calling_support?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_model_registry_provider_registry_id_fkey"
            columns: ["provider_registry_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_model_registry_provider_registry_id_fkey"
            columns: ["provider_registry_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_portfolio_allocations: {
        Row: {
          allocation_class: string
          avg_cost_per_request: number | null
          budget_cents: number
          created_at: string
          current_premium_pct: number | null
          domain: string | null
          efficiency_score: number | null
          id: string
          max_premium_pct: number | null
          metadata: Json | null
          notes: string | null
          period: string | null
          priority: number | null
          request_count: number | null
          spent_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allocation_class: string
          avg_cost_per_request?: number | null
          budget_cents?: number
          created_at?: string
          current_premium_pct?: number | null
          domain?: string | null
          efficiency_score?: number | null
          id?: string
          max_premium_pct?: number | null
          metadata?: Json | null
          notes?: string | null
          period?: string | null
          priority?: number | null
          request_count?: number | null
          spent_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allocation_class?: string
          avg_cost_per_request?: number | null
          budget_cents?: number
          created_at?: string
          current_premium_pct?: number | null
          domain?: string | null
          efficiency_score?: number | null
          id?: string
          max_premium_pct?: number | null
          metadata?: Json | null
          notes?: string | null
          period?: string | null
          priority?: number | null
          request_count?: number | null
          spent_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_prompt_families: {
        Row: {
          allowed_capability_classes: string[] | null
          context_sources: Json | null
          cost_profile: string | null
          created_at: string
          deprecated: boolean | null
          domain: string | null
          feature_ids: string[] | null
          grounding_requirements: Json | null
          hallucination_containment: string | null
          id: string
          max_context_tokens: number | null
          metadata: Json | null
          name: string
          output_schema: Json | null
          owner: string
          prompt_family_id: string
          quality_notes: string | null
          redaction_strategy: string | null
          system_prompt: string | null
          test_fixtures: Json | null
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          allowed_capability_classes?: string[] | null
          context_sources?: Json | null
          cost_profile?: string | null
          created_at?: string
          deprecated?: boolean | null
          domain?: string | null
          feature_ids?: string[] | null
          grounding_requirements?: Json | null
          hallucination_containment?: string | null
          id?: string
          max_context_tokens?: number | null
          metadata?: Json | null
          name: string
          output_schema?: Json | null
          owner: string
          prompt_family_id: string
          quality_notes?: string | null
          redaction_strategy?: string | null
          system_prompt?: string | null
          test_fixtures?: Json | null
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          allowed_capability_classes?: string[] | null
          context_sources?: Json | null
          cost_profile?: string | null
          created_at?: string
          deprecated?: boolean | null
          domain?: string | null
          feature_ids?: string[] | null
          grounding_requirements?: Json | null
          hallucination_containment?: string | null
          id?: string
          max_context_tokens?: number | null
          metadata?: Json | null
          name?: string
          output_schema?: Json | null
          owner?: string
          prompt_family_id?: string
          quality_notes?: string | null
          redaction_strategy?: string | null
          system_prompt?: string | null
          test_fixtures?: Json | null
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      ai_provider_health: {
        Row: {
          availability: number | null
          avg_latency_ms: number | null
          cost_drift_pct: number | null
          created_at: string
          error_rate: number | null
          failure_reason: string | null
          health_state: string | null
          id: string
          incident_description: string | null
          incident_status: string | null
          last_checked_at: string | null
          last_failure_at: string | null
          last_success_at: string | null
          metadata: Json | null
          model: string | null
          p95_latency_ms: number | null
          provider: string
          provider_registry_id: string | null
          rate_limit_pressure: number | null
          structured_output_success_rate: number | null
          total_failures: number | null
          total_requests: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: number | null
          avg_latency_ms?: number | null
          cost_drift_pct?: number | null
          created_at?: string
          error_rate?: number | null
          failure_reason?: string | null
          health_state?: string | null
          id?: string
          incident_description?: string | null
          incident_status?: string | null
          last_checked_at?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          model?: string | null
          p95_latency_ms?: number | null
          provider: string
          provider_registry_id?: string | null
          rate_limit_pressure?: number | null
          structured_output_success_rate?: number | null
          total_failures?: number | null
          total_requests?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: number | null
          avg_latency_ms?: number | null
          cost_drift_pct?: number | null
          created_at?: string
          error_rate?: number | null
          failure_reason?: string | null
          health_state?: string | null
          id?: string
          incident_description?: string | null
          incident_status?: string | null
          last_checked_at?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          metadata?: Json | null
          model?: string | null
          p95_latency_ms?: number | null
          provider?: string
          provider_registry_id?: string | null
          rate_limit_pressure?: number | null
          structured_output_success_rate?: number | null
          total_failures?: number | null
          total_requests?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_health_provider_registry_id_fkey"
            columns: ["provider_registry_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_provider_health_provider_registry_id_fkey"
            columns: ["provider_registry_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_provider_registry: {
        Row: {
          api_style: string
          base_url: string | null
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          launch_stage: string
          metadata: Json
          mode: string
          provider_key: string
          secret_env_name: string | null
          supports_demo_mode: boolean
          supports_streaming: boolean
          supports_structured_output: boolean
          supports_tools: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          api_style?: string
          base_url?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          launch_stage?: string
          metadata?: Json
          mode?: string
          provider_key: string
          secret_env_name?: string | null
          supports_demo_mode?: boolean
          supports_streaming?: boolean
          supports_structured_output?: boolean
          supports_tools?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          api_style?: string
          base_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          launch_stage?: string
          metadata?: Json
          mode?: string
          provider_key?: string
          secret_env_name?: string | null
          supports_demo_mode?: boolean
          supports_streaming?: boolean
          supports_structured_output?: boolean
          supports_tools?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_receipt_records: {
        Row: {
          capability_key: string
          created_at: string
          decision_class: string | null
          degraded_reason: string | null
          id: string
          mode: string
          model_id: string | null
          provider_id: string | null
          request_summary: string | null
          response_summary: string | null
          structured_output_valid: boolean | null
          usage_ledger_id: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          capability_key: string
          created_at?: string
          decision_class?: string | null
          degraded_reason?: string | null
          id?: string
          mode?: string
          model_id?: string | null
          provider_id?: string | null
          request_summary?: string | null
          response_summary?: string | null
          structured_output_valid?: boolean | null
          usage_ledger_id?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          capability_key?: string
          created_at?: string
          decision_class?: string | null
          degraded_reason?: string | null
          id?: string
          mode?: string
          model_id?: string | null
          provider_id?: string | null
          request_summary?: string | null
          response_summary?: string | null
          structured_output_valid?: boolean | null
          usage_ledger_id?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_receipt_records_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_receipt_records_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_receipt_records_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_receipt_records_usage_ledger_id_fkey"
            columns: ["usage_ledger_id"]
            isOneToOne: false
            referencedRelation: "ai_usage_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_receipt_records_usage_ledger_id_fkey"
            columns: ["usage_ledger_id"]
            isOneToOne: false
            referencedRelation: "v_ai_usage_recent"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_routing_policies: {
        Row: {
          allowed_providers: string[] | null
          async_eligible: boolean | null
          budget_class: string | null
          can_fallback_to_demo: boolean | null
          can_fallback_to_unavailable: boolean | null
          capability_id: string
          confidence_target: number | null
          created_at: string
          default_model: string | null
          default_provider: string | null
          disallowed_providers: string[] | null
          domain: string | null
          enabled: boolean | null
          fallback_chain: Json | null
          fallback_model: string | null
          fallback_provider: string | null
          id: string
          latency_target_ms: number | null
          launch_honesty_class: string | null
          max_cost_cents: number | null
          metadata: Json | null
          premium_escalation_conditions: Json | null
          quality_requirement: string | null
          reuse_eligible: boolean | null
          risk_tier: string | null
          routing_class: string | null
          structured_output_required: boolean | null
          task_class: string
          tool_use_required: boolean | null
          updated_at: string
          user_id: string
          verification_policy: string | null
        }
        Insert: {
          allowed_providers?: string[] | null
          async_eligible?: boolean | null
          budget_class?: string | null
          can_fallback_to_demo?: boolean | null
          can_fallback_to_unavailable?: boolean | null
          capability_id: string
          confidence_target?: number | null
          created_at?: string
          default_model?: string | null
          default_provider?: string | null
          disallowed_providers?: string[] | null
          domain?: string | null
          enabled?: boolean | null
          fallback_chain?: Json | null
          fallback_model?: string | null
          fallback_provider?: string | null
          id?: string
          latency_target_ms?: number | null
          launch_honesty_class?: string | null
          max_cost_cents?: number | null
          metadata?: Json | null
          premium_escalation_conditions?: Json | null
          quality_requirement?: string | null
          reuse_eligible?: boolean | null
          risk_tier?: string | null
          routing_class?: string | null
          structured_output_required?: boolean | null
          task_class?: string
          tool_use_required?: boolean | null
          updated_at?: string
          user_id: string
          verification_policy?: string | null
        }
        Update: {
          allowed_providers?: string[] | null
          async_eligible?: boolean | null
          budget_class?: string | null
          can_fallback_to_demo?: boolean | null
          can_fallback_to_unavailable?: boolean | null
          capability_id?: string
          confidence_target?: number | null
          created_at?: string
          default_model?: string | null
          default_provider?: string | null
          disallowed_providers?: string[] | null
          domain?: string | null
          enabled?: boolean | null
          fallback_chain?: Json | null
          fallback_model?: string | null
          fallback_provider?: string | null
          id?: string
          latency_target_ms?: number | null
          launch_honesty_class?: string | null
          max_cost_cents?: number | null
          metadata?: Json | null
          premium_escalation_conditions?: Json | null
          quality_requirement?: string | null
          reuse_eligible?: boolean | null
          risk_tier?: string | null
          routing_class?: string | null
          structured_output_required?: boolean | null
          task_class?: string
          tool_use_required?: boolean | null
          updated_at?: string
          user_id?: string
          verification_policy?: string | null
        }
        Relationships: []
      }
      ai_self_healing_rules: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          downgrade_reason: string | null
          downgraded_at: string | null
          enabled: boolean | null
          id: string
          last_triggered_at: string | null
          max_frequency: string | null
          risk_level: string
          rule_name: string
          scope_boundary: string | null
          total_failures: number | null
          total_successes: number | null
          total_triggers: number | null
          trigger_condition: string
          updated_at: string
          user_id: string
          verification_method: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          downgrade_reason?: string | null
          downgraded_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          max_frequency?: string | null
          risk_level?: string
          rule_name: string
          scope_boundary?: string | null
          total_failures?: number | null
          total_successes?: number | null
          total_triggers?: number | null
          trigger_condition: string
          updated_at?: string
          user_id: string
          verification_method?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          downgrade_reason?: string | null
          downgraded_at?: string | null
          enabled?: boolean | null
          id?: string
          last_triggered_at?: string | null
          max_frequency?: string | null
          risk_level?: string
          rule_name?: string
          scope_boundary?: string | null
          total_failures?: number | null
          total_successes?: number | null
          total_triggers?: number | null
          trigger_condition?: string
          updated_at?: string
          user_id?: string
          verification_method?: string | null
        }
        Relationships: []
      }
      ai_task_requests: {
        Row: {
          autonomy_tier: string | null
          cache_hit: boolean | null
          capability_id: string | null
          completed_at: string | null
          cost_actual_cents: number | null
          cost_estimate_cents: number | null
          created_at: string
          domain: string | null
          error: string | null
          fallback_provider: string | null
          fallback_used: boolean | null
          feature_id: string | null
          id: string
          input_hash: string | null
          input_summary: string | null
          input_tokens: number | null
          latency_ms: number | null
          metadata: Json | null
          model_chosen: string | null
          output_summary: string | null
          output_tokens: number | null
          prompt_family_id: string | null
          provider_chosen: string | null
          request_id: string
          reuse_hit: boolean | null
          risk_tier: string | null
          route_decision: Json | null
          status: string | null
          structured_output_valid: boolean | null
          task_class: string
          user_id: string
          verification_confidence: number | null
          verification_result: string | null
        }
        Insert: {
          autonomy_tier?: string | null
          cache_hit?: boolean | null
          capability_id?: string | null
          completed_at?: string | null
          cost_actual_cents?: number | null
          cost_estimate_cents?: number | null
          created_at?: string
          domain?: string | null
          error?: string | null
          fallback_provider?: string | null
          fallback_used?: boolean | null
          feature_id?: string | null
          id?: string
          input_hash?: string | null
          input_summary?: string | null
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json | null
          model_chosen?: string | null
          output_summary?: string | null
          output_tokens?: number | null
          prompt_family_id?: string | null
          provider_chosen?: string | null
          request_id?: string
          reuse_hit?: boolean | null
          risk_tier?: string | null
          route_decision?: Json | null
          status?: string | null
          structured_output_valid?: boolean | null
          task_class?: string
          user_id: string
          verification_confidence?: number | null
          verification_result?: string | null
        }
        Update: {
          autonomy_tier?: string | null
          cache_hit?: boolean | null
          capability_id?: string | null
          completed_at?: string | null
          cost_actual_cents?: number | null
          cost_estimate_cents?: number | null
          created_at?: string
          domain?: string | null
          error?: string | null
          fallback_provider?: string | null
          fallback_used?: boolean | null
          feature_id?: string | null
          id?: string
          input_hash?: string | null
          input_summary?: string | null
          input_tokens?: number | null
          latency_ms?: number | null
          metadata?: Json | null
          model_chosen?: string | null
          output_summary?: string | null
          output_tokens?: number | null
          prompt_family_id?: string | null
          provider_chosen?: string | null
          request_id?: string
          reuse_hit?: boolean | null
          risk_tier?: string | null
          route_decision?: Json | null
          status?: string | null
          structured_output_valid?: boolean | null
          task_class?: string
          user_id?: string
          verification_confidence?: number | null
          verification_result?: string | null
        }
        Relationships: []
      }
      ai_token_usage: {
        Row: {
          advisor_id: string
          cached: boolean | null
          category: string | null
          cost_cents: number | null
          created_at: string | null
          domain: string | null
          id: string
          input_tokens: number | null
          model: string
          output_tokens: number | null
          provider: string | null
          session_id: string | null
          total_tokens: number | null
          user_id: string
        }
        Insert: {
          advisor_id?: string
          cached?: boolean | null
          category?: string | null
          cost_cents?: number | null
          created_at?: string | null
          domain?: string | null
          id?: string
          input_tokens?: number | null
          model: string
          output_tokens?: number | null
          provider?: string | null
          session_id?: string | null
          total_tokens?: number | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          cached?: boolean | null
          category?: string | null
          cost_cents?: number | null
          created_at?: string | null
          domain?: string | null
          id?: string
          input_tokens?: number | null
          model?: string
          output_tokens?: number | null
          provider?: string | null
          session_id?: string | null
          total_tokens?: number | null
          user_id?: string
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
          id: string
          latency_ms: number | null
          mode: string
          model_id: string | null
          prompt_tokens: number | null
          provider_id: string | null
          receipt_id: string | null
          request_class: string
          session_id: string | null
          status: string
          structured_output_valid: boolean | null
          tool_invocations_count: number
          total_tokens: number | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          capability_key: string
          completion_tokens?: number | null
          created_at?: string
          error_code?: string | null
          error_summary?: string | null
          estimated_cost_usd?: number | null
          id?: string
          latency_ms?: number | null
          mode?: string
          model_id?: string | null
          prompt_tokens?: number | null
          provider_id?: string | null
          receipt_id?: string | null
          request_class?: string
          session_id?: string | null
          status?: string
          structured_output_valid?: boolean | null
          tool_invocations_count?: number
          total_tokens?: number | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          capability_key?: string
          completion_tokens?: number | null
          created_at?: string
          error_code?: string | null
          error_summary?: string | null
          estimated_cost_usd?: number | null
          id?: string
          latency_ms?: number | null
          mode?: string
          model_id?: string | null
          prompt_tokens?: number | null
          provider_id?: string | null
          receipt_id?: string | null
          request_class?: string
          session_id?: string | null
          status?: string
          structured_output_valid?: boolean | null
          tool_invocations_count?: number
          total_tokens?: number | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_ledger_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_model_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_ledger_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_ledger_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "v_ai_provider_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_approval_queue: {
        Row: {
          action_type: string
          budget_impact: string | null
          budget_impact_class: string | null
          created_at: string
          description: string | null
          estimated_impact: string | null
          evidence: Json | null
          evidence_refs: Json
          evidence_summary: string | null
          id: string
          impacted_domain: string | null
          invocation_id: string | null
          launch_impact: string | null
          launch_impact_class: string | null
          originating_receipt_id: string | null
          proposed_action_summary: string | null
          proposed_changes: Json | null
          recommendation_id: string | null
          recommendation_type: string | null
          resolved_at: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          risk_tier: string
          role_key: string
          severity: string | null
          status: string
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_type: string
          budget_impact?: string | null
          budget_impact_class?: string | null
          created_at?: string
          description?: string | null
          estimated_impact?: string | null
          evidence?: Json | null
          evidence_refs?: Json
          evidence_summary?: string | null
          id?: string
          impacted_domain?: string | null
          invocation_id?: string | null
          launch_impact?: string | null
          launch_impact_class?: string | null
          originating_receipt_id?: string | null
          proposed_action_summary?: string | null
          proposed_changes?: Json | null
          recommendation_id?: string | null
          recommendation_type?: string | null
          resolved_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          risk_tier?: string
          role_key: string
          severity?: string | null
          status?: string
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_type?: string
          budget_impact?: string | null
          budget_impact_class?: string | null
          created_at?: string
          description?: string | null
          estimated_impact?: string | null
          evidence?: Json | null
          evidence_refs?: Json
          evidence_summary?: string | null
          id?: string
          impacted_domain?: string | null
          invocation_id?: string | null
          launch_impact?: string | null
          launch_impact_class?: string | null
          originating_receipt_id?: string | null
          proposed_action_summary?: string | null
          proposed_changes?: Json | null
          recommendation_id?: string | null
          recommendation_type?: string | null
          resolved_at?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          risk_tier?: string
          role_key?: string
          severity?: string | null
          status?: string
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_approval_queue_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_approval_queue_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_recent_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_budget_classes: {
        Row: {
          budget_class_key: string
          created_at: string
          default_daily_budget_usd: number | null
          default_max_request_cost_usd: number | null
          default_monthly_budget_usd: number | null
          default_weekly_budget_usd: number | null
          description: string
          display_name: string
          fallback_budget_class_key: string | null
          id: string
          premium_allowed: boolean
          priority_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_class_key: string
          created_at?: string
          default_daily_budget_usd?: number | null
          default_max_request_cost_usd?: number | null
          default_monthly_budget_usd?: number | null
          default_weekly_budget_usd?: number | null
          description: string
          display_name: string
          fallback_budget_class_key?: string | null
          id?: string
          premium_allowed?: boolean
          priority_order?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_class_key?: string
          created_at?: string
          default_daily_budget_usd?: number | null
          default_max_request_cost_usd?: number | null
          default_monthly_budget_usd?: number | null
          default_weekly_budget_usd?: number | null
          description?: string
          display_name?: string
          fallback_budget_class_key?: string | null
          id?: string
          premium_allowed?: boolean
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
          expires_at: string
          id: string
          output_data: Json
          role_key: string
          task_type: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          cache_key: string
          cost_cents?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          output_data: Json
          role_key: string
          task_type: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          cache_key?: string
          cost_cents?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          output_data?: Json
          role_key?: string
          task_type?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_invocations: {
        Row: {
          ai_usage_ledger_id: string | null
          approved_by: string | null
          budget_class: string | null
          cached_output_ref: string | null
          capability_key: string | null
          completed_at: string | null
          cost_cents: number | null
          created_at: string
          error_message: string | null
          fallback_occurred: boolean | null
          human_approved: boolean | null
          id: string
          input_summary: string | null
          invoked_by_user_id: string | null
          latency_ms: number | null
          mode: string
          model_used: string | null
          output_data: Json | null
          output_summary: string | null
          provider_used: string | null
          receipt_id: string | null
          requested_budget_posture: string
          resolved_routing_class: string | null
          role_key: string
          scope_payload: Json
          scope_ref: string | null
          scope_type: string
          started_at: string | null
          status: string
          task_type: string
          tokens_used: number | null
          used_cached_output: boolean
          user_id: string
        }
        Insert: {
          ai_usage_ledger_id?: string | null
          approved_by?: string | null
          budget_class?: string | null
          cached_output_ref?: string | null
          capability_key?: string | null
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string
          error_message?: string | null
          fallback_occurred?: boolean | null
          human_approved?: boolean | null
          id?: string
          input_summary?: string | null
          invoked_by_user_id?: string | null
          latency_ms?: number | null
          mode?: string
          model_used?: string | null
          output_data?: Json | null
          output_summary?: string | null
          provider_used?: string | null
          receipt_id?: string | null
          requested_budget_posture?: string
          resolved_routing_class?: string | null
          role_key: string
          scope_payload?: Json
          scope_ref?: string | null
          scope_type?: string
          started_at?: string | null
          status?: string
          task_type: string
          tokens_used?: number | null
          used_cached_output?: boolean
          user_id: string
        }
        Update: {
          ai_usage_ledger_id?: string | null
          approved_by?: string | null
          budget_class?: string | null
          cached_output_ref?: string | null
          capability_key?: string | null
          completed_at?: string | null
          cost_cents?: number | null
          created_at?: string
          error_message?: string | null
          fallback_occurred?: boolean | null
          human_approved?: boolean | null
          id?: string
          input_summary?: string | null
          invoked_by_user_id?: string | null
          latency_ms?: number | null
          mode?: string
          model_used?: string | null
          output_data?: Json | null
          output_summary?: string | null
          provider_used?: string | null
          receipt_id?: string | null
          requested_budget_posture?: string
          resolved_routing_class?: string | null
          role_key?: string
          scope_payload?: Json
          scope_ref?: string | null
          scope_type?: string
          started_at?: string | null
          status?: string
          task_type?: string
          tokens_used?: number | null
          used_cached_output?: boolean
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_launch_honesty: {
        Row: {
          created_at: string
          id: string
          last_verified_at: string | null
          launch_honesty_class: string
          notes: string | null
          public_claim_allowed: boolean
          role_id: string | null
          task_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_verified_at?: string | null
          launch_honesty_class?: string
          notes?: string | null
          public_claim_allowed?: boolean
          role_id?: string | null
          task_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_verified_at?: string | null
          launch_honesty_class?: string
          notes?: string | null
          public_claim_allowed?: boolean
          role_id?: string | null
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_launch_honesty_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_launch_honesty_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_role_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_launch_honesty_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_task_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_outputs: {
        Row: {
          confidence_class: string | null
          contains_proposed_actions: boolean
          contains_recommendations: boolean
          contains_sensitive_suggestions: boolean
          created_at: string
          id: string
          invocation_id: string
          launch_honesty_class: string | null
          output_type: string
          structured_payload: Json
          summary_text: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          confidence_class?: string | null
          contains_proposed_actions?: boolean
          contains_recommendations?: boolean
          contains_sensitive_suggestions?: boolean
          created_at?: string
          id?: string
          invocation_id: string
          launch_honesty_class?: string | null
          output_type?: string
          structured_payload?: Json
          summary_text?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          confidence_class?: string | null
          contains_proposed_actions?: boolean
          contains_recommendations?: boolean
          contains_sensitive_suggestions?: boolean
          created_at?: string
          id?: string
          invocation_id?: string
          launch_honesty_class?: string | null
          output_type?: string
          structured_payload?: Json
          summary_text?: string | null
          title?: string | null
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
          {
            foreignKeyName: "ai_workforce_outputs_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_recent_activity"
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
          score_launch_honesty_alignment: number | null
          score_overall: number
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
          score_launch_honesty_alignment?: number | null
          score_overall?: number
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
          score_launch_honesty_alignment?: number | null
          score_overall?: number
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
            referencedRelation: "v_ai_workforce_recommendation_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_recommendations: {
        Row: {
          accepted_at: string | null
          action_proposed: string | null
          budget_impact_class: string | null
          created_at: string
          deferred_until: string | null
          description: string | null
          domain: string
          estimated_effort: string | null
          estimated_impact: string | null
          evidence: Json | null
          evidence_refs: Json
          id: string
          invocation_id: string | null
          launch_impact_class: string | null
          linked_approval_queue_item_id: string | null
          linked_remediation_program_id: string | null
          output_id: string | null
          recommendation_type: string
          rejected_at: string | null
          risk_tier: string
          role_key: string
          severity: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          action_proposed?: string | null
          budget_impact_class?: string | null
          created_at?: string
          deferred_until?: string | null
          description?: string | null
          domain?: string
          estimated_effort?: string | null
          estimated_impact?: string | null
          evidence?: Json | null
          evidence_refs?: Json
          id?: string
          invocation_id?: string | null
          launch_impact_class?: string | null
          linked_approval_queue_item_id?: string | null
          linked_remediation_program_id?: string | null
          output_id?: string | null
          recommendation_type?: string
          rejected_at?: string | null
          risk_tier?: string
          role_key: string
          severity?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          action_proposed?: string | null
          budget_impact_class?: string | null
          created_at?: string
          deferred_until?: string | null
          description?: string | null
          domain?: string
          estimated_effort?: string | null
          estimated_impact?: string | null
          evidence?: Json | null
          evidence_refs?: Json
          id?: string
          invocation_id?: string | null
          launch_impact_class?: string | null
          linked_approval_queue_item_id?: string | null
          linked_remediation_program_id?: string | null
          output_id?: string | null
          recommendation_type?: string
          rejected_at?: string | null
          risk_tier?: string
          role_key?: string
          severity?: string
          status?: string
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
          {
            foreignKeyName: "ai_workforce_recommendations_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_recent_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_role_health: {
        Row: {
          avg_cost_24h: number | null
          created_at: string
          fallback_rate_24h: number | null
          health_reason: string | null
          health_state: string
          id: string
          last_failure_at: string | null
          last_success_at: string | null
          last_used_at: string | null
          role_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_cost_24h?: number | null
          created_at?: string
          fallback_rate_24h?: number | null
          health_reason?: string | null
          health_state?: string
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_used_at?: string | null
          role_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_cost_24h?: number | null
          created_at?: string
          fallback_rate_24h?: number | null
          health_reason?: string | null
          health_state?: string
          id?: string
          last_failure_at?: string | null
          last_success_at?: string | null
          last_used_at?: string | null
          role_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_role_health_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_role_health_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_role_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_role_task_permissions: {
        Row: {
          allowed: boolean
          created_at: string
          id: string
          preferred_budget_class: string | null
          preferred_routing_class: string | null
          requires_approval_override: boolean
          role_id: string
          task_id: string
          user_id: string
        }
        Insert: {
          allowed?: boolean
          created_at?: string
          id?: string
          preferred_budget_class?: string | null
          preferred_routing_class?: string | null
          requires_approval_override?: boolean
          role_id: string
          task_id: string
          user_id: string
        }
        Update: {
          allowed?: boolean
          created_at?: string
          id?: string
          preferred_budget_class?: string | null
          preferred_routing_class?: string | null
          requires_approval_override?: boolean
          role_id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_role_task_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_role_task_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_role_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_role_task_permissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_task_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_workforce_roles: {
        Row: {
          approval_required: boolean
          approval_requirement_class: string
          autonomy_level: string
          budget_class: string
          cost_per_invocation_cents: number | null
          created_at: string
          default_model_tier: string
          default_routing_class: string
          display_name: string
          domain_family: string
          fallback_budget_class: string | null
          id: string
          is_active: boolean
          launch_honesty_class: string
          launch_stage: string
          max_autonomy: string
          metadata: Json | null
          prompt_family: string | null
          purpose: string
          role_key: string
          supports_demo_mode: boolean
          total_cost_cents: number | null
          total_invocations: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_required?: boolean
          approval_requirement_class?: string
          autonomy_level?: string
          budget_class?: string
          cost_per_invocation_cents?: number | null
          created_at?: string
          default_model_tier?: string
          default_routing_class?: string
          display_name: string
          domain_family?: string
          fallback_budget_class?: string | null
          id?: string
          is_active?: boolean
          launch_honesty_class?: string
          launch_stage?: string
          max_autonomy?: string
          metadata?: Json | null
          prompt_family?: string | null
          purpose: string
          role_key: string
          supports_demo_mode?: boolean
          total_cost_cents?: number | null
          total_invocations?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_required?: boolean
          approval_requirement_class?: string
          autonomy_level?: string
          budget_class?: string
          cost_per_invocation_cents?: number | null
          created_at?: string
          default_model_tier?: string
          default_routing_class?: string
          display_name?: string
          domain_family?: string
          fallback_budget_class?: string | null
          id?: string
          is_active?: boolean
          launch_honesty_class?: string
          launch_stage?: string
          max_autonomy?: string
          metadata?: Json | null
          prompt_family?: string | null
          purpose?: string
          role_key?: string
          supports_demo_mode?: boolean
          total_cost_cents?: number | null
          total_invocations?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_workforce_task_types: {
        Row: {
          allows_cached_output: boolean
          approval_required: boolean
          budget_class: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          launch_stage: string
          max_cost_cents: number | null
          output_schema: Json | null
          requires_human_review_for_proposals: boolean
          routing_class: string
          structured_output_required: boolean
          supports_scope_diffing: boolean
          task_family: string
          task_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allows_cached_output?: boolean
          approval_required?: boolean
          budget_class?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          launch_stage?: string
          max_cost_cents?: number | null
          output_schema?: Json | null
          requires_human_review_for_proposals?: boolean
          routing_class?: string
          structured_output_required?: boolean
          supports_scope_diffing?: boolean
          task_family?: string
          task_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allows_cached_output?: boolean
          approval_required?: boolean
          budget_class?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          launch_stage?: string
          max_cost_cents?: number | null
          output_schema?: Json | null
          requires_human_review_for_proposals?: boolean
          routing_class?: string
          structured_output_required?: boolean
          supports_scope_diffing?: boolean
          task_family?: string
          task_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ambient_launch_readiness: {
        Row: {
          blockers: string[] | null
          created_at: string
          demo_available: boolean | null
          evidence: Json | null
          id: string
          internal_only: boolean | null
          launch_label: string | null
          launch_ready: boolean | null
          metadata: Json | null
          pilot_ready: boolean | null
          supported: boolean | null
          target_key: string
          target_name: string
          target_type: string
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          blockers?: string[] | null
          created_at?: string
          demo_available?: boolean | null
          evidence?: Json | null
          id?: string
          internal_only?: boolean | null
          launch_label?: string | null
          launch_ready?: boolean | null
          metadata?: Json | null
          pilot_ready?: boolean | null
          supported?: boolean | null
          target_key: string
          target_name: string
          target_type: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          blockers?: string[] | null
          created_at?: string
          demo_available?: boolean | null
          evidence?: Json | null
          id?: string
          internal_only?: boolean | null
          launch_label?: string | null
          launch_ready?: boolean | null
          metadata?: Json | null
          pilot_ready?: boolean | null
          supported?: boolean | null
          target_key?: string
          target_name?: string
          target_type?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      ambient_notification_routes: {
        Row: {
          category: string | null
          condition_rules: Json | null
          created_at: string
          enabled: boolean | null
          fatigue_aware: boolean | null
          id: string
          metadata: Json | null
          presence_requirement: string | null
          priority: number | null
          quiet_hours_override: boolean | null
          readiness_requirement: string | null
          route_name: string
          target_device_family: string | null
          target_surface: string
          updated_at: string
          urgency_level: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          condition_rules?: Json | null
          created_at?: string
          enabled?: boolean | null
          fatigue_aware?: boolean | null
          id?: string
          metadata?: Json | null
          presence_requirement?: string | null
          priority?: number | null
          quiet_hours_override?: boolean | null
          readiness_requirement?: string | null
          route_name: string
          target_device_family?: string | null
          target_surface: string
          updated_at?: string
          urgency_level?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          condition_rules?: Json | null
          created_at?: string
          enabled?: boolean | null
          fatigue_aware?: boolean | null
          id?: string
          metadata?: Json | null
          presence_requirement?: string | null
          priority?: number | null
          quiet_hours_override?: boolean | null
          readiness_requirement?: string | null
          route_name?: string
          target_device_family?: string | null
          target_surface?: string
          updated_at?: string
          urgency_level?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_mode_policies: {
        Row: {
          analytics_bucket: string
          created_at: string
          id: string
          mix_with_real_allowed: boolean
          mode_key: string
          notes: string | null
        }
        Insert: {
          analytics_bucket: string
          created_at?: string
          id?: string
          mix_with_real_allowed?: boolean
          mode_key: string
          notes?: string | null
        }
        Update: {
          analytics_bucket?: string
          created_at?: string
          id?: string
          mix_with_real_allowed?: boolean
          mode_key?: string
          notes?: string | null
        }
        Relationships: []
      }
      approval_queue: {
        Row: {
          action_summary: string
          action_type: string | null
          advisor_request_id: string | null
          created_at: string
          decided_at: string | null
          decision_reason: string | null
          id: string
          proposed_action: Json
          requested_by: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_summary: string
          action_type?: string | null
          advisor_request_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision_reason?: string | null
          id?: string
          proposed_action?: Json
          requested_by?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_summary?: string
          action_type?: string | null
          advisor_request_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision_reason?: string | null
          id?: string
          proposed_action?: Json
          requested_by?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_queue_advisor_request_id_fkey"
            columns: ["advisor_request_id"]
            isOneToOne: false
            referencedRelation: "advisor_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      architecture_boundary_records: {
        Row: {
          component_path: string
          component_type: string
          created_at: string
          id: string
          is_boundary_violation: boolean
          layer: string
          metadata: Json | null
          migration_priority: string | null
          migration_target: string | null
          notes: string | null
          owns_business_logic: boolean
          updated_at: string
          user_id: string
          violation_type: string | null
        }
        Insert: {
          component_path: string
          component_type?: string
          created_at?: string
          id?: string
          is_boundary_violation?: boolean
          layer?: string
          metadata?: Json | null
          migration_priority?: string | null
          migration_target?: string | null
          notes?: string | null
          owns_business_logic?: boolean
          updated_at?: string
          user_id: string
          violation_type?: string | null
        }
        Update: {
          component_path?: string
          component_type?: string
          created_at?: string
          id?: string
          is_boundary_violation?: boolean
          layer?: string
          metadata?: Json | null
          migration_priority?: string | null
          migration_target?: string | null
          notes?: string | null
          owns_business_logic?: boolean
          updated_at?: string
          user_id?: string
          violation_type?: string | null
        }
        Relationships: []
      }
      asset_market_snapshots: {
        Row: {
          as_of: string
          asset_id: string | null
          confidence: number | null
          daily_change: number | null
          id: string
          liquidity_estimate: number | null
          market_state: string | null
          metadata: Json | null
          monthly_change: number | null
          price: number | null
          source: string | null
          stale: boolean | null
          volatility_estimate: number | null
          weekly_change: number | null
        }
        Insert: {
          as_of?: string
          asset_id?: string | null
          confidence?: number | null
          daily_change?: number | null
          id?: string
          liquidity_estimate?: number | null
          market_state?: string | null
          metadata?: Json | null
          monthly_change?: number | null
          price?: number | null
          source?: string | null
          stale?: boolean | null
          volatility_estimate?: number | null
          weekly_change?: number | null
        }
        Update: {
          as_of?: string
          asset_id?: string | null
          confidence?: number | null
          daily_change?: number | null
          id?: string
          liquidity_estimate?: number | null
          market_state?: string | null
          metadata?: Json | null
          monthly_change?: number | null
          price?: number | null
          source?: string | null
          stale?: boolean | null
          volatility_estimate?: number | null
          weekly_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_market_snapshots_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_master"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_master: {
        Row: {
          asset_class: string
          availability_by_platform: Json | null
          created_at: string
          display_name: string
          exchange_or_venue: string | null
          id: string
          metadata: Json | null
          region: string | null
          risk_tags: string[] | null
          sector_ids: string[] | null
          subtype: string | null
          symbol: string
          tags: string[] | null
          theme_ids: string[] | null
          updated_at: string
        }
        Insert: {
          asset_class?: string
          availability_by_platform?: Json | null
          created_at?: string
          display_name: string
          exchange_or_venue?: string | null
          id?: string
          metadata?: Json | null
          region?: string | null
          risk_tags?: string[] | null
          sector_ids?: string[] | null
          subtype?: string | null
          symbol: string
          tags?: string[] | null
          theme_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          asset_class?: string
          availability_by_platform?: Json | null
          created_at?: string
          display_name?: string
          exchange_or_venue?: string | null
          id?: string
          metadata?: Json | null
          region?: string | null
          risk_tags?: string[] | null
          sector_ids?: string[] | null
          subtype?: string | null
          symbol?: string
          tags?: string[] | null
          theme_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      assistant_role_presences: {
        Row: {
          active: boolean | null
          created_at: string
          description: string | null
          escalation_behavior: string | null
          handoff_targets: string[] | null
          id: string
          intensity: string | null
          metadata: Json | null
          proactive_mode: boolean | null
          role_key: string
          role_name: string
          schedule: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          escalation_behavior?: string | null
          handoff_targets?: string[] | null
          id?: string
          intensity?: string | null
          metadata?: Json | null
          proactive_mode?: boolean | null
          role_key: string
          role_name: string
          schedule?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          description?: string | null
          escalation_behavior?: string | null
          handoff_targets?: string[] | null
          id?: string
          intensity?: string | null
          metadata?: Json | null
          proactive_mode?: boolean | null
          role_key?: string
          role_name?: string
          schedule?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_role_states: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          posture: string | null
          role_key: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          posture?: string | null
          role_key?: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          posture?: string | null
          role_key?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      attention_decisions: {
        Row: {
          created_at: string
          defer_until: string | null
          deferred: boolean | null
          event_ref: string | null
          fatigue_score: number | null
          id: string
          reason: string | null
          routing_decision: string | null
          selected_device_id: string | null
          selected_surface: string | null
          urgency_class: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          defer_until?: string | null
          deferred?: boolean | null
          event_ref?: string | null
          fatigue_score?: number | null
          id?: string
          reason?: string | null
          routing_decision?: string | null
          selected_device_id?: string | null
          selected_surface?: string | null
          urgency_class?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          defer_until?: string | null
          deferred?: boolean | null
          event_ref?: string | null
          fatigue_score?: number | null
          id?: string
          reason?: string | null
          routing_decision?: string | null
          selected_device_id?: string | null
          selected_surface?: string | null
          urgency_class?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor: string
          category: string
          correlation_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          severity: string
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          actor?: string
          category?: string
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          severity?: string
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          actor?: string
          category?: string
          correlation_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          severity?: string
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      auth_connector_separation_audits: {
        Row: {
          created_at: string
          details: Json
          id: string
          issue_type: string
          provider_family_id: string | null
          resolved: boolean
          resolved_at: string | null
          severity: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          id?: string
          issue_type: string
          provider_family_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          id?: string
          issue_type?: string
          provider_family_id?: string | null
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auth_connector_separation_audits_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_kill_switches: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          created_at: string
          deactivated_at: string | null
          deactivated_by: string | null
          enabled: boolean
          id: string
          metadata: Json | null
          reason: string | null
          scope: string
          scope_id: string | null
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
          id?: string
          metadata?: Json | null
          reason?: string | null
          scope?: string
          scope_id?: string | null
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
          id?: string
          metadata?: Json | null
          reason?: string | null
          scope?: string
          scope_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      behavioral_regressions: {
        Row: {
          created_at: string
          description: string | null
          domain: string | null
          first_seen_at: string
          id: string
          journey_id: string | null
          last_seen_at: string
          linked_commit: string | null
          occurrence_count: number | null
          regression_type: string | null
          resolved: boolean | null
          resolved_at: string | null
          route: string | null
          severity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain?: string | null
          first_seen_at?: string
          id?: string
          journey_id?: string | null
          last_seen_at?: string
          linked_commit?: string | null
          occurrence_count?: number | null
          regression_type?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          route?: string | null
          severity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string | null
          first_seen_at?: string
          id?: string
          journey_id?: string | null
          last_seen_at?: string
          linked_commit?: string | null
          occurrence_count?: number | null
          regression_type?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          route?: string | null
          severity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bills: {
        Row: {
          amount: number
          auto_pay: boolean | null
          category: string | null
          created_at: string
          due_date: string
          frequency: string | null
          id: string
          linked_document: string | null
          notes: string | null
          payee: string
          recurring: boolean | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          auto_pay?: boolean | null
          category?: string | null
          created_at?: string
          due_date: string
          frequency?: string | null
          id?: string
          linked_document?: string | null
          notes?: string | null
          payee: string
          recurring?: boolean | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_pay?: boolean | null
          category?: string | null
          created_at?: string
          due_date?: string
          frequency?: string | null
          id?: string
          linked_document?: string | null
          notes?: string | null
          payee?: string
          recurring?: boolean | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          date: string | null
          details: Json | null
          id: string
          provider: string | null
          status: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          details?: Json | null
          id?: string
          provider?: string | null
          status?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          details?: Json | null
          id?: string
          provider?: string | null
          status?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      boot_phase_logs: {
        Row: {
          created_at: string | null
          duration_ms: number | null
          id: string
          metadata: Json | null
          phase: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          phase: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_ms?: number | null
          id?: string
          metadata?: Json | null
          phase?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      boundary_policies: {
        Row: {
          active: boolean | null
          boundary_type: string
          created_at: string
          id: string
          policy_json: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          boundary_type?: string
          created_at?: string
          id?: string
          policy_json?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          boundary_type?: string
          created_at?: string
          id?: string
          policy_json?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      brand_kits: {
        Row: {
          brand_rules: Json | null
          colors: Json | null
          component_styles: Json | null
          created_at: string
          id: string
          image_direction: string[] | null
          logo_assets: Json | null
          presence_profile_id: string | null
          style_tokens: Json | null
          tone_descriptors: string[] | null
          typography: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_rules?: Json | null
          colors?: Json | null
          component_styles?: Json | null
          created_at?: string
          id?: string
          image_direction?: string[] | null
          logo_assets?: Json | null
          presence_profile_id?: string | null
          style_tokens?: Json | null
          tone_descriptors?: string[] | null
          typography?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_rules?: Json | null
          colors?: Json | null
          component_styles?: Json | null
          created_at?: string
          id?: string
          image_direction?: string[] | null
          logo_assets?: Json | null
          presence_profile_id?: string | null
          style_tokens?: Json | null
          tone_descriptors?: string[] | null
          typography?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_presence_profile_id_fkey"
            columns: ["presence_profile_id"]
            isOneToOne: false
            referencedRelation: "digital_presence_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          allocated: number
          category: string
          created_at: string
          id: string
          period: string
          spent: number
          user_id: string
        }
        Insert: {
          allocated?: number
          category: string
          created_at?: string
          id?: string
          period?: string
          spent?: number
          user_id: string
        }
        Update: {
          allocated?: number
          category?: string
          created_at?: string
          id?: string
          period?: string
          spent?: number
          user_id?: string
        }
        Relationships: []
      }
      cai_continuity_sessions: {
        Row: {
          completed_at: string | null
          context_ref: string | null
          id: string
          source_device_id: string | null
          source_surface: string | null
          started_at: string
          status: string | null
          target_device_id: string | null
          target_surface: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          context_ref?: string | null
          id?: string
          source_device_id?: string | null
          source_surface?: string | null
          started_at?: string
          status?: string | null
          target_device_id?: string | null
          target_surface?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          context_ref?: string | null
          id?: string
          source_device_id?: string | null
          source_surface?: string | null
          started_at?: string
          status?: string | null
          target_device_id?: string | null
          target_surface?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          domain: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          location: string | null
          metadata: Json | null
          overlap_warning: boolean | null
          priority: string | null
          recurrence: string | null
          start_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          overlap_warning?: boolean | null
          priority?: string | null
          recurrence?: string | null
          start_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          overlap_warning?: boolean | null
          priority?: string | null
          recurrence?: string | null
          start_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      capabilities: {
        Row: {
          description: string | null
          domain: string
          enabled: boolean | null
          id: string
          name: string
          risk_tier: string
        }
        Insert: {
          description?: string | null
          domain: string
          enabled?: boolean | null
          id?: string
          name: string
          risk_tier?: string
        }
        Update: {
          description?: string | null
          domain?: string
          enabled?: boolean | null
          id?: string
          name?: string
          risk_tier?: string
        }
        Relationships: []
      }
      capability_definitions: {
        Row: {
          action_type: string
          active: boolean
          ai_eligible: boolean
          capability_key: string
          contract_schema: Json | null
          created_at: string
          description: string | null
          display_name: string
          domain: string
          id: string
          metadata: Json | null
          portability_class: string
          requires_approval: boolean
          requires_auth: boolean
          risk_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_type?: string
          active?: boolean
          ai_eligible?: boolean
          capability_key: string
          contract_schema?: Json | null
          created_at?: string
          description?: string | null
          display_name: string
          domain?: string
          id?: string
          metadata?: Json | null
          portability_class?: string
          requires_approval?: boolean
          requires_auth?: boolean
          risk_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_type?: string
          active?: boolean
          ai_eligible?: boolean
          capability_key?: string
          contract_schema?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string
          domain?: string
          id?: string
          metadata?: Json | null
          portability_class?: string
          requires_approval?: boolean
          requires_auth?: boolean
          risk_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      capability_portability_records: {
        Row: {
          blockers: string[]
          capability_id: string
          created_at: string
          evidence: Json
          id: string
          portability_score: number
          status: string
          surface_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string[]
          capability_id: string
          created_at?: string
          evidence?: Json
          id?: string
          portability_score?: number
          status?: string
          surface_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string[]
          capability_id?: string
          created_at?: string
          evidence?: Json
          id?: string
          portability_score?: number
          status?: string
          surface_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capability_portability_records_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capability_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capability_portability_records_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      capability_reality_bindings: {
        Row: {
          allowed_modes: Json
          allows_demo_provider: boolean
          allows_internal_test_provider: boolean
          capability_key: string
          created_at: string
          id: string
          launch_honesty_class: string
          preferred_mode_key: string
          requires_real_provider: boolean
          side_effect_policy_key: string
          surface_class_id: string | null
          updated_at: string
        }
        Insert: {
          allowed_modes?: Json
          allows_demo_provider?: boolean
          allows_internal_test_provider?: boolean
          capability_key: string
          created_at?: string
          id?: string
          launch_honesty_class?: string
          preferred_mode_key: string
          requires_real_provider?: boolean
          side_effect_policy_key: string
          surface_class_id?: string | null
          updated_at?: string
        }
        Update: {
          allowed_modes?: Json
          allows_demo_provider?: boolean
          allows_internal_test_provider?: boolean
          capability_key?: string
          created_at?: string
          id?: string
          launch_honesty_class?: string
          preferred_mode_key?: string
          requires_real_provider?: boolean
          side_effect_policy_key?: string
          surface_class_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capability_reality_bindings_surface_class_id_fkey"
            columns: ["surface_class_id"]
            isOneToOne: false
            referencedRelation: "surface_class_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      capability_registry: {
        Row: {
          approval_type: string | null
          autonomy_tier: string | null
          capability_class: string
          capability_id: string
          created_at: string
          description: string | null
          entitlement_dependency: string | null
          event_subjects: string[] | null
          feature_id: string | null
          id: string
          metadata: Json | null
          name: string
          owner_service: string
          receipt_requirement: string | null
          replayability_class: string | null
          required_policy_family: string | null
          required_scopes: string[] | null
          risk_tier: string | null
          sandbox_support: boolean | null
          status: string | null
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          approval_type?: string | null
          autonomy_tier?: string | null
          capability_class?: string
          capability_id: string
          created_at?: string
          description?: string | null
          entitlement_dependency?: string | null
          event_subjects?: string[] | null
          feature_id?: string | null
          id?: string
          metadata?: Json | null
          name: string
          owner_service: string
          receipt_requirement?: string | null
          replayability_class?: string | null
          required_policy_family?: string | null
          required_scopes?: string[] | null
          risk_tier?: string | null
          sandbox_support?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          approval_type?: string | null
          autonomy_tier?: string | null
          capability_class?: string
          capability_id?: string
          created_at?: string
          description?: string | null
          entitlement_dependency?: string | null
          event_subjects?: string[] | null
          feature_id?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          owner_service?: string
          receipt_requirement?: string | null
          replayability_class?: string | null
          required_policy_family?: string | null
          required_scopes?: string[] | null
          risk_tier?: string | null
          sandbox_support?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      capability_surface_bindings: {
        Row: {
          adaptation_notes: string | null
          binding_status: string
          capability_id: string
          created_at: string
          id: string
          interaction_pattern: string | null
          metadata: Json | null
          priority: number | null
          surface_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adaptation_notes?: string | null
          binding_status?: string
          capability_id: string
          created_at?: string
          id?: string
          interaction_pattern?: string | null
          metadata?: Json | null
          priority?: number | null
          surface_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adaptation_notes?: string | null
          binding_status?: string
          capability_id?: string
          created_at?: string
          id?: string
          interaction_pattern?: string | null
          metadata?: Json | null
          priority?: number | null
          surface_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "capability_surface_bindings_capability_id_fkey"
            columns: ["capability_id"]
            isOneToOne: false
            referencedRelation: "capability_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "capability_surface_bindings_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      capital_allocations: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          id: string
          notes: string | null
          period: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          created_at?: string | null
          id?: string
          notes?: string | null
          period?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          period?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      capital_purpose_buckets: {
        Row: {
          created_at: string
          current_allocation_pct: number | null
          id: string
          label: string
          notes: string | null
          policy_limits: Json | null
          target_allocation_pct: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_allocation_pct?: number | null
          id?: string
          label: string
          notes?: string | null
          policy_limits?: Json | null
          target_allocation_pct?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_allocation_pct?: number | null
          id?: string
          label?: string
          notes?: string | null
          policy_limits?: Json | null
          target_allocation_pct?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      catalyst_events: {
        Row: {
          asset_ids: string[] | null
          catalyst_type: string
          created_at: string
          id: string
          importance: string | null
          scenario_notes: string | null
          scheduled_at: string | null
          source: string | null
          theme_ids: string[] | null
          title: string
          uncertainty_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_ids?: string[] | null
          catalyst_type?: string
          created_at?: string
          id?: string
          importance?: string | null
          scenario_notes?: string | null
          scheduled_at?: string | null
          source?: string | null
          theme_ids?: string[] | null
          title: string
          uncertainty_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_ids?: string[] | null
          catalyst_type?: string
          created_at?: string
          id?: string
          importance?: string | null
          scenario_notes?: string | null
          scheduled_at?: string | null
          source?: string | null
          theme_ids?: string[] | null
          title?: string
          uncertainty_level?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      change_impact_records: {
        Row: {
          affected_contracts: Json
          affected_domains: Json
          affected_journeys: Json
          affected_launch_gates: Json
          affected_probes: Json
          affected_routes: Json
          bundle_perf_risks: Json
          change_title: string
          change_type: string
          created_at: string
          id: string
          migration_risks: Json
          rollout_risks: Json
          severity: string
          source_blueprint_id: string | null
          status: string
          trust_risks: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_contracts?: Json
          affected_domains?: Json
          affected_journeys?: Json
          affected_launch_gates?: Json
          affected_probes?: Json
          affected_routes?: Json
          bundle_perf_risks?: Json
          change_title: string
          change_type?: string
          created_at?: string
          id?: string
          migration_risks?: Json
          rollout_risks?: Json
          severity?: string
          source_blueprint_id?: string | null
          status?: string
          trust_risks?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_contracts?: Json
          affected_domains?: Json
          affected_journeys?: Json
          affected_launch_gates?: Json
          affected_probes?: Json
          affected_routes?: Json
          bundle_perf_risks?: Json
          change_title?: string
          change_type?: string
          created_at?: string
          id?: string
          migration_risks?: Json
          rollout_risks?: Json
          severity?: string
          source_blueprint_id?: string | null
          status?: string
          trust_risks?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_impact_records_source_blueprint_id_fkey"
            columns: ["source_blueprint_id"]
            isOneToOne: false
            referencedRelation: "feature_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      change_plans: {
        Row: {
          approval_required: boolean | null
          confidence: number | null
          created_at: string
          generated_by_agent_ids: string[] | null
          id: string
          policy_check_result: Json | null
          preview_artifacts: Json | null
          proposed_diff_summary: string | null
          reason: string | null
          risk_class: string | null
          site_id: string
          status: string
          target_id: string | null
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_required?: boolean | null
          confidence?: number | null
          created_at?: string
          generated_by_agent_ids?: string[] | null
          id?: string
          policy_check_result?: Json | null
          preview_artifacts?: Json | null
          proposed_diff_summary?: string | null
          reason?: string | null
          risk_class?: string | null
          site_id: string
          status?: string
          target_id?: string | null
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_required?: boolean | null
          confidence?: number | null
          created_at?: string
          generated_by_agent_ids?: string[] | null
          id?: string
          policy_check_result?: Json | null
          preview_artifacts?: Json | null
          proposed_diff_summary?: string | null
          reason?: string | null
          risk_class?: string | null
          site_id?: string
          status?: string
          target_id?: string | null
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_plans_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      chief_digital_synthesis: {
        Row: {
          aligned_views: Json | null
          confidence_summary: Json | null
          created_at: string
          divergent_views: Json | null
          highest_priority_fix: string | null
          id: string
          owner_id: string | null
          owner_type: string
          recommended_next_step: string | null
          strongest_opportunity: string | null
          strongest_risk: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aligned_views?: Json | null
          confidence_summary?: Json | null
          created_at?: string
          divergent_views?: Json | null
          highest_priority_fix?: string | null
          id?: string
          owner_id?: string | null
          owner_type: string
          recommended_next_step?: string | null
          strongest_opportunity?: string | null
          strongest_risk?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aligned_views?: Json | null
          confidence_summary?: Json | null
          created_at?: string
          divergent_views?: Json | null
          highest_priority_fix?: string | null
          id?: string
          owner_id?: string | null
          owner_type?: string
          recommended_next_step?: string | null
          strongest_opportunity?: string | null
          strongest_risk?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chief_synthesis_records: {
        Row: {
          aligned_views: Json | null
          confidence_summary: Json | null
          created_at: string
          divergent_views: Json | null
          id: string
          key_unknown: string | null
          owner_id: string | null
          owner_type: string
          recommended_next_step: string | null
          strongest_opportunity: string | null
          strongest_risk: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aligned_views?: Json | null
          confidence_summary?: Json | null
          created_at?: string
          divergent_views?: Json | null
          id?: string
          key_unknown?: string | null
          owner_id?: string | null
          owner_type?: string
          recommended_next_step?: string | null
          strongest_opportunity?: string | null
          strongest_risk?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aligned_views?: Json | null
          confidence_summary?: Json | null
          created_at?: string
          divergent_views?: Json | null
          id?: string
          key_unknown?: string | null
          owner_id?: string | null
          owner_type?: string
          recommended_next_step?: string | null
          strongest_opportunity?: string | null
          strongest_risk?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ci_jobs: {
        Row: {
          artifact_urls: Json | null
          ci_run_id: string | null
          created_at: string
          duration_ms: number | null
          exit_code: number | null
          id: string
          job_name: string
          log_excerpt: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_urls?: Json | null
          ci_run_id?: string | null
          created_at?: string
          duration_ms?: number | null
          exit_code?: number | null
          id?: string
          job_name: string
          log_excerpt?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_urls?: Json | null
          ci_run_id?: string | null
          created_at?: string
          duration_ms?: number | null
          exit_code?: number | null
          id?: string
          job_name?: string
          log_excerpt?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ci_jobs_ci_run_id_fkey"
            columns: ["ci_run_id"]
            isOneToOne: false
            referencedRelation: "ci_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ci_runs: {
        Row: {
          artifact_urls: Json | null
          branch: string | null
          commit_sha: string | null
          completed_at: string | null
          created_at: string
          environment: string | null
          id: string
          started_at: string | null
          status: string | null
          summary: Json | null
          trigger_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_urls?: Json | null
          branch?: string | null
          commit_sha?: string | null
          completed_at?: string | null
          created_at?: string
          environment?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          summary?: Json | null
          trigger_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_urls?: Json | null
          branch?: string | null
          commit_sha?: string | null
          completed_at?: string | null
          created_at?: string
          environment?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          summary?: Json | null
          trigger_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      command_orchestrations: {
        Row: {
          actor_id: string
          capability_key: string | null
          created_at: string
          execution_state: string | null
          id: string
          intent_resolution_id: string | null
          policy_decision_ref: string | null
          receipt_id: string | null
          trust_decision_ref: string | null
          updated_at: string
          workflow_ref: string | null
        }
        Insert: {
          actor_id: string
          capability_key?: string | null
          created_at?: string
          execution_state?: string | null
          id?: string
          intent_resolution_id?: string | null
          policy_decision_ref?: string | null
          receipt_id?: string | null
          trust_decision_ref?: string | null
          updated_at?: string
          workflow_ref?: string | null
        }
        Update: {
          actor_id?: string
          capability_key?: string | null
          created_at?: string
          execution_state?: string | null
          id?: string
          intent_resolution_id?: string | null
          policy_decision_ref?: string | null
          receipt_id?: string | null
          trust_decision_ref?: string | null
          updated_at?: string
          workflow_ref?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "command_orchestrations_intent_resolution_id_fkey"
            columns: ["intent_resolution_id"]
            isOneToOne: false
            referencedRelation: "intent_resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_log: {
        Row: {
          body: string | null
          channel: string
          contact_name: string | null
          created_at: string | null
          direction: string | null
          id: string
          metadata: Json | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          channel: string
          contact_name?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          contact_name?: string | null
          created_at?: string | null
          direction?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          body: string | null
          created_at: string
          customer_id: string | null
          id: string
          invoice_id: string | null
          lead_id: string | null
          opportunity_id: string | null
          proof_of_send: string | null
          requires_approval: boolean | null
          sent_at: string | null
          status: string
          subject: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          lead_id?: string | null
          opportunity_id?: string | null
          proof_of_send?: string | null
          requires_approval?: boolean | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          lead_id?: string | null
          opportunity_id?: string | null
          proof_of_send?: string | null
          requires_approval?: boolean | null
          sent_at?: string | null
          status?: string
          subject?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      compute_budget_snapshots: {
        Row: {
          allocated_cents: number
          anomaly_flags: string[] | null
          cache_hit_rate: number
          created_at: string
          deep_reasoning_pct: number
          domain: string
          id: string
          margin_posture: string
          model_mix: Json
          period: string
          snapshot_at: string
          used_cents: number
          user_id: string
        }
        Insert: {
          allocated_cents?: number
          anomaly_flags?: string[] | null
          cache_hit_rate?: number
          created_at?: string
          deep_reasoning_pct?: number
          domain?: string
          id?: string
          margin_posture?: string
          model_mix?: Json
          period?: string
          snapshot_at?: string
          used_cents?: number
          user_id: string
        }
        Update: {
          allocated_cents?: number
          anomaly_flags?: string[] | null
          cache_hit_rate?: number
          created_at?: string
          deep_reasoning_pct?: number
          domain?: string
          id?: string
          margin_posture?: string
          model_mix?: Json
          period?: string
          snapshot_at?: string
          used_cents?: number
          user_id?: string
        }
        Relationships: []
      }
      connected_devices: {
        Row: {
          app_version: string | null
          approval_eligible: boolean | null
          biometric_capable: boolean | null
          created_at: string
          device_family_id: string | null
          device_identifier: string | null
          device_name: string
          health_status: string | null
          id: string
          is_primary: boolean | null
          last_seen_at: string | null
          metadata: Json | null
          mode: string | null
          notification_eligible: boolean | null
          os_version: string | null
          platform: string | null
          push_token: string | null
          reachable: boolean | null
          trust_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          app_version?: string | null
          approval_eligible?: boolean | null
          biometric_capable?: boolean | null
          created_at?: string
          device_family_id?: string | null
          device_identifier?: string | null
          device_name: string
          health_status?: string | null
          id?: string
          is_primary?: boolean | null
          last_seen_at?: string | null
          metadata?: Json | null
          mode?: string | null
          notification_eligible?: boolean | null
          os_version?: string | null
          platform?: string | null
          push_token?: string | null
          reachable?: boolean | null
          trust_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          app_version?: string | null
          approval_eligible?: boolean | null
          biometric_capable?: boolean | null
          created_at?: string
          device_family_id?: string | null
          device_identifier?: string | null
          device_name?: string
          health_status?: string | null
          id?: string
          is_primary?: boolean | null
          last_seen_at?: string | null
          metadata?: Json | null
          mode?: string | null
          notification_eligible?: boolean | null
          os_version?: string | null
          platform?: string | null
          push_token?: string | null
          reachable?: boolean | null
          trust_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connected_devices_device_family_id_fkey"
            columns: ["device_family_id"]
            isOneToOne: false
            referencedRelation: "device_families"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_investment_platforms: {
        Row: {
          account_ids: string[] | null
          auth_status: string
          created_at: string
          id: string
          last_sync_at: string | null
          metadata: Json | null
          platform_type: string
          provider_key: string | null
          provider_name: string
          read_permissions: string[] | null
          region_restrictions: string[] | null
          supported_asset_classes: string[] | null
          sync_status: string
          trade_permissions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_ids?: string[] | null
          auth_status?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          platform_type?: string
          provider_key?: string | null
          provider_name: string
          read_permissions?: string[] | null
          region_restrictions?: string[] | null
          supported_asset_classes?: string[] | null
          sync_status?: string
          trade_permissions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_ids?: string[] | null
          auth_status?: string
          created_at?: string
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          platform_type?: string
          provider_key?: string | null
          provider_name?: string
          read_permissions?: string[] | null
          region_restrictions?: string[] | null
          supported_asset_classes?: string[] | null
          sync_status?: string
          trade_permissions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connected_service_links: {
        Row: {
          account_label: string | null
          connection_status: string | null
          created_at: string
          disconnected_at: string | null
          entity_id: string | null
          external_account_email: string | null
          external_account_id: string | null
          external_account_name: string | null
          granted_scopes: string[] | null
          health_status: string | null
          id: string
          last_health_check_at: string | null
          last_sync_at: string | null
          metadata: Json | null
          mode: string | null
          permission_level: string | null
          provider_capability_id: string
          provider_family_id: string
          reauth_needed: boolean | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          account_label?: string | null
          connection_status?: string | null
          created_at?: string
          disconnected_at?: string | null
          entity_id?: string | null
          external_account_email?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          granted_scopes?: string[] | null
          health_status?: string | null
          id?: string
          last_health_check_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          mode?: string | null
          permission_level?: string | null
          provider_capability_id: string
          provider_family_id: string
          reauth_needed?: boolean | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          account_label?: string | null
          connection_status?: string | null
          created_at?: string
          disconnected_at?: string | null
          entity_id?: string | null
          external_account_email?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          granted_scopes?: string[] | null
          health_status?: string | null
          id?: string
          last_health_check_at?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          mode?: string | null
          permission_level?: string | null
          provider_capability_id?: string
          provider_family_id?: string
          reauth_needed?: boolean | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connected_service_links_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connected_service_links_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_accounts: {
        Row: {
          account_email: string | null
          connected_at: string | null
          connector_type: string
          created_at: string
          demo_mode: boolean
          disconnected_at: string | null
          display_name: string | null
          id: string
          metadata: Json | null
          provider_account_id: string | null
          registry_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_email?: string | null
          connected_at?: string | null
          connector_type: string
          created_at?: string
          demo_mode?: boolean
          disconnected_at?: string | null
          display_name?: string | null
          id?: string
          metadata?: Json | null
          provider_account_id?: string | null
          registry_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_email?: string | null
          connected_at?: string | null
          connector_type?: string
          created_at?: string
          demo_mode?: boolean
          disconnected_at?: string | null
          display_name?: string | null
          id?: string
          metadata?: Json | null
          provider_account_id?: string | null
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
      connector_auth_sessions: {
        Row: {
          code_verifier: string | null
          completed_at: string | null
          connector_type: string
          created_at: string
          error_message: string | null
          expires_at: string
          id: string
          redirect_uri: string | null
          scopes: string[] | null
          state: string
          status: string
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          completed_at?: string | null
          connector_type: string
          created_at?: string
          error_message?: string | null
          expires_at: string
          id?: string
          redirect_uri?: string | null
          scopes?: string[] | null
          state: string
          status?: string
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          completed_at?: string | null
          connector_type?: string
          created_at?: string
          error_message?: string | null
          expires_at?: string
          id?: string
          redirect_uri?: string | null
          scopes?: string[] | null
          state?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_configs: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_sync_at: string | null
          service: string
          status: string
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
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_credentials: {
        Row: {
          connector_id: string
          created_at: string
          encrypted_token: string | null
          id: string
          provider: string
          status: string
          user_id: string
        }
        Insert: {
          connector_id: string
          created_at?: string
          encrypted_token?: string | null
          id?: string
          provider: string
          status?: string
          user_id: string
        }
        Update: {
          connector_id?: string
          created_at?: string
          encrypted_token?: string | null
          id?: string
          provider?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_demo_bindings: {
        Row: {
          active: boolean
          connector_type: string
          created_at: string
          id: string
          metadata: Json | null
          pre_linked: boolean
          registry_id: string | null
          scenario_name: string
          synthetic_data: Json | null
          synthetic_files: Json | null
          synthetic_messages: Json | null
          synthetic_sync_history: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          connector_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pre_linked?: boolean
          registry_id?: string | null
          scenario_name: string
          synthetic_data?: Json | null
          synthetic_files?: Json | null
          synthetic_messages?: Json | null
          synthetic_sync_history?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          connector_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          pre_linked?: boolean
          registry_id?: string | null
          scenario_name?: string
          synthetic_data?: Json | null
          synthetic_files?: Json | null
          synthetic_messages?: Json | null
          synthetic_sync_history?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_demo_bindings_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "connector_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_disconnection_events: {
        Row: {
          connected_service_account_id: string
          created_at: string
          disconnect_reason: string
          disconnected_at: string
          id: string
          initiated_by: string
          metadata: Json
          previous_permission_level: string | null
          previous_scopes: Json
          provider_capability_id: string | null
          provider_family_id: string | null
          user_id: string
        }
        Insert: {
          connected_service_account_id: string
          created_at?: string
          disconnect_reason?: string
          disconnected_at?: string
          id?: string
          initiated_by?: string
          metadata?: Json
          previous_permission_level?: string | null
          previous_scopes?: Json
          provider_capability_id?: string | null
          provider_family_id?: string | null
          user_id: string
        }
        Update: {
          connected_service_account_id?: string
          created_at?: string
          disconnect_reason?: string
          disconnected_at?: string
          id?: string
          initiated_by?: string
          metadata?: Json
          previous_permission_level?: string | null
          previous_scopes?: Json
          provider_capability_id?: string | null
          provider_family_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_disconnection_event_connected_service_account_id_fkey"
            columns: ["connected_service_account_id"]
            isOneToOne: false
            referencedRelation: "connected_service_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_disconnection_event_connected_service_account_id_fkey"
            columns: ["connected_service_account_id"]
            isOneToOne: false
            referencedRelation: "v_connected_accounts_center"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_disconnection_events_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_disconnection_events_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_health_records: {
        Row: {
          account_id: string | null
          checked_at: string
          consecutive_failures: number
          created_at: string
          error_message: string | null
          health_status: string
          id: string
          last_successful_sync: string | null
          latency_ms: number | null
          metadata: Json | null
          provider_capability_id: string | null
          registry_id: string | null
          token_valid: boolean | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          checked_at?: string
          consecutive_failures?: number
          created_at?: string
          error_message?: string | null
          health_status?: string
          id?: string
          last_successful_sync?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          provider_capability_id?: string | null
          registry_id?: string | null
          token_valid?: boolean | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          checked_at?: string
          consecutive_failures?: number
          created_at?: string
          error_message?: string | null
          health_status?: string
          id?: string
          last_successful_sync?: string | null
          latency_ms?: number | null
          metadata?: Json | null
          provider_capability_id?: string | null
          registry_id?: string | null
          token_valid?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_health_records_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connector_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_health_records_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connector_health_records_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "connector_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_launch_readiness: {
        Row: {
          blockers: string[] | null
          classification: string | null
          connector_type: string
          created_at: string
          demo_available: boolean
          disconnect_working: boolean
          evidence: Json | null
          health_reporting: boolean
          id: string
          last_verified_at: string | null
          oauth_working: boolean
          readiness_stage: string
          registry_id: string
          sync_working: boolean
          token_storage_working: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string[] | null
          classification?: string | null
          connector_type: string
          created_at?: string
          demo_available?: boolean
          disconnect_working?: boolean
          evidence?: Json | null
          health_reporting?: boolean
          id?: string
          last_verified_at?: string | null
          oauth_working?: boolean
          readiness_stage?: string
          registry_id: string
          sync_working?: boolean
          token_storage_working?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string[] | null
          classification?: string | null
          connector_type?: string
          created_at?: string
          demo_available?: boolean
          disconnect_working?: boolean
          evidence?: Json | null
          health_reporting?: boolean
          id?: string
          last_verified_at?: string | null
          oauth_working?: boolean
          readiness_stage?: string
          registry_id?: string
          sync_working?: boolean
          token_storage_working?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_launch_readiness_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "connector_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_oauth_flows: {
        Row: {
          authorization_url: string | null
          callback_received: boolean | null
          connector_key: string
          created_at: string
          error_message: string | null
          flow_type: string
          id: string
          last_refresh_at: string | null
          metadata: Json | null
          provider_name: string
          refresh_count: number | null
          scopes_granted: string[] | null
          scopes_requested: string[] | null
          status: string
          token_expires_at: string | null
          token_obtained: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          authorization_url?: string | null
          callback_received?: boolean | null
          connector_key: string
          created_at?: string
          error_message?: string | null
          flow_type?: string
          id?: string
          last_refresh_at?: string | null
          metadata?: Json | null
          provider_name: string
          refresh_count?: number | null
          scopes_granted?: string[] | null
          scopes_requested?: string[] | null
          status?: string
          token_expires_at?: string | null
          token_obtained?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          authorization_url?: string | null
          callback_received?: boolean | null
          connector_key?: string
          created_at?: string
          error_message?: string | null
          flow_type?: string
          id?: string
          last_refresh_at?: string | null
          metadata?: Json | null
          provider_name?: string
          refresh_count?: number | null
          scopes_granted?: string[] | null
          scopes_requested?: string[] | null
          status?: string
          token_expires_at?: string | null
          token_obtained?: boolean | null
          updated_at?: string
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
          metadata: Json | null
          reauth_required: boolean
          refresh_failure_count: number
          refresh_token: string | null
          scopes: string[] | null
          token_type: string | null
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
          metadata?: Json | null
          reauth_required?: boolean
          refresh_failure_count?: number
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
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
          metadata?: Json | null
          reauth_required?: boolean
          refresh_failure_count?: number
          refresh_token?: string | null
          scopes?: string[] | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_oauth_tokens_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connector_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_policies: {
        Row: {
          allowed_scopes: string[] | null
          approval_required_for_write: boolean
          blocked_operations: string[] | null
          created_at: string
          demo_blocks_write: boolean
          id: string
          max_sync_records: number | null
          metadata: Json | null
          read_only: boolean
          registry_id: string
          sync_interval_minutes: number | null
          updated_at: string
          user_id: string
          write_enabled: boolean
        }
        Insert: {
          allowed_scopes?: string[] | null
          approval_required_for_write?: boolean
          blocked_operations?: string[] | null
          created_at?: string
          demo_blocks_write?: boolean
          id?: string
          max_sync_records?: number | null
          metadata?: Json | null
          read_only?: boolean
          registry_id: string
          sync_interval_minutes?: number | null
          updated_at?: string
          user_id: string
          write_enabled?: boolean
        }
        Update: {
          allowed_scopes?: string[] | null
          approval_required_for_write?: boolean
          blocked_operations?: string[] | null
          created_at?: string
          demo_blocks_write?: boolean
          id?: string
          max_sync_records?: number | null
          metadata?: Json | null
          read_only?: boolean
          registry_id?: string
          sync_interval_minutes?: number | null
          updated_at?: string
          user_id?: string
          write_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "connector_policies_registry_id_fkey"
            columns: ["registry_id"]
            isOneToOne: false
            referencedRelation: "connector_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_receipts: {
        Row: {
          account_id: string | null
          connector_type: string
          created_at: string
          details: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          connector_type: string
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          connector_type?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_receipts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connector_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_registry: {
        Row: {
          active: boolean
          auth_method: string
          connector_class: string
          connector_id: string
          created_at: string
          description: string | null
          display_name: string
          health_model: string | null
          icon_url: string | null
          id: string
          launch_stage: string
          metadata: Json | null
          mode_support: string[]
          policy_profile: string | null
          provider: string
          read_supported: boolean
          sync_supported: boolean
          updated_at: string
          user_id: string
          write_supported: boolean
        }
        Insert: {
          active?: boolean
          auth_method?: string
          connector_class?: string
          connector_id: string
          created_at?: string
          description?: string | null
          display_name: string
          health_model?: string | null
          icon_url?: string | null
          id?: string
          launch_stage?: string
          metadata?: Json | null
          mode_support?: string[]
          policy_profile?: string | null
          provider: string
          read_supported?: boolean
          sync_supported?: boolean
          updated_at?: string
          user_id: string
          write_supported?: boolean
        }
        Update: {
          active?: boolean
          auth_method?: string
          connector_class?: string
          connector_id?: string
          created_at?: string
          description?: string | null
          display_name?: string
          health_model?: string | null
          icon_url?: string | null
          id?: string
          launch_stage?: string
          metadata?: Json | null
          mode_support?: string[]
          policy_profile?: string | null
          provider?: string
          read_supported?: boolean
          sync_supported?: boolean
          updated_at?: string
          user_id?: string
          write_supported?: boolean
        }
        Relationships: []
      }
      connector_sync_history: {
        Row: {
          completed_at: string | null
          connector_id: string
          created_at: string
          error: string | null
          id: string
          records_synced: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          connector_id: string
          created_at?: string
          error?: string | null
          id?: string
          records_synced?: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          connector_id?: string
          created_at?: string
          error?: string | null
          id?: string
          records_synced?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_sync_history_connector_id_fkey"
            columns: ["connector_id"]
            isOneToOne: false
            referencedRelation: "connector_configs"
            referencedColumns: ["id"]
          },
        ]
      }
      connector_sync_jobs: {
        Row: {
          conflict_resolution: string
          connector_key: string
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          next_sync_at: string | null
          records_failed: number | null
          records_synced: number | null
          schedule_cron: string | null
          status: string
          sync_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conflict_resolution?: string
          connector_key: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          next_sync_at?: string | null
          records_failed?: number | null
          records_synced?: number | null
          schedule_cron?: string | null
          status?: string
          sync_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conflict_resolution?: string
          connector_key?: string
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          next_sync_at?: string | null
          records_failed?: number | null
          records_synced?: number | null
          schedule_cron?: string | null
          status?: string
          sync_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_sync_logs: {
        Row: {
          connector_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          metadata: Json | null
          records_synced: number | null
          service: string
          status: string
          user_id: string
        }
        Insert: {
          connector_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          service: string
          status?: string
          user_id: string
        }
        Update: {
          connector_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          service?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      connector_sync_runs: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          cursor_position: string | null
          duration_ms: number | null
          errors: Json | null
          id: string
          metadata: Json | null
          records_failed: number
          records_fetched: number
          records_imported: number
          records_skipped: number
          started_at: string
          status: string
          sync_type: string
          trigger: string
          user_id: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          cursor_position?: string | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          records_failed?: number
          records_fetched?: number
          records_imported?: number
          records_skipped?: number
          started_at?: string
          status?: string
          sync_type?: string
          trigger?: string
          user_id: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          cursor_position?: string | null
          duration_ms?: number | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          records_failed?: number
          records_fetched?: number
          records_imported?: number
          records_skipped?: number
          started_at?: string
          status?: string
          sync_type?: string
          trigger?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connector_sync_runs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "connector_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_ledger: {
        Row: {
          connection_context: Json | null
          consent_status: string | null
          consent_type: string | null
          consent_version: number | null
          created_at: string
          denied_scopes: string[] | null
          entity_id: string | null
          granted_at: string
          granted_scopes: string[] | null
          id: string
          mode: string | null
          notes: string | null
          oauth_client_id: string | null
          previous_scopes: Json | null
          provider_capability_id: string | null
          provider_family_id: string | null
          revocation_reason: string | null
          revoked_at: string | null
          source_flow: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          connection_context?: Json | null
          consent_status?: string | null
          consent_type?: string | null
          consent_version?: number | null
          created_at?: string
          denied_scopes?: string[] | null
          entity_id?: string | null
          granted_at?: string
          granted_scopes?: string[] | null
          id?: string
          mode?: string | null
          notes?: string | null
          oauth_client_id?: string | null
          previous_scopes?: Json | null
          provider_capability_id?: string | null
          provider_family_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          source_flow?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          connection_context?: Json | null
          consent_status?: string | null
          consent_type?: string | null
          consent_version?: number | null
          created_at?: string
          denied_scopes?: string[] | null
          entity_id?: string | null
          granted_at?: string
          granted_scopes?: string[] | null
          id?: string
          mode?: string | null
          notes?: string | null
          oauth_client_id?: string | null
          previous_scopes?: Json | null
          provider_capability_id?: string | null
          provider_family_id?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          source_flow?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consent_ledger_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "oauth_client_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_ledger_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_ledger_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_revocations: {
        Row: {
          consent_ledger_id: string
          created_at: string
          id: string
          impacted_capabilities: string[] | null
          revocation_reason: string
          revoked_scopes: string[] | null
          user_id: string
        }
        Insert: {
          consent_ledger_id: string
          created_at?: string
          id?: string
          impacted_capabilities?: string[] | null
          revocation_reason?: string
          revoked_scopes?: string[] | null
          user_id: string
        }
        Update: {
          consent_ledger_id?: string
          created_at?: string
          id?: string
          impacted_capabilities?: string[] | null
          revocation_reason?: string
          revoked_scopes?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_revocations_consent_ledger_id_fkey"
            columns: ["consent_ledger_id"]
            isOneToOne: false
            referencedRelation: "consent_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_revocations_consent_ledger_id_fkey"
            columns: ["consent_ledger_id"]
            isOneToOne: false
            referencedRelation: "v_consent_history"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_scope_records: {
        Row: {
          consent_ledger_id: string | null
          created_at: string
          grant_reason: string | null
          granted: boolean
          id: string
          revoke_reason: string | null
          revoked_at: string | null
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_ledger_id?: string | null
          created_at?: string
          grant_reason?: string | null
          granted?: boolean
          id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_ledger_id?: string | null
          created_at?: string
          grant_reason?: string | null
          granted?: boolean
          id?: string
          revoke_reason?: string | null
          revoked_at?: string | null
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_scope_records_consent_ledger_id_fkey"
            columns: ["consent_ledger_id"]
            isOneToOne: false
            referencedRelation: "consent_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_scope_records_consent_ledger_id_fkey"
            columns: ["consent_ledger_id"]
            isOneToOne: false
            referencedRelation: "v_consent_history"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_upgrades: {
        Row: {
          approval_required: boolean | null
          approved_by: string | null
          consent_ledger_id: string
          created_at: string
          id: string
          new_scopes: string[] | null
          previous_scopes: string[] | null
          status: string | null
          upgrade_reason: string | null
          user_id: string
        }
        Insert: {
          approval_required?: boolean | null
          approved_by?: string | null
          consent_ledger_id: string
          created_at?: string
          id?: string
          new_scopes?: string[] | null
          previous_scopes?: string[] | null
          status?: string | null
          upgrade_reason?: string | null
          user_id: string
        }
        Update: {
          approval_required?: boolean | null
          approved_by?: string | null
          consent_ledger_id?: string
          created_at?: string
          id?: string
          new_scopes?: string[] | null
          previous_scopes?: string[] | null
          status?: string | null
          upgrade_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_upgrades_consent_ledger_id_fkey"
            columns: ["consent_ledger_id"]
            isOneToOne: false
            referencedRelation: "consent_ledger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consent_upgrades_consent_ledger_id_fkey"
            columns: ["consent_ledger_id"]
            isOneToOne: false
            referencedRelation: "v_consent_history"
            referencedColumns: ["id"]
          },
        ]
      }
      content_freshness: {
        Row: {
          confidence: number | null
          created_at: string
          id: string
          last_reviewed_at: string | null
          page_id: string
          stale_reason: string | null
          stale_signals: Json | null
          suggested_refresh: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          page_id: string
          stale_reason?: string | null
          stale_signals?: Json | null
          suggested_refresh?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          page_id?: string
          stale_reason?: string | null
          stale_signals?: Json | null
          suggested_refresh?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_freshness_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      context_continuity_records: {
        Row: {
          active_task_ids: string[] | null
          active_workflow_ids: string[] | null
          assistant_context: Json | null
          assistant_thread_id: string | null
          boardroom_context: Json | null
          created_at: string
          device_id: string | null
          id: string
          metadata: Json | null
          open_approval_ids: string[] | null
          recent_entities: string[] | null
          resumable: boolean | null
          scroll_position: Json | null
          session_id: string | null
          surface: string
          updated_at: string
          urgency_stack: Json | null
          user_id: string
        }
        Insert: {
          active_task_ids?: string[] | null
          active_workflow_ids?: string[] | null
          assistant_context?: Json | null
          assistant_thread_id?: string | null
          boardroom_context?: Json | null
          created_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json | null
          open_approval_ids?: string[] | null
          recent_entities?: string[] | null
          resumable?: boolean | null
          scroll_position?: Json | null
          session_id?: string | null
          surface: string
          updated_at?: string
          urgency_stack?: Json | null
          user_id: string
        }
        Update: {
          active_task_ids?: string[] | null
          active_workflow_ids?: string[] | null
          assistant_context?: Json | null
          assistant_thread_id?: string | null
          boardroom_context?: Json | null
          created_at?: string
          device_id?: string | null
          id?: string
          metadata?: Json | null
          open_approval_ids?: string[] | null
          recent_entities?: string[] | null
          resumable?: boolean | null
          scroll_position?: Json | null
          session_id?: string | null
          surface?: string
          updated_at?: string
          urgency_stack?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "context_continuity_records_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinated_assistant_sessions: {
        Row: {
          active_roles: string[] | null
          calmness_profile: string | null
          current_context_ref: string | null
          current_objective: string | null
          id: string
          started_at: string
          support_intensity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_roles?: string[] | null
          calmness_profile?: string | null
          current_context_ref?: string | null
          current_objective?: string | null
          id?: string
          started_at?: string
          support_intensity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_roles?: string[] | null
          calmness_profile?: string | null
          current_context_ref?: string | null
          current_objective?: string | null
          id?: string
          started_at?: string
          support_intensity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      council_decisions: {
        Row: {
          consensus_score: number | null
          created_at: string
          decision: string | null
          domain: string
          id: string
          participants: Json
          question: string
          status: string
          updated_at: string
          user_id: string
          votes: Json
        }
        Insert: {
          consensus_score?: number | null
          created_at?: string
          decision?: string | null
          domain: string
          id?: string
          participants?: Json
          question: string
          status?: string
          updated_at?: string
          user_id: string
          votes?: Json
        }
        Update: {
          consensus_score?: number | null
          created_at?: string
          decision?: string | null
          domain?: string
          id?: string
          participants?: Json
          question?: string
          status?: string
          updated_at?: string
          user_id?: string
          votes?: Json
        }
        Relationships: []
      }
      cross_surface_consistency_records: {
        Row: {
          check_type: string
          consistent: boolean
          created_at: string
          drift_description: string | null
          id: string
          resolution: string | null
          resolved_at: string | null
          scope: string
          severity: string | null
          surfaces_checked: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          check_type: string
          consistent?: boolean
          created_at?: string
          drift_description?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          scope: string
          severity?: string | null
          surfaces_checked?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          check_type?: string
          consistent?: boolean
          created_at?: string
          drift_description?: string | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          scope?: string
          severity?: string | null
          surfaces_checked?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cross_tenant_pattern_learning_records: {
        Row: {
          anonymization_method: string | null
          approved_for_use: boolean | null
          confidence: number | null
          created_at: string
          domain: string
          id: string
          pattern_id: string | null
          restrictions: string[] | null
          source_tenant_count: number | null
          user_id: string
        }
        Insert: {
          anonymization_method?: string | null
          approved_for_use?: boolean | null
          confidence?: number | null
          created_at?: string
          domain: string
          id?: string
          pattern_id?: string | null
          restrictions?: string[] | null
          source_tenant_count?: number | null
          user_id: string
        }
        Update: {
          anonymization_method?: string | null
          approved_for_use?: boolean | null
          confidence?: number | null
          created_at?: string
          domain?: string
          id?: string
          pattern_id?: string | null
          restrictions?: string[] | null
          source_tenant_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cross_tenant_pattern_learning_records_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "intelligence_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_journey_blockers: {
        Row: {
          blocker_type: string
          created_at: string
          id: string
          journey_key: string
          recommended_fix: string | null
          resolved: boolean | null
          resolved_at: string | null
          run_id: string | null
          severity: string | null
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocker_type?: string
          created_at?: string
          id?: string
          journey_key: string
          recommended_fix?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          run_id?: string | null
          severity?: string | null
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocker_type?: string
          created_at?: string
          id?: string
          journey_key?: string
          recommended_fix?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          run_id?: string | null
          severity?: string | null
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_journey_blockers_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "customer_journey_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_journey_mode_comparisons: {
        Row: {
          claim_risk: boolean
          comparison_summary: string | null
          demo_status: string | null
          id: string
          internal_test_status: string | null
          journey_key: string
          real_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          claim_risk?: boolean
          comparison_summary?: string | null
          demo_status?: string | null
          id?: string
          internal_test_status?: string | null
          journey_key: string
          real_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          claim_risk?: boolean
          comparison_summary?: string | null
          demo_status?: string | null
          id?: string
          internal_test_status?: string | null
          journey_key?: string
          real_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_journey_registry: {
        Row: {
          created_at: string
          display_name: string
          domain_family: string
          expected_outcome: string
          id: string
          is_active: boolean
          journey_key: string
          launch_honesty_class: string | null
          launch_importance: string
          owner_team: string | null
          persona: string
          priority_class: string
          route_key: string | null
          supported_modes: Json
          surface_class: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          domain_family: string
          expected_outcome: string
          id?: string
          is_active?: boolean
          journey_key: string
          launch_honesty_class?: string | null
          launch_importance?: string
          owner_team?: string | null
          persona: string
          priority_class?: string
          route_key?: string | null
          supported_modes?: Json
          surface_class: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          domain_family?: string
          expected_outcome?: string
          id?: string
          is_active?: boolean
          journey_key?: string
          launch_honesty_class?: string | null
          launch_importance?: string
          owner_team?: string | null
          persona?: string
          priority_class?: string
          route_key?: string | null
          supported_modes?: Json
          surface_class?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_journey_runs: {
        Row: {
          actual_outcome: string | null
          completed_at: string | null
          created_at: string
          degraded_reason: string | null
          demo_governed: boolean | null
          evidence_refs: Json | null
          expected_outcome: string | null
          id: string
          journey_id: string | null
          journey_key: string
          launch_impact: string | null
          mode: string
          notes: string | null
          owner: string | null
          proof_confidence: string | null
          provider_source_type: string | null
          recommended_fix: string | null
          root_cause_layer: string | null
          severity: string | null
          started_at: string | null
          status: string
          steps_failed: number | null
          steps_passed: number | null
          steps_total: number | null
          user_id: string
        }
        Insert: {
          actual_outcome?: string | null
          completed_at?: string | null
          created_at?: string
          degraded_reason?: string | null
          demo_governed?: boolean | null
          evidence_refs?: Json | null
          expected_outcome?: string | null
          id?: string
          journey_id?: string | null
          journey_key: string
          launch_impact?: string | null
          mode?: string
          notes?: string | null
          owner?: string | null
          proof_confidence?: string | null
          provider_source_type?: string | null
          recommended_fix?: string | null
          root_cause_layer?: string | null
          severity?: string | null
          started_at?: string | null
          status?: string
          steps_failed?: number | null
          steps_passed?: number | null
          steps_total?: number | null
          user_id: string
        }
        Update: {
          actual_outcome?: string | null
          completed_at?: string | null
          created_at?: string
          degraded_reason?: string | null
          demo_governed?: boolean | null
          evidence_refs?: Json | null
          expected_outcome?: string | null
          id?: string
          journey_id?: string | null
          journey_key?: string
          launch_impact?: string | null
          mode?: string
          notes?: string | null
          owner?: string | null
          proof_confidence?: string | null
          provider_source_type?: string | null
          recommended_fix?: string | null
          root_cause_layer?: string | null
          severity?: string | null
          started_at?: string | null
          status?: string
          steps_failed?: number | null
          steps_passed?: number | null
          steps_total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_journey_runs_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "customer_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_journey_status: {
        Row: {
          actual_outcome_summary: string | null
          current_status: string
          id: string
          journey_id: string
          last_verified_at: string | null
          last_verified_run_id: string | null
          launch_impact: string | null
          owner_team: string | null
          proof_confidence: string | null
          recommended_fix: string | null
          updated_at: string
        }
        Insert: {
          actual_outcome_summary?: string | null
          current_status?: string
          id?: string
          journey_id: string
          last_verified_at?: string | null
          last_verified_run_id?: string | null
          launch_impact?: string | null
          owner_team?: string | null
          proof_confidence?: string | null
          recommended_fix?: string | null
          updated_at?: string
        }
        Update: {
          actual_outcome_summary?: string | null
          current_status?: string
          id?: string
          journey_id?: string
          last_verified_at?: string | null
          last_verified_run_id?: string | null
          launch_impact?: string | null
          owner_team?: string | null
          proof_confidence?: string | null
          recommended_fix?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_journey_status_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: true
            referencedRelation: "customer_journey_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_journey_status_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: true
            referencedRelation: "v_customer_journey_summary"
            referencedColumns: ["registry_id"]
          },
          {
            foreignKeyName: "customer_journey_status_last_verified_run_id_fkey"
            columns: ["last_verified_run_id"]
            isOneToOne: false
            referencedRelation: "journey_verification_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_journey_status_last_verified_run_id_fkey"
            columns: ["last_verified_run_id"]
            isOneToOne: false
            referencedRelation: "v_customer_journey_recent_failures"
            referencedColumns: ["run_id"]
          },
        ]
      }
      customer_journey_steps: {
        Row: {
          actual_behavior: string | null
          created_at: string
          evidence_ref: string | null
          expected_behavior: string | null
          id: string
          result: string | null
          root_cause: string | null
          run_id: string | null
          step_name: string
          step_order: number
          user_id: string
        }
        Insert: {
          actual_behavior?: string | null
          created_at?: string
          evidence_ref?: string | null
          expected_behavior?: string | null
          id?: string
          result?: string | null
          root_cause?: string | null
          run_id?: string | null
          step_name: string
          step_order?: number
          user_id: string
        }
        Update: {
          actual_behavior?: string | null
          created_at?: string
          evidence_ref?: string | null
          expected_behavior?: string | null
          id?: string
          result?: string | null
          root_cause?: string | null
          run_id?: string | null
          step_name?: string
          step_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_journey_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "customer_journey_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_journeys: {
        Row: {
          created_at: string
          current_status: string | null
          dependencies: string[] | null
          display_name: string
          domain: string
          expected_outcome: string | null
          id: string
          journey_key: string
          last_verified_at: string | null
          launch_importance: string | null
          notes: string | null
          owner: string | null
          persona: string
          primary_modes: string[] | null
          route_family: string | null
          steps: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_status?: string | null
          dependencies?: string[] | null
          display_name: string
          domain?: string
          expected_outcome?: string | null
          id?: string
          journey_key: string
          last_verified_at?: string | null
          launch_importance?: string | null
          notes?: string | null
          owner?: string | null
          persona?: string
          primary_modes?: string[] | null
          route_family?: string | null
          steps?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_status?: string | null
          dependencies?: string[] | null
          display_name?: string
          domain?: string
          expected_outcome?: string | null
          id?: string
          journey_key?: string
          last_verified_at?: string | null
          launch_importance?: string | null
          notes?: string | null
          owner?: string | null
          persona?: string
          primary_modes?: string[] | null
          route_family?: string | null
          steps?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          health_score: number | null
          id: string
          last_contact_at: string | null
          lifetime_revenue: number | null
          name: string
          notes: string | null
          phone: string | null
          relationship_type: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          health_score?: number | null
          id?: string
          last_contact_at?: string | null
          lifetime_revenue?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          relationship_type?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          health_score?: number | null
          id?: string
          last_contact_at?: string | null
          lifetime_revenue?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          relationship_type?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          name: string
          probability: number | null
          stage: string
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          name: string
          probability?: number | null
          stage?: string
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          name?: string
          probability?: number | null
          stage?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      delivery_templates: {
        Row: {
          archetype_key: string
          created_at: string
          expected_components: Json
          expected_contracts: Json
          expected_files: Json
          expected_interactions: Json
          expected_journey_tests: Json
          expected_persistence: Json
          expected_shell: string | null
          expected_truth_registration: Json
          id: string
          loading_error_degraded: Json
          template_name: string
          updated_at: string
        }
        Insert: {
          archetype_key: string
          created_at?: string
          expected_components?: Json
          expected_contracts?: Json
          expected_files?: Json
          expected_interactions?: Json
          expected_journey_tests?: Json
          expected_persistence?: Json
          expected_shell?: string | null
          expected_truth_registration?: Json
          id?: string
          loading_error_degraded?: Json
          template_name: string
          updated_at?: string
        }
        Update: {
          archetype_key?: string
          created_at?: string
          expected_components?: Json
          expected_contracts?: Json
          expected_files?: Json
          expected_interactions?: Json
          expected_journey_tests?: Json
          expected_persistence?: Json
          expected_shell?: string | null
          expected_truth_registration?: Json
          id?: string
          loading_error_degraded?: Json
          template_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_templates_archetype_key_fkey"
            columns: ["archetype_key"]
            isOneToOne: false
            referencedRelation: "feature_archetypes"
            referencedColumns: ["archetype_key"]
          },
        ]
      }
      delivery_waves: {
        Row: {
          completion_pct: number
          created_at: string
          dependency_groups: Json
          domain_focus: Json
          feature_ids: Json
          id: string
          launch_impact: string
          migration_opportunities: Json
          notes: string | null
          status: string
          target_end: string | null
          target_start: string | null
          updated_at: string
          user_id: string
          wave_name: string
          wave_number: number
        }
        Insert: {
          completion_pct?: number
          created_at?: string
          dependency_groups?: Json
          domain_focus?: Json
          feature_ids?: Json
          id?: string
          launch_impact?: string
          migration_opportunities?: Json
          notes?: string | null
          status?: string
          target_end?: string | null
          target_start?: string | null
          updated_at?: string
          user_id: string
          wave_name: string
          wave_number?: number
        }
        Update: {
          completion_pct?: number
          created_at?: string
          dependency_groups?: Json
          domain_focus?: Json
          feature_ids?: Json
          id?: string
          launch_impact?: string
          migration_opportunities?: Json
          notes?: string | null
          status?: string
          target_end?: string | null
          target_start?: string | null
          updated_at?: string
          user_id?: string
          wave_name?: string
          wave_number?: number
        }
        Relationships: []
      }
      demo_actions: {
        Row: {
          action_type: string
          actor_id: string | null
          created_at: string
          execution_mode: string
          feature_id: string | null
          id: string
          outcome_summary: string | null
          receipt_id: string | null
          route: string | null
          scenario_id: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          actor_id?: string | null
          created_at?: string
          execution_mode?: string
          feature_id?: string | null
          id?: string
          outcome_summary?: string | null
          receipt_id?: string | null
          route?: string | null
          scenario_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          actor_id?: string | null
          created_at?: string
          execution_mode?: string
          feature_id?: string | null
          id?: string
          outcome_summary?: string | null
          receipt_id?: string | null
          route?: string | null
          scenario_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_actions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_analytics: {
        Row: {
          actor_id: string | null
          created_at: string
          event_name: string
          id: string
          metadata: Json
          mode: string
          route: string | null
          scenario_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          mode?: string
          route?: string | null
          scenario_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          mode?: string
          route?: string | null
          scenario_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_analytics_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_interaction_policies: {
        Row: {
          created_at: string
          demo_provider_id: string
          id: string
          interaction_behavior: string
          interaction_key: string
          side_effect_policy_key: string
          user_visible_label: string | null
        }
        Insert: {
          created_at?: string
          demo_provider_id: string
          id?: string
          interaction_behavior: string
          interaction_key: string
          side_effect_policy_key: string
          user_visible_label?: string | null
        }
        Update: {
          created_at?: string
          demo_provider_id?: string
          id?: string
          interaction_behavior?: string
          interaction_key?: string
          side_effect_policy_key?: string
          user_visible_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_interaction_policies_demo_provider_id_fkey"
            columns: ["demo_provider_id"]
            isOneToOne: false
            referencedRelation: "demo_provider_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_kill_switches: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          key: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          key: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          key?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_policy_profiles: {
        Row: {
          ai_execution_mode: string
          analytics_mode: string
          approval_executes_live: boolean
          billing_live: boolean
          connector_writes_allowed: boolean
          created_at: string
          external_writes_allowed: boolean
          id: string
          name: string
          notifications_live: boolean
          receipt_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_execution_mode?: string
          analytics_mode?: string
          approval_executes_live?: boolean
          billing_live?: boolean
          connector_writes_allowed?: boolean
          created_at?: string
          external_writes_allowed?: boolean
          id?: string
          name: string
          notifications_live?: boolean
          receipt_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_execution_mode?: string
          analytics_mode?: string
          approval_executes_live?: boolean
          billing_live?: boolean
          connector_writes_allowed?: boolean
          created_at?: string
          external_writes_allowed?: boolean
          id?: string
          name?: string
          notifications_live?: boolean
          receipt_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      demo_provider_registry: {
        Row: {
          capability_keys: Json
          created_at: string
          demo_provider_key: string
          display_name: string
          domain_family: string
          id: string
          is_active: boolean
          launch_honesty_class: string
          scenario_pack_required: boolean
          supports_interaction: boolean
          supports_simulated_writes: boolean
          updated_at: string
        }
        Insert: {
          capability_keys?: Json
          created_at?: string
          demo_provider_key: string
          display_name: string
          domain_family: string
          id?: string
          is_active?: boolean
          launch_honesty_class?: string
          scenario_pack_required?: boolean
          supports_interaction?: boolean
          supports_simulated_writes?: boolean
          updated_at?: string
        }
        Update: {
          capability_keys?: Json
          created_at?: string
          demo_provider_key?: string
          display_name?: string
          domain_family?: string
          id?: string
          is_active?: boolean
          launch_honesty_class?: string
          scenario_pack_required?: boolean
          supports_interaction?: boolean
          supports_simulated_writes?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      demo_receipts: {
        Row: {
          actor_id: string | null
          created_at: string
          feature_id: string | null
          id: string
          receipt_type: string
          scenario_id: string | null
          simulated: boolean
          summary: string | null
          user_id: string
          visible_to_roles: string[]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          feature_id?: string | null
          id?: string
          receipt_type: string
          scenario_id?: string | null
          simulated?: boolean
          summary?: string | null
          user_id: string
          visible_to_roles?: string[]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          feature_id?: string | null
          id?: string
          receipt_type?: string
          scenario_id?: string | null
          simulated?: boolean
          summary?: string | null
          user_id?: string
          visible_to_roles?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "demo_receipts_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_scenario_artifacts: {
        Row: {
          artifact_ref: string | null
          artifact_type: string
          confidence_language: string | null
          content: Json
          created_at: string
          deterministic: boolean
          generated_at: string | null
          id: string
          label: string
          scenario_id: string
          user_id: string
        }
        Insert: {
          artifact_ref?: string | null
          artifact_type: string
          confidence_language?: string | null
          content?: Json
          created_at?: string
          deterministic?: boolean
          generated_at?: string | null
          id?: string
          label: string
          scenario_id: string
          user_id: string
        }
        Update: {
          artifact_ref?: string | null
          artifact_type?: string
          confidence_language?: string | null
          content?: Json
          created_at?: string
          deterministic?: boolean
          generated_at?: string | null
          id?: string
          label?: string
          scenario_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_scenario_artifacts_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_scenario_entities: {
        Row: {
          created_at: string
          description: string | null
          display_name: string | null
          entity_key: string
          entity_payload: Json
          entity_type: string
          id: string
          label: string
          metadata: Json
          scenario_id: string
          scenario_pack_id: string | null
          source_ref: string | null
          user_id: string
          visibility_scope: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          entity_key: string
          entity_payload?: Json
          entity_type: string
          id?: string
          label: string
          metadata?: Json
          scenario_id: string
          scenario_pack_id?: string | null
          source_ref?: string | null
          user_id: string
          visibility_scope?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          entity_key?: string
          entity_payload?: Json
          entity_type?: string
          id?: string
          label?: string
          metadata?: Json
          scenario_id?: string
          scenario_pack_id?: string | null
          source_ref?: string | null
          user_id?: string
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_scenario_entities_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_scenario_entities_scenario_pack_id_fkey"
            columns: ["scenario_pack_id"]
            isOneToOne: false
            referencedRelation: "demo_scenario_packs"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_scenario_packs: {
        Row: {
          created_at: string
          default_for_demo_mode: boolean
          description: string
          display_name: string
          enabled_demo_providers: Json
          id: string
          is_active: boolean
          scenario_pack_key: string
          storyline_metadata: Json
          surface_classes: Json
          theme_family: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_for_demo_mode?: boolean
          description: string
          display_name: string
          enabled_demo_providers?: Json
          id?: string
          is_active?: boolean
          scenario_pack_key: string
          storyline_metadata?: Json
          surface_classes?: Json
          theme_family: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_for_demo_mode?: boolean
          description?: string
          display_name?: string
          enabled_demo_providers?: Json
          id?: string
          is_active?: boolean
          scenario_pack_key?: string
          storyline_metadata?: Json
          surface_classes?: Json
          theme_family?: string
          updated_at?: string
        }
        Relationships: []
      }
      demo_scenario_relationships: {
        Row: {
          created_at: string
          from_entity_id: string
          id: string
          metadata: Json
          relationship_type: string
          scenario_id: string
          to_entity_id: string
          user_id: string
          visibility_scope: string
        }
        Insert: {
          created_at?: string
          from_entity_id: string
          id?: string
          metadata?: Json
          relationship_type: string
          scenario_id: string
          to_entity_id: string
          user_id: string
          visibility_scope?: string
        }
        Update: {
          created_at?: string
          from_entity_id?: string
          id?: string
          metadata?: Json
          relationship_type?: string
          scenario_id?: string
          to_entity_id?: string
          user_id?: string
          visibility_scope?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_scenario_relationships_from_entity_id_fkey"
            columns: ["from_entity_id"]
            isOneToOne: false
            referencedRelation: "demo_scenario_entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_scenario_relationships_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_scenario_relationships_to_entity_id_fkey"
            columns: ["to_entity_id"]
            isOneToOne: false
            referencedRelation: "demo_scenario_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_scenarios: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          domain_coverage: string[]
          id: string
          name: string
          narrative_summary: string | null
          scenario_key: string
          status: string
          target_audience: string | null
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          domain_coverage?: string[]
          id?: string
          name: string
          narrative_summary?: string | null
          scenario_key: string
          status?: string
          target_audience?: string | null
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          domain_coverage?: string[]
          id?: string
          name?: string
          narrative_summary?: string | null
          scenario_key?: string
          status?: string
          target_audience?: string | null
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      dependency_maps: {
        Row: {
          blueprint_id: string | null
          created_at: string
          feature_id: string
          id: string
          launch_gates: Json
          required_contracts: Json
          required_events: Json
          required_journey_tests: Json
          required_policies: Json
          required_probes: Json
          required_projections: Json
          required_proofs: Json
          required_services: Json
          resolved_count: number
          total_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          blueprint_id?: string | null
          created_at?: string
          feature_id: string
          id?: string
          launch_gates?: Json
          required_contracts?: Json
          required_events?: Json
          required_journey_tests?: Json
          required_policies?: Json
          required_probes?: Json
          required_projections?: Json
          required_proofs?: Json
          required_services?: Json
          resolved_count?: number
          total_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          blueprint_id?: string | null
          created_at?: string
          feature_id?: string
          id?: string
          launch_gates?: Json
          required_contracts?: Json
          required_events?: Json
          required_journey_tests?: Json
          required_policies?: Json
          required_probes?: Json
          required_projections?: Json
          required_proofs?: Json
          required_services?: Json
          resolved_count?: number
          total_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependency_maps_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "feature_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      device_approval_receipts: {
        Row: {
          action_summary: string | null
          action_type: string
          approval_class: string
          biometric_used: boolean | null
          connected_device_id: string | null
          created_at: string
          decided_at: string | null
          decision: string
          device_family_key: string | null
          id: string
          metadata: Json | null
          receipt_hash: string | null
          trust_level_at_time: string | null
          user_id: string
          value_cents: number | null
        }
        Insert: {
          action_summary?: string | null
          action_type: string
          approval_class: string
          biometric_used?: boolean | null
          connected_device_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision: string
          device_family_key?: string | null
          id?: string
          metadata?: Json | null
          receipt_hash?: string | null
          trust_level_at_time?: string | null
          user_id: string
          value_cents?: number | null
        }
        Update: {
          action_summary?: string | null
          action_type?: string
          approval_class?: string
          biometric_used?: boolean | null
          connected_device_id?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string
          device_family_key?: string | null
          id?: string
          metadata?: Json | null
          receipt_hash?: string | null
          trust_level_at_time?: string | null
          user_id?: string
          value_cents?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "device_approval_receipts_connected_device_id_fkey"
            columns: ["connected_device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      device_auth_clients: {
        Row: {
          active: boolean | null
          client_class: string
          client_name: string
          created_at: string
          device_type: string | null
          id: string
          last_auth_at: string | null
          launch_stage: string | null
          metadata: Json | null
          oauth_client_id: string | null
          platform: string | null
          provider_family_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          client_class?: string
          client_name: string
          created_at?: string
          device_type?: string | null
          id?: string
          last_auth_at?: string | null
          launch_stage?: string | null
          metadata?: Json | null
          oauth_client_id?: string | null
          platform?: string | null
          provider_family_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          client_class?: string
          client_name?: string
          created_at?: string
          device_type?: string | null
          id?: string
          last_auth_at?: string | null
          launch_stage?: string | null
          metadata?: Json | null
          oauth_client_id?: string | null
          platform?: string | null
          provider_family_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_auth_clients_oauth_client_id_fkey"
            columns: ["oauth_client_id"]
            isOneToOne: false
            referencedRelation: "oauth_client_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_auth_clients_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      device_families: {
        Row: {
          active: boolean | null
          continuity_support: boolean | null
          created_at: string
          description: string | null
          family_key: string
          handoff_support: boolean | null
          id: string
          interaction_type: string
          launch_stage: string | null
          metadata: Json | null
          name: string
          notification_type: string | null
          offline_behavior: string | null
          passive_usage_support: boolean | null
          quick_action_support: boolean | null
          screen_class: string | null
          sensor_support: string[] | null
          trust_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          continuity_support?: boolean | null
          created_at?: string
          description?: string | null
          family_key: string
          handoff_support?: boolean | null
          id?: string
          interaction_type?: string
          launch_stage?: string | null
          metadata?: Json | null
          name: string
          notification_type?: string | null
          offline_behavior?: string | null
          passive_usage_support?: boolean | null
          quick_action_support?: boolean | null
          screen_class?: string | null
          sensor_support?: string[] | null
          trust_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          continuity_support?: boolean | null
          created_at?: string
          description?: string | null
          family_key?: string
          handoff_support?: boolean | null
          id?: string
          interaction_type?: string
          launch_stage?: string | null
          metadata?: Json | null
          name?: string
          notification_type?: string | null
          offline_behavior?: string | null
          passive_usage_support?: boolean | null
          quick_action_support?: boolean | null
          screen_class?: string | null
          sensor_support?: string[] | null
          trust_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_push_tokens: {
        Row: {
          active: boolean
          auth_key: string | null
          created_at: string
          device_name: string | null
          endpoint: string | null
          id: string
          last_used_at: string | null
          p256dh: string | null
          platform: Database["public"]["Enums"]["push_platform"]
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          auth_key?: string | null
          created_at?: string
          device_name?: string | null
          endpoint?: string | null
          id?: string
          last_used_at?: string | null
          p256dh?: string | null
          platform: Database["public"]["Enums"]["push_platform"]
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          auth_key?: string | null
          created_at?: string
          device_name?: string | null
          endpoint?: string | null
          id?: string
          last_used_at?: string | null
          p256dh?: string | null
          platform?: Database["public"]["Enums"]["push_platform"]
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_statuses: {
        Row: {
          created_at: string
          device_name: string
          device_type: string
          id: string
          ip_address: string | null
          last_seen: string
          metadata: Json | null
          os: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_name: string
          device_type?: string
          id?: string
          ip_address?: string | null
          last_seen?: string
          metadata?: Json | null
          os?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_name?: string
          device_type?: string
          id?: string
          ip_address?: string | null
          last_seen?: string
          metadata?: Json | null
          os?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      device_trust_records: {
        Row: {
          approval_tier: string | null
          biometric_verified: boolean | null
          connected_device_id: string | null
          created_at: string
          financial_actions_allowed: boolean | null
          high_risk_actions_allowed: boolean | null
          id: string
          last_trust_verification_at: string | null
          max_approval_amount_cents: number | null
          metadata: Json | null
          trust_downgrade_reason: string | null
          trust_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_tier?: string | null
          biometric_verified?: boolean | null
          connected_device_id?: string | null
          created_at?: string
          financial_actions_allowed?: boolean | null
          high_risk_actions_allowed?: boolean | null
          id?: string
          last_trust_verification_at?: string | null
          max_approval_amount_cents?: number | null
          metadata?: Json | null
          trust_downgrade_reason?: string | null
          trust_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_tier?: string | null
          biometric_verified?: boolean | null
          connected_device_id?: string | null
          created_at?: string
          financial_actions_allowed?: boolean | null
          high_risk_actions_allowed?: boolean | null
          id?: string
          last_trust_verification_at?: string | null
          max_approval_amount_cents?: number | null
          metadata?: Json | null
          trust_downgrade_reason?: string | null
          trust_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_trust_records_connected_device_id_fkey"
            columns: ["connected_device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      differential_reasoning_records: {
        Row: {
          created_at: string
          current_state_ref: string | null
          detected_changes: Json | null
          domain: string
          id: string
          invalidated_assets: string[] | null
          materiality_score: number | null
          owner_id: string | null
          owner_type: string | null
          preserved_assets: string[] | null
          previous_state_ref: string | null
          reasoning_savings_estimate: number | null
          recommended_reasoning_mode: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_state_ref?: string | null
          detected_changes?: Json | null
          domain: string
          id?: string
          invalidated_assets?: string[] | null
          materiality_score?: number | null
          owner_id?: string | null
          owner_type?: string | null
          preserved_assets?: string[] | null
          previous_state_ref?: string | null
          reasoning_savings_estimate?: number | null
          recommended_reasoning_mode?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_state_ref?: string | null
          detected_changes?: Json | null
          domain?: string
          id?: string
          invalidated_assets?: string[] | null
          materiality_score?: number | null
          owner_id?: string | null
          owner_type?: string | null
          preserved_assets?: string[] | null
          previous_state_ref?: string | null
          reasoning_savings_estimate?: number | null
          recommended_reasoning_mode?: string | null
          user_id?: string
        }
        Relationships: []
      }
      digest_compilations: {
        Row: {
          created_at: string
          delivery_surface: string | null
          digest_type: string
          generated_at: string
          id: string
          mode: string | null
          source_refs: string[] | null
          summary_ref: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          delivery_surface?: string | null
          digest_type?: string
          generated_at?: string
          id?: string
          mode?: string | null
          source_refs?: string[] | null
          summary_ref?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          delivery_surface?: string | null
          digest_type?: string
          generated_at?: string
          id?: string
          mode?: string | null
          source_refs?: string[] | null
          summary_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      digital_agent_debates: {
        Row: {
          alignment_summary: string | null
          conflicting_assumptions: Json | null
          created_at: string
          disagreement_summary: string | null
          id: string
          owner_id: string | null
          owner_type: string
          participating_agent_ids: string[] | null
          resolution_signals: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment_summary?: string | null
          conflicting_assumptions?: Json | null
          created_at?: string
          disagreement_summary?: string | null
          id?: string
          owner_id?: string | null
          owner_type: string
          participating_agent_ids?: string[] | null
          resolution_signals?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment_summary?: string | null
          conflicting_assumptions?: Json | null
          created_at?: string
          disagreement_summary?: string | null
          id?: string
          owner_id?: string | null
          owner_type?: string
          participating_agent_ids?: string[] | null
          resolution_signals?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_agent_observations: {
        Row: {
          agent_id: string
          confidence_level: number | null
          created_at: string
          detailed_reasoning: string | null
          id: string
          owner_id: string | null
          owner_type: string
          recommendation_type: string | null
          summary: string | null
          title: string
          uncertainty_level: number | null
          updated_at: string
          user_id: string
          what_changed: string | null
          what_could_break: string | null
          what_would_improve: string | null
        }
        Insert: {
          agent_id: string
          confidence_level?: number | null
          created_at?: string
          detailed_reasoning?: string | null
          id?: string
          owner_id?: string | null
          owner_type: string
          recommendation_type?: string | null
          summary?: string | null
          title: string
          uncertainty_level?: number | null
          updated_at?: string
          user_id: string
          what_changed?: string | null
          what_could_break?: string | null
          what_would_improve?: string | null
        }
        Update: {
          agent_id?: string
          confidence_level?: number | null
          created_at?: string
          detailed_reasoning?: string | null
          id?: string
          owner_id?: string | null
          owner_type?: string
          recommendation_type?: string | null
          summary?: string | null
          title?: string
          uncertainty_level?: number | null
          updated_at?: string
          user_id?: string
          what_changed?: string | null
          what_could_break?: string | null
          what_would_improve?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_agent_observations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "digital_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_agents: {
        Row: {
          active: boolean | null
          agent_type: string
          created_at: string
          display_name: string
          id: string
          mode_preferences: Json | null
          priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          agent_type: string
          created_at?: string
          display_name: string
          id?: string
          mode_preferences?: Json | null
          priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          agent_type?: string
          created_at?: string
          display_name?: string
          id?: string
          mode_preferences?: Json | null
          priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_presence_profiles: {
        Row: {
          business_twin_id: string | null
          created_at: string
          default_autonomy_mode: string
          id: string
          mode: string
          presence_type_flags: string[] | null
          primary_brand_kit_id: string | null
          primary_site_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_twin_id?: string | null
          created_at?: string
          default_autonomy_mode?: string
          id?: string
          mode?: string
          presence_type_flags?: string[] | null
          primary_brand_kit_id?: string | null
          primary_site_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_twin_id?: string | null
          created_at?: string
          default_autonomy_mode?: string
          id?: string
          mode?: string
          presence_type_flags?: string[] | null
          primary_brand_kit_id?: string | null
          primary_site_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      digital_twins: {
        Row: {
          churn_probability: number
          created_at: string
          health_score: number
          id: string
          last_activity: string | null
          name: string
          predicted_revenue: number
          revenue_at_risk: number
          segment: string
          trend: string
          updated_at: string
          user_id: string
        }
        Insert: {
          churn_probability?: number
          created_at?: string
          health_score?: number
          id?: string
          last_activity?: string | null
          name: string
          predicted_revenue?: number
          revenue_at_risk?: number
          segment?: string
          trend?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          churn_probability?: number
          created_at?: string
          health_score?: number
          id?: string
          last_activity?: string | null
          name?: string
          predicted_revenue?: number
          revenue_at_risk?: number
          segment?: string
          trend?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          author: string | null
          columns_config: Json | null
          content: string | null
          created_at: string
          data_rows: Json | null
          document_type: string
          formulas: Json | null
          governed: boolean | null
          id: string
          linked_domain: string | null
          linked_entity: string | null
          linked_workflow: string | null
          metadata: Json | null
          privacy: string | null
          slides: Json | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          author?: string | null
          columns_config?: Json | null
          content?: string | null
          created_at?: string
          data_rows?: Json | null
          document_type?: string
          formulas?: Json | null
          governed?: boolean | null
          id?: string
          linked_domain?: string | null
          linked_entity?: string | null
          linked_workflow?: string | null
          metadata?: Json | null
          privacy?: string | null
          slides?: Json | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          author?: string | null
          columns_config?: Json | null
          content?: string | null
          created_at?: string
          data_rows?: Json | null
          document_type?: string
          formulas?: Json | null
          governed?: boolean | null
          id?: string
          linked_domain?: string | null
          linked_entity?: string | null
          linked_workflow?: string | null
          metadata?: Json | null
          privacy?: string | null
          slides?: Json | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      domain_methodology_packs: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          domain_key: string
          expected_events: Json
          expected_interactions: Json
          expected_routes: Json
          id: string
          maturity_target: string
          readiness_rules: Json
          required_boards: Json
          required_contracts: Json
          required_proofs: Json
          required_shells: Json
          updated_at: string
          user_id: string
          verification_flows: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          domain_key: string
          expected_events?: Json
          expected_interactions?: Json
          expected_routes?: Json
          id?: string
          maturity_target?: string
          readiness_rules?: Json
          required_boards?: Json
          required_contracts?: Json
          required_proofs?: Json
          required_shells?: Json
          updated_at?: string
          user_id: string
          verification_flows?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          domain_key?: string
          expected_events?: Json
          expected_interactions?: Json
          expected_routes?: Json
          id?: string
          maturity_target?: string
          readiness_rules?: Json
          required_boards?: Json
          required_contracts?: Json
          required_proofs?: Json
          required_shells?: Json
          updated_at?: string
          user_id?: string
          verification_flows?: Json
        }
        Relationships: []
      }
      domain_runtime_status: {
        Row: {
          created_at: string
          demo_provider_exists: boolean | null
          domain_key: string
          domain_name: string
          empty_state_handled: boolean | null
          has_db_tables: boolean | null
          has_edge_functions: boolean | null
          has_real_data: boolean | null
          has_real_service: boolean | null
          has_rls_policies: boolean | null
          id: string
          last_verified_at: string | null
          notes: string | null
          runtime_class: string
          truth_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          demo_provider_exists?: boolean | null
          domain_key: string
          domain_name: string
          empty_state_handled?: boolean | null
          has_db_tables?: boolean | null
          has_edge_functions?: boolean | null
          has_real_data?: boolean | null
          has_real_service?: boolean | null
          has_rls_policies?: boolean | null
          id?: string
          last_verified_at?: string | null
          notes?: string | null
          runtime_class?: string
          truth_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          demo_provider_exists?: boolean | null
          domain_key?: string
          domain_name?: string
          empty_state_handled?: boolean | null
          has_db_tables?: boolean | null
          has_edge_functions?: boolean | null
          has_real_data?: boolean | null
          has_real_service?: boolean | null
          has_rls_policies?: boolean | null
          id?: string
          last_verified_at?: string | null
          notes?: string | null
          runtime_class?: string
          truth_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      e2e_journeys: {
        Row: {
          created_at: string
          criticality: string | null
          description: string | null
          domain: string | null
          enabled: boolean | null
          feature_id: string | null
          id: string
          journey_id: string
          mode: string | null
          name: string
          route_family: string | null
          steps_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          criticality?: string | null
          description?: string | null
          domain?: string | null
          enabled?: boolean | null
          feature_id?: string | null
          id?: string
          journey_id: string
          mode?: string | null
          name: string
          route_family?: string | null
          steps_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          criticality?: string | null
          description?: string | null
          domain?: string | null
          enabled?: boolean | null
          feature_id?: string | null
          id?: string
          journey_id?: string
          mode?: string | null
          name?: string
          route_family?: string | null
          steps_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      e2e_runs: {
        Row: {
          ci_run_id: string | null
          created_at: string
          duration_ms: number | null
          environment: string | null
          error_message: string | null
          id: string
          journey_id: string | null
          screenshot_urls: Json | null
          status: string | null
          steps_failed: number | null
          steps_passed: number | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          ci_run_id?: string | null
          created_at?: string
          duration_ms?: number | null
          environment?: string | null
          error_message?: string | null
          id?: string
          journey_id?: string | null
          screenshot_urls?: Json | null
          status?: string | null
          steps_failed?: number | null
          steps_passed?: number | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          ci_run_id?: string | null
          created_at?: string
          duration_ms?: number | null
          environment?: string | null
          error_message?: string | null
          id?: string
          journey_id?: string | null
          screenshot_urls?: Json | null
          status?: string | null
          steps_failed?: number | null
          steps_passed?: number | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "e2e_runs_ci_run_id_fkey"
            columns: ["ci_run_id"]
            isOneToOne: false
            referencedRelation: "ci_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "e2e_runs_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "e2e_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      e2e_steps: {
        Row: {
          action: string
          actual_outcome: string | null
          created_at: string
          duration_ms: number | null
          e2e_run_id: string | null
          error_message: string | null
          expected_outcome: string | null
          id: string
          screenshot_url: string | null
          selector: string | null
          status: string | null
          step_index: number
          user_id: string
        }
        Insert: {
          action: string
          actual_outcome?: string | null
          created_at?: string
          duration_ms?: number | null
          e2e_run_id?: string | null
          error_message?: string | null
          expected_outcome?: string | null
          id?: string
          screenshot_url?: string | null
          selector?: string | null
          status?: string | null
          step_index: number
          user_id: string
        }
        Update: {
          action?: string
          actual_outcome?: string | null
          created_at?: string
          duration_ms?: number | null
          e2e_run_id?: string | null
          error_message?: string | null
          expected_outcome?: string | null
          id?: string
          screenshot_url?: string | null
          selector?: string | null
          status?: string | null
          step_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "e2e_steps_e2e_run_id_fkey"
            columns: ["e2e_run_id"]
            isOneToOne: false
            referencedRelation: "e2e_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_continuity_events: {
        Row: {
          completed_at: string | null
          context_ref: string | null
          created_at: string
          ecosystem: string
          handoff_type: string
          id: string
          initiated_at: string | null
          source_device_id: string | null
          source_surface: string
          state: string
          target_device_id: string | null
          target_surface: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          context_ref?: string | null
          created_at?: string
          ecosystem: string
          handoff_type: string
          id?: string
          initiated_at?: string | null
          source_device_id?: string | null
          source_surface: string
          state?: string
          target_device_id?: string | null
          target_surface: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          context_ref?: string | null
          created_at?: string
          ecosystem?: string
          handoff_type?: string
          id?: string
          initiated_at?: string | null
          source_device_id?: string | null
          source_surface?: string
          state?: string
          target_device_id?: string | null
          target_surface?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_continuity_events_source_device_id_fkey"
            columns: ["source_device_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecosystem_continuity_events_target_device_id_fkey"
            columns: ["target_device_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_devices: {
        Row: {
          biometric_capable: boolean | null
          biometric_types: string[] | null
          continuity_eligible: boolean | null
          created_at: string
          device_model: string
          ecosystem: string
          id: string
          last_seen_at: string | null
          manufacturer: string | null
          metadata: Json | null
          os_version: string
          play_services_available: boolean | null
          push_channel: string
          push_token: string | null
          surface: string
          trust_class: string
          updated_at: string
          user_id: string
        }
        Insert: {
          biometric_capable?: boolean | null
          biometric_types?: string[] | null
          continuity_eligible?: boolean | null
          created_at?: string
          device_model: string
          ecosystem: string
          id?: string
          last_seen_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          os_version?: string
          play_services_available?: boolean | null
          push_channel?: string
          push_token?: string | null
          surface: string
          trust_class?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          biometric_capable?: boolean | null
          biometric_types?: string[] | null
          continuity_eligible?: boolean | null
          created_at?: string
          device_model?: string
          ecosystem?: string
          id?: string
          last_seen_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          os_version?: string
          play_services_available?: boolean | null
          push_channel?: string
          push_token?: string | null
          surface?: string
          trust_class?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_health_consents: {
        Row: {
          assistant_use_consent: boolean | null
          boardroom_visibility_consent: boolean | null
          consented_at: string | null
          created_at: string
          ecosystem: string
          id: string
          privacy_explanation_shown: boolean | null
          read_permission: boolean | null
          revoked_at: string | null
          routing_influence_consent: boolean | null
          signal_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assistant_use_consent?: boolean | null
          boardroom_visibility_consent?: boolean | null
          consented_at?: string | null
          created_at?: string
          ecosystem: string
          id?: string
          privacy_explanation_shown?: boolean | null
          read_permission?: boolean | null
          revoked_at?: string | null
          routing_influence_consent?: boolean | null
          signal_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assistant_use_consent?: boolean | null
          boardroom_visibility_consent?: boolean | null
          consented_at?: string | null
          created_at?: string
          ecosystem?: string
          id?: string
          privacy_explanation_shown?: boolean | null
          read_permission?: boolean | null
          revoked_at?: string | null
          routing_influence_consent?: boolean | null
          signal_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_launch_readiness: {
        Row: {
          blockers: string[] | null
          created_at: string
          demo_available: boolean | null
          ecosystem: string
          evidence: Json | null
          id: string
          last_assessed_at: string | null
          launch_ready: boolean | null
          launch_stage: string
          pilot_ready: boolean | null
          target: string
          target_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string[] | null
          created_at?: string
          demo_available?: boolean | null
          ecosystem: string
          evidence?: Json | null
          id?: string
          last_assessed_at?: string | null
          launch_ready?: boolean | null
          launch_stage?: string
          pilot_ready?: boolean | null
          target: string
          target_name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string[] | null
          created_at?: string
          demo_available?: boolean | null
          ecosystem?: string
          evidence?: Json | null
          id?: string
          last_assessed_at?: string | null
          launch_ready?: boolean | null
          launch_stage?: string
          pilot_ready?: boolean | null
          target?: string
          target_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ecosystem_push_routes: {
        Row: {
          calm_router_integrated: boolean | null
          channel: string
          created_at: string
          device_id: string
          dnd_aware: boolean | null
          ecosystem: string
          focus_mode_aware: boolean | null
          id: string
          notification_channel_id: string | null
          routing_priority: number | null
          updated_at: string
          urgency_filter: string
          user_id: string
        }
        Insert: {
          calm_router_integrated?: boolean | null
          channel: string
          created_at?: string
          device_id: string
          dnd_aware?: boolean | null
          ecosystem: string
          focus_mode_aware?: boolean | null
          id?: string
          notification_channel_id?: string | null
          routing_priority?: number | null
          updated_at?: string
          urgency_filter?: string
          user_id: string
        }
        Update: {
          calm_router_integrated?: boolean | null
          channel?: string
          created_at?: string
          device_id?: string
          dnd_aware?: boolean | null
          ecosystem?: string
          focus_mode_aware?: boolean | null
          id?: string
          notification_channel_id?: string | null
          routing_priority?: number | null
          updated_at?: string
          urgency_filter?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_push_routes_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_trust_records: {
        Row: {
          approval_eligible_classes: string[] | null
          attestation_verified: boolean | null
          biometric_type: string | null
          biometric_verified: boolean | null
          created_at: string
          device_bound_receipts: boolean | null
          device_id: string
          ecosystem: string
          escalation_target: string | null
          id: string
          keystore_secured: boolean | null
          last_verified_at: string | null
          reauth_method: string | null
          risk_tier_ceiling: string
          session_duration: string | null
          trust_class: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_eligible_classes?: string[] | null
          attestation_verified?: boolean | null
          biometric_type?: string | null
          biometric_verified?: boolean | null
          created_at?: string
          device_bound_receipts?: boolean | null
          device_id: string
          ecosystem: string
          escalation_target?: string | null
          id?: string
          keystore_secured?: boolean | null
          last_verified_at?: string | null
          reauth_method?: string | null
          risk_tier_ceiling?: string
          session_duration?: string | null
          trust_class?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_eligible_classes?: string[] | null
          attestation_verified?: boolean | null
          biometric_type?: string | null
          biometric_verified?: boolean | null
          created_at?: string
          device_bound_receipts?: boolean | null
          device_id?: string
          ecosystem?: string
          escalation_target?: string | null
          id?: string
          keystore_secured?: boolean | null
          last_verified_at?: string | null
          reauth_method?: string | null
          risk_tier_ceiling?: string
          session_duration?: string | null
          trust_class?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_trust_records_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      ecosystem_wearable_configs: {
        Row: {
          auto_escalate_sec: number | null
          complications_supported: string[] | null
          created_at: string
          device_id: string
          ecosystem: string
          escalate_to_phone_enabled: boolean | null
          filtered_alerts_only: boolean | null
          glanceable_states_enabled: boolean | null
          haptic_routing_enabled: boolean | null
          id: string
          max_risk_tier: string | null
          micro_actions_enabled: boolean | null
          tiles_supported: string[] | null
          updated_at: string
          urgency_patterns: string[] | null
          user_id: string
          watch_model: string
          watch_os_version: string
        }
        Insert: {
          auto_escalate_sec?: number | null
          complications_supported?: string[] | null
          created_at?: string
          device_id: string
          ecosystem: string
          escalate_to_phone_enabled?: boolean | null
          filtered_alerts_only?: boolean | null
          glanceable_states_enabled?: boolean | null
          haptic_routing_enabled?: boolean | null
          id?: string
          max_risk_tier?: string | null
          micro_actions_enabled?: boolean | null
          tiles_supported?: string[] | null
          updated_at?: string
          urgency_patterns?: string[] | null
          user_id: string
          watch_model?: string
          watch_os_version?: string
        }
        Update: {
          auto_escalate_sec?: number | null
          complications_supported?: string[] | null
          created_at?: string
          device_id?: string
          ecosystem?: string
          escalate_to_phone_enabled?: boolean | null
          filtered_alerts_only?: boolean | null
          glanceable_states_enabled?: boolean | null
          haptic_routing_enabled?: boolean | null
          id?: string
          max_risk_tier?: string | null
          micro_actions_enabled?: boolean | null
          tiles_supported?: string[] | null
          updated_at?: string
          urgency_patterns?: string[] | null
          user_id?: string
          watch_model?: string
          watch_os_version?: string
        }
        Relationships: [
          {
            foreignKeyName: "ecosystem_wearable_configs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "ecosystem_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_secrets: {
        Row: {
          created_at: string | null
          encrypted_value: string
          id: string
          metadata: Json | null
          name: string
          service: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          encrypted_value: string
          id?: string
          metadata?: Json | null
          name: string
          service?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          encrypted_value?: string
          id?: string
          metadata?: Json | null
          name?: string
          service?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      engine_events: {
        Row: {
          created_at: string
          engine_name: string
          event_data: Json
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engine_name: string
          event_data?: Json
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          engine_name?: string
          event_data?: Json
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      engine_state: {
        Row: {
          created_at: string
          engine_name: string
          id: string
          state_data: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          engine_name: string
          id?: string
          state_data?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          engine_name?: string
          id?: string
          state_data?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          correlation_id: string | null
          created_at: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          source: string
          type: string
          user_id: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          source?: string
          type: string
          user_id: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          source?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      execution_envelopes: {
        Row: {
          approved_by: string | null
          capability_id: string
          created_at: string
          id: string
          intent: Json | null
          result: Json | null
          status: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          capability_id: string
          created_at?: string
          id?: string
          intent?: Json | null
          result?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          capability_id?: string
          created_at?: string
          id?: string
          intent?: Json | null
          result?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      experience_grammar_records: {
        Row: {
          canonical_values: Json
          created_at: string
          description: string | null
          display_name: string
          grammar_key: string
          grammar_type: string
          id: string
          surface_rendering_rules: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          canonical_values?: Json
          created_at?: string
          description?: string | null
          display_name: string
          grammar_key: string
          grammar_type: string
          id?: string
          surface_rendering_rules?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          canonical_values?: Json
          created_at?: string
          description?: string | null
          display_name?: string
          grammar_key?: string
          grammar_type?: string
          id?: string
          surface_rendering_rules?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      experience_signature_rules: {
        Row: {
          active: boolean | null
          context_type: string | null
          created_at: string
          escalation_style: string | null
          id: string
          proof_style: string | null
          summary_style: string | null
          surface: string
          tone_profile: string | null
          urgency_class: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          context_type?: string | null
          created_at?: string
          escalation_style?: string | null
          id?: string
          proof_style?: string | null
          summary_style?: string | null
          surface?: string
          tone_profile?: string | null
          urgency_class?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          context_type?: string | null
          created_at?: string
          escalation_style?: string | null
          id?: string
          proof_style?: string | null
          summary_style?: string | null
          surface?: string
          tone_profile?: string | null
          urgency_class?: string | null
          user_id?: string
        }
        Relationships: []
      }
      feature_archetypes: {
        Row: {
          archetype_key: string
          created_at: string
          default_interaction_criticality: string
          default_persistence_class: string
          default_trust_level: string
          description: string | null
          display_name: string
          expected_components: Json
          expected_contracts: Json
          expected_events: Json
          expected_probes: Json
          expected_shells: Json
          id: string
          loading_states: Json
          updated_at: string
        }
        Insert: {
          archetype_key: string
          created_at?: string
          default_interaction_criticality?: string
          default_persistence_class?: string
          default_trust_level?: string
          description?: string | null
          display_name: string
          expected_components?: Json
          expected_contracts?: Json
          expected_events?: Json
          expected_probes?: Json
          expected_shells?: Json
          id?: string
          loading_states?: Json
          updated_at?: string
        }
        Update: {
          archetype_key?: string
          created_at?: string
          default_interaction_criticality?: string
          default_persistence_class?: string
          default_trust_level?: string
          description?: string | null
          display_name?: string
          expected_components?: Json
          expected_contracts?: Json
          expected_events?: Json
          expected_probes?: Json
          expected_shells?: Json
          id?: string
          loading_states?: Json
          updated_at?: string
        }
        Relationships: []
      }
      feature_blueprints: {
        Row: {
          ai_compute_class: string
          approved_at: string | null
          approved_by: string | null
          archetype_key: string | null
          contract_class: string
          created_at: string
          description: string | null
          domain: string
          feature_id: string
          id: string
          interaction_criticality: string
          journey_criticality: string
          launch_criticality: string
          metadata: Json
          ownership: string | null
          persistence_class: string
          reality_target: string
          route_plan: Json
          schema_needs: Json
          service_location: string | null
          status: string
          title: string
          trust_needs: string
          updated_at: string
          user_id: string
          user_intent: string | null
        }
        Insert: {
          ai_compute_class?: string
          approved_at?: string | null
          approved_by?: string | null
          archetype_key?: string | null
          contract_class?: string
          created_at?: string
          description?: string | null
          domain: string
          feature_id: string
          id?: string
          interaction_criticality?: string
          journey_criticality?: string
          launch_criticality?: string
          metadata?: Json
          ownership?: string | null
          persistence_class?: string
          reality_target?: string
          route_plan?: Json
          schema_needs?: Json
          service_location?: string | null
          status?: string
          title: string
          trust_needs?: string
          updated_at?: string
          user_id: string
          user_intent?: string | null
        }
        Update: {
          ai_compute_class?: string
          approved_at?: string | null
          approved_by?: string | null
          archetype_key?: string | null
          contract_class?: string
          created_at?: string
          description?: string | null
          domain?: string
          feature_id?: string
          id?: string
          interaction_criticality?: string
          journey_criticality?: string
          launch_criticality?: string
          metadata?: Json
          ownership?: string | null
          persistence_class?: string
          reality_target?: string
          route_plan?: Json
          schema_needs?: Json
          service_location?: string | null
          status?: string
          title?: string
          trust_needs?: string
          updated_at?: string
          user_id?: string
          user_intent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_blueprints_archetype_key_fkey"
            columns: ["archetype_key"]
            isOneToOne: false
            referencedRelation: "feature_archetypes"
            referencedColumns: ["archetype_key"]
          },
        ]
      }
      feature_compliance_records: {
        Row: {
          boardroom_integration: boolean | null
          capabilities_registered: boolean | null
          completeness_score: number | null
          contracts_defined: boolean | null
          created_at: string
          deprecation_planned: boolean | null
          execution_path_defined: boolean | null
          feature_id: string
          feature_name: string
          generated_truth_updated: boolean | null
          id: string
          last_evaluated_at: string | null
          memory_effects_declared: boolean | null
          metadata: Json | null
          observability_defined: boolean | null
          owner_declared: boolean | null
          policy_defined: boolean | null
          readiness_stage: string | null
          receipts_defined: boolean | null
          rollout_defined: boolean | null
          testing_defined: boolean | null
          updated_at: string
          user_id: string
          violation_count: number | null
          violation_severity: string | null
          violations: Json | null
          workflow_defined: boolean | null
        }
        Insert: {
          boardroom_integration?: boolean | null
          capabilities_registered?: boolean | null
          completeness_score?: number | null
          contracts_defined?: boolean | null
          created_at?: string
          deprecation_planned?: boolean | null
          execution_path_defined?: boolean | null
          feature_id: string
          feature_name: string
          generated_truth_updated?: boolean | null
          id?: string
          last_evaluated_at?: string | null
          memory_effects_declared?: boolean | null
          metadata?: Json | null
          observability_defined?: boolean | null
          owner_declared?: boolean | null
          policy_defined?: boolean | null
          readiness_stage?: string | null
          receipts_defined?: boolean | null
          rollout_defined?: boolean | null
          testing_defined?: boolean | null
          updated_at?: string
          user_id: string
          violation_count?: number | null
          violation_severity?: string | null
          violations?: Json | null
          workflow_defined?: boolean | null
        }
        Update: {
          boardroom_integration?: boolean | null
          capabilities_registered?: boolean | null
          completeness_score?: number | null
          contracts_defined?: boolean | null
          created_at?: string
          deprecation_planned?: boolean | null
          execution_path_defined?: boolean | null
          feature_id?: string
          feature_name?: string
          generated_truth_updated?: boolean | null
          id?: string
          last_evaluated_at?: string | null
          memory_effects_declared?: boolean | null
          metadata?: Json | null
          observability_defined?: boolean | null
          owner_declared?: boolean | null
          policy_defined?: boolean | null
          readiness_stage?: string | null
          receipts_defined?: boolean | null
          rollout_defined?: boolean | null
          testing_defined?: boolean | null
          updated_at?: string
          user_id?: string
          violation_count?: number | null
          violation_severity?: string | null
          violations?: Json | null
          workflow_defined?: boolean | null
        }
        Relationships: []
      }
      feature_deprecation_records: {
        Row: {
          compatibility_window: string | null
          contract_deprecation_plan: Json | null
          created_at: string
          deprecated_at: string | null
          feature_id: string
          feature_name: string
          generated_truth_cleanup: string[] | null
          id: string
          metadata: Json | null
          migration_path: string | null
          replacement_owner: string | null
          retired_at: string | null
          retirement_status: string | null
          support_implications: string | null
          ui_removal_plan: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          compatibility_window?: string | null
          contract_deprecation_plan?: Json | null
          created_at?: string
          deprecated_at?: string | null
          feature_id: string
          feature_name: string
          generated_truth_cleanup?: string[] | null
          id?: string
          metadata?: Json | null
          migration_path?: string | null
          replacement_owner?: string | null
          retired_at?: string | null
          retirement_status?: string | null
          support_implications?: string | null
          ui_removal_plan?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          compatibility_window?: string | null
          contract_deprecation_plan?: Json | null
          created_at?: string
          deprecated_at?: string | null
          feature_id?: string
          feature_name?: string
          generated_truth_cleanup?: string[] | null
          id?: string
          metadata?: Json | null
          migration_path?: string | null
          replacement_owner?: string | null
          retired_at?: string | null
          retirement_status?: string | null
          support_implications?: string | null
          ui_removal_plan?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_execution_paths: {
        Row: {
          brain_core_involvement: boolean | null
          capability_routing_point: string | null
          conflict_behavior: string | null
          connector_runner_path: string | null
          created_at: string
          duplicate_suppression: string | null
          event_emission_point: string | null
          execution_graph: Json | null
          executor_entry: string | null
          feature_id: string
          id: string
          idempotency_key_source: string | null
          ingress_point: string | null
          metadata: Json | null
          partial_success_handling: string | null
          policy_decision_point: string | null
          receipt_emission_point: string | null
          replay_safe: boolean | null
          rollback_behavior: string | null
          status: string | null
          updated_at: string
          user_id: string
          verification_point: string | null
        }
        Insert: {
          brain_core_involvement?: boolean | null
          capability_routing_point?: string | null
          conflict_behavior?: string | null
          connector_runner_path?: string | null
          created_at?: string
          duplicate_suppression?: string | null
          event_emission_point?: string | null
          execution_graph?: Json | null
          executor_entry?: string | null
          feature_id: string
          id?: string
          idempotency_key_source?: string | null
          ingress_point?: string | null
          metadata?: Json | null
          partial_success_handling?: string | null
          policy_decision_point?: string | null
          receipt_emission_point?: string | null
          replay_safe?: boolean | null
          rollback_behavior?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          verification_point?: string | null
        }
        Update: {
          brain_core_involvement?: boolean | null
          capability_routing_point?: string | null
          conflict_behavior?: string | null
          connector_runner_path?: string | null
          created_at?: string
          duplicate_suppression?: string | null
          event_emission_point?: string | null
          execution_graph?: Json | null
          executor_entry?: string | null
          feature_id?: string
          id?: string
          idempotency_key_source?: string | null
          ingress_point?: string | null
          metadata?: Json | null
          partial_success_handling?: string | null
          policy_decision_point?: string | null
          receipt_emission_point?: string | null
          replay_safe?: boolean | null
          rollback_behavior?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verification_point?: string | null
        }
        Relationships: []
      }
      feature_generated_truth_impacts: {
        Row: {
          artifact_path: string
          artifact_type: string
          created_at: string
          current_state: string | null
          expected_entries: Json | null
          feature_id: string
          id: string
          impact_description: string | null
          impact_severity: string | null
          metadata: Json | null
          updated_at: string
          updated_by: string | null
          user_id: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          artifact_path: string
          artifact_type: string
          created_at?: string
          current_state?: string | null
          expected_entries?: Json | null
          feature_id: string
          id?: string
          impact_description?: string | null
          impact_severity?: string | null
          metadata?: Json | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          artifact_path?: string
          artifact_type?: string
          created_at?: string
          current_state?: string | null
          expected_entries?: Json | null
          feature_id?: string
          id?: string
          impact_description?: string | null
          impact_severity?: string | null
          metadata?: Json | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      feature_intake_records: {
        Row: {
          affected_domains: string[] | null
          autonomy_tier: string | null
          capability_classes: string[] | null
          completeness_score: number | null
          created_at: string
          engineering_owner: string | null
          feature_id: string
          feature_name: string
          feature_type: string
          id: string
          intake_questions: Json | null
          intake_status: string | null
          launch_intent: string | null
          metadata: Json | null
          non_goals: string[] | null
          outcome_statement: string | null
          owner_rationale: string | null
          primary_owner: string | null
          product_owner: string | null
          risk_tier: string | null
          support_owner: string | null
          surface_map: Json | null
          trust_bearing: boolean | null
          updated_at: string
          user_id: string
          wedge_priority: string | null
          why_not_elsewhere: string | null
        }
        Insert: {
          affected_domains?: string[] | null
          autonomy_tier?: string | null
          capability_classes?: string[] | null
          completeness_score?: number | null
          created_at?: string
          engineering_owner?: string | null
          feature_id: string
          feature_name: string
          feature_type?: string
          id?: string
          intake_questions?: Json | null
          intake_status?: string | null
          launch_intent?: string | null
          metadata?: Json | null
          non_goals?: string[] | null
          outcome_statement?: string | null
          owner_rationale?: string | null
          primary_owner?: string | null
          product_owner?: string | null
          risk_tier?: string | null
          support_owner?: string | null
          surface_map?: Json | null
          trust_bearing?: boolean | null
          updated_at?: string
          user_id: string
          wedge_priority?: string | null
          why_not_elsewhere?: string | null
        }
        Update: {
          affected_domains?: string[] | null
          autonomy_tier?: string | null
          capability_classes?: string[] | null
          completeness_score?: number | null
          created_at?: string
          engineering_owner?: string | null
          feature_id?: string
          feature_name?: string
          feature_type?: string
          id?: string
          intake_questions?: Json | null
          intake_status?: string | null
          launch_intent?: string | null
          metadata?: Json | null
          non_goals?: string[] | null
          outcome_statement?: string | null
          owner_rationale?: string | null
          primary_owner?: string | null
          product_owner?: string | null
          risk_tier?: string | null
          support_owner?: string | null
          surface_map?: Json | null
          trust_bearing?: boolean | null
          updated_at?: string
          user_id?: string
          wedge_priority?: string | null
          why_not_elsewhere?: string | null
        }
        Relationships: []
      }
      feature_lifecycle_stages: {
        Row: {
          actor: string | null
          blockers: Json
          blueprint_id: string | null
          created_at: string
          entered_at: string
          evidence: Json
          exited_at: string | null
          feature_id: string
          id: string
          notes: string | null
          stage: string
          stage_order: number
          user_id: string
        }
        Insert: {
          actor?: string | null
          blockers?: Json
          blueprint_id?: string | null
          created_at?: string
          entered_at?: string
          evidence?: Json
          exited_at?: string | null
          feature_id: string
          id?: string
          notes?: string | null
          stage?: string
          stage_order?: number
          user_id: string
        }
        Update: {
          actor?: string | null
          blockers?: Json
          blueprint_id?: string | null
          created_at?: string
          entered_at?: string
          evidence?: Json
          exited_at?: string | null
          feature_id?: string
          id?: string
          notes?: string | null
          stage?: string
          stage_order?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_lifecycle_stages_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "feature_blueprints"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_owner_decisions: {
        Row: {
          alternate_candidates: Json | null
          boundary_violations: Json | null
          created_at: string
          decision_status: string | null
          feature_id: string
          id: string
          metadata: Json | null
          module_drift_risk: boolean | null
          owner_rationale: string | null
          primary_owner: string
          recommendation: string | null
          second_brain_risk: boolean | null
          smallest_correct_owner: string | null
          unsupported_root_risk: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alternate_candidates?: Json | null
          boundary_violations?: Json | null
          created_at?: string
          decision_status?: string | null
          feature_id: string
          id?: string
          metadata?: Json | null
          module_drift_risk?: boolean | null
          owner_rationale?: string | null
          primary_owner: string
          recommendation?: string | null
          second_brain_risk?: boolean | null
          smallest_correct_owner?: string | null
          unsupported_root_risk?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alternate_candidates?: Json | null
          boundary_violations?: Json | null
          created_at?: string
          decision_status?: string | null
          feature_id?: string
          id?: string
          metadata?: Json | null
          module_drift_risk?: boolean | null
          owner_rationale?: string | null
          primary_owner?: string
          recommendation?: string | null
          second_brain_risk?: boolean | null
          smallest_correct_owner?: string | null
          unsupported_root_risk?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_readiness_gates: {
        Row: {
          blockers: Json | null
          created_at: string
          current_stage: string | null
          feature_id: string
          gate_history: Json | null
          id: string
          launch_honesty_risk: string | null
          metadata: Json | null
          missing_evidence: string[] | null
          red_team_answers: Json | null
          stage_evidence: Json | null
          support_signoff: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: Json | null
          created_at?: string
          current_stage?: string | null
          feature_id: string
          gate_history?: Json | null
          id?: string
          launch_honesty_risk?: string | null
          metadata?: Json | null
          missing_evidence?: string[] | null
          red_team_answers?: Json | null
          stage_evidence?: Json | null
          support_signoff?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: Json | null
          created_at?: string
          current_stage?: string | null
          feature_id?: string
          gate_history?: Json | null
          id?: string
          launch_honesty_risk?: string | null
          metadata?: Json | null
          missing_evidence?: string[] | null
          red_team_answers?: Json | null
          stage_evidence?: Json | null
          support_signoff?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_rollout_records: {
        Row: {
          config_owner: string | null
          created_at: string
          current_ring: string | null
          feature_flags: Json | null
          feature_id: string
          id: string
          kill_switch_class: string | null
          launch_criteria: Json | null
          metadata: Json | null
          migration_requirements: string[] | null
          monitoring_owner: string | null
          promotion_gates: Json | null
          rollback_steps: string[] | null
          rollout_mode: string | null
          shadow_sim_progression: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          config_owner?: string | null
          created_at?: string
          current_ring?: string | null
          feature_flags?: Json | null
          feature_id: string
          id?: string
          kill_switch_class?: string | null
          launch_criteria?: Json | null
          metadata?: Json | null
          migration_requirements?: string[] | null
          monitoring_owner?: string | null
          promotion_gates?: Json | null
          rollback_steps?: string[] | null
          rollout_mode?: string | null
          shadow_sim_progression?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          config_owner?: string | null
          created_at?: string
          current_ring?: string | null
          feature_flags?: Json | null
          feature_id?: string
          id?: string
          kill_switch_class?: string | null
          launch_criteria?: Json | null
          metadata?: Json | null
          migration_requirements?: string[] | null
          monitoring_owner?: string | null
          promotion_gates?: Json | null
          rollback_steps?: string[] | null
          rollout_mode?: string | null
          shadow_sim_progression?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feature_spec_records: {
        Row: {
          capability_map: Json | null
          completeness_score: number | null
          contract_schema_map: Json | null
          created_at: string
          execution_model: Json | null
          feature_id: string
          feature_name: string
          generated_truth_updates: Json | null
          id: string
          memory_graph_effects: Json | null
          metadata: Json | null
          missing_sections: string[] | null
          observability_support: Json | null
          outcome_statement: string | null
          owner_map: Json | null
          policy_trust_model: Json | null
          rollout_recovery: Json | null
          spec_version: string | null
          status: string | null
          surface_map: Json | null
          testing_model: Json | null
          updated_at: string
          user_id: string
          workflow_model: Json | null
        }
        Insert: {
          capability_map?: Json | null
          completeness_score?: number | null
          contract_schema_map?: Json | null
          created_at?: string
          execution_model?: Json | null
          feature_id: string
          feature_name: string
          generated_truth_updates?: Json | null
          id?: string
          memory_graph_effects?: Json | null
          metadata?: Json | null
          missing_sections?: string[] | null
          observability_support?: Json | null
          outcome_statement?: string | null
          owner_map?: Json | null
          policy_trust_model?: Json | null
          rollout_recovery?: Json | null
          spec_version?: string | null
          status?: string | null
          surface_map?: Json | null
          testing_model?: Json | null
          updated_at?: string
          user_id: string
          workflow_model?: Json | null
        }
        Update: {
          capability_map?: Json | null
          completeness_score?: number | null
          contract_schema_map?: Json | null
          created_at?: string
          execution_model?: Json | null
          feature_id?: string
          feature_name?: string
          generated_truth_updates?: Json | null
          id?: string
          memory_graph_effects?: Json | null
          metadata?: Json | null
          missing_sections?: string[] | null
          observability_support?: Json | null
          outcome_statement?: string | null
          owner_map?: Json | null
          policy_trust_model?: Json | null
          rollout_recovery?: Json | null
          spec_version?: string | null
          status?: string | null
          surface_map?: Json | null
          testing_model?: Json | null
          updated_at?: string
          user_id?: string
          workflow_model?: Json | null
        }
        Relationships: []
      }
      file_metadata: {
        Row: {
          classification: string | null
          created_at: string
          extracted_data: Json | null
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
          classification?: string | null
          created_at?: string
          extracted_data?: Json | null
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
          classification?: string | null
          created_at?: string
          extracted_data?: Json | null
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
          auto_classify: boolean
          auto_extract: boolean
          auto_link: boolean
          boardroom_attach: boolean
          created_at: string
          default_retention: string
          default_sensitivity: string
          generate_suggestions: boolean
          governed_threshold: string[]
          id: string
          memory_write_permission: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_classify?: boolean
          auto_extract?: boolean
          auto_link?: boolean
          boardroom_attach?: boolean
          created_at?: string
          default_retention?: string
          default_sensitivity?: string
          generate_suggestions?: boolean
          governed_threshold?: string[]
          id?: string
          memory_write_permission?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_classify?: boolean
          auto_extract?: boolean
          auto_link?: boolean
          boardroom_attach?: boolean
          created_at?: string
          default_retention?: string
          default_sensitivity?: string
          generate_suggestions?: boolean
          governed_threshold?: string[]
          id?: string
          memory_write_permission?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_accounts: {
        Row: {
          account_type: string
          balance: number
          created_at: string
          currency: string
          id: string
          institution: string | null
          last_synced_at: string | null
          name: string
          trend: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          institution?: string | null
          last_synced_at?: string | null
          name: string
          trend?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          institution?: string | null
          last_synced_at?: string | null
          name?: string
          trend?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      financial_documents: {
        Row: {
          category: string
          classification: string | null
          created_at: string
          extracted_data: Json | null
          filename: string
          id: string
          notes: string | null
          sensitivity: string
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          classification?: string | null
          created_at?: string
          extracted_data?: Json | null
          filename: string
          id?: string
          notes?: string | null
          sensitivity?: string
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          classification?: string | null
          created_at?: string
          extracted_data?: Json | null
          filename?: string
          id?: string
          notes?: string | null
          sensitivity?: string
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string | null
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          status: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          status?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      handoff_contexts: {
        Row: {
          context_type: string | null
          continuity_session_id: string | null
          created_at: string
          id: string
          payload_ref: string | null
          resumable: boolean | null
          urgency_class: string | null
          user_id: string
        }
        Insert: {
          context_type?: string | null
          continuity_session_id?: string | null
          created_at?: string
          id?: string
          payload_ref?: string | null
          resumable?: boolean | null
          urgency_class?: string | null
          user_id: string
        }
        Update: {
          context_type?: string | null
          continuity_session_id?: string | null
          created_at?: string
          id?: string
          payload_ref?: string | null
          resumable?: boolean | null
          urgency_class?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoff_contexts_continuity_session_id_fkey"
            columns: ["continuity_session_id"]
            isOneToOne: false
            referencedRelation: "cai_continuity_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      handoff_packets: {
        Row: {
          context: Json | null
          created_at: string | null
          from_agent: string
          id: string
          status: string | null
          to_agent: string
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          from_agent: string
          id?: string
          status?: string | null
          to_agent: string
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          from_agent?: string
          id?: string
          status?: string | null
          to_agent?: string
          user_id?: string
        }
        Relationships: []
      }
      handoff_sessions: {
        Row: {
          completed_at: string | null
          continuity_record_id: string | null
          created_at: string
          friction_notes: string | null
          handoff_quality: string | null
          handoff_status: string | null
          id: string
          initiated_at: string | null
          metadata: Json | null
          source_device_id: string | null
          source_surface: string
          target_device_id: string | null
          target_surface: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          continuity_record_id?: string | null
          created_at?: string
          friction_notes?: string | null
          handoff_quality?: string | null
          handoff_status?: string | null
          id?: string
          initiated_at?: string | null
          metadata?: Json | null
          source_device_id?: string | null
          source_surface: string
          target_device_id?: string | null
          target_surface: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          continuity_record_id?: string | null
          created_at?: string
          friction_notes?: string | null
          handoff_quality?: string | null
          handoff_status?: string | null
          id?: string
          initiated_at?: string | null
          metadata?: Json | null
          source_device_id?: string | null
          source_surface?: string
          target_device_id?: string | null
          target_surface?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "handoff_sessions_continuity_record_id_fkey"
            columns: ["continuity_record_id"]
            isOneToOne: false
            referencedRelation: "context_continuity_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoff_sessions_source_device_id_fkey"
            columns: ["source_device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handoff_sessions_target_device_id_fkey"
            columns: ["target_device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      health_signal_consents: {
        Row: {
          consent_granted_at: string | null
          consent_reason: string | null
          consent_revoked_at: string | null
          consented: boolean | null
          created_at: string
          data_retention_days: number | null
          id: string
          metadata: Json | null
          share_with_advisors: boolean | null
          share_with_routing: boolean | null
          signal_category: string
          updated_at: string
          user_id: string
          visibility: string | null
          wearable_provider_id: string | null
        }
        Insert: {
          consent_granted_at?: string | null
          consent_reason?: string | null
          consent_revoked_at?: string | null
          consented?: boolean | null
          created_at?: string
          data_retention_days?: number | null
          id?: string
          metadata?: Json | null
          share_with_advisors?: boolean | null
          share_with_routing?: boolean | null
          signal_category: string
          updated_at?: string
          user_id: string
          visibility?: string | null
          wearable_provider_id?: string | null
        }
        Update: {
          consent_granted_at?: string | null
          consent_reason?: string | null
          consent_revoked_at?: string | null
          consented?: boolean | null
          created_at?: string
          data_retention_days?: number | null
          id?: string
          metadata?: Json | null
          share_with_advisors?: boolean | null
          share_with_routing?: boolean | null
          signal_category?: string
          updated_at?: string
          user_id?: string
          visibility?: string | null
          wearable_provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_signal_consents_wearable_provider_id_fkey"
            columns: ["wearable_provider_id"]
            isOneToOne: false
            referencedRelation: "wearable_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      health_signal_privacy: {
        Row: {
          anonymize: boolean | null
          created_at: string
          id: string
          local_only: boolean | null
          metadata: Json | null
          privacy_tier: string | null
          redact_from_exports: boolean | null
          retention_days: number | null
          signal_category: string
          updated_at: string
          user_id: string
          visible_in_boardroom: boolean | null
          visible_in_timeline: boolean | null
          visible_to_advisors: boolean | null
        }
        Insert: {
          anonymize?: boolean | null
          created_at?: string
          id?: string
          local_only?: boolean | null
          metadata?: Json | null
          privacy_tier?: string | null
          redact_from_exports?: boolean | null
          retention_days?: number | null
          signal_category: string
          updated_at?: string
          user_id: string
          visible_in_boardroom?: boolean | null
          visible_in_timeline?: boolean | null
          visible_to_advisors?: boolean | null
        }
        Update: {
          anonymize?: boolean | null
          created_at?: string
          id?: string
          local_only?: boolean | null
          metadata?: Json | null
          privacy_tier?: string | null
          redact_from_exports?: boolean | null
          retention_days?: number | null
          signal_category?: string
          updated_at?: string
          user_id?: string
          visible_in_boardroom?: boolean | null
          visible_in_timeline?: boolean | null
          visible_to_advisors?: boolean | null
        }
        Relationships: []
      }
      household_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          display_name: string
          household_id: string
          id: string
          invited_at: string
          permissions: Json
          role: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          display_name: string
          household_id: string
          id?: string
          invited_at?: string
          permissions?: Json
          role?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          display_name?: string
          household_id?: string
          id?: string
          invited_at?: string
          permissions?: Json
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_shared_items: {
        Row: {
          created_at: string
          household_id: string
          id: string
          item_id: string
          item_type: string
          shared_by: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          item_id: string
          item_type: string
          shared_by: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          item_id?: string
          item_type?: string
          shared_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_shared_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          due_date: string | null
          household_id: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          household_id?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          due_date?: string | null
          household_id?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_tasks_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      human_obligations: {
        Row: {
          created_at: string
          due_at: string | null
          id: string
          obligation_type: string | null
          related_person_ref: string | null
          source_ref: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          due_at?: string | null
          id?: string
          obligation_type?: string | null
          related_person_ref?: string | null
          source_ref?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          due_at?: string | null
          id?: string
          obligation_type?: string | null
          related_person_ref?: string | null
          source_ref?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      identity_provider_links: {
        Row: {
          active: boolean | null
          auth_method: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          external_id: string | null
          id: string
          identity_provider_registry_id: string | null
          last_used_at: string | null
          last_verified_at: string | null
          linked_at: string | null
          metadata: Json | null
          mode: string | null
          primary_identity: boolean | null
          provider_family_id: string
          revoked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          auth_method?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          identity_provider_registry_id?: string | null
          last_used_at?: string | null
          last_verified_at?: string | null
          linked_at?: string | null
          metadata?: Json | null
          mode?: string | null
          primary_identity?: boolean | null
          provider_family_id: string
          revoked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          auth_method?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          external_id?: string | null
          id?: string
          identity_provider_registry_id?: string | null
          last_used_at?: string | null
          last_verified_at?: string | null
          linked_at?: string | null
          metadata?: Json | null
          mode?: string | null
          primary_identity?: boolean | null
          provider_family_id?: string
          revoked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_provider_links_identity_provider_registry_id_fkey"
            columns: ["identity_provider_registry_id"]
            isOneToOne: false
            referencedRelation: "identity_provider_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_provider_links_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_provider_registry: {
        Row: {
          auth_method: string
          created_at: string
          default_scopes: Json
          display_name: string
          id: string
          identity_key: string
          is_active: boolean
          launch_stage: string
          platform_scope: string
          provider_capability_id: string | null
          provider_family_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_method?: string
          created_at?: string
          default_scopes?: Json
          display_name: string
          id?: string
          identity_key: string
          is_active?: boolean
          launch_stage?: string
          platform_scope?: string
          provider_capability_id?: string | null
          provider_family_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_method?: string
          created_at?: string
          default_scopes?: Json
          display_name?: string
          id?: string
          identity_key?: string
          is_active?: boolean
          launch_stage?: string
          platform_scope?: string
          provider_capability_id?: string | null
          provider_family_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_provider_registry_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "identity_provider_registry_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      identity_session_audit: {
        Row: {
          anomaly_detected: boolean
          anomaly_reason: string | null
          created_at: string
          event_type: string
          id: string
          identity_provider_key: string | null
          ip_address: string | null
          metadata: Json
          provider_family_id: string | null
          session_id: string | null
          trust_posture: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          anomaly_detected?: boolean
          anomaly_reason?: string | null
          created_at?: string
          event_type?: string
          id?: string
          identity_provider_key?: string | null
          ip_address?: string | null
          metadata?: Json
          provider_family_id?: string | null
          session_id?: string | null
          trust_posture?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          anomaly_detected?: boolean
          anomaly_reason?: string | null
          created_at?: string
          event_type?: string
          id?: string
          identity_provider_key?: string | null
          ip_address?: string | null
          metadata?: Json
          provider_family_id?: string | null
          session_id?: string | null
          trust_posture?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "identity_session_audit_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          affected_service: string | null
          correlation_id: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          source: string
          status: string
          timeline: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_service?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          source?: string
          status?: string
          timeline?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          affected_service?: string | null
          correlation_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          source?: string
          status?: string
          timeline?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      integration_action_requests: {
        Row: {
          action_type: string
          approved_at: string | null
          approved_by: string | null
          connection_id: string
          created_at: string | null
          dry_run_result: Json | null
          execution_ended_at: string | null
          execution_error_redacted: string | null
          execution_result: Json | null
          execution_started_at: string | null
          id: string
          payload_json: Json | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          requested_by: string
          risk_level: string
          spending_cap_cents: number | null
          status: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          action_type: string
          approved_at?: string | null
          approved_by?: string | null
          connection_id: string
          created_at?: string | null
          dry_run_result?: Json | null
          execution_ended_at?: string | null
          execution_error_redacted?: string | null
          execution_result?: Json | null
          execution_started_at?: string | null
          id?: string
          payload_json?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by: string
          risk_level?: string
          spending_cap_cents?: number | null
          status?: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          action_type?: string
          approved_at?: string | null
          approved_by?: string | null
          connection_id?: string
          created_at?: string | null
          dry_run_result?: Json | null
          execution_ended_at?: string | null
          execution_error_redacted?: string | null
          execution_result?: Json | null
          execution_started_at?: string | null
          id?: string
          payload_json?: Json | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          requested_by?: string
          risk_level?: string
          spending_cap_cents?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_action_requests_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_audit_logs: {
        Row: {
          actor_id: string
          connection_id: string | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata_redacted: Json | null
          summary: string
          tenant_id: string
        }
        Insert: {
          actor_id: string
          connection_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata_redacted?: Json | null
          summary: string
          tenant_id: string
        }
        Update: {
          actor_id?: string
          connection_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata_redacted?: Json | null
          summary?: string
          tenant_id?: string
        }
        Relationships: []
      }
      integration_connections: {
        Row: {
          created_at: string | null
          external_account_id: string | null
          external_account_name: string | null
          id: string
          last_error_code: string | null
          last_error_message_redacted: string | null
          last_health_check_at: string | null
          last_health_status: string | null
          last_sync_at: string | null
          metadata: Json | null
          mode: string
          provider_id: string
          scopes: string[] | null
          status: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_error_code?: string | null
          last_error_message_redacted?: string | null
          last_health_check_at?: string | null
          last_health_status?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          mode?: string
          provider_id: string
          scopes?: string[] | null
          status?: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          external_account_id?: string | null
          external_account_name?: string | null
          id?: string
          last_error_code?: string | null
          last_error_message_redacted?: string | null
          last_health_check_at?: string | null
          last_health_status?: string | null
          last_sync_at?: string | null
          metadata?: Json | null
          mode?: string
          provider_id?: string
          scopes?: string[] | null
          status?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_connections_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          connection_id: string
          created_at: string | null
          encrypted_payload: string
          expires_at: string | null
          id: string
          key_version: number
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          encrypted_payload: string
          expires_at?: string | null
          id?: string
          key_version?: number
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          encrypted_payload?: string
          expires_at?: string | null
          id?: string
          key_version?: number
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_credentials_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_launch_honesty: {
        Row: {
          blockers: string[] | null
          created_at: string
          evidence: Json | null
          id: string
          launch_label: string | null
          notes: string | null
          provider_capability_id: string | null
          provider_family_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          blockers?: string[] | null
          created_at?: string
          evidence?: Json | null
          id?: string
          launch_label?: string | null
          notes?: string | null
          provider_capability_id?: string | null
          provider_family_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          blockers?: string[] | null
          created_at?: string
          evidence?: Json | null
          id?: string
          launch_label?: string | null
          notes?: string | null
          provider_capability_id?: string | null
          provider_family_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_launch_honesty_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_launch_honesty_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          auth_type: string
          category: string
          created_at: string | null
          default_risk_level: string | null
          description: string | null
          display_name: string
          docs_url: string | null
          enabled: boolean | null
          icon_url: string | null
          id: string
          requires_approval_for_writes: boolean | null
          setup_instructions: string | null
          supported_actions: Json | null
          supported_objects: Json | null
          supported_scopes: Json | null
          supports_webhooks: boolean | null
          supports_writes: boolean | null
          updated_at: string | null
        }
        Insert: {
          auth_type?: string
          category?: string
          created_at?: string | null
          default_risk_level?: string | null
          description?: string | null
          display_name: string
          docs_url?: string | null
          enabled?: boolean | null
          icon_url?: string | null
          id: string
          requires_approval_for_writes?: boolean | null
          setup_instructions?: string | null
          supported_actions?: Json | null
          supported_objects?: Json | null
          supported_scopes?: Json | null
          supports_webhooks?: boolean | null
          supports_writes?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auth_type?: string
          category?: string
          created_at?: string | null
          default_risk_level?: string | null
          description?: string | null
          display_name?: string
          docs_url?: string | null
          enabled?: boolean | null
          icon_url?: string | null
          id?: string
          requires_approval_for_writes?: boolean | null
          setup_instructions?: string | null
          supported_actions?: Json | null
          supported_objects?: Json | null
          supported_scopes?: Json | null
          supports_webhooks?: boolean | null
          supports_writes?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      integration_routing_rules: {
        Row: {
          active: boolean | null
          client_id: string | null
          client_name: string
          connection_id: string
          created_at: string | null
          id: string
          match_rules: Json | null
          priority: number | null
          project_name: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          client_id?: string | null
          client_name: string
          connection_id: string
          created_at?: string | null
          id?: string
          match_rules?: Json | null
          priority?: number | null
          project_name?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          client_id?: string | null
          client_name?: string
          connection_id?: string
          created_at?: string | null
          id?: string
          match_rules?: Json | null
          priority?: number | null
          project_name?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_routing_rules_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_sync_runs: {
        Row: {
          connection_id: string
          created_at: string | null
          ended_at: string | null
          error_redacted: string | null
          id: string
          records_created: number | null
          records_failed: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string | null
          stats_json: Json | null
          status: string
          sync_type: string
          tenant_id: string
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          ended_at?: string | null
          error_redacted?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          stats_json?: Json | null
          status?: string
          sync_type?: string
          tenant_id: string
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          ended_at?: string | null
          error_redacted?: string | null
          id?: string
          records_created?: number | null
          records_failed?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string | null
          stats_json?: Json | null
          status?: string
          sync_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_sync_runs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "integration_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_asset_usages: {
        Row: {
          agent_id: string | null
          applicability_score: number | null
          cost_avoided_estimate: number | null
          created_at: string
          id: string
          intelligence_asset_id: string | null
          mission_id: string | null
          outcome_quality: number | null
          reuse_confidence: number | null
          tenant_id: string | null
          usage_mode: string
          user_id: string
          workspace: string | null
        }
        Insert: {
          agent_id?: string | null
          applicability_score?: number | null
          cost_avoided_estimate?: number | null
          created_at?: string
          id?: string
          intelligence_asset_id?: string | null
          mission_id?: string | null
          outcome_quality?: number | null
          reuse_confidence?: number | null
          tenant_id?: string | null
          usage_mode?: string
          user_id: string
          workspace?: string | null
        }
        Update: {
          agent_id?: string | null
          applicability_score?: number | null
          cost_avoided_estimate?: number | null
          created_at?: string
          id?: string
          intelligence_asset_id?: string | null
          mission_id?: string | null
          outcome_quality?: number | null
          reuse_confidence?: number | null
          tenant_id?: string | null
          usage_mode?: string
          user_id?: string
          workspace?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intelligence_asset_usages_intelligence_asset_id_fkey"
            columns: ["intelligence_asset_id"]
            isOneToOne: false
            referencedRelation: "intelligence_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      intelligence_assets: {
        Row: {
          asset_type: string
          confidence_score: number | null
          created_at: string
          domain: string
          evidence_refs: string[] | null
          freshness_score: number | null
          id: string
          invalidation_triggers: string[] | null
          last_used_at: string | null
          reuse_eligibility: boolean | null
          source_action_refs: string[] | null
          source_entity_refs: string[] | null
          source_environment: string | null
          structured_payload: Json | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
          verification_state: string | null
        }
        Insert: {
          asset_type?: string
          confidence_score?: number | null
          created_at?: string
          domain?: string
          evidence_refs?: string[] | null
          freshness_score?: number | null
          id?: string
          invalidation_triggers?: string[] | null
          last_used_at?: string | null
          reuse_eligibility?: boolean | null
          source_action_refs?: string[] | null
          source_entity_refs?: string[] | null
          source_environment?: string | null
          structured_payload?: Json | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
          verification_state?: string | null
        }
        Update: {
          asset_type?: string
          confidence_score?: number | null
          created_at?: string
          domain?: string
          evidence_refs?: string[] | null
          freshness_score?: number | null
          id?: string
          invalidation_triggers?: string[] | null
          last_used_at?: string | null
          reuse_eligibility?: boolean | null
          source_action_refs?: string[] | null
          source_entity_refs?: string[] | null
          source_environment?: string | null
          structured_payload?: Json | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          verification_state?: string | null
        }
        Relationships: []
      }
      intelligence_assets_library: {
        Row: {
          adapted_reuse_count: number
          asset_type: string
          confidence: number
          content: Json
          cost_avoided_cents: number
          created_at: string
          decay_rate: number
          domain: string
          evidence_grade: string
          freshness_score: number
          id: string
          invalidated: boolean
          invalidation_reason: string | null
          reuse_count: number
          source_agent_id: string | null
          source_mission_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adapted_reuse_count?: number
          asset_type?: string
          confidence?: number
          content?: Json
          cost_avoided_cents?: number
          created_at?: string
          decay_rate?: number
          domain?: string
          evidence_grade?: string
          freshness_score?: number
          id?: string
          invalidated?: boolean
          invalidation_reason?: string | null
          reuse_count?: number
          source_agent_id?: string | null
          source_mission_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adapted_reuse_count?: number
          asset_type?: string
          confidence?: number
          content?: Json
          cost_avoided_cents?: number
          created_at?: string
          decay_rate?: number
          domain?: string
          evidence_grade?: string
          freshness_score?: number
          id?: string
          invalidated?: boolean
          invalidation_reason?: string | null
          reuse_count?: number
          source_agent_id?: string | null
          source_mission_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_digests: {
        Row: {
          cache_status: string | null
          confidence: number | null
          digest_type: string
          evidence_refs: string[] | null
          expires_at: string | null
          generated_at: string
          id: string
          summary: string | null
          tenant_id: string | null
          user_id: string
          workspace: string | null
        }
        Insert: {
          cache_status?: string | null
          confidence?: number | null
          digest_type?: string
          evidence_refs?: string[] | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          summary?: string | null
          tenant_id?: string | null
          user_id: string
          workspace?: string | null
        }
        Update: {
          cache_status?: string | null
          confidence?: number | null
          digest_type?: string
          evidence_refs?: string[] | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          summary?: string | null
          tenant_id?: string | null
          user_id?: string
          workspace?: string | null
        }
        Relationships: []
      }
      intelligence_packets: {
        Row: {
          active_constraints: Json | null
          active_risks: Json | null
          confidence_profile: Json | null
          created_at: string
          evidence_refs: string[] | null
          freshness_state: string | null
          id: string
          packet_type: string
          prior_recommendations: Json | null
          recent_changes: Json | null
          scope_id: string | null
          scope_type: string | null
          summarized_state: Json | null
          tenant_id: string | null
          unresolved_questions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_constraints?: Json | null
          active_risks?: Json | null
          confidence_profile?: Json | null
          created_at?: string
          evidence_refs?: string[] | null
          freshness_state?: string | null
          id?: string
          packet_type?: string
          prior_recommendations?: Json | null
          recent_changes?: Json | null
          scope_id?: string | null
          scope_type?: string | null
          summarized_state?: Json | null
          tenant_id?: string | null
          unresolved_questions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_constraints?: Json | null
          active_risks?: Json | null
          confidence_profile?: Json | null
          created_at?: string
          evidence_refs?: string[] | null
          freshness_state?: string | null
          id?: string
          packet_type?: string
          prior_recommendations?: Json | null
          recent_changes?: Json | null
          scope_id?: string | null
          scope_type?: string | null
          summarized_state?: Json | null
          tenant_id?: string | null
          unresolved_questions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_patterns: {
        Row: {
          confidence: number | null
          created_at: string
          description: string | null
          domain: string
          false_positive_rate: number | null
          fingerprint_data: Json | null
          id: string
          label: string
          pattern_type: string
          privacy_class: string | null
          reusable_across_tenants: boolean | null
          source_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          domain?: string
          false_positive_rate?: number | null
          fingerprint_data?: Json | null
          id?: string
          label: string
          pattern_type?: string
          privacy_class?: string | null
          reusable_across_tenants?: boolean | null
          source_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string | null
          domain?: string
          false_positive_rate?: number | null
          fingerprint_data?: Json | null
          id?: string
          label?: string
          pattern_type?: string
          privacy_class?: string | null
          reusable_across_tenants?: boolean | null
          source_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_quality_feedback: {
        Row: {
          actor_id: string | null
          created_at: string
          feedback_type: string
          id: string
          reason: string | null
          scope_id: string
          scope_type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          feedback_type?: string
          id?: string
          reason?: string | null
          scope_id: string
          scope_type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          feedback_type?: string
          id?: string
          reason?: string | null
          scope_id?: string
          scope_type?: string
          user_id?: string
        }
        Relationships: []
      }
      intelligence_reuse_opportunities: {
        Row: {
          candidate_asset_ids: string[] | null
          created_at: string
          current_task_ref: string | null
          domain: string | null
          expected_cost_avoided: number | null
          expected_quality_gain: number | null
          id: string
          recommendation_state: string | null
          similarity_score: number | null
          tenant_id: string | null
          user_id: string
        }
        Insert: {
          candidate_asset_ids?: string[] | null
          created_at?: string
          current_task_ref?: string | null
          domain?: string | null
          expected_cost_avoided?: number | null
          expected_quality_gain?: number | null
          id?: string
          recommendation_state?: string | null
          similarity_score?: number | null
          tenant_id?: string | null
          user_id: string
        }
        Update: {
          candidate_asset_ids?: string[] | null
          created_at?: string
          current_task_ref?: string | null
          domain?: string | null
          expected_cost_avoided?: number | null
          expected_quality_gain?: number | null
          id?: string
          recommendation_state?: string | null
          similarity_score?: number | null
          tenant_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      intent_resolutions: {
        Row: {
          actor_id: string
          confidence: number | null
          created_at: string
          id: string
          raw_input: string | null
          resolved_intent: string | null
          source_device_id: string | null
          source_surface: string | null
          status: string | null
          target_capability: string | null
        }
        Insert: {
          actor_id: string
          confidence?: number | null
          created_at?: string
          id?: string
          raw_input?: string | null
          resolved_intent?: string | null
          source_device_id?: string | null
          source_surface?: string | null
          status?: string | null
          target_capability?: string | null
        }
        Update: {
          actor_id?: string
          confidence?: number | null
          created_at?: string
          id?: string
          raw_input?: string | null
          resolved_intent?: string | null
          source_device_id?: string | null
          source_surface?: string | null
          status?: string | null
          target_capability?: string | null
        }
        Relationships: []
      }
      interruption_policies: {
        Row: {
          activity_states: string[] | null
          allowed_urgencies: string[] | null
          created_at: string
          device_families: string[] | null
          enabled: boolean | null
          id: string
          metadata: Json | null
          policy_name: string
          priority: number | null
          suppress_categories: string[] | null
          time_range_end: string | null
          time_range_start: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_states?: string[] | null
          allowed_urgencies?: string[] | null
          created_at?: string
          device_families?: string[] | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          policy_name: string
          priority?: number | null
          suppress_categories?: string[] | null
          time_range_end?: string | null
          time_range_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_states?: string[] | null
          allowed_urgencies?: string[] | null
          created_at?: string
          device_families?: string[] | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          policy_name?: string
          priority?: number | null
          suppress_categories?: string[] | null
          time_range_end?: string | null
          time_range_start?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_accounts: {
        Row: {
          account_label: string
          account_type: string
          available_cash: number | null
          base_currency: string | null
          connection_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          risk_flags: string[] | null
          status: string
          sync_health: string | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_label: string
          account_type?: string
          available_cash?: number | null
          base_currency?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          risk_flags?: string[] | null
          status?: string
          sync_health?: string | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_label?: string
          account_type?: string
          available_cash?: number | null
          base_currency?: string | null
          connection_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          risk_flags?: string[] | null
          status?: string
          sync_health?: string | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_accounts_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "connected_investment_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_advisor_debates: {
        Row: {
          alignment_summary: string | null
          conflicting_assumptions: Json | null
          created_at: string
          disagreement_summary: string | null
          id: string
          owner_id: string | null
          owner_type: string
          participating_advisor_ids: string[] | null
          resolution_signals: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alignment_summary?: string | null
          conflicting_assumptions?: Json | null
          created_at?: string
          disagreement_summary?: string | null
          id?: string
          owner_id?: string | null
          owner_type?: string
          participating_advisor_ids?: string[] | null
          resolution_signals?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alignment_summary?: string | null
          conflicting_assumptions?: Json | null
          created_at?: string
          disagreement_summary?: string | null
          id?: string
          owner_id?: string | null
          owner_type?: string
          participating_advisor_ids?: string[] | null
          resolution_signals?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_advisor_observations: {
        Row: {
          advisor_id: string | null
          confidence_level: number | null
          created_at: string
          detailed_reasoning: string | null
          id: string
          key_risks: Json | null
          owner_id: string | null
          owner_type: string
          recommendation_type: string | null
          summary: string | null
          title: string | null
          uncertainty_level: number | null
          updated_at: string
          user_id: string
          what_changed: string | null
          what_would_change_mind: string | null
        }
        Insert: {
          advisor_id?: string | null
          confidence_level?: number | null
          created_at?: string
          detailed_reasoning?: string | null
          id?: string
          key_risks?: Json | null
          owner_id?: string | null
          owner_type?: string
          recommendation_type?: string | null
          summary?: string | null
          title?: string | null
          uncertainty_level?: number | null
          updated_at?: string
          user_id: string
          what_changed?: string | null
          what_would_change_mind?: string | null
        }
        Update: {
          advisor_id?: string | null
          confidence_level?: number | null
          created_at?: string
          detailed_reasoning?: string | null
          id?: string
          key_risks?: Json | null
          owner_id?: string | null
          owner_type?: string
          recommendation_type?: string | null
          summary?: string | null
          title?: string | null
          uncertainty_level?: number | null
          updated_at?: string
          user_id?: string
          what_changed?: string | null
          what_would_change_mind?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_advisor_observations_advisor_id_fkey"
            columns: ["advisor_id"]
            isOneToOne: false
            referencedRelation: "investment_advisor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_advisor_profiles: {
        Row: {
          active: boolean | null
          advisor_type: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          output_style_preferences: Json | null
          priority: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          advisor_type: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          output_style_preferences?: Json | null
          priority?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          advisor_type?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          output_style_preferences?: Json | null
          priority?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_behavioral_signals: {
        Row: {
          created_at: string
          evidence_summary: string | null
          id: string
          requires_approval: boolean | null
          requires_cooldown: boolean | null
          requires_simulation: boolean | null
          resolved_at: string | null
          severity: string | null
          signal_type: string
          suggested_intervention: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          evidence_summary?: string | null
          id?: string
          requires_approval?: boolean | null
          requires_cooldown?: boolean | null
          requires_simulation?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          signal_type: string
          suggested_intervention?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          evidence_summary?: string | null
          id?: string
          requires_approval?: boolean | null
          requires_cooldown?: boolean | null
          requires_simulation?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          signal_type?: string
          suggested_intervention?: string | null
          user_id?: string
        }
        Relationships: []
      }
      investment_constitutions: {
        Row: {
          cool_down_rules: Json | null
          created_at: string
          id: string
          journal_required_rules: Json | null
          max_event_sleeve_pct: number | null
          max_platform_exposure_pct: number | null
          max_single_position_pct: number | null
          max_speculative_sleeve_pct: number | null
          override_policy: Json | null
          require_approval_rules: Json | null
          require_simulation_rules: Json | null
          updated_at: string
          user_id: string
          version: number | null
        }
        Insert: {
          cool_down_rules?: Json | null
          created_at?: string
          id?: string
          journal_required_rules?: Json | null
          max_event_sleeve_pct?: number | null
          max_platform_exposure_pct?: number | null
          max_single_position_pct?: number | null
          max_speculative_sleeve_pct?: number | null
          override_policy?: Json | null
          require_approval_rules?: Json | null
          require_simulation_rules?: Json | null
          updated_at?: string
          user_id: string
          version?: number | null
        }
        Update: {
          cool_down_rules?: Json | null
          created_at?: string
          id?: string
          journal_required_rules?: Json | null
          max_event_sleeve_pct?: number | null
          max_platform_exposure_pct?: number | null
          max_single_position_pct?: number | null
          max_speculative_sleeve_pct?: number | null
          override_policy?: Json | null
          require_approval_rules?: Json | null
          require_simulation_rules?: Json | null
          updated_at?: string
          user_id?: string
          version?: number | null
        }
        Relationships: []
      }
      investment_decision_records: {
        Row: {
          advisor_snapshot_id: string | null
          constitution_check_result: Json | null
          created_at: string
          decision_type: string
          executed_at: string | null
          id: string
          proposed_platform: string | null
          proposed_sizing: Json | null
          rationale_summary: string | null
          readiness_score: number | null
          related_account_ids: string[] | null
          related_asset_ids: string[] | null
          related_strategy_id: string | null
          related_thesis_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_snapshot_id?: string | null
          constitution_check_result?: Json | null
          created_at?: string
          decision_type?: string
          executed_at?: string | null
          id?: string
          proposed_platform?: string | null
          proposed_sizing?: Json | null
          rationale_summary?: string | null
          readiness_score?: number | null
          related_account_ids?: string[] | null
          related_asset_ids?: string[] | null
          related_strategy_id?: string | null
          related_thesis_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_snapshot_id?: string | null
          constitution_check_result?: Json | null
          created_at?: string
          decision_type?: string
          executed_at?: string | null
          id?: string
          proposed_platform?: string | null
          proposed_sizing?: Json | null
          rationale_summary?: string | null
          readiness_score?: number | null
          related_account_ids?: string[] | null
          related_asset_ids?: string[] | null
          related_strategy_id?: string | null
          related_thesis_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_decision_records_related_strategy_id_fkey"
            columns: ["related_strategy_id"]
            isOneToOne: false
            referencedRelation: "investment_strategy_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_decision_records_related_thesis_id_fkey"
            columns: ["related_thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis_records"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_execution_records: {
        Row: {
          account_id: string | null
          average_execution_price: number | null
          decision_id: string | null
          executed_at: string | null
          executed_value: number | null
          execution_status: string
          fee_actual: number | null
          fee_estimate: number | null
          id: string
          metadata: Json | null
          platform_id: string | null
          quantity: number | null
          slippage_actual: number | null
          slippage_estimate: number | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          average_execution_price?: number | null
          decision_id?: string | null
          executed_at?: string | null
          executed_value?: number | null
          execution_status?: string
          fee_actual?: number | null
          fee_estimate?: number | null
          id?: string
          metadata?: Json | null
          platform_id?: string | null
          quantity?: number | null
          slippage_actual?: number | null
          slippage_estimate?: number | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          average_execution_price?: number | null
          decision_id?: string | null
          executed_at?: string | null
          executed_value?: number | null
          execution_status?: string
          fee_actual?: number | null
          fee_estimate?: number | null
          id?: string
          metadata?: Json | null
          platform_id?: string | null
          quantity?: number | null
          slippage_actual?: number | null
          slippage_estimate?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_execution_records_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "investment_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_execution_records_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "investment_decision_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_execution_records_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "connected_investment_platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_journal_entries: {
        Row: {
          confidence_self_rating: number | null
          content: string | null
          created_at: string
          decision_id: string | null
          discipline_self_rating: number | null
          emotional_tags: string[] | null
          entry_type: string
          id: string
          thesis_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_self_rating?: number | null
          content?: string | null
          created_at?: string
          decision_id?: string | null
          discipline_self_rating?: number | null
          emotional_tags?: string[] | null
          entry_type?: string
          id?: string
          thesis_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_self_rating?: number | null
          content?: string | null
          created_at?: string
          decision_id?: string | null
          discipline_self_rating?: number | null
          emotional_tags?: string[] | null
          entry_type?: string
          id?: string
          thesis_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_journal_entries_thesis_id_fkey"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis_records"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_office_profiles: {
        Row: {
          advisor_mode_preference: string | null
          created_at: string
          currency_base: string | null
          default_view: string | null
          enabled: boolean | null
          experience_level: string
          id: string
          office_mode: string
          region: string | null
          restricted_features: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_mode_preference?: string | null
          created_at?: string
          currency_base?: string | null
          default_view?: string | null
          enabled?: boolean | null
          experience_level?: string
          id?: string
          office_mode?: string
          region?: string | null
          restricted_features?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_mode_preference?: string | null
          created_at?: string
          currency_base?: string | null
          default_view?: string | null
          enabled?: boolean | null
          experience_level?: string
          id?: string
          office_mode?: string
          region?: string | null
          restricted_features?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_receipts: {
        Row: {
          actor: string | null
          advisor_snapshot_id: string | null
          approval_state: string | null
          created_at: string
          exportable_bundle_ref: string | null
          id: string
          receipt_type: string
          related_decision_id: string | null
          related_execution_id: string | null
          related_thesis_id: string | null
          risk_summary: Json | null
          summary: string | null
          user_id: string
        }
        Insert: {
          actor?: string | null
          advisor_snapshot_id?: string | null
          approval_state?: string | null
          created_at?: string
          exportable_bundle_ref?: string | null
          id?: string
          receipt_type?: string
          related_decision_id?: string | null
          related_execution_id?: string | null
          related_thesis_id?: string | null
          risk_summary?: Json | null
          summary?: string | null
          user_id: string
        }
        Update: {
          actor?: string | null
          advisor_snapshot_id?: string | null
          approval_state?: string | null
          created_at?: string
          exportable_bundle_ref?: string | null
          id?: string
          receipt_type?: string
          related_decision_id?: string | null
          related_execution_id?: string | null
          related_thesis_id?: string | null
          risk_summary?: Json | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_receipts_related_decision_id_fkey"
            columns: ["related_decision_id"]
            isOneToOne: false
            referencedRelation: "investment_decision_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_receipts_related_execution_id_fkey"
            columns: ["related_execution_id"]
            isOneToOne: false
            referencedRelation: "investment_execution_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_receipts_related_thesis_id_fkey"
            columns: ["related_thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis_records"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_scenario_sets: {
        Row: {
          created_at: string
          id: string
          owner_id: string | null
          owner_type: string
          scenarios: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id?: string | null
          owner_type?: string
          scenarios?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string | null
          owner_type?: string
          scenarios?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_signals: {
        Row: {
          acknowledged_at: string | null
          asset_id: string | null
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          related_advisor_ids: string[] | null
          related_catalyst_id: string | null
          severity: string | null
          signal_type: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          asset_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          related_advisor_ids?: string[] | null
          related_catalyst_id?: string | null
          severity?: string | null
          signal_type: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          asset_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          related_advisor_ids?: string[] | null
          related_catalyst_id?: string | null
          severity?: string | null
          signal_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_signals_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_master"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_strategy_records: {
        Row: {
          advisor_summary_id: string | null
          allocation_model: Json | null
          created_at: string
          horizon: string | null
          id: string
          objective: string | null
          readiness_status: string | null
          scenario_set_id: string | null
          strategy_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_summary_id?: string | null
          allocation_model?: Json | null
          created_at?: string
          horizon?: string | null
          id?: string
          objective?: string | null
          readiness_status?: string | null
          scenario_set_id?: string | null
          strategy_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_summary_id?: string | null
          allocation_model?: Json | null
          created_at?: string
          horizon?: string | null
          id?: string
          objective?: string | null
          readiness_status?: string | null
          scenario_set_id?: string | null
          strategy_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investment_watchlists: {
        Row: {
          asset_ids: string[] | null
          created_at: string
          id: string
          name: string
          rules: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_ids?: string[] | null
          created_at?: string
          id?: string
          name: string
          rules?: Json | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_ids?: string[] | null
          created_at?: string
          id?: string
          name?: string
          rules?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          aging_days: number | null
          amount: number
          created_at: string
          customer_id: string | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          payment_proof: string | null
          quote_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          aging_days?: number | null
          amount: number
          created_at?: string
          customer_id?: string | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          payment_proof?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          aging_days?: number | null
          amount?: number
          created_at?: string
          customer_id?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          payment_proof?: string | null
          quote_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_executions: {
        Row: {
          attempt_number: number
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_class: string | null
          error_message: string | null
          escalated: boolean | null
          id: string
          job_id: string
          metadata: Json | null
          mode: string
          output: Json | null
          policy_decision: string | null
          retryable: boolean | null
          started_at: string
          status: string
          triggered_by: string
          user_id: string
          verification_result: string | null
        }
        Insert: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_class?: string | null
          error_message?: string | null
          escalated?: boolean | null
          id?: string
          job_id: string
          metadata?: Json | null
          mode?: string
          output?: Json | null
          policy_decision?: string | null
          retryable?: boolean | null
          started_at?: string
          status?: string
          triggered_by?: string
          user_id: string
          verification_result?: string | null
        }
        Update: {
          attempt_number?: number
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_class?: string | null
          error_message?: string | null
          escalated?: boolean | null
          id?: string
          job_id?: string
          metadata?: Json | null
          mode?: string
          output?: Json | null
          policy_decision?: string | null
          retryable?: boolean | null
          started_at?: string
          status?: string
          triggered_by?: string
          user_id?: string
          verification_result?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_executions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "scheduled_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_step_results: {
        Row: {
          actual_behavior: string | null
          created_at: string
          duration_ms: number | null
          error_summary: string | null
          id: string
          journey_step_id: string | null
          screenshot_ref: string | null
          status: string
          step_order: number
          trace_ref: string | null
          user_id: string
          verification_run_id: string
        }
        Insert: {
          actual_behavior?: string | null
          created_at?: string
          duration_ms?: number | null
          error_summary?: string | null
          id?: string
          journey_step_id?: string | null
          screenshot_ref?: string | null
          status?: string
          step_order: number
          trace_ref?: string | null
          user_id: string
          verification_run_id: string
        }
        Update: {
          actual_behavior?: string | null
          created_at?: string
          duration_ms?: number | null
          error_summary?: string | null
          id?: string
          journey_step_id?: string | null
          screenshot_ref?: string | null
          status?: string
          step_order?: number
          trace_ref?: string | null
          user_id?: string
          verification_run_id?: string
        }
        Relationships: []
      }
      journey_verification_runs: {
        Row: {
          branch_name: string | null
          commit_sha: string | null
          completed_at: string | null
          created_at: string
          environment: string
          evidence_bundle_ref: string | null
          id: string
          journey_id: string
          launch_impact: string | null
          mode: string
          proof_confidence: string
          run_identifier: string | null
          started_at: string | null
          status: string
          steps_failed: number
          steps_passed: number
          steps_skipped: number
          summary: string | null
          verification_type: string
        }
        Insert: {
          branch_name?: string | null
          commit_sha?: string | null
          completed_at?: string | null
          created_at?: string
          environment: string
          evidence_bundle_ref?: string | null
          id?: string
          journey_id: string
          launch_impact?: string | null
          mode: string
          proof_confidence: string
          run_identifier?: string | null
          started_at?: string | null
          status: string
          steps_failed?: number
          steps_passed?: number
          steps_skipped?: number
          summary?: string | null
          verification_type: string
        }
        Update: {
          branch_name?: string | null
          commit_sha?: string | null
          completed_at?: string | null
          created_at?: string
          environment?: string
          evidence_bundle_ref?: string | null
          id?: string
          journey_id?: string
          launch_impact?: string | null
          mode?: string
          proof_confidence?: string
          run_identifier?: string | null
          started_at?: string | null
          status?: string
          steps_failed?: number
          steps_passed?: number
          steps_skipped?: number
          summary?: string | null
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_verification_runs_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "customer_journey_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_verification_runs_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "v_customer_journey_summary"
            referencedColumns: ["registry_id"]
          },
        ]
      }
      launch_blocker_scores: {
        Row: {
          affects_admin: boolean
          affects_demo: boolean
          affects_real: boolean
          affects_user: boolean
          blocker_type: string
          created_at: string
          id: string
          journey_id: string | null
          journey_key: string | null
          reason_summary: string
          resolved: boolean
          resolved_at: string | null
          severity_score: number
          user_id: string
          verification_run_id: string | null
        }
        Insert: {
          affects_admin?: boolean
          affects_demo?: boolean
          affects_real?: boolean
          affects_user?: boolean
          blocker_type?: string
          created_at?: string
          id?: string
          journey_id?: string | null
          journey_key?: string | null
          reason_summary?: string
          resolved?: boolean
          resolved_at?: string | null
          severity_score?: number
          user_id: string
          verification_run_id?: string | null
        }
        Update: {
          affects_admin?: boolean
          affects_demo?: boolean
          affects_real?: boolean
          affects_user?: boolean
          blocker_type?: string
          created_at?: string
          id?: string
          journey_id?: string | null
          journey_key?: string | null
          reason_summary?: string
          resolved?: boolean
          resolved_at?: string | null
          severity_score?: number
          user_id?: string
          verification_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "launch_blocker_scores_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "customer_journey_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "launch_blocker_scores_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "v_customer_journey_summary"
            referencedColumns: ["registry_id"]
          },
        ]
      }
      launch_blockers: {
        Row: {
          created_at: string
          description: string | null
          gate_id: string | null
          id: string
          resolution_notes: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          source: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          gate_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          source: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          gate_id?: string | null
          id?: string
          resolution_notes?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          source?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_blockers_gate_id_fkey"
            columns: ["gate_id"]
            isOneToOne: false
            referencedRelation: "launch_gates"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_gate_checks: {
        Row: {
          check_name: string
          check_type: string
          checked_at: string
          checked_by: string | null
          evidence: string | null
          gate_id: string
          id: string
          passed: boolean
          user_id: string
        }
        Insert: {
          check_name: string
          check_type?: string
          checked_at?: string
          checked_by?: string | null
          evidence?: string | null
          gate_id: string
          id?: string
          passed?: boolean
          user_id: string
        }
        Update: {
          check_name?: string
          check_type?: string
          checked_at?: string
          checked_by?: string | null
          evidence?: string | null
          gate_id?: string
          id?: string
          passed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_gate_checks_gate_id_fkey"
            columns: ["gate_id"]
            isOneToOne: false
            referencedRelation: "launch_gates"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_gate_criteria: {
        Row: {
          category: string
          created_at: string
          evidence_refs: Json | null
          gate_id: string | null
          id: string
          last_checked_at: string | null
          name: string
          notes: string | null
          required: boolean | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          evidence_refs?: Json | null
          gate_id?: string | null
          id?: string
          last_checked_at?: string | null
          name: string
          notes?: string | null
          required?: boolean | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          evidence_refs?: Json | null
          gate_id?: string | null
          id?: string
          last_checked_at?: string | null
          name?: string
          notes?: string | null
          required?: boolean | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_gate_criteria_gate_id_fkey"
            columns: ["gate_id"]
            isOneToOne: false
            referencedRelation: "launch_gates"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_gates: {
        Row: {
          blockers: string[] | null
          blockers_count: number | null
          created_at: string
          criteria_met: number | null
          criteria_total: number | null
          current_truth_score: number | null
          demo_available: boolean | null
          domain: string | null
          environment: string | null
          evidence: Json | null
          feature_key: string | null
          feature_name: string | null
          gate_score: number | null
          has_error_handling: boolean | null
          has_real_auth: boolean | null
          has_real_backend: boolean | null
          has_real_data: boolean | null
          has_tests: boolean | null
          honesty_class: string | null
          id: string
          last_evaluated_at: string | null
          last_verified_at: string | null
          metadata: Json | null
          name: string
          notes: string | null
          state: string | null
          status: string | null
          truth_threshold: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string[] | null
          blockers_count?: number | null
          created_at?: string
          criteria_met?: number | null
          criteria_total?: number | null
          current_truth_score?: number | null
          demo_available?: boolean | null
          domain?: string | null
          environment?: string | null
          evidence?: Json | null
          feature_key?: string | null
          feature_name?: string | null
          gate_score?: number | null
          has_error_handling?: boolean | null
          has_real_auth?: boolean | null
          has_real_backend?: boolean | null
          has_real_data?: boolean | null
          has_tests?: boolean | null
          honesty_class?: string | null
          id?: string
          last_evaluated_at?: string | null
          last_verified_at?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          state?: string | null
          status?: string | null
          truth_threshold?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string[] | null
          blockers_count?: number | null
          created_at?: string
          criteria_met?: number | null
          criteria_total?: number | null
          current_truth_score?: number | null
          demo_available?: boolean | null
          domain?: string | null
          environment?: string | null
          evidence?: Json | null
          feature_key?: string | null
          feature_name?: string | null
          gate_score?: number | null
          has_error_handling?: boolean | null
          has_real_auth?: boolean | null
          has_real_backend?: boolean | null
          has_real_data?: boolean | null
          has_tests?: boolean | null
          honesty_class?: string | null
          id?: string
          last_evaluated_at?: string | null
          last_verified_at?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          state?: string | null
          status?: string | null
          truth_threshold?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      launch_honesty_surface_bindings: {
        Row: {
          binding_key: string
          binding_type: string
          created_at: string
          id: string
          last_verified_at: string | null
          launch_honesty_class: string
          notes: string | null
          public_claim_allowed: boolean
          qualifier_required: boolean
        }
        Insert: {
          binding_key: string
          binding_type: string
          created_at?: string
          id?: string
          last_verified_at?: string | null
          launch_honesty_class: string
          notes?: string | null
          public_claim_allowed?: boolean
          qualifier_required?: boolean
        }
        Update: {
          binding_key?: string
          binding_type?: string
          created_at?: string
          id?: string
          last_verified_at?: string | null
          launch_honesty_class?: string
          notes?: string | null
          public_claim_allowed?: boolean
          qualifier_required?: boolean
        }
        Relationships: []
      }
      launch_records: {
        Row: {
          advisor_signoff_state: Json | null
          checklist_items: Json | null
          created_at: string
          id: string
          launch_at: string | null
          linked_pages: string[] | null
          linked_promotions: string[] | null
          objective: string | null
          presence_profile_id: string | null
          readiness_state: string | null
          rollback_plan: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_signoff_state?: Json | null
          checklist_items?: Json | null
          created_at?: string
          id?: string
          launch_at?: string | null
          linked_pages?: string[] | null
          linked_promotions?: string[] | null
          objective?: string | null
          presence_profile_id?: string | null
          readiness_state?: string | null
          rollback_plan?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_signoff_state?: Json | null
          checklist_items?: Json | null
          created_at?: string
          id?: string
          launch_at?: string | null
          linked_pages?: string[] | null
          linked_promotions?: string[] | null
          objective?: string | null
          presence_profile_id?: string | null
          readiness_state?: string | null
          rollback_plan?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_records_presence_profile_id_fkey"
            columns: ["presence_profile_id"]
            isOneToOne: false
            referencedRelation: "digital_presence_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_advisor: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
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
          assigned_advisor?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          likely_value?: number | null
          name: string
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
          assigned_advisor?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
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
        Relationships: []
      }
      market_memory_events: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          event_type: string
          id: string
          related_advisor_ids: string[] | null
          related_asset_ids: string[] | null
          related_decision_id: string | null
          related_thesis_id: string | null
          severity: string | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          event_type: string
          id?: string
          related_advisor_ids?: string[] | null
          related_asset_ids?: string[] | null
          related_decision_id?: string | null
          related_thesis_id?: string | null
          severity?: string | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          event_type?: string
          id?: string
          related_advisor_ids?: string[] | null
          related_asset_ids?: string[] | null
          related_decision_id?: string | null
          related_thesis_id?: string | null
          severity?: string | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_corrections: {
        Row: {
          actor_id: string
          correction_type: string | null
          created_at: string
          id: string
          memory_ref: string
          new_value_ref: string | null
          old_value_ref: string | null
          reason: string | null
        }
        Insert: {
          actor_id: string
          correction_type?: string | null
          created_at?: string
          id?: string
          memory_ref: string
          new_value_ref?: string | null
          old_value_ref?: string | null
          reason?: string | null
        }
        Update: {
          actor_id?: string
          correction_type?: string | null
          created_at?: string
          id?: string
          memory_ref?: string
          new_value_ref?: string | null
          old_value_ref?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      memory_governance_records: {
        Row: {
          archival_state: string | null
          confidence: number | null
          correction_state: string | null
          freshness: string | null
          id: string
          memory_ref: string
          updated_at: string
          user_id: string
          visibility_scope: string | null
        }
        Insert: {
          archival_state?: string | null
          confidence?: number | null
          correction_state?: string | null
          freshness?: string | null
          id?: string
          memory_ref: string
          updated_at?: string
          user_id: string
          visibility_scope?: string | null
        }
        Update: {
          archival_state?: string | null
          confidence?: number | null
          correction_state?: string | null
          freshness?: string | null
          id?: string
          memory_ref?: string
          updated_at?: string
          user_id?: string
          visibility_scope?: string | null
        }
        Relationships: []
      }
      metrics_snapshots: {
        Row: {
          domain: string
          id: string
          metrics: Json | null
          period: string | null
          snapshot_at: string | null
          user_id: string
        }
        Insert: {
          domain: string
          id?: string
          metrics?: Json | null
          period?: string | null
          snapshot_at?: string | null
          user_id: string
        }
        Update: {
          domain?: string
          id?: string
          metrics?: Json | null
          period?: string | null
          snapshot_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      micro_approval_policies: {
        Row: {
          allowed: boolean | null
          approval_class: string
          cooldown_seconds: number | null
          created_at: string
          device_family_key: string
          escalation_target: string | null
          id: string
          max_value_cents: number | null
          metadata: Json | null
          receipt_required: boolean | null
          requires_biometric: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed?: boolean | null
          approval_class: string
          cooldown_seconds?: number | null
          created_at?: string
          device_family_key: string
          escalation_target?: string | null
          id?: string
          max_value_cents?: number | null
          metadata?: Json | null
          receipt_required?: boolean | null
          requires_biometric?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed?: boolean | null
          approval_class?: string
          cooldown_seconds?: number | null
          created_at?: string
          device_family_key?: string
          escalation_target?: string | null
          id?: string
          max_value_cents?: number | null
          metadata?: Json | null
          receipt_required?: boolean | null
          requires_biometric?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mock_replacements: {
        Row: {
          blockers: string[] | null
          created_at: string
          dependencies: string[]
          done_at: string | null
          expected_contract: string | null
          feature_name: string
          id: string
          migration_owner: string | null
          migration_priority: string
          migration_status: string
          mock_source: string
          mock_type: string
          page_path: string
          real_backend_target: string | null
          runtime_evidence: Json
          runtime_validated: boolean
          sequence_order: number
          updated_at: string
          user_id: string
          validation_evidence: Json | null
        }
        Insert: {
          blockers?: string[] | null
          created_at?: string
          dependencies?: string[]
          done_at?: string | null
          expected_contract?: string | null
          feature_name: string
          id?: string
          migration_owner?: string | null
          migration_priority?: string
          migration_status?: string
          mock_source: string
          mock_type?: string
          page_path: string
          real_backend_target?: string | null
          runtime_evidence?: Json
          runtime_validated?: boolean
          sequence_order?: number
          updated_at?: string
          user_id: string
          validation_evidence?: Json | null
        }
        Update: {
          blockers?: string[] | null
          created_at?: string
          dependencies?: string[]
          done_at?: string | null
          expected_contract?: string | null
          feature_name?: string
          id?: string
          migration_owner?: string | null
          migration_priority?: string
          migration_status?: string
          mock_source?: string
          mock_type?: string
          page_path?: string
          real_backend_target?: string | null
          runtime_evidence?: Json
          runtime_validated?: boolean
          sequence_order?: number
          updated_at?: string
          user_id?: string
          validation_evidence?: Json | null
        }
        Relationships: []
      }
      mode_access_policies: {
        Row: {
          allowed_roles: string[]
          allowed_tenants: string[]
          created_at: string
          id: string
          mode_key: string
          requires_demo_token: boolean
          requires_operator_approval: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allowed_roles?: string[]
          allowed_tenants?: string[]
          created_at?: string
          id?: string
          mode_key: string
          requires_demo_token?: boolean
          requires_operator_approval?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allowed_roles?: string[]
          allowed_tenants?: string[]
          created_at?: string
          id?: string
          mode_key?: string
          requires_demo_token?: boolean
          requires_operator_approval?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mode_aware_providers: {
        Row: {
          created_at: string
          current_version: number
          demo_implementation_ref: string | null
          domain: string
          id: string
          provider_interface_name: string
          real_implementation_ref: string | null
          sandbox_implementation_ref: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_version?: number
          demo_implementation_ref?: string | null
          domain: string
          id?: string
          provider_interface_name: string
          real_implementation_ref?: string | null
          sandbox_implementation_ref?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_version?: number
          demo_implementation_ref?: string | null
          domain?: string
          id?: string
          provider_interface_name?: string
          real_implementation_ref?: string | null
          sandbox_implementation_ref?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mode_segregation_audits: {
        Row: {
          capability_key: string | null
          created_at: string
          details: Json
          id: string
          issue_type: string
          resolved: boolean
          resolved_at: string | null
          route_key: string | null
          severity: string
        }
        Insert: {
          capability_key?: string | null
          created_at?: string
          details?: Json
          id?: string
          issue_type: string
          resolved?: boolean
          resolved_at?: string | null
          route_key?: string | null
          severity: string
        }
        Update: {
          capability_key?: string | null
          created_at?: string
          details?: Json
          id?: string
          issue_type?: string
          resolved?: boolean
          resolved_at?: string | null
          route_key?: string | null
          severity?: string
        }
        Relationships: []
      }
      mode_truth_labels: {
        Row: {
          analytics_segregation_label: string
          banner_style: string
          created_at: string
          disclosure_level: string
          id: string
          launch_claim_class: string
          mode_key: string
          proof_label_style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics_segregation_label?: string
          banner_style?: string
          created_at?: string
          disclosure_level?: string
          id?: string
          launch_claim_class?: string
          mode_key: string
          proof_label_style?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics_segregation_label?: string
          banner_style?: string
          created_at?: string
          disclosure_level?: string
          id?: string
          launch_claim_class?: string
          mode_key?: string
          proof_label_style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      money_policies: {
        Row: {
          category: string
          created_at: string
          description: string | null
          enabled: boolean
          icon_key: string | null
          id: string
          threshold: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon_key?: string | null
          id?: string
          threshold?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          enabled?: boolean
          icon_key?: string | null
          id?: string
          threshold?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_delivery_receipts: {
        Row: {
          channel: string
          created_at: string
          delivered_at: string | null
          failure_reason: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          notification_id: string | null
          opened_at: string | null
          platform: string
          sent_at: string
          status: string
          user_id: string
        }
        Insert: {
          channel?: string
          created_at?: string
          delivered_at?: string | null
          failure_reason?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          notification_id?: string | null
          opened_at?: string | null
          platform?: string
          sent_at?: string
          status?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          delivered_at?: string | null
          failure_reason?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          notification_id?: string | null
          opened_at?: string | null
          platform?: string
          sent_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_receipts_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications_queue"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_fatigue_profiles: {
        Row: {
          cooldown_minutes: number | null
          created_at: string
          escalation_only_after_minutes: number | null
          focus_mode_behavior: string | null
          id: string
          max_notifications_per_hour: number | null
          max_watch_notifications_per_hour: number | null
          metadata: Json | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          quiet_hours_timezone: string | null
          sleep_behavior: string | null
          updated_at: string
          user_id: string
          workout_behavior: string | null
        }
        Insert: {
          cooldown_minutes?: number | null
          created_at?: string
          escalation_only_after_minutes?: number | null
          focus_mode_behavior?: string | null
          id?: string
          max_notifications_per_hour?: number | null
          max_watch_notifications_per_hour?: number | null
          metadata?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiet_hours_timezone?: string | null
          sleep_behavior?: string | null
          updated_at?: string
          user_id: string
          workout_behavior?: string | null
        }
        Update: {
          cooldown_minutes?: number | null
          created_at?: string
          escalation_only_after_minutes?: number | null
          focus_mode_behavior?: string | null
          id?: string
          max_notifications_per_hour?: number | null
          max_watch_notifications_per_hour?: number | null
          metadata?: Json | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          quiet_hours_timezone?: string | null
          sleep_behavior?: string | null
          updated_at?: string
          user_id?: string
          workout_behavior?: string | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          category: string
          channel_email: boolean
          channel_in_app: boolean
          channel_push: boolean
          created_at: string
          enabled: boolean
          id: string
          updated_at: string
          urgency_minimum: string
          user_id: string
        }
        Insert: {
          category: string
          channel_email?: boolean
          channel_in_app?: boolean
          channel_push?: boolean
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          urgency_minimum?: string
          user_id: string
        }
        Update: {
          category?: string
          channel_email?: boolean
          channel_in_app?: boolean
          channel_push?: boolean
          created_at?: string
          enabled?: boolean
          id?: string
          updated_at?: string
          urgency_minimum?: string
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
          type: string
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
          type?: string
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
          type?: string
          urgency?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications_queue: {
        Row: {
          action_url: string | null
          body: string | null
          category: string
          channel: string
          created_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          title: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          category: string
          channel?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          title: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          category?: string
          channel?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      oauth_client_registry: {
        Row: {
          active: boolean | null
          allowed_capabilities: string[] | null
          authorized_origins: string[] | null
          client_name: string
          client_purpose: string
          created_at: string
          environment: string | null
          id: string
          launch_stage: string | null
          notes: string | null
          provider_family_id: string
          redirect_uris: string[] | null
          rotation_metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          allowed_capabilities?: string[] | null
          authorized_origins?: string[] | null
          client_name: string
          client_purpose?: string
          created_at?: string
          environment?: string | null
          id?: string
          launch_stage?: string | null
          notes?: string | null
          provider_family_id: string
          redirect_uris?: string[] | null
          rotation_metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          allowed_capabilities?: string[] | null
          authorized_origins?: string[] | null
          client_name?: string
          client_purpose?: string
          created_at?: string
          environment?: string | null
          id?: string
          launch_stage?: string | null
          notes?: string | null
          provider_family_id?: string
          redirect_uris?: string[] | null
          rotation_metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_client_registry_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      operating_modes: {
        Row: {
          active: boolean | null
          ended_at: string | null
          id: string
          metadata: Json | null
          mode_key: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          mode_key?: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          mode_key?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      operator_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          payload: Json
          result: Json | null
          target_id: string | null
          target_table: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          payload?: Json
          result?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          payload?: Json
          result?: Json | null
          target_id?: string | null
          target_table?: string | null
          user_id?: string
        }
        Relationships: []
      }
      operator_taste_profiles: {
        Row: {
          confidence: number
          created_at: string
          id: string
          last_applied_at: string | null
          learned_from: string
          preference_key: string
          preference_value: Json
          times_applied: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          last_applied_at?: string | null
          learned_from?: string
          preference_key: string
          preference_value?: Json
          times_applied?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          last_applied_at?: string | null
          learned_from?: string
          preference_key?: string
          preference_value?: Json
          times_applied?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          blockers: string | null
          confidence: number | null
          created_at: string
          customer_id: string | null
          id: string
          last_movement_at: string | null
          next_action: string | null
          quote_status: string | null
          stage: string
          stale_risk: boolean | null
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          blockers?: string | null
          confidence?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          last_movement_at?: string | null
          next_action?: string | null
          quote_status?: string | null
          stage?: string
          stale_risk?: boolean | null
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          blockers?: string | null
          confidence?: number | null
          created_at?: string
          customer_id?: string | null
          id?: string
          last_movement_at?: string | null
          next_action?: string | null
          quote_status?: string | null
          stage?: string
          stale_risk?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_signals: {
        Row: {
          confidence: number | null
          created_at: string
          domain: string | null
          id: string
          importance_tier: string | null
          signal_type: string | null
          source_refs: string[] | null
          status: string | null
          summary: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          domain?: string | null
          id?: string
          importance_tier?: string | null
          signal_type?: string | null
          source_refs?: string[] | null
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          domain?: string | null
          id?: string
          importance_tier?: string | null
          signal_type?: string | null
          source_refs?: string[] | null
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      os_action_lineage: {
        Row: {
          action_type: string | null
          assigned_advisor: string | null
          blocking_reasons: string[]
          confidence_score: number
          created_at: string
          current_state: string
          depends_on: string[]
          domain: string
          entity_scope: Json
          id: string
          initiating_surface: string | null
          linked_event_ids: string[]
          linked_memory_ids: string[]
          linked_policy_ids: string[]
          linked_receipt_ids: string[]
          proof_ids: string[]
          replayable: boolean
          rollback_eligible: boolean
          state_history: Json
          stuck_since: string | null
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          action_type?: string | null
          assigned_advisor?: string | null
          blocking_reasons?: string[]
          confidence_score?: number
          created_at?: string
          current_state?: string
          depends_on?: string[]
          domain: string
          entity_scope?: Json
          id?: string
          initiating_surface?: string | null
          linked_event_ids?: string[]
          linked_memory_ids?: string[]
          linked_policy_ids?: string[]
          linked_receipt_ids?: string[]
          proof_ids?: string[]
          replayable?: boolean
          rollback_eligible?: boolean
          state_history?: Json
          stuck_since?: string | null
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          action_type?: string | null
          assigned_advisor?: string | null
          blocking_reasons?: string[]
          confidence_score?: number
          created_at?: string
          current_state?: string
          depends_on?: string[]
          domain?: string
          entity_scope?: Json
          id?: string
          initiating_surface?: string | null
          linked_event_ids?: string[]
          linked_memory_ids?: string[]
          linked_policy_ids?: string[]
          linked_receipt_ids?: string[]
          proof_ids?: string[]
          replayable?: boolean
          rollback_eligible?: boolean
          state_history?: Json
          stuck_since?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: []
      }
      os_event_log: {
        Row: {
          actor_id: string | null
          causation_id: string | null
          consumers_processed: string[]
          correlation_id: string | null
          created_at: string
          domain: string | null
          id: string
          idempotency_key: string | null
          metadata: Json | null
          payload: Json
          replay_eligible: boolean
          retention_class: string
          retry_count: number
          source: string
          status: string
          tenant_id: string | null
          topic: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          causation_id?: string | null
          consumers_processed?: string[]
          correlation_id?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          payload?: Json
          replay_eligible?: boolean
          retention_class?: string
          retry_count?: number
          source?: string
          status?: string
          tenant_id?: string | null
          topic: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          causation_id?: string | null
          consumers_processed?: string[]
          correlation_id?: string | null
          created_at?: string
          domain?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          payload?: Json
          replay_eligible?: boolean
          retention_class?: string
          retry_count?: number
          source?: string
          status?: string
          tenant_id?: string | null
          topic?: string
          user_id?: string
        }
        Relationships: []
      }
      os_memory_scoped: {
        Row: {
          confidence: number
          created_at: string
          domain: string | null
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          key: string
          memory_scope: string
          privacy_tier: string
          provenance: Json | null
          retention_class: string
          source: string
          superseded_by: string | null
          tags: string[]
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          confidence?: number
          created_at?: string
          domain?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          key: string
          memory_scope?: string
          privacy_tier?: string
          provenance?: Json | null
          retention_class?: string
          source?: string
          superseded_by?: string | null
          tags?: string[]
          updated_at?: string
          user_id: string
          value?: Json
        }
        Update: {
          confidence?: number
          created_at?: string
          domain?: string | null
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          memory_scope?: string
          privacy_tier?: string
          provenance?: Json | null
          retention_class?: string
          source?: string
          superseded_by?: string | null
          tags?: string[]
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "os_memory_scoped_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "os_memory_scoped"
            referencedColumns: ["id"]
          },
        ]
      }
      os_policy_evaluations: {
        Row: {
          action_target: string | null
          actor_id: string | null
          capability_id: string | null
          confidence: number | null
          context_snapshot: Json
          created_at: string
          domain: string | null
          effect: string
          evaluated_rules_count: number
          evaluation_time_ms: number | null
          id: string
          is_simulation: boolean
          linked_action_id: string | null
          linked_approval_id: string | null
          linked_receipt_id: string | null
          matched_conditions: Json
          reason: string
          risk_tier: string | null
          rule_id: string
          rule_name: string
          user_id: string
        }
        Insert: {
          action_target?: string | null
          actor_id?: string | null
          capability_id?: string | null
          confidence?: number | null
          context_snapshot?: Json
          created_at?: string
          domain?: string | null
          effect: string
          evaluated_rules_count?: number
          evaluation_time_ms?: number | null
          id?: string
          is_simulation?: boolean
          linked_action_id?: string | null
          linked_approval_id?: string | null
          linked_receipt_id?: string | null
          matched_conditions?: Json
          reason: string
          risk_tier?: string | null
          rule_id: string
          rule_name: string
          user_id: string
        }
        Update: {
          action_target?: string | null
          actor_id?: string | null
          capability_id?: string | null
          confidence?: number | null
          context_snapshot?: Json
          created_at?: string
          domain?: string | null
          effect?: string
          evaluated_rules_count?: number
          evaluation_time_ms?: number | null
          id?: string
          is_simulation?: boolean
          linked_action_id?: string | null
          linked_approval_id?: string | null
          linked_receipt_id?: string | null
          matched_conditions?: Json
          reason?: string
          risk_tier?: string | null
          rule_id?: string
          rule_name?: string
          user_id?: string
        }
        Relationships: []
      }
      os_service_state: {
        Row: {
          created_at: string
          id: string
          service_id: string
          state_snapshot: Json
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          service_id: string
          state_snapshot?: Json
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          service_id?: string
          state_snapshot?: Json
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      outcome_economics_records: {
        Row: {
          confidence: number | null
          created_at: string
          domain: string
          id: string
          mission_id: string | null
          outcome_type: string
          payback_ratio: number | null
          success_state: string | null
          tenant_id: string | null
          total_ai_cost_estimate: number | null
          total_cost_estimate: number | null
          user_id: string
          value_estimate: number | null
          verification_cost_estimate: number | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          domain: string
          id?: string
          mission_id?: string | null
          outcome_type?: string
          payback_ratio?: number | null
          success_state?: string | null
          tenant_id?: string | null
          total_ai_cost_estimate?: number | null
          total_cost_estimate?: number | null
          user_id: string
          value_estimate?: number | null
          verification_cost_estimate?: number | null
        }
        Update: {
          confidence?: number | null
          created_at?: string
          domain?: string
          id?: string
          mission_id?: string | null
          outcome_type?: string
          payback_ratio?: number | null
          success_state?: string | null
          tenant_id?: string | null
          total_ai_cost_estimate?: number | null
          total_cost_estimate?: number | null
          user_id?: string
          value_estimate?: number | null
          verification_cost_estimate?: number | null
        }
        Relationships: []
      }
      packet_compilation_records: {
        Row: {
          compile_cost_estimate: number | null
          compile_latency_ms: number | null
          compiler_version: string | null
          compression_ratio: number | null
          created_at: string
          id: string
          intelligence_packet_id: string | null
          quality_score: number | null
          source_refs: string[] | null
          user_id: string
        }
        Insert: {
          compile_cost_estimate?: number | null
          compile_latency_ms?: number | null
          compiler_version?: string | null
          compression_ratio?: number | null
          created_at?: string
          id?: string
          intelligence_packet_id?: string | null
          quality_score?: number | null
          source_refs?: string[] | null
          user_id: string
        }
        Update: {
          compile_cost_estimate?: number | null
          compile_latency_ms?: number | null
          compiler_version?: string | null
          compression_ratio?: number | null
          created_at?: string
          id?: string
          intelligence_packet_id?: string | null
          quality_score?: number | null
          source_refs?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packet_compilation_records_intelligence_packet_id_fkey"
            columns: ["intelligence_packet_id"]
            isOneToOne: false
            referencedRelation: "intelligence_packets"
            referencedColumns: ["id"]
          },
        ]
      }
      patch_executions: {
        Row: {
          change_plan_id: string
          created_at: string
          executed_at: string | null
          execution_mode: string
          id: string
          result: Json | null
          rollback_available: boolean | null
          user_id: string
          verification_result: Json | null
        }
        Insert: {
          change_plan_id: string
          created_at?: string
          executed_at?: string | null
          execution_mode: string
          id?: string
          result?: Json | null
          rollback_available?: boolean | null
          user_id: string
          verification_result?: Json | null
        }
        Update: {
          change_plan_id?: string
          created_at?: string
          executed_at?: string | null
          execution_mode?: string
          id?: string
          result?: Json | null
          rollback_available?: boolean | null
          user_id?: string
          verification_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "patch_executions_change_plan_id_fkey"
            columns: ["change_plan_id"]
            isOneToOne: false
            referencedRelation: "change_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_drift_records: {
        Row: {
          created_at: string
          description: string | null
          detected_at: string
          drift_type: string
          id: string
          impacted_capabilities: string[] | null
          provider_capability_id: string | null
          reauth_needed: boolean | null
          reconnect_needed: boolean | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          detected_at?: string
          drift_type?: string
          id?: string
          impacted_capabilities?: string[] | null
          provider_capability_id?: string | null
          reauth_needed?: boolean | null
          reconnect_needed?: boolean | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          detected_at?: string
          drift_type?: string
          id?: string
          impacted_capabilities?: string[] | null
          provider_capability_id?: string | null
          reauth_needed?: boolean | null
          reconnect_needed?: boolean | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_drift_records_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_levels: {
        Row: {
          created_at: string
          current_level: string | null
          granted_scopes: string[] | null
          id: string
          last_verified_at: string | null
          max_available_level: string | null
          provider_capability_id: string
          updated_at: string
          upgrade_available: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: string | null
          granted_scopes?: string[] | null
          id?: string
          last_verified_at?: string | null
          max_available_level?: string | null
          provider_capability_id: string
          updated_at?: string
          upgrade_available?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string | null
          granted_scopes?: string[] | null
          id?: string
          last_verified_at?: string | null
          max_available_level?: string | null
          provider_capability_id?: string
          updated_at?: string
          upgrade_available?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_levels_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_upgrade_requests: {
        Row: {
          approval_required: boolean
          connected_service_account_id: string
          created_at: string
          current_permission_level: string
          id: string
          notes: string | null
          requested_at: string
          requested_permission_level: string
          requested_scopes: Json
          resolved_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          approval_required?: boolean
          connected_service_account_id: string
          created_at?: string
          current_permission_level: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_permission_level: string
          requested_scopes?: Json
          resolved_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          approval_required?: boolean
          connected_service_account_id?: string
          created_at?: string
          current_permission_level?: string
          id?: string
          notes?: string | null
          requested_at?: string
          requested_permission_level?: string
          requested_scopes?: Json
          resolved_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permission_upgrade_requests_connected_service_account_id_fkey"
            columns: ["connected_service_account_id"]
            isOneToOne: false
            referencedRelation: "connected_service_links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permission_upgrade_requests_connected_service_account_id_fkey"
            columns: ["connected_service_account_id"]
            isOneToOne: false
            referencedRelation: "v_connected_accounts_center"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_operating_graph_edges: {
        Row: {
          created_at: string
          edge_type: string
          from_node_id: string | null
          id: string
          metadata: Json | null
          to_node_id: string | null
          user_id: string
          visibility_scope: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string
          edge_type?: string
          from_node_id?: string | null
          id?: string
          metadata?: Json | null
          to_node_id?: string | null
          user_id: string
          visibility_scope?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string
          edge_type?: string
          from_node_id?: string | null
          id?: string
          metadata?: Json | null
          to_node_id?: string | null
          user_id?: string
          visibility_scope?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_operating_graph_edges_from_node_id_fkey"
            columns: ["from_node_id"]
            isOneToOne: false
            referencedRelation: "personal_operating_graph_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_operating_graph_edges_to_node_id_fkey"
            columns: ["to_node_id"]
            isOneToOne: false
            referencedRelation: "personal_operating_graph_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_operating_graph_nodes: {
        Row: {
          created_at: string
          id: string
          label: string
          metadata: Json | null
          node_ref: string | null
          node_type: string
          state: string | null
          tenant_id: string | null
          updated_at: string
          user_id: string
          visibility_scope: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          metadata?: Json | null
          node_ref?: string | null
          node_type?: string
          state?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id: string
          visibility_scope?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          metadata?: Json | null
          node_ref?: string | null
          node_type?: string
          state?: string | null
          tenant_id?: string | null
          updated_at?: string
          user_id?: string
          visibility_scope?: string | null
          workspace_id?: string | null
        }
        Relationships: []
      }
      platform_admin_durability_states: {
        Row: {
          created_at: string
          degraded: boolean
          durable_store_ref: string | null
          id: string
          last_checked_at: string
          lineage_complete: boolean
          mutation_id: string | null
          persistence_confirmed: boolean
          projection_observed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          degraded?: boolean
          durable_store_ref?: string | null
          id?: string
          last_checked_at?: string
          lineage_complete?: boolean
          mutation_id?: string | null
          persistence_confirmed?: boolean
          projection_observed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          degraded?: boolean
          durable_store_ref?: string | null
          id?: string
          last_checked_at?: string
          lineage_complete?: boolean
          mutation_id?: string | null
          persistence_confirmed?: boolean
          projection_observed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_admin_durability_states_mutation_id_fkey"
            columns: ["mutation_id"]
            isOneToOne: false
            referencedRelation: "platform_admin_mutations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admin_mutations: {
        Row: {
          actor_id: string
          actor_type: string
          canonical_write_path_used: boolean
          created_at: string
          durability_status: string
          id: string
          mutation_type: string
          notes: string | null
          persisted_at: string | null
          policy_decision_ref: string | null
          projection_impact_refs: string[] | null
          receipt_ref: string | null
          rollback_eligible: boolean
          rollback_ref: string | null
          submitted_at: string
          surface: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          actor_type?: string
          canonical_write_path_used?: boolean
          created_at?: string
          durability_status?: string
          id?: string
          mutation_type: string
          notes?: string | null
          persisted_at?: string | null
          policy_decision_ref?: string | null
          projection_impact_refs?: string[] | null
          receipt_ref?: string | null
          rollback_eligible?: boolean
          rollback_ref?: string | null
          submitted_at?: string
          surface: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          actor_type?: string
          canonical_write_path_used?: boolean
          created_at?: string
          durability_status?: string
          id?: string
          mutation_type?: string
          notes?: string | null
          persisted_at?: string | null
          policy_decision_ref?: string | null
          projection_impact_refs?: string[] | null
          receipt_ref?: string | null
          rollback_eligible?: boolean
          rollback_ref?: string | null
          submitted_at?: string
          surface?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_concierge_continuity: {
        Row: {
          broken_at: string | null
          continuity_state: string
          created_at: string
          household_id: string | null
          id: string
          journey_type: string
          notes: string | null
          receipt_refs: string[] | null
          restored_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          broken_at?: string | null
          continuity_state?: string
          created_at?: string
          household_id?: string | null
          id?: string
          journey_type?: string
          notes?: string | null
          receipt_refs?: string[] | null
          restored_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          broken_at?: string | null
          continuity_state?: string
          created_at?: string
          household_id?: string | null
          id?: string
          journey_type?: string
          notes?: string | null
          receipt_refs?: string[] | null
          restored_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_connector_health: {
        Row: {
          capability_losses: string[] | null
          connector_id: string
          created_at: string
          degraded: boolean
          error_rate: number | null
          id: string
          last_checked_at: string
          last_healthy_at: string | null
          sync_state: string
          user_id: string
        }
        Insert: {
          capability_losses?: string[] | null
          connector_id: string
          created_at?: string
          degraded?: boolean
          error_rate?: number | null
          id?: string
          last_checked_at?: string
          last_healthy_at?: string | null
          sync_state?: string
          user_id: string
        }
        Update: {
          capability_losses?: string[] | null
          connector_id?: string
          created_at?: string
          degraded?: boolean
          error_rate?: number | null
          id?: string
          last_checked_at?: string
          last_healthy_at?: string | null
          sync_state?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_connector_lifecycle: {
        Row: {
          approved_actions: string[] | null
          blocked_actions: string[] | null
          connector_id: string
          created_at: string
          degraded_mode: boolean
          health_refs: string[] | null
          id: string
          last_transition_at: string
          policy_refs: string[] | null
          state: string
          state_reason: string | null
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          approved_actions?: string[] | null
          blocked_actions?: string[] | null
          connector_id: string
          created_at?: string
          degraded_mode?: boolean
          health_refs?: string[] | null
          id?: string
          last_transition_at?: string
          policy_refs?: string[] | null
          state?: string
          state_reason?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          approved_actions?: string[] | null
          blocked_actions?: string[] | null
          connector_id?: string
          created_at?: string
          degraded_mode?: boolean
          health_refs?: string[] | null
          id?: string
          last_transition_at?: string
          policy_refs?: string[] | null
          state?: string
          state_reason?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      platform_degraded_states: {
        Row: {
          affected_capabilities: string[] | null
          auto_detected: boolean
          component: string
          created_at: string
          detected_at: string
          domain: string
          id: string
          impact_description: string | null
          metadata: Json | null
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_capabilities?: string[] | null
          auto_detected?: boolean
          component: string
          created_at?: string
          detected_at?: string
          domain: string
          id?: string
          impact_description?: string | null
          metadata?: Json | null
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_capabilities?: string[] | null
          auto_detected?: boolean
          component?: string
          created_at?: string
          detected_at?: string
          domain?: string
          id?: string
          impact_description?: string | null
          metadata?: Json | null
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_deployment_gates: {
        Row: {
          created_at: string
          environment: string
          evidence_ref: string | null
          gate_type: string
          id: string
          last_updated_at: string
          owner: string | null
          release_id: string
          state: string
          user_id: string
        }
        Insert: {
          created_at?: string
          environment: string
          evidence_ref?: string | null
          gate_type: string
          id?: string
          last_updated_at?: string
          owner?: string | null
          release_id: string
          state?: string
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string
          evidence_ref?: string | null
          gate_type?: string
          id?: string
          last_updated_at?: string
          owner?: string | null
          release_id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_docs_runtime_drift: {
        Row: {
          acknowledged: boolean
          claim_summary: string | null
          created_at: string
          doc_ref: string
          evidence_summary: string | null
          id: string
          resolved_at: string | null
          runtime_scope: string
          severity: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean
          claim_summary?: string | null
          created_at?: string
          doc_ref: string
          evidence_summary?: string | null
          id?: string
          resolved_at?: string | null
          runtime_scope: string
          severity?: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean
          claim_summary?: string | null
          created_at?: string
          doc_ref?: string
          evidence_summary?: string | null
          id?: string
          resolved_at?: string | null
          runtime_scope?: string
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_environment_truth: {
        Row: {
          config_integrity_state: string
          created_at: string
          deployment_state: string
          dr_ready: boolean
          environment: string
          ha_ready: boolean
          id: string
          last_validated_at: string | null
          load_state: string
          release_id: string
          rollback_ready: boolean
          secret_integrity_state: string
          smoke_state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config_integrity_state?: string
          created_at?: string
          deployment_state?: string
          dr_ready?: boolean
          environment: string
          ha_ready?: boolean
          id?: string
          last_validated_at?: string | null
          load_state?: string
          release_id: string
          rollback_ready?: boolean
          secret_integrity_state?: string
          smoke_state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config_integrity_state?: string
          created_at?: string
          deployment_state?: string
          dr_ready?: boolean
          environment?: string
          ha_ready?: boolean
          id?: string
          last_validated_at?: string | null
          load_state?: string
          release_id?: string
          rollback_ready?: boolean
          secret_integrity_state?: string
          smoke_state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_health_snapshots: {
        Row: {
          check_duration_ms: number | null
          checked_at: string
          component: string
          created_at: string
          degraded_capabilities: string[] | null
          details: Json | null
          domain: string
          health_score: number | null
          health_status: string
          id: string
          user_id: string
        }
        Insert: {
          check_duration_ms?: number | null
          checked_at?: string
          component: string
          created_at?: string
          degraded_capabilities?: string[] | null
          details?: Json | null
          domain: string
          health_score?: number | null
          health_status?: string
          id?: string
          user_id: string
        }
        Update: {
          check_duration_ms?: number | null
          checked_at?: string
          component?: string
          created_at?: string
          degraded_capabilities?: string[] | null
          details?: Json | null
          domain?: string
          health_score?: number | null
          health_status?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_launch_blockers: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          evidence_missing: string[] | null
          id: string
          owner: string | null
          resolved_at: string | null
          ring_impact: string[] | null
          scope_ref: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          evidence_missing?: string[] | null
          id?: string
          owner?: string | null
          resolved_at?: string | null
          ring_impact?: string[] | null
          scope_ref?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          evidence_missing?: string[] | null
          id?: string
          owner?: string | null
          resolved_at?: string | null
          ring_impact?: string[] | null
          scope_ref?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_launch_gates: {
        Row: {
          blocking_reason: string | null
          category: string
          created_at: string
          evidence_data: Json | null
          evidence_summary: string | null
          evidence_type: string | null
          gate_name: string
          gate_owner: string | null
          id: string
          last_checked_at: string | null
          metadata: Json | null
          override_by: string | null
          override_reason: string | null
          required: boolean
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blocking_reason?: string | null
          category?: string
          created_at?: string
          evidence_data?: Json | null
          evidence_summary?: string | null
          evidence_type?: string | null
          gate_name: string
          gate_owner?: string | null
          id?: string
          last_checked_at?: string | null
          metadata?: Json | null
          override_by?: string | null
          override_reason?: string | null
          required?: boolean
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blocking_reason?: string | null
          category?: string
          created_at?: string
          evidence_data?: Json | null
          evidence_summary?: string | null
          evidence_type?: string | null
          gate_name?: string
          gate_owner?: string | null
          id?: string
          last_checked_at?: string | null
          metadata?: Json | null
          override_by?: string | null
          override_reason?: string | null
          required?: boolean
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_maturity_scores: {
        Row: {
          automation_level: number
          composite_score: number
          contract_coverage: number
          created_at: string
          id: string
          interaction_coverage: number
          launch_readiness: number
          measured_at: string
          metadata: Json
          persistence_level: number
          proof_level: number
          scope_id: string
          scope_label: string
          scope_type: string
          truth_level: number
          user_id: string
        }
        Insert: {
          automation_level?: number
          composite_score?: number
          contract_coverage?: number
          created_at?: string
          id?: string
          interaction_coverage?: number
          launch_readiness?: number
          measured_at?: string
          metadata?: Json
          persistence_level?: number
          proof_level?: number
          scope_id: string
          scope_label: string
          scope_type?: string
          truth_level?: number
          user_id: string
        }
        Update: {
          automation_level?: number
          composite_score?: number
          contract_coverage?: number
          created_at?: string
          id?: string
          interaction_coverage?: number
          launch_readiness?: number
          measured_at?: string
          metadata?: Json
          persistence_level?: number
          proof_level?: number
          scope_id?: string
          scope_label?: string
          scope_type?: string
          truth_level?: number
          user_id?: string
        }
        Relationships: []
      }
      platform_mutation_receipts: {
        Row: {
          actor: string
          approval_id: string | null
          correlation_id: string | null
          created_at: string
          domain: string
          duration_ms: number | null
          error: string | null
          id: string
          metadata: Json | null
          mutation_type: string
          payload_hash: string | null
          policy_decision_id: string | null
          previous_receipt_hash: string
          proof_bundle_id: string | null
          receipt_hash: string
          status: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          actor: string
          approval_id?: string | null
          correlation_id?: string | null
          created_at?: string
          domain: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          mutation_type: string
          payload_hash?: string | null
          policy_decision_id?: string | null
          previous_receipt_hash?: string
          proof_bundle_id?: string | null
          receipt_hash: string
          status?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          actor?: string
          approval_id?: string | null
          correlation_id?: string | null
          created_at?: string
          domain?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          mutation_type?: string
          payload_hash?: string | null
          policy_decision_id?: string | null
          previous_receipt_hash?: string
          proof_bundle_id?: string | null
          receipt_hash?: string
          status?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_operator_incidents: {
        Row: {
          affected_scopes: string[] | null
          alert_refs: string[] | null
          created_at: string
          current_state: string
          detected_by: string | null
          id: string
          mitigation_refs: string[] | null
          resolved_at: string | null
          runbook_refs: string[] | null
          severity: string
          start_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          affected_scopes?: string[] | null
          alert_refs?: string[] | null
          created_at?: string
          current_state?: string
          detected_by?: string | null
          id?: string
          mitigation_refs?: string[] | null
          resolved_at?: string | null
          runbook_refs?: string[] | null
          severity?: string
          start_at?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          affected_scopes?: string[] | null
          alert_refs?: string[] | null
          created_at?: string
          current_state?: string
          detected_by?: string | null
          id?: string
          mitigation_refs?: string[] | null
          resolved_at?: string | null
          runbook_refs?: string[] | null
          severity?: string
          start_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_projection_states: {
        Row: {
          confidence_level: number | null
          created_at: string
          data_hash: string | null
          degraded: boolean
          degraded_reason: string | null
          domain: string
          freshness_status: string
          id: string
          last_materialized_at: string | null
          last_source_sync_at: string | null
          metadata: Json | null
          projection_key: string
          source_type: string
          staleness_threshold_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          data_hash?: string | null
          degraded?: boolean
          degraded_reason?: string | null
          domain: string
          freshness_status?: string
          id?: string
          last_materialized_at?: string | null
          last_source_sync_at?: string | null
          metadata?: Json | null
          projection_key: string
          source_type?: string
          staleness_threshold_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          data_hash?: string | null
          degraded?: boolean
          degraded_reason?: string | null
          domain?: string
          freshness_status?: string
          id?: string
          last_materialized_at?: string | null
          last_source_sync_at?: string | null
          metadata?: Json | null
          projection_key?: string
          source_type?: string
          staleness_threshold_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_promotion_readiness: {
        Row: {
          approved_by: string | null
          approved_for_promotion: boolean
          blocker_refs: string[] | null
          created_at: string
          decided_at: string | null
          environment: string
          id: string
          readiness_score: number | null
          release_id: string
          required_evidence_refs: string[] | null
          ring: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          approved_for_promotion?: boolean
          blocker_refs?: string[] | null
          created_at?: string
          decided_at?: string | null
          environment: string
          id?: string
          readiness_score?: number | null
          release_id: string
          required_evidence_refs?: string[] | null
          ring: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_by?: string | null
          approved_for_promotion?: boolean
          blocker_refs?: string[] | null
          created_at?: string
          decided_at?: string | null
          environment?: string
          id?: string
          readiness_score?: number | null
          release_id?: string
          required_evidence_refs?: string[] | null
          ring?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_proof_chains: {
        Row: {
          action_id: string
          approval_step_ref: string | null
          canonical_chain_version: number
          capability_id: string
          created_at: string
          event_step_refs: string[] | null
          execution_step_ref: string | null
          id: string
          policy_step_ref: string | null
          projection_step_refs: string[] | null
          proof_integrity_status: string
          receipt_step_ref: string | null
          user_id: string
        }
        Insert: {
          action_id: string
          approval_step_ref?: string | null
          canonical_chain_version?: number
          capability_id: string
          created_at?: string
          event_step_refs?: string[] | null
          execution_step_ref?: string | null
          id?: string
          policy_step_ref?: string | null
          projection_step_refs?: string[] | null
          proof_integrity_status?: string
          receipt_step_ref?: string | null
          user_id: string
        }
        Update: {
          action_id?: string
          approval_step_ref?: string | null
          canonical_chain_version?: number
          capability_id?: string
          created_at?: string
          event_step_refs?: string[] | null
          execution_step_ref?: string | null
          id?: string
          policy_step_ref?: string | null
          projection_step_refs?: string[] | null
          proof_integrity_status?: string
          receipt_step_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      platform_proof_coverage: {
        Row: {
          approval_coverage: boolean
          branch_coverage: number | null
          capability_id: string
          coverage_status: string
          created_at: string
          degraded_branch_coverage: number | null
          id: string
          last_validated_at: string | null
          receipt_coverage: boolean
          replay_coverage: boolean
          rollback_coverage: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_coverage?: boolean
          branch_coverage?: number | null
          capability_id: string
          coverage_status?: string
          created_at?: string
          degraded_branch_coverage?: number | null
          id?: string
          last_validated_at?: string | null
          receipt_coverage?: boolean
          replay_coverage?: boolean
          rollback_coverage?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_coverage?: boolean
          branch_coverage?: number | null
          capability_id?: string
          coverage_status?: string
          created_at?: string
          degraded_branch_coverage?: number | null
          id?: string
          last_validated_at?: string | null
          receipt_coverage?: boolean
          replay_coverage?: boolean
          rollback_coverage?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_read_model_health: {
        Row: {
          created_at: string
          dependency_refs: string[] | null
          error_count: number
          id: string
          read_model_name: string
          rebuild_eligible: boolean
          rebuild_last_attempt_at: string | null
          rebuild_last_result: string | null
          stale_surface_count: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dependency_refs?: string[] | null
          error_count?: number
          id?: string
          read_model_name: string
          rebuild_eligible?: boolean
          rebuild_last_attempt_at?: string | null
          rebuild_last_result?: string | null
          stale_surface_count?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dependency_refs?: string[] | null
          error_count?: number
          id?: string
          read_model_name?: string
          rebuild_eligible?: boolean
          rebuild_last_attempt_at?: string | null
          rebuild_last_result?: string | null
          stale_surface_count?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_replay_verifications: {
        Row: {
          branch_type: string
          capability_id: string
          created_at: string
          evidence_refs: string[] | null
          id: string
          mismatch_summary: string | null
          replay_status: string
          scenario_id: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          branch_type?: string
          capability_id: string
          created_at?: string
          evidence_refs?: string[] | null
          id?: string
          mismatch_summary?: string | null
          replay_status?: string
          scenario_id: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          branch_type?: string
          capability_id?: string
          created_at?: string
          evidence_refs?: string[] | null
          id?: string
          mismatch_summary?: string | null
          replay_status?: string
          scenario_id?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      platform_rollback_verifications: {
        Row: {
          capability_id: string
          created_at: string
          evidence_refs: string[] | null
          id: string
          partial_rollback_risk: boolean
          rollback_status: string
          scenario_id: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          capability_id: string
          created_at?: string
          evidence_refs?: string[] | null
          id?: string
          partial_rollback_risk?: boolean
          rollback_status?: string
          scenario_id: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          capability_id?: string
          created_at?: string
          evidence_refs?: string[] | null
          id?: string
          partial_rollback_risk?: boolean
          rollback_status?: string
          scenario_id?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      platform_runbook_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          escalations: string[] | null
          evidence_captured: string[] | null
          id: string
          incident_id: string | null
          result: string | null
          runbook_name: string
          started_at: string
          steps_completed: string[] | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          escalations?: string[] | null
          evidence_captured?: string[] | null
          id?: string
          incident_id?: string | null
          result?: string | null
          runbook_name: string
          started_at?: string
          steps_completed?: string[] | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          escalations?: string[] | null
          evidence_captured?: string[] | null
          id?: string
          incident_id?: string | null
          result?: string | null
          runbook_name?: string
          started_at?: string
          steps_completed?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_runbook_executions_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "platform_operator_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_security_posture: {
        Row: {
          created_at: string
          data_classification_state: string
          encryption_at_rest_state: string
          id: string
          last_verified_at: string | null
          policy_protection_state: string
          scope_id: string
          scope_type: string
          secret_integrity_state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_classification_state?: string
          encryption_at_rest_state?: string
          id?: string
          last_verified_at?: string | null
          policy_protection_state?: string
          scope_id: string
          scope_type: string
          secret_integrity_state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_classification_state?: string
          encryption_at_rest_state?: string
          id?: string
          last_verified_at?: string | null
          policy_protection_state?: string
          scope_id?: string
          scope_type?: string
          secret_integrity_state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_truth_manifests: {
        Row: {
          claim_refs: string[] | null
          created_at: string
          drift_status: string
          drift_summary: string | null
          generated_at: string
          id: string
          runtime_evidence_refs: string[] | null
          scope_id: string
          scope_type: string
          source_of_truth_refs: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          claim_refs?: string[] | null
          created_at?: string
          drift_status?: string
          drift_summary?: string | null
          generated_at?: string
          id?: string
          runtime_evidence_refs?: string[] | null
          scope_id: string
          scope_type: string
          source_of_truth_refs?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          claim_refs?: string[] | null
          created_at?: string
          drift_status?: string
          drift_summary?: string | null
          generated_at?: string
          id?: string
          runtime_evidence_refs?: string[] | null
          scope_id?: string
          scope_type?: string
          source_of_truth_refs?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_truth_sync_log: {
        Row: {
          artifact_path: string
          artifact_type: string
          created_at: string
          drift_description: string | null
          generated_hash: string | null
          id: string
          in_sync: boolean
          last_checked_at: string
          last_synced_at: string | null
          metadata: Json | null
          source_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_path: string
          artifact_type: string
          created_at?: string
          drift_description?: string | null
          generated_hash?: string | null
          id?: string
          in_sync?: boolean
          last_checked_at?: string
          last_synced_at?: string | null
          metadata?: Json | null
          source_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_path?: string
          artifact_type?: string
          created_at?: string
          drift_description?: string | null
          generated_hash?: string | null
          id?: string
          in_sync?: boolean
          last_checked_at?: string
          last_synced_at?: string | null
          metadata?: Json | null
          source_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_validation_scores: {
        Row: {
          blocker_count: number
          computed_at: string
          created_at: string
          deployment_truth_score: number | null
          evidence_completeness_score: number | null
          id: string
          proof_coverage_score: number | null
          readiness_score: number | null
          scope_id: string
          scope_type: string
          test_coverage_score: number | null
          user_id: string
        }
        Insert: {
          blocker_count?: number
          computed_at?: string
          created_at?: string
          deployment_truth_score?: number | null
          evidence_completeness_score?: number | null
          id?: string
          proof_coverage_score?: number | null
          readiness_score?: number | null
          scope_id: string
          scope_type: string
          test_coverage_score?: number | null
          user_id: string
        }
        Update: {
          blocker_count?: number
          computed_at?: string
          created_at?: string
          deployment_truth_score?: number | null
          evidence_completeness_score?: number | null
          id?: string
          proof_coverage_score?: number | null
          readiness_score?: number | null
          scope_id?: string
          scope_type?: string
          test_coverage_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      playbook_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number | null
          period: string | null
          playbook_id: string
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number | null
          period?: string | null
          playbook_id: string
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number | null
          period?: string | null
          playbook_id?: string
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          actions: Json
          active: boolean
          approval_required: boolean
          category: string
          conditions: Json
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json
          active?: boolean
          approval_required?: boolean
          category?: string
          conditions?: Json
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          active?: boolean
          approval_required?: boolean
          category?: string
          conditions?: Json
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      policy_versions: {
        Row: {
          changed_by: string
          created_at: string
          diff_json: Json
          id: string
          policy_id: string
          user_id: string
          version_number: number
        }
        Insert: {
          changed_by: string
          created_at?: string
          diff_json?: Json
          id?: string
          policy_id: string
          user_id: string
          version_number?: number
        }
        Update: {
          changed_by?: string
          created_at?: string
          diff_json?: Json
          id?: string
          policy_id?: string
          user_id?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_versions_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_positions: {
        Row: {
          account_id: string | null
          allocation_pct: number | null
          asset_id: string | null
          average_cost: number | null
          conviction_tag: string | null
          id: string
          market_value: number | null
          opened_at: string | null
          purpose_bucket_id: string | null
          quantity: number | null
          realized_pnl: number | null
          risk_tags: string[] | null
          thesis_id: string | null
          unrealized_pnl: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          allocation_pct?: number | null
          asset_id?: string | null
          average_cost?: number | null
          conviction_tag?: string | null
          id?: string
          market_value?: number | null
          opened_at?: string | null
          purpose_bucket_id?: string | null
          quantity?: number | null
          realized_pnl?: number | null
          risk_tags?: string[] | null
          thesis_id?: string | null
          unrealized_pnl?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          allocation_pct?: number | null
          asset_id?: string | null
          average_cost?: number | null
          conviction_tag?: string | null
          id?: string
          market_value?: number | null
          opened_at?: string | null
          purpose_bucket_id?: string | null
          quantity?: number | null
          realized_pnl?: number | null
          risk_tags?: string[] | null
          thesis_id?: string | null
          unrealized_pnl?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_pp_purpose_bucket"
            columns: ["purpose_bucket_id"]
            isOneToOne: false
            referencedRelation: "capital_purpose_buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pp_thesis"
            columns: ["thesis_id"]
            isOneToOne: false
            referencedRelation: "thesis_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_positions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "investment_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_positions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset_master"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_receipts: {
        Row: {
          actor: string | null
          affected_assets: string[] | null
          approval_state: string | null
          created_at: string
          id: string
          presence_profile_id: string | null
          receipt_type: string
          related_change_plan_id: string | null
          summary: string | null
          user_id: string
        }
        Insert: {
          actor?: string | null
          affected_assets?: string[] | null
          approval_state?: string | null
          created_at?: string
          id?: string
          presence_profile_id?: string | null
          receipt_type: string
          related_change_plan_id?: string | null
          summary?: string | null
          user_id: string
        }
        Update: {
          actor?: string | null
          affected_assets?: string[] | null
          approval_state?: string | null
          created_at?: string
          id?: string
          presence_profile_id?: string | null
          receipt_type?: string
          related_change_plan_id?: string | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_receipts_presence_profile_id_fkey"
            columns: ["presence_profile_id"]
            isOneToOne: false
            referencedRelation: "digital_presence_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_receipts_related_change_plan_id_fkey"
            columns: ["related_change_plan_id"]
            isOneToOne: false
            referencedRelation: "change_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_states: {
        Row: {
          active_device_id: string | null
          active_surface: string | null
          created_at: string
          focus_state: string | null
          handoff_eligible: boolean | null
          id: string
          interruption_tolerance: string | null
          last_interaction_at: string | null
          metadata: Json | null
          motion_state: string | null
          recent_surfaces: string[] | null
          session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_device_id?: string | null
          active_surface?: string | null
          created_at?: string
          focus_state?: string | null
          handoff_eligible?: boolean | null
          id?: string
          interruption_tolerance?: string | null
          last_interaction_at?: string | null
          metadata?: Json | null
          motion_state?: string | null
          recent_surfaces?: string[] | null
          session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_device_id?: string | null
          active_surface?: string | null
          created_at?: string
          focus_state?: string | null
          handoff_eligible?: boolean | null
          id?: string
          interruption_tolerance?: string | null
          last_interaction_at?: string | null
          metadata?: Json | null
          motion_state?: string | null
          recent_surfaces?: string[] | null
          session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_states_active_device_id_fkey"
            columns: ["active_device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      presence_timeline_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          impact_summary: string | null
          page_id: string | null
          presence_profile_id: string | null
          related_agent_ids: string[] | null
          related_change_plan_id: string | null
          site_id: string | null
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          impact_summary?: string | null
          page_id?: string | null
          presence_profile_id?: string | null
          related_agent_ids?: string[] | null
          related_change_plan_id?: string | null
          site_id?: string | null
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          impact_summary?: string | null
          page_id?: string | null
          presence_profile_id?: string | null
          related_agent_ids?: string[] | null
          related_change_plan_id?: string | null
          site_id?: string | null
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presence_timeline_events_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_timeline_events_presence_profile_id_fkey"
            columns: ["presence_profile_id"]
            isOneToOne: false
            referencedRelation: "digital_presence_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_timeline_events_related_change_plan_id_fkey"
            columns: ["related_change_plan_id"]
            isOneToOne: false
            referencedRelation: "change_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presence_timeline_events_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      priority_stacks: {
        Row: {
          attention_posture: string | null
          created_at: string
          id: string
          mode: string | null
          stack_date: string
          top_items_json: Json | null
          updated_at: string
          urgency_summary: string | null
          user_id: string
        }
        Insert: {
          attention_posture?: string | null
          created_at?: string
          id?: string
          mode?: string | null
          stack_date?: string
          top_items_json?: Json | null
          updated_at?: string
          urgency_summary?: string | null
          user_id: string
        }
        Update: {
          attention_posture?: string | null
          created_at?: string
          id?: string
          mode?: string | null
          stack_date?: string
          top_items_json?: Json | null
          updated_at?: string
          urgency_summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      proactive_interventions: {
        Row: {
          accepted: boolean | null
          body: string | null
          confidence: number | null
          consented: boolean | null
          created_at: string
          delivered: boolean | null
          delivered_at: string | null
          dismissed: boolean | null
          explanation: string | null
          id: string
          intervention_type: string
          metadata: Json | null
          reversible: boolean | null
          source_role: string | null
          target_surface: string | null
          title: string
          urgency: string | null
          user_id: string
        }
        Insert: {
          accepted?: boolean | null
          body?: string | null
          confidence?: number | null
          consented?: boolean | null
          created_at?: string
          delivered?: boolean | null
          delivered_at?: string | null
          dismissed?: boolean | null
          explanation?: string | null
          id?: string
          intervention_type: string
          metadata?: Json | null
          reversible?: boolean | null
          source_role?: string | null
          target_surface?: string | null
          title: string
          urgency?: string | null
          user_id: string
        }
        Update: {
          accepted?: boolean | null
          body?: string | null
          confidence?: number | null
          consented?: boolean | null
          created_at?: string
          delivered?: boolean | null
          delivered_at?: string | null
          dismissed?: boolean | null
          explanation?: string | null
          id?: string
          intervention_type?: string
          metadata?: Json | null
          reversible?: boolean | null
          source_role?: string | null
          target_surface?: string | null
          title?: string
          urgency?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_presence: {
        Row: {
          conversion_health: number | null
          created_at: string
          featured_state: string | null
          id: string
          merchandising_status: string | null
          page_ids: string[] | null
          product_id: string
          recommendation_state: string | null
          site_id: string
          stale_content_risk: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversion_health?: number | null
          created_at?: string
          featured_state?: string | null
          id?: string
          merchandising_status?: string | null
          page_ids?: string[] | null
          product_id: string
          recommendation_state?: string | null
          site_id: string
          stale_content_risk?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversion_health?: number | null
          created_at?: string
          featured_state?: string | null
          id?: string
          merchandising_status?: string | null
          page_ids?: string[] | null
          product_id?: string
          recommendation_state?: string | null
          site_id?: string
          stale_content_risk?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_presence_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          demo_mode: boolean
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          preferences: Json | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          demo_mode?: boolean
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          demo_mode?: boolean
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projections: {
        Row: {
          data: Json | null
          domain: string
          generated_at: string
          id: string
          type: string
          user_id: string
        }
        Insert: {
          data?: Json | null
          domain: string
          generated_at?: string
          id?: string
          type: string
          user_id: string
        }
        Update: {
          data?: Json | null
          domain?: string
          generated_at?: string
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          active: boolean | null
          created_at: string
          end_at: string | null
          id: string
          linked_offer_ids: string[] | null
          linked_page_ids: string[] | null
          linked_product_ids: string[] | null
          presence_profile_id: string | null
          promotion_assets: Json | null
          start_at: string | null
          sync_state: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          end_at?: string | null
          id?: string
          linked_offer_ids?: string[] | null
          linked_page_ids?: string[] | null
          linked_product_ids?: string[] | null
          presence_profile_id?: string | null
          promotion_assets?: Json | null
          start_at?: string | null
          sync_state?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          end_at?: string | null
          id?: string
          linked_offer_ids?: string[] | null
          linked_page_ids?: string[] | null
          linked_product_ids?: string[] | null
          presence_profile_id?: string | null
          promotion_assets?: Json | null
          start_at?: string | null
          sync_state?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_presence_profile_id_fkey"
            columns: ["presence_profile_id"]
            isOneToOne: false
            referencedRelation: "digital_presence_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proof_records: {
        Row: {
          action_summary: string
          advisor_request_id: string | null
          artifact: string | null
          category: string
          correlation_id: string | null
          created_at: string
          domain: string | null
          hash: string | null
          id: string
          parent_proof_id: string | null
          policy_id: string | null
          result: string | null
          updated_at: string
          user_id: string
          verification: string | null
          workflow_run_id: string | null
        }
        Insert: {
          action_summary: string
          advisor_request_id?: string | null
          artifact?: string | null
          category?: string
          correlation_id?: string | null
          created_at?: string
          domain?: string | null
          hash?: string | null
          id?: string
          parent_proof_id?: string | null
          policy_id?: string | null
          result?: string | null
          updated_at?: string
          user_id: string
          verification?: string | null
          workflow_run_id?: string | null
        }
        Update: {
          action_summary?: string
          advisor_request_id?: string | null
          artifact?: string | null
          category?: string
          correlation_id?: string | null
          created_at?: string
          domain?: string | null
          hash?: string | null
          id?: string
          parent_proof_id?: string | null
          policy_id?: string | null
          result?: string | null
          updated_at?: string
          user_id?: string
          verification?: string | null
          workflow_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proof_records_advisor_request_id_fkey"
            columns: ["advisor_request_id"]
            isOneToOne: false
            referencedRelation: "advisor_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_records_parent_proof_id_fkey"
            columns: ["parent_proof_id"]
            isOneToOne: false
            referencedRelation: "proof_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_records_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proof_records_workflow_run_id_fkey"
            columns: ["workflow_run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_activation_registry: {
        Row: {
          activation_state: string
          created_at: string
          demo_mode_supported: boolean
          health_state: string
          id: string
          internal_test_supported: boolean
          last_verified_at: string | null
          notes: string | null
          provider_capability_key: string
          provider_family_key: string
          real_mode_supported: boolean
          updated_at: string
        }
        Insert: {
          activation_state: string
          created_at?: string
          demo_mode_supported?: boolean
          health_state?: string
          id?: string
          internal_test_supported?: boolean
          last_verified_at?: string | null
          notes?: string | null
          provider_capability_key: string
          provider_family_key: string
          real_mode_supported?: boolean
          updated_at?: string
        }
        Update: {
          activation_state?: string
          created_at?: string
          demo_mode_supported?: boolean
          health_state?: string
          id?: string
          internal_test_supported?: boolean
          last_verified_at?: string | null
          notes?: string | null
          provider_capability_key?: string
          provider_family_key?: string
          real_mode_supported?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      provider_capabilities: {
        Row: {
          active: boolean | null
          auth_requirement: string | null
          capability_key: string
          category: string
          created_at: string
          display_name: string
          health_support: boolean | null
          id: string
          launch_stage: string | null
          metadata: Json | null
          minimum_scopes: string[] | null
          optional_scopes: string[] | null
          provider_family_id: string
          read_write: string | null
          sync_support: boolean | null
          updated_at: string
          upgrade_path_support: boolean | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          auth_requirement?: string | null
          capability_key: string
          category?: string
          created_at?: string
          display_name: string
          health_support?: boolean | null
          id?: string
          launch_stage?: string | null
          metadata?: Json | null
          minimum_scopes?: string[] | null
          optional_scopes?: string[] | null
          provider_family_id: string
          read_write?: string | null
          sync_support?: boolean | null
          updated_at?: string
          upgrade_path_support?: boolean | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          auth_requirement?: string | null
          capability_key?: string
          category?: string
          created_at?: string
          display_name?: string
          health_support?: boolean | null
          id?: string
          launch_stage?: string | null
          metadata?: Json | null
          minimum_scopes?: string[] | null
          optional_scopes?: string[] | null
          provider_family_id?: string
          read_write?: string | null
          sync_support?: boolean | null
          updated_at?: string
          upgrade_path_support?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_capabilities_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_families: {
        Row: {
          active: boolean | null
          auth_types_supported: string[] | null
          categories: string[] | null
          connector_support: boolean | null
          created_at: string
          demo_support: boolean | null
          description: string | null
          docs_url: string | null
          health_model: string | null
          id: string
          identity_support: boolean | null
          launch_stage: string | null
          name: string
          provider_key: string
          setup_metadata: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          auth_types_supported?: string[] | null
          categories?: string[] | null
          connector_support?: boolean | null
          created_at?: string
          demo_support?: boolean | null
          description?: string | null
          docs_url?: string | null
          health_model?: string | null
          id?: string
          identity_support?: boolean | null
          launch_stage?: string | null
          name: string
          provider_key: string
          setup_metadata?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          auth_types_supported?: string[] | null
          categories?: string[] | null
          connector_support?: boolean | null
          created_at?: string
          demo_support?: boolean | null
          description?: string | null
          docs_url?: string | null
          health_model?: string | null
          id?: string
          identity_support?: boolean | null
          launch_stage?: string | null
          name?: string
          provider_key?: string
          setup_metadata?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quality_floor_configs: {
        Row: {
          active: boolean
          created_at: string
          domain: string
          enforcement_mode: string
          id: string
          min_confidence: number
          min_evidence_completeness: number
          min_freshness: number
          min_verification_standard: string
          task_class: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          domain?: string
          enforcement_mode?: string
          id?: string
          min_confidence?: number
          min_evidence_completeness?: number
          min_freshness?: number
          min_verification_standard?: string
          task_class: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          domain?: string
          enforcement_mode?: string
          id?: string
          min_confidence?: number
          min_evidence_completeness?: number
          min_freshness?: number
          min_verification_standard?: string
          task_class?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string
          customer_id: string | null
          expiry_date: string | null
          id: string
          line_items: Json | null
          notes: string | null
          opportunity_id: string | null
          revision_count: number | null
          status: string
          title: string
          total: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          expiry_date?: string | null
          id?: string
          line_items?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          revision_count?: number | null
          status?: string
          title: string
          total?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          expiry_date?: string | null
          id?: string
          line_items?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          revision_count?: number | null
          status?: string
          title?: string
          total?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      readiness_states: {
        Row: {
          activity_state: string | null
          availability: string | null
          confidence: number | null
          created_at: string
          derived_from: string[] | null
          dnd_active: boolean | null
          energy_estimate: string | null
          expires_at: string | null
          focus_mode: boolean | null
          id: string
          interruption_tolerance: string | null
          metadata: Json | null
          readiness_level: string | null
          sleep_state: string | null
          stress_estimate: string | null
          updated_at: string
          user_id: string
          workout_active: boolean | null
        }
        Insert: {
          activity_state?: string | null
          availability?: string | null
          confidence?: number | null
          created_at?: string
          derived_from?: string[] | null
          dnd_active?: boolean | null
          energy_estimate?: string | null
          expires_at?: string | null
          focus_mode?: boolean | null
          id?: string
          interruption_tolerance?: string | null
          metadata?: Json | null
          readiness_level?: string | null
          sleep_state?: string | null
          stress_estimate?: string | null
          updated_at?: string
          user_id: string
          workout_active?: boolean | null
        }
        Update: {
          activity_state?: string | null
          availability?: string | null
          confidence?: number | null
          created_at?: string
          derived_from?: string[] | null
          dnd_active?: boolean | null
          energy_estimate?: string | null
          expires_at?: string | null
          focus_mode?: boolean | null
          id?: string
          interruption_tolerance?: string | null
          metadata?: Json | null
          readiness_level?: string | null
          sleep_state?: string | null
          stress_estimate?: string | null
          updated_at?: string
          user_id?: string
          workout_active?: boolean | null
        }
        Relationships: []
      }
      reality_classifications: {
        Row: {
          backend_target: string | null
          blockers: string[]
          classification: string
          classified_by: string | null
          confidence: number
          contract_status: string | null
          created_at: string
          domain: string
          evidence_inputs: Json
          feature_name: string
          id: string
          last_verified_at: string | null
          launch_impact: string
          missing_requirements: Json
          mock_sources: string[] | null
          notes: string | null
          owner: string | null
          progression_criteria: Json
          readiness_score: number | null
          route_path: string
          scope_level: string
          updated_at: string
          user_id: string
          verification_evidence: Json | null
        }
        Insert: {
          backend_target?: string | null
          blockers?: string[]
          classification?: string
          classified_by?: string | null
          confidence?: number
          contract_status?: string | null
          created_at?: string
          domain?: string
          evidence_inputs?: Json
          feature_name: string
          id?: string
          last_verified_at?: string | null
          launch_impact?: string
          missing_requirements?: Json
          mock_sources?: string[] | null
          notes?: string | null
          owner?: string | null
          progression_criteria?: Json
          readiness_score?: number | null
          route_path: string
          scope_level?: string
          updated_at?: string
          user_id: string
          verification_evidence?: Json | null
        }
        Update: {
          backend_target?: string | null
          blockers?: string[]
          classification?: string
          classified_by?: string | null
          confidence?: number
          contract_status?: string | null
          created_at?: string
          domain?: string
          evidence_inputs?: Json
          feature_name?: string
          id?: string
          last_verified_at?: string | null
          launch_impact?: string
          missing_requirements?: Json
          mock_sources?: string[] | null
          notes?: string | null
          owner?: string | null
          progression_criteria?: Json
          readiness_score?: number | null
          route_path?: string
          scope_level?: string
          updated_at?: string
          user_id?: string
          verification_evidence?: Json | null
        }
        Relationships: []
      }
      reality_mode_registry: {
        Row: {
          allows_demo_side_effects: boolean
          allows_real_side_effects: boolean
          analytics_bucket: string
          created_at: string
          description: string
          display_name: string
          id: string
          is_active: boolean
          mode_key: string
          user_visible: boolean
        }
        Insert: {
          allows_demo_side_effects?: boolean
          allows_real_side_effects?: boolean
          analytics_bucket: string
          created_at?: string
          description: string
          display_name: string
          id?: string
          is_active?: boolean
          mode_key: string
          user_visible?: boolean
        }
        Update: {
          allows_demo_side_effects?: boolean
          allows_real_side_effects?: boolean
          analytics_bucket?: string
          created_at?: string
          description?: string
          display_name?: string
          id?: string
          is_active?: boolean
          mode_key?: string
          user_visible?: boolean
        }
        Relationships: []
      }
      reality_mode_resolution_log: {
        Row: {
          analytics_bucket: string
          capability_key: string | null
          created_at: string
          id: string
          launch_honesty_class: string
          provider_source_key: string | null
          provider_source_type: string
          requested_mode: string | null
          resolution_reason: string | null
          resolved_mode: string
          route_key: string | null
          side_effect_policy_key: string | null
          surface_class_key: string | null
          user_id: string | null
        }
        Insert: {
          analytics_bucket: string
          capability_key?: string | null
          created_at?: string
          id?: string
          launch_honesty_class: string
          provider_source_key?: string | null
          provider_source_type: string
          requested_mode?: string | null
          resolution_reason?: string | null
          resolved_mode: string
          route_key?: string | null
          side_effect_policy_key?: string | null
          surface_class_key?: string | null
          user_id?: string | null
        }
        Update: {
          analytics_bucket?: string
          capability_key?: string | null
          created_at?: string
          id?: string
          launch_honesty_class?: string
          provider_source_key?: string | null
          provider_source_type?: string
          requested_mode?: string | null
          resolution_reason?: string | null
          resolved_mode?: string
          route_key?: string | null
          side_effect_policy_key?: string | null
          surface_class_key?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      reality_mode_resolutions: {
        Row: {
          ai_policy_profile_id: string | null
          analytics_profile_id: string | null
          created_at: string
          id: string
          policy_profile_id: string | null
          resolution_source: string
          resolved_mode: string
          route: string | null
          scenario_id: string | null
          session_id: string | null
          tenant_id: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          ai_policy_profile_id?: string | null
          analytics_profile_id?: string | null
          created_at?: string
          id?: string
          policy_profile_id?: string | null
          resolution_source?: string
          resolved_mode?: string
          route?: string | null
          scenario_id?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          ai_policy_profile_id?: string | null
          analytics_profile_id?: string | null
          created_at?: string
          id?: string
          policy_profile_id?: string | null
          resolution_source?: string
          resolved_mode?: string
          route?: string | null
          scenario_id?: string | null
          session_id?: string | null
          tenant_id?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      reality_modes: {
        Row: {
          active: boolean
          created_at: string
          default_ai_policy_profile_id: string | null
          default_analytics_profile_id: string | null
          default_policy_profile_id: string | null
          description: string | null
          id: string
          launch_honesty_class: string
          mode_key: string
          name: string
          side_effect_policy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_ai_policy_profile_id?: string | null
          default_analytics_profile_id?: string | null
          default_policy_profile_id?: string | null
          description?: string | null
          id?: string
          launch_honesty_class?: string
          mode_key: string
          name: string
          side_effect_policy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_ai_policy_profile_id?: string | null
          default_analytics_profile_id?: string | null
          default_policy_profile_id?: string | null
          description?: string | null
          id?: string
          launch_honesty_class?: string
          mode_key?: string
          name?: string
          side_effect_policy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reasoning_escalation_records: {
        Row: {
          approved: boolean | null
          created_at: string
          domain: string | null
          estimated_incremental_cost: number | null
          expected_value: number | null
          id: string
          justification: string | null
          new_reasoning_level: string | null
          previous_reasoning_level: string | null
          task_id: string | null
          tenant_id: string | null
          trigger_type: string
          user_id: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          domain?: string | null
          estimated_incremental_cost?: number | null
          expected_value?: number | null
          id?: string
          justification?: string | null
          new_reasoning_level?: string | null
          previous_reasoning_level?: string | null
          task_id?: string | null
          tenant_id?: string | null
          trigger_type?: string
          user_id: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          domain?: string | null
          estimated_incremental_cost?: number | null
          expected_value?: number | null
          id?: string
          justification?: string | null
          new_reasoning_level?: string | null
          previous_reasoning_level?: string | null
          task_id?: string | null
          tenant_id?: string | null
          trigger_type?: string
          user_id?: string
        }
        Relationships: []
      }
      reasoning_path_performance_records: {
        Row: {
          average_cost: number | null
          average_latency: number | null
          average_quality: number | null
          domain: string | null
          escalation_rate: number | null
          id: string
          measured_window: string | null
          operator_acceptance_rate: number | null
          path_label: string
          reuse_rate: number | null
          task_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_cost?: number | null
          average_latency?: number | null
          average_quality?: number | null
          domain?: string | null
          escalation_rate?: number | null
          id?: string
          measured_window?: string | null
          operator_acceptance_rate?: number | null
          path_label: string
          reuse_rate?: number | null
          task_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_cost?: number | null
          average_latency?: number | null
          average_quality?: number | null
          domain?: string | null
          escalation_rate?: number | null
          id?: string
          measured_window?: string | null
          operator_acceptance_rate?: number | null
          path_label?: string
          reuse_rate?: number | null
          task_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          domain: string
          entity_id: string | null
          hash: string | null
          id: string
          payload: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          entity_id?: string | null
          hash?: string | null
          id?: string
          payload?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          entity_id?: string | null
          hash?: string | null
          id?: string
          payload?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      relationship_contexts: {
        Row: {
          created_at: string
          id: string
          importance_tier: string | null
          last_interaction_at: string | null
          obligations_json: Json | null
          open_loops_json: Json | null
          related_person_ref: string | null
          relationship_type: string | null
          updated_at: string
          user_id: string
          visibility_scope: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          importance_tier?: string | null
          last_interaction_at?: string | null
          obligations_json?: Json | null
          open_loops_json?: Json | null
          related_person_ref?: string | null
          relationship_type?: string | null
          updated_at?: string
          user_id: string
          visibility_scope?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          importance_tier?: string | null
          last_interaction_at?: string | null
          obligations_json?: Json | null
          open_loops_json?: Json | null
          related_person_ref?: string | null
          relationship_type?: string | null
          updated_at?: string
          user_id?: string
          visibility_scope?: string | null
        }
        Relationships: []
      }
      remediation_suggestions: {
        Row: {
          auto_fixable: boolean
          created_at: string
          gap_description: string
          gap_type: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          suggested_action: string
          suggested_artifacts: Json
          target_id: string
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_fixable?: boolean
          created_at?: string
          gap_description: string
          gap_type: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          suggested_action: string
          suggested_artifacts?: Json
          target_id: string
          target_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_fixable?: boolean
          created_at?: string
          gap_description?: string
          gap_type?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          suggested_action?: string
          suggested_artifacts?: Json
          target_id?: string
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reserves: {
        Row: {
          auto_contribute: boolean | null
          category: string
          contribution_amount: number | null
          created_at: string
          current_amount: number
          id: string
          name: string
          notes: string | null
          priority: number | null
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_contribute?: boolean | null
          category?: string
          contribution_amount?: number | null
          created_at?: string
          current_amount?: number
          id?: string
          name: string
          notes?: string | null
          priority?: number | null
          target_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_contribute?: boolean | null
          category?: string
          contribution_amount?: number | null
          created_at?: string
          current_amount?: number
          id?: string
          name?: string
          notes?: string | null
          priority?: number | null
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_advisor_stances: {
        Row: {
          advisor_name: string
          confidence: number | null
          created_at: string
          domain: string
          id: string
          recommendation: string | null
          stance: string
          stance_type: string | null
          updated_at: string
          user_id: string
          watching: Json | null
        }
        Insert: {
          advisor_name: string
          confidence?: number | null
          created_at?: string
          domain: string
          id?: string
          recommendation?: string | null
          stance: string
          stance_type?: string | null
          updated_at?: string
          user_id: string
          watching?: Json | null
        }
        Update: {
          advisor_name?: string
          confidence?: number | null
          created_at?: string
          domain?: string
          id?: string
          recommendation?: string | null
          stance?: string
          stance_type?: string | null
          updated_at?: string
          user_id?: string
          watching?: Json | null
        }
        Relationships: []
      }
      revenue_booking_services: {
        Row: {
          conversion_rate: number | null
          created_at: string
          currency: string | null
          duration_minutes: number
          id: string
          price_cents: number | null
          service_name: string
          status: string | null
          total_bookings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          id?: string
          price_cents?: number | null
          service_name: string
          status?: string | null
          total_bookings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          currency?: string | null
          duration_minutes?: number
          id?: string
          price_cents?: number | null
          service_name?: string
          status?: string | null
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_bookings: {
        Row: {
          contact_email: string | null
          contact_name: string
          created_at: string
          duration_minutes: number | null
          id: string
          mode: string | null
          notes: string | null
          scheduled_at: string
          service_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mode?: string | null
          notes?: string | null
          scheduled_at: string
          service_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mode?: string | null
          notes?: string | null
          scheduled_at?: string
          service_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "revenue_booking_services"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_campaigns: {
        Row: {
          campaign_name: string
          campaign_type: string
          click_rate: number | null
          completion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          open_rate: number | null
          revenue_cents: number | null
          segment_id: string | null
          status: string
          steps_count: number | null
          subscribers: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          campaign_name: string
          campaign_type?: string
          click_rate?: number | null
          completion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          open_rate?: number | null
          revenue_cents?: number | null
          segment_id?: string | null
          status?: string
          steps_count?: number | null
          subscribers?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          campaign_name?: string
          campaign_type?: string
          click_rate?: number | null
          completion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          open_rate?: number | null
          revenue_cents?: number | null
          segment_id?: string | null
          status?: string
          steps_count?: number | null
          subscribers?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_experiment_variants: {
        Row: {
          conversions: number | null
          created_at: string
          experiment_id: string
          id: string
          rate: number | null
          user_id: string
          variant_name: string
          visitors: number | null
        }
        Insert: {
          conversions?: number | null
          created_at?: string
          experiment_id: string
          id?: string
          rate?: number | null
          user_id: string
          variant_name: string
          visitors?: number | null
        }
        Update: {
          conversions?: number | null
          created_at?: string
          experiment_id?: string
          id?: string
          rate?: number | null
          user_id?: string
          variant_name?: string
          visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_experiment_variants_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "revenue_experiments"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_experiments: {
        Row: {
          completed_at: string | null
          confidence: number | null
          created_at: string
          experiment_name: string
          id: string
          lift: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
          winner_variant: string | null
        }
        Insert: {
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          experiment_name: string
          id?: string
          lift?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          winner_variant?: string | null
        }
        Update: {
          completed_at?: string | null
          confidence?: number | null
          created_at?: string
          experiment_name?: string
          id?: string
          lift?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          winner_variant?: string | null
        }
        Relationships: []
      }
      revenue_funnel_steps: {
        Row: {
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          funnel_id: string
          id: string
          page_type: string | null
          step_name: string
          step_order: number
          user_id: string
          visitors: number | null
        }
        Insert: {
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          funnel_id: string
          id?: string
          page_type?: string | null
          step_name: string
          step_order?: number
          user_id: string
          visitors?: number | null
        }
        Update: {
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          funnel_id?: string
          id?: string
          page_type?: string | null
          step_name?: string
          step_order?: number
          user_id?: string
          visitors?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "revenue_funnel_steps_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "revenue_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_funnels: {
        Row: {
          conversion_rate: number | null
          created_at: string
          funnel_name: string
          id: string
          status: string
          steps: Json | null
          total_optins: number | null
          total_revenue_cents: number | null
          total_sales: number | null
          total_visitors: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          funnel_name: string
          id?: string
          status?: string
          steps?: Json | null
          total_optins?: number | null
          total_revenue_cents?: number | null
          total_sales?: number | null
          total_visitors?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          funnel_name?: string
          id?: string
          status?: string
          steps?: Json | null
          total_optins?: number | null
          total_revenue_cents?: number | null
          total_sales?: number | null
          total_visitors?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_journey_touchpoints: {
        Row: {
          conversion_rate: number | null
          created_at: string
          entered_count: number | null
          exited_count: number | null
          id: string
          label: string
          stage: string
          touchpoint_type: string
          user_id: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          entered_count?: number | null
          exited_count?: number | null
          id?: string
          label: string
          stage: string
          touchpoint_type: string
          user_id: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          entered_count?: number | null
          exited_count?: number | null
          id?: string
          label?: string
          stage?: string
          touchpoint_type?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_leak_items: {
        Row: {
          action_needed: string | null
          category: string
          created_at: string
          days_stale: number | null
          id: string
          item_name: string
          resolved: boolean | null
          revenue_at_risk_cents: number | null
          severity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_needed?: string | null
          category: string
          created_at?: string
          days_stale?: number | null
          id?: string
          item_name: string
          resolved?: boolean | null
          revenue_at_risk_cents?: number | null
          severity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_needed?: string | null
          category?: string
          created_at?: string
          days_stale?: number | null
          id?: string
          item_name?: string
          resolved?: boolean | null
          revenue_at_risk_cents?: number | null
          severity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_memory_events: {
        Row: {
          acknowledged_at: string | null
          created_at: string
          event_type: string
          id: string
          related_entity_id: string | null
          related_entity_type: string | null
          severity: string | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          created_at?: string
          event_type: string
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          created_at?: string
          event_type?: string
          id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          severity?: string | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_offer_sales: {
        Row: {
          amount_cents: number
          contact_email: string | null
          contact_name: string | null
          id: string
          metadata: Json | null
          offer_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          contact_email?: string | null
          contact_name?: string | null
          id?: string
          metadata?: Json | null
          offer_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          contact_email?: string | null
          contact_name?: string | null
          id?: string
          metadata?: Json | null
          offer_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_offer_sales_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "revenue_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      revenue_offers: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          offer_name: string
          offer_type: string
          price_cents: number | null
          recurring_interval: string | null
          status: string
          total_revenue_cents: number | null
          total_sales: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          offer_name: string
          offer_type?: string
          price_cents?: number | null
          recurring_interval?: string | null
          status?: string
          total_revenue_cents?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          offer_name?: string
          offer_type?: string
          price_cents?: number | null
          recurring_interval?: string | null
          status?: string
          total_revenue_cents?: number | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_reputation_metrics: {
        Row: {
          avg_rating: number | null
          id: string
          nps_score: number | null
          period: string | null
          recorded_at: string
          response_rate: number | null
          total_reviews: number | null
          user_id: string
        }
        Insert: {
          avg_rating?: number | null
          id?: string
          nps_score?: number | null
          period?: string | null
          recorded_at?: string
          response_rate?: number | null
          total_reviews?: number | null
          user_id: string
        }
        Update: {
          avg_rating?: number | null
          id?: string
          nps_score?: number | null
          period?: string | null
          recorded_at?: string
          response_rate?: number | null
          total_reviews?: number | null
          user_id?: string
        }
        Relationships: []
      }
      revenue_retention_signals: {
        Row: {
          acknowledged: boolean | null
          contact_id: string | null
          contact_name: string | null
          created_at: string
          details: Json | null
          id: string
          severity: string | null
          signal_type: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          severity?: string | null
          signal_type: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          contact_id?: string | null
          contact_name?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          severity?: string | null
          signal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_reviews: {
        Row: {
          created_at: string
          id: string
          platform: string | null
          rating: number
          responded: boolean | null
          response_text: string | null
          review_date: string
          review_text: string | null
          reviewer_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string | null
          rating?: number
          responded?: boolean | null
          response_text?: string | null
          review_date?: string
          review_text?: string | null
          reviewer_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string | null
          rating?: number
          responded?: boolean | null
          response_text?: string | null
          review_date?: string
          review_text?: string | null
          reviewer_name?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_segments: {
        Row: {
          contact_count: number | null
          created_at: string
          filter_criteria: Json | null
          growth_rate: string | null
          id: string
          segment_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_count?: number | null
          created_at?: string
          filter_criteria?: Json | null
          growth_rate?: string | null
          id?: string
          segment_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_count?: number | null
          created_at?: string
          filter_criteria?: Json | null
          growth_rate?: string | null
          id?: string
          segment_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      revenue_winback_queue: {
        Row: {
          churn_reason: string | null
          churned_at: string | null
          contact_email: string | null
          contact_name: string
          created_at: string
          id: string
          ltv_cents: number | null
          status: string | null
          updated_at: string
          user_id: string
          winback_strategy: string | null
        }
        Insert: {
          churn_reason?: string | null
          churned_at?: string | null
          contact_email?: string | null
          contact_name: string
          created_at?: string
          id?: string
          ltv_cents?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          winback_strategy?: string | null
        }
        Update: {
          churn_reason?: string | null
          churned_at?: string | null
          contact_email?: string | null
          contact_name?: string
          created_at?: string
          id?: string
          ltv_cents?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          winback_strategy?: string | null
        }
        Relationships: []
      }
      route_surface_registry: {
        Row: {
          capability_family: string | null
          created_at: string
          domain_family: string
          id: string
          is_active: boolean
          launch_stage: string
          route_key: string
          route_path: string
          shell_key: string
          surface_class_id: string
          updated_at: string
        }
        Insert: {
          capability_family?: string | null
          created_at?: string
          domain_family: string
          id?: string
          is_active?: boolean
          launch_stage?: string
          route_key: string
          route_path: string
          shell_key: string
          surface_class_id: string
          updated_at?: string
        }
        Update: {
          capability_family?: string | null
          created_at?: string
          domain_family?: string
          id?: string
          is_active?: boolean
          launch_stage?: string
          route_key?: string
          route_path?: string
          shell_key?: string
          surface_class_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_surface_registry_surface_class_id_fkey"
            columns: ["surface_class_id"]
            isOneToOne: false
            referencedRelation: "surface_class_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      route_truth_records: {
        Row: {
          created_at: string
          diagnostics: Json | null
          environment: string | null
          failure_notes: string | null
          id: string
          interaction_type: string | null
          journey_id: string | null
          latency_ms: number | null
          provider_mode: string | null
          route: string
          status: string | null
          user_id: string
          verified_at: string
        }
        Insert: {
          created_at?: string
          diagnostics?: Json | null
          environment?: string | null
          failure_notes?: string | null
          id?: string
          interaction_type?: string | null
          journey_id?: string | null
          latency_ms?: number | null
          provider_mode?: string | null
          route: string
          status?: string | null
          user_id: string
          verified_at?: string
        }
        Update: {
          created_at?: string
          diagnostics?: Json | null
          environment?: string | null
          failure_notes?: string | null
          id?: string
          interaction_type?: string | null
          journey_id?: string | null
          latency_ms?: number | null
          provider_mode?: string | null
          route?: string
          status?: string | null
          user_id?: string
          verified_at?: string
        }
        Relationships: []
      }
      route_verification_coverage: {
        Row: {
          coverage_percent: number | null
          id: string
          last_verified_at: string | null
          p0_actions: number
          p0_verified_actions: number
          p1_actions: number
          p1_verified_actions: number
          route_key: string
          surface_class: string
          total_actions: number
          updated_at: string
          user_id: string
          verified_actions: number
        }
        Insert: {
          coverage_percent?: number | null
          id?: string
          last_verified_at?: string | null
          p0_actions?: number
          p0_verified_actions?: number
          p1_actions?: number
          p1_verified_actions?: number
          route_key: string
          surface_class?: string
          total_actions?: number
          updated_at?: string
          user_id: string
          verified_actions?: number
        }
        Update: {
          coverage_percent?: number | null
          id?: string
          last_verified_at?: string | null
          p0_actions?: number
          p0_verified_actions?: number
          p1_actions?: number
          p1_verified_actions?: number
          route_key?: string
          surface_class?: string
          total_actions?: number
          updated_at?: string
          user_id?: string
          verified_actions?: number
        }
        Relationships: []
      }
      runtime_probe_runs: {
        Row: {
          created_at: string
          environment: string | null
          error_message: string | null
          id: string
          latency_ms: number | null
          probe_id: string | null
          response_snapshot: Json | null
          status: string | null
          trace_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          environment?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          probe_id?: string | null
          response_snapshot?: Json | null
          status?: string | null
          trace_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          environment?: string | null
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          probe_id?: string | null
          response_snapshot?: Json | null
          status?: string | null
          trace_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "runtime_probe_runs_probe_id_fkey"
            columns: ["probe_id"]
            isOneToOne: false
            referencedRelation: "runtime_probes"
            referencedColumns: ["id"]
          },
        ]
      }
      runtime_probes: {
        Row: {
          cadence_seconds: number | null
          created_at: string
          enabled: boolean | null
          environment: string | null
          failure_criteria: string | null
          id: string
          launch_impact: string | null
          name: string
          owner: string | null
          probe_id: string
          severity: string | null
          success_criteria: string | null
          target_system: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cadence_seconds?: number | null
          created_at?: string
          enabled?: boolean | null
          environment?: string | null
          failure_criteria?: string | null
          id?: string
          launch_impact?: string | null
          name: string
          owner?: string | null
          probe_id: string
          severity?: string | null
          success_criteria?: string | null
          target_system: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cadence_seconds?: number | null
          created_at?: string
          enabled?: boolean | null
          environment?: string | null
          failure_criteria?: string | null
          id?: string
          launch_impact?: string | null
          name?: string
          owner?: string | null
          probe_id?: string
          severity?: string | null
          success_criteria?: string | null
          target_system?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scenario_launch_profiles: {
        Row: {
          created_at: string
          default_landing_route: string | null
          enabled_domains: string[]
          hidden_domains: string[]
          id: string
          launch_path: string | null
          route_set: string[]
          scenario_id: string
          startup_context: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          default_landing_route?: string | null
          enabled_domains?: string[]
          hidden_domains?: string[]
          id?: string
          launch_path?: string | null
          route_set?: string[]
          scenario_id: string
          startup_context?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          default_landing_route?: string | null
          enabled_domains?: string[]
          hidden_domains?: string[]
          id?: string
          launch_path?: string | null
          route_set?: string[]
          scenario_id?: string
          startup_context?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scenario_launch_profiles_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "demo_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_jobs: {
        Row: {
          autonomy_tier: string
          created_at: string
          cron_expression: string
          description: string | null
          domain: string
          environment: string
          fail_count: number
          id: string
          job_class: string
          kill_switch_class: string | null
          last_run_at: string | null
          last_run_status: string | null
          max_retries: number
          metadata: Json | null
          name: string
          next_run_at: string | null
          policy_family: string | null
          retry_policy: string
          risk_tier: string
          run_count: number
          state: string
          target_function: string
          updated_at: string
          user_id: string
        }
        Insert: {
          autonomy_tier?: string
          created_at?: string
          cron_expression?: string
          description?: string | null
          domain?: string
          environment?: string
          fail_count?: number
          id?: string
          job_class?: string
          kill_switch_class?: string | null
          last_run_at?: string | null
          last_run_status?: string | null
          max_retries?: number
          metadata?: Json | null
          name: string
          next_run_at?: string | null
          policy_family?: string | null
          retry_policy?: string
          risk_tier?: string
          run_count?: number
          state?: string
          target_function: string
          updated_at?: string
          user_id: string
        }
        Update: {
          autonomy_tier?: string
          created_at?: string
          cron_expression?: string
          description?: string | null
          domain?: string
          environment?: string
          fail_count?: number
          id?: string
          job_class?: string
          kill_switch_class?: string | null
          last_run_at?: string | null
          last_run_status?: string | null
          max_retries?: number
          metadata?: Json | null
          name?: string
          next_run_at?: string | null
          policy_family?: string | null
          retry_policy?: string
          risk_tier?: string
          run_count?: number
          state?: string
          target_function?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scope_policy_matrix: {
        Row: {
          approval_required_for_upgrade: boolean | null
          created_at: string
          default_grant_profile: string | null
          disallowed_scopes: string[] | null
          id: string
          launch_safety_notes: string | null
          minimum_scopes: string[] | null
          optional_scopes: string[] | null
          provider_capability_id: string
          updated_at: string
          upgrade_path_available: boolean | null
          user_id: string
        }
        Insert: {
          approval_required_for_upgrade?: boolean | null
          created_at?: string
          default_grant_profile?: string | null
          disallowed_scopes?: string[] | null
          id?: string
          launch_safety_notes?: string | null
          minimum_scopes?: string[] | null
          optional_scopes?: string[] | null
          provider_capability_id: string
          updated_at?: string
          upgrade_path_available?: boolean | null
          user_id: string
        }
        Update: {
          approval_required_for_upgrade?: boolean | null
          created_at?: string
          default_grant_profile?: string | null
          disallowed_scopes?: string[] | null
          id?: string
          launch_safety_notes?: string | null
          minimum_scopes?: string[] | null
          optional_scopes?: string[] | null
          provider_capability_id?: string
          updated_at?: string
          upgrade_path_available?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scope_policy_matrix_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      scope_recommendations: {
        Row: {
          approval_needed: boolean | null
          created_at: string
          id: string
          launch_safe: boolean | null
          provider_capability_id: string | null
          recommended_scopes: string[] | null
          removed_scopes: string[] | null
          requested_scopes: string[] | null
          user_id: string
          warnings: string[] | null
        }
        Insert: {
          approval_needed?: boolean | null
          created_at?: string
          id?: string
          launch_safe?: boolean | null
          provider_capability_id?: string | null
          recommended_scopes?: string[] | null
          removed_scopes?: string[] | null
          requested_scopes?: string[] | null
          user_id: string
          warnings?: string[] | null
        }
        Update: {
          approval_needed?: boolean | null
          created_at?: string
          id?: string
          launch_safe?: boolean | null
          provider_capability_id?: string | null
          recommended_scopes?: string[] | null
          removed_scopes?: string[] | null
          requested_scopes?: string[] | null
          user_id?: string
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "scope_recommendations_provider_capability_id_fkey"
            columns: ["provider_capability_id"]
            isOneToOne: false
            referencedRelation: "provider_capabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      setup_sessions: {
        Row: {
          completed_at: string | null
          completed_steps: string[] | null
          created_at: string | null
          current_step: string
          id: string
          preferences: Json | null
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          id?: string
          preferences?: Json | null
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          id?: string
          preferences?: Json | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shell_implementations: {
        Row: {
          boundary_violations: number | null
          capability_coverage_pct: number | null
          component_count: number | null
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          route_count: number | null
          shell_type: string
          status: string
          surface_id: string
          technology_stack: string[] | null
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          boundary_violations?: number | null
          capability_coverage_pct?: number | null
          component_count?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          route_count?: number | null
          shell_type: string
          status?: string
          surface_id: string
          technology_stack?: string[] | null
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          boundary_violations?: number | null
          capability_coverage_pct?: number | null
          component_count?: number | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          route_count?: number | null
          shell_type?: string
          status?: string
          surface_id?: string
          technology_stack?: string[] | null
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shell_implementations_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      side_effect_policies: {
        Row: {
          created_at: string
          demo_mode_behavior: string
          display_name: string
          id: string
          internal_test_behavior: string
          notes: string | null
          policy_key: string
          real_mode_behavior: string
        }
        Insert: {
          created_at?: string
          demo_mode_behavior: string
          display_name: string
          id?: string
          internal_test_behavior: string
          notes?: string | null
          policy_key: string
          real_mode_behavior: string
        }
        Update: {
          created_at?: string
          demo_mode_behavior?: string
          display_name?: string
          id?: string
          internal_test_behavior?: string
          notes?: string | null
          policy_key?: string
          real_mode_behavior?: string
        }
        Relationships: []
      }
      sita_memory_entries: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          source: string | null
          updated_at: string | null
          user_id: string
          value: Json | null
        }
        Insert: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          source?: string | null
          updated_at?: string | null
          user_id: string
          value?: Json | null
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          source?: string | null
          updated_at?: string | null
          user_id?: string
          value?: Json | null
        }
        Relationships: []
      }
      sita_memory_forget_log: {
        Row: {
          category: string | null
          forgotten_at: string | null
          id: string
          key: string | null
          memory_id: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          forgotten_at?: string | null
          id?: string
          key?: string | null
          memory_id?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          forgotten_at?: string | null
          id?: string
          key?: string | null
          memory_id?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sita_proof_records: {
        Row: {
          action: string
          created_at: string | null
          domain: string | null
          evidence: Json | null
          hash: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          domain?: string | null
          evidence?: Json | null
          hash?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          domain?: string | null
          evidence?: Json | null
          hash?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      sita_receipts: {
        Row: {
          created_at: string | null
          domain: string | null
          hash: string | null
          id: string
          payload: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          hash?: string | null
          id?: string
          payload?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          hash?: string | null
          id?: string
          payload?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      site_issues: {
        Row: {
          auto_fix_eligible: boolean | null
          confidence: number | null
          created_at: string
          detected_by_agent_ids: string[] | null
          id: string
          issue_type: string
          page_id: string | null
          recommended_fix_type: string | null
          severity: string
          site_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_fix_eligible?: boolean | null
          confidence?: number | null
          created_at?: string
          detected_by_agent_ids?: string[] | null
          id?: string
          issue_type: string
          page_id?: string | null
          recommended_fix_type?: string | null
          severity?: string
          site_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_fix_eligible?: boolean | null
          confidence?: number | null
          created_at?: string
          detected_by_agent_ids?: string[] | null
          id?: string
          issue_type?: string
          page_id?: string | null
          recommended_fix_type?: string | null
          severity?: string
          site_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_issues_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_issues_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      site_opportunities: {
        Row: {
          confidence: number | null
          created_at: string
          effort_estimate: string | null
          id: string
          impact_estimate: string | null
          opportunity_type: string
          page_id: string | null
          site_id: string
          status: string
          surfaced_by_agent_ids: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          effort_estimate?: string | null
          id?: string
          impact_estimate?: string | null
          opportunity_type: string
          page_id?: string | null
          site_id: string
          status?: string
          surfaced_by_agent_ids?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          effort_estimate?: string | null
          id?: string
          impact_estimate?: string | null
          opportunity_type?: string
          page_id?: string | null
          site_id?: string
          status?: string
          surfaced_by_agent_ids?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_opportunities_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "site_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_opportunities_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          conversion_score: number | null
          created_at: string
          freshness_score: number | null
          health_score: number | null
          id: string
          linked_campaign_ids: string[] | null
          linked_offer_ids: string[] | null
          linked_product_ids: string[] | null
          mobile_score: number | null
          page_type: string
          path: string | null
          site_id: string
          status: string
          title: string
          trust_score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversion_score?: number | null
          created_at?: string
          freshness_score?: number | null
          health_score?: number | null
          id?: string
          linked_campaign_ids?: string[] | null
          linked_offer_ids?: string[] | null
          linked_product_ids?: string[] | null
          mobile_score?: number | null
          page_type?: string
          path?: string | null
          site_id: string
          status?: string
          title: string
          trust_score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversion_score?: number | null
          created_at?: string
          freshness_score?: number | null
          health_score?: number | null
          id?: string
          linked_campaign_ids?: string[] | null
          linked_offer_ids?: string[] | null
          linked_product_ids?: string[] | null
          mobile_score?: number | null
          page_type?: string
          path?: string | null
          site_id?: string
          status?: string
          title?: string
          trust_score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_pages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      site_registry: {
        Row: {
          created_at: string
          display_name: string
          domain: string | null
          editable_capabilities: string[] | null
          environment_type: string
          health_status: string | null
          id: string
          monitoring_capabilities: string[] | null
          presence_profile_id: string | null
          source_type: string
          sync_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          domain?: string | null
          editable_capabilities?: string[] | null
          environment_type?: string
          health_status?: string | null
          id?: string
          monitoring_capabilities?: string[] | null
          presence_profile_id?: string | null
          source_type?: string
          sync_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          domain?: string | null
          editable_capabilities?: string[] | null
          environment_type?: string
          health_status?: string | null
          id?: string
          monitoring_capabilities?: string[] | null
          presence_profile_id?: string | null
          source_type?: string
          sync_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_registry_presence_profile_id_fkey"
            columns: ["presence_profile_id"]
            isOneToOne: false
            referencedRelation: "digital_presence_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sovereign_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          export_type: string
          file_path: string | null
          format: string | null
          id: string
          metadata: Json | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          export_type: string
          file_path?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          export_type?: string
          file_path?: string | null
          format?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      strategy_dna_profiles: {
        Row: {
          confidence_by_trait: Json | null
          id: string
          last_updated: string | null
          notes: string | null
          observed_patterns: Json | null
          traits: Json | null
          user_id: string
        }
        Insert: {
          confidence_by_trait?: Json | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          observed_patterns?: Json | null
          traits?: Json | null
          user_id: string
        }
        Update: {
          confidence_by_trait?: Json | null
          id?: string
          last_updated?: string | null
          notes?: string | null
          observed_patterns?: Json | null
          traits?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean | null
          cancellation_url: string | null
          category: string | null
          created_at: string
          frequency: string
          id: string
          last_used_at: string | null
          name: string
          next_billing_date: string | null
          notes: string | null
          provider: string | null
          status: string
          updated_at: string
          usage_score: number | null
          user_id: string
        }
        Insert: {
          amount: number
          auto_renew?: boolean | null
          cancellation_url?: string | null
          category?: string | null
          created_at?: string
          frequency?: string
          id?: string
          last_used_at?: string | null
          name: string
          next_billing_date?: string | null
          notes?: string | null
          provider?: string | null
          status?: string
          updated_at?: string
          usage_score?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean | null
          cancellation_url?: string | null
          category?: string | null
          created_at?: string
          frequency?: string
          id?: string
          last_used_at?: string | null
          name?: string
          next_billing_date?: string | null
          notes?: string | null
          provider?: string | null
          status?: string
          updated_at?: string
          usage_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      surface_adapters: {
        Row: {
          adapter_name: string
          constraints: Json | null
          created_at: string
          id: string
          interaction_grammar: Json | null
          navigation_grammar: Json | null
          notification_grammar: Json | null
          performance_profile: Json | null
          receipt_presentation: Json | null
          shell_type: string
          status: string
          surface_id: string
          trust_presentation: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adapter_name: string
          constraints?: Json | null
          created_at?: string
          id?: string
          interaction_grammar?: Json | null
          navigation_grammar?: Json | null
          notification_grammar?: Json | null
          performance_profile?: Json | null
          receipt_presentation?: Json | null
          shell_type?: string
          status?: string
          surface_id: string
          trust_presentation?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adapter_name?: string
          constraints?: Json | null
          created_at?: string
          id?: string
          interaction_grammar?: Json | null
          navigation_grammar?: Json | null
          notification_grammar?: Json | null
          performance_profile?: Json | null
          receipt_presentation?: Json | null
          shell_type?: string
          status?: string
          surface_id?: string
          trust_presentation?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surface_adapters_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_class_registry: {
        Row: {
          created_at: string
          description: string
          display_name: string
          id: string
          launch_stage: string
          operator_only: boolean
          surface_class_key: string
          user_facing: boolean
        }
        Insert: {
          created_at?: string
          description: string
          display_name: string
          id?: string
          launch_stage?: string
          operator_only?: boolean
          surface_class_key: string
          user_facing?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          display_name?: string
          id?: string
          launch_stage?: string
          operator_only?: boolean
          surface_class_key?: string
          user_facing?: boolean
        }
        Relationships: []
      }
      surface_constraint_records: {
        Row: {
          constraint_key: string
          constraint_type: string
          constraint_value: Json
          created_at: string
          enforced: boolean
          id: string
          notes: string | null
          surface_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          constraint_key: string
          constraint_type: string
          constraint_value?: Json
          created_at?: string
          enforced?: boolean
          id?: string
          notes?: string | null
          surface_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          constraint_key?: string
          constraint_type?: string
          constraint_value?: Json
          created_at?: string
          enforced?: boolean
          id?: string
          notes?: string | null
          surface_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surface_constraint_records_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_context_states: {
        Row: {
          active_filters: Json | null
          created_at: string
          current_route: string | null
          current_view: string | null
          device_id: string | null
          id: string
          last_active_at: string | null
          metadata: Json | null
          open_panels: string[] | null
          scroll_state: Json | null
          surface: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_filters?: Json | null
          created_at?: string
          current_route?: string | null
          current_view?: string | null
          device_id?: string | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          open_panels?: string[] | null
          scroll_state?: Json | null
          surface: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_filters?: Json | null
          created_at?: string
          current_route?: string | null
          current_view?: string | null
          device_id?: string | null
          id?: string
          last_active_at?: string | null
          metadata?: Json | null
          open_panels?: string[] | null
          scroll_state?: Json | null
          surface?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surface_context_states_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_launch_profiles: {
        Row: {
          blockers: string[]
          created_at: string
          gate_results: Json
          id: string
          launch_status: string
          launch_target_date: string | null
          readiness_score: number
          surface_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blockers?: string[]
          created_at?: string
          gate_results?: Json
          id?: string
          launch_status?: string
          launch_target_date?: string | null
          readiness_score?: number
          surface_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blockers?: string[]
          created_at?: string
          gate_results?: Json
          id?: string
          launch_status?: string
          launch_target_date?: string | null
          readiness_score?: number
          surface_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surface_launch_profiles_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_notification_grammars: {
        Row: {
          channel: string
          created_at: string
          delivery_method: string
          enabled: boolean
          id: string
          surface_id: string
          template: Json
          updated_at: string
          urgency_level: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          delivery_method: string
          enabled?: boolean
          id?: string
          surface_id: string
          template?: Json
          updated_at?: string
          urgency_level: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          delivery_method?: string
          enabled?: boolean
          id?: string
          surface_id?: string
          template?: Json
          updated_at?: string
          urgency_level?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surface_notification_grammars_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_portability_registry: {
        Row: {
          capability_key: string
          capability_name: string
          created_at: string
          desktop_ready: boolean | null
          id: string
          mobile_ready: boolean | null
          notes: string | null
          portability_score: number | null
          response_envelope_neutral: boolean | null
          surface_adapter_exists: boolean | null
          tablet_ready: boolean | null
          updated_at: string
          user_id: string
          watch_ready: boolean | null
          web_ready: boolean | null
        }
        Insert: {
          capability_key: string
          capability_name: string
          created_at?: string
          desktop_ready?: boolean | null
          id?: string
          mobile_ready?: boolean | null
          notes?: string | null
          portability_score?: number | null
          response_envelope_neutral?: boolean | null
          surface_adapter_exists?: boolean | null
          tablet_ready?: boolean | null
          updated_at?: string
          user_id: string
          watch_ready?: boolean | null
          web_ready?: boolean | null
        }
        Update: {
          capability_key?: string
          capability_name?: string
          created_at?: string
          desktop_ready?: boolean | null
          id?: string
          mobile_ready?: boolean | null
          notes?: string | null
          portability_score?: number | null
          response_envelope_neutral?: boolean | null
          surface_adapter_exists?: boolean | null
          tablet_ready?: boolean | null
          updated_at?: string
          user_id?: string
          watch_ready?: boolean | null
          web_ready?: boolean | null
        }
        Relationships: []
      }
      surface_readiness_records: {
        Row: {
          blockers: string[] | null
          capability_coverage_pct: number | null
          contract_coverage_pct: number | null
          created_at: string
          evidence: Json | null
          id: string
          last_audited_at: string | null
          portability_score: number | null
          receipt_portability: boolean
          surface_id: string
          trust_portability: boolean
          updated_at: string
          user_id: string
          workflow_portability: boolean
        }
        Insert: {
          blockers?: string[] | null
          capability_coverage_pct?: number | null
          contract_coverage_pct?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          last_audited_at?: string | null
          portability_score?: number | null
          receipt_portability?: boolean
          surface_id: string
          trust_portability?: boolean
          updated_at?: string
          user_id: string
          workflow_portability?: boolean
        }
        Update: {
          blockers?: string[] | null
          capability_coverage_pct?: number | null
          contract_coverage_pct?: number | null
          created_at?: string
          evidence?: Json | null
          id?: string
          last_audited_at?: string | null
          portability_score?: number | null
          receipt_portability?: boolean
          surface_id?: string
          trust_portability?: boolean
          updated_at?: string
          user_id?: string
          workflow_portability?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "surface_readiness_records_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_trust_presentations: {
        Row: {
          component_pattern: string | null
          created_at: string
          id: string
          notes: string | null
          rendering_strategy: string
          surface_id: string
          trust_element: string
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          component_pattern?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          rendering_strategy: string
          surface_id: string
          trust_element: string
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          component_pattern?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          rendering_strategy?: string
          surface_id?: string
          trust_element?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "surface_trust_presentations_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "surface_types"
            referencedColumns: ["id"]
          },
        ]
      }
      surface_types: {
        Row: {
          constraints: Json | null
          created_at: string
          display_name: string
          id: string
          input_modes: string[] | null
          interaction_model: string | null
          metadata: Json | null
          notification_model: string | null
          offline_support: boolean
          output_modes: string[] | null
          readiness_stage: string
          surface_class: string
          surface_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          constraints?: Json | null
          created_at?: string
          display_name: string
          id?: string
          input_modes?: string[] | null
          interaction_model?: string | null
          metadata?: Json | null
          notification_model?: string | null
          offline_support?: boolean
          output_modes?: string[] | null
          readiness_stage?: string
          surface_class?: string
          surface_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          constraints?: Json | null
          created_at?: string
          display_name?: string
          id?: string
          input_modes?: string[] | null
          interaction_model?: string | null
          metadata?: Json | null
          notification_model?: string | null
          offline_support?: boolean
          output_modes?: string[] | null
          readiness_stage?: string
          surface_class?: string
          surface_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          connector_id: string
          error: string | null
          id: string
          records_synced: number | null
          status: string
          synced_at: string
          user_id: string
        }
        Insert: {
          connector_id: string
          error?: string | null
          id?: string
          records_synced?: number | null
          status?: string
          synced_at?: string
          user_id: string
        }
        Update: {
          connector_id?: string
          error?: string | null
          id?: string
          records_synced?: number | null
          status?: string
          synced_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      system_update_devices: {
        Row: {
          auto_update_enabled: boolean | null
          channel: string
          created_at: string
          current_version: string
          device_id: string
          hardware_profile: Json | null
          hostname: string | null
          id: string
          last_check_at: string | null
          last_update_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_update_enabled?: boolean | null
          channel?: string
          created_at?: string
          current_version?: string
          device_id: string
          hardware_profile?: Json | null
          hostname?: string | null
          id?: string
          last_check_at?: string | null
          last_update_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_update_enabled?: boolean | null
          channel?: string
          created_at?: string
          current_version?: string
          device_id?: string
          hardware_profile?: Json | null
          hostname?: string | null
          id?: string
          last_check_at?: string | null
          last_update_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_update_log: {
        Row: {
          completed_at: string | null
          created_at: string
          device_id: string | null
          error: string | null
          from_version: string | null
          id: string
          started_at: string | null
          status: string
          to_version: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          error?: string | null
          from_version?: string | null
          id?: string
          started_at?: string | null
          status?: string
          to_version: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          device_id?: string | null
          error?: string | null
          from_version?: string | null
          id?: string
          started_at?: string | null
          status?: string
          to_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_update_log_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "system_update_devices"
            referencedColumns: ["id"]
          },
        ]
      }
      system_update_releases: {
        Row: {
          channel: string
          checksum_sha256: string | null
          created_at: string
          download_url: string | null
          id: string
          is_critical: boolean | null
          min_version: string | null
          release_notes: string | null
          size_bytes: number | null
          version: string
        }
        Insert: {
          channel?: string
          checksum_sha256?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_critical?: boolean | null
          min_version?: string | null
          release_notes?: string | null
          size_bytes?: number | null
          version: string
        }
        Update: {
          channel?: string
          checksum_sha256?: string | null
          created_at?: string
          download_url?: string | null
          id?: string
          is_critical?: boolean | null
          min_version?: string | null
          release_notes?: string | null
          size_bytes?: number | null
          version?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_minutes: number | null
          id: string
          notes: string | null
          parent_task_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number | null
          id?: string
          notes?: string | null
          parent_task_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_firewall_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          result: string
          rule_matched: string | null
          source_ip: string | null
          target: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          result?: string
          rule_matched?: string | null
          source_ip?: string | null
          target?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          result?: string
          rule_matched?: string | null
          source_ip?: string | null
          target?: string | null
          user_id?: string
        }
        Relationships: []
      }
      thesis_records: {
        Row: {
          assumptions: Json | null
          catalyst_ids: string[] | null
          created_at: string
          desired_sizing_note: string | null
          expected_horizon: string | null
          id: string
          invalidation_criteria: Json | null
          linked_decision_ids: string[] | null
          linked_strategy_id: string | null
          rationale: string | null
          related_asset_ids: string[] | null
          related_theme_ids: string[] | null
          review_at: string | null
          risk_factors: Json | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assumptions?: Json | null
          catalyst_ids?: string[] | null
          created_at?: string
          desired_sizing_note?: string | null
          expected_horizon?: string | null
          id?: string
          invalidation_criteria?: Json | null
          linked_decision_ids?: string[] | null
          linked_strategy_id?: string | null
          rationale?: string | null
          related_asset_ids?: string[] | null
          related_theme_ids?: string[] | null
          review_at?: string | null
          risk_factors?: Json | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assumptions?: Json | null
          catalyst_ids?: string[] | null
          created_at?: string
          desired_sizing_note?: string | null
          expected_horizon?: string | null
          id?: string
          invalidation_criteria?: Json | null
          linked_decision_ids?: string[] | null
          linked_strategy_id?: string | null
          rationale?: string | null
          related_asset_ids?: string[] | null
          related_theme_ids?: string[] | null
          review_at?: string | null
          risk_factors?: Json | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      time_machine_snapshots: {
        Row: {
          advisor_state: Json | null
          captured_at: string
          catalyst_state: Json | null
          created_at: string
          id: string
          market_context: Json | null
          owner_id: string | null
          owner_type: string
          portfolio_state: Json | null
          risk_state: Json | null
          thesis_state: Json | null
          user_id: string
        }
        Insert: {
          advisor_state?: Json | null
          captured_at?: string
          catalyst_state?: Json | null
          created_at?: string
          id?: string
          market_context?: Json | null
          owner_id?: string | null
          owner_type?: string
          portfolio_state?: Json | null
          risk_state?: Json | null
          thesis_state?: Json | null
          user_id: string
        }
        Update: {
          advisor_state?: Json | null
          captured_at?: string
          catalyst_state?: Json | null
          created_at?: string
          id?: string
          market_context?: Json | null
          owner_id?: string | null
          owner_type?: string
          portfolio_state?: Json | null
          risk_state?: Json | null
          thesis_state?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      timing_intelligence_decisions: {
        Row: {
          created_at: string
          id: string
          readiness_ref: string | null
          reason: string | null
          recommendation: string | null
          trigger_ref: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          readiness_ref?: string | null
          reason?: string | null
          recommendation?: string | null
          trigger_ref?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          readiness_ref?: string | null
          reason?: string | null
          recommendation?: string | null
          trigger_ref?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trust_state: {
        Row: {
          entity_id: string
          entity_type: string
          id: string
          score: number | null
          trust_level: string
          updated_at: string
          user_id: string
        }
        Insert: {
          entity_id: string
          entity_type: string
          id?: string
          score?: number | null
          trust_level?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          entity_id?: string
          entity_type?: string
          id?: string
          score?: number | null
          trust_level?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trust_state_events: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string | null
          event_type: string
          id: string
          impact_score: number | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          event_type: string
          id?: string
          impact_score?: number | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string | null
          event_type?: string
          id?: string
          impact_score?: number | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      trust_weighted_actions: {
        Row: {
          action_ref: string | null
          action_type: string
          actor_id: string
          created_at: string
          device_trust_class: string | null
          id: string
          mode: string | null
          reason: string | null
          risk_tier: string | null
          routing: string | null
          trust_class: string | null
        }
        Insert: {
          action_ref?: string | null
          action_type: string
          actor_id: string
          created_at?: string
          device_trust_class?: string | null
          id?: string
          mode?: string | null
          reason?: string | null
          risk_tier?: string | null
          routing?: string | null
          trust_class?: string | null
        }
        Update: {
          action_ref?: string | null
          action_type?: string
          actor_id?: string
          created_at?: string
          device_trust_class?: string | null
          id?: string
          mode?: string | null
          reason?: string | null
          risk_tier?: string | null
          routing?: string | null
          trust_class?: string | null
        }
        Relationships: []
      }
      ui_action_inventory: {
        Row: {
          action_key: string
          action_label: string | null
          action_type: string
          component_name: string | null
          created_at: string
          expected_outcome: string | null
          id: string
          is_active: boolean
          launch_honesty_class: string | null
          owner_team: string | null
          priority_class: string
          route_key: string
          selector_hint: string | null
          supported_modes: Json
          surface_class: string
          test_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          action_key: string
          action_label?: string | null
          action_type?: string
          component_name?: string | null
          created_at?: string
          expected_outcome?: string | null
          id?: string
          is_active?: boolean
          launch_honesty_class?: string | null
          owner_team?: string | null
          priority_class?: string
          route_key: string
          selector_hint?: string | null
          supported_modes?: Json
          surface_class?: string
          test_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          action_key?: string
          action_label?: string | null
          action_type?: string
          component_name?: string | null
          created_at?: string
          expected_outcome?: string | null
          id?: string
          is_active?: boolean
          launch_honesty_class?: string | null
          owner_team?: string | null
          priority_class?: string
          route_key?: string
          selector_hint?: string | null
          supported_modes?: Json
          surface_class?: string
          test_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      unified_account_edges: {
        Row: {
          active: boolean | null
          created_at: string
          edge_type: string
          id: string
          metadata: Json | null
          provider_family_id: string | null
          source_node_id: string
          target_node_id: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          edge_type?: string
          id?: string
          metadata?: Json | null
          provider_family_id?: string | null
          source_node_id: string
          target_node_id: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          edge_type?: string
          id?: string
          metadata?: Json | null
          provider_family_id?: string | null
          source_node_id?: string
          target_node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unified_account_edges_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_account_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "unified_account_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_account_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "v_account_graph_summary"
            referencedColumns: ["node_id"]
          },
          {
            foreignKeyName: "unified_account_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "unified_account_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_account_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "v_account_graph_summary"
            referencedColumns: ["node_id"]
          },
        ]
      }
      unified_account_nodes: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          node_ref_id: string | null
          node_type: string
          provider_family_id: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          node_ref_id?: string | null
          node_type?: string
          provider_family_id?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          node_ref_id?: string | null
          node_type?: string
          provider_family_id?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_account_nodes_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      user_ai_budgets: {
        Row: {
          auto_downgrade_model: boolean | null
          created_at: string | null
          hard_limit: boolean | null
          id: string
          limit_cost_cents: number | null
          limit_tokens: number | null
          period: string
          reset_at: string | null
          updated_at: string | null
          used_cost_cents: number | null
          used_tokens: number | null
          user_id: string
        }
        Insert: {
          auto_downgrade_model?: boolean | null
          created_at?: string | null
          hard_limit?: boolean | null
          id?: string
          limit_cost_cents?: number | null
          limit_tokens?: number | null
          period?: string
          reset_at?: string | null
          updated_at?: string | null
          used_cost_cents?: number | null
          used_tokens?: number | null
          user_id: string
        }
        Update: {
          auto_downgrade_model?: boolean | null
          created_at?: string | null
          hard_limit?: boolean | null
          id?: string
          limit_cost_cents?: number | null
          limit_tokens?: number | null
          period?: string
          reset_at?: string | null
          updated_at?: string | null
          used_cost_cents?: number | null
          used_tokens?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_device_graph_edges: {
        Row: {
          consent_status: string | null
          created_at: string
          id: string
          metadata: Json | null
          relationship: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          trust_level: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_status?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          relationship: string
          source_id: string
          source_type: string
          target_id: string
          target_type: string
          trust_level?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_status?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          relationship?: string
          source_id?: string
          source_type?: string
          target_id?: string
          target_type?: string
          trust_level?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          category: string
          confidence: number | null
          created_at: string
          expires_at: string | null
          id: string
          key: string
          source: string | null
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          category?: string
          confidence?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          key: string
          source?: string | null
          updated_at?: string
          user_id: string
          value?: Json
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          key?: string
          source?: string | null
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_blockers: {
        Row: {
          blocker_type: string
          created_at: string
          description: string
          id: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          surface_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blocker_type?: string
          created_at?: string
          description: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          surface_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blocker_type?: string
          created_at?: string
          description?: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          surface_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_blockers_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "verification_surfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_evidence: {
        Row: {
          content: string | null
          created_at: string
          evidence_type: string
          file_url: string | null
          id: string
          metadata: Json | null
          run_id: string | null
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          run_id?: string | null
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          evidence_type?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          run_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_evidence_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "verification_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_evidence_assets: {
        Row: {
          asset_ref: string
          asset_type: string
          created_at: string
          id: string
          label: string | null
          metadata: Json
          user_id: string
          verification_run_id: string
        }
        Insert: {
          asset_ref: string
          asset_type?: string
          created_at?: string
          id?: string
          label?: string | null
          metadata?: Json
          user_id: string
          verification_run_id: string
        }
        Update: {
          asset_ref?: string
          asset_type?: string
          created_at?: string
          id?: string
          label?: string | null
          metadata?: Json
          user_id?: string
          verification_run_id?: string
        }
        Relationships: []
      }
      verification_runs: {
        Row: {
          created_at: string
          duration_ms: number | null
          environment: string
          evidence_refs: Json | null
          failure_reason: string | null
          id: string
          launched_by: string | null
          mode: string
          passed: boolean
          run_type: string
          surface_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          environment?: string
          evidence_refs?: Json | null
          failure_reason?: string | null
          id?: string
          launched_by?: string | null
          mode?: string
          passed?: boolean
          run_type?: string
          surface_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          environment?: string
          evidence_refs?: Json | null
          failure_reason?: string | null
          id?: string
          launched_by?: string | null
          mode?: string
          passed?: boolean
          run_type?: string
          surface_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_runs_surface_id_fkey"
            columns: ["surface_id"]
            isOneToOne: false
            referencedRelation: "verification_surfaces"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_surfaces: {
        Row: {
          action_label: string | null
          action_selector: string | null
          action_type: string
          backend_dependency: string | null
          component_name: string | null
          created_at: string
          domain: string | null
          expected_result: string | null
          id: string
          launch_honesty_class: string
          owner: string | null
          route_key: string
          route_path: string
          shell: string
          supported_modes: string[]
          surface_class: string
          test_priority: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          action_label?: string | null
          action_selector?: string | null
          action_type?: string
          backend_dependency?: string | null
          component_name?: string | null
          created_at?: string
          domain?: string | null
          expected_result?: string | null
          id?: string
          launch_honesty_class?: string
          owner?: string | null
          route_key: string
          route_path: string
          shell?: string
          supported_modes?: string[]
          surface_class?: string
          test_priority?: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          action_label?: string | null
          action_selector?: string | null
          action_type?: string
          backend_dependency?: string | null
          component_name?: string | null
          created_at?: string
          domain?: string | null
          expected_result?: string | null
          id?: string
          launch_honesty_class?: string
          owner?: string | null
          route_key?: string
          route_path?: string
          shell?: string
          supported_modes?: string[]
          surface_class?: string
          test_priority?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      wearable_providers: {
        Row: {
          active: boolean | null
          activity_data_support: boolean | null
          api_type: string | null
          auth_method: string | null
          categories: string[] | null
          created_at: string
          description: string | null
          health_data_support: boolean | null
          id: string
          launch_stage: string | null
          metadata: Json | null
          micro_action_support: boolean | null
          name: string
          notification_support: boolean | null
          provider_key: string
          readiness_data_support: boolean | null
          requires_native_app: boolean | null
          requires_partner_program: boolean | null
          sleep_data_support: boolean | null
          supported_signals: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          activity_data_support?: boolean | null
          api_type?: string | null
          auth_method?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          health_data_support?: boolean | null
          id?: string
          launch_stage?: string | null
          metadata?: Json | null
          micro_action_support?: boolean | null
          name: string
          notification_support?: boolean | null
          provider_key: string
          readiness_data_support?: boolean | null
          requires_native_app?: boolean | null
          requires_partner_program?: boolean | null
          sleep_data_support?: boolean | null
          supported_signals?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          activity_data_support?: boolean | null
          api_type?: string | null
          auth_method?: string | null
          categories?: string[] | null
          created_at?: string
          description?: string | null
          health_data_support?: boolean | null
          id?: string
          launch_stage?: string | null
          metadata?: Json | null
          micro_action_support?: boolean | null
          name?: string
          notification_support?: boolean | null
          provider_key?: string
          readiness_data_support?: boolean | null
          requires_native_app?: boolean | null
          requires_partner_program?: boolean | null
          sleep_data_support?: boolean | null
          supported_signals?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wearable_signals: {
        Row: {
          confidence: number | null
          connected_device_id: string | null
          consented: boolean | null
          created_at: string
          id: string
          ingested_at: string
          metadata: Json | null
          privacy_tier: string | null
          recorded_at: string
          signal_quality: string | null
          signal_type: string
          signal_unit: string | null
          signal_value: number | null
          user_id: string
          wearable_provider_id: string | null
        }
        Insert: {
          confidence?: number | null
          connected_device_id?: string | null
          consented?: boolean | null
          created_at?: string
          id?: string
          ingested_at?: string
          metadata?: Json | null
          privacy_tier?: string | null
          recorded_at?: string
          signal_quality?: string | null
          signal_type: string
          signal_unit?: string | null
          signal_value?: number | null
          user_id: string
          wearable_provider_id?: string | null
        }
        Update: {
          confidence?: number | null
          connected_device_id?: string | null
          consented?: boolean | null
          created_at?: string
          id?: string
          ingested_at?: string
          metadata?: Json | null
          privacy_tier?: string | null
          recorded_at?: string
          signal_quality?: string | null
          signal_type?: string
          signal_unit?: string | null
          signal_value?: number | null
          user_id?: string
          wearable_provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_signals_connected_device_id_fkey"
            columns: ["connected_device_id"]
            isOneToOne: false
            referencedRelation: "connected_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_signals_wearable_provider_id_fkey"
            columns: ["wearable_provider_id"]
            isOneToOne: false
            referencedRelation: "wearable_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      website_twins: {
        Row: {
          commerce_nodes: Json | null
          conversion_nodes: Json | null
          created_at: string
          id: string
          issue_nodes: Json | null
          journey_paths: Json | null
          page_nodes: Json | null
          site_id: string
          trust_nodes: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          commerce_nodes?: Json | null
          conversion_nodes?: Json | null
          created_at?: string
          id?: string
          issue_nodes?: Json | null
          journey_paths?: Json | null
          page_nodes?: Json | null
          site_id: string
          trust_nodes?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          commerce_nodes?: Json | null
          conversion_nodes?: Json | null
          created_at?: string
          id?: string
          issue_nodes?: Json | null
          journey_paths?: Json | null
          page_nodes?: Json | null
          site_id?: string
          trust_nodes?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_twins_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site_registry"
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
          id: string
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
          id?: string
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
          id?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          action: string
          completed_at: string | null
          created_at: string
          id: string
          input: Json
          result: Json | null
          run_id: string
          started_at: string | null
          status: string
          step_index: number
          user_id: string
        }
        Insert: {
          action: string
          completed_at?: string | null
          created_at?: string
          id?: string
          input?: Json
          result?: Json | null
          run_id: string
          started_at?: string | null
          status?: string
          step_index?: number
          user_id: string
        }
        Update: {
          action?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          input?: Json
          result?: Json | null
          run_id?: string
          started_at?: string | null
          status?: string
          step_index?: number
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
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          steps: Json
          trigger_config: Json
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          steps?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          steps?: Json
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      zero_waste_prompt_profiles: {
        Row: {
          active: boolean | null
          average_cost_reduction: number | null
          domain: string
          id: string
          max_context_class: string | null
          packet_driven: boolean | null
          prompt_template_version: string | null
          quality_impact_score: number | null
          redundancy_score: number | null
          retrieval_mode: string | null
          reusable_instruction_refs: string[] | null
          task_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean | null
          average_cost_reduction?: number | null
          domain: string
          id?: string
          max_context_class?: string | null
          packet_driven?: boolean | null
          prompt_template_version?: string | null
          quality_impact_score?: number | null
          redundancy_score?: number | null
          retrieval_mode?: string | null
          reusable_instruction_refs?: string[] | null
          task_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean | null
          average_cost_reduction?: number | null
          domain?: string
          id?: string
          max_context_class?: string | null
          packet_driven?: boolean | null
          prompt_template_version?: string | null
          quality_impact_score?: number | null
          redundancy_score?: number | null
          retrieval_mode?: string | null
          reusable_instruction_refs?: string[] | null
          task_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_account_graph_summary: {
        Row: {
          created_at: string | null
          display_name: string | null
          edge_count: number | null
          email: string | null
          entity_id: string | null
          node_id: string | null
          node_ref_id: string | null
          node_type: string | null
          provider_family_id: string | null
          provider_family_key: string | null
          provider_family_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_account_nodes_provider_family_id_fkey"
            columns: ["provider_family_id"]
            isOneToOne: false
            referencedRelation: "provider_families"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ai_budget_summary: {
        Row: {
          avg_latency_ms: number | null
          capability_key: string | null
          period_day: string | null
          request_count: number | null
          status: string | null
          total_completion_tokens: number | null
          total_cost_usd: number | null
          total_prompt_tokens: number | null
          total_tokens: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_ai_capability_status: {
        Row: {
          budget_class: string | null
          capability_key: string | null
          cost_tier: string | null
          created_at: string | null
          default_model_key: string | null
          default_model_name: string | null
          default_provider_key: string | null
          default_provider_name: string | null
          fallback_model_key: string | null
          fallback_provider_key: string | null
          id: string | null
          is_active: boolean | null
          launch_honesty_class: string | null
          provider_active: boolean | null
          provider_health_state: string | null
          public_claim_allowed: boolean | null
          qualifier_required: boolean | null
          quality_requirement: string | null
          quality_tier: string | null
          routing_class: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_ai_provider_status: {
        Row: {
          api_style: string | null
          avg_latency_ms: number | null
          display_name: string | null
          error_rate: number | null
          failure_reason: string | null
          health_state: string | null
          id: string | null
          is_active: boolean | null
          last_failure_at: string | null
          last_success_at: string | null
          launch_stage: string | null
          mode: string | null
          provider_key: string | null
          secret_env_name: string | null
          supports_streaming: boolean | null
          supports_structured_output: boolean | null
          supports_tools: boolean | null
          total_failures: number | null
          total_requests: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_ai_usage_recent: {
        Row: {
          capability_key: string | null
          completion_tokens: number | null
          created_at: string | null
          error_code: string | null
          error_summary: string | null
          estimated_cost_usd: number | null
          id: string | null
          latency_ms: number | null
          mode: string | null
          model_key: string | null
          model_name: string | null
          prompt_tokens: number | null
          provider_key: string | null
          provider_name: string | null
          quality_tier: string | null
          request_class: string | null
          status: string | null
          structured_output_valid: boolean | null
          total_tokens: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_ai_workforce_queue_summary: {
        Row: {
          budget_impact_class: string | null
          created_at: string | null
          id: string | null
          impacted_domain: string | null
          inv_role_key: string | null
          inv_task_type: string | null
          invocation_id: string | null
          launch_impact_class: string | null
          rec_role_key: string | null
          recommendation_id: string | null
          recommendation_type: string | null
          resolved_at: string | null
          risk_tier: string | null
          severity: string | null
          status: string | null
          summary: string | null
          title: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_workforce_approval_queue_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "ai_workforce_invocations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_workforce_approval_queue_invocation_id_fkey"
            columns: ["invocation_id"]
            isOneToOne: false
            referencedRelation: "v_ai_workforce_recent_activity"
            referencedColumns: ["id"]
          },
        ]
      }
      v_ai_workforce_recent_activity: {
        Row: {
          budget_class: string | null
          completed_at: string | null
          cost_cents: number | null
          created_at: string | null
          fallback_occurred: boolean | null
          id: string | null
          latency_ms: number | null
          mode: string | null
          role_display_name: string | null
          role_key: string | null
          scope_ref: string | null
          scope_type: string | null
          status: string | null
          task_type: string | null
          tokens_used: number | null
          used_cached_output: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
      v_ai_workforce_recommendation_summary: {
        Row: {
          budget_impact_class: string | null
          created_at: string | null
          domain: string | null
          estimated_impact: string | null
          id: string | null
          launch_impact_class: string | null
          linked_approval_queue_item_id: string | null
          recommendation_type: string | null
          review_method: string | null
          risk_tier: string | null
          score_accuracy: number | null
          score_actionability: number | null
          score_overall: number | null
          score_usefulness: number | null
          severity: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_ai_workforce_role_summary: {
        Row: {
          autonomy_level: string | null
          avg_cost_24h: number | null
          budget_class: string | null
          display_name: string | null
          domain_family: string | null
          fallback_rate_24h: number | null
          health_state: string | null
          id: string | null
          is_active: boolean | null
          last_used_at: string | null
          launch_honesty_class: string | null
          role_key: string | null
          total_cost_cents: number | null
          total_invocations: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_connected_accounts_center: {
        Row: {
          account_label: string | null
          capability_category: string | null
          capability_key: string | null
          capability_name: string | null
          connection_status: string | null
          created_at: string | null
          default_grant_profile: string | null
          external_account_email: string | null
          external_account_id: string | null
          granted_scopes: string[] | null
          health_status: string | null
          id: string | null
          last_health_check_at: string | null
          last_sync_at: string | null
          mode: string | null
          permission_level: string | null
          policy_minimum_scopes: string[] | null
          provider_family_key: string | null
          provider_family_name: string | null
          reauth_needed: boolean | null
          upgrade_path_available: boolean | null
          user_id: string | null
        }
        Relationships: []
      }
      v_consent_history: {
        Row: {
          capability_key: string | null
          capability_name: string | null
          consent_status: string | null
          consent_type: string | null
          created_at: string | null
          denied_scopes: string[] | null
          granted_at: string | null
          granted_scopes: string[] | null
          id: string | null
          mode: string | null
          notes: string | null
          previous_scopes: Json | null
          provider_family_key: string | null
          provider_family_name: string | null
          revocation_reason: string | null
          revoked_at: string | null
          source_flow: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_customer_journey_blockers: {
        Row: {
          affects_admin: boolean | null
          affects_demo: boolean | null
          affects_real: boolean | null
          affects_user: boolean | null
          blocker_created_at: string | null
          blocker_id: string | null
          blocker_type: string | null
          display_name: string | null
          domain_family: string | null
          journey_key: string | null
          launch_importance: string | null
          owner_team: string | null
          priority_class: string | null
          reason_summary: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity_score: number | null
        }
        Relationships: []
      }
      v_customer_journey_mode_deltas: {
        Row: {
          claim_risk: boolean | null
          comparison_id: string | null
          comparison_summary: string | null
          demo_status: string | null
          display_name: string | null
          domain_family: string | null
          journey_key: string | null
          persona: string | null
          priority_class: string | null
          real_status: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_customer_journey_recent_failures: {
        Row: {
          branch_name: string | null
          commit_sha: string | null
          completed_at: string | null
          created_at: string | null
          display_name: string | null
          domain_family: string | null
          environment: string | null
          journey_key: string | null
          launch_importance: string | null
          mode: string | null
          priority_class: string | null
          run_id: string | null
          started_at: string | null
          status: string | null
          steps_failed: number | null
          steps_passed: number | null
          steps_skipped: number | null
          summary: string | null
          verification_type: string | null
        }
        Relationships: []
      }
      v_customer_journey_summary: {
        Row: {
          actual_outcome_summary: string | null
          current_status: string | null
          display_name: string | null
          domain_family: string | null
          expected_outcome: string | null
          is_active: boolean | null
          journey_key: string | null
          last_run_commit_sha: string | null
          last_run_environment: string | null
          last_run_mode: string | null
          last_run_status: string | null
          last_run_steps_failed: number | null
          last_run_steps_passed: number | null
          last_verified_at: string | null
          launch_honesty_class: string | null
          launch_impact: string | null
          launch_importance: string | null
          owner_team: string | null
          persona: string | null
          priority_class: string | null
          proof_confidence: string | null
          recommended_fix: string | null
          registry_id: string | null
          surface_class: string | null
        }
        Relationships: []
      }
      v_demo_provider_summary: {
        Row: {
          capability_keys: Json | null
          demo_provider_key: string | null
          display_name: string | null
          domain_family: string | null
          interaction_policy_count: number | null
          is_active: boolean | null
          launch_honesty_class: string | null
          scenario_pack_count: number | null
          supports_interaction: boolean | null
          supports_simulated_writes: boolean | null
        }
        Relationships: []
      }
      v_identity_methods: {
        Row: {
          active: boolean | null
          auth_method: string | null
          avatar_url: string | null
          display_name: string | null
          email: string | null
          external_id: string | null
          id: string | null
          identity_key: string | null
          last_used_at: string | null
          last_verified_at: string | null
          linked_at: string | null
          mode: string | null
          platform_scope: string | null
          primary_identity: boolean | null
          provider_family_key: string | null
          provider_family_name: string | null
          registry_launch_stage: string | null
          revoked_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_launch_honesty_by_surface: {
        Row: {
          binding_key: string | null
          binding_type: string | null
          last_verified_at: string | null
          launch_honesty_class: string | null
          notes: string | null
          public_claim_allowed: boolean | null
          qualifier_required: boolean | null
          route_path: string | null
          surface_class_key: string | null
        }
        Relationships: []
      }
      v_mode_resolution_recent: {
        Row: {
          analytics_bucket: string | null
          capability_key: string | null
          created_at: string | null
          id: string | null
          launch_honesty_class: string | null
          provider_source_key: string | null
          provider_source_type: string | null
          requested_mode: string | null
          resolution_reason: string | null
          resolved_mode: string | null
          route_key: string | null
          surface_class_key: string | null
          user_id: string | null
        }
        Relationships: []
      }
      v_provider_activation_summary: {
        Row: {
          activation_state: string | null
          demo_mode_supported: boolean | null
          health_state: string | null
          internal_test_supported: boolean | null
          last_verified_at: string | null
          notes: string | null
          provider_capability_key: string | null
          provider_family_key: string | null
          real_mode_supported: boolean | null
          updated_at: string | null
        }
        Insert: {
          activation_state?: string | null
          demo_mode_supported?: boolean | null
          health_state?: string | null
          internal_test_supported?: boolean | null
          last_verified_at?: string | null
          notes?: string | null
          provider_capability_key?: string | null
          provider_family_key?: string | null
          real_mode_supported?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activation_state?: string | null
          demo_mode_supported?: boolean | null
          health_state?: string | null
          internal_test_supported?: boolean | null
          last_verified_at?: string | null
          notes?: string | null
          provider_capability_key?: string | null
          provider_family_key?: string | null
          real_mode_supported?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_reality_mode_surface_summary: {
        Row: {
          allowed_modes: Json | null
          capability_key: string | null
          domain_family: string | null
          honesty_binding_class: string | null
          launch_honesty_class: string | null
          operator_only: boolean | null
          preferred_mode_key: string | null
          public_claim_allowed: boolean | null
          qualifier_required: boolean | null
          route_key: string | null
          route_launch_stage: string | null
          route_path: string | null
          shell_key: string | null
          side_effect_policy_key: string | null
          surface_class_key: string | null
          surface_display_name: string | null
        }
        Relationships: []
      }
      v_route_verification_summary: {
        Row: {
          latest_verification: string | null
          overall_coverage_percent: number | null
          surface_class: string | null
          total_actions: number | null
          total_p0_actions: number | null
          total_p0_verified: number | null
          total_routes: number | null
          total_verified_actions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_ai_daily_spend: {
        Args: { p_user_id: string }
        Returns: {
          avg_latency_ms: number
          capability_key: string
          request_count: number
          spend_date: string
          total_cost_usd: number
          total_tokens: number
        }[]
      }
      check_ai_budget_policies: {
        Args: {
          p_capability_key: string
          p_estimated_cost_usd: number
          p_user_id: string
        }
        Returns: Json
      }
      cleanup_expired_signals: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_ai_budget_usage: {
        Args: { p_cost: number; p_tokens: number; p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      journey_launch_impact:
        | "launch_blocker"
        | "pilot_blocker"
        | "claim_risk"
        | "important_non_blocker"
        | "non_blocking"
      journey_proof_confidence:
        | "verified_e2e"
        | "verified_interaction"
        | "verified_component_only"
        | "manually_confirmed"
        | "unverified"
      journey_status:
        | "working"
        | "partial"
        | "demo_governed"
        | "degraded_usable"
        | "broken"
        | "planned"
        | "internal_only"
      push_platform: "web" | "ios" | "android" | "electron"
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
      journey_launch_impact: [
        "launch_blocker",
        "pilot_blocker",
        "claim_risk",
        "important_non_blocker",
        "non_blocking",
      ],
      journey_proof_confidence: [
        "verified_e2e",
        "verified_interaction",
        "verified_component_only",
        "manually_confirmed",
        "unverified",
      ],
      journey_status: [
        "working",
        "partial",
        "demo_governed",
        "degraded_usable",
        "broken",
        "planned",
        "internal_only",
      ],
      push_platform: ["web", "ios", "android", "electron"],
    },
  },
} as const
