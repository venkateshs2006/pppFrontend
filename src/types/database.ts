// أنواع البيانات لمنصة إدارة السياسات والإجراءات
export type UserRole =
  | 'super_admin'       // Added
  | 'admin'             // Added
  | 'system_admin'
  | 'project_manager'
  | 'consultant'
  | 'main_client'
  | 'sub_client'
  | 'policy_editor'
  | 'policy_reviewer'
  | 'quality_monitor';

export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'blocked';

export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type DeliverableType =
  | 'guide'
  | 'topic'
  | 'policy'
  | 'procedure'
  | 'template';

export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_response'
  | 'for_review'        // Added for approval workflow
  | 'redo'              // Added for rejection workflow
  | 'resolved'
  | 'closed';

export type TicketPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type SLAStatus =
  | 'on_track'
  | 'at_risk'
  | 'overdue';

export type SubscriptionPlan =
  | 'basic'
  | 'professional'
  | 'enterprise'
  | 'custom';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: UserRole;
  organization: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  subscription_plan: SubscriptionPlan;
  subscription_status: string;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  project_manager_id: string | null;
  consultant_id: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: UserRole;
  permissions: Record<string, any>;
  joined_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  ticket_id: string | null; // Added to link task to a ticket
  title: string;
  description: string | null;
  assigned_to: string | null;
  created_by: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  progress: number;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  project_id: string;
  parent_id: string | null;
  title: string;
  description: string | null;
  type: DeliverableType;
  content: string | null;
  file_url: string | null;
  version: number;
  status: string;
  created_by: string | null;
  reviewed_by: string | null;
  approved_by: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  name: string;
  file_type: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  uploaded_by: string | null;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface Ticket {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  created_by: string | null;
  assigned_to: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
  due_date: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string | null;
  comment: string;
  is_internal: boolean;
  created_at: string;
}

export interface SLATracking {
  id: string;
  project_id: string;
  task_id: string | null;
  ticket_id: string | null;
  sla_type: string;
  target_date: string;
  actual_date: string | null;
  status: SLAStatus;
  warning_threshold_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  is_read: boolean;
  is_email_sent: boolean;
  created_at: string;
}

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}