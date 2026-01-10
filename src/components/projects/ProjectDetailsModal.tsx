import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  DollarSign,
  Users,
  Target,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Edit,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { projectService } from '@/services/projectService';
import { useToast } from '@/components/ui/use-toast';

// Define Interface matching the Backend DTO
export interface Project {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  status: string;
  priority: string;
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
  }>;
  deliverables: number;
  completedDeliverables: number;
  tasks: number;
  completedTasks: number;
  tickets: number;
  openTickets: number;
}

// Interface for Deliverables fetched from API
interface Deliverable {
  id: string;
  title: string;
  titleEn: string;
  status: 'pending' | 'in_progress' | 'completed' | 'review';
  dueDate?: string;
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit: (project: Project) => void;
}

export function ProjectDetailsModal({ isOpen, onClose, project, onEdit }: ProjectDetailsModalProps) {
  const { language, dir } = useLanguage();
  const { toast } = useToast();

  // State for dynamic data
  const [deliverablesList, setDeliverablesList] = useState<Deliverable[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch details when modal opens and project ID exists
  useEffect(() => {
    if (isOpen && project?.id) {
      fetchProjectDetails(project.id);
    }
  }, [isOpen, project]);

  const fetchProjectDetails = async (projectId: string) => {
    try {
      setLoadingDetails(true);
      // Assuming projectService has a method to get deliverables
      // If not, this matches the endpoint logic: GET /api/projects/{id}/deliverables
      const data = await projectService.getProjectDeliverables(projectId);
      setDeliverablesList(data);
    } catch (error) {
      console.error("Failed to fetch project details", error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'فشل تحميل التفاصيل' : 'Failed to load details',
        variant: "destructive"
      });
      setDeliverablesList([]); // Clear on error
    } finally {
      setLoadingDetails(false);
    }
  };

  if (!project) return null;

  // --- Helpers ---
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || 'planning';
    const statusConfig: Record<string, { label: string; color: string }> = {
      planning: { label: language === 'ar' ? 'تخطيط' : 'Planning', color: 'bg-blue-100 text-blue-800' },
      active: { label: language === 'ar' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800' },
      on_hold: { label: language === 'ar' ? 'معلق' : 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: language === 'ar' ? 'مكتمل' : 'Completed', color: 'bg-emerald-100 text-emerald-800' },
      cancelled: { label: language === 'ar' ? 'ملغي' : 'Cancelled', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[s] || { label: s, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.toLowerCase() || 'medium';
    const priorityConfig: Record<string, { label: string; color: string }> = {
      low: { label: language === 'ar' ? 'منخفضة' : 'Low', color: 'bg-green-100 text-green-800' },
      medium: { label: language === 'ar' ? 'متوسطة' : 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: language === 'ar' ? 'عالية' : 'High', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: language === 'ar' ? 'عاجلة' : 'Urgent', color: 'bg-red-100 text-red-800' },
    };

    const config = priorityConfig[p] || { label: p, color: 'bg-gray-100 text-gray-800' };
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
    }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
  };

  const getDeliverableStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    let color = 'bg-gray-100 text-gray-800';
    let label = status;

    if (s === 'completed') {
      color = 'bg-green-100 text-green-800';
      label = language === 'ar' ? 'مكتمل' : 'Completed';
    } else if (s === 'in_progress') {
      color = 'bg-yellow-100 text-yellow-800';
      label = language === 'ar' ? 'قيد التنفيذ' : 'In Progress';
    } else if (s === 'pending') {
      label = language === 'ar' ? 'معلق' : 'Pending';
    }

    return <Badge variant="outline" className={color}>{label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#0A1E39]">
              {dir === 'rtl' ? project.title : project.titleEn}
            </DialogTitle>
            <Button onClick={() => onEdit(project)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'تحرير' : 'Edit'}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Header Info - Comes from Props (Already Dynamic) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'الحالة' : 'Status'}</p>
                    {getStatusBadge(project.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'الأولوية' : 'Priority'}</p>
                    {getPriorityBadge(project.priority)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'الميزانية' : 'Budget'}</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-gray-500">
                      {language === 'ar' ? 'مُنفق:' : 'Spent:'} {formatCurrency(project.spent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'التقدم' : 'Progress'}</p>
                    <p className="text-lg font-bold text-blue-700">{project.progress}%</p>
                    <Progress value={project.progress} className="w-full mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Details Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{language === 'ar' ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
              <TabsTrigger value="team">{language === 'ar' ? 'الفريق' : 'Team'}</TabsTrigger>
              <TabsTrigger value="deliverables">{language === 'ar' ? 'المخرجات' : 'Deliverables'}</TabsTrigger>
              <TabsTrigger value="timeline">{language === 'ar' ? 'الجدول الزمني' : 'Timeline'}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'وصف المشروع' : 'Project Description'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {dir === 'rtl' ? project.description : project.descriptionEn}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {language === 'ar' ? 'معلومات العميل' : 'Client Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {project.client?.avatar || 'CL'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {dir === 'rtl' ? project.client?.name : project.client?.nameEn}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dir === 'rtl' ? project.client?.organization : project.client?.organizationEn}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      {language === 'ar' ? 'إحصائيات المشروع' : 'Project Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{language === 'ar' ? 'المخرجات' : 'Deliverables'}</span>
                      <span className="font-semibold">{project.completedDeliverables}/{project.deliverables}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{language === 'ar' ? 'المهام' : 'Tasks'}</span>
                      <span className="font-semibold">{project.completedTasks}/{project.tasks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{language === 'ar' ? 'التذاكر المفتوحة' : 'Open Tickets'}</span>
                      <span className="font-semibold text-orange-600">{project.openTickets}/{project.tickets}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'فريق المشروع' : 'Project Team'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Lead Consultant (From Props) */}
                    {project.consultant && (
                      <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {project.consultant.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{project.consultant.name}</p>
                          <p className="text-sm text-gray-600">{project.consultant.role}</p>
                        </div>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          {language === 'ar' ? 'مستشار رئيسي' : 'Lead Consultant'}
                        </Badge>
                      </div>
                    )}

                    {/* Team Members (From Props) */}
                    {project.team?.map((member, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-gray-100 text-gray-600">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                        <Badge variant="outline">
                          {language === 'ar' ? 'عضو فريق' : 'Team Member'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {language === 'ar' ? 'مخرجات المشروع' : 'Project Deliverables'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* LOADING STATE */}
                    {loadingDetails && (
                      <div className="space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    )}

                    {/* EMPTY STATE */}
                    {!loadingDetails && deliverablesList.length === 0 && (
                      <div className="text-center py-6 text-gray-500">
                        {language === 'ar' ? 'لا توجد مخرجات حتى الآن' : 'No deliverables found'}
                      </div>
                    )}

                    {/* REAL DATA */}
                    {!loadingDetails && deliverablesList.map((deliverable) => (
                      <div key={deliverable.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span>{deliverable.title}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {deliverable.dueDate && (
                            <span className="text-xs text-gray-500">
                              {formatDate(deliverable.dueDate)}
                            </span>
                          )}
                          {getDeliverableStatusBadge(deliverable.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {language === 'ar' ? 'الجدول الزمني للمشروع' : 'Project Timeline'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-semibold">{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</p>
                          <p className="text-sm text-gray-600">{formatDate(project.startDate)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold">{language === 'ar' ? 'تاريخ الانتهاء المتوقع' : 'Expected End Date'}</p>
                          <p className="text-sm text-gray-600">{formatDate(project.endDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Milestones based on Deliverables if available, or removed if no specific API */}
                    {deliverablesList.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold mb-2">{language === 'ar' ? 'المراحل الرئيسية (بناءً على المخرجات)' : 'Key Milestones (Based on Deliverables)'}</p>
                        <div className="space-y-2">
                          {deliverablesList.slice(0, 4).map((del) => (
                            <div key={del.id} className="flex items-center gap-2">
                              {del.status === 'completed' ?
                                <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                                <Clock className="w-4 h-4 text-yellow-600" />
                              }
                              <span className="text-sm">{del.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}