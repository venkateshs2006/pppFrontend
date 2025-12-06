-- إضافة بيانات تجريبية شاملة للمنصة
-- تاريخ الإنشاء: 2025-10-30 13:00

-- إضافة المؤسسات التجريبية
INSERT INTO organizations_2025_10_30_10_19 (id, name, description, subscription_plan, subscription_status) VALUES
(gen_random_uuid(), 'شركة التطوير المتقدم', 'شركة رائدة في مجال تطوير الأنظمة والحلول التقنية', 'enterprise', 'active'),
(gen_random_uuid(), 'مؤسسة الاستشارات الإدارية', 'مؤسسة متخصصة في الاستشارات الإدارية وتطوير السياسات', 'professional', 'active'),
(gen_random_uuid(), 'شركة الحلول المبتكرة', 'شركة ناشئة في مجال الحلول التقنية المبتكرة', 'basic', 'active')
ON CONFLICT (id) DO NOTHING;

-- إضافة المشاريع التجريبية
INSERT INTO projects_2025_10_30_10_19 (id, name, description, status, start_date, end_date, budget, progress, organization_id) VALUES
(gen_random_uuid(), 'مشروع تطوير سياسات الموارد البشرية', 'مشروع شامل لتطوير وتحديث جميع سياسات وإجراءات الموارد البشرية في الشركة', 'active', '2024-01-15', '2024-06-30', 150000, 65, (SELECT id FROM organizations_2025_10_30_10_19 LIMIT 1)),
(gen_random_uuid(), 'مشروع إعادة هيكلة السياسات المالية', 'إعادة تصميم وتطوير السياسات المالية والمحاسبية وفقاً للمعايير الدولية', 'active', '2024-02-01', '2024-08-31', 200000, 45, (SELECT id FROM organizations_2025_10_30_10_19 LIMIT 1 OFFSET 1)),
(gen_random_uuid(), 'مشروع تطوير دليل الحوكمة المؤسسية', 'تطوير دليل شامل للحوكمة المؤسسية وإجراءات الامتثال', 'planning', '2024-03-01', '2024-12-31', 300000, 15, (SELECT id FROM organizations_2025_10_30_10_19 LIMIT 1 OFFSET 2)),
(gen_random_uuid(), 'مشروع تطوير سياسات الأمن السيبراني', 'وضع سياسات وإجراءات شاملة لأمن المعلومات والحماية السيبرانية', 'active', '2024-01-01', '2024-05-31', 120000, 80, (SELECT id FROM organizations_2025_10_30_10_19 LIMIT 1)),
(gen_random_uuid(), 'مشروع تطوير دليل العمليات التشغيلية', 'تطوير دليل شامل للعمليات التشغيلية وإجراءات العمل اليومية', 'completed', '2023-09-01', '2024-02-28', 180000, 100, (SELECT id FROM organizations_2025_10_30_10_19 LIMIT 1 OFFSET 1))
ON CONFLICT (id) DO NOTHING;

