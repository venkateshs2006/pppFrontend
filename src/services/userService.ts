// services/projectService.ts
import axios from '@/lib/axios'; // Your axios instance with Auth headers

// --- Types based on API Definition ---
export interface ApiUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    phoneNumber?: string;
    department?: string; // Maps to Organization
    jobTitle?: string;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
    roles: string[];
    avatarUrl?: string;
}

export interface CreateUpdateUserRequest {
    id?: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    department?: string;
    roles: string[];
    isActive?: boolean;
}

export interface PaginatedResponse {
    content: ApiUser[];
    totalPages: number;
    totalElements: number;
}
// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = API_BASE_URL + '/users';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
    (config) => {
        // 1. CHECK THE KEY HERE: ensure this matches what is in your Application tab
        const token = localStorage.getItem('accessToken');
        // OR try: const token = localStorage.getItem('accessToken');

        // DEBUG: Print token to console to verify it exists
        console.log("Interceptor - Token found:", token ? "YES" : "NO");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Response Interceptor (Optional but helpful) ---
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Auth Error: Token is invalid or expired.");
            // Optional: Redirect to login if 401 occurs
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
export const userService = {
    // Get all users (with pagination)
    getAll: async (page: number = 0, size: number = 100) => {
        const response = await axios.get<ApiUser[]>(`${API_URL}`, {
            params: { pageNumber: page, pageSize: size }
        });
        return response.data;
    },

    // Get single user
    getById: async (id: number | string) => {
        const response = await axios.get<ApiUser>(`${API_URL}/${id}`);
        return response.data;
    },

    // Create User (Assuming POST to root based on standard REST, 
    // though your doc said Update. Adjust if backend differs)
    create: async (data: CreateUpdateUserRequest) => {
        const response = await axios.post<ApiUser>(`${API_URL}`, data);

        return response.data;
    },

    // Update User
    update: async (id: number | string, data: CreateUpdateUserRequest) => {
        const response = await axios.put<ApiUser>(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Activate
    activate: async (id: number | string) => {
        const response = await axios.put<ApiUser>(`${API_URL}/${id}/activate`);
        return response.data;
    },

    // Deactivate
    deactivate: async (id: number | string) => {
        const response = await axios.put<ApiUser>(`${API_URL}/${id}/deactivate`);
        return response.data;
    },

    // Delete
    delete: async (id: number | string) => {
        await axios.delete(`${API_URL}/${id}`);
    }
};