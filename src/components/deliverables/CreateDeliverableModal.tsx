import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  Save, 
  FileText, 
  Upload, 
  Calendar, 
  User, 
  Building, 
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deliverableData: any) => void;
  parentId?: string;
}

export function CreateDeliverableModal({ isOpen, onClose, onSubmit, parentId }: CreateDeliverableModalProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    type: 'document',
    category: '',
    
    // Hierarchy
    parentId: parentId || '',
    level: parentId ? 2 : 1,
    order: 1,
    
    // Status and Progress
    status: 'draft',
    priority: 'medium',
    progress: 0,
    
    // Dates
    startDate: '',
    dueDate: '',
    completedDate: '',
    
    // Assignment
    assignedTo: '',
    reviewer: '',
    approver: '',
    
    // File Information
    fileName: '',
    fileSize: '',
    fileType: '',
    version: '1.0',
    
    // Metadata
    tags: [''],
    requirements: '',
    dependencies: '',
    notes: '',
    
    // Settings
    isTemplate: false,
    isPublic: true,
    requiresApproval: true,
    allowComments: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.titleEn.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال العنوان باللغتين' : 'Please enter title in both languages');
      return;
    }
    
    if (!formData.dueDate) {
      alert(language === 'ar' ? 'يرجى تحديد تاريخ الاستحقاق' : 'Please set due date');
      return;
    }
    
    onSubmit({
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: formData.tags.filter(tag => tag.trim() !== '')
    });
    
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      type: 'document',
      category: '',
      parentId: parentId || '',
      level: parentId ? 2 : 1,
      order: 1,
      status: 'draft',
      priority: 'medium',
      progress: 0,
      startDate: '',
      dueDate: '',
      completedDate: '',
      assignedTo: '',
      reviewer: '',
      approver: '',
      fileName: '',
      fileSize: '',
      fileType: '',
      version: '1.0',
      tags: [''],
      requirements: '',
      dependencies: '',
      notes: '',
      isTemplate: false,
      isPublic: true,
      requiresApproval: true,
      allowComments: true
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: language === 'ar' ? 'مسودة' : 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
      in_progress: { label: language === 'ar' ? 'قيد التنفيذ' : 'In Progress', color: 'bg-blue-100 text-blue-800', icon: Clock },
      review: { label: language === 'ar' ? 'قيد المراجعة' : 'Under Review', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      approved: { label: language === 'ar' ? 'معتمد' : 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { label: language === 'ar' ? 'مكتمل' : 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: Target }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
              <FileText className="w-6 h-6" />
              {language === 'ar' ? 'إضافة مخرج جديد' : 'Add New Deliverable'}
              {parentId && (
                <Badge variant="outline" className="ml-2">
                  {language === 'ar' ? 'مخرج فرعي' : 'Sub-deliverable'}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</TabsTrigger>
                <TabsTrigger value="assignment">{language === 'ar' ? 'التكليف والمراجعة' : 'Assignment'}</TabsTrigger>
                <TabsTrigger value="file">{language === 'ar' ? 'معلومات الملف' : 'File Info'}</TabsTrigger>
                <TabsTrigger value="settings">{language === 'ar' ? 'الإعدادات' : 'Settings'}</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {language === 'ar' ? 'تفاصيل المخرج' : 'Deliverable Details'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">
                          {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'} *
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder={language === 'ar' ? 'أدخل عنوان المخرج بالعربية' : 'Enter deliverable title in Arabic'}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="titleEn">
                          {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'} *
                        </Label>
                        <Input
                          id="titleEn"
                          value={formData.titleEn}
                          onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                          placeholder={language === 'ar' ? 'أدخل عنوان المخرج بالإنجليزية' : 'Enter deliverable title in English'}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">
                          {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder={language === 'ar' ? 'وصف تفصيلي للمخرج' : 'Detailed description of the deliverable'}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descriptionEn">
                          {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                        </Label>
                        <Textarea
                          id="descriptionEn"
                          value={formData.descriptionEn}
                          onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                          placeholder={language === 'ar' ? 'Detailed description of the deliverable' : 'Detailed description of the deliverable'}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {language === 'ar' ? 'نوع المخرج' : 'Deliverable Type'}
                        </Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="document">{language === 'ar' ? 'وثيقة' : 'Document'}</SelectItem>
                            <SelectItem value="policy">{language === 'ar' ? 'سياسة' : 'Policy'}</SelectItem>
                            <SelectItem value="procedure">{language === 'ar' ? 'إجراء' : 'Procedure'}</SelectItem>
                            <SelectItem value="manual">{language === 'ar' ? 'دليل' : 'Manual'}</SelectItem>
                            <SelectItem value="form">{language === 'ar' ? 'نموذج' : 'Form'}</SelectItem>
                            <SelectItem value="template">{language === 'ar' ? 'قالب' : 'Template'}</SelectItem>
                            <SelectItem value="report">{language === 'ar' ? 'تقرير' : 'Report'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {language === 'ar' ? 'الحالة' : 'Status'}
                        </Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                            <SelectItem value="in_progress">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</SelectItem>
                            <SelectItem value="review">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</SelectItem>
                            <SelectItem value="approved">{language === 'ar' ? 'معتمد' : 'Approved'}</SelectItem>
                            <SelectItem value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">
                          {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">
                          {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'} *
                        </Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="progress">
                        {language === 'ar' ? 'نسبة الإنجاز' : 'Progress'} ({formData.progress}%)
                      </Label>
                      <input
                        id="progress"
                        type="range"
                        min="0"
                        max="100"
                        value={formData.progress}
                        onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assignment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {language === 'ar' ? 'التكليف والمراجعة' : 'Assignment & Review'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {language === 'ar' ? 'مكلف بالتنفيذ' : 'Assigned To'}
                        </Label>
                        <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر المكلف' : 'Select assignee'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consultant1">{language === 'ar' ? 'د. أحمد المحمد - مستشار أول' : 'Dr. Ahmed Al-Mohammed - Senior Consultant'}</SelectItem>
                            <SelectItem value="consultant2">{language === 'ar' ? 'سارة الأحمد - مستشار مساعد' : 'Sarah Al-Ahmed - Assistant Consultant'}</SelectItem>
                            <SelectItem value="specialist1">{language === 'ar' ? 'محمد العلي - أخصائي سياسات' : 'Mohammed Al-Ali - Policy Specialist'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {language === 'ar' ? 'المراجع' : 'Reviewer'}
                        </Label>
                        <Select value={formData.reviewer} onValueChange={(value) => setFormData(prev => ({ ...prev, reviewer: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر المراجع' : 'Select reviewer'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="reviewer1">{language === 'ar' ? 'د. فاطمة الزهراني - مراجع أول' : 'Dr. Fatima Al-Zahrani - Senior Reviewer'}</SelectItem>
                            <SelectItem value="reviewer2">{language === 'ar' ? 'خالد الشمري - مراجع قانوني' : 'Khalid Al-Shamri - Legal Reviewer'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {language === 'ar' ? 'المعتمد' : 'Approver'}
                        </Label>
                        <Select value={formData.approver} onValueChange={(value) => setFormData(prev => ({ ...prev, approver: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر المعتمد' : 'Select approver'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approver1">{language === 'ar' ? 'د. عبدالله الراشد - مدير المشروع' : 'Dr. Abdullah Al-Rashid - Project Manager'}</SelectItem>
                            <SelectItem value="approver2">{language === 'ar' ? 'نورا السالم - مدير الجودة' : 'Nora Al-Salem - Quality Manager'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="requirements">
                          {language === 'ar' ? 'المتطلبات' : 'Requirements'}
                        </Label>
                        <Textarea
                          id="requirements"
                          value={formData.requirements}
                          onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                          placeholder={language === 'ar' ? 'حدد المتطلبات اللازمة لإنجاز هذا المخرج' : 'Specify requirements needed to complete this deliverable'}
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dependencies">
                          {language === 'ar' ? 'التبعيات' : 'Dependencies'}
                        </Label>
                        <Textarea
                          id="dependencies"
                          value={formData.dependencies}
                          onChange={(e) => setFormData(prev => ({ ...prev, dependencies: e.target.value }))}
                          placeholder={language === 'ar' ? 'حدد المخرجات أو المهام التي يعتمد عليها هذا المخرج' : 'Specify deliverables or tasks this depends on'}
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      {language === 'ar' ? 'معلومات الملف' : 'File Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fileName">
                          {language === 'ar' ? 'اسم الملف' : 'File Name'}
                        </Label>
                        <Input
                          id="fileName"
                          value={formData.fileName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                          placeholder={language === 'ar' ? 'مثال: سياسة_الموارد_البشرية.pdf' : 'Example: HR_Policy.pdf'}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="version">
                          {language === 'ar' ? 'رقم الإصدار' : 'Version'}
                        </Label>
                        <Input
                          id="version"
                          value={formData.version}
                          onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                          placeholder="1.0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>
                          {language === 'ar' ? 'نوع الملف' : 'File Type'}
                        </Label>
                        <Select value={formData.fileType} onValueChange={(value) => setFormData(prev => ({ ...prev, fileType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'ar' ? 'اختر نوع الملف' : 'Select file type'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="docx">Word Document</SelectItem>
                            <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                            <SelectItem value="pptx">PowerPoint Presentation</SelectItem>
                            <SelectItem value="txt">Text File</SelectItem>
                            <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fileSize">
                          {language === 'ar' ? 'حجم الملف' : 'File Size'}
                        </Label>
                        <Input
                          id="fileSize"
                          value={formData.fileSize}
                          onChange={(e) => setFormData(prev => ({ ...prev, fileSize: e.target.value }))}
                          placeholder={language === 'ar' ? 'مثال: 2.5 MB' : 'Example: 2.5 MB'}
                        />
                      </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700 mb-2">
                        {language === 'ar' ? 'اسحب الملف هنا أو انقر للتحديد' : 'Drag file here or click to select'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'ar' ? 'الحد الأقصى: 10 MB' : 'Maximum size: 10 MB'}
                      </p>
                      <Button type="button" variant="outline" className="mt-4">
                        <Upload className="w-4 h-4 mr-2" />
                        {language === 'ar' ? 'اختيار ملف' : 'Choose File'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      {language === 'ar' ? 'العلامات والإعدادات' : 'Tags & Settings'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
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

                    {/* Settings */}
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold">
                        {language === 'ar' ? 'إعدادات المخرج' : 'Deliverable Settings'}
                      </h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>{language === 'ar' ? 'قالب' : 'Template'}</Label>
                            <p className="text-sm text-gray-600">
                              {language === 'ar' ? 'استخدام هذا المخرج كقالب للمخرجات الأخرى' : 'Use this deliverable as template for others'}
                            </p>
                          </div>
                          <Switch
                            checked={formData.isTemplate}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTemplate: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>{language === 'ar' ? 'عام' : 'Public'}</Label>
                            <p className="text-sm text-gray-600">
                              {language === 'ar' ? 'يمكن لجميع أعضاء الفريق رؤية هذا المخرج' : 'All team members can view this deliverable'}
                            </p>
                          </div>
                          <Switch
                            checked={formData.isPublic}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>{language === 'ar' ? 'يتطلب اعتماد' : 'Requires Approval'}</Label>
                            <p className="text-sm text-gray-600">
                              {language === 'ar' ? 'يحتاج هذا المخرج إلى اعتماد قبل النشر' : 'This deliverable needs approval before publishing'}
                            </p>
                          </div>
                          <Switch
                            checked={formData.requiresApproval}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresApproval: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>{language === 'ar' ? 'السماح بالتعليقات' : 'Allow Comments'}</Label>
                            <p className="text-sm text-gray-600">
                              {language === 'ar' ? 'يمكن لأعضاء الفريق إضافة تعليقات' : 'Team members can add comments'}
                            </p>
                          </div>
                          <Switch
                            checked={formData.allowComments}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="notes">
                        {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={language === 'ar' ? 'أي ملاحظات أو تعليمات إضافية' : 'Any additional notes or instructions'}
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex items-center justify-between pt-6 border-t">
              <div className="flex items-center gap-2">
                {getStatusBadge(formData.status)}
                <span className="text-sm text-gray-600">
                  {language === 'ar' ? 'الحالة الحالية' : 'Current Status'}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'إنشاء المخرج' : 'Create Deliverable'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}