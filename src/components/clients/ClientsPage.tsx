import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  Eye,
  Edit,
  MoreHorizontal,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { CreateClientModal } from './CreateClientModal';

interface Client {
  id: string;
  organization: string;
  organizationEn: string;
  industry: string;
  industryEn: string;
  contactPerson: {
    name: string;
    nameEn: string;
    position: string;
    positionEn: string;
    email: string;
    phone: string;
    avatar: string;
  };
  address: {
    city: string;
    cityEn: string;
    country: string;
    countryEn: string;
  };
  establishedDate: string;
  clientSince: string;
  status: 'active' | 'inactive' | 'prospect';
  projects: {
    total: number;
    active: number;
    completed: number;
    onHold: number;
  };
  totalValue: number;
  paidValue: number;
  satisfaction: number;
  lastActivity: string;
  tags: string[];
  tagsEn: string[];
}

export function ClientsPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);

  // بيانات العملاء الشاملة
  const allClients: Client[] = [
    {
      id: '1',
      organization: 'شركة منصور القابضة',
      organizationEn: 'Mansour Holding Company',
      industry: 'الاستثمار والتطوير',
      industryEn: 'Investment & Development',
      contactPerson: {
        name: 'سلطان منصور',
        nameEn: 'Sultan Mansour',
        position: 'مدير عام',
        positionEn: 'General Manager',
        email: 'sultan.mansour@mansourholding.sa',
        phone: '+966501234567',
        avatar: 'SM'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2015-03-15',
      clientSince: '2024-01-15',
      status: 'active',
      projects: {
        total: 3,
        active: 2,
        completed: 1,
        onHold: 0
      },
      totalValue: 1250000,
      paidValue: 950000,
      satisfaction: 92,
      lastActivity: '2024-10-30',
      tags: ['تقنية', 'موارد بشرية', 'شركة كبيرة'],
      tagsEn: ['Technology', 'HR', 'Large Company']
    },
    {
      id: '2',
      organization: 'شركة تمنكو',
      organizationEn: 'Tamnco Company',
      industry: 'الهندسة والإنشاء',
      industryEn: 'Engineering & Construction',
      contactPerson: {
        name: 'المهندس تركي آل نصيب',
        nameEn: 'Eng. Turki Al Naseeb',
        position: 'مدير عام',
        positionEn: 'General Manager',
        email: 'turki.alnaseeb@tamnco.sa',
        phone: '+966502345678',
        avatar: 'TN'
      },
      address: {
        city: 'جدة',
        cityEn: 'Jeddah',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2008-11-20',
      clientSince: '2024-02-01',
      status: 'active',
      projects: {
        total: 2,
        active: 1,
        completed: 0,
        onHold: 1
      },
      totalValue: 850000,
      paidValue: 425000,
      satisfaction: 88,
      lastActivity: '2024-10-29',
      tags: ['استثمار', 'مالية', 'مجموعة'],
      tagsEn: ['Investment', 'Finance', 'Group']
    },
    {
      id: '3',
      organization: 'البنك التجاري الوطني',
      organizationEn: 'National Commercial Bank',
      industry: 'الخدمات المصرفية',
      industryEn: 'Banking Services',
      contactPerson: {
        name: 'عبدالرحمن الغامدي',
        nameEn: 'Abdulrahman Al-Ghamdi',
        position: 'مدير الامتثال والحوكمة',
        positionEn: 'Compliance and Governance Director',
        email: 'a.ghamdi@ncb.sa',
        phone: '+966503456789',
        avatar: 'AG'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1953-12-20',
      clientSince: '2024-03-10',
      status: 'active',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 0
      },
      totalValue: 520000,
      paidValue: 78000,
      satisfaction: 95,
      lastActivity: '2024-10-28',
      tags: ['بنك', 'حوكمة', 'امتثال'],
      tagsEn: ['Bank', 'Governance', 'Compliance']
    },
    {
      id: '4',
      organization: 'شركة الاتصالات الرقمية',
      organizationEn: 'Digital Communications Company',
      industry: 'الاتصالات وتقنية المعلومات',
      industryEn: 'Telecommunications & IT',
      contactPerson: {
        name: 'لينا الخالد',
        nameEn: 'Lina Al-Khalid',
        position: 'مدير أمن المعلومات',
        positionEn: 'Information Security Manager',
        email: 'lina.khalid@dcc.sa',
        phone: '+966504567890',
        avatar: 'LK'
      },
      address: {
        city: 'الدمام',
        cityEn: 'Dammam',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2010-06-15',
      clientSince: '2024-04-20',
      status: 'active',
      projects: {
        total: 2,
        active: 1,
        completed: 1,
        onHold: 0
      },
      totalValue: 680000,
      paidValue: 510000,
      satisfaction: 90,
      lastActivity: '2024-10-31',
      tags: ['اتصالات', 'أمن سيبراني', 'تقنية'],
      tagsEn: ['Telecom', 'Cybersecurity', 'Technology']
    },
    {
      id: '5',
      organization: 'مجموعة الخدمات اللوجستية',
      organizationEn: 'Logistics Services Group',
      industry: 'الخدمات اللوجستية',
      industryEn: 'Logistics Services',
      contactPerson: {
        name: 'صالح الدوسري',
        nameEn: 'Saleh Al-Dosari',
        position: 'المدير التنفيذي',
        positionEn: 'Chief Executive Officer',
        email: 'saleh.dosari@lsg.sa',
        phone: '+966505678901',
        avatar: 'SD'
      },
      address: {
        city: 'جدة',
        cityEn: 'Jeddah',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2012-09-10',
      clientSince: '2024-01-05',
      status: 'active',
      projects: {
        total: 1,
        active: 0,
        completed: 1,
        onHold: 0
      },
      totalValue: 340000,
      paidValue: 340000,
      satisfaction: 96,
      lastActivity: '2024-10-25',
      tags: ['لوجستيات', 'نقل', 'خدمات'],
      tagsEn: ['Logistics', 'Transportation', 'Services']
    },
    {
      id: '6',
      organization: 'شركة التأمين الوطنية',
      organizationEn: 'National Insurance Company',
      industry: 'التأمين',
      industryEn: 'Insurance',
      contactPerson: {
        name: 'فهد العنزي',
        nameEn: 'Fahd Al-Anzi',
        position: 'مدير إدارة المخاطر',
        positionEn: 'Risk Management Director',
        email: 'fahd.anzi@nic.sa',
        phone: '+966506789012',
        avatar: 'FA'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2005-04-25',
      clientSince: '2024-05-15',
      status: 'prospect',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 1
      },
      totalValue: 410000,
      paidValue: 102500,
      satisfaction: 85,
      lastActivity: '2024-10-20',
      tags: ['تأمين', 'مخاطر', 'مالية'],
      tagsEn: ['Insurance', 'Risk', 'Finance']
    },
    {
      id: '7',
      organization: 'شركة الطاقة المتجددة',
      organizationEn: 'Renewable Energy Company',
      industry: 'الطاقة المتجددة',
      industryEn: 'Renewable Energy',
      contactPerson: {
        name: 'مريم الشهري',
        nameEn: 'Mariam Al-Shehri',
        position: 'مدير العمليات',
        positionEn: 'Operations Manager',
        email: 'mariam.shehri@rec.sa',
        phone: '+966507890123',
        avatar: 'MS'
      },
      address: {
        city: 'الخبر',
        cityEn: 'Khobar',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '2018-01-30',
      clientSince: '2024-06-01',
      status: 'prospect',
      projects: {
        total: 0,
        active: 0,
        completed: 0,
        onHold: 0
      },
      totalValue: 0,
      paidValue: 0,
      satisfaction: 0,
      lastActivity: '2024-10-15',
      tags: ['طاقة متجددة', 'بيئة', 'استدامة'],
      tagsEn: ['Renewable Energy', 'Environment', 'Sustainability']
    },
    {
      id: '8',
      organization: 'مستشفى الملك فهد التخصصي',
      organizationEn: 'King Fahd Specialist Hospital',
      industry: 'الرعاية الصحية',
      industryEn: 'Healthcare',
      contactPerson: {
        name: 'د. خالد الحربي',
        nameEn: 'Dr. Khalid Al-Harbi',
        position: 'مدير الجودة والتطوير',
        positionEn: 'Quality and Development Director',
        email: 'k.harbi@kfsh.sa',
        phone: '+966508901234',
        avatar: 'KH'
      },
      address: {
        city: 'الرياض',
        cityEn: 'Riyadh',
        country: 'المملكة العربية السعودية',
        countryEn: 'Saudi Arabia'
      },
      establishedDate: '1985-07-12',
      clientSince: '2024-07-10',
      status: 'inactive',
      projects: {
        total: 1,
        active: 0,
        completed: 0,
        onHold: 0
      },
      totalValue: 280000,
      paidValue: 0,
      satisfaction: 0,
      lastActivity: '2024-09-15',
      tags: ['صحة', 'مستشفى', 'جودة'],
      tagsEn: ['Healthcare', 'Hospital', 'Quality']
    }
  ];

  // تصفية العملاء حسب دور المستخدم
  const getFilteredClients = () => {
    let clients = allClients;

    // تصفية حسب دور المستخدم
    if (userProfile?.role === 'sub_consultant') {
      clients = clients.slice(0, 4); // العملاء المخصصين فقط
    } else if (userProfile?.role === 'main_client' || userProfile?.role === 'sub_client') {
      clients = clients.slice(0, 1); // عميل واحد فقط (مؤسستهم)
    }

    // تصفية حسب البحث
    if (searchTerm) {
      clients = clients.filter(client => 
        (dir === 'rtl' ? client.organization : client.organizationEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dir === 'rtl' ? client.industry : client.industryEn).toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contactPerson.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      clients = clients.filter(client => client.status === statusFilter);
    }

    return clients;
  };

  const filteredClients = getFilteredClients();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      inactive: { label: dir === 'rtl' ? 'غير نشط' : 'Inactive', color: 'bg-gray-100 text-gray-800', icon: Clock },
      prospect: { label: dir === 'rtl' ? 'عميل محتمل' : 'Prospect', color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US');
  };

  // إحصائيات العملاء
  const stats = {
    total: filteredClients.length,
    active: filteredClients.filter(c => c.status === 'active').length,
    prospects: filteredClients.filter(c => c.status === 'prospect').length,
    inactive: filteredClients.filter(c => c.status === 'inactive').length,
    totalValue: filteredClients.reduce((sum, c) => sum + c.totalValue, 0),
    totalPaid: filteredClients.reduce((sum, c) => sum + c.paidValue, 0),
    avgSatisfaction: Math.round(filteredClients.filter(c => c.satisfaction > 0).reduce((sum, c) => sum + c.satisfaction, 0) / filteredClients.filter(c => c.satisfaction > 0).length) || 0,
    totalProjects: filteredClients.reduce((sum, c) => sum + c.projects.total, 0)
  };

  const handleCreateClient = (clientData: any) => {
    console.log('Creating new client:', clientData);
    alert(`${dir === 'rtl' ? 'تم إضافة العميل بنجاح' : 'Client added successfully'}: ${clientData.organization}`);
    setShowCreateClientModal(false);
  };

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('clients.title')}</h1>
          <p className="text-gray-600 mt-1">{t('clients.description')}</p>
        </div>
        {hasPermission('clients.create') && (
          <Button onClick={() => setShowCreateClientModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {t('clients.newClient')}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'عملاء نشطون' : 'Active Clients'}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProjects}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'متوسط الرضا' : 'Avg Satisfaction'}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.avgSatisfaction}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('common.search')} {t('common.filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={t('clients.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{dir === 'rtl' ? 'جميع الحالات' : 'All Statuses'}</option>
                <option value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</option>
                <option value="prospect">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</option>
                <option value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {client.contactPerson.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {dir === 'rtl' ? client.organization : client.organizationEn}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {dir === 'rtl' ? client.industry : client.industryEn}
                    </p>
                  </div>
                </div>
                {getStatusBadge(client.status)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Person */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{t('clients.contactPerson')}</h4>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <Phone className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                <p className="text-sm font-medium">
                  {dir === 'rtl' ? client.contactPerson.name : client.contactPerson.nameEn}
                </p>
                <p className="text-xs text-gray-600">
                  {dir === 'rtl' ? client.contactPerson.position : client.contactPerson.positionEn}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{client.contactPerson.email}</span>
                  <span>{client.contactPerson.phone}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {dir === 'rtl' ? client.address.city : client.address.cityEn}, {dir === 'rtl' ? client.address.country : client.address.countryEn}
                </span>
              </div>

              {/* Projects Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{client.projects.total}</p>
                  <p className="text-xs text-gray-600">{t('clients.totalProjects')}</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{client.projects.active}</p>
                  <p className="text-xs text-gray-600">{t('clients.activeProjects')}</p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {dir === 'rtl' ? 'القيمة الإجمالية' : 'Total Value'}
                  </p>
                  <p className="text-lg font-bold text-green-800">
                    {formatCurrency(client.totalValue)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">
                    {dir === 'rtl' ? 'مدفوع:' : 'Paid:'} {formatCurrency(client.paidValue)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {client.totalValue > 0 ? Math.round((client.paidValue / client.totalValue) * 100) : 0}% {dir === 'rtl' ? 'مكتمل' : 'completed'}
                  </p>
                </div>
              </div>

              {/* Satisfaction Score */}
              {client.satisfaction > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {dir === 'rtl' ? 'مستوى الرضا:' : 'Satisfaction:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${client.satisfaction}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{client.satisfaction}%</span>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {(dir === 'rtl' ? client.tags : client.tagsEn).slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Timeline Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {dir === 'rtl' ? 'عميل منذ:' : 'Client since:'} {formatDate(client.clientSince)}
                  </span>
                </div>
                <span>
                  {dir === 'rtl' ? 'آخر نشاط:' : 'Last activity:'} {formatDate(client.lastActivity)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {hasPermission('clients.edit') && (
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button variant="outline" size="sm">
                  {dir === 'rtl' ? 'عرض المشاريع' : 'View Projects'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 
                (dir === 'rtl' ? 'لا توجد عملاء تطابق البحث' : 'No clients match your search') :
                (dir === 'rtl' ? 'لا توجد عملاء' : 'No clients found')
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' ?
                (dir === 'rtl' ? 'جرب معايير بحث مختلفة' : 'Try different search criteria') :
                (dir === 'rtl' ? 'ابدأ بإضافة عميلك الأول' : 'Start by adding your first client')
              }
            </p>
            {!searchTerm && statusFilter === 'all' && hasPermission('clients.create') && (
              <Button>
                <Plus className="w-4 h-4 ml-2" />
                {t('clients.newClient')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {dir === 'rtl' ? 'ملخص مالي' : 'Financial Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'إجمالي قيمة العقود:' : 'Total Contract Value:'}
              </span>
              <span className="font-bold">{formatCurrency(stats.totalValue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'المبلغ المحصل:' : 'Amount Collected:'}
              </span>
              <span className="font-bold text-green-600">{formatCurrency(stats.totalPaid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {dir === 'rtl' ? 'المبلغ المتبقي:' : 'Remaining Amount:'}
              </span>
              <span className="font-bold text-orange-600">{formatCurrency(stats.totalValue - stats.totalPaid)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${stats.totalValue > 0 ? (stats.totalPaid / stats.totalValue) * 100 : 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {dir === 'rtl' ? 'توزيع العملاء' : 'Client Distribution'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">{dir === 'rtl' ? 'نشط' : 'Active'}</span>
              </div>
              <span className="font-bold">{stats.active}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">{dir === 'rtl' ? 'عميل محتمل' : 'Prospect'}</span>
              </div>
              <span className="font-bold">{stats.prospects}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-sm">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</span>
              </div>
              <span className="font-bold">{stats.inactive}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onSubmit={handleCreateClient}
      />
    </div>
  );
}