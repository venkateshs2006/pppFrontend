import axios from '@/lib/axios';
import { Project, ProjectDTO, ProjectTeamMember, ProjectRole } from '@/types/project';
import { Deliverable } from '@/types/database'; // Or wherever your Deliverable type is

const API_URL = import.meta.env.VITE_API_URL + '/projects';

export const projectService = {
    // 1. Get all projects
    getAllProjects: async (): Promise<Project[]> => {
        const response = await axios.get<Project[]>(API_URL);
        return response.data;
    },

    // 2. Get Single Project by ID [NEW]
    getById: async (id: string): Promise<Project> => {
        const response = await axios.get<Project>(`${API_URL}/${id}`);
        return response.data;
    },

    // 3. Create new project
    createProject: async (data: ProjectDTO): Promise<Project> => {
        const response = await axios.post<Project>(API_URL, data);
        return response.data;
    },

    // 4. Update project
    updateProject: async (id: string, data: Partial<ProjectDTO>): Promise<Project> => {
        const response = await axios.put<Project>(`${API_URL}/${id}`, data);
        return response.data;
    },

    // 5. Delete project
    deleteProject: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    },

    // 6. Get Project Deliverables
    getProjectDeliverables: async (projectId: string): Promise<Deliverable[]> => {
        const response = await axios.get<Deliverable[]>(`${API_URL}/${projectId}/deliverables`);
        return response.data;
    },

    // 7. Get Project Roles [NEW]
    getRoles: async (): Promise<ProjectRole[]> => {
        const response = await axios.get<ProjectRole[]>(`${API_URL}/roles`);
        return response.data;
    },

    // --- Member Management [NEW] ---

    // 8. Get Team Members
    getMembers: async (projectId: string): Promise<ProjectTeamMember[]> => {
        const response = await axios.get<ProjectTeamMember[]>(`${API_URL}/${projectId}/members`);
        return response.data;
    },

    // 9. Add Team Member
    addMember: async (projectId: string, userId: number, role: string): Promise<ProjectTeamMember> => {
        // Note: API path is /api/projects/{id}/members/{userId}/{role}/add
        const response = await axios.post<ProjectTeamMember>(
            `${API_URL}/${projectId}/members/${userId}/${role}/add`
        );
        return response.data;
    },

    // 10. Remove Team Member
    removeMember: async (projectId: string, userId: number, role: string): Promise<void> => {
        // Note: API path is /api/projects/{id}/members/{userId}/{role}/delete
        await axios.delete(
            `${API_URL}/${projectId}/members/${userId}/${role}/delete`
        );
    }
};