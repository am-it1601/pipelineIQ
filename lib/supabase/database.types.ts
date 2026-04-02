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
      lead_logs: {
        Row: {
          assigned_to_id: string | null
          bid_type: string
          connects_used: number
          created_at: string | null
          created_by_user_id: string | null
          date: string
          engagement_type: string
          estimated_hours: number | null
          hourly_rate: number | null
          id: string
          is_hot: boolean | null
          lead_source: string
          profile_used_id: string | null
          project_title: string
          proposal_value: number
          remarks: string | null
          status: string
          updated_at: string | null
          updated_by_user_id: string | null
          upwork_link: string | null
        }
        Insert: {
          assigned_to_id?: string | null
          bid_type: string
          connects_used?: number
          created_at?: string | null
          created_by_user_id?: string | null
          date: string
          engagement_type: string
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          is_hot?: boolean | null
          lead_source: string
          profile_used_id?: string | null
          project_title: string
          proposal_value: number
          remarks?: string | null
          status: string
          updated_at?: string | null
          updated_by_user_id?: string | null
          upwork_link?: string | null
        }
        Update: {
          assigned_to_id?: string | null
          bid_type?: string
          connects_used?: number
          created_at?: string | null
          created_by_user_id?: string | null
          date?: string
          engagement_type?: string
          estimated_hours?: number | null
          hourly_rate?: number | null
          id?: string
          is_hot?: boolean | null
          lead_source?: string
          profile_used_id?: string | null
          project_title?: string
          proposal_value?: number
          remarks?: string | null
          status?: string
          updated_at?: string | null
          updated_by_user_id?: string | null
          upwork_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_logs_profile_used_id_fkey"
            columns: ["profile_used_id"]
            isOneToOne: false
            referencedRelation: "upwork_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bd_members: {
        Row: {
          id: string
          full_name: string
          email: string
          status: string | null
          monthly_target: number | null
          incentive_eligible: boolean | null
          join_date: string | null
          avatar_initials: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          status?: string | null
          monthly_target?: number | null
          incentive_eligible?: boolean | null
          join_date?: string | null
          avatar_initials?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          status?: string | null
          monthly_target?: number | null
          incentive_eligible?: boolean | null
          join_date?: string | null
          avatar_initials?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_initials: string
          bd_member_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          incentive_eligible: boolean | null
          join_date: string | null
          monthly_target: number | null
          role: string
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_initials?: string
          bd_member_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          incentive_eligible?: boolean | null
          join_date?: string | null
          monthly_target?: number | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_initials?: string
          bd_member_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          incentive_eligible?: boolean | null
          join_date?: string | null
          monthly_target?: number | null
          role?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      upwork_profiles: {
        Row: {
          created_at: string | null
          focus_area: string | null
          id: string
          profile_link: string | null
          profile_name: string
          skill_tags: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          focus_area?: string | null
          id?: string
          profile_link?: string | null
          profile_name: string
          skill_tags?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          focus_area?: string | null
          id?: string
          profile_link?: string | null
          profile_name?: string
          skill_tags?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
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
