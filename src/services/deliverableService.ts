import axios from '@/lib/axios';

// Base URL configuration
const API_URL = import.meta.env.VITE_API_URL + '/deliverables';

// --- Interfaces based on API Definition ---
export interface Deliverable {
    id: string;
    title: string;
    titleEn: string;
    description?: string;
    descriptionEn?: string;
    type: 'GUIDE' | 'TOPIC' | 'POLICY' | 'PROCEDURE' | 'TEMPLATE';
    status: 'DRAFT' | 'IN_PROGRESS' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'CLOSED';
    version: string;
    parentId?: string;
    projectId: string;
    fileName?: string;
    fileUrl?: string;
    assignedToId?: number;
    createdByName?: string;
    createdAt: string;
    updatedAt: string;
}

// Request DTO for creating/updating (matches Request body)
export interface CreateUpdateDeliverableRequest {
    id?: string;
    title: string;
    titleEn?: string;
    description?: string;
    descriptionEn?: string;
    type: string;
    status?: string;
    projectId: string;
    parentId?: string;
    version?: string;
}

// --- Axios Instance ---
const apiClient = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Add Token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- Service Methods ---
export const deliverableService = {
    // GET /api/deliverables/project/{projectId}
    getByProject: async (projectId: string) => {
        const res = await apiClient.get<Deliverable[]>(`/project/${projectId}`);
        return res.data;
    },

    // GET /api/deliverables/{id}
    getById: async (id: string) => {
        const res = await apiClient.get<Deliverable>(`/${id}`);
        return res.data;
    },

    // POST /api/deliverables
    create: async (data: CreateUpdateDeliverableRequest) => {
        const res = await apiClient.post<Deliverable>('', data);
        return res.data;
    },

    // PUT /api/deliverables/{id}
    update: async (id: string, data: CreateUpdateDeliverableRequest) => {
        const res = await apiClient.put<Deliverable>(`/${id}`, data);
        return res.data;
    },

    // DELETE /api/deliverables/{id}
    delete: async (id: string) => {
        await apiClient.delete(`/${id}`);
    },

    // PUT /api/deliverables/{id}/submit?clientId=...
    submitForReview: async (id: string, clientId: number) => {
        await apiClient.put(`/${id}/submit`, null, {
            params: { clientId }
        });
    },

    // POST /api/deliverables/{id}/upload
    uploadFile: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await apiClient.post<Deliverable>(`/${id}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' } // Override for file upload
        });
        return res.data;
    }
};