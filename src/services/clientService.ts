import axios from '@/lib/axios'; // Your axios instance with Auth headers

const API_BASE_URL = import.meta.env.VITE_API_URL + '/clients';

// --- Interfaces based on API Definition ---
export interface ApiClient {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    subscriptionPlan?: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'; // Expanded based on common patterns
    subscriptionStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    stripeCustomerId?: string;
    contactPersonName?: string;
    contactEmail?: string;
    projectsCount?: number;
    activeProjectsCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ClientStats {
    totalClients: number;
    activeClients: number;
    totalProjects: number;
    averageSatisfaction: number;
    revenueCollected: number;
}

export interface CreateUpdateClientRequest {
    id?: number;
    name: string;
    description?: string;
    logoUrl?: string;
    subscriptionPlan?: string;
    subscriptionStatus?: string;
    contactPersonName?: string;
    contactEmail?: string;
}

// --- Axios Instance with Interceptor ---
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- Service Methods ---
export const organizationService = {
    getAll: async () => {
        const response = await apiClient.get<ApiClient[]>('');
        return response.data;
    },

    getById: async (id: number | string) => {
        const response = await apiClient.get<ApiClient>(`/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await apiClient.get<ClientStats>('/stats');
        return response.data;
    },

    create: async (data: CreateUpdateClientRequest) => {
        const response = await apiClient.post<ApiClient>('', data);
        return response.data;
    },

    update: async (id: number | string, data: CreateUpdateClientRequest) => {
        const response = await apiClient.put<ApiClient>(`/${id}`, data);
        return response.data;
    },

    delete: async (id: number | string) => {
        await apiClient.delete(`/${id}`);
    }
};