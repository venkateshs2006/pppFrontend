import { useState } from 'react';
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
  Plus, 
  Save, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  Flag,
  User,
  Building,
  FileText,
  Tag,
  Upload
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ticketData: any) => void;
}

export function CreateTicketModal({ isOpen, onClose, onSubmit }: CreateTicketModalProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    category: '',
    
    // Priority and Status
    priority: 'medium',
    urgency: 'normal',
    impact: 'medium',
    
    // Assignment
    projectId: '',
    assignedTo: '',
    department: '',
    
    // Contact Information
    requesterName: '',
    requesterEmail: '',
    requesterPhone: '',
    requesterDepartment: '',
    
    // Additional Details
    expectedResolution: '',
    businessJustification: '',
    attachments: [] as File[],
    tags: [''],
    
    // SLA
    expectedResponseTime: '24',
    expectedResolutionTime: '72',
    
    // Settings
    isPublic: true,
    allowComments: true,
    notifyOnUpdate: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال العنوان والوصف' : 'Please enter title and description');
      return;
    }
    
    if (!formData.requesterEmail) {
      alert(language === 'ar' ? 'يرجى إدخال بريد مقدم الطلب' : 'Please enter requester email');
      return;
    }
    
    const ticketData = {
      ...formData,
      id: Date.now().toString(),
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: formData.tags.filter(tag => tag.trim() !== '')
    };
    
    onSubmit(ticketData);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      category: '',
      priority: 'medium',
      urgency: 'normal',
      impact: 'medium',
      projectId: '',
      assignedTo: '',
      department: '',
      requesterName: '',
      requesterEmail: '',
      requesterPhone: '',
      requesterDepartment: '',
      expectedResolution: '',
      businessJustification: '',
      attachments: [],
      tags: [''],
      expectedResponseTime: '24',
      expectedResolutionTime: '72',
      isPublic: true,
      allowComments: true,
      notifyOnUpdate: true
    });
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const updateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: language === 'ar' ? 'منخفضة' : 'Low', color: 'bg-green-100 text-green-800' },
      medium: { label: language === 'ar' ? 'متوسطة' : 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: language === 'ar' ? 'عالية' : 'High', color: 'bg-orange-100 text-orange-800' },
      urgent: { label: language === 'ar' ? 'عاجلة' : 'Urgent', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <Badge variant="outline" className={config.color}>
        <Flag className="w-3 h-3 mr-1" />
        {config.label}
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
                      <Label htmlFor="title">
                        {language === 'ar' ? 'عنوان التذكرة (عربي)' : 'Ticket Title (Arabic)'} *
                      </Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل عنوان التذكرة' : 'Enter ticket title'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="titleEn">
                        {language === 'ar' ? 'عنوان التذكرة (إنجليزي)' : 'Ticket Title (English)'}
                      </Label>
                      <Input
                        id="titleEn"
                        value={formData.titleEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                        placeholder={language === 'ar' ? 'Enter ticket title in English' : 'Enter ticket title in English'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        {language === 'ar' ? 'وصف المشكلة (عربي)' : 'Problem Description (Arabic)'} *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder={language === 'ar' ? 'اشرح المشكلة أو الطلب بالتفصيل' : 'Describe the problem or request in detail'}
                        rows={4}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descriptionEn">
                        {language === 'ar' ? 'وصف المشكلة (إنجليزي)' : 'Problem Description (English)'}
                      </Label>
                      <Textarea
                        id="descriptionEn"
                        value={formData.descriptionEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                        placeholder={language === 'ar' ? 'Describe the problem or request in detail' : 'Describe the problem or request in detail'}
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {language === 'ar' ? 'فئة التذكرة' : 'Ticket Category'}
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر فئة التذكرة' : 'Select ticket category'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">{language === 'ar' ? 'مشكلة تقنية' : 'Technical Issue'}</SelectItem>
                        <SelectItem value="policy_question">{language === 'ar' ? 'استفسار عن سياسة' : 'Policy Question'}</SelectItem>
                        <SelectItem value="procedure_clarification">{language === 'ar' ? 'توضيح إجراء' : 'Procedure Clarification'}</SelectItem>
                        <SelectItem value="document_request">{language === 'ar' ? 'طلب وثيقة' : 'Document Request'}</SelectItem>
                        <SelectItem value="training_request">{language === 'ar' ? 'طلب تدريب' : 'Training Request'}</SelectItem>
                        <SelectItem value="system_access">{language === 'ar' ? 'صلاحيات النظام' : 'System Access'}</SelectItem>
                        <SelectItem value="feedback">{language === 'ar' ? 'ملاحظات وتحسينات' : 'Feedback & Improvements'}</SelectItem>
                        <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Requester Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {language === 'ar' ? 'معلومات مقدم الطلب' : 'Requester Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requesterName">
                        {language === 'ar' ? 'اسم مقدم الطلب' : 'Requester Name'} *
                      </Label>
                      <Input
                        id="requesterName"
                        value={formData.requesterName}
                        onChange={(e) => setFormData(prev => ({ ...prev, requesterName: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل اسم مقدم الطلب' : 'Enter requester name'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requesterEmail">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
                      </Label>
                      <Input
                        id="requesterEmail"
                        type="email"
                        value={formData.requesterEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, requesterEmail: e.target.value }))}
                        placeholder="requester@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requesterPhone">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </Label>
                      <Input
                        id="requesterPhone"
                        value={formData.requesterPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, requesterPhone: e.target.value }))}
                        placeholder="+966 50 123 4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requesterDepartment">
                        {language === 'ar' ? 'القسم' : 'Department'}
                      </Label>
                      <Input
                        id="requesterDepartment"
                        value={formData.requesterDepartment}
                        onChange={(e) => setFormData(prev => ({ ...prev, requesterDepartment: e.target.value }))}
                        placeholder={language === 'ar' ? 'مثال: الموارد البشرية' : 'Example: Human Resources'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                      <Label>
                        {language === 'ar' ? 'الأولوية' : 'Priority'}
                      </Label>
                      <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</SelectItem>
                          <SelectItem value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</SelectItem>
                          <SelectItem value="high">{language === 'ar' ? 'عالية' : 'High'}</SelectItem>
                          <SelectItem value="urgent">{language === 'ar' ? 'عاجلة' : 'Urgent'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'مستوى الإلحاح' : 'Urgency Level'}
                      </Label>
                      <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{language === 'ar' ? 'منخفض' : 'Low'}</SelectItem>
                          <SelectItem value="normal">{language === 'ar' ? 'عادي' : 'Normal'}</SelectItem>
                          <SelectItem value="high">{language === 'ar' ? 'عالي' : 'High'}</SelectItem>
                          <SelectItem value="critical">{language === 'ar' ? 'حرج' : 'Critical'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'مستوى التأثير' : 'Impact Level'}
                      </Label>
                      <Select value={formData.impact} onValueChange={(value) => setFormData(prev => ({ ...prev, impact: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{language === 'ar' ? 'منخفض' : 'Low'}</SelectItem>
                          <SelectItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
                          <SelectItem value="high">{language === 'ar' ? 'عالي' : 'High'}</SelectItem>
                          <SelectItem value="critical">{language === 'ar' ? 'حرج' : 'Critical'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'المشروع المرتبط' : 'Related Project'}
                      </Label>
                      <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر المشروع' : 'Select project'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{language === 'ar' ? 'مشروع الموارد البشرية' : 'HR Project'}</SelectItem>
                          <SelectItem value="2">{language === 'ar' ? 'مشروع السياسات المالية' : 'Financial Policies Project'}</SelectItem>
                          <SelectItem value="3">{language === 'ar' ? 'مشروع الحوكمة المؤسسية' : 'Corporate Governance Project'}</SelectItem>
                          <SelectItem value="4">{language === 'ar' ? 'مشروع الأمن السيبراني' : 'Cybersecurity Project'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'مكلف بالمتابعة' : 'Assigned To'}
                      </Label>
                      <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر المكلف' : 'Select assignee'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead_consultant">{language === 'ar' ? 'د. فهد السعدي - مدير النظام' : 'Dr. Fahad Al-Saadi - System Manager'}</SelectItem>
                          <SelectItem value="sub_consultant1">{language === 'ar' ? 'محمد رشاد - مستشار' : 'Mohammed Rashad - Consultant'}</SelectItem>
                          <SelectItem value="sub_consultant2">{language === 'ar' ? 'محمد جودة - مستشار' : 'Mohammed Gouda - Consultant'}</SelectItem>
                          <SelectItem value="specialist1">{language === 'ar' ? 'مروة الحمامصي - مستشارة' : 'Marwa Al-Hamamsi - Consultant'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SLA Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'وقت الاستجابة المتوقع (ساعة)' : 'Expected Response Time (hours)'}
                      </Label>
                      <Select value={formData.expectedResponseTime} onValueChange={(value) => setFormData(prev => ({ ...prev, expectedResponseTime: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 {language === 'ar' ? 'ساعات' : 'hours'}</SelectItem>
                          <SelectItem value="4">4 {language === 'ar' ? 'ساعات' : 'hours'}</SelectItem>
                          <SelectItem value="8">8 {language === 'ar' ? 'ساعات' : 'hours'}</SelectItem>
                          <SelectItem value="24">24 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                          <SelectItem value="48">48 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'وقت الحل المتوقع (ساعة)' : 'Expected Resolution Time (hours)'}
                      </Label>
                      <Select value={formData.expectedResolutionTime} onValueChange={(value) => setFormData(prev => ({ ...prev, expectedResolutionTime: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24">24 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                          <SelectItem value="48">48 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                          <SelectItem value="72">72 {language === 'ar' ? 'ساعة' : 'hours'}</SelectItem>
                          <SelectItem value="168">7 {language === 'ar' ? 'أيام' : 'days'}</SelectItem>
                          <SelectItem value="336">14 {language === 'ar' ? 'يوم' : 'days'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                    <Label htmlFor="expectedResolution">
                      {language === 'ar' ? 'الحل المتوقع' : 'Expected Resolution'}
                    </Label>
                    <Textarea
                      id="expectedResolution"
                      value={formData.expectedResolution}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedResolution: e.target.value }))}
                      placeholder={language === 'ar' ? 'ما هو الحل المتوقع أو المطلوب؟' : 'What is the expected or required solution?'}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessJustification">
                      {language === 'ar' ? 'المبرر التجاري' : 'Business Justification'}
                    </Label>
                    <Textarea
                      id="businessJustification"
                      value={formData.businessJustification}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessJustification: e.target.value }))}
                      placeholder={language === 'ar' ? 'لماذا هذا الطلب مهم للعمل؟' : 'Why is this request important for business?'}
                      rows={3}
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>
                      {language === 'ar' ? 'المرفقات' : 'Attachments'}
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        {language === 'ar' ? 'اسحب الملفات هنا أو انقر للتحديد' : 'Drag files here or click to select'}
                      </p>
                      <Button type="button" variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'اختيار ملفات' : 'Choose Files'}
                      </Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">
                        {language === 'ar' ? 'العلامات' : 'Tags'}
                      </Label>
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
                          placeholder={language === 'ar' ? `العلامة ${index + 1}` : `Tag ${index + 1}`}
                          className="flex-1"
                        />
                        {formData.tags.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeTag(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            {language === 'ar' ? 'حذف' : 'Remove'}
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
              <span className="text-sm text-gray-600">
                {language === 'ar' ? 'الأولوية المحددة' : 'Selected Priority'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
                <Save className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إنشاء التذكرة' : 'Create Ticket'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}