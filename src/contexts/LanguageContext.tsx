import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const translations = {
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.projects': 'المشاريع',
    'nav.deliverables': 'شجرة المخرجات',
    'nav.clients': 'العملاء',
    'nav.tickets': 'التذاكر والطلبات',
    'nav.reports': 'التقارير والتحليلات',
    'nav.users': 'إدارة المستخدمين',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',

    // Dashboard
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً بك في منصة إدارة السياسات والإجراءات',
    'dashboard.totalProjects': 'إجمالي المشاريع',
    'dashboard.activeProjects': 'المشاريع النشطة',
    'dashboard.completedTasks': 'المهام المكتملة',
    'dashboard.pendingApprovals': 'الموافقات المعلقة',
    'dashboard.openTickets': 'التذاكر المفتوحة',
    'dashboard.recentProjects': 'المشاريع الحديثة',
    'dashboard.recentDeliverables': 'المخرجات الحديثة',
    'dashboard.recentTickets': 'التذاكر الحديثة',
    'dashboard.progress': 'التقدم',
    'dashboard.overallProgress': 'التقدم الإجمالي',

    // Projects
    'projects.title': 'إدارة المشاريع',
    'projects.description': 'إدارة ومتابعة جميع المشاريع الاستشارية',
    'projects.newProject': 'مشروع جديد',
    'projects.search': 'البحث في المشاريع...',
    'projects.filterStatus': 'تصفية بالحالة',
    'projects.allStatuses': 'جميع الحالات',
    'projects.planning': 'تخطيط',
    'projects.active': 'نشط',
    'projects.onHold': 'معلق',
    'projects.completed': 'مكتمل',
    'projects.cancelled': 'ملغي',
    'projects.startDate': 'تاريخ البداية',
    'projects.endDate': 'تاريخ النهاية',
    'projects.budget': 'الميزانية',
    'projects.client': 'العميل',
    'projects.consultant': 'المستشار',
    'projects.view': 'عرض',
    'projects.edit': 'تحرير',
    'projects.team': 'الفريق',

    // Deliverables
    'deliverables.title': 'شجرة المخرجات',
    'deliverables.description': 'إدارة وتنظيم جميع الأدلة والسياسات والإجراءات',
    'deliverables.newDeliverable': 'مخرج جديد',
    'deliverables.uploadFile': 'رفع ملف',
    'deliverables.search': 'البحث في المخرجات...',
    'deliverables.expandAll': 'توسيع الكل',
    'deliverables.collapseAll': 'طي الكل',
    'deliverables.guide': 'دليل',
    'deliverables.topic': 'موضوع',
    'deliverables.policy': 'سياسة',
    'deliverables.procedure': 'إجراء',
    'deliverables.template': 'قالب',
    'deliverables.draft': 'مسودة',
    'deliverables.review': 'مراجعة',
    'deliverables.approved': 'معتمد',
    'deliverables.published': 'منشور',
    'deliverables.version': 'الإصدار',
    'deliverables.project': 'المشروع',

    // Clients
    'clients.title': 'إدارة العملاء',
    'clients.description': 'قاعدة بيانات العملاء والمشاريع المرتبطة',
    'clients.newClient': 'عميل جديد',
    'clients.search': 'البحث في العملاء...',
    'clients.organization': 'المؤسسة',
    'clients.contactPerson': 'الشخص المسؤول',
    'clients.email': 'البريد الإلكتروني',
    'clients.phone': 'الهاتف',
    'clients.activeProjects': 'المشاريع النشطة',
    'clients.totalProjects': 'إجمالي المشاريع',

    // Tickets
    'tickets.title': 'نظام التذاكر والطلبات',
    'tickets.description': 'إدارة ومتابعة جميع طلبات التحديث والاستفسارات',
    'tickets.newTicket': 'تذكرة جديدة',
    'tickets.search': 'البحث في التذاكر...',
    'tickets.filterPriority': 'تصفية بالأولوية',
    'tickets.allPriorities': 'جميع الأولويات',
    'tickets.low': 'منخفضة',
    'tickets.medium': 'متوسطة',
    'tickets.high': 'عالية',
    'tickets.urgent': 'عاجلة',
    'tickets.open': 'مفتوح',
    'tickets.inProgress': 'قيد المعالجة',
    'tickets.waitingResponse': 'في انتظار الرد',
    'tickets.resolved': 'محلول',
    'tickets.closed': 'مغلق',
    'tickets.category': 'الفئة',
    'tickets.dueDate': 'الموعد النهائي',
    'tickets.createdAt': 'تاريخ الإنشاء',

    // Reports
    'reports.title': 'التقارير والتحليلات',
    'reports.description': 'تحليلات شاملة لأداء المشاريع والمخرجات',
    'reports.projectsOverview': 'نظرة عامة على المشاريع',
    'reports.deliverablesStatus': 'حالة المخرجات',
    'reports.clientSatisfaction': 'رضا العملاء',
    'reports.performanceMetrics': 'مؤشرات الأداء',

    // User Roles
    'roles.leadConsultant': 'المستشار الرئيسي',
    'roles.subConsultant': 'المستشار المساعد',
    'roles.mainClient': 'العميل الرئيسي',
    'roles.subClient': 'العميل الفرعي',

    // Common
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تحرير',
    'common.view': 'عرض',
    'common.download': 'تحميل',
    'common.upload': 'رفع',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.refresh': 'تحديث',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.confirm': 'تأكيد',
    'common.status': 'الحالة',
    'common.priority': 'الأولوية',
    'common.date': 'التاريخ',
    'common.time': 'الوقت',
    'common.description': 'الوصف',
    'common.title': 'العنوان',
    'common.name': 'الاسم',
    'common.type': 'النوع',
    'common.actions': 'الإجراءات',

    // Auth
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.role': 'الدور',
    'auth.selectRole': 'اختر الدور',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'auth.dontHaveAccount': 'ليس لديك حساب؟',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.projects': 'Projects',
    'nav.deliverables': 'Deliverables Tree',
    'nav.clients': 'Clients',
    'nav.tickets': 'Tickets & Requests',
    'nav.reports': 'Reports & Analytics',
    'nav.users': 'User Management',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to Policies & Procedures Management Platform',
    'dashboard.totalProjects': 'Total Projects',
    'dashboard.activeProjects': 'Active Projects',
    'dashboard.completedTasks': 'Completed Tasks',
    'dashboard.pendingApprovals': 'Pending Approvals',
    'dashboard.openTickets': 'Open Tickets',
    'dashboard.recentProjects': 'Recent Projects',
    'dashboard.recentDeliverables': 'Recent Deliverables',
    'dashboard.recentTickets': 'Recent Tickets',
    'dashboard.progress': 'Progress',
    'dashboard.overallProgress': 'Overall Progress',

    // Projects
    'projects.title': 'Project Management',
    'projects.description': 'Manage and track all consulting projects',
    'projects.newProject': 'New Project',
    'projects.search': 'Search projects...',
    'projects.filterStatus': 'Filter by Status',
    'projects.allStatuses': 'All Statuses',
    'projects.planning': 'Planning',
    'projects.active': 'Active',
    'projects.onHold': 'On Hold',
    'projects.completed': 'Completed',
    'projects.cancelled': 'Cancelled',
    'projects.startDate': 'Start Date',
    'projects.endDate': 'End Date',
    'projects.budget': 'Budget',
    'projects.client': 'Client',
    'projects.consultant': 'Consultant',
    'projects.view': 'View',
    'projects.edit': 'Edit',
    'projects.team': 'Team',

    // Deliverables
    'deliverables.title': 'Deliverables Tree',
    'deliverables.description': 'Manage and organize all guides, policies, and procedures',
    'deliverables.newDeliverable': 'New Deliverable',
    'deliverables.uploadFile': 'Upload File',
    'deliverables.search': 'Search deliverables...',
    'deliverables.expandAll': 'Expand All',
    'deliverables.collapseAll': 'Collapse All',
    'deliverables.guide': 'Guide',
    'deliverables.topic': 'Topic',
    'deliverables.policy': 'Policy',
    'deliverables.procedure': 'Procedure',
    'deliverables.template': 'Template',
    'deliverables.draft': 'Draft',
    'deliverables.review': 'Review',
    'deliverables.approved': 'Approved',
    'deliverables.published': 'Published',
    'deliverables.version': 'Version',
    'deliverables.project': 'Project',

    // Clients
    'clients.title': 'Client Management',
    'clients.description': 'Client database and associated projects',
    'clients.newClient': 'New Client',
    'clients.search': 'Search clients...',
    'clients.organization': 'Organization',
    'clients.contactPerson': 'Contact Person',
    'clients.email': 'Email',
    'clients.phone': 'Phone',
    'clients.activeProjects': 'Active Projects',
    'clients.totalProjects': 'Total Projects',

    // Tickets
    'tickets.title': 'Tickets & Requests System',
    'tickets.description': 'Manage and track all update requests and inquiries',
    'tickets.newTicket': 'New Ticket',
    'tickets.search': 'Search tickets...',
    'tickets.filterPriority': 'Filter by Priority',
    'tickets.allPriorities': 'All Priorities',
    'tickets.low': 'Low',
    'tickets.medium': 'Medium',
    'tickets.high': 'High',
    'tickets.urgent': 'Urgent',
    'tickets.open': 'Open',
    'tickets.inProgress': 'In Progress',
    'tickets.waitingResponse': 'Waiting Response',
    'tickets.resolved': 'Resolved',
    'tickets.closed': 'Closed',
    'tickets.category': 'Category',
    'tickets.dueDate': 'Due Date',
    'tickets.createdAt': 'Created At',

    // Reports
    'reports.title': 'Reports & Analytics',
    'reports.description': 'Comprehensive analytics for project and deliverable performance',
    'reports.projectsOverview': 'Projects Overview',
    'reports.deliverablesStatus': 'Deliverables Status',
    'reports.clientSatisfaction': 'Client Satisfaction',
    'reports.performanceMetrics': 'Performance Metrics',

    // User Roles
    'roles.leadConsultant': 'Lead Consultant',
    'roles.subConsultant': 'Sub-Consultant',
    'roles.mainClient': 'Main Client',
    'roles.subClient': 'Sub-Client',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.refresh': 'Refresh',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.confirm': 'Confirm',
    'common.status': 'Status',
    'common.priority': 'Priority',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.description': 'Description',
    'common.title': 'Title',
    'common.name': 'Name',
    'common.type': 'Type',
    'common.actions': 'Actions',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.role': 'Role',
    'auth.selectRole': 'Select Role',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.dontHaveAccount': "Don't have an account?",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'ar' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const toggleLanguage = () => {
    const newLang = language === 'ar' ? 'en' : 'ar';
    handleSetLanguage(newLang);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    toggleLanguage,
    t,
    dir: language === 'ar' ? 'rtl' as const : 'ltr' as const,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}