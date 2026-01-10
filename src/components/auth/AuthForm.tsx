import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Activity, Globe } from 'lucide-react';
const API_URL = import.meta.env.VITE_API_URL;
export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const { signIn, signUp } = useAuth();
  const { t, language, setLanguage, dir } = useLanguage();
  const { toast } = useToast();

  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: '' as UserRole,
    organization: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في المنصة",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "خطأ في كلمة المرور",
        description: "كلمة المرور وتأكيدها غير متطابقتين",
        variant: "destructive",
      });
      return;
    }

    if (!signUpData.role) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى اختيار الدور",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUp(signUpData.email, signUpData.password, {
        full_name: signUpData.fullName,
        role: signUpData.role,
        organization: signUpData.organization,
      });

      if (error) {
        toast({
          title: "خطأ في إنشاء الحساب",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم إنشاء الحساب بنجاح",
          description: "مرحباً بك في المنصة",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickLoginOptions = [
    { email: 'lead@consultant.com', role: 'lead_consultant', name: 'مستشار رئيسي' },
    { email: 'sub@consultant.com', role: 'sub_consultant', name: 'مستشار فرعي' },
    { email: 'main@client.com', role: 'main_client', name: 'عميل رئيسي' },
    { email: 'sub@client.com', role: 'sub_client', name: 'عميل فرعي' },
  ];

  const handleQuickLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, '123456');

      if (error) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في المنصة",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4" dir={dir}>
      <div className="w-full max-w-md space-y-6">
        {/* Language Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {language === 'ar' ? 'English' : 'العربية'}
          </Button>
        </div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg ml-3">
              <img
                src="/images/albayan-logo.jpg"
                alt="شعار البيان"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0A1E39]">
                {language === 'ar' ? 'شركة البيان للاستشارات' : 'Al-Bayan Consulting'}
              </h1>
              <p className="text-sm text-gray-600">
                {language === 'ar' ? 'سياسات وإجراءات — حلول احترافية' : 'Policies & Procedures — Professional Solutions'}
              </p>
            </div>
          </div>
          <p className="text-gray-600">
            {language === 'ar'
              ? 'نظام إدارة استشاري متقدم لتحويل العمل الاستشاري التقليدي إلى نظام تشغيل آلي ومتكامل'
              : 'Advanced consulting management system transforming traditional consulting into an automated and integrated operating system'
            }
          </p>
        </div>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {activeTab === 'signin' ? t('auth.signIn') : t('auth.signUp')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Activity className="w-4 h-4 animate-spin ml-2" />
                    ) : null}
                    {t('auth.signIn')}
                  </Button>
                </form>

                {/* Quick Login Options */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    {language === 'ar' ? 'تسجيل دخول سريع:' : 'Quick Login:'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickLoginOptions.map((option) => (
                      <Button
                        key={option.email}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickLogin(option.email)}
                        disabled={isLoading}
                        className="text-xs"
                      >
                        {option.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={signUpData.fullName}
                      onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">{t('auth.email')}</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="organization">{t('clients.organization')}</Label>
                    <Input
                      id="organization"
                      type="text"
                      value={signUpData.organization}
                      onChange={(e) => setSignUpData({ ...signUpData, organization: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">{t('auth.role')}</Label>
                    <Select
                      value={signUpData.role}
                      onValueChange={(value: UserRole) => setSignUpData({ ...signUpData, role: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth.selectRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_consultant">{t('roles.leadConsultant')}</SelectItem>
                        <SelectItem value="sub_consultant">{t('roles.subConsultant')}</SelectItem>
                        <SelectItem value="main_client">{t('roles.mainClient')}</SelectItem>
                        <SelectItem value="sub_client">{t('roles.subClient')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">{t('auth.password')}</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <Activity className="w-4 h-4 animate-spin ml-2" />
                    ) : null}
                    {t('auth.signUp')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">
              {language === 'ar' ? 'مميزات المنصة:' : 'Platform Features:'}
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• {language === 'ar' ? 'إدارة شاملة للمشاريع الاستشارية' : 'Comprehensive consulting project management'}</li>
              <li>• {language === 'ar' ? 'شجرة تفاعلية للمخرجات والوثائق' : 'Interactive deliverables and documents tree'}</li>
              <li>• {language === 'ar' ? 'نظام تذاكر متقدم للتواصل' : 'Advanced ticketing system for communication'}</li>
              <li>• {language === 'ar' ? 'تقارير وتحليلات تفصيلية' : 'Detailed reports and analytics'}</li>
              <li>• {language === 'ar' ? 'صلاحيات متدرجة حسب نوع المستخدم' : 'Role-based permissions system'}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}