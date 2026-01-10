import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, CreditCard, Star, Loader2, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
const API_URL = import.meta.env.VITE_API_URL;
// Define the shape of the data strictly based on the Java Organization Entity
export interface OrganizationFormData {
  name: string;
  description: string;
  logoUrl: string;
  subscriptionPlan: 'BASIC' | 'PREMIUM' | 'ENTERPRISE'; // Adjust values to match your Java Enum
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // Adjust values to match your Java Enum
  stripeCustomerId: string;
  satisfaction: number | ''; // Maps to Integer satisfaction
}

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Trigger refresh on parent
}

export function CreateClientModal({ isOpen, onClose, onSuccess }: CreateClientModalProps) {
  const { language, dir } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const initialFormState: OrganizationFormData = {
    name: '',
    description: '',
    logoUrl: '',
    subscriptionPlan: 'BASIC',
    subscriptionStatus: 'ACTIVE',
    stripeCustomerId: '',
    satisfaction: ''
  };

  const [formData, setFormData] = useState<OrganizationFormData>(initialFormState);

  // Helper to update fields
  const updateField = (field: keyof OrganizationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!formData.name) {
      toast.error(language === 'ar' ? 'يرجى إدخال اسم المؤسسة' : 'Organization Name is required');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Prepare Payload (ensure numbers are numbers)
      const payload = {
        ...formData,
        satisfaction: formData.satisfaction ? Number(formData.satisfaction) : null
      };
      const getAuthHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      });
      // 2. Call the API
      const response = await fetch(`${API_URL}/api/organizations`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      // 3. Handle Success
      toast.success(language === 'ar' ? 'تم إنشاء المؤسسة بنجاح' : 'Organization created successfully');
      setFormData(initialFormState); // Reset form
      onSuccess(); // Tell parent to refresh list
      onClose(); // Close modal

    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الإنشاء' : 'Error creating organization');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
            <Building className="w-6 h-6" />
            {language === 'ar' ? 'إضافة مؤسسة جديدة' : 'Add New Organization'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</TabsTrigger>
              <TabsTrigger value="subscription">{language === 'ar' ? 'الاشتراك والدفع' : 'Subscription & Billing'}</TabsTrigger>
            </TabsList>

            {/* --- TAB 1: BASIC INFO --- */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {language === 'ar' ? 'تفاصيل المؤسسة' : 'Organization Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* Name */}
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'اسم المؤسسة' : 'Organization Name'} *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      {language === 'ar' ? 'رابط الشعار' : 'Logo URL'}
                    </Label>
                    <Input
                      value={formData.logoUrl}
                      onChange={(e) => updateField('logoUrl', e.target.value)}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                    <Textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                    />
                  </div>

                  {/* Satisfaction / Revenue */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      {language === 'ar' ? 'درجة الرضا / العائد' : 'Satisfaction / Revenue'}
                    </Label>
                    <Input
                      type="number"
                      value={formData.satisfaction}
                      onChange={(e) => updateField('satisfaction', e.target.value)}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar'
                        ? 'أدخل قيمة عددية (مثلاً درجة الرضا من 100 أو العائد)'
                        : 'Enter an integer value (e.g. Satisfaction score or Revenue)'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- TAB 2: SUBSCRIPTION --- */}
            <TabsContent value="subscription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    {language === 'ar' ? 'تفاصيل الاشتراك' : 'Subscription Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Subscription Plan */}
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'خطة الاشتراك' : 'Subscription Plan'}</Label>
                      <Select
                        value={formData.subscriptionPlan}
                        onValueChange={(val: any) => updateField('subscriptionPlan', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BASIC">Basic</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Subscription Status */}
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'حالة الاشتراك' : 'Status'}</Label>
                      <Select
                        value={formData.subscriptionStatus}
                        onValueChange={(val: any) => updateField('subscriptionStatus', val)}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                          <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stripe Customer ID */}
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'معرف عميل Stripe' : 'Stripe Customer ID'}</Label>
                    <Input
                      value={formData.stripeCustomerId}
                      onChange={(e) => updateField('stripeCustomerId', e.target.value)}
                      placeholder="cus_..."
                    />
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === 'ar' ? 'إنشاء' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}