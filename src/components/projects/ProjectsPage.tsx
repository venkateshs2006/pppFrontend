import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { EditProjectModal } from './EditProjectModal';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { ManageTeamModal } from './ManageTeamModal';
import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  BarChart3,
  Eye,
  Edit,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

// Helper functions
const canEditProjects = (userRole: string) => {
  return userRole === 'system_admin' || userRole === 'lead_consultant';
};

const formatCurrency = (amount: number, dir: string) => {
  return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string, dir: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
};

export function ProjectsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  // State
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  // --- API Functions ---

  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/projects', {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();

      // Transform API DTO to UI model
      const mapped = data.map((p: any) => ({
        id: p.id,
        title: p.name,
        titleEn: p.name, // Add titleEn to backend DTO if needed
        description: p.description || '',
        descriptionEn: p.description || '',
        status: p.status ? p.status.toLowerCase() : 'planning',
        priority: 'medium', // Add priority to backend DTO
        progress: p.progress || 0,
        startDate: p.startDate,
        endDate: p.endDate,
        budget: p.budget || 0,
        spent: 0,
        client: {
          name: 'Client', // Need organization name from backend
          nameEn: 'Client',
          organization: `Org ${p.organizationId}`,
          organizationEn: `Org ${p.organizationId}`,
          avatar: 'CL',
          email: ''
        },
        consultant: {
          name: p.projectManagerName || 'Unassigned',
          role: 'Project Manager',
          avatar: p.projectManagerName ? p.projectManagerName.charAt(0) : 'U'
        },
        team: [], // Will be fetched via ManageTeamModal
        deliverables: 0,
        completedDeliverables: 0,
        tasks: 0,
        completedTasks: 0,
        tickets: 0,
        openTickets: 0
      }));

      setProjects(mapped);
    } catch (error) {
      console.error(error);
      toast.error(dir === 'rtl' ? 'فشل تحميل المشاريع' : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };



  const handleCreateProjectSubmit = async (projectData: any) => {
    try {
      const payload = {
        name: projectData.title,
        description: projectData.description,
        status: 'planning', // <--- CHANGE THIS from 'PLANNING' to 'planning'
        organizationId: parseInt(projectData.clientId) || null,
        budget: parseFloat(projectData.budget),
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        projectManagerId: userProfile?.id ? parseInt(userProfile.id) : null
      };
      const response = await fetch('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create project');

      toast.success(dir === 'rtl' ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully');
      setShowCreateModal(false);
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error(dir === 'rtl' ? 'فشل إنشاء المشروع' : 'Failed to create project');
    }
  };

  const handleDeleteProject = async (project: any) => {
    if (!confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`http://localhost:8080/api/projects/${project.id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });

      if (!response.ok) throw new Error('Failed to delete project');

      toast.success(dir === 'rtl' ? 'تم حذف المشروع' : 'Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error(error);
      toast.error(dir === 'rtl' ? 'فشل حذف المشروع' : 'Failed to delete project');
    }
  };

  // Initial Load
  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter Logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render Helpers
  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <Badge variant="outline" className={colorMap[status] || 'bg-gray-100'}>
        {t(`projects.${status}`) || status}
      </Badge>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-10"><RefreshCw className="animate-spin" /></div>;
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
            <p className="text-gray-600 mt-1">{t('projects.description')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchProjects} size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            {canEditProjects(userProfile?.role || '') && (
              <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('projects.newProject')}
              </Button>
            )}
          </div>
        </div>

        {/* Stats & Filters (Simplified for brevity - keep your existing UI code here) */}
        {/* ... Include your existing Stats Cards and Filter inputs here ... */}

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                      {project.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusBadge(project.status)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{t('projects.progress')}</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>

                {/* Client & Consultant */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{project.client.organization}</span>
                  <span>{formatCurrency(project.budget, dir)}</span>
                </div>

                {/* Team & Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    <Avatar className="w-6 h-6 border-2 border-white">
                      <AvatarFallback>{project.consultant.avatar}</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setShowDetailsModal(true); }}>
                      <Eye className="w-4 h-4" />
                    </Button>

                    <ProjectActionsMenu
                      project={project}
                      userRole={userProfile?.role || ''}
                      canEdit={canEditProjects(userProfile?.role || '')}
                      onView={() => { setSelectedProject(project); setShowDetailsModal(true); }}
                      onEdit={() => { setSelectedProject(project); setShowEditModal(true); }}
                      onManageTeam={() => { setSelectedProject(project); setShowManageTeamModal(true); }}
                      onDelete={handleDeleteProject}
                      // Implement others as needed
                      onManageTasks={() => { }}
                      onViewReports={() => { }}
                      onArchive={() => { }}
                      onDuplicate={() => { }}
                      onShare={() => { }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals - Ensure these are rendered! */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={() => { setShowCreateModal(false); fetchProjects(); }}
        />

        {/* Only render details/edit/manage if a project is selected */}
        {selectedProject && (
          <>
            <ProjectDetailsModal
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              project={selectedProject}
              onEdit={() => { setShowDetailsModal(false); setShowEditModal(true); }}
            />

            <EditProjectModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              project={selectedProject}
              onSave={() => { fetchProjects(); }}
            />

            <ManageTeamModal
              isOpen={showManageTeamModal}
              onClose={() => setShowManageTeamModal(false)}
              project={selectedProject}
              onSave={() => { fetchProjects(); }}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  );
}