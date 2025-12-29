// src/types/api.ts

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


export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    username: string;
    email: string;
    role: string;
}

export interface ProjectDTO {
    id: string; // UUID
    organizationId: number;
    name: string;
    description: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    startDate: string;
    endDate: string;
    budget: number;
    progress: number;
    projectManagerId: number;
    projectManagerName: string;
    createdAt: string;
    updatedAt: string;
}

export interface DashboardStatsDTO {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    pendingApprovals: number;
    openTickets: number;
    overallProgress: number;
}

export interface RecentProjectDTO {
    id: string;
    title: string;
    titleEn: string;
    progress: number;
    status: string;
    clientName: string;
    clientNameEn: string;
    dueDate: string;
}

export interface RecentDeliverableDTO {
    id: string;
    title: string;
    titleEn: string;
    type: string;
    status: string;
    projectName: string;
    projectNameEn: string;
    version: string;
}

export interface RecentTicketDTO {
    id: string;
    title: string;
    titleEn: string;
    priority: string;
    status: string;
    projectName: string;
    projectNameEn: string;
    createdAt: string;
}

export interface DashboardResponseDTO {
    stats: DashboardStatsDTO;
    recentProjects: RecentProjectDTO[];
    recentDeliverables: RecentDeliverableDTO[];
    recentTickets: RecentTicketDTO[];
    // kpis and upcomingDeadlines can be added if the backend returns them
}
export type TicketStatus =
    | 'open'
    | 'in_progress'
    | 'pending_client_approval'
    | 'resolved'
    | 'closed'
    | 'redo';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketDTO {
    id: string; // UUID
    projectId: string; // UUID
    title: string;
    description?: string;
    status: TicketStatus;
    priority: TicketPriority;
    category?: string;
    dueDate?: string; // ISO Date Time
    assignedTo?: number; // User ID
    createdBy?: number; // User ID
    createdAt: string;
    resolvedAt?: string;
}

export type DeliverableType = 'guide' | 'topic' | 'policy' | 'procedure' | 'template' | 'report';

export interface DeliverableDTO {
    id: string; // UUID
    projectId: string; // UUID
    parentId?: string;
    title: string;
    description?: string;
    type: DeliverableType;
    status?: string;
    version?: string;
    orderIndex?: number;
    createdById?: number;
    createdByName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TicketCommentDTO {
    id: string;
    ticketId: string;
    userId: number;
    comment: string;
    isInternal: boolean;
    createdAt: string;
}