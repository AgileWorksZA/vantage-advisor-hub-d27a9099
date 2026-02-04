-- Administrative Module Tables
-- Following enterprise architecture: UUID PKs, soft deletes, RLS, audit fields

-- 1. admin_general_lists - Master table for simple lookups (banks, currencies, etc.)
CREATE TABLE public.admin_general_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  list_type TEXT NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_secondary TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, list_type, code)
);

-- 2. admin_data_imports - Import job tracking
CREATE TABLE public.admin_data_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  import_type TEXT NOT NULL,
  import_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER,
  total_lines INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  progress_percentage NUMERIC DEFAULT 0,
  remaining_time_seconds INTEGER,
  changed_by TEXT,
  error_message TEXT,
  source_reference TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- 3. admin_document_templates - Document template configuration
CREATE TABLE public.admin_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_secondary TEXT,
  category TEXT NOT NULL,
  has_content BOOLEAN DEFAULT false,
  can_public_upload BOOLEAN DEFAULT false,
  requires_workflow_signature BOOLEAN DEFAULT false,
  content_template TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, code)
);

-- 4. admin_product_benefits - Product benefit mappings
CREATE TABLE public.admin_product_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  field_mapping TEXT,
  is_mapped BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- 5. admin_funds - Fund/instrument management
CREATE TABLE public.admin_funds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  isin TEXT,
  fund_manager TEXT,
  fund_fact_sheet_url TEXT,
  source TEXT,
  asset_classes INTEGER DEFAULT 0,
  is_allocation_approved BOOLEAN DEFAULT false,
  cat1_status TEXT,
  cat2_status TEXT,
  domicile TEXT,
  fund_type TEXT,
  location TEXT,
  industry TEXT,
  sector TEXT,
  exchange TEXT,
  morningstar_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- 6. admin_note_subjects - Note subject configuration
CREATE TABLE public.admin_note_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  item_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- 7. admin_events - Event-driven automation
CREATE TABLE public.admin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  module TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- 8. admin_communication_settings - Channel configuration
CREATE TABLE public.admin_communication_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel TEXT NOT NULL,
  provider TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. admin_system_settings - Platform settings
CREATE TABLE public.admin_system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS on all admin tables
ALTER TABLE public.admin_general_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_product_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_funds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_note_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_communication_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_general_lists
CREATE POLICY "Users can view their own admin_general_lists" ON public.admin_general_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_general_lists" ON public.admin_general_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_general_lists" ON public.admin_general_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_general_lists" ON public.admin_general_lists FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_data_imports
CREATE POLICY "Users can view their own admin_data_imports" ON public.admin_data_imports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_data_imports" ON public.admin_data_imports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_data_imports" ON public.admin_data_imports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_data_imports" ON public.admin_data_imports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_document_templates
CREATE POLICY "Users can view their own admin_document_templates" ON public.admin_document_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_document_templates" ON public.admin_document_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_document_templates" ON public.admin_document_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_document_templates" ON public.admin_document_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_product_benefits
CREATE POLICY "Users can view their own admin_product_benefits" ON public.admin_product_benefits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_product_benefits" ON public.admin_product_benefits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_product_benefits" ON public.admin_product_benefits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_product_benefits" ON public.admin_product_benefits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_funds
CREATE POLICY "Users can view their own admin_funds" ON public.admin_funds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_funds" ON public.admin_funds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_funds" ON public.admin_funds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_funds" ON public.admin_funds FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_note_subjects
CREATE POLICY "Users can view their own admin_note_subjects" ON public.admin_note_subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_note_subjects" ON public.admin_note_subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_note_subjects" ON public.admin_note_subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_note_subjects" ON public.admin_note_subjects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_events
CREATE POLICY "Users can view their own admin_events" ON public.admin_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_events" ON public.admin_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_events" ON public.admin_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_events" ON public.admin_events FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_communication_settings
CREATE POLICY "Users can view their own admin_communication_settings" ON public.admin_communication_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_communication_settings" ON public.admin_communication_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_communication_settings" ON public.admin_communication_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_communication_settings" ON public.admin_communication_settings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for admin_system_settings
CREATE POLICY "Users can view their own admin_system_settings" ON public.admin_system_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own admin_system_settings" ON public.admin_system_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own admin_system_settings" ON public.admin_system_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own admin_system_settings" ON public.admin_system_settings FOR DELETE USING (auth.uid() = user_id);

-- Add update triggers for updated_at
CREATE TRIGGER update_admin_general_lists_updated_at BEFORE UPDATE ON public.admin_general_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_data_imports_updated_at BEFORE UPDATE ON public.admin_data_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_document_templates_updated_at BEFORE UPDATE ON public.admin_document_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_product_benefits_updated_at BEFORE UPDATE ON public.admin_product_benefits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_funds_updated_at BEFORE UPDATE ON public.admin_funds FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_note_subjects_updated_at BEFORE UPDATE ON public.admin_note_subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_events_updated_at BEFORE UPDATE ON public.admin_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_communication_settings_updated_at BEFORE UPDATE ON public.admin_communication_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_system_settings_updated_at BEFORE UPDATE ON public.admin_system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();