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
}

// The "Write" Model (Matches ProjectDTO for Create/Update)
export interface ProjectDTO {
    id?: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    status: string; // Backend accepts string, converts to Enum
    priority: string; // Backend accepts string, converts to Enum
    startDate?: string;
    endDate?: string;
    budget: number;
    spent?: number;
    progress?: number;
    clientId: string; // ID to link organization/client
    projectManagerId?: number; // Optional: to assign a consultant
}

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