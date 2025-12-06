-- سياسات الأمان RLS لمنصة إدارة السياسات والإجراءات
-- تاريخ الإنشاء: 2025-10-30 10:19

-- تفعيل RLS على جميع الجداول
ALTER TABLE user_profiles_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_tracking_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_2025_10_30_10_19 ENABLE ROW LEVEL SECURITY;

-- سياسات جدول الملفات الشخصية
CREATE POLICY "Users can view their own profile" ON user_profiles_2025_10_30_10_19
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles_2025_10_30_10_19
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System admins can view all profiles" ON user_profiles_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 
            WHERE user_id = auth.uid() AND role = 'system_admin'
        )
    );

-- سياسات جدول المؤسسات
CREATE POLICY "Organization members can view their organization" ON organizations_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() 
            AND up.organization = organizations_2025_10_30_10_19.name
        )
    );

CREATE POLICY "System admins can manage organizations" ON organizations_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 
            WHERE user_id = auth.uid() AND role = 'system_admin'
        )
    );

-- سياسات جدول المشاريع
CREATE POLICY "Project members can view their projects" ON projects_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = projects_2025_10_30_10_19.id
        )
    );

CREATE POLICY "Project managers can manage their projects" ON projects_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() 
            AND (up.id = projects_2025_10_30_10_19.project_manager_id OR up.role IN ('system_admin', 'project_manager'))
        )
    );

-- سياسات جدول أعضاء المشروع
CREATE POLICY "Project members can view project membership" ON project_members_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() 
            AND (up.id = project_members_2025_10_30_10_19.user_id OR up.role IN ('system_admin', 'project_manager'))
        )
    );

CREATE POLICY "Project managers can manage project membership" ON project_members_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects_2025_10_30_10_19 p
            JOIN user_profiles_2025_10_30_10_19 up ON up.user_id = auth.uid()
            WHERE p.id = project_members_2025_10_30_10_19.project_id
            AND (up.id = p.project_manager_id OR up.role IN ('system_admin', 'project_manager'))
        )
    );

-- سياسات جدول المهام
CREATE POLICY "Users can view tasks in their projects" ON tasks_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = tasks_2025_10_30_10_19.project_id
        )
    );

CREATE POLICY "Users can update their assigned tasks" ON tasks_2025_10_30_10_19
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() 
            AND (up.id = tasks_2025_10_30_10_19.assigned_to OR up.role IN ('system_admin', 'project_manager'))
        )
    );

CREATE POLICY "Project managers can manage tasks" ON tasks_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects_2025_10_30_10_19 p
            JOIN user_profiles_2025_10_30_10_19 up ON up.user_id = auth.uid()
            WHERE p.id = tasks_2025_10_30_10_19.project_id
            AND (up.id = p.project_manager_id OR up.role IN ('system_admin', 'project_manager'))
        )
    );

-- سياسات جدول المخرجات
CREATE POLICY "Project members can view deliverables" ON deliverables_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = deliverables_2025_10_30_10_19.project_id
        )
    );

CREATE POLICY "Policy editors can manage deliverables" ON deliverables_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() 
            AND pm.project_id = deliverables_2025_10_30_10_19.project_id
            AND up.role IN ('system_admin', 'project_manager', 'consultant', 'policy_editor')
        )
    );

-- سياسات جدول الملفات
CREATE POLICY "Project members can view project files" ON project_files_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = project_files_2025_10_30_10_19.project_id
        )
    );

CREATE POLICY "Authorized users can upload files" ON project_files_2025_10_30_10_19
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() 
            AND pm.project_id = project_files_2025_10_30_10_19.project_id
            AND up.role IN ('system_admin', 'project_manager', 'consultant')
        )
    );

-- سياسات جدول التذاكر
CREATE POLICY "Project members can view tickets" ON tickets_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = tickets_2025_10_30_10_19.project_id
        )
    );

CREATE POLICY "Users can create tickets in their projects" ON tickets_2025_10_30_10_19
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = tickets_2025_10_30_10_19.project_id
        )
    );

-- سياسات جدول تعليقات التذاكر
CREATE POLICY "Users can view ticket comments" ON ticket_comments_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tickets_2025_10_30_10_19 t
            JOIN project_members_2025_10_30_10_19 pm ON pm.project_id = t.project_id
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND t.id = ticket_comments_2025_10_30_10_19.ticket_id
        )
    );

CREATE POLICY "Users can add comments to tickets" ON ticket_comments_2025_10_30_10_19
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() AND up.id = ticket_comments_2025_10_30_10_19.user_id
        )
    );

-- سياسات جدول SLA
CREATE POLICY "Project members can view SLA tracking" ON sla_tracking_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members_2025_10_30_10_19 pm
            JOIN user_profiles_2025_10_30_10_19 up ON pm.user_id = up.id
            WHERE up.user_id = auth.uid() AND pm.project_id = sla_tracking_2025_10_30_10_19.project_id
        )
    );

CREATE POLICY "Project managers can manage SLA tracking" ON sla_tracking_2025_10_30_10_19
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects_2025_10_30_10_19 p
            JOIN user_profiles_2025_10_30_10_19 up ON up.user_id = auth.uid()
            WHERE p.id = sla_tracking_2025_10_30_10_19.project_id
            AND (up.id = p.project_manager_id OR up.role IN ('system_admin', 'project_manager'))
        )
    );

-- سياسات جدول الإشعارات
CREATE POLICY "Users can view their own notifications" ON notifications_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() AND up.id = notifications_2025_10_30_10_19.user_id
        )
    );

CREATE POLICY "Users can update their own notifications" ON notifications_2025_10_30_10_19
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() AND up.id = notifications_2025_10_30_10_19.user_id
        )
    );

-- سياسات جدول سجلات المراجعة
CREATE POLICY "System admins can view audit logs" ON audit_logs_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 
            WHERE user_id = auth.uid() AND role = 'system_admin'
        )
    );

CREATE POLICY "Users can view their own audit logs" ON audit_logs_2025_10_30_10_19
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles_2025_10_30_10_19 up
            WHERE up.user_id = auth.uid() AND up.id = audit_logs_2025_10_30_10_19.user_id
        )
    );