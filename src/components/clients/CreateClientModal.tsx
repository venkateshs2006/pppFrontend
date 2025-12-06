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
import { Plus, Save, User, Building, Mail, Phone, MapPin, Key } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (clientData: any) => void;
}

export function CreateClientModal({ isOpen, onClose, onSubmit }: CreateClientModalProps) {
  const { language, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    fullNameEn: '',
    email: '',
    phone: '',
    position: '',
    positionEn: '',
    
    // Organization Information
    organizationName: '',
    organizationNameEn: '',
    organizationType: '',
    industry: '',
    establishedYear: '',
    employeeCount: '',
    website: '',
    
    // Address Information
    country: 'Saudi Arabia',
    city: '',
    address: '',
    postalCode: '',
    
    // Account Settings
    userRole: 'main_client',
    isActive: true,
    canCreateSubUsers: true,
    maxSubUsers: '5',
    
    // Login Credentials
    username: '',
    password: '',
    confirmPassword: '',
    requirePasswordChange: true,
    
    // Additional Information
    notes: '',
    tags: [''],
    preferredLanguage: 'ar'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      alert(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      alert(language === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters');
      return;
    }
    
    onSubmit(formData);
    onClose();
    
    // Reset form
    setFormData({
      fullName: '',
      fullNameEn: '',
      email: '',
      phone: '',
      position: '',
      positionEn: '',
      organizationName: '',
      organizationNameEn: '',
      organizationType: '',
      industry: '',
      establishedYear: '',
      employeeCount: '',
      website: '',
      country: 'Saudi Arabia',
      city: '',
      address: '',
      postalCode: '',
      userRole: 'main_client',
      isActive: true,
      canCreateSubUsers: true,
      maxSubUsers: '5',
      username: '',
      password: '',
      confirmPassword: '',
      requirePasswordChange: true,
      notes: '',
      tags: [''],
      preferredLanguage: 'ar'
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

  const generateUsername = () => {
    const name = formData.fullName || formData.fullNameEn;
    const org = formData.organizationName || formData.organizationNameEn;
    if (name && org) {
      const username = `${name.split(' ')[0].toLowerCase()}.${org.split(' ')[0].toLowerCase()}`.replace(/[^a-z.]/g, '');
      setFormData(prev => ({ ...prev, username }));
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password, confirmPassword: password }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
            <User className="w-6 h-6" />
            {language === 'ar' ? 'إضافة عميل جديد' : 'Add New Client'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">{language === 'ar' ? 'المعلومات الأساسية' : 'Basic Info'}</TabsTrigger>
              <TabsTrigger value="organization">{language === 'ar' ? 'المؤسسة' : 'Organization'}</TabsTrigger>
              <TabsTrigger value="account">{language === 'ar' ? 'الحساب' : 'Account'}</TabsTrigger>
              <TabsTrigger value="additional">{language === 'ar' ? 'معلومات إضافية' : 'Additional'}</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {language === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        {language === 'ar' ? 'الاسم الكامل (عربي)' : 'Full Name (Arabic)'}
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل الاسم الكامل بالعربية' : 'Enter full name in Arabic'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fullNameEn">
                        {language === 'ar' ? 'الاسم الكامل (إنجليزي)' : 'Full Name (English)'}
                      </Label>
                      <Input
                        id="fullNameEn"
                        value={formData.fullNameEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullNameEn: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل الاسم الكامل بالإنجليزية' : 'Enter full name in English'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={language === 'ar' ? 'example@company.com' : 'example@company.com'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={language === 'ar' ? '+966 50 123 4567' : '+966 50 123 4567'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="position">
                        {language === 'ar' ? 'المنصب (عربي)' : 'Position (Arabic)'}
                      </Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                        placeholder={language === 'ar' ? 'مدير عام، رئيس قسم، إلخ' : 'General Manager, Department Head, etc.'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="positionEn">
                        {language === 'ar' ? 'المنصب (إنجليزي)' : 'Position (English)'}
                      </Label>
                      <Input
                        id="positionEn"
                        value={formData.positionEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, positionEn: e.target.value }))}
                        placeholder={language === 'ar' ? 'General Manager, Department Head, etc.' : 'General Manager, Department Head, etc.'}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    {language === 'ar' ? 'معلومات المؤسسة' : 'Organization Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">
                        {language === 'ar' ? 'اسم المؤسسة (عربي)' : 'Organization Name (Arabic)'}
                      </Label>
                      <Input
                        id="organizationName"
                        value={formData.organizationName}
                        onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل اسم المؤسسة بالعربية' : 'Enter organization name in Arabic'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationNameEn">
                        {language === 'ar' ? 'اسم المؤسسة (إنجليزي)' : 'Organization Name (English)'}
                      </Label>
                      <Input
                        id="organizationNameEn"
                        value={formData.organizationNameEn}
                        onChange={(e) => setFormData(prev => ({ ...prev, organizationNameEn: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل اسم المؤسسة بالإنجليزية' : 'Enter organization name in English'}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'نوع المؤسسة' : 'Organization Type'}
                      </Label>
                      <Select value={formData.organizationType} onValueChange={(value) => setFormData(prev => ({ ...prev, organizationType: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر نوع المؤسسة' : 'Select organization type'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="company">{language === 'ar' ? 'شركة' : 'Company'}</SelectItem>
                          <SelectItem value="government">{language === 'ar' ? 'جهة حكومية' : 'Government Entity'}</SelectItem>
                          <SelectItem value="nonprofit">{language === 'ar' ? 'منظمة غير ربحية' : 'Non-Profit Organization'}</SelectItem>
                          <SelectItem value="educational">{language === 'ar' ? 'مؤسسة تعليمية' : 'Educational Institution'}</SelectItem>
                          <SelectItem value="healthcare">{language === 'ar' ? 'مؤسسة صحية' : 'Healthcare Institution'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'القطاع' : 'Industry'}
                      </Label>
                      <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر القطاع' : 'Select industry'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">{language === 'ar' ? 'التقنية' : 'Technology'}</SelectItem>
                          <SelectItem value="finance">{language === 'ar' ? 'المالية والمصرفية' : 'Finance & Banking'}</SelectItem>
                          <SelectItem value="healthcare">{language === 'ar' ? 'الرعاية الصحية' : 'Healthcare'}</SelectItem>
                          <SelectItem value="education">{language === 'ar' ? 'التعليم' : 'Education'}</SelectItem>
                          <SelectItem value="manufacturing">{language === 'ar' ? 'التصنيع' : 'Manufacturing'}</SelectItem>
                          <SelectItem value="retail">{language === 'ar' ? 'التجارة' : 'Retail'}</SelectItem>
                          <SelectItem value="energy">{language === 'ar' ? 'الطاقة' : 'Energy'}</SelectItem>
                          <SelectItem value="construction">{language === 'ar' ? 'البناء والتشييد' : 'Construction'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="establishedYear">
                        {language === 'ar' ? 'سنة التأسيس' : 'Established Year'}
                      </Label>
                      <Input
                        id="establishedYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.establishedYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, establishedYear: e.target.value }))}
                        placeholder="2020"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'عدد الموظفين' : 'Employee Count'}
                      </Label>
                      <Select value={formData.employeeCount} onValueChange={(value) => setFormData(prev => ({ ...prev, employeeCount: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'ar' ? 'اختر عدد الموظفين' : 'Select employee count'} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-500">201-500</SelectItem>
                          <SelectItem value="501-1000">501-1000</SelectItem>
                          <SelectItem value="1000+">{language === 'ar' ? 'أكثر من 1000' : '1000+'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">
                        {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://www.company.com"
                      />
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {language === 'ar' ? 'معلومات العنوان' : 'Address Information'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">
                          {language === 'ar' ? 'المدينة' : 'City'}
                        </Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                          placeholder={language === 'ar' ? 'الرياض، جدة، الدمام' : 'Riyadh, Jeddah, Dammam'}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">
                          {language === 'ar' ? 'الرمز البريدي' : 'Postal Code'}
                        </Label>
                        <Input
                          id="postalCode"
                          value={formData.postalCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                          placeholder="12345"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">
                        {language === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'}
                      </Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder={language === 'ar' ? 'أدخل العنوان التفصيلي' : 'Enter detailed address'}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'دور المستخدم' : 'User Role'}
                      </Label>
                      <Select value={formData.userRole} onValueChange={(value) => setFormData(prev => ({ ...prev, userRole: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main_client">{language === 'ar' ? 'عميل رئيسي' : 'Main Client'}</SelectItem>
                          <SelectItem value="sub_client">{language === 'ar' ? 'عميل فرعي' : 'Sub Client'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
                      </Label>
                      <Select value={formData.preferredLanguage} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredLanguage: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</SelectItem>
                          <SelectItem value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'الحساب نشط' : 'Account Active'}</Label>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'تفعيل أو إلغاء تفعيل الحساب' : 'Enable or disable the account'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                      />
                    </div>

                    {formData.userRole === 'main_client' && (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>{language === 'ar' ? 'يمكن إنشاء مستخدمين فرعيين' : 'Can Create Sub Users'}</Label>
                            <p className="text-sm text-gray-600">
                              {language === 'ar' ? 'السماح بإنشاء حسابات فرعية' : 'Allow creating sub accounts'}
                            </p>
                          </div>
                          <Switch
                            checked={formData.canCreateSubUsers}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, canCreateSubUsers: checked }))}
                          />
                        </div>

                        {formData.canCreateSubUsers && (
                          <div className="space-y-2">
                            <Label htmlFor="maxSubUsers">
                              {language === 'ar' ? 'الحد الأقصى للمستخدمين الفرعيين' : 'Maximum Sub Users'}
                            </Label>
                            <Input
                              id="maxSubUsers"
                              type="number"
                              min="1"
                              max="50"
                              value={formData.maxSubUsers}
                              onChange={(e) => setFormData(prev => ({ ...prev, maxSubUsers: e.target.value }))}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Login Credentials */}
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">
                      {language === 'ar' ? 'بيانات تسجيل الدخول' : 'Login Credentials'}
                    </h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">
                        {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                          placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
                          required
                        />
                        <Button type="button" onClick={generateUsername} variant="outline">
                          {language === 'ar' ? 'توليد' : 'Generate'}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {language === 'ar' ? 'كلمة المرور' : 'Password'}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                            required
                          />
                          <Button type="button" onClick={generatePassword} variant="outline">
                            {language === 'ar' ? 'توليد' : 'Generate'}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder={language === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{language === 'ar' ? 'يتطلب تغيير كلمة المرور عند أول دخول' : 'Require Password Change on First Login'}</Label>
                        <p className="text-sm text-gray-600">
                          {language === 'ar' ? 'إجبار المستخدم على تغيير كلمة المرور' : 'Force user to change password'}
                        </p>
                      </div>
                      <Switch
                        checked={formData.requirePasswordChange}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requirePasswordChange: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {language === 'ar' ? 'ملاحظات' : 'Notes'}
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder={language === 'ar' ? 'أدخل أي ملاحظات إضافية' : 'Enter any additional notes'}
                      rows={4}
                    />
                  </div>

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
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
              <Save className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إنشاء العميل' : 'Create Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}