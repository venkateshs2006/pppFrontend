-- إنشاء حساب مدير النظام التجريبي
-- تاريخ الإنشاء: 2025-10-30 12:00

-- إدراج مدير النظام (سيتم ربطه بحساب المصادقة لاحقاً)
INSERT INTO user_profiles_2025_10_30_10_19 (id, user_id, full_name, role, organization, phone, is_active) VALUES
('admin-profile-2025-10-30-12-00', 'admin-user-2025-10-30-12-00', 'مدير النظام الرئيسي', 'system_admin', 'إدارة المنصة', '+966500000000', true)
ON CONFLICT (id) DO NOTHING;

-- إنشاء مؤسسة إدارية للمدير
INSERT INTO organizations_2025_10_30_10_19 (id, name, description, subscription_plan, subscription_status) VALUES
('admin-org-2025-10-30-12-00', 'إدارة المنصة', 'المؤسسة الإدارية الرئيسية للمنصة', 'enterprise', 'active')
ON CONFLICT (id) DO NOTHING;

-- تحديث بيانات المدير لربطه بالمؤسسة الإدارية
UPDATE user_profiles_2025_10_30_10_19 
SET organization = 'إدارة المنصة'
WHERE id = 'admin-profile-2025-10-30-12-00';

-- إنشاء إشعارات ترحيبية للمدير
INSERT INTO notifications_2025_10_30_10_19 (user_id, title, message, type, is_read) VALUES
('admin-profile-2025-10-30-12-00', 'مرحباً بك في منصة إدارة السياسات والإجراءات', 'تم إنشاء حسابك كمدير نظام بنجاح. يمكنك الآن الوصول لجميع وظائف المنصة.', 'system_notification', false),
('admin-profile-2025-10-30-12-00', 'دليل البدء السريع', 'ابدأ بمراجعة المشاريع الحالية وإعداد فريق العمل. تحقق من إعدادات النظام والصلاحيات.', 'system_notification', false);

-- إنشاء سجل مراجعة لإنشاء حساب المدير
INSERT INTO audit_logs_2025_10_30_10_19 (user_id, action, table_name, record_id, new_values) VALUES
('admin-profile-2025-10-30-12-00', 'CREATE_ADMIN_ACCOUNT', 'user_profiles_2025_10_30_10_19', 'admin-profile-2025-10-30-12-00', '{"role": "system_admin", "full_name": "مدير النظام الرئيسي"}');