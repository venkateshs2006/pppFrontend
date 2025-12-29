import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, Loader2, Calculator } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';
import { api } from '@/lib/api'; // Assuming you have this helper, otherwise I'll use fetch directly

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

  // Fetch fresh details and tickets when modal opens
  useEffect(() => {
    if (isOpen && project?.id) {
      const fetchDetails = async () => {
        setFetching(true);
        try {
          const token = localStorage.getItem('accessToken');
          const headers = { 'Authorization': `Bearer ${token}` };

          // 1. Fetch Project Details
          const projectRes = await fetch(`http://localhost:8080/api/projects/${project.id}`, { headers });
          const projectData = projectRes.ok ? await projectRes.json() : project;

          // 2. Fetch Tickets for Progress Calculation
          let calculatedProgress = projectData.progress || 0;
          try {
            const ticketsRes = await fetch(`http://localhost:8080/api/v1/tickets/project/${project.id}`, { headers });
            if (ticketsRes.ok) {
              const tickets = await ticketsRes.json();
              if (Array.isArray(tickets) && tickets.length > 0) {
                const completedCount = tickets.filter((t: any) =>
                  ['resolved', 'closed'].includes(t.status?.toLowerCase())
                ).length;
                calculatedProgress = Math.round((completedCount / tickets.length) * 100);
              } else if (Array.isArray(tickets) && tickets.length === 0) {
                calculatedProgress = 0; // 0 tickets means 0 progress usually, or keep manual if you prefer
              }
            }
          } catch (err) {
            console.error("Failed to fetch tickets for progress calculation", err);
          }

          setFormData({
            title: projectData.name || project.title || '',
            titleEn: projectData.titleEn || project.titleEn || '',
            description: projectData.description || '',
            descriptionEn: projectData.descriptionEn || '',
            status: projectData.status ? projectData.status.toLowerCase() : 'planning',
            priority: projectData.priority ? projectData.priority.toLowerCase() : 'medium',
            progress: calculatedProgress, // Set the calculated value
            startDate: projectData.startDate ? new Date(projectData.startDate) : undefined,
            endDate: projectData.endDate ? new Date(projectData.endDate) : undefined,
            budget: projectData.budget?.toString() || '0',
            spent: projectData.spent?.toString() || '0'
          });

        } catch (e) {
          console.error(e);
          toast.error(language === 'ar' ? 'فشل تحميل البيانات' : 'Failed to load data');
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
        progress: formData.progress, // Sending calculated progress back to DB
        budget: parseFloat(formData.budget) || 0,
        spent: parseFloat(formData.spent) || 0,
        startDate: formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : null,
        endDate: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
      };

      const response = await fetch('http://localhost:8080/api/projects', { // Corrected endpoint to /api/projects based on standard REST
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

              {/* READ ONLY PROGRESS FIELD */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{language === 'ar' ? 'الإنجاز (تلقائي)' : 'Progress (Auto)'}</Label>
                  <Calculator className="w-3 h-3 text-gray-400" />
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.progress}
                    disabled
                    className="bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 text-sm">
                    %
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  {language === 'ar'
                    ? 'يتم الحساب بناءً على التذاكر المكتملة'
                    : 'Calculated based on resolved/closed tickets'}
                </p>
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