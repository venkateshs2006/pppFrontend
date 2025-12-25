import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  onSave: (projectData: any) => void;
}

export function EditProjectModal({ isOpen, onClose, project, onSave }: EditProjectModalProps) {
  const { language, dir } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    status: '',
    priority: '',
    progress: 0,
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    budget: '',
    spent: ''
  });

  // Fetch fresh details when modal opens
  useEffect(() => {
    if (isOpen && project?.id) {
      const fetchDetails = async () => {
        setFetching(true);
        try {
          const token = localStorage.getItem('accessToken');
          // Important: Verify if your backend uses 'project' (singular) or 'projects' (plural) for GET
          // Defaulting to singular based on your last request:
          const response = await fetch(`http://localhost:8080/api/project/${project.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.ok) {
            const data = await response.json();
            setFormData({
              title: data.name || project.title || '',
              titleEn: data.titleEn || project.titleEn || '',
              description: data.description || '',
              descriptionEn: data.descriptionEn || '',
              status: data.status ? data.status.toLowerCase() : 'planning',
              priority: data.priority ? data.priority.toLowerCase() : 'medium',
              progress: data.progress || 0,
              startDate: data.startDate ? new Date(data.startDate) : undefined,
              endDate: data.endDate ? new Date(data.endDate) : undefined,
              budget: data.budget?.toString() || '0',
              spent: data.spent?.toString() || '0'
            });
          } else {
            console.warn("Could not fetch fresh details, using list data");
            // Fallback to prop data
            setFormData({
              title: project.title || '',
              titleEn: project.titleEn || '',
              description: project.description || '',
              descriptionEn: project.descriptionEn || '',
              status: project.status || 'planning',
              priority: project.priority || 'medium',
              progress: project.progress || 0,
              startDate: project.startDate ? new Date(project.startDate) : undefined,
              endDate: project.endDate ? new Date(project.endDate) : undefined,
              budget: project.budget?.toString() || '0',
              spent: project.spent?.toString() || '0'
            });
          }
        } catch (e) {
          console.error(e);
        } finally {
          setFetching(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      const payload = {
        id: project.id,
        name: formData.title,
        titleEn: formData.titleEn,
        description: formData.description,
        descriptionEn: formData.descriptionEn,
        status: formData.status.toUpperCase(),
        priority: formData.priority.toUpperCase(),
        progress: formData.progress,
        budget: parseFloat(formData.budget) || 0,
        spent: parseFloat(formData.spent) || 0,
        startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : null,
        endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
      };

      const response = await fetch('http://localhost:8080/api/project', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Update failed');

      toast.success(language === 'ar' ? 'تم التحديث' : 'Updated successfully');
      onSave(payload);
      onClose();
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle>{language === 'ar' ? 'تعديل المشروع' : 'Edit Project'}</DialogTitle>
        </DialogHeader>

        {fetching ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'اسم المشروع' : 'Project Title'}</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'English Title'}</Label>
                <Input value={formData.titleEn} onChange={e => setFormData({ ...formData, titleEn: e.target.value })} />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>

            {/* Status & Priority & Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'الأولوية' : 'Priority'}</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v })}>
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
                <Label>{language === 'ar' ? 'الإنجاز' : 'Progress'}</Label>
                <Input type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: parseInt(e.target.value) })} />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(formData.startDate, "PPP", { locale: language === 'ar' ? ar : undefined }) : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.startDate} onSelect={d => setFormData({ ...formData, startDate: d })} /></PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP", { locale: language === 'ar' ? ar : undefined }) : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={formData.endDate} onSelect={d => setFormData({ ...formData, endDate: d })} /></PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label>{language === 'ar' ? 'الميزانية' : 'Budget'}</Label>
              <Input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
            </div>

            <div className="flex justify-end gap-4 border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit" className="bg-blue-600" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}