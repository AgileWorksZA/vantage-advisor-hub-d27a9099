
-- =====================================================
-- COMPREHENSIVE DATABASE SCHEMA MIGRATION
-- Financial Advisor CRM System
-- =====================================================

-- =====================================================
-- PART 1: ENUM TYPES
-- =====================================================

CREATE TYPE public.task_type AS ENUM (
  'Client Complaint', 'Follow-up', 'Annual Review', 'Portfolio Review',
  'Compliance', 'Onboarding', 'Document Request'
);

CREATE TYPE public.task_status AS ENUM (
  'Not Started', 'In Progress', 'Pending Client', 'Completed', 'Cancelled'
);

CREATE TYPE public.task_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');

CREATE TYPE public.document_status AS ENUM ('Pending', 'Complete', 'Cancelled', 'Expired');

CREATE TYPE public.email_folder AS ENUM (
  'Task Pool', 'Inbox', 'Draft', 'Sent', 'Queue', 'Failed', 'Archived'
);

CREATE TYPE public.communication_channel AS ENUM (
  'Email', 'SMS', 'Phone', 'WhatsApp', 'Push', 'Webinar', 'Office Event'
);

CREATE TYPE public.commission_status AS ENUM (
  'Matched', 'Pending', 'Disputed', 'Excessive', 'Reconciled'
);

CREATE TYPE public.workflow_status AS ENUM ('Active', 'Complete', 'Inactive', 'Cancelled');

CREATE TYPE public.cpd_category AS ENUM ('Ethics', 'Regulatory', 'Professional', 'Product Knowledge');

CREATE TYPE public.relationship_type AS ENUM (
  'Spouse', 'Child', 'Parent', 'Sibling', 'Business Partner', 'Trustee'
);

CREATE TYPE public.entity_type AS ENUM ('Individual', 'Trust', 'Company', 'Close Corporation');

-- =====================================================
-- PART 2: REFERENCE TABLES
-- =====================================================

-- Product Providers (Insurance/Investment companies)
CREATE TABLE public.product_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'Insurance',
  is_active BOOLEAN NOT NULL DEFAULT true,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product Categories
CREATE TABLE public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document Types
CREATE TABLE public.document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Client',
  retention_days INTEGER DEFAULT 2555,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 3: PRODUCTS TABLE
