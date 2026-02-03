-- Create opportunity_projects table
CREATE TABLE public.opportunity_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'growth',
  status TEXT NOT NULL DEFAULT 'Active',
  target_revenue NUMERIC DEFAULT 0,
  realized_revenue NUMERIC DEFAULT 0,
  target_date DATE,
  sla_days INTEGER DEFAULT 30,
  region_code TEXT NOT NULL DEFAULT 'ZA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ
);

-- Create project_opportunities table
CREATE TABLE public.project_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.opportunity_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  opportunity_type TEXT NOT NULL,
  client_name TEXT NOT NULL,
  current_value NUMERIC DEFAULT 0,
  potential_revenue NUMERIC DEFAULT 0,
  confidence INTEGER DEFAULT 50,
  reasoning TEXT,
  suggested_action TEXT,
  status TEXT NOT NULL DEFAULT 'Identified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.opportunity_projects(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.project_opportunities(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'Action',
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Not Started',
  due_date DATE,
  sla_deadline DATE,
  completed_at TIMESTAMPTZ,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS on all tables
ALTER TABLE public.opportunity_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for opportunity_projects
CREATE POLICY "Users can view their own opportunity_projects"
  ON public.opportunity_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own opportunity_projects"
  ON public.opportunity_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own opportunity_projects"
  ON public.opportunity_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own opportunity_projects"
  ON public.opportunity_projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for project_opportunities
CREATE POLICY "Users can view their own project_opportunities"
  ON public.project_opportunities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project_opportunities"
  ON public.project_opportunities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project_opportunities"
  ON public.project_opportunities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project_opportunities"
  ON public.project_opportunities FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for project_tasks
CREATE POLICY "Users can view their own project_tasks"
  ON public.project_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own project_tasks"
  ON public.project_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project_tasks"
  ON public.project_tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own project_tasks"
  ON public.project_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_opportunity_projects_user_id ON public.opportunity_projects(user_id);
CREATE INDEX idx_opportunity_projects_region ON public.opportunity_projects(region_code);
CREATE INDEX idx_opportunity_projects_status ON public.opportunity_projects(status);
CREATE INDEX idx_project_opportunities_project_id ON public.project_opportunities(project_id);
CREATE INDEX idx_project_opportunities_user_id ON public.project_opportunities(user_id);
CREATE INDEX idx_project_tasks_project_id ON public.project_tasks(project_id);
CREATE INDEX idx_project_tasks_user_id ON public.project_tasks(user_id);
CREATE INDEX idx_project_tasks_status ON public.project_tasks(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_opportunity_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_opportunity_projects_updated_at
  BEFORE UPDATE ON public.opportunity_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_opportunity_updated_at();

CREATE TRIGGER update_project_opportunities_updated_at
  BEFORE UPDATE ON public.project_opportunities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_opportunity_updated_at();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_opportunity_updated_at();