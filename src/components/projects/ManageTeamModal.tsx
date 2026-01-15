import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip';
import {
  Save,
  Users,
  UserPlus,
  Trash2,
  Mail,
  Building,
  Crown,
  User,
  Loader2,
  Search,
  Briefcase,
  Edit,
  Phone
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
const token = localStorage.getItem('accessToken');
// --- Configuration ---
const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Interfaces ---
interface Role {
  id: string;
  key: string;
  name: string;
  nameAr: string;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  nameEn: string;
  email: string;
  phoneNumber: string;
  role: string;
  projectRole: string; // Job Title Ar
  projectRoleEn: string; // Job Title En
  avatar: string;
  isActive: boolean;
  joinDate: string;
}

interface Project {
  id: string;
  title: string;
  titleEn: string;
  client: {
    name: string;
    email: string;
  };
}

interface ManageTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onSave?: () => void;
}

export function ManageTeamModal({ isOpen, onClose, project, onSave }: ManageTeamModalProps) {
  const { language, dir } = useLanguage();
  const { userProfile } = useAuth();

  // UI States
  const [activeTab, setActiveTab] = useState('current');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data States
  const [roles, setRoles] = useState<Role[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State (Permissions removed, focused on Job Titles)
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    nameEn: '',
    email: '',
    phoneNumber: '',
    role: '',
    projectRole: '',   // Maps to Job Title (Arabic)
    projectRoleEn: '', // Maps to Job Title (English)
  });

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  });

  // --- 1. Fetch Roles ---
  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/roles`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
    }
  };

  // --- 2. Fetch Members ---
  const fetchMembers = async () => {
    if (!project?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${project.id}/members`, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل تحميل الأعضاء' : 'Failed to fetch members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchMembers();
      setActiveTab('current');
    }
  }, [isOpen, project]);

  // --- 3. Search User & Autofill ---
  const handleSearchUser = async () => {
    if (!formData.email) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/search?email=${formData.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include Auth Token
        }
      });

      if (response.ok) {
        const user = await response.json();
        setFormData(prev => ({
          ...prev,
          userId: user.userId || user.id,
          name: user.firstName + " " + user.lastName,
          nameEn: user.firstName + " " + user.lastName,
          role: user.role,
          // Autofill Job Titles from user profile if available
          projectRole: user.jobTitle || user.jobTitle || '',
          projectRoleEn: user.jobTitle || user.jobTitle || '',
        }));
        toast.success(language === 'ar' ? 'تم العثور على المستخدم' : 'User found');
      } else {
        toast.error(language === 'ar' ? 'المستخدم غير موجود' : 'User not found');
        // Clear ID to allow retry
        setFormData(prev => ({ ...prev, userId: '' }));
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. Add Member (Simpler Form) ---
  const handleSubmit = async () => {
    if (!formData.userId || !formData.role) {
      toast.error(language === 'ar' ? 'يرجى البحث عن مستخدم واختيار الدور' : 'Please search for a user and select a role');
      return;
    }

    setIsSubmitting(true);
    try {
      // API: /api/projects/{id}/members/{userId}/{role}/add
      const url = `${API_BASE_URL}/projects/${project.id}/members/${formData.userId}/${formData.role}/add`;

      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData) // Send extra fields like job title
      });

      if (!response.ok) throw new Error('Action failed');

      toast.success(language === 'ar' ? 'تمت الإضافة بنجاح' : 'Member added successfully');

      resetForm();
      fetchMembers();
      setActiveTab('current');
      if (onSave) onSave();

    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 5. Delete Member (Specific URL) ---
  const handleRemoveMember = async (member: TeamMember) => {
    if (!confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return;

    try {
      // API: /api/projects/{id}/members/{userId}/{role}/delete
      const url = `${API_BASE_URL}/projects/${project.id}/members/${member.userId}/${member.role}/delete`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Delete failed');

      setTeamMembers(prev => prev.filter(m => m.id !== member.id));
      toast.success(language === 'ar' ? 'تم حذف العضو' : 'Member removed');
      if (onSave) onSave();

    } catch (error) {
      toast.error(language === 'ar' ? 'فشل الحذف' : 'Failed to delete');
    }
  };

  // --- Logic Helpers ---
  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      userId: '',
      name: '',
      nameEn: '',
      phoneNumber: '',
      email: '',
      role: '',
      projectRole: '',
      projectRoleEn: '',
    });
  };

  const handleEditClick = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      userId: member.userId,
      name: member.name,
      nameEn: member.nameEn,
      email: member.email,
      phoneNumber: member.phoneNumber,
      role: member.role,
      projectRole: member.projectRole,
      projectRoleEn: member.projectRoleEn,
    });
    setActiveTab('add');
  };

  const getRoleDisplay = (roleKey: string) => {
    const role = roles.find(r => r.key === roleKey);
    const label = role ? (language === 'ar' ? role.nameAr : role.name) : roleKey;
    const Icon = roleKey.toLowerCase().includes('lead') ? Crown : (roleKey.toLowerCase().includes('client') ? Building : User);
    const color = roleKey.toLowerCase().includes('lead') ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';
    return { label, icon: Icon, color };
  };


  const canManageTeam = userProfile.role === 'lead_consultant' || userProfile.role === 'super_admin';

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir={dir}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0A1E39] flex items-center gap-2">
              <Users className="w-6 h-6" />
              {language === 'ar' ? 'إدارة فريق المشروع' : 'Manage Project Team'}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); if (val === 'add' && !editingMember) resetForm(); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">{language === 'ar' ? 'الفريق الحالي' : 'Current Team'}</TabsTrigger>
              <TabsTrigger value="add">
                {editingMember ? (language === 'ar' ? 'تعديل عضو' : 'Edit Member') : (language === 'ar' ? 'إضافة عضو' : 'Add Member')}
              </TabsTrigger>
            </TabsList>

            {/* --- TAB 1: CURRENT MEMBERS --- */}
            <TabsContent value="current" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'أعضاء الفريق' : 'Team Members'} ({teamMembers.length})
                  </h3>
                </div>
                {canManageTeam && (
                  <Button onClick={() => { resetForm(); setActiveTab('add'); }} className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة عضو' : 'Add Member'}
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => {
                    const roleInfo = getRoleDisplay(member.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                      <Card key={member.id} className={`${!member.isActive ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarFallback className="bg-[#1B4FFF] text-white font-semibold">
                                  {member.avatar || (member.name ? member.name.charAt(0) : 'U')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold text-sm">
                                  {dir === 'rtl' ? member.name : member.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={roleInfo.color}>
                                    <RoleIcon className="w-3 h-3" />
                                    <span className="ml-1">{roleInfo.label}</span>
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* EDIT & DELETE BUTTONS */}
                            {canManageTeam && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(member)}
                                  className="text-blue-600 hover:bg-blue-50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member)}
                                  className="text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Briefcase className="w-3 h-3" />
                              <span className="font-medium">
                                {dir === 'rtl' ? member.role : member.role}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-3 h-3" />
                              <span className="text-xs">{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs">{member.phoneNumber}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* --- TAB 2: ADD MEMBER --- */}
            <TabsContent value="add" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    {editingMember
                      ? (language === 'ar' ? 'تعديل عضو' : 'Edit Team Member')
                      : (language === 'ar' ? 'إضافة عضو جديد' : 'Add New Team Member')
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">

                  {/* 1. SEARCH EMAIL (On Top) */}
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *</Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="search@example.com"
                        disabled={!!formData.userId}
                      />
                      {!formData.userId ? (
                        <Button type="button" variant="secondary" onClick={handleSearchUser} disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" onClick={() => {
                          // Clear form to search again
                          setFormData(prev => ({ ...prev, userId: '', name: '', nameEn: '', role: '', projectRole: '', projectRoleEn: '' }));
                        }}>
                          {language === 'ar' ? 'تغيير' : 'Change'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 2. AUTO-FILLED INFO (Names) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-500">{language === 'ar' ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                      <Input
                        value={formData.name}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Auto-filled"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">{language === 'ar' ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                      <Input
                        value={formData.name}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Auto-filled"
                      />
                    </div>
                  </div>

                  {/* 3. JOB TITLE (Auto-filled but editable) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المسمى الوظيفي (عربي)' : 'Job Title (Arabic)'}</Label>
                      <Input
                        value={formData.projectRole}
                        onChange={(e) => setFormData({ ...formData, projectRole: e.target.value })}
                        placeholder="e.g. مستشار أول"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'المسمى الوظيفي (إنجليزي)' : 'Job Title (English)'}</Label>
                      <Input
                        value={formData.projectRoleEn}
                        onChange={(e) => setFormData({ ...formData, projectRoleEn: e.target.value })}
                        placeholder="e.g. Senior Consultant"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الدور في النظام' : 'System Role'} *</Label>

                    <Select
                      // Ensure formData.role holds the NAME now, not the ID
                      value={formData.role || ""}
                      onValueChange={(val) => setFormData({ ...formData, role: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر الدور' : 'Select Role'} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.id}      // ✅ Keep ID here for React performance/uniqueness
                            value={role.name}  // ✅ Change this to NAME (this is what is saved to formData)
                          >
                            {language === 'ar' ? role.nameAr : role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setActiveTab('current')}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit} className="bg-[#1B4FFF] hover:bg-[#0A1E39]" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      <Save className="w-4 h-4 mr-2" />
                      {editingMember ?
                        (language === 'ar' ? 'تحديث' : 'Update') :
                        (language === 'ar' ? 'إضافة العضو' : 'Add Member')
                      }
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}