-- =====================================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_id UUID REFERENCES public.product_providers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  product_code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  premium_type TEXT DEFAULT 'Recurring',
  frequency_options JSONB DEFAULT '["Monthly", "Quarterly", "Annually"]'::jsonb,
  min_premium NUMERIC(15,2),
  max_premium NUMERIC(15,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PART 4: CLIENT-RELATED TABLES
-- =====================================================

-- Client Products (junction table)
CREATE TABLE public.client_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  policy_number TEXT,
  role TEXT NOT NULL DEFAULT 'Owner',
  premium_amount NUMERIC(15,2),
  frequency TEXT DEFAULT 'Monthly',
  current_value NUMERIC(15,2),
  value_updated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Active',
  start_date DATE,
  end_date DATE,
  adviser_id UUID,
  is_linked BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Portfolios
CREATE TABLE public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  portfolio_type TEXT NOT NULL DEFAULT 'Investment',
  target_risk_score INTEGER,
  current_risk_score INTEGER,
  total_value NUMERIC(15,2) DEFAULT 0,
  last_valuation_date DATE,
  benchmark TEXT,
  status public.workflow_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Portfolio Holdings
CREATE TABLE public.portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  fund_name TEXT NOT NULL,
  units NUMERIC(15,4),
  unit_price NUMERIC(15,4),
  current_value NUMERIC(15,2),
  percentage_allocation NUMERIC(5,2),
  performance_12m NUMERIC(5,2),
  fee_percentage NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  version INTEGER DEFAULT 1,
  status public.document_status NOT NULL DEFAULT 'Pending',
  workflow_id UUID,
  expiry_date DATE,
  uploaded_by UUID,
  approved_by UUID,
  approval_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Client Notes
CREATE TABLE public.client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL DEFAULT 'Note',
  subject TEXT,
  content TEXT NOT NULL,
  priority public.task_priority DEFAULT 'Medium',
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  responsible_user_id UUID,
  owner_user_id UUID,
  is_visible_portal BOOLEAN NOT NULL DEFAULT false,
  attachment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PART 5: TASK AND WORKFLOW TABLES
-- =====================================================

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type public.task_type NOT NULL DEFAULT 'Follow-up',
  priority public.task_priority NOT NULL DEFAULT 'Medium',
  status public.task_status NOT NULL DEFAULT 'Not Started',
  due_date DATE,
  assigned_to_user_id UUID,
  created_by UUID,
  notes JSONB DEFAULT '[]'::jsonb,
  is_practice_task BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Workflow Templates
CREATE TABLE public.workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  service_area TEXT,
  description TEXT,
  steps JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflows
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.workflow_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  service_area TEXT,
  current_step INTEGER NOT NULL DEFAULT 1,
  status public.workflow_status NOT NULL DEFAULT 'Active',
  adviser_id UUID,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Advice Workflows
CREATE TABLE public.advice_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  status public.workflow_status NOT NULL DEFAULT 'Active',
  adviser_id UUID,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- FAIS Controls
CREATE TABLE public.fais_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  products JSONB DEFAULT '[]'::jsonb,
  current_step INTEGER NOT NULL DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  status public.workflow_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PART 6: COMMUNICATION TABLES
-- =====================================================

-- Emails
CREATE TABLE public.emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  folder public.email_folder NOT NULL DEFAULT 'Inbox',
  direction TEXT NOT NULL DEFAULT 'Inbound',
  from_address TEXT NOT NULL,
  to_addresses JSONB DEFAULT '[]'::jsonb,
  cc_addresses JSONB DEFAULT '[]'::jsonb,
  subject TEXT,
  body_preview TEXT,
  body_html TEXT,
  has_attachments BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  is_read BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'Received',
  external_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Communications (unified log)
CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  channel public.communication_channel NOT NULL DEFAULT 'Email',
  direction TEXT NOT NULL DEFAULT 'Outbound',
  from_identifier TEXT,
  to_identifier TEXT,
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'Sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PART 7: COMMISSION AND COMPLIANCE TABLES
-- =====================================================

-- Commissions
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_product_id UUID REFERENCES public.client_products(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.product_providers(id) ON DELETE SET NULL,
  policy_reference TEXT,
  expected_amount NUMERIC(15,2),
  received_amount NUMERIC(15,2),
  variance_percentage NUMERIC(5,2),
  status public.commission_status NOT NULL DEFAULT 'Pending',
  payment_date DATE,
  period_start DATE,
  period_end DATE,
  discrepancy_notes TEXT,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- CPD Cycles
CREATE TABLE public.cpd_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cycle_start DATE NOT NULL,
  cycle_end DATE NOT NULL,
  total_hours_required INTEGER NOT NULL DEFAULT 18,
  ethics_required INTEGER NOT NULL DEFAULT 3,
  regulatory_required INTEGER NOT NULL DEFAULT 3,
  professional_required INTEGER NOT NULL DEFAULT 6,
  product_required INTEGER NOT NULL DEFAULT 6,
  status public.workflow_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CPD Records
CREATE TABLE public.cpd_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cpd_cycle_id UUID REFERENCES public.cpd_cycles(id) ON DELETE CASCADE,
  category public.cpd_category NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  course_name TEXT NOT NULL,
  provider TEXT,
  certificate_url TEXT,
  completion_date DATE NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 8: RELATIONSHIP TABLES
-- =====================================================

-- Client Relationships (Family & Business)
CREATE TABLE public.client_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  related_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  entity_type public.entity_type NOT NULL DEFAULT 'Individual',
  identification TEXT,
  id_type TEXT DEFAULT 'SA ID',
  product_viewing_level TEXT DEFAULT 'Full',
  relationship_type public.relationship_type NOT NULL DEFAULT 'Spouse',
  family_name TEXT,
  share_percentage NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Client Contacts (Professional advisors)
CREATE TABLE public.client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- PART 9: INDEXES
-- =====================================================

-- Foreign key indexes
CREATE INDEX idx_products_provider_id ON public.products(provider_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_client_products_client_id ON public.client_products(client_id);
CREATE INDEX idx_client_products_product_id ON public.client_products(product_id);
CREATE INDEX idx_portfolios_client_id ON public.portfolios(client_id);
CREATE INDEX idx_portfolio_holdings_portfolio_id ON public.portfolio_holdings(portfolio_id);
CREATE INDEX idx_documents_client_id ON public.documents(client_id);
CREATE INDEX idx_documents_document_type_id ON public.documents(document_type_id);
CREATE INDEX idx_client_notes_client_id ON public.client_notes(client_id);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX idx_workflows_client_id ON public.workflows(client_id);
CREATE INDEX idx_advice_workflows_client_id ON public.advice_workflows(client_id);
CREATE INDEX idx_fais_controls_client_id ON public.fais_controls(client_id);
CREATE INDEX idx_emails_client_id ON public.emails(client_id);
CREATE INDEX idx_communications_client_id ON public.communications(client_id);
CREATE INDEX idx_commissions_client_product_id ON public.commissions(client_product_id);
CREATE INDEX idx_cpd_records_cpd_cycle_id ON public.cpd_records(cpd_cycle_id);
CREATE INDEX idx_client_relationships_client_id ON public.client_relationships(client_id);
CREATE INDEX idx_client_contacts_client_id ON public.client_contacts(client_id);

-- User ID indexes for RLS performance
CREATE INDEX idx_product_providers_user_id ON public.product_providers(user_id);
CREATE INDEX idx_product_categories_user_id ON public.product_categories(user_id);
CREATE INDEX idx_document_types_user_id ON public.document_types(user_id);
CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_client_products_user_id ON public.client_products(user_id);
CREATE INDEX idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX idx_portfolio_holdings_user_id ON public.portfolio_holdings(user_id);
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_client_notes_user_id ON public.client_notes(user_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_workflow_templates_user_id ON public.workflow_templates(user_id);
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_advice_workflows_user_id ON public.advice_workflows(user_id);
CREATE INDEX idx_fais_controls_user_id ON public.fais_controls(user_id);
CREATE INDEX idx_emails_user_id ON public.emails(user_id);
CREATE INDEX idx_communications_user_id ON public.communications(user_id);
CREATE INDEX idx_commissions_user_id ON public.commissions(user_id);
CREATE INDEX idx_cpd_cycles_user_id ON public.cpd_cycles(user_id);
CREATE INDEX idx_cpd_records_user_id ON public.cpd_records(user_id);
CREATE INDEX idx_client_relationships_user_id ON public.client_relationships(user_id);
CREATE INDEX idx_client_contacts_user_id ON public.client_contacts(user_id);

-- Query optimization indexes
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date) WHERE is_deleted = false;
CREATE INDEX idx_tasks_status ON public.tasks(status) WHERE is_deleted = false;
CREATE INDEX idx_documents_expiry_date ON public.documents(expiry_date) WHERE is_deleted = false;
CREATE INDEX idx_commissions_payment_date ON public.commissions(payment_date) WHERE is_deleted = false;
CREATE INDEX idx_emails_folder ON public.emails(folder) WHERE is_deleted = false;
CREATE INDEX idx_client_products_status ON public.client_products(status) WHERE is_deleted = false;

-- Composite indexes
CREATE INDEX idx_tasks_user_status ON public.tasks(user_id, status) WHERE is_deleted = false;
CREATE INDEX idx_client_products_client_status ON public.client_products(client_id, status) WHERE is_deleted = false;
CREATE INDEX idx_documents_client_status ON public.documents(client_id, status) WHERE is_deleted = false;

-- =====================================================
-- PART 10: TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_product_providers_updated_at BEFORE UPDATE ON public.product_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON public.document_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_products_updated_at BEFORE UPDATE ON public.client_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_portfolio_holdings_updated_at BEFORE UPDATE ON public.portfolio_holdings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflow_templates_updated_at BEFORE UPDATE ON public.workflow_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advice_workflows_updated_at BEFORE UPDATE ON public.advice_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fais_controls_updated_at BEFORE UPDATE ON public.fais_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON public.emails FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON public.commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cpd_cycles_updated_at BEFORE UPDATE ON public.cpd_cycles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cpd_records_updated_at BEFORE UPDATE ON public.cpd_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_relationships_updated_at BEFORE UPDATE ON public.client_relationships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_contacts_updated_at BEFORE UPDATE ON public.client_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PART 11: ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.product_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advice_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fais_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cpd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_providers
CREATE POLICY "Users can view their own product_providers" ON public.product_providers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own product_providers" ON public.product_providers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own product_providers" ON public.product_providers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own product_providers" ON public.product_providers FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for product_categories
CREATE POLICY "Users can view their own product_categories" ON public.product_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own product_categories" ON public.product_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own product_categories" ON public.product_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own product_categories" ON public.product_categories FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for document_types
CREATE POLICY "Users can view their own document_types" ON public.document_types FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own document_types" ON public.document_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own document_types" ON public.document_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own document_types" ON public.document_types FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Users can view their own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for client_products
CREATE POLICY "Users can view their own client_products" ON public.client_products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_products" ON public.client_products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_products" ON public.client_products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_products" ON public.client_products FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for portfolios
CREATE POLICY "Users can view their own portfolios" ON public.portfolios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own portfolios" ON public.portfolios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolios" ON public.portfolios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolios" ON public.portfolios FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for portfolio_holdings
CREATE POLICY "Users can view their own portfolio_holdings" ON public.portfolio_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own portfolio_holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own portfolio_holdings" ON public.portfolio_holdings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own portfolio_holdings" ON public.portfolio_holdings FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for client_notes
CREATE POLICY "Users can view their own client_notes" ON public.client_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_notes" ON public.client_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_notes" ON public.client_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_notes" ON public.client_notes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workflow_templates
CREATE POLICY "Users can view their own workflow_templates" ON public.workflow_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workflow_templates" ON public.workflow_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workflow_templates" ON public.workflow_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workflow_templates" ON public.workflow_templates FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for workflows
CREATE POLICY "Users can view their own workflows" ON public.workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workflows" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workflows" ON public.workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workflows" ON public.workflows FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for advice_workflows
CREATE POLICY "Users can view their own advice_workflows" ON public.advice_workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own advice_workflows" ON public.advice_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own advice_workflows" ON public.advice_workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own advice_workflows" ON public.advice_workflows FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for fais_controls
CREATE POLICY "Users can view their own fais_controls" ON public.fais_controls FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own fais_controls" ON public.fais_controls FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fais_controls" ON public.fais_controls FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fais_controls" ON public.fais_controls FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for emails
CREATE POLICY "Users can view their own emails" ON public.emails FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own emails" ON public.emails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own emails" ON public.emails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own emails" ON public.emails FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for communications
CREATE POLICY "Users can view their own communications" ON public.communications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own communications" ON public.communications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own communications" ON public.communications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own communications" ON public.communications FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for commissions
CREATE POLICY "Users can view their own commissions" ON public.commissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own commissions" ON public.commissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own commissions" ON public.commissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own commissions" ON public.commissions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cpd_cycles
CREATE POLICY "Users can view their own cpd_cycles" ON public.cpd_cycles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cpd_cycles" ON public.cpd_cycles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cpd_cycles" ON public.cpd_cycles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cpd_cycles" ON public.cpd_cycles FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cpd_records
CREATE POLICY "Users can view their own cpd_records" ON public.cpd_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own cpd_records" ON public.cpd_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cpd_records" ON public.cpd_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cpd_records" ON public.cpd_records FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for client_relationships
CREATE POLICY "Users can view their own client_relationships" ON public.client_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_relationships" ON public.client_relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_relationships" ON public.client_relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_relationships" ON public.client_relationships FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for client_contacts
CREATE POLICY "Users can view their own client_contacts" ON public.client_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_contacts" ON public.client_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_contacts" ON public.client_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_contacts" ON public.client_contacts FOR DELETE USING (auth.uid() = user_id);
