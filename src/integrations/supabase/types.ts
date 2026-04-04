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
          advisor_id: string
          autonomy_level: string | null
          created_at: string | null
          domain: string
          enabled: boolean | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_id: string
          autonomy_level?: string | null
          created_at?: string | null
          domain: string
          enabled?: boolean | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string
          autonomy_level?: string | null
          created_at?: string | null
          domain?: string
          enabled?: boolean | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advisor_requests: {
        Row: {
          advisor_id: string | null
          complexity: string | null
          created_at: string | null
          id: string
          input_data: Json | null
          intent: string
          metadata: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          advisor_id?: string | null
          complexity?: string | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          intent: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          advisor_id?: string | null
          complexity?: string | null
          created_at?: string | null
          id?: string
          input_data?: Json | null
          intent?: string
          metadata?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advisor_responses: {
        Row: {
          advisor_id: string | null
          confidence: number | null
          created_at: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          model_used: string | null
          request_id: string | null
          response_data: Json | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          advisor_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          request_id?: string | null
          response_data?: Json | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          advisor_id?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_used?: string | null
          request_id?: string | null
          response_data?: Json | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      agent_action_receipts: {
        Row: {
          action_type: string
          agent_id: string
          autonomy_level: string | null
          cost_cents: number | null
          created_at: string | null
          governance_checks: Json | null
          id: string
          input_data: Json | null
          metadata: Json | null
          output_data: Json | null
          risk_score: number | null
          status: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          action_type: string
          agent_id: string
          autonomy_level?: string | null
          cost_cents?: number | null
          created_at?: string | null
          governance_checks?: Json | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          risk_score?: number | null
          status?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          action_type?: string
          agent_id?: string
          autonomy_level?: string | null
          cost_cents?: number | null
          created_at?: string | null
          governance_checks?: Json | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          risk_score?: number | null
          status?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      agent_schedules: {
        Row: {
          agent_id: string
          config: Json | null
          created_at: string | null
          cron_expression: string | null
          enabled: boolean | null
          id: string
          last_run_at: string | null
          metadata: Json | null
          next_run_at: string | null
          schedule_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          config?: Json | null
          created_at?: string | null
          cron_expression?: string | null
          enabled?: boolean | null
          id?: string
          last_run_at?: string | null
          metadata?: Json | null
          next_run_at?: string | null
          schedule_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          config?: Json | null
          created_at?: string | null
          cron_expression?: string | null
          enabled?: boolean | null
          id?: string
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
          acknowledged: boolean | null
          agent_id: string
          created_at: string | null
          id: string
          message: string | null
          metadata: Json | null
          severity: string | null
          signal_type: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          agent_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string | null
          signal_type: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          agent_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          severity?: string | null
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
          recorded_at: string | null
          tags: Json | null
          unit: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          recorded_at?: string | null
          tags?: Json | null
          unit?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          recorded_at?: string | null
          tags?: Json | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_agent_tasks: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          metadata: Json | null
          output_data: Json | null
          priority: string | null
          started_at: string | null
          status: string | null
          task_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          task_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: string | null
          started_at?: string | null
          status?: string | null
          task_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_cost_ledger: {
        Row: {
          agent_id: string | null
          cost_cents: number | null
          created_at: string | null
          domain: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          model_id: string
          operation: string
          provider: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          cost_cents?: number | null
          created_at?: string | null
          domain?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_id: string
          operation: string
          provider: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          cost_cents?: number | null
          created_at?: string | null
          domain?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          model_id?: string
          operation?: string
          provider?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string
        }
        Relationships: []
      }
      approval_queue: {
        Row: {
          action_summary: string
          created_at: string | null
          decided_at: string | null
          decision_reason: string | null
          domain: string | null
          id: string
          metadata: Json | null
          proposed_action: Json | null
          risk_level: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          action_summary: string
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          proposed_action?: Json | null
          risk_level?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          action_summary?: string
          created_at?: string | null
          decided_at?: string | null
          decision_reason?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          proposed_action?: Json | null
          risk_level?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string
          changes: Json | null
          correlation_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          result: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id: string
          changes?: Json | null
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          result?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          changes?: Json | null
          correlation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          result?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      bills: {
        Row: {
          amount_cents: number | null
          category: string | null
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          recurring: boolean | null
          status: string | null
          updated_at: string | null
          user_id: string
          vendor: string
        }
        Insert: {
          amount_cents?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          recurring?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          vendor: string
        }
        Update: {
          amount_cents?: number | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          recurring?: boolean | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string | null
          date: string | null
          details: Json | null
          id: string
          provider: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          details?: Json | null
          id?: string
          provider?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          details?: Json | null
          id?: string
          provider?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      boot_phase_logs: {
        Row: {
          completed_at: string | null
          created_at: string
          device_id: string
          duration_ms: number | null
          error: string | null
          id: string
          metadata: Json | null
          phase: string
          session_id: string
          started_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          device_id: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          phase: string
          session_id: string
          started_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          device_id?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          phase?: string
          session_id?: string
          started_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          allocated: number | null
          category: string
          created_at: string | null
          id: string
          metadata: Json | null
          period: string | null
          spent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allocated?: number | null
          category: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period?: string | null
          spent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allocated?: number | null
          category?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          period?: string | null
          spent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      capabilities: {
        Row: {
          created_at: string | null
          description: string | null
          domain: string
          enabled: boolean | null
          id: string
          metadata: Json | null
          name: string
          risk_tier: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          domain: string
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          risk_tier?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          domain?: string
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          risk_tier?: string | null
        }
        Relationships: []
      }
      capital_allocations: {
        Row: {
          allocation_name: string
          amount_cents: number
          category: string
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          status: string | null
          threshold_critical_pct: number | null
          threshold_warning_pct: number | null
          updated_at: string | null
          user_id: string
          utilization_pct: number | null
        }
        Insert: {
          allocation_name: string
          amount_cents: number
          category: string
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          threshold_critical_pct?: number | null
          threshold_warning_pct?: number | null
          updated_at?: string | null
          user_id: string
          utilization_pct?: number | null
        }
        Update: {
          allocation_name?: string
          amount_cents?: number
          category?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          threshold_critical_pct?: number | null
          threshold_warning_pct?: number | null
          updated_at?: string | null
          user_id?: string
          utilization_pct?: number | null
        }
        Relationships: []
      }
      communication_log: {
        Row: {
          body_preview: string | null
          channel: string
          contact_identifier: string | null
          contact_name: string | null
          correlation_id: string | null
          created_at: string | null
          delivered_at: string | null
          direction: string
          domain: string | null
          id: string
          metadata: Json | null
          read_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body_preview?: string | null
          channel: string
          contact_identifier?: string | null
          contact_name?: string | null
          correlation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          direction: string
          domain?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body_preview?: string | null
          channel?: string
          contact_identifier?: string | null
          contact_name?: string | null
          correlation_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          direction?: string
          domain?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communications: {
        Row: {
          body: string | null
          channel: string
          contact_id: string | null
          created_at: string | null
          direction: string
          id: string
          metadata: Json | null
          status: string | null
          subject: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          channel: string
          contact_id?: string | null
          created_at?: string | null
          direction: string
          id?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: string
          contact_id?: string | null
          created_at?: string | null
          direction?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          user_id?: string
        }
        Relationships: []
      }
      connector_configs: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          service: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          service: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          service?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      connector_credentials: {
        Row: {
          connector_id: string
          created_at: string | null
          encrypted_token: string | null
          id: string
          metadata: Json | null
          provider: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          connector_id: string
          created_at?: string | null
          encrypted_token?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          connector_id?: string
          created_at?: string | null
          encrypted_token?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      council_decisions: {
        Row: {
          council_id: string
          created_at: string | null
          decided_at: string | null
          description: string | null
          domain: string | null
          id: string
          metadata: Json | null
          quorum: number | null
          resolution: string | null
          status: string | null
          topic: string
          updated_at: string | null
          user_id: string
          votes: Json | null
          votes_abstained: number | null
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          council_id: string
          created_at?: string | null
          decided_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          quorum?: number | null
          resolution?: string | null
          status?: string | null
          topic: string
          updated_at?: string | null
          user_id: string
          votes?: Json | null
          votes_abstained?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          council_id?: string
          created_at?: string | null
          decided_at?: string | null
          description?: string | null
          domain?: string | null
          id?: string
          metadata?: Json | null
          quorum?: number | null
          resolution?: string | null
          status?: string | null
          topic?: string
          updated_at?: string | null
          user_id?: string
          votes?: Json | null
          votes_abstained?: number | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          name: string
          phone: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name: string
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          created_at: string | null
          customer_id: string | null
          expected_close_date: string | null
          id: string
          metadata: Json | null
          name: string
          probability: number | null
          stage: string | null
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          metadata?: Json | null
          name: string
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          expected_close_date?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          probability?: number | null
          stage?: string | null
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      device_statuses: {
        Row: {
          connectivity: string | null
          cpu_pct: number | null
          created_at: string | null
          device_id: string
          device_name: string
          device_type: string | null
          disk_pct: number | null
          health: string | null
          id: string
          issues: Json | null
          last_heartbeat: string | null
          memory_pct: number | null
          metadata: Json | null
          os_version: string | null
          updated_at: string | null
          uptime_seconds: number | null
          user_id: string
        }
        Insert: {
          connectivity?: string | null
          cpu_pct?: number | null
          created_at?: string | null
          device_id: string
          device_name: string
          device_type?: string | null
          disk_pct?: number | null
          health?: string | null
          id?: string
          issues?: Json | null
          last_heartbeat?: string | null
          memory_pct?: number | null
          metadata?: Json | null
          os_version?: string | null
          updated_at?: string | null
          uptime_seconds?: number | null
          user_id: string
        }
        Update: {
          connectivity?: string | null
          cpu_pct?: number | null
          created_at?: string | null
          device_id?: string
          device_name?: string
          device_type?: string | null
          disk_pct?: number | null
          health?: string | null
          id?: string
          issues?: Json | null
          last_heartbeat?: string | null
          memory_pct?: number | null
          metadata?: Json | null
          os_version?: string | null
          updated_at?: string | null
          uptime_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      encrypted_secrets: {
        Row: {
          algorithm: string | null
          created_at: string | null
          domain: string | null
          encrypted_value: string
          expires_at: string | null
          id: string
          iv: string | null
          key_name: string
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          algorithm?: string | null
          created_at?: string | null
          domain?: string | null
          encrypted_value: string
          expires_at?: string | null
          id?: string
          iv?: string | null
          key_name: string
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          algorithm?: string | null
          created_at?: string | null
          domain?: string | null
          encrypted_value?: string
          expires_at?: string | null
          id?: string
          iv?: string | null
          key_name?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          correlation_id: string | null
          created_at: string | null
          domain: string | null
          entity_id: string | null
          event_type: string
          id: string
          metadata: Json | null
          payload: Json | null
          source: string | null
          user_id: string
        }
        Insert: {
          correlation_id?: string | null
          created_at?: string | null
          domain?: string | null
          entity_id?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          payload?: Json | null
          source?: string | null
          user_id: string
        }
        Update: {
          correlation_id?: string | null
          created_at?: string | null
          domain?: string | null
          entity_id?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          payload?: Json | null
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      execution_envelopes: {
        Row: {
          approved_by: string | null
          capability_id: string
          created_at: string | null
          id: string
          intent: Json | null
          metadata: Json | null
          result: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_by?: string | null
          capability_id: string
          created_at?: string | null
          id?: string
          intent?: Json | null
          metadata?: Json | null
          result?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_by?: string | null
          capability_id?: string
          created_at?: string | null
          id?: string
          intent?: Json | null
          metadata?: Json | null
          result?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      file_metadata: {
        Row: {
          created_at: string | null
          domain: string | null
          extracted_data: Json | null
          filename: string
          id: string
          metadata: Json | null
          mime_type: string | null
          size_bytes: number | null
          status: string | null
          storage_path: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          extracted_data?: Json | null
          filename: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          size_bytes?: number | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
          extracted_data?: Json | null
          filename?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          size_bytes?: number | null
          status?: string | null
          storage_path?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_documents: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          document_type: string
          extracted_data: Json | null
          file_path: string | null
          id: string
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          document_type: string
          extracted_data?: Json | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          document_type?: string
          extracted_data?: Json | null
          file_path?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          status: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
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
          accepted: boolean
          accepted_at: string | null
          context: Json | null
          created_at: string
          domain: string
          expires_at: string
          from_advisor: string | null
          from_surface: string
          id: string
          memory_keys: string[] | null
          priority: string
          to_advisor: string | null
          to_surface: string
          unresolved_items: string[] | null
          user_id: string
        }
        Insert: {
          accepted?: boolean
          accepted_at?: string | null
          context?: Json | null
          created_at?: string
          domain: string
          expires_at: string
          from_advisor?: string | null
          from_surface: string
          id?: string
          memory_keys?: string[] | null
          priority?: string
          to_advisor?: string | null
          to_surface: string
          unresolved_items?: string[] | null
          user_id: string
        }
        Update: {
          accepted?: boolean
          accepted_at?: string | null
          context?: Json | null
          created_at?: string
          domain?: string
          expires_at?: string
          from_advisor?: string | null
          from_surface?: string
          id?: string
          memory_keys?: string[] | null
          priority?: string
          to_advisor?: string | null
          to_surface?: string
          unresolved_items?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      household_tasks: {
        Row: {
          assignee: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          frequency: string | null
          id: string
          metadata: Json | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          frequency?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignee?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          frequency?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          acknowledged_at: string | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          impact: string | null
          metadata: Json | null
          resolved_at: string | null
          root_cause: string | null
          services_affected: string[] | null
          severity: string
          status: string | null
          timeline: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          root_cause?: string | null
          services_affected?: string[] | null
          severity?: string
          status?: string | null
          timeline?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          metadata?: Json | null
          resolved_at?: string | null
          root_cause?: string | null
          services_affected?: string[] | null
          severity?: string
          status?: string | null
          timeline?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          currency: string | null
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          line_items: Json | null
          metadata: Json | null
          paid_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          metadata?: Json | null
          paid_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          line_items?: Json | null
          metadata?: Json | null
          paid_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          name: string
          phone: string | null
          score: number | null
          source: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name: string
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          phone?: string | null
          score?: number | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      metrics_snapshots: {
        Row: {
          created_at: string
          domain: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          recorded_at: string
          tags: Json | null
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type?: string
          recorded_at?: string
          tags?: Json | null
          user_id: string
          value?: number
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          recorded_at?: string
          tags?: Json | null
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          category: string
          channel: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          read_at: string | null
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
          channel?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
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
          channel?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string
          urgency?: string | null
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
      opportunities: {
        Row: {
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          metadata: Json | null
          probability: number | null
          stage: string | null
          title: string
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          probability?: number | null
          stage?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          probability?: number | null
          stage?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          actions: Json | null
          active: boolean | null
          approval_required: boolean | null
          category: string
          conditions: Json | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json | null
          active?: boolean | null
          approval_required?: boolean | null
          category: string
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json | null
          active?: boolean | null
          approval_required?: boolean | null
          category?: string
          conditions?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          locale: string | null
          metadata: Json | null
          onboarding_completed: boolean | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          locale?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          locale?: string | null
          metadata?: Json | null
          onboarding_completed?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projections: {
        Row: {
          data: Json | null
          domain: string
          generated_at: string | null
          id: string
          metadata: Json | null
          type: string
          user_id: string
        }
        Insert: {
          data?: Json | null
          domain: string
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          type: string
          user_id: string
        }
        Update: {
          data?: Json | null
          domain?: string
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      proof_records: {
        Row: {
          action: string
          actor: string
          created_at: string | null
          domain: string | null
          entity_id: string | null
          evidence: Json | null
          hash: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          actor: string
          created_at?: string | null
          domain?: string | null
          entity_id?: string | null
          evidence?: Json | null
          hash?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          actor?: string
          created_at?: string | null
          domain?: string | null
          entity_id?: string | null
          evidence?: Json | null
          hash?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_id: string | null
          id: string
          line_items: Json | null
          metadata: Json | null
          opportunity_id: string | null
          status: string | null
          title: string
          total_cents: number | null
          updated_at: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          line_items?: Json | null
          metadata?: Json | null
          opportunity_id?: string | null
          status?: string | null
          title: string
          total_cents?: number | null
          updated_at?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          id?: string
          line_items?: Json | null
          metadata?: Json | null
          opportunity_id?: string | null
          status?: string | null
          title?: string
          total_cents?: number | null
          updated_at?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string | null
          domain: string | null
          entity_id: string | null
          hash: string | null
          id: string
          payload: Json | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          domain?: string | null
          entity_id?: string | null
          hash?: string | null
          id?: string
          payload?: Json | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          domain?: string | null
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
          created_at: string | null
          currency: string | null
          current_cents: number | null
          id: string
          metadata: Json | null
          name: string
          purpose: string | null
          target_cents: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_cents?: number | null
          id?: string
          metadata?: Json | null
          name: string
          purpose?: string | null
          target_cents?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_cents?: number | null
          id?: string
          metadata?: Json | null
          name?: string
          purpose?: string | null
          target_cents?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      setup_sessions: {
        Row: {
          branch_path: string
          completed_at: string | null
          completion_pct: number
          created_at: string
          current_phase: string
          device_id: string
          id: string
          interrupted: boolean
          interruption_reason: string | null
          session_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          branch_path?: string
          completed_at?: string | null
          completion_pct?: number
          created_at?: string
          current_phase?: string
          device_id: string
          id: string
          interrupted?: boolean
          interruption_reason?: string | null
          session_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          branch_path?: string
          completed_at?: string | null
          completion_pct?: number
          created_at?: string
          current_phase?: string
          device_id?: string
          id?: string
          interrupted?: boolean
          interruption_reason?: string | null
          session_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sovereign_exports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          domain: string | null
          expires_at: string | null
          export_type: string
          file_path: string | null
          file_size_bytes: number | null
          format: string | null
          id: string
          metadata: Json | null
          record_count: number | null
          requested_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          domain?: string | null
          expires_at?: string | null
          export_type: string
          file_path?: string | null
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          metadata?: Json | null
          record_count?: number | null
          requested_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          domain?: string | null
          expires_at?: string | null
          export_type?: string
          file_path?: string | null
          file_size_bytes?: number | null
          format?: string | null
          id?: string
          metadata?: Json | null
          record_count?: number | null
          requested_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number | null
          billing_cycle: string | null
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          name: string
          next_billing_date: string | null
          provider: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          name: string
          next_billing_date?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          billing_cycle?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          next_billing_date?: string | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          connector_id: string
          error: string | null
          id: string
          metadata: Json | null
          records_synced: number | null
          status: string | null
          synced_at: string | null
          user_id: string
        }
        Insert: {
          connector_id: string
          error?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          status?: string | null
          synced_at?: string | null
          user_id: string
        }
        Update: {
          connector_id?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          records_synced?: number | null
          status?: string | null
          synced_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tenant_firewall_logs: {
        Row: {
          action: string
          blocked: boolean | null
          created_at: string | null
          id: string
          metadata: Json | null
          rule_matched: string | null
          source_ip: string | null
          user_id: string
        }
        Insert: {
          action: string
          blocked?: boolean | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rule_matched?: string | null
          source_ip?: string | null
          user_id: string
        }
        Update: {
          action?: string
          blocked?: boolean | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          rule_matched?: string | null
          source_ip?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trust_state: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          score: number | null
          trust_level: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          score?: number | null
          trust_level?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          score?: number | null
          trust_level?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      trust_state_events: {
        Row: {
          created_at: string | null
          delta: number | null
          entity_id: string
          event_type: string
          id: string
          metadata: Json | null
          reason: string | null
          source: string | null
          trust_score_after: number | null
          trust_score_before: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          delta?: number | null
          entity_id: string
          event_type: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          source?: string | null
          trust_score_after?: number | null
          trust_score_before?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          delta?: number | null
          entity_id?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          source?: string | null
          trust_score_after?: number | null
          trust_score_before?: number | null
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          category: string
          confidence: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          metadata: Json | null
          source: string | null
          updated_at: string | null
          user_id: string
          value: Json
        }
        Insert: {
          category: string
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
          user_id: string
          value: Json
        }
        Update: {
          category?: string
          confidence?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          metadata?: Json | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          error: string | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string | null
          step_results: Json | null
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          step_results?: Json | null
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          error?: string | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string | null
          step_results?: Json | null
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: []
      }
      workflow_steps: {
        Row: {
          completed_at: string | null
          config: Json | null
          created_at: string | null
          error: string | null
          id: string
          input_data: Json | null
          output_data: Json | null
          run_id: string | null
          started_at: string | null
          status: string | null
          step_index: number | null
          step_type: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          error?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          run_id?: string | null
          started_at?: string | null
          status?: string | null
          step_index?: number | null
          step_type: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          error?: string | null
          id?: string
          input_data?: Json | null
          output_data?: Json | null
          run_id?: string | null
          started_at?: string | null
          status?: string | null
          step_index?: number | null
          step_type?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          metadata: Json | null
          name: string
          steps: Json | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name: string
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metadata?: Json | null
          name?: string
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
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
