-- إضافة بيانات تجريبية بسيطة ومصححة
-- تاريخ الإنشاء: 2025-10-30 13:00

-- حذف البيانات الموجودة أولاً لتجنب التضارب
DELETE FROM notifications_2025_10_30_10_19;
DELETE FROM sla_tracking_2025_10_30_10_19;
DELETE FROM tickets_2025_10_30_10_19;
DELETE FROM deliverables_2025_10_30_10_19;
DELETE FROM tasks_2025_10_30_10_19;
DELETE FROM projects_2025_10_30_10_19;
DELETE FROM organizations_2025_10_30_10_19;

-- إضافة المؤسسات التجريبية
INSERT INTO organizations_2025_10_30_10_19 (name, description, subscription_plan, subscription_status) VALUES
('شركة التطوير المتقدم', 'شركة رائدة في مجال تطوير الأنظمة والحلول التقنية', 'enterprise', 'active'),
('مؤسسة الاستشارات الإدارية', 'مؤسسة متخصصة في الاستشارات الإدارية وتطوير السياسات', 'professional', 'active'),
('شركة الحلول المبتكرة', 'شركة ناشئة في مجال الحلول التقنية المبتكرة', 'basic', 'active');

-- إضافة المشاريع التجريبية
WITH org1 AS (SELECT id FROM organizations_2025_10_30_10_19 WHERE name = 'شركة التطوير المتقدم' LIMIT 1),
     org2 AS (SELECT id FROM organizations_2025_10_30_10_19 WHERE name = 'مؤسسة الاستشارات الإدارية' LIMIT 1),
     org3 AS (SELECT id FROM organizations_2025_10_30_10_19 WHERE name = 'شركة الحلول المبتكرة' LIMIT 1)
INSERT INTO projects_2025_10_30_10_19 (name, description, status, start_date, end_date, budget, progress, organization_id) VALUES
('مشروع تطوير سياسات الموارد البشرية', 'مشروع شامل لتطوير وتحديث جميع سياسات وإجراءات الموارد البشرية في الشركة', 'active', '2024-01-15', '2024-06-30', 150000, 65, (SELECT id FROM org1)),
('مشروع إعادة هيكلة السياسات المالية', 'إعادة تصميم وتطوير السياسات المالية والمحاسبية وفقاً للمعايير الدولية', 'active', '2024-02-01', '2024-08-31', 200000, 45, (SELECT id FROM org2)),
('مشروع تطوير دليل الحوكمة المؤسسية', 'تطوير دليل شامل للحوكمة المؤسسية وإجراءات الامتثال', 'planning', '2024-03-01', '2024-12-31', 300000, 15, (SELECT id FROM org3)),
('مشروع تطوير سياسات الأمن السيبراني', 'وضع سياسات وإجراءات شاملة لأمن المعلومات والحماية السيبرانية', 'active', '2024-01-01', '2024-05-31', 120000, 80, (SELECT id FROM org1)),
('مشروع تطوير دليل العمليات التشغيلية', 'تطوير دليل شامل للعمليات التشغيلية وإجراءات العمل اليومية', 'completed', '2023-09-01', '2024-02-28', 180000, 100, (SELECT id FROM org2));

-- إضافة المهام التجريبية
WITH proj1 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير سياسات الموارد البشرية' LIMIT 1),
     proj2 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع إعادة هيكلة السياسات المالية' LIMIT 1),
     proj3 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير دليل الحوكمة المؤسسية' LIMIT 1),
     proj4 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير سياسات الأمن السيبراني' LIMIT 1),
     proj5 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير دليل العمليات التشغيلية' LIMIT 1)
INSERT INTO tasks_2025_10_30_10_19 (title, description, status, priority, due_date, estimated_hours, actual_hours, project_id) VALUES
('تحليل السياسات الحالية للموارد البشرية', 'مراجعة وتحليل جميع السياسات الحالية وتحديد نقاط التطوير المطلوبة', 'completed', 'high', '2024-02-15', 40, 38, (SELECT id FROM proj1)),
('وضع مسودة سياسة التوظيف الجديدة', 'كتابة مسودة أولية لسياسة التوظيف والاختيار المحدثة', 'in_progress', 'high', '2024-11-15', 32, 20, (SELECT id FROM proj1)),
('مراجعة إجراءات التقييم السنوي', 'تطوير وتحديث إجراءات تقييم الأداء السنوي للموظفين', 'review', 'medium', '2024-11-30', 24, 15, (SELECT id FROM proj1)),
('تطوير سياسة الإجازات والغياب', 'وضع سياسة شاملة لإدارة الإجازات وحالات الغياب', 'not_started', 'medium', '2024-12-15', 20, 0, (SELECT id FROM proj1)),
('مراجعة السياسات المالية الحالية', 'تحليل ومراجعة جميع السياسات المالية والمحاسبية الموجودة', 'completed', 'critical', '2024-03-01', 50, 48, (SELECT id FROM proj2)),
('تطوير سياسة إدارة المخاطر المالية', 'وضع سياسة شاملة لإدارة وتقييم المخاطر المالية', 'in_progress', 'high', '2024-11-20', 35, 18, (SELECT id FROM proj2)),
('إعداد دليل الإجراءات المحاسبية', 'تطوير دليل مفصل للإجراءات المحاسبية والمالية', 'not_started', 'high', '2024-12-31', 45, 0, (SELECT id FROM proj2)),
('وضع إطار الحوكمة المؤسسية', 'تطوير الإطار العام للحوكمة المؤسسية والامتثال', 'in_progress', 'critical', '2024-11-10', 60, 25, (SELECT id FROM proj3)),
('تطوير سياسات الأمن السيبراني', 'وضع سياسات شاملة لحماية أنظمة المعلومات', 'review', 'critical', '2024-11-05', 80, 75, (SELECT id FROM proj4)),
('إعداد دليل إجراءات الطوارئ', 'تطوير دليل شامل لإجراءات التعامل مع حالات الطوارئ', 'blocked', 'high', '2024-12-01', 30, 5, (SELECT id FROM proj5));

