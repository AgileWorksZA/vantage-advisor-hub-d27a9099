-- =====================================================
-- FULL-FEATURED TICKETING SYSTEM DATABASE MIGRATION
-- =====================================================

-- 1. Create sequence for task numbers
CREATE SEQUENCE IF NOT EXISTS task_number_seq START WITH 1 INCREMENT BY 1;

-- 2. Extend tasks table with new ticketing columns
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS task_number INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS sla_deadline DATE,
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS resolution TEXT,
ADD COLUMN IF NOT EXISTS resolution_category TEXT,
ADD COLUMN IF NOT EXISTS internal_notes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS watchers UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'Manual',
ADD COLUMN IF NOT EXISTS source_reference TEXT,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS actual_hours NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- 3. Create trigger function to auto-assign task_number
CREATE OR REPLACE FUNCTION public.assign_task_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.task_number IS NULL THEN
    NEW.task_number := nextval('task_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 4. Create trigger for task_number
DROP TRIGGER IF EXISTS trigger_assign_task_number ON public.tasks;
CREATE TRIGGER trigger_assign_task_number
  BEFORE INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_task_number();

-- 5. Create trigger function for last_activity_at
CREATE OR REPLACE FUNCTION public.update_task_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 6. Create trigger for last_activity_at
DROP TRIGGER IF EXISTS trigger_update_task_last_activity ON public.tasks;
CREATE TRIGGER trigger_update_task_last_activity
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_task_last_activity();

-- =====================================================
-- JUNCTION TABLE: task_clients (many-to-many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'Primary',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, client_id)
);

-- Enable RLS
ALTER TABLE public.task_clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_clients
CREATE POLICY "Users can view their own task_clients" ON public.task_clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task_clients" ON public.task_clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task_clients" ON public.task_clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task_clients" ON public.task_clients
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- JUNCTION TABLE: task_documents
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID,
  UNIQUE(task_id, document_id)
);

-- Enable RLS
ALTER TABLE public.task_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_documents
CREATE POLICY "Users can view their own task_documents" ON public.task_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task_documents" ON public.task_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task_documents" ON public.task_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task_documents" ON public.task_documents
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- JUNCTION TABLE: task_communications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  communication_id UUID NOT NULL REFERENCES public.communications(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, communication_id)
);

-- Enable RLS
ALTER TABLE public.task_communications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_communications
CREATE POLICY "Users can view their own task_communications" ON public.task_communications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task_communications" ON public.task_communications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task_communications" ON public.task_communications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task_communications" ON public.task_communications
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- AUDIT TABLE: task_history
-- =====================================================
CREATE TABLE IF NOT EXISTS public.task_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_history
CREATE POLICY "Users can view their own task_history" ON public.task_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task_history" ON public.task_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_tasks_user_due_date ON public.tasks(user_id, due_date) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_tasks_is_pinned ON public.tasks(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_tasks_task_number ON public.tasks(user_id, task_number);
CREATE INDEX IF NOT EXISTS idx_tasks_sla_deadline ON public.tasks(user_id, sla_deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_last_activity ON public.tasks(user_id, last_activity_at);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(user_id, category);

CREATE INDEX IF NOT EXISTS idx_task_clients_task ON public.task_clients(task_id);
CREATE INDEX IF NOT EXISTS idx_task_clients_client ON public.task_clients(client_id);
CREATE INDEX IF NOT EXISTS idx_task_clients_user ON public.task_clients(user_id);

CREATE INDEX IF NOT EXISTS idx_task_documents_task ON public.task_documents(task_id);
CREATE INDEX IF NOT EXISTS idx_task_documents_user ON public.task_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_task_communications_task ON public.task_communications(task_id);
CREATE INDEX IF NOT EXISTS idx_task_communications_user ON public.task_communications(user_id);

CREATE INDEX IF NOT EXISTS idx_task_history_task ON public.task_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_history_user ON public.task_history(user_id);
CREATE INDEX IF NOT EXISTS idx_task_history_changed_at ON public.task_history(changed_at DESC);