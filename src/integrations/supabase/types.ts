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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_communication_settings: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          provider: string | null
          settings: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string | null
          settings?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string | null
          settings?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_data_imports: {
        Row: {
          changed_by: string | null
          created_at: string | null
          deleted_at: string | null
          duration_seconds: number | null
          end_time: string | null
          error_message: string | null
          id: string
          import_name: string
          import_type: string
          is_deleted: boolean | null
          metadata: Json | null
          processed_items: number | null
          progress_percentage: number | null
          remaining_time_seconds: number | null
          source_reference: string | null
          start_time: string | null
          status: string
          total_items: number | null
          total_lines: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          import_name: string
          import_type: string
          is_deleted?: boolean | null
          metadata?: Json | null
          processed_items?: number | null
          progress_percentage?: number | null
          remaining_time_seconds?: number | null
          source_reference?: string | null
          start_time?: string | null
          status?: string
          total_items?: number | null
          total_lines?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          duration_seconds?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          import_name?: string
          import_type?: string
          is_deleted?: boolean | null
          metadata?: Json | null
          processed_items?: number | null
          progress_percentage?: number | null
          remaining_time_seconds?: number | null
          source_reference?: string | null
          start_time?: string | null
          status?: string
          total_items?: number | null
          total_lines?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_document_templates: {
        Row: {
          can_public_upload: boolean | null
          category: string
          code: string
          content_template: string | null
          created_at: string | null
          deleted_at: string | null
          has_content: boolean | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          name: string
          name_secondary: string | null
          requires_workflow_signature: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_public_upload?: boolean | null
          category: string
          code: string
          content_template?: string | null
          created_at?: string | null
          deleted_at?: string | null
          has_content?: boolean | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          name: string
          name_secondary?: string | null
          requires_workflow_signature?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_public_upload?: boolean | null
          category?: string
          code?: string
          content_template?: string | null
          created_at?: string | null
          deleted_at?: string | null
          has_content?: boolean | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          name?: string
          name_secondary?: string | null
          requires_workflow_signature?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_events: {
        Row: {
          actions: Json | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          module: string
          name: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          module: string
          name: string
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          module?: string
          name?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_funds: {
        Row: {
          asset_classes: number | null
          cat1_status: string | null
          cat2_status: string | null
          code: string | null
          created_at: string | null
          deleted_at: string | null
          domicile: string | null
          exchange: string | null
          fund_fact_sheet_url: string | null
          fund_manager: string | null
          fund_type: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          is_allocation_approved: boolean | null
          is_deleted: boolean | null
          isin: string | null
          location: string | null
          morningstar_id: string | null
          name: string
          sector: string | null
          source: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_classes?: number | null
          cat1_status?: string | null
          cat2_status?: string | null
          code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          domicile?: string | null
          exchange?: string | null
          fund_fact_sheet_url?: string | null
          fund_manager?: string | null
          fund_type?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_allocation_approved?: boolean | null
          is_deleted?: boolean | null
          isin?: string | null
          location?: string | null
          morningstar_id?: string | null
          name: string
          sector?: string | null
          source?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_classes?: number | null
          cat1_status?: string | null
          cat2_status?: string | null
          code?: string | null
          created_at?: string | null
          deleted_at?: string | null
          domicile?: string | null
          exchange?: string | null
          fund_fact_sheet_url?: string | null
          fund_manager?: string | null
          fund_type?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_allocation_approved?: boolean | null
          is_deleted?: boolean | null
          isin?: string | null
          location?: string | null
          morningstar_id?: string | null
          name?: string
          sector?: string | null
          source?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_general_lists: {
        Row: {
          code: string
          created_at: string | null
          deleted_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          list_type: string
          metadata: Json | null
          name: string
          name_secondary: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          list_type: string
          metadata?: Json | null
          name: string
          name_secondary?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          list_type?: string
          metadata?: Json | null
          name?: string
          name_secondary?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_note_subjects: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          item_count: number | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          item_count?: number | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          item_count?: number | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_product_benefits: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          display_order: number | null
          field_mapping: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          is_mapped: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          field_mapping?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_mapped?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          display_order?: number | null
          field_mapping?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          is_mapped?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      admin_system_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      advice_workflows: {
        Row: {
          adviser_id: string | null
          client_id: string
          created_at: string
          current_step: number
          date: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean
          name: string
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          adviser_id?: string | null
          client_id: string
          created_at?: string
          current_step?: number
          date?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          name: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          adviser_id?: string | null
          client_id?: string
          created_at?: string
          current_step?: number
          date?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "advice_workflows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      advisor_posts: {
        Row: {
          advisor_initials: string
          advisor_name: string
          comments_count: number
          content: string
          created_at: string
          id: string
          jurisdiction: string
          likes_count: number
          post_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_initials: string
          advisor_name: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          jurisdiction?: string
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_initials?: string
          advisor_name?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          jurisdiction?: string
          likes_count?: number
          post_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      bucket_allocations: {
        Row: {
          bucket_type: string
          created_at: string
          current_allocation: number
          id: string
          notes: string | null
          proposed_allocation: number
          recommended_amount: number
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          bucket_type: string
          created_at?: string
          current_allocation?: number
          id?: string
          notes?: string | null
          proposed_allocation?: number
          recommended_amount?: number
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          bucket_type?: string
          created_at?: string
          current_allocation?: number
          id?: string
          notes?: string | null
          proposed_allocation?: number
          recommended_amount?: number
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_allocations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "financial_planning_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          ai_prep_note: string | null
          all_day: boolean
          attendees: Json | null
          client_id: string | null
          color: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          end_time: string
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          id: string
          is_deleted: boolean
          is_recurring: boolean
          location: string | null
          recurrence_rule: string | null
          reminder_minutes: number | null
          start_time: string
          status: Database["public"]["Enums"]["calendar_event_status"]
          timezone: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prep_note?: string | null
          all_day?: boolean
          attendees?: Json | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_time: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          is_deleted?: boolean
          is_recurring?: boolean
          location?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          start_time: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          timezone?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prep_note?: string | null
          all_day?: boolean
          attendees?: Json | null
          client_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          end_time?: string
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          is_deleted?: boolean
          is_recurring?: boolean
          location?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          start_time?: string
          status?: Database["public"]["Enums"]["calendar_event_status"]
          timezone?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_attachments: {
        Row: {
          attachment_type: string
          campaign_id: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          user_id: string
        }
        Insert: {
          attachment_type: string
          campaign_id: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          user_id: string
        }
        Update: {
          attachment_type?: string
          campaign_id?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_attachments_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "communication_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assets: {
        Row: {
          asset_type: string
          client_id: string
          created_at: string
          current_value: number
          deleted_at: string | null
          growth_rate: number | null
          id: string
          is_deleted: boolean
          is_portal_visible: boolean
          linked_income_id: string | null
          linked_liability_id: string | null
          name: string
          notes: string | null
          purchase_date: string | null
          purchase_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: string
          client_id: string
          created_at?: string
          current_value?: number
          deleted_at?: string | null
          growth_rate?: number | null
          id?: string
          is_deleted?: boolean
          is_portal_visible?: boolean
          linked_income_id?: string | null
          linked_liability_id?: string | null
          name: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: string
          client_id?: string
          created_at?: string
          current_value?: number
          deleted_at?: string | null
          growth_rate?: number | null
          id?: string
          is_deleted?: boolean
          is_portal_visible?: boolean
          linked_income_id?: string | null
          linked_liability_id?: string | null
          name?: string
          notes?: string | null
          purchase_date?: string | null
          purchase_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_assets_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assets_linked_income_id_fkey"
            columns: ["linked_income_id"]
            isOneToOne: false
            referencedRelation: "client_income"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assets_linked_liability_id_fkey"
            columns: ["linked_liability_id"]
            isOneToOne: false
            referencedRelation: "client_liabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      client_contacts: {
        Row: {
          client_id: string
          company: string | null
          contact_type: string | null
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          is_deleted: boolean
          job_title: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          company?: string | null
          contact_type?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean
          job_title?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          company?: string | null
          contact_type?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          is_deleted?: boolean
          job_title?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_contacts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_expenses: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          deleted_at: string | null
          expense_category: string
          expense_type: string
          frequency: string
          id: string
          is_deleted: boolean
          is_essential: boolean
          is_portal_visible: boolean
          linked_liability_id: string | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id: string
          created_at?: string
          deleted_at?: string | null
          expense_category: string
          expense_type?: string
          frequency?: string
          id?: string
          is_deleted?: boolean
          is_essential?: boolean
          is_portal_visible?: boolean
          linked_liability_id?: string | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          expense_category?: string
          expense_type?: string
          frequency?: string
          id?: string
          is_deleted?: boolean
          is_essential?: boolean
          is_portal_visible?: boolean
          linked_liability_id?: string | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_expenses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_expenses_linked_liability_id_fkey"
            columns: ["linked_liability_id"]
            isOneToOne: false
            referencedRelation: "client_liabilities"
            referencedColumns: ["id"]
          },
        ]
      }
      client_goals: {
        Row: {
          client_id: string
          created_at: string
          current_funding: number
          deleted_at: string | null
          description: string | null
          funding_status: string
          goal_category: string
          goal_name: string
          id: string
          is_active: boolean
          is_deleted: boolean
          priority: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
          workflow_id: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          current_funding?: number
          deleted_at?: string | null
          description?: string | null
          funding_status?: string
          goal_category: string
          goal_name: string
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          priority?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id: string
          workflow_id?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          current_funding?: number
          deleted_at?: string | null
          description?: string | null
          funding_status?: string
          goal_category?: string
          goal_name?: string
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          priority?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_goals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_goals_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "financial_planning_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      client_income: {
        Row: {
          client_id: string
          created_at: string
          deleted_at: string | null
          end_date: string | null
          frequency: string
          gross_amount: number
          id: string
          income_type: string
          is_deleted: boolean
          is_portal_visible: boolean
          is_taxable: boolean
          linked_asset_id: string | null
          net_amount: number | null
          source_name: string
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          frequency?: string
          gross_amount?: number
          id?: string
          income_type: string
          is_deleted?: boolean
          is_portal_visible?: boolean
          is_taxable?: boolean
          linked_asset_id?: string | null
          net_amount?: number | null
          source_name: string
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          end_date?: string | null
          frequency?: string
          gross_amount?: number
          id?: string
          income_type?: string
          is_deleted?: boolean
          is_portal_visible?: boolean
          is_taxable?: boolean
          linked_asset_id?: string | null
          net_amount?: number | null
          source_name?: string
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_income_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_income_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "client_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      client_liabilities: {
        Row: {
          client_id: string
          created_at: string
          creditor_name: string | null
          current_balance: number
          deleted_at: string | null
          end_date: string | null
          id: string
          interest_rate: number | null
          is_deleted: boolean
          is_portal_visible: boolean
          liability_type: string
          linked_asset_id: string | null
          monthly_payment: number | null
          name: string
          original_amount: number
          start_date: string | null
          term_months: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          creditor_name?: string | null
          current_balance?: number
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          is_deleted?: boolean
          is_portal_visible?: boolean
          liability_type: string
          linked_asset_id?: string | null
          monthly_payment?: number | null
          name: string
          original_amount?: number
          start_date?: string | null
          term_months?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          creditor_name?: string | null
          current_balance?: number
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          interest_rate?: number | null
          is_deleted?: boolean
          is_portal_visible?: boolean
          liability_type?: string
          linked_asset_id?: string | null
          monthly_payment?: number | null
          name?: string
          original_amount?: number
          start_date?: string | null
          term_months?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_liabilities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_liabilities_linked_asset_id_fkey"
            columns: ["linked_asset_id"]
            isOneToOne: false
            referencedRelation: "client_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      client_notes: {
        Row: {
          attachment_count: number | null
          client_id: string
          completed_at: string | null
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          interaction_type: string
          is_complete: boolean
          is_deleted: boolean
          is_visible_portal: boolean
          owner_user_id: string | null
          priority: Database["public"]["Enums"]["task_priority"] | null
          responsible_user_id: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_count?: number | null
          client_id: string
          completed_at?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          interaction_type?: string
          is_complete?: boolean
          is_deleted?: boolean
          is_visible_portal?: boolean
          owner_user_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          responsible_user_id?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_count?: number | null
          client_id?: string
          completed_at?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          interaction_type?: string
          is_complete?: boolean
          is_deleted?: boolean
          is_visible_portal?: boolean
          owner_user_id?: string | null
          priority?: Database["public"]["Enums"]["task_priority"] | null
          responsible_user_id?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_products: {
        Row: {
          adviser_id: string | null
          client_id: string
          created_at: string
          created_by: string | null
          current_value: number | null
          deleted_at: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_deleted: boolean
          is_linked: boolean
          notes: string | null
          policy_number: string | null
          premium_amount: number | null
          product_id: string | null
          role: string
          start_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
          user_id: string
          value_updated_at: string | null
        }
        Insert: {
          adviser_id?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          deleted_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_deleted?: boolean
          is_linked?: boolean
          notes?: string | null
          policy_number?: string | null
          premium_amount?: number | null
          product_id?: string | null
          role?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id: string
          value_updated_at?: string | null
        }
        Update: {
          adviser_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          current_value?: number | null
          deleted_at?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_deleted?: boolean
          is_linked?: boolean
          notes?: string | null
          policy_number?: string | null
          premium_amount?: number | null
          product_id?: string | null
          role?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string
          value_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_products_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      client_relationships: {
        Row: {
          client_id: string
          created_at: string
          deleted_at: string | null
          entity_type: Database["public"]["Enums"]["entity_type"]
          family_name: string | null
          id: string
          id_type: string | null
          identification: string | null
          is_deleted: boolean
          name: string
          product_viewing_level: string | null
          related_client_id: string | null
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          share_percentage: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          deleted_at?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          family_name?: string | null
          id?: string
          id_type?: string | null
          identification?: string | null
          is_deleted?: boolean
          name: string
          product_viewing_level?: string | null
          related_client_id?: string | null
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          share_percentage?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          entity_type?: Database["public"]["Enums"]["entity_type"]
          family_name?: string | null
          id?: string
          id_type?: string | null
          identification?: string | null
          is_deleted?: boolean
          name?: string
          product_viewing_level?: string | null
          related_client_id?: string | null
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          share_percentage?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_relationships_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_relationships_related_client_id_fkey"
            columns: ["related_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      client_views: {
        Row: {
          client_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          client_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          client_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_views_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
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
          household_group: string | null
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
          household_group?: string | null
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
          household_group?: string | null
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
      commissions: {
        Row: {
          client_product_id: string | null
          created_at: string
          deleted_at: string | null
          discrepancy_notes: string | null
          expected_amount: number | null
          id: string
          is_deleted: boolean
          payment_date: string | null
          period_end: string | null
          period_start: string | null
          policy_reference: string | null
          provider_id: string | null
          received_amount: number | null
          reconciled_at: string | null
          reconciled_by: string | null
          status: Database["public"]["Enums"]["commission_status"]
          updated_at: string
          user_id: string
          variance_percentage: number | null
        }
        Insert: {
          client_product_id?: string | null
          created_at?: string
          deleted_at?: string | null
          discrepancy_notes?: string | null
          expected_amount?: number | null
          id?: string
          is_deleted?: boolean
          payment_date?: string | null
          period_end?: string | null
          period_start?: string | null
          policy_reference?: string | null
          provider_id?: string | null
          received_amount?: number | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
          user_id: string
          variance_percentage?: number | null
        }
        Update: {
          client_product_id?: string | null
          created_at?: string
          deleted_at?: string | null
          discrepancy_notes?: string | null
          expected_amount?: number | null
          id?: string
          is_deleted?: boolean
          payment_date?: string | null
          period_end?: string | null
          period_start?: string | null
          policy_reference?: string | null
          provider_id?: string | null
          received_amount?: number | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: Database["public"]["Enums"]["commission_status"]
          updated_at?: string
          user_id?: string
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_client_product_id_fkey"
            columns: ["client_product_id"]
            isOneToOne: false
            referencedRelation: "client_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "product_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_campaigns: {
        Row: {
          allow_duplicates: boolean
          attachment_types: string[]
          auto_note_completion: boolean
          body_html: string | null
          body_text: string | null
          campaign_type: string
          channel: string
          created_at: string
          deleted_at: string | null
          description: string | null
          failed_count: number
          from_primary_adviser: boolean
          from_team_member_id: string | null
          id: string
          importance: string
          is_deleted: boolean
          is_newsletter: boolean
          recipient_client_ids: string[]
          recipient_filter: Json
          request_read_receipt: boolean
          scheduled_at: string | null
          sent_at: string | null
          sent_count: number
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_duplicates?: boolean
          attachment_types?: string[]
          auto_note_completion?: boolean
          body_html?: string | null
          body_text?: string | null
          campaign_type?: string
          channel?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          failed_count?: number
          from_primary_adviser?: boolean
          from_team_member_id?: string | null
          id?: string
          importance?: string
          is_deleted?: boolean
          is_newsletter?: boolean
          recipient_client_ids?: string[]
          recipient_filter?: Json
          request_read_receipt?: boolean
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_duplicates?: boolean
          attachment_types?: string[]
          auto_note_completion?: boolean
          body_html?: string | null
          body_text?: string | null
          campaign_type?: string
          channel?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          failed_count?: number
          from_primary_adviser?: boolean
          from_team_member_id?: string | null
          id?: string
          importance?: string
          is_deleted?: boolean
          is_newsletter?: boolean
          recipient_client_ids?: string[]
          recipient_filter?: Json
          request_read_receipt?: boolean
          scheduled_at?: string | null
          sent_at?: string | null
          sent_count?: number
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_campaigns_from_team_member_id_fkey"
            columns: ["from_team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      communications: {
        Row: {
          channel: Database["public"]["Enums"]["communication_channel"]
          client_id: string
          content: string | null
          created_at: string
          deleted_at: string | null
          direction: string
          from_identifier: string | null
          id: string
          is_deleted: boolean
          sent_at: string | null
          status: string | null
          subject: string | null
          to_identifier: string | null
          user_id: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          client_id: string
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          direction?: string
          from_identifier?: string | null
          id?: string
          is_deleted?: boolean
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          to_identifier?: string | null
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["communication_channel"]
          client_id?: string
          content?: string | null
          created_at?: string
          deleted_at?: string | null
          direction?: string
          from_identifier?: string | null
          id?: string
          is_deleted?: boolean
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          to_identifier?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cpd_cycles: {
        Row: {
          created_at: string
          cycle_end: string
          cycle_start: string
          ethics_required: number
          id: string
          product_required: number
          professional_required: number
          regulatory_required: number
          status: Database["public"]["Enums"]["workflow_status"]
          total_hours_required: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_end: string
          cycle_start: string
          ethics_required?: number
          id?: string
          product_required?: number
          professional_required?: number
          regulatory_required?: number
          status?: Database["public"]["Enums"]["workflow_status"]
          total_hours_required?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_end?: string
          cycle_start?: string
          ethics_required?: number
          id?: string
          product_required?: number
          professional_required?: number
          regulatory_required?: number
          status?: Database["public"]["Enums"]["workflow_status"]
          total_hours_required?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cpd_records: {
        Row: {
          category: Database["public"]["Enums"]["cpd_category"]
          certificate_url: string | null
          completion_date: string
          course_name: string
          cpd_cycle_id: string | null
          created_at: string
          hours: number
          id: string
          provider: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          category: Database["public"]["Enums"]["cpd_category"]
          certificate_url?: string | null
          completion_date: string
          course_name: string
          cpd_cycle_id?: string | null
          created_at?: string
          hours: number
          id?: string
          provider?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          category?: Database["public"]["Enums"]["cpd_category"]
          certificate_url?: string | null
          completion_date?: string
          course_name?: string
          cpd_cycle_id?: string | null
          created_at?: string
          hours?: number
          id?: string
          provider?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cpd_records_cpd_cycle_id_fkey"
            columns: ["cpd_cycle_id"]
            isOneToOne: false
            referencedRelation: "cpd_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_message_attachments: {
        Row: {
          content_type: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "direct_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      direct_messages: {
        Row: {
          channel: string
          client_id: string | null
          content: string
          created_at: string
          deleted_at: string | null
          direction: string
          external_id: string | null
          id: string
          is_deleted: boolean
          media_url: string | null
          message_type: string
          poll_data: Json | null
          sent_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          client_id?: string | null
          content: string
          created_at?: string
          deleted_at?: string | null
          direction: string
          external_id?: string | null
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          message_type?: string
          poll_data?: Json | null
          sent_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          client_id?: string | null
          content?: string
          created_at?: string
          deleted_at?: string | null
          direction?: string
          external_id?: string | null
          id?: string
          is_deleted?: boolean
          media_url?: string | null
          message_type?: string
          poll_data?: Json | null
          sent_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          category: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          retention_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          retention_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          retention_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          approval_date: string | null
          approved_by: string | null
          client_id: string | null
          created_at: string
          deleted_at: string | null
          document_type_id: string | null
          expiry_date: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_deleted: boolean
          mime_type: string | null
          name: string
          product_id: string | null
          status: Database["public"]["Enums"]["document_status"]
          updated_at: string
          uploaded_by: string | null
          user_id: string
          version: number | null
          workflow_id: string | null
        }
        Insert: {
          approval_date?: string | null
          approved_by?: string | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          document_type_id?: string | null
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_deleted?: boolean
          mime_type?: string | null
          name: string
          product_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_by?: string | null
          user_id: string
          version?: number | null
          workflow_id?: string | null
        }
        Update: {
          approval_date?: string | null
          approved_by?: string | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          document_type_id?: string | null
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_deleted?: boolean
          mime_type?: string | null
          name?: string
          product_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          updated_at?: string
          uploaded_by?: string | null
          user_id?: string
          version?: number | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      email_attachments: {
        Row: {
          content_type: string | null
          created_at: string
          document_id: string | null
          email_id: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          user_id: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          document_id?: string | null
          email_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          user_id: string
        }
        Update: {
          content_type?: string | null
          created_at?: string
          document_id?: string | null
          email_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_attachments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_attachments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_clients: {
        Row: {
          client_id: string
          created_at: string
          email_id: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          email_id: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          email_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_clients_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string
          email_address: string
          fetch_mode: string
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          oauth_token: string | null
          provider: string
          settings: Json | null
          updated_at: string
          user_id: string
          whatsapp_api_token: string | null
          whatsapp_business_id: string | null
          whatsapp_is_active: boolean | null
          whatsapp_phone_number: string | null
        }
        Insert: {
          created_at?: string
          email_address: string
          fetch_mode?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          oauth_token?: string | null
          provider: string
          settings?: Json | null
          updated_at?: string
          user_id: string
          whatsapp_api_token?: string | null
          whatsapp_business_id?: string | null
          whatsapp_is_active?: boolean | null
          whatsapp_phone_number?: string | null
        }
        Update: {
          created_at?: string
          email_address?: string
          fetch_mode?: string
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          oauth_token?: string | null
          provider?: string
          settings?: Json | null
          updated_at?: string
          user_id?: string
          whatsapp_api_token?: string | null
          whatsapp_business_id?: string | null
          whatsapp_is_active?: boolean | null
          whatsapp_phone_number?: string | null
        }
        Relationships: []
      }
      email_tasks: {
        Row: {
          created_at: string | null
          email_id: string
          id: string
          is_linked: boolean | null
          task_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_id: string
          id?: string
          is_linked?: boolean | null
          task_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_id?: string
          id?: string
          is_linked?: boolean | null
          task_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_tasks_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_tasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      emails: {
        Row: {
          body_html: string | null
          body_preview: string | null
          cc_addresses: Json | null
          client_id: string | null
          created_at: string
          deleted_at: string | null
          direction: string
          external_id: string | null
          folder: Database["public"]["Enums"]["email_folder"]
          from_address: string
          has_attachments: boolean
          id: string
          is_deleted: boolean
          is_read: boolean
          received_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          to_addresses: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body_html?: string | null
          body_preview?: string | null
          cc_addresses?: Json | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          direction?: string
          external_id?: string | null
          folder?: Database["public"]["Enums"]["email_folder"]
          from_address: string
          has_attachments?: boolean
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          received_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          to_addresses?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body_html?: string | null
          body_preview?: string | null
          cc_addresses?: Json | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          direction?: string
          external_id?: string | null
          folder?: Database["public"]["Enums"]["email_folder"]
          from_address?: string
          has_attachments?: boolean
          id?: string
          is_deleted?: boolean
          is_read?: boolean
          received_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          to_addresses?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fais_controls: {
        Row: {
          client_id: string
          created_at: string
          current_step: number
          date: string | null
          deleted_at: string | null
          id: string
          is_deleted: boolean
          name: string
          products: Json | null
          status: Database["public"]["Enums"]["workflow_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          current_step?: number
          date?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          name: string
          products?: Json | null
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          current_step?: number
          date?: string | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          name?: string
          products?: Json | null
          status?: Database["public"]["Enums"]["workflow_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fais_controls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_planning_workflows: {
        Row: {
          adviser_id: string | null
          client_id: string
          completed_at: string | null
          created_at: string
          current_step: number
          deleted_at: string | null
          id: string
          is_deleted: boolean
          last_auto_save: string | null
          started_at: string
          status: string
          step_data: Json
          updated_at: string
          user_id: string
          workflow_name: string
        }
        Insert: {
          adviser_id?: string | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          last_auto_save?: string | null
          started_at?: string
          status?: string
          step_data?: Json
          updated_at?: string
          user_id: string
          workflow_name: string
        }
        Update: {
          adviser_id?: string | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          current_step?: number
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          last_auto_save?: string | null
          started_at?: string
          status?: string
          step_data?: Json
          updated_at?: string
          user_id?: string
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_planning_workflows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      fp_workflow_documents: {
        Row: {
          created_at: string
          deleted_at: string | null
          delivered_at: string | null
          delivery_status: string
          display_order: number
          document_name: string
          document_type: string
          id: string
          is_deleted: boolean
          is_selected: boolean
          sent_at: string | null
          signed_at: string | null
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_status?: string
          display_order?: number
          document_name: string
          document_type: string
          id?: string
          is_deleted?: boolean
          is_selected?: boolean
          sent_at?: string | null
          signed_at?: string | null
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          delivered_at?: string | null
          delivery_status?: string
          display_order?: number
          document_name?: string
          document_type?: string
          id?: string
          is_deleted?: boolean
          is_selected?: boolean
          sent_at?: string | null
          signed_at?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fp_workflow_documents_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "financial_planning_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_product_links: {
        Row: {
          allocation_percentage: number
          client_product_id: string
          created_at: string
          goal_id: string
          id: string
          link_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocation_percentage?: number
          client_product_id: string
          created_at?: string
          goal_id: string
          id?: string
          link_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocation_percentage?: number
          client_product_id?: string
          created_at?: string
          goal_id?: string
          id?: string
          link_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_product_links_client_product_id_fkey"
            columns: ["client_product_id"]
            isOneToOne: false
            referencedRelation: "client_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_product_links_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "client_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_recordings: {
        Row: {
          ai_action_items: Json | null
          ai_summary: Json | null
          calendar_event_id: string | null
          client_id: string | null
          created_at: string
          deleted_at: string | null
          duration_seconds: number | null
          id: string
          is_deleted: boolean
          recording_ended_at: string | null
          recording_started_at: string | null
          recording_url: string | null
          title: string
          transcription: string | null
          transcription_status: Database["public"]["Enums"]["transcription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_action_items?: Json | null
          ai_summary?: Json | null
          calendar_event_id?: string | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_deleted?: boolean
          recording_ended_at?: string | null
          recording_started_at?: string | null
          recording_url?: string | null
          title: string
          transcription?: string | null
          transcription_status?: Database["public"]["Enums"]["transcription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_action_items?: Json | null
          ai_summary?: Json | null
          calendar_event_id?: string | null
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          duration_seconds?: number | null
          id?: string
          is_deleted?: boolean
          recording_ended_at?: string | null
          recording_started_at?: string | null
          recording_url?: string | null
          title?: string
          transcription?: string | null
          transcription_status?: Database["public"]["Enums"]["transcription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_recordings_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_recordings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_dismissed: boolean
          is_read: boolean
          opportunity_tag: string | null
          task_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          opportunity_tag?: string | null
          task_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_dismissed?: boolean
          is_read?: boolean
          opportunity_tag?: string | null
          task_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_projects: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          is_deleted: boolean
          name: string
          project_type: string
          realized_revenue: number | null
          region_code: string
          sla_days: number | null
          status: string
          target_date: string | null
          target_revenue: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean
          name: string
          project_type?: string
          realized_revenue?: number | null
          region_code?: string
          sla_days?: number | null
          status?: string
          target_date?: string | null
          target_revenue?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_deleted?: boolean
          name?: string
          project_type?: string
          realized_revenue?: number | null
          region_code?: string
          sla_days?: number | null
          status?: string
          target_date?: string | null
          target_revenue?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          created_at: string
          current_value: number | null
          fee_percentage: number | null
          fund_name: string
          id: string
          percentage_allocation: number | null
          performance_12m: number | null
          portfolio_id: string
          product_id: string | null
          unit_price: number | null
          units: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          fee_percentage?: number | null
          fund_name: string
          id?: string
          percentage_allocation?: number | null
          performance_12m?: number | null
          portfolio_id: string
          product_id?: string | null
          unit_price?: number | null
          units?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          fee_percentage?: number | null
          fund_name?: string
          id?: string
          percentage_allocation?: number | null
          performance_12m?: number | null
          portfolio_id?: string
          product_id?: string | null
          unit_price?: number | null
          units?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_holdings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          benchmark: string | null
          client_id: string
          created_at: string
          created_by: string | null
          current_risk_score: number | null
          deleted_at: string | null
          id: string
          is_deleted: boolean
          last_valuation_date: string | null
          name: string
          portfolio_type: string
          status: Database["public"]["Enums"]["workflow_status"]
          target_risk_score: number | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          benchmark?: string | null
          client_id: string
          created_at?: string
          created_by?: string | null
          current_risk_score?: number | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          last_valuation_date?: string | null
          name: string
          portfolio_type?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          target_risk_score?: number | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          benchmark?: string | null
          client_id?: string
          created_at?: string
          created_by?: string | null
          current_risk_score?: number | null
          deleted_at?: string | null
          id?: string
          is_deleted?: boolean
          last_valuation_date?: string | null
          name?: string
          portfolio_type?: string
          status?: Database["public"]["Enums"]["workflow_status"]
          target_risk_score?: number | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_implementations: {
        Row: {
          approved_at: string | null
          client_product_id: string
          created_at: string
          deleted_at: string | null
          id: string
          implementation_status: string
          implementation_type: string
          is_deleted: boolean
          is_selected: boolean
          outstanding_requirements: Json
          submitted_at: string | null
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          approved_at?: string | null
          client_product_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          implementation_status?: string
          implementation_type?: string
          is_deleted?: boolean
          is_selected?: boolean
          outstanding_requirements?: Json
          submitted_at?: string | null
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          approved_at?: string | null
          client_product_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          implementation_status?: string
          implementation_type?: string
          is_deleted?: boolean
          is_selected?: boolean
          outstanding_requirements?: Json
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_implementations_client_product_id_fkey"
            columns: ["client_product_id"]
            isOneToOne: false
            referencedRelation: "client_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_implementations_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "financial_planning_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      product_providers: {
        Row: {
          astute_code: string | null
          auto_notify_changes: boolean | null
          cc_static_update: string | null
          code: string
          contact_email: string | null
          contact_phone: string | null
          contract_padding: number | null
          country: string | null
          created_at: string
          deleted_at: string | null
          disable_manual_contract_update: boolean | null
          email_legal: string | null
          exclude_from_aging: boolean | null
          fax_number_legal: string | null
          id: string
          is_active: boolean
          is_approved: boolean | null
          is_deleted: boolean | null
          is_hidden: boolean | null
          is_umbrella_provider: boolean | null
          name: string
          portal_url: string | null
          postal_address: Json | null
          provider_type: string
          residential_address: Json | null
          services: Json | null
          tel_number: string | null
          tel_number_legal: string | null
          umbrella_provider_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          astute_code?: string | null
          auto_notify_changes?: boolean | null
          cc_static_update?: string | null
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          contract_padding?: number | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          disable_manual_contract_update?: boolean | null
          email_legal?: string | null
          exclude_from_aging?: boolean | null
          fax_number_legal?: string | null
          id?: string
          is_active?: boolean
          is_approved?: boolean | null
          is_deleted?: boolean | null
          is_hidden?: boolean | null
          is_umbrella_provider?: boolean | null
          name: string
          portal_url?: string | null
          postal_address?: Json | null
          provider_type?: string
          residential_address?: Json | null
          services?: Json | null
          tel_number?: string | null
          tel_number_legal?: string | null
          umbrella_provider_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          astute_code?: string | null
          auto_notify_changes?: boolean | null
          cc_static_update?: string | null
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          contract_padding?: number | null
          country?: string | null
          created_at?: string
          deleted_at?: string | null
          disable_manual_contract_update?: boolean | null
          email_legal?: string | null
          exclude_from_aging?: boolean | null
          fax_number_legal?: string | null
          id?: string
          is_active?: boolean
          is_approved?: boolean | null
          is_deleted?: boolean | null
          is_hidden?: boolean | null
          is_umbrella_provider?: boolean | null
          name?: string
          portal_url?: string | null
          postal_address?: Json | null
          provider_type?: string
          residential_address?: Json | null
          services?: Json | null
          tel_number?: string | null
          tel_number_legal?: string | null
          umbrella_provider_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_providers_umbrella_provider_id_fkey"
            columns: ["umbrella_provider_id"]
            isOneToOne: false
            referencedRelation: "product_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          frequency_options: Json | null
          id: string
          is_active: boolean
          is_deleted: boolean
          max_premium: number | null
          min_premium: number | null
          name: string
          premium_type: string | null
          product_code: string | null
          provider_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          frequency_options?: Json | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          max_premium?: number | null
          min_premium?: number | null
          name: string
          premium_type?: string | null
          product_code?: string | null
          provider_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          frequency_options?: Json | null
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          max_premium?: number | null
          min_premium?: number | null
          name?: string
          premium_type?: string | null
          product_code?: string | null
          provider_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "product_providers"
            referencedColumns: ["id"]
          },
        ]
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
      project_opportunities: {
        Row: {
          client_id: string | null
          client_name: string
          confidence: number | null
          created_at: string
          current_value: number | null
          id: string
          opportunity_type: string
          potential_revenue: number | null
          project_id: string
          reasoning: string | null
          status: string
          suggested_action: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          client_name: string
          confidence?: number | null
          created_at?: string
          current_value?: number | null
          id?: string
          opportunity_type: string
          potential_revenue?: number | null
          project_id: string
          reasoning?: string | null
          status?: string
          suggested_action?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          client_name?: string
          confidence?: number | null
          created_at?: string
          current_value?: number | null
          id?: string
          opportunity_type?: string
          potential_revenue?: number | null
          project_id?: string
          reasoning?: string | null
          status?: string
          suggested_action?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_opportunities_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "opportunity_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          is_deleted: boolean
          opportunity_id: string | null
          priority: string
          project_id: string
          sla_deadline: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_deleted?: boolean
          opportunity_id?: string | null
          priority?: string
          project_id: string
          sla_deadline?: string | null
          status?: string
          task_type?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          is_deleted?: boolean
          opportunity_id?: string | null
          priority?: string
          project_id?: string
          sla_deadline?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "project_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "opportunity_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_task_filters: {
        Row: {
          created_at: string | null
          filters: Json
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filters?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sla_commitments: {
        Row: {
          annual_meetings_completed: number
          annual_meetings_target: number
          communication_preference: string
          created_at: string
          id: string
          last_contact_date: string | null
          next_review_date: string | null
          portfolio_review_frequency: string
          reports_to_provide: Json
          updated_at: string
          user_id: string
          workflow_id: string
        }
        Insert: {
          annual_meetings_completed?: number
          annual_meetings_target?: number
          communication_preference?: string
          created_at?: string
          id?: string
          last_contact_date?: string | null
          next_review_date?: string | null
          portfolio_review_frequency?: string
          reports_to_provide?: Json
          updated_at?: string
          user_id: string
          workflow_id: string
        }
        Update: {
          annual_meetings_completed?: number
          annual_meetings_target?: number
          communication_preference?: string
          created_at?: string
          id?: string
          last_contact_date?: string | null
          next_review_date?: string | null
          portfolio_review_frequency?: string
          reports_to_provide?: Json
          updated_at?: string
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_commitments_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "financial_planning_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      task_clients: {
        Row: {
          client_id: string
          created_at: string
          id: string
          role: string
          task_id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          role?: string
          task_id: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          role?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_clients_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_communications: {
        Row: {
          communication_id: string
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          communication_id: string
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          communication_id?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_communications_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "communications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_communications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_documents: {
        Row: {
          document_id: string
          document_type: string
          id: string
          notes: string | null
          task_id: string
          uploaded_at: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          document_id: string
          document_type: string
          id?: string
          notes?: string | null
          task_id: string
          uploaded_at?: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          document_id?: string
          document_type?: string
          id?: string
          notes?: string | null
          task_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_documents_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_history: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          task_id: string
          user_id: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id: string
          user_id: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_type_standards: {
        Row: {
          created_at: string
          id: string
          sla_hours: number
          standard_execution_minutes: number
          task_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sla_hours?: number
          standard_execution_minutes?: number
          task_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sla_hours?: number
          standard_execution_minutes?: number
          task_type?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to_name: string | null
          assigned_to_user_id: string | null
          category: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          first_response_at: string | null
          follow_up_date: string | null
          id: string
          internal_notes: Json | null
          is_deleted: boolean
          is_pinned: boolean
          is_practice_task: boolean
          last_activity_at: string | null
          notes: Json | null
          priority: Database["public"]["Enums"]["task_priority"]
          resolution: string | null
          resolution_category: string | null
          sla_deadline: string | null
          source: string | null
          source_reference: string | null
          standard_execution_minutes: number | null
          status: Database["public"]["Enums"]["task_status"]
          subcategory: string | null
          tags: string[] | null
          task_number: number | null
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
          user_id: string
          watchers: string[] | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to_name?: string | null
          assigned_to_user_id?: string | null
          category?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          first_response_at?: string | null
          follow_up_date?: string | null
          id?: string
          internal_notes?: Json | null
          is_deleted?: boolean
          is_pinned?: boolean
          is_practice_task?: boolean
          last_activity_at?: string | null
          notes?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          resolution?: string | null
          resolution_category?: string | null
          sla_deadline?: string | null
          source?: string | null
          source_reference?: string | null
          standard_execution_minutes?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          subcategory?: string | null
          tags?: string[] | null
          task_number?: number | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
          user_id: string
          watchers?: string[] | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to_name?: string | null
          assigned_to_user_id?: string | null
          category?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          first_response_at?: string | null
          follow_up_date?: string | null
          id?: string
          internal_notes?: Json | null
          is_deleted?: boolean
          is_pinned?: boolean
          is_practice_task?: boolean
          last_activity_at?: string | null
          notes?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          resolution?: string | null
          resolution_category?: string | null
          sla_deadline?: string | null
          source?: string | null
          source_reference?: string | null
          standard_execution_minutes?: number | null
          status?: Database["public"]["Enums"]["task_status"]
          subcategory?: string | null
          tags?: string[] | null
          task_number?: number | null
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
          user_id?: string
          watchers?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          advisor_initials: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          is_primary_adviser: boolean
          jurisdiction: string | null
          name: string
          role: string | null
          team_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          advisor_initials?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          is_primary_adviser?: boolean
          jurisdiction?: string | null
          name: string
          role?: string | null
          team_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          advisor_initials?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          is_primary_adviser?: boolean
          jurisdiction?: string | null
          name?: string
          role?: string | null
          team_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tlh_fund_replacements: {
        Row: {
          correlation: number | null
          created_at: string | null
          fee_differential: number | null
          id: string
          is_active: boolean | null
          jurisdiction: string
          original_fund_id: string | null
          reason: string | null
          replacement_fund_id: string | null
          tracking_error: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          correlation?: number | null
          created_at?: string | null
          fee_differential?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          original_fund_id?: string | null
          reason?: string | null
          replacement_fund_id?: string | null
          tracking_error?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          correlation?: number | null
          created_at?: string | null
          fee_differential?: number | null
          id?: string
          is_active?: boolean | null
          jurisdiction?: string
          original_fund_id?: string | null
          reason?: string | null
          replacement_fund_id?: string | null
          tracking_error?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tlh_fund_replacements_original_fund_id_fkey"
            columns: ["original_fund_id"]
            isOneToOne: false
            referencedRelation: "admin_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tlh_fund_replacements_replacement_fund_id_fkey"
            columns: ["replacement_fund_id"]
            isOneToOne: false
            referencedRelation: "admin_funds"
            referencedColumns: ["id"]
          },
        ]
      }
      tlh_opportunities: {
        Row: {
          client_id: string | null
          client_name: string
          cost_basis: number | null
          created_at: string | null
          current_fund_id: string | null
          current_fund_name: string
          current_ticker: string | null
          current_value: number | null
          deleted_at: string | null
          estimated_tax_savings: number | null
          executed_at: string | null
          holding_period: string | null
          id: string
          is_deleted: boolean | null
          jurisdiction: string | null
          purchase_value: number | null
          status: string | null
          suggested_replacement_id: string | null
          suggested_replacement_name: string | null
          trade_notes: string | null
          unrealized_gain_loss: number | null
          updated_at: string | null
          user_id: string
          wash_sale_ok: boolean | null
        }
        Insert: {
          client_id?: string | null
          client_name: string
          cost_basis?: number | null
          created_at?: string | null
          current_fund_id?: string | null
          current_fund_name: string
          current_ticker?: string | null
          current_value?: number | null
          deleted_at?: string | null
          estimated_tax_savings?: number | null
          executed_at?: string | null
          holding_period?: string | null
          id?: string
          is_deleted?: boolean | null
          jurisdiction?: string | null
          purchase_value?: number | null
          status?: string | null
          suggested_replacement_id?: string | null
          suggested_replacement_name?: string | null
          trade_notes?: string | null
          unrealized_gain_loss?: number | null
          updated_at?: string | null
          user_id: string
          wash_sale_ok?: boolean | null
        }
        Update: {
          client_id?: string | null
          client_name?: string
          cost_basis?: number | null
          created_at?: string | null
          current_fund_id?: string | null
          current_fund_name?: string
          current_ticker?: string | null
          current_value?: number | null
          deleted_at?: string | null
          estimated_tax_savings?: number | null
          executed_at?: string | null
          holding_period?: string | null
          id?: string
          is_deleted?: boolean | null
          jurisdiction?: string | null
          purchase_value?: number | null
          status?: string | null
          suggested_replacement_id?: string | null
          suggested_replacement_name?: string | null
          trade_notes?: string | null
          unrealized_gain_loss?: number | null
          updated_at?: string | null
          user_id?: string
          wash_sale_ok?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "tlh_opportunities_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tlh_opportunities_current_fund_id_fkey"
            columns: ["current_fund_id"]
            isOneToOne: false
            referencedRelation: "admin_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tlh_opportunities_suggested_replacement_id_fkey"
            columns: ["suggested_replacement_id"]
            isOneToOne: false
            referencedRelation: "admin_funds"
            referencedColumns: ["id"]
          },
        ]
      }
      tlh_trades: {
        Row: {
          buy_fund_id: string | null
          buy_fund_name: string
          buy_ticker: string | null
          buy_value: number | null
          client_id: string | null
          created_at: string | null
          deleted_at: string | null
          estimated_tax_saving: number | null
          executed_at: string | null
          id: string
          is_deleted: boolean | null
          notes: string | null
          opportunity_id: string | null
          realized_loss: number | null
          sell_fund_id: string | null
          sell_fund_name: string
          sell_ticker: string | null
          sell_value: number | null
          settled_at: string | null
          status: string | null
          trade_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          buy_fund_id?: string | null
          buy_fund_name: string
          buy_ticker?: string | null
          buy_value?: number | null
          client_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estimated_tax_saving?: number | null
          executed_at?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          opportunity_id?: string | null
          realized_loss?: number | null
          sell_fund_id?: string | null
          sell_fund_name: string
          sell_ticker?: string | null
          sell_value?: number | null
          settled_at?: string | null
          status?: string | null
          trade_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          buy_fund_id?: string | null
          buy_fund_name?: string
          buy_ticker?: string | null
          buy_value?: number | null
          client_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          estimated_tax_saving?: number | null
          executed_at?: string | null
          id?: string
          is_deleted?: boolean | null
          notes?: string | null
          opportunity_id?: string | null
          realized_loss?: number | null
          sell_fund_id?: string | null
          sell_fund_name?: string
          sell_ticker?: string | null
          sell_value?: number | null
          settled_at?: string | null
          status?: string | null
          trade_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tlh_trades_buy_fund_id_fkey"
            columns: ["buy_fund_id"]
            isOneToOne: false
            referencedRelation: "admin_funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tlh_trades_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tlh_trades_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "tlh_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tlh_trades_sell_fund_id_fkey"
            columns: ["sell_fund_id"]
            isOneToOne: false
            referencedRelation: "admin_funds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_jurisdictions: {
        Row: {
          created_at: string
          id: string
          jurisdiction_code: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jurisdiction_code: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jurisdiction_code?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          date_format: string | null
          default_calendar_view: string | null
          default_from_primary_adviser: boolean
          display_name: string | null
          email_signature: string | null
          id: string
          notification_calendar_reminders: boolean | null
          notification_client_updates: boolean | null
          notification_compliance_alerts: boolean | null
          notification_critical_only_sound: boolean
          notification_email: boolean | null
          notification_push_enabled: boolean
          notification_sound_enabled: boolean
          notification_task_reminders: boolean | null
          time_format: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_format?: string | null
          default_calendar_view?: string | null
          default_from_primary_adviser?: boolean
          display_name?: string | null
          email_signature?: string | null
          id?: string
          notification_calendar_reminders?: boolean | null
          notification_client_updates?: boolean | null
          notification_compliance_alerts?: boolean | null
          notification_critical_only_sound?: boolean
          notification_email?: boolean | null
          notification_push_enabled?: boolean
          notification_sound_enabled?: boolean
          notification_task_reminders?: boolean | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_format?: string | null
          default_calendar_view?: string | null
          default_from_primary_adviser?: boolean
          display_name?: string | null
          email_signature?: string | null
          id?: string
          notification_calendar_reminders?: boolean | null
          notification_client_updates?: boolean | null
          notification_compliance_alerts?: boolean | null
          notification_critical_only_sound?: boolean
          notification_email?: boolean | null
          notification_push_enabled?: boolean
          notification_sound_enabled?: boolean
          notification_task_reminders?: boolean | null
          time_format?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_widget_layouts: {
        Row: {
          created_at: string
          hidden_widgets: Json
          id: string
          layout: Json
          page_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hidden_widgets?: Json
          id?: string
          layout?: Json
          page_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hidden_widgets?: Json
          id?: string
          layout?: Json
          page_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_favourites: {
        Row: {
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_favourites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          service_area: string | null
          steps: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          service_area?: string | null
          steps?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          service_area?: string | null
          steps?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workflows: {
        Row: {
          adviser_id: string | null
          client_id: string | null
          created_at: string
          current_step: number
          deleted_at: string | null
          end_date: string | null
          id: string
          is_deleted: boolean
          name: string
          service_area: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["workflow_status"]
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adviser_id?: string | null
          client_id?: string | null
          created_at?: string
          current_step?: number
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          is_deleted?: boolean
          name: string
          service_area?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["workflow_status"]
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adviser_id?: string | null
          client_id?: string | null
          created_at?: string
          current_step?: number
          deleted_at?: string | null
          end_date?: string | null
          id?: string
          is_deleted?: boolean
          name?: string
          service_area?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["workflow_status"]
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
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
      calendar_event_status: "Scheduled" | "Completed" | "Cancelled"
      calendar_event_type:
        | "Meeting"
        | "Annual Review"
        | "Portfolio Review"
        | "Compliance Review"
        | "Reminder"
        | "Personal"
        | "Team Event"
        | "Client Call"
      commission_status:
        | "Matched"
        | "Pending"
        | "Disputed"
        | "Excessive"
        | "Reconciled"
      communication_channel:
        | "Email"
        | "SMS"
        | "Phone"
        | "WhatsApp"
        | "Push"
        | "Webinar"
        | "Office Event"
      cpd_category:
        | "Ethics"
        | "Regulatory"
        | "Professional"
        | "Product Knowledge"
      document_status: "Pending" | "Complete" | "Cancelled" | "Expired"
      email_folder:
        | "Task Pool"
        | "Inbox"
        | "Draft"
        | "Sent"
        | "Queue"
        | "Failed"
        | "Archived"
      entity_type: "Individual" | "Trust" | "Company" | "Close Corporation"
      relationship_type:
        | "Spouse"
        | "Child"
        | "Parent"
        | "Sibling"
        | "Business Partner"
        | "Trustee"
        | "Beneficiary"
        | "Director"
        | "Shareholder"
        | "Member"
        | "Owner"
      task_priority: "Low" | "Medium" | "High" | "Urgent"
      task_status:
        | "Not Started"
        | "In Progress"
        | "Pending Client"
        | "Completed"
        | "Cancelled"
      task_type:
        | "Client Complaint"
        | "Follow-up"
        | "Annual Review"
        | "Portfolio Review"
        | "Compliance"
        | "Onboarding"
        | "Document Request"
      transcription_status: "pending" | "processing" | "completed" | "failed"
      workflow_status: "Active" | "Complete" | "Inactive" | "Cancelled"
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
      calendar_event_status: ["Scheduled", "Completed", "Cancelled"],
      calendar_event_type: [
        "Meeting",
        "Annual Review",
        "Portfolio Review",
        "Compliance Review",
        "Reminder",
        "Personal",
        "Team Event",
        "Client Call",
      ],
      commission_status: [
        "Matched",
        "Pending",
        "Disputed",
        "Excessive",
        "Reconciled",
      ],
      communication_channel: [
        "Email",
        "SMS",
        "Phone",
        "WhatsApp",
        "Push",
        "Webinar",
        "Office Event",
      ],
      cpd_category: [
        "Ethics",
        "Regulatory",
        "Professional",
        "Product Knowledge",
      ],
      document_status: ["Pending", "Complete", "Cancelled", "Expired"],
      email_folder: [
        "Task Pool",
        "Inbox",
        "Draft",
        "Sent",
        "Queue",
        "Failed",
        "Archived",
      ],
      entity_type: ["Individual", "Trust", "Company", "Close Corporation"],
      relationship_type: [
        "Spouse",
        "Child",
        "Parent",
        "Sibling",
        "Business Partner",
        "Trustee",
        "Beneficiary",
        "Director",
        "Shareholder",
        "Member",
        "Owner",
      ],
      task_priority: ["Low", "Medium", "High", "Urgent"],
      task_status: [
        "Not Started",
        "In Progress",
        "Pending Client",
        "Completed",
        "Cancelled",
      ],
      task_type: [
        "Client Complaint",
        "Follow-up",
        "Annual Review",
        "Portfolio Review",
        "Compliance",
        "Onboarding",
        "Document Request",
      ],
      transcription_status: ["pending", "processing", "completed", "failed"],
      workflow_status: ["Active", "Complete", "Inactive", "Cancelled"],
    },
  },
} as const
