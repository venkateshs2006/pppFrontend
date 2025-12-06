import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock,
  AlertCircle,
  CheckCircle2,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function TasksPage() {
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // وظائف الأزرار
  const handleViewTask = (task: any) => {
    alert(`عرض تفاصيل المهمة: ${task.title}`);
  };

  const handleEditTask = (task: any) => {
    alert(`تحرير المهمة: ${task.title}`);
  };

  const handleTaskActions = (task: any) => {
    const actions = ['تفاصيل المهمة', 'تغيير الحالة', 'إضافة تعليق', 'حذف المهمة'];
    const selectedAction = prompt(`اختر إجراء: \n${actions.map((action, index) => `${index + 1}. ${action}`).join('\n')}`);
    if (selectedAction) {
      const actionIndex = parseInt(selectedAction) - 1;
      if (actionIndex >= 0 && actionIndex < actions.length) {
        alert(`تم اختيار: ${actions[actionIndex]}`);
      }
    }
  };

  const handleCreateTask = () => {
    alert('فتح نموذج إنشاء مهمة جديدة');
  };

  // بيانات ثابتة لتجنب البطء
  const tasks = [
    {
      id: '1',
      title: 'تحليل السياسات الحالية للموارد البشرية',
      description: 'مراجعة وتحليل جميع السياسات الحالية وتحديد نقاط التطوير المطلوبة',
      status: 'completed',
      priority: 'high',
      due_date: '2024-02-15',
      estimated_hours: 40,
      actual_hours: 38,
      project_name: 'مشروع الموارد البشرية'
    },
    {
      id: '2',
      title: 'وضع مسودة سياسة التوظيف الجديدة',
      description: 'كتابة مسودة أولية لسياسة التوظيف والاختيار المحدثة',
      status: 'in_progress',
      priority: 'high',
      due_date: '2024-11-15',
      estimated_hours: 32,
      actual_hours: 20,
      project_name: 'مشروع الموارد البشرية'
    },
    {
      id: '3',
      title: 'مراجعة إجراءات التقييم السنوي',
      description: 'تطوير وتحديث إجراءات تقييم الأداء السنوي للموظفين',
      status: 'review',
      priority: 'medium',
      due_date: '2024-11-30',
      estimated_hours: 24,
      actual_hours: 15,
      project_name: 'مشروع الموارد البشرية'
    },
    {
      id: '4',
      title: 'تطوير سياسة الإجازات والغياب',
      description: 'وضع سياسة شاملة لإدارة الإجازات وحالات الغياب',
      status: 'not_started',
      priority: 'medium',
      due_date: '2024-12-15',
      estimated_hours: 20,
      actual_hours: 0,
      project_name: 'مشروع الموارد البشرية'
    },
    {
      id: '5',
      title: 'مراجعة السياسات المالية الحالية',
      description: 'تحليل ومراجعة جميع السياسات المالية والمحاسبية الموجودة',
      status: 'completed',
      priority: 'critical',
      due_date: '2024-03-01',
      estimated_hours: 50,
      actual_hours: 48,
      project_name: 'مشروع السياسات المالية'
    },
    {
      id: '6',
      title: 'تطوير سياسة إدارة المخاطر المالية',
      description: 'وضع سياسة شاملة لإدارة وتقييم المخاطر المالية',
      status: 'in_progress',
      priority: 'high',
      due_date: '2024-11-20',
      estimated_hours: 35,
      actual_hours: 18,
      project_name: 'مشروع السياسات المالية'
    },
    {
      id: '7',
      title: 'إعداد دليل الإجراءات المحاسبية',
      description: 'تطوير دليل مفصل للإجراءات المحاسبية والمالية',
      status: 'not_started',
      priority: 'high',
      due_date: '2024-12-31',
      estimated_hours: 45,
      actual_hours: 0,
      project_name: 'مشروع السياسات المالية'
    },
    {
      id: '8',
      title: 'وضع إطار الحوكمة المؤسسية',
      description: 'تطوير الإطار العام للحوكمة المؤسسية والامتثال',
      status: 'in_progress',
      priority: 'critical',
      due_date: '2024-11-10',
      estimated_hours: 60,
      actual_hours: 25,
      project_name: 'مشروع الحوكمة'
    },
    {
      id: '9',
      title: 'تطوير سياسات الأمن السيبراني',
      description: 'وضع سياسات شاملة لحماية أنظمة المعلومات',
      status: 'review',
      priority: 'critical',
      due_date: '2024-11-05',
      estimated_hours: 80,
      actual_hours: 75,
      project_name: 'مشروع الأمن السيبراني'
    },
    {
      id: '10',
      title: 'إعداد دليل إجراءات الطوارئ',
      description: 'تطوير دليل شامل لإجراءات التعامل مع حالات الطوارئ',
      status: 'blocked',
      priority: 'high',
      due_date: '2024-12-01',
      estimated_hours: 30,
      actual_hours: 5,
      project_name: 'مشروع العمليات التشغيلية'
    }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_started: { label: 'لم تبدأ', variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'قيد التنفيذ', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      review: { label: 'مراجعة', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'مكتملة', variant: 'secondary' as const, color: 'bg-green-100 text-green-800' },
      blocked: { label: 'معطلة', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'منخفضة', color: 'bg-green-100 text-green-800' },
      medium: { label: 'متوسطة', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'عالية', color: 'bg-orange-100 text-orange-800' },
      critical: { label: 'حرجة', color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => isOverdue(t.due_date)).length
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المهام</h1>
          <p className="text-gray-600 mt-1">
            تتبع وإدارة جميع مهام المشاريع
          </p>
        </div>
        <Button onClick={handleCreateTask} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          مهمة جديدة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المهام</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مكتملة</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متأخرة</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="البحث في المهام..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية بالحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="not_started">لم تبدأ</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="review">مراجعة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="blocked">معطلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="تصفية بالأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأولويات</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="critical">حرجة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card key={task.id} className={`hover:shadow-md transition-shadow ${isOverdue(task.due_date) ? 'border-red-200 bg-red-50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Status Icon */}
                  <div className="mt-1">
                    {getStatusIcon(task.status)}
                  </div>

                  {/* Task Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <p className="text-sm text-gray-600">
                          المشروع: {task.project_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                        {isOverdue(task.due_date) && (
                          <Badge variant="destructive">متأخرة</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                      {task.description}
                    </p>

                    {/* Task Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className={isOverdue(task.due_date) ? 'text-red-600 font-medium' : ''}>
                          الموعد النهائي: {new Date(task.due_date).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>الوقت المقدر: {task.estimated_hours} ساعة</span>
                      </div>
                      
                      {task.actual_hours > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>الوقت الفعلي: {task.actual_hours} ساعة</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mr-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewTask(task)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleTaskActions(task)}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مهام</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'لم يتم العثور على مهام تطابق معايير البحث'
                : 'ابدأ بإنشاء مهمة جديدة لمشروعك'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء مهمة جديدة
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}