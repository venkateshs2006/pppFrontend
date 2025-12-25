import { useState, useEffect } from 'react';
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
import { toast } from 'sonner'; // Assuming sonner is used for toasts based on package.json

// --- Types based on API Response ---
interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedTasks: number;
  pendingApprovals: number;
  openTickets: number;
  overallProgress: number;
}

interface RecentProject {
  id: string;
  title: string;
  titleEn: string | null;
  progress: number;
  status: string;
  clientName: string;
  clientNameEn: string | null;
  dueDate: string | null;
}

interface RecentDeliverable {
  id: string;
  title: string;
  titleEn: string | null;
  type: string;
  status: string;
  projectName: string;
  projectNameEn: string | null;
  version: string;
}

interface RecentTicket {
  id: string;
  title: string;
  titleEn: string | null;
  priority: string;
  status: string;
  projectName: string;
  projectNameEn: string | null;
  createdAt: string;
}

interface KPI {
  label: string;
  labelEn: string | null;
  percentage: number;
  colorClass: string;
}

interface UpcomingDeadline {
  title: string;
  titleEn: string | null;
  projectName: string;
  projectNameEn: string | null;
  daysRemaining: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentProjects: RecentProject[];
  recentDeliverables: RecentDeliverable[];
  recentTickets: RecentTicket[];
  kpis?: KPI[];
  upcomingDeadlines?: UpcomingDeadline[];
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Get the token from storage
      const token = localStorage.getItem('accessToken');
      console.log("Dashboard", token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch from your Spring Boot API
      // Note: Ensure you handle CORS or proxying if frontend/backend ports differ
      // Add authentication headers if your AuthContext provides a token
      const response = await fetch('http://localhost:8080/api/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Uncomment and inject token if needed
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result: DashboardData = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error(dir === 'rtl' ? 'فشل تحميل البيانات' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData();
  };

  // Helper to normalize status strings (API returns uppercase, UI expects lowercase keys)
  const getStatusBadge = (status: string, type: 'project' | 'deliverable' | 'ticket' = 'project') => {
    const normalizedStatus = status ? status.toLowerCase() : '';

    const configs = {
      project: {
        active: { label: t('projects.active'), color: 'bg-green-100 text-green-800' },
        review: { label: t('deliverables.review'), color: 'bg-yellow-100 text-yellow-800' },
        completed: { label: t('projects.completed'), color: 'bg-blue-100 text-blue-800' },
        planning: { label: t('projects.planning'), color: 'bg-blue-50 text-blue-700' },
        cancelled: { label: t('projects.cancelled'), color: 'bg-red-50 text-red-700' },
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
        closed: { label: t('tickets.closed'), color: 'bg-gray-100 text-gray-800' },
      }
    };

    const typeConfig = configs[type] as any;
    const config = typeConfig[normalizedStatus] ||
      { label: status, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const normalizedPriority = priority ? priority.toLowerCase() : '';

    const configs = {
      low: { label: t('tickets.low'), color: 'bg-green-100 text-green-800' },
      medium: { label: t('tickets.medium'), color: 'bg-yellow-100 text-yellow-800' },
      high: { label: t('tickets.high'), color: 'bg-orange-100 text-orange-800' },
      urgent: { label: t('tickets.urgent'), color: 'bg-red-100 text-red-800' },
    };

    const config = configs[normalizedPriority as keyof typeof configs] ||
      { label: priority, color: 'bg-gray-100 text-gray-800' };

    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Fallback if data failed to load
  if (!data) return null;

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
            <div className="text-2xl font-bold">{data.stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.activeProjects} {t('dashboard.activeProjects').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.completedTasks')}</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {data.stats.pendingApprovals} {t('dashboard.pendingApprovals').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.openTickets')}</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.openTickets}</div>
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
            <div className="text-2xl font-bold">{data.stats.overallProgress}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${data.stats.overallProgress}%` }}
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
              {data.recentProjects && data.recentProjects.length > 0 ? (
                data.recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {dir === 'rtl' ? project.title : (project.titleEn || project.title)}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dir === 'rtl' ? project.clientName : (project.clientNameEn || project.clientName)}
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
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {dir === 'rtl' ? 'لا توجد مشاريع حديثة' : 'No recent projects'}
                </p>
              )}
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
              {data.recentDeliverables && data.recentDeliverables.length > 0 ? (
                data.recentDeliverables.map((deliverable) => (
                  <div key={deliverable.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {dir === 'rtl' ? deliverable.title : (deliverable.titleEn || deliverable.title)}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dir === 'rtl' ? deliverable.projectName : (deliverable.projectNameEn || deliverable.projectName)}
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
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {dir === 'rtl' ? 'لا توجد تسليمات حديثة' : 'No recent deliverables'}
                </p>
              )}
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
              {data.recentTickets && data.recentTickets.length > 0 ? (
                data.recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {dir === 'rtl' ? ticket.title : (ticket.titleEn || ticket.title)}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {dir === 'rtl' ? ticket.projectName : (ticket.projectNameEn || ticket.projectName)}
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
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {dir === 'rtl' ? 'لا توجد تذاكر مفتوحة' : 'No open tickets'}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Metrics (KPIs) - Display if data is present */}
      {data.kpis && data.kpis.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                {dir === 'rtl' ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.kpis.map((kpi, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {dir === 'rtl' ? kpi.label : (kpi.labelEn || kpi.label)}
                    </span>
                    <span className="text-sm font-medium">{kpi.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${kpi.colorClass} h-2 rounded-full`}
                      style={{ width: `${kpi.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {data.upcomingDeadlines && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {dir === 'rtl' ? 'المواعيد النهائية القادمة' : 'Upcoming Deadlines'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.upcomingDeadlines.length > 0 ? (
                  data.upcomingDeadlines.map((deadline, index) => (
                    <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${deadline.daysRemaining <= 2 ? 'bg-red-50' : deadline.daysRemaining <= 5 ? 'bg-yellow-50' : 'bg-green-50'}`}>
                      <div>
                        <p className="text-sm font-medium">
                          {dir === 'rtl' ? deadline.title : (deadline.titleEn || deadline.title)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {dir === 'rtl' ? deadline.projectName : (deadline.projectNameEn || deadline.projectName)}
                        </p>
                      </div>
                      <Badge
                        variant={deadline.daysRemaining <= 2 ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {dir === 'rtl' ? `${deadline.daysRemaining} أيام` : `${deadline.daysRemaining} days`}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    {dir === 'rtl' ? 'لا توجد مواعيد نهائية قريبة' : 'No upcoming deadlines'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}