-- إضافة المخرجات التجريبية الأساسية
WITH proj1 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير سياسات الموارد البشرية' LIMIT 1),
     proj2 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع إعادة هيكلة السياسات المالية' LIMIT 1),
     proj3 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير دليل الحوكمة المؤسسية' LIMIT 1),
     proj4 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير سياسات الأمن السيبراني' LIMIT 1),
     proj5 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير دليل العمليات التشغيلية' LIMIT 1)
INSERT INTO deliverables_2025_10_30_10_19 (title, description, type, status, version, project_id, parent_id, order_index) VALUES
('دليل سياسات الموارد البشرية', 'الدليل الرئيسي لجميع سياسات وإجراءات الموارد البشرية', 'guide', 'draft', 1, (SELECT id FROM proj1), NULL, 1),
('دليل السياسات المالية', 'الدليل الشامل للسياسات المالية والمحاسبية', 'guide', 'review', 1, (SELECT id FROM proj2), NULL, 1),
('دليل الحوكمة المؤسسية', 'الدليل الرئيسي للحوكمة والامتثال المؤسسي', 'guide', 'draft', 1, (SELECT id FROM proj3), NULL, 1),
('دليل الأمن السيبراني', 'دليل شامل لسياسات وإجراءات الأمن السيبراني', 'guide', 'review', 2, (SELECT id FROM proj4), NULL, 1),
('دليل العمليات التشغيلية', 'دليل العمليات والإجراءات التشغيلية اليومية', 'guide', 'published', 3, (SELECT id FROM proj5), NULL, 1);

-- إضافة التذاكر التجريبية
WITH proj1 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير سياسات الموارد البشرية' LIMIT 1),
     proj2 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع إعادة هيكلة السياسات المالية' LIMIT 1),
     proj3 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير دليل الحوكمة المؤسسية' LIMIT 1),
     proj4 AS (SELECT id FROM projects_2025_10_30_10_19 WHERE name = 'مشروع تطوير سياسات الأمن السيبراني' LIMIT 1)
INSERT INTO tickets_2025_10_30_10_19 (title, description, status, priority, category, due_date, project_id) VALUES
('طلب تعديل سياسة الإجازات', 'يرجى تعديل سياسة الإجازات لتشمل إجازة الأمومة الممتدة', 'open', 'medium', 'تعديل محتوى', '2024-11-20', (SELECT id FROM proj1)),
('مشكلة في الوصول لملفات المشروع', 'لا يمكنني الوصول لملفات مشروع السياسات المالية', 'in_progress', 'high', 'دعم فني', '2024-11-05', (SELECT id FROM proj2)),
('استفسار حول إجراءات الموافقة', 'ما هي الخطوات المطلوبة للحصول على موافقة على السياسة الجديدة؟', 'waiting_response', 'low', 'استفسار', '2024-11-15', (SELECT id FROM proj3)),
('طلب إضافة قسم جديد للدليل', 'نحتاج لإضافة قسم خاص بسياسات العمل عن بُعد', 'resolved', 'medium', 'تعديل محتوى', '2024-10-30', (SELECT id FROM proj1)),
('خطأ في تنسيق الوثيقة', 'يوجد خطأ في تنسيق وثيقة سياسة المشتريات', 'closed', 'low', 'دعم فني', '2024-10-25', (SELECT id FROM proj2)),
('طلب مراجعة عاجلة لسياسة الأمان', 'نحتاج مراجعة عاجلة لسياسة الأمان بعد الحادث الأخير', 'open', 'urgent', 'مراجعة عاجلة', '2024-11-02', (SELECT id FROM proj4));

-- إضافة الإشعارات التجريبية
INSERT INTO notifications_2025_10_30_10_19 (user_id, title, message, type, is_read) VALUES
('system', 'مرحباً بك في منصة إدارة السياسات والإجراءات', 'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استكشاف المنصة وإدارة مشاريعك.', 'system_notification', false),
('system', 'تذكير: مهمة قريبة من الانتهاء', 'مهمة "وضع مسودة سياسة التوظيف الجديدة" تحتاج للمتابعة قبل الموعد النهائي.', 'task_reminder', false),
('system', 'تحديث حالة المشروع', 'تم تحديث حالة مشروع "تطوير سياسات الموارد البشرية" إلى 65% مكتمل.', 'project_update', true),
('system', 'تذكرة جديدة تحتاج للمراجعة', 'تم إنشاء تذكرة جديدة بعنوان "طلب تعديل سياسة الإجازات" وتحتاج للمراجعة.', 'ticket_notification', false),
('system', 'تحذير SLA', 'تذكرة "مشكلة في الوصول لملفات المشروع" تجاوزت الموعد النهائي المحدد لها.', 'sla_warning', false),
('system', 'تحذير SLA عاجل', 'تذكرة "طلب مراجعة عاجلة لسياسة الأمان" تجاوزت الموعد النهائي وتحتاج لتدخل فوري.', 'sla_warning', false);