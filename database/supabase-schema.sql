-- Job Handover System - Supabase Schema
-- This schema is designed to work with Supabase's built-in features

-- Enable Row Level Security (RLS) and necessary extensions
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your_jwt_secret_here';

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  manager_id UUID REFERENCES public.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_role VARCHAR(100) NOT NULL,
  description TEXT,
  sections JSONB NOT NULL DEFAULT '[]',
  tasks JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handovers table
CREATE TABLE IF NOT EXISTS public.handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.users(id),
  manager_id UUID REFERENCES public.users(id),
  template_id UUID REFERENCES public.templates(id),
  role VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  form_data JSONB DEFAULT '{}',
  manager_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handover tasks table
CREATE TABLE IF NOT EXISTS public.handover_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handover_id UUID NOT NULL REFERENCES public.handovers(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  file_path VARCHAR(500),
  notes TEXT,
  task_order INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Handover approval history table
CREATE TABLE IF NOT EXISTS public.handover_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handover_id UUID NOT NULL REFERENCES public.handovers(id),
  manager_id UUID NOT NULL REFERENCES public.users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_manager_id ON public.users(manager_id);
CREATE INDEX IF NOT EXISTS idx_templates_target_role ON public.templates(target_role);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON public.templates(is_active);
CREATE INDEX IF NOT EXISTS idx_handovers_employee_id ON public.handovers(employee_id);
CREATE INDEX IF NOT EXISTS idx_handovers_manager_id ON public.handovers(manager_id);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON public.handovers(status);
CREATE INDEX IF NOT EXISTS idx_handover_tasks_handover_id ON public.handover_tasks(handover_id);
CREATE INDEX IF NOT EXISTS idx_handover_tasks_completed ON public.handover_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_handovers_updated_at BEFORE UPDATE ON public.handovers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_handover_tasks_updated_at BEFORE UPDATE ON public.handover_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Managers can read their team members' data
CREATE POLICY "Managers can read team data" ON public.users
  FOR SELECT USING (auth.uid() = manager_id);

-- Templates are readable by everyone (we'll handle role-based access in the app)
CREATE POLICY "Templates readable by authenticated users" ON public.templates
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify templates
CREATE POLICY "Only admins can modify templates" ON public.templates
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Handovers accessible by employee or manager
CREATE POLICY "Handovers accessible by employee or manager" ON public.handovers
  FOR SELECT TO authenticated USING (
    employee_id = auth.uid() OR 
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Employees can insert their own handovers
CREATE POLICY "Employees can insert own handovers" ON public.handovers
  FOR INSERT TO authenticated WITH CHECK (employee_id = auth.uid());

-- Employees can update their own draft handovers
CREATE POLICY "Employees can update own draft handovers" ON public.handovers
  FOR UPDATE TO authenticated USING (
    employee_id = auth.uid() AND status = 'draft'
  );

-- Managers can update handovers for approval/rejection
CREATE POLICY "Managers can update for approval" ON public.handovers
  FOR UPDATE TO authenticated USING (
    manager_id = auth.uid() AND status = 'pending_review'
  );

-- Handover tasks follow the same access pattern as handovers
CREATE POLICY "Tasks accessible via handover access" ON public.handover_tasks
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.handovers h
      WHERE h.id = handover_id AND (
        h.employee_id = auth.uid() OR 
        h.manager_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.users 
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- Users can only see their own notifications
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Insert some sample data for testing (optional)
-- INSERT INTO public.users (email, password_hash, name, role, department) VALUES
-- ('admin@company.com', '$2b$12$example_hash', 'System Admin', 'admin', 'IT'),
-- ('manager@company.com', '$2b$12$example_hash', 'John Manager', 'manager', 'Engineering'),
-- ('employee@company.com', '$2b$12$example_hash', 'Jane Employee', 'developer', 'Engineering');

-- Sample template for developers
-- INSERT INTO public.templates (target_role, description, sections, tasks) VALUES
-- ('developer', 'Standard developer handover template', 
--  '[{"name": "Projects", "fields": [{"name": "current_projects", "type": "textarea", "label": "Current Projects"}]}]',
--  '[{"description": "Document all active projects", "is_required": true}]'
-- );

COMMENT ON TABLE public.users IS 'System users with role-based access';
COMMENT ON TABLE public.templates IS 'Handover templates for different roles';
COMMENT ON TABLE public.handovers IS 'Individual handover instances';
COMMENT ON TABLE public.handover_tasks IS 'Tasks within each handover';
COMMENT ON TABLE public.handover_approvals IS 'Approval history for handovers';
COMMENT ON TABLE public.audit_logs IS 'System audit trail';
COMMENT ON TABLE public.notifications IS 'User notifications';