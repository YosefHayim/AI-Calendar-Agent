export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      calendars_users: {
        Row: {
          access_token: string | null
          created_at: string
          email: string | null
          expiry_date: string | null
          id: number
          id_token: string | null
          is_active: boolean | null
          refresh_expiry: string | null
          refresh_token: string | null
          scopes: Json | null
          token_type: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expiry_date?: string | null
          id?: number
          id_token?: string | null
          is_active?: boolean | null
          refresh_expiry?: string | null
          refresh_token?: string | null
          scopes?: Json | null
          token_type?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          email?: string | null
          expiry_date?: string | null
          id?: number
          id_token?: string | null
          is_active?: boolean | null
          refresh_expiry?: string | null
          refresh_token?: string | null
          scopes?: Json | null
          token_type?: string | null
        }
        Relationships: []
      }
      conversation_stats: {
        Row: {
          agent_model: string | null
          agent_tokens: number | null
          conversation_json: Json | null
          id: number
          total_messages: number | null
          total_tokens: number | null
          user_id: number | null
          user_tokens: number | null
        }
        Insert: {
          agent_model?: string | null
          agent_tokens?: number | null
          conversation_json?: Json | null
          id?: number
          total_messages?: number | null
          total_tokens?: number | null
          user_id?: number | null
          user_tokens?: number | null
        }
        Update: {
          agent_model?: string | null
          agent_tokens?: number | null
          conversation_json?: Json | null
          id?: number
          total_messages?: number | null
          total_tokens?: number | null
          user_id?: number | null
          user_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "calendars_users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_bots: {
        Row: {
          bot_access_token: string | null
          created_at: string
          id: number
          is_active: boolean | null
          user_id: number | null
        }
        Insert: {
          bot_access_token?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          user_id?: number | null
        }
        Update: {
          bot_access_token?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_bots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "calendars_users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_users: {
        Row: {
          created_at: string
          first_name: string | null
          id: number
          language_code: string | null
          telegram_id: number | null
          user_id: number | null
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: number
          language_code?: string | null
          telegram_id?: number | null
          user_id?: number | null
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: number
          language_code?: string | null
          telegram_id?: number | null
          user_id?: number | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telegram_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "calendars_users"
            referencedColumns: ["id"]
          },
        ]
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
