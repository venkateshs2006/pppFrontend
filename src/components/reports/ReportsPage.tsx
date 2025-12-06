import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Target,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  PieChart,
  Activity,
  Award,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function ReportsPage() {
  const { userProfile } = useAuth();
  const { t, dir } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(false);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  // بيانات التقارير حسب دور المستخدم
  const getReportsData = () => {
    const baseData = {
      overview: {
        totalProjects: 12,
        activeProjects: 8,
        completedProjects: 4,
        totalDeliverables: 45,
        approvedDeliverables: 32,
        pendingDeliverables: 13,
        totalTickets: 28,
        resolvedTickets: 20,
        openTickets: 8,
        totalRevenue: 4330000,
        collectedRevenue: 3247500,
        clientSatisfaction: 91
      },
      projectProgress: [
        { name: 'مشروع الموارد البشرية', nameEn: 'HR Project', progress: 75, budget: 450000, spent: 337500 },
        { name: 'مشروع السياسات المالية', nameEn: 'Financial Policies', progress: 45, budget: 380000, spent: 171000 },
        { name: 'مشروع الحوكمة', nameEn: 'Governance Project', progress: 15, budget: 520000, spent: 78000 },
        { name: 'مشروع الأمن السيبراني', nameEn: 'Cybersecurity Project', progress: 60, budget: 290000, spent: 174000 }
      ],
      deliverablesByStatus: [
        { status: 'draft', count: 8, percentage: 18 },
        { status: 'review', count: 5, percentage: 11 },
        { status: 'approved', count: 20, percentage: 44 },
        { status: 'published', count: 12, percentage: 27 }
      ],
      ticketsByPriority: [
        { priority: 'low', count: 5, percentage: 18 },
        { priority: 'medium', count: 12, percentage: 43 },
        { priority: 'high', count: 8, percentage: 29 },
        { priority: 'urgent', count: 3, percentage: 10 }
      ],
      monthlyTrends: [
        { month: 'يناير', monthEn: 'Jan', projects: 2, deliverables: 8, tickets: 5 },
        { month: 'فبراير', monthEn: 'Feb', projects: 3, deliverables: 12, tickets: 7 },
        { month: 'مارس', monthEn: 'Mar', projects: 2, deliverables: 15, tickets: 6 },
        { month: 'أبريل', monthEn: 'Apr', projects: 1, deliverables: 10, tickets: 4 },
        { month: 'مايو', monthEn: 'May', projects: 2, deliverables: 18, tickets: 8 },
        { month: 'يونيو', monthEn: 'Jun', projects: 2, deliverables: 22, tickets: 6 }
      ],
      clientMetrics: [
        { name: 'شركة التقنية المتقدمة', nameEn: 'Advanced Technology', satisfaction: 92, projects: 3, value: 1250000 },
        { name: 'مجموعة الاستثمار الخليجي', nameEn: 'Gulf Investment Group', satisfaction: 88, projects: 2, value: 850000 },
        { name: 'البنك التجاري الوطني', nameEn: 'National Commercial Bank', satisfaction: 95, projects: 1, value: 520000 },
        { name: 'شركة الاتصالات الرقمية', nameEn: 'Digital Communications', satisfaction: 90, projects: 2, value: 680000 }
      ]
    };

    // تعديل البيانات حسب دور المستخدم
    if (userProfile?.role === 'sub_consultant') {
      return {
        ...baseData,
        overview: {
          ...baseData.overview,
          totalProjects: 5,
          activeProjects: 3,
          completedProjects: 2,
          totalDeliverables: 18,
          approvedDeliverables: 12,
          pendingDeliverables: 6,
          totalTickets: 12,
          resolvedTickets: 8,
          openTickets: 4
        },
        projectProgress: baseData.projectProgress.slice(0, 3)
      };
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      return {
        ...baseData,
        overview: {
          ...baseData.overview,
          totalProjects: 3,
          activeProjects: 2,
          completedProjects: 1,
          totalDeliverables: 15,
          approvedDeliverables: 11,
          pendingDeliverables: 4,
          totalTickets: 8,
          resolvedTickets: 5,
          openTickets: 3,
          totalRevenue: 1250000,
          collectedRevenue: 950000
        },
        projectProgress: baseData.projectProgress.slice(0, 2),
        clientMetrics: baseData.clientMetrics.slice(0, 1)
      };
    }

    return baseData;
  };

  const data = getReportsData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-500',
      review: 'bg-yellow-500',
      approved: 'bg-green-500',
      published: 'bg-blue-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-500';
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
            <div className="w-full md:w-48">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'اختر المشروع' : 'Select Project'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dir === 'rtl' ? 'جميع المشاريع' : 'All Projects'}</SelectItem>
                  <SelectItem value="hr">{dir === 'rtl' ? 'مشروع الموارد البشرية' : 'HR Project'}</SelectItem>
                  <SelectItem value="finance">{dir === 'rtl' ? 'مشروع السياسات المالية' : 'Financial Policies'}</SelectItem>
                  <SelectItem value="governance">{dir === 'rtl' ? 'مشروع الحوكمة' : 'Governance Project'}</SelectItem>
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
                <p className="text-2xl font-bold">{data.overview.totalProjects}</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
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
                <p className="text-2xl font-bold">{data.overview.totalDeliverables}</p>
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
                <p className="text-2xl font-bold">{data.overview.clientSatisfaction}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +3% {dir === 'rtl' ? 'من الشهر الماضي' : 'from last month'}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {(userProfile?.role === 'lead_consultant' || userProfile?.role === 'system_admin') && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'الإيرادات المحصلة' : 'Collected Revenue'}</p>
                  <p className="text-xl font-bold">{formatCurrency(data.overview.collectedRevenue)}</p>
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
            {data.projectProgress.map((project, index) => (
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
            {data.deliverablesByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                  <span className="text-sm">
                    {dir === 'rtl' ? 
                      (item.status === 'draft' ? 'مسودة' : 
                       item.status === 'review' ? 'مراجعة' :
                       item.status === 'approved' ? 'معتمد' : 'منشور') :
                      (item.status === 'draft' ? 'Draft' : 
                       item.status === 'review' ? 'Review' :
                       item.status === 'approved' ? 'Approved' : 'Published')
                    }
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
                {data.deliverablesByStatus.map((item, index) => (
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
            {data.ticketsByPriority.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`}></div>
                  <span className="text-sm">
                    {dir === 'rtl' ? 
                      (item.priority === 'low' ? 'منخفضة' : 
                       item.priority === 'medium' ? 'متوسطة' :
                       item.priority === 'high' ? 'عالية' : 'عاجلة') :
                      (item.priority === 'low' ? 'Low' : 
                       item.priority === 'medium' ? 'Medium' :
                       item.priority === 'high' ? 'High' : 'Urgent')
                    }
                  </span>
                </div>
                <span className="text-sm font-medium">{item.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {dir === 'rtl' ? 'المؤشرات الرئيسية' : 'Key Metrics'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'معدل إنجاز المشاريع' : 'Project Completion Rate'}
              </span>
              <span className="text-sm font-medium">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'معدل الاستجابة للتذاكر' : 'Ticket Response Rate'}
              </span>
              <span className="text-sm font-medium">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'الالتزام بالمواعيد' : 'On-Time Delivery'}
              </span>
              <span className="text-sm font-medium">88%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {dir === 'rtl' ? 'النشاط الأخير' : 'Recent Activity'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">
                {dir === 'rtl' ? 'تم اعتماد سياسة جديدة' : 'New policy approved'}
              </span>
              <span className="text-xs text-gray-400 mr-auto">
                {dir === 'rtl' ? 'منذ ساعتين' : '2h ago'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">
                {dir === 'rtl' ? 'تم إنشاء مشروع جديد' : 'New project created'}
              </span>
              <span className="text-xs text-gray-400 mr-auto">
                {dir === 'rtl' ? 'منذ 4 ساعات' : '4h ago'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">
                {dir === 'rtl' ? 'تذكرة جديدة مفتوحة' : 'New ticket opened'}
              </span>
              <span className="text-xs text-gray-400 mr-auto">
                {dir === 'rtl' ? 'منذ 6 ساعات' : '6h ago'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">
                {dir === 'rtl' ? 'تم تحديث مخرج' : 'Deliverable updated'}
              </span>
              <span className="text-xs text-gray-400 mr-auto">
                {dir === 'rtl' ? 'منذ 8 ساعات' : '8h ago'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Metrics - Only for Lead Consultant */}
      {(userProfile?.role === 'lead_consultant' || userProfile?.role === 'system_admin') && (
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
                {data.monthlyTrends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dir === 'rtl' ? month.month : month.monthEn}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full" 
                          style={{ width: `${(month.projects / 3) * 100}%` }}
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
                {data.monthlyTrends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dir === 'rtl' ? month.month : month.monthEn}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-green-600 h-1 rounded-full" 
                          style={{ width: `${(month.deliverables / 22) * 100}%` }}
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
                {data.monthlyTrends.map((month, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{dir === 'rtl' ? month.month : month.monthEn}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-purple-600 h-1 rounded-full" 
                          style={{ width: `${(month.tickets / 8) * 100}%` }}
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