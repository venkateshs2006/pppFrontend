import axios from 'axios';
import {
    AuthResponse,
    DashboardResponseDTO,
    LoginRequest,
    TicketDTO,
    TicketCommentDTO,
    ProjectDTO,
    DeliverableDTO,
    UserDTO,
    OrganizationDTO,
    RegisterRequest,
    RefreshTokenRequest
} from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    auth: {
        login: async (credentials: LoginRequest) => {
            const response = await apiClient.post<any>('/auth/login', credentials);
            return response.data; // Expecting ApiResponseAuthResponse
        },
        register: async (data: RegisterRequest) => {
            const response = await apiClient.post<any>('/auth/register', data);
            return response.data;
        },
        refreshToken: async (token: string) => {
            const data: RefreshTokenRequest = { refreshToken: token };
            const response = await apiClient.post<any>('/auth/refresh-token', data);
            return response.data;
        },
        verifyEmail: async (token: string) => {
            const response = await apiClient.post<any>(`/auth/verify-email?token=${token}`);
            return response.data;
        },
        forgotPassword: async (email: string) => {
            const response = await apiClient.post<any>(`/auth/forgot-password?email=${email}`);
            return response.data;
        }
    },

    dashboard: {
        getData: async () => {
            const response = await apiClient.get<DashboardResponseDTO>('/dashboard');
            return response.data;
        }
    },

    tickets: {
        // GET /api/v1/tickets/{id}
        getById: async (id: string) => {
            const response = await apiClient.get<TicketDTO>(`/v1/tickets/${id}`);
            return response.data;
        },
        // GET /api/v1/tickets/userid/{userId}
        getByUser: async (userId: number) => {
            const response = await apiClient.get<TicketDTO[]>(`/v1/tickets/userid/${userId}`);
            return response.data;
        },
        // GET /api/v1/tickets/project/{projectId}
        getByProject: async (projectId: string) => {
            const response = await apiClient.get<TicketDTO[]>(`/v1/tickets/project/${projectId}`);
            return response.data;
        },
        // POST /api/v1/tickets
        create: async (data: Partial<TicketDTO>) => {
            const response = await apiClient.post<TicketDTO>('/v1/tickets', data);
            return response.data;
        },
        // PATCH /api/v1/tickets/{id}/submit-approval
        submitForApproval: async (id: string) => {
            const response = await apiClient.patch<TicketDTO>(`/v1/tickets/${id}/submit-approval`);
            return response.data;
        },
        // PATCH /api/v1/tickets/{id}/assign
        assign: async (id: string, newAssigneeId: number, actorId: number) => {
            const response = await apiClient.patch<TicketDTO>(`/v1/tickets/${id}/assign`, null, {
                params: { newAssigneeId, actorId }
            });
            return response.data;
        },
        // PATCH /api/v1/tickets/{id}/approve
        approve: async (id: string, clientId: number) => {
            const response = await apiClient.patch<TicketDTO>(`/v1/tickets/${id}/approve`, null, {
                params: { clientId }
            });
            return response.data;
        },
        // PUT /api/v1/tickets/{id}/reject
        reject: async (id: string, approverId: number) => {
            const response = await apiClient.put<TicketDTO>(`/v1/tickets/${id}/reject`, null, {
                params: { approverId }
            });
            return response.data;
        },
        // POST /api/v1/tickets/{id}/attachments
        uploadAttachment: async (id: string, file: File, uploaderId: number) => {
            const formData = new FormData();
            formData.append('file', file);
            const response = await apiClient.post<string>(`/v1/tickets/${id}/attachments`, formData, {
                params: { uploaderId },
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        },
        // GET /api/v1/tickets/{ticketId}/comments
        getComments: async (ticketId: string) => {
            const response = await apiClient.get<TicketCommentDTO[]>(`/v1/tickets/${ticketId}/comments`);
            return response.data;
        },
        // POST /api/v1/tickets/{ticketId}/comments
        addComment: async (ticketId: string, comment: Partial<TicketCommentDTO>) => {
            const response = await apiClient.post<TicketCommentDTO>(`/v1/tickets/${ticketId}/comments`, comment);
            return response.data;
        }
    },

    users: {
        // GET /api/users/
        getAll: async (page = 0, size = 10) => {
            const response = await apiClient.get<any>('/users/', { params: { pageNumber: page, pageSize: size } });
            return response.data; // Returns PageResponseUserDTO or list
        },
        // GET /api/users/{id}
        getById: async (id: number) => {
            const response = await apiClient.get<UserDTO>(`/users/${id}`);
            return response.data;
        },
        // GET /api/users/username/{username}
        getByUsername: async (username: string) => {
            const response = await apiClient.get<UserDTO>(`/users/username/${username}`);
            return response.data;
        },
        // PUT /api/users/{id}
        update: async (id: number, data: Partial<UserDTO>) => {
            const response = await apiClient.put<UserDTO>(`/users/${id}`, data);
            return response.data;
        },
        // DELETE /api/users/{id}
        delete: async (id: number) => {
            await apiClient.delete(`/users/${id}`);
        }
    },

    projects: {
        // GET /api/projects
        getAll: async () => {
            const response = await apiClient.get<ProjectDTO[]>('/projects');
            return response.data;
        },
        // GET /api/projects/{id}
        getById: async (id: string) => {
            const response = await apiClient.get<ProjectDTO>(`/projects/${id}`);
            return response.data;
        },
        // POST /api/projects
        create: async (data: Partial<ProjectDTO>) => {
            const response = await apiClient.post<ProjectDTO>('/projects', data);
            return response.data;
        },
        // GET /api/projects/{id}/members
        getMembers: async (id: string) => {
            const response = await apiClient.get<any[]>(`/projects/${id}/members`);
            return response.data;
        },
        // POST /api/projects/{id}/members
        addMember: async (id: string, memberData: any) => {
            const response = await apiClient.post<any>(`/projects/${id}/members`, memberData);
            return response.data;
        }
    },

    deliverables: {
        // GET /api/projects/{projectId}/deliverables
        getByProject: async (projectId: string) => {
            const response = await apiClient.get<DeliverableDTO[]>(`/projects/${projectId}/deliverables`);
            return response.data;
        },
        // POST /api/projects/{projectId}/deliverables
        create: async (projectId: string, data: Partial<DeliverableDTO>) => {
            const response = await apiClient.post<DeliverableDTO>(`/projects/${projectId}/deliverables`, data);
            return response.data;
        },
        // GET /api/deliverables/{id}
        getById: async (id: string) => {
            const response = await apiClient.get<DeliverableDTO>(`/deliverables/${id}`);
            return response.data;
        },
        // PUT /api/deliverables/{id}
        update: async (id: string, data: Partial<DeliverableDTO>) => {
            const response = await apiClient.put<DeliverableDTO>(`/deliverables/${id}`, data);
            return response.data;
        },
        // DELETE /api/deliverables/{id}
        delete: async (id: string) => {
            await apiClient.delete(`/deliverables/${id}`);
        }
    },

    organizations: {
        // GET /api/organizations
        getAll: async () => {
            const response = await apiClient.get<OrganizationDTO[]>('/organizations');
            return response.data;
        },
        // GET /api/organizations/{id}
        getById: async (id: number) => {
            const response = await apiClient.get<OrganizationDTO>(`/organizations/${id}`);
            return response.data;
        },
        // POST /api/organizations
        create: async (data: Partial<OrganizationDTO>) => {
            const response = await apiClient.post<OrganizationDTO>('/organizations', data);
            return response.data;
        },
        // PUT /api/organizations/{id}
        update: async (id: number, data: Partial<OrganizationDTO>) => {
            const response = await apiClient.put<OrganizationDTO>(`/organizations/${id}`, data);
            return response.data;
        },
        // DELETE /api/organizations/{id}
        delete: async (id: number) => {
            await apiClient.delete(`/organizations/${id}`);
        }
    }
};