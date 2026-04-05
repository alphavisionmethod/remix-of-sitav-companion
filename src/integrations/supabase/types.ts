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
