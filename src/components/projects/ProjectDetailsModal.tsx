import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar,
  DollarSign,
  Users,
  Target,
  Edit,
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onEdit: (project: any) => void;
}

export function ProjectDetailsModal({ isOpen, onClose, project, onEdit }: ProjectDetailsModalProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');

  // State for fetched data
  const [projectDetails, setProjectDetails] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Data when Modal Opens
  useEffect(() => {
    if (isOpen && project?.id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('accessToken');
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };

          // 1. Fetch Project Details (Using the API endpoint you provided)
          const detailsResponse = await fetch(`http://localhost:8080/api/projects/${project.id}`, { headers });
          if (detailsResponse.ok) {
            const data = await detailsResponse.json();
            setProjectDetails(data);
          }

          // 2. Fetch Project Team Members
          const teamResponse = await fetch(`http://localhost:8080/api/projects/${project.id}/members`, { headers });
          if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            setTeamMembers(teamData);
          }

        } catch (error) {
          console.error("Error fetching project details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      // Reset state when closed
      setProjectDetails(null);
      setTeamMembers([]);
    }
  }, [isOpen, project]);

  if (!project) return null;

  // Use fetched details if available, otherwise fallback to prop data
  const displayProject = projectDetails || project;

  // Normalizing fields (Backend 'name' vs Frontend 'title')
  const title = displayProject.name || displayProject.title;
  const description = displayProject.description;
  const budget = displayProject.budget || 0;
  const progress = displayProject.progress || 0;
  const status = displayProject.status ? displayProject.status.toLowerCase() : 'planning';

  // Format Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), "PPP", { locale: language === 'ar' ? ar : undefined });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      planning: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <Badge variant="outline" className={colors[status] || 'bg-gray-100'}>
        {language === 'ar' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>

        {/* Loading State */}
        {loading && !projectDetails ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  {title}
                  {getStatusBadge(status)}
                </DialogTitle>
                <div className="text-sm text-muted-foreground flex gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(displayProject.startDate)} - {formatDate(displayProject.endDate)}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={() => onEdit(displayProject)}>
                <Edit className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
            </DialogHeader>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100/50">
                <TabsTrigger value="overview">{language === 'ar' ? 'نظرة عامة' : 'Overview'}</TabsTrigger>
                <TabsTrigger value="team">{language === 'ar' ? 'الفريق' : 'Team'}</TabsTrigger>
                <TabsTrigger value="deliverables">{language === 'ar' ? 'المخرجات' : 'Deliverables'}</TabsTrigger>
                <TabsTrigger value="timeline">{language === 'ar' ? 'الجدول الزمني' : 'Timeline'}</TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {language === 'ar' ? 'الإنجاز العام' : 'Overall Progress'}
                      </CardTitle>
                      <Target className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{progress}%</div>
                      <Progress value={progress} className="mt-2 h-2" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {language === 'ar' ? 'الميزانية' : 'Budget'}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(budget)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {/* Placeholder for 'spent' if not in API yet */}
                        {language === 'ar' ? 'المخطط له' : 'Allocated'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {language === 'ar' ? 'أعضاء الفريق' : 'Team Size'}
                      </CardTitle>
                      <Users className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{teamMembers.length}</div>
                      <div className="flex -space-x-2 mt-2 overflow-hidden">
                        {teamMembers.slice(0, 5).map((member: any, i: number) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-white inline-block">
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                              {member.userName?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === 'ar' ? 'وصف المشروع' : 'Description'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {description || (language === 'ar' ? 'لا يوجد وصف متاح لهذا المشروع.' : 'No description available for this project.')}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TEAM TAB */}
              <TabsContent value="team" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {language === 'ar' ? 'قائمة أعضاء الفريق' : 'Team Members List'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.length > 0 ? (
                        teamMembers.map((member: any) => (
                          <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="bg-purple-100 text-purple-700">
                                  {member.userName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{member.userName}</p>
                                <p className="text-xs text-gray-500">{member.userEmail || member.email}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">{member.role}</Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          {language === 'ar' ? 'لم يتم تعيين أعضاء للفريق بعد' : 'No team members assigned yet'}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Other Tabs (Placeholders) */}
              <TabsContent value="deliverables" className="mt-6">
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-gray-500">
                    {language === 'ar' ? 'سيتم عرض المخرجات هنا قريباً' : 'Deliverables will be displayed here soon'}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timeline" className="mt-6">
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-gray-500">
                    {language === 'ar' ? 'سيتم عرض الجدول الزمني هنا قريباً' : 'Timeline will be displayed here soon'}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}