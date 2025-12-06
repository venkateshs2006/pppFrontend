import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export function SettingsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir, language, toggleLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // إعدادات النظام
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'منصة إدارة السياسات والإجراءات',
    siteNameEn: 'Policies & Procedures Management Platform',
    companyName: 'شركة البيان للاستشارات',
    companyNameEn: 'Al-Bayan Consulting Company',
    supportEmail: 'support@policies-platform.com',
    supportPhone: '+966501234567',
    defaultLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'dd/mm/yyyy',
    currency: 'SAR'
  });

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState({
    requireTwoFactor: false,
    passwordMinLength: 8,
    passwordRequireSpecialChars: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    requireEmailVerification: true,
    allowPasswordReset: true
  });

  // إعدادات الإشعارات
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notifyOnNewTicket: true,
    notifyOnProjectUpdate: true,
    notifyOnDeliverableApproval: true,
    notifyOnSLAWarning: true,
    digestFrequency: 'daily'
  });

  // إعدادات التكامل
  const [integrationSettings, setIntegrationSettings] = useState({
    stripeApiKey: '••••••••••••••••••••••••••••••••',
    resendApiKey: '••••••••••••••••••••••••••••••••',
    enableStripePayments: true,
    enableEmailNotifications: true,
    webhookUrl: 'https://your-domain.com/webhook',
    apiRateLimit: 1000
  });

  const handleSave = async () => {
    setLoading(true);
    // محاكاة حفظ الإعدادات
    setTimeout(() => {
      setLoading(false);
      // يمكن إضافة toast notification هنا
    }, 1000);
  };

  // التحقق من الصلاحيات
  if (!hasPermission('settings.view') && userProfile?.role !== 'system_admin' && userProfile?.role !== 'lead_consultant') {
    return (
      <div className="p-6" dir={dir}>
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {dir === 'rtl' ? 'غير مصرح بالوصول' : 'Access Denied'}
            </h3>
            <p className="text-gray-500">
              {dir === 'rtl' ? 'ليس لديك صلاحية لعرض هذا القسم' : 'You do not have permission to view this section'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.settings')}</h1>
          <p className="text-gray-600 mt-1">
            {dir === 'rtl' ? 'إدارة إعدادات النظام والتكامل' : 'System and integration settings management'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {t('common.refresh')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className={`w-4 h-4 ${loading ? 'animate-pulse' : ''} ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {loading ? (dir === 'rtl' ? 'جاري الحفظ...' : 'Saving...') : t('common.save')}
          </Button>
        </div>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            {dir === 'rtl' ? 'الإعدادات العامة' : 'General Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'اسم الموقع (عربي)' : 'Site Name (Arabic)'}
              </label>
              <Input
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings({...systemSettings, siteName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'اسم الموقع (إنجليزي)' : 'Site Name (English)'}
              </label>
              <Input
                value={systemSettings.siteNameEn}
                onChange={(e) => setSystemSettings({...systemSettings, siteNameEn: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'اسم الشركة (عربي)' : 'Company Name (Arabic)'}
              </label>
              <Input
                value={systemSettings.companyName}
                onChange={(e) => setSystemSettings({...systemSettings, companyName: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'اسم الشركة (إنجليزي)' : 'Company Name (English)'}
              </label>
              <Input
                value={systemSettings.companyNameEn}
                onChange={(e) => setSystemSettings({...systemSettings, companyNameEn: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'بريد الدعم الفني' : 'Support Email'}
              </label>
              <Input
                type="email"
                value={systemSettings.supportEmail}
                onChange={(e) => setSystemSettings({...systemSettings, supportEmail: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'هاتف الدعم الفني' : 'Support Phone'}
              </label>
              <Input
                value={systemSettings.supportPhone}
                onChange={(e) => setSystemSettings({...systemSettings, supportPhone: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'اللغة الافتراضية' : 'Default Language'}
              </label>
              <Select value={systemSettings.defaultLanguage} onValueChange={(value) => setSystemSettings({...systemSettings, defaultLanguage: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">{dir === 'rtl' ? 'العربية' : 'Arabic'}</SelectItem>
                  <SelectItem value="en">{dir === 'rtl' ? 'الإنجليزية' : 'English'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {dir === 'rtl' ? 'المنطقة الزمنية' : 'Timezone'}
              </label>
              <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Riyadh">{dir === 'rtl' ? 'الرياض (GMT+3)' : 'Riyadh (GMT+3)'}</SelectItem>
                  <SelectItem value="Asia/Dubai">{dir === 'rtl' ? 'دبي (GMT+4)' : 'Dubai (GMT+4)'}</SelectItem>
                  <SelectItem value="UTC">{dir === 'rtl' ? 'التوقيت العالمي (UTC)' : 'UTC'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {dir === 'rtl' ? 'تبديل اللغة' : 'Language Toggle'}
                </p>
                <p className="text-sm text-blue-700">
                  {dir === 'rtl' ? 'تغيير لغة الواجهة الحالية' : 'Change current interface language'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleLanguage}>
              <Globe className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {dir === 'rtl' ? 'إعدادات الأمان' : 'Security Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dir === 'rtl' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'تفعيل المصادقة الثنائية للمستخدمين' : 'Enable 2FA for users'}</p>
                </div>
                <Switch
                  checked={securitySettings.requireTwoFactor}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireTwoFactor: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dir === 'rtl' ? 'التحقق من البريد الإلكتروني' : 'Email Verification'}</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'طلب تأكيد البريد عند التسجيل' : 'Require email confirmation on signup'}</p>
                </div>
                <Switch
                  checked={securitySettings.requireEmailVerification}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, requireEmailVerification: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{dir === 'rtl' ? 'إعادة تعيين كلمة المرور' : 'Password Reset'}</p>
                  <p className="text-sm text-gray-600">{dir === 'rtl' ? 'السماح بإعادة تعيين كلمة المرور' : 'Allow password reset functionality'}</p>
                </div>
                <Switch
                  checked={securitySettings.allowPasswordReset}
                  onCheckedChange={(checked) => setSecuritySettings({...securitySettings, allowPasswordReset: checked})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {dir === 'rtl' ? 'الحد الأدنى لطول كلمة المرور' : 'Minimum Password Length'}
                </label>
                <Input
                  type="number"
                  min="6"
                  max="20"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({...securitySettings, passwordMinLength: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {dir === 'rtl' ? 'مهلة انتهاء الجلسة (دقيقة)' : 'Session Timeout (minutes)'}
                </label>
                <Input
                  type="number"
                  min="15"
                  max="480"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {dir === 'rtl' ? 'الحد الأقصى لمحاولات تسجيل الدخول' : 'Max Login Attempts'}
                </label>
                <Input
                  type="number"
                  min="3"
                  max="10"
                  value={securitySettings.maxLoginAttempts}
                  onChange={(e) => setSecuritySettings({...securitySettings, maxLoginAttempts: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">
                  {dir === 'rtl' ? 'تحذير أمني' : 'Security Warning'}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  {dir === 'rtl' ? 
                    'تأكد من مراجعة إعدادات الأمان بانتظام وتحديثها حسب احتياجات مؤسستك.' :
                    'Make sure to review security settings regularly and update them according to your organization\'s needs.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {dir === 'rtl' ? 'إعدادات الإشعارات' : 'Notification Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">{dir === 'rtl' ? 'قنوات الإشعارات' : 'Notification Channels'}</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{dir === 'rtl' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</span>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-400" />
                  <span>{dir === 'rtl' ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}</span>
                </div>
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span>{dir === 'rtl' ? 'الإشعارات الفورية' : 'Push Notifications'}</span>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{dir === 'rtl' ? 'أنواع الإشعارات' : 'Notification Types'}</h4>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">{dir === 'rtl' ? 'تذاكر جديدة' : 'New Tickets'}</span>
                <Switch
                  checked={notificationSettings.notifyOnNewTicket}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyOnNewTicket: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">{dir === 'rtl' ? 'تحديثات المشاريع' : 'Project Updates'}</span>
                <Switch
                  checked={notificationSettings.notifyOnProjectUpdate}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyOnProjectUpdate: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">{dir === 'rtl' ? 'اعتماد المخرجات' : 'Deliverable Approvals'}</span>
                <Switch
                  checked={notificationSettings.notifyOnDeliverableApproval}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyOnDeliverableApproval: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">{dir === 'rtl' ? 'تحذيرات SLA' : 'SLA Warnings'}</span>
                <Switch
                  checked={notificationSettings.notifyOnSLAWarning}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, notifyOnSLAWarning: checked})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {dir === 'rtl' ? 'تكرار الملخص' : 'Digest Frequency'}
                </label>
                <Select value={notificationSettings.digestFrequency} onValueChange={(value) => setNotificationSettings({...notificationSettings, digestFrequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">{dir === 'rtl' ? 'فوري' : 'Real-time'}</SelectItem>
                    <SelectItem value="hourly">{dir === 'rtl' ? 'كل ساعة' : 'Hourly'}</SelectItem>
                    <SelectItem value="daily">{dir === 'rtl' ? 'يومي' : 'Daily'}</SelectItem>
                    <SelectItem value="weekly">{dir === 'rtl' ? 'أسبوعي' : 'Weekly'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings - Only for System Admin */}
      {userProfile?.role === 'system_admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              {dir === 'rtl' ? 'إعدادات التكامل' : 'Integration Settings'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">{dir === 'rtl' ? 'مفاتيح API' : 'API Keys'}</h4>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stripe API Key</label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={integrationSettings.stripeApiKey}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, stripeApiKey: e.target.value})}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resend API Key</label>
                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={integrationSettings.resendApiKey}
                      onChange={(e) => setIntegrationSettings({...integrationSettings, resendApiKey: e.target.value})}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {dir === 'rtl' ? 'رابط Webhook' : 'Webhook URL'}
                  </label>
                  <Input
                    value={integrationSettings.webhookUrl}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, webhookUrl: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">{dir === 'rtl' ? 'حالة التكامل' : 'Integration Status'}</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Stripe Payments</span>
                  </div>
                  <Switch
                    checked={integrationSettings.enableStripePayments}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, enableStripePayments: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Email Notifications</span>
                  </div>
                  <Switch
                    checked={integrationSettings.enableEmailNotifications}
                    onCheckedChange={(checked) => setIntegrationSettings({...integrationSettings, enableEmailNotifications: checked})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {dir === 'rtl' ? 'حد معدل API (طلب/ساعة)' : 'API Rate Limit (requests/hour)'}
                  </label>
                  <Input
                    type="number"
                    min="100"
                    max="10000"
                    value={integrationSettings.apiRateLimit}
                    onChange={(e) => setIntegrationSettings({...integrationSettings, apiRateLimit: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">
                    {dir === 'rtl' ? 'التكامل نشط' : 'Integration Active'}
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {dir === 'rtl' ? 
                      'جميع خدمات التكامل تعمل بشكل طبيعي. آخر فحص: منذ 5 دقائق.' :
                      'All integration services are working normally. Last check: 5 minutes ago.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            {dir === 'rtl' ? 'معلومات النظام' : 'System Information'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إصدار النظام' : 'System Version'}</p>
              <p className="font-semibold">v7.5.2.2</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{dir === 'rtl' ? 'آخر تحديث' : 'Last Updated'}</p>
              <p className="font-semibold">2024-10-31</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{dir === 'rtl' ? 'حالة قاعدة البيانات' : 'Database Status'}</p>
              <p className="font-semibold text-green-600">{dir === 'rtl' ? 'متصلة' : 'Connected'}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">{dir === 'rtl' ? 'وقت التشغيل' : 'Uptime'}</p>
              <p className="font-semibold">99.9%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}