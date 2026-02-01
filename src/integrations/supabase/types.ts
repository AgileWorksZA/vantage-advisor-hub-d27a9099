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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          advisor: string | null
          cell_number: string | null
          client_type: string
          country_of_issue: string | null
          created_at: string
          date_of_birth: string | null
          disability_type: string | null
          email: string | null
          employer: string | null
          facebook: string | null
          fax_number: string | null
          first_name: string
          gender: string | null
          home_number: string | null
          id: string
          id_number: string | null
          industry: string | null
          initials: string | null
          is_hybrid_client: boolean | null
          is_professional: boolean | null
          is_smoker: boolean | null
          language: string | null
          linkedin: string | null
          nationality: string | null
          occupation: string | null
          otp_delivery_method: string | null
          passport_number: string | null
          person_type: string | null
          postal_address: Json | null
          preferred_contact: string | null
          preferred_email: string | null
          preferred_name: string | null
          preferred_phone: string | null
          profession: string | null
          profile_state: string
          profile_type: string
          race: string | null
          rating: number | null
          relationship: string | null
          religion: string | null
          residential_address: Json | null
          skype: string | null
          sports_interests: string[] | null
          surname: string
          tax_number: string | null
          tax_resident_country: string | null
          title: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          wealth_manager: string | null
          website: string | null
          work_email: string | null
          work_extension: string | null
          work_number: string | null
          youtube: string | null
        }
        Insert: {
          advisor?: string | null
          cell_number?: string | null
          client_type?: string
          country_of_issue?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_type?: string | null
          email?: string | null
          employer?: string | null
          facebook?: string | null
          fax_number?: string | null
          first_name: string
          gender?: string | null
          home_number?: string | null
          id?: string
          id_number?: string | null
          industry?: string | null
          initials?: string | null
          is_hybrid_client?: boolean | null
          is_professional?: boolean | null
          is_smoker?: boolean | null
          language?: string | null
          linkedin?: string | null
          nationality?: string | null
          occupation?: string | null
          otp_delivery_method?: string | null
          passport_number?: string | null
          person_type?: string | null
          postal_address?: Json | null
          preferred_contact?: string | null
          preferred_email?: string | null
          preferred_name?: string | null
          preferred_phone?: string | null
          profession?: string | null
          profile_state?: string
          profile_type?: string
          race?: string | null
          rating?: number | null
          relationship?: string | null
          religion?: string | null
          residential_address?: Json | null
          skype?: string | null
          sports_interests?: string[] | null
          surname: string
          tax_number?: string | null
          tax_resident_country?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          wealth_manager?: string | null
          website?: string | null
          work_email?: string | null
          work_extension?: string | null
          work_number?: string | null
          youtube?: string | null
        }
        Update: {
          advisor?: string | null
          cell_number?: string | null
          client_type?: string
          country_of_issue?: string | null
          created_at?: string
          date_of_birth?: string | null
          disability_type?: string | null
          email?: string | null
          employer?: string | null
          facebook?: string | null
          fax_number?: string | null
          first_name?: string
          gender?: string | null
          home_number?: string | null
          id?: string
          id_number?: string | null
          industry?: string | null
          initials?: string | null
          is_hybrid_client?: boolean | null
          is_professional?: boolean | null
          is_smoker?: boolean | null
          language?: string | null
          linkedin?: string | null
          nationality?: string | null
          occupation?: string | null
          otp_delivery_method?: string | null
          passport_number?: string | null
          person_type?: string | null
          postal_address?: Json | null
          preferred_contact?: string | null
          preferred_email?: string | null
          preferred_name?: string | null
          preferred_phone?: string | null
          profession?: string | null
          profile_state?: string
          profile_type?: string
          race?: string | null
          rating?: number | null
          relationship?: string | null
          religion?: string | null
          residential_address?: Json | null
          skype?: string | null
          sports_interests?: string[] | null
          surname?: string
          tax_number?: string | null
          tax_resident_country?: string | null
          title?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          wealth_manager?: string | null
          website?: string | null
          work_email?: string | null
          work_extension?: string | null
          work_number?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          first_name: string
          id: string
          surname: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          first_name: string
          id?: string
          surname: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          first_name?: string
          id?: string
          surname?: string
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
