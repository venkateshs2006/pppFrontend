import { useState } from 'react';
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
  MoreHorizontal,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Helper function to check if user can edit projects
const canEditProjects = (userRole: string) => {
  return userRole === 'system_admin' || userRole === 'lead_consultant';
};

// Helper function to check if user can view all projects
const canViewAllProjects = (userRole: string) => {
  return userRole === 'system_admin' || userRole === 'lead_consultant' || userRole === 'sub_consultant';
};

// Helper function to get user's projects only
const getUserProjects = (projects: Project[], userRole: string, userEmail: string) => {
  if (canViewAllProjects(userRole)) {
    return projects;
  }
  // For clients, show only their projects
  return projects.filter(project => 
    project.client.email === userEmail || 
    project.team.some(member => member.email === userEmail)
  );
};

interface Project {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  client: {
    name: string;
    nameEn: string;
    organization: string;
    organizationEn: string;
    avatar: string;
    email: string;
  };
  consultant: {
    name: string;
    role: string;
    avatar: string;
  };
  team: Array<{
    name: string;
    role: string;
    avatar: string;
    email: string;
  }>;
  deliverables: number;
  completedDeliverables: number;
  tasks: number;
  completedTasks: number;
  tickets: number;
  openTickets: number;
}

export function ProjectsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showManageTeamModal, setShowManageTeamModal] = useState(false);

  // بيانات المشاريع الشاملة
  const allProjects: Project[] = [
    {
      id: '1',
      title: 'مشروع تطوير سياسات الموارد البشرية الشاملة',
      titleEn: 'Comprehensive HR Policies Development Project',
      description: 'تطوير وتحديث جميع سياسات وإجراءات الموارد البشرية لتتماشى مع أفضل الممارسات العالمية ومتطلبات سوق العمل السعودي',
      descriptionEn: 'Develop and update all HR policies and procedures to align with global best practices and Saudi labor market requirements',
      status: 'active',
      priority: 'high',
      progress: 75,
      startDate: '2024-08-01',
      endDate: '2024-12-15',
      budget: 450000,
      spent: 337500,
      client: {
        name: 'سلطان منصور',
        nameEn: 'Sultan Mansour',
        organization: 'شركة منصور القابضة',
        organizationEn: 'Mansour Holding Company',
        avatar: 'SM',
        email: 'admin@example.com'
      },
      consultant: {
        name: 'د. فهد السعدي',
        role: 'مستشار أول الموارد البشرية',
        avatar: 'FS'
      },
      team: [
        { name: 'محمد رشاد', role: 'مستشار', avatar: 'MR', email: 'sub.consultant@example.com' },
        { name: 'محمد جودة', role: 'مستشار', avatar: 'MJ', email: 'sub.client@example.com' },
        { name: 'مروة الحمامصي', role: 'مستشارة', avatar: 'MH', email: 'lead.consultant@example.com' }
      ],
      deliverables: 8,
      completedDeliverables: 6,
      tasks: 24,
      completedTasks: 18,
      tickets: 5,
      openTickets: 2
    },
    {
      id: '2',
      title: 'مشروع إعادة هيكلة السياسات المالية والمحاسبية',
      titleEn: 'Financial and Accounting Policies Restructuring Project',
      description: 'مراجعة شاملة وإعادة تصميم جميع السياسات المالية والمحاسبية لضمان الامتثال للمعايير الدولية والمحلية',
      descriptionEn: 'Comprehensive review and redesign of all financial and accounting policies to ensure compliance with international and local standards',
      status: 'planning',
      priority: 'medium',
      progress: 25,
      startDate: '2024-11-01',
      endDate: '2025-03-30',
      budget: 320000,
      spent: 80000,
      client: {
        name: 'المهندس تركي آل نصيب',
        nameEn: 'Eng. Turki Al Naseeb',
        organization: 'شركة تمنكو',
        organizationEn: 'Tamnco Company',
        avatar: 'TN',
        email: 'main.client@example.com'
      },
      consultant: {
        name: 'محمد رشاد',
        role: 'مستشار أول المالية',
        avatar: 'MR'
      },
      team: [
        { name: 'عبدالله القحطاني', role: 'مستشار مساعد', avatar: 'AQ', email: 'sub.consultant@example.com' },
        { name: 'نورا العمري', role: 'محاسب قانوني', avatar: 'NA', email: 'sub.client@example.com' }
      ],
      deliverables: 6,
      completedDeliverables: 2,
      tasks: 18,
      completedTasks: 5,
      tickets: 3,
      openTickets: 1
    },
    {
      id: '3',
      title: 'مشروع تطوير إطار الحوكمة المؤسسية',
      titleEn: 'Corporate Governance Framework Development Project',
      description: 'بناء إطار شامل للحوكمة المؤسسية يتضمن السياسات والإجراءات واللوائح الداخلية',
      descriptionEn: 'Building a comprehensive corporate governance framework including policies, procedures, and internal regulations',
      status: 'completed',
      priority: 'high',
      progress: 100,
      startDate: '2024-05-01',
      endDate: '2024-09-30',
      budget: 280000,
      spent: 275000,
      client: {
        name: 'راشد الدوسري',
        nameEn: 'Rashid Al-Dosari',
        organization: 'شركة الحلول الذكية',
        organizationEn: 'Smart Solutions Company',
        avatar: 'RD',
        email: 'lead.consultant@example.com'
      },
      consultant: {
        name: 'محمد جودة',
        role: 'مستشار أول الحوكمة',
        avatar: 'MJ'
      },
      team: [
        { name: 'ليلى الغامدي', role: 'مستشار مساعد', avatar: 'LG', email: 'sub.consultant@example.com' },
        { name: 'عمر البقمي', role: 'خبير امتثال', avatar: 'OB', email: 'main.client@example.com' }
      ],
      deliverables: 5,
      completedDeliverables: 5,
      tasks: 15,
      completedTasks: 15,
      tickets: 2,
      openTickets: 0
    },
    {
      id: '4',
      title: 'مشروع تطوير سياسات الأمن السيبراني',
      titleEn: 'Cybersecurity Policies Development Project',
      description: 'وضع سياسات وإجراءات شاملة للأمن السيبراني وحماية البيانات والمعلومات الحساسة',
      descriptionEn: 'Developing comprehensive cybersecurity policies and procedures for data protection and sensitive information security',
      status: 'on_hold',
      priority: 'urgent',
      progress: 40,
      startDate: '2024-09-15',
      endDate: '2024-12-31',
      budget: 380000,
      spent: 152000,
      client: {
        name: 'منى الشهري',
        nameEn: 'Mona Al-Shehri',
        organization: 'شركة الأمان التقني',
        organizationEn: 'Technical Security Company',
        avatar: 'MS',
        email: 'admin@example.com'
      },
      consultant: {
        name: 'مروة الحمامصي',
        role: 'مستشارة أول الأمن السيبراني',
        avatar: 'MH'
      },
      team: [
        { name: 'يوسف الخالدي', role: 'خبير أمن سيبراني', avatar: 'YK', email: 'sub.consultant@example.com' },
        { name: 'هند الرشيد', role: 'محلل مخاطر', avatar: 'HR', email: 'sub.client@example.com' }
      ],
      deliverables: 7,
      completedDeliverables: 3,
      tasks: 21,
      completedTasks: 8,
      tickets: 4,
      openTickets: 3
    },
    {
      id: '5',
      title: 'مشروع تطوير سياسات إدارة المخاطر',
      titleEn: 'Risk Management Policies Development Project',
      description: 'تصميم وتطوير إطار متكامل لإدارة المخاطر المؤسسية وسياسات التعامل مع المخاطر المختلفة',
      descriptionEn: 'Design and develop an integrated enterprise risk management framework and policies for handling various risks',
      status: 'active',
      priority: 'medium',
      progress: 60,
      startDate: '2024-10-01',
      endDate: '2025-01-31',
      budget: 290000,
      spent: 174000,
      client: {
        name: 'طارق العنزي',
        nameEn: 'Tariq Al-Anzi',
        organization: 'مجموعة الاستثمار الخليجي',
        organizationEn: 'Gulf Investment Group',
        avatar: 'TA',
        email: 'main.client@example.com'
      },
      consultant: {
        name: 'محمد رشاد',
        role: 'مستشار أول إدارة المخاطر',
        avatar: 'MR'
      },
      team: [
        { name: 'سعد المطيري', role: 'محلل مخاطر أول', avatar: 'SM', email: 'sub.consultant@example.com' },
        { name: 'ريم الفيصل', role: 'مستشار مساعد', avatar: 'RF', email: 'sub.client@example.com' }
      ],
      deliverables: 6,
      completedDeliverables: 4,
      tasks: 18,
      completedTasks: 11,
      tickets: 3,
      openTickets: 1
    },
    {
      id: '6',
      title: 'مشروع تطوير سياسات الاستدامة البيئية',
      titleEn: 'Environmental Sustainability Policies Development Project',
      description: 'وضع استراتيجية شاملة للاستدامة البيئية وتطوير السياسات والإجراءات البيئية المؤسسية',
      descriptionEn: 'Developing a comprehensive environmental sustainability strategy and corporate environmental policies and procedures',
      status: 'planning',
      priority: 'low',
      progress: 15,
      startDate: '2024-12-01',
      endDate: '2025-04-30',
      budget: 220000,
      spent: 33000,
      client: {
        name: 'عبدالرحمن الغامدي',
        nameEn: 'Abdulrahman Al-Ghamdi',
        organization: 'شركة البيئة المستدامة',
        organizationEn: 'Sustainable Environment Company',
        avatar: 'AG',
        email: 'lead.consultant@example.com'
      },
      consultant: {
        name: 'محمد جودة',
        role: 'مستشار أول الاستدامة',
        avatar: 'MJ'
      },
      team: [
        { name: 'محمد رشاد', role: 'مستشار', avatar: 'MR', email: 'sub.consultant@example.com' },
        { name: 'مروة الحمامصي', role: 'مستشارة', avatar: 'MH', email: 'sub.client@example.com' }
      ],
      deliverables: 4,
      completedDeliverables: 1,
      tasks: 12,
      completedTasks: 2,
      tickets: 1,
      openTickets: 1
    }
  ];

  // تصفية المشاريع حسب دور المستخدم
  const getFilteredProjectsByRole = () => {
    if (!userProfile) return allProjects;
    
    switch (userProfile.role) {
      case 'sub_consultant':
        // المستشار المساعد يرى المشاريع المكلف بها فقط
        return allProjects.filter(project => 
          project.team.some(member => member.name === userProfile.full_name) ||
          project.consultant.name === userProfile.full_name
        );
      case 'main_client':
        // العميل الرئيسي يرى مشاريعه فقط
        return allProjects.filter(project => 
          project.client.organization === userProfile.organization
        );
      case 'sub_client':
        // العميل الفرعي يرى مشاريع مؤسسته فقط
        return allProjects.filter(project => 
          project.client.organization === userProfile.organization
        );
      default:
        // المستشار الرئيسي ومدير النظام يرون جميع المشاريع
        return allProjects;
    }
  };

  // Get projects based on user role and permissions
  const userProjects = getUserProjects(allProjects, userProfile?.role || '', userProfile?.email || '');

  // تصفية المشاريع حسب البحث والفلاتر
  const filteredProjects = userProjects.filter(project => {
    const matchesSearch = searchTerm === '' || 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: { label: t('projects.planning'), color: 'bg-blue-100 text-blue-800' },
      active: { label: t('projects.active'), color: 'bg-green-100 text-green-800' },
      on_hold: { label: t('projects.onHold'), color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: t('projects.completed'), color: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: t('projects.cancelled'), color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      urgent: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
  };

  // وظائف الأزرار
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowDetailsModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleCreateProjectSubmit = (projectData: any) => {
    // هنا يمكن إضافة المشروع إلى قاعدة البيانات
    console.log('Creating project:', projectData);
    alert(dir === 'rtl' ? 'تم إنشاء المشروع بنجاح!' : 'Project created successfully!');
  };

  const handleEditProjectSubmit = (projectData: any) => {
    // هنا يمكن تحديث المشروع في قاعدة البيانات
    console.log('Updating project:', projectData);
    alert(dir === 'rtl' ? 'تم تحديث المشروع بنجاح!' : 'Project updated successfully!');
  };

  // وظائف قائمة الإجراءات
  const handleManageTeam = (project: Project) => {
    setSelectedProject(project);
    setShowManageTeamModal(true);
  };

  const handleSaveTeam = (teamMembers: any[]) => {
    console.log('Saving team members:', teamMembers);
    alert(`${dir === 'rtl' ? 'تم حفظ تغييرات الفريق بنجاح' : 'Team changes saved successfully'}`);
    setShowManageTeamModal(false);
  };

  const handleManageTasks = (project: Project) => {
    alert(`${dir === 'rtl' ? 'إدارة مهام المشروع:' : 'Manage tasks for project:'} ${dir === 'rtl' ? project.title : project.titleEn}`);
  };

  const handleViewReports = (project: Project) => {
    alert(`${dir === 'rtl' ? 'عرض تقارير المشروع:' : 'View reports for project:'} ${dir === 'rtl' ? project.title : project.titleEn}`);
  };

  const handleArchive = (project: Project) => {
    if (confirm(dir === 'rtl' ? 'هل أنت متأكد من أرشفة هذا المشروع؟' : 'Are you sure you want to archive this project?')) {
      alert(`${dir === 'rtl' ? 'تم أرشفة المشروع:' : 'Project archived:'} ${dir === 'rtl' ? project.title : project.titleEn}`);
    }
  };

  const handleDelete = (project: Project) => {
    if (confirm(dir === 'rtl' ? 'هل أنت متأكد من حذف هذا المشروع؟ هذه العملية لا يمكن التراجع عنها.' : 'Are you sure you want to delete this project? This action cannot be undone.')) {
      alert(`${dir === 'rtl' ? 'تم حذف المشروع:' : 'Project deleted:'} ${dir === 'rtl' ? project.title : project.titleEn}`);
    }
  };

  const handleDuplicate = (project: Project) => {
    alert(`${dir === 'rtl' ? 'تم نسخ المشروع:' : 'Project duplicated:'} ${dir === 'rtl' ? project.title : project.titleEn}`);
  };

  const handleShare = (project: Project) => {
    alert(`${dir === 'rtl' ? 'مشاركة المشروع:' : 'Sharing project:'} ${dir === 'rtl' ? project.title : project.titleEn}`);
  };

  // إحصائيات المشاريع
  const stats = {
    total: filteredProjects.length,
    active: filteredProjects.filter(p => p.status === 'active').length,
    completed: filteredProjects.filter(p => p.status === 'completed').length,
    onHold: filteredProjects.filter(p => p.status === 'on_hold').length,
    totalBudget: filteredProjects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: filteredProjects.reduce((sum, p) => sum + p.spent, 0),
    avgProgress: Math.round(filteredProjects.reduce((sum, p) => sum + p.progress, 0) / filteredProjects.length) || 0
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleCreateProject} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {t('projects.newProject')}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{dir === 'rtl' ? 'إضافة مشروع جديد' : 'Add new project'}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('projects.totalProjects')}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
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
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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
                  <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
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
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalBudget)}</p>
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
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t('projects.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t('projects.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projects.allStatuses')}</SelectItem>
                  <SelectItem value="planning">{t('projects.planning')}</SelectItem>
                  <SelectItem value="active">{t('projects.active')}</SelectItem>
                  <SelectItem value="on_hold">{t('projects.onHold')}</SelectItem>
                  <SelectItem value="completed">{t('projects.completed')}</SelectItem>
                  <SelectItem value="cancelled">{t('projects.cancelled')}</SelectItem>
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
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
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
                      {project.client.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {dir === 'rtl' ? project.client.name : project.client.nameEn}
                    </p>
                    <p className="text-xs text-gray-600">
                      {dir === 'rtl' ? project.client.organization : project.client.organizationEn}
                    </p>
                  </div>
                </div>

                {/* Project Stats */}
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
                    <span>{project.openTickets}/{project.tickets} {dir === 'rtl' ? 'تذاكر مفتوحة' : 'open tickets'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{project.team.length + 1} {dir === 'rtl' ? 'أعضاء' : 'members'}</span>
                  </div>
                </div>

                {/* Budget Info */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{t('projects.budget')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">
                      {formatCurrency(project.budget)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {dir === 'rtl' ? 'مُنفق:' : 'Spent:'} {formatCurrency(project.spent)}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
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

                {/* Team Avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-600 mr-2">{t('projects.team')}:</span>
                    <div className="flex -space-x-2">
                      <Avatar className="w-6 h-6 border-2 border-white">
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                          {project.consultant.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {project.team.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="w-6 h-6 border-2 border-white">
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{project.team.length - 3}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => handleViewProject(project)}>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEditProject(project)}>
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
                      onView={handleViewProject}
                      onEdit={handleEditProject}
                      onManageTeam={handleManageTeam}
                      onManageTasks={handleManageTasks}
                      onViewReports={handleViewReports}
                      onArchive={handleArchive}
                      onDelete={handleDelete}
                      onDuplicate={handleDuplicate}
                      onShare={handleShare}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('projects.noProjectsFound')}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('projects.noProjectsDescription')}
              </p>
              {hasPermission('projects.create') && (
                <Button onClick={handleCreateProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('projects.createFirstProject')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProjectSubmit}
        />

        <ProjectDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          project={selectedProject}
          onEdit={handleEditProject}
        />

        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          project={selectedProject}
          onSave={handleEditProjectSubmit}
        />

        {selectedProject && (
          <ManageTeamModal
            isOpen={showManageTeamModal}
            onClose={() => setShowManageTeamModal(false)}
            project={selectedProject}
            onSave={handleSaveTeam}
          />
        )}
      </div>
    </TooltipProvider>
  );
}