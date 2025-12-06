import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  Save, 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Mail, 
  Phone, 
  Building,
  Crown,
  User,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  email: string;
  phone?: string;
  role: 'lead_consultant' | 'sub_consultant' | 'main_client' | 'sub_client' | 'specialist';
  projectRole: string;
  projectRoleEn: string;
  avatar: string;
  isActive: boolean;
  joinDate: string;
  permissions: string[];
}

interface Project {
  id: string;
  title: string;
  titleEn: string;
  client: {
    name: string;
    nameEn: string;
    organization: string;
    organizationEn: string;
    email: string;
  };
}

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave: (teamMembers: TeamMember[]) => void;
}

export function ManageTeamModal({ isOpen, onClose, project, onSave }: ManageTeamModalProps) {
  const { language, dir } = useLanguage();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('current');
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Sample current team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'د. فهد السعدي',
      nameEn: 'Dr. Fahad Al-Saadi',
      email: 'lead.consultant@example.com',
      phone: '+966 50 123 4567',
      role: 'lead_consultant',
      projectRole: 'مستشار رئيسي',
      projectRoleEn: 'Lead Consultant',
      avatar: 'FS',
      isActive: true,
      joinDate: '2024-08-01',
      permissions: ['manage_team', 'edit_project', 'approve_deliverables', 'view_reports']
    },
    {
      id: '2',
      name: 'محمد جودة',
      nameEn: 'Mohammed Gouda',
      email: 'sub.consultant@example.com',
      phone: '+966 50 234 5678',
      role: 'sub_consultant',
      projectRole: 'مستشار',
      projectRoleEn: 'Consultant',
      avatar: 'MJ',
      isActive: true,
      joinDate: '2024-08-15',
      permissions: ['edit_deliverables', 'view_tasks', 'comment']
    }
  ]);

  const [newMember, setNewMember] = useState({
    name: '',
    nameEn: '',
    email: '',
    phone: '',
    role: 'sub_consultant' as TeamMember['role'],
    projectRole: '',
    projectRoleEn: '',
    permissions: [] as string[]
  });

  const roleOptions = [
    { value: 'lead_consultant', label: language === 'ar' ? 'مستشار رئيسي' : 'Lead Consultant', icon: Crown },
    { value: 'sub_consultant', label: language === 'ar' ? 'مستشار فرعي' : 'Sub Consultant', icon: User },
    { value: 'main_client', label: language === 'ar' ? 'عميل رئيسي' : 'Main Client', icon: Building },
    { value: 'sub_client', label: language === 'ar' ? 'عميل فرعي' : 'Sub Client', icon: User },
    { value: 'specialist', label: language === 'ar' ? 'أخصائي' : 'Specialist', icon: Shield }
  ];

  const permissionOptions = [
    { value: 'manage_team', label: language === 'ar' ? 'إدارة الفريق' : 'Manage Team' },
    { value: 'edit_project', label: language === 'ar' ? 'تحرير المشروع' : 'Edit Project' },
    { value: 'approve_deliverables', label: language === 'ar' ? 'اعتماد المخرجات' : 'Approve Deliverables' },
    { value: 'edit_deliverables', label: language === 'ar' ? 'تحرير المخرجات' : 'Edit Deliverables' },
    { value: 'view_reports', label: language === 'ar' ? 'عرض التقارير' : 'View Reports' },
    { value: 'view_tasks', label: language === 'ar' ? 'عرض المهام' : 'View Tasks' },
    { value: 'edit_tasks', label: language === 'ar' ? 'تحرير المهام' : 'Edit Tasks' },
    { value: 'comment', label: language === 'ar' ? 'التعليق' : 'Comment' }
  ];

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      alert(language === 'ar' ? 'يرجى إدخال الاسم والبريد الإلكتروني' : 'Please enter name and email');
      return;
    }

    const member: TeamMember = {
      id: Date.now().toString(),
      name: newMember.name,
      nameEn: newMember.nameEn || newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      role: newMember.role,
      projectRole: newMember.projectRole,
      projectRoleEn: newMember.projectRoleEn || newMember.projectRole,
      avatar: newMember.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      isActive: true,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: newMember.permissions
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({
      name: '',
      nameEn: '',
      email: '',
      phone: '',
      role: 'sub_consultant',
      projectRole: '',
      projectRoleEn: '',
      permissions: []
    });
    setShowAddMember(false);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setNewMember({
      name: member.name,
      nameEn: member.nameEn,
      email: member.email,
      phone: member.phone || '',
      role: member.role,
      projectRole: member.projectRole,
      projectRoleEn: member.projectRoleEn,
      permissions: member.permissions
    });
    setShowAddMember(true);
  };

  const handleUpdateMember = () => {
    if (!editingMember) return;

    const updatedMembers = teamMembers.map(member =>
      member.id === editingMember.id
        ? {
            ...member,
            name: newMember.name,
            nameEn: newMember.nameEn || newMember.name,
            email: newMember.email,
            phone: newMember.phone,
            role: newMember.role,
            projectRole: newMember.projectRole,
            projectRoleEn: newMember.projectRoleEn || newMember.projectRole,
            permissions: newMember.permissions
          }
        : member
    );

    setTeamMembers(updatedMembers);
    setEditingMember(null);
    setNewMember({
      name: '',
      nameEn: '',
      email: '',
      phone: '',
      role: 'sub_consultant',
      projectRole: '',
      projectRoleEn: '',
      permissions: []
    });
    setShowAddMember(false);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm(language === 'ar' ? 'هل أنت متأكد من إزالة هذا العضو؟' : 'Are you sure you want to remove this member?')) {
      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
    }
  };

  const toggleMemberStatus = (memberId: string) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === memberId ? { ...member, isActive: !member.isActive } : member
    ));
  };

  const handlePermissionToggle = (permission: string) => {
    const updatedPermissions = newMember.permissions.includes(permission)
      ? newMember.permissions.filter(p => p !== permission)
      : [...newMember.permissions, permission];
    
    setNewMember({ ...newMember, permissions: updatedPermissions });
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = roleOptions.find(r => r.value === role);
    if (!roleConfig) return <User className="w-4 h-4" />;
    const Icon = roleConfig.icon;
    return <Icon className="w-4 h-4" />;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'lead_consultant':
        return 'bg-purple-100 text-purple-800';
      case 'sub_consultant':
        return 'bg-blue-100 text-blue-800';
      case 'main_client':
        return 'bg-green-100 text-green-800';
      case 'sub_client':
        return 'bg-yellow-100 text-yellow-800';
      case 'specialist':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageTeam = () => {
    return userProfile?.role === 'system_admin' || 
           userProfile?.role === 'lead_consultant' || 
           (userProfile?.role === 'main_client' && userProfile?.email === project.client.email);
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
              <Users className="w-6 h-6" />
              {language === 'ar' ? 'إدارة فريق المشروع' : 'Manage Project Team'}
              <Badge variant="outline" className="ml-2">
                {dir === 'rtl' ? project.title : project.titleEn}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">{language === 'ar' ? 'الفريق الحالي' : 'Current Team'}</TabsTrigger>
              <TabsTrigger value="add">{language === 'ar' ? 'إضافة عضو' : 'Add Member'}</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'} ({teamMembers.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    {language === 'ar' ? 'إدارة أعضاء فريق المشروع وصلاحياتهم' : 'Manage project team members and their permissions'}
                  </p>
                </div>
                {canManageTeam() && (
                  <Button onClick={() => setActiveTab('add')} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة عضو' : 'Add Member'}
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className={`${!member.isActive ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-[#1B4FFF] text-white font-semibold">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-sm">
                              {dir === 'rtl' ? member.name : member.nameEn}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={getRoleBadgeColor(member.role)}>
                                {getRoleIcon(member.role)}
                                <span className="ml-1">
                                  {roleOptions.find(r => r.value === member.role)?.label}
                                </span>
                              </Badge>
                              {member.isActive ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>

                        {canManageTeam() && member.role !== 'lead_consultant' && (
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => handleEditMember(member)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{language === 'ar' ? 'تحرير العضو' : 'Edit Member'}</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => toggleMemberStatus(member.id)}
                                  className={member.isActive ? 'text-red-600' : 'text-green-600'}
                                >
                                  {member.isActive ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{member.isActive ? 
                                  (language === 'ar' ? 'إلغاء التفعيل' : 'Deactivate') : 
                                  (language === 'ar' ? 'تفعيل' : 'Activate')
                                }</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{language === 'ar' ? 'إزالة العضو' : 'Remove Member'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-700">
                          {dir === 'rtl' ? member.projectRole : member.projectRoleEn}
                        </p>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{member.email}</span>
                        </div>
                        
                        {member.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span className="text-xs">{member.phone}</span>
                          </div>
                        )}

                        <div className="pt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            {language === 'ar' ? 'الصلاحيات:' : 'Permissions:'}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {member.permissions.map((permission) => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permissionOptions.find(p => p.value === permission)?.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {editingMember ? 
                      (language === 'ar' ? 'تحرير عضو الفريق' : 'Edit Team Member') :
                      (language === 'ar' ? 'إضافة عضو جديد للفريق' : 'Add New Team Member')
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'} *
                      </Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder={language === 'ar' ? 'أدخل الاسم بالعربية' : 'Enter name in Arabic'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nameEn">
                        {language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}
                      </Label>
                      <Input
                        id="nameEn"
                        value={newMember.nameEn}
                        onChange={(e) => setNewMember({ ...newMember, nameEn: e.target.value })}
                        placeholder={language === 'ar' ? 'أدخل الاسم بالإنجليزية' : 'Enter name in English'}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="example@company.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                      </Label>
                      <Input
                        id="phone"
                        value={newMember.phone}
                        onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                        placeholder="+966 50 123 4567"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        {language === 'ar' ? 'الدور في النظام' : 'System Role'} *
                      </Label>
                      <Select value={newMember.role} onValueChange={(value: TeamMember['role']) => setNewMember({ ...newMember, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => {
                            const Icon = role.icon;
                            return (
                              <SelectItem key={role.value} value={role.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {role.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectRole">
                        {language === 'ar' ? 'الدور في المشروع (عربي)' : 'Project Role (Arabic)'} *
                      </Label>
                      <Input
                        id="projectRole"
                        value={newMember.projectRole}
                        onChange={(e) => setNewMember({ ...newMember, projectRole: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: محلل سياسات أول' : 'Example: Senior Policy Analyst'}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectRoleEn">
                      {language === 'ar' ? 'الدور في المشروع (إنجليزي)' : 'Project Role (English)'}
                    </Label>
                    <Input
                      id="projectRoleEn"
                      value={newMember.projectRoleEn}
                      onChange={(e) => setNewMember({ ...newMember, projectRoleEn: e.target.value })}
                      placeholder={language === 'ar' ? 'Senior Policy Analyst' : 'Senior Policy Analyst'}
                    />
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">
                      {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {permissionOptions.map((permission) => (
                        <div key={permission.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={permission.value}
                            checked={newMember.permissions.includes(permission.value)}
                            onChange={() => handlePermissionToggle(permission.value)}
                            className="rounded"
                          />
                          <Label htmlFor={permission.value} className="text-sm cursor-pointer">
                            {permission.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => {
                      setShowAddMember(false);
                      setEditingMember(null);
                      setNewMember({
                        name: '',
                        nameEn: '',
                        email: '',
                        phone: '',
                        role: 'sub_consultant',
                        projectRole: '',
                        projectRoleEn: '',
                        permissions: []
                      });
                    }}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={editingMember ? handleUpdateMember : handleAddMember} className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
                      <Save className="w-4 h-4 mr-2" />
                      {editingMember ? 
                        (language === 'ar' ? 'تحديث العضو' : 'Update Member') :
                        (language === 'ar' ? 'إضافة العضو' : 'Add Member')
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
            <Button onClick={() => onSave(teamMembers)} className="bg-[#1B4FFF] hover:bg-[#0A1E39]">
              <Save className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}