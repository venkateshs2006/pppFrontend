import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Plus, 
  Search, 
  Users,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
  Eye,
  UserPlus,
  Settings,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
  Building2,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'lead_consultant' | 'sub_consultant' | 'main_client' | 'sub_client' | 'system_admin';
  organization: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  createdAt: string;
  assignedBy?: {
    name: string;
    role: string;
  };
  assignedProjects: Array<{
    id: string;
    name: string;
    nameEn: string;
  }>;
  permissions: string[];
  avatar: string;
}

export function UsersPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // بيانات المستخدمين الشاملة
  const allUsers: User[] = [
    {
      id: '1',
      fullName: 'د. سارة الأحمد',
      email: 'sarah.ahmed@consultant.com',
      phone: '+966501234567',
      role: 'lead_consultant',
      organization: 'شركة البيان للاستشارات',
      status: 'active',
      lastLogin: '2024-10-31T10:30:00Z',
      createdAt: '2024-01-15T09:00:00Z',
      assignedProjects: [
        { id: '1', name: 'مشروع الموارد البشرية', nameEn: 'HR Project' },
        { id: '2', name: 'مشروع السياسات المالية', nameEn: 'Financial Policies Project' }
      ],
      permissions: ['all'],
      avatar: 'SA'
    },
    {
      id: '2',
      fullName: 'محمد العتيبي',
      email: 'mohammed.otaibi@consultant.com',
      phone: '+966502345678',
      role: 'sub_consultant',
      organization: 'شركة البيان للاستشارات',
      status: 'active',
      lastLogin: '2024-10-31T08:45:00Z',
      createdAt: '2024-02-01T10:30:00Z',
      assignedBy: {
        name: 'د. سارة الأحمد',
        role: 'مستشار رئيسي'
      },
      assignedProjects: [
        { id: '1', name: 'مشروع الموارد البشرية', nameEn: 'HR Project' }
      ],
      permissions: ['projects.view', 'deliverables.create', 'deliverables.edit', 'tickets.respond'],
      avatar: 'ME'
    },
    {
      id: '3',
      fullName: 'فاطمة الزهراني',
      email: 'fatima.zahrani@consultant.com',
      phone: '+966503456789',
      role: 'sub_consultant',
      organization: 'شركة البيان للاستشارات',
      status: 'active',
      lastLogin: '2024-10-30T16:20:00Z',
      createdAt: '2024-02-15T11:00:00Z',
      assignedBy: {
        name: 'د. سارة الأحمد',
        role: 'مستشار رئيسي'
      },
      assignedProjects: [
        { id: '1', name: 'مشروع الموارد البشرية', nameEn: 'HR Project' },
        { id: '3', name: 'مشروع الحوكمة', nameEn: 'Governance Project' }
      ],
      permissions: ['projects.view', 'deliverables.create', 'deliverables.edit', 'tickets.respond'],
      avatar: 'FZ'
    },
    {
      id: '4',
      fullName: 'أحمد المالكي',
      email: 'ahmed.malki@advtech.sa',
      phone: '+966504567890',
      role: 'main_client',
      organization: 'شركة التقنية المتقدمة',
      status: 'active',
      lastLogin: '2024-10-31T09:15:00Z',
      createdAt: '2024-01-20T14:00:00Z',
      assignedProjects: [
        { id: '1', name: 'مشروع الموارد البشرية', nameEn: 'HR Project' }
      ],
      permissions: ['projects.view', 'deliverables.view', 'deliverables.approve', 'tickets.create'],
      avatar: 'AM'
    },
    {
      id: '5',
      fullName: 'سلمى الحربي',
      email: 'salma.harbi@advtech.sa',
      phone: '+966505678901',
      role: 'sub_client',
      organization: 'شركة التقنية المتقدمة',
      status: 'active',
      lastLogin: '2024-10-30T13:30:00Z',
      createdAt: '2024-03-01T09:30:00Z',
      assignedBy: {
        name: 'أحمد المالكي',
        role: 'عميل رئيسي'
      },
      assignedProjects: [
        { id: '1', name: 'مشروع الموارد البشرية', nameEn: 'HR Project' }
      ],
      permissions: ['projects.view', 'deliverables.view', 'deliverables.comment', 'tickets.create'],
      avatar: 'SH'
    },
    {
      id: '6',
      fullName: 'نورا القحطاني',
      email: 'nora.qahtani@gig.sa',
      phone: '+966506789012',
      role: 'main_client',
      organization: 'مجموعة الاستثمار الخليجي',
      status: 'active',
      lastLogin: '2024-10-29T11:45:00Z',
      createdAt: '2024-02-10T10:00:00Z',
      assignedProjects: [
        { id: '2', name: 'مشروع السياسات المالية', nameEn: 'Financial Policies Project' }
      ],
      permissions: ['projects.view', 'deliverables.view', 'deliverables.approve', 'tickets.create'],
      avatar: 'NQ'
    },
    {
      id: '7',
      fullName: 'خالد الشمري',
      email: 'khalid.shamri@consultant.com',
      phone: '+966507890123',
      role: 'sub_consultant',
      organization: 'شركة البيان للاستشارات',
      status: 'pending',
      lastLogin: '2024-10-25T14:00:00Z',
      createdAt: '2024-10-20T16:00:00Z',
      assignedBy: {
        name: 'د. سارة الأحمد',
        role: 'مستشار رئيسي'
      },
      assignedProjects: [],
      permissions: ['projects.view'],
      avatar: 'KS'
    },
    {
      id: '8',
      fullName: 'مدير النظام',
      email: 'admin@system.com',
      role: 'system_admin',
      organization: 'إدارة النظام',
      status: 'active',
      lastLogin: '2024-10-31T12:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      assignedProjects: [],
      permissions: ['all'],
      avatar: 'AD'
    }
  ];

  // تصفية المستخدمين حسب دور المستخدم الحالي
  const getFilteredUsers = () => {
    let users = allUsers;

    // تصفية حسب دور المستخدم الحالي
    if (userProfile?.role === 'lead_consultant') {
      // المستشار الرئيسي يرى جميع المستشارين والعملاء
      users = users.filter(user => 
        user.role === 'lead_consultant' || 
        user.role === 'sub_consultant' || 
        user.role === 'main_client' || 
        user.role === 'sub_client'
      );
    } else if (userProfile?.role === 'main_client') {
      // العميل الرئيسي يرى العملاء الفرعيين في مؤسسته فقط
      users = users.filter(user => 
        (user.role === 'main_client' && user.organization === userProfile.organization) ||
        (user.role === 'sub_client' && user.organization === userProfile.organization)
      );
    } else if (userProfile?.role === 'system_admin') {
      // مدير النظام يرى جميع المستخدمين
      // لا تصفية
    } else {
      // المستشار المساعد والعميل الفرعي لا يمكنهم إدارة المستخدمين
      users = [];
    }

    // تصفية حسب البحث
    if (searchTerm) {
      users = users.filter(user => 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // تصفية حسب الدور
    if (roleFilter !== 'all') {
      users = users.filter(user => user.role === roleFilter);
    }

    // تصفية حسب الحالة
    if (statusFilter !== 'all') {
      users = users.filter(user => user.status === statusFilter);
    }

    return users;
  };

  const filteredUsers = getFilteredUsers();

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      system_admin: { label: dir === 'rtl' ? 'مدير النظام' : 'System Admin', color: 'bg-red-100 text-red-800' },
      lead_consultant: { label: t('roles.leadConsultant'), color: 'bg-purple-100 text-purple-800' },
      sub_consultant: { label: t('roles.subConsultant'), color: 'bg-blue-100 text-blue-800' },
      main_client: { label: t('roles.mainClient'), color: 'bg-green-100 text-green-800' },
      sub_client: { label: t('roles.subClient'), color: 'bg-yellow-100 text-yellow-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      inactive: { label: dir === 'rtl' ? 'غير نشط' : 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle },
      pending: { label: dir === 'rtl' ? 'في الانتظار' : 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // إحصائيات المستخدمين
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.status === 'active').length,
    pending: filteredUsers.filter(u => u.status === 'pending').length,
    consultants: filteredUsers.filter(u => u.role === 'lead_consultant' || u.role === 'sub_consultant').length,
    clients: filteredUsers.filter(u => u.role === 'main_client' || u.role === 'sub_client').length,
  };

  // التحقق من الصلاحيات
  if (!hasPermission('users.view') && userProfile?.role !== 'system_admin') {
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
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.users')}</h1>
          <p className="text-gray-600 mt-1">
            {dir === 'rtl' ? 'إدارة المستخدمين والصلاحيات' : 'User and permissions management'}
          </p>
        </div>
        {hasPermission('users.create') && (
          <Button className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            {dir === 'rtl' ? 'إضافة مستخدم' : 'Add User'}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'إجمالي المستخدمين' : 'Total Users'}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'نشط' : 'Active'}</p>
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
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'في الانتظار' : 'Pending'}</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'المستشارون' : 'Consultants'}</p>
                <p className="text-2xl font-bold text-purple-600">{stats.consultants}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{dir === 'rtl' ? 'العملاء' : 'Clients'}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.clients}</p>
              </div>
              <Building2 className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{dir === 'rtl' ? 'البحث والتصفية' : 'Search and Filter'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                <Input
                  placeholder={dir === 'rtl' ? 'البحث في المستخدمين...' : 'Search users...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'تصفية بالدور' : 'Filter by Role'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dir === 'rtl' ? 'جميع الأدوار' : 'All Roles'}</SelectItem>
                  <SelectItem value="system_admin">{dir === 'rtl' ? 'مدير النظام' : 'System Admin'}</SelectItem>
                  <SelectItem value="lead_consultant">{t('roles.leadConsultant')}</SelectItem>
                  <SelectItem value="sub_consultant">{t('roles.subConsultant')}</SelectItem>
                  <SelectItem value="main_client">{t('roles.mainClient')}</SelectItem>
                  <SelectItem value="sub_client">{t('roles.subClient')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={dir === 'rtl' ? 'تصفية بالحالة' : 'Filter by Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{dir === 'rtl' ? 'جميع الحالات' : 'All Statuses'}</SelectItem>
                  <SelectItem value="active">{dir === 'rtl' ? 'نشط' : 'Active'}</SelectItem>
                  <SelectItem value="inactive">{dir === 'rtl' ? 'غير نشط' : 'Inactive'}</SelectItem>
                  <SelectItem value="pending">{dir === 'rtl' ? 'في الانتظار' : 'Pending'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.fullName}</CardTitle>
                    <p className="text-sm text-gray-600">{user.organization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              {/* Assignment Info */}
              {user.assignedBy && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {dir === 'rtl' ? 'تم التعيين بواسطة:' : 'Assigned by:'}
                  </p>
                  <p className="text-sm font-medium">{user.assignedBy.name}</p>
                  <p className="text-xs text-gray-500">{user.assignedBy.role}</p>
                </div>
              )}

              {/* Assigned Projects */}
              {user.assignedProjects.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    {dir === 'rtl' ? 'المشاريع المخصصة:' : 'Assigned Projects:'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {user.assignedProjects.map((project, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {dir === 'rtl' ? project.name : project.nameEn}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Permissions */}
              <div>
                <p className="text-sm font-medium mb-2">
                  {dir === 'rtl' ? 'الصلاحيات:' : 'Permissions:'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.includes('all') ? (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                      {dir === 'rtl' ? 'جميع الصلاحيات' : 'All Permissions'}
                    </Badge>
                  ) : (
                    user.permissions.slice(0, 3).map((permission, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {permission.replace('.', ' ')}
                      </Badge>
                    ))
                  )}
                  {user.permissions.length > 3 && !user.permissions.includes('all') && (
                    <Badge variant="outline" className="text-xs">
                      +{user.permissions.length - 3} {dir === 'rtl' ? 'المزيد' : 'more'}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Activity Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>
                    {dir === 'rtl' ? 'آخر دخول:' : 'Last login:'} {formatDateTime(user.lastLogin)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {dir === 'rtl' ? 'انضم في:' : 'Joined:'} {formatDate(user.createdAt)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {hasPermission('users.edit') && (
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
                
                {hasPermission('users.edit') && (
                  <div className="flex items-center gap-2">
                    {user.status === 'pending' && (
                      <Button variant="outline" size="sm" className="text-green-600">
                        {dir === 'rtl' ? 'تفعيل' : 'Activate'}
                      </Button>
                    )}
                    {user.status === 'active' && (
                      <Button variant="outline" size="sm" className="text-orange-600">
                        {dir === 'rtl' ? 'إيقاف' : 'Suspend'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? 
                (dir === 'rtl' ? 'لا توجد مستخدمين تطابق البحث' : 'No users match your search') :
                (dir === 'rtl' ? 'لا توجد مستخدمين' : 'No users found')
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ?
                (dir === 'rtl' ? 'جرب معايير بحث مختلفة' : 'Try different search criteria') :
                (dir === 'rtl' ? 'ابدأ بإضافة مستخدمك الأول' : 'Start by adding your first user')
              }
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && hasPermission('users.create') && (
              <Button>
                <UserPlus className="w-4 h-4 ml-2" />
                {dir === 'rtl' ? 'إضافة مستخدم' : 'Add User'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}