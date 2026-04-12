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
      [_ in never]: never
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
