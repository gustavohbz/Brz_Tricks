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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
        }
        Relationships: []
      }
      pista_comentarios: {
        Row: {
          autor_avatar: string | null
          autor_nome: string | null
          created_at: string
          id: string
          nota: number
          pista_id: string
          texto: string
          user_id: string
        }
        Insert: {
          autor_avatar?: string | null
          autor_nome?: string | null
          created_at?: string
          id?: string
          nota?: number
          pista_id: string
          texto: string
          user_id: string
        }
        Update: {
          autor_avatar?: string | null
          autor_nome?: string | null
          created_at?: string
          id?: string
          nota?: number
          pista_id?: string
          texto?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pista_comentarios_pista_id_fkey"
            columns: ["pista_id"]
            isOneToOne: false
            referencedRelation: "pistas"
            referencedColumns: ["id"]
          },
        ]
      }
      pistas: {
        Row: {
          cidade: string
          created_at: string
          descricao: string | null
          endereco: string | null
          estado: string
          id: string
          lat: number
          lng: number
          nivel: Database["public"]["Enums"]["pista_nivel"]
          nome: string
          piso: string | null
          tamanho_m2: number | null
        }
        Insert: {
          cidade: string
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estado: string
          id?: string
          lat: number
          lng: number
          nivel?: Database["public"]["Enums"]["pista_nivel"]
          nome: string
          piso?: string | null
          tamanho_m2?: number | null
        }
        Update: {
          cidade?: string
          created_at?: string
          descricao?: string | null
          endereco?: string | null
          estado?: string
          id?: string
          lat?: number
          lng?: number
          nivel?: Database["public"]["Enums"]["pista_nivel"]
          nome?: string
          piso?: string | null
          tamanho_m2?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          condition: string
          created_at: string
          deleted_at: string | null
          description: string
          id: string
          name: string
          photos: string[]
          pickup_location: string
          price_cents: number
          updated_at: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          condition: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          name: string
          photos: string[]
          pickup_location: string
          price_cents: number
          updated_at?: string
          user_id: string
          whatsapp: string
        }
        Update: {
          condition?: string
          created_at?: string
          deleted_at?: string | null
          description?: string
          id?: string
          name?: string
          photos?: string[]
          pickup_location?: string
          price_cents?: number
          updated_at?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bearing: string | null
          created_at: string
          display_name: string | null
          id: string
          is_public: boolean
          plan: Json
          shape: string | null
          share_slug: string
          truck: string | null
          updated_at: string
          wheel: string | null
        }
        Insert: {
          avatar_url?: string | null
          bearing?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_public?: boolean
          plan?: Json
          shape?: string | null
          share_slug?: string
          truck?: string | null
          updated_at?: string
          wheel?: string | null
        }
        Update: {
          avatar_url?: string | null
          bearing?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          plan?: Json
          shape?: string | null
          share_slug?: string
          truck?: string | null
          updated_at?: string
          wheel?: string | null
        }
        Relationships: []
      }
      skaters: {
        Row: {
          bio: string
          created_at: string
          home_park: string
          id: string
          instagram: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string
          created_at?: string
          home_park: string
          id?: string
          instagram?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          created_at?: string
          home_park?: string
          id?: string
          instagram?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_active_subscription: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      product_photo_attached: { Args: { _path: string }; Returns: boolean }
      soft_delete_product: { Args: { _id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      pista_nivel: "iniciante" | "intermediario" | "avancado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      pista_nivel: ["iniciante", "intermediario", "avancado"],
    },
  },
} as const
