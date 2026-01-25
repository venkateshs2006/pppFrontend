// src/types/project.ts

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface ClientInfo {
    name: string;
    nameEn: string;
    organization: string;
    organizationEn: string;
    avatar: string;
    email: string;
}

export interface ConsultantInfo {
    name: string;
    role: string;
    avatar: string;
}

export interface TeamMemberSummary {
    name: string;
    role: string;
    avatar: string;
    email: string;
}

// The "Read" Model (Matches ProjectResponseDTO)
export interface Project {
    id: string; // UUID
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;

    status: ProjectStatus;
    priority: ProjectPriority;
    progress: number;

    startDate: string; // ISO Date "yyyy-MM-dd"
    endDate: string;   // ISO Date "yyyy-MM-dd"

    budget: number;
    spent: number;

    // Nested Objects
    client: ClientInfo;
    consultant: ConsultantInfo;
    team: TeamMemberSummary[];

    // Dashboard/Card Stats
    deliverables: number;
    completedDeliverables: number;
    tasks: number;
    completedTasks: number;
    tickets: number;
    openTickets: number;
    closedTickets: number;
}

// The "Write" Model (Matches ProjectDTO for Create/Update)
// export interface ProjectDTO {
//     id?: string;
//     title: string;
//     titleEn: string;
//     description: string;
//     descriptionEn: string;
//     status: string; // Backend accepts string, converts to Enum
//     priority: string; // Backend accepts string, converts to Enum
//     startDate?: string;
//     endDate?: string;
//     budget: number;
//     spent?: number;
//     progress?: number;
//     clientId: string; // ID to link organization/client
//     projectManagerId?: number; // Optional: to assign a consultant
// }

// Matches DeliverableDTO
export interface Deliverable {
    id: string;
    title: string; // Changed from 'name' to match API
    description?: string;
    type: 'guide' | 'policy' | 'procedure' | 'template' | 'report' | 'topic' | string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | string;
    version: string;
    orderIndex?: number;
    projectId: string;
    createdAt?: string;
}

// types/project.ts

export interface ProjectTeamMember {
    userId: number;
    name: string;
    role: string;
    avatar: string;
    email: string;
    phoneNumber?: string;
    jobTitle?: string;
}

export interface ProjectRole {
    id: number;
    name: string;
    description: string;
    permissions?: any[]; // Define specific permission type if needed
    createdAt?: string;
}

export interface ProjectClient {
    name: string;
    nameEn: string;
    organization: string;
    organizationEn: string;
    avatar: string;
    email: string;
}

export interface ProjectConsultant {
    userId: number;
    name: string;
    role: string;
    avatar: string;
    phoneNumber: string;
    jobTitle: string;
}

export interface Project {
    id: string; // UUID
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    status: string;
    priority: string;
    progress: number;
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;

    // Complex Objects based on API response
    client: ProjectClient;
    consultant: ProjectConsultant;
    team: ProjectTeamMember[];

    // Statistics
    deliverables: number;
    completedDeliverables: number;
    tasks: number;
    completedTasks: number;
    tickets: number;
    openTickets: number;
}

// Request Payload for Create/Update
export interface ProjectDTO {
    id?: string;
    organizationId?: number;
    name?: string; // Seems redundant with title, but API asks for it
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    status: string;
    priority: string;
    startDate: string;
    endDate: string;
    budget: number;
    spent?: number;
    progress?: number;
    clientId: string;
    projectManagerId?: number;
}