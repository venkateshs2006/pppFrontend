// src/types/api.ts

// --- Common ---
export interface ApiResponseString {
    success: boolean;
    message: string;
    data: string;
    error?: string;
    timestamp: string;
}

export interface ApiResponseLong {
    success: boolean;
    message: string;
    data: number;
    error?: string;
    timestamp: string;
}

export interface Pageable {
    page: number;
    size: number;
    sort?: string[];
}

// --- Authentication ---
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
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

export interface ApiResponseAuthResponse {
    success: boolean;
    message: string;
    data: AuthResponse;
    error?: string;
    timestamp: string;
}

// --- User Management ---
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
    isEmailVerified?: boolean;
    bio?: string;
    preferences?: string;
    isActive: boolean;
    isVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLoginAt?: string;
    roles: string[];
}

// --- Organization Management ---
export type SubscriptionPlan = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'PAST_DUE' | 'TRIALING';

export interface OrganizationDTO {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    subscriptionPlan: SubscriptionPlan;
    subscriptionStatus: SubscriptionStatus;
    stripeCustomerId?: string;
    createdAt?: string;
    updatedAt?: string;
}

// --- Project Management ---

// Used for Create/Update requests
export interface ProjectDTO {
    id?: string; // UUID
    organizationId: number;
    name?: string; // Matches 'name' in schema, though 'title' is often used in UI
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    priority?: string;
    startDate?: string; // yyyy-MM-dd
    endDate?: string;   // yyyy-MM-dd
    budget?: number;
    spent?: number;
    progress?: number;
    clientId?: string;
    projectManagerId?: number;
    projectManagerName?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Nested objects for ProjectResponseDTO
export interface ClientInfoDTO {
    name?: string;
    nameEn?: string;
    organization?: string;
    organizationEn?: string;
    avatar?: string;
    email?: string;
}

export interface ConsultantInfoDTO {
    name?: string;
    role?: string;
    avatar?: string;
}

export interface TeamMemberSummaryDTO {
    name?: string;
    role?: string;
    avatar?: string;
    email?: string;
}

// Used for GET responses (Rich data)
export interface ProjectResponseDTO {
    id: string;
    title?: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    status?: string;
    priority?: string;
    progress?: number;
    startDate?: string;
    endDate?: string;
    budget?: number;
    spent?: number;
    client?: ClientInfoDTO;
    consultant?: ConsultantInfoDTO;
    team?: TeamMemberSummaryDTO[];
    deliverables?: number;
    completedDeliverables?: number;
    tasks?: number;
    completedTasks?: number;
    tickets?: number;
    openTickets?: number;
}

export interface ProjectFileDTO {
    id: number;
    name: string;
    fileType: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedById?: number;
    uploadedByName?: string;
    version: number;
    isActive: boolean;
    createdAt: string;
}

export interface ProjectMemberDTO {
    id: string; // UUID
    projectId: string; // UUID
    userId: number;
    userName?: string;
    userEmail?: string;
    role?: string;
    permissions?: any; // JsonNode
    joinedAt: string;
}

// --- Deliverables ---
// Note: Unions kept for frontend type safety, though API schema is generic string
export type DeliverableType = 'guide' | 'topic' | 'policy' | 'procedure' | 'template' | 'report' | string;

export type DeliverableStatus = 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'REJECTED'; // Example values

export interface DeliverableDTO {
    // Identity
    id: string;                  // Java: UUID
    parentId?: string;           // Java: UUID (Optional)
    projectId: string;           // Java: UUID

    // Content & Localization
    title: string;
    titleEn?: string;            // New: For English specific title
    description?: string;
    descriptionEn?: string;      // New: For English specific description

    // Metadata
    type: DeliverableType;       // Java: Enum
    status: string;              // Java: Enum (Use string or specific Union type)
    version?: string;

    // File Storage (New)
    fileName?: string;           // New
    fileUrl?: string;            // New

    // User & timestamps
    assignedToId?: number;       // Java: Long
    createdByName?: string;
    createdAt: string;           // Java: LocalDateTime (ISO String)
    updatedAt: string;           // Java: LocalDateTime (ISO String)

    // Optional: Keep these if your frontend logic uses them, 
    // even if they aren't explicitly in this specific Java DTO snippet yet.
    createdById?: number;
    orderIndex?: number;
}

// --- Tickets ---
export type TicketStatus =
    | 'open'
    | 'in_progress'
    | 'pending_client_approval'
    | 'resolved'
    | 'closed'
    | 'redo'
    | string;

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | string;

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


export interface TicketCommentDTO {
    id: string; // UUID
    ticketId: string; // UUID
    userId: number;
    comment: string;
    isInternal: boolean;
    createdAt: string;
}

// --- Dashboard ---
export interface DashboardStatsDTO {
    totalOrganization: number;
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
    titleEn?: string;
    progress: number;
    status: string;
    clientName?: string;
    clientNameEn?: string;
    dueDate?: string;
}

export interface RecentDeliverableDTO {
    id: string;
    title: string;
    titleEn?: string;
    type: string;
    status: string;
    projectName?: string;
    projectNameEn?: string;
    version: string;
}

export interface RecentTicketDTO {
    id: string;
    title: string;
    titleEn?: string;
    priority: string;
    status: string;
    projectName?: string;
    projectNameEn?: string;
    createdAt: string;
}

export interface KPIDTO {
    label: string;
    labelEn?: string;
    percentage: number;
    colorClass?: string;
}

export interface DeadlineDTO {
    title: string;
    titleEn?: string;
    projectName: string;
    projectNameEn?: string;
    daysRemaining: number;
}

export interface DashboardResponseDTO {
    stats: DashboardStatsDTO;
    recentProjects: RecentProjectDTO[];
    recentDeliverables: RecentDeliverableDTO[];
    recentTickets: RecentTicketDTO[];
    kpis: KPIDTO[];
    upcomingDeadlines: DeadlineDTO[];
}

// --- Notifications ---
export type NotificationType =
    | 'CONTENT_PUBLISHED' | 'CONTENT_APPROVED' | 'CONTENT_REJECTED'
    | 'CONTENT_COMMENTED' | 'CONTENT_LIKED' | 'CONTENT_SHARED'
    | 'MENTION' | 'WORKFLOW_ASSIGNED' | 'WORKFLOW_APPROVED'
    | 'WORKFLOW_REJECTED' | 'SYSTEM_ALERT' | 'USER_MESSAGE'