import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const { language, dir } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    priority: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: '',
    clientId: '',
    deliverables: ['']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
    // Reset form
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      priority: '',
      startDate: undefined,
      endDate: undefined,
      budget: '',
      clientId: '',
      deliverables: ['']
    });
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((item, i) => i === index ? value : item)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A1E39]">
            {language === 'ar' ? 'إضافة مشروع جديد' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {language === 'ar' ? 'عنوان المشروع (عربي)' : 'Project Title (Arabic)'}
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={language === 'ar' ? 'أدخل عنوان المشروع بالعربية' : 'Enter project title in Arabic'}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn">
                {language === 'ar' ? 'عنوان المشروع (إنجليزي)' : 'Project Title (English)'}
              </Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                placeholder={language === 'ar' ? 'أدخل عنوان المشروع بالإنجليزية' : 'Enter project title in English'}
                required
              />
            </div>
          </div>

          {/* Project Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                {language === 'ar' ? 'وصف المشروع (عربي)' : 'Project Description (Arabic)'}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={language === 'ar' ? 'أدخل وصف المشروع بالعربية' : 'Enter project description in Arabic'}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">
                {language === 'ar' ? 'وصف المشروع (إنجليزي)' : 'Project Description (English)'}
              </Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                placeholder={language === 'ar' ? 'أدخل وصف المشروع بالإنجليزية' : 'Enter project description in English'}
                rows={4}
                required
              />
            </div>
          </div>

          {/* Priority and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'أولوية المشروع' : 'Project Priority'}
              </Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر الأولوية' : 'Select Priority'} />
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
              <Label htmlFor="budget">
                {language === 'ar' ? 'الميزانية (ريال سعودي)' : 'Budget (SAR)'}
              </Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder={language === 'ar' ? 'أدخل الميزانية' : 'Enter budget'}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'العميل' : 'Client'}
              </Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select Client'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client1">{language === 'ar' ? 'شركة التقنية المتقدمة' : 'Advanced Technology Company'}</SelectItem>
                  <SelectItem value="client2">{language === 'ar' ? 'مؤسسة الابتكار المالي' : 'Financial Innovation Foundation'}</SelectItem>
                  <SelectItem value="client3">{language === 'ar' ? 'شركة الحلول الذكية' : 'Smart Solutions Company'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Project Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'تاريخ البداية' : 'Start Date'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? (
                      format(formData.startDate, "PPP", { locale: language === 'ar' ? ar : undefined })
                    ) : (
                      <span>{language === 'ar' ? 'اختر تاريخ البداية' : 'Pick start date'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? (
                      format(formData.endDate, "PPP", { locale: language === 'ar' ? ar : undefined })
                    ) : (
                      <span>{language === 'ar' ? 'اختر تاريخ الانتهاء' : 'Pick end date'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">
                {language === 'ar' ? 'المخرجات المطلوبة' : 'Required Deliverables'}
              </Label>
              <Button type="button" onClick={addDeliverable} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'إضافة مخرج' : 'Add Deliverable'}
              </Button>
            </div>
            
            {formData.deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={deliverable}
                  onChange={(e) => updateDeliverable(index, e.target.value)}
                  placeholder={language === 'ar' ? `المخرج ${index + 1}` : `Deliverable ${index + 1}`}
                  className="flex-1"
                />
                {formData.deliverables.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
              {language === 'ar' ? 'إنشاء المشروع' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}