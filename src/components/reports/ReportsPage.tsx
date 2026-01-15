import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Target,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Activity,
  Award,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
const API_URL = import.meta.env.VITE_API_URL;
// --- Interfaces matching Java DTOs ---

interface Overview {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalDeliverables: number;
  approvedDeliverables: number;
  pendingDeliverables: number;
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  totalRevenue: number;
  collectedRevenue: number;
  clientSatisfaction: number;
}

interface ProjectProgress {
  id: string;
  name: string;
  nameEn: string;
  progress: number;
  budget: number;
  spent: number;
}

interface DeliverableStatus {
  status: string;
  count: number;
  percentage: number;
}

interface TicketPriority {
  priority: string;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  monthEn: string;
  projects: number;
  deliverables: number;
  tickets: number;
}

interface ClientMetric {
  clientId: number;
  name: string;
  nameEn: string;
  satisfaction: number;
  projects: number;
  value: number;
}

interface DashboardData {
  overview: Overview;
  projectProgress: ProjectProgress[];
  deliverablesByStatus: DeliverableStatus[];
  ticketsByPriority: TicketPriority[];
  monthlyTrends: MonthlyTrend[];
  clientMetrics?: ClientMetric[]; // Optional as it depends on role
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}
const token = localStorage.getItem('accessToken');
export function ReportsPage() {
  const { userProfile } = useAuth(); // Assuming token is available here
  const { t, dir } = useLanguage();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Data Function
  const fetchReportsData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Build Query Params
      const params = new URLSearchParams({
        period: selectedPeriod,
        project: selectedProject
      });

      const response = await fetch(`${API_URL}/reports/dashboard?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include Auth Token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }
      console.log(response.json);
      const result: ApiResponse = await response.json();
      console.log('Success Status  :' + result.success);
      console.log('Message  :' + result.message);
      console.log('Data   :' + result.data);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || 'Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial Load & Filter Changes
  useEffect(() => {
    fetchReportsData();
  }, [selectedPeriod, selectedProject]);

  const refreshData = () => {
    fetchReportsData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    // Map backend status strings to colors
    const normalized = status.toLowerCase();
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      review: 'bg-yellow-500',
      approved: 'bg-green-500',
      published: 'bg-blue-500',
      // Add fallbacks for other statuses if needed
      pending_approval: 'bg-yellow-500',
      completed: 'bg-green-500'
    };
    return colors[normalized] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const normalized = priority.toLowerCase();
    const colors: Record<string, string> = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[normalized] || 'bg-gray-500';
  };

  if (loading && !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
        <Button onClick={refreshData} variant="outline" className="mt-4">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  // Use optional chaining for safety if API returns partial data
  const overview = data?.overview || {
    totalProjects: 0, activeProjects: 0, completedProjects: 0,
    totalDeliverables: 0, approvedDeliverables: 0, pendingDeliverables: 0,
    totalTickets: 0, resolvedTickets: 0, openTickets: 0,
    totalRevenue: 0, collectedRevenue: 0, clientSatisfaction: 0
  };

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-600 mt-1">{t('reports.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''} ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {t('common.refresh')}
          </Button>
          <Button variant="outline">
            <Download className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{dir === 'rtl' ? 'فلاتر التقارير' : 'Report Filters'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-48">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر الفترة' : 'Select Period'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">{dir === 'rtl' ? 'هذا الأسبوع' : 'This Week'}</SelectItem>
                  <SelectItem value="month">{dir === 'rtl' ? 'هذا الشهر' : 'This Month'}</SelectItem>
                  <SelectItem value="quarter">{dir === 'rtl' ? 'هذا الربع' : 'This Quarter'}</SelectItem>
                  <SelectItem value="year">{dir === 'rtl' ? 'هذا العام' : 'This Year'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* NOTE: Ideally the Project list should also be dynamic. 
                For now, keeping static options or 'all', but you might want to fetch this list too.
            */}
            <div className="w-full md:w-48">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر المشروع' : 'Select Project'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dir === 'rtl' ? 'جميع المشاريع' : 'All Projects'}</SelectItem>
                  {data?.projectProgress?.map(p => (
                    <SelectItem key={p.id} value={p.id}>{dir === 'rtl' ? p.name : p.nameEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.totalProjects')}</p>
                <p className="text-2xl font-bold">{overview.totalProjects}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  {/* Note: Backend needs to provide trend data for this to be dynamic */}
                  +12% {dir === 'rtl' ? 'من الشهر الماضي' : 'from last month'}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي المخرجات' : 'Total Deliverables'}</p>
                <p className="text-2xl font-bold">{overview.totalDeliverables}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% {dir === 'rtl' ? 'من الشهر الماضي' : 'from last month'}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'معدل الرضا' : 'Satisfaction Rate'}</p>
                <p className="text-2xl font-bold">{overview.clientSatisfaction}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +3% {dir === 'rtl' ? 'من الشهر الماضي' : 'from last month'}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Conditional Revenue Card based on User Role or Data Availability */}
        {(userProfile?.role === 'lead_consultant' || userProfile?.role === 'system_admin') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'الإيرادات المحصلة' : 'Collected Revenue'}</p>
                  <p className="text-xl font-bold">{formatCurrency(overview.collectedRevenue)}</p>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +15% {dir === 'rtl' ? 'من الشهر الماضي' : 'from last month'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {dir === 'rtl' ? 'تقدم المشاريع' : 'Project Progress'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.projectProgress?.length === 0 && <p className="text-sm text-gray-500 text-center">No projects found.</p>}
            {data?.projectProgress?.map((project, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {dir === 'rtl' ? project.name : project.nameEn}
                  </span>
                  <span className="text-gray-600">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{dir === 'rtl' ? 'الميزانية:' : 'Budget:'} {formatCurrency(project.budget)}</span>
                  <span>{dir === 'rtl' ? 'المنفق:' : 'Spent:'} {formatCurrency(project.spent)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Deliverables by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              {dir === 'rtl' ? 'المخرجات حسب الحالة' : 'Deliverables by Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.deliverablesByStatus?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                  <span className="text-sm capitalize">
                    {/* You might want a translation map here for proper Arabic/English toggle */}
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.count}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex h-2 rounded-full overflow-hidden">
                {data?.deliverablesByStatus?.map((item, index) => (
                  <div
                    key={index}
                    className={getStatusColor(item.status)}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets by Priority */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {dir === 'rtl' ? 'التذاكر حسب الأولوية' : 'Tickets by Priority'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.ticketsByPriority?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                  <span className="text-sm capitalize">
                    {item.priority}
                  </span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Key Metrics - Calculated from Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {dir === 'rtl' ? 'المؤشرات الرئيسية' : 'Key Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project Completion Rate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'معدل إنجاز المشاريع' : 'Project Completion Rate'}
              </span>
              <span className="text-sm font-medium">
                {overview.totalProjects > 0 ? Math.round((overview.completedProjects / overview.totalProjects) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${overview.totalProjects > 0 ? (overview.completedProjects / overview.totalProjects) * 100 : 0}%` }}></div>
            </div>

            {/* Ticket Resolution Rate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'معدل حل التذاكر' : 'Ticket Resolution Rate'}
              </span>
              <span className="text-sm font-medium">
                {overview.totalTickets > 0 ? Math.round((overview.resolvedTickets / overview.totalTickets) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${overview.totalTickets > 0 ? (overview.resolvedTickets / overview.totalTickets) * 100 : 0}%` }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity - Kept static or needs separate API endpoint */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {dir === 'rtl' ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* TODO: API integration for /api/dashboard/recent (if exists) 
                 Using static placeholder for layout consistency as requested.
             */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">
                {dir === 'rtl' ? 'تم تحديث البيانات' : 'Data Refreshed'}
              </span>
              <span className="text-xs text-gray-400 mr-auto">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Metrics - Only for Lead Consultant / Admin */}
      {data?.clientMetrics && data.clientMetrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {dir === 'rtl' ? 'مؤشرات العملاء' : 'Client Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className={`text-${dir === 'rtl' ? 'right' : 'left'} py-2`}>
                      {dir === 'rtl' ? 'العميل' : 'Client'}
                    </th>
                    <th className={`text-${dir === 'rtl' ? 'right' : 'left'} py-2`}>
                      {dir === 'rtl' ? 'المشاريع' : 'Projects'}
                    </th>
                    <th className={`text-${dir === 'rtl' ? 'right' : 'left'} py-2`}>
                      {dir === 'rtl' ? 'القيمة' : 'Value'}
                    </th>
                    <th className={`text-${dir === 'rtl' ? 'right' : 'left'} py-2`}>
                      {dir === 'rtl' ? 'الرضا' : 'Satisfaction'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.clientMetrics.map((client, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3">
                        <span className="font-medium">
                          {dir === 'rtl' ? client.name : client.nameEn}
                        </span>
                      </td>
                      <td className="py-3">{client.projects}</td>
                      <td className="py-3">{formatCurrency(client.value)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${client.satisfaction}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{client.satisfaction}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {dir === 'rtl' ? 'الاتجاهات الشهرية' : 'Monthly Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Projects Trend */}
            <div>
              <h4 className="font-medium mb-3">{dir === 'rtl' ? 'المشاريع الجديدة' : 'New Projects'}</h4>
              <div className="space-y-2">
                {data?.monthlyTrends?.map((month, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dir === 'rtl' ? month.month : month.monthEn}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full"
                          // Simple scaling relative to max possible, ideally calculate max from data
                          style={{ width: `${Math.min((month.projects / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{month.projects}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables Trend */}
            <div>
              <h4 className="font-medium mb-3">{dir === 'rtl' ? 'المخرجات المكتملة' : 'Completed Deliverables'}</h4>
              <div className="space-y-2">
                {data?.monthlyTrends?.map((month, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dir === 'rtl' ? month.month : month.monthEn}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-green-600 h-1 rounded-full"
                          style={{ width: `${Math.min((month.deliverables / 20) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{month.deliverables}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets Trend */}
            <div>
              <h4 className="font-medium mb-3">{dir === 'rtl' ? 'التذاكر المحلولة' : 'Resolved Tickets'}</h4>
              <div className="space-y-2">
                {data?.monthlyTrends?.map((month, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dir === 'rtl' ? month.month : month.monthEn}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{ width: `${Math.min((month.tickets / 10) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-medium">{month.tickets}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}