-- إضافة المهام التجريبية
INSERT INTO tasks_2025_10_30_10_19 (id, title, description, status, priority, due_date, estimated_hours, actual_hours, project_id) VALUES
(gen_random_uuid(), 'تحليل السياسات الحالية للموارد البشرية', 'مراجعة وتحليل جميع السياسات الحالية وتحديد نقاط التطوير المطلوبة', 'completed', 'high', '2024-02-15', 40, 38, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1)),
(gen_random_uuid(), 'وضع مسودة سياسة التوظيف الجديدة', 'كتابة مسودة أولية لسياسة التوظيف والاختيار المحدثة', 'in_progress', 'high', '2024-11-15', 32, 20, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1)),
(gen_random_uuid(), 'مراجعة إجراءات التقييم السنوي', 'تطوير وتحديث إجراءات تقييم الأداء السنوي للموظفين', 'review', 'medium', '2024-11-30', 24, 15, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1)),
(gen_random_uuid(), 'تطوير سياسة الإجازات والغياب', 'وضع سياسة شاملة لإدارة الإجازات وحالات الغياب', 'todo', 'medium', '2024-12-15', 20, 0, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1)),
(gen_random_uuid(), 'مراجعة السياسات المالية الحالية', 'تحليل ومراجعة جميع السياسات المالية والمحاسبية الموجودة', 'completed', 'critical', '2024-03-01', 50, 48, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%السياسات المالية%' LIMIT 1)),
(gen_random_uuid(), 'تطوير سياسة إدارة المخاطر المالية', 'وضع سياسة شاملة لإدارة وتقييم المخاطر المالية', 'in_progress', 'high', '2024-11-20', 35, 18, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%السياسات المالية%' LIMIT 1)),
(gen_random_uuid(), 'إعداد دليل الإجراءات المحاسبية', 'تطوير دليل مفصل للإجراءات المحاسبية والمالية', 'todo', 'high', '2024-12-31', 45, 0, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%السياسات المالية%' LIMIT 1)),
(gen_random_uuid(), 'وضع إطار الحوكمة المؤسسية', 'تطوير الإطار العام للحوكمة المؤسسية والامتثال', 'in_progress', 'critical', '2024-11-10', 60, 25, (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الحوكمة%' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- إضافة المخرجات التجريبية (شجرة المخرجات)
INSERT INTO deliverables_2025_10_30_10_19 (id, title, description, type, status, version, project_id, parent_id, order_index) VALUES
(gen_random_uuid(), 'دليل سياسات الموارد البشرية', 'الدليل الرئيسي لجميع سياسات وإجراءات الموارد البشرية', 'guide', 'draft', '1.0', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1), NULL, 1),
(gen_random_uuid(), 'سياسات التوظيف والاختيار', 'مجموعة السياسات المتعلقة بعمليات التوظيف والاختيار', 'topic', 'review', '1.0', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1), (SELECT id FROM deliverables_2025_10_30_10_19 WHERE title = 'دليل سياسات الموارد البشرية' LIMIT 1), 1),
(gen_random_uuid(), 'سياسة التوظيف الداخلي', 'سياسة تنظم عمليات التوظيف الداخلي والترقيات', 'policy', 'approved', '1.2', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1), (SELECT id FROM deliverables_2025_10_30_10_19 WHERE title = 'سياسات التوظيف والاختيار' LIMIT 1), 1),
(gen_random_uuid(), 'إجراءات المقابلات الشخصية', 'إجراءات مفصلة لتنفيذ المقابلات الشخصية', 'procedure', 'draft', '1.0', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1), (SELECT id FROM deliverables_2025_10_30_10_19 WHERE title = 'سياسات التوظيف والاختيار' LIMIT 1), 2),
(gen_random_uuid(), 'قالب تقييم المرشحين', 'قالب موحد لتقييم المرشحين للوظائف', 'template', 'published', '2.0', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1), (SELECT id FROM deliverables_2025_10_30_10_19 WHERE title = 'سياسات التوظيف والاختيار' LIMIT 1), 3),
(gen_random_uuid(), 'دليل السياسات المالية', 'الدليل الشامل للسياسات المالية والمحاسبية', 'guide', 'review', '1.0', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%السياسات المالية%' LIMIT 1), NULL, 1)
ON CONFLICT (id) DO NOTHING;

-- إضافة التذاكر التجريبية
INSERT INTO tickets_2025_10_30_10_19 (id, title, description, status, priority, category, due_date, project_id) VALUES
(gen_random_uuid(), 'طلب تعديل سياسة الإجازات', 'يرجى تعديل سياسة الإجازات لتشمل إجازة الأمومة الممتدة', 'open', 'medium', 'تعديل محتوى', '2024-11-20', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1)),
(gen_random_uuid(), 'مشكلة في الوصول لملفات المشروع', 'لا يمكنني الوصول لملفات مشروع السياسات المالية', 'in_progress', 'high', 'دعم فني', '2024-11-05', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%السياسات المالية%' LIMIT 1)),
(gen_random_uuid(), 'استفسار حول إجراءات الموافقة', 'ما هي الخطوات المطلوبة للحصول على موافقة على السياسة الجديدة؟', 'waiting_response', 'low', 'استفسار', '2024-11-15', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الحوكمة%' LIMIT 1)),
(gen_random_uuid(), 'طلب إضافة قسم جديد للدليل', 'نحتاج لإضافة قسم خاص بسياسات العمل عن بُعد', 'resolved', 'medium', 'تعديل محتوى', '2024-10-30', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%الموارد البشرية%' LIMIT 1)),
(gen_random_uuid(), 'خطأ في تنسيق الوثيقة', 'يوجد خطأ في تنسيق وثيقة سياسة المشتريات', 'closed', 'low', 'دعم فني', '2024-10-25', (SELECT id FROM projects_2025_10_30_10_19 WHERE name LIKE '%السياسات المالية%' LIMIT 1))
ON CONFLICT (id) DO NOTHING;

-- إضافة بيانات تتبع SLA
INSERT INTO sla_tracking_2025_10_30_10_19 (id, item_type, item_id, sla_deadline, status, response_time_hours, resolution_time_hours) VALUES
(gen_random_uuid(), 'task', (SELECT id FROM tasks_2025_10_30_10_19 WHERE title LIKE '%تحليل السياسات%' LIMIT 1), '2024-02-15 23:59:59', 'met', 2, 38),
(gen_random_uuid(), 'task', (SELECT id FROM tasks_2025_10_30_10_19 WHERE title LIKE '%مسودة سياسة التوظيف%' LIMIT 1), '2024-11-15 23:59:59', 'at_risk', 4, NULL),
(gen_random_uuid(), 'ticket', (SELECT id FROM tickets_2025_10_30_10_19 WHERE title LIKE '%مشكلة في الوصول%' LIMIT 1), '2024-11-05 23:59:59', 'overdue', 1, NULL),
(gen_random_uuid(), 'ticket', (SELECT id FROM tickets_2025_10_30_10_19 WHERE title LIKE '%طلب إضافة قسم%' LIMIT 1), '2024-10-30 23:59:59', 'met', 3, 24),
(gen_random_uuid(), 'task', (SELECT id FROM tasks_2025_10_30_10_19 WHERE title LIKE '%وضع إطار الحوكمة%' LIMIT 1), '2024-11-10 23:59:59', 'at_risk', 6, NULL)
ON CONFLICT (id) DO NOTHING;

-- إضافة الإشعارات التجريبية
INSERT INTO notifications_2025_10_30_10_19 (user_id, title, message, type, is_read) VALUES
('system', 'مرحباً بك في منصة إدارة السياسات والإجراءات', 'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استكشاف المنصة وإدارة مشاريعك.', 'system_notification', false),
('system', 'تذكير: مهمة قريبة من الانتهاء', 'مهمة "وضع مسودة سياسة التوظيف الجديدة" تحتاج للمتابعة قبل الموعد النهائي.', 'task_reminder', false),
('system', 'تحديث حالة المشروع', 'تم تحديث حالة مشروع "تطوير سياسات الموارد البشرية" إلى 65% مكتمل.', 'project_update', true),
('system', 'تذكرة جديدة تحتاج للمراجعة', 'تم إنشاء تذكرة جديدة بعنوان "طلب تعديل سياسة الإجازات" وتحتاج للمراجعة.', 'ticket_notification', false),
('system', 'تحذير SLA', 'تذكرة "مشكلة في الوصول لملفات المشروع" تجاوزت الموعد النهائي المحدد لها.', 'sla_warning', false)
ON CONFLICT (user_id, title) DO NOTHING;