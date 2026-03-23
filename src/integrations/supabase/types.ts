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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cycles: {
        Row: {
          avg_shell_ratio: number
          avg_weight_per_wet_cocoon: number
          created_at: string
          current_day_of_cycle: number | null
          cycle_duration_days: number | null
          cycle_number: number
          defective_cocoon_weight_kg: number | null
          dried_cocoon_weight_kg: number | null
          estimated_starting_egg_count: number
          final_larvae_weight: number
          hatch_date: string
          hatch_rate_percent: number | null
          hatched_eggs: number
          id: string
          instars: Json | null
          mortality_cocooning: number
          mortality_pre_cocooning: number
          percent_non_defective: number
          reeled_silk_weight_kg: number | null
          status: string
          total_eggs: number | null
          total_harvested_wet_cocoon_weight: number
          total_leaf_weight_fed: number
          updated_at: string
          wet_cocoon_target: number | null
        }
        Insert: {
          avg_shell_ratio?: number
          avg_weight_per_wet_cocoon?: number
          created_at?: string
          current_day_of_cycle?: number | null
          cycle_duration_days?: number | null
          cycle_number: number
          defective_cocoon_weight_kg?: number | null
          dried_cocoon_weight_kg?: number | null
          estimated_starting_egg_count?: number
          final_larvae_weight?: number
          hatch_date: string
          hatch_rate_percent?: number | null
          hatched_eggs?: number
          id?: string
          instars?: Json | null
          mortality_cocooning?: number
          mortality_pre_cocooning?: number
          percent_non_defective?: number
          reeled_silk_weight_kg?: number | null
          status?: string
          total_eggs?: number | null
          total_harvested_wet_cocoon_weight?: number
          total_leaf_weight_fed?: number
          updated_at?: string
          wet_cocoon_target?: number | null
        }
        Update: {
          avg_shell_ratio?: number
          avg_weight_per_wet_cocoon?: number
          created_at?: string
          current_day_of_cycle?: number | null
          cycle_duration_days?: number | null
          cycle_number?: number
          defective_cocoon_weight_kg?: number | null
          dried_cocoon_weight_kg?: number | null
          estimated_starting_egg_count?: number
          final_larvae_weight?: number
          hatch_date?: string
          hatch_rate_percent?: number | null
          hatched_eggs?: number
          id?: string
          instars?: Json | null
          mortality_cocooning?: number
          mortality_pre_cocooning?: number
          percent_non_defective?: number
          reeled_silk_weight_kg?: number | null
          status?: string
          total_eggs?: number | null
          total_harvested_wet_cocoon_weight?: number
          total_leaf_weight_fed?: number
          updated_at?: string
          wet_cocoon_target?: number | null
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          avg_shell_ratio: number
          avg_weight_per_wet_cocoon: number
          created_at: string
          cycle_id: string
          cycle_number: number
          date: string
          estimated_starting_egg_count: number
          final_larvae_weight: number
          hatched_eggs: number
          id: string
          mortality_cocooning: number
          mortality_pre_cocooning: number
          percent_non_defective: number
          total_harvested_wet_cocoon_weight: number
          total_leaf_weight_fed: number
          updated_at: string
        }
        Insert: {
          avg_shell_ratio?: number
          avg_weight_per_wet_cocoon?: number
          created_at?: string
          cycle_id: string
          cycle_number: number
          date: string
          estimated_starting_egg_count?: number
          final_larvae_weight?: number
          hatched_eggs?: number
          id?: string
          mortality_cocooning?: number
          mortality_pre_cocooning?: number
          percent_non_defective?: number
          total_harvested_wet_cocoon_weight?: number
          total_leaf_weight_fed?: number
          updated_at?: string
        }
        Update: {
          avg_shell_ratio?: number
          avg_weight_per_wet_cocoon?: number
          created_at?: string
          cycle_id?: string
          cycle_number?: number
          date?: string
          estimated_starting_egg_count?: number
          final_larvae_weight?: number
          hatched_eggs?: number
          id?: string
          mortality_cocooning?: number
          mortality_pre_cocooning?: number
          percent_non_defective?: number
          total_harvested_wet_cocoon_weight?: number
          total_leaf_weight_fed?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_logs_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          category: string
          created_at: string
          description: string
          email: string
          id: string
          name: string
          notes: string
          screenshot_url: string | null
          status: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          email: string
          id?: string
          name: string
          notes?: string
          screenshot_url?: string | null
          status?: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          email?: string
          id?: string
          name?: string
          notes?: string
          screenshot_url?: string | null
          status?: string
          ticket_id?: string
          updated_at?: string
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
