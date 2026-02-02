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
      calendar_events: {
        Row: {
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
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
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
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
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
      client_contacts: {
        Row: {
          client_id: string
          company: string | null
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
      product_providers: {
        Row: {
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          provider_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          provider_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          provider_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      tasks: {
        Row: {
          assigned_to_user_id: string | null
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_deleted: boolean
          is_practice_task: boolean
          notes: Json | null
          priority: Database["public"]["Enums"]["task_priority"]
          status: Database["public"]["Enums"]["task_status"]
          task_type: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_deleted?: boolean
          is_practice_task?: boolean
          notes?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to_user_id?: string | null
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_deleted?: boolean
          is_practice_task?: boolean
          notes?: Json | null
          priority?: Database["public"]["Enums"]["task_priority"]
          status?: Database["public"]["Enums"]["task_status"]
          task_type?: Database["public"]["Enums"]["task_type"]
          title?: string
          updated_at?: string
          user_id?: string
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
      user_widget_layouts: {
        Row: {
          created_at: string
          id: string
          layout: Json
          page_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          page_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          page_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
