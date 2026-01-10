import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast'; // Assuming you have Shadcn Toast
import {
  Search, Users, Shield, Edit, MoreHorizontal, Eye, UserPlus,
  Settings, CheckCircle2, XCircle, Clock, Mail, Phone,
  Building2, Activity, Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { userService, ApiUser, CreateUpdateUserRequest } from '@/services/userService';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UsersPage() {
  const { userProfile, hasPermission } = useAuth();
  const { t, dir } = useLanguage();
  const { toast } = useToast();

  // State
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);

  // Fetch Data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Note: API supports pagination, but for this UI logic we fetch a larger batch
      // Ideally, implement server-side search/filter here
      const data = await userService.getAll(0, 100);
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch users"
      });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handlers
  const handleCreateUpdate = async (data: CreateUpdateUserRequest) => {
    try {
      if (selectedUser) {
        // Update
        await userService.update(selectedUser.id, data);
        toast({ title: dir === 'rtl' ? 'تم التحديث بنجاح' : 'User updated successfully', className: "bg-green-100" });
      } else {
        // Create
        await userService.create(data);
        toast({ title: dir === 'rtl' ? 'تم الإنشاء بنجاح' : 'User created successfully', className: "bg-green-100" });
      }
      fetchUsers(); // Refresh list
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: dir === 'rtl' ? 'حدث خطأ أثناء الحفظ' : 'Failed to save user'
      });
      throw error; // Re-throw to keep dialog open
    }
  };

  const handleToggleStatus = async (user: ApiUser) => {
    try {
      if (user.isActive) {
        await userService.deactivate(user.id);
      } else {
        await userService.activate(user.id);
      }
      toast({ title: "Status updated" });
      fetchUsers();
    } catch (error) {
      toast({ variant: "destructive", title: "Action failed" });
    }
  };

  const handleEditClick = (user: ApiUser) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  // Helper: Mapping API "isActive" bool to UI "status" string
  const getUserStatus = (user: ApiUser) => {
    return user.isActive ? 'active' : 'inactive';
  };

  // Helper: Mapping API "roles" array to UI primary role
  const getUserRole = (user: ApiUser) => {
    return user.roles && user.roles.length > 0 ? user.roles[0] : 'sub_consultant';
  };

  // Filtering Logic (Client Side to match existing UI requirements)
  const getFilteredUsers = () => {
    let filtered = users;

    // Filter by Role (Auth Check)
    if (userProfile?.role === 'lead_consultant') {
      filtered = filtered.filter(u => ['lead_consultant', 'sub_consultant', 'main_client', 'sub_client'].includes(getUserRole(u)));
    } else if (userProfile?.role === 'main_client') {
      filtered = filtered.filter(u =>
        (getUserRole(u) === 'main_client' || getUserRole(u) === 'sub_client') &&
        u.department === userProfile.organization
      );
    }

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(lowerTerm) ||
        user.email.toLowerCase().includes(lowerTerm) ||
        user.department?.toLowerCase().includes(lowerTerm)
      );
    }

    // Filter Dropdowns
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => getUserRole(user) === roleFilter);
    }

    if (statusFilter !== 'all') {
      const status = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === status);
    }

    return filtered;
  };

  const filteredUsers = getFilteredUsers();

  // Badges & Formatting (Reused from your code)
  const getRoleBadge = (role: string) => {
    const roleConfig: any = {
      system_admin: { label: dir === 'rtl' ? 'مدير النظام' : 'System Admin', color: 'bg-red-100 text-red-800' },
      lead_consultant: { label: t('roles.leadConsultant'), color: 'bg-purple-100 text-purple-800' },
      sub_consultant: { label: t('roles.subConsultant'), color: 'bg-blue-100 text-blue-800' },
      main_client: { label: t('roles.mainClient'), color: 'bg-green-100 text-green-800' },
      sub_client: { label: t('roles.subClient'), color: 'bg-yellow-100 text-yellow-800' },
    };
    const config = roleConfig[role] || { label: role, color: 'bg-gray-100 text-gray-800' };
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    const config = isActive
      ? { label: dir === 'rtl' ? 'نشط' : 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
      : { label: dir === 'rtl' ? 'غير نشط' : 'Inactive', color: 'bg-gray-100 text-gray-800', icon: XCircle };
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" /> {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString(dir === 'rtl' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Stats Calculation
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter(u => u.isActive).length,
    pending: 0, // API doesn't seem to have a pending state
    consultants: filteredUsers.filter(u => ['lead_consultant', 'sub_consultant'].includes(getUserRole(u))).length,
    clients: filteredUsers.filter(u => ['main_client', 'sub_client'].includes(getUserRole(u))).length,
  };

  if (!hasPermission('users.view') && userProfile?.role !== 'system_admin') {
    return (
      <div className="p-6" dir={dir}>
        <Card><CardContent className="text-center py-12"><Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Access Denied</h3></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('nav.users')}</h1>
          <p className="text-gray-600 mt-1">{dir === 'rtl' ? 'إدارة المستخدمين' : 'User Management'}</p>
        </div>
        {hasPermission('users.create') && (
          <Button onClick={handleCreateClick} className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> {dir === 'rtl' ? 'إضافة مستخدم' : 'Add User'}
          </Button>
        )}
      </div>

      {/* Stats Cards (Simplified for brevity, use your original code structure here) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold">{stats.total}</p></div><Users className="text-blue-500" /></CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></div><CheckCircle2 className="text-green-500" /></CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Consultants</p><p className="text-2xl font-bold text-purple-600">{stats.consultants}</p></div><Shield className="text-purple-500" /></CardContent></Card>
        <Card><CardContent className="p-4 flex justify-between items-center"><div><p className="text-sm text-gray-600">Clients</p><p className="text-2xl font-bold text-orange-600">{stats.clients}</p></div><Building2 className="text-orange-500" /></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader><CardTitle className="text-lg">{dir === 'rtl' ? 'البحث' : 'Search & Filter'}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
              <Input
                placeholder={dir === 'rtl' ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={dir === 'rtl' ? 'pr-10' : 'pl-10'}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="SUPER_ADMIN">System Admin</SelectItem>
                <SelectItem value="ADMIN">Project Admin</SelectItem>
                <SelectItem value="LEAD_CONSULTANT">Lead Consultant</SelectItem>
                <SelectItem value="SUB_CONSULTANT">Sub Consultant</SelectItem>
                <SelectItem value="MAIN_CLIENT">Main Client</SelectItem>
                <SelectItem value="SUB_CLIENT">Sub Client</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
      ) : (
        /* Users List */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{user.fullName || user.username}</CardTitle>
                      <p className="text-sm text-gray-600">{user.department || user.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(getUserRole(user))}
                    {getStatusBadge(user.isActive)}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" /> <span>{user.email}</span>
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" /> <span>{user.phoneNumber}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Last login: {formatDate(user.lastLoginAt || '')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Joined: {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {hasPermission('users.edit') && (
                      <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Dropdown for More Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(user)}>Edit Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.isActive ? 'Deactivate User' : 'Activate User'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {hasPermission('users.edit') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={user.isActive ? "text-orange-600" : "text-green-600"}
                      onClick={() => handleToggleStatus(user)}
                    >
                      {user.isActive
                        ? (dir === 'rtl' ? 'إيقاف' : 'Suspend')
                        : (dir === 'rtl' ? 'تفعيل' : 'Activate')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Integration */}
      <UserFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        userToEdit={selectedUser}
        onSubmit={handleCreateUpdate}
      />
    </div>
  );
}