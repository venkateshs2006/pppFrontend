import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, FileText, Upload, AlertCircle, CheckCircle, Clock, Percent } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DeliverableDTO } from '@/types/api';

interface CreateDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<DeliverableDTO>) => void;
  parentId?: string;
  projectId: string; // ✅ Added projectId prop (Required for weightage check)
}

export function CreateDeliverableModal({ isOpen, onClose, onSubmit, parentId, projectId }: CreateDeliverableModalProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    type: 'guide',
    status: 'draft',
    version: '1.0',
    weightage: 0, // ✅ New State
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    // Optional Frontend Validation
    if (formData.weightage < 0 || formData.weightage > 100) {
      alert(language === 'ar' ? 'الوزن يجب أن يكون بين 0 و 100' : 'Weightage must be between 0 and 100');
      return;
    }

    const payload: Partial<DeliverableDTO> = {
      title: formData.title,
      titleEn: formData.titleEn,
      description: formData.description,
      descriptionEn: formData.descriptionEn,
      type: formData.type as any,
      status: formData.status,
      version: formData.version,
      weightage: Number(formData.weightage), // ✅ Send weightage
      parentId: parentId,
      projectId: projectId // ✅ Send projectId
    };

    onSubmit(payload);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      type: 'guide',
      status: 'draft',
      version: '1.0',
      weightage: 0,
      notes: ''
    });
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
      review: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' }
    };
    const style = config[status] || config.draft;
    const Icon = style.icon;
    return <Badge variant="outline" className={`${style.color} flex items-center gap-1`}><Icon className="w-3 h-3" />{style.label}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {parentId
              ? (language === 'ar' ? 'إضافة مخرج فرعي' : 'Add Sub-Deliverable')
              : (language === 'ar' ? 'إنشاء مخرج جديد' : 'Create New Deliverable')
            }
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</TabsTrigger>
              <TabsTrigger value="details">{language === 'ar' ? 'التفاصيل والملفات' : 'Details & Files'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {language === 'ar' ? 'معلومات المخرج' : 'Deliverable Info'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'} *</Label>
                      <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                      <Input value={formData.titleEn} onChange={(e) => setFormData(prev => ({ ...prev, titleEn: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="guide">{language === 'ar' ? 'دليل' : 'Guide'}</SelectItem>
                          <SelectItem value="policy">{language === 'ar' ? 'سياسة' : 'Policy'}</SelectItem>
                          <SelectItem value="procedure">{language === 'ar' ? 'إجراء' : 'Procedure'}</SelectItem>
                          <SelectItem value="template">{language === 'ar' ? 'نموذج' : 'Template'}</SelectItem>
                          <SelectItem value="report">{language === 'ar' ? 'تقرير' : 'Report'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* ✅ New Weightage Field */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        {language === 'ar' ? 'الوزن' : 'Weightage'} (%)
                        <Percent className="w-3 h-3 text-gray-400" />
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.weightage}
                        onChange={(e) => setFormData(prev => ({ ...prev, weightage: parseFloat(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الإصدار' : 'Version'}</Label>
                      <Input value={formData.version} onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))} placeholder="1.0" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} />
                  </div>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{language === 'ar' ? 'سحب وإفلات الملفات' : 'Drag and drop files'}</p>
                    <Button variant="outline" size="sm" type="button" className="mt-2">{language === 'ar' ? 'تصفح' : 'Browse'}</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {getStatusBadge(formData.status)}
            </div>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={onClose}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
                <Save className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'حفظ' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}