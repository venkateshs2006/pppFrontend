// services/projectService.ts
import axios from '@/lib/axios'; // Your axios instance with Auth headers
import { Project, ProjectDTO } from '@/types/project';
import { Deliverable } from '@/types/database';

const API_URL = '/projects';

export const projectService = {
    // Get all projects (Backend handles scoping based on Role)
    getAllProjects: async (): Promise<Project[]> => {
        const response = await axios.get<Project[]>(API_URL);
        return response.data;
    },

    // Create new project
    createProject: async (data: ProjectDTO): Promise<Project> => {
        const response = await axios.post<Project>(API_URL, data);
        return response.data;
    },

    // Update project
    updateProject: async (id: string, data: Partial<ProjectDTO>): Promise<Project> => {
        const response = await axios.put<Project>(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Delete project
    deleteProject: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    },
    getProjectDeliverables: async (projectId: string): Promise<Deliverable[]> => {
        const response = await axios.get<Deliverable[]>(`${API_URL}/${projectId}/deliverables`);
        return response.data;
    },
};