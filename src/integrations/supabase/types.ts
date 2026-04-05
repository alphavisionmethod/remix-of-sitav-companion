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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
