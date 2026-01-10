// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_URL;

interface FetchOptions extends RequestInit {
    token?: string;
}

export const api = {
    // Helper function for handling fetch requests
    request: async <T>(endpoint: string, options: FetchOptions = {}): Promise<T> => {
        const token = localStorage.getItem('accessToken');

        const headers = {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        };

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized (e.g., redirect to login)
                localStorage.removeItem('accessToken');
                window.location.href = '/';
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    },

    // Auth Endpoints
    auth: {
        login: (credentials: any) =>
            api.request<{ data: import('../types/api').AuthResponse }>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),

        register: (data: any) =>
            api.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(data),
            }),

        verifyEmail: (token: string) =>
            api.request(`/auth/verify-email?token=${token}`, { method: 'POST' }),
    },

    // Dashboard Endpoint
    dashboard: {
        getStats: () => api.request<import('../types/api').DashboardResponseDTO>('/dashboard'),
    },

    // Project Endpoints
    projects: {
        getAll: () => api.request<import('../types/api').ProjectDTO[]>('/projects'),
        getById: (id: string) => api.request<import('../types/api').ProjectDTO>(`/projects/${id}`),
        create: (data: any) =>
            api.request<import('../types/api').ProjectDTO>('/projects', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
        update: (id: string, data: any) =>
            api.request<import('../types/api').ProjectDTO>(`/projects/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            }),
        delete: (id: string) =>
            api.request(`/projects/${id}`, { method: 'DELETE' }),
    },
};