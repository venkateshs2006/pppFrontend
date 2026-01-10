import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Save, MessageSquare, Flag, User, FileText, Upload, Loader2
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // To get current user ID
import { api } from '@/services/api'; // Import your API client
import { useToast } from '@/hooks/use-toast';
import { TicketDTO, ProjectDTO } from '@/types/api';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: TicketDTO) => void; // Update type to match DTO
}

export function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const { language, dir, t } = useLanguage();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: '',
    priority: 'medium',
    urgency: 'normal',
    impact: 'medium',
    projectId: '',
    assignedTo: '', // This should ideally be a User ID (number/string)
    requesterName: '',
    requesterEmail: '',
    expectedResolution: '',
    tags: ['']
  });

  // Fetch Projects for Dropdown
  useEffect(() => {
    if (isOpen) {
      const loadProjects = async () => {
        try {
          const data = await api.projects.getAll();
          setProjects(data || []);
        } catch (error) {
          console.error("Failed to load projects", error);
        }
      };
      loadProjects();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast({ variant: "destructive", title: "Error", description: language === 'ar' ? 'يرجى إدخال العنوان والوصف' : 'Please enter title and description' });
      return;
    }

    if (!formData.projectId) {
      toast({ variant: "destructive", title: "Error", description: language === 'ar' ? 'يرجى اختيار المشروع' : 'Please select a project' });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate UUID from React
      const ticketId = crypto.randomUUID();

      // 2. Prepare Data for Backend (Map Form to TicketDTO)
      // Note: We combine extra fields into description since Backend Entity might not have them all yet
      const richDescription = `
${formData.description}

--- Additional Details ---
Requester: ${formData.requesterName} (${formData.requesterEmail})
Impact: ${formData.impact}
Urgency: ${formData.urgency}
Expected Resolution: ${formData.expectedResolution}
        `.trim();

      const ticketPayload: Partial<TicketDTO> = {
        id: ticketId, // Sending the client-generated UUID
        title: formData.title,
        description: richDescription,
        status: 'open',
        priority: formData.priority as any,
        category: formData.category,
        projectId: formData.projectId, // UUID string
        createdBy: userProfile?.id ? Number(userProfile.id) : undefined, // Assuming userProfile.id maps to backend User ID
        assignedTo: formData.assignedTo ? Number(formData.assignedTo) : undefined,
        createdAt: new Date().toISOString()
      };

      // 3. Send to Backend Service
      const createdTicket = await api.tickets.create(ticketPayload);

      // 4. Update UI
      onSubmit(createdTicket); // Pass back to parent to update list
      toast({ title: "Success", description: language === 'ar' ? 'تم إنشاء التذكرة بنجاح' : 'Ticket created successfully' });
      onClose();
      resetForm();

    } catch (error) {
      console.error("Create Ticket Error:", error);
      toast({ variant: "destructive", title: "Error", description: language === 'ar' ? 'فشل إنشاء التذكرة' : 'Failed to create ticket' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', titleEn: '', description: '', descriptionEn: '', category: '',
      priority: 'medium', urgency: 'normal', impact: 'medium',
      projectId: '', assignedTo: '', requesterName: '', requesterEmail: '',
      expectedResolution: '', tags: ['']
    });
  };

  // Helper Handlers
  const addTag = () => setFormData(prev => ({ ...prev, tags: [...prev.tags, ''] }));
  const removeTag = (index: number) => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  const updateTag = (index: number, value: string) => setFormData(prev => ({ ...prev, tags: prev.tags.map((tag, i) => i === index ? value : tag) }));

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <Badge variant="outline" className={colors[priority] || colors.medium}>
        <Flag className="w-3 h-3 mr-1" />
        {priority}
      </Badge>
    );
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</TabsTrigger>
              <TabsTrigger value="assignment">{language === 'ar' ? 'التكليف والأولوية' : 'Assignment'}</TabsTrigger>
              <TabsTrigger value="details">{language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: BASIC INFO --- */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {language === 'ar' ? 'تفاصيل التذكرة' : 'Ticket Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">{language === 'ar' ? 'عنوان التذكرة' : 'Ticket Title'} *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل عنوان التذكرة' : 'Enter ticket title'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">{language === 'ar' ? 'فئة التذكرة' : 'Category'}</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="policy">Policy Question</SelectItem>
                          <SelectItem value="access">System Access</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{language === 'ar' ? 'وصف المشكلة' : 'Description'} *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the issue..."
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Requester Info */}
              <Card>
                <CardHeader><CardTitle className="text-base">{language === 'ar' ? 'معلومات مقدم الطلب' : 'Requester Info'}</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                    <Input value={formData.requesterName} onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                    <Input value={formData.requesterEmail} onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: ASSIGNMENT --- */}
            <TabsContent value="assignment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    {language === 'ar' ? 'الأولوية والتكليف' : 'Priority & Assignment'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الأولوية' : 'Priority'}</Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الإلحاح' : 'Urgency'}</Label>
                      <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'التأثير' : 'Impact'}</Label>
                      <Select value={formData.impact} onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المشروع المرتبط' : 'Related Project'} *</Label>
                      <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر المشروع' : 'Select Project'} />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'مكلف بالمتابعة' : 'Assigned To'}</Label>
                      {/* Note: In a real app, fetch users from API to populate this */}
                      <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر المكلف' : 'Select Assignee'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Admin User</SelectItem>
                          <SelectItem value="2">Consultant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 3: DETAILS --- */}
            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {language === 'ar' ? 'تفاصيل إضافية' : 'Additional Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الحل المتوقع' : 'Expected Resolution'}</Label>
                    <Textarea
                      value={formData.expectedResolution}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedResolution: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المرفقات' : 'Attachments'}</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        {language === 'ar' ? 'سيتم تفعيل رفع الملفات قريباً' : 'File upload enabled in ticket details view'}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>{language === 'ar' ? 'العلامات' : 'Tags'}</Label>
                      <Button type="button" onClick={addTag} size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'إضافة علامة' : 'Add Tag'}
                      </Button>
                    </div>
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={tag}
                          onChange={(e) => updateTag(index, e.target.value)}
                          placeholder={`Tag ${index + 1}`}
                        />
                        {formData.tags.length > 1 && (
                          <Button type="button" onClick={() => removeTag(index)} size="sm" variant="outline" className="text-red-600">
                            X
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {getPriorityBadge(formData.priority)}
            </div>

            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'إنشاء التذكرة' : 'Create Ticket'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}