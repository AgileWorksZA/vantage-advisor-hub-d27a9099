-- =============================================
-- Financial Planning Workflow Database Schema
-- =============================================

-- 1. Financial Planning Workflows - Master workflow record
CREATE TABLE public.financial_planning_workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  workflow_name text NOT NULL,
  current_step integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Complete', 'Inactive', 'Cancelled')),
  adviser_id uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  step_data jsonb NOT NULL DEFAULT '{"1": {"completed": false}, "2": {"completed": false}, "3": {"completed": false}, "4": {"completed": false}, "5": {"completed": false}, "6": {"completed": false}}'::jsonb,
  last_auto_save timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- 2. FP Workflow Documents - Document pack tracking
CREATE TABLE public.fp_workflow_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workflow_id uuid NOT NULL REFERENCES public.financial_planning_workflows(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  document_name text NOT NULL,
  is_selected boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  delivery_status text NOT NULL DEFAULT 'Pending' CHECK (delivery_status IN ('Pending', 'Sent', 'Delivered', 'Opened', 'Signed')),
  sent_at timestamptz,
  delivered_at timestamptz,
  signed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- 3. Client Assets - Balance sheet assets
CREATE TABLE public.client_assets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  asset_type text NOT NULL CHECK (asset_type IN ('Property', 'Vehicle', 'Savings', 'Investment', 'Retirement', 'Business', 'Personal', 'Other')),
  name text NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  purchase_value numeric,
  purchase_date date,
  growth_rate numeric,
  linked_income_id uuid,
  linked_liability_id uuid,
  notes text,
  is_portal_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- 4. Client Liabilities - Balance sheet liabilities
CREATE TABLE public.client_liabilities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  liability_type text NOT NULL CHECK (liability_type IN ('Bond', 'Vehicle Finance', 'Personal Loan', 'Credit Card', 'Overdraft', 'Student Loan', 'Other')),
  name text NOT NULL,
  original_amount numeric NOT NULL DEFAULT 0,
  current_balance numeric NOT NULL DEFAULT 0,
  interest_rate numeric,
  monthly_payment numeric,
  term_months integer,
  start_date date,
  end_date date,
  linked_asset_id uuid REFERENCES public.client_assets(id) ON DELETE SET NULL,
  creditor_name text,
  is_portal_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- Add back-reference from assets to liabilities
ALTER TABLE public.client_assets 
  ADD CONSTRAINT client_assets_linked_liability_id_fkey 
  FOREIGN KEY (linked_liability_id) REFERENCES public.client_liabilities(id) ON DELETE SET NULL;

-- 5. Client Income - Income sources
CREATE TABLE public.client_income (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  income_type text NOT NULL CHECK (income_type IN ('Salary', 'Rental', 'Investment', 'Pension', 'Business', 'Commission', 'Bonus', 'Other')),
  source_name text NOT NULL,
  gross_amount numeric NOT NULL DEFAULT 0,
  net_amount numeric,
  frequency text NOT NULL DEFAULT 'Monthly' CHECK (frequency IN ('Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually')),
  is_taxable boolean NOT NULL DEFAULT true,
  linked_asset_id uuid REFERENCES public.client_assets(id) ON DELETE SET NULL,
  start_date date,
  end_date date,
  is_portal_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- Add back-reference from assets to income
ALTER TABLE public.client_assets 
  ADD CONSTRAINT client_assets_linked_income_id_fkey 
  FOREIGN KEY (linked_income_id) REFERENCES public.client_income(id) ON DELETE SET NULL;

-- 6. Client Expenses - Expense tracking
CREATE TABLE public.client_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  expense_category text NOT NULL CHECK (expense_category IN ('Housing', 'Transport', 'Insurance', 'Food', 'Utilities', 'Healthcare', 'Education', 'Entertainment', 'Personal', 'Debt Repayment', 'Savings', 'Other')),
  expense_type text NOT NULL DEFAULT 'Fixed' CHECK (expense_type IN ('Fixed', 'Variable')),
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  frequency text NOT NULL DEFAULT 'Monthly' CHECK (frequency IN ('Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually')),
  linked_liability_id uuid REFERENCES public.client_liabilities(id) ON DELETE SET NULL,
  is_essential boolean NOT NULL DEFAULT true,
  is_portal_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- 7. Client Goals - Financial goals
CREATE TABLE public.client_goals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES public.financial_planning_workflows(id) ON DELETE SET NULL,
  goal_name text NOT NULL,
  description text,
  goal_category text NOT NULL CHECK (goal_category IN ('Retirement', 'Education', 'Wealth', 'Protection', 'Estate', 'Emergency', 'Major Purchase', 'Debt Freedom', 'Other')),
  priority text NOT NULL DEFAULT 'Important' CHECK (priority IN ('Critical', 'Important', 'Aspirational')),
  target_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  current_funding numeric NOT NULL DEFAULT 0,
  funding_status text NOT NULL DEFAULT 'On Track' CHECK (funding_status IN ('On Track', 'Behind', 'Ahead', 'Not Started')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- 8. Goal Product Links - Links goals to products
CREATE TABLE public.goal_product_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  goal_id uuid NOT NULL REFERENCES public.client_goals(id) ON DELETE CASCADE,
  client_product_id uuid NOT NULL REFERENCES public.client_products(id) ON DELETE CASCADE,
  allocation_percentage numeric NOT NULL DEFAULT 100,
  link_type text NOT NULL DEFAULT 'Existing' CHECK (link_type IN ('Existing', 'Proposed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Bucket Allocations - Three-bucket strategy
CREATE TABLE public.bucket_allocations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workflow_id uuid NOT NULL REFERENCES public.financial_planning_workflows(id) ON DELETE CASCADE,
  bucket_type text NOT NULL CHECK (bucket_type IN ('Income', 'Preservation', 'Wealth')),
  recommended_amount numeric NOT NULL DEFAULT 0,
  current_allocation numeric NOT NULL DEFAULT 0,
  proposed_allocation numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Product Implementations - Step 5 tracking
CREATE TABLE public.product_implementations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workflow_id uuid NOT NULL REFERENCES public.financial_planning_workflows(id) ON DELETE CASCADE,
  client_product_id uuid NOT NULL REFERENCES public.client_products(id) ON DELETE CASCADE,
  is_selected boolean NOT NULL DEFAULT false,
  implementation_status text NOT NULL DEFAULT 'Pending' CHECK (implementation_status IN ('Pending', 'In Progress', 'Submitted', 'Approved', 'Rejected', 'Completed')),
  implementation_type text NOT NULL DEFAULT 'Manual' CHECK (implementation_type IN ('STP', 'Manual')),
  submitted_at timestamptz,
  approved_at timestamptz,
  outstanding_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz
);

-- 11. SLA Commitments - Step 6 SLA management
CREATE TABLE public.sla_commitments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workflow_id uuid NOT NULL REFERENCES public.financial_planning_workflows(id) ON DELETE CASCADE,
  annual_meetings_target integer NOT NULL DEFAULT 2,
  annual_meetings_completed integer NOT NULL DEFAULT 0,
  portfolio_review_frequency text NOT NULL DEFAULT 'Quarterly' CHECK (portfolio_review_frequency IN ('Monthly', 'Quarterly', 'Semi-Annually', 'Annually')),
  next_review_date date,
  last_contact_date date,
  communication_preference text NOT NULL DEFAULT 'Email' CHECK (communication_preference IN ('Email', 'Phone', 'In-person', 'Video Call')),
  reports_to_provide jsonb NOT NULL DEFAULT '["Portfolio Valuation", "Performance Report", "Tax Statement"]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- =============================================
-- Row Level Security Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.financial_planning_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fp_workflow_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_liabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_product_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bucket_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_implementations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_commitments ENABLE ROW LEVEL SECURITY;

-- Policies for financial_planning_workflows
CREATE POLICY "Users can view their own workflows" ON public.financial_planning_workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own workflows" ON public.financial_planning_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workflows" ON public.financial_planning_workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workflows" ON public.financial_planning_workflows FOR DELETE USING (auth.uid() = user_id);

-- Policies for fp_workflow_documents
CREATE POLICY "Users can view their own fp_workflow_documents" ON public.fp_workflow_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own fp_workflow_documents" ON public.fp_workflow_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own fp_workflow_documents" ON public.fp_workflow_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own fp_workflow_documents" ON public.fp_workflow_documents FOR DELETE USING (auth.uid() = user_id);

-- Policies for client_assets
CREATE POLICY "Users can view their own client_assets" ON public.client_assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_assets" ON public.client_assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_assets" ON public.client_assets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_assets" ON public.client_assets FOR DELETE USING (auth.uid() = user_id);

-- Policies for client_liabilities
CREATE POLICY "Users can view their own client_liabilities" ON public.client_liabilities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_liabilities" ON public.client_liabilities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_liabilities" ON public.client_liabilities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_liabilities" ON public.client_liabilities FOR DELETE USING (auth.uid() = user_id);

-- Policies for client_income
CREATE POLICY "Users can view their own client_income" ON public.client_income FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_income" ON public.client_income FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_income" ON public.client_income FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_income" ON public.client_income FOR DELETE USING (auth.uid() = user_id);

-- Policies for client_expenses
CREATE POLICY "Users can view their own client_expenses" ON public.client_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_expenses" ON public.client_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_expenses" ON public.client_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_expenses" ON public.client_expenses FOR DELETE USING (auth.uid() = user_id);

-- Policies for client_goals
CREATE POLICY "Users can view their own client_goals" ON public.client_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own client_goals" ON public.client_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own client_goals" ON public.client_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own client_goals" ON public.client_goals FOR DELETE USING (auth.uid() = user_id);

-- Policies for goal_product_links
CREATE POLICY "Users can view their own goal_product_links" ON public.goal_product_links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goal_product_links" ON public.goal_product_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal_product_links" ON public.goal_product_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal_product_links" ON public.goal_product_links FOR DELETE USING (auth.uid() = user_id);

-- Policies for bucket_allocations
CREATE POLICY "Users can view their own bucket_allocations" ON public.bucket_allocations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bucket_allocations" ON public.bucket_allocations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bucket_allocations" ON public.bucket_allocations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bucket_allocations" ON public.bucket_allocations FOR DELETE USING (auth.uid() = user_id);

-- Policies for product_implementations
CREATE POLICY "Users can view their own product_implementations" ON public.product_implementations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own product_implementations" ON public.product_implementations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own product_implementations" ON public.product_implementations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own product_implementations" ON public.product_implementations FOR DELETE USING (auth.uid() = user_id);

-- Policies for sla_commitments
CREATE POLICY "Users can view their own sla_commitments" ON public.sla_commitments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sla_commitments" ON public.sla_commitments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sla_commitments" ON public.sla_commitments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sla_commitments" ON public.sla_commitments FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Update Triggers
-- =============================================

CREATE TRIGGER update_financial_planning_workflows_updated_at BEFORE UPDATE ON public.financial_planning_workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fp_workflow_documents_updated_at BEFORE UPDATE ON public.fp_workflow_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_assets_updated_at BEFORE UPDATE ON public.client_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_liabilities_updated_at BEFORE UPDATE ON public.client_liabilities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_income_updated_at BEFORE UPDATE ON public.client_income FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_expenses_updated_at BEFORE UPDATE ON public.client_expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_goals_updated_at BEFORE UPDATE ON public.client_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goal_product_links_updated_at BEFORE UPDATE ON public.goal_product_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bucket_allocations_updated_at BEFORE UPDATE ON public.bucket_allocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_implementations_updated_at BEFORE UPDATE ON public.product_implementations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sla_commitments_updated_at BEFORE UPDATE ON public.sla_commitments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_financial_planning_workflows_client_id ON public.financial_planning_workflows(client_id);
CREATE INDEX idx_financial_planning_workflows_status ON public.financial_planning_workflows(status);
CREATE INDEX idx_client_assets_client_id ON public.client_assets(client_id);
CREATE INDEX idx_client_liabilities_client_id ON public.client_liabilities(client_id);
CREATE INDEX idx_client_income_client_id ON public.client_income(client_id);
CREATE INDEX idx_client_expenses_client_id ON public.client_expenses(client_id);
CREATE INDEX idx_client_goals_client_id ON public.client_goals(client_id);
CREATE INDEX idx_client_goals_workflow_id ON public.client_goals(workflow_id);
CREATE INDEX idx_goal_product_links_goal_id ON public.goal_product_links(goal_id);
CREATE INDEX idx_bucket_allocations_workflow_id ON public.bucket_allocations(workflow_id);
CREATE INDEX idx_product_implementations_workflow_id ON public.product_implementations(workflow_id);