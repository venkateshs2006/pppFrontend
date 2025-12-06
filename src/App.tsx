import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthForm } from '@/components/auth/AuthForm';
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProjectsPage } from '@/components/projects/ProjectsPage';
import { DeliverablesPage } from '@/components/deliverables/DeliverablesPage';
import { ClientsPage } from '@/components/clients/ClientsPage';
import { TicketsPage } from '@/components/tickets/TicketsPage';
import { ReportsPage } from '@/components/reports/ReportsPage';
import { UsersPage } from '@/components/users/UsersPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { Toaster } from '@/components/ui/toaster';
import { Activity } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Simple placeholder components for remaining sections
const SimplePage = ({ title, description, icon: Icon }: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>;
}) => {
  const { dir } = useLanguage();
  
  return (
    <div className="p-6" dir={dir}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Icon className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {dir === 'rtl' ? `عنصر ${item}` : `Item ${item}`}
                </h3>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                  {dir === 'rtl' ? 'نشط' : 'Active'}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                {dir === 'rtl' 
                  ? `وصف مختصر للعنصر رقم ${item} في هذا القسم من المنصة مع تفاصيل إضافية حول الوظائف والميزات المتاحة.`
                  : `Brief description for item ${item} in this section of the platform with additional details about available functions and features.`
                }
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {dir === 'rtl' ? 'تم التحديث اليوم' : 'Updated today'}
                </span>
                <button className="text-blue-600 text-sm hover:underline">
                  {dir === 'rtl' ? 'عرض التفاصيل' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            {dir === 'rtl' ? 'معلومات إضافية' : 'Additional Information'}
          </h3>
          <p className="text-blue-800 text-sm">
            {dir === 'rtl' 
              ? 'هذا القسم قيد التطوير وسيتم إضافة المزيد من الميزات والوظائف قريباً. يمكنك استخدام الأقسام الأخرى المتاحة في المنصة.'
              : 'This section is under development and more features and functions will be added soon. You can use other available sections in the platform.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, loading } = useAuth();
  const { t, dir } = useLanguage();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir={dir}>
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Show landing page first
  if (showLanding) {
    return <LandingPage onEnterPlatform={() => setShowLanding(false)} />;
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <ProjectsPage />;
      case 'deliverables':
        return <DeliverablesPage />;
      case 'clients':
        return <ClientsPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50" dir={dir}>
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;