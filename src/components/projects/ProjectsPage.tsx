import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailsModal } from './ProjectDetailsModal';
import { EditProjectModal } from './EditProjectModal';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { ManageTeamModal } from './ManageTeamModal';
import {
  Plus, Search, Calendar, DollarSign, Users, BarChart3, Eye, Edit, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { projectService } from '@/services/projectService';
// Ensure you have this type defined or adapt the interface below
import { Project } from '@/types/project';

// --- Permissions Helpers ---
const canEditProjects = (userRole: string) =>
  ['super_admin', 'admin', 'lead_consultant'].includes(userRole);

export function ProjectsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const { toast } = useToast();

  // --- State ---
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modal States
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  // --- 1. Fetch Data on Mount ---
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
      toast({
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'فشل تحميل المشاريع' : 'Failed to load projects',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- 2. Filter Logic ---
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchTerm === '' ||
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || project.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || project.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // --- 3. Action Handlers ---
  const handleCreateProject = async (projectData: any) => {
    try {
      const dto = {
        ...projectData,
        status: 'planning',
        budget: parseFloat(projectData.budget)
      };

      await projectService.createProject(dto);

      toast({
        title: dir === 'rtl' ? 'نجاح' : 'Success',
        description: dir === 'rtl' ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!',
      });
      fetchProjects();
      setIsCreateModalOpen(false);
    } catch (error) {
      toast({
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'فشل إنشاء المشروع' : 'Failed to create project',
        variant: "destructive"
      });
    }
  };

  const handleEditProjectSubmit = async (projectData: any) => {
    if (!selectedProject) return;
    try {
      await projectService.updateProject(selectedProject.id, projectData);

      toast({
        title: dir === 'rtl' ? 'نجاح' : 'Success',
        description: dir === 'rtl' ? 'تم تحديث المشروع بنجاح!' : 'Project updated successfully!',
      });
      fetchProjects();
      setShowEditModal(false);
    } catch (error) {
      toast({
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'فشل تحديث المشروع' : 'Failed to update project',
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure?')) return;

    try {
      await projectService.deleteProject(project.id);
      toast({
        title: dir === 'rtl' ? 'تم الحذف' : 'Deleted',
        description: dir === 'rtl' ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully',
      });
      setProjects(prev => prev.filter(p => p.id !== project.id));
    } catch (error) {
      toast({
        title: dir === 'rtl' ? 'خطأ' : 'Error',
        description: dir === 'rtl' ? 'فشل حذف المشروع' : 'Failed to delete project',
        variant: "destructive"
      });
    }
  };

  const handleSaveTeam = async (members: any[]) => {
    // Logic to save team members (usually handled inside ManageTeamModal or via specific service)
    // If ManageTeamModal handles the API call internally, just close the modal here.
    setShowManageTeamModal(false);
    fetchProjects(); // Refresh to show new team count
  };

  // --- Helpers ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'planning';
    const config = {
      planning: { label: t('projects.planning'), color: 'bg-blue-100 text-blue-800' },
      active: { label: t('projects.active'), color: 'bg-green-100 text-green-800' },
      on_hold: { label: t('projects.onHold'), color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: t('projects.completed'), color: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: t('projects.cancelled'), color: 'bg-red-100 text-red-800' },
    };
    const item = config[s as keyof typeof config] || config.planning;
    return <Badge variant="outline" className={item.color}>{item.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase() || 'medium';
    const config = {
      low: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      urgent: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };
    const item = config[p as keyof typeof config] || config.medium;
    return <Badge variant="outline" className={item.color}>{item.label}</Badge>;
  };

  // --- Stats Calculation ---
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status?.toLowerCase() === 'active').length,
    completed: projects.filter(p => p.status?.toLowerCase() === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  return (
    <TooltipProvider>
      <div className="space-y-6 p-6" dir={dir}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('projects.title')}</h1>
            <p className="text-gray-600 mt-1">{t('projects.description')}</p>
          </div>
          {canEditProjects(userProfile?.role || '') && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('projects.newProject')}
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('projects.totalProjects')}</p>
                  <p className="text-2xl font-bold text-blue-600">{loading ? '...' : stats.total}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('projects.activeProjects')}</p>
                  <p className="text-2xl font-bold text-green-600">{loading ? '...' : stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('projects.completedProjects')}</p>
                  <p className="text-2xl font-bold text-emerald-600">{loading ? '...' : stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('projects.totalBudget')}</p>
                  <p className="text-2xl font-bold text-purple-600">{loading ? '...' : formatCurrency(stats.totalBudget)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('projects.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('projects.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('projects.active')}</SelectItem>
                  <SelectItem value="planning">{t('projects.planning')}</SelectItem>
                  <SelectItem value="completed">{t('projects.completed')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('projects.filterByPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.allPriorities')}</SelectItem>
                  <SelectItem value="low">{t('tickets.low')}</SelectItem>
                  <SelectItem value="medium">{t('tickets.medium')}</SelectItem>
                  <SelectItem value="high">{t('tickets.high')}</SelectItem>
                  <SelectItem value="urgent">{t('tickets.urgent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-[400px] w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                        {dir === 'rtl' ? project.title : project.titleEn}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-3">
                        {getStatusBadge(project.status)}
                        {getPriorityBadge(project.priority)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{t('projects.progress')}</span>
                      <span className="font-medium">{project.progress || 0}%</span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {dir === 'rtl' ? project.description : project.descriptionEn}
                  </p>

                  {/* Client Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                        {project.client?.avatar || 'CL'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {dir === 'rtl' ? project.client?.name : project.client?.nameEn}
                      </p>
                      <p className="text-xs text-gray-600">
                        {dir === 'rtl' ? project.client?.organization : project.client?.organizationEn}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Project Stats (4 Grid Layout) */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span>{project.completedDeliverables}/{project.deliverables} {dir === 'rtl' ? 'مخرجات' : 'deliverables'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gray-400" />
                      <span>{project.completedTasks}/{project.tasks} {dir === 'rtl' ? 'مهام' : 'tasks'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-gray-400" />
                      <span>{project.openTickets}/{project.tickets} {dir === 'rtl' ? 'تذاكر' : 'tickets'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{(project.team?.length || 0) + 1} {dir === 'rtl' ? 'أعضاء' : 'members'}</span>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">{t('projects.budget')}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-700">{formatCurrency(project.budget)}</p>
                      <p className="text-xs text-gray-600">{t('projects.spent')}: {formatCurrency(project.spent)}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(project.endDate)}</span>
                    </div>
                  </div>

                  {/* Footer: Teams & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-600 mr-2">{t('projects.team')}:</span>
                      <div className="flex -space-x-2">
                        {/* Consultant Avatar */}
                        {project.consultant && (
                          <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="bg-purple-100 text-purple-600 text-[10px]">
                              {project.consultant.avatar || 'C'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {/* Team Members Avatars */}
                        {project.team?.slice(0, 3).map((member: any, index: number) => (
                          <Avatar key={index} className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-[10px]">
                              {member.avatar || member.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {/* Overflow Counter */}
                        {project.team && project.team.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                            <span className="text-[10px] text-gray-600">+{project.team.length - 3}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setShowDetailsModal(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{dir === 'rtl' ? 'عرض تفاصيل المشروع' : 'View project details'}</p>
                        </TooltipContent>
                      </Tooltip>

                      {canEditProjects(userProfile?.role || '') && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedProject(project); setShowEditModal(true); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{dir === 'rtl' ? 'تحرير المشروع' : 'Edit project'}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <ProjectActionsMenu
                        project={project}
                        userRole={userProfile?.role || ''}
                        canEdit={canEditProjects(userProfile?.role || '')}
                        onView={() => { setSelectedProject(project); setShowDetailsModal(true); }}
                        onEdit={() => { setSelectedProject(project); setShowEditModal(true); }}
                        onDelete={() => handleDelete(project)}
                        onManageTeam={() => { setSelectedProject(project); setShowManageTeamModal(true); }}
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
        )}

        {/* Modals */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateProject}
        />

        {selectedProject && (
          <>
            <EditProjectModal
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              project={selectedProject}
              onSave={handleEditProjectSubmit}
            />

            <ProjectDetailsModal
              isOpen={showDetailsModal}
              onClose={() => setShowDetailsModal(false)}
              project={selectedProject}
              onEdit={() => { setShowDetailsModal(false); setShowEditModal(true); }}
            />

            <ManageTeamModal
              isOpen={showManageTeamModal}
              onClose={() => setShowManageTeamModal(false)}
              project={selectedProject}
              onSave={handleSaveTeam}
            />
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

// Simple Progress Component
function Progress({ value, className }: { value: number, className?: string }) {
  return (
    <div className={`w-full bg-gray-200 rounded-full ${className}`}>
      <div
        className="bg-blue-600 h-full rounded-full transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}