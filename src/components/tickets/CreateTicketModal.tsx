import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

interface Project {
  id: string;
  titleEn: string;
  titleAr: string;
}

// Updated to match TeamMemberSummaryDTO from backend
interface ProjectMember {
  userId: number;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
}

export function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const token = localStorage.getItem('accessToken');
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'MEDIUM',
    projectId: '',
    assignedToId: '',
    tags: [] as string[]
  });

  // 1. Initial Load: Fetch Assigned Projects
  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setProjects(Array.isArray(data) ? data : data.data || []);
          }
        } catch (e) {
          console.error("Error fetching projects", e);
        }
      };
      fetchProjects();

      // Reset dependent fields
      setProjectMembers([]);
      setFormData(prev => ({ ...prev, projectId: '', assignedToId: '' }));
    }
  }, [isOpen, token]);

  // 2. Dependent Load: Fetch Members when Project Changes
  useEffect(() => {
    const fetchMembers = async () => {
      if (!formData.projectId) {
        setProjectMembers([]);
        return;
      }

      setLoadingMembers(true);
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${formData.projectId}/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Backend returns List<TeamMemberSummaryDTO>
          setProjectMembers(Array.isArray(data) ? data : data.data || []);
        } else {
          setProjectMembers([]);
        }
      } catch (e) {
        console.error("Error fetching project members", e);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [formData.projectId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ FIX: Structure payload to match TicketDTO nested objects
      const payload = {
        title: formData.title,
        titleEn: formData.title, // Fallback if backend requires both
        description: formData.description,
        descriptionEn: formData.description,
        category: formData.category,
        priority: formData.priority.toUpperCase(),
        status: 'OPEN',
        // Map Project ID to nested object
        project: {
          id: formData.projectId
        },
        // Map Assigned User ID to nested object
        assignedTo: formData.assignedToId ? {
          id: formData.assignedToId
        } : null,
        tags: formData.tags
      };

      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert(language === 'ar' ? 'تم إنشاء التذكرة بنجاح' : 'Ticket created successfully');
        setFormData({
          title: '', description: '', category: 'other', priority: 'MEDIUM', projectId: '', assignedToId: '', tags: []
        });
        onSubmit();
      } else {
        const err = await response.json();
        alert(err.message || 'Error creating ticket');
      }
    } catch (error) {
      console.error("Failed to create ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {language === 'ar' ? 'إنشاء تذكرة جديدة' : 'Create New Ticket'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</TabsTrigger>
              <TabsTrigger value="assignment">{language === 'ar' ? 'التكليف والأولوية' : 'Assignment'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'ar' ? 'تفاصيل التذكرة' : 'Ticket Details'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">{language === 'ar' ? 'عنوان التذكرة' : 'Ticket Title'} *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{language === 'ar' ? 'وصف المشكلة' : 'Description'} *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'فئة التذكرة' : 'Category'}</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{language === 'ar' ? 'مشكلة تقنية' : 'Technical Issue'}</SelectItem>
                        <SelectItem value="policy">{language === 'ar' ? 'استفسار سياسة' : 'Policy Question'}</SelectItem>
                        <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assignment" className="space-y-4">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Project Selection */}
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المشروع المرتبط' : 'Related Project'} *</Label>
                      <Select
                        value={formData.projectId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value, assignedToId: '' }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر المشروع' : 'Select Project'} />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {language === 'ar' ? p.titleAr || p.titleEn : p.titleEn}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'تعيين إلى' : 'Assign To'}</Label>
                      <Select
                        value={formData.assignedToId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, assignedToId: value }))}
                        disabled={!formData.projectId || loadingMembers}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            loadingMembers
                              ? (language === 'ar' ? 'جاري التحميل...' : 'Loading members...')
                              : (language === 'ar' ? 'اختر الموظف' : 'Select User')
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {projectMembers.map(member => (
                            <SelectItem key={member.userId} value={member.userId.toString()}>
                              {member.name} ({member.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الأولوية' : 'Priority'}</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">{language === 'ar' ? 'منخفضة' : 'Low'}</SelectItem>
                          <SelectItem value="MEDIUM">{language === 'ar' ? 'متوسطة' : 'Medium'}</SelectItem>
                          <SelectItem value="HIGH">{language === 'ar' ? 'عالية' : 'High'}</SelectItem>
                          <SelectItem value="URGENT">{language === 'ar' ? 'عاجلة' : 'Urgent'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'إنشاء التذكرة' : 'Create Ticket')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}