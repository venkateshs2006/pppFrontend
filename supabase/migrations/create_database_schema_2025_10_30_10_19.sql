-- منصة إدارة السياسات والإجراءات - إنشاء قاعدة البيانات
-- تاريخ الإنشاء: 2025-10-30 10:19

-- إنشاء enum للأدوار
CREATE TYPE user_role_2025_10_30_10_19 AS ENUM (
  'system_admin',
  'project_manager', 
  'consultant',
  'main_client',
  'sub_client',
  'policy_editor',
  'policy_reviewer',
  'quality_monitor'
);

-- إنشاء enum لحالة المشروع
CREATE TYPE project_status_2025_10_30_10_19 AS ENUM (
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled'
);

-- إنشاء enum لحالة المهمة
CREATE TYPE task_status_2025_10_30_10_19 AS ENUM (
  'not_started',
  'in_progress',
  'review',
  'completed',
  'blocked'
);

-- إنشاء enum لأولوية المهمة
CREATE TYPE task_priority_2025_10_30_10_19 AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- إنشاء enum لنوع المخرجات
CREATE TYPE deliverable_type_2025_10_30_10_19 AS ENUM (
  'guide',
  'topic',
  'policy',
  'procedure',
  'template'
);

-- إنشاء enum لحالة التذكرة
CREATE TYPE ticket_status_2025_10_30_10_19 AS ENUM (
  'open',
  'in_progress',
  'waiting_response',
  'resolved',
  'closed'
);

-- إنشاء enum لأولوية التذكرة
CREATE TYPE ticket_priority_2025_10_30_10_19 AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- إنشاء enum لحالة SLA
CREATE TYPE sla_status_2025_10_30_10_19 AS ENUM (
  'on_track',
  'at_risk',
  'overdue'
);

-- إنشاء enum لخطط الاشتراك
CREATE TYPE subscription_plan_2025_10_30_10_19 AS ENUM (
  'basic',
  'professional',
  'enterprise',
  'custom'
);

-- جدول الملفات الشخصية للمستخدمين
CREATE TABLE user_profiles_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role user_role_2025_10_30_10_19 NOT NULL DEFAULT 'sub_client',
  organization TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المؤسسات
CREATE TABLE organizations_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  subscription_plan subscription_plan_2025_10_30_10_19 DEFAULT 'basic',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المشاريع
CREATE TABLE projects_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations_2025_10_30_10_19(id) ON DELETE CASCADE,
  project_manager_id UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  consultant_id UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  status project_status_2025_10_30_10_19 DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول أعضاء المشروع
CREATE TABLE project_members_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_2025_10_30_10_19(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles_2025_10_30_10_19(id) ON DELETE CASCADE,
  role user_role_2025_10_30_10_19 NOT NULL,
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- جدول المهام
CREATE TABLE tasks_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_2025_10_30_10_19(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  created_by UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  status task_status_2025_10_30_10_19 DEFAULT 'not_started',
  priority task_priority_2025_10_30_10_19 DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  completed_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  dependencies JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول المخرجات (Deliverables Tree)
CREATE TABLE deliverables_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_2025_10_30_10_19(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES deliverables_2025_10_30_10_19(id),
  title TEXT NOT NULL,
  description TEXT,
  type deliverable_type_2025_10_30_10_19 NOT NULL,
  content TEXT,
  file_url TEXT,
  version INTEGER DEFAULT 1,
  status TEXT DEFAULT 'draft',
  created_by UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  reviewed_by UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  approved_by UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الملفات
CREATE TABLE project_files_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_2025_10_30_10_19(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- proposal, charter, timeline, document
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول التذاكر
CREATE TABLE tickets_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_2025_10_30_10_19(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  assigned_to UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  status ticket_status_2025_10_30_10_19 DEFAULT 'open',
  priority ticket_priority_2025_10_30_10_19 DEFAULT 'medium',
  category TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تعليقات التذاكر
CREATE TABLE ticket_comments_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets_2025_10_30_10_19(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول SLA
CREATE TABLE sla_tracking_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects_2025_10_30_10_19(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks_2025_10_30_10_19(id),
  ticket_id UUID REFERENCES tickets_2025_10_30_10_19(id),
  sla_type TEXT NOT NULL, -- task_completion, ticket_response, project_milestone
  target_date TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_date TIMESTAMP WITH TIME ZONE,
  status sla_status_2025_10_30_10_19 DEFAULT 'on_track',
  warning_threshold_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الإشعارات
CREATE TABLE notifications_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles_2025_10_30_10_19(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- sla_warning, task_assigned, project_update, ticket_created
  related_id UUID, -- ID of related project, task, or ticket
  is_read BOOLEAN DEFAULT false,
  is_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول سجلات المراجعة
CREATE TABLE audit_logs_2025_10_30_10_19 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles_2025_10_30_10_19(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX idx_user_profiles_user_id_2025_10_30_10_19 ON user_profiles_2025_10_30_10_19(user_id);
CREATE INDEX idx_user_profiles_role_2025_10_30_10_19 ON user_profiles_2025_10_30_10_19(role);
CREATE INDEX idx_projects_organization_2025_10_30_10_19 ON projects_2025_10_30_10_19(organization_id);
CREATE INDEX idx_projects_status_2025_10_30_10_19 ON projects_2025_10_30_10_19(status);
CREATE INDEX idx_tasks_project_2025_10_30_10_19 ON tasks_2025_10_30_10_19(project_id);
CREATE INDEX idx_tasks_assigned_2025_10_30_10_19 ON tasks_2025_10_30_10_19(assigned_to);
CREATE INDEX idx_tasks_status_2025_10_30_10_19 ON tasks_2025_10_30_10_19(status);
CREATE INDEX idx_deliverables_project_2025_10_30_10_19 ON deliverables_2025_10_30_10_19(project_id);
CREATE INDEX idx_deliverables_parent_2025_10_30_10_19 ON deliverables_2025_10_30_10_19(parent_id);
CREATE INDEX idx_tickets_project_2025_10_30_10_19 ON tickets_2025_10_30_10_19(project_id);
CREATE INDEX idx_tickets_status_2025_10_30_10_19 ON tickets_2025_10_30_10_19(status);
CREATE INDEX idx_sla_project_2025_10_30_10_19 ON sla_tracking_2025_10_30_10_19(project_id);
CREATE INDEX idx_sla_status_2025_10_30_10_19 ON sla_tracking_2025_10_30_10_19(status);
CREATE INDEX idx_notifications_user_2025_10_30_10_19 ON notifications_2025_10_30_10_19(user_id);
CREATE INDEX idx_notifications_read_2025_10_30_10_19 ON notifications_2025_10_30_10_19(is_read);
CREATE INDEX idx_audit_logs_user_2025_10_30_10_19 ON audit_logs_2025_10_30_10_19(user_id);
CREATE INDEX idx_audit_logs_table_2025_10_30_10_19 ON audit_logs_2025_10_30_10_19(table_name);

-- إنشاء trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column_2025_10_30_10_19()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق trigger على الجداول المناسبة
CREATE TRIGGER update_user_profiles_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON user_profiles_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();

CREATE TRIGGER update_organizations_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON organizations_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();

CREATE TRIGGER update_projects_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON projects_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();

CREATE TRIGGER update_tasks_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON tasks_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();

CREATE TRIGGER update_deliverables_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON deliverables_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();

CREATE TRIGGER update_tickets_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON tickets_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();

CREATE TRIGGER update_sla_tracking_updated_at_2025_10_30_10_19 
    BEFORE UPDATE ON sla_tracking_2025_10_30_10_19 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column_2025_10_30_10_19();