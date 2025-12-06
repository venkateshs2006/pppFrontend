import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  FileText, 
  Ticket,
  TrendingUp,
  RefreshCw,
  Activity,
  Target,
  Calendar,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function Dashboard() {
  const [loading, setLoading] = useState(false);
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  // Role-based dashboard data
  const getDashboardData = () => {
    const baseStats = {
      totalProjects: 12,
      activeProjects: 8,
      completedTasks: 45,
      pendingApprovals: 6,
      openTickets: 3,
      overallProgress: 68
    };

    // Adjust data based on user role
    if (userProfile?.role === 'sub_consultant') {
      return {
        ...baseStats,
        totalProjects: 5, // Only assigned projects
        activeProjects: 3,
        completedTasks: 18,
        pendingApprovals: 2,
      };
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      return {
        ...baseStats,
        totalProjects: 3, // Only their organization's projects
        activeProjects: 2,
        completedTasks: 12,
        pendingApprovals: 4,
      };
    }

    return baseStats;
  };

  const stats = getDashboardData();

  const getRecentProjects = () => {
    const allProjects = [
      {
        id: '1',
        title: 'مشروع تطوير سياسات الموارد البشرية',
        titleEn: 'HR Policies Development Project',
        progress: 75,
        status: 'active',
        client: 'شركة التقنية المتقدمة',
        clientEn: 'Advanced Technology Company',
        dueDate: '2024-12-15'
      },
      {
        id: '2',
        title: 'مشروع إعادة هيكلة السياسات المالية',
        titleEn: 'Financial Policies Restructuring Project',
        progress: 45,
        status: 'active',
        client: 'مجموعة الاستثمار الخليجي',
        clientEn: 'Gulf Investment Group',
        dueDate: '2024-11-30'
      },
      {
        id: '3',
        title: 'مشروع تطوير دليل الحوكمة المؤسسية',
        titleEn: 'Corporate Governance Manual Development',
        progress: 90,
        status: 'review',
        client: 'البنك التجاري الوطني',
        clientEn: 'National Commercial Bank',
        dueDate: '2024-11-20'
      }
    ];

    // Filter based on user role
    if (userProfile?.role === 'sub_consultant') {
      return allProjects.slice(0, 2); // Only assigned projects
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      return allProjects.slice(0, 1); // Only their organization's projects
    }

    return allProjects;
  };

  const getRecentDeliverables = () => {
    return [
      {
        id: '1',
        title: 'سياسة التوظيف والاختيار المحدثة',
        titleEn: 'Updated Recruitment and Selection Policy',
        type: 'policy',
        status: 'approved',
        project: 'مشروع الموارد البشرية',
        projectEn: 'HR Project',
        version: '2.1'
      },
      {
        id: '2',
        title: 'دليل إجراءات المراجعة الداخلية',
        titleEn: 'Internal Audit Procedures Manual',
        type: 'guide',
        status: 'review',
        project: 'مشروع الحوكمة',
        projectEn: 'Governance Project',
        version: '1.0'
      },
      {
        id: '3',
        title: 'قالب تقييم الأداء السنوي',
        titleEn: 'Annual Performance Evaluation Template',
        type: 'template',
        status: 'draft',
        project: 'مشروع الموارد البشرية',
        projectEn: 'HR Project',
        version: '1.2'
      }
    ];
  };

  const getRecentTickets = () => {
    return [
      {
        id: '1',
        title: 'طلب تعديل سياسة الإجازات',
        titleEn: 'Request to modify leave policy',
        priority: 'medium',
        status: 'open',
        project: 'مشروع الموارد البشرية',
        projectEn: 'HR Project',
        createdAt: '2024-10-30'
      },
      {
        id: '2',
        title: 'استفسار حول إجراءات الموافقة',
        titleEn: 'Inquiry about approval procedures',
        priority: 'low',
        status: 'waiting_response',
        project: 'مشروع الحوكمة',
        projectEn: 'Governance Project',
        createdAt: '2024-10-29'
      },
      {
        id: '3',
        title: 'طلب مراجعة عاجلة لسياسة الأمان',
        titleEn: 'Urgent security policy review request',
        priority: 'urgent',
        status: 'in_progress',
        project: 'مشروع الأمن السيبراني',
        projectEn: 'Cybersecurity Project',
        createdAt: '2024-10-31'
      }
    ];
  };

  const recentProjects = getRecentProjects();
  const recentDeliverables = getRecentDeliverables();
  const recentTickets = getRecentTickets();

  const getStatusBadge = (status: string, type: 'project' | 'deliverable' | 'ticket' = 'project') => {
    const configs = {
      project: {
        active: { label: t('projects.active'), color: 'bg-green-100 text-green-800' },
        review: { label: t('deliverables.review'), color: 'bg-yellow-100 text-yellow-800' },
        completed: { label: t('projects.completed'), color: 'bg-blue-100 text-blue-800' },
      },
      deliverable: {
        draft: { label: t('deliverables.draft'), color: 'bg-gray-100 text-gray-800' },
        review: { label: t('deliverables.review'), color: 'bg-yellow-100 text-yellow-800' },
        approved: { label: t('deliverables.approved'), color: 'bg-green-100 text-green-800' },
        published: { label: t('deliverables.published'), color: 'bg-blue-100 text-blue-800' },
      },
      ticket: {
        open: { label: t('tickets.open'), color: 'bg-red-100 text-red-800' },
        in_progress: { label: t('tickets.inProgress'), color: 'bg-blue-100 text-blue-800' },
        waiting_response: { label: t('tickets.waitingResponse'), color: 'bg-yellow-100 text-yellow-800' },
        resolved: { label: t('tickets.resolved'), color: 'bg-green-100 text-green-800' },
      }
    };

    const config = configs[type][status as keyof typeof configs[typeof type]] || 
                   { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const configs = {
      low: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      urgent: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };

    const config = configs[priority as keyof typeof configs] || 
                   { label: priority, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('dashboard.welcome')}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {t(`roles.${userProfile?.role}`)}
            </Badge>
            <span className="text-sm text-gray-500">
              {userProfile?.organization}
            </span>
          </div>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalProjects')}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} {t('dashboard.activeProjects').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.completedTasks')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingApprovals} {t('dashboard.pendingApprovals').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.openTickets')}</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              {dir === 'rtl' ? 'تحتاج إلى متابعة' : 'Need follow-up'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.overallProgress')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        {hasPermission('projects.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('dashboard.recentProjects')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {dir === 'rtl' ? project.title : project.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? project.client : project.clientEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard.progress')}: {project.progress}%
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(project.status, 'project')}
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-600 h-1 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Deliverables */}
        {hasPermission('deliverables.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {t('dashboard.recentDeliverables')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentDeliverables.map((deliverable) => (
                <div key={deliverable.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {dir === 'rtl' ? deliverable.title : deliverable.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? deliverable.project : deliverable.projectEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('deliverables.version')}: {deliverable.version}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(deliverable.status, 'deliverable')}
                    <Badge variant="outline" className="text-xs">
                      {t(`deliverables.${deliverable.type}`)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Tickets */}
        {hasPermission('tickets.view') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {t('dashboard.recentTickets')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {dir === 'rtl' ? ticket.title : ticket.titleEn}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {dir === 'rtl' ? ticket.project : ticket.projectEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(ticket.status, 'ticket')}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics for Lead Consultant */}
      {userProfile?.role === 'lead_consultant' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {dir === 'rtl' ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {dir === 'rtl' ? 'معدل إنجاز المشاريع' : 'Project Completion Rate'}
                </span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {dir === 'rtl' ? 'رضا العملاء' : 'Client Satisfaction'}
                </span>
                <span className="text-sm font-medium">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {dir === 'rtl' ? 'الالتزام بالمواعيد' : 'On-Time Delivery'}
                </span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {dir === 'rtl' ? 'المواعيد النهائية القادمة' : 'Upcoming Deadlines'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {dir === 'rtl' ? 'مراجعة سياسة الأمان' : 'Security Policy Review'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {dir === 'rtl' ? 'مشروع الأمن السيبراني' : 'Cybersecurity Project'}
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {dir === 'rtl' ? '2 أيام' : '2 days'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {dir === 'rtl' ? 'تسليم دليل الحوكمة' : 'Governance Manual Delivery'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {dir === 'rtl' ? 'مشروع الحوكمة' : 'Governance Project'}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {dir === 'rtl' ? '5 أيام' : '5 days'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    {dir === 'rtl' ? 'مراجعة السياسات المالية' : 'Financial Policies Review'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {dir === 'rtl' ? 'مشروع السياسات المالية' : 'Financial Policies Project'}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {dir === 'rtl' ? '10 أيام' : '10 days'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}