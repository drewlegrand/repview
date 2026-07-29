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
      commission_invoice_history: {
        Row: {
          change_type: string
          created_at: string
          field_name: string | null
          id: string
          invoice_id: string
          new_value: string | null
          old_value: string | null
          report_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          change_type: string
          created_at?: string
          field_name?: string | null
          id?: string
          invoice_id: string
          new_value?: string | null
          old_value?: string | null
          report_id?: string | null
          source?: string
          user_id: string
        }
        Update: {
          change_type?: string
          created_at?: string
          field_name?: string | null
          id?: string
          invoice_id?: string
          new_value?: string | null
          old_value?: string | null
          report_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_invoice_history_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "commission_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_invoice_history_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "commission_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_invoice_lines: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          id: string
          invoice_id: string
          line_type: string | null
          product_code: string | null
          product_name: string | null
          quantity: number | null
          report_id: string | null
          sales_amount: number | null
          unit_price: number | null
          user_id: string
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          invoice_id: string
          line_type?: string | null
          product_code?: string | null
          product_name?: string | null
          quantity?: number | null
          report_id?: string | null
          sales_amount?: number | null
          unit_price?: number | null
          user_id: string
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          invoice_id?: string
          line_type?: string | null
          product_code?: string | null
          product_name?: string | null
          quantity?: number | null
          report_id?: string | null
          sales_amount?: number | null
          unit_price?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "commission_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_invoice_lines_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "commission_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_invoices: {
        Row: {
          commission_amount: number
          commission_base: number
          commission_paid: boolean
          commission_rate: number | null
          created_at: string
          customer_name: string | null
          customer_number: string | null
          discrepancy_note: string | null
          document_type: string
          first_report_id: string | null
          id: string
          invoice_date: string | null
          invoice_number: string
          invoice_number_norm: string
          last_report_id: string | null
          manufacturer_id: string
          marked_received: boolean
          marked_received_at: string | null
          order_reference: string | null
          period_label: string | null
          project_name: string | null
          project_reference: string | null
          raw: Json | null
          sales_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_amount?: number
          commission_base?: number
          commission_paid?: boolean
          commission_rate?: number | null
          created_at?: string
          customer_name?: string | null
          customer_number?: string | null
          discrepancy_note?: string | null
          document_type?: string
          first_report_id?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          invoice_number_norm: string
          last_report_id?: string | null
          manufacturer_id: string
          marked_received?: boolean
          marked_received_at?: string | null
          order_reference?: string | null
          period_label?: string | null
          project_name?: string | null
          project_reference?: string | null
          raw?: Json | null
          sales_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_amount?: number
          commission_base?: number
          commission_paid?: boolean
          commission_rate?: number | null
          created_at?: string
          customer_name?: string | null
          customer_number?: string | null
          discrepancy_note?: string | null
          document_type?: string
          first_report_id?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          invoice_number_norm?: string
          last_report_id?: string | null
          manufacturer_id?: string
          marked_received?: boolean
          marked_received_at?: string | null
          order_reference?: string | null
          period_label?: string | null
          project_name?: string | null
          project_reference?: string | null
          raw?: Json | null
          sales_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_invoices_first_report_id_fkey"
            columns: ["first_report_id"]
            isOneToOne: false
            referencedRelation: "commission_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_invoices_last_report_id_fkey"
            columns: ["last_report_id"]
            isOneToOne: false
            referencedRelation: "commission_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_invoices_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_reports: {
        Row: {
          created_at: string
          detected_mapping: Json | null
          error_message: string | null
          file_name: string
          grain: string
          id: string
          manufacturer_id: string
          parsed_total_commission: number | null
          period_end: string | null
          period_label: string | null
          period_start: string | null
          reported_total_commission: number | null
          rows_changed: number
          rows_new: number
          rows_parsed: number
          rows_unchanged: number
          sheet_name: string | null
          status: string
          storage_path: string | null
          totals_match: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detected_mapping?: Json | null
          error_message?: string | null
          file_name: string
          grain?: string
          id?: string
          manufacturer_id: string
          parsed_total_commission?: number | null
          period_end?: string | null
          period_label?: string | null
          period_start?: string | null
          reported_total_commission?: number | null
          rows_changed?: number
          rows_new?: number
          rows_parsed?: number
          rows_unchanged?: number
          sheet_name?: string | null
          status?: string
          storage_path?: string | null
          totals_match?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detected_mapping?: Json | null
          error_message?: string | null
          file_name?: string
          grain?: string
          id?: string
          manufacturer_id?: string
          parsed_total_commission?: number | null
          period_end?: string | null
          period_label?: string | null
          period_start?: string | null
          reported_total_commission?: number | null
          rows_changed?: number
          rows_new?: number
          rows_parsed?: number
          rows_unchanged?: number
          sheet_name?: string | null
          status?: string
          storage_path?: string | null
          totals_match?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commission_reports_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          created_at: string
          default_commission_rate: number | null
          id: string
          mapping_profile: Json | null
          name: string
          notes: string | null
          slug: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_commission_rate?: number | null
          id?: string
          mapping_profile?: Json | null
          name: string
          notes?: string | null
          slug: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_commission_rate?: number | null
          id?: string
          mapping_profile?: Json | null
          name?: string
          notes?: string | null
          slug?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracked_orders: {
        Row: {
          created_at: string
          customer_name: string | null
          expected_commission: number | null
          id: string
          invoice_number: string
          invoice_number_norm: string
          manufacturer_id: string | null
          notes: string | null
          order_amount: number | null
          order_number: string | null
          project_name: string | null
          shipped: boolean
          shipped_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          expected_commission?: number | null
          id?: string
          invoice_number: string
          invoice_number_norm: string
          manufacturer_id?: string | null
          notes?: string | null
          order_amount?: number | null
          order_number?: string | null
          project_name?: string | null
          shipped?: boolean
          shipped_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          expected_commission?: number | null
          id?: string
          invoice_number?: string
          invoice_number_norm?: string
          manufacturer_id?: string | null
          notes?: string | null
          order_amount?: number | null
          order_number?: string | null
          project_name?: string | null
          shipped?: boolean
          shipped_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracked_orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
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
