import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Loader2 } from 'lucide-react'; // Added Loader2
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: any) => void;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const { language, dir } = useLanguage();
  const [clients, setClients] = useState<any[]>([]); // To store organizations fetched from API
  const [loadingClients, setLoadingClients] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Fetch Clients (Organizations) when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchOrganizations = async () => {
        setLoadingClients(true);
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch('http://localhost:8080/api/organizations', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setClients(data);
          } else {
            console.error("Failed to fetch organizations");
          }
        } catch (error) {
          console.error("Error fetching organizations:", error);
        } finally {
          setLoadingClients(false);
        }
      };

      fetchOrganizations();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('accessToken');

      // Prepare Payload matching Backend DTO
      const payload = {
        name: formData.title,// Map 'title' to 'name'
        title: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        status: 'planning', // Default status
        priority: formData.priority ? formData.priority.toUpperCase() : 'MEDIUM', // Ensure Enum match
        startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : null,
        endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
        budget: parseFloat(formData.budget) || 0,
        organizationId: parseInt(formData.clientId), // Client/Organization ID
        // deliverables: formData.deliverables // Handle if backend supports creating deliverables in same call
      };

      const response = await fetch('http://localhost:8080/api/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create project');
      }

      const createdProject = await response.json();

      toast.success(language === 'ar' ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully');
      onSubmit(createdProject); // Notify parent
      handleClose(); // Close and reset
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || (language === 'ar' ? 'فشل إنشاء المشروع' : 'Failed to create project'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setFormData({
      name: '',
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
              <Label htmlFor="name">
                {language === 'ar' ? 'اسم المشروع' : 'Project Name '}
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={language === 'ar' ? 'أدخل عنوان المشروع بالعربية' : 'Enter project Name in Arabic'}
                required
                disabled={submitting}
              />
            </div>
          </div>
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </div>
          </div>

          {/* Priority, Budget, Client */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'أولوية المشروع' : 'Project Priority'}
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                disabled={submitting}
              >
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
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {language === 'ar' ? 'العميل' : 'Client'}
              </Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                disabled={submitting || loadingClients}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingClients ? "Loading..." : (language === 'ar' ? 'اختر العميل' : 'Select Client')} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
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
                    disabled={submitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP", { locale: language === 'ar' ? ar : undefined }) : <span>{language === 'ar' ? 'اختر التاريخ' : 'Pick date'}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.startDate} onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))} initialFocus />
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
                    disabled={submitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP", { locale: language === 'ar' ? ar : undefined }) : <span>{language === 'ar' ? 'اختر التاريخ' : 'Pick date'}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.endDate} onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))} initialFocus />
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
              <Button type="button" onClick={addDeliverable} size="sm" variant="outline" disabled={submitting}>
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
                  disabled={submitting}
                />
                {formData.deliverables.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeDeliverable(index)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    disabled={submitting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {language === 'ar' ? 'إنشاء المشروع' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}