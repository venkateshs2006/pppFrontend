import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  ArrowLeft, 
  CheckCircle, 
  Star, 
  Users, 
  Shield, 
  BarChart3, 
  FileText, 
  MessageSquare, 
  Settings, 
  Zap,
  Globe,
  Award,
  TrendingUp,
  Clock,
  Target,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';

interface LandingPageProps {
  onEnterPlatform: () => void;
}

export function LandingPage({ onEnterPlatform }: LandingPageProps) {
  const { language, setLanguage, dir } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    subscribe: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(language === 'ar' ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' : 'Your message has been sent successfully! We will contact you soon.');
    setFormData({ name: '', email: '', subject: '', message: '', subscribe: false });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const t = {
    // Header
    companyName: language === 'ar' ? 'شركة البيان للاستشارات' : 'Al-Bayan Consulting',
    companySubtitle: language === 'ar' ? 'سياسات وإجراءات — حلول احترافية' : 'Policies & Procedures — Professional Solutions',
    
    // Navigation
    features: language === 'ar' ? 'الميزات' : 'Features',
    preview: language === 'ar' ? 'استعراض' : 'Preview',
    workflow: language === 'ar' ? 'سير العمل' : 'Workflow',
    pricing: language === 'ar' ? 'الأسعار' : 'Pricing',
    contact: language === 'ar' ? 'تواصل' : 'Contact',
    
    // Buttons
    viewPlatform: language === 'ar' ? 'استعراض المنصة' : 'View Platform',
    requestDemo: language === 'ar' ? 'طلب عرض تجريبي' : 'Request Demo',
    startExploring: language === 'ar' ? 'ابدأ بالاستكشاف' : 'Start Exploring',
    contactUs: language === 'ar' ? 'تواصل معنا' : 'Contact Us',
    
    // Hero Section
    heroTitle: language === 'ar' ? 
      'منصة احترافية لإدارة السياسات و الإجراءات و بناء الحوكمة المؤسسية' :
      'Professional Platform for Policies & Procedures Management & Corporate Governance',
    heroSubtitle: language === 'ar' ? 
      'نموذجًا استشاريًا رقميًا متطورًا يهدف إلى تحويل العمل الاستشاري من صورته التقليدية إلى نظام عمل مؤتمت ومتكامل.' :
      'An advanced digital consulting model aimed at transforming consulting work from its traditional form to an automated and integrated work system.',
    
    // Highlights
    enterpriseReady: language === 'ar' ? 'جاهزية مؤسسية' : 'Enterprise Ready',
    scalable: language === 'ar' ? 'قابل للتوسّع' : 'Scalable',
    
    // Features Section
    featuresTitle: language === 'ar' ? 'ميزات المنصة الاحترافية' : 'Professional Platform Features',
    featuresSubtitle: language === 'ar' ? 
      'حلول متكاملة لإدارة السياسات والإجراءات مع أحدث التقنيات والمعايير العالمية' :
      'Integrated solutions for policies and procedures management with the latest technologies and global standards',
    
    // Feature Cards
    feature1Title: language === 'ar' ? 'محرر سياسات تفاعلي' : 'Interactive Policy Editor',
    feature1Desc: language === 'ar' ? 
      'محرر متقدم يدعم التنسيق الغني والتعاون المباشر مع إمكانيات المراجعة والاعتماد المتدرج' :
      'Advanced editor supporting rich formatting and direct collaboration with review and gradual approval capabilities',
    
    feature2Title: language === 'ar' ? 'شجرة مخرجات مؤسسية' : 'Organizational Deliverables Tree',
    feature2Desc: language === 'ar' ? 
      'تنظيم هرمي ذكي للأدلة والسياسات والإجراءات مع إمكانيات البحث والتصفية المتقدمة' :
      'Smart hierarchical organization of guides, policies and procedures with advanced search and filtering capabilities',
    
    feature3Title: language === 'ar' ? 'SLA والجدول الزمني' : 'SLA and Timeline',
    feature3Desc: language === 'ar' ? 
      'تتبع دقيق لاتفاقيات مستوى الخدمة مع تنبيهات ذكية وإدارة متقدمة للمواعيد النهائية' :
      'Precise tracking of service level agreements with smart alerts and advanced deadline management',
    
    feature4Title: language === 'ar' ? 'إدارة المهام والتذاكر' : 'Task and Ticket Management',
    feature4Desc: language === 'ar' ? 
      'نظام شامل لإدارة المهام والتذاكر مع تتبع الحالة والأولوية وإشعارات فورية' :
      'Comprehensive system for task and ticket management with status tracking, priority and instant notifications',
    
    feature5Title: language === 'ar' ? 'صلاحيات دقيقة' : 'Precise Permissions',
    feature5Desc: language === 'ar' ? 
      'نظام صلاحيات متقدم يضمن الأمان والخصوصية مع تحكم دقيق في الوصول للبيانات' :
      'Advanced permissions system ensuring security and privacy with precise data access control',
    
    feature6Title: language === 'ar' ? 'لوحات تحكم وتقارير' : 'Dashboards and Reports',
    feature6Desc: language === 'ar' ? 
      'تقارير تفاعلية ولوحات تحكم ذكية مع تحليلات متقدمة ومؤشرات أداء شاملة' :
      'Interactive reports and smart dashboards with advanced analytics and comprehensive performance indicators',
    
    // Preview Section
    previewTitle: language === 'ar' ? 'استعراض المنصة' : 'Platform Preview',
    previewSubtitle: language === 'ar' ? 
      'تجربة تفاعلية لأهم ميزات المنصة' :
      'Interactive experience of the platform\'s key features',
    
    preview1Title: language === 'ar' ? 'عرض لوحة التحكم' : 'Dashboard View',
    preview1Desc: language === 'ar' ? 
      'لوحة تحكم شاملة تعرض جميع المشاريع والمهام والإحصائيات' :
      'Comprehensive dashboard displaying all projects, tasks and statistics',
    
    preview2Title: language === 'ar' ? 'شجرة المخرجات' : 'Deliverables Tree',
    preview2Desc: language === 'ar' ? 
      'تنظيم هرمي للمخرجات مع إمكانيات البحث والتصفية' :
      'Hierarchical organization of deliverables with search and filtering capabilities',
    
    preview3Title: language === 'ar' ? 'التذاكر والتواصل' : 'Tickets & Communication',
    preview3Desc: language === 'ar' ? 
      'نظام تذاكر متقدم للتواصل وحل المشاكل' :
      'Advanced ticketing system for communication and problem solving',
    
    // Workflow Section
    workflowTitle: language === 'ar' ? 'سير العمل / الاعتمادات' : 'Workflow / Approvals',
    workflowSubtitle: language === 'ar' ? 
      'عملية منظمة ومتدرجة لضمان جودة المخرجات' :
      'Organized and gradual process to ensure output quality',
    
    step1Title: language === 'ar' ? 'إعداد المسودة' : 'Draft Setup',
    step1Desc: language === 'ar' ? 'إنشاء وكتابة المسودة الأولية' : 'Create and write initial draft',
    
    step2Title: language === 'ar' ? 'مراجعة المختص' : 'Specialist Review',
    step2Desc: language === 'ar' ? 'مراجعة فنية من المختصين' : 'Technical review by specialists',
    
    step3Title: language === 'ar' ? 'مراجعة الاعتماد' : 'Approval Review',
    step3Desc: language === 'ar' ? 'مراجعة نهائية واعتماد رسمي' : 'Final review and official approval',
    
    step4Title: language === 'ar' ? 'النشر والأرشفة' : 'Publishing and Archiving',
    step4Desc: language === 'ar' ? 'نشر المخرج وأرشفته رسمياً' : 'Publish output and archive officially',
    
    // Pricing Section
    pricingTitle: language === 'ar' ? 'خطط الأسعار' : 'Pricing Plans',
    pricingSubtitle: language === 'ar' ? 
      'اختر الخطة المناسبة لاحتياجات مؤسستك' :
      'Choose the right plan for your organization\'s needs',
    
    // Contact Section
    contactTitle: language === 'ar' ? 'تواصل معنا' : 'Contact Us',
    contactSubtitle: language === 'ar' ? 
      'نحن هنا لمساعدتك في تطوير منصة السياسات والإجراءات' :
      'We are here to help you develop your policies and procedures platform',
    
    // Footer
    footerDesc: language === 'ar' ? 
      'نحن متخصصون في تطوير وإدارة السياسات والإجراءات المؤسسية مع أحدث التقنيات والمعايير العالمية. نساعد المؤسسات على بناء أنظمة حوكمة فعالة ومتطورة.' :
      'We specialize in developing and managing corporate policies and procedures with the latest technologies and global standards. We help organizations build effective and advanced governance systems.',
    
    copyright: language === 'ar' ? 
      '© 2024 شركة البيان للاستشارات. جميع الحقوق محفوظة.' :
      '© 2024 Al-Bayan Consulting. All rights reserved.',
    
    quickLinks: language === 'ar' ? 'روابط سريعة' : 'Quick Links',
    legalLinks: language === 'ar' ? 'الروابط القانونية' : 'Legal Links',
    privacyPolicy: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
    termsConditions: language === 'ar' ? 'الشروط والأحكام' : 'Terms & Conditions'
  };

  return (
    <div className="min-h-screen bg-white" dir={dir}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              {/* Company Logo */}
              <div className="w-12 h-12 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="/images/albayan-logo.jpg" 
                  alt="شعار البيان" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#0A1E39]">
                  {t.companyName}
                </h1>
                <p className="text-sm text-gray-600">
                  {t.companySubtitle}
                </p>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-[#0A1E39] hover:text-[#1B4FFF] transition-colors">
                {t.features}
              </button>
              <button onClick={() => scrollToSection('preview')} className="text-[#0A1E39] hover:text-[#1B4FFF] transition-colors">
                {t.preview}
              </button>
              <button onClick={() => scrollToSection('workflow')} className="text-[#0A1E39] hover:text-[#1B4FFF] transition-colors">
                {t.workflow}
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-[#0A1E39] hover:text-[#1B4FFF] transition-colors">
                {t.pricing}
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-[#0A1E39] hover:text-[#1B4FFF] transition-colors">
                {t.contact}
              </button>
            </nav>
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                {language === 'ar' ? 'English' : 'العربية'}
              </Button>
              
              <Button 
                onClick={onEnterPlatform}
                className="bg-[#1B4FFF] hover:bg-[#0A1E39] text-white shadow-lg"
              >
                {t.viewPlatform}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => scrollToSection('contact')}
                className="border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#1B4FFF] hover:text-white"
              >
                {t.requestDemo}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-[#0A1E39] via-[#1B4FFF] to-[#0A1E39] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-[#D6AF71] rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-white">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {language === 'ar' ? (
                  <>
                    منصة احترافية لإدارة
                    <span className="text-[#D6AF71]"> السياسات والإجراءات</span>
                    وبناء الحوكمة المؤسسية
                  </>
                ) : (
                  <>
                    Professional Platform for
                    <span className="text-[#D6AF71]"> Policies & Procedures</span>
                    Management & Corporate Governance
                  </>
                )}
              </h1>
              
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                {t.heroSubtitle}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  onClick={onEnterPlatform}
                  className="bg-white text-[#0A1E39] hover:bg-[#F0F3F7] px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  {t.startExploring}
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => scrollToSection('contact')}
                  className="border-2 border-white text-white hover:bg-white hover:text-[#0A1E39] px-8 py-4 text-lg font-semibold"
                >
                  {t.contactUs}
                </Button>
              </div>
              
              {/* Highlights */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D6AF71] rounded-full"></div>
                  <span>{t.enterpriseReady}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D6AF71] rounded-full"></div>
                  <span>RTL/LTR</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D6AF71] rounded-full"></div>
                  <span>{t.scalable}</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-[#D6AF71]" />
                      <span className="text-sm font-medium">{language === 'ar' ? 'المشاريع' : 'Projects'}</span>
                    </div>
                    <p className="text-2xl font-bold">24</p>
                    <p className="text-xs text-white/70">{language === 'ar' ? 'نشط' : 'Active'}</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-[#D6AF71]" />
                      <span className="text-sm font-medium">{language === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</span>
                    </div>
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-xs text-white/70">{language === 'ar' ? 'مهمة' : 'Tasks'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-[#D6AF71]" />
                      <span className="text-sm font-medium">{language === 'ar' ? 'مكتمل' : 'Completed'}</span>
                    </div>
                    <p className="text-lg font-bold">89</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-[#D6AF71]" />
                      <span className="text-sm font-medium">{language === 'ar' ? 'تنبيهات SLA' : 'SLA Alerts'}</span>
                    </div>
                    <p className="text-lg font-bold">3</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-white/10 rounded p-2 text-center">
                    <FileText className="w-4 h-4 mx-auto mb-1 text-[#D6AF71]" />
                    <p className="text-xs">{language === 'ar' ? 'مهام' : 'Tasks'}</p>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center">
                    <Users className="w-4 h-4 mx-auto mb-1 text-[#D6AF71]" />
                    <p className="text-xs">{language === 'ar' ? 'مخرجات' : 'Deliverables'}</p>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center">
                    <MessageSquare className="w-4 h-4 mx-auto mb-1 text-[#D6AF71]" />
                    <p className="text-xs">{language === 'ar' ? 'تذاكر' : 'Tickets'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-[#F0F3F7]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A1E39] mb-4">
              {t.featuresTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.featuresSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1: Interactive Policy Editor */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] rounded-xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.feature1Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature1Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 2: Organizational Deliverables Tree */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D6AF71] to-[#1B4FFF] rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.feature2Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature2Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 3: SLA and Timeline */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A1E39] to-[#D6AF71] rounded-xl flex items-center justify-center mb-6">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.feature3Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature3Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 4: Task and Ticket Management */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1B4FFF] to-[#D6AF71] rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.feature4Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature4Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 5: Precise Permissions */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D6AF71] to-[#0A1E39] rounded-xl flex items-center justify-center mb-6">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.feature5Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature5Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Feature 6: Dashboards and Reports */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A1E39] to-[#1B4FFF] rounded-xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.feature6Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.feature6Desc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Preview */}
      <section id="preview" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A1E39] mb-4">
              {t.previewTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.previewSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Preview 1: Dashboard */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1B4FFF] to-[#D6AF71] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.preview1Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.preview1Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Preview 2: Deliverables Tree */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#D6AF71] to-[#0A1E39] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.preview2Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.preview2Desc}
                </p>
              </CardContent>
            </Card>
            
            {/* Preview 3: Tickets & Communication */}
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:scale-105">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0A1E39] to-[#1B4FFF] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1E39] mb-4">
                  {t.preview3Title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t.preview3Desc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow / Approvals */}
      <section id="workflow" className="py-20 bg-gradient-to-br from-[#F0F3F7] to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A1E39] mb-4">
              {t.workflowTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.workflowSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1B4FFF] to-[#0A1E39] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#0A1E39] mb-3">
                {t.step1Title}
              </h3>
              <p className="text-gray-600">
                {t.step1Desc}
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#D6AF71] to-[#1B4FFF] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#0A1E39] mb-3">
                {t.step2Title}
              </h3>
              <p className="text-gray-600">
                {t.step2Desc}
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0A1E39] to-[#D6AF71] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#0A1E39] mb-3">
                {t.step3Title}
              </h3>
              <p className="text-gray-600">
                {t.step3Desc}
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1B4FFF] to-[#D6AF71] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Award className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#0A1E39] mb-3">
                {t.step4Title}
              </h3>
              <p className="text-gray-600">
                {t.step4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A1E39] mb-4">
              {t.pricingTitle}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.pricingSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#0A1E39] mb-2">
                    {language === 'ar' ? 'البداية' : 'Starter'}
                  </h3>
                  <div className="text-4xl font-bold text-[#1B4FFF] mb-2">
                    {language === 'ar' ? '٢٩٩ ر.س' : '299 SAR'}
                  </div>
                  <p className="text-gray-600">
                    {language === 'ar' ? 'شهرياً' : 'per month'}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'حتى 5 مشاريع' : 'Up to 5 projects'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? '10 مستخدمين' : '10 users'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'دعم أساسي' : 'Basic support'}</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#1B4FFF] hover:bg-[#0A1E39]">
                  {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-[#1B4FFF] relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#1B4FFF] text-white px-4 py-2 rounded-full text-sm font-semibold">
                  {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                </span>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#0A1E39] mb-2">
                    {language === 'ar' ? 'الاحترافية' : 'Pro'}
                  </h3>
                  <div className="text-4xl font-bold text-[#1B4FFF] mb-2">
                    {language === 'ar' ? '٧٩٩ ر.س' : '799 SAR'}
                  </div>
                  <p className="text-gray-600">
                    {language === 'ar' ? 'شهرياً' : 'per month'}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'مشاريع غير محدودة' : 'Unlimited projects'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? '50 مستخدم' : '50 users'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'دعم متقدم' : 'Advanced support'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'تقارير متقدمة' : 'Advanced reports'}</span>
                  </li>
                </ul>
                <Button className="w-full bg-[#1B4FFF] hover:bg-[#0A1E39]">
                  {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Enterprise Plan */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-[#0A1E39] mb-2">
                    {language === 'ar' ? 'المؤسسية' : 'Enterprise'}
                  </h3>
                  <div className="text-4xl font-bold text-[#1B4FFF] mb-2">
                    {language === 'ar' ? 'مخصص' : 'Custom'}
                  </div>
                  <p className="text-gray-600">
                    {language === 'ar' ? 'حسب الاحتياج' : 'based on needs'}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'حلول مخصصة' : 'Custom solutions'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'مستخدمين غير محدود' : 'Unlimited users'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'دعم مخصص 24/7' : 'Dedicated 24/7 support'}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{language === 'ar' ? 'تكامل مخصص' : 'Custom integrations'}</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full border-[#1B4FFF] text-[#1B4FFF] hover:bg-[#1B4FFF] hover:text-white">
                  {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact + Form */}
      <section id="contact" className="py-20 bg-[#0A1E39] text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t.contactTitle}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {t.contactSubtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? 'معلومات التواصل' : 'Contact Information'}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1B4FFF] rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </p>
                      <p className="text-white/80">info@albayan-consulting.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1B4FFF] rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {language === 'ar' ? 'الهاتف' : 'Phone'}
                      </p>
                      <p className="text-white/80">+966 11 123 4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1B4FFF] rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {language === 'ar' ? 'العنوان' : 'Address'}
                      </p>
                      <p className="text-white/80">
                        {language === 'ar' ? 
                          'الرياض، المملكة العربية السعودية' :
                          'Riyadh, Saudi Arabia'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Links */}
              <div>
                <h4 className="text-lg font-semibold mb-4">
                  {language === 'ar' ? 'تابعنا على' : 'Follow Us'}
                </h4>
                <div className="flex gap-4">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-[#0A1E39]">
                    <Twitter className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-[#0A1E39]">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-[#0A1E39]">
                    <Facebook className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6">
                  {language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a message'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                        required
                      />
                    </div>
                  </div>
                  
                  <Input
                    placeholder={language === 'ar' ? 'الموضوع' : 'Subject'}
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    required
                  />
                  
                  <Textarea
                    placeholder={language === 'ar' ? 'رسالتك' : 'Your Message'}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/60"
                    rows={4}
                    required
                  />
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="subscribe"
                      checked={formData.subscribe}
                      onChange={(e) => setFormData(prev => ({ ...prev, subscribe: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="subscribe" className="text-sm text-white/80">
                      {language === 'ar' ? 
                        'أرغب في الاشتراك في النشرة الإخبارية' :
                        'I want to subscribe to the newsletter'
                      }
                    </label>
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#D6AF71] hover:bg-[#D6AF71]/90 text-[#0A1E39] font-semibold">
                    {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A1E39] text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img 
                    src="/images/albayan-logo.jpg" 
                    alt="شعار البيان" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{t.companyName}</h3>
                  <p className="text-white/70 text-sm">{t.companySubtitle}</p>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed mb-4">
                {t.footerDesc}
              </p>
              <p className="text-white/60 text-sm">
                {t.copyright}
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t.quickLinks}</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollToSection('features')} className="text-white/70 hover:text-white transition-colors">{t.features}</button></li>
                <li><button onClick={() => scrollToSection('preview')} className="text-white/70 hover:text-white transition-colors">{t.preview}</button></li>
                <li><button onClick={() => scrollToSection('workflow')} className="text-white/70 hover:text-white transition-colors">{t.workflow}</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="text-white/70 hover:text-white transition-colors">{t.pricing}</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="text-white/70 hover:text-white transition-colors">{t.contact}</button></li>
              </ul>
            </div>
            
            {/* Legal Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">{t.legalLinks}</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t.privacyPolicy}</a></li>
                <li><a href="#" className="text-white/70 hover:text-white transition-colors">{t.termsConditions}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}