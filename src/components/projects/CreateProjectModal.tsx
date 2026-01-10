import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OrganizationDTO } from '@/types/api';
const API_URL = import.meta.env.VITE_API_URL;
interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Renaming to onSuccess clarifies that the API call happened inside the modal
  onSubmit: (projectData: any) => void;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {

  const { language, dir } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [organizations, setOrganizations] = useState<OrganizationDTO[]>([]);
  const [isOrgsLoading, setIsOrgsLoading] = useState(false);

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

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!isOpen) return;

      try {
        setIsOrgsLoading(true);
        const token = localStorage.getItem('accessToken');

        // Ensure URL is correct
        const response = await fetch(`${API_URL}/organizations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        } else {
          console.error("Failed to fetch organizations");
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
      } finally {
        setIsOrgsLoading(false);
      }
    };

    fetchOrganizations();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 1. Stop event bubbling

    // 2. Immediate Guard Clause: Prevent execution if already loading
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const cleanedDeliverables = formData.deliverables.filter(d => d.trim() !== '');

    const payload = {
      ...formData,
      deliverables: cleanedDeliverables,
      budget: Number(formData.budget),
      clientId: Number(formData.clientId),
      organizationId: Number(formData.clientId)
    };
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || (language === 'ar' ? 'فشل إنشاء المشروع' : 'Failed to create project'));
      }

      const savedProject = await response.json();

      // 3. IMPORTANT: Ensure the PARENT component does NOT fetch again
      // onSubmit should only update the local UI list
      // onSubmit(payload);
      onSubmit(savedProject); // This passes the data to the parent
      handleClose();

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
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
    setError(null);
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

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{language === 'ar' ? 'عنوان المشروع (عربي)' : 'Project Title (Arabic)'}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="titleEn">{language === 'ar' ? 'عنوان المشروع (إنجليزي)' : 'Project Title (English)'}</Label>
              <Input
                id="titleEn"
                value={formData.titleEn}
                onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Project Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">{language === 'ar' ? 'وصف المشروع (عربي)' : 'Project Description (Arabic)'}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionEn">{language === 'ar' ? 'وصف المشروع (إنجليزي)' : 'Project Description (English)'}</Label>
              <Textarea
                id="descriptionEn"
                value={formData.descriptionEn}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionEn: e.target.value }))}
                rows={4}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Priority, Budget, Client */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'أولوية المشروع' : 'Project Priority'}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                disabled={isLoading}
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
              <Label htmlFor="budget">{language === 'ar' ? 'الميزانية (ريال سعودي)' : 'Budget (SAR)'}</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'العميل (المنظمة)' : 'Client (Organization)'}</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clientId: value }))}
                disabled={isLoading || isOrgsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select Client'} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      {org.name}
                    </SelectItem>
                  ))}
                  {organizations.length === 0 && !isOrgsLoading && (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      {language === 'ar' ? 'لا توجد بيانات' : 'No organizations'}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP", { locale: language === 'ar' ? ar : undefined }) : <span>{language === 'ar' ? 'اختر تاريخ البداية' : 'Pick start date'}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={formData.startDate} onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={isLoading}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP", { locale: language === 'ar' ? ar : undefined }) : <span>{language === 'ar' ? 'اختر تاريخ الانتهاء' : 'Pick end date'}</span>}
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
              <Label className="text-lg font-semibold">{language === 'ar' ? 'المخرجات المطلوبة' : 'Required Deliverables'}</Label>
              <Button type="button" onClick={addDeliverable} size="sm" variant="outline" disabled={isLoading}>
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
                  disabled={isLoading}
                />
                {formData.deliverables.length > 1 && (
                  <Button type="button" onClick={() => removeDeliverable(index)} size="sm" variant="outline" className="text-red-600 hover:text-red-700" disabled={isLoading}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{language === 'ar' ? 'جاري الإنشاء...' : 'Creating...'}</>
              ) : (
                language === 'ar' ? 'إنشاء المشروع' : 'Create Project